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

  // Top-down rig-alignment diagram — rig frame (hatched bar), a dotted sensor rectangle down each
  // side, and a vehicle silhouette that swaps car/truck to match the real vehicle in the
  // diagnostic session (same `automechanika-vehicle-type` flag every other Cars/Trucks split in
  // this app reads), not a generic icon that reads wrong on half the vehicles this flow runs for.
  var isTrucksMode = localStorage.getItem("automechanika-vehicle-type") === "trucks";

  // Rig bar with a cross-hatch fill (a real alignment rig's clamp rail), plus the dotted sensor
  // rectangle connecting both ends down to the vehicle — same layout as the reference mockup.
  var RIG_AND_LINES =
    '<line x1="14" y1="6" x2="86" y2="6" stroke-width="2"/>' +
    '<line x1="14" y1="16" x2="86" y2="16" stroke-width="2"/>' +
    '<line x1="20" y1="6" x2="14" y2="16" stroke-width="1"/>' +
    '<line x1="32" y1="6" x2="26" y2="16" stroke-width="1"/>' +
    '<line x1="44" y1="6" x2="38" y2="16" stroke-width="1"/>' +
    '<line x1="56" y1="6" x2="50" y2="16" stroke-width="1"/>' +
    '<line x1="68" y1="6" x2="62" y2="16" stroke-width="1"/>' +
    '<line x1="80" y1="6" x2="74" y2="16" stroke-width="1"/>' +
    '<line x1="86" y1="6" x2="80" y2="16" stroke-width="1"/>' +
    '<path d="M 14,16 L 14,100 L 86,100 L 86,16" fill="none" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.7"/>';

  // Top-down car: tapered rounded nose, flared front fenders with mirrors, a pinched
  // cabin/greenhouse (roof rect + windshield/rear-window curves), flared rear fenders, rounded
  // tail — a real recognizable top-down car outline, not a pill.
  var CAR_SHAPE =
    '<path d="M 50,14 C 41,14 35,18 33,26 C 29,30 26,35 26,42 L 26,50 C 31,54 33,57 33,62 L 33,98 ' +
    'C 33,103 31,106 26,110 L 26,118 C 26,127 29,135 33,141 C 35,150 41,156 50,156 ' +
    'C 59,156 65,150 67,141 C 71,135 74,127 74,118 L 74,110 C 69,106 67,103 67,98 ' +
    'L 67,62 C 67,57 69,54 74,50 L 74,42 C 74,35 71,30 67,26 C 65,18 59,14 50,14 Z" stroke-width="2"/>' +
    '<rect x="17" y="46" width="9" height="7" rx="2.5" stroke-width="1.4"/>' +
    '<rect x="74" y="46" width="9" height="7" rx="2.5" stroke-width="1.4"/>' +
    '<path d="M 31,59 Q 50,52 69,59" stroke-width="1.3" opacity="0.7"/>' +
    '<rect x="38" y="62" width="24" height="35" rx="6" stroke-width="1.3" opacity="0.7"/>' +
    '<path d="M 31,101 Q 50,108 69,101" stroke-width="1.3" opacity="0.7"/>';

  // Top-down truck: a distinct cab (windshield + mirrors) up front, then a separate, wider
  // load bed/box behind it with panel lines — clearly different from the car's single body.
  var TRUCK_SHAPE =
    '<path d="M 50,10 C 42,10 36,14 34,21 L 34,38 C 34,43 37,46 42,47 L 58,47 ' +
    'C 63,46 66,43 66,38 L 66,21 C 64,14 58,10 50,10 Z" stroke-width="2"/>' +
    '<rect x="24" y="22" width="9" height="7" rx="2.5" stroke-width="1.4"/>' +
    '<rect x="67" y="22" width="9" height="7" rx="2.5" stroke-width="1.4"/>' +
    '<path d="M 37,30 Q 50,25 63,30" stroke-width="1.3" opacity="0.7"/>' +
    '<rect x="27" y="53" width="46" height="103" rx="5" stroke-width="2"/>' +
    '<line x1="27" y1="53" x2="73" y2="53" stroke-width="1.2" opacity="0.5"/>' +
    '<line x1="27" y1="82" x2="73" y2="82" stroke-width="1" opacity="0.3"/>' +
    '<line x1="27" y1="111" x2="73" y2="111" stroke-width="1" opacity="0.3"/>' +
    '<line x1="27" y1="140" x2="73" y2="140" stroke-width="1" opacity="0.3"/>';

  var vehicleDiagramEl = dialog.querySelector("[data-adas-rig-vehicle-diagram]");
  if (vehicleDiagramEl) {
    vehicleDiagramEl.innerHTML = '<svg viewBox="0 0 100 165" class="w-28 h-44" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      RIG_AND_LINES + (isTrucksMode ? TRUCK_SHAPE : CAR_SHAPE) + '</svg>';
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
  // confirm the rig is still square, capture the target from the camera, compute the offset, then
  // write it to the ECU.
  var STEPS = [
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
