// Curated live-parameter list for the "Data Lists" modal (data-lists-modal.js). Keyed by
// systemId, same pattern as dtc-library.js — a system with an entry here gets a "Live data"
// trigger button on its row; systems with no entry get nothing (no generic fallback, unlike the
// DTC badges — there's no real data to browse for an uncurated system).
//
// Currently wired up on the Trucks diagnostics dashboard only, systemId "engine" — labels/units
// are real, taken from W.EASY (WabcoWürth) Data Lists screenshots for a MAN TGX EDC17. Values
// themselves are simulated (no real vehicle connection); see data-lists-modal.js's generator.
//
// kind: 'noise' (default) — value hovers around `base` +/- `noise` each tick.
// kind: 'counter' — value only ever increases, by a small random step each tick (hour/km meters).
window.AutocomDataListsLibrary = {
  engine: [
    { label: 'Battery voltage', unit: 'V', base: 22.8, noise: 0.3 },
    { label: 'Air flow', unit: 'Kg/h', base: 210, noise: 15 },
    { label: 'AdBlue dosage requirement', unit: 'g/hr', base: 18, noise: 3 },
    { label: 'AdBlue level', unit: '%', base: 62, noise: 0.3 },
    { label: 'Atmospheric pressure', unit: 'Bar', base: 1.01, noise: 0.01 },
    { label: 'Charge air temperature before cylinder inlet (downstream of EGR)', unit: '°C', base: 38, noise: 2 },
    { label: 'Charging pressure (absolute)', unit: 'Bar', base: 1.8, noise: 0.15 },
    { label: 'EGR flap actual position', unit: '%', base: 45, noise: 10 },
    { label: 'Engine Reference Torque', unit: 'Nm', base: 1900, noise: 20 },
    { label: 'Rail pressure (Actual value)', unit: 'Bar', base: 850, noise: 60 },
    { label: 'ECU operating hours', unit: 'H', kind: 'counter', base: 4821.5 },
    { label: 'Distance travelled since last regeneration', unit: 'Km', kind: 'counter', base: 312.4 }
  ]
};
