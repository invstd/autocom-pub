// Populates the Report Composer / printable report for a vehicle's LIVE session (see
// live-session.js) — the one report page per vehicle whose events aren't known at build time.
// No-ops entirely on every normal (mocked-history) report page, which don't have
// [data-live-session] on their root element.
//
// Runs before report-shared.js/report-composer.js (script tag order in generate-report.njk /
// session-report.njk) so both the rows below AND the real event count exist by the time those
// read the DOM — a live session now gets the exact same per-event include/billable checklist a
// mocked session does (data-event-include/data-event-billable, built here into
// [data-event-checklist] to match generate-report.njk's server-rendered markup for mocked
// sessions), which report-composer.js's existing wiring picks up unmodified since it just queries
// for those attributes at load time. This also means #report-defaults-data's eventCount (baked in
// at build time as 0, since live events aren't known then) has to be corrected here too, before
// report-shared.js's loadState() reads it — otherwise it builds a zero-length state.events and
// every checkbox/billable button below would have nothing to toggle.
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

  // Left-panel checklist row — same markup generate-report.njk server-renders for a mocked
  // session's events, just built client-side. Deliberately a plain neutral icon (no tone class),
  // matching that server-rendered version exactly.
  function buildChecklistRow(event, index) {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-2 py-1.5';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'checkbox checkbox-sm shrink-0';
    checkbox.id = 'report-event-include-' + index;
    checkbox.checked = true;
    checkbox.setAttribute('data-event-include', String(index));
    row.appendChild(checkbox);

    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.className = 'flex-1 min-w-0 flex items-center gap-2 cursor-pointer';
    const iconEl = cloneIcon(event.icon);
    if (iconEl) { iconEl.classList.add('text-base-content/60'); label.appendChild(iconEl); }
    const text = document.createElement('span');
    text.className = 'text-sm text-base-content truncate flex-1';
    text.textContent = event.label;
    label.appendChild(text);
    const time = document.createElement('span');
    time.className = 'text-xs text-base-content/50 shrink-0';
    time.textContent = event.time;
    label.appendChild(time);
    row.appendChild(label);

    const billableBtn = document.createElement('button');
    billableBtn.type = 'button';
    billableBtn.className = 'badge badge-success badge-sm shrink-0';
    billableBtn.setAttribute('data-event-billable', String(index));
    billableBtn.setAttribute('aria-pressed', 'true');
    billableBtn.textContent = 'Billable';
    row.appendChild(billableBtn);

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

  // Only present on generate-report.njk (the Composer's left-panel form) — session-report.njk
  // (the printable page) has no checklist to fill in, just the Live Preview rows above.
  document.querySelectorAll('[data-event-checklist]').forEach(function (container) {
    container.innerHTML = '';
    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'text-sm text-base-content/60';
      empty.textContent = 'No events logged yet — perform an action on the Diagnostics Dashboard to add one here.';
      container.appendChild(empty);
      return;
    }
    events.forEach(function (event, i) { container.appendChild(buildChecklistRow(event, i)); });
  });

  // #report-defaults-data's eventCount is baked in at build time as 0 for a live session (real
  // events aren't known then) — correct it here, before report-shared.js's loadState() (next
  // script tag) reads it, so state.events comes back the right length for the checklist above.
  const defaultsEl = document.getElementById('report-defaults-data');
  if (defaultsEl) {
    try {
      const defaults = JSON.parse(defaultsEl.textContent);
      defaults.eventCount = events.length;
      defaultsEl.textContent = JSON.stringify(defaults);
    } catch (e) {}
  }

  let summary = '';
  if (events.length > 0 && liveSession) {
    const started = new Date(liveSession.startedAt);
    const timeLabel = String(started.getHours()).padStart(2, '0') + ':' + String(started.getMinutes()).padStart(2, '0');
    summary = 'Today · ' + timeLabel + ' · ' + events.length + (events.length === 1 ? ' event' : ' events');
  }
  document.querySelectorAll('[data-field="sessionSummary"]').forEach(function (el) { el.textContent = summary || '—'; });
})();
