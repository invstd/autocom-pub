(function() {
// ===== Vehicle Data from URL Params =====
// Read vehicle info from URL params (passed from VCI pairing flow)
const urlParams = new URLSearchParams(window.location.search);
const vehicleData = {
  vin: urlParams.get('vin') || '',
  brand: urlParams.get('brand') || '',
  brandSlug: urlParams.get('brandSlug') || '',
  model: urlParams.get('model') || '',
  year: urlParams.get('year') || '',
  engine: urlParams.get('engine') || ''
};

// Vehicle image mapping - maps brand/model to available image files
// Keys use URL brand param (dataSlug, e.g. fiat, alfa_romeo). Model slugs: lowercase, spaces → hyphens.
const vehicleImageMap = {
  "volkswagen": {
    "touareg": "Volkswagen_Touareg_2023.png",
    "golf": "Volkswagen_Golf_2024.png",
    "golf-2018": "Volkswagen_Golf__2018.png",
    "t-cross": "Volkswagen_T-Cross_2022.png",
    "_default": "Volkswagen_Touareg_2023.png"
  },
  "audi": {
    "a3": "Audi_A3_sedan_2024.png",
    "a4": "Audi_A4_2017.png",
    "a6": "Audi_A6_sedan_S-Line_2023.png",
    "_default": "Audi_A6_sedan_S-Line_2023.png"
  },
  "bmw": {
    "_default": "Volkswagen_Touareg_2023.png"
  },
  "mercedes-benz": {
    "_default": "Volkswagen_Touareg_2023.png"
  },
  "toyota": {
    "corolla": "Toyota_Corolla_E210_sedan_Hybrid_2019.png",
    "corolla-e210-hybrid": "Toyota_Corolla_E210_hybrid_2018.png",
    "_default": "Toyota_Corolla_E210_sedan_Hybrid_2019.png"
  },
  "ford": {
    "focus": "Ford_Focus_Titanium_2018.png",
    "focus-st-line": "Ford_Focus_ST_Line_2018.png",
    "focus-titanium": "Ford_Focus_Titanium_2018.png",
    "_default": "Ford_Focus_Titanium_2018.png"
  },
  "opel": {
    "astra": "Opel_Astra_K_2016.png",
    "astra-k": "Opel_Astra_K_2016.png",
    "astra-l-hybrid": "Opel_Astra_L_Hybrid_2021.png",
    "_default": "Opel_Astra_K_2016.png"
  },
  "skoda": {
    "octavia": "Skoda_Octavia_liftback_2013.png",
    "octavia-5e": "Skoda_Octavia_5E_liftback_2017.png",
    "octavia-1z": "Skoda_Octavia_1Z_liftback_2005.png",
    "_default": "Skoda_Octavia_liftback_2013.png"
  },
  "renault": {
    "megane": "Renault_Megane_hatchback_2014.png",
    "megane-hatchback": "Renault_Megane_hatchback_2014.png",
    "megane-sedan": "Renault_Megane_sedan_2020.png",
    "clio": "Renault_Megane_hatchback_2014.png",
    "_default": "Renault_Megane_hatchback_2014.png"
  },
  "peugeot": {
    "308": "Peugeot_308_T9_2017.png",
    "308-t9": "Peugeot_308_T9_2017.png",
    "308-t9-sedan": "Peugeot_308_T9_sedan_2017.png",
    "308-p5-hybrid": "Peugeot_308_P5_HYBRID_2021.png",
    "_default": "Peugeot_308_T9_2017.png"
  },
  "hyundai": {
    "i30": "Hyundai_i30_PD_2024.png",
    "i30-pd": "Hyundai_i30_PD_2024.png",
    "i30-gd": "Hyundai_i30_GD_2015.png",
    "_default": "Hyundai_i30_PD_2024.png"
  },
  "kia": {
    "ceed": "Kia_Ceed_hatchback_2018.png",
    "sportage": "Kia_Ceed_hatchback_2018.png",
    "_default": "Kia_Ceed_hatchback_2018.png"
  },
  "volvo": {
    "xc60": "Volvo_XC60_T6_2017.png",
    "xc40": "Volvo_XC60_T6_2017.png",
    "v60": "Volvo_V60_D4_2015.png",
    "_default": "Volvo_XC60_T6_2017.png"
  },
  "mazda": {
    "mazda3": "Mazda_3_sedan_2019.png",
    "3": "Mazda_3_sedan_2019.png",
    "cx-5": "Mazda_3_sedan_2019.png",
    "_default": "Mazda_3_sedan_2019.png"
  },
  "honda": {
    "civic": "Honda_Civic_coupe_2016.png",
    "cr-v": "Honda_Civic_coupe_2016.png",
    "_default": "Honda_Civic_coupe_2016.png"
  },
  "nissan": {
    "qashqai": "Nissan_Qashqai_2017.png",
    "_default": "Nissan_Qashqai_2017.png"
  },
  "dacia": {
    "duster": "Dacia_Duster_Extreme_2024.png",
    "sandero": "Dacia_Sandero_2021.png",
    "_default": "Dacia_Sandero_2021.png"
  },
  "seat": {
    "leon": "Seat_Leon_FR_eHybrid_2020.png",
    "leon-5f-fr": "Seat_Leon_5F_FR_2016.png",
    "leon-fr-ehybrid": "Seat_Leon_FR_eHybrid_2020.png",
    "_default": "Seat_Leon_FR_eHybrid_2020.png"
  },
  "citroen": {
    "c3": "Citroen_C3_2017.png",
    "c3-l-sedan": "Citroen_C3_L_sedan_2020.png",
    "c4-cactus": "Citroen_C4_Cactus_2015.png",
    "c4-picasso": "Citroen_C4_Picasso_2016.png",
    "_default": "Citroen_C3_2017.png"
  },
  "fiat": {
    "argo": "Fiat_Argo_2017.png",
    "panda-cross": "Fiat_Panda_Cross_2014.png",
    "pulse-impetus": "Fiat_Pulse_Impetus_2021.png",
    "tipo": "Fiat_Tipo_2020.png",
    "_default": "Fiat_Tipo_2020.png"
  },
  "alfa_romeo": {
    "_default": "Volkswagen_Touareg_2023.png"
  },
  "_default": "Volkswagen_Touareg_2023.png"
};

function getVehicleImage(brandSlug, model) {
  const brandImages = vehicleImageMap[brandSlug] || vehicleImageMap["_default"];
  if (typeof brandImages === 'string') return brandImages;
  const modelSlug = (model || '').toLowerCase().replace(/\s+/g, '-');
  return brandImages[modelSlug] || brandImages["_default"] || vehicleImageMap["_default"];
}

// Update vehicle display if URL params are present
if (vehicleData.vin || vehicleData.model || vehicleData.brandSlug) {
  const brandLogo = document.querySelector('[data-vehicle-brand-logo]');
  const vehicleTitle = document.querySelector('[data-vehicle-title]');
  const vehicleVin = document.querySelector('[data-vehicle-vin]');
  const vehicleImage = document.querySelector('[data-vehicle-image]');
  
  // Brand logo: URL may pass dataSlug (e.g. alfa_romeo); image files use logoSlug (e.g. alfa-romeo)
  if (brandLogo && vehicleData.brandSlug) {
    const basePath = brandLogo.dataset.basePath || '/';
    const logoSlug = vehicleData.brandSlug.replace(/_/g, '-');
    brandLogo.src = basePath + 'assets/images/brands/' + logoSlug + '.png';
    brandLogo.alt = vehicleData.brand;
  }
  
  if (vehicleTitle && (vehicleData.model || vehicleData.year)) {
    const parts = [];
    if (vehicleData.model) parts.push(vehicleData.model);
    if (vehicleData.year) parts.push('(' + vehicleData.year + ')');
    vehicleTitle.textContent = parts.join(' ');
  }
  
  if (vehicleVin && vehicleData.vin) {
    vehicleVin.textContent = vehicleData.vin;
  }
  
  // Update vehicle image based on brand/model
  if (vehicleImage && vehicleData.brandSlug) {
    const basePath = vehicleImage.dataset.basePath || '/';
    const imageName = getVehicleImage(vehicleData.brandSlug, vehicleData.model);
    vehicleImage.src = basePath + 'assets/images/vehicles/' + imageName;
    vehicleImage.alt = vehicleData.brand + ' ' + vehicleData.model + (vehicleData.year ? ' ' + vehicleData.year : '');
  }
}

const page = document.querySelector('.diagnostics-dashboard-page');
const tabs = document.querySelector('[data-diagnostics-tabs]');
const scanBtn = document.querySelector('[data-scan-btn]');
const stopBtn = document.querySelector('[data-stop-btn]');
const filterControls = document.querySelector('[data-filter-controls]');
const errorsOnlyToggle = document.querySelector('[data-errors-only-toggle]');
const errorCountBadge = document.querySelector('[data-error-count]');
const clearDtcsBtn = document.querySelector('[data-clear-dtcs-btn]');

// Health gauge elements
const gauge = document.querySelector('.health-gauge');
const gaugeSvg = gauge ? gauge.querySelector('.health-gauge-svg') : null;
const gaugeProgress = gauge ? gauge.querySelector('.health-gauge-progress') : null;
const gaugeSegments = gauge ? gauge.querySelector('.health-gauge-segments') : null;
const gaugeValue = gauge ? gauge.querySelector('.health-gauge-value') : null;
const gaugeLabel = gauge ? gauge.querySelector('.health-gauge-label') : null;

// Throttle gauge elements
const throttleGauge = document.querySelector('.throttle-gauge');
const throttleNeedle = throttleGauge ? throttleGauge.querySelector('.throttle-gauge-needle') : null;

// Scan effect overlay
const scanEffect = document.querySelector('[data-scan-effect]');
const vciStatusBadge = document.getElementById('vci-status-indicator-badge');

// System selection elements
const systemPresets = document.querySelector('[data-system-presets]');
const scanCountEl = document.querySelector('[data-scan-count]');
const systemListWrapper = document.querySelector('[data-system-list-wrapper]');
const systemCheckboxes = document.querySelectorAll('.system-select-checkbox');
const masterCheckbox = document.querySelector('.system-master-checkbox');
const masterCheckboxLabel = document.getElementById('system-master-checkbox-label');
const collapseList = document.querySelector('.collapse-list');
let customModeActive = false;

if (!tabs || !page) return;

// Sample DTC codes for demo
const sampleDtcCodes = [
  'P0301', 'P0302', 'P0420', 'P0171', 'P0174', 'P0300', 'P0455', 'P0442',
  'B1234', 'B1001', 'B0100', 'C0035', 'C0040', 'C0050', 'U0100', 'U0121'
];

function getRandomDtcCodes(count) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(sampleDtcCodes[Math.floor(Math.random() * sampleDtcCodes.length)]);
  }
  return codes;
}

