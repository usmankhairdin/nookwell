NOOKWELL — FREE REAL-ESTATE HTML TEMPLATE
Version 1.0.0 | 25 October 2026

START HERE
Open index.html in a modern browser. Keep assets/ beside it. This is a
finished static website: no React, Vite, Node.js, npm install, build step,
API keys, database or online CDN is required. Fonts, photos and the smooth
scroll library are included locally. A static HTTP server is optional.

WHAT THIS IS
A fictional neighborhood real-estate studio landing page. Sample homes,
neighborhoods, prices, floor areas and addresses are illustrative, not
actual offers or verified property details. The photos are stock examples.
This name is a demonstration identity, not a trademark availability claim.

WHAT WORKS
- Buy/rent and neighborhood filters, including an honest empty state.
- Property detail dialogs and prefilled enquiry messages.
- Save/unsave homes in localStorage on this browser, when permitted.
- Smooth desktop scrolling and locally scrollable dialogs/navigation.
- Keyboard/drag slim scrollbars; native touch/reduced-motion fallbacks.
- Full-screen mobile navigation with focus return and background lock.
- Reversible measured FAQ opening/closing and real section links.
- Form validation and an email draft, with copy/manual-copy fallback.

WHAT DOES NOT SEND OR BOOK
The contact form only prepares a draft. No message is sent from the page,
no agent is notified, and no viewing is booked. Open email app invokes the
visitor's own configured email application. hello@nookwell.example is a
reserved example address. Replace BOTH occurrences in nookwell.js and the
fallback form action/description in index.html with your real email before
launch. Alternatively connect your own secure form service/backend.
Never put email/API passwords into a public JavaScript file.

FILES
index.html                    All visible content, sections and native FAQs
assets/css/nookwell.css         Design tokens, typography and responsive UI
assets/js/nookwell.js           Filters, dialogs, menu, FAQs, email draft
assets/js/lenis-1.3.27.min.js   Locally bundled Lenis; no network dependency
assets/css/lenis.css            Lenis library styles
assets/fonts/                  Outfit variable font
assets/img/                    Four optimized property photos and brand mark
licenses/                      Library/font licenses and exact photo sources
docs/PLAN.md                   Design decisions and acceptance checklist
LICENSE                        MIT license for original template code
THIRD_PARTY_NOTICES.txt         Important photo, font and dependency terms

EDIT YOUR BRAND AND HOMES
1. Edit the title, descriptions, text, logo and section links in index.html.
2. Change the named color/font/spacing tokens at the top of nookwell.css.
3. The listing cards in index.html are the no-JavaScript fallback. The homes
   object near the bottom of nookwell.js supplies detail-dialog data. Keep
   titles, prices, photos, types, areas and features consistent in BOTH.
4. Match every card's data-type/data-area values to its filter buttons.
   Add neighborhood options in HTML and use the same keys in the cards.
5. Keep image width/height attributes and descriptive alt text accurate.
6. Replace sample property/legal/business copy with your real information.
   Add appropriate privacy/contact/licensing information for your business.
7. Replace the email destination as described above and test actual delivery
   only after connecting your chosen email client/form backend.
8. The saved-home key is nookwell-saved; no cookies or external tracking are
   installed. Browser storage may be unavailable, in which case saving is
   temporary for the current page. There is no user account or server sync.

LOCAL HTTP PREVIEW (OPTIONAL)
With Python installed, open a terminal IN this folder and run:
  python -m http.server 4210 --bind 127.0.0.1
Then open http://127.0.0.1:4210/ . Stop the server with Ctrl+C.
You can also use an editor's local static-preview extension. The template
itself does not require Python or any application runtime on your host.

UPLOAD TO YOUR DOMAIN
1. Back up any existing website before replacing files.
2. In cPanel/File Manager or FTP, upload the CONTENTS of this folder to your
   domain's document root (commonly public_html). index.html should sit
   directly in that document root, beside assets/.
3. Keep the license/notices with the template. docs/ is supporting material
   and may remain private; it is not required for the page to run.
4. Enable HTTPS through your hosting provider. No Node process, database,
   rewrite rules or SPA fallback is needed.
5. Visit your domain and check images, fonts, filter results, dialogs, menu,
   keyboard focus, mobile layout, FAQs and your real contact destination.

UPLOAD TO A SUBFOLDER
Upload the same contents to e.g. public_html/nookwell/ and visit
https://your-domain.example/nookwell/ . All assets are relative. No base
path or build setting changes are necessary. Keep the final URL slash.

STATIC HOSTS
Publish this directory on a static host, such as GitHub Pages or Netlify.
Publish directory: the folder containing index.html. Build command: none.
Custom domain/DNS/HTTPS configuration belongs to the hosting provider.
Do not publish private hosting credentials inside this folder.

ACCESSIBILITY / FALLBACKS
Native links and all three listings remain available without JavaScript.
FAQs fall back to native details/summary. The fallback form invokes the
visitor's mail client and still uses an explicit example destination.
Modern dialogs provide focus containment; unsupported dialog browsers use
the ordinary contact anchor. Smooth scrolling is disabled for touch and
reduced motion. Native page/region scrolling remains the fallback if Lenis
is absent. Test your own changes with keyboard and real mobile devices.

LICENSES
Original code is MIT. Outfit is SIL OFL 1.1, Lenis is MIT. Shared interaction
mechanics adapt the studio's Taskline implementation, with its complete
upstream notice retained. Property photos have the separate Unsplash
License; the MIT code license does not relicense those images. Do not sell
the photos as standalone image files or create a competing image library.
See licenses/photo-sources.json and THIRD_PARTY_NOTICES.txt. Replace stock
imagery and demonstration claims as appropriate for your own business.

FOOTER CREDIT
The supplied credit is:
Designed & developed by Usman Khair Din
Only the bold name links to https://www.usmankhairdin.com/ .

This package contains the complete editable landing page and its local runtime assets. No framework installation or build is required.
