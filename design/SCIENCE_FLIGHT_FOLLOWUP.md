# Science, maps and flight follow-up

Completed locally on 23 October 2026. Actual game: `E:\Code\project-files`. No commit, push, site publication or deployment occurred.

The Science workspace, scan-gated symbol maps, orbital ship perspective and system flight fixes are integrated. **2,229 unit assertions, 69 compiled native Chrome scenarios, two fresh gameplay voyages, typecheck, build and resource/preservation checks passed.** All current native reports and both voyages identify the same production bundle:

`assets/index-CGpcHf8n.js`  
SHA-256 `11e8b9c9f98e443e4fb6f06448f83d9c97ffedb13f572826b66f2d3cc5180652`.

The eleven recorded completeness findings were already closed in the earlier pass. Their reports, original artwork, equipment library and campaign evidence are preserved and verified through the archived manifest chain. This report describes the new follow-up; it does not relabel old tests as current runs.

## Issues and implemented changes

| Issue | Result and verification |
| --- | --- |
| Science content clipped or required scrolling | A focused workspace replaces the stacked flight scene, gauges and reading panels. Survey map, Readings, Analysis and Ship status are separate keyboard-accessible tabs. Native checks verify every tab at 2560×1080, 1440×900, 1280×720, 1024×600, 390×844 and 320×568. No document/panel scrolling or clipped controls was measured in these cases. |
| Contacts visible before scanning and analysis | Current Science results stay locked until both stages finish, even when stored findings exist. Stored discoveries are retained for save compatibility; raw composition stays hidden until the scan completes. Missing/dead/unconscious officers and failed sensors are tested. |
| Confusing pin words/counts and resizing details | Map symbols use one shared legend and category filters. Pin text/count badges are removed; selected details occupy a fixed footer and the contact list has four entries per page. Selection no longer resizes the map. Approximate areas remain visibly uncertain; counts appear in the legend/list rather than on every pin. |
| Landing and topo data diverged or waypoints disappeared | Science, landing and topo consume the same recorded contact data. Pointer selection, category filters, saved rover waypoint and public reload pass. On phones, the legend alternates with the map instead of compressing both into a tall page. |
| Missing installations/artifacts categories | Existing named installations are recognized separately from ancient ruins. Unrecovered artifacts use their actual sites and existing discovery/item gates; a high Science score does not bypass hidden relic rules. Depleted minerals, captured life and recovered artifacts disappear appropriately. |
| Hologram truthfulness needed regression coverage | Healthy, uninstalled and damaged/malfunctioning cases match the configured ship image and subsystem values. Uninstalled hardware is not labeled damage. Existing repair/material rules remain. |
| Ground ship name upside down | The name is drawn upright in screen coordinates below the rotated hull bounds. Four native heading checks inspect the actual text transform and screenshots. |
| Top-down/transparent orbital ship | Orbit now renders the existing approved 3D hull and installed modules through an angled camera, with heading and slight bank following orbital phase. Independent unmerged model geometry avoids the bay-only reversed outline shells that initially obscured the hull. Both WebGL and no-WebGL CPU fallback pass. The original bay render path is retained and separately regressed. |
| System ship too fast and identical across engines | Classes 1–5 have distinct caps: 1/3, 1/2, 2/3, 5/6 and full class-5 speed. Acceleration uses `floor(class × 500 / mass)` and a frame-independent ramp; releasing input stops movement. Class 0 stops. Native timed key holds verify progression and stopping. This is the local Unity D8 remake pacing decision, not a claim that the 1986 original had class-based system caps. |
| System planet appearance/motion differed from orbit | The same painted seamless globe source is used in system and orbit for all six planet types. Planet positions advance from the shared saved clock; proximity, collisions, rendering and pause use that clock. Leaving the bay now places the ship beside the moving Arth instead of an obsolete hardcoded coordinate. |
| Zoom loses ship or ship matches planet size | Zoom remains centered on the ship. Ship length is constrained against the smallest rendered planet, and the planet minimum remains readable. Native checks cover zoom extremes in an isolated system. |
| Hyperspace arrival requires manual system entry | Arrival automatically enters the nearby star system and saves the visited/location state. A saved departure guard prevents immediately bouncing back into the departed star; clearing its neighborhood permits return. Public save/reload and return checks pass. A held-key/fourfold-CPU-throttle regression confirms that stale hyperspace substeps cannot move the saved galaxy coordinates after arrival. |
| Floating V/wedge shapes on molten and other globes | Primitive surface overlay shapes are removed across the planet types. Painted surface rotation, clouds, lighting and rims remain. Six native type captures verify the shared painted source. |

## Scan semantics and supported content

The original environmental analysis retains its independent known/Not certain fields, mass representation, relative bio/mineral densities and descending composition. Science skill affects analysis, contact detection and positional certainty. The map extension surveys twelve repeatable jittered regions plus previously known records; an unmarked area remains unexplored. Full skill confirms actual positions in surveyed regions, not every object on the entire planet. Existing nearby rover observations can improve records without revealing hidden artifacts.

The build contains minerals, lifeforms, ancient ruins, named installations and recoverable artifacts. It has no distinct planetary **Precursor ship** object. The Noah 9 colony wreck is not renamed or represented as a Precursor ship. Crystal/Control Nexus and hidden artifact gates remain. Ordinary resource refill when breaking orbit is the preserved original lifecycle, rather than a depletion bug.

## 12UI comparison and artwork

The 12UI design skill was used: four candidates were inspected, B selected, and matching Readings/Analysis states converted. The three post-implementation target comparisons completed after the user approved sharing fictional screenshots, rendered UI data and the existing target. No repository source, credentials or personal saves were sent for these comparisons. Plans and inputs are retained under `artifacts/science-console-redesign/design/`.

