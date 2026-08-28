/**
 * "Get a fresh copy" for the 30-day offline-trial expiry (see base.njk's inline head script and
 * trial-expired-gate.njk). Clears the recorded install timestamp, unregisters the service worker,
 * and clears its caches, then reloads — the smoothest equivalent of "download again" a stakeholder
 * can do in one tap, rather than being told to go find their browser's site-data settings.
 * Requires being online: clearing the cache with nothing to re-fetch from would just break the
 * page instead of actually refreshing it, so this bails out (with a message) while offline.
 */
(function () {
  var btn = document.getElementById("trial-expired-refresh");
  var offlineNote = document.getElementById("trial-expired-offline-note");
  if (!btn) return;

  btn.addEventListener("click", function () {
    if (!navigator.onLine) {
      if (offlineNote) offlineNote.classList.remove("hidden");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Fetching fresh copy…";
    if (offlineNote) offlineNote.classList.add("hidden");

    function reload() { location.reload(); }

    try { localStorage.removeItem("automechanika-installed-at"); } catch (e) {}

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations()
        .then(function (regs) { return Promise.all(regs.map(function (r) { return r.unregister(); })); })
        .then(function () { return ("caches" in window) ? caches.keys() : []; })
        .then(function (keys) { return Promise.all(keys.map(function (k) { return caches.delete(k); })); })
        .then(reload)
        .catch(reload);
    } else {
      reload();
    }
  });
})();
