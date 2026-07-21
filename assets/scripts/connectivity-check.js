/**
 * Quiet internet-connectivity check: no dedicated step/screen, just an inline banner that
 * appears if the connection is actually down and disappears the moment it's back. Shared by
 * get-started.njk and login.njk — include on any page with a [data-offline-banner] element.
 */
(function () {
  var banners = document.querySelectorAll('[data-offline-banner]');
  if (!banners.length) return;

  function update() {
    var offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    banners.forEach(function (el) { el.classList.toggle('hidden', !offline); });
  }

  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
})();
