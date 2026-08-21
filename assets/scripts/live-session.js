// Live diagnostic session runtime — the bridge between real dashboard actions (scan, erase DTCs,
// Battery SoH, Data Lists snapshot, Vehicle Tasks) and a Garage vehicle's session history / the
// Report Composer. Everything in this app is static + client-side, so "creating a session" means
// a localStorage record, not a server write — same pattern already established by
// report-shared.js's per-session overlay, just one level up (a whole session, not just its
// included/billable flags).
//
// Storage key: automechanika-live-session-<vehicleId>. One record per vehicle (not per visit) —
// re-opening the same vehicle's dashboard resumes logging into the same live session rather than
// starting a new one each time, so a mechanic's full working session survives navigating away and
// back (e.g. to check the Garage) before wrapping up.
//
// Created lazily: visiting the dashboard does NOT create a record by itself — only appending a
// real event does. A mechanic who just looks around without performing any action leaves no trace,
// same reasoning as a real diagnostic tool only logging actions actually taken.
//
// Event shape matches garageVehiclesCars.js/-Trucks.js's EVENT_TEMPLATES output exactly
// ({ icon, label, tone, value, time }) and is consumed unmodified by session-report-body.njk via
// the live report/composer pages (see garageSessionReports.js's `liveSessionSlug` entries) — one
// event contract for both mocked and real sessions, not two.
window.AutocomLiveSession = (function () {
  function storageKey(vehicleId) {
    return 'automechanika-live-session-' + vehicleId;
  }

  function nowTime() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  function get(vehicleId) {
    if (!vehicleId) return null;
    try {
      var raw = localStorage.getItem(storageKey(vehicleId));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function save(vehicleId, record) {
    try { localStorage.setItem(storageKey(vehicleId), JSON.stringify(record)); } catch (e) {}
  }

  // event: { icon, label, tone, value }. Lazily starts the session on the first call for this
  // vehicle. Returns the updated record.
  function append(vehicleId, event) {
    if (!vehicleId) return null;
    var record = get(vehicleId) || { vehicleId: vehicleId, startedAt: new Date().toISOString(), technician: 'You', events: [] };
    record.events.unshift({ icon: event.icon, label: event.label, tone: event.tone, value: event.value, time: nowTime() });
    save(vehicleId, record);
    return record;
  }

  // Short display string for the dashboard's "Current session" indicator, matching the real
  // product's own framing ("Current session · Apr 28 · 09:45 · 4 events") — null when there's no
  // active session yet (nothing logged this visit or before).
  function summaryLabel(vehicleId) {
    var record = get(vehicleId);
    if (!record || !record.events.length) return null;
    var started = new Date(record.startedAt);
    var timeLabel = String(started.getHours()).padStart(2, '0') + ':' + String(started.getMinutes()).padStart(2, '0');
    return 'Current session · Today · ' + timeLabel + ' · ' + record.events.length + (record.events.length === 1 ? ' event' : ' events');
  }

  return { get: get, append: append, summaryLabel: summaryLabel, storageKey: storageKey };
})();