// ===== Health Gauge API =====

// Get gauge geometry from CSS variables
function getGaugeGeometry() {
  if (!gauge) return null;
  const style = getComputedStyle(gauge);
  return {
    size: parseFloat(style.getPropertyValue('--gauge-size')),
    thickness: parseFloat(style.getPropertyValue('--gauge-thickness')),
    radius: parseFloat(style.getPropertyValue('--gauge-radius')),
    circumference: parseFloat(style.getPropertyValue('--gauge-circumference')),
    arcLength: parseFloat(style.getPropertyValue('--gauge-arc-length'))
  };
}

// Reset gauge to idle state
function healthGaugeReset() {
  if (!gauge) return;
  gauge.dataset.state = 'idle';
  gauge.removeAttribute('data-health');
  if (gaugeProgress) {
    gaugeProgress.style.strokeDasharray = '0 9999';
  }
  if (gaugeSegments) {
    gaugeSegments.innerHTML = '';
  }
  if (gaugeValue) {
    gaugeValue.textContent = 'READY';
  }
  if (gaugeLabel) {
    gaugeLabel.textContent = '';
  }
  if (gaugeSvg) {
    gaugeSvg.setAttribute('aria-valuenow', '0');
  }
}

// Set gauge to scanning mode with progress 0-100
function healthGaugeSetProgress(value) {
  if (!gauge) return;
  const geo = getGaugeGeometry();
  if (!geo) return;
  
  gauge.dataset.state = 'scanning';
  gauge.removeAttribute('data-health');
  
  // Calculate progress arc length
  const progress = Math.max(0, Math.min(100, value));
  const progressArc = (progress / 100) * geo.arcLength;
  
  if (gaugeProgress) {
    gaugeProgress.style.strokeDasharray = `${progressArc} ${geo.circumference}`;
  }
  if (gaugeSegments) {
    gaugeSegments.innerHTML = '';
  }
  if (gaugeValue) {
    gaugeValue.textContent = `${Math.round(progress)}%`;
  }
  if (gaugeLabel) {
    gaugeLabel.textContent = 'Scanning';
  }
  if (gaugeSvg) {
    gaugeSvg.setAttribute('aria-valuenow', Math.round(progress));
  }
}

