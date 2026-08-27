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
  const causesInfoBtn = dialog.querySelector('[data-dtc-causes-info]');
  const causesBreakdownWrap = dialog.querySelector('[data-dtc-causes-breakdown]');
  const causesBreakdownTitle = dialog.querySelector('[data-dtc-causes-breakdown-title]');
  const causesBreakdownList = dialog.querySelector('[data-dtc-causes-breakdown-list]');
  const referenceValuesWrap = dialog.querySelector('[data-dtc-reference-values-wrap]');
  const referenceValuesList = dialog.querySelector('[data-dtc-reference-values-list]');
  const notesWrap = dialog.querySelector('[data-dtc-notes-wrap]');
  const notesList = dialog.querySelector('[data-dtc-notes-list]');
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

  // Inline icon paths for cause tiles — same "hand-inline a few icons for JS-injected content"
  // approach data-lists-modal.js's chart-line trigger already uses (this modal isn't included on
  // a page with icon-pool.njk's clone-from-pool machinery, so that's not an option here).
  const CAUSE_ICON_PATHS = {
    droplet: '<path d="M11.9999 2.68994L17.6599 8.34994C18.7792 9.46855 19.5417 10.894 19.8508 12.446C20.1599 13.998 20.0018 15.6068 19.3964 17.0689C18.7911 18.531 17.7657 19.7808 16.45 20.66C15.1343 21.5393 13.5874 22.0086 12.0049 22.0086C10.4224 22.0086 8.87549 21.5393 7.55978 20.66C6.24407 19.7808 5.2187 18.531 4.61335 17.0689C4.008 15.6068 3.84988 13.998 4.15899 12.446C4.46809 10.894 5.23054 9.46855 6.34989 8.34994L11.9999 2.68994Z"/>',
    wind: '<path d="M9.59 4.58998C9.82231 4.3563 10.1088 4.18363 10.4239 4.08732C10.739 3.99102 11.073 3.97407 11.3963 4.03797C11.7195 4.10188 12.022 4.24466 12.2768 4.45363C12.5315 4.66259 12.7307 4.93127 12.8566 5.23578C12.9825 5.54028 13.0313 5.87117 12.9985 6.19905C12.9657 6.52692 12.8524 6.84161 12.6687 7.11514C12.4849 7.38868 12.2365 7.61258 11.9454 7.76695C11.6542 7.92132 11.3295 8.00137 11 7.99998H2M12.59 19.41C12.8223 19.6437 13.1088 19.8163 13.4239 19.9126C13.739 20.0089 14.073 20.0259 14.3963 19.962C14.7195 19.8981 15.022 19.7553 15.2768 19.5463C15.5315 19.3374 15.7307 19.0687 15.8566 18.7642C15.9825 18.4597 16.0313 18.1288 15.9985 17.8009C15.9657 17.473 15.8524 17.1584 15.6687 16.8848C15.4849 16.6113 15.2365 16.3874 14.9454 16.233C14.6542 16.0786 14.3295 15.9986 14 16H2M17.73 7.72998C18.0208 7.43987 18.3787 7.2259 18.7719 7.10699C19.1652 6.98809 19.5816 6.96792 19.9845 7.04827C20.3874 7.12861 20.7642 7.307 21.0817 7.56765C21.3993 7.8283 21.6477 8.16318 21.805 8.54267C21.9623 8.92217 22.0236 9.33458 21.9836 9.74343C21.9436 10.1523 21.8035 10.545 21.5756 10.8868C21.3477 11.2286 21.0391 11.509 20.6771 11.7031C20.3151 11.8973 19.9108 11.9992 19.5 12H2"/>',
    'hard-drive': '<path d="M22 12H2M22 12V18C22 18.5304 21.7893 19.0391 21.4142 19.4142C21.0391 19.7893 20.5304 20 20 20H4C3.46957 20 2.96086 19.7893 2.58579 19.4142C2.21071 19.0391 2 18.5304 2 18V12M22 12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11L2 12M6 16H6.01M10 16H10.01"/>'
  };

  function causeIconSvg(name) {
    if (!CAUSE_ICON_PATHS[name]) return '';
    return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + CAUSE_ICON_PATHS[name] + '</svg>';
  }

  // Same 270°-arc technique as health-gauge.njk/diagnostics-dashboard.js's setGaugeResult, scaled
  // to this modal's smaller single-value tiles (see main.css's .dtc-cause-gauge-* rules).
  function causeGaugeSvg(percent) {
    const size = 84;
    const thickness = 8;
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const arcLength = circumference * 0.75;
    const progressLength = (Math.max(0, Math.min(100, percent)) / 100) * arcLength;
    const center = size / 2;
    return '<svg class="dtc-cause-gauge-svg" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + percent + '%">' +
      '<circle class="dtc-cause-gauge-track" cx="' + center + '" cy="' + center + '" r="' + radius + '" fill="none" ' +
        'stroke-dasharray="' + arcLength + ' ' + circumference + '" transform="rotate(135 ' + center + ' ' + center + ')"/>' +
      '<circle class="dtc-cause-gauge-progress" cx="' + center + '" cy="' + center + '" r="' + radius + '" fill="none" ' +
        'stroke-dasharray="' + progressLength + ' ' + circumference + '" transform="rotate(135 ' + center + ' ' + center + ')"/>' +
      '</svg>';
  }

  function renderCausesBreakdown(cause) {
    causesBreakdownTitle.textContent = cause.name + ' — cause probability';
    causesBreakdownList.innerHTML = '';
    cause.breakdown.forEach(function (b) {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between px-3 py-1.5 text-sm border-t border-base-200';
      row.innerHTML = '<span class="text-base-content/80">' + b.name + '</span><span class="font-medium">' + b.percent + '%</span>';
      causesBreakdownList.appendChild(row);
    });
  }

  function renderCauses(causes) {
    causesList.innerHTML = '';
    testSection.classList.add('hidden');
    causesInfoBtn.classList.add('hidden');
    causesBreakdownWrap.classList.add('hidden');
    causesInfoBtn.onclick = null;

    (causes || []).forEach(function (cause) {
      const tile = document.createElement(cause.componentTest ? 'button' : 'div');
      if (cause.componentTest) tile.type = 'button';
      tile.className = 'dtc-cause-gauge-tile flex flex-col items-center gap-1.5 py-2 px-1 rounded-box ' +
        (cause.componentTest ? 'hover:bg-base-200 cursor-pointer' : '');
      tile.innerHTML =
        '<div class="dtc-cause-gauge">' +
          causeGaugeSvg(cause.faultFrequency) +
          '<div class="dtc-cause-gauge-center">' +
            causeIconSvg(cause.icon) +
            '<span class="dtc-cause-gauge-value">' + cause.faultFrequency + '%</span>' +
          '</div>' +
        '</div>' +
        '<span class="text-xs text-center text-base-content/70 leading-tight">' + cause.name + '</span>';
      if (cause.componentTest) {
        tile.addEventListener('click', function () {
          causesList.querySelectorAll('.dtc-cause-gauge-tile').forEach(function (t) { delete t.dataset.selected; });
          tile.dataset.selected = 'true';
          renderComponentTest(cause.componentTest);
          testSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
      causesList.appendChild(tile);

      if (cause.breakdown && cause.breakdown.length) {
        causesInfoBtn.classList.remove('hidden');
        causesInfoBtn.onclick = function () {
          const willShow = causesBreakdownWrap.classList.contains('hidden');
          if (willShow) renderCausesBreakdown(cause);
          causesBreakdownWrap.classList.toggle('hidden', !willShow);
        };
      }
    });
  }

  function renderReferenceValues(referenceValues) {
    if (!referenceValues || !referenceValues.length) {
      referenceValuesWrap.classList.add('hidden');
      return;
    }
    referenceValuesWrap.classList.remove('hidden');
    referenceValuesList.innerHTML = '';
    referenceValues.forEach(function (cond) {
      const section = document.createElement('div');
      section.className = 'border border-base-200 rounded-box overflow-hidden';
      const flagged = !!(cond.hasData && cond.hasIssue);
      section.innerHTML =
        '<button type="button" class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-base-content cursor-pointer" data-ref-toggle>' +
          '<span>' + cond.condition + '</span>' +
          '<span class="flex items-center gap-2">' +
            (flagged ? '<span class="badge badge-error badge-xs">!</span>' : '') +
            '<svg class="w-4 h-4 shrink-0 text-base-content/50 transition-transform" data-ref-chevron viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>' +
          '</span>' +
        '</button>' +
        '<div class="hidden px-3 pb-3 flex flex-col" data-ref-content></div>';
      const content = section.querySelector('[data-ref-content]');
      if (cond.hasData && cond.params && cond.params.length) {
        cond.params.forEach(function (p) {
          const row = document.createElement('div');
          row.className = 'flex items-center justify-between gap-3 py-2 border-b border-base-200 last:border-b-0 text-sm';
          row.innerHTML =
            '<span class="min-w-0">' +
              '<span class="block text-base-content">' + p.label + '</span>' +
              (p.sublabel ? '<span class="block text-xs text-base-content/50">' + p.sublabel + '</span>' : '') +
            '</span>' +
            '<span class="text-right shrink-0">' +
              '<span class="inline-flex items-baseline gap-1.5">' +
                (p.status ? '<span class="badge badge-error badge-outline badge-xs">' + p.status + '</span>' : '') +
                '<span class="font-semibold text-error">' + p.value + '</span>' +
              '</span>' +
              (p.normalRange ? '<span class="block text-xs text-base-content/50">' + p.normalRange + '</span>' : '') +
            '</span>';
          content.appendChild(row);
        });
      } else {
        content.innerHTML = '<p class="text-xs text-base-content/50 py-2">No reference data recorded for this condition.</p>';
      }
      const toggle = section.querySelector('[data-ref-toggle]');
      const chevron = section.querySelector('[data-ref-chevron]');
      toggle.addEventListener('click', function () {
        const isOpen = !content.classList.contains('hidden');
        content.classList.toggle('hidden', isOpen);
        chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
      });
      referenceValuesList.appendChild(section);
    });
  }

  function renderNotes(notes) {
    if (!notes || !notes.length) {
      notesWrap.classList.add('hidden');
      return;
    }
    notesWrap.classList.remove('hidden');
    notesList.innerHTML = '';
    notes.forEach(function (n) {
      const card = document.createElement('div');
      card.className = 'border border-base-200 rounded-box p-3';
      card.innerHTML =
        '<div class="flex items-center justify-between gap-2 mb-1">' +
          '<span class="flex items-center gap-1 text-sm font-medium text-base-content">' +
            n.author +
            (n.verified ? '<svg class="w-3.5 h-3.5 text-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Verified"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>' : '') +
          '</span>' +
          '<span class="text-xs text-base-content/50 shrink-0">' + n.timestamp + '</span>' +
        '</div>' +
        '<p class="text-sm text-base-content/80 mb-2">' + n.text + '</p>' +
        '<div class="flex items-center gap-4 text-xs text-base-content/60">' +
          '<span class="flex items-center gap-1">▲ ' + n.upvotes + '</span>' +
          '<span class="flex items-center gap-1">▽ ' + n.downvotes + '</span>' +
        '</div>';
      notesList.appendChild(card);
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
    renderReferenceValues(entry.referenceValues);
    renderNotes(entry.notes);

    // All sections start collapsed, matching the source app's default state.
    dialog.querySelectorAll('[data-accordion-content]').forEach(function (c) { c.classList.add('hidden'); });
    dialog.querySelectorAll('[data-accordion-toggle] svg').forEach(function (svg) { svg.style.transform = ''; });

    dialog.showModal();
  };
})();
