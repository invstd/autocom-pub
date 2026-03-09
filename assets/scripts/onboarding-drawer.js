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
    { title: 'Connect your vehicle', copy: 'Click "Auto-detect" or "Scan VIN/QR Code" above to connect. In the demo we\'ll take you to the diagnostics dashboard quickly.' },
    { title: "You're on the diagnostics dashboard", copy: 'Here you can view systems, run a scan, and manage your vehicle. We\'ll point out the main areas next.' },
    { title: 'Vehicle Tasks', copy: 'Shortcuts for common jobs like Oil & Service Reset, EPB, TPMS, and more. Click Next to continue.', selector: '#onboarding-target-vehicle-tasks' },
    { title: 'Systems list', copy: 'Browse and select vehicle systems. Use the tabs to switch between the list and the topology tree. Click Next.', selector: '#onboarding-target-systems-tab' },
    { title: 'Topology tree', copy: 'View the vehicle network and ECU layout. Switch to this tab to see the full topology map. Click Next.', selector: '#onboarding-target-topology-tab' },
    { title: 'Scan systems', copy: 'Click the Scan button below to run a scan. When you do, the tutorial will complete. You can also click Skip to close the tutorial without scanning.', selector: '#onboarding-target-scan-systems' }
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
  var drawerClose = document.getElementById('onboarding-drawer-close');
  var drawerNext = document.getElementById('onboarding-drawer-next');
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
    if (!drawerContent) return;
    if (isDemoActive() && index >= 0 && index < STEP_CONFIG.length) {
      var step = STEP_CONFIG[index];
      drawerContent.innerHTML = '<h3 class="font-semibold text-base-content mb-2">' + (step.title || '') + '</h3><p class="text-sm">' + (step.copy || '') + '</p>';
    } else {
      drawerContent.innerHTML = '<p class="text-sm">Go to Quick Connect to start the tutorial or choose how to connect your vehicle.</p>';
    }
  }

  function updateDrawerForDemo() {
    var step = getStepIndex();
    renderStep(step);
    if (drawerNext) {
      drawerNext.textContent = step < STEP_CONFIG.length - 1 ? 'Next' : 'Skip';
    }
    if (isOnDiagnosticsPage() && STEP_CONFIG[step] && STEP_CONFIG[step].selector) {
      scrollAndHighlight(STEP_CONFIG[step].selector);
    } else {
      clearHighlight();
    }
  }

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

    if (drawerNext) {
      drawerNext.addEventListener('click', function () {
        var step = getStepIndex();
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
