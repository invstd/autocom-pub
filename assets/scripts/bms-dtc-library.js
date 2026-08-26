// Battery State of Health (BMS) reference content — curated from two real report samples Vedran
// supplied (an Autocom ICON CARS Demo screen recording + PDF for a Renault Megane E-Tech, and a
// WOW! LOOQIT-branded PDF for a BMW i4), replacing battery-soh-modal's original general-domain
// numbers with real ones where a real vehicle matches (see [[cars-bms-reference-materials-followup]]
// memory — this is that review pass). Keyed by lowercase "brand model" (matches
// brands_models/*.json's exact model string, e.g. "Megane E-Tech", "i4" — both are real
// Electric-only entries there already).
//
// Only these two vehicles have real curated fault codes; every other EV/hybrid vehicle falls back
// to EV_DEFAULT (healthy, zero faults) rather than inventing plausible-looking codes for vehicles
// with no reference behind them — same "don't fake precision" call as the rest of this app's DTC
// content (dtc-library.js). ICE/combustion vehicles have no fault-code content at all: neither
// reference sample covers a combustion 12V battery check, so battery-soh-report.js doesn't render
// a fault list for the ice variant.
window.BmsDtcLibrary = {
  vehicles: {
    "renault megane e-tech": {
      batteryHealthPercent: 91,
      capacity: { initialKwh: 60.0, currentKwh: 54.6, lossPercent: 9.0 },
      cellVoltage: { minV: 3.94, maxV: 3.99 },
      temperature: { minC: 19, maxC: 31 },
      faultCodes: [
        {
          ecu: "HEVC - Electric vehicle electronic control unit - AT", code: "C1A5", status: null, description: "Unknown fault code",
          // "AI Assist" content for this one code, researched by Vedran 2026-08-26 — same "silent
          // copilot" framing as the Systems DTC drill-down's own AI Assist section
          // (dtc-detail-modal.njk), reused here for the report's fault list. Only C1A5 has this;
          // every other fault code below just shows its plain description, no AI Assist button —
          // same "don't fake precision" call as everywhere else curated content is partial.
          aiAssist: {
            title: "Parking Brake Actuator Alignment",
            summary: "On the Renault CMF-EV platform, chassis-level C1A-prefixed codes correspond to the automated parking mechanism managed by the powertrain control computers. C1A5 specifically points to the Electric Parking Brake (EPB) / Parking Pawl Actuator loop, or its alignment with the traction reducer.",
            causeIntro: "Renault issued a critical advisory regarding 2024–2025 Megane E-Tech models explicitly targeting the parking brake system:",
            causePoints: [
              { label: "The Mechanism", text: "The position sensor inside the parking brake actuator (built into the electric traction reducer) can sit at an incorrect factory angle." },
              { label: "The Fault", text: "Because of this misalignment, the internal stopping pin is placed incorrectly. The HEVC detects a discrepancy between where the parking pawl actuator should be and where the sensor reports it is, triggering C1A5." }
            ],
            safetyNote: "The Danger: this fault can prevent the transmission park lock (\"P-Lock\") from physically engaging, posing a vehicle rollaway risk.",
            symptoms: [
              "“Check Electric System” warning (orange wrench icon)",
              "“Check Braking System” warning",
              "P gear may not engage solidly via the stalk switch"
            ],
            // Two-part plan: a transient-reset attempt first, then real recall/warranty action if
            // that doesn't clear it — matches the actual researched content, not simplified down
            // to a single step list.
            actions: [
              {
                title: "1. Perform a Hard Sleep Cycle (Temporary Glitch Reset)",
                intro: "If this is a transient electronic sensor desynchronization, you can force the HEVC network to reboot:",
                type: "ordered",
                items: [
                  "Park the vehicle safely on a completely flat surface.",
                  "Turn off the ignition, step out, and lock the vehicle.",
                  "Move the key fob far enough away so the car terminates its proximity link.",
                  "Wait exactly 10 to 15 minutes to allow the CAN-bus and HEVC to enter deep sleep mode.",
                  "Re-enter and check if the code clears."
                ]
              },
              {
                title: "2. Contact Renault for Recall Verification",
                intro: "Because 2024 and 2025 Megane E-Tech vehicles have a documented P-Lock Parking Pawl Rollaway Recall (Campaign ID: 0EWQ), this repair is typically covered 100% under manufacturer warranty.",
                type: "unordered",
                items: [
                  "Call an authorized Renault dealership and provide the vehicle's 17-digit VIN (driver's side door jamb or base of the windscreen).",
                  "Ask if the vehicle falls under the parking actuator replacement campaign — the dealer fix involves re-indexing or replacing the actuator hardware inside the electric drive unit at zero cost."
                ]
              }
            ]
          }
        },
        { ecu: "HEVC - Electric vehicle electronic control unit - AT", code: "U2165", status: "INTERMITTENT", description: "CAN communication error (sonar)" },
        { ecu: "BMS - HV Battery 1 - AT", code: "P1B01", status: "INTERMITTENT", description: "Cell voltage circuit" },
        { ecu: "BMS - HV Battery 1 - AT", code: "P1B20", status: "INTERMITTENT", description: "Relay 4 control circuit" },
        { ecu: "Regenerative Braking System - Diagnose - AT", code: "C18EA", status: "PERMANENT", description: "VDC (vehicle dynamic control)" },
        { ecu: "Regenerative Braking System - Diagnose - AT", code: "C18F9", status: "PERMANENT", description: "VDC (vehicle dynamic control)" }
      ]
    },
    "bmw i4": {
      batteryHealthPercent: 87.3,
      // lossPercent stated explicitly (12.7%) rather than derived from the two capacity figures
      // below — the real PDF's own displayed 75.0/65.3 kWh round to 12.9% if recomputed, so its
      // 12.7% must come from more precise underlying values than what it actually prints.
      capacity: { initialKwh: 75.0, currentKwh: 65.3, lossPercent: 12.7 },
      cellVoltage: { minV: 3.92, maxV: 3.98 },
      temperature: { minC: 18, maxC: 34 },
      faultCodes: [
        { ecu: "Software Cluster Embedded 1", code: "U14FF00", status: "PERMANENT", description: "Secure Onboard Communication" },
        { ecu: "Electrical motor", code: "U044300", status: "INTERMITTENT", description: "Invalid Data Received From Body Control Module B" }
      ]
    }
  },

  // No real reference for any other EV/hybrid — healthy pack, no faults, same ballpark numbers
  // the original (pre-reference) implementation used for its EV variant.
  EV_DEFAULT: {
    batteryHealthPercent: 92,
    capacity: { initialKwh: 77.0, currentKwh: 71.0, lossPercent: 7.8 },
    cellVoltage: { minV: 3.82, maxV: 3.84 },
    temperature: { minC: 22, maxC: 24 },
    faultCodes: []
  },

  lookup: function (brand, model) {
    var key = (brand || "").trim().toLowerCase() + " " + (model || "").trim().toLowerCase();
    return this.vehicles[key] || this.EV_DEFAULT;
  }
};
