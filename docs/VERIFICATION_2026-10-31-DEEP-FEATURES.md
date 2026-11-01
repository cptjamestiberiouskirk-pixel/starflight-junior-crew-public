# Deep campaign and feature verification - October 31, 2026

The local testing goal completed a fresh mission through earned campaign victory,
found two rendering defects, and repeated the affected and broader checks on the
fixed build. Final covered runs found no further reproducible product issues.
This is finite automated coverage, not proof of every random or continuous state.

## Build and save isolation

Final production entry: `assets/index-Di4gUgjU.js`.
SHA-256: `dad2053e6ff95748423455c1177c5e72d28ca6f4e61de4bd52dc42bd11d357da`.

Playwright used separate, nonpersistent browser contexts, fictional fixtures for
rare states, and test-only localhost ports. Browsers were physically muted with
`--mute-audio`; disposable settings also muted sound. Production defaults and
owner browser profiles/saves were never accessed or modified during testing.
The fixes preserve progression, damage/equipment rules, original art and voices,
and the save schema. Valid historical zoom values outside current UI presets
remain accepted. Invalid numeric imports are rejected before slot replacement;
invalid stored slots remain unchanged and report their validation error.

These changes remain local and uncommitted. The previously accepted Windows ZIP,
its accepted-build manifest, and both GitHub repositories were not updated by
this testing task. The local preview can serve the tested source independently.

## Confirmed defects and fixes

1. A legacy encounter projectile could omit its optional color, or supply an
   invalid CSS color. Canvas threw in `addColorStop`, stopping the frame loop and
   even preventing defeat from completing. The renderer now validates using
   Canvas's parser and uses a friendly/hostile fallback, with a bounded cache.
   Valid colors and saved projectile data remain unchanged.
2. Projectile coordinates and camera scales were missing from the existing
   numerical render guard. Extreme coordinates, zero/negative/subnormal zooms,
   and overflowing zooms could import successfully and produce nonfinite Canvas
   arguments. The shared import/legacy-restoration guard now checks those fields
   with projection headroom, without clamping or inventing mission progress.

Native failing evidence was retained, followed by passing fixed-build tests.
Locator mistakes, incoherent fixtures, a missing harness CLI argument, and an
initial video-review server content-type mistake were corrected separately;
they are not counted as product defects.

## Campaign provenance

The first run began with empty storage and **Start New Mission**, recruited and
trained six crew, assigned posts, named Pathfinder, and completed 17 ordinary
mining/return/sale voyages to afford equipment and expedition fuel. Normal keys
and UI actions earned the Black Egg and Crystal Orb, answered six drone questions,
found the Control Nexus, armed the Egg, escaped, and reached victory with all six
crew alive. Victory, the destroyed planet, credits and progression survived reload.
Known chart guidance was used. No developer tools, progress injection, fabricated
starting save, or seeded randomness was used in that fresh run.

The complete fresh run used the previously accepted build (`664787...`). Its
immutable earned equipment checkpoint was imported unchanged through the normal
UI and replayed through the story on the first projectile fix (`6b090e...`).
Its actual earned pre-arm Nexus checkpoint was then imported unchanged through
the normal UI on the final build above. The final build completed victory,
returned to title, continued, saved and reloaded with zero casualties and
`isDev: false`. This is an earned continuation on the final build, not a claim
that the entire fresh economic grind was repeated on each compiled revision.

## Final coverage

| Area | Observed passing coverage |
| --- | --- |
| Source checks | 14,145 assertions; typecheck; production build; resource hashes; dependency mitigation/source-size/server-limit checks |
| Save rendering | 32 browser cases: rejected imports, invalid stored-slot preservation, valid historical camera controls |
| Defeat/story boundaries and colors | 10 cases: exposure, Orb protection, fatal hit/recovery, missing/invalid/valid beam colors |
| Economy, crew, equipment and colonies | 13 cases: rapid training/purchases, dismissal/assignment, Android restriction, trade capacity, appraisal/specimen settlement, interest, treatment, colony rewards/fines/duplicate prevention and read acknowledgment across reload |
| Existing production gameplay | 66 cases: 15 orbit, 14 navigation, 13 actions, 9 communications, 15 player/Science/clock |
| Historical/adversarial saves | 87 cases plus 3 exact/oversized save-code boundaries |
| Broader encounter and map flows | 15 encounter, 3 cross-system, 9 map/navigation cases |
| Surface | 20 wildlife/rover and 11 weather cases |
| Audio behavior | 5 recorded playback/pause cases and 18 native decoding/waveform samples, physically muted |
| All existing referenced voices | 1,524 files checked against pinned repository Git blobs and natively decoded to finite, nonzero PCM; no human listening |
| Buttons | 327 definitions inventoried, 323 reachable observed across 286 snapshots; all 104 reachable conditional controls observed both enabled and disabled; 141 boundary/condition cases plus 13 prior-defect checks; no disabled-button blinking or page errors |

The four unrendered button definitions were reviewed against source: two legacy
Command buttons sit inside a contradictory `On Planet` ancestor exclusion, an
optional SurveyPanel landing callback has no production caller, and the legacy
Overlay helper has no production caller. The actual ascent, disembark and landing
controls are reachable and tested elsewhere. Instrumented state coverage is
separate from the ordinary-player campaign and never ships in production.

Visual review included the earned campaign screenshots, final victory, and
selected decoded frames from recorded launch, landing, rover/mining and return
sequences. Existing ship/media files remained byte-identical under resource
checks; no paid generation or new artwork was performed. Automated geometry,
responsive Science/clock and waveform checks do not certify artistic quality,
all animation frames, every physical device, or audible voice/music quality.
Four referenced alien files are text-only binary/termination markers; all
existing spoken references were checked, with no missing crew files.

## Repeating the new checks

Serve a current production build on an isolated localhost port, such as 5207.
Use the installed Playwright module (or set `PLAYWRIGHT_MODULE_PATH` to its module
path), then set each suite's URL and evidence directory before running:

```powershell
$env:JUNIOR_DEEP_URL='http://127.0.0.1:5207/starflight-junior-crew/'
$env:JUNIOR_FAILURE_URL=$env:JUNIOR_DEEP_URL
$env:JUNIOR_RENDER_URL=$env:JUNIOR_DEEP_URL
node tools/windows-tester/deep-features.test.mjs
node tools/windows-tester/campaign-failures.test.mjs
node tools/windows-tester/save-render-inputs.test.mjs
```

Use fresh evidence directories through `JUNIOR_DEEP_EVIDENCE`,
`JUNIOR_FAILURE_EVIDENCE`, and `JUNIOR_RENDER_EVIDENCE` to retain prior reports.
The local evidence root is `artifacts/deep-feature-20261031/`, including original
failures, campaign videos/checkpoint provenance, final reports and verification
manifest. It is ignored and has not been uploaded. Independent Windows-machine,
physical-device, accessibility and human listening acceptance remain separate.
