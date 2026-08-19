// Curated, deterministic DTC content for the "AI Assist" drill-down modal (dtc-detail-modal.js).
// Keyed by systemId (matches topology/systemItems data-system-id). A system with an entry here
// uses its curated codes/content instead of the generic random DTC picker in
// diagnostics-dashboard.js; systems with no entry keep today's random-badge behavior unchanged.
//
// Currently wired up on the Trucks diagnostics dashboard only (diagnostics-dashboard-trucks.njk)
// — NOT included on the Cars dashboard, even though Cars also has a systemId "engine". The
// content below (NOx sensor / SCR catalytic converter) is real MAN TGX diesel-aftertreatment
// content and would be a wrong match for Cars' vehicle set. When real Cars DTC reference material
// is available, give it its own top-level key (e.g. a vehicle-type-scoped structure) rather than
// appending to this "engine" array — don't assume Cars and Trucks "engine" mean the same system.
//
// Content for "engine" / 4407 is transcribed from real W.EASY (WabcoWürth) screenshots of a MAN
// TGX Quick-Scan → Engine Control (EDC17) fault memory → NOx sensor component test. One deliberate
// edit from the raw screenshots: the source text instructed "pin 1 and pin 4" but its own diagram
// highlighted pins 1 and 6 — an apparent inconsistency in the real tool. Kept the text instruction
// (pin 1 = supply, pin 4 = ground — the electrically sensible pair to measure) and highlighted
// pins 1 and 4 here so our own diagram doesn't visibly contradict its own instructions.
//
// `summary` is different in kind from the rest of this entry: general knowledge about code 4407
// (what a NOx-sensor CAN receipt fault means, its system impact), not sourced from the W.EASY
// screenshots — closer to what a real "AI assistant" would synthesize on demand. Kept separate
// from the OEM-sourced freeze-frame/causes/component-test data on purpose; don't blur the two.
window.AutocomDtcLibrary = {
  engine: [
    {
      code: '4407',
      title: 'CAN receipt message: Nox sensor upstream of exhaust gas aftertreatment, Nox',
      // `variant` colors the tag to match severity (e.g. 'error'); omit for a neutral fault-type
      // descriptor. "Persistent" (not "Intermittent") on purpose — this DTC is scripted to reliably
      // reappear on a fixed schedule (see shouldCuratedSystemFail in diagnostics-dashboard.js), not
      // to occur sporadically, so it should read as a confirmed/ongoing fault, not a flaky one.
      tags: [{ label: 'Open circuit' }, { label: 'Persistent', variant: 'error' }],
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
};
