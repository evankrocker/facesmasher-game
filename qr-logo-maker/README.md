# QR Logo Maker

A static, client-side site that generates a downloadable QR code contact
card (vCard) for iOS and Android — with an optional logo placed in the
middle of the code. Built for **qrlogomaker.com**.

## How it works

- All contact fields are typed into a form and assembled into a standard
  **vCard 3.0** record entirely in the browser (see `js/app.js`,
  `buildVCard()`). Nothing is ever sent to a server — there is no backend
  that stores contact data, and no analytics/tracking of form contents.
- The vCard text is encoded into a QR code using the bundled
  [qrcodejs](https://github.com/davidshimjs/qrcodejs) library
  (`js/qrcode.min.js`, MIT licensed — see `js/QRCODEJS-LICENSE.txt`),
  rendered with high error correction (level H) so it keeps scanning
  correctly even with a logo covering part of it.
- If the user uploads a logo image, it's drawn on top of the generated QR
  code on an HTML `<canvas>`, with a white backing square for contrast.
- The final image is offered as a PNG download (canvas → data URL →
  `<a download>`), and the raw contact card is also downloadable as a
  `.vcf` file.
- Scanning the QR code with a phone's camera opens "Add Contact" on both
  iOS and Android, because it's a standard vCard.

## The "QR codes generated" ticker

The banner at the top of the page shows a running total of QR codes
generated across all visitors. Because this is a static site, that counter
needs *some* place to live:

1. **Primary: `counter.php`.** A tiny, dependency-free PHP script that
   stores a single number in `data/counter.json`. This works out of the
   box on almost any shared hosting plan (GoDaddy, Bluehost, cPanel, etc.)
   that supports PHP — no database required.
2. **Fallback: a free public hit-counter API** (`api.countapi.xyz`). If
   `counter.php` isn't reachable (e.g. you're hosting on something that
   doesn't run PHP, like GitHub Pages or Netlify's static tier), the page
   automatically falls back to this third-party service so the ticker
   still works. Only an anonymous increment request is made — no contact
   information is ever included.
3. If both are unavailable, the ticker hides itself rather than showing a
   fake number.

If your host supports PHP, no setup is required beyond uploading the
files — `counter.php` will create `data/counter.json` automatically on
first use. Just make sure the `data/` folder is **writable** by PHP
(usually permissions `755` or `775` on shared hosting; ask your host if
you get a "counter unavailable" style issue). The included `data/.htaccess`
blocks direct web access to that folder without affecting `counter.php`
itself.

If you'd rather not run PHP at all, delete `counter.php` and the `data/`
folder — the site will just use the third-party fallback automatically.

## Deploying to qrlogomaker.com

This is a plain static site (plus one optional PHP file), so deployment is
just uploading files — no build step, no npm install, no server process.

1. Upload the entire contents of this folder to your web host's public
   root (often called `public_html`, `www`, or `htdocs`), preserving the
   folder structure:
   ```
   public_html/
     index.html
     css/styles.css
     js/app.js
     js/qrcode.min.js
     js/QRCODEJS-LICENSE.txt
     counter.php
     data/counter.json
     data/.htaccess
   ```
2. Point `qrlogomaker.com`'s DNS/hosting at this directory (this is
   typically already the case if you upload straight into
   `public_html`).
3. Visit `https://qrlogomaker.com` and confirm:
   - The form loads and the ticker shows a number (or hides itself if
     PHP isn't available and the fallback API can't be reached).
   - Filling in a name + phone/email and clicking **Generate QR Code**
     produces a scannable QR code.
   - **Download QR Code** saves a PNG; **Download .vcf contact file**
     saves the raw vCard.
   - Test on an actual phone: scan the QR with the iOS Camera app and
     with Android's camera/Google Lens to confirm "Add Contact" appears
     with the expected fields.

No build tools, CDNs, frameworks, or third-party JavaScript are required
for the core site — everything needed to run it is in this folder.

## Customizing

- **Colors / branding:** edit the CSS variables at the top of
  `css/styles.css` (`--brand`, `--ink`, etc.).
- **Dropdown options** (phone types, email types, address types, website
  types, social platforms) live at the top of `js/app.js` and can be
  freely edited/extended.
- **QR sizes** are set in the `<select id="qrSize">` options in
  `index.html`.
- **Counter namespace:** if you fork this for another domain and want a
  separate fallback counter, change `qrlogomaker.com/qrcodes` in the
  `api.countapi.xyz` URLs inside `js/app.js` to a unique string.

## Privacy

No contact data, images, or form input are ever transmitted to a server
or stored anywhere. The only network requests the page makes are to
increment/read the anonymous visit counter described above; that request
carries no personal data.
