/**
 * "See the options" waypoint tour: overlay, spotlight, tooltip with Back/Next.
 * - Index (Quick Connect): six steps; started by #onboarding-cta-see-options.
 * - Diagnostics dashboard: four steps; started by drawer "See the options" (step 2).
 * Exposes window.startOnboardingWaypointTour(opts) for drawer-triggered diagnostics tour.
 */
(function () {
  var TOUR_STEPS = [
    { selector: '#hero-vin-vrm-form', title: 'VIN / VRM input', copy: 'Enter your vehicle identification number or registration here for a quick lookup.' },
    { selector: '#vci-pair-detect-trigger', title: 'Auto-detect', copy: 'Connect your VCI device to the OBD-II port and let the app detect the vehicle automatically.' },
    { selector: '#scan-vin-trigger', title: 'Scan VIN/QR Code', copy: 'Use your camera to scan a QR code or the vehicle\'s VIN.' },
    { selector: '#onboarding-target-select-manually', title: 'Manual selection', copy: 'Choose your vehicle by brand, model, year, and engine.' },
    { selector: '#onboarding-cta-show-me-how', title: 'Show me how', copy: 'Start a step-by-step guided tutorial that walks you through the process.' },
    { selector: '#onboarding-help-fab', title: 'Help', copy: 'Open the help drawer anytime from this button in the corner.' }
  ];

  var DIAGNOSTICS_TOUR_STEPS = [
    { selector: '#onboarding-target-vehicle-tasks', title: 'Vehicle Tasks', copy: 'Shortcuts for common jobs like Oil & Service Reset, EPB, TPMS, and more.' },
    { selector: '#onboarding-target-systems-tab', title: 'Systems list', copy: 'Browse and select vehicle systems. Use the tabs to switch between the list and the topology tree.' },
    { selector: '#onboarding-target-topology-tab', title: 'Topology tree', copy: 'View the vehicle network and ECU layout. Switch to this tab to see the full topology map.' },
    { selector: '#onboarding-target-scan-systems', title: 'Scan systems', copy: 'Click the Scan button to run a scan. When you do, the tutorial will complete. You can also click Skip in the drawer to close without scanning.' }
  ];

  var overlay = null;
  var tooltip = null;
  var currentStep = -1;
  var currentSteps = TOUR_STEPS;
  var currentOnEnd = null;
  var highlightClass = 'onboarding-tour-highlight';
  var highlightGlowClass = 'onboarding-tour-highlight-glow';

  var SPOTLIGHT_PADDING = 20;
  var SPOTLIGHT_RADIUS = 12;

  function getTarget(selector) {
    return document.querySelector(selector);
  }

  function makeRoundedRectPath(w, h, left, top, right, bottom, r) {
    r = Math.min(r, (right - left) / 2, (bottom - top) / 2);
    var path =
      'M 0 0 L ' + w + ' 0 L ' + w + ' ' + h + ' L 0 ' + h + ' Z ' +
      'M ' + (left + r) + ' ' + top +
      ' L ' + (right - r) + ' ' + top +
      ' A ' + r + ' ' + r + ' 0 0 1 ' + right + ' ' + (top + r) +
      ' L ' + right + ' ' + (bottom - r) +
      ' A ' + r + ' ' + r + ' 0 0 1 ' + (right - r) + ' ' + bottom +
      ' L ' + (left + r) + ' ' + bottom +
      ' A ' + r + ' ' + r + ' 0 0 1 ' + left + ' ' + (bottom - r) +
      ' L ' + left + ' ' + (top + r) +
      ' A ' + r + ' ' + r + ' 0 0 1 ' + (left + r) + ' ' + top + ' Z';
    return path;
  }

  function createOverlay() {
    var wrapper = document.createElement('div');
    wrapper.id = 'onboarding-tour-overlay';
    wrapper.className = 'fixed inset-0 z-40 bg-black/50 pointer-events-auto onboarding-tour-overlay';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.addEventListener('click', endTour);
    return wrapper;
  }

  function updateOverlayRect(rect) {
    if (!overlay || !rect) return;
    var w = window.innerWidth;
    var h = window.innerHeight;
    var pad = SPOTLIGHT_PADDING;
    var left = Math.max(0, rect.left - pad);
    var top = Math.max(0, rect.top - pad);
    var right = Math.min(w, rect.right + pad);
    var bottom = Math.min(h, rect.bottom + pad);
    var path = makeRoundedRectPath(w, h, left, top, right, bottom, SPOTLIGHT_RADIUS);
    overlay.style.clipPath = 'path(evenodd, \'' + path + '\')';
  }

  function positionTooltipAndOverlay(target) {
    positionTooltip(target);
    if (target) updateOverlayRect(target.getBoundingClientRect());
  }

  function createTooltip() {
    var el = document.createElement('div');
    el.id = 'onboarding-tour-tooltip';
    el.className = 'fixed z-50 max-w-sm rounded-box bg-base-100 border border-base-300 shadow-lg p-4';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'onboarding-tour-tooltip-title');
    el.innerHTML = '<div id="onboarding-tour-tooltip-content"><h3 id="onboarding-tour-tooltip-title" class="font-semibold text-base-content mb-1"></h3><p class="text-sm text-base-content/80 mb-4"></p></div><div class="flex justify-between gap-2"><button type="button" id="onboarding-tour-back" class="btn btn-ghost btn-sm">Back</button><button type="button" id="onboarding-tour-next" class="btn btn-primary btn-sm">Next</button></div>';
    return el;
  }

  function positionTooltip(target) {
    if (!tooltip || !target) return;
    positionTooltipAtRect(target.getBoundingClientRect());
  }

  function positionTooltipAtRect(rect) {
    if (!tooltip || !rect) return;
    var gap = 12;
    var top = rect.bottom + gap;
    var left = rect.left;
    if (top + tooltip.offsetHeight > window.innerHeight) top = rect.top - tooltip.offsetHeight - gap;
    if (left + tooltip.offsetWidth > window.innerWidth) left = window.innerWidth - tooltip.offsetWidth - 16;
    if (left < 16) left = 16;
    tooltip.style.top = top + 'px';
    tooltip.style.left = left + 'px';
  }

  function removeHighlight() {
    document.querySelectorAll('.' + highlightClass).forEach(function (el) {
      el.classList.remove(highlightClass);
      el.classList.remove(highlightGlowClass);
    });
  }

  function showStep(index) {
    var contentWrapper = tooltip && tooltip.querySelector('#onboarding-tour-tooltip-content');
    var isStepChange = currentStep >= 0 && contentWrapper;

    if (isStepChange) contentWrapper.style.opacity = '0';

    removeHighlight();
    var step = currentSteps[index];
    var target = step && getTarget(step.selector);
    if (!target) {
      if (index >= 0 && index < currentSteps.length) goToStep(index + 1);
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add(highlightClass);
    if (currentSteps === TOUR_STEPS) target.classList.add(highlightGlowClass);
    var titleEl = tooltip.querySelector('#onboarding-tour-tooltip-title');
    var copyEl = tooltip.querySelector('#onboarding-tour-tooltip-content p');
    var backBtn = document.getElementById('onboarding-tour-back');
    var nextBtn = document.getElementById('onboarding-tour-next');
    if (titleEl) titleEl.textContent = (index + 1) + '. ' + step.title;
    if (copyEl) copyEl.textContent = step.copy;
    if (backBtn) backBtn.textContent = index === 0 ? 'Skip' : 'Back';
    if (nextBtn) nextBtn.textContent = index === currentSteps.length - 1 ? 'Done' : 'Next';
    requestAnimationFrame(function () { positionTooltipAndOverlay(target); });
    currentStep = index;

    if (isStepChange && contentWrapper) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { contentWrapper.style.opacity = '1'; });
      });
    } else if (contentWrapper) {
      contentWrapper.style.opacity = '1';
    }
  }

  function goToStep(index) {
    if (index < 0) endTour();
    else if (index >= currentSteps.length) endTour();
    else showStep(index);
  }

  function endTour() {
    removeHighlight();
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    var onEnd = currentOnEnd;
    overlay = null;
    tooltip = null;
    currentStep = -1;
    currentSteps = TOUR_STEPS;
    currentOnEnd = null;
    if (typeof onEnd === 'function') onEnd();
  }

  function startTourInternal(steps, originSelector, onEnd) {
    if (overlay) return;
    currentSteps = steps;
    currentOnEnd = onEnd || null;
    overlay = createOverlay();
    tooltip = createTooltip();
    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);
    overlay.setAttribute('aria-hidden', 'false');
    tooltip.setAttribute('aria-hidden', 'false');

    tooltip.querySelector('#onboarding-tour-back').addEventListener('click', function () {
      if (currentStep <= 0) endTour();
      else goToStep(currentStep - 1);
    });

    tooltip.querySelector('#onboarding-tour-next').addEventListener('click', function () {
      if (currentStep >= currentSteps.length - 1) endTour();
      else goToStep(currentStep + 1);
    });

    var contentWrapper = tooltip.querySelector('#onboarding-tour-tooltip-content');
    var originEl = originSelector ? document.querySelector(originSelector) : null;
    if (originEl && contentWrapper) {
      var originRect = originEl.getBoundingClientRect();
      updateOverlayRect(originRect);
      positionTooltipAtRect(originRect);
      contentWrapper.style.opacity = '0';
    }

    goToStep(0);
    window.addEventListener('resize', function onResize() {
      if (currentStep >= 0 && currentStep < currentSteps.length) {
        var target = getTarget(currentSteps[currentStep].selector);
        if (target) positionTooltipAndOverlay(target);
      }
    });
    window.addEventListener('scroll', function onScroll() {
      if (currentStep >= 0 && currentStep < currentSteps.length) {
        var target = getTarget(currentSteps[currentStep].selector);
        if (target) positionTooltipAndOverlay(target);
      }
    }, true);
  }

  function startTour() {
    startTourInternal(TOUR_STEPS, '#onboarding-cta-see-options', function onIndexTourEnd() {
      var showMeHow = document.getElementById('onboarding-cta-show-me-how');
      if (showMeHow) showMeHow.classList.add(highlightGlowClass);
    });
  }

  function init() {
    var btn = document.getElementById('onboarding-cta-see-options');
    if (btn) btn.addEventListener('click', function () { startTour(); });
  }

  window.startOnboardingWaypointTour = function (opts) {
    if (!opts || !opts.steps) return;
    startTourInternal(opts.steps, opts.originSelector || null, opts.onEnd || null);
  };
  window.DIAGNOSTICS_TOUR_STEPS = DIAGNOSTICS_TOUR_STEPS;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
