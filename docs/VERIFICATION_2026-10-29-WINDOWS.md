# Private Windows tester — October 29, 2026

The rebuilt Windows x64 tester includes the latest navigation, guidance, surface,
equipment-comparison and dialogue improvements, the labeled Expedition clock,
and lossless ship-image optimization. Original time rules, ship design, voices
and save format are unchanged. The older ZIP and extracted tester are retained.

| Item | Verified value |
| --- | --- |
| ZIP | Starflight-Junior-Crew-Windows-x64-20261029.zip |
| Size | 1,111,924,010 bytes |
| SHA-256 | `bf635971ed303a028590cd49259e7309784725b550b5fa84837c6fa5b0dab623` |
| Files | 3,927; every archive CRC and extracted-file manifest hash passed |
| Game bundle | `assets/index-DKzV7Laz.js` |
| Bundle SHA-256 | `b2c06a652b1afe7f61226edea345fa68d4f58dc4b4ea0754ced8846b707b98a8` |
| Runtime | Bundled Node.js 24.22.1, Windows x64 |

The ZIP is supplied locally/private, with its checksum companion. It has not
been uploaded to a GitHub Release or public download. License, credits and
required third-party notices are bundled.

## Extracted-package checks

- Seven native launcher checks passed, including bundled-runtime launch,
  second-instance reuse, shutdown, orphan prevention, port-conflict preservation,
  missing-file handling and the real muted Edge browser branch.
- Six packaged-browser checks passed: title, malformed import rejection, valid
  mission import, real dance frames, save/reload, and media/model resource checks.
- Seven old-to-new upgrade checks passed, including continuation without re-import
  at the identical browser origin, crew/equipment/mission preservation, all 87
  adversarial/historical save cases and all 16 clock/layout checks.
- The extracted server passed 53 path/range/MIME/resource regressions and 14
  connection/rate/cancellation-limit checks.
- A configured launch rendered the actual bay model in 3D, with the expected
  cargo pod and engine configuration and no render or transform errors.

Edge can report `ERR_ABORTED` after a model has fully streamed into Three.js.
The updated smoke driver requires exact browser body-size evidence and a matching
HTTP model SHA-256 for that case; ordinary steady-state failures and truncated
transfers remain failures. Earlier diagnostic attempts are retained in local
evidence. The initial sandbox junction-fixture restriction was resolved by running
the extracted-server regression in normal local execution.

## Saves and local servers

The private preview keeps **http://127.0.0.1:4174/starflight-junior-crew/** and
the Windows tester keeps **http://127.0.0.1:4188/starflight-junior-crew/**.
At verification time, both served the exact tested build and optimized artwork
with no-store headers.
They listen only on local loopback. The tester's tray icon can reopen or stop it.

Keep using the same browser/profile and address as before, then choose
**Continue Mission**. Ports 4174 and 4188 have separate browser save storage;
moving between them still uses Export/Import Save. No owner browser saves or
profiles were read, changed or cleared by this rebuild. Actual upgrade tests used
fictional saves in disposable, physically muted profiles. Keep exported backups
for your own recovery needs.

These are local development-machine checks, not independent clean-Windows,
physical-device, human-listening or full packaged-campaign/soak certification.
The [source verification](VERIFICATION_2026-10-29.md) documents the existing
10,801-assertion source baseline and other release limits.
