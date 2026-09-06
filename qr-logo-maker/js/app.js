(function () {
  "use strict";

  /* ----------------------------------------------------------------
   * Config: dropdown options for each repeatable field type
   * -------------------------------------------------------------- */
  var PHONE_TYPES = [
    { label: "Mobile", vcard: "CELL" },
    { label: "Home", vcard: "HOME" },
    { label: "Work", vcard: "WORK" },
    { label: "Home Fax", vcard: "HOME,FAX" },
    { label: "Work Fax", vcard: "WORK,FAX" },
    { label: "Pager", vcard: "PAGER" },
    { label: "Main", vcard: "MAIN" },
    { label: "Other", vcard: "OTHER" }
  ];

  var EMAIL_TYPES = [
    { label: "Home", vcard: "HOME,INTERNET" },
    { label: "Work", vcard: "WORK,INTERNET" },
    { label: "Other", vcard: "OTHER,INTERNET" }
  ];

  var ADDRESS_TYPES = [
    { label: "Home", vcard: "HOME" },
    { label: "Work", vcard: "WORK" },
    { label: "Other", vcard: "OTHER" }
  ];

  var URL_TYPES = [
    { label: "Home", vcard: "HOME" },
    { label: "Work", vcard: "WORK" },
    { label: "Blog", vcard: "BLOG" },
    { label: "Portfolio", vcard: "PORTFOLIO" },
    { label: "Other", vcard: "OTHER" }
  ];

  var SOCIAL_PLATFORMS = [
    { label: "LinkedIn", vcard: "linkedin" },
    { label: "Twitter / X", vcard: "twitter" },
    { label: "Instagram", vcard: "instagram" },
    { label: "Facebook", vcard: "facebook" },
    { label: "TikTok", vcard: "tiktok" },
    { label: "YouTube", vcard: "youtube" },
    { label: "GitHub", vcard: "github" },
    { label: "Other", vcard: "other" }
  ];

  var rowCounters = { phone: 0, email: 0, address: 0, url: 0, social: 0 };

  /* ----------------------------------------------------------------
   * Helpers to build option elements / rows
   * -------------------------------------------------------------- */
  function buildSelect(options, selectedIndex) {
    var select = document.createElement("select");
    options.forEach(function (opt, i) {
      var o = document.createElement("option");
      o.value = String(i);
      o.textContent = opt.label;
      if (i === (selectedIndex || 0)) o.selected = true;
      select.appendChild(o);
    });
    return select;
  }

  function makeRemoveButton(row) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "row-remove";
    btn.textContent = "Remove";
    btn.addEventListener("click", function () {
      row.remove();
    });
    return btn;
  }

  function fieldWrap(labelText, inputEl) {
    var wrap = document.createElement("div");
    wrap.className = "field";
    var label = document.createElement("label");
    label.textContent = labelText;
    var id = "f_" + Math.random().toString(36).slice(2, 9);
    label.setAttribute("for", id);
    inputEl.id = id;
    wrap.appendChild(label);
    wrap.appendChild(inputEl);
    return wrap;
  }

  function addPhoneRow(presetTypeIndex) {
    var list = document.getElementById("phone-list");
    var row = document.createElement("div");
    row.className = "repeat-row";
    row.dataset.kind = "phone";

    var typeSelect = buildSelect(PHONE_TYPES, presetTypeIndex);
    var typeField = fieldWrap("Type", typeSelect);

    var numberInput = document.createElement("input");
    numberInput.type = "tel";
    numberInput.autocomplete = "tel";
    numberInput.placeholder = "(555) 123-4567";
    var numberField = fieldWrap("Phone number", numberInput);
    numberField.dataset.role = "value";

    row.appendChild(typeField);
    row.appendChild(numberField);
    row.appendChild(makeRemoveButton(row));
    list.appendChild(row);
  }

  function addEmailRow(presetTypeIndex) {
    var list = document.getElementById("email-list");
    var row = document.createElement("div");
    row.className = "repeat-row";
    row.dataset.kind = "email";

    var typeSelect = buildSelect(EMAIL_TYPES, presetTypeIndex);
    var typeField = fieldWrap("Type", typeSelect);

    var emailInput = document.createElement("input");
    emailInput.type = "email";
    emailInput.autocomplete = "email";
    emailInput.placeholder = "jamie@example.com";
    var emailField = fieldWrap("Email address", emailInput);
    emailField.dataset.role = "value";

    row.appendChild(typeField);
    row.appendChild(emailField);
    row.appendChild(makeRemoveButton(row));
    list.appendChild(row);
  }

  function addAddressRow(presetTypeIndex) {
    var list = document.getElementById("address-list");
    var row = document.createElement("div");
    row.className = "repeat-row";
    row.dataset.kind = "address";
    row.style.gridTemplateColumns = "130px 1fr auto";

    var typeSelect = buildSelect(ADDRESS_TYPES, presetTypeIndex);
    var typeField = fieldWrap("Type", typeSelect);

    var fieldsWrap = document.createElement("div");
    fieldsWrap.className = "address-fields";
    fieldsWrap.dataset.role = "value";

    var street = document.createElement("input");
    street.type = "text"; street.placeholder = "Street address"; street.autocomplete = "street-address";
    var street2 = document.createElement("input");
    street2.type = "text"; street2.placeholder = "Apt / Suite (optional)";
    var city = document.createElement("input");
    city.type = "text"; city.placeholder = "City"; city.autocomplete = "address-level2";
    var state = document.createElement("input");
    state.type = "text"; state.placeholder = "State / Region"; state.autocomplete = "address-level1";
    var zip = document.createElement("input");
    zip.type = "text"; zip.placeholder = "Postal code"; zip.autocomplete = "postal-code";
    var country = document.createElement("input");
    country.type = "text"; country.placeholder = "Country"; country.autocomplete = "country-name";

    [
      ["Street", street], ["Apt / Suite", street2], ["City", city],
      ["State / Region", state], ["Postal code", zip], ["Country", country]
    ].forEach(function (pair) {
      fieldsWrap.appendChild(fieldWrap(pair[0], pair[1]));
    });

    row.appendChild(typeField);
    row.appendChild(fieldsWrap);
    row.appendChild(makeRemoveButton(row));
    list.appendChild(row);
  }

  function addUrlRow(presetTypeIndex) {
    var list = document.getElementById("url-list");
    var row = document.createElement("div");
    row.className = "repeat-row";
    row.dataset.kind = "url";

    var typeSelect = buildSelect(URL_TYPES, presetTypeIndex);
    var typeField = fieldWrap("Type", typeSelect);

    var urlInput = document.createElement("input");
    urlInput.type = "url";
    urlInput.placeholder = "https://example.com";
    var urlField = fieldWrap("Website URL", urlInput);
    urlField.dataset.role = "value";

    row.appendChild(typeField);
    row.appendChild(urlField);
    row.appendChild(makeRemoveButton(row));
    list.appendChild(row);
  }

  function addSocialRow(presetTypeIndex) {
    var list = document.getElementById("social-list");
    var row = document.createElement("div");
    row.className = "repeat-row";
    row.dataset.kind = "social";

    var typeSelect = buildSelect(SOCIAL_PLATFORMS, presetTypeIndex);
    var typeField = fieldWrap("Platform", typeSelect);

    var handleInput = document.createElement("input");
    handleInput.type = "text";
    handleInput.placeholder = "Profile URL or @handle";
    var handleField = fieldWrap("Profile", handleInput);
    handleField.dataset.role = "value";

    row.appendChild(typeField);
    row.appendChild(handleField);
    row.appendChild(makeRemoveButton(row));
    list.appendChild(row);
  }

  document.querySelectorAll("[data-add]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-add");
      if (kind === "phone") addPhoneRow();
      if (kind === "email") addEmailRow();
      if (kind === "address") addAddressRow();
      if (kind === "url") addUrlRow();
      if (kind === "social") addSocialRow();
    });
  });

  // Seed with one sensible default row each for phone & email
  addPhoneRow(0);
  addEmailRow(0);

  /* ----------------------------------------------------------------
   * vCard building
   * -------------------------------------------------------------- */
  function escapeVCard(str) {
    return String(str || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function collectRows(kind) {
    var rows = document.querySelectorAll('.repeat-row[data-kind="' + kind + '"]');
    var out = [];
    rows.forEach(function (row) {
      var typeSelect = row.querySelector("select");
      var typeIndex = parseInt(typeSelect.value, 10);
      out.push({ typeIndex: typeIndex, row: row });
    });
    return out;
  }

  function buildVCard(data) {
    var lines = ["BEGIN:VCARD", "VERSION:3.0"];

    var n = [data.lastName, data.firstName, data.middleName, data.prefix, data.suffix]
      .map(escapeVCard).join(";");
    lines.push("N:" + n);

    var fnParts = [data.prefix, data.firstName, data.middleName, data.lastName, data.suffix]
      .filter(Boolean);
    var fn = fnParts.join(" ").trim() || data.org || "Contact";
    lines.push("FN:" + escapeVCard(fn));

    if (data.nickname) lines.push("NICKNAME:" + escapeVCard(data.nickname));
    if (data.org || data.department) {
      lines.push("ORG:" + escapeVCard(data.org) + (data.department ? ";" + escapeVCard(data.department) : ""));
    }
    if (data.title) lines.push("TITLE:" + escapeVCard(data.title));

    data.phones.forEach(function (p) {
      if (!p.value.trim()) return;
      lines.push("TEL;TYPE=" + p.type + ":" + escapeVCard(p.value.trim()));
    });

    data.emails.forEach(function (e) {
      if (!e.value.trim()) return;
      lines.push("EMAIL;TYPE=" + e.type + ":" + escapeVCard(e.value.trim()));
    });

    data.addresses.forEach(function (a) {
      var hasAny = a.street || a.street2 || a.city || a.state || a.zip || a.country;
      if (!hasAny) return;
      var adr = ["", a.street2, a.street, a.city, a.state, a.zip, a.country]
        .map(escapeVCard).join(";");
      lines.push("ADR;TYPE=" + a.type + ":" + adr);
    });

    data.urls.forEach(function (u) {
      if (!u.value.trim()) return;
      lines.push("URL;TYPE=" + u.type + ":" + escapeVCard(u.value.trim()));
    });

    data.socials.forEach(function (s) {
      if (!s.value.trim()) return;
      lines.push("X-SOCIALPROFILE;TYPE=" + s.type + ":" + escapeVCard(s.value.trim()));
    });

    if (data.birthday) lines.push("BDAY:" + data.birthday.replace(/-/g, ""));
    if (data.notes) lines.push("NOTE:" + escapeVCard(data.notes));

    lines.push("END:VCARD");
    return lines.join("\r\n");
  }

  function gatherFormData() {
    var data = {
      prefix: document.getElementById("prefix").value.trim(),
      firstName: document.getElementById("firstName").value.trim(),
      middleName: document.getElementById("middleName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      suffix: document.getElementById("suffix").value.trim(),
      nickname: document.getElementById("nickname").value.trim(),
      birthday: document.getElementById("birthday").value,
      org: document.getElementById("org").value.trim(),
      title: document.getElementById("title").value.trim(),
      department: document.getElementById("department").value.trim(),
      notes: document.getElementById("notes").value.trim(),
      phones: [], emails: [], addresses: [], urls: [], socials: []
    };

    collectRows("phone").forEach(function (r) {
      var input = r.row.querySelector('[data-role="value"] input');
      data.phones.push({ type: PHONE_TYPES[r.typeIndex].vcard, value: input.value });
    });
    collectRows("email").forEach(function (r) {
      var input = r.row.querySelector('[data-role="value"] input');
      data.emails.push({ type: EMAIL_TYPES[r.typeIndex].vcard, value: input.value });
    });
    collectRows("address").forEach(function (r) {
      var wrap = r.row.querySelector('[data-role="value"]');
      var inputs = wrap.querySelectorAll("input");
      data.addresses.push({
        type: ADDRESS_TYPES[r.typeIndex].vcard,
        street: inputs[0].value.trim(),
        street2: inputs[1].value.trim(),
        city: inputs[2].value.trim(),
        state: inputs[3].value.trim(),
        zip: inputs[4].value.trim(),
        country: inputs[5].value.trim()
      });
    });
    collectRows("url").forEach(function (r) {
      var input = r.row.querySelector('[data-role="value"] input');
      data.urls.push({ type: URL_TYPES[r.typeIndex].vcard, value: input.value });
    });
    collectRows("social").forEach(function (r) {
      var input = r.row.querySelector('[data-role="value"] input');
      data.socials.push({ type: SOCIAL_PLATFORMS[r.typeIndex].vcard, value: input.value });
    });

    return data;
  }

  /* ----------------------------------------------------------------
   * Logo upload
   * -------------------------------------------------------------- */
  var logoImage = null; // HTMLImageElement, once loaded

  var logoFileInput = document.getElementById("logoFile");
  var logoPreview = document.getElementById("logoPreview");
  var logoRemoveBtn = document.getElementById("logoRemove");

  logoFileInput.addEventListener("change", function () {
    var file = logoFileInput.files && logoFileInput.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        logoImage = img;
        logoPreview.src = e.target.result;
        logoPreview.hidden = false;
        logoRemoveBtn.hidden = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  logoRemoveBtn.addEventListener("click", function () {
    logoImage = null;
    logoFileInput.value = "";
    logoPreview.hidden = true;
    logoPreview.src = "";
    logoRemoveBtn.hidden = true;
  });

  /* ----------------------------------------------------------------
   * QR generation + logo compositing
   * -------------------------------------------------------------- */
  var renderTarget = document.getElementById("qr-render-target");
  var lastPngDataUrl = null;
  var lastVcfText = null;

  function generateQrWithLogo(text, size, darkColor, lightColor, logo) {
    renderTarget.innerHTML = "";

    var qr = new QRCode(renderTarget, {
      text: text,
      width: size,
      height: size,
      colorDark: darkColor,
      colorLight: lightColor,
      correctLevel: QRCode.CorrectLevel.H
    });

    var sourceCanvas = renderTarget.querySelector("canvas");

    var outCanvas = document.getElementById("qrCanvas");
    outCanvas.width = size;
    outCanvas.height = size;
    var ctx = outCanvas.getContext("2d");
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(sourceCanvas, 0, 0, size, size);

    if (logo) {
      var boxSize = Math.round(size * 0.24);
      var pad = Math.round(boxSize * 0.12);
      var x = (size - boxSize) / 2;
      var y = (size - boxSize) / 2;

      // White rounded backing so the logo stays legible against the code
      var r = 12 * (size / 600);
      ctx.fillStyle = lightColor || "#ffffff";
      roundRect(ctx, x - pad, y - pad, boxSize + pad * 2, boxSize + pad * 2, r);
      ctx.fill();

      // Draw logo, cover-fit into the square box
      var iw = logo.naturalWidth || logo.width;
      var ih = logo.naturalHeight || logo.height;
      var scale = Math.max(boxSize / iw, boxSize / ih);
      var dw = iw * scale, dh = ih * scale;
      var dx = x + (boxSize - dw) / 2;
      var dy = y + (boxSize - dh) / 2;

      ctx.save();
      roundRect(ctx, x, y, boxSize, boxSize, r * 0.6);
      ctx.clip();
      ctx.drawImage(logo, dx, dy, dw, dh);
      ctx.restore();
    }

    return outCanvas.toDataURL("image/png");
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ----------------------------------------------------------------
   * Form submit
   * -------------------------------------------------------------- */
  var form = document.getElementById("qr-form");
  var formError = document.getElementById("formError");
  var resultSection = document.getElementById("result");
  var downloadBtn = document.getElementById("downloadBtn");
  var downloadVcfBtn = document.getElementById("downloadVcfBtn");
  var resultName = document.getElementById("resultName");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    formError.hidden = true;

    var data = gatherFormData();
    var hasName = data.firstName || data.lastName;
    var hasAnyContactInfo = data.phones.some(function (p) { return p.value.trim(); }) ||
      data.emails.some(function (e) { return e.value.trim(); });

    if (!hasName && !data.org) {
      formError.textContent = "Please enter at least a first/last name or a company name.";
      formError.hidden = false;
      window.scrollTo({ top: form.offsetTop - 20, behavior: "smooth" });
      return;
    }
    if (!hasAnyContactInfo) {
      formError.textContent = "Please add at least one phone number or email address.";
      formError.hidden = false;
      window.scrollTo({ top: form.offsetTop - 20, behavior: "smooth" });
      return;
    }

    var vcard = buildVCard(data);

    var byteLength = new Blob([vcard]).size;
    if (byteLength > 1250) {
      formError.textContent = "That's a lot of information — the QR code may be dense and harder to scan. Consider removing a few fields if it doesn't scan well.";
      formError.hidden = false;
    }

    var size = parseInt(document.getElementById("qrSize").value, 10);
    var darkColor = document.getElementById("qrDark").value;
    var lightColor = document.getElementById("qrLight").value;

    var pngDataUrl;
    try {
      pngDataUrl = generateQrWithLogo(vcard, size, darkColor, lightColor, logoImage);
    } catch (err) {
      formError.textContent = "This contact card has too much information to fit in a QR code. Please remove a few fields and try again.";
      formError.hidden = false;
      return;
    }

    lastPngDataUrl = pngDataUrl;
    lastVcfText = vcard;

    downloadBtn.href = pngDataUrl;
    var fn = (data.firstName || data.org || "contact").toString().replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    downloadBtn.setAttribute("download", (fn || "contact") + "-qr-code.png");

    resultName.textContent = [data.firstName, data.lastName].filter(Boolean).join(" ") || data.org || "this contact";
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });

    incrementCounter();
  });

  downloadVcfBtn.addEventListener("click", function () {
    if (!lastVcfText) return;
    var blob = new Blob([lastVcfText], { type: "text/vcard" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "contact.vcf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* ----------------------------------------------------------------
   * Generated-count ticker
   * Tries this site's own counter.php first (works on PHP hosting),
   * then falls back to a free third-party hit counter, then hides
   * itself gracefully. No contact data is ever part of this request.
   * -------------------------------------------------------------- */
  var tickerCountEl = document.getElementById("ticker-count");
  var tickerEl = document.getElementById("counter-ticker");

  function setTickerValue(n) {
    if (typeof n === "number" && isFinite(n)) {
      tickerCountEl.textContent = n.toLocaleString();
    } else {
      tickerEl.hidden = true;
    }
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("bad status");
      return r.json();
    });
  }

  function loadCounter() {
    fetchJson("counter.php?action=get")
      .then(function (d) { setTickerValue(d.count); })
      .catch(function () {
        fetchJson("https://api.countapi.xyz/get/qrlogomaker.com/qrcodes")
          .then(function (d) { setTickerValue(d.value); })
          .catch(function () { setTickerValue(null); });
      });
  }

  function incrementCounter() {
    fetchJson("counter.php?action=hit")
      .then(function (d) { setTickerValue(d.count); })
      .catch(function () {
        fetchJson("https://api.countapi.xyz/hit/qrlogomaker.com/qrcodes")
          .then(function (d) { setTickerValue(d.value); })
          .catch(function () { /* leave ticker as-is */ });
      });
  }

  loadCounter();
})();
