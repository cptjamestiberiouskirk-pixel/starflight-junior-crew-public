# Starflight: Junior Crew — player-experience report

Updated 2026-10-23T00:21:32.838Z. Private GitHub backup authorized; no site or public deployment.

## User feedback repairs — October 22, 2026

Current replacement: **Neon Starfield Voyage**, a newly generated retro electronic exploration cue. Lower Deck Voyage is retired from runtime selection after the user's lounge-music feedback; its original bytes and comparison remain preserved. The user selected the new direction; auditory acceptance of this particular track is pending.

| Issue found | Change and actual verification |
| --- | --- |
| Tiny ships | Removed system cap of 18 px and orbit size of 8 px. System now 34–76 px, orbit 44–72 px, hyperspace 32–72 px. Native compiled captures measured 76 / 72 / 37.95 px respectively in the tested desktop scenes; phone orbit measured 47 px. World positions, collision distances and fuel rules are unchanged. |
| Choppy planet motion | Interpolate orbit phase and entry zoom between simulation steps. Blend adjacent cached globe projections each render frame. The old visible texture advanced only about 3.7 texels/sec. All 119 adjacent pairs changed in a 120-frame native canvas sample. Compiled desktop and phone runs each measured 180 intervals, p95 6.4 ms on this host; this is not a guarantee for other hardware. |
| Cyan landing placeholders | Replaced four outlined boxes/collars and trapezoid ramp with shaded metal footpads, pistons and a treaded ramp. Removed duplicated gear and hull draw. Existing hull and terrain images remain byte-identical. Captured feedback-landing.png inspected against the user's screenshot. |
| Speech on every mining action | Removed mining_pickup banter from starting extraction; routine comedy and delayed paired quips are suppressed while cutting. Critical mission notices and all original recorded lines remain available. Five compiled start/stop cycles requested zero crew recordings. |
| Mining laser missing after initial chirp | There was no attached mining recording: only a 0.2-second synthesized laser at startup. Added sustained saw/FM cutting tone plus filtered grit through the existing SFX bus. Native minimum measured RMS 0.03760. One cutting voice at a time; stop, pause, movement, hide/show and zero/full SFX volume all passed. No new network audio dependency. |
| Lounge-like theme | Generated one creator-account batch with the requested retro electronic style, 360 seconds, blank lyrics, explicit no-jazz/no-lounge instrumentation. One generation used 1,800 existing credits and returned two variations. Integrated the actual Neon download locally, SHA-256 f8977022f0ded705385a382238271c80271dc342c8781e607dd56bb9eda6a560. Cosmic Circuit Odyssey remains an unintegrated alternate; its download hit an Edge client block. No second generation or purchase. |

New music measurements: source 360.025 s; source region 12.5–345 s with 2.5 s crossfade, 330 s repeated period. Seam sample jump 0.004825, minimum 10 ms RMS 0.02805, maximum output 0.285 at full slider. A complete natural playback run lasted 340.18 s with one loop source and no sampled silence. Actual existing alien dialogue ducks gain 0.256 → 0.07168 (−11.06 dB), then recovers. Title, port, docking, orbit, volume/save reload, mute and pause/resume passed. HTMLAudio fallback still includes the original fade-out; the tailored crossfade uses Web Audio. These measurements do not establish musical appeal or phrase matching by ear.

Created runtime assets: assets/music/neon-starfield-voyage.m4a (11,637,888 bytes); code-native metal hardware in utils/landing-gear.ts and synthesized cutting effect in utils/mining-audio.ts. Retired from runtime: the previous theme and cyan/duplicate landing paths. No bitmap or recorded voice was deleted. Integrity rerun: 113 baseline images unchanged; 556 alien entries and 980 crew/nickname entries unchanged. No save-codec or progression change.

