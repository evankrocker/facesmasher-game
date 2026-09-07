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

- `index.html` — page structure and content (including the disclaimer banner, SEO/meta tags, intro copy, FAQ, and footer)
- `styles.css` — all styling
- `script.js` — form handling, the snowball simulation, and the chart
- `robots.txt` — allows all crawlers, points to the sitemap
- `sitemap.xml` — single-URL sitemap for the home page
- `manifest.json` — PWA manifest (name, theme color, icons) for "add to home screen"
- `404.html` — simple not-found page that links back to the calculator
- `assets/og-image.png` — 1200×630 social share image (Open Graph / Twitter Card)
- `assets/icon-*.png` — favicon and home-screen icons (32, 180, 192, 512px)

No build step, no dependencies, no package.json — just open `index.html` in a
browser or serve the folder as-is.

## SEO

The page is set up so a Google Search Console submission is close to a
one-click job:

- **On-page**: a keyword-focused `<title>` and meta description, an intro
  paragraph and FAQ section written around real search terms (debt snowball
  calculator, debt payoff calculator, credit card payoff calculator, debt
  avalanche vs. snowball, etc.), a single `<h1>`, and semantic heading order.
- **Meta tags**: `description`, `keywords`, `robots`, `theme-color`, and a
  `canonical` link pointed at `https://meltthatdebt.com/`.
- **Social previews**: Open Graph and Twitter Card tags plus a generated
  `assets/og-image.png` so links shared on Slack/X/LinkedIn/iMessage show a
  proper preview card instead of a blank one.
- **Structured data**: two JSON-LD blocks in `<head>` — a `WebApplication`
  schema describing the tool, and a `FAQPage` schema that mirrors the visible
  FAQ section word-for-word (Google currently only shows FAQ rich snippets
  for a narrow set of authoritative sites, but the markup is still valid,
  future-proof, and helps search engines understand the page either way).
- **Crawling**: `robots.txt` and `sitemap.xml` at the site root.
- **Icons/PWA**: `manifest.json` and generated icon files so the site can be
  "installed" and shows a real icon everywhere, not a generic globe.

### Before/after going live, double-check

1. **Domain**: every absolute URL (`canonical`, `og:url`, `og:image`,
   `twitter:image`, the sitemap's `<loc>`, `robots.txt`'s `Sitemap:` line) is
   hardcoded to `https://meltthatdebt.com/`. If you deploy to a different
   domain or a subpath, update those before submitting to Google.
2. **Search Console**: after DNS/hosting is live, add the property at
   [search.google.com/search-console](https://search.google.com/search-console),
   verify ownership (most static hosts support a DNS TXT record or an HTML
   file upload), then submit `https://meltthatdebt.com/sitemap.xml` under
   Sitemaps. You can also use "Request Indexing" on the URL Inspection tool
   to speed up the first crawl instead of waiting for Google to find it.
3. **Rich results test**: paste the live URL into
   [Google's Rich Results Test](https://search.google.com/test/rich-results)
   to confirm the `WebApplication`/`FAQPage` structured data parses cleanly.
4. **Social preview check**: use
   [Facebook's Sharing Debugger](https://developers.facebook.com/tools/debug/)
   or [Twitter Card Validator](https://cards-dev.twitter.com/validator) once
   live to confirm `assets/og-image.png` renders correctly (these tools fetch
   the live URL, so they only work after deployment).

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
