(() => {
  "use strict";

  const MAX_DEBTS = 5;
  const MIN_DEBTS = 1;
  const MAX_MONTHS = 1200; // 100 years — a simulation safety cap, not a realistic outcome
  const BALANCE_EPSILON = 0.005;

  const debtRowsEl = document.getElementById("debt-rows");
  const addDebtBtn = document.getElementById("add-debt-btn");
  const form = document.getElementById("debt-form");
  const formError = document.getElementById("form-error");
  const resultsPanel = document.getElementById("results-panel");
  const statCardsEl = document.getElementById("stat-cards");
  const payoffOrderEl = document.getElementById("payoff-order");
  const scheduleTableBody = document.querySelector("#schedule-table tbody");
  const warningNote = document.getElementById("warning-note");
  const chartCanvas = document.getElementById("balance-chart");
  const chartLegend = document.getElementById("chart-legend");

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const currencyPrecise = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  const CHART_COLORS = ["#0f7a5c", "#ff7a45", "#3b6fb6", "#c0392b", "#8e5fd6"];

  let debtCount = 0;

  function addDebtRow(prefill) {
    if (debtCount >= MAX_DEBTS) return;
    debtCount++;
    const index = debtCount;

    const row = document.createElement("div");
    row.className = "debt-row";
    row.dataset.index = String(index);
    row.innerHTML = `
      <div class="debt-row-header">
        <span>Debt ${index}</span>
        <button type="button" class="remove-debt-btn" aria-label="Remove debt ${index}">Remove</button>
      </div>
      <div class="field">
        <label for="name-${index}">Name</label>
        <input type="text" id="name-${index}" class="debt-name" placeholder="e.g. Visa card" maxlength="40" required />
      </div>
      <div class="field-grid">
        <div class="field">
          <label for="balance-${index}">Balance</label>
          <div class="input-prefix">
            <span>$</span>
            <input type="number" id="balance-${index}" class="debt-balance" min="0" step="0.01" inputmode="decimal" required />
          </div>
        </div>
        <div class="field">
          <label for="rate-${index}">Interest rate (APR)</label>
          <div class="input-suffix">
            <input type="number" id="rate-${index}" class="debt-rate" min="0" max="100" step="0.01" inputmode="decimal" required />
            <span>%</span>
          </div>
        </div>
      </div>
      <div class="field">
        <label for="min-${index}">Minimum monthly payment</label>
        <div class="input-prefix">
          <span>$</span>
          <input type="number" id="min-${index}" class="debt-min" min="0" step="0.01" inputmode="decimal" required />
        </div>
      </div>
    `;

    row.querySelector(".remove-debt-btn").addEventListener("click", () => {
      if (debtRowsEl.children.length <= MIN_DEBTS) return;
      row.remove();
      renumberRows();
      updateAddButtonState();
    });

    debtRowsEl.appendChild(row);
    updateAddButtonState();

    if (prefill) {
      row.querySelector(".debt-name").value = prefill.name ?? "";
      row.querySelector(".debt-balance").value = prefill.balance ?? "";
      row.querySelector(".debt-rate").value = prefill.rate ?? "";
      row.querySelector(".debt-min").value = prefill.min ?? "";
    }
  }

  function renumberRows() {
    [...debtRowsEl.children].forEach((row, i) => {
      const num = i + 1;
      row.dataset.index = String(num);
      row.querySelector(".debt-row-header span").textContent = `Debt ${num}`;
      row.querySelector(".remove-debt-btn").setAttribute("aria-label", `Remove debt ${num}`);
    });
    debtCount = debtRowsEl.children.length;
  }

  function updateAddButtonState() {
    addDebtBtn.disabled = debtRowsEl.children.length >= MAX_DEBTS;
    addDebtBtn.textContent =
      debtRowsEl.children.length >= MAX_DEBTS ? "Maximum of 5 debts reached" : "+ Add another debt";
  }

  addDebtBtn.addEventListener("click", () => addDebtRow());

  // Start with two blank rows so the form doesn't look empty.
  addDebtRow();
  addDebtRow();

  function readDebts() {
    const rows = [...debtRowsEl.children];
    const debts = [];
    for (const row of rows) {
      const name = row.querySelector(".debt-name").value.trim();
      const balance = parseFloat(row.querySelector(".debt-balance").value);
      const rate = parseFloat(row.querySelector(".debt-rate").value);
      const min = parseFloat(row.querySelector(".debt-min").value);
      debts.push({ name, balance, rate, min });
    }
    return debts;
  }

  function validateDebts(debts, extraPayment) {
    if (debts.length === 0) return "Add at least one debt to calculate a plan.";
    for (const d of debts) {
      if (!d.name) return "Every debt needs a name.";
      if (!isFinite(d.balance) || d.balance <= 0) return `Enter a balance greater than $0 for "${d.name || "a debt"}".`;
      if (!isFinite(d.rate) || d.rate < 0) return `Enter a valid interest rate for "${d.name}".`;
      if (!isFinite(d.min) || d.min <= 0) return `Enter a minimum payment greater than $0 for "${d.name}".`;
    }
    if (!isFinite(extraPayment) || extraPayment < 0) return "Extra monthly payment can't be negative.";

    const totalBudget = debts.reduce((s, d) => s + d.min, 0) + extraPayment;
    const totalFirstMonthInterest = debts.reduce((s, d) => s + d.balance * (d.rate / 100 / 12), 0);
    if (totalBudget <= totalFirstMonthInterest) {
      return "Your total monthly payments don't cover the interest that's accruing. Increase your extra payment (or minimums) so the balances can actually go down.";
    }
    return null;
  }

  function simulateSnowball(debts, extraPayment) {
    const order = debts
      .map((d, i) => ({ ...d, id: i }))
      .sort((a, b) => a.balance - b.balance);

    const working = order.map((d) => ({ ...d, remaining: d.balance }));
    const totalBudget = working.reduce((s, d) => s + d.min, 0) + extraPayment;

    let month = 0;
    let totalInterest = 0;
    const payoffMonth = {};
    const history = []; // history[monthIndex] = { id: remainingBalance }

    while (working.some((d) => d.remaining > BALANCE_EPSILON) && month < MAX_MONTHS) {
      month++;

      // Accrue interest on every open balance.
      working.forEach((d) => {
        if (d.remaining > BALANCE_EPSILON) {
          const interest = d.remaining * (d.rate / 100 / 12);
          d.remaining += interest;
          totalInterest += interest;
        }
      });

      const active = working.filter((d) => d.remaining > BALANCE_EPSILON);
      const targetId = active[0].id;
      let budgetLeft = totalBudget;

      // Pay minimums on every open debt except the current target.
      active.forEach((d) => {
        if (d.id !== targetId) {
          const pay = Math.min(d.min, d.remaining, budgetLeft);
          d.remaining -= pay;
          budgetLeft -= pay;
        }
      });

      // Throw everything left at the target debt.
      const target = working.find((d) => d.id === targetId);
      const pay = Math.min(budgetLeft, target.remaining);
      target.remaining -= pay;

      working.forEach((d) => {
        if (d.remaining <= BALANCE_EPSILON) {
          d.remaining = 0;
          if (payoffMonth[d.id] === undefined) payoffMonth[d.id] = month;
        }
      });

      const snapshot = {};
      working.forEach((d) => {
        snapshot[d.id] = d.remaining;
      });
      history.push(snapshot);
    }

    return {
      order,
      months: month,
      totalInterest,
      payoffMonth,
      history,
      hitMax: month >= MAX_MONTHS,
    };
  }

  function monthsToText(months) {
    const years = Math.floor(months / 12);
    const rem = months % 12;
    const parts = [];
    if (years > 0) parts.push(`${years} yr${years !== 1 ? "s" : ""}`);
    if (rem > 0 || years === 0) parts.push(`${rem} mo${rem !== 1 ? "s" : ""}`);
    return parts.join(" ");
  }

  function addMonths(date, months) {
    const d = new Date(date.getTime());
    d.setMonth(d.getMonth() + months);
    return d;
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  function renderResults(debts, extraPayment, result) {
    formError.textContent = "";

    const totalStartingBalance = debts.reduce((s, d) => s + d.balance, 0);
    const totalPaid = totalStartingBalance + result.totalInterest;
    const debtFreeDate = addMonths(new Date(), result.months);

    statCardsEl.innerHTML = "";
    const stats = [
      { label: "Debt-free in", value: monthsToText(result.months) },
      { label: "Debt-free date", value: formatDate(debtFreeDate) },
      { label: "Total interest paid", value: currency.format(result.totalInterest) },
      { label: "Total paid off", value: currency.format(totalPaid) },
    ];
    stats.forEach((s) => {
      const card = document.createElement("div");
      card.className = "stat-card";
      card.innerHTML = `<span class="value">${s.value}</span><span class="label">${s.label}</span>`;
      statCardsEl.appendChild(card);
    });

    // Payoff order list
    payoffOrderEl.innerHTML = "";
    result.order.forEach((d, i) => {
      const li = document.createElement("li");
      const done = result.payoffMonth[d.id];
      li.innerHTML = `
        <span class="rank">${i + 1}</span>
        <span class="info">
          <span class="name">${escapeHtml(d.name)}</span><br />
          <span class="meta">${currency.format(d.balance)} at ${d.rate}% APR &middot; min ${currency.format(d.min)}/mo</span>
        </span>
        <span class="done-in">${done ? monthsToText(done) : "—"}</span>
      `;
      payoffOrderEl.appendChild(li);
    });

    // Schedule table
    scheduleTableBody.innerHTML = "";
    result.order.forEach((d, i) => {
      const done = result.payoffMonth[d.id];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${escapeHtml(d.name)}</td>
        <td>${currency.format(d.balance)}</td>
        <td>${d.rate}%</td>
        <td>${done ? monthsToText(done) : "not paid off within 100 years"}</td>
        <td>${done ? formatDate(addMonths(new Date(), done)) : "—"}</td>
      `;
      scheduleTableBody.appendChild(tr);
    });

    // Warning note
    if (result.hitMax) {
      warningNote.hidden = false;
      warningNote.textContent =
        "Heads up: at these payment levels, this plan doesn't fully pay off your debts within 100 years. Try increasing your extra monthly payment.";
    } else {
      warningNote.hidden = true;
    }

    drawChart(result);
    resultsPanel.hidden = false;
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function drawChart(result) {
    const ctx = chartCanvas.getContext("2d");
    const w = chartCanvas.width;
    const h = chartCanvas.height;
    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 20, bottom: 36, left: 70 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    const months = result.history.length;
    const ids = result.order.map((d) => d.id);
    const maxBalance = result.order.reduce((s, d) => s + d.balance, 0);

    // Axes
    ctx.strokeStyle = "#dfe7e5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.lineTo(padding.left + plotW, padding.top + plotH);
    ctx.stroke();

    ctx.fillStyle = "#5c6b6a";
    ctx.font = "12px -apple-system, sans-serif";
    ctx.textAlign = "right";
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const val = (maxBalance / ySteps) * i;
      const y = padding.top + plotH - (val / maxBalance) * plotH;
      ctx.fillText(currency.format(val), padding.left - 8, y + 4);
      ctx.strokeStyle = "#eef2f1";
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + plotW, y);
      ctx.stroke();
    }

    ctx.textAlign = "center";
    const xLabelCount = Math.min(6, months);
    for (let i = 0; i <= xLabelCount; i++) {
      const monthIdx = Math.round((months / xLabelCount) * i);
      const x = padding.left + (monthIdx / months) * plotW;
      const label = monthIdx === 0 ? "Start" : `Mo ${monthIdx}`;
      ctx.fillText(label, x, padding.top + plotH + 20);
    }

    // Total balance line
    function pointFor(monthIdx, value) {
      const x = padding.left + (monthIdx / months) * plotW;
      const y = padding.top + plotH - (value / maxBalance) * plotH;
      return [x, y];
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#0f7a5c";
    ctx.beginPath();
    const start0 = pointFor(0, maxBalance);
    ctx.moveTo(start0[0], start0[1]);
    result.history.forEach((snapshot, idx) => {
      const total = ids.reduce((s, id) => s + (snapshot[id] || 0), 0);
      const [x, y] = pointFor(idx + 1, total);
      ctx.lineTo(x, y);
    });
    ctx.stroke();

    chartLegend.innerHTML = `<div class="legend-item"><span class="swatch" style="background:#0f7a5c"></span>Total remaining balance</div>`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const debts = readDebts();
    const extraPayment = parseFloat(document.getElementById("extra-payment").value) || 0;

    const error = validateDebts(debts, extraPayment);
    if (error) {
      formError.textContent = error;
      resultsPanel.hidden = true;
      return;
    }

    formError.textContent = "";
    const result = simulateSnowball(debts, extraPayment);
    renderResults(debts, extraPayment, result);
  });
})();
