/**
 * Onboarding visibility on Launchpad 1 index.
 * When launchpad-onboarding-mode === 'onboarding', show onboarding welcome block and hide recent vehicles.
 * Otherwise show recent vehicles and hide onboarding block.
 * When in onboarding mode and no steps started, apply glow pulse on "See the options" button.
 * Wire "Show me how" CTA to start the guided demo (drawer).
 * Include this script only on the index page.
 */
(function () {
  var KEY = 'launchpad-onboarding-mode';
  var DEMO_KEY = 'launchpad-onboarding-demo';
  var mode = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
  var isOnboarding = mode === 'onboarding';
  var isDemoActive = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DEMO_KEY) === '1';

  var welcomeBlock = document.getElementById('onboarding-welcome-block');
  var recentSection = document.getElementById('recent-vehicles-section');
  var seeOptionsBtn = document.getElementById('onboarding-cta-see-options');

  if (welcomeBlock) welcomeBlock.classList.toggle('hidden', !isOnboarding);
  if (recentSection) recentSection.classList.toggle('hidden', isOnboarding);

  if (seeOptionsBtn && isOnboarding && !isDemoActive) {
    seeOptionsBtn.classList.add('onboarding-tour-highlight-glow');
    seeOptionsBtn.addEventListener('click', function removeGlow() {
      seeOptionsBtn.classList.remove('onboarding-tour-highlight-glow');
      seeOptionsBtn.removeEventListener('click', removeGlow);
    }, { once: true });
  }

  // "Show me how" is wired in onboarding-drawer.js (runs on all Launchpad pages) so startOnboardingDemo is defined
})();
