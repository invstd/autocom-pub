// Data Lists modal — live-parameter picker + simulated live view. Populates data-lists-modal.njk
// from window.AutocomDataListsLibrary at trigger time. See that file's header comment for shape.
(function () {
  const dialog = document.getElementById('data-lists-dialog');
  if (!dialog) return;

  const pickView = dialog.querySelector('[data-data-lists-pick-view]');
  const liveView = dialog.querySelector('[data-data-lists-live-view]');
  const searchInput = dialog.querySelector('[data-data-lists-search]');
  const checklist = dialog.querySelector('[data-data-lists-checklist]');
  const countEl = dialog.querySelector('[data-data-lists-count]');
  const showBtn = dialog.querySelector('[data-data-lists-show-btn]');
  const backBtn = dialog.querySelector('[data-data-lists-back-btn]');
  const saveBtn = dialog.querySelector('[data-data-lists-save-btn]');
  const tilesEl = dialog.querySelector('[data-data-lists-tiles]');

  const MAX_SELECTED = 8; // NextGen supports up to 8 simultaneous data streams
  const BUFFER_SIZE = 30;
  const TICK_MS = 700;

  let currentParams = [];
  let selected = [];
  let tickTimer = null;
  let tileStates = [];

  // Vehicle-type-scoped, same as diagnostics-dashboard.js's getDtcLibraryForVehicleType — see
  // data-lists-library.js's header comment.
  function getDataListsLibrary() {
    const isTrucksMode = localStorage.getItem('automechanika-vehicle-type') === 'trucks';
    return (window.AutocomDataListsLibrary || {})[isTrucksMode ? 'trucks' : 'cars'] || {};
  }

  function nextValue(param, prevValue) {
    if (param.kind === 'counter') {
      return prevValue + Math.random() * 0.05;
    }
    const noise = param.noise || 0;
    return param.base + (Math.random() * 2 - 1) * noise;
  }

  function formatValue(v) {
    return Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2);
  }

  function sparklineSvg(buffer) {
    if (buffer.length < 2) return '';
    const min = Math.min.apply(null, buffer);
    const max = Math.max.apply(null, buffer);
    const range = max - min || 1;
    const w = 100;
    const h = 30;
    const step = w / (BUFFER_SIZE - 1);
    const points = buffer.map(function (v, i) {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" class="w-full h-full text-primary" aria-hidden="true">' +
      '<polyline points="' + points + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
  }

  function renderChecklist(filterText) {
    checklist.innerHTML = '';
    const filtered = currentParams.filter(function (p) {
      return !filterText || p.label.toLowerCase().indexOf(filterText.toLowerCase()) !== -1;
    });
    filtered.forEach(function (param) {
      const isChecked = selected.indexOf(param) !== -1;
      const atMax = selected.length >= MAX_SELECTED && !isChecked;
      const row = document.createElement('label');
      row.className = 'flex items-center gap-3 px-3 py-2 border-b border-base-200 last:border-b-0 cursor-pointer' + (atMax ? ' opacity-40 cursor-not-allowed' : ' hover:bg-base-200');
      row.innerHTML = '<input type="checkbox" class="checkbox checkbox-sm" ' + (isChecked ? 'checked' : '') + (atMax ? ' disabled' : '') + '/>' +
        '<span class="flex-1 text-sm">' + param.label + '</span>' +
        '<span class="text-xs text-base-content/50">' + (param.unit || '') + '</span>';
      const checkbox = row.querySelector('input');
      checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
          if (selected.length < MAX_SELECTED) selected.push(param);
        } else {
          selected = selected.filter(function (p) { return p !== param; });
        }
        updatePickState();
      });
      checklist.appendChild(row);
    });
  }

  function updatePickState() {
    countEl.textContent = selected.length;
    showBtn.disabled = selected.length === 0;
    // Re-render so the "at max" disabled state on unchecked rows stays in sync.
    renderChecklist(searchInput.value);
  }

  function buildTiles() {
    tilesEl.innerHTML = '';
    tileStates = selected.map(function (param) {
      const startValue = param.kind === 'counter' ? param.base : nextValue(param, param.base);
      const tile = document.createElement('div');
      tile.className = 'card bg-base-200 border border-base-300 rounded-box p-3 gap-1';
      tile.innerHTML = '<p class="text-xs text-base-content/60 truncate" title="' + param.label + '">' + param.label + '</p>' +
        '<p class="text-2xl font-bold text-base-content leading-tight">' +
        '<span data-value>' + formatValue(startValue) + '</span> ' +
        '<span class="text-sm font-normal text-base-content/50">' + (param.unit || '') + '</span></p>' +
        '<div class="w-full h-10" data-sparkline></div>' +
        '<p class="text-xs text-base-content/50">min <span data-min>' + formatValue(startValue) + '</span> · max <span data-max>' + formatValue(startValue) + '</span></p>';
      tilesEl.appendChild(tile);
      return {
        param: param,
        value: startValue,
        buffer: [startValue],
        min: startValue,
        max: startValue,
        valueEl: tile.querySelector('[data-value]'),
        sparklineEl: tile.querySelector('[data-sparkline]'),
        minEl: tile.querySelector('[data-min]'),
        maxEl: tile.querySelector('[data-max]')
      };
    });
  }

  function tick() {
    tileStates.forEach(function (state) {
      state.value = nextValue(state.param, state.value);
      state.buffer.push(state.value);
      if (state.buffer.length > BUFFER_SIZE) state.buffer.shift();
      state.min = Math.min(state.min, state.value);
      state.max = Math.max(state.max, state.value);
      state.valueEl.textContent = formatValue(state.value);
      state.minEl.textContent = formatValue(state.min);
      state.maxEl.textContent = formatValue(state.max);
      state.sparklineEl.innerHTML = sparklineSvg(state.buffer);
    });
  }

  function stopLiveUpdates() {
    if (tickTimer) {
      clearInterval(tickTimer);
      tickTimer = null;
    }
  }

  showBtn.addEventListener('click', function () {
    if (selected.length === 0) return;
    buildTiles();
    pickView.classList.add('hidden');
    liveView.classList.remove('hidden');
    stopLiveUpdates();
    tickTimer = setInterval(tick, TICK_MS);
  });

  backBtn.addEventListener('click', function () {
    stopLiveUpdates();
    liveView.classList.add('hidden');
    pickView.classList.remove('hidden');
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      if (!window.AutocomLiveSession || tileStates.length === 0) return;
      const vehicleId = new URLSearchParams(window.location.search).get('vehicleId');
      if (!vehicleId) return;
      window.AutocomLiveSession.append(vehicleId, { icon: 'chart-line', label: 'Live Data Snapshot', tone: 'neutral', value: tileStates.length + ' parameters' });
      if (typeof window.refreshCurrentSessionBadgeFromLiveSession === 'function') window.refreshCurrentSessionBadgeFromLiveSession();
      if (window.AutocomNotifications) {
        window.AutocomNotifications.push('task', 'Snapshot saved', tileStates.length + ' parameters logged to this session’s event history.');
      }
    });
  }

  searchInput.addEventListener('input', function () {
    renderChecklist(searchInput.value);
  });

  dialog.addEventListener('close', stopLiveUpdates);

  window.openDataListsModal = function (systemId) {
    const library = getDataListsLibrary();
    currentParams = library[systemId] || [];
    if (currentParams.length === 0) return;

    selected = [];
    searchInput.value = '';
    liveView.classList.add('hidden');
    pickView.classList.remove('hidden');
    updatePickState();

    dialog.showModal();
  };

  // Inject a "Live data" trigger button into every curated system's row (collapse-title), before
  // its status-indicator area — same relative+z-10 fix as the DTC badges/subsystem rows need,
  // since DaisyUI's collapse-arrow checkbox otherwise intercepts real clicks at that position.
  function injectTriggers() {
    const library = getDataListsLibrary();
    Object.keys(library).forEach(function (systemId) {
      const row = document.querySelector('.system-list-item[data-system-id="' + systemId + '"] .collapse-title');
      if (!row || row.querySelector('[data-data-lists-trigger]')) return;
      const statusArea = row.querySelector('.system-item-status');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-data-lists-trigger', '');
      btn.className = 'relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-base-content/50 hover:text-primary hover:bg-base-200 shrink-0';
      btn.title = 'Live data';
      btn.setAttribute('aria-label', 'Live data for this system');
      // Inline chart-line glyph (mirrors icons/chart-line.svg) — JS-injected buttons have no
      // access to the server-rendered icon macro, same approach as this file's sparkline SVGs.
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-4 4"/></svg>';
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        window.openDataListsModal(systemId);
      });
      row.insertBefore(btn, statusArea);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTriggers);
  } else {
    injectTriggers();
  }
})();
