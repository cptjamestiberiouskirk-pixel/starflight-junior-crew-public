# Windows tester and source update - October 31, 2026

The owner requested both Junior Crew source repositories be updated and the Windows tester rebuilt privately. The package includes all latest local fixes: Elowan portrait and communications timing, stopped Maneuver transitions, home-course guidance, header explanations, contextual button availability, disabled-animation suppression, thin sunward atmosphere rims and circular Kepler orbital speeds. It retains the Science graphics, visible Expedition clock, large-save editor fix and server safeguards.

## Private package identity

| Item | Verified value |
| --- | --- |
| ZIP | Starflight-Junior-Crew-Windows-x64-20261031.zip |
| Bytes | 1,113,011,733 |
| SHA-256 | `6665661ae4f1d3a415f3df865bff6f23215d731f5852887eded818a4d0efa78e` |
| Files | 3,927; every archive CRC and extracted manifest hash passed |
| Game entry | `assets/index-CZ55noSj.js` |
| Game SHA-256 | `664787229014af917b6ce3163b54dc2fd546e24f3d574e6cc2adc3a08f4489c7` |
| Runtime | Bundled Node.js 24.22.1, Windows x64; no player installation required |

The previous October 29 save-editor ZIP was retained and rehashed unchanged. The new ZIP is supplied locally/private, with no GitHub Release, binary upload or website deployment. Both repositories receive reviewed source, developer test tooling and documentation. The public repository keeps its separate fresh history; the original repository remains private.

## Verification

- Source TypeScript, production build/resource checks and 13,326 unit assertions passed on the exact packaged game bundle.
- Seven native launcher and six native-browser smoke checks passed using the extracted ZIP, including the launcher's own physically muted Edge branch, safe reuse/shutdown, unrelated-port protection and ordinary save/reload.
- All 87 historical/adversarial save cases passed against the extracted package's native server, including invalid-import destination preservation, legacy formats/keys, historical fictional voyages and save/reload continuity.
- All three large-save boundary tests passed on that server: oversized decoded content rejects without replacing the slot, exact-limit content imports, and export recovery works.
- An existing save created through the previous native tester continued through the new EXE at the identical browser origin without re-import. Crew, equipment, credits and artifact inventory were compared after saving and reloading.
- All eight upgrade-orchestration checks passed. On the extracted package, another 66 production browser cases passed: 15 orbital/lighting, 14 navigation/input, 13 contextual-action, nine Elowan communications and 15 player/Science/clock cases. These use ordinary controls and fictional fixtures without the audit state bridge.
- The local server passed 53 path/range/MIME/security regressions. Dependency guards, source-size and server-limit checks passed. One sandboxed server-test attempt could not create its disposable junction; the unchanged suite passed with the required filesystem permission. This is not an upstream advisory closure or a new paid/cloud scan.

The [button audit](VERIFICATION_2026-10-30-BUTTONS.md) covers 327 source definitions, 323 reachable controls and enabled/disabled outcomes for all 104 reachable conditional controls. Its broad instrumented audit belongs to its October 30 build and was not presented as a new exhaustive run on this package. The [player journey](VERIFICATION_2026-10-30-PLAYTEST.md), [communications/navigation corrections](VERIFICATION_2026-10-30-CONTROLS.md) and [orbital model](VERIFICATION_2026-10-31-PLANET-ORBITS.md) retain their specific evidence and limits. Audit instrumentation is absent from the production game.

## Saves and testing limits

Owner browser profiles and saves were never opened or modified. All test saves were fictional and all browsers used physically muted disposable profiles. The save schema and addresses remain unchanged: private preview on port 4174, portable tester on port 4188, both under `/starflight-junior-crew/`. Keep the same browser/profile and address to continue existing missions. Save current progress before refreshing an old game tab; exit an old tray tester before launching a new extracted package. No import or new mission is required for a save already at that same origin.

Orbital motion now follows the requested radius-dependent law, so planet phases at an existing nonzero animation clock can differ from the older animation. Existing ship coordinates and mission progress remain compatible. Circular paths and accelerated normalized display time are retained; calibrated astronomical periods and interactions between planets are not simulated.

These are checks on the development Windows PC. Independent clean-Windows acceptance, physical-device/accessibility coverage, human listening and a fresh full packaged campaign/soak remain unverified. The local picomatch guard remains installed; this update does not assert a new upstream fix or close historical static findings.

Detailed receipts, package files and profiles remain local under `artifacts/windows-tester-20261031/`; source-publication manifests are retained separately under `artifacts/github-update-20261031/`. They are not uploaded with the source.
