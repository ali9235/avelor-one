# Security and privacy

The current application is a static browser simulation. It has no application API, account system, server database or runtime API key. It does not request camera, microphone or geolocation permission. Simulation values are held in memory and reset on reload. The host still receives ordinary HTTP requests; browser-only processing is not a claim that hosting providers keep no access logs.

## Repository boundaries

Do not commit `.env` files, tokens, device credentials, generated dependency trees or private logs. The public repository excludes local hosting identity and workstation build output. Review dependency and lockfile changes before installing them. No authentication, authorization or encryption feature is claimed for a future hardware link.

## Threats and limitations

- Browser and GPU-driver vulnerabilities are outside the model; use a maintained browser.
- Numerical values are not trusted hardware telemetry and must not drive a physical heater without a separate validated controller.
- A future device interface needs authenticated transport, bounded commands, independent cutouts and explicit handling of stale telemetry.
- The current software is not certified for controlling a drinking-water appliance.

Report a suspected source issue privately through an available contact on [the maintainer's profile](https://github.com/ali9235). Do not include live credentials in a public issue.
