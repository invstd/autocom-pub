/**
 * Lightweight client-side gate for static prototype builds (not real security).
 */
(function () {
  var STORAGE_KEY = 'autocom-prototype-gate';
  var UNLOCKED = '1';
  var EXPECTED = 'Mellon22';

  function unlock() {
    try {
      sessionStorage.setItem(STORAGE_KEY, UNLOCKED);
    } catch (e) {}
    document.documentElement.classList.add('prototype-gate-unlocked');
    var root = document.getElementById('prototype-gate-root');
    if (root) root.remove();
  }

  function showError(show) {
    var el = document.getElementById('prototype-gate-error');
    if (el) el.classList.toggle('hidden', !show);
  }

  function trySubmit() {
    var input = document.getElementById('prototype-gate-input');
    var val = input && input.value ? input.value.trim() : '';
    if (val === EXPECTED) {
      showError(false);
      unlock();
    } else {
      showError(true);
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }

  if (document.documentElement.classList.contains('prototype-gate-unlocked')) {
    var leftover = document.getElementById('prototype-gate-root');
    if (leftover) leftover.remove();
    return;
  }

  function init() {
    var input = document.getElementById('prototype-gate-input');
    var btn = document.getElementById('prototype-gate-submit');
    if (btn) btn.addEventListener('click', trySubmit);
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') trySubmit();
      });
      input.focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
