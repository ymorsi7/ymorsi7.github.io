/**
 * Site analytics — GoatCounter (free for personal / open-source sites).
 *
 * Included on pages via:
 *   <script src="js/site-analytics-config.js"></script>
 *   <script src="js/site-analytics.js"></script>
 *
 * View stats: https://ymorsi.goatcounter.com
 * (Site code at goatcounter.com must be "ymorsi" — same as your dashboard URL.)
 */
window.SITE_ANALYTICS = {
  enabled: true,

  /** "goatcounter" (free) | "ga4" (also free; needs Google account + G- ID) */
  provider: "goatcounter",

  /** GoatCounter counting endpoint — must match your site code at goatcounter.com */
  goatcounterUrl: "https://ymorsi.goatcounter.com/count",

  /** Dashboard — open in browser to see visitors, pages, countries, referrers */
  dashboardUrl: "https://ymorsi.goatcounter.com",

  /** GA4 — only used if provider is "ga4" */
  ga4MeasurementId: "",
};