// Set gauge to result mode with health score and segments
// segments = [{ value: 80, color: 'success' }, { value: 15, color: 'warning' }, { value: 5, color: 'error' }]
function healthGaugeSetResult(score, segments) {
  if (!gauge) return;
  const geo = getGaugeGeometry();
  if (!geo) return;
  
  gauge.dataset.state = 'result';
  
  // Set health indicator for color
  if (score >= 80) {
    gauge.dataset.health = 'good';
  } else if (score >= 50) {
    gauge.dataset.health = 'warning';
  } else {
    gauge.dataset.health = 'error';
  }
  
  // Hide progress arc
  if (gaugeProgress) {
    gaugeProgress.style.strokeDasharray = '0 9999';
  }
  
  // Create segment arcs
  if (gaugeSegments) {
    gaugeSegments.innerHTML = '';
    
    const center = geo.size / 2;
    let currentOffset = 0;
    
    segments.forEach((seg, i) => {
      if (seg.value <= 0) return;
      
      const segmentArc = (seg.value / 100) * geo.arcLength;
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      
      circle.setAttribute('class', 'health-gauge-segment');
      circle.setAttribute('data-color', seg.color);
      circle.setAttribute('cx', center);
      circle.setAttribute('cy', center);
      circle.setAttribute('r', geo.radius);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke-width', geo.thickness);
      circle.setAttribute('stroke-linecap', i === segments.length - 1 ? 'round' : 'butt');
      circle.setAttribute('transform', `rotate(135 ${center} ${center})`);
      
      // Use stroke-dasharray and stroke-dashoffset for segment positioning
      circle.style.strokeDasharray = `${segmentArc} ${geo.circumference}`;
      circle.style.strokeDashoffset = `-${currentOffset}`;
      
      gaugeSegments.appendChild(circle);
      currentOffset += segmentArc;
    });
  }
  
  if (gaugeValue) {
    gaugeValue.textContent = Math.round(score);
  }
  if (gaugeLabel) {
    gaugeLabel.textContent = 'Scan Health Score';
  }
  if (gaugeSvg) {
    gaugeSvg.setAttribute('aria-valuenow', Math.round(score));
  }
}

