# Science, diagnostics and planetary maps — 23 October 2026

The requested screen fixes are implemented and verified locally. Current build: `assets/index-DAnSybmv.js`, SHA-256 `3941d6482b396f5a7f106afe33030d31e57b3da4adc84cc7956f1f42e1f8026c`. **1,885 unit checks, 22 compiled browser scenarios and one source-renderer harness passed**, plus TypeScript, production build and full resource hashes. Nothing was committed, pushed or published.

## Findings and fixes

| Finding | Result |
| --- | --- |
| Generic engineering silhouette did not resemble the configured ship | The diagnostic image now uses the actual 1087×602 configured ship artwork. Hull outline and functional zones follow its real silhouette, wings, nose, engines and fittings. Numbered service zones connect to selectable, textual system states. |
| Healthy weapon areas were always red; some malfunction flags were ignored | Diagram and telemetry list now share health/status classification: nominal at 100%, degraded below 100%, inoperative at zero or with an active malfunction flag. Uninstalled weapons/shields are gray and explicitly Not fitted. Shield charge/raised state remains separate from unit damage. |
| Science footer text crossed a decorative graphical line | Removed the image-backed decorative line from active CSS. Analysis and footnote have solid backgrounds, normal flow and measured spacing. Original five conclusions, raw readings, composition, sweep and controls remain. |
| Survey, landing and topo views had no shared location record | Added optional saved observations to each existing planet surface. Contacts refer to actual persistent object IDs and planetary coordinates. All three views use that record, including after descent and public save/reload. |
| Maps lacked usable contact semantics and terrain information | Shared mineral diamond, lifeform dot, ruin triangle, uncertainty halo and four elevation colors. Crowded contacts group with explicit counts; region view and category filters separate them. Landing and topo maps use the same terrain sampler as ground travel. |
| Detailed locations must depend on Science skill | New orbital localization rolls independently against the original 0..199 science range. Failed detections stay unknown. Lower skill stores rounded search areas; higher skill narrows them. The existing five environmental analysis rolls are unchanged. |
| Site selection was disconnected from findings | Contact-list actions select the recorded landing target. Normal descent checks still apply. Nearby rover observations confirm exact positions; captured/dead wildlife and depleted deposits leave active results. |

The diagram identifies **functional service zones**, not simulated hit-by-hit impact coordinates. The underlying game stores aggregate subsystem health and malfunction flags; this change does not invent location-specific damage or change repair/damage calculations.

## Original rules and the requested extension

