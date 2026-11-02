# Windows tester and source update -- November 2, 2026

The rebuilt private tester includes the latest crew identity, recommendation, name draft, navigation/input, flare, launch and save-lifecycle fixes, plus verified storage readback and persistent session-recovery warnings. The existing ship design, artwork, recordings, time/equipment/progression rules and save format are preserved. The separately requested unique-crew requirement remains enforced.

## Private package identity

| Item | Verified value |
| --- | --- |
| ZIP | Starflight-Junior-Crew-Windows-x64-20261102-tested.zip |
| Bytes | 1,113,019,790 |
| SHA-256 | `6c8349927114a2609844cf9bf57991f508f3dd5afd2c4fb9ea3fea3c946afcbc` |
| Files | 3927; every archive CRC and extracted manifest hash passed |
| Game entry | `assets/index-BVZYtWwu.js` |
| Game SHA-256 | `4213decdbb0eadce15637cef67df262952fccda7dc142eef134be01028d7b911` |
| Runtime | Bundled Node.js 24.22.1, Windows x64; no player installation required |

The ZIP stays private and is excluded from both GitHub source trees. Both repositories receive reviewed text source, tests and documentation while retaining their separate histories. No public binary attachment or Pages deployment is included.

## Observed acceptance

- 63,138 source assertions, typecheck, dependency/source-size/server-limit guards passed again for packaging. The exact game bundle and original assets match the accepted [deep feature build](VERIFICATION_2026-11-02-DEEP-FEATURES.md).
- Seven native launcher and six packaged-browser checks passed, including the real browser-opening branch with a physically muted disposable profile, safe reuse/shutdown, unrelated-port protection, launch, docking and ordinary save/reload.
- Seven previous-tester upgrade checks passed from the November 1 audio-fixed EXE. A checkpoint was created in a disposable profile using the old tester, retained byte-for-byte on the new title before continuation, then continued without re-import at the same origin. Reload preserved crew IDs/names/races/portraits/skills, credits, equipment and artifacts. This verifies compatibility without accessing owner saves.
- 253 compiled browser cases across 20 suites passed against extracted files. Most use the native EXE server on port 4188. Four fault/round-two suites retain their existing protected-port restrictions and use an isolated loopback server on port 5552 serving the same extracted game directory.
- A fresh packaged ISS Meridian campaign completed 17 earned mining voyages, equipment/fuel purchases, both drone challenge sequences, Black Egg and Crystal Orb recovery, the Control Nexus, victory, title continuation and full reload. No starting fixture, injected progress, seeded randomness or developer mode was used; known-chart guidance was used. All six source/species/style-generated names, portraits and distinct recommended assignments survived, with no casualties.
- The boundary and final player/clock suites ran after the campaign and matrix browsers closed. Clock advancement, pause and resume passed. Save-editor timing passed the unchanged eight-second ceiling: over-limit Base64 1399 ms; at-limit Base64 3564 ms.
- 53 portable-server checks passed. All package-owned test servers closed after acceptance; previous ZIP SHA-256 remains `a5371a4b98ca51d56ba7a045ea34322cb0162ab2a428d9a8c82449659188606f`.

Detailed receipts, fake missions, profiles, action logs and videos remain under the ignored local `artifacts/windows-tester-20261102` directory. New regression tests use a configurable Playwright module path instead of a workstation-specific path.

## Existing saves and remaining limits

Owner browser profiles and saves were never opened, imported or overwritten. Save and export your current progress, close the old game tab, exit the old tray server, extract this ZIP into a separate folder, then launch the new EXE. Keep the same browser profile and tester address: **http://127.0.0.1:4188/starflight-junior-crew/**. The developer preview on port 4174 has separate storage. Keep the old package until continuation is confirmed; do not clear site data or start a replacement mission to update.

A session-only warning means storage did not preserve the checkpoint. Export a backup before closing that tab. Failed writes remain recoverable for the session; they are not a substitute for durable storage.

This is development-PC acceptance. Independent clean-Windows/VM acceptance, physical-device checks, screen-reader output, human audio listening and longer unattended soaks remain unverified. Browser testing stayed physically muted. The existing security mitigations remain in place; this task does not claim a new upstream advisory closure or an exhaustive all-state certification.
