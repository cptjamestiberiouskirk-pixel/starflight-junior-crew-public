# Planet lighting and orbital motion verification

The system view now draws one thin, sun-facing atmospheric rim. Previously a density-dependent half-circle stroke (up to 9 world units wide plus an 8-unit blur) was stacked with a second atmospheric halo. That exaggerated the bright edges of denser planets, especially at higher zoom. Density still affects the new rim's strength; airless planets have no rim. System rim strokes are capped at 1.1 screen pixels, with no shadow blur. The larger Science/orbit atmosphere presentation is unchanged.

Orbital angular speed now follows `omega = sqrt(mu / r^3)`, using each planet's existing orbital radius. A fourfold increase in radius therefore increases the period eightfold. This is the circular, coplanar two-body solution of Kepler's laws: [NASA explanation](https://science.nasa.gov/solar-system/orbits-and-keplers-laws/). The previous slot-based `0.05 / sqrt(slot)` formula did not give the correct relationship. Inner planets now clearly overtake outer planets.

The map has neither astronomical distance calibration nor calibrated stellar masses. It uses a shared normalized gravitational parameter, 540 map units cubed per display second squared, placing the 60-unit reference orbit at 0.05 rad/s. This is an accelerated physical relationship, not a claim of real calendar orbital periods or a full gravitational simulation. Spectral classes, gameplay planet mass, temperature and atmosphere are not treated as precise astronomical mass measurements. Circular paths, orbital radii and the existing axial texture rotation are retained; eccentricity, interactions between planets and stellar evolution are not simulated.

The existing saved animation clock drives motion. Rendering, proximity checks and launch/destruction placement use the same position calculation. Legacy `orbitSpeed` remains a valid save field and retains its epoch offset, while runtime motion uses the radius-derived rate. Saves load without migration; ship positions, equipment, voices and mission rules are retained. Planet phases at an existing nonzero clock reflect the newly requested orbital law and can differ from the older animation.

## Observed validation on October 31, 2026

- TypeScript, production build and resource checks passed.
- 13,326 unit assertions passed, including the Kepler invariant for all 811 canonical planets, relative periods, legacy clock/save decoding, long-running clocks and invalid-input guards.
- 15 Playwright checks passed on the final production bundle: observed canvas positions obey the Kepler ratios, retain circular radii, pause exactly and resume; a mixed airless/very-thick-atmosphere system has one thin directional rim per atmospheric planet and none on airless worlds. Desktop and compact screenshots were reviewed, and ordinary slot save/reload retained the clock and ship position.
- 14 additional navigation/input/home-guidance browser regressions passed.
- Dependency guard, source-size and local server-limit checks passed. No new upstream security-status claim or paid scan.

All browser sessions were disposable and physically muted. Owner browser storage was not opened or modified. Initial canvas-observer assertions accumulated records across frames; the observer was corrected to reset at the actual system-frame boundary, and the final checks passed. Those earlier harness results remain in private artifacts.

## Local delivery

The private preview is staged under `artifacts/planet-orbits-20261031/final-preview/` at the existing local origin. Its entry is `assets/index-CZ55noSj.js`, SHA-256 `664787229014af917b6ce3163b54dc2fd546e24f3d574e6cc2adc3a08f4489c7`. Earlier static assets are retained for open tabs. Save current progress before manually refreshing an existing tab.

Evidence is local under `artifacts/planet-orbits-20261031/final/browser.json` and `final-navigation/browser.json`; unit, build, resource and security logs are in `artifacts/orbit-physics-*-20261031.log`. This planetary verification task did not rebuild a package or publish source. The subsequent owner-requested rebuild and source update are recorded separately in the [package verification](VERIFICATION_2026-10-31-PACKAGE.md).
