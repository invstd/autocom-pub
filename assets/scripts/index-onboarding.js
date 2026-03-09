/**
 * Onboarding visibility on Launchpad 1 index.
 * When launchpad-onboarding-mode === 'onboarding', show onboarding welcome block and hide recent vehicles.
 * Otherwise show recent vehicles and hide onboarding block.
 * Wire "Show me how" CTA to start the guided demo (drawer).
 * Include this script only on the index page.
 */
(function () {
  var KEY = 'launchpad-onboarding-mode';
  var mode = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
  var isOnboarding = mode === 'onboarding';

  var welcomeBlock = document.getElementById('onboarding-welcome-block');
  var recentSection = document.getElementById('recent-vehicles-section');

  if (welcomeBlock) welcomeBlock.classList.toggle('hidden', !isOnboarding);
  if (recentSection) recentSection.classList.toggle('hidden', isOnboarding);

  // "Show me how" is wired in onboarding-drawer.js (runs on all Launchpad pages) so startOnboardingDemo is defined
})();
