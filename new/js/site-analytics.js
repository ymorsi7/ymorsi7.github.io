/**
 * Lightweight analytics loader for static pages (GitHub Pages).
 * Exposes window.trackEvent(name, params) when enabled.
 */
(function () {
  const cfg = window.SITE_ANALYTICS || {};
  if (!cfg.enabled) return;

  const provider = (cfg.provider || "ga4").toLowerCase();

  function pagePath() {
    return window.location.pathname + window.location.search;
  }

  function loadGa4() {
    const id = (cfg.ga4MeasurementId || "").trim();
    if (!id) {
      console.warn("[site-analytics] GA4 enabled but ga4MeasurementId is empty.");
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };

    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);

    window.gtag("js", new Date());
    window.gtag("config", id, {
      anonymize_ip: true,
      send_page_view: true,
      page_path: pagePath(),
    });
  }

  function loadGoatCounter() {
    let url = (cfg.goatcounterUrl || "").trim();
    if (!url) {
      console.warn("[site-analytics] GoatCounter enabled but goatcounterUrl is empty.");
      return;
    }
    if (!url.endsWith("/count")) url = url.replace(/\/?$/, "/count");

    const s = document.createElement("script");
    s.async = true;
    s.dataset.goatcounter = url;
    s.dataset.goatcounterSettings = JSON.stringify({
      allow_local: true,
      allow_frame: false,
    });
    s.src = "https://gc.zgo.at/count.js";
    document.head.appendChild(s);

    if (cfg.dashboardUrl) {
      window.SITE_ANALYTICS_DASHBOARD = cfg.dashboardUrl;
    }
  }

  /**
   * @param {string} name
   * @param {Record<string, string | number | boolean>} [params]
   */
  window.trackEvent = function (name, params) {
    if (!cfg.enabled || !name) return;
    const p = params || {};

    if (provider === "ga4" && typeof window.gtag === "function" && cfg.ga4MeasurementId) {
      window.gtag("event", name, {
        ...p,
        page_path: pagePath(),
      });
      return;
    }

    if (provider === "goatcounter" && window.goatcounter && typeof window.goatcounter.count === "function") {
      const path = p.dept ? `/event/${name}/${p.dept}` : `/event/${name}`;
      window.goatcounter.count({
        path,
        title: String(name),
        event: true,
      });
    }
  };

  if (provider === "goatcounter") loadGoatCounter();
  else loadGa4();
})();
