// ADAS Calibration trigger — see adas-calibration-modal.njk's header comment for the full
// contract (rig config/alignment happen inline here, not in Settings).
(function () {
  var dialog = document.getElementById("adas-calibration-dialog");
  if (!dialog) return;

  var STATE_IDS = ["config", "align", "confirm", "progress", "result"];
  var stateEls = {};
  STATE_IDS.forEach(function (s) { stateEls[s] = document.getElementById("adas-calibration-state-" + s); });

  var typeInput = document.getElementById("adas-calibration-rig-type-input");
  var serialInput = document.getElementById("adas-calibration-rig-serial-input");
  var configContinueBtn = document.getElementById("adas-calibration-config-continue");

  var alignSuccessEl = dialog.querySelector("[data-adas-rig-align-success]");
  var alignContinueBtn = document.getElementById("adas-calibration-align-continue");
  var alignRigLabelEl = document.getElementById("adas-calibration-align-rig-label");
  var changeRigBtns = Array.prototype.slice.call(document.querySelectorAll("[data-adas-calibration-change-rig]"));

  // Top-down rig-alignment diagram (rig frame + sensor rails + vehicle silhouette) swaps car/truck
  // to match the real vehicle in the diagnostic session (same `automechanika-vehicle-type` flag
  // every other Cars/Trucks split in this app reads), not a generic icon that reads wrong on half
  // the vehicles this flow runs for. Both diagrams are server-rendered inline (see
  // adas-calibration-modal.njk's `inlineSvg` of _includes/graphics/adas/rig-{car,truck}.svg,
  // currentColor paths) — this just toggles which one is visible instead of building SVG markup
  // at runtime.
  var isTrucksMode = localStorage.getItem("automechanika-vehicle-type") === "trucks";
  var vehicleDiagramEl = dialog.querySelector("[data-adas-rig-vehicle-diagram]");
  if (vehicleDiagramEl) {
    vehicleDiagramEl.querySelectorAll("[data-adas-rig-diagram]").forEach(function (el) {
      var matches = el.getAttribute("data-adas-rig-diagram") === (isTrucksMode ? "truck" : "car");
      el.classList.toggle("hidden", !matches);
    });
  }

  var titleEl = document.getElementById("adas-calibration-title");
  var descEl = document.getElementById("adas-calibration-description");
  var rigTypeEl = document.getElementById("adas-calibration-rig-type");
  var rigSerialEl = document.getElementById("adas-calibration-rig-serial");
  var startBtn = document.getElementById("adas-calibration-start");
  var progressStatusEl = document.getElementById("adas-calibration-progress-status");
  var resultTextEl = document.getElementById("adas-calibration-result-text");
  var cancelBtns = Array.prototype.slice.call(document.querySelectorAll("[data-adas-calibration-cancel]"));

  var RIG_KEY = "automechanika-adas-rig";
  var ALIGNED_KEY = "automechanika-adas-rig-aligned";

  function readRig() {
    try { return JSON.parse(localStorage.getItem(RIG_KEY) || "null"); } catch (e) { return null; }
  }
  function isAligned() {
    return !!localStorage.getItem(ALIGNED_KEY);
  }
  function showState(name) {
    STATE_IDS.forEach(function (s) { if (stateEls[s]) stateEls[s].classList.toggle("hidden", s !== name); });
  }

  var currentFn = null;

  function goToConfirm() {
    var rig = readRig();
    if (titleEl) titleEl.textContent = "This will start " + (currentFn.title || currentFn.label);
    if (descEl) descEl.textContent = currentFn.description || "";
    if (rigTypeEl) rigTypeEl.textContent = rig.type;
    if (rigSerialEl) rigSerialEl.textContent = rig.serial;
    showState("confirm");
  }

  function goToAlign() {
    var rig = readRig();
    if (alignRigLabelEl) alignRigLabelEl.textContent = rig ? (rig.type + ' · Serial ' + rig.serial) : '';
    resetAlignState();
    showState("align");
  }

  // Clears the saved rig entirely and reopens config — the only way to correct or remove a
  // type/serial once entered, otherwise it's stuck for the rest of the session.
  function resetRig() {
    localStorage.removeItem(RIG_KEY);
    localStorage.removeItem(ALIGNED_KEY);
    if (typeInput) typeInput.value = "ACS Cars";
    if (serialInput) serialInput.value = "";
    refreshConfigContinue();
    showState("config");
  }
  changeRigBtns.forEach(function (btn) { btn.addEventListener("click", resetRig); });

  // ===== Config step (only shown if no rig saved yet) =====
  function refreshConfigContinue() {
    if (configContinueBtn) configContinueBtn.disabled = !(typeInput.value && serialInput.value.trim());
  }
  if (typeInput && serialInput) {
    typeInput.addEventListener("change", refreshConfigContinue);
    serialInput.addEventListener("input", refreshConfigContinue);
  }
  if (configContinueBtn) {
    configContinueBtn.addEventListener("click", function () {
      localStorage.setItem(RIG_KEY, JSON.stringify({ type: typeInput.value, serial: serialInput.value.trim() }));
      // A newly (re)configured rig hasn't been aligned yet, even if an old alignment happens to
      // still be stored — it belonged to whatever was configured before.
      localStorage.removeItem(ALIGNED_KEY);
      goToAlign();
    });
  }

  // ===== Align step (shown if rig is configured but not aligned) =====
  var connected = { left: false, right: false };

  function randomReading() {
    return 1450 + Math.floor(Math.random() * 150);
  }

  function resetAlignState() {
    connected = { left: false, right: false };
    dialog.querySelectorAll("[data-adas-rig-connect]").forEach(function (btn) {
      btn.disabled = false;
      btn.classList.remove("btn-success", "text-white");
      btn.classList.add("btn-outline");
    });
    dialog.querySelectorAll("[data-adas-rig-sensor-value]").forEach(function (el) { el.textContent = "—"; });
    if (alignSuccessEl) alignSuccessEl.classList.add("hidden");
    if (alignContinueBtn) alignContinueBtn.classList.add("hidden");
  }

  function connectSensor(side, btn, valueEl) {
    if (connected[side] || btn.disabled) return;
    btn.disabled = true;
    valueEl.textContent = "Connecting…";
    setTimeout(function () {
      valueEl.textContent = randomReading() + " mm";
      btn.classList.remove("btn-outline");
      btn.classList.add("btn-success", "text-white");
      connected[side] = true;
      if (connected.left && connected.right) {
        if (alignSuccessEl) alignSuccessEl.classList.remove("hidden");
        localStorage.setItem(ALIGNED_KEY, JSON.stringify({ timestamp: new Date().toISOString() }));
        if (alignContinueBtn) alignContinueBtn.classList.remove("hidden");
      }
    }, 900 + Math.random() * 600);
  }

  dialog.querySelectorAll("[data-adas-rig-connect]").forEach(function (btn) {
    var side = btn.getAttribute("data-adas-rig-connect");
    var valueEl = dialog.querySelector('[data-adas-rig-sensor-value="' + side + '"]');
    btn.addEventListener("click", function () { connectSensor(side, btn, valueEl); });
  });
  if (alignContinueBtn) alignContinueBtn.addEventListener("click", goToConfirm);

  // ===== Confirm -> progress -> result =====
  // Simulated calibration phases — no real reference recording behind these names/counts (unlike
  // battery-soh-modal's), but grounded in what a real target-based ADAS calibration actually does:
  // re-establish the communication protocol with the rig, confirm it's still square, capture the
  // target from the camera, compute the offset, then write it to the ECU. The opening "Connecting"
  // step (added per a real mechanic's feedback) matches every other Function's dialog — see
  // ecu-detail.js's openFunctionDialog.
  var STEPS = [
    { label: "Connecting to rig", count: 0 },
    { label: "Verifying rig alignment", count: 0 },
    { label: "Capturing target image", count: 5 },
    { label: "Computing calibration offset", count: 0 },
    { label: "Writing calibration to ECU", count: 0 }
  ];
  var TICK_MS = 260;
  var PHASE_MS = 900;
  var progressTimers = [];

  function clearProgressTimers() {
    progressTimers.forEach(function (t) { clearTimeout(t); });
    progressTimers = [];
  }

  function runProgress(onDone) {
    clearProgressTimers();
    var elapsed = 0;
    STEPS.forEach(function (step) {
      if (step.count === 0) {
        progressTimers.push(setTimeout(function () {
          if (progressStatusEl) progressStatusEl.textContent = step.label;
        }, elapsed));
        elapsed += PHASE_MS;
        return;
      }
      for (var i = 1; i <= step.count; i++) {
        (function (n) {
          progressTimers.push(setTimeout(function () {
            if (progressStatusEl) progressStatusEl.textContent = step.label + " (" + n + "/" + step.count + ")";
          }, elapsed));
        })(i);
        elapsed += TICK_MS;
      }
    });
    progressTimers.push(setTimeout(onDone, elapsed + 400));
  }

  // Logged once progress genuinely completes, same "log real outcomes, not intent" convention as
  // battery-soh-modal.js/runVehicleTask elsewhere in this app.
  function logResult(fn) {
    if (!window.AutocomLiveSession) return;
    var vehicleId = new URLSearchParams(window.location.search).get("vehicleId");
    if (!vehicleId) return;
    window.AutocomLiveSession.append(vehicleId, { icon: "crosshair", label: fn.title || fn.label, tone: "success", value: "Calibrated" });
    if (typeof window.refreshCurrentSessionBadgeFromLiveSession === "function") window.refreshCurrentSessionBadgeFromLiveSession();
  }

  window.openAdasCalibrationModal = function (fn) {
    currentFn = fn;
    var rig = readRig();
    if (!rig || !rig.type || !rig.serial) {
      if (typeInput) typeInput.value = "ACS Cars";
      if (serialInput) serialInput.value = "";
      refreshConfigContinue();
      showState("config");
    } else if (!isAligned()) {
      goToAlign();
    } else {
      goToConfirm();
    }
    dialog.showModal();
  };

  if (startBtn) {
    startBtn.addEventListener("click", function () {
      showState("progress");
      if (progressStatusEl) progressStatusEl.textContent = STEPS[0].label;
      runProgress(function () {
        logResult(currentFn);
        var deviation = (Math.random() * 0.4).toFixed(2);
        if (resultTextEl) resultTextEl.textContent = (currentFn.title || currentFn.label) + " aligned within tolerance (offset " + deviation + "° against a ±0.5° limit).";
        showState("result");
      });
    });
  }

  cancelBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      dialog.close();
    });
  });

  dialog.addEventListener("close", function () {
    clearProgressTimers();
  });

  // Belt-and-suspenders: bfcache restore shouldn't leave this frozen mid-progress — same guard
  // battery-soh-modal.js uses.
  window.addEventListener("pageshow", function (event) {
    if (event.persisted && dialog.open) {
      dialog.close();
    }
  });
})();