// ===== Throttle Gauge API =====

let throttleAnimationId = null;
let throttleStartTime = 0;

// Reset throttle gauge to idle and stop animation
function throttleGaugeReset() {
  if (throttleAnimationId) {
    cancelAnimationFrame(throttleAnimationId);
    throttleAnimationId = null;
  }
  if (!throttleGauge) return;
  throttleGauge.dataset.state = 'idle';
  if (throttleNeedle) {
    const size = parseFloat(getComputedStyle(throttleGauge).getPropertyValue('--throttle-size')) || 40;
    const center = size / 2;
    throttleNeedle.setAttribute('transform', `rotate(-135 ${center} ${center})`);
  }
}

// Set throttle gauge value (0-100) - updates needle position
function throttleGaugeSetValue(value) {
  if (!throttleGauge || !throttleNeedle) return;
  throttleGauge.dataset.state = 'scanning';
  
  const size = parseFloat(getComputedStyle(throttleGauge).getPropertyValue('--throttle-size')) || 40;
  const center = size / 2;
  
  // Map 0-100 to -135 to +135 degrees (270 degree arc)
  const angle = -135 + (Math.max(0, Math.min(100, value)) / 100) * 270;
  throttleNeedle.setAttribute('transform', `rotate(${angle} ${center} ${center})`);
}

// Start continuous throttle animation (smooth wave pattern)
function throttleGaugeStartAnimation() {
  if (throttleAnimationId) return; // Already running
  throttleStartTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = (currentTime - throttleStartTime) / 1000; // seconds
    
    // Create smooth oscillating pattern:
    // - Primary wave: slow oscillation (period ~3s)
    // - Secondary wave: faster ripple (period ~0.8s)  
    // - Base level around 60%, oscillates between ~30% and ~95%
    const primaryWave = Math.sin(elapsed * 2.1) * 0.3;
    const secondaryWave = Math.sin(elapsed * 7.8) * 0.08;
    const value = 60 + (primaryWave + secondaryWave) * 100;
    
    throttleGaugeSetValue(Math.max(20, Math.min(95, value)));
    throttleAnimationId = requestAnimationFrame(animate);
  }
  
  throttleAnimationId = requestAnimationFrame(animate);
}

// Stop throttle animation
function throttleGaugeStopAnimation() {
  throttleGaugeReset();
}

// Initialize throttle gauge on page load
throttleGaugeReset();

// ===== System Selection Management =====

// Update selection count display
function updateSelectionCount() {
  const allItems = document.querySelectorAll('.system-list-item');
  const selectedItems = document.querySelectorAll('.system-list-item[data-selected="true"]');
  const total = allItems.length;
  const selected = selectedItems.length;
  
  if (scanCountEl) {
    scanCountEl.textContent = selected === total ? 'all' : selected;
  }
}

// Toggle system selection
function toggleSystemSelection(systemItem, checked) {
  systemItem.dataset.selected = checked ? 'true' : 'false';
  const checkbox = systemItem.querySelector('.system-select-checkbox');
  if (checkbox) checkbox.checked = checked;
  updateSelectionCount();
}

