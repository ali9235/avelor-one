# Development notes and roadmap

## Observed challenges and fixes

| Observed issue | Change | Evidence / boundary |
| --- | --- | --- |
| The initial HTML-based bottle display did not reliably appear during browser tests | Replaced it with a canvas texture and UV-based raycast interaction | A browser test changes target 45→46°C and switches page to operate the heater |
| Mobile framing cropped the product and overlapped the introduction | Adjusted viewport layout and camera target | A 390 × 844 browser capture and overflow check; physical Safari still untested |
| The cap left the frame during the exploded view | Moved the assembly upward and adjusted inspection framing | Actual exploded capture |
| Software-rendered captures timed out | Reduced shadow cost and validated with Direct3D 11 | Successful Windows Chromium checks; no universal performance claim |
| A Windows policy blocked the native Rollup module | Selected the official Rollup WebAssembly build | Tests and production build complete without weakening machine policy |
| Charging colour did not distinguish attention conditions | Added a pure derived status and interruptible green/amber interpolation | Six state tests plus browser charging and cap-interlock captures |

## Roadmap

### Implemented

- Interactive procedural vessel, desk and charging placement.
- Circular temperature, battery and status pages with direct touch interaction.
- Thermal balance, heat loss, energy accounting and thermostat control.
- Cap, low-water and temperature interlocks in the numerical model.
- Green/amber state feedback, reduced motion and text equivalents.
- Real browser captures and repeatable model tests.

### Next software work

- Profile real mobile frame pacing and memory rather than inferring performance from desktop captures.
- Validate physical Safari touch interaction and interruption of drags.
- Separate rendering bundles and investigate demand-based rendering while idle.
- Extend the battery model with temperature, current limits and ageing.
- Test calibrated parameter sets and uncertainty bounds against measured data.

### Hardware-dependent work

- Resolve practical 500 mL volume, headspace, seals and display mounting.
- Select food-contact materials and isolate battery heat from water and electronics.
- Build an instrumented thermal bench with independent protections.
- Characterise coupling, foreign-object response and electrical efficiency.
- Connect hardware telemetry without representing estimated values as sensor measurements.

These entries are planned work, not promises of completed manufacturing or certification.
