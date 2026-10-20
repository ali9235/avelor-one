# Validation record — 20 October 2026

## Local results

| Check | Result | Scope |
| --- | --- | --- |
| Thermal / energy tests | 11 passed | Heat balance, cooling, bounded battery energy, coupling, thermostat, interlocks and timestep partitioning |
| Charging status tests | 6 passed | Green charging, idle removal, warning priority, weak alignment, inspection and full battery |
| TypeScript | Passed | Source type checking |
| Browser interaction | Passed | Windows Chromium / Direct3D 11, 1440 × 960 desktop and 390 × 844 responsive viewport |
| JavaScript page errors | None reported | Successful browser workflow |

The browser workflow touches the actual 3D display to increase the setpoint from 45°C to 46°C, switches page and starts the heater. It also docks and removes the bottle, opens the cap, checks the resulting warning, captures green/amber states, and exercises interior/exploded views. Mobile validation checks horizontal overflow; it is not a physical iPhone test.

The supplied GitHub Actions workflow runs unit tests and a production build on future pushes. Its presence is not a claim that a remote run has already succeeded.

## Reproduce

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm dev --port 5190
```

In another terminal:

```sh
pnpm run test:browser
```

If using an existing Chromium installation, set `AVELOR_BROWSER_EXECUTABLE` to its executable path. Set `AVELOR_RECORD=1` to save a real browser recording. Captures and the machine-readable check list are written to ignored `test-results/`; curated copies are in `media/`.

## Evidence

- [Application overview](../media/experience.png)
- [Green charging state](../media/charging-green.png)
- [Amber cap-open state](../media/charging-warning.png)
- [Exploded assembly](../media/exploded.png)
- [Mobile viewport](../media/mobile.png)
- [Real interaction recording](../media/interaction-demo.webm)
- [Browser check output](../media/browser-checks.json)

The images are direct application screenshots. The recording shows the software workflow, not a physical manufactured product.

## Limits

No physical heater, battery pack, wireless transmitter or bottle was measured. No fixed frame-rate claim is made. Safari on an actual iPhone, physical touch hardware, long-duration memory use and manufacturing tolerances require further validation. The production bundle produces a size warning; that remains documented performance work.

Numerical tests validate the implemented equations against their stated assumptions. They do not establish that those assumptions match an eventual physical product.
