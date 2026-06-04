# Site analytics (free)

The whole static site (portfolio, tools, BidetBeacon, old pages, 404s, etc.) uses **[GoatCounter](https://www.goatcounter.com)** — free for personal and open-source sites, no cookies, privacy-friendly.

Every HTML page includes one script:

```html
<script src="/new/js/site-analytics-loader.js"></script>
```

The loader pulls in `site-analytics-config.js` and `site-analytics.js` from `/new/js/` (path is resolved automatically if you use a relative `../js/` URL instead).

## View your stats

**Dashboard:** [https://ymorsi.goatcounter.com](https://ymorsi.goatcounter.com)

After you deploy, open that link to see:

- Page views for any path (e.g. `/new/index.html`, `/bidetbeacon`, `/new/bidetbeacon.html`)
- Referrers (where visitors came from)
- Countries / browsers (aggregated)
- Custom events from pages that call `trackEvent()` (e.g. UCSD Tier List under `/event/...`)

## One-time setup (about 2 minutes)

Analytics code is already enabled in `js/site-analytics-config.js`. You only need to **create the GoatCounter site** so hits are stored:

1. Sign up (free): [https://www.goatcounter.com/signup](https://www.goatcounter.com/signup)
2. Your site code is **`ymorsi`** (must match `goatcounterUrl` in config).
3. Under **Settings → Allowed domains**, add:
   - `ymorsi7.github.io`
   - `ymorsi.com` (if you use a custom domain)
4. Deploy/push to GitHub Pages, visit a few pages, then refresh the dashboard.

Until step 2 is done, the script runs but counts are discarded — no error on your pages.

## Change provider

Edit `js/site-analytics-config.js`:

- **GoatCounter** (default): `provider: "goatcounter"`
- **Google Analytics 4** (also free): set `provider: "ga4"`, `ga4MeasurementId: "G-XXXXXXXXXX"`, and get an ID from [analytics.google.com](https://analytics.google.com).
