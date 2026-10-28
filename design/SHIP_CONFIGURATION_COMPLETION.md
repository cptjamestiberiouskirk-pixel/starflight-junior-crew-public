# Approved ship-configuration completion — 23 October 2026

The approved fixed-hull artwork is produced and integrated into the local game. All **3,672 separate complete transparent PNGs** exist: 17 cargo counts × six armor tiers × six laser tiers × six missile tiers. The current build is `assets/index-Bqgtdg0W.js` (SHA-256 `32a0ec31f1a3f57c1e01c477d1430a4dd22de8b686b0fcc7756bb5d16e4b655f`). Local delivery only; no commit, push, publication or deployment was performed in this continuation.

## Findings and fixes

| Finding | Implemented result |
| --- | --- |
| A complete polished configuration library had not been created | Every valid C/A/L/M configuration now has its own finished 1087×602 PNG. All 22 approved review images match production bytes. |
| First armor draft was too dark and advanced in a straight frontier | Approved revision uses bright white ceramic, selected dark thermal inserts, larger detailed tiles, deep bevels, locking hardware and stronger reinforcement. Tactical coverage prioritizes bridge, engineering, leading edges, roots and spine. |
| Weapon tiers needed distinct strength and appearance | Five distinct laser and missile models, increasing in width and receiver size; original wing hardpoints, barrel counts and launcher counts retained. |
| Flight/landing/shipyard overlays could differ from approved complete artwork | One configuration selector now supplies the complete image in shipyard, flight, orbit, surface and cinematic sprite paths. Original hull frame and proportions are preserved. |
| Docking geometry needed the installed configuration | Approved Blender fittings are exported in a 26-group GLB; real cargo count, armor map and laser/missile classes select visible hardware. Existing approved bay base hull, supports and flight path remain. |
| Beams could appear detached from new guns | Player laser visuals use the approved model emitter coordinates. Native four-beam capture measures zero-pixel origin error. Damage, ammunition and projectile mechanics are unchanged. |
| A 1.55GB library must not load at startup | Only requested configurations load; an eight-image LRU bounds decoded ship-image cache. Native cold-start cases requested no more than three configuration PNGs. Loading/error fallback preserves the original hull. |
| Legacy test duplication and primitive assertions obscured results | Removed the duplicate 58-check legacy execution, retained its compatibility export and archived its source. Updated obsolete primitive assertions to whole-image selection and real exported geometry. No gameplay regression was hidden by double counting. |

Armor classes cover exactly 20/40/60/80/100% of the explicit 174,560-pixel armor-eligible skin: 34,912 pixels per class. Excluded glazing, nozzles, ink seams, truss holes and service hatches remain clear. These percentages describe artwork; original armor statistics are preserved.

## Assets and changed functionality

- Created: 3,672 PNGs totaling **1,550,595,355 bytes**, small runtime catalog, per-image SHA-256 manifest, Blender 5.2.2 LTS masters, approved 26-group `ship-outfitting-kit.glb` (4,143,768 bytes), and five approved armor texture maps.
- Reused: original illustrated hull, approved painted hangar/GLB, ship-free fallback movie, original cargo source, existing recorded voices and Mirelo WAV. Bare C0/A0/L0/M0 remains byte-identical to the original hull, SHA-256 `bfafa94bbc1b947caed68dd26c89fb66c10d50147b9548fb7a14465b47f75b2f`.
- Retired from active rendering: provisional armor grids, generic bay weapon blocks and separate sprite armor/weapon/pod overlays. No original image, voice or legacy save was deleted. Rejected first-draft art remains historical evidence.
- Preserved: gameplay structure, equipment prices/mass/damage, progression, save fields and five slots. Engine exhaust and shields remain animated effects. Existing eight-second launch, legacy three-second in-progress saves, sound clock and pause/skip controls remain operational.

