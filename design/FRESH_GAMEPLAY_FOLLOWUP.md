# Fresh gameplay verification

Completed locally on 23 October 2026. **Two independently commissioned missions completed actual recruiting, outfitting, natural launch, flight, scan/analysis, landing, mining, return, sale and save/reload.** They used ordinary game controls in empty isolated browser profiles, without a synthetic starting save, developer mode or game-state edits. Routes were guided using the existing universe chart; all state inspection used public Export Save. User profiles/saves were untouched.

| Actual result | Desktop mission A | Phone viewport mission B |
| --- | --- | --- |
| Viewport | 1440 x 1000 | 390 x 844 |
| Commission / equipment | Six new crew; engine class 2, one cargo pod | Six separate new crew; engine class 2, armor class 1 |
| Destination | Inner planet in [125,100] | Hyperspace to planet 1 in [123,101] |
| Science | Officer skill 50; uncertain fields remained uncertain | Officer skill 50; uncertain fields remained uncertain |
| Scanned landing coordinates | 56.4 S, 68.4 W | 38.4 S, 64.8 W |
| Mining and reload | 1.9 m3 Chromium; cargo and depleted site persisted | 1.7 m3 Plutonium; cargo and depleted site persisted |
| Return and sale | Arth; +475 M.U. | Arth; +2720 M.U. |
| Colony | Not submitted | Haven Crew B suitable; +35000 M.U. |
| Final reload | 3975 M.U., Starport, hull 250 | 40220 M.U., Starport, hull 250 |
| Crew | Six living, vitality 100; six distinct portraits | Six living, vitality 100; six distinct portraits |

Both voyages used the direct Leave Orbit action. A exercised local topo findings and click-to-drive ship return. B exercised a selected scanned landing region, interstellar return and the Operations evaluation queue. Depletion survived each surface reload; ordinary deposits then refilled on breaking orbit, as required by the retained C-07/DPART-OV rule (Chromium 2.0 to 3.9; Plutonium 5.6 to 7.3 m3). The existing colony rule credited its bonus at orbital submission; Operations subsequently displayed CREDITED. No economy or progression rules were changed.

The playthrough exposed an additional phone usability fault: the six rover actions shared a row with Board Ship and the steering pad, squeezing action buttons to about **23 px wide**. The final repair gives action/cargo/weapon grids a full row below the medium breakpoint and **44 px minimum button height**. Tests restored the actual earned B mining checkpoint through public Import Save and exercised all six actions' sizing, cargo and weapon menus, topo opening/closing and boarding availability at 320, 390 and 768 px. All three passed. A four-line JSX diff is retained; no game logic changed.

The final build `assets/index-D_l_pyQ4.js` passed **2137 unit assertions, 47 compiled browser scenarios, typecheck, production build, complete resource hashes and original image/voice corpus checks**. This includes all 44 prior adversarial/regression scenarios rerun plus the three actual-checkpoint rover cases. The two complete voyages ran on archived `assets/index-Br7uyeAG.js` before the final responsive-only change. No complete voyage on the final four-line layout revision is claimed.

Evidence: [structured report](../artifacts/crew-diversity/playthroughs/fresh-gameplay-report.json), [action log](../artifacts/crew-diversity/playthroughs/player-actions.jsonl), [28 screenshot/text captures](../artifacts/crew-diversity/playthroughs/player-session-log.jsonl), and the final exported mission saves retained alongside them. All 28 captures report zero page errors. A and B have disjoint crew IDs; the resumed B retains its original crew IDs. Both exported final saves are normal, non-winning missions.

FFmpeg 1011 works with the cached Playwright runtime (1.62.1); the user's newer Playwright 1.64.1 installation separately installed 1013. The recorder smoke test emitted a 53878-byte WebM. [The resumed B recording](../artifacts/crew-diversity/playthroughs/crew-map-mission-b-video-gameplay.webm) is **342.4 seconds / 14076548 bytes / 390 x 844**. Actual Chrome decoded frames and sought to its final second without a media error. Only resumed B has video; A and B's earlier steps have screenshots and logs. Playwright video contains no captured sound, so this adds no auditory approval claim.

Failed harness attempts are retained. They include early navigation before the natural launch finished, redundant room clicks, a menu selector missing its visible dot, a topo close selector missing its cross, and large-save import timeouts under concurrent load. The rover width/height failures were actual layout faults and are fixed. Generic FFmpeg `-f null` validation was unsupported by the bundled minimal encoder; browser media decoding verified the file instead.

No new full gallery or guided campaign victory was played. Prior eleven-finding, animation, propulsion/explosion/audio and campaign evidence remains identified by its original bundle in the main report. All changes and evidence remain local; no commit, push, publication or user save edit occurred.
