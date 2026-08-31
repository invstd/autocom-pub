(function () {
  "use strict";
  // Fills every [data-tech-data-provider-name] span (banner copy + each preview modal's footer)
  // with a brand-specific 3rd-party provider name, same brand-extraction + per-brand lookup shape
  // as battery-soh-report.js's PRODUCT_NAME_BY_BRAND. Ships with every brand pointing at the
  // generic fallback — give a brand its own entry below if stakeholders want a named provider.
  var root = document.querySelector("[data-tech-data-page]");
  if (!root) return;

  var GENERIC_PROVIDER = "your technical data partner";
  var PROVIDER_BY_BRAND = {
    Autocom: "",
    WOW: "",
    Wabco: "",
  };

  var theme = localStorage.getItem("theme") || "";
  var brandMatch = /^(.+) (Light|Dark)$/.exec(theme);
  var brand = brandMatch ? brandMatch[1] : theme;
  var providerName = PROVIDER_BY_BRAND[brand] || GENERIC_PROVIDER;

  root.querySelectorAll("[data-tech-data-provider-name]").forEach(function (el) {
    el.textContent = providerName;
  });
})();
