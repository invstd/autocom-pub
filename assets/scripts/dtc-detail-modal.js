// DTC drill-down modal — populates dtc-detail-modal.njk from window.AutocomDtcLibrary at click
// time. See that file's header comment for the overall shape/intent.
(function () {
  const dialog = document.getElementById('dtc-detail-dialog');
  if (!dialog) return;

  const codeEl = dialog.querySelector('[data-dtc-code]');
  const titleEl = dialog.querySelector('[data-dtc-code-title]');
  const tagsEl = dialog.querySelector('[data-dtc-tags]');
  const summaryEl = dialog.querySelector('[data-dtc-summary]');
  const ecuRow = dialog.querySelector('[data-dtc-ecu-row]');
  const ecuEl = dialog.querySelector('[data-dtc-ecu]');
  const categoryRow = dialog.querySelector('[data-dtc-category-row]');
  const categoryEl = dialog.querySelector('[data-dtc-category]');
  const statusRow = dialog.querySelector('[data-dtc-status-row]');
  const statusEl = dialog.querySelector('[data-dtc-status]');
  const detailsEl = dialog.querySelector('[data-dtc-details]');
  const statusNoteEl = dialog.querySelector('[data-dtc-status-note]');
  const statusNoteTextEl = dialog.querySelector('[data-dtc-status-note-text]');
  const freezeFrameBody = dialog.querySelector('[data-dtc-freeze-frame-body]');
  const additionalInfoWrap = dialog.querySelector('[data-dtc-additional-info-wrap]');
  const additionalInfoBody = dialog.querySelector('[data-dtc-additional-info-body]');
  const causesList = dialog.querySelector('[data-dtc-causes-list]');
  const testSection = dialog.querySelector('[data-dtc-component-test]');
  const testTitle = dialog.querySelector('[data-dtc-test-title]');
  const testSubtitle = dialog.querySelector('[data-dtc-test-subtitle]');
  const testSteps = dialog.querySelector('[data-dtc-test-steps]');
  const testDiagram = dialog.querySelector('[data-dtc-connector-diagram]');
  const testRange = dialog.querySelector('[data-dtc-test-range]');
  const testFail = dialog.querySelector('[data-dtc-test-fail]');
  const testPinoutBody = dialog.querySelector('[data-dtc-test-pinout-body]');

  // Accordion: plain show/hide, no daisyUI radio/checkbox collapse needed for a handful of sections.
  dialog.querySelectorAll('[data-accordion-toggle]').forEach(function (toggle) {
    toggle.addEventListener('click', function () {
      const section = toggle.closest('[data-accordion]');
      const content = section.querySelector('[data-accordion-content]');
      const chevron = toggle.querySelector('svg');
      const isOpen = !content.classList.contains('hidden');
      content.classList.toggle('hidden', isOpen);
      if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
    });
  });

  function connectorDiagramSvg(pinCount, highlightPins) {
    const spacing = 28;
    const width = spacing * (pinCount - 1) + 40;
    const highlighted = new Set(highlightPins || []);
    let pins = '';
    for (let i = 0; i < pinCount; i++) {
      const pinNum = i + 1;
      const x = 20 + i * spacing;
      const isHighlighted = highlighted.has(pinNum);
      pins += '<g>' +
        '<circle cx="' + x + '" cy="34" r="7" fill="none" stroke="currentColor" stroke-width="2" class="' + (isHighlighted ? 'text-primary' : 'text-base-content/40') + '"/>' +
        '<text x="' + x + '" y="52" text-anchor="middle" font-size="9" fill="currentColor" class="' + (isHighlighted ? 'text-primary font-semibold' : 'text-base-content/50') + '">' + pinNum + '</text>' +
        '</g>';
    }
    return '<svg viewBox="0 0 ' + width + ' 56" class="w-full h-auto text-base-content" aria-hidden="true">' +
      '<path d="M6 8 H' + (width - 6) + ' L' + (width - 14) + ' 42 H14 Z" fill="none" stroke="currentColor" stroke-width="2" class="text-base-content/20"/>' +
      pins +
      '</svg>';
  }

  // Active/Pending = current in some form → error/warning-toned; Stored/Intermittent/Unknown =
  // historical or unconfirmed → neutral. Matches the severity language used everywhere else in
  // this app (see diagnostics-dashboard.js's badge classes).
  const STATUS_BADGE_CLASS = {
    Active: 'badge-error',
    Pending: 'badge-warning',
    Intermittent: 'badge-warning',
    Stored: 'badge-ghost',
    Unknown: 'badge-ghost'
  };

  function renderKeyValueRows(tbody, rows) {
    tbody.innerHTML = '';
    (rows || []).forEach(function (r) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="text-base-content/60">' + r.label + '</td>' +
        '<td class="font-medium">' + r.value + '</td>';
      tbody.appendChild(tr);
    });
  }

  function renderFreezeFrame(fields) {
    freezeFrameBody.innerHTML = '';
    (fields || []).forEach(function (f) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="text-base-content/60">' + f.label + '</td>' +
        '<td class="font-medium">' + f.value + '</td>' +
        '<td class="text-base-content/50">' + (f.unit || '') + '</td>';
      freezeFrameBody.appendChild(tr);
    });
  }

  function renderComponentTest(test) {
    if (!test) {
      testSection.classList.add('hidden');
      return;
    }
    testTitle.textContent = test.title;
    testSubtitle.textContent = test.subtitle || '';
    testSteps.innerHTML = '';
    (test.steps || []).forEach(function (step) {
      const li = document.createElement('li');
      li.textContent = step;
      testSteps.appendChild(li);
    });
    testDiagram.innerHTML = connectorDiagramSvg(test.pinCount, test.highlightPins);
    testRange.textContent = test.expectedRange;
    testFail.textContent = test.failMessage;
    testPinoutBody.innerHTML = '';
    (test.pinout || []).forEach(function (p) {
      const tr = document.createElement('tr');
      const isHighlighted = (test.highlightPins || []).includes(p.pin);
      tr.innerHTML = '<td class="' + (isHighlighted ? 'text-primary font-semibold' : '') + '">' + p.pin + '</td>' +
        '<td>' + p.label + '</td>';
      testPinoutBody.appendChild(tr);
    });
    testSection.classList.remove('hidden');
  }

  function renderCauses(causes) {
    causesList.innerHTML = '';
    testSection.classList.add('hidden');
    (causes || []).forEach(function (cause) {
      const row = document.createElement(cause.componentTest ? 'button' : 'div');
      if (cause.componentTest) row.type = 'button';
      row.className = 'flex items-center justify-between gap-3 px-3 py-2 rounded-btn text-sm ' +
        (cause.componentTest ? 'hover:bg-base-200 cursor-pointer text-left w-full' : 'text-base-content/70');
      row.innerHTML = '<span>' + cause.name + '</span>' +
        '<span class="badge badge-sm badge-ghost">' + cause.faultFrequency + '%</span>';
      if (cause.componentTest) {
        row.addEventListener('click', function () {
          causesList.querySelectorAll('button').forEach(function (b) { b.classList.remove('bg-base-200'); });
          row.classList.add('bg-base-200');
          renderComponentTest(cause.componentTest);
          testSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
      causesList.appendChild(row);
    });
  }

  window.openDtcDetailModal = function (code, systemId) {
    // Vehicle-type-scoped, same as diagnostics-dashboard.js's getDtcLibraryForVehicleType — Cars
    // and Trucks can both have an "engine" systemId that isn't the same real system.
    const isTrucksMode = localStorage.getItem('automechanika-vehicle-type') === 'trucks';
    const library = (window.AutocomDtcLibrary || {})[isTrucksMode ? 'trucks' : 'cars'] || {};
    const entries = library[systemId] || [];
    const entry = entries.find(function (e) { return e.code === code; });
    if (!entry) return;

    codeEl.textContent = entry.code;
    titleEl.textContent = entry.title;
    tagsEl.innerHTML = '';
    (entry.tags || []).forEach(function (tag) {
      const span = document.createElement('span');
      span.className = tag.variant ? `badge badge-sm badge-${tag.variant}` : 'badge badge-sm badge-outline';
      span.textContent = tag.label;
      tagsEl.appendChild(span);
    });

    if (entry.ecu) { ecuEl.textContent = entry.ecu; ecuRow.classList.remove('hidden'); } else { ecuRow.classList.add('hidden'); }
    if (entry.systemCategory) { categoryEl.textContent = entry.systemCategory; categoryRow.classList.remove('hidden'); } else { categoryRow.classList.add('hidden'); }
    if (entry.status) {
      statusEl.textContent = entry.status;
      statusEl.className = 'badge badge-sm ' + (STATUS_BADGE_CLASS[entry.status] || 'badge-ghost');
      statusRow.classList.remove('hidden');
    } else { statusRow.classList.add('hidden'); }
    if (entry.details) { detailsEl.textContent = entry.details; detailsEl.classList.remove('hidden'); } else { detailsEl.classList.add('hidden'); }
    if (entry.statusNote) {
      statusNoteTextEl.textContent = entry.statusNote;
      statusNoteEl.classList.remove('hidden');
    } else { statusNoteEl.classList.add('hidden'); }

    if (entry.summary) {
      summaryEl.textContent = entry.summary;
      summaryEl.classList.remove('hidden');
    } else {
      summaryEl.classList.add('hidden');
    }

    renderFreezeFrame(entry.freezeFrame);
    if (entry.additionalInfo && entry.additionalInfo.length) {
      renderKeyValueRows(additionalInfoBody, entry.additionalInfo);
      additionalInfoWrap.classList.remove('hidden');
    } else {
      additionalInfoWrap.classList.add('hidden');
    }
    renderCauses(entry.causes);

    // Both sections start collapsed, matching the source app's default state.
    dialog.querySelectorAll('[data-accordion-content]').forEach(function (c) { c.classList.add('hidden'); });
    dialog.querySelectorAll('[data-accordion-toggle] svg').forEach(function (svg) { svg.style.transform = ''; });

    dialog.showModal();
  };
})();