Validation on this feedback build: **1,170 unit assertions, 37 compiled browser scenarios and 12 source renderer/audio harness checks rerun**, plus TypeScript, build and bundled-byte checks. Seven feedback cases are new (six compiled, one source canvas). Combined evidence inventory is 75 compiled scenarios and 12 source checks; the other 38 compiled communication/encounter/lifecycle scenarios and 115-scene gallery are prior-pass evidence. Five isolated fresh commissions and one guided victory remain documented historical evidence; no additional full mission or victory is claimed for these repairs.

Evidence: artifacts/qa-feedback-report.json, qa-feedback-motion-report.json, qa-sonilo-report.json, qa-title-port-music-report.json, qa-player-experience-report.json, qa-planet-scans-report.json, qa-music-report.json, final-integrity.json and sonilo-review/retro-replacement.json. The initially failing new readability assertion is retained in feedback-before.log/json. Original pre-replacement audio reports are retained as historical reports. The local Edge tab was refreshed to index-eKx1lz1B.js with its saved mission slots preserved.

The sections below describe the earlier closeout; any Lower Deck Voyage acceptance or earlier counts there are historical and superseded by this section.

All eleven recorded findings have implemented fixes and passing checks. The
graphics, ground tools and encounter pass is verified by unit checks, native
Chrome scenarios, a recorded 115-scene gallery and a guided campaign victory that
survived reload. The existing Sonilo **Lower Deck Voyage (Generation 2, Variation 2)** is now integrated locally and technically verified. The user accepted this selection. This agent used metadata and PCM analysis, not auditory listening.
This is not certification of complete parity with every original-game feature.

## Title and port soundtrack correction

The user correctly reported that the accepted music was absent at the local
entry point. Routing still selected procedural Starport music, and title playback
was disabled. The accepted recording now covers the title, ordinary Starport and
docking as well as exploration/surfaces. Returning to title explicitly selects
that recording regardless of the previous scene. Dedicated combat, victory and
memorial cues remain. No audio bytes, loop points, game rules or saves changed.

The failing routing assertion is retained under sonilo-review/title-score-before.json.
Two new compiled scenarios verify the selected file's SHA-256 at the title,
one running loop, port/docking continuation, pause-clock freeze and resume.
All six existing music scenarios were rerun, including volume/save reload,
peaceful contact transitioning to combat, real dialogue ducking and fallback.
The updated unit suite passes 1,166 checks. A test-fixture correction scoped
music-clock assertions to the score graph rather than independent UI sound-effect
contexts; those short effects are not an extra music bed. Edge was refreshed to
the corrected compiled build, preserving its save slots, and given an audio gesture.

## Final closeout, October 22, 2026

The named eleven-finding experience pass is complete within the boundaries below.
Current checks: **1,166 automated assertions, 69 compiled browser scenarios,
11 source renderer/audio harness checks, and 115 distinct gallery scenes**.
TypeScript, production build and resource checks pass; all 120 source image
files decode, with no missing literal runtime asset keys. This includes the
new scanner's seven compiled scenarios. The final build reran the existing
player-experience, encounter, original communication, conversation lifecycle,
procedural music and actual-recording batches. Test reports and public synthetic
mission exports are curated under artifacts/; browser account/storage profiles,
GOG files and the 12UI kits remain local and untracked.