The [original manual](https://mocagh.org/ea/advpak-starflight-manual.pdf), sections 1.3, 3.2.2, 3.2.4 and 5.1–5.2, distinguishes skill-dependent interpretation, orbital environmental readings, landing topography and surface exploration/icons. It does **not** establish an orbital census of every resource or site. No GOG play session is claimed.

The requested **orbital contact overlay is therefore a remake extension**. It samples twelve separated global regions plus the selected landing region, retaining existing explored surfaces. These are actual procedural objects, not decorative invented pins. Sampling materializes the same persistent region data used by descent; it does not relocate retained legacy objects. The map explicitly says coverage is sparse and unmarked areas remain unexplored. It is not a complete planet survey.

New location detection uses `science > random integer 0..199`. The search radius is `max(0, (200 - science) / 25)` km; ordinary structural anomalies retain at least a 1km search radius. This radius formula is a documented presentation/assistance choice, **not a recovered original-game formula**. Confirmed mineral/lifeform localization is available at skill 200; lifeform positions remain last observations rather than permanent live tracking. A failed later rescan cannot erase a stronger previous result.

Red Cylinder-assisted ruins and Crystal Cone-assisted Nexus coordinates remain precise. Science skill alone does not disclose the hidden Nexus. Artifact identities/messages are not exposed by generic structural-anomaly labels. A living, conscious assigned Science Officer and completed reading are still required for analysis. Broken sensors block a new sweep; an already stored completed reading can still be analyzed. Near-field rover discovery confirms objects within 2km; that assistance radius is also a remake choice. Breaking orbit retains the established resource-refill lifecycle and invalidates regenerated mineral/wildlife locations, while fixed-site findings remain. Destroyed-planet handling and mission progression are unchanged.

## Created and retired assets/functionality

- Created: shared survey/diagnostics/topography utilities; configured-hull diagnostic component; survey map/list/filter/pagination component; shared legend; 41 focused regressions; isolated design preview and native test drivers.
- Added three extracted local 12UI action icons (scan reticle, landing beacon and landing map). Original planet/ship artwork remains the source for the game. Actual terrain colors and markers are drawn from game data.
- Retired from active UI: generic arrowhead wireframe, permanently red healthy weapon tint, decorative science background line, unlabeled cyan square-only map markers, and the topo map's indiscriminate distant-resource reveal.
- Preserved: all 3,672 approved ship images, original 120-image resources/113 retained original images, recorded voices, music, Mirelo docking audio, equipment statistics, mining/repair rules, mission progression and five save slots. No original art/audio file was deleted. Legacy saves do not require a survey field; malformed new survey coordinates/duplicates/radii are rejected by the actual save codec.

## Actual validation on this exact build

| Batch | Result |
| --- | --- |
| Unit assertions | **1,885 passed, zero failed**, including 41 new survey/diagnostic/coordinate/cluster/legacy-origin checks, the original 27 scan assertions and existing gameplay/save/communication/voice/rendering suites. |
| Science/maps compiled UI | **11 passed**: healthy configured hull; unfitted hardware; damage/malfunction agreement; zero skill; scan → landing → descent → topo → public reload; lower-skill uncertainty and clean footnote; 390px filters/region view; sensor/officer gates; real living-world contacts; precise Red Cylinder sites at skill zero; 390px topo overview/reload. |
| Original scanner compiled UI | **7 passed**: consumed readings, pause/midscan reload, expert phone layout, raw orbit slots/departure invalidation, hardware/officer gates, artifact overlay and Status isolation. |
| Graphics/mining/audio | **4 compiled plus 1 source harness passed**: three readable flight views, landed hardware, five quiet mining cycles with audible cutting and pause/resume, master volume/mute/visibility, continuous globe texel motion. |
| Build and assets | Typecheck/build/resource checks passed. All 3,672 ship PNG source/dist hashes, approved GLB/armor maps, painted bay, Mirelo WAV, original image resources and local fonts match. Vite retains its large-chunk advisory. |

The final driver records exact commands, exit codes and the unchanged production hash in [final-verification.json](../artifacts/science-map-followup/final-verification.json). Native tests use isolated Chrome contexts, synthetic fixtures and normal UI/public exports; they did not touch the user's live Edge storage. They are not fresh commissions. The initial source-only diagnostics driver omitted the Damage submenu click; its failure is preserved, the driver was corrected, and all three diagnostic cases subsequently passed. Parallel source harnesses emitted a non-fatal Vite WebSocket-port warning; every command exited zero and no native page error was reported.

Current reports: [science/maps](../artifacts/science-map-followup/qa-science-maps.json), [original scanner compatibility](../artifacts/science-map-followup/qa-planet-scans-report.json), [graphics/mining](../artifacts/science-map-followup/feedback/qa-feedback-regression.json), [unit ledger](../artifacts/qa-unit-report.json), [integration manifest](../artifacts/science-map-followup/integration.json).

Screenshots: [healthy configured diagnostics](../artifacts/science-map-followup/engineering-healthy.png), [actual damage/malfunction](../artifacts/science-map-followup/engineering-damaged.png), [science/search areas](../artifacts/science-map-followup/science-search-areas.png), [landing results](../artifacts/science-map-followup/landing-shared-contacts.png), [topographic results](../artifacts/science-map-followup/topo-shared-contacts.png), [phone topo](../artifacts/science-map-followup/topo-phone.png).

## Design review and limits

12UI candidate A was selected after inspecting both real candidates. Its responsive HTML, LayerDoc and full asset kit are retained locally. The implementation uses its dark cyan/amber hierarchy, separate map/legend and contact-list areas, and exported action icons. The original planet art and actual topography replace its baked example map/markers, invented scientist list, speculative scale ticks and duplicated legend examples. Those generated assets remain in the design kit as references; shipping them would falsely depict observations or replace the user's artwork.

The target comparison completed against an isolated fictional UI preview, with **31.8% DOM anchor overlap versus 60%**. Broad suggested selector changes were not applied because they would replace required real facts with the design's examples. Desktop and phone results were inspected locally. No pixel-perfect or physical-device certification is claimed. No private repository was supplied to 12UI: automatic review rejected that argument, and the comparison succeeded without it. The user explicitly approved screenshot sharing to 12UI; no source code or saves were uploaded by these operations.

Design purchase ledger (ceilings, not confirmed charges):

| Purchase | Stage | Ceiling |
| --- | --- | --- |
| crt-eead43e2c672244f2ae59f8466f1767b5248bb7b | Draft | $0.06 |
| d49372a7-ad7b-454c-a5c3-e58436bc1f2d | Convert | Shared $0.55 stage ceiling |
| bc78687c-0cd0-4f63-85cb-2fb310e94774 | Responsive export | Same shared $0.55 stage ceiling |

Distinct stage ceilings total **$0.61**, not $1.16. Exact charges are not present in the kit and are not claimed. A fixed-HTML derivation (86e1ed87-1495-474a-8bf9-8b7b272ae391) and final LayerDoc comparison were free. See [the local design record](../artifacts/science-map-followup/design/decision.json).

No new full campaign, fresh commission or 115-scene gallery run occurred in this follow-up. Earlier evidence remains nine isolated commissions, one guided victory and the historical 77-scenario full pass; the separate ship-art pass had 50 compiled cases. Those are not added to this build's 22-case count. Musical style/listening and physical mobile/GPU memory limits remain prior boundaries.

## Try it locally

Reload http://127.0.0.1:4174/starflight-junior-crew/ and run **Science → Sensors → Analyze reading**. Existing saves load normally; rescan/reanalyze to generate new location findings. Choose a contact's **Set landing site**, then **Open landing map**. The rover's topo map contains the same known findings, and its expandable planetwide overview retains the larger survey.
