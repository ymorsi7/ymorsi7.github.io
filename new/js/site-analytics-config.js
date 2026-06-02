/**
 * Site analytics — edit this file once, then include on any page:
 *   <script src="js/site-analytics-config.js"></script>
 *   <script src="js/site-analytics.js"></script>
 *
 * GitHub Pages has no server logs; use a third-party service below.
 *
 * GA4 (Google Analytics): https://analytics.google.com
 *   → Admin → Data streams → your site → Measurement ID (G-XXXXXXXXXX)
 *
 * GoatCounter (simple, privacy-friendly): https://www.goatcounter.com
 *   → Create site → Settings → copy counting endpoint (ends with /count)
 */
window.SITE_ANALYTICS = {
  enabled: false,

  /** "ga4" | "goatcounter" */
  provider: "ga4",

  /** GA4 measurement ID, e.g. G-XXXXXXXXXX */
  ga4MeasurementId: "",

  /**
   * GoatCounter endpoint, e.g. https://ymorsi7.goatcounter.com/count
   * (from your GoatCounter site settings)
   */
  goatcounterUrl: "",
};
