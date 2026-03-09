/**
 * Scan VIN modal: three states (wait for capture → VIN + decoding → decoded vehicle), then redirect to diagnostics-dashboard.
 * Trigger: #scan-vin-trigger (e.g. USE CAMERA card on Quick Connect).
 * Mock flow: delays and random vehicle data; SELECT MANUALLY sends to vehicle-selection.
 */
(function () {
  var DIALOG_ID = "scan-vin-dialog";
  var TRIGGER_ID = "scan-vin-trigger";

  var VEHICLE_DATABASE = [
    { brand: "Volkswagen", brandSlug: "volkswagen", models: ["Golf", "Passat", "Tiguan", "Touareg", "Polo", "T-Roc", "Arteon"] },
    { brand: "Audi", brandSlug: "audi", models: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "Q8", "e-tron"] },
    { brand: "BMW", brandSlug: "bmw", models: ["3 Series", "5 Series", "X3", "X5", "X7", "1 Series", "4 Series"] },
    { brand: "Toyota", brandSlug: "toyota", models: ["Corolla", "Camry", "RAV4", "Land Cruiser", "Yaris", "C-HR", "Highlander"] },
    { brand: "Ford", brandSlug: "ford", models: ["Focus", "Fiesta", "Kuga", "Puma", "Mustang", "Explorer", "Ranger"] },
    { brand: "Skoda", brandSlug: "skoda", models: ["Octavia", "Superb", "Kodiaq", "Karoq", "Fabia", "Scala", "Kamiq"] },
    { brand: "Peugeot", brandSlug: "peugeot", models: ["208", "308", "3008", "5008", "508", "2008", "Partner"] },
    { brand: "Hyundai", brandSlug: "hyundai", models: ["i30", "Tucson", "Kona", "Santa Fe", "i20", "Ioniq", "Bayon"] },
    { brand: "Kia", brandSlug: "kia", models: ["Sportage", "Ceed", "Niro", "Sorento", "Stonic", "Rio", "EV6"] },
    { brand: "Volvo", brandSlug: "volvo", models: ["XC40", "XC60", "XC90", "V60", "V90", "S60", "S90"] },
    { brand: "Honda", brandSlug: "honda", models: ["Civic", "CR-V", "HR-V", "Jazz", "Accord", "e:Ny1", "ZR-V"] },
    { brand: "Nissan", brandSlug: "nissan", models: ["Qashqai", "Juke", "X-Trail", "Leaf", "Micra", "Ariya", "Navara"] }
  ];

  function generateRandomVIN() {
    var chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
    var vin = "";
    for (var i = 0; i < 17; i++) {
      vin += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return vin;
  }

  function generateRandomVehicle() {
    var brandData = VEHICLE_DATABASE[Math.floor(Math.random() * VEHICLE_DATABASE.length)];
    var model = brandData.models[Math.floor(Math.random() * brandData.models.length)];
    var currentYear = new Date().getFullYear();
    var year = currentYear - Math.floor(Math.random() * 10);
    var engines = ["1.0 TSI", "1.4 TSI", "1.5 TSI", "2.0 TSI", "2.0 TDI", "1.6 TDI", "2.5 Hybrid", "EV"];
    var engine = engines[Math.floor(Math.random() * engines.length)];
    return {
      brand: brandData.brand,
      brandSlug: brandData.brandSlug,
      model: model,
      year: String(year),
      engine: engine,
      vin: generateRandomVIN()
    };
  }

  var currentVehicle = null;
  var dialog;
  var progressFill;
  var statusEl;
  var vinDisplayEl;
  var decodedVehicleEl;
  var state1El;
  var state2El;
  var state3El;
  var basePath;
  var timeouts = [];
  var devControlsEl;
  var isDevMode;

  function clearTimeouts() {
    timeouts.forEach(function (t) { clearTimeout(t); });
    timeouts = [];
  }

  function showState(stateNum) {
    state1El.classList.toggle("hidden", stateNum !== 1);
    state2El.classList.toggle("hidden", stateNum !== 2);
    state3El.classList.toggle("hidden", stateNum !== 3);
  }

  function setProgress(pct, durationMs) {
    if (!progressFill) return;
    progressFill.style.transitionDuration = (durationMs / 1000) + "s";
    progressFill.style.width = pct + "%";
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function goToState(n) {
    clearTimeouts();
    showState(n);
    if (n === 2) {
      setProgress(0, 0);
      setStatus("Decoding...");
      if (vinDisplayEl && currentVehicle) vinDisplayEl.textContent = currentVehicle.vin;
    } else if (n === 1) {
      setProgress(0, 0);
      if (vinDisplayEl) vinDisplayEl.textContent = "";
    } else if (n === 3 && decodedVehicleEl && currentVehicle) {
      decodedVehicleEl.textContent = [currentVehicle.brand, currentVehicle.model, currentVehicle.year, currentVehicle.engine].join(" · ");
    }
  }

  function closeAndReset() {
    clearTimeouts();
    if (dialog) dialog.close();
    showState(1);
    setProgress(0, 0);
    setStatus("Decoding...");
    if (vinDisplayEl) vinDisplayEl.textContent = "";
    if (decodedVehicleEl) decodedVehicleEl.textContent = "";
    currentVehicle = null;
  }

  function redirect(path) {
    var base = (dialog && dialog.getAttribute("data-base-path")) || "/";
    var normalized = base.replace(/\/?$/, "") + (path.indexOf("/") === 0 ? path : "/" + path);
    window.location.href = normalized;
  }

  /** Runs state 2 → state 3 → redirect. Requires currentVehicle set and state 2 visible. */
  function runDecodeAndRedirect() {
    setProgress(0, 0);
    setStatus("Decoding...");
    if (vinDisplayEl && currentVehicle) vinDisplayEl.textContent = currentVehicle.vin;

    timeouts.push(setTimeout(function () {
      setProgress(100, 2000);
      setStatus("Done");
    }, 100));

    timeouts.push(setTimeout(function () {
      showState(3);
      if (decodedVehicleEl && currentVehicle) {
        decodedVehicleEl.textContent = [currentVehicle.brand, currentVehicle.model, currentVehicle.year, currentVehicle.engine].join(" · ");
      }
      timeouts.push(setTimeout(function () {
        var params = new URLSearchParams();
        params.set("vin", currentVehicle.vin);
        params.set("brand", currentVehicle.brand);
        params.set("brandSlug", currentVehicle.brandSlug);
        params.set("model", currentVehicle.model);
        params.set("year", currentVehicle.year);
        if (currentVehicle.engine) params.set("engine", currentVehicle.engine);
        closeAndReset();
        redirect("launchpad-1/diagnostics-dashboard/?" + params.toString());
      }, 1500));
    }, 2500));
  }

  function runFlow() {
    if (isDevMode) {
      goToState(1);
      return;
    }
    currentVehicle = generateRandomVehicle();
    clearTimeouts();
    showState(1);

    // State 1 → State 2 after ~3.5s
    timeouts.push(setTimeout(function () {
      showState(2);
      runDecodeAndRedirect();
    }, 3500));
  }

  function init() {
    dialog = document.getElementById(DIALOG_ID);
    if (!dialog) return;

    basePath = (dialog.getAttribute("data-base-path") || "/").replace(/\/?$/, "/");
    progressFill = document.getElementById("scan-vin-progress-fill");
    statusEl = document.getElementById("scan-vin-status");
    vinDisplayEl = document.getElementById("scan-vin-display-vin");
    decodedVehicleEl = document.getElementById("scan-vin-decoded-vehicle");
    state1El = document.getElementById("scan-vin-state-1");
    state2El = document.getElementById("scan-vin-state-2");
    state3El = document.getElementById("scan-vin-state-3");
    devControlsEl = document.getElementById("scan-vin-dev-controls");
    isDevMode = typeof URLSearchParams !== "undefined" && new URLSearchParams(window.location.search).get("modal-dev") === "1";
    if (devControlsEl && isDevMode) devControlsEl.classList.remove("hidden");

    var trigger = document.getElementById(TRIGGER_ID);
    if (trigger) {
      trigger.addEventListener("click", function () {
        dialog.showModal();
        runFlow();
      });
    }

    dialog.addEventListener("cancel", closeAndReset);
    dialog.addEventListener("close", closeAndReset);

    [].forEach.call(document.querySelectorAll("[data-scan-vin-cancel]"), function (btn) {
      btn.addEventListener("click", function () {
        closeAndReset();
        dialog.close();
      });
    });

    var manualBtn = document.getElementById("scan-vin-manual");
    if (manualBtn) {
      manualBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closeAndReset();
        dialog.close();
        redirect("launchpad-1/vehicle-selection/");
      });
    }

    [].forEach.call(document.querySelectorAll("[data-scan-vin-dev-state]"), function (btn) {
      btn.addEventListener("click", function () {
        var n = parseInt(btn.getAttribute("data-scan-vin-dev-state"), 10);
        if (n === 2 && !currentVehicle) currentVehicle = generateRandomVehicle();
        if (n === 3 && !currentVehicle) currentVehicle = generateRandomVehicle();
        goToState(n);
      });
    });

    /**
     * Public entry point: open Scan VIN modal at state 2 with the given VIN (e.g. from hero input).
     * @param {string} vinString - 17-character VIN (will be normalised to uppercase).
     */
    window.runScanVinFromVin = function (vinString) {
      if (!dialog || !vinDisplayEl) return;
      var raw = (vinString || "").trim().toUpperCase().replace(/\s/g, "");
      var normalized = raw.length === 17 ? raw : raw.slice(0, 17);
      if (normalized.length !== 17) return;
      currentVehicle = generateRandomVehicle();
      currentVehicle.vin = normalized;
      clearTimeouts();
      dialog.showModal();
      showState(2);
      runDecodeAndRedirect();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
