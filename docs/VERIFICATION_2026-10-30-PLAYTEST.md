# Player and adversarial regression testing — October 30, 2026

The current compiled game passed 70 Playwright browser cases and 18 native audio decoding checks. No new game defect was confirmed in the tested flows. This pass added `tools/windows-tester/player-regression.test.mjs`; it did not change production gameplay, artwork, voices, save formats, or the running private server.

## Fresh player journey

A new disposable mission was commissioned entirely through ordinary UI controls: recruited six officers, trained and assigned them, named the vessel Pathfinder, bought a Class 2 engine, visited the trade depot, launched, flew to a planet, entered orbit, scanned/analyzed it, inspected every Science tab, selected a landing site, landed, deployed/drove/scanned with the rover, mined Zinc, returned aboard, ascended, flew home and docked. One cubic meter of earned Zinc was sold for 140 M.U. The mission was saved, reloaded and continued at Starport with 3,240 M.U., 1.1 m³ Zinc, the upgraded engine and 19.2 m³ fuel. The development flag remained false. Known chart data guided flight, and state was inspected through the public save-export interface; no state injection was used in this journey.

## Browser cases

| Group | Passed | Coverage |
| --- | ---: | --- |
| Player regressions | 15 | Clock/pause, settings during scan, rapid scan/analysis, unavailable sensors/officer, keyboard ownership, search text, destroyed home port, muted save/reload, Science layouts |
| Navigation controls | 14 | System transitions, held input and key repeat, fresh movement, contextual buttons, header tooltips, home course |
| Communications | 9 | Elowan talking/idle portrait, truthful refusal, final reminder answers, tactical weapon readiness |
| Maps and imports | 9 | Landing fit/pointer/reachable controls, rapid starmap hovering, leaving orbit, corrupt import preserves existing destination |
| Cross-system regressions | 3 | Mining audio stop, delayed recording cancellation, cargo transfer/reload, prepaid repair/drydock completion |
| Encounters | 15 | Natural contacts, race-specific homeworld behavior, surrender, reinforcements, distress pause/reload, cross-slot fleet/cinematic reset, large encounter rendering |
| Native music playback | 5 | Recorded buffer source starts, audio clock advances, pause/starmap suspend it, resume restores it |

Responsive checks included 360×640, 375-pixel encounter rendering, 390×844, 768×600, 1280×720 and 2560×1080. Screenshots of the fresh journey, compact Science, landing maps, and test failures were retained locally and reviewed selectively. The clock remained visible in the tested compact Science states. No page errors or HTTP failures were reported by the new player suite.

## Audio and supporting checks

Four bundled music/effect recordings, eleven alien voice samples and three crew voice samples loaded and decoded in native Edge. Each produced finite, nonzero PCM. Mining lifecycle tests checked cancellation and boarding; music tests observed the production Web Audio source and context. Browser output remained physically muted throughout. These checks cannot establish subjective mix quality, intelligibility, perceived clicks, or whether the user likes the sound.

Typecheck, production resource checks, 10,844 assertions across 36 suites, 68 dependency-guard checks, 166 source-size checks and 14 server-limit checks passed. Large-encounter frame measurements are local headless results, not performance certification for other PCs.

## Test corrections and limits

Initial harness failures were investigated and preserved. Historical tests expected an older landing control, a particular Canvas ship-render hook and mandatory panel scrolling. The current interface uses a different action/render path and can fit without scrolling. New tests initially used the wrong ARIA role for a search field, expected an isolated text node to match an entire paragraph, and let an unconscious fixture officer heal before checking availability. Those assumptions were corrected; they were not counted as game defects. The music test was also changed from HTML media inspection to the game's actual Web Audio implementation.

The fresh mission covered one exploration round trip and five expedition hours, not the entire campaign. Fixture-based edge cases are listed separately from fresh play. The run did not certify every planet, dialogue, recording, browser, controller, Windows setting or clean Windows installation. Listening and longer campaign/soak testing remain useful acceptance work.

Owner browser profiles and saves were not accessed. No GitHub publication, paid generation, ZIP rebuild, or change to the owner's running session occurred. Detailed local receipts and screenshots are in `artifacts/player-adversarial-20261030/`.

To repeat the new suite against a loopback tester server:

```powershell
$env:PLAYWRIGHT_MODULE_PATH = '<absolute path to playwright/index.mjs>'
$env:JUNIOR_PLAYER_URL = 'http://127.0.0.1:4174/starflight-junior-crew/'
node tools/windows-tester/player-regression.test.mjs
```
