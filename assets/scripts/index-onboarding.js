/**
 * Onboarding visibility on Launchpad 1 index.
 * When launchpad-onboarding-mode === 'onboarding', show onboarding welcome block and hide recent vehicles.
 * Glow on "See how it works" until first click; opens welcome hub drawer (video + waypoint + demo).
 * Runs on DOMContentLoaded so layout scripts (onboarding-drawer.js) have defined openWelcomeHubDrawer.
 */
(function () {
  function init() {
    var KEY = 'launchpad-onboarding-mode';
    var DEMO_KEY = 'launchpad-onboarding-demo';
    var mode = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    var isOnboarding = mode === 'onboarding';
    var isDemoActive = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DEMO_KEY) === '1';

    var welcomeBlock = document.getElementById('onboarding-welcome-block');
    var recentSection = document.getElementById('recent-vehicles-section');
    var seeHowBtn = document.getElementById('onboarding-cta-see-how-it-works');
    // Launchpad 2 only: daisyUI Aura wrapper around the button (Launchpad 1 keeps the plain button + glow class).
    var seeHowAura = document.getElementById('onboarding-cta-see-how-it-works-aura');

    if (welcomeBlock) welcomeBlock.classList.toggle('hidden', !isOnboarding);
    if (recentSection) recentSection.classList.toggle('hidden', isOnboarding);

    if (seeHowBtn && isOnboarding && !isDemoActive) {
      if (seeHowAura) {
        seeHowAura.classList.add('aura', 'aura-dual');
      } else {
        seeHowBtn.classList.add('onboarding-tour-highlight-glow');
      }
      seeHowBtn.addEventListener('click', function openHub() {
        if (typeof window.openWelcomeHubDrawer === 'function') window.openWelcomeHubDrawer();
      });
      seeHowBtn.addEventListener('click', function removeGlow() {
        if (seeHowAura) {
          seeHowAura.classList.remove('aura', 'aura-dual');
        } else {
          seeHowBtn.classList.remove('onboarding-tour-highlight-glow');
        }
        seeHowBtn.removeEventListener('click', removeGlow);
      }, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
