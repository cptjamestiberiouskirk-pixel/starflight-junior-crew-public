# Player feedback round 2 — verified local results

Local completion of twelve playtest findings plus transformed-hull armor correction, preserving original rules, progression, recorded voices and legacy saves. This is a local continuation; nothing was committed, pushed, published or deployed.

Current compiled entry: `assets/index-BEq-6_mE.js`; SHA-256 `ae685a4cf44b718d0432eb3bbee3d305b8e30ad965cffaefdb9727b14857ceab`. The local game is served at http://127.0.0.1:4174/starflight-junior-crew/ . Reload that tab to load the new bundle; existing saves remain supported.

## Issues and changes

| # | Finding | Implemented behavior |
|---|---|---|
| 1 | Atmosphere and weather | Actual density, weather, gas composition and planet type drive shared orbital/system effects; airless worlds remain airless. |
| 2 | Sensor sweep | Animated map sweep during active scan; existing analysis and Science-skill gates still control revealed contacts. |
| 3 | Detailed maps | Meshy terrain material atlas, cached high-resolution whole-world relief and true local resampling; real contacts and waypoints remain authoritative. |
| 4 | Landing timing | Ten-second minimum descent with active recorded-speech completion; paired recordings no longer interrupt the first clip; stalled audio requests cannot freeze landing. |
| 5 | Mining beam and audio | Original Mirelo industrial loop, pulsing core/halo, traveling energy rings and impact sparks; volume, mute, pause/stop and late-load cancellation tested. |
| 6 | Rover layering | Visual ship parked above the boarding apron so the rover clears the hull; logical boarding location/range unchanged. |
| 7 | Ground zoom | 40–140% transient zoom with matching pointer/world projection and ground tiling. |
| 8 | Action availability | Unusable buttons disabled using actual fuel, health, recording, range, selected deposit and hold-capacity rules. |
| 9 | Return to ship | Explicit button uses existing auto-drive to the boarding apron, with fuel/health/nearby guards. |
| 10 | Smooth flight | Cached GPU sphere projection and seeded clouds replace costly repeated per-pixel work; CPU fallback retained. Corrected translucent texture compositing. |
| 11 | Starmap zoom/legend | Bounded 1–8x zoom, selected-star/ship centering, pan/reset and stable hover; legend explains spectral/territory colors, nebulae, fluxes, ship and route. |
| 12 | Docking arrival | Eight-second controlled stern-first approach in the approved painted bay; fixed unobstructed camera, current equipment, doors/clamps and dedicated Mirelo arrival effects. |
| 13 | Armor visibility | Applied each source mesh world transform before armor projection. Forward bridge/collar overlays now follow the installed hull rather than collapsing at the origin; classes retain exact tactical 20/40/60/80/100% masks. |

The armor library had already been produced and integrated after approval. The visible regression was a model-coordinate error in the live orbit overlay. The original hull, all 3,672 configuration PNGs and approved fittings remain byte-identical. This correction adds no armor strength, price, mass or coverage rule changes.

## Actual validation

- Typecheck, production build and 2,527 unit assertions passed, including 289 new adversarial checks and nine armor-transform checks.
- **100 current-bundle compiled native Chrome scenarios** passed: 18 feedback, 12 Science workspace, 15 flight, six navigation, 15 crew, three engineering, 18 bay, six installed armor tiers, one mining capture, two earned-save continuations, two frame-pacing measurements and two blocked-audio-request regressions. Reports name each case and bind it to the bundle hash.
- Two additional source/native harness cases passed: actual generated PCM loop/volume/cancellation, and translucent globe pixel compositing. Enlarged armor and four arrival stages were separately reviewed as visual evidence, not extra compiled cases.
- 3,672 source and 3,672 shipped configuration images match the approved hashes; all 16 approved asset entries remain unchanged. All eight new runtime media assets are present byte-identically in the build. Exact cumulative armor masks verify 20/40/60/80/100% of 174,560 eligible painted pixels.
- Original world entity generation and surface-rule source are unchanged. A frozen oracle taken from the archived original source covers 810 terrain classifications. All 113 original images, 556 alien dialogue entries and 980 crew lines are preserved.

Two actual fresh commissions used ordinary native controls from Start New Mission: desktop with engine class 1 and phone-sized with class 2. They recruited/assigned crew, naturally launched, maneuvered to moving planets, orbited, scanned and analyzed, landed, mined earned cargo, saved/reloaded, used maps/waypoints, boarded, ascended, left orbit, returned to the painted port and sold cargo. The second also used normal hyperspace auto-arrival. Both ended at Starport with six living crew, distinct crew IDs and developer mode off. These full voyages used the archived pre-final-visual build `assets/index-ClRn7lhE.js`. Both authentic mined checkpoints were then continued through ground controls, boarding/ascent, final Science maps, Leave Orbit and public export on the current build without changing checkpoint state. Native Chrome decoded and sought both complete recordings to midpoint and end. This is two full fresh voyages plus two continuations, not four fresh missions.

Current motion measurements (five-second native samples):

