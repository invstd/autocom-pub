// Shared localStorage load/save/apply helpers for the Diagnostic Session Report flow — used by
// both report-composer.js (generate-report.njk's Live Preview + form) and session-report.njk's
// own small enhancement script (applies a mechanic's saved selections when landing there via
// Save Report/Print, falls back to defaults otherwise). One shared implementation so the two
// pages can't drift on what a saved state means or how it's rendered into the DOM.
//
// Storage shape per session (key: automechanika-report-<slug>):
//   { fileName, mechanic, date, customerName, customerPhone, notes,
//     events: { "<eventIndex>": { included: bool, billable: bool } } }
window.AutocomReportShared = (function () {
  function storageKey(slug) {
    return 'automechanika-report-' + slug;
  }

  function todayIso() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  // defaults: { fileName, mechanic, customerName, customerPhone, notes, eventCount }
  // (eventCount comes from session.events.length — every event defaults to included+billable,
  // the Composer's own starting state, so a report reached without ever visiting the Composer
  // still shows the same thing a mechanic would see before touching anything.)
  function loadState(slug, defaults) {
    var raw = null;
    try { raw = localStorage.getItem(storageKey(slug)); } catch (e) {}
    var saved = null;
    if (raw) { try { saved = JSON.parse(raw); } catch (e) {} }

    var events = {};
    for (var i = 0; i < defaults.eventCount; i++) {
      var savedEvent = saved && saved.events && saved.events[i];
      events[i] = {
        included: savedEvent ? !!savedEvent.included : true,
        billable: savedEvent ? !!savedEvent.billable : true
      };
    }

    return {
      fileName: (saved && saved.fileName) || defaults.fileName,
      mechanic: (saved && saved.mechanic) || defaults.mechanic,
      date: (saved && saved.date) || todayIso(),
      customerName: (saved && saved.customerName != null) ? saved.customerName : defaults.customerName,
      customerPhone: (saved && saved.customerPhone != null) ? saved.customerPhone : defaults.customerPhone,
      notes: (saved && saved.notes != null) ? saved.notes : defaults.notes,
      events: events
    };
  }

  function saveState(slug, state) {
    try { localStorage.setItem(storageKey(slug), JSON.stringify(state)); } catch (e) {}
  }

  // Writes `state` into every matching [data-field]/[data-event-row] element under `root` — the
  // exact same DOM contract session-report-body.njk renders server-side, so this works whether
  // `root` is the Composer's Live Preview pane or the printable page's whole body.
  function applyState(root, state) {
    root.querySelectorAll('[data-field="fileName"]').forEach(function (el) { el.textContent = state.fileName; });
    root.querySelectorAll('[data-field="mechanic"]').forEach(function (el) { el.textContent = state.mechanic; });
    root.querySelectorAll('[data-field="date"]').forEach(function (el) { el.textContent = state.date; });
    root.querySelectorAll('[data-field="customerName"]').forEach(function (el) { el.textContent = state.customerName || '—'; });
    root.querySelectorAll('[data-field="customerPhone"]').forEach(function (el) { el.textContent = state.customerPhone || '—'; });
    root.querySelectorAll('[data-field="notes"]').forEach(function (el) { el.textContent = state.notes; });
    root.querySelectorAll('[data-notes-section]').forEach(function (el) { el.classList.toggle('hidden', !state.notes); });
    root.querySelectorAll('[data-event-row]').forEach(function (el) {
      var ev = state.events[el.getAttribute('data-event-row')];
      if (!ev) return;
      el.classList.toggle('hidden', !ev.included);
      var badge = el.querySelector('[data-billable-badge]');
      if (badge) {
        badge.textContent = ev.billable ? 'Billable' : 'No charge';
        badge.classList.toggle('badge-success', ev.billable);
        badge.classList.toggle('badge-ghost', !ev.billable);
      }
    });
  }

  return { storageKey: storageKey, todayIso: todayIso, loadState: loadState, saveState: saveState, applyState: applyState };
})();
