# Deep feature verification -- November 2, 2026

This local testing goal completed a fresh mission through earned victory and save/reload, then closed the campaign browser before running timing-sensitive acceptance. The final covered paths produced no additional findings. This is finite coverage, not a guarantee about every possible game state.

## Fixed in this pass

Browser storage could reject an imported checkpoint while the UI still claimed a successful durable restore. A write that silently discarded data could also evade detection. The storage helper now reads back each write, retains failed writes for session recovery, and reports durability from the actual checkpoint source selected on load. A new legacy backup cannot conceal an unchanged primary checkpoint.

Imports explicitly distinguish durable restoration from session-only recovery. The main screen keeps an amber warning visible until a verified save succeeds, with export guidance. The same warning remains within the viewport without obscuring the expedition clock at desktop and compact widths. Save format, time rules, equipment, mission progression, voices and artwork are unchanged.

## Observed results

- 63,138 source assertions passed, with zero failures; typecheck, dependency guard, source bounds, server limits, build and asset checks passed.
- 253 compiled Playwright cases passed across 20 suites.
- Fresh ISS Meridian campaign: 17 earned mining voyages, equipment/fuel purchases, Black Egg and Crystal Orb recovery with both drone dialogue sequences, Control Nexus, victory, exported checkpoint and reload. No starting fixture, injected progress, seeded randomness or developer mode was used; known-chart guidance was used.
- All six new source/species/style-generated names, portraits and distinct recommended assignments survived the campaign. Six crew were alive at victory.
- Eight targeted storage cases cover quota failures, silent no-op writes, active-slot recovery, stale primary/new legacy mismatch, recovery after storage becomes available, ordinary durable imports and desktop/compact warning visibility.
- Isolated expedition-clock acceptance verified advancement during play, freezing while paused, and advancement after resuming. Science layouts were checked at widths 360, 390, 768, 1280 and 2560.
- Audio download/decode failures and hangar recovery passed in muted disposable contexts. Existing owner profiles and saves were never opened or read. Muted testing does not establish audible voice/music quality or physical-input acceptance.

The initial concurrent matrix exceeded the eight-second editor timing ceiling for an at-limit Base64 paste (9,268 ms). Its report is retained. The isolated repeat passed unchanged assertions: over-limit Base64 5024 ms; at-limit Base64 6600 ms. The first commissioning attempt also stopped because the test checked a dropdown before its room opened; an explicit UI wait fixed that harness issue, and the failed attempt is retained separately.

## Build and scope

Entry: `assets/index-BVZYtWwu.js`

SHA-256: `4213decdbb0eadce15637cef67df262952fccda7dc142eef134be01028d7b911`

The test-source fingerprint was resealed after adding compact warning assertions; production code and the compiled bundle were unchanged. Evidence is retained locally in `artifacts/deep-feature-goal-20261102` (verification, reports, screenshots, action logs, videos, fault reproducers and earned saves).

- storage-failure: 8 passing cases
- gameplay-round2: 10 passing cases
- lifecycle-round2: 9 passing cases
- name-draft-round2: 6 passing cases
- deep-features: 13 passing cases
- crew-names: 22 passing cases
- crew-assignments: 14 passing cases
- concourse-dance: 14 passing cases
- cinematic-audio: 4 passing cases
- campaign-failures: 10 passing cases
- planet-orbits: 15 passing cases
- navigation-controls: 14 passing cases
- action-availability: 13 passing cases
- elowan-comms: 9 passing cases
- save-boundary: 3 passing cases
- save-render-inputs: 32 passing cases
- save-numeric-state: 32 passing cases
- launch-prelude: 6 passing cases
- bay-resource-recovery: 4 passing cases
- player-regression: 15 passing cases

GitHub repositories and the private Windows tester ZIP were not updated by this task. Browser testing used disposable muted sessions, with synthetic fixtures only for adversarial states and the separate earned campaign for end-to-end progression.
