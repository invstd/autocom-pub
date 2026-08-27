// Curated ECU "Functions" content (Adjustment/Activation/Test) for ecu-detail.njk's Functions tab
// — same "curated islands, generic elsewhere" pattern as dtc-library.js/data-lists-library.js.
// Keyed by vehicle type, then ECU id (systemId), then functional group id — matching
// diagnosticSystemsCars.js's real ECU → functional group shape. An ECU or functional group with no
// entry here shows an empty state, not fabricated content.
//
// ECM's content (8 real functional groups) is transcribed from the same Gemini-assisted research
// pass on a 2014 Volvo XC60's ECM that also grounded diagnosticSystemsCars.js's livePids — see
// that file's header comment. Two of these (egr-valve-adaption, ac-relay) predate that research —
// they're from the earlier Figma prototype reference and were re-homed here under the functional
// group they actually belong to (EGR under Emissions, AC-relay's cooling-fan relay under Cooling)
// rather than invented for this pass.
//
// Trucks has no equivalent research yet — empty except for vas-lgs's Calibration entry below.
//
// Entry shape:
//   id, label, type ("adjustment"|"activation"|"test"|"calibration"), icon
//   description                    - shown under the title on the detail screen
//   notes?                          - Adjustment only: bulleted caveats
//   prerequisites?                  - bulleted, all types
//   procedure?                      - Adjustment/Test: numbered steps
//   failureNote?                    - what to do if the operation fails (Adjustment/Test)
//   onclick?                        - global function NAME (not literal code — different from
//                                     diagnosticFunctions.js's inline-onclick convention) called
//                                     with this entry instead of the generic openFunctionDialog.
//                                     Only "calibration" entries use this today (they need the
//                                     ADAS-rig-dependent flow in adas-calibration-modal.js, not the
//                                     generic Start/Stop dialog) — see ecu-detail.js's
//                                     buildFunctionRow.
window.AutocomFunctionsLibrary = {
  cars: {
    ecm: {
      'air-intake': [
        {
          id: 'throttle-body-adaptation',
          label: 'Throttle body, adaptation',
          type: 'adjustment',
          icon: 'tool',
          title: 'Adaptation of component',
          description: 'Resets the throttle valve’s learned end-stops and idle position in the ECM.',
          notes: ['Perform after cleaning or replacing the throttle body, or after a battery disconnect.'],
          prerequisites: ['Ignition on, engine off.', 'Coolant temperature below 30°C.'],
          procedure: ['Choose the function and follow the instructions.', 'Do not touch the accelerator pedal during the adaptation.'],
          failureNote: 'If the operation failed check the throttle body wiring and connector before retrying.'
        }
      ],
      'fuel-injection': [
        {
          id: 'fuel-pump-activation-test',
          label: 'Low-pressure fuel pump',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Low-Pressure Fuel Pump',
          description: 'Directly energises the low-pressure fuel pump to verify delivery pressure. Active until you press Stop.',
          prerequisites: ['Ignition on, engine off.', 'At least 10 L of fuel in the tank.']
        },
        {
          id: 'injector-cutoff-test',
          label: 'Individual cylinder cut-off test',
          type: 'test',
          icon: 'scan',
          title: 'Individual Cylinder Cut-off Test',
          description: 'Cuts fuel to one cylinder at a time at idle and compares the resulting RPM drop, to isolate a weak or dead injector.',
          prerequisites: ['Engine running and at operating temperature.', 'All accessories off.'],
          procedure: ['Choose the function and let the engine idle steady.', 'Each cylinder is cut in turn; note the reported RPM drop per cylinder.'],
          failureNote: 'A cylinder with little or no RPM drop indicates a non-firing injector or cylinder.'
        }
      ],
      turbo: [
        {
          id: 'wastegate-vnt-actuator-test',
          label: 'Wastegate / VNT actuator, limit learning',
          type: 'adjustment',
          icon: 'tool',
          title: 'Wastegate / VNT Actuator Limit Learning',
          description: 'Sweeps the turbocharger’s VNT actuator through its full range and re-learns its end-stops.',
          notes: ['Required after replacing the turbocharger or VNT actuator.'],
          prerequisites: ['Engine off, ignition on.'],
          procedure: ['Choose the function and follow the instructions.', 'Do not interrupt the sweep once started.'],
          failureNote: 'If the actuator does not reach its expected limits, check linkage for mechanical binding.'
        }
      ],
      ignition: [
        {
          id: 'glow-plug-actuation-test',
          label: 'Glow plug relay',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Glow Plug Relay',
          description: 'Directly energises the glow plug relay and reports individual glow plug current draw. Active until you press Stop.',
          prerequisites: ['Ignition on, engine off.', 'Battery voltage above 12V.']
        }
      ],
      emissions: [
        {
          id: 'egr-valve-adaption',
          label: 'EGR-valve, adaption',
          type: 'adjustment',
          icon: 'tool',
          title: 'Adaption of component',
          description: 'With this function adaption in the engine control module (ECM) can be performed.',
          notes: ['This adaption must be done after the component or system related components has been replaced or repaired.'],
          prerequisites: ['Ignition on, engine off.'],
          procedure: ['Choose the function and follow the instructions.'],
          failureNote: 'If the operation failed check and repair any faults that may be in the system.'
        },
        {
          id: 'forced-dpf-regeneration',
          label: 'Forced DPF regeneration',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Forced DPF Regeneration',
          description: 'Initiates a stationary regeneration cycle to burn off accumulated soot in the diesel particulate filter.',
          prerequisites: ['Engine at operating temperature.', 'Vehicle stationary, parking brake applied.', 'Fuel level above 25%.']
        }
      ],
      cooling: [
        {
          id: 'ac-relay',
          label: 'AC-relay',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'AC-relay',
          description: 'Directly energise the cooling fan relay. Active until you press Stop.',
          prerequisites: ['Engine off, ignition on.']
        },
        {
          id: 'cooling-fan-speed-test',
          label: 'Radiator fan speed test',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Radiator Fan Speed Test',
          description: 'Steps the radiator fan through its speed stages (30%, 50%, 100%) to verify response. Active until you press Stop.',
          prerequisites: ['Ignition on, engine off or idling.']
        }
      ],
      'mechanical-vvt': [
        {
          id: 'vvt-solenoid-test',
          label: 'VVT solenoid',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'VVT Solenoid',
          description: 'Directly energises the camshaft phasing solenoid to verify actuation. Active until you press Stop.',
          prerequisites: ['Engine running at idle.']
        }
      ]
    },
    // Forward Sensing Module has no real DTC research (see diagnosticSystemsCars.js), but
    // Calibration doesn't depend on that — it's the real, common FSM service action after
    // windshield replacement, bumper repair, or wheel alignment (rig setup happens inline in
    // adas-calibration-modal.js, not a separate prerequisite page). The rest of these entries are
    // plausible (no real reference recording, same call as fsm's livePids in
    // diagnosticSystemsCars.js/data-lists-library.js) — ordinary adjustment/activation/test
    // functions using the same generic dialog every other curated ECU's functions already use, not
    // new custom modal behavior.
    fsm: {
      'acc-radar': [
        {
          id: 'acc-radar-alignment-check',
          label: 'ACC radar alignment check',
          type: 'test',
          icon: 'scan',
          title: 'ACC Radar Alignment Check',
          description: 'Reads the radar’s reported horizontal/vertical alignment offset against its factory reference, without requiring the physical calibration rig — a quick software-only sanity check, not a substitute for a full rig calibration after physical work.',
          prerequisites: ['Ignition on, engine off.', 'Vehicle on level ground, nothing directly in front of the radar.'],
          procedure: ['Choose the function and wait for the reported offset to settle.'],
          failureNote: 'An offset outside tolerance means the radar itself may have shifted — run a full ADAS Calibration.'
        }
      ],
      'front-camera': [
        {
          id: 'adas-calibration',
          label: 'ADAS Calibration',
          type: 'calibration',
          icon: 'crosshair',
          title: 'Forward Camera Calibration',
          description: 'Realigns the forward-facing camera’s reference angle against the calibration rig — required after windshield replacement, bumper repair, or any work that could shift the camera or vehicle ride height.',
          onclick: 'openAdasCalibrationModal'
        },
        {
          id: 'front-camera-lens-test',
          label: 'Camera lens obstruction test',
          type: 'test',
          icon: 'scan',
          title: 'Camera Lens Obstruction Test',
          description: 'Checks the reported lens contamination level against the threshold the camera itself uses to suppress ADAS features.',
          prerequisites: ['Ignition on, engine off.'],
          procedure: ['Choose the function and read the reported contamination level.'],
          failureNote: 'A high reading with a visually clean lens/windshield indicates a camera fault rather than dirt — replace, don’t just clean.'
        }
      ],
      'night-vision': [
        {
          id: 'night-vision-display-test',
          label: 'Night vision display test',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Night Vision Display Test',
          description: 'Forces the night-vision overlay onto the instrument display so its rendering and IR feed can be checked without driving in the dark. Active until you press Stop.',
          prerequisites: ['Ignition on, engine off.']
        }
      ],
      tsr: [
        {
          id: 'tsr-self-test',
          label: 'Traffic sign recognition self-test',
          type: 'test',
          icon: 'scan',
          title: 'Traffic Sign Recognition Self-Test',
          description: 'Runs the camera’s built-in sign-recognition self-check against a stored reference image set and reports the resulting confidence score.',
          prerequisites: ['Ignition on, engine off.'],
          procedure: ['Choose the function and wait for the self-test to complete.'],
          failureNote: 'A low confidence score with a clean, unobstructed camera indicates a software fault — check for a pending camera software update.'
        }
      ],
      ldw: [
        {
          id: 'ldw-sensitivity-adjustment',
          label: 'Lane departure sensitivity adjustment',
          type: 'adjustment',
          icon: 'tool',
          title: 'Lane Departure Warning Sensitivity',
          description: 'Adjusts how far off-center the vehicle must drift before Lane Departure Warning triggers.',
          notes: ['A customer-requested comfort setting, not a fault repair — confirm the customer actually wants it changed before adjusting.'],
          prerequisites: ['Ignition on, engine off.'],
          procedure: ['Choose the function and select Low, Medium, or High sensitivity.'],
          failureNote: 'If the setting doesn’t take, check for a pending FSM software update.'
        }
      ],
      'emergency-assist': [
        {
          id: 'aeb-self-test',
          label: 'Autonomous emergency braking self-test',
          type: 'test',
          icon: 'scan',
          title: 'Autonomous Emergency Braking Self-Test',
          description: 'Runs the AEB system’s built-in diagnostic sweep (radar + camera + brake actuator handshake) without commanding an actual brake application.',
          prerequisites: ['Ignition on, engine off.', 'Vehicle stationary, parking brake applied.'],
          procedure: ['Choose the function and wait for the sweep to complete.'],
          failureNote: 'A failed handshake with the brake system indicates a communication fault on the chassis bus, not necessarily FSM itself.'
        }
      ]
    }
  },
  // Trucks' EDC content is from the same Gemini-assisted research pass that grounded
  // diagnosticSystemsTrucks.js's second restructuring (a 2022 MAN TGX's real EDC/MD1 breakdown) —
  // see that file's header comment. Every other Trucks ECU still has no Functions research, same
  // "curated islands" status as before.
  trucks: {
    edc: {
      'fuel-system': [
        {
          id: 'injector-cutout-test',
          label: 'Individual cylinder cut-off test',
          type: 'test',
          icon: 'scan',
          title: 'Individual Cylinder Cut-off Test',
          description: 'Cuts fuel to one cylinder at a time and compares the resulting compression/RPM response, to isolate a weak or dead injector.',
          prerequisites: ['Engine running and at operating temperature.', 'All accessories off.'],
          procedure: ['Choose the function and let the engine idle steady.', 'Each cylinder is cut in turn; note the reported response per cylinder.'],
          failureNote: 'A cylinder with little or no response indicates a non-firing injector or cylinder.'
        },
        {
          id: 'hp-leakdown-test',
          label: 'High-pressure leak-down test',
          type: 'test',
          icon: 'scan',
          title: 'High-Pressure Leak-Down Test',
          description: 'Pressurises the common rail and monitors the pressure decay rate to locate a leak in the high-pressure fuel circuit.',
          prerequisites: ['Engine off, ignition on.', 'Fuel level above 10 L.'],
          procedure: ['Choose the function and follow the instructions.', 'Do not start the engine while the test is running.'],
          failureNote: 'A decay rate above the expected threshold indicates a leaking injector, line, or rail seal.'
        },
        {
          id: 'injector-coding',
          label: 'IMA / QR injector coding',
          type: 'adjustment',
          icon: 'tool',
          title: 'Injector Calibration Coding',
          description: 'Enters a replacement injector’s factory calibration code (IMA/QR) into the ECM so its fuel-quantity correction matches the new part.',
          notes: ['Required whenever an injector is replaced — a mismatched code causes rough running and incorrect fuel trim on that cylinder.'],
          prerequisites: ['Ignition on, engine off.'],
          procedure: ['Select the cylinder with the replaced injector.', 'Enter the code printed on the injector body exactly as shown.']
        }
      ],
      'air-boost-turbo': [
        {
          id: 'vgt-actuator-sweep',
          label: 'Wastegate / VGT actuator, limit learning',
          type: 'adjustment',
          icon: 'tool',
          title: 'Wastegate / VGT Actuator Sweep & End-Stop Adaptation',
          description: 'Sweeps the turbocharger’s VGT actuator through its full range and re-learns its end-stops.',
          notes: ['Required after replacing the turbocharger or VGT actuator.'],
          prerequisites: ['Engine off, ignition on.'],
          procedure: ['Choose the function and follow the instructions.', 'Do not interrupt the sweep once started.'],
          failureNote: 'If the actuator does not reach its expected limits, check linkage for mechanical binding.'
        },
        {
          id: 'intake-flap-test',
          label: 'Intake flap actuation test',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Intake Flap Actuation Test',
          description: 'Directly energises the intake throttle flap to verify it opens and closes on command. Active until you press Stop.',
          prerequisites: ['Engine off, ignition on.']
        }
      ],
      egr: [
        {
          id: 'egr-hysteresis-test',
          label: 'EGR valve, hysteresis & sweep test',
          type: 'adjustment',
          icon: 'tool',
          title: 'EGR Valve Hysteresis & Functional Sweep Test',
          description: 'Sweeps the EGR valve through its full range and compares commanded vs. actual position to check for mechanical sticking or wear.',
          prerequisites: ['Engine off, ignition on.'],
          procedure: ['Choose the function and follow the instructions.', 'Do not interrupt the sweep once started.'],
          failureNote: 'A large gap between commanded and actual position indicates a sticking valve or carbon build-up.'
        },
        {
          id: 'egr-bypass-test',
          label: 'EGR cooler bypass valve test',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'EGR Cooler Bypass Valve Test',
          description: 'Directly energises the EGR cooler bypass valve to verify actuation. Active until you press Stop.',
          prerequisites: ['Engine at operating temperature.']
        }
      ],
      aftertreatment: [
        {
          id: 'forced-dpf-regen',
          label: 'Forced static DPF regeneration',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Forced Static DPF Regeneration',
          description: 'Initiates a stationary regeneration cycle to burn off accumulated soot in the diesel particulate filter.',
          prerequisites: ['Engine at operating temperature.', 'Vehicle stationary, parking brake applied.', 'Fuel level above 25%.']
        },
        {
          id: 'adblue-leak-test',
          label: 'AdBlue dosing spray/quantity test',
          type: 'test',
          icon: 'scan',
          title: 'AdBlue Dosing Spray/Quantity Leak Test',
          description: 'Commands a metered AdBlue dose and checks delivered quantity against target to detect a clogged injector or a leak in the dosing line.',
          prerequisites: ['AdBlue tank above 10%.', 'Engine at operating temperature.'],
          procedure: ['Choose the function and follow the instructions.'],
          failureNote: 'A delivered quantity well below target indicates a clogged doser or a line/seal leak.'
        },
        {
          id: 'nox-sensor-diagnostic',
          label: 'NOx sensor circuit & plausibility check',
          type: 'test',
          icon: 'scan',
          title: 'NOx Sensor Circuit & Plausibility Diagnostic',
          description: 'Reads both NOx sensors’ signal and communication status and compares upstream/downstream values for a plausible SCR conversion ratio.',
          prerequisites: ['Engine at operating temperature.'],
          procedure: ['Choose the function and let it run for at least 60 seconds of steady operation.']
        }
      ],
      'thermal-lubrication': [
        {
          id: 'fan-clutch-test',
          label: 'Viscous fan clutch engage/disengage test',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Viscous Fan Clutch Test',
          description: 'Directly engages and disengages the viscous cooling fan clutch to verify response. Active until you press Stop.',
          prerequisites: ['Engine running at idle.']
        },
        {
          id: 'oil-pressure-solenoid-test',
          label: 'Variable oil pressure solenoid test',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Variable Oil Pressure Solenoid Test',
          description: 'Directly energises the variable oil pump pressure solenoid to verify actuation. Active until you press Stop.',
          prerequisites: ['Engine running at idle.', 'Oil temperature above 60°C.']
        }
      ],
      'auxiliary-braking': [
        {
          id: 'evbec-solenoid-test',
          label: 'Exhaust brake valve solenoid test',
          type: 'activation',
          icon: 'refresh-cw',
          title: 'Exhaust Brake Valve (EVBec) Solenoid Test',
          description: 'Directly energises the exhaust valve brake solenoid to verify it closes the exhaust flap on command. Active until you press Stop.',
          prerequisites: ['Engine running at idle.', 'Vehicle stationary, parking brake applied.']
        }
      ]
    },
    // Lane Guard System has no real DTC research (see diagnosticSystemsTrucks.js), but
    // Calibration doesn't depend on that — same reasoning as Cars' fsm above. The rest are
    // plausible entries (no real reference recording, same call as vas-lgs's livePids), ordinary
    // test/adjustment functions using the same generic dialog every other curated ECU already
    // uses.
    'vas-lgs': {
      'lane-camera': [
        {
          id: 'adas-calibration',
          label: 'ADAS Calibration',
          type: 'calibration',
          icon: 'crosshair',
          title: 'Lane Guard Camera Calibration',
          description: 'Realigns the lane guard camera’s reference angle against the calibration rig — required after windshield replacement, cab tilt work, or any work that could shift the camera or ride height.',
          onclick: 'openAdasCalibrationModal'
        },
        {
          id: 'lane-camera-lens-test',
          label: 'Camera lens obstruction test',
          type: 'test',
          icon: 'scan',
          title: 'Camera Lens Obstruction Test',
          description: 'Checks the reported lens contamination level against the threshold the camera itself uses to suppress lane guard warnings.',
          prerequisites: ['Ignition on, engine off.'],
          procedure: ['Choose the function and read the reported contamination level.'],
          failureNote: 'A high reading with a visually clean lens/windshield indicates a camera fault rather than dirt — replace, don’t just clean.'
        }
      ],
      'sign-recognition': [
        {
          id: 'sign-recognition-self-test',
          label: 'Traffic sign recognition self-test',
          type: 'test',
          icon: 'scan',
          title: 'Traffic Sign Recognition Self-Test',
          description: 'Runs the camera’s built-in sign-recognition self-check against a stored reference image set and reports the resulting confidence score.',
          prerequisites: ['Ignition on, engine off.'],
          procedure: ['Choose the function and wait for the self-test to complete.'],
          failureNote: 'A low confidence score with a clean, unobstructed camera indicates a software fault — check for a pending camera software update.'
        }
      ]
    }
  }
};
