// Prepends a real "Live" session row to a vehicle's Sessions list in the Garage, sourced from
// live-session.js's localStorage record — the mocked history below it (garageVehiclesCars.js/
// -Trucks.js's genSessions()) is all this list otherwise shows. Reuses garage-session-list.njk's
// exact markup/classes (built in JS since the row's content isn't known at build time), and links
// Generate Report/the print icon at the pre-built "-session-live" report pages (see
// garageSessionReports.js's liveEntries) — same slug convention as every other session, just a
// fixed "live" number instead of one.
(function () {
  if (!window.AutocomLiveSession) return;

  function toneClassFor(tone) {
    if (tone === 'error') return 'text-error';
    if (tone === 'warning') return 'text-warning';
    if (tone === 'success') return 'text-success';
    return 'text-base-content/70';
  }

  function cloneIcon(name) {
    var pooled = document.querySelector('[data-icon-pool] [data-icon-name="' + name + '"] .icon')
      || document.querySelector('[data-icon-pool] [data-icon-name="search"] .icon');
    return pooled ? pooled.cloneNode(true) : null;
  }

  function buildEventRow(event) {
    var toneClass = toneClassFor(event.tone);
    var row = document.createElement('div');
    row.className = 'flex items-center gap-2 py-1';
    var iconEl = cloneIcon(event.icon);
    if (iconEl) { iconEl.classList.add(toneClass); row.appendChild(iconEl); }
    var label = document.createElement('span');
    label.className = 'text-sm text-base-content flex-1 truncate';
    label.textContent = event.label;
    row.appendChild(label);
    var value = document.createElement('span');
    value.className = 'text-xs font-medium shrink-0 ' + toneClass;
    value.textContent = event.value;
    row.appendChild(value);
    var time = document.createElement('span');
    time.className = 'text-xs text-base-content/50 shrink-0 w-12 text-right';
    time.textContent = event.time;
    row.appendChild(time);
    return row;
  }

  function buildActionLink(href, cls, text) {
    var el = document.createElement(href ? 'a' : 'button');
    if (href) { el.href = href; } else { el.type = 'button'; }
    el.className = cls;
    el.textContent = text;
    return el;
  }

  function buildLiveRow(list, session) {
    var wrap = document.createElement('div');
    wrap.className = 'collapse collapse-arrow border-b border-base-200 last:border-b-0 rounded-none min-h-0';

    var checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'min-h-0';
    checkbox.checked = true;
    wrap.appendChild(checkbox);

    var title = document.createElement('div');
    title.className = 'collapse-title min-h-0 py-3 pr-10';
    var started = new Date(session.startedAt);
    var timeLabel = String(started.getHours()).padStart(2, '0') + ':' + String(started.getMinutes()).padStart(2, '0');
    title.innerHTML = '<div class="flex items-center gap-3">' +
      '<span class="badge badge-primary badge-sm font-semibold shrink-0">Live</span>' +
      '<div class="min-w-0 flex-1">' +
      '<p class="text-sm font-medium text-base-content truncate">Today · ' + timeLabel + '</p>' +
      '<p class="text-xs text-base-content/60 truncate">' + session.events.length + (session.events.length === 1 ? ' event' : ' events') + ' <span>&#8226;</span> You</p>' +
      '</div></div>';
    wrap.appendChild(title);

    var content = document.createElement('div');
    content.className = 'collapse-content';
    var inner = document.createElement('div');
    inner.className = 'flex flex-col gap-2 pb-2';
    session.events.forEach(function (event) { inner.appendChild(buildEventRow(event)); });

    var actions = document.createElement('div');
    actions.className = 'flex items-center gap-2 pt-2';
    var diagnosticsUrl = list.getAttribute('data-diagnostics-url');
    var composerUrl = list.getAttribute('data-composer-url');
    var reportUrl = list.getAttribute('data-report-url');
    actions.appendChild(buildActionLink(diagnosticsUrl || null, 'btn btn-primary btn-sm', 'Continue Session'));
    actions.appendChild(buildActionLink(composerUrl || null, 'btn btn-outline btn-sm', 'Generate Report'));
    var printBtn = document.createElement(reportUrl ? 'a' : 'button');
    if (reportUrl) printBtn.href = reportUrl + '?print=1'; else printBtn.type = 'button';
    printBtn.className = 'btn btn-square btn-ghost btn-sm ml-auto';
    printBtn.setAttribute('aria-label', 'Print session report');
    var printIcon = cloneIcon('print');
    if (printIcon) printBtn.appendChild(printIcon);
    actions.appendChild(printBtn);

    inner.appendChild(actions);
    content.appendChild(inner);
    wrap.appendChild(content);
    return wrap;
  }

  function injectAll() {
    document.querySelectorAll('.garage-session-list[data-vehicle-id]').forEach(function (list) {
      var vehicleId = list.getAttribute('data-vehicle-id');
      var session = window.AutocomLiveSession.get(vehicleId);
      if (!session || !session.events.length) return;
      list.insertBefore(buildLiveRow(list, session), list.firstChild);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAll);
  } else {
    injectAll();
  }
})();