// Enable/disable custom mode (checkboxes editable)
function setCustomMode(enabled) {
  customModeActive = enabled;
  if (systemListWrapper) {
    systemListWrapper.dataset.customMode = enabled ? 'true' : 'false';
  }
  if (enabled && masterCheckbox) {
    updateMasterCheckboxState();
  }
}

// Sync master checkbox to checked / indeterminate / unchecked based on item checkboxes
function updateMasterCheckboxState() {
  if (!masterCheckbox || !systemCheckboxes.length) return;
  const checkedCount = Array.from(systemCheckboxes).filter(cb => cb.checked).length;
  if (checkedCount === 0) {
    masterCheckbox.checked = false;
    masterCheckbox.indeterminate = false;
  } else if (checkedCount === systemCheckboxes.length) {
    masterCheckbox.checked = true;
    masterCheckbox.indeterminate = false;
  } else {
    masterCheckbox.checked = false;
    masterCheckbox.indeterminate = true;
  }
  updateMasterCheckboxLabel();
}

function updateMasterCheckboxLabel() {
  if (!masterCheckboxLabel || !masterCheckbox) return;
  masterCheckboxLabel.textContent = masterCheckbox.checked ? 'Unselect all systems' : 'Select all systems';
}

// Select systems by group preset
function selectByPreset(preset) {
  const allItems = document.querySelectorAll('.system-list-item');
  
  // Handle custom mode separately
  if (preset === 'custom') {
    setCustomMode(true);
  } else {
    setCustomMode(false);
    
    allItems.forEach(item => {
      let shouldSelect = false;
      
      if (preset === 'all') {
        shouldSelect = true;
      } else {
        shouldSelect = item.dataset.group === preset;
      }
      
      toggleSystemSelection(item, shouldSelect);
    });
  }
  
  // Update preset button states
  if (systemPresets) {
    systemPresets.querySelectorAll('[data-preset]').forEach(btn => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-ghost');
    });
    const activeBtn = systemPresets.querySelector(`[data-preset="${preset}"]`);
    if (activeBtn) {
      activeBtn.classList.remove('btn-ghost');
      activeBtn.classList.add('btn-primary');
    }
  }
}

// Handle preset button clicks
if (systemPresets) {
  systemPresets.addEventListener('click', (e) => {
    const presetBtn = e.target.closest('[data-preset]');
    if (!presetBtn) return;
    selectByPreset(presetBtn.dataset.preset);
  });
}

// Handle individual checkbox changes
systemCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('click', (e) => {
    e.stopPropagation();
    
    // Only allow changes in custom mode
    if (!customModeActive) {
      e.preventDefault();
      return;
    }
  });
  
  checkbox.addEventListener('change', (e) => {
    // Only process changes in custom mode
    if (!customModeActive) {
      // Revert the checkbox state
      e.target.checked = e.target.closest('.system-list-item')?.dataset.selected === 'true';
      return;
    }
    
    const systemItem = e.target.closest('.system-list-item');
    if (systemItem) {
      systemItem.dataset.selected = e.target.checked ? 'true' : 'false';
      updateSelectionCount();
      updateMasterCheckboxState();
    }
  });
});

// Master checkbox: select all / deselect all
if (masterCheckbox) {
  masterCheckbox.addEventListener('change', () => {
    if (!customModeActive) return;
    const allItems = document.querySelectorAll('.system-list-item');
    allItems.forEach(item => toggleSystemSelection(item, masterCheckbox.checked));
    updateSelectionCount();
    updateMasterCheckboxLabel();
  });
}

// Initialize selection count
updateSelectionCount();

// Tab switching
tabs.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  
  tabs.querySelectorAll('.tab').forEach(t => t.classList.remove('tab-active'));
  tab.classList.add('tab-active');
  
  const tabName = tab.dataset.tab;
  if (tabName === 'topology') {
    page.dataset.view = 'topology';
  } else {
    page.dataset.view = 'default';
  }
  applyErrorsFilter();
});

// Scan button demo (toggle scan/stop)
if (scanBtn && stopBtn) {
  scanBtn.addEventListener('click', () => {
    scanBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    if (filterControls) filterControls.classList.add('hidden');
    startScanDemo();
  });
  
  stopBtn.addEventListener('click', () => {
    stopBtn.classList.add('hidden');
    scanBtn.classList.remove('hidden');
    stopScanDemo();
  });
}

