/**
 * VCI Pairing and Auto-Detect modal: three sequential states with mock delays.
 * Triggers: #vci-pair-detect-trigger (index), #vehicle-connect-btn (vehicle-selection).
 * 
 * Two paths:
 * 1. Auto-detect (from index): generates random vehicle data and VIN
 * 2. Manual selection (from vehicle-selection): uses selected vehicle details
 * 
 * Both paths redirect to diagnostics-dashboard with vehicle data in URL params.
 */
(function () {
  var DIALOG_ID = "vci-pair-detect-dialog";
  var TRIGGER_ID = "vci-pair-detect-trigger";
  var VEHICLE_CONNECT_BTN_ID = "vehicle-connect-btn";

  // Random vehicle database for auto-detect
  var VEHICLE_DATABASE = [
    { brand: "Volkswagen", brandSlug: "volkswagen", models: ["Golf", "Passat", "Tiguan", "Touareg", "Polo", "T-Roc", "Arteon"] },
    { brand: "Audi", brandSlug: "audi", models: ["A3", "A4", "A6", "Q3", "Q5", "Q7", "Q8", "e-tron"] },
    { brand: "BMW", brandSlug: "bmw", models: ["3 Series", "5 Series", "X3", "X5", "X7", "1 Series", "4 Series"] },
    { brand: "Mercedes-Benz", brandSlug: "mercedes-benz", models: ["C-Class", "E-Class", "GLC", "GLE", "A-Class", "GLA", "GLB"] },
    { brand: "Toyota", brandSlug: "toyota", models: ["Corolla", "Camry", "RAV4", "Land Cruiser", "Yaris", "C-HR", "Highlander"] },
    { brand: "Ford", brandSlug: "ford", models: ["Focus", "Fiesta", "Kuga", "Puma", "Mustang", "Explorer", "Ranger"] },
    { brand: "Opel", brandSlug: "opel", models: ["Astra", "Corsa", "Insignia", "Mokka", "Crossland", "Grandland"] },
    { brand: "Skoda", brandSlug: "skoda", models: ["Octavia", "Superb", "Kodiaq", "Karoq", "Fabia", "Scala", "Kamiq"] },
    { brand: "Renault", brandSlug: "renault", models: ["Clio", "Megane", "Captur", "Kadjar", "Scenic", "Arkana", "Austral"] },
    { brand: "Peugeot", brandSlug: "peugeot", models: ["208", "308", "3008", "5008", "508", "2008", "Partner"] },
    { brand: "Hyundai", brandSlug: "hyundai", models: ["i30", "Tucson", "Kona", "Santa Fe", "i20", "Ioniq", "Bayon"] },
    { brand: "Kia", brandSlug: "kia", models: ["Sportage", "Ceed", "Niro", "Sorento", "Stonic", "Rio", "EV6"] },
    { brand: "Volvo", brandSlug: "volvo", models: ["XC40", "XC60", "XC90", "V60", "V90", "S60", "S90"] },
    { brand: "Mazda", brandSlug: "mazda", models: ["CX-5", "CX-30", "Mazda3", "Mazda6", "MX-5", "CX-60", "CX-3"] },
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
    var year = currentYear - Math.floor(Math.random() * 10); // 0-9 years old
    var engines = ["1.0 TSI", "1.4 TSI", "1.5 TSI", "2.0 TSI", "2.0 TDI", "1.6 TDI", "3.0 V6", "2.5 Hybrid", "EV"];
    var engine = engines[Math.floor(Math.random() * engines.length)];
    return {
      brand: brandData.brand,
      brandSlug: brandData.brandSlug,
      model: model,
      year: year,
      engine: engine,
      vin: generateRandomVIN()
    };
  }

  var currentVehicle = null; // Stores the vehicle data for redirect

  var dialog;
  var progressFill;
  var statusEl;
  var vinEl;
  var titleEl;
  var state1El;
  var state2El;
  var state3El;
  var state1AlertEl;
  var state1StatusEl;
  var vehicleDetailsEl;
  var manualLink;
  var manualFallbackEl;
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
    if (stateNum === 2 && manualFallbackEl) {
      var fromVehicleSelection = dialog && dialog.getAttribute("data-from-vehicle-selection") === "1";
      manualFallbackEl.classList.toggle("hidden", fromVehicleSelection);
    }
    if (stateNum === 1 || stateNum === 2 || stateNum === 3) {
      titleEl.textContent = "";
      titleEl.classList.add("hidden");
    } else {
      titleEl.classList.remove("hidden");
    }
  }

  function setProgress(pct, durationMs) {
    if (!progressFill) return;
    progressFill.style.transitionDuration = (durationMs / 1000) + "s";
    progressFill.style.width = pct + "%";
  }

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  /** Go to state n (1–3), stop auto-flow, set progress/status/vin for that state. */
  function goToState(n) {
    clearTimeouts();
    showState(n);
    if (n === 2) {
      setProgress(50, 0);
      setStatus("Scanning protocols...");
    } else if (n === 1) {
      setProgress(0, 0);
      setStatus("Initializing...");
    } else if (n === 3) {
      if (vinEl) vinEl.textContent = MOCK_VIN;
    }
  }

  function closeAndReset() {
    clearTimeouts();
    if (dialog) {
      dialog.removeAttribute("data-from-vehicle-selection");
      dialog.removeAttribute("data-vehicle-details");
      dialog.close();
    }
    showState(1);
    setProgress(0, 0);
    setStatus("Initializing...");
    if (vinEl) vinEl.textContent = "";
    if (state1AlertEl) state1AlertEl.classList.remove("hidden");
    if (state1StatusEl) state1StatusEl.textContent = "Connecting...";
    if (vehicleDetailsEl) {
      vehicleDetailsEl.classList.add("hidden");
      vehicleDetailsEl.textContent = "";
    }
  }

  function redirect(path) {
    var base = (dialog && dialog.getAttribute("data-base-path")) || "/";
    var normalized = base.replace(/\/?$/, "") + (path.indexOf("/") === 0 ? path : "/" + path);
    window.location.href = normalized;
  }

  function isOnboardingDemo() {
    return typeof sessionStorage !== "undefined" && sessionStorage.getItem("launchpad-onboarding-demo") === "1";
  }

  function setOnboardingStep(n) {
    if (typeof sessionStorage !== "undefined") sessionStorage.setItem("launchpad-onboarding-step", String(n));
  }

  function setOnboardingCompleted() {
    if (typeof localStorage !== "undefined") localStorage.setItem("launchpad-onboarding-completed", "1");
  }

  function runFlow() {
    if (isDevMode) {
      goToState(1);
      return;
    }
    var fromVehicleSelection = dialog && dialog.getAttribute("data-from-vehicle-selection") === "1";
    var vehicleDetailsJson = dialog && dialog.getAttribute("data-vehicle-details");
    var isDemo = isOnboardingDemo();

    // Determine vehicle data based on path
    if (fromVehicleSelection && vehicleDetailsJson) {
      // Path 2: Manual Selection - use the selected vehicle details
      try {
        var vd = JSON.parse(vehicleDetailsJson);
        currentVehicle = {
          brand: vd.brandLabel || "",
          brandSlug: vd.brandSlug || (vd.brandLabel || "").toLowerCase().replace(/\s+/g, "-"),
          model: vd.model || "",
          year: vd.year || "",
          engine: vd.engine || "",
          vin: generateRandomVIN() // Generate VIN for manual selection too
        };
      } catch (e) {
        currentVehicle = generateRandomVehicle();
      }
    } else {
      // Path 1: Auto-detect - generate random vehicle
      currentVehicle = generateRandomVehicle();
    }

    clearTimeouts();
    showState(1);
    setProgress(0, 0);
    setStatus("Initializing...");
    if (vinEl) vinEl.textContent = "";

    if (fromVehicleSelection) {
      if (state1AlertEl) state1AlertEl.classList.add("hidden");
      if (state1StatusEl) state1StatusEl.textContent = "Checking connection...";
    } else {
      if (state1AlertEl) state1AlertEl.classList.remove("hidden");
      if (state1StatusEl) state1StatusEl.textContent = "Connecting...";
    }

    var state1Delay = isDemo ? 400 : (fromVehicleSelection ? 1000 : 2000);

    // State 1 → State 2
    timeouts.push(setTimeout(function () {
      showState(2);
      setProgress(0, 0);
      setStatus("Initializing...");
      
      // Show vehicle details in state 2 only for Path 2 (manual selection). Path 1 (auto-detect) does not have brand/model/year until VIN is read and decoded in state 3.
      if (fromVehicleSelection && vehicleDetailsEl && currentVehicle) {
        var parts = [currentVehicle.brand, currentVehicle.model, currentVehicle.year, currentVehicle.engine].filter(Boolean);
        if (parts.length) {
          vehicleDetailsEl.textContent = parts.join(" · ");
          vehicleDetailsEl.classList.remove("hidden");
        }
      } else if (vehicleDetailsEl) {
        vehicleDetailsEl.classList.add("hidden");
        vehicleDetailsEl.textContent = "";
      }

      if (isDemo) {
        setProgress(100, 400);
        setStatus("Requesting Vehicle Data...");
        timeouts.push(setTimeout(function () {
          showState(3);
          if (vinEl) vinEl.textContent = currentVehicle.vin;
          timeouts.push(setTimeout(function () {
            setOnboardingStep(1);
            var vehicleParams = new URLSearchParams();
            vehicleParams.set("vin", currentVehicle.vin);
            vehicleParams.set("brand", currentVehicle.brand);
            vehicleParams.set("brandSlug", currentVehicle.brandSlug);
            vehicleParams.set("model", currentVehicle.model);
            vehicleParams.set("year", currentVehicle.year);
            if (currentVehicle.engine) vehicleParams.set("engine", currentVehicle.engine);
            closeAndReset();
            redirect("launchpad-1/diagnostics-dashboard/?" + vehicleParams.toString());
          }, 500));
        }, 800));
      } else {
      // Step-wise progress with easing: 0→25% (2s), 25→75% (4s), 75→100% (2s)
      timeouts.push(setTimeout(function () {
        setProgress(25, 2000);
      }, 0));
      timeouts.push(setTimeout(function () {
        setStatus("Scanning protocols...");
        setProgress(75, 4000);
      }, 2000));
      timeouts.push(setTimeout(function () {
        setStatus("Requesting Vehicle Data...");
        setProgress(100, 2000);
      }, 6000));

      // State 2 → State 3 after 8s
      timeouts.push(setTimeout(function () {
        showState(3);
        if (vinEl) vinEl.textContent = currentVehicle.vin;

        // State 3: hold 1.5s then close and go to diagnostics-dashboard
        timeouts.push(setTimeout(function () {
          var vehicleParams = new URLSearchParams();
          vehicleParams.set("vin", currentVehicle.vin);
          vehicleParams.set("brand", currentVehicle.brand);
          vehicleParams.set("brandSlug", currentVehicle.brandSlug);
          vehicleParams.set("model", currentVehicle.model);
          vehicleParams.set("year", currentVehicle.year);
          if (currentVehicle.engine) vehicleParams.set("engine", currentVehicle.engine);
          closeAndReset();
          redirect("launchpad-1/diagnostics-dashboard/?" + vehicleParams.toString());
        }, 1500));
      }, 8000));
      }
    }, state1Delay));
  }

  function init() {
    dialog = document.getElementById(DIALOG_ID);
    if (!dialog) return;

    basePath = dialog.getAttribute("data-base-path") || "/";
    progressFill = document.getElementById("vci-modal-progress-fill");
    statusEl = document.getElementById("vci-modal-status");
    vinEl = document.getElementById("vci-modal-vin");
    titleEl = document.getElementById("vci-modal-title");
    state1El = document.getElementById("vci-modal-state-1");
    state2El = document.getElementById("vci-modal-state-2");
    state3El = document.getElementById("vci-modal-state-3");
    state1AlertEl = document.getElementById("vci-modal-state-1-alert");
    state1StatusEl = document.getElementById("vci-modal-state-1-status");
    vehicleDetailsEl = document.getElementById("vci-modal-vehicle-details");
    manualLink = document.getElementById("vci-modal-manual");
    manualFallbackEl = document.getElementById("vci-modal-state-2-manual-fallback");
    devControlsEl = document.getElementById("vci-modal-dev-controls");
    isDevMode = typeof URLSearchParams !== "undefined" && new URLSearchParams(window.location.search).get("modal-dev") === "1";
    if (devControlsEl && isDevMode) devControlsEl.classList.remove("hidden");

    function openAndRunFlow(fromVehicleSelection, vehicleDetails) {
      if (fromVehicleSelection) {
        dialog.setAttribute("data-from-vehicle-selection", "1");
        if (vehicleDetails) dialog.setAttribute("data-vehicle-details", JSON.stringify(vehicleDetails));
      } else {
        dialog.removeAttribute("data-from-vehicle-selection");
        dialog.removeAttribute("data-vehicle-details");
      }
      dialog.showModal();
      runFlow();
    }

    var trigger = document.getElementById(TRIGGER_ID);
    if (trigger) {
      trigger.addEventListener("click", function () {
        openAndRunFlow(false);
      });
    }

    var vehicleConnectBtn = document.getElementById(VEHICLE_CONNECT_BTN_ID);
    if (vehicleConnectBtn) {
      vehicleConnectBtn.addEventListener("click", function () {
        var params = new URLSearchParams(window.location.search);
        var brandSlug = params.get("brand") || "";
        var brandLabel = "";
        if (typeof window.__vehicleSelectionBrands !== "undefined" && Array.isArray(window.__vehicleSelectionBrands)) {
          var opt = window.__vehicleSelectionBrands.find(function (o) { return o.value === brandSlug; });
          if (opt) brandLabel = opt.label || "";
        }
        function getChipLabel(triggerId) {
          var t = document.getElementById(triggerId);
          var w = t && t.closest && t.closest(".filter-select");
          var chip = w && w.querySelector(".filter-select-chip-label");
          return chip ? (chip.textContent || "").trim() : "";
        }
        var model = getChipLabel("vehicle-model-trigger");
        var year = getChipLabel("vehicle-year-trigger");
        var engine = getChipLabel("vehicle-engine-trigger");
        openAndRunFlow(true, { brandLabel: brandLabel, brandSlug: brandSlug, model: model, year: year, engine: engine });
      });
    }

    dialog.addEventListener("cancel", closeAndReset);
    dialog.addEventListener("close", closeAndReset);

    [].forEach.call(document.querySelectorAll("[data-vci-modal-cancel]"), function (btn) {
      btn.addEventListener("click", function () {
        closeAndReset();
        dialog.close();
      });
    });

    if (manualLink) {
      manualLink.addEventListener("click", function (e) {
        e.preventDefault();
        closeAndReset();
        dialog.close();
        redirect("launchpad-1/vehicle-selection/");
      });
    }

    [].forEach.call(document.querySelectorAll("[data-vci-dev-state]"), function (btn) {
      btn.addEventListener("click", function () {
        goToState(parseInt(btn.getAttribute("data-vci-dev-state"), 10));
      });
    });
    var prevBtn = document.querySelector("[data-vci-dev-prev]");
    var nextBtn = document.querySelector("[data-vci-dev-next]");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        var current = state1El.classList.contains("hidden") ? (state2El.classList.contains("hidden") ? 3 : 2) : 1;
        goToState(current > 1 ? current - 1 : 3);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var current = state1El.classList.contains("hidden") ? (state2El.classList.contains("hidden") ? 3 : 2) : 1;
        goToState(current < 3 ? current + 1 : 1);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
