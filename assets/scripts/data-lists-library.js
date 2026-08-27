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
// Trucks (systemId "edc") — labels/units are real, taken from W.EASY (WabcoWürth) Data Lists
// screenshots for a MAN TGX EDC17. Values themselves are simulated (no real vehicle connection);
// see data-lists-modal.js's generator.
//
// Cars (systemId "ecm") — labels/units are real too, but sourced differently: they're the same 28
// numeric PIDs diagnosticSystemsCars.js's ECM functional groups already list statically (that
// file's own Gemini-assisted 2014 Volvo XC60 research — see its header comment), just wired up here
// so they're genuinely interactive instead of a static read-only list. No real screen recording
// backs the exact base/noise ranges the way Trucks' numbers are grounded in an actual screenshot —
// they're plausible values for a D5244T17 2.4L common-rail diesel at a steady cruise, sized to read
// right to someone who knows the platform, not measured. The two non-numeric PIDs in that same
// data (Camshaft/Crankshaft sync status, Brake pedal switch status) are left out — this modal only
// simulates ticking numeric values, nothing status/enum-shaped.
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
    ],
    // Same "plausible, not measured" call as edc above — see diagnosticSystemsTrucks.js's vas-lgs
    // entry. Status-shaped PIDs (camera signal status, last recognized sign type) left out, same
    // reason edc has none either.
    'vas-lgs': [
      { label: 'Lens contamination level', unit: '%', base: 3, noise: 2 },
      { label: 'Lane offset (left)', unit: 'cm', base: 50, noise: 12 },
      { label: 'Lane offset (right)', unit: 'cm', base: 52, noise: 12 },
      { label: 'Lane marking confidence', unit: '%', base: 85, noise: 7 },
      { label: 'Sign recognition confidence', unit: '%', base: 94, noise: 4 }
    ]
  },
  cars: {
    ecm: [
      // Air Intake & Induction System
      { label: 'Mass Air Flow (MAF) actual', unit: 'g/s', base: 38, noise: 5 },
      { label: 'Intake Air Temperature', unit: '°C', base: 32, noise: 4 },
      { label: 'Manifold Absolute Pressure / Boost', unit: 'kPa', base: 145, noise: 15 },
      { label: 'Throttle Valve position', unit: '%', base: 62, noise: 8 },
      // Fuel Supply & Injection System
      { label: 'Low-pressure fuel pump duty cycle', unit: '%', base: 45, noise: 6 },
      { label: 'High-pressure rail pressure (actual)', unit: 'bar', base: 950, noise: 60 },
      { label: 'Fuel temperature', unit: '°C', base: 38, noise: 3 },
      { label: 'Main injection timing', unit: '° BTDC', base: 4.5, noise: 1.2 },
      // Turbocharger & Boost Control
      { label: 'Boost control solenoid duty cycle', unit: '%', base: 55, noise: 10 },
      { label: 'VNT actuator position', unit: '%', base: 48, noise: 12 },
      { label: 'Charge air cooler temperature drop', unit: '°C', base: 55, noise: 5 },
      // Ignition & Misfire Detection / Pre-Heating
      { label: 'Misfire counter (per cylinder)', unit: 'count', kind: 'counter', base: 0 },
      { label: 'Ignition timing advance/retard', unit: '° BTDC', base: 2.0, noise: 1.5 },
      { label: 'Knock sensor signal', unit: 'V', base: 0.45, noise: 0.15 },
      { label: 'Glow plug current draw', unit: 'A', base: 8.5, noise: 2 },
      // Emissions & Exhaust Aftertreatment
      { label: 'EGR valve position (actual)', unit: '%', base: 35, noise: 15 },
      { label: 'O2 / Lambda sensor voltage', unit: 'V', base: 0.65, noise: 0.2 },
      { label: 'DPF differential pressure', unit: 'hPa', base: 28, noise: 8 },
      { label: 'DPF soot mass', unit: 'g', base: 12, noise: 3 },
      { label: 'Distance since last regeneration', unit: 'km', kind: 'counter', base: 312 },
      // Engine Cooling & Thermal Management
      { label: 'Engine Coolant Temperature', unit: '°C', base: 89, noise: 3 },
      { label: 'Radiator fan speed', unit: '%', base: 30, noise: 20 },
      { label: 'Thermostat heating element duty', unit: '%', base: 20, noise: 15 },
      // Engine Mechanical & Variable Valve Timing
      { label: 'Crankshaft speed', unit: 'RPM', base: 1650, noise: 150 },
      { label: 'Camshaft angle offset', unit: '° KW', base: 3.2, noise: 1.5 },
      // Cruise Control & Driver Input Interface
      { label: 'Accelerator pedal position 1', unit: '%', base: 28, noise: 10 },
      { label: 'Accelerator pedal position 2', unit: '%', base: 28, noise: 10 },
      { label: 'Target cruise speed vs actual', unit: 'km/h', base: 90, noise: 3 }
    ],
    // Same "plausible, not measured" call as ecm above — see diagnosticSystemsCars.js's fsm entry.
    // Status-shaped PIDs from that same functionalGroups data (radar/camera/IR alignment status,
    // last recognized sign type, autonomous braking status) are left out for the same reason
    // ecm's two were: nothing here simulates non-numeric values.
    fsm: [
      // ACC Radar (J428)
      { label: 'Radar target distance', unit: 'm', base: 42, noise: 8 },
      { label: 'Relative closing speed', unit: 'km/h', base: 3, noise: 6 },
      // Front Camera (J852)
      { label: 'Lens contamination level', unit: '%', base: 2, noise: 1.5 },
      { label: 'Horizon line offset', unit: '°', base: 0.3, noise: 0.2 },
      // Night Vision (J853)
      { label: 'Pedestrian detection confidence', unit: '%', base: 92, noise: 5 },
      { label: 'Thermal sensor temperature', unit: '°C', base: 34, noise: 3 },
      // Traffic Sign Recognition
      { label: 'Sign recognition confidence', unit: '%', base: 96, noise: 3 },
      // Lane Departure Warning
      { label: 'Lane offset (left)', unit: 'cm', base: 45, noise: 10 },
      { label: 'Lane offset (right)', unit: 'cm', base: 48, noise: 10 },
      { label: 'Lane marking confidence', unit: '%', base: 88, noise: 6 },
      // Emergency Assist
      { label: 'Collision risk level', unit: '%', base: 4, noise: 3 }
    ]
  }
};