DOM anchor overlap was **23.4% Survey, 29.2% Readings, 20.6% Analysis**, below the service's 60% selector threshold. These are completed comparisons with material differences, not a pixel-perfect acceptance. The generated branch prototype wrapper encountered EPERM/fsync; its four converted state pages succeeded and are retained. The live game uses the existing React application and real game state.

The implementation carries the real generated starfield plate and mineral/installation/artifact cutouts. A 25% scrim keeps text and the live map readable. The existing game planet art, crew portraits, logo and Rajdhani typography remain. The target's baked example map/pins are replaced by the real geographic canvas; fabricated rank dots, confidence values and example mineral text are not substituted for game facts. The 2:1 geographic map preserves coordinates. Short screens retain reachable controls through tabs, pagination and an alternate legend. Original target rasters remain archived as references. The unsafe selector match from hull status to example ore text, and the crew portrait-to-rank match, were rejected.

Created runtime assets: `assets/ui/science/science-starfield.webp`, `mineral-key.webp`, `installation-key.webp`, `artifact-key.webp`. No original asset was deleted or retired by this follow-up. Runtime-only primitive planet overlays and bay-only outline shells in the orbit view were retired. The 3,672 approved ship configuration PNGs, tactical armor maps, Blender 5.2 kit, painted hangar textures, Mirelo recording, music and crew atlases remain. The Meshy CLI is authenticated and selected for future Meshy work; this pass reuses the approved model and required no new generation.

## Current test evidence

| Batch | Cases | Evidence |
| --- | ---: | --- |
| Science workspace and adversarial states | 12 | `artifacts/science-console-redesign/qa-workspace.json` |
| System/orbital flight, planet types, arrival and ground labels | 15 | `qa-flight.json` in the same directory |
| Crew identities, expressions, legacy migration and pool exhaustion | 15 | `crew/qa-crew-diversity.json` |
| Rapid starmap hover, three Leave Orbit contexts and corrupt imports | 6 | `navigation/qa-map-navigation.json` |
| Configured damage display regression | 3 | `engineering/qa-science-maps.json` |
| Painted docking, equipment tiers, saves, CPU fallback and audio | 18 | `bay/qa-game-runtime.json` |
| Unit/rule assertions | 2,229 | `artifacts/qa-unit-report.json`; 0 failed |

Typecheck, production build and `check:build` passed. Native bay tests exercise actual Mirelo pause/resume, mute/volume and recorded voice ducking. The soundtrack was unchanged and its historical loop tests are carried, not claimed as newly rerun. Unit audio tests include mocks and are identified as such. There was no new full 115-scene gallery or campaign victory.

Initial failed reproducers are retained. Real faults found during this pass included short-screen layout overflow, selection/footer reflow, inactive tab hover being styled as selection, stale fixed-step hyperspace motion after arrival, the orbit renderer's cached CPU canvas being cleared, bay-only ink shells obscuring the orbital model, and launch placement no longer following moving Arth. Test-driver faults (disabled Analyze trial clicks, an incorrect safe-star predicate, and a Crystal fixture missing its required Orb) were corrected and the final native batches rerun. Failed historical attempts remain distinguishable from final passing reports.

## Actual fresh gameplay

Two independent native Chrome profiles began at **Start New Mission**, recruited and assigned six crew, bought engines/pods, launched naturally, navigated to moving planets, scanned and analyzed, selected a landing, mined through ordinary controls, set a topo waypoint, returned, sold cargo and reloaded public saves. These were automated native-control playthroughs with known chart guidance, not imported synthetic starting saves or developer state manipulation. The user profile and its saves were untouched.

| Mission | Viewport / engines | Earned cargo | Sale and final state |
| --- | --- | --- | --- |
| science-voyage-a | 1440×1000 / class 1 | 1.0 m³ Chromium | +250 M.U.; 11,750 M.U.; Starport; six alive; surface and final reload passed |
| science-voyage-b | 390×844 / class 2 | 1.1 m³ Magnesium | +275 M.U.; 3,775 M.U.; Starport; six alive; surface and final reload passed |

The second mission naturally departed Arth and auto-entered another system, then returned. Both final saves are non-development, with disjoint crew IDs and no casualties. Full action/session logs, earned checkpoints and public saves are under `artifacts/science-console-redesign/playthroughs/`. Chrome decoded both WebMs and sought to midpoint/end: **78.24 s desktop** and **120.04 s phone**. Videos contain no audio; no human listening judgment is inferred.

## Preservation and remaining boundaries

Current hashes preserve 113 original images and the archived retired sun; no unexpected original image changes. Recorded corpora remain **556 alien lines and 980 crew lines**. Build verification matches all 3,672 ship PNGs, the approved GLBs/armor maps, fifty new crew atlases, five originals, painted hangars and Mirelo bytes. Optional saved orbital phase/departure guard fields are validated; legacy import, recruitment migration and waypoint roundtrips pass. The previous 37-source/131-report manifest was verified and archived before edits. The new integration manifest and acceptance auditor verify the historical chain separately from current evidence.

The historical eleven fixes, mission progression, recorded voices and equipment/save compatibility remain within the tested scope. Broader original-game parity, every possible route, GPU/device combinations beyond these cases, human artistic approval and musical listening remain unclaimed. Run the latest local build at http://127.0.0.1:4174/starflight-junior-crew/ and refresh an already open tab to load this bundle. Existing saves remain usable; rescan and analyze to test the current Science results, and recruit a new member to exercise portrait allocation.
