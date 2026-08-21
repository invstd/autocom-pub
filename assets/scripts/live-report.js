// Populates the Report Composer / printable report for a vehicle's LIVE session (see
// live-session.js) — the one report page per vehicle whose events aren't known at build time.
// No-ops entirely on every normal (mocked-history) report page, which don't have
// [data-live-session] on their root element.
//
// Runs before report-shared.js/report-composer.js (script tag order in generate-report.njk /
// session-report.njk) so the rows below exist by the time those read the DOM — report-composer.js
// still drives the editable meta fields (fileName/mechanic/date/customer/notes) unchanged; it just
// finds zero [data-event-include]/[data-event-billable] elements on a live page (that checklist is
// replaced with a note, see generate-report.njk) and applyState() finds no matching `state.events`
// entry for the rows injected here, so it leaves them alone — no per-event include/billable
// toggling for live events, only for the mocked history. See PROGRESS.md for that scope call.
(function () {
  const root = document.querySelector('[data-live-session]');
  if (!root) return;
  const vehicleId = root.getAttribute('data-live-session');

  function cloneIcon(name, toneClass) {
    const pooled = document.querySelector('[data-icon-pool] [data-icon-name="' + name + '"] .icon')
      || document.querySelector('[data-icon-pool] [data-icon-name="search"] .icon');
    if (!pooled) return null;
    const clone = pooled.cloneNode(true);
    if (toneClass) clone.classList.add(toneClass);
    return clone;
  }

  function toneClassFor(tone) {
    if (tone === 'error') return 'text-error';
    if (tone === 'warning') return 'text-warning';
    if (tone === 'success') return 'text-success';
    return 'text-base-content/70';
  }

  function buildEventRow(event, index) {
    const toneClass = toneClassFor(event.tone);
    const row = document.createElement('div');
    row.className = 'flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 border-b border-base-200';
    row.setAttribute('data-event-row', String(index));

    const time = document.createElement('span');
    time.className = 'text-xs text-base-content/50 w-12 shrink-0';
    time.textContent = event.time;
    row.appendChild(time);

    const iconEl = cloneIcon(event.icon, toneClass);
    if (iconEl) row.appendChild(iconEl);

    const label = document.createElement('span');
    label.className = 'text-sm text-base-content flex-1 min-w-[6rem] truncate';
    label.textContent = event.label;
    row.appendChild(label);

    const value = document.createElement('span');
    value.className = 'text-sm font-medium ' + toneClass + ' shrink-0';
    value.textContent = event.value;
    row.appendChild(value);

    const badge = document.createElement('span');
    badge.className = 'badge badge-success badge-outline badge-xs shrink-0';
    badge.setAttribute('data-billable-badge', '');
    badge.textContent = 'Billable';
    row.appendChild(badge);

    return row;
  }

  const liveSession = window.AutocomLiveSession ? window.AutocomLiveSession.get(vehicleId) : null;
  const events = (liveSession && liveSession.events) || [];

  document.querySelectorAll('[data-event-rows]').forEach(function (container) {
    container.innerHTML = '';
    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'text-sm text-base-content/60 py-2';
      empty.textContent = 'No events logged yet — perform an action on the Diagnostics Dashboard (scan, erase fault codes, a Vehicle Task, Battery SoH check, or a Data Lists snapshot) to add one here.';
      container.appendChild(empty);
      return;
    }
    events.forEach(function (event, i) { container.appendChild(buildEventRow(event, i)); });
  });

  let summary = '';
  if (events.length > 0 && liveSession) {
    const started = new Date(liveSession.startedAt);
    const timeLabel = String(started.getHours()).padStart(2, '0') + ':' + String(started.getMinutes()).padStart(2, '0');
    summary = 'Today · ' + timeLabel + ' · ' + events.length + (events.length === 1 ? ' event' : ' events');
  }
  document.querySelectorAll('[data-field="sessionSummary"]').forEach(function (el) { el.textContent = summary || '—'; });
  // Both the inline note's count and the collapse header's badge (normally kept in sync by
  // report-composer.js's countIncluded(), which has nothing to count on a live page since there's
  // no per-event checklist here — see generate-report.njk) need updating from the real total.
  document.querySelectorAll('[data-live-event-count], [data-events-included-count]').forEach(function (el) { el.textContent = String(events.length); });
})();
