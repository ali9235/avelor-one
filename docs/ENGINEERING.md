# Engineering analysis

## Goal and constraints

AVELOR ONE explores a portable water vessel that maintains a selected temperature on a desk and communicates its power state clearly. The physical envelope targets 250 × 75 mm and a 500 mL fill. Heating performance, battery size, insulation and wireless alignment must be considered together: visual integration alone does not establish feasibility.

The software implements an inspectable numerical model and interactive geometry. All runtime readings are simulated. No instrumented physical bottle has been tested in this project.

## 1. Thermal balance

For well-mixed water:

```text
Qdot_water = eta_heater * P_heater - UA * (T_water - T_ambient)
dT/dt      = Qdot_water / (m_water * cp_water)
```

| Quantity | Unit | Default |
| --- | --- | --- |
| Water mass | kg | 0.5 |
| Specific heat | J/(kg·K) | 4,186 |
| Heater electrical power | W | 35 |
| Heater thermal efficiency | ratio | 0.90 |
| Heat-loss coefficient UA | W/K | 0.35 |
| Ambient temperature | °C | 22 |

The integrator divides long calls into substeps no larger than one second. This bounds ordinary numerical step size; it is not a stability proof for arbitrary user-modified parameters. Negative or non-finite elapsed time is ignored. The interface makes time acceleration explicit and pauses updates when the page is hidden.

For a 21 K increase, water alone needs `0.5 × 4186 × 21 = 43,953 J`, or approximately 12.21 Wh. At 31.5 W delivered heat, the ideal lower bound is approximately 23.3 minutes. Heat loss increases that time. A 30× display clock changes observation speed, not physical heater power.

This model excludes vessel heat capacity, mixing gradients, evaporation, boiling and contact heat transfer to a hand. The `waterMass` input represents a changed load at the current temperature; changing the slider does not model adding cold water.

## 2. Wireless coupling

`src/physics.ts` uses an assumed response surface:

```text
r   = sqrt(x² + z²)
eta = 0.82 * exp(-(r / 0.025)²) * exp(-gap / 0.012)
P_received = 60 W * eta
```

Offsets and gap are in metres. Transfer is zero at or beyond 45 mm radial offset, above 12 mm gap, or for a negative gap. The application fixes gap at 3 mm; the pure function supports other gaps. Inspection forces transfer to zero.

The exponential curve expresses sensitivity to alignment. It is not fitted to measurements and does not solve coil inductance, field geometry, impedance matching, foreign-object detection or transmitter control. The ring is a visual placement guide; its geometry is not the model's coupling cutoff. No Qi compatibility is claimed.

## 3. Electrical energy accounting

1. Received wireless power supplies the heater and a 0.15 W electronics load.
2. Surplus can charge the 18 Wh battery at up to 12 W, with 92% charging efficiency.
3. A deficit discharges the battery, limited by stored energy over the integration step.
4. Stored energy is clamped between zero and capacity; charge acceptance approaches zero at full capacity.

Battery power is positive while charging and negative while discharging. The energy counter for the desk includes its assumed full 60 W enabled draw. Unaccepted surplus and conversion losses are not stored in the battery. Real transmitter modulation, standby draw, inverter losses and cell-current limits need a more detailed electrical model.

## 4. Control and interlocks

The target is limited to 25–60°C. The heater switches off at the target and restarts below target minus 0.4°C. This hysteresis prevents continuous switching near the setpoint.

Heating is inhibited by water below 50 mL, an open cap, inspection mode, invalid temperature or temperature at/above 65°C. These software conditions are simulation behaviours. A real product requires independent thermal cutouts, reliable level sensing and a validated battery management system. The invalid-sensor case stops the current step and resets the numerical temperature to ambient; it is not a latched hardware fault model.

## 5. Charging-ring semantics

| Priority | Condition | Appearance | Meaning |
| --- | --- | --- | --- |
| 1 | Inspection mode | Neutral | Power disconnected intentionally |
| 2 | Simulation interlock | Amber | Attend to the accompanying text |
| 3 | Nonzero efficiency below 30% | Amber | Weak coupling; re-centre the bottle |
| 4 | Receiver powered and positive battery power | Green | Battery accepting charge |
| 5 | Receiver powered, battery not charging | Softer green | Power connected; battery flow may be zero or negative |
| 6 | No transfer or warning | Neutral | No active connection |

`chargingIndicator()` derives semantic state from the energy model. It does not modify the model. The ring interpolates material colour, emissive intensity and a restrained halo using `alpha = 1 - exp(-4 dt)`, with a capped animation delta. Reduced motion switches immediately to the target. Transitions can reverse from the current rendered colour. There is no flashing or continuous pulse.

Warnings take priority even if wireless power is present. A cap-open warning means the heater interlock is active; it does not claim the wireless receiver has electrically failed.

## 6. Rendering and interaction

The body is a lathed profile with PBR transmission, an inner metallic cylinder, a graphite cap and a receiver ring. One scene unit is 100 mm. The inner cylinder's nominal volume is approximately 494 mL before headspace and packaging allowances; a practical 500 mL vessel needs revised dimensions.

The 512 × 512 display texture is updated from state. Raycast UV coordinates map touches to temperature, page and power controls. Pointer capture supports moving the bottle on a horizontal plane, while the orbit control is disabled during a bottle drag. The adjacent control panel supplies keyboard-accessible equivalents.

The renderer uses capped pixel density, a 1024² shadow map and a single contact-shadow capture. This reduces render cost, but the cached contact shadow does not continuously track repositioning. No fixed frame rate has been established.

## 7. Decision record

| Choice | Benefit | Cost / follow-up |
| --- | --- | --- |
| Pure TypeScript energy model | Deterministic testing without WebGL | Assumptions require physical calibration |
| React state plus bounded numerical steps | Clear shared source of truth | UI clock is not a laboratory timing system |
| Procedural Three.js geometry | Reproducible source and compact assets | Needs separate mechanical CAD and tolerances |
| Canvas texture and UV touch | Display stays attached to the product | Screen-space automated tests depend on a fixed viewport |
| Native interpolation | No added animation framework | Performance still depends on device GPU |
| Static hosting | No application backend or runtime keys | No durable account state or hardware connection |

## Path to hardware

First validate the water volume, electronics cavity and thermal separation in mechanical CAD. Measure heat loss on a safe instrumented vessel, then measure coupling across offset and gap with suitable power electronics. Fit the model only after obtaining repeatable data. Add battery temperature/current limits and independent cutouts before closed-loop hardware tests. Record instruments, calibration, ambient conditions and failures alongside successful trials.
