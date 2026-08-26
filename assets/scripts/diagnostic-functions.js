// Diagnostic Functions "More" modal: open/close + search filter, plus the EV/Hybrid gate on
// Battery State of Health. Replaces vehicle-tasks-modal.js — that script's whole job was the
// Customize checklist (which tiles show, persisted per vehicle type), a mechanic the real app
// doesn't have. This script has nothing to persist; the catalog is fixed
// (_data/diagnosticFunctions.js), so it only has to drive the modal's own UI.
(function () {
  const dialog = document.getElementById('diagnostic-functions-dialog');
  if (!dialog) return;

  const searchInput = dialog.querySelector('[data-diagnostic-functions-search]');
  const grid = dialog.querySelector('[data-diagnostic-functions-grid]');
  const emptyState = dialog.querySelector('[data-diagnostic-functions-empty]');
  const rows = grid ? Array.from(grid.querySelectorAll('[data-function-id]')) : [];

  function applyFilter() {
    const q = (searchInput.value || '').trim().toLowerCase();
    let visibleCount = 0;
    rows.forEach(function (row) {
      const matches = !q || row.getAttribute('data-function-label').indexOf(q) !== -1;
      row.classList.toggle('hidden', !matches);
      if (matches) visibleCount++;
    });
    if (emptyState) emptyState.classList.toggle('hidden', visibleCount > 0);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilter);

  window.openDiagnosticFunctionsModal = function () {
    if (searchInput) searchInput.value = '';
    applyFilter();
    dialog.showModal();
  };

  // Same EV/Hybrid test as battery-soh-modal.js's activeVariant() — kept as its own small check
  // here rather than exported from that file, since it's the only other place that needs it.
  function isEvVehicle() {
    const engine = new URLSearchParams(window.location.search).get('engine') || '';
    return /electric|hybrid/i.test(engine);
  }

  if (isEvVehicle()) {
    const locked = grid ? grid.querySelector('[data-ev-only-locked]') : null;
    const unlocked = grid ? grid.querySelector('[data-ev-only-unlocked]') : null;
    if (locked && unlocked) {
      locked.classList.add('hidden');
      unlocked.classList.remove('hidden');
    }
  }
})();
