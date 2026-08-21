// Curated live-parameter list for the "Data Lists" modal (data-lists-modal.js). Keyed by vehicle
// type first, then systemId — same restructuring dtc-library.js got this branch, and for the same
// reason: Cars and Trucks can both have an "engine" systemId that isn't the same real system, and
// this content is genuinely Trucks-specific (AdBlue/EGR/rail-pressure params from a MAN TGX EDC17),
// so it must not silently "exist" for Cars' engine too. That's exactly what happened before this
// restructuring — ecu-detail.njk loads this library on Cars pages too (one shared page for both
// vehicle types), which surfaced the lack of scoping as a real bug (Cars' Engine ECM showed a
// "View Live Data" trigger with truck telemetry) the first time something other than the
// Trucks-only dashboard read from it.
//
// Currently wired up on Trucks only (systemId "engine") — labels/units are real, taken from
// W.EASY (WabcoWürth) Data Lists screenshots for a MAN TGX EDC17. Values themselves are simulated
// (no real vehicle connection); see data-lists-modal.js's generator.
//
// kind: 'noise' (default) — value hovers around `base` +/- `noise` each tick.
// kind: 'counter' — value only ever increases, by a small random step each tick (hour/km meters).
window.AutocomDataListsLibrary = {
  trucks: {
    // Was keyed "engine" (the old category id) — diagnosticSystemsTrucks.js's second
    // restructuring renamed that ECU to "edc" (Electronic Diesel Control), matching real
    // terminology; this key follows it.
    edc: [
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
  },
  cars: {}
};
