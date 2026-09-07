# Melt That Debt

A free, private debt snowball calculator for **meltthatdebt.com**.

Users enter up to 5 debts (name, balance, interest rate, minimum payment) plus
an optional extra monthly payment. The site simulates the
[debt snowball method](https://en.wikipedia.org/wiki/Snowball_effect#Debt_snowball_method)
(paying minimums on everything, then targeting the smallest balance first,
rolling each cleared payment into the next debt) and shows:

- a month-by-month payoff order
- debt-free date and total interest paid
- a balance-over-time chart
- a full payoff schedule table

## Why it's private

This is a **static site with no backend, no database, and no analytics or
third-party scripts**. Every calculation runs in the visitor's browser in
plain JavaScript (`script.js`). Nothing is ever sent over the network —
refreshing or closing the tab erases everything the user typed. That's what
the top banner promises, and it's true by construction, not by policy.

## Files

- `index.html` — page structure and content (including the disclaimer banner and footer)
- `styles.css` — all styling
- `script.js` — form handling, the snowball simulation, and the chart

No build step, no dependencies, no package.json — just open `index.html` in a
browser or serve the folder as-is.

## Deploying to meltthatdebt.com

Any static host works. A few easy options:

### Netlify / Vercel / Cloudflare Pages
1. Push this folder (or the whole repo) to GitHub.
2. Create a new site on the host, pointing at this `meltthatdebt/` directory
   as the site root (no build command needed).
3. Add `meltthatdebt.com` as a custom domain in the host's dashboard and
   follow their DNS instructions (usually a CNAME or A/ALIAS record).

### GitHub Pages
1. Push this repo to GitHub.
2. In repo Settings → Pages, set the source to the branch/folder containing
   `meltthatdebt/`.
3. Add a `CNAME` file inside `meltthatdebt/` containing `meltthatdebt.com`,
   and point your domain's DNS to GitHub Pages per
   [GitHub's custom domain docs](https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site).

### Any generic web host / S3 / nginx
Just upload the three files (`index.html`, `styles.css`, `script.js`) to the
web root and point DNS at the host. There's nothing else to configure.

## Local preview

```bash
cd meltthatdebt
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes on the math

- Interest is compounded monthly (`APR / 12`) on the remaining balance.
- The total monthly budget (sum of all minimum payments + the extra payment)
  is held constant: once a debt is paid off, its former minimum payment
  rolls into the current target debt, which is the classic "snowball" effect.
- The simulation is capped at 100 years; if payments don't cover accruing
  interest, the form blocks submission with an explanation instead of
  showing a misleading result.
- This is a simplified educational model — it doesn't account for fees,
  promotional/variable rates, late payments, or payment date timing, so it
  won't match a real statement to the penny. It is not financial advice.
