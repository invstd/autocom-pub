/**
 * Hero VIN / VRM input: classify as VIN or licence plate (VRM), validate, and branch.
 * - VIN: on submit, validate format (17 chars, no I/O/Q); if valid open Scan VIN modal at state 2.
 * - VRM: live validation against European plate patterns; show country flag when valid. No action on Enter.
 */
(function () {
  var FORM_ID = "hero-vin-vrm-form";
  var INPUT_ID = "hero-vin-vrm-input";
  var SEARCH_ICON_ID = "hero-search-icon";
  var FLAG_ID = "hero-vrm-flag";
  var VIN_ICON_ID = "hero-vin-icon";
  var ERROR_ID = "hero-vin-vrm-error";

  /** VIN: 17 chars, A–Z (excl. I, O, Q) and 0–9. */
  var VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

  function normalizeForVin(str) {
    return (str || "").trim().toUpperCase().replace(/\s/g, "");
  }

  function isVinFormat(str) {
    var n = normalizeForVin(str);
    return n.length === 17 && /^[A-HJ-NPR-Z0-9]+$/.test(n);
  }

  function isVinValid(str) {
    var n = normalizeForVin(str);
    return n.length === 17 && VIN_REGEX.test(n);
  }

  /** VRM: normalise for pattern matching (uppercase, single space between groups). */
  function normalizeForVrm(str) {
    return (str || "").trim().toUpperCase().replace(/\s+/g, " ").replace(/[-]/g, " ");
  }

  /** European VRM patterns (priority: SE, NO, then others). First match wins. */
  var VRM_COUNTRIES = [
    { code: "SE", flag: "\uD83C\uDDF8\uD83C\uDDEA", pattern: /^[A-HJ-PR-UW-Z]{3}\s?(\d{3}|\d{2}[A-HJ-PR-UW-Z])$/ },
    { code: "NO", flag: "\uD83C\uDDF3\uD83C\uDDF4", pattern: /^[A-HJ-NPR-Z]{2}\s?\d{5}$/ },
    { code: "GB", flag: "\uD83C\uDDEC\uD83C\uDDE7", pattern: /^[A-Z]{2}\s?\d{2}\s?[A-Z]{3}$/ },
    { code: "DE", flag: "\uD83C\uDDE9\uD83C\uDDEA", pattern: /^[A-Z]{1,3}\d{1,2}\s?[A-Z]{1,4}$/ },
    { code: "FR", flag: "\uD83C\uDDEB\uD83C\uDDF7", pattern: /^[A-HJ-NP-TV-Z]{2}[\s-]?\d{3}[\s-]?[A-HJ-NP-TV-Z]{2}$|^\d{2,4}[\s-]?[A-Z]{1,3}[\s-]?\d{2}$/ },
    { code: "NL", flag: "\uD83C\uDDF3\uD83C\uDDF1", pattern: /^(\d{2}\s?[A-Z]{2}\s?\d{2}|[A-Z]{2}\s?\d{2}\s?[A-Z]{2})$/ },
    { code: "IT", flag: "\uD83C\uDDEE\uD83C\uDDF9", pattern: /^[A-HJ-NPR-TV-Z]{2}\s?\d{3}\s?[A-HJ-NPR-TV-Z]{2}$/ },
    { code: "ES", flag: "\uD83C\uDDEA\uD83C\uDDF8", pattern: /^\d{4}\s?[A-Z]{3}$|^[A-Z]{1,2}\s?\d{4}\s?[A-Z]{1,2}$/ }
  ];

  function getVrmCountry(normalized) {
    if (!normalized || normalized.length < 4) return null;
    var compact = normalized.replace(/\s/g, "");
    for (var i = 0; i < VRM_COUNTRIES.length; i++) {
      var p = VRM_COUNTRIES[i].pattern;
      if (p.test(normalized) || (compact.length >= 4 && p.test(compact))) {
        return VRM_COUNTRIES[i];
      }
    }
    return null;
  }

  function showError(msg) {
    var el = document.getElementById(ERROR_ID);
    if (el) {
      el.textContent = msg || "";
      el.classList.toggle("hidden", !msg);
    }
  }

  function showFlag(wrapper, flagEmoji) {
    if (!wrapper) return;
    var iconEl = wrapper.querySelector("#" + SEARCH_ICON_ID);
    var vinIconEl = wrapper.querySelector("#" + VIN_ICON_ID);
    var flagEl = wrapper.querySelector("#" + FLAG_ID);
    if (!iconEl || !flagEl) return;
    if (flagEmoji) {
      flagEl.textContent = flagEmoji;
      flagEl.classList.remove("hidden");
      iconEl.classList.add("hidden");
      if (vinIconEl) vinIconEl.classList.add("hidden");
    } else {
      flagEl.textContent = "";
      flagEl.classList.add("hidden");
      /* Do not touch iconEl/vinIconEl here – caller controls which icon is visible */
    }
  }

  function showVinIcon(wrapper, show) {
    if (!wrapper) return;
    var iconEl = wrapper.querySelector("#" + SEARCH_ICON_ID);
    var vinIconEl = wrapper.querySelector("#" + VIN_ICON_ID);
    var flagEl = wrapper.querySelector("#" + FLAG_ID);
    if (!iconEl || !vinIconEl) return;
    if (show) {
      vinIconEl.classList.remove("hidden");
      iconEl.classList.add("hidden");
      if (flagEl) flagEl.classList.add("hidden");
    } else {
      vinIconEl.classList.add("hidden");
      iconEl.classList.remove("hidden");
      if (flagEl) flagEl.classList.add("hidden");
    }
  }

  function init() {
    var form = document.getElementById(FORM_ID);
    var input = document.getElementById(INPUT_ID);
    if (!form || !input) return false;

    var wrapper = input.closest(".hero-search-input");
    if (!wrapper) wrapper = form.querySelector(".hero-search-input");
    if (!wrapper) return false;

    var searchIcon = wrapper.querySelector("#" + SEARCH_ICON_ID);
    var vinIcon = wrapper.querySelector("#" + VIN_ICON_ID);
    if (!searchIcon || !vinIcon) return false;

    console.log("hero-vin-vrm: ready");

    function syncIconState() {
      var raw = input.value.trim();
      if (!raw) {
        showFlag(wrapper, null);
        showVinIcon(wrapper, false);
        return;
      }
      if (isVinFormat(raw)) {
        showVinIcon(wrapper, true);
        showFlag(wrapper, null);
        return;
      }
      showVinIcon(wrapper, false);
      var country = getVrmCountry(normalizeForVrm(raw));
      showFlag(wrapper, country ? country.flag : null);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var raw = input.value.trim();
      if (!raw) {
        showError("");
        return;
      }

      if (isVinFormat(raw)) {
        if (isVinValid(raw)) {
          showError("");
          showFlag(wrapper, null);
          showVinIcon(wrapper, false);
          var normalizedVin = normalizeForVin(raw);
          if (typeof window.runScanVinFromVin === "function") {
            window.runScanVinFromVin(normalizedVin);
          }
        } else {
          showError("Invalid VIN. Use 17 characters (no I, O, or Q).");
        }
        return;
      }

      showError("");
      showVinIcon(wrapper, false);
    });

    input.addEventListener("input", function (e) {
      var target = e.target || input;
      var start = target.selectionStart;
      var end = target.selectionEnd;
      target.value = (target.value || "").toUpperCase();
      target.setSelectionRange(start, end);

      var raw = (target.value || "").trim();
      showError("");

      if (!raw) {
        showFlag(wrapper, null);
        showVinIcon(wrapper, false);
        return;
      }

      if (isVinFormat(raw)) {
        showVinIcon(wrapper, true);
        showFlag(wrapper, null);
        return;
      }

      showVinIcon(wrapper, false);
      var normalized = normalizeForVrm(raw);
      var country = getVrmCountry(normalized);
      if (country) {
        showFlag(wrapper, country.flag);
      } else {
        showFlag(wrapper, null);
      }
    });

    input.addEventListener("change", syncIconState);
    input.addEventListener("keyup", syncIconState);
    input.addEventListener("focus", syncIconState);

    var clearBtn = form.querySelector("[data-hero-search-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        showFlag(wrapper, null);
        showVinIcon(wrapper, false);
      });
    }

    syncIconState();
    setTimeout(syncIconState, 150);
    return true;
  }

  function runInit() {
    var maxTries = 20;
    var delay = 50;

    function tryInit(attempt) {
      if (init()) return;
      if (attempt < maxTries) setTimeout(function () { tryInit(attempt + 1); }, delay);
    }

    tryInit(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runInit);
  } else {
    setTimeout(runInit, 0);
  }
})();