Star System: p99 145.6 → 24.3 ms, frames over 40 ms 16 → 2; In Orbit: p99 30.6 → 6.4 ms, frames over 40 ms 2 → 1. These short host-specific samples include startup stalls and are not a universal frame-rate guarantee.

```json
[
  {
    "name": "native-frame-pacing-Star System",
    "fps": 99.5980080398392,
    "p95": 12.400000000000091,
    "p99": 24.299999999999272,
    "over40ms": 2,
    "max": 48.5
  },
  {
    "name": "native-frame-pacing-In Orbit",
    "fps": 157.8,
    "p95": 6.399999999999636,
    "p99": 6.400000000000546,
    "over40ms": 1,
    "max": 175.5999999999999
  }
]
```

## Defects found during verification

The translated bridge-mesh armor regression had a failing synthetic transform test before its fix. Native pixel testing also exposed premultiplied-alpha blending that made a 25%-opacity globe texture opaque; the fixed output matches the expected RGB values. Actual recording instrumentation caught the fixed 450ms paired-response timer interrupting a 6.32-second first recording. Replies now wait for playback completion. Adversarial held-first/held-second audio requests reproduced indefinite descent waits before the pending-state guard was fixed; both now complete landing. A selected out-of-range deposit also now keeps the weapon action disabled even when an unrelated deposit is nearby.

Arrival camera review found gantry occlusion in an earlier candidate. The final centered camera was reviewed at four timeline points and is unobstructed. Earlier heavy terrain-grain treatment was reduced after image review. Failed reproducers, earlier bundles and superseded successful reports remain under the baseline/pre-voice-fix/pre-final-visuals archives. Harness failures caused by concurrent Vite caches, too-short UI timeouts, depleted test deposits and full-page cinematic timing were repaired and rerun; they are not counted as passing cases or as game defects.

## Assets and functionality

Created: one Meshy atlas (task `01a16b35-9ec0-7425-91a2-72a05e247fe8`, six credits) and six optimized terrain WebPs; original Mirelo mining loop (80 credits, 8.011 seconds) and arrival effect (80 credits, eight seconds); rendering/map/weather/control helpers, regression tests and evidence. Sanitized generation metadata and local hashes accompany the assets. No copied commercial game audio was used. Signed download URLs and account identifiers are excluded from curated provenance.

Retired from active presentation: old 3-second flat docking-arrival path, primitive mining beam and previous mining timbre, repeated expensive globe/cloud projection and misplaced armor overlays. CPU globe fallback remains. No original asset was newly deleted. The pre-existing historical retired sun archive remains untouched. Music and recorded voices are preserved; the landing speech sequencing changed, not its words or recording IDs.

The latest user instruction prohibits Blender. Project guidance now records Meshy, Mirelo, Sonilo, ElevenLabs or custom AI work as the permitted paths. Existing approved artwork/models are retained; no new Blender render was used in this continuation.

## Design comparison and limits

12UI compared the authorized fictional rendered Science screen and DOM with the existing approved target. The safe comparison omitted repository upload. DOM anchor overlap was **23.7%**, below its 60% threshold. No new candidate was purchased. Existing approved background/cutouts remain; actual globe, crew, terrain and scan contacts replace static target imagery. Fictional rank dots were not added, and the established game typography was retained. See `artifacts/player-feedback-round2/12ui-dispositions.json`.

- The original eleven-finding completion, full 115-scene gallery and single guided victory remain historical; no new campaign victory or complete feature-parity claim.
- Two complete fresh voyages ran on archived index-ClRn7lhE.js before final camera, terrain-grain, translucent-globe and offline-speech refinements. Both earned checkpoints and all 100 scoped compiled cases were checked on the current bundle.
- Native automated browser controls and known chart guidance were used. Personal Edge saves were untouched. Test output was muted; generated audio artistic character and final musical mix require human listening. Videos contain no audio.
- Armor percentages are exact cumulative masks over the approved 174560-pixel eligible painted hull skin; no independent volumetric surface-area certification is claimed.
- 12UI comparison completed at 23.7 percent DOM anchor overlap, below its 60 percent threshold. No pixel-perfect design acceptance is claimed. New candidate generation was unavailable without further service allowance; existing approved design assets were retained.
- The terrain remains the original generated world. Orbital survey localization is the existing skill-dependent sampled remake extension, not an omniscient planet census. No separate planetary Precursor ship entity was invented.
- Frame pacing is measured on this Windows host; startup/resource stalls remain possible. CPU no-WebGL bay mode has simpler shading and a 24fps letterboxed painted background.
- Existing approved models remain in use. No further Blender work is permitted; new asset work is restricted to Meshy, Mirelo, Sonilo, ElevenLabs or custom AI work.

Evidence index: [integration manifest](../artifacts/player-feedback-round2/integration.json), [resource preservation](../artifacts/player-feedback-round2/resource-verification.json), [fresh gameplay](../artifacts/player-feedback-round2/playthroughs/fresh-voyages-report.json), [video decoding](../artifacts/player-feedback-round2/playthroughs/video-verification.json).
