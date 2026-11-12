# Manjal Taxi – Tamil Nadu Taxi Booking Website

Static taxi booking site in HTML5, CSS3 and vanilla JavaScript. No backend, database, login or payment gateway. Bookings are sent by email (mailto) with WhatsApp as a fallback.

## Folder structure

```
tamilnadu-taxi/
├── index.html   Page structure, SEO meta, Open Graph, LocalBusiness JSON-LD
├── style.css    Brand tokens, layout, animations, responsive and reduced-motion rules
├── script.js    Config, location dataset, fare logic, booking, calculator, UI behaviour
└── README.md
```

All artwork (taxi, skyline, vehicles, icons) is inline SVG, so there are no image files to break.

## Before going live: edit these

1. **script.js → `CONFIG`** (top of file): business name, booking email, phone, WhatsApp number, minimum fare. Every email link, phone link, WhatsApp button and brand label on the page updates from here.
2. **script.js → `VEHICLES`**: per-km rates, seat counts and example models.
3. **index.html → `<head>`**: page title, meta description, canonical URL, Open Graph URL and image, and every value in the LocalBusiness JSON-LD block (name, phone, email, address, geo).
4. **index.html → static text**: the brand name “Manjal Taxi” appears in the title, meta tags and JSON-LD (JavaScript updates the visible labels, but search engines read the HTML).
5. **Optional:** upload a 1200×630 `og-image.jpg` for social sharing previews.

## Adding locations

Add a row to the right district in `DISTRICTS` in script.js:

```js
['Place name', 'town', 10.1234, 78.5678, 'optional aliases for search'],
```

Types: `city`, `town`, `tourist`, `hill`, `rail`, `airport`, `bus`. For a new hill station, also add its extra ghat-road km to `GHAT_EXTRA_KM`.

To add a popular route card, copy a `<button class="route">` in index.html and set `data-from` / `data-to` to location IDs, which are `district--place-name` in lowercase with hyphens (for example `madurai--madurai-junction`).

## How fares are estimated

Straight-line distance (Haversine) × 1.25 road factor × vehicle rate, minimum ₹500, rounded up to the nearest ₹10. Round trips double the distance. Trips to hill stations add a fixed ghat-road allowance (for example +30 km for Ooty), because the 1.25 factor alone badly underestimates winding hill roads. If a customer types a place that isn’t in the list, the enquiry is still sent and the fare is marked “to be confirmed”.

## Run locally

Double-click `index.html`, or for the closest match to a live site, serve the folder:

```
cd tamilnadu-taxi
python3 -m http.server 8000
```

Then open http://localhost:8000. (`npx serve .` also works.)

## Free hosting

**Netlify (quickest):** sign in at app.netlify.com → Add new site → Deploy manually → drag the `tamilnadu-taxi` folder onto the page. You get a live URL in seconds; add a custom domain under Domain settings.

**GitHub Pages:** create a public repository, upload the three files to the root (keep `index.html` named exactly that), then go to Settings → Pages → Source: Deploy from a branch → `main` / root → Save. The site appears at `https://<username>.github.io/<repo>/` after a minute or two.

After deploying, update the canonical and Open Graph URLs to the live address and submit the site in Google Search Console.

## Notes

- The booking button opens the visitor’s email app. On a computer without a configured mail app, the “ready to send” dialog offers Copy details and Send on WhatsApp.
- Counters in “Why travel with us” are calculated from the site’s own data (districts, listed locations, vehicle types), not invented company statistics.
- The carousel holds service commitments. Replace the `HIGHLIGHTS` array with genuine customer reviews once you have them.
- Animations respect the visitor’s “reduce motion” system setting.
