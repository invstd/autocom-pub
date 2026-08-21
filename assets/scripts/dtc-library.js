// Curated, deterministic DTC content for the "AI Assist" drill-down modal (dtc-detail-modal.js).
// Keyed by vehicle type ("trucks"/"cars") then systemId (matches topology/systemItems
// data-system-id). A system with an entry here uses its curated codes/content instead of the
// generic random DTC picker in diagnostics-dashboard.js; systems with no entry keep today's
// random-badge behavior unchanged.
//
// Vehicle-type-scoped on purpose: Cars and Trucks both have an "engine" systemId, but they are not
// the same system (see the Trucks entry's own note below) — appending Cars content into a shared
// `engine` array would have silently mixed truck aftertreatment content into a car's engine fault.
//
// Entry fields:
//   code, title, tags        - header (title/tags unchanged from before this restructuring)
//   status                   - Active | Pending | Stored | Intermittent | Unknown (real OBD DTC
//                              status vocabulary, from NextGen reference material — see
//                              diagnostic-systems-restructuring notes in PROGRESS.md)
//   statusNote                - optional, shown only when present (e.g. explaining what "Pending"
//                              means for this fault)
//   ecu, systemCategory       - shown in the modal's meta row
//   details                   - plain factual description (OEM-style), distinct from `summary`
//                              below which is framed as the AI Assist synthesis
//   freezeFrame, causes       - unchanged shape from before this restructuring
//   summary                   - AI Assist framing, unchanged
window.AutocomDtcLibrary = {
  // Keyed by ecuId directly now (was systemId+subsystemId) — diagnosticSystemsTrucks.js's second
  // restructuring made EDC (previously the "engine" category, "ecu" subsystem) the single
  // top-level scannable unit, matching Cars' "ecm" restructuring.
  trucks: {
    edc: [
      {
        code: '4407',
        title: 'CAN receipt message: Nox sensor upstream of exhaust gas aftertreatment, Nox',
        // `variant` colors the tag to match severity (e.g. 'error'); omit for a neutral fault-type
        // descriptor. "Persistent" (not "Intermittent") on purpose — this DTC is scripted to reliably
        // reappear on a fixed schedule (see shouldCuratedSystemFail in diagnostics-dashboard.js), not
        // to occur sporadically, so it should read as a confirmed/ongoing fault, not a flaky one.
        tags: [{ label: 'Open circuit' }, { label: 'Persistent', variant: 'error' }],
        status: 'Active',
        ecu: 'Electronic Diesel Control (EDC17)',
        // NOx sensor content belongs to EDC's "Exhaust Aftertreatment & Emissions" functional
        // group (see diagnosticSystemsTrucks.js) — this is what makes the ECU page highlight the
        // right group row, same mechanism as Cars' P010000 entry.
        functionalGroupId: 'aftertreatment',
        systemCategory: 'AdBlue System',
        details: 'The upstream NOx sensor (before the SCR catalyst) is not communicating over CAN — signal missing or corrupted.',
        summary: 'The upstream NOx sensor (before the SCR catalyst) isn’t reaching the engine control unit over CAN — the sensor or its control module is offline, lagging, or sending corrupted frames. Left unresolved, this can disable or limit AdBlue dosing since accurate inlet NOx data is missing.',
        freezeFrame: [
          { label: 'FMI', value: '10' },
          { label: 'Frequency counter', value: '14' },
          { label: 'Priority', value: '4' },
          { label: 'Clocktime', value: '3:42' },
          { label: 'date', value: '23.09.2019', unit: 'Day/Mon/Year' },
          { label: 'Distance indicator', value: '477112', unit: 'km' }
        ],
        causes: [
          {
            name: 'NOx sensor',
            faultFrequency: 50,
            componentTest: {
              title: 'NOx sensor',
              subtitle: 'NOx sensor upstream of the SCR catalytic converter',
              steps: ['Remove connector.', 'Turn on ignition.', 'Measure between pin 1 and pin 4.'],
              pinCount: 6,
              highlightPins: [1, 4],
              expectedRange: '18 - 30V',
              failMessage: 'Value not reached — fault in the wiring harness.',
              pinout: [
                { pin: 1, label: 'Voltage supply KL. 15' },
                { pin: 2, label: 'CAN high (Throttle actuator)' },
                { pin: 3, label: 'CAN high (Engine brake flap)' },
                { pin: 4, label: 'Ground' },
                { pin: 5, label: 'CAN low (Throttle actuator)' },
                { pin: 6, label: 'CAN low (Engine brake flap)' }
              ]
            }
          },
          { name: 'CAN bus', faultFrequency: 50 }
        ]
      }
    ]
  },
  // Content transcribed from a real Figma prototype reference (DTC P010000 drill-down, Volvo XC60
  // D5244T11 2.4L Diesel) — see diagnostic-systems-restructuring notes in PROGRESS.md. Reference
  // material also showed a "Reference Values" comparison table and a community "Notes" section;
  // both deliberately not built here (net-new content types needing their own scope decision), see
  // PROGRESS.md's deferred list.
  //
  // Keyed by ecuId directly now (was systemId+subsystemId) — diagnosticSystemsCars.js's second
  // restructuring made each real ECU (e.g. "ecm") the single top-level scannable unit again,
  // dropping the intermediate category/subsystem split.
  cars: {
    ecm: [
      {
        code: 'P010000',
        title: 'Mass Air Flow (MAF) sensor circuit malfunction',
        tags: [],
        status: 'Pending',
        statusNote: 'Pending faults may turn confirmed if they reoccur.',
        ecu: 'Engine Control Module (ECM)',
        // Which of the ECM's functional groups this fault belongs to — a MAF sensor is squarely
        // an Air Intake & Induction concern (see diagnosticSystemsCars.js's ecm.functionalGroups).
        functionalGroupId: 'air-intake',
        systemCategory: 'Air Intake',
        details: 'Mass Air Flow (MAF) sensor signal is out of expected range or circuit malfunction detected.',
        summary: 'A pending MAF circuit fault usually points to a dirty or failing sensor rather than wiring damage — the signal reading (0 g/s at idle-adjacent conditions) is implausibly low rather than erratic, which is more consistent with a fouled sensor element or an unmetered air leak downstream of it than an open circuit.',
        freezeFrame: [
          { label: 'Vehicle Speed', value: '35', unit: 'km/h' },
          { label: 'Engine Speed', value: '1,500', unit: 'RPM' },
          { label: 'Coolant Temperature', value: '87', unit: '°C' },
          { label: 'Gearing', value: '3rd' },
          { label: 'Throttle Position', value: '35', unit: '%' },
          { label: 'MAF Sensor Signal', value: '0', unit: 'g/s' }
        ],
        additionalInfo: [
          { label: 'Fault Occurrence Count', value: '3' },
          { label: 'First Occurrence', value: '2,000 km ago' },
          { label: 'Last Occurrence', value: '30 km ago' },
          { label: 'Confirmed by ECU', value: 'Yes' }
        ],
        causes: [
          { name: 'Dirty/clogged MAF sensor', faultFrequency: 55 },
          { name: 'Air intake leak', faultFrequency: 30 },
          { name: 'Sensor wiring fault', faultFrequency: 15 }
        ]
      }
    ]
  }
};
