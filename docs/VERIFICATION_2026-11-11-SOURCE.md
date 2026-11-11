# November 11 source update and verification

This source update includes the completed November 6–8 fixes for survey and mining guidance, persistent explored sites and readings, campaign navigation, trade receipts, ship repair estimates, shield-purchase persistence and oversized-relic feedback. Encounter guidance now explains weapon reach, recovery and clearance without changing combat balance. The approved artwork, recorded voices and save compatibility remain intact.

## Source checks

The corresponding source passed TypeScript checking, 63,148 source assertions, a production build and build-resource integrity checks. An ordinary build without the optional optimized image cache passed using the original PNG ship images. A separate rebuild using the verified cache reproduced the accepted November 8 JavaScript entry byte for byte:

- Entry: `assets/index-C_vWg3IU.js`
- SHA256: `45a135db37cce8d6bbcdb8c37813368ae26b4e76bdc5582a520cab8789ff35cf`

Source-build instructions remain in [Development](DEVELOPMENT.md). Different cache choices can produce different bundle filenames; the cache is optional and is not required to build this public source. No dependency, asset or license update is part of this change.

## Maintainer's private-package checks

These results describe the named private tester builds, not a public Windows download or universal platform acceptance:

- November 5 clean Windows checks on the November 2 tester covered normal-user launch, an earned offline voyage, save/export/import, full browser/server restart, update continuity and shutdown.
- November 6 focused checks covered trade-receipt clearing, starmap mission targets, explored-site persistence and campaign progression, including cold reopening of the relevant saves.
- November 8 checks verified the final private package manifest, normal equipment purchases and persistence, recovery after controlled combat losses, and the oversized-relic guidance correction. Gameplay losses were retained; they did not establish a balance defect.
- November 11 tested the November 8 package for one continuous 1,801.629-second docked session: 40 menu cycles, eight checkpoint checks and a full browser/server restart followed by Continue Mission. All 38 required fields matched, including credits, gear, health, fuel, crew, assignments, cargo, artifacts and progression. There were zero page errors, console errors or warnings. Two local model requests ended with `ERR_ABORTED`; their cause was not established. The session stayed docked, so it does not establish flight, docking-transition or campaign-soak coverage.

The November 11 run used a muted, disposable, noninteractive Windows guest with Chromium Headless Shell. Saved inputs remained unchanged and the guest was removed afterward. This is distinct from normal-user Edge, physical-input and audible-audio evidence. Detailed recordings, test saves and packaged binaries are retained privately and are not clone prerequisites.

## Remaining boundaries

Physical-device checks, screen-reader speech, human listening and broader or longer flight/progression soaks remain open. Earlier full-campaign and browser-suite results retain their dated build scopes. The [release-readiness record](RELEASE_READINESS.md) keeps these distinctions explicit. The Windows ZIP remains private; Pages remains undeployed and manual-only. This update publishes source and relevant tests only.
