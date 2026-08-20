// Report Composer (generate-report.njk): binds the left-panel form to the Live Preview pane and
// to localStorage, via the shared load/save/apply helpers in report-shared.js. The preview pane
// is a second instance of the exact same markup the printable page (session-report.njk) renders
// (session-report-body.njk), so applyState() works identically on both — same DOM contract, two
// different consumers.
(function () {
  var root = document.querySelector('.report-composer');
  if (!root) return;

  var slug = root.getAttribute('data-report-slug');
  var reportUrl = root.getAttribute('data-report-url');
  var previewRoot = document.querySelector('[data-report-preview-root]');
  var defaults = JSON.parse(document.getElementById('report-defaults-data').textContent);
  var state = window.AutocomReportShared.loadState(slug, defaults);

  var fileNameInput = document.getElementById('report-input-filename');
  var mechanicInput = document.getElementById('report-input-mechanic');
  var dateInput = document.getElementById('report-input-date');
  var customerNameInput = document.getElementById('report-input-customer-name');
  var customerPhoneInput = document.getElementById('report-input-customer-phone');
  var notesInput = document.getElementById('report-input-notes');
  var includedCountEl = document.querySelector('[data-events-included-count]');

  function countIncluded() {
    var n = 0;
    Object.keys(state.events).forEach(function (i) { if (state.events[i].included) n++; });
    return n;
  }

  function render() {
    fileNameInput.value = state.fileName;
    mechanicInput.value = state.mechanic;
    dateInput.value = state.date;
    customerNameInput.value = state.customerName;
    customerPhoneInput.value = state.customerPhone;
    notesInput.value = state.notes;

    root.querySelectorAll('[data-event-include]').forEach(function (cb) {
      var ev = state.events[cb.getAttribute('data-event-include')];
      cb.checked = !!(ev && ev.included);
    });
    root.querySelectorAll('[data-event-billable]').forEach(function (btn) {
      var ev = state.events[btn.getAttribute('data-event-billable')];
      var billable = !!(ev && ev.billable);
      btn.textContent = billable ? 'Billable' : 'No charge';
      btn.classList.toggle('badge-success', billable);
      btn.classList.toggle('badge-ghost', !billable);
      btn.setAttribute('aria-pressed', String(billable));
    });
    if (includedCountEl) includedCountEl.textContent = countIncluded();

    window.AutocomReportShared.applyState(previewRoot, state);
  }

  function renderAndSave() {
    render();
    window.AutocomReportShared.saveState(slug, state);
  }

  fileNameInput.addEventListener('input', function () { state.fileName = fileNameInput.value; renderAndSave(); });
  mechanicInput.addEventListener('input', function () { state.mechanic = mechanicInput.value; renderAndSave(); });
  dateInput.addEventListener('input', function () { state.date = dateInput.value; renderAndSave(); });
  customerNameInput.addEventListener('input', function () { state.customerName = customerNameInput.value; renderAndSave(); });
  customerPhoneInput.addEventListener('input', function () { state.customerPhone = customerPhoneInput.value; renderAndSave(); });
  notesInput.addEventListener('input', function () { state.notes = notesInput.value; renderAndSave(); });

  root.querySelectorAll('[data-event-include]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      state.events[cb.getAttribute('data-event-include')].included = cb.checked;
      renderAndSave();
    });
  });
  root.querySelectorAll('[data-event-billable]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var ev = state.events[btn.getAttribute('data-event-billable')];
      ev.billable = !ev.billable;
      renderAndSave();
    });
  });

  var saveBtn = document.getElementById('report-save-btn');
  var printBtn = document.getElementById('report-print-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      window.AutocomReportShared.saveState(slug, state);
      location.href = reportUrl;
    });
  }
  if (printBtn) {
    printBtn.addEventListener('click', function () {
      window.AutocomReportShared.saveState(slug, state);
      location.href = reportUrl + '?print=1';
    });
  }
  // Export is intentionally inert — in the real product it prompts an email/PDF/CSV/XML export
  // dialog, not needed for this prototype yet (per Vedran).

  render();
})();
