# Windows tester and source update - November 1, 2026

The owner requested both Junior Crew repositories be updated with all latest fixes and unique crew assignments, and the Windows tester rebuilt privately. The package includes the completed second-pass fixes: bounded save arithmetic and rendering inputs, checkpoint validation before storage writes, paused launch preparation, transporter cleanup, safe interest timestamps, and recovery after failed hangar resource loads. Each bridge role now needs a different officer, including casualty succession and departure clearance. [Crew verification](VERIFICATION_2026-11-01-CREW-ASSIGNMENTS.md) describes the rule and legacy review.

## Private package identity

| Item | Verified value |
| --- | --- |
| ZIP | Starflight-Junior-Crew-Windows-x64-20261101.zip |
| Bytes | 1,113,014,069 |
| SHA-256 | `312fe0c1e12a9048ac77d57368de97271a4cc5cf2d4406a00da8853ea9a00cb2` |
| Files | 3,927; archive CRCs and extracted manifest hashes passed |
| Game entry | `assets/index-UbzWuYtI.js` |
| Game SHA-256 | `cb83ec7729418f29f3bce8b57eab8a0329e49a0a8cf02435f0ee2a745020d9cd` |
| Runtime | Bundled Node.js 24.22.1, Windows x64; no player installation required |

The October 31 ZIP is retained and rehashed unchanged. The rebuilt ZIP stays local/private. Both repositories receive reviewed text source, tests and documentation; no ZIP, browser profile, save payload or raw development evidence is uploaded. The public repository keeps its separate fresh history and the original repository remains private. Source updates do not run the manual Pages deployment or create a public binary release.

## Verification

The exact game bundle already passed 50,229 source assertions, typecheck and a repeated identical production build; 55 compiled-game Playwright cases and continuation through victory/save/reload from the prior campaign's unedited earned pre-arm checkpoint. The full economic grind and preceding story stages were not repeated on every revision. The [second pass](VERIFICATION_2026-11-01-SECOND-PASS.md) records its independent adversarial feedback and earlier build-specific coverage. Resource verification confirms the approved artwork, ship masters, audio, models and animated crew atlases remain byte-identical.

Extracted-package acceptance results are recorded in the local `artifacts/windows-tester-20261101/verification.json` and accompanying report. Native launcher/browser, prior-tester continuation, historical save, size-boundary, unique-crew and gameplay checks run against the extracted ZIP at the tester's normal origin using physically muted disposable browser profiles.

Observed on the extracted ZIP:

- Seven native launcher and six packaged-browser checks passed, including the launcher's physically muted Edge branch, safe reuse/shutdown, unrelated-port protection and ordinary save/reload.
- All 87 historical/adversarial save cases and all three save-size boundary checks passed. Invalid imports preserve the destination slot; exact-limit content remains importable.
- Eight upgrade-orchestration checks passed. A browser save created through the previous October 31 EXE continued through the new EXE at the same origin and disposable profile without re-import. Crew, equipment, credits and artifact inventory were compared after saving and reloading.
- **164 packaged gameplay regressions passed:** 11 crew assignment, 13 deep feature, six launch/pause, 32 numeric save, 32 rendering-input save, four hangar-resource failure/recovery, 15 orbital/lighting, 14 navigation/input, 13 contextual action, nine communications and 15 player/Science/clock cases.

The save schema and original time/equipment/progression rules remain compatible; the unique-crew rule is the separately requested gameplay change. This acceptance does not present the older instrumented button audit as a fresh exhaustive run on the package.

## Saves and limits

Owner browser profiles and saves are never opened or modified by these checks. Save format and fixed addresses remain unchanged: private preview on port 4174, portable tester on port 4188, both under `/starflight-junior-crew/`. Keep the same browser/profile and address to continue an existing mission. Save/export current progress, exit the old tray server, extract the new version separately and launch its EXE. Do not clear site data or start a replacement mission to update.

Legacy duplicate duties load into a paused review; an officer retains their first duty and repeated roles appear vacant. No checkpoint writes occur until explicit confirmation. Cancel returns to the title without saving. Short-handed missions may continue and recruit at Starport, but launching from Starport requires six different living officers. Crew identity, equipment, cargo, location and mission progression are retained.

These checks cover the development Windows PC. Independent clean-Windows acceptance, physical-device and screen-reader coverage, human listening and a fresh full packaged campaign/soak remain unverified. The local picomatch mitigation remains active; this update does not claim an upstream advisory closure. Private package receipts and profiles remain under ignored `artifacts/`.