// Clear DTCs button
if (clearDtcsBtn) {
  clearDtcsBtn.addEventListener('click', () => {
    // Set all topology nodes with errors/warnings to 'cleared' state
    document.querySelectorAll('.topology-node[data-node-id]').forEach(n => {
      if (n.dataset.state === 'error' || n.dataset.state === 'warning') {
        n.dataset.state = 'cleared';
      }
    });
    // Set all system list items with errors/warnings to 'cleared' state
    document.querySelectorAll('.system-list-item[data-system-id]').forEach(item => {
      if (item.dataset.state === 'error' || item.dataset.state === 'warning') {
        syncSystemListItem(item.dataset.systemId, 'cleared', []);
      }
    });
    updateFilterControls();
    applyErrorsFilter();
  });
}

// Errors only toggle: in Systems list view hide non-error items (like presets); in Topology view dim nodes
function applyErrorsFilter() {
  const showErrorsOnly = errorsOnlyToggle ? errorsOnlyToggle.checked : false;
  const isSystemsListView = page && page.dataset.view !== 'topology';

  // Topology nodes: dim when errors-only (unchanged)
  document.querySelectorAll('.topology-node[data-node-id]').forEach(n => {
    const state = n.dataset.state;
    const hasIssue = state === 'error' || state === 'warning';
    if (showErrorsOnly && !hasIssue) {
      n.style.opacity = '0.25';
      n.style.pointerEvents = 'none';
    } else {
      n.style.opacity = '';
      n.style.pointerEvents = '';
    }
  });

  // System list items: in Systems list view hide non-error items; in Topology view dim
  document.querySelectorAll('.system-list-item[data-system-id]').forEach(item => {
    const state = item.dataset.state;
    const hasIssue = state === 'error' || state === 'warning';
    if (!showErrorsOnly) {
      item.style.opacity = '';
      item.style.pointerEvents = '';
      item.classList.remove('hidden');
      return;
    }
    if (isSystemsListView) {
      if (hasIssue) {
        item.classList.remove('hidden');
        item.style.opacity = '';
        item.style.pointerEvents = '';
      } else {
        item.classList.add('hidden');
      }
    } else {
      if (hasIssue) {
        item.style.opacity = '';
        item.style.pointerEvents = '';
        item.classList.remove('hidden');
      } else {
        item.style.opacity = '0.25';
        item.style.pointerEvents = 'none';
        item.classList.remove('hidden');
      }
    }
  });
}

if (errorsOnlyToggle) {
  errorsOnlyToggle.addEventListener('change', applyErrorsFilter);
}

// Update filter controls visibility based on scan results
function updateFilterControls() {
  // Count issues from system list items (primary source for user-facing count)
  const systemItems = document.querySelectorAll('.system-list-item[data-system-id]');
  let errorCount = 0;
  let warningCount = 0;
  
  systemItems.forEach(item => {
    if (item.dataset.state === 'error') errorCount++;
    if (item.dataset.state === 'warning') warningCount++;
  });
  
  const totalIssues = errorCount + warningCount;
  
  if (filterControls && errorCountBadge) {
    if (totalIssues > 0) {
      filterControls.classList.remove('hidden');
      errorCountBadge.textContent = totalIssues;
    } else {
      filterControls.classList.add('hidden');
      if (errorsOnlyToggle) errorsOnlyToggle.checked = false;
    }
  }
}

// Sync system list item state with topology node
function syncSystemListItem(nodeId, state, dtcCodes) {
  const systemItem = document.querySelector(`.system-list-item[data-system-id="${nodeId}"]`);
  if (!systemItem) return;
  
  systemItem.dataset.state = state;
  
  // Get status indicator elements
  const spinner = systemItem.querySelector('.system-status-spinner');
  const okIcon = systemItem.querySelector('.system-status-ok');
  const warningIcon = systemItem.querySelector('.system-status-warning');
  const errorIcon = systemItem.querySelector('.system-status-error');
  const clearedIcon = systemItem.querySelector('.system-status-cleared');
  const badges = systemItem.querySelector('.system-status-badges');
  
  // Hide all first
  [spinner, okIcon, warningIcon, errorIcon, clearedIcon, badges].forEach(el => {
    if (el) el.classList.add('hidden');
  });
  
  // Show appropriate indicator based on state
  switch (state) {
    case 'scanning':
      if (spinner) spinner.classList.remove('hidden');
      break;
    case 'ok':
      if (okIcon) okIcon.classList.remove('hidden');
      break;
    case 'warning':
      if (warningIcon) warningIcon.classList.remove('hidden');
      if (badges && dtcCodes.length > 0) {
        badges.classList.remove('hidden');
        renderDtcBadges(badges, dtcCodes, 'warning');
      }
      break;
    case 'error':
      if (errorIcon) errorIcon.classList.remove('hidden');
      if (badges && dtcCodes.length > 0) {
        badges.classList.remove('hidden');
        renderDtcBadges(badges, dtcCodes, 'error');
      }
      break;
    case 'cleared':
      if (clearedIcon) clearedIcon.classList.remove('hidden');
      break;
    case 'pending':
    default:
      // No indicator for pending
      break;
  }
  
  // Update sub-system items within this system
  syncSubsystemItems(systemItem, state, dtcCodes);
}

