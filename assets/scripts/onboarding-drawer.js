/**
 * Onboarding right drawer and Help FAB.
 * Used on all Launchpad pages (included from launchpad-app.njk).
 * - Drawer: shows tutorial step content when launchpad-onboarding-demo is set; can be toggled by FAB.
 * - FAB: visible when onboarding mode or demo active; toggles drawer.
 */
(function () {
  var DEMO_KEY = 'launchpad-onboarding-demo';
  var STEP_KEY = 'launchpad-onboarding-step';
  var MODE_KEY = 'launchpad-onboarding-mode';

  var STEP_CONFIG = [
    { title: 'Connect the vehicle', copy: 'Choose "Auto-detect" or "Scan VIN/QR Code" to continue. In this demo we\'ll jump straight to the diagnostics dashboard so you can see the next steps.' },
    { title: "You're on the diagnostics dashboard", copy: 'Here you can view systems, run a scan, and manage your vehicle. We\'ll point out the main areas next.' },
    { title: 'Perform the full system scan', copy: 'Click the "Scan all systems" button below to run a full vehicle scan. Once the scan finishes, you will complete the tutorial.', selector: '#onboarding-target-scan-systems' },
    { title: "You're all set!", copy: 'You\'ve completed the tutorial. You can explore the dashboard, run more scans, or close this panel and come back anytime via the Help button.', selector: null }
  ];

  var HIGHLIGHT_CLASS = 'onboarding-tour-highlight';

  function isOnDiagnosticsPage() {
    return typeof window !== 'undefined' && window.location.pathname && window.location.pathname.indexOf('diagnostics-dashboard') !== -1;
  }

  function clearHighlight() {
    document.querySelectorAll('.' + HIGHLIGHT_CLASS).forEach(function (el) { el.classList.remove(HIGHLIGHT_CLASS); });
  }

  function scrollAndHighlight(selector) {
    if (!selector) return;
    var el = document.querySelector(selector);
    if (!el) return;
    clearHighlight();
    el.classList.add(HIGHLIGHT_CLASS);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  var drawer = document.getElementById('onboarding-right-drawer');
  var drawerContent = document.getElementById('onboarding-drawer-content');
  var drawerStep = document.getElementById('onboarding-drawer-step');
  var drawerClose = document.getElementById('onboarding-drawer-close');
  var drawerNext = document.getElementById('onboarding-drawer-next');
  var drawerFooterActions = document.getElementById('onboarding-drawer-footer-actions');
  var fab = document.getElementById('onboarding-help-fab');

  function isDemoActive() {
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DEMO_KEY) === '1';
  }

  function isOnboardingMode() {
    return typeof localStorage !== 'undefined' && localStorage.getItem(MODE_KEY) === 'onboarding';
  }

  function getStepIndex() {
    if (typeof sessionStorage === 'undefined') return 0;
    var step = parseInt(sessionStorage.getItem(STEP_KEY), 10);
    return isNaN(step) || step < 0 ? 0 : step;
  }

  function setStepIndex(n) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STEP_KEY, String(n));
  }

  function isDrawerOpen() {
    return drawer && drawer.classList.contains('translate-x-0');
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.remove('translate-x-full');
    drawer.classList.add('translate-x-0');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.add('translate-x-full');
    drawer.classList.remove('translate-x-0');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function renderStep(index) {
    if (!drawerStep) return;
    if (isDemoActive() && index >= 0 && index < STEP_CONFIG.length) {
      var stepIndex = index;
      var iconCheck = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 text-primary/50"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/></svg>';
      var parts = [
        '<div class="onboarding-drawer-timeline">',
        '<ul class="timeline timeline-vertical timeline-snap-icon timeline-compact w-full">'
      ];
      for (var i = 0; i <= stepIndex; i++) {
        var cfg = STEP_CONFIG[i];
        var isCurrent = i === stepIndex;
        var isPrevious = i < stepIndex;
        var nodeContent = isPrevious
          ? iconCheck
          : '<span class="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-content">' + (i + 1) + '</span>';
        var boxClass = 'timeline-end timeline-box bg-transparent -mt-5 pb-4' + (isPrevious ? ' opacity-60 text-base-content/80' : '');
        parts.push('<li>');
        if (i > 0) parts.push('<hr/>');
        parts.push('<div class="timeline-start"></div>');
        parts.push('<div class="timeline-middle">' + nodeContent + '</div>');
        parts.push('<div class="' + boxClass + '">');
        parts.push('<h3 class="text-base font-semibold text-base-content mb-1">' + (cfg.title || '') + '</h3>');
        if (!isPrevious) {
          parts.push('<p class="text-sm">' + (cfg.copy || '') + '</p>');
          if (i === 0) {
            parts.push('<div role="alert" class="alert alert-soft alert-info text-sm mt-5">');
            parts.push('<span>No need to connect a real device or scan a VIN. This is a guided walkthrough. Just follow the steps to explore the flow.</span>');
            parts.push('</div>');
          }
        }
        parts.push('</div>');
        if (i < stepIndex) parts.push('<hr/>');
        parts.push('</li>');
      }
      parts.push('</ul>');
      parts.push('</div>');
      if (stepIndex === 1) {
        parts.push('<button type="button" id="onboarding-drawer-see-options-inline" class="btn btn-primary btn-block mt-4">See the options</button>');
      }
      if (stepIndex === 2) {
        parts.push('<button type="button" id="onboarding-drawer-scan-inline" class="btn btn-primary btn-block mt-4">Scan all systems</button>');
      }
      if (stepIndex === 3) {
        parts.push('<button type="button" id="onboarding-drawer-finish-inline" class="btn btn-success btn-block mt-4">Finish tutorial</button>');
      }
      drawerStep.innerHTML = parts.join('');
      if (drawerNext) {
        if (stepIndex === 0 || stepIndex === 1 || stepIndex === 2 || stepIndex === 3) drawerNext.style.display = 'none';
        else drawerNext.style.display = '';
      }
      if (drawerFooterActions) drawerFooterActions.style.display = '';
      if (stepIndex === 3 && typeof window.confetti === 'function') {
        setTimeout(function () {
          var btn = document.getElementById('onboarding-drawer-finish-inline');
          if (btn) {
            var rect = btn.getBoundingClientRect();
            var x = (rect.left + rect.width / 2) / window.innerWidth;
            var y = (rect.top + rect.height / 2) / window.innerHeight;
            window.confetti({ particleCount: 100, spread: 70, origin: { x: x, y: y } });
          } else {
            window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
        }, 100);
      }
    } else {
      drawerStep.innerHTML = '<p class="text-sm">Go to Quick Connect to start the tutorial or choose how to connect your vehicle.</p>';
      if (drawerNext) drawerNext.style.display = 'none';
      if (drawerFooterActions) drawerFooterActions.style.display = 'none';
    }
  }

  function updateDrawerForDemo() {
    var step = getStepIndex();
    renderStep(step);
    if (drawerNext) {
      if (step === 1) drawerNext.textContent = 'See the options';
      else if (step === STEP_CONFIG.length - 1) drawerNext.textContent = 'Finish tutorial';
      else drawerNext.textContent = 'Next';
    }
    if (step === 0) {
      clearHighlight();
      ['#vci-pair-detect-trigger', '#scan-vin-trigger'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el) el.classList.add(HIGHLIGHT_CLASS);
      });
    } else if (isOnDiagnosticsPage() && STEP_CONFIG[step] && STEP_CONFIG[step].selector) {
      scrollAndHighlight(STEP_CONFIG[step].selector);
    } else {
      clearHighlight();
    }
  }

  /** Called by diagnostics dashboard when a full scan completes; advances to congratulations step if on step 2. */
  window.onboardingAdvanceAfterScan = function () {
    if (getStepIndex() === 2) {
      setStepIndex(3);
      updateDrawerForDemo();
    }
  };

  function showFab() {
    if (fab) fab.classList.remove('hidden');
  }

  function hideFab() {
    if (fab) fab.classList.add('hidden');
  }

  function updateFabVisibility() {
    if (isOnboardingMode() || isDemoActive()) showFab();
    else hideFab();
  }

  function init() {
    if (!drawer) return;

    updateFabVisibility();

    if (isDemoActive()) {
      openDrawer();
      updateDrawerForDemo();
    }

    if (fab) {
      fab.addEventListener('click', function () {
        if (isDrawerOpen()) closeDrawer();
        else {
          openDrawer();
          if (isDemoActive()) updateDrawerForDemo();
          else renderStep(-1);
        }
      });
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    if (drawerContent) {
      drawerContent.addEventListener('click', function (e) {
        var target = e.target && (e.target.id === 'onboarding-drawer-see-options-inline' ? e.target : (e.target.closest && e.target.closest('#onboarding-drawer-see-options-inline')));
        if (target) {
          var step = getStepIndex();
          if (step === 1 && typeof window.startOnboardingWaypointTour === 'function' && window.DIAGNOSTICS_TOUR_STEPS) {
            window.startOnboardingWaypointTour({
              steps: window.DIAGNOSTICS_TOUR_STEPS,
              onEnd: function () {
                setStepIndex(2);
                updateDrawerForDemo();
              }
            });
          }
          return;
        }
        var scanTarget = e.target && (e.target.id === 'onboarding-drawer-scan-inline' ? e.target : (e.target.closest && e.target.closest('#onboarding-drawer-scan-inline')));
        if (scanTarget) {
          var scanBtn = document.querySelector('#onboarding-target-scan-systems');
          if (scanBtn) {
            scanTarget.disabled = true;
            scanTarget.classList.add('btn-disabled');
            scanTarget.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Scanning...';
            scanBtn.click();
          }
          return;
        }
        var finishTarget = e.target && (e.target.id === 'onboarding-drawer-finish-inline' ? e.target : (e.target.closest && e.target.closest('#onboarding-drawer-finish-inline')));
        if (finishTarget) {
          clearHighlight();
          sessionStorage.removeItem(DEMO_KEY);
          sessionStorage.removeItem(STEP_KEY);
          closeDrawer();
          updateFabVisibility();
          return;
        }
      });
    }

    if (drawerNext) {
      drawerNext.addEventListener('click', function () {
        var step = getStepIndex();
        if (step === 1 && typeof window.startOnboardingWaypointTour === 'function' && window.DIAGNOSTICS_TOUR_STEPS) {
          window.startOnboardingWaypointTour({
            steps: window.DIAGNOSTICS_TOUR_STEPS,
            onEnd: function () {
              setStepIndex(2);
              updateDrawerForDemo();
            }
          });
          return;
        }
        if (step < STEP_CONFIG.length - 1) {
          setStepIndex(step + 1);
          updateDrawerForDemo();
        } else {
          clearHighlight();
          sessionStorage.removeItem(DEMO_KEY);
          sessionStorage.removeItem(STEP_KEY);
          closeDrawer();
          updateFabVisibility();
        }
      });
    }

    var drawerRestart = document.getElementById('onboarding-drawer-restart');
    var drawerSkip = document.getElementById('onboarding-drawer-skip');
    if (drawerRestart) {
      drawerRestart.addEventListener('click', function () {
        setStepIndex(0);
        clearHighlight();
        updateDrawerForDemo();
      });
    }
    if (drawerSkip) {
      drawerSkip.addEventListener('click', function () {
        clearHighlight();
        sessionStorage.removeItem(DEMO_KEY);
        sessionStorage.removeItem(STEP_KEY);
        closeDrawer();
        updateFabVisibility();
      });
    }

    var showMeHowBtn = document.getElementById('onboarding-cta-show-me-how');
    if (showMeHowBtn) {
      showMeHowBtn.addEventListener('click', function () {
        window.startOnboardingDemo();
      });
    }
  }

  window.startOnboardingDemo = function () {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(DEMO_KEY, '1');
      sessionStorage.setItem(STEP_KEY, '0');
    }
    var seeOptionsBtn = document.getElementById('onboarding-cta-see-options');
    var showMeHowBtn = document.getElementById('onboarding-cta-show-me-how');
    if (seeOptionsBtn) seeOptionsBtn.classList.remove('onboarding-tour-highlight-glow');
    if (showMeHowBtn) showMeHowBtn.classList.remove('onboarding-tour-highlight-glow');
    openDrawer();
    updateDrawerForDemo();
    showFab();
  };

  window.completeOnboardingAndClose = function () {
    if (typeof localStorage !== 'undefined') localStorage.setItem('launchpad-onboarding-completed', '1');
    sessionStorage.removeItem(DEMO_KEY);
    sessionStorage.removeItem(STEP_KEY);
    clearHighlight();
    closeDrawer();
    updateFabVisibility();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
