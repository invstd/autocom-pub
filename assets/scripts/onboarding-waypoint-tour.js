/**
 * "See the options" waypoint tour on Launchpad 1 index.
 * Overlay, highlight on target, tooltip with Next/Back. Six steps.
 * Include only on index; started by #onboarding-cta-see-options.
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

  var overlay = null;
  var tooltip = null;
  var currentStep = -1;
  var highlightClass = 'onboarding-tour-highlight';

  function getTarget(selector) {
    return document.querySelector(selector);
  }

  function createOverlay() {
    var el = document.createElement('div');
    el.id = 'onboarding-tour-overlay';
    el.className = 'fixed inset-0 z-40 bg-black/50';
    el.setAttribute('aria-hidden', 'true');
    return el;
  }

  function createTooltip() {
    var el = document.createElement('div');
    el.id = 'onboarding-tour-tooltip';
    el.className = 'fixed z-50 max-w-sm rounded-box bg-base-100 border border-base-300 shadow-lg p-4';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-labelledby', 'onboarding-tour-tooltip-title');
    el.innerHTML = '<h3 id="onboarding-tour-tooltip-title" class="font-semibold text-base-content mb-1"></h3><p class="text-sm text-base-content/80 mb-4"></p><div class="flex justify-between gap-2"><button type="button" id="onboarding-tour-back" class="btn btn-ghost btn-sm">Back</button><button type="button" id="onboarding-tour-next" class="btn btn-primary btn-sm">Next</button></div>';
    return el;
  }

  function positionTooltip(target) {
    if (!tooltip || !target) return;
    var rect = target.getBoundingClientRect();
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
    document.querySelectorAll('.' + highlightClass).forEach(function (el) { el.classList.remove(highlightClass); });
  }

  function showStep(index) {
    removeHighlight();
    var step = TOUR_STEPS[index];
    var target = step && getTarget(step.selector);
    if (!target) {
      if (index >= 0 && index < TOUR_STEPS.length) goToStep(index + 1);
      return;
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add(highlightClass);
    var titleEl = tooltip.querySelector('#onboarding-tour-tooltip-title');
    var copyEl = tooltip.querySelector('p');
    var backBtn = document.getElementById('onboarding-tour-back');
    var nextBtn = document.getElementById('onboarding-tour-next');
    if (titleEl) titleEl.textContent = step.title;
    if (copyEl) copyEl.textContent = step.copy;
    if (backBtn) backBtn.textContent = index === 0 ? 'Skip' : 'Back';
    if (nextBtn) nextBtn.textContent = index === TOUR_STEPS.length - 1 ? 'Done' : 'Next';
    requestAnimationFrame(function () { positionTooltip(target); });
    currentStep = index;
  }

  function goToStep(index) {
    if (index < 0) endTour();
    else if (index >= TOUR_STEPS.length) endTour();
    else showStep(index);
  }

  function endTour() {
    removeHighlight();
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    overlay = null;
    tooltip = null;
    currentStep = -1;
  }

  function startTour() {
    if (overlay) return;
    overlay = createOverlay();
    tooltip = createTooltip();
    document.body.appendChild(overlay);
    document.body.appendChild(tooltip);
    overlay.setAttribute('aria-hidden', 'false');
    tooltip.setAttribute('aria-hidden', 'false');

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) endTour();
    });

    tooltip.querySelector('#onboarding-tour-back').addEventListener('click', function () {
      if (currentStep <= 0) endTour();
      else goToStep(currentStep - 1);
    });

    tooltip.querySelector('#onboarding-tour-next').addEventListener('click', function () {
      if (currentStep >= TOUR_STEPS.length - 1) endTour();
      else goToStep(currentStep + 1);
    });

    goToStep(0);
    window.addEventListener('resize', function onResize() {
      if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
        var target = getTarget(TOUR_STEPS[currentStep].selector);
        if (target) positionTooltip(target);
      }
    });
    window.addEventListener('scroll', function onScroll() {
      if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
        var target = getTarget(TOUR_STEPS[currentStep].selector);
        if (target) positionTooltip(target);
      }
    }, true);
  }

  function init() {
    var btn = document.getElementById('onboarding-cta-see-options');
    if (btn) btn.addEventListener('click', function () { startTour(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
