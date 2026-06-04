/**
 * Loads site analytics from the same directory as this script (works at any page depth).
 * Usage: <script src="/new/js/site-analytics-loader.js"></script>
 *    or: <script src="../js/site-analytics-loader.js"></script>
 */
(function () {
  var el = document.currentScript;
  var base = el && el.getAttribute("data-base");
  if (!base && el && el.src) {
    try {
      base = new URL(".", el.src).href;
    } catch (e) {
      base = "/new/js/";
    }
  }
  if (!base) base = "/new/js/";
  if (base.charAt(base.length - 1) !== "/") base += "/";

  function load(file, next) {
    var s = document.createElement("script");
    s.src = base + file;
    s.onload = function () {
      if (next) next();
    };
    s.onerror = function () {
      console.warn("[site-analytics] Failed to load " + s.src);
    };
    document.head.appendChild(s);
  }

  load("site-analytics-config.js", function () {
    load("site-analytics.js");
  });
})();