The private repository is [cptjamestiberiouskirk-pixel/starflight-junior-crew](https://github.com/cptjamestiberiouskirk-pixel/starflight-junior-crew).
The actual working game remains E:\Code\project-files. Git uses the verified
account noreply identity. The existing Pages workflow requires manual dispatch;
it was not run and no deployment was authorized. Private source/evidence backup
is the only external GitHub delivery.

### Original-style planetary scanning

In orbit, open **Science → Sensors** (or **Scan planet** in that console), then
**Analyze reading**. A three-second sweep measures mass in original tons,
relative Bio/Min density, atmospheric gases, hydrosphere compounds and
lithosphere minerals. Composition lists retain canonical abundance order;
generated design placeholders such as individual gas percentages were discarded.
The existing planet illustration remains in both the orbit view and panel.

Analysis requires a completed reading and a living, conscious assigned Science
Officer. Object and the original raw orbit slot are identified; surface,
gravity, atmospheric density, temperature range and global weather each use an
independent original science-skill certainty roll. Unknown conclusions say
“Not certain.” The reading must be refreshed before another analysis. The orbit
HUD follows those conclusions, and Status reports ship condition rather than
bypassing analysis. Existing colony recommendation/progression rules remain in use.
Red Cylinder and Crystal Cone overlays retain their artifact gates.

Optional save data stores progress and certainty flags, not editable planet
facts. Pause freezes the sweep, unfinished/consumed readings survive reload,
and leaving orbit clears the reading. Legacy saves lacking the new field load.
A new timer starvation defect appeared during continuous crew healing; the clock
now reads current callbacks through a ref without restarting its interval.
Its failed report and passing native reproducer are retained. Two driver setup
errors (artifact-name lookup and assuming an injured officer would not heal) were
corrected separately; they were not counted as additional game defects.

Reference: original [Starflight manual, Science §3.2.2](https://www.mocagh.org/ea/advpak-starflight-manual.pdf),
the installed GOG manual, the recovered SCIENCE/ANALYZE-OV implementation and
original sensor screenshot in the local Unity reference. No original GOG
executables, manuals or art were copied into this repository. Documents and
recovered behavior were sufficient; this pass did not claim a GOG play session.
The sweep duration and responsive panel are new presentation choices, not a
claim of exact DOS screen timing or complete Science-command parity.

### Additional isolated fresh missions

Two further missions, D and E, were commissioned in separate browser contexts
through ordinary controls, adding to the three earlier fresh commissions.
They used known charts and public save feedback, with no injected game state
and isDev=false. Six crew survived each.

- D bought class-2 engines and a cargo pod, landed, mined 3.9 m³ Chromium,
  boarded, returned to Arth and sold the ore for 975 M.U. The 4,475 M.U.
  balance survived reload. D then returned to orbit, scanned and analyzed the
  planet through the new UI, and preserved its result on another reload.
- E used a 390×844 viewport, class-2 engines and a class-1 shield, surveyed
  the world at [123,101], filed Haven E and returned to Operations. Its suitable
  evaluation and 35,000 M.U. balance survived reload. This follows the existing
  reward timing; the scanner adds no new colony prerequisite.
- The earlier guided B victory remains compatible with the final build:
  gameWon/flaresStopped=true, 500,500 M.U., all six crew alive, isDev=false.
  This is one guided campaign victory, not multiple fresh campaign victories.

Input-driver locator failures are retained in player-actions.jsonl. The successful
mining sale and scan captures carry explicit successful labels. They do not turn
failed button lookups or mislabeled earlier captures into gameplay evidence.

### Assets and design closeout added in this continuation

Added PlanetarySensors.tsx, the planet-scans model and its 27 focused checks.
The sole new scanner bitmap is planetary-sensors-plate.webp (11,244 bytes),
an optimized derivative of the exported 12UI background. Original planet/crew/
ship art was reused. No additional original artwork or voice recording retired.
The accepted Lower Deck Voyage asset and its authored Web Audio loop remain
unchanged; the full natural loop and real dialogue ducking passed again.

12UI candidate C's LayerDoc and responsive HTML export both succeeded. The user
approved sending the fictional fixture for final comparison. Its first attempt
hit a missing managed browser and the proxy; both required download hosts later
passed, and the managed browser installed. Windows denied a further protected
trust-file edit, so no agent proxy-file mutation is claimed. The comparison then
settled using the unchanged target with no additional purchase, but DOM overlap
was 35.4%, below the 60% safe mapping threshold. The broad selector patch was
not applied. Local rendered review at desktop and 390px confirms the adapted
panel, its original art, real values and usable controls; this is not a claim of
pixel-perfect target certification. Generated gas percentages, new icons and
alternate planet art were excluded in favor of canonical data and preserved art.

## Eleven recorded findings

| Finding | Changed | Verification and resulting behavior |
| --- | --- | --- |
| C-01 | Crew emoji replaced | Five finished, transparent six-expression atlases; real blink, alert/injury and memorial states. All species and expression states inspected in Chrome. |
| C-02 | Spemin transport art | Transport now uses its own illustration and correct proportions. Native draw instrumentation confirms the transport path. |
| C-03 | Flat Device protection | Original wildlife hit-roll mitigation now applies to assigned, living ground crew. Protected/unprotected native scenarios and roll boundaries pass. |
| C-04 | Lifeform recording and data income | Nearby recording, energy, movement cancellation, injury interruption, saved progress and one-time survey redemption added. Reload during recording and duplicate-payment checks pass. |
| C-05 | Orb site recovery | Giving the Orb to the Veloxi reopens only its original surviving site, retaining learned lore. Gift/recovery/save checks pass. |
| C-06 | Wildlife injuries | Original hit chance, durability and damage rules now injure assigned living officers; fake rover-fuel injury removed. Existing treatment and command succession remain intact. |
| C-07 | Surface refill | Ordinary resources refill on breaking orbit; ascent alone retains depletion. Fixed story relics and special dropped artifacts remain persistent. Random ruins cannot bypass fixed quest-relic sites. |
| C-08 | Translation | Original integer formula and species bonuses restored; dead, unassigned and unsuitable species no longer grant bonus translation. Exact numeric and crew-assignment regressions pass. |
| C-09 | Copy/reset missions | Independent copies, explicit overwrite review, backups, cancel-first reset, full-content stale-save protection and session-only/export messaging added. Source missions and other slots stay intact. Desktop/phone checks pass. |
| C-10 | Artifact shop and bank interest | Original initial Flat Device/Whining Orb stock, exact single-copy purchase/sale, buyback and stock retention added. Base cargo hold now counts. Original integer interest settles before evaluation bonuses and on launch; native ordering checks pass. |
| C-11 | Wrong unused sun image | Station artwork misnamed sun_arth.png archived and retired. Active procedural sun retains a fixed physical radius while its light animates. |

## Additional issues found and fixed

- Mining now extracts continuously in tenths, with partial-deposit persistence,
  fuel/hold caps, selected targets, distance, approach, large Start/Stop controls,
  G shortcut, capacity and extracted-volume readouts. Moving stops extraction.
  The original whole-deposit cargo pickup still works. The beam is anchored to
  the rover turret and uses a bright core, glow and impact sparks.
- Alpha compositing previously tinted rectangular areas of terrain beneath
  minerals/lifeforms. Tint now applies to isolated sprites. Ground tiles have
  matching mirrored borders; the two layers and elevation glows stay anchored
  to world coordinates. Elevation samples use the actual landing coordinates
  and the existing surface kilometre scale.
- Four wildlife illustrations now have species-specific limb/tentacle motion,
  correct facing and retained headings. Stunned markers use five-point stars;
  dead specimens remain still. No new biological-generation parity is claimed.
- Tactical explosions now have flash, cel shaded fire lobes, smoke, fragments
  and a shockwave. Laser kills previously omitted explosions; they now trigger
  the same finished effect. Actual laser-kill phases were captured.
- Removed the detached central propulsion cloud. Exhaust follows the three
  nozzle mouths measured from the preserved hull illustration, across all five
  engine classes and headings. Four cinematic triangle ships were replaced by
  the configured hull. Descent/ascent and landing selection use the destination
  planet artwork rather than a cockpit painting containing another ship.
- Moved eleven remaining visual-effect arrays/timers out of per-frame React
  state. Canvas simulation stays live while ordinary UI snapshots are throttled.
- Landing/entry/healing controls no longer bounce away from the pointer.
  Contextual recorded banter is gated to relevant scenes, atmosphere, hardware
  and assigned living speakers; recorded words and hashes were preserved.
- The Veloxi drone attacked before offering its original test. It now holds
  fire for the six-number challenge, preserves unfinished progress and timing,
  grants clearance until hyperspace departure, and denies on wrong answers,
  timeout, disconnect or player attack. Its transmission now shows the existing
  mechanical drone art. Removed the unused invented 37.4 MHz trivia question.
- Hostile dialogue previously started combat at a generic mood of 50. Original
  race-specific friendly, threat and fight bands now govern encounters; a rude
  Spemin or Gazurtoid can keep talking without shooting. Equipment adds the
  original +5 shields/+10 weapons, statements/questions diminish with phrase
  count, and reputation uses the original integer-third/minimum-five rule.
- The wider alien-question scheduler was missing from live play. It now uses
  the original questions and per-answer changes, a 30% question chance (70%
  for eligible Mechans), 20-second reminders twice, then impatience with the
  link retained. Late answers after the second reminder are ignored, as in
  the original. Special trades retain their separate 60-second NO timeout;
  the drone retains its separate 15-second number test. Ordered transmitter
  messages, phrase limits and original phrase actions are wired into live play.
- Mechan 9 recognition was absent. The original four correct answers can move
  an unarmed meeting from 48 to below 10, permanently recognize Group 9, return
  the ship to Heaven orbit and allow later entry. Assigned living humans count;
  reserve/dead humans do not. Recognition persists through save/reload and
  later human-free crews. Player fire still provokes this visit's retaliation,
  and surrendered fleets retain surrender. Removed two unused invented
  Mechan multiple-choice trivia questions.
- Imported 536 original phrase control records and 23 vessel strength records
  from reference commit 3285bb01f979b48a3189268c3c46ece6019ba733; source hash and
  field provenance are saved. These correct multi-posture/context selection
  without changing a recorded text or ID. New conversation clocks, question
  IDs and recognition flag are optional in legacy saves and validated on import.
- The follow-up encounter regression caught an older homeworld battle save
  without the newer attack-started flag. Import now preserves its recorded
  combat state, instead of returning the fleet to the warning stage. Fresh
  homeworld arrivals still follow the existing original warning sequence.
- Questions and posture statements previously produced instant alien replies.
  They now queue for the original conversation clock: 5–30 seconds initially,
  10–30 seconds between ordinary turns, with the original player-phrase timer
  adjustment. Unanswered hails repeat at 20 seconds, stop after three for ordinary
  fleets, and add the original +4/+9 mood changes. Homeworld warnings retain
  their own sequence. Closing a link keeps it closed until the player hails.
- Lore topics advance in original data order across meetings. Old Empire and
  Ancients use the original encounter-long refusal roll; close/reload retains
  it. Pending replies, posture history and transmitter lifetime also survive
  reload. Prior transcripts were being erased at the next contact; they now
  remain in the ship log. A hostile question that ends the link cannot leave a
  queued reply behind for a later link. No dialogue text or voice ID was changed.
- A terminating transmission cancelled its recording during download. Native
  testing reproduced HTTP 200 for Nomad 188 with no audio source start. The fix
  lets its 28.64-second recording end naturally and advances to report 189 on
  reopening; manual close and returning to title still cancel playback.
- Two simultaneous music beds were playing. A single controller now chooses
  the existing synthesized score or an explicitly supplied recording. The
  unrelated automated_dream.mp3 overlay and its network request were retired.
  The volume slider governs the whole score; pause and zero volume silence its
  sustained notes and suspend the music clock. Quick resume cancels a pending
  suspension. Theme changes fade old notes and scheduling uses the audio clock.
- Peaceful alien encounters use exploration music until fighting begins.
  Victory uses an optimistic theme, and stopping the flares no longer makes
  all later travel play memorial music. Music lowers by about 11 dB during
  audible dialogue, then recovers smoothly; no recorded voice was changed.
- The recorded player now honors volume/mute changes made during fetch/decode,
  including its HTML audio fallback. Equal-power loop mixing keeps floating-point
  headroom instead of hard-clipping samples before the final quiet mix. These
  paths were verified using synthetic PCM fixtures, not claimed as Sonilo output.

## What was created, preserved and retired

- Created five original crew PNG atlases, preserved in assets/source-images/;
  shipped five lossless WebP derivatives. Runtime crew art is about 5.23 MB
  rather than 10.38 MB, with identical visible RGB and alpha pixels.
- Reused one official 12UI mineral cutout in the mining console. Candidate C,
  the unchanged LayerDoc, fixed HTML and export provenance remain local audit
  evidence. The generated full screenshot is not shipped as the game screen.
- Created MiningConsole and focused wildlife, surface-progress, mining,
  artifact-shop, save-action, drone, communications and visual-effect modules
  and regressions, plus commRules.json and vesselStrength.json rule data.
- Added GameMusic, music-state decisions and music regressions. The audio
  verification harness/test tones stay under artifacts/ and are not game assets.
- All 113 retained original PNGs remain byte-identical. The one retired wrong
  sun image is preserved under artifacts/player-experience-baseline/.
- All recorded alien dialogue text/IDs and all 980 crew-library entries are
  unchanged. The 980 comprise 972 standalone recordings and 8 nickname fragments.
- Existing mission progression, five save slots, legacy mission inventory,
  colony/trade loops and the fixed relic ending remain in use. No new quest
  framework, currency, invented prerequisite or replacement campaign was added.

## Test evidence

- The acceptance audit maps C-01 through C-11 and the six additional experience
  requirements to named passing scenarios, rule suites and inspectable captures.
  It rejects duplicate scenario names, checks the unit totals, requires all 115
  distinct gallery scenes and confirms that the retired sun's archived bytes
  match the original hash. The mining beam, terrain/wildlife, fire-phase explosion
  and twenty-view propulsion captures received a final visual review with no
  new visible defects found. Static capture review supplements the motion tests;
  it does not certify every frame or device.
- **1,166 automated checks:** planetary scanning 27, gameplay/save 426, player experience 262,
  original communications 120, music controls/loops 36, space 72,
  voice engine 107, shared ship renderer 58, legacy ship suite 58. Voice engine
  unit tests use mock Web Audio; they are separate from native decoding below.
- TypeScript and production build pass. Build resource check verifies 120 source
  images by SHA-256, 99 application image paths, local fonts/licenses and relative
  GitHub project Pages URLs. Deployment itself has not been tested or published.
- **21 player-experience native browser checks pass:** 19 compiled
  scenarios and 2 source-renderer inspections. Includes 390px mining/save UI,
  quota/concurrency failures, injury, depletion, fuel limits, original drone
  failure paths, recording reload and interest event ordering.
- **15 encounter scenarios pass:** location-based interception,
  homeworld warnings, surrender persistence after firing/reload, original delayed
  distress waves and 20 total entries, pause/reload and 375px rendering.
- **12 compiled original-communications checks pass:** normal-flight
  Spemin contact; hostile-talk migration; four original Mechan answers; wrong
  Group 9 answer; reminder/reload; late YES/close; impatience timeout; reserve
  human exclusion; permanent recognition with no humans; actual shield/weapon
  toggles across fight thresholds; visible question controls at 390px; and
  recognition isolation when loading a legacy mission in another save slot.
  These are controlled synthetic mission scenarios, separate from the guided
  campaign above. Test-fixture mistakes (translation skill, prior-location key,
  survivor history and console selection) were corrected without disguising
  them as game fixes.
- **11 compiled conversation-lifecycle checks pass:** queued answers,
  repeated-click behavior, lore refusal, real-time hail intervals and limits,
  closed/pending-link reloads, ordered transmitter reports, natural completion
  of an actual recorded final transmission, transmitter lifetime, explicit
  audio cancellation, cancellation of a reply when its question provokes a
  forced close, ship-log history across natural contacts, and public
  import/reload of the earlier guided victory in the current build. Homeworld
  and Orb handover regressions also pass with the original delayed handshake.
- **6 native audio checks pass:** 2 compiled game scenarios verify one
  audible bed, pause, saved volume and an actual laser shot changing peaceful
  contact music to combat. Four isolated source harness scenarios use real
  Chrome AudioContexts/HTMLAudio, an actual public alien recording, and synthetic
  PCM to verify ducking, mute, visibility events, rapid resume, exclusive source
  replacement, asynchronous volume, a continuously running loop and fallback.
  Visibility/platform events are synthetic; these checks do not certify the
  artistic quality of Sonilo recordings. The actual-recording checks below now verify the selected technical loop separately.
- **115 authored gallery scenes:** no page JavaScript errors
  and no broken DOM image loads. Gallery fixtures/dev controls are separate from
  player campaign evidence. Motion/effect phases were inspected separately.
- All four terrain tile borders compare exactly at their shared seams. Alpha
  tint leaves background corner pixels unchanged. Twenty actual renderer views
  cover five engine classes and four headings.
- Full public voice-repository inventory at e476b00b15c4738d5f1249087e6081945c50ff6a
  contains all 972 standalone crew recordings and the 548 expected spoken alien
  IDs. The three Mysterion binary lines are synthesized intentionally; disconnect
  ID 513 is a UI cue. Six sampled files fetched via CORS, decoded through real
  Chrome AudioContext and contained nonzero samples. Human audibility and every
  recording's artistic quality were not certified by that sample.
- Native headless performance samples reached about 162–165 fps with ~6.4 ms
  frame p95 and ~14–16 UI updates/sec in the sampled encounters. Those are local
  headless measurements, not a guarantee for every monitor/device or scene.

### Actual Sonilo soundtrack integration — October 22, 2026

All four existing Generation 1/2 downloads were compared using their displayed
Sonilo descriptions and actual native Chrome AAC/PCM measurements. **Lower Deck
Voyage (G2 V2)** is the provisional choice: its described warm orchestral and
electronic character fits the requested animated crew tone, and it has the
strongest tested harmonic loop-window match (0.974). G1 Cosmic Curiosity is the
more explicitly retro/orchestral alternative; G2 Cosmic Curiosity has the
steadiest measured level; Junior Crew Odyssey is described as a brighter,
more foreground adventure cue. This is not a claim of auditory review.

The selected 11,605,779-byte original is preserved and shipped locally. Runtime
uses source 12.5–345.0 seconds and a 2.5-second equal-power crossfade: 332.5
seconds initially, then a 330-second loop. Exploration, orbit, peaceful contact
and surfaces use the recording. Combat, victory and memorial retain their
existing cues. Build checks verify exact audio bytes and relative project URLs.

**Six additional native actual-recording checks pass** (one compiled game,
five source/PCM harness scenarios). They verify local playback under a project
subdirectory, one score source, pause freezing its clock, same-source resume,
slider and saved-volume reload, zero volume/platform mute, rapid resume, real
alien voice ID 1 duck/recovery, actual-PCM turnaround and fallback controls.
The sustained run lasted 340.79 audio-clock seconds and crossed the first natural loop
boundary with one running source. Sampled level/timing evidence is retained.
The existing six music checks also pass, including an actual player laser
replacing peaceful recorded exploration with the combat cue.

A real stale autoplay-unlock callback resumed the clock during pause. It now
checks current play/mute/visibility state before and after asynchronous resume.
Its failing reproducer is retained. An earlier test-fixture error (missing orbit
planet index) is retained separately and was not counted as a game defect.

At music slider 0.8, master gain moves 0.256 → 0.07168 during actual dialogue,
then recovers to 0.256 (-11.06 dB duck). The processed source peak is 0.8852,
maximum output at full slider is 0.2833, and turnaround sample step is 0.00533.
The actual rendered seam has no silent 10 ms window; this verifies digital
continuity, not listener approval. Raw decode/processed loop storage is about
127/117 MB at the 44.1 kHz analysis rate, potentially 244 MB during preparation.
Desktop decoding took about 426–455 ms across the four sources at that rate.
At the runtime default of 48 kHz, the selected source/loop use 138/128 MB,
potentially 266 MB combined; decoding took 753 ms and loop preparation 25.5 ms.
Other-device performance is untested.

All **59 existing compiled scenarios and six renderer/audio harness checks**
were rerun against the changed build; the new Sonilo pass adds one compiled
and five harness scenarios. The earlier 115-scene gallery and three fresh
commissions remain historical evidence. This audio pass adds no new campaign
victory and does not claim another gallery audit.

Detailed comparison and limitations: design/SONILO_MUSIC_REVIEW.md. Actual
results: artifacts/qa-sonilo-report.json. All four originals, analysis, hashes,
failure evidence and pre-edit files: artifacts/sonilo-review/.

### Player-style runs and ending compatibility

Three separate fresh commissions were played through ordinary controls in
isolated synthetic profiles. A completed a mining/return/trade loop and later
lost combat. B completed a colony/return loop and exposed the premature drone
attack. C lost near first contact while the test driver was reviewing controls;
the driver now pauses during analysis so idle agent time is not a player input.

B was resumed from its own publicly exported checkpoint after the drone fix.
It passed both forbidden-world probe tests, acquired the Black Egg and Orb at
their fixed sites, returned to Arth, accepted evaluations and bought fuel,
survived interceptions/flux travel, landed at the Nexus, armed the Egg, boarded,
ascended and won. Return to title, Continue and public re-export preserved
gameWon=true, flaresStopped=true, 500,500 MU, all six
crew alive, and isDev=false. This is a **guided normal-control campaign with
known chart coordinates and public save-export feedback**, not an unaided human
win or multiple fresh campaign victories. No state injection/dev tools were used
for that progression; imported data was that mission's own earlier checkpoint.

## Remaining boundaries

- Actual Sonilo source access and integration are complete. Four existing
  creator-account tracks were downloaded through signed-in Edge, identified by
  generation/variation and hashed. The user-accepted choice is Lower Deck Voyage,
  Generation 2 Variation 2. This agent cannot hear browser playback; the musical
  comparison uses Sonilo descriptions and actual PCM analysis. Optional listener review of melodies, dialogue intelligibility and seam phrasing remains outside this agent’s auditory capabilities.
  The HTMLAudio fallback plays the original file with its fade-out; the tailored
  crossfade is verified in Web Audio. Mobile memory pressure remains untested.
- The earlier mining 12UI target comparison was initially blocked by approval review.
  The user then expressly approved the synthetic screenshot/DOM transfer.
  Its managed Chromium was missing and the matching download was denied by the
  network proxy. Local comparison against selected C and the official exports
  was completed. The later scanner comparison settled as described above. No paid conversion
  failure was represented as a successful responsive export.
- Broader original-game parity remains a separate audit boundary. The procedural
  wildlife compatibility traits are not the original full species generator;
  an Interstel police encounter is not authored. Mechan 9 and the live question
  scheduler identified during this audit now have implemented fixes and passing
  native checks, as do original hail/conversation timing and the separate Old
  Empire/Ancients topic-refusal rules. Every possible route/planet combination
  remains untested.

## Inspectable files

- artifacts/qa-player-experience-report.json; artifacts/qa-encounters-report.json
- artifacts/qa-original-comms-report.json; artifacts/comm-rules-provenance.json
- artifacts/qa-comms-lifecycle-report.json; artifacts/qa-unit-report.json
- artifacts/qa-music-report.json; music.test.ts; artifacts/qa-music.mjs
- design/SONILO_MUSIC_REVIEW.md; artifacts/qa-sonilo-report.json; artifacts/qa-sonilo.mjs
- artifacts/player-experience-acceptance.json maps requirements to exact evidence and records scope and boundaries
- comms-*.png and comms-*.sfsave under artifacts/ for the new controlled scenarios
- artifacts/gallery-final/report.json and sheet-1.png through sheet-4.png
- artifacts/final-integrity.json; artifacts/qa-final-assets.json
- artifacts/native-voices-report.json; artifacts/voice-repository-inventory.json
- artifacts/crew-compression.json; artifacts/experience-propulsion-matrix.png
- artifacts/player-actions.jsonl; artifacts/player-session-log.jsonl
- artifacts/player-b-final-latest.json and player-b-final-009-campaign-victory.png
- design/player-experience-progress.json; design/SONILO_MUSIC_PROMPTS.md
