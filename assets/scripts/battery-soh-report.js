(function () {
  "use strict";
  var root = document.querySelector("[data-battery-soh-report]");
  if (!root) return;

  var params = new URLSearchParams(window.location.search);
  var vin = params.get("vin") || "";
  var brand = params.get("brand") || "";
  var model = params.get("model") || "";
  var year = params.get("year") || "";
  var engine = params.get("engine") || "";
  var variant = /electric|hybrid/i.test(engine) ? "ev" : "ice";

  // `scope` matters: both the ev and ice variant blocks share field names (health-percent,
  // health-banner, health-note) since only one is ever visible at a time — but a plain
  // document-wide querySelector always finds the ev block's copy first regardless of which
  // variant is actually active, silently writing into a hidden element. Every call below scopes
  // to the active variant's own root; only the shared vehicle/test-info fields (unique names,
  // outside either variant block) use the page root.
  function setText(scope, field, value) {
    var el = scope.querySelector('[data-field="' + field + '"]');
    if (el) el.textContent = value;
  }

  function healthCategory(percent) {
    if (percent >= 80) return { label: "Good", tone: "success", note: "A battery health reading of over 80% suggests a battery of acceptable capacity. As always, check the OEM specifications, as this can differ between models and years." };
    if (percent >= 50) return { label: "Fair", tone: "warning", note: "50–80% — expect reduced range/reserve; recheck at the next service." };
    return { label: "Poor", tone: "error", note: "Below 50% — significantly degraded capacity, likely affecting range and performance." };
  }

  function applyBanner(scope, bannerField, category) {
    var el = scope.querySelector('[data-field="' + bannerField + '"]');
    if (!el) return;
    el.textContent = category.label;
    el.className = "px-4 py-2 text-center text-sm font-semibold bg-" + category.tone + " text-" + category.tone + "-content";
  }

  // Populates and opens the AI Assist dialog for one fault code — content shape matches what
  // Vedran's research actually returned (a two-part action plan: try-this-first, then a real
  // recall/warranty escalation), not a generic single-cause/single-step template.
  function openAiAssist(code, ai) {
    var dialog = document.getElementById("bms-ai-assist-dialog");
    if (!dialog) return;

    setText(dialog, "ai-assist-heading", code + " — " + ai.title);
    setText(dialog, "ai-assist-summary", ai.summary);

    var causeIntroEl = dialog.querySelector("[data-ai-assist-cause-intro]");
    if (causeIntroEl) causeIntroEl.textContent = ai.causeIntro || "";

    var causePointsEl = dialog.querySelector("[data-ai-assist-cause-points]");
    if (causePointsEl) {
      causePointsEl.innerHTML = (ai.causePoints || []).map(function (p) {
        return '<div class="text-sm text-base-content/80"><span class="font-medium text-base-content">' + p.label + ":</span> " + p.text + "</div>";
      }).join("");
    }

    var safetyWrap = dialog.querySelector("[data-ai-assist-safety-wrap]");
    var safetyEl = dialog.querySelector("[data-ai-assist-safety]");
    if (safetyWrap && safetyEl) {
      if (ai.safetyNote) {
        safetyEl.textContent = ai.safetyNote;
        safetyWrap.classList.remove("hidden");
      } else {
        safetyWrap.classList.add("hidden");
      }
    }

    var symptomsEl = dialog.querySelector("[data-ai-assist-symptoms]");
    if (symptomsEl) {
      symptomsEl.innerHTML = (ai.symptoms || []).map(function (s) { return "<li>" + s + "</li>"; }).join("");
    }

    var actionsEl = dialog.querySelector("[data-ai-assist-actions]");
    if (actionsEl) {
      actionsEl.innerHTML = (ai.actions || []).map(function (action) {
        var tag = action.type === "unordered" ? "ul" : "ol";
        var listClass = action.type === "unordered" ? "list-disc" : "list-decimal";
        var items = action.items.map(function (item) { return "<li>" + item + "</li>"; }).join("");
        return (
          '<div>' +
            '<p class="text-sm font-semibold text-base-content mb-1">' + action.title + "</p>" +
            (action.intro ? '<p class="text-sm text-base-content/70 mb-2">' + action.intro + "</p>" : "") +
            '<' + tag + ' class="' + listClass + ' list-inside text-sm text-base-content/80 flex flex-col gap-1">' + items + "</" + tag + ">" +
          "</div>"
        );
      }).join("");
    }

    dialog.showModal();
  }

  // ----- Vehicle / Test information (shared by both variants) -----
  setText(root, "brand-model", [brand, model].filter(Boolean).join(" ") + (year ? " (" + year + ")" : ""));
  setText(root, "vin", vin || "—");
  setText(root, "test-date", new Date().toLocaleString());
  setText(root, "software-version", "Autocom ICON 2026.08x");
  setText(root, "vci-serial", "130600");

  // ----- Show the matching variant -----
  var evEl = root.querySelector('[data-report-variant="ev"]');
  var iceEl = root.querySelector('[data-report-variant="ice"]');
  if (variant === "ev" && evEl) {
    evEl.classList.remove("hidden");

    var data = window.BmsDtcLibrary ? window.BmsDtcLibrary.lookup(brand, model) : { batteryHealthPercent: 92, capacity: { initialKwh: 77, currentKwh: 71, lossPercent: 7.8 }, cellVoltage: { minV: 3.82, maxV: 3.84 }, temperature: { minC: 22, maxC: 24 }, faultCodes: [] };

    var healthCat = healthCategory(data.batteryHealthPercent);
    setText(evEl, "health-percent", data.batteryHealthPercent + "%");
    applyBanner(evEl, "health-banner", healthCat);
    setText(evEl, "health-note", healthCat.note);

    var faultCount = data.faultCodes.length;
    applyBanner(evEl, "fault-banner", faultCount === 0 ? { label: "Good", tone: "success" } : { label: "Check", tone: "warning" });
    setText(evEl, "fault-count", faultCount + (faultCount === 1 ? " DTC" : " DTCs"));

    setText(evEl, "capacity-initial", data.capacity.initialKwh.toFixed(1));
    setText(evEl, "capacity-current", data.capacity.currentKwh.toFixed(1));
    setText(evEl, "capacity-loss", data.capacity.lossPercent.toFixed(1));

    setText(evEl, "voltage-min", data.cellVoltage.minV.toFixed(2));
    setText(evEl, "voltage-max", data.cellVoltage.maxV.toFixed(2));
    setText(evEl, "voltage-diff", Math.round((data.cellVoltage.maxV - data.cellVoltage.minV) * 1000));

    setText(evEl, "temp-min", data.temperature.minC);
    setText(evEl, "temp-max", data.temperature.maxC);
    setText(evEl, "temp-diff", data.temperature.maxC - data.temperature.minC);

    var listEl = evEl.querySelector("[data-fault-codes-list]");
    var emptyEl = evEl.querySelector("[data-fault-codes-empty]");
    if (listEl) {
      if (faultCount === 0) {
        if (emptyEl) emptyEl.classList.remove("hidden");
      } else {
        listEl.innerHTML = data.faultCodes.map(function (fc, i) {
          var badge = fc.status
            ? '<span class="badge badge-sm ' + (fc.status === "PERMANENT" ? "badge-error" : "badge-warning") + '">' + fc.status + "</span>"
            : "";
          // Same sparkle path as icon.njk's sparkle.svg (can't call that Nunjucks macro from
          // client-side JS, so it's inlined here — keep in sync if that icon ever changes).
          var aiAssistBtn = fc.aiAssist
            ? '<button type="button" class="btn btn-xs btn-outline btn-primary gap-1 shrink-0" data-ai-assist-trigger data-ai-assist-index="' + i + '">' +
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5" aria-hidden="true"><path d="M12 2c.44 3.07 1.1 5.24 2.03 6.5C15.06 9.86 16.87 10.7 19.5 11c-2.63.3-4.44 1.14-5.47 2.5-.93 1.26-1.59 3.43-2.03 6.5-.44-3.07-1.1-5.24-2.03-6.5C8.94 12.14 7.13 11.3 4.5 11c2.63-.3 4.44-1.14 5.47-2.5C10.9 7.24 11.56 5.07 12 2Z"/></svg>' +
                "AI Assist" +
              "</button>"
            : "";
          return (
            '<div class="card bg-base-200 p-3">' +
              '<p class="text-xs text-base-content/60">' + fc.ecu + "</p>" +
              '<div class="flex items-center gap-2 mt-1">' +
                '<span class="font-mono font-bold text-base-content">' + fc.code + "</span>" +
                badge +
              "</div>" +
              '<div class="flex items-center justify-between gap-3 mt-0.5">' +
                '<p class="text-sm text-base-content/70">' + fc.description + "</p>" +
                aiAssistBtn +
              "</div>" +
            "</div>"
          );
        }).join("");

        listEl.querySelectorAll("[data-ai-assist-trigger]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var fc = data.faultCodes[parseInt(btn.getAttribute("data-ai-assist-index"), 10)];
            if (fc && fc.aiAssist) openAiAssist(fc.code, fc.aiAssist);
          });
        });
      }
    }
  } else if (iceEl) {
    iceEl.classList.remove("hidden");
    var iceCategory = healthCategory(74);
    setText(iceEl, "health-percent", "74%");
    applyBanner(iceEl, "health-banner", iceCategory);
    setText(iceEl, "health-note", iceCategory.note);
    setText(iceEl, "ice-voltage", "11.4");
    setText(iceEl, "ice-cca", "410");
    setText(iceEl, "ice-cca-rated", "520");
    setText(iceEl, "ice-resistance", "18");
    setText(iceEl, "ice-temp", "21");
  }

  // ----- Print masthead timestamp -----
  var printTimestampEl = root.querySelector("[data-print-timestamp]");
  if (printTimestampEl) printTimestampEl.textContent = new Date().toLocaleString();

  // ----- Optional editable fields: mirrored into their print-only text counterparts just before
  // printing, since the inputs themselves are hidden in print (a filled text input doesn't render
  // its value in most browsers' print output the way plain text does). -----
  var PRINT_FIELD_INPUTS = {
    mileage: "battery-soh-mileage-input",
    "reg-number": "battery-soh-reg-number-input",
    "reg-date": "battery-soh-reg-date-input",
    technician: "battery-soh-technician-input"
  };
  window.addEventListener("beforeprint", function () {
    Object.keys(PRINT_FIELD_INPUTS).forEach(function (field) {
      var input = document.getElementById(PRINT_FIELD_INPUTS[field]);
      var printEl = root.querySelector('[data-print-field="' + field + '"]');
      if (input && printEl) printEl.textContent = input.value || "—";
    });
  });
})();
