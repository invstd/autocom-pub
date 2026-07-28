(function () {
  "use strict";
  var dialog = document.getElementById("battery-soh-dialog");
  if (!dialog) return;

  var state1 = document.getElementById("battery-soh-state-1");
  var state2 = document.getElementById("battery-soh-state-2");
  var state3 = document.getElementById("battery-soh-state-3");
  var continueBtn = document.getElementById("battery-soh-continue");
  var cancelBtn = document.querySelector("[data-battery-soh-cancel]");
  var checkRows = Array.prototype.slice.call(document.querySelectorAll("[data-battery-soh-check]"));
  var reportEV = document.getElementById("battery-soh-report-ev");
  var reportICE = document.getElementById("battery-soh-report-ice");
  var measuringStatusEl = document.getElementById("battery-soh-measuring-status");
  var measuringFillEl = document.getElementById("battery-soh-measuring-fill");

  // What the BMS actually reads differs by vehicle type: 12V systems get a cranking/
  // resistance check, EV/hybrid packs get per-cell voltage + thermal checks. Last step
  // in both is a DTC check (a real BMS logs codes for dying cells, bad sensors, or CAN
  // bus comms faults).
  var MEASURING_STEPS = {
    ice: [
      "Reading battery voltage...",
      "Testing cold-cranking performance...",
      "Measuring internal resistance...",
      "Checking for stored DTCs..."
    ],
    ev: [
      "Reading individual cell voltages...",
      "Checking cell balance...",
      "Verifying cooling system operation...",
      "Checking for stored DTCs..."
    ]
  };

  var checkTimers = [];
  var measuringTimers = [];
  var gaugeFrame = null;

  function showState(n) {
    state1.classList.toggle("hidden", n !== 1);
    state2.classList.toggle("hidden", n !== 2);
    state3.classList.toggle("hidden", n !== 3);
  }

  // The engine type isn't known at build time — it's set on the URL by vehicle-selection
  // (from the brand/model JSON's engine_types, e.g. "Petrol", "Electric", "Plug-in Hybrid")
  // once a real vehicle is picked. No param (e.g. navigating here directly) falls back to
  // the combustion variant.
  function activeVariant() {
    var engine = new URLSearchParams(window.location.search).get("engine") || "";
    return /electric|hybrid/i.test(engine) ? "ev" : "ice";
  }

  function showReportVariant(variant) {
    if (reportEV) reportEV.classList.toggle("hidden", variant !== "ev");
    if (reportICE) reportICE.classList.toggle("hidden", variant !== "ice");
  }

  // Reset the checklist to "checking..." (spinners, no badges, Continue disabled) so it
  // replays convincingly every time the modal is (re)opened rather than showing stale results.
  function resetChecklist() {
    checkTimers.forEach(function (t) { clearTimeout(t); });
    checkTimers = [];
    if (continueBtn) continueBtn.disabled = true;
    checkRows.forEach(function (row) {
      var pending = row.querySelector("[data-check-pending]");
      var result = row.querySelector("[data-check-result]");
      if (pending) pending.classList.remove("hidden");
      if (result) {
        result.classList.add("hidden");
        result.classList.remove("battery-soh-check-in");
      }
    });
  }

  function runChecklist() {
    checkRows.forEach(function (row, i) {
      var t = setTimeout(function () {
        var pending = row.querySelector("[data-check-pending]");
        var result = row.querySelector("[data-check-result]");
        if (pending) pending.classList.add("hidden");
        if (result) {
          result.classList.remove("hidden");
          result.classList.add("battery-soh-check-in");
        }
      }, 500 + i * 450);
      checkTimers.push(t);
    });
    checkTimers.push(setTimeout(function () {
      if (continueBtn) continueBtn.disabled = false;
    }, 500 + checkRows.length * 450));
  }

  // Steps through the "reading the battery" status messages + progress bar for the given
  // vehicle-type variant, then calls onDone once the last step lands.
  function runMeasuring(variant, onDone) {
    measuringTimers.forEach(function (t) { clearTimeout(t); });
    measuringTimers = [];
    var steps = MEASURING_STEPS[variant] || MEASURING_STEPS.ice;
    var stepProgress = [25, 55, 80, 100];
    var stepDuration = 1300; // 4 steps + trailing buffer ≈ 6s total — long enough to read like a live check, short enough for a demo
    if (measuringFillEl) measuringFillEl.style.width = "0%";
    if (measuringStatusEl) measuringStatusEl.textContent = steps[0];
    steps.forEach(function (label, i) {
      var t = setTimeout(function () {
        if (measuringStatusEl) measuringStatusEl.textContent = label;
        if (measuringFillEl) measuringFillEl.style.width = stepProgress[i] + "%";
      }, i * stepDuration);
      measuringTimers.push(t);
    });
    measuringTimers.push(setTimeout(onDone, steps.length * stepDuration + 800));
  }

  // Keep the modal's VIN in sync with whatever's actually shown in the page header
  // (diagnostics-dashboard.js overwrites that from the same URL params when a vehicle
  // was really selected), instead of re-deriving it here.
  function syncVin() {
    var headerVin = document.querySelector("[data-vehicle-vin]");
    var vinText = headerVin && headerVin.textContent.trim();
    if (!vinText) return;
    Array.prototype.forEach.call(document.querySelectorAll("[data-battery-soh-vin]"), function (el) {
      el.textContent = vinText;
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateGauge(variant) {
    var gaugeEl = document.getElementById("battery-soh-gauge-" + variant);
    var gaugeValueEl = document.getElementById("battery-soh-gauge-value-" + variant);
    var markerEl = document.getElementById("battery-soh-marker-" + variant);
    var sohTarget = gaugeEl ? parseInt(gaugeEl.getAttribute("data-target"), 10) || 0 : 0;

    if (gaugeFrame) cancelAnimationFrame(gaugeFrame);
    if (gaugeEl) gaugeEl.style.setProperty("--value", 0);
    if (gaugeValueEl) gaugeValueEl.textContent = "0%";
    if (markerEl) {
      markerEl.style.left = "0%";
      void markerEl.offsetWidth; // force reflow so the 0% is committed before transitioning
      markerEl.style.left = sohTarget + "%";
    }
    var duration = 900;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min(1, (ts - start) / duration);
      var value = Math.round(easeOutCubic(progress) * sohTarget);
      if (gaugeEl) gaugeEl.style.setProperty("--value", value);
      if (gaugeValueEl) gaugeValueEl.textContent = value + "%";
      if (progress < 1) gaugeFrame = requestAnimationFrame(tick);
    }
    gaugeFrame = requestAnimationFrame(tick);
  }

  window.openBatterySohModal = function () {
    showState(1);
    resetChecklist();
    syncVin();
    dialog.showModal();
    runChecklist();
  };

  if (continueBtn) {
    continueBtn.addEventListener("click", function () {
      var variant = activeVariant();
      showState(2);
      runMeasuring(variant, function () {
        showState(3);
        showReportVariant(variant);
        animateGauge(variant);
      });
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      dialog.close();
    });
  }

  dialog.addEventListener("close", function () {
    measuringTimers.forEach(function (t) { clearTimeout(t); });
    measuringTimers = [];
    showState(1);
  });
})();