// Sync sub-system item states based on parent state
function syncSubsystemItems(systemItem, parentState, dtcCodes) {
  const subsystems = systemItem.querySelectorAll('.subsystem-item');
  if (subsystems.length === 0) return;
  
  // Reset all subsystems first
  subsystems.forEach(sub => {
    sub.removeAttribute('data-status');
    const statusEl = sub.querySelector('.subsystem-status');
    if (statusEl) statusEl.textContent = '';
  });
  
  if (parentState === 'ok') {
    // All subsystems are OK - no need to mark individually
    return;
  }
  
  if (parentState === 'warning' || parentState === 'error') {
    // Assign each DTC code to a random subsystem
    const subsystemArray = Array.from(subsystems);
    const shuffled = subsystemArray.sort(() => 0.5 - Math.random());
    const numAffected = Math.min(dtcCodes.length, shuffled.length);
    
    for (let i = 0; i < numAffected; i++) {
      const sub = shuffled[i];
      sub.dataset.status = parentState;
      const statusEl = sub.querySelector('.subsystem-status');
      if (statusEl) {
        statusEl.textContent = dtcCodes[i];
      }
    }
  }
}

// Render DTC code badges
function renderDtcBadges(container, codes, severity) {
  container.innerHTML = '';
  const badgeClass = severity === 'error' ? 'badge-error' : 'badge-warning';
  
  if (codes.length === 0) return;
  
  // First code badge
  const firstBadge = document.createElement('span');
  firstBadge.className = `badge badge-sm ${badgeClass}`;
  firstBadge.textContent = codes[0];
  container.appendChild(firstBadge);
  
  // "+N more" badge if multiple codes
  if (codes.length > 1) {
    const moreBadge = document.createElement('span');
    moreBadge.className = `badge badge-sm badge-outline ${badgeClass}`;
    moreBadge.textContent = `+${codes.length - 1}`;
    container.appendChild(moreBadge);
  }
}

// Reset all system list items to pending
function resetSystemList() {
  document.querySelectorAll('.system-list-item[data-system-id]').forEach(item => {
    syncSystemListItem(item.dataset.systemId, 'pending', []);
  });
}

// Demo scan progression
let scanTimeout;
let scanResults = { ok: 0, warning: 0, error: 0 };

