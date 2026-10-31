# Communications and navigation verification — October 30, 2026

Local development changes preserve the save format, recorded voices, original artwork, equipment rules and diplomacy thresholds.

- The painted Elowan communications portrait retains breathing motion without synthetic mouth/eyelid marks over its face.
- Hail refusals distinguish a hostile fleet from aliens who have broken off communications; they no longer claim hostile fire without evidence.
- Replies remain valid during the final reminder's existing countdown. Expiration lengths, reminder counts, mood penalties and question answers are unchanged.
- Entering or leaving a star system selects Maneuver with zero velocity and direction. Previous held keys and auto-repeat cannot restart movement; a fresh keypress or steering input is required.
- Navigation and tactical controls reflect encounter context, fitted/working equipment, fuel, weapon cooldowns and missile capacity. Peaceful system Combat controls are disabled; arming weapons alone does not pulse a combat warning.
- The star chart marks Starport Arth and provides a course-home selection with docking instructions and existing distance/fuel estimates. It does not engage autopilot. A destroyed starport is identified as unavailable.
- Header hover text expands ISS, M.U., LOC, POS, H, S, A, F and m³. The ISS expansion follows Part 3 of the [original manual](https://www.starflt.com/SF2Manual.pdf).

Validation: typecheck, production build, resource-integrity checks, 10,844 assertions across 36 suites, 68 dependency-guard checks, 165 source-size checks and 14 server-limit checks passed. Disposable muted Edge checks passed for communications/portrait/tactical readiness and navigation/header/home routing at desktop and 390-pixel widths. No owner browser profile or save was accessed.

The standalone browser checks require optional Playwright tooling and a loopback tester server serving the current build:

```powershell
$env:PLAYWRIGHT_MODULE_PATH = '<absolute path to playwright/index.mjs>'
$env:JUNIOR_COMMS_TEST_URL = 'http://127.0.0.1:4174/starflight-junior-crew/'
$env:JUNIOR_NAV_URL = $env:JUNIOR_COMMS_TEST_URL
node tools/windows-tester/elowan-comms.test.mjs
node tools/windows-tester/navigation-controls.test.mjs
```

These scripts create fresh browser contexts and fictional Slot E missions. They do not attach to an existing browser. Results are local artifacts; they are not independent Windows or full-campaign certification. No GitHub publication or Windows tester ZIP rebuild is included in this change.
