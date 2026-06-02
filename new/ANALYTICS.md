# Site analytics (free)

This site uses **[GoatCounter](https://www.goatcounter.com)** — free for personal and open-source sites, no cookies, privacy-friendly.

## View your stats

**Dashboard:** [https://ymorsi.goatcounter.com](https://ymorsi.goatcounter.com)

After you deploy, open that link to see:

- Page views (which tools/pages get traffic)
- Referrers (where visitors came from)
- Countries / browsers (aggregated)
- UCSD Tier List custom events (under paths like `/event/tier_list_view`)

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
