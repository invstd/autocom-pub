(function () {
  "use strict";
  // Trucks mode has its own "Quick Connect" landing page (vehicle-search.njk, not index.njk) —
  // every link meant to return "home" (sidebar logo, mobile top-bar logo, sidebar's first nav
  // item — anything marked data-automechanika-home-link) should point there instead. See
  // [[trucks-feature-wabco-weasy]]. Runs immediately where the script tag sits in the sidebar
  // markup (after both the sidebar and the earlier-in-document mobile top bar exist), not on
  // DOMContentLoaded, to keep the "wrong" link's flash as brief as possible.
  if (localStorage.getItem("automechanika-vehicle-type") !== "trucks") return;

  document.querySelectorAll("[data-automechanika-home-link]").forEach(function (el) {
    var href = el.getAttribute("href");
    if (href) el.setAttribute("href", href.replace(/automechanika\/$/, "automechanika/vehicle-search/"));
  });

  var homeLink = document.getElementById("automechanika-nav-home");
  if (homeLink) {
    homeLink.querySelectorAll("[data-nav-home-cars]").forEach(function (el) { el.classList.add("hidden"); });
    homeLink.querySelectorAll("[data-nav-home-trucks]").forEach(function (el) { el.classList.remove("hidden"); });
  }
})();
