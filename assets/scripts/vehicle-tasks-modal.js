// Vehicle Tasks customize modal — grid + checklist are both driven from a hidden, server-rendered
// pool of tiles (data-vehicle-tasks-pool) rather than a separate JS data file, so icons/labels
// stay defined in exactly one place (the vehicleTaskTile macro call in each page's template) and
// this script only has to read/clone DOM, never re-implement icon markup. Works on both Cars and
// Trucks diagnostics dashboards; vehicle type only affects the localStorage key used.
(function () {
  const pool = document.querySelector('[data-vehicle-tasks-pool]');
  const grid = document.querySelector('[data-vehicle-tasks-grid]');
  if (!pool || !grid) return;

  const dialog = document.getElementById('vehicle-tasks-dialog');
  const checklist = dialog ? dialog.querySelector('[data-vehicle-tasks-checklist]') : null;
  const selectAllCheckbox = dialog ? dialog.querySelector('[data-vehicle-tasks-select-all]') : null;
  const selectAllLabel = dialog ? dialog.querySelector('[data-vehicle-tasks-select-all-label]') : null;

  const vehicleType = localStorage.getItem('automechanika-vehicle-type') === 'trucks' ? 'trucks' : 'cars';
  const STORAGE_KEY = 'automechanika-vehicle-tasks-' + vehicleType;

  const poolItems = Array.from(pool.querySelectorAll('[data-task-id]')).filter(function (el) {
    return !el.hasAttribute('data-customize-tile');
  });
  const customizeNode = pool.querySelector('[data-customize-tile]');

  function getSelectedIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : null;
      if (Array.isArray(arr)) return arr;
    } catch (e) {}
    return poolItems
      .filter(function (el) { return el.getAttribute('data-default') === 'true'; })
      .map(function (el) { return el.getAttribute('data-task-id'); });
  }

  function setSelectedIds(ids) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); } catch (e) {}
  }

  function cloneTile(wrapper) {
    return wrapper.firstElementChild.cloneNode(true);
  }

  function renderGrid() {
    const selectedIds = getSelectedIds();
    grid.innerHTML = '';
    selectedIds.forEach(function (id) {
      const wrapper = poolItems.find(function (el) { return el.getAttribute('data-task-id') === id; });
      if (wrapper) grid.appendChild(cloneTile(wrapper));
    });
    if (customizeNode) grid.appendChild(cloneTile(customizeNode));
  }

  function updateSelectAllState() {
    if (!selectAllCheckbox) return;
    const checked = getSelectedIds().length;
    const total = poolItems.length;
    if (checked === 0) {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = false;
    } else if (checked === total) {
      selectAllCheckbox.checked = true;
      selectAllCheckbox.indeterminate = false;
    } else {
      selectAllCheckbox.checked = false;
      selectAllCheckbox.indeterminate = true;
    }
    if (selectAllLabel) selectAllLabel.textContent = selectAllCheckbox.checked ? 'Unselect all' : 'Select all';
  }

  function renderChecklist() {
    if (!checklist) return;
    const selectedIds = getSelectedIds();
    checklist.innerHTML = '';
    poolItems.forEach(function (wrapper) {
      const id = wrapper.getAttribute('data-task-id');
      // Direct-child combinator matters: the icon slot is itself a <span> wrapping icon.njk's own
      // <span>, so a plain descendant `span:last-child` selector matches that nested icon span
      // (earlier in document order) before the actual label span, via querySelector's first-match
      // semantics — silently rendering blank checklist rows instead of throwing.
      const labelText = wrapper.querySelector('.vehicle-task-tile > span:last-child').textContent;
      const isChecked = selectedIds.indexOf(id) !== -1;
      const row = document.createElement('label');
      row.className = 'flex items-center gap-2 px-1 py-1.5 border-b border-base-200 last:border-b-0 cursor-pointer hover:bg-base-200';
      row.innerHTML = '<input type="checkbox" class="checkbox checkbox-sm" ' + (isChecked ? 'checked' : '') + '/>' +
        '<span class="text-sm">' + labelText + '</span>';
      row.querySelector('input').addEventListener('change', function (e) {
        let ids = getSelectedIds();
        if (e.target.checked) {
          if (ids.indexOf(id) === -1) ids.push(id);
        } else {
          ids = ids.filter(function (x) { return x !== id; });
        }
        setSelectedIds(ids);
        renderGrid();
        updateSelectAllState();
      });
      checklist.appendChild(row);
    });
  }

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function () {
      const ids = selectAllCheckbox.checked
        ? poolItems.map(function (el) { return el.getAttribute('data-task-id'); })
        : [];
      setSelectedIds(ids);
      renderGrid();
      renderChecklist();
      updateSelectAllState();
    });
  }

  window.openVehicleTasksModal = function () {
    if (!dialog) return;
    renderChecklist();
    updateSelectAllState();
    dialog.showModal();
  };

  renderGrid();
})();