All new models and fitted-layer renders used verified **Blender 5.2.2 LTS**. Blender 5.0 was not substituted. Full PNGs are deterministic compositions of the invariant original illustration and approved Blender-rendered fittings, rather than thousands of separately regenerated hulls. No Meshy submission, external upload or paid generation occurred for this ship pass.

## Actual verification on this build

| Verification | Result |
| --- | --- |
| Unit assertions | **1,844 passed, 0 failed**; real GLB geometry/class groups, original rules, save handling, configuration cache and emitter mapping included. |
| TypeScript / production build / resource checks | Passed. All 3,672 built PNGs match source SHA-256; 120 existing image hashes, approved bay resources, new GLB/maps and local audio checked. Vite still reports the large-chunk advisory. |
| Ship-library compiled browser cases | **28 passed**: 22 approved configurations, 18 ordinary UI purchases with synthetic funds and public save roundtrip, three flight locations, 390px shipyard, actual laser fire. |
| Docking compiled browser cases | **18 passed**: desktop/phone natural launch, pause/resume, skip, current/legacy saves, every class and mixed configuration, actual Mirelo volume/mute and recorded-voice ducking, no-WebGL CPU projection. |
| Graphics/mining regression | **4 compiled cases plus 1 source harness passed**: readable ships, continuous globe motion, landing hardware, five mining cycles without crew recording requests, SFX controls. |
| Fresh missions and gallery | **No new campaign playthrough or 115-scene gallery rerun in this ship-art pass.** Earlier full-pass evidence remains 77 compiled cases, 12 source harness checks, 115 gallery scenes, nine isolated fresh commissions and one guided victory. |

Current total is **50 compiled browser scenarios and one source harness**, separate from historical counts. Tests use isolated Chrome contexts and explicit synthetic fixtures; the user's live Edge storage was not touched. The purchase test uses ordinary UI with synthetic starting funds and `isDev:false`; it is not counted as a fresh mission.

The first asynchronous combat screenshot caught a post-shot frame. Synchronous capture at the fourth actual beam stroke now records visible beams. One capture rerun failed the origin assertion during this investigation; its complete failure is retained in `qa-ship-library-capture-failed.json`. The subsequent focused native case passed with four beams and maximum origin error 0px; no damage logic was changed. The final passing ledger contains all 28 cases. This is a focused alignment check, not certification of every moving-combat frame.

Evidence: [current integration manifest](../artifacts/ship-library-integration.json), [unit results](../artifacts/qa-unit-report.json), [ship cases](../artifacts/ship-configuration-library/runtime/qa-ship-library.json), [bay cases](../artifacts/docking-bay-rebuild/runtime/qa-game-runtime.json), [mining/graphics cases](../artifacts/docking-bay-rebuild/runtime/qa-feedback-regression.json), [approval](../artifacts/ship-configuration-library/revision-v2/human-form-approval.json), [per-image manifest](../assets/ships/manifest.json).

Screenshots: [configured painted bay](../artifacts/docking-bay-rebuild/runtime/config-tier-5.png), [purchased configuration after reload](../artifacts/ship-configuration-library/runtime/shipyard-purchased-reloaded.png), [phone shipyard](../artifacts/ship-configuration-library/runtime/phone-shipyard.png), [actual laser frame](../artifacts/ship-configuration-library/runtime/combat-emitter-alignment.png).

## Practical limits

The 1.55GB library increases local/distribution storage; on-demand caching avoids bulk browser preload. Host desktop and phone-sized tests do not certify physical mobile hardware or GPU memory pressure. CPU fallback has simpler shading and a 24fps letterboxed bay film. The top-down hull is the exact original illustration; an exact volumetric equivalence of the existing approved perspective bay base hull is not claimed. This pass does not establish every original-game feature or campaign route. Musical style and final sound mix require human listening; the agent's technical playback checks are not auditory review. HTMLAudio keeps the source fade; the tailored loop uses Web Audio. Earlier full-pass details and all eleven findings remain in [the player-experience report](PLAYER_EXPERIENCE_REPORT.md).

Local build: http://127.0.0.1:4174/starflight-junior-crew/
