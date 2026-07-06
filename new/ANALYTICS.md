# Site analytics (free)

The whole static site (portfolio, tools, old pages, 404s, etc.) uses **[GoatCounter](https://www.goatcounter.com)** — free for personal and open-source sites, no cookies, privacy-friendly.

**bidetbud.com** lives in its own repo ([ymorsi7/bidetbeacon](https://github.com/ymorsi7/bidetbeacon)) and is no longer tracked here. `/bidetbeacon` on this site redirects to [bidetbud.com](https://bidetbud.com/).

Every HTML page includes one script:

```html
<script src="/js/site-analytics-loader.js"></script>
```

On **Netlify** (publish directory `new/`), scripts live at `/js/`. Older pages still use `/new/js/…`; `new/_redirects` maps those to `/js/`.

The loader pulls in `site-analytics-config.js` and `site-analytics.js` from the same folder as the loader URL (or use a relative `../js/` URL from nested pages).

## View your stats

**Dashboard:** [https://ymorsi.goatcounter.com](https://ymorsi.goatcounter.com)

After you deploy, open that link to see:

- Page views for any path (e.g. `/new/index.html`, `/halal-vibes`)
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

## Troubleshooting (“is it working?”)

If you see **any** rows in [the dashboard](https://ymorsi.goatcounter.com) (page paths, totals, referrers), GoatCounter **is** receiving hits. A quiet hour shown as **“0 visits”** (e.g. `2 Jun 10:00 – 10:59`) only means nobody visited in that hour — not that tracking is broken.

What you should expect:

| Dashboard | Meaning |
|-----------|---------|
| `/halal-vibes` | Halal Vibes guide (page views) |
| `/ucsd-tier-list` | Netlify pretty URL for the tier list (page views) |
| `/event/tier_list_view` | Custom event from `trackEvent("tier_list_view")` |
| `/event/course_ranked/MATH` | Custom event when someone ranks a MATH course |
| `(unknown)` referrer | Direct traffic, in-app browsers, or privacy stripping — normal |
| **Languages 100% (unknown)** | Disabled under GoatCounter **Settings** — enable there if you want language breakdown |
| **122 of 146 visits shown** | Pagination on the Pages table — use “Show more” |

Quick self-test after deploy:

1. Open [https://ymorsi.com/halal-vibes](https://ymorsi.com/halal-vibes) (or the tier list) in a normal browser (not a strict ad blocker).
2. DevTools → **Network** → filter `count` — you should see a request to `https://ymorsi.goatcounter.com/count` (status 200).
3. Wait ~1–2 minutes, refresh the dashboard (GoatCounter is not Google-style real-time).

Under **Settings → Allowed domains**, include `ymorsi.com` and `ymorsi7.github.io` so production and preview hosts are accepted.

## Change provider

Edit `js/site-analytics-config.js`:

- **GoatCounter** (default): `provider: "goatcounter"`
- **Google Analytics 4** (also free): set `provider: "ga4"`, `ga4MeasurementId: "G-XXXXXXXXXX"`, and get an ID from [analytics.google.com](https://analytics.google.com).
