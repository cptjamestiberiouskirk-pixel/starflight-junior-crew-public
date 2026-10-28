# October 26 security and Windows tester verification

The source contains the security-remediated game and current Windows packaging
tools. The tester ZIP, personal saves, disposable profiles, raw security outputs
and local evidence archives are not uploaded with this source update. The
repository remains private; no site deployment or release upload occurred.

## Current tester identity

| Item | Value |
| --- | --- |
| Archive supplied privately | Starflight-Junior-Crew-Windows-x64-20261026-security.zip |
| ZIP bytes | 1,650,938,840 |
| ZIP SHA256 | `503a07389a216d21bd8f3032e0d65034d32e359b639fc0cc55858e0e2a55bf66` |
| Compiled entry | `assets/index-ChqdbkwB.js` |
| Game SHA256 | `0b63fdcaf5daa163d43bcf47fb300850796764bb618e0eca49afcccabcf02570` |
| Runtime | Bundled Node 24.22.1, Windows x64 |
| Files | 3,924; every ZIP CRC and extracted manifest size/hash verified |

The native launcher was compiled locally and tested from the ZIP's extraction
in a folder containing spaces, square brackets and an ampersand. It uses the
bundled runtime; players need no Python, Node installation or terminal commands.
See [Windows instructions](../WINDOWS_TESTING.md).

## Security changes

- The loopback-only tester server now bounds connections, active responses,
  request rate and idle sockets. An aborted request cannot release admission
  while filesystem work remains, then open an orphaned file stream.
- A checksum-bound install-time picomatch guard rejects ambiguous repeated glob
  syntax in both development-tool dependency copies. Supported npm commands
  also run the guard before starting their tools. Unknown parser content or
  versions fail closed. [Mitigation details](SECURITY_MITIGATIONS.md).
- Existing state, simulation and save handlers remain in `App.tsx`; existing
  markup moved to typed `GameInterface.tsx`. Both modules are below Snyk Code's
  1 MB file limit. Controller statements and JSX were compared before/after,
  and protected game-rule/save files were hash-checked as unchanged.
- The security check rejects code modules reaching 900,000 bytes, preventing a
  recurrence of the oversized-file exclusion.

Actual Snyk dependency and Code scans completed after the fixes. Both app
modules were included in the source snapshot, with no oversized source
exclusions. One high dependency advisory through two development-tool paths
remains visible: Snyk lists no upstream fixed release, and package inventory
does not recognize the local parser mitigation. Code returned nine raw alerts
(one high, three medium, five low), covering the root-bound reader, custom
limiter, diagnostic launcher and local HTTP/test fixtures. Local tests and
review contextualize them; no ignore or remote closure was applied. This is
not a zero-findings report or exhaustive security certification.

## Observed checks

| Scope | Result |
| --- | --- |
| Clean source install, typecheck, production build/resources | Passed |
| Source regression suite | 10,718 assertions across 34 suites passed |
| Dependency attack/ordinary glob checks | 68 assertions, both installed copies |
| Installer tamper/version/idempotence checks | 4 passed |
| Extracted native launcher | 7 passed |
| Extracted packaged browser | 6 passed |
| Native previous-to-current upgrade flow | 6 passed, including save suite below |
| Extracted package adversarial/historical save browser cases | 87 passed |
| Extracted server regressions | 53 passed |
| Extracted server resource/security checks | 14 passed |

The launcher worked with PATH empty and a hostile Node preload setting present,
reused its own instance, shut down cleanly, cleaned up after abrupt exit,
preserved an unrelated port occupant and opened a physically muted Edge profile.

A save created by the old native EXE continued under the new EXE in the same
disposable browser profile and local address, without re-import. Save/reload
preserved crew identities, equipment, ship identity, credits and artifact
inventory. Malformed/oversized imports retained existing test slots, and
historical fictional QA voyages/campaign backups loaded, saved and reloaded.
No personal saves were used. The previous ZIP was independently rehashed and
left unchanged.

## Limits

These are observed Windows development-host and disposable-browser results.
Independent clean Windows acceptance, broader physical-device/accessibility
coverage, human listening, package campaign/soak and public distribution rights
remain separate gates. Earlier earned campaigns and long soaks retain their
earlier build identities. No new paid Cloud scan was run for source publishing.

Local evidence locations for the maintainer are `artifacts/snyk-remediation-20261026/`
and `artifacts/windows-tester-20261026/`; they are ignored archives, not clone
prerequisites or hosted downloads. [Release readiness](RELEASE_READINESS.md)
keeps the remaining gates explicit.
