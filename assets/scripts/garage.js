(function () {
  var page = document.querySelector(".my-garage-page");
  if (!page) return;

  // --- Sessions: left-list row selection -> matching detail panel ---
  var sessionRows = page.querySelectorAll(".garage-vehicle-row");
  sessionRows.forEach(function (row) {
    row.addEventListener("click", function () {
      var id = row.getAttribute("data-vehicle-id");

      sessionRows.forEach(function (r) {
        r.classList.toggle("bg-base-200", r === row);
      });

      page.querySelectorAll(".garage-detail-panel").forEach(function (panel) {
        var active = panel.getAttribute("data-detail-panel") === id;
        panel.classList.toggle("hidden", !active);
        panel.classList.toggle("flex", active);
      });
    });
  });
  if (sessionRows.length) sessionRows[0].classList.add("bg-base-200");

  // --- Repair Orders: left-list row selection -> matching detail panel ---
  var repairOrderRows = page.querySelectorAll(".repair-order-row");
  repairOrderRows.forEach(function (row) {
    row.addEventListener("click", function () {
      var id = row.getAttribute("data-vehicle-id");

      repairOrderRows.forEach(function (r) {
        r.classList.toggle("bg-base-200", r === row);
      });

      page.querySelectorAll(".garage-ro-detail-panel").forEach(function (panel) {
        var active = panel.getAttribute("data-ro-detail-panel") === id;
        panel.classList.toggle("hidden", !active);
        panel.classList.toggle("flex", active);
      });
    });
  });
  if (repairOrderRows.length) repairOrderRows[0].classList.add("bg-base-200");

  // --- Search filter (both row sets; also hides date-group headers left with no visible rows) ---
  var searchEl = page.querySelector("#garage-search");
  if (searchEl) {
    var filterRows = function (rows) {
      var q = (searchEl.value || "").trim().toLowerCase();
      rows.forEach(function (row) {
        var text = (row.getAttribute("data-searchable") || "").toLowerCase();
        row.classList.toggle("hidden", Boolean(q) && text.indexOf(q) === -1);
      });
    };
    var filterGroupHeaders = function (list) {
      list.querySelectorAll(".garage-group-header").forEach(function (header) {
        var sibling = header.nextElementSibling;
        var hasVisibleRow = false;
        while (sibling && !sibling.classList.contains("garage-group-header")) {
          if (!sibling.classList.contains("hidden")) hasVisibleRow = true;
          sibling = sibling.nextElementSibling;
        }
        header.classList.toggle("hidden", !hasVisibleRow);
      });
    };
    var filter = function () {
      filterRows(sessionRows);
      filterRows(repairOrderRows);
      page.querySelectorAll("[data-garage-list]").forEach(filterGroupHeaders);
    };
    searchEl.addEventListener("input", filter);
    searchEl.addEventListener("search", filter);
  }

  // --- Top pill tabs: Repair Orders / Sessions ---
  var topTabs = page.querySelectorAll("[data-garage-top-tabs] [data-garage-tab]");
  function activateGarageTab(target) {
    var matchBtn = null;
    topTabs.forEach(function (b) {
      var match = b.getAttribute("data-garage-tab") === target;
      if (match) matchBtn = b;
      b.classList.toggle("tab-active", match);
    });
    if (!matchBtn) return;
    page.querySelectorAll("[data-garage-list]").forEach(function (list) {
      list.classList.toggle("hidden", list.getAttribute("data-garage-list") !== target);
    });
    page.querySelectorAll("[data-garage-detail-set]").forEach(function (set) {
      var active = set.getAttribute("data-garage-detail-set") === target;
      set.classList.toggle("hidden", !active);
      set.classList.toggle("flex", active);
    });
  }
  topTabs.forEach(function (tabBtn) {
    tabBtn.addEventListener("click", function () {
      activateGarageTab(tabBtn.getAttribute("data-garage-tab"));
    });
  });
  // "See all" from a landing page's Recent Vehicles card links here with ?tab=sessions so it
  // opens on the Recent Vehicles tab instead of always defaulting to Repair Orders.
  var requestedTab = new URLSearchParams(window.location.search).get("tab");
  if (requestedTab) activateGarageTab(requestedTab);

  // "Finish Session" on the diagnostics dashboard links here with ?vehicleId= (alongside
  // ?tab=sessions above) so the mechanic lands on their own vehicle's session instead of whichever
  // one happens to be first in the list — same URLSearchParams pattern as ?tab=, read after the
  // default first-row selection above so a valid param always wins. Only the Sessions list's rows
  // are handled since that's the only caller today; extend to repairOrderRows if one shows up.
  var requestedVehicleId = new URLSearchParams(window.location.search).get("vehicleId");
  if (requestedVehicleId) {
    var requestedRow = null;
    sessionRows.forEach(function (r) {
      var match = r.getAttribute("data-vehicle-id") === requestedVehicleId;
      if (match) requestedRow = r;
      r.classList.toggle("bg-base-200", match);
    });
    if (requestedRow) {
      page.querySelectorAll(".garage-detail-panel").forEach(function (panel) {
        var active = panel.getAttribute("data-detail-panel") === requestedVehicleId;
        panel.classList.toggle("hidden", !active);
        panel.classList.toggle("flex", active);
      });
      requestedRow.scrollIntoView({ block: "nearest" });
    }
  }

  // --- Per-vehicle detail tabs: Sessions / Documents ---
  var detailTabs = page.querySelectorAll("[data-garage-detail-tab]");
  detailTabs.forEach(function (tabBtn) {
    tabBtn.addEventListener("click", function () {
      var tabsWrap = tabBtn.closest("[data-garage-detail-tabs]");
      var panelWrap = tabBtn.closest(".garage-detail-panel");
      if (!tabsWrap || !panelWrap) return;
      var target = tabBtn.getAttribute("data-garage-detail-tab");

      tabsWrap.querySelectorAll("[data-garage-detail-tab]").forEach(function (b) {
        b.classList.toggle("tab-active", b === tabBtn);
      });
      panelWrap.querySelectorAll("[data-garage-detail-panel]").forEach(function (p) {
        p.classList.toggle("hidden", p.getAttribute("data-garage-detail-panel") !== target);
      });
    });
  });
})();