function startScanDemo() {
  // Get all system list items and check selection state
  const allSystemItems = document.querySelectorAll('.system-list-item');
  const selectedSystems = Array.from(document.querySelectorAll('.system-list-item[data-selected="true"]'))
    .map(item => item.dataset.systemId)
    .filter(Boolean);
  
  // Check if all systems are selected
  const allSelected = selectedSystems.length === allSystemItems.length;
  
  // Get all topology nodes
  const allNodes = document.querySelectorAll('.topology-node[data-node-id]');
  let nodes;
  
  if (allSelected) {
    // When all systems selected, scan ALL topology nodes
    nodes = Array.from(allNodes);
  } else {
    // When partial selection, filter to selected systems only
    nodes = Array.from(allNodes).filter(node => {
      const nodeId = node.dataset.nodeId;
      // Always include OBD and gateway nodes, include if system is selected
      return nodeId === 'obd' || nodeId === 'gateway' || selectedSystems.includes(nodeId);
    });
  }
  
  const totalNodes = nodes.length;
  let index = 0;
  
  if (totalNodes === 0 || (selectedSystems.length === 0 && !allSelected)) {
    alert('Please select at least one system to scan.');
    return;
  }
  
  // Reset scan results
  scanResults = { ok: 0, warning: 0, error: 0 };
  
  // Reset toggle state and clear any dimming
  if (errorsOnlyToggle) {
    errorsOnlyToggle.checked = false;
  }
  applyErrorsFilter();
  
  // Reset all nodes and system list items to pending
  allNodes.forEach(n => {
    n.dataset.state = 'pending';
  });
  resetSystemList();
  
  // Reset and start health gauge
  healthGaugeReset();
  healthGaugeSetProgress(0);
  
  // Start throttle gauge animation
  throttleGaugeStartAnimation();

  // Start scan effect overlay
  if (scanEffect) scanEffect.classList.add('scanning');

  // VCI status: show "In process" (green) while scanning
  if (vciStatusBadge) {
    vciStatusBadge.textContent = 'IN PROCESS';
    vciStatusBadge.className = 'badge badge-success badge-sm shrink-0';
  }

  // Set OBD to ok (always connected)
  const obd = document.querySelector('[data-node-id="obd"]');
  if (obd) obd.dataset.state = 'ok';
  
  function scanNext() {
    if (index >= totalNodes) {
      // Scan complete - show results
      stopBtn.classList.add('hidden');
      scanBtn.classList.remove('hidden');
      updateFilterControls();

      // VCI status: back to "Ready" (blue)
      if (vciStatusBadge) {
        vciStatusBadge.textContent = 'READY';
        vciStatusBadge.className = 'badge badge-info badge-sm shrink-0';
      }
      
      // Stop scan effect overlay
      if (scanEffect) scanEffect.classList.remove('scanning');

      // Notify onboarding drawer to show congratulations step if tutorial is on "Perform scan" step
      if (typeof window.onboardingAdvanceAfterScan === 'function') window.onboardingAdvanceAfterScan();

      // Calculate health score and segments
      const total = scanResults.ok + scanResults.warning + scanResults.error;
      if (total > 0) {
        // Health score: 100% if all ok, reduced by warnings (-5 each) and errors (-15 each)
        const healthScore = Math.max(0, 100 - (scanResults.warning * 5) - (scanResults.error * 15));
        
        // Segment percentages
        const segments = [
          { value: (scanResults.ok / total) * 100, color: 'success' },
          { value: (scanResults.warning / total) * 100, color: 'warning' },
          { value: (scanResults.error / total) * 100, color: 'error' }
        ].filter(s => s.value > 0);
        
        healthGaugeSetResult(healthScore, segments);
        
        // Stop throttle gauge animation when scan completes
        throttleGaugeStopAnimation();
      }
      return;
    }
    
    const node = nodes[index];
    const nodeId = node.dataset.nodeId;
    
    // Update gauge progress
    const progress = ((index + 1) / totalNodes) * 100;
    healthGaugeSetProgress(progress);

    // Set scanning state
    node.dataset.state = 'scanning';
    syncSystemListItem(nodeId, 'scanning', []);
    
    scanTimeout = setTimeout(() => {
      // Check if this node has a matching system list item
      const hasSystemItem = document.querySelector(`.system-list-item[data-system-id="${nodeId}"]`);
      
      let state = 'ok';
      let dtcCodes = [];
      
      // Only assign error/warning states to nodes with matching system items
      if (hasSystemItem) {
        // Random result: 80% ok, 15% warning, 5% error
        const rand = Math.random();
        
        if (rand > 0.95) {
          state = 'error';
          dtcCodes = getRandomDtcCodes(Math.floor(Math.random() * 3) + 1);
          scanResults.error++;
        } else if (rand > 0.8) {
          state = 'warning';
          dtcCodes = getRandomDtcCodes(Math.floor(Math.random() * 2) + 1);
          scanResults.warning++;
        } else {
          scanResults.ok++;
        }
      }
      // Topology-only nodes (no system item) always get 'ok' state
      
      node.dataset.state = state;
      syncSystemListItem(nodeId, state, dtcCodes);
      
      index++;
      scanNext();
    }, 300 + Math.random() * 400);
  }
  
  scanNext();
}

function stopScanDemo() {
  clearTimeout(scanTimeout);
  // Stop scan effect overlay
  if (scanEffect) scanEffect.classList.remove('scanning');
  // VCI status: back to "Ready" (blue)
  if (vciStatusBadge) {
    vciStatusBadge.textContent = 'READY';
    vciStatusBadge.className = 'badge badge-info badge-sm shrink-0';
  }
  // Stop throttle gauge animation
  throttleGaugeStopAnimation();
  // Show partial results if stopped mid-scan
  const total = scanResults.ok + scanResults.warning + scanResults.error;
  if (total > 0) {
    const healthScore = Math.max(0, 100 - (scanResults.warning * 5) - (scanResults.error * 15));
    const segments = [
      { value: (scanResults.ok / total) * 100, color: 'success' },
      { value: (scanResults.warning / total) * 100, color: 'warning' },
      { value: (scanResults.error / total) * 100, color: 'error' }
    ].filter(s => s.value > 0);
    healthGaugeSetResult(healthScore, segments);
  }
}
})();
