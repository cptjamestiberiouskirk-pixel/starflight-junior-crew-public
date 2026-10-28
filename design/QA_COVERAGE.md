# Autonomous gameplay audit

This is a local acceptance log, not a claim that every possible campaign route
has been exhausted. User saves are preserved; fixtures use Slot E, and a fresh
mission test created Slot B without replacing the existing A or E saves.
The existing cartoons and recorded voices remain the visual/audio reference.
The latest browser batch used fresh isolated Chrome profiles with synthetic
B/E slots. It did not read or overwrite personal browser missions.

The eleven completeness findings below are historical and now have implemented
fixes and passing checks. See [PLAYER_EXPERIENCE_REPORT.md](PLAYER_EXPERIENCE_REPORT.md)
and the dated resolutions at the end for current evidence and remaining limits.
Actual Sonilo audio-file access remains pending; complete original-game parity
and every possible campaign route are not certified by this pass.

## Coverage

| Area | Status | Evidence / next checks |
| --- | --- | --- |
| System graphics, zoom, exhaust, sun, Orbit control | Passed previous batch | See GRAPHICS_GAMEPLAY_AUDIT.md; compiled browser and rendering regressions |
| Title, new game, introduction | Passed audited flows | Three briefing pages/Previous/Next, empty-slot creation, clean defaults, immediate reload and Enter activation passed; isolated Chrome full-slot test verified review, backup text/file, Cancel/Escape/default Enter, focus trap, phone layout, concurrent-change review and replacement of E only; A-D snapshot hashes were unchanged |
| Personnel | Passed audited flows | Empty name rejected; all five species recruited; normal Human training +9 cost 300; deceased/Android training disabled, deletion clears assigned posts and checkpoints, recruit 25 succeeds and 26 rejects without payment; Human/Velox/Thrynn/Elowan 249-to-250 boundary sessions each charged 300, displayed the actual +1, and checkpointed the cap |
| Crew assignment and launch requirements | Passed audited flows | Six assigned officers launched QA EXPLORER; unnamed ship, missing engine/fuel, dead assigned officer and unread evaluation denied launch with clear warnings; dead officers cannot be selected; all six selectors have post labels, unassigning Captain immediately saved null; casualty behavior remains in maintenance coverage |
| Operations, evaluations, bank | Passed audited flows | Suitable survey +35,000, unsuitable -100 then -10,000, duplicate no payout, 30-day interest exactly +564 and same-day relaunch no interest. Read/unread and evaluation acknowledgement checkpoint immediately. Scheduled notices now release on their dates: native day 1 had IDs 1/2 only; day 298 had all seven, with existing read flags preserved and no balance change |
| Ship configuration and trade | Passed audited flows | Purchases, unaffordable upgrade, permitted/blocked pod sale, name entry, itemized repair, all mineral trades, day-49 pricing, capacity rejection, fractional stock conservation, relic appraisal/sales and specimen sales passed with saved balances and ledger entries |
| Dock/launch and navigation | Passed audited routes | Compiled system entry checkpoint at radius 365, held-key boundary exit, normal Arth docking, forward/reverse flux, saved disorientation, emergency tow and flared-system entry passed. Nebula shielding, timed incineration and natural hyperspace/system contacts also passed. Travel between story sites was seeded as described below |
| Orbit, scanning, landing | Passed audited flows | Bottom Orbit, coordinate selection, descent/ascent and reload passed. Exact fuel boundaries and zero-fuel denial passed, 8.70 G crush shows hull 0, gas giant landing rejects without fuel/health loss, Crystal radiation resumes through save/load and the Orb permits safe descent |
| Rover, mining, specimens, ruins, cargo | Passed audited flows | Compiled mining/depletion, boarding, transfer, overlapping hostile wildlife, active stunner selection, three captures and actual sales, full-hold ruin retry, cargo pickup beside a completed ruin, disarmed Egg recovery, remote empty-rover tow and phone recovery passed. Normal ruin visits acquired all three finale relics; gravity and thermal hazards are covered in orbit/landing |
| Engineering and medical consoles | Passed audited flows | All seven repair targets reached full health and retained 0.05 m³ from a 0.15 m³ stock after a 0.1 charge; destroyed and underfunded repairs stayed disabled without spending. Prepaid task/reload/completion/abort, exact 30/60/120 Hz rates, patient pause/persistence, skill-based casualty succession and total crew loss passed |
| Diplomacy and combat | Passed audited encounters | Earlier combat/escape/defeat, trades, tribute, sacred relic decisions, crew rivalries and timeouts passed. Natural contacts, all four home fleets, warning grace/final attack, surrender through firing/dialogue/reload, distress pause/reload, non-homeworld arrivals, 20-entry cap, large fleets and cross-slot reset now pass. All 57,200 ordinary dialogue probes retained correct race/context |
| Story and victory | Passed seeded acquisition/finale route | Normal landings, ruin recovery and boarding acquired the Orb at Sphexi 46N/14E, Egg at Phlegmak 34S/98E and Cone at 29S/55W. Carried those recovered items into the Nexus at 47N/45E, armed/dropped the Egg and ascended; saved victory, flares stopped, one 500,000 bonus, one destroyed planet key and three retained earlier surfaces. Travel between sites was seeded; this is not an unaided campaign playthrough. Earlier countdown/reload, missed-Nexus and Uhlek/Elowan branches also passed |
| Save/load/import/export | Passed audited flows | Surface, combat, flux, maintenance, thermal exposure and recovery checkpoints exercised; malformed records rejected; legacy defaults and carried charges migrated safely. Full-slot backup text/download, cancellation, concurrency review and E-only replacement passed with unchanged A-D hashes. Cargo disposal and the acquired-item victory checkpointed correctly |
| Pause/settings/input/layout | Passed audited flows | Five viewport sizes, steering, HUD, recovery, blocking pause, comms/log/map, all gallery scenes and phone settings/combat passed. Flight/gantry/title quality changes backing resolution with constant CSS geometry; preferences checkpoint and legacy defaults reset. Actual captain/Veloxi MP3 decode/start passed |
| Developer gallery | Passed desktop scenes and targeted phone checks | Opened and captured all 115 scenes through native controls; inspected six contact sheets. No broken image elements or horizontal page overflow. Rechecked species selection, overview zoom, console reset and modal stacking after repairs. Gallery fixtures supplement normal gameplay checks |
| Production package | Passed current batch | 705 regression checks, typecheck, build, 15 compiled browser scenarios and asset hashes passed. Relative subpath preview is running; no Pages publication |

## Issues

| ID | Finding | State |
| --- | --- | --- |
| QA-01 | Transition autosaves capture state before the new location and queued changes commit | Fixed; launch, docking, orbit/surface, flux, tow, encounter entry and victory checkpoints passed in the compiled browser |
| QA-02 | Load omits saved economy, rover, exploration, and story fields; values can leak between slots | Fixed restoration/reset paths; rover/economy/flux checks passed earlier. Current cross-slot browser test loaded clean B after a surrendered canonical fleet in E: B had no fleet/encounter state and E's full snapshot was unchanged |
| QA-03 | Planet surface changes are absent from saves and discarded on orbit departure | Fixed; compiled reload retained only 0.2 m³; depleted deposit stayed depleted after ascent, break orbit, re-entry and landing |
| QA-04 | Per-frame rounding makes rover and shield fuel use zero | Fixed fractional accounting; 30/60/120 Hz regressions; browser movement consumed 0.005 fuel over 0.5 s |
| QA-05 | Any artifact named orb bypasses Crystal Planet protection | Restricted to Crystal Orb identity and legacy aliases; tested every canonical artifact |
| QA-06 | Destroying a planet can remove its neighbors due to three incompatible key formats | One canonical zero-based order key; neighbor regression passed. The acquired-relic finale saved only 192-152-0, retained the three earlier surfaces and awarded the victory bonus once |
| QA-07 | Incomplete imports can replace valid missions and later crash | Fixed; failing regression now passes; compiled UI rejected incomplete JSON with No changes made, then accepted a valid fixture |
| QA-08 | Failed persistent saves can read an older local copy and still claim Autosaved | Added session fallback precedence and durability result; quota-failure/recovery regression |
| QA-09 | W/S rover shortcuts conflict with advertised WASD driving; keyboard handlers retain stale rover positions | Fixed; compiled W drove north, S drove south, R opened weapons, Q scanned; labels match |
| QA-10 | Delayed events can affect another mission after loading or restarting | Mission generation guards added; compiled cross-slot test paused an unfinished launch in E, loaded B, waited past its remaining timer and confirmed B stayed at Starport with no cinematic while E's snapshot remained unchanged |
| QA-11 | Rover unloading ignores ship capacity and puts mined Endurium into an unused mineral entry | Fixed; compiled fixture with 49/50 m³ used transferred 1 of 2 m³ Endurium to fuel (20 to 21), retained 1 m³ in rover, and displayed a full-hold message |
| QA-12 | Automatic wreck salvage ignores ship capacity | Fixed; compiled full-hold fixture took 1 m³, retained 2 m³ fuel + 4 m³ Titanium in unlooted wreck, and displayed full-hold feedback |
| QA-13 | Black Egg countdown uses wall-clock timers, is not persisted midway, and may advance during pause | Fixed; elapsed and ascent timer stayed exactly unchanged while paused; mid-ascent reload completed once, saved one destruction key and cleared countdown; victory/continue passed |
| QA-14 | Combat saves omit player position, cooldowns, pass phase, projectiles, and separate question timers | Added snapshot/restoration and reset paths; compiled reload retained [9,-4], laser/missile cooldowns, combat duration and 12-second question timer |
| QA-15 | Trade Depot lists only six commodities although mining yields 22 minerals; several repair materials cannot be bought, and Endurium price changes are unused | Fixed; all 22 minerals listed, Copper purchased, Chromium/Tungsten sold with exact ledger balances; day-49 fuel bought/sold at 1,500; precise capacity rejection has visible feedback. Missing mineral prices retain the previous 500 M.U. fallback and existing 50% broker spread |
| QA-16 | A cargo pod can be sold while needed, leaving 90 m³ in a 50 m³ hold | Reproduced in compiled game; fixed shared cargo-volume accounting and removal guard; compiled full-pod sale rejected without credit change, empty pod sale paid 500 |
| QA-17 | Valid snapshot with missing/stale slot metadata can display a wrong balance or crash the title UI | Metadata now derives from the validated snapshot; codec regression passed |
| QA-18 | Quit reminder claims current progress is saved but quitting does not request a checkpoint | Reproduced quitting from Bank and resuming in older Ship Configuration checkpoint; fixed checkpoint request and log preservation; compiled recheck resumed in Bank |
| QA-19 | Start New Mission reuses the selected occupied slot and does not checkpoint the initial state | New missions prefer an empty slot, confirm replacement if full, and save after reset commits; compiled test created B, preserved A/E, and survived immediate reload with 12,000 M.U., no crew, no upgrades or story residue |
| QA-20 | Title slot cards wrap DEV/date labels and lack keyboard activation | Stacked card labels/currency, separated native Resume and Export buttons, and blocked background game hotkeys on title; all five cards have no horizontal overflow at 1280x720; Enter resumed B |
| QA-21 | Incoming projectiles cause damage when their lifetime expires, even 100 cells away | Reproduced compiled missile reducing hull 250 to 150; collision and expiration now separate; compiled retest kept hull 250 and removed the expired shot |
| QA-22 | Simultaneous impacts reuse pre-hit shields/armor and lose damage | Reproduced two 100-damage hits leaving 50 of 150 armor and full hull; synchronous health pools and shared defense resolver now leave armor 0, hull 200; compiled retest and sequential shield/armor regressions passed |
| QA-23 | Combat position/projectiles/timers use React commits as simulation state; post-encounter cooldown redraws UI every frame | Migrated tactical state to fixed-step cells and read live values for capture/update/draw; compiled escape still checkpointed exactly at 23 cells, idle system returned to 0 UI commits/s while cooldown ran |
| QA-24 | Docking Bay calls a dead assigned officer certified and labels hull alone as Hull & Armor | Readiness and launch guard share living assigned-officer count; compiled dead-officer fixture displays 5/6 Certified; hull label is accurate |
| QA-25 | Reopening planetary logging skips the recommendation choice and pre-fills a name longer than its 15-character limit | Reset prompt step on opening/loading, truncate default name; compiled reopened prompt offered Yes/No, bounded its default to 15 characters, and rejected a duplicate without another fine |
| QA-26 | Launch denial messages from one mission remain visible after loading another valid mission | Clear transient preflight warnings on load; compiled same-page switch from denied fixture to valid mission removed the stale warning and changed 5/6 to 6/6 |
| QA-27 | Floating-point intermediate rounding underpays bank interest by one M.U. | Reproduced 563 instead of 564 on 47,000 over 30 days; compute balance times days divided by 2,500, floor last; compiled retest paid 564, same-day second launch kept 47,564 and one interest entry; annual/boundary/zero/negative regressions passed |
| QA-28 | Personnel Academy charges for training a deceased officer | Reproduced dead Avery receiving +9 Science and treasury dropping by 300; added alive guards at action and button levels; compiled dead/Android training controls disabled; loading resets recruitment/training dialogs and selection |
| QA-29 | Recruitment rejection appears behind the active dialog, and form labels are not associated with controls | Reproduced full-roster error hidden behind modal; display status inside dialog and connect labels; compiled 26th recruit rejected with clear visible message, roster remained 25; labeled field interaction passed |
| QA-30 | Flux disorientation and exit lock are omitted from saves and can leak across missions | Reproduced disabled starmap becoming available after page reload; serialize recovery/cooldown/exit position and restore/reset them per mission; compiled 24.65-second recovery resumed near 23.95, starmap stayed disabled, clean mission cleared it; reverse crossing retained a single history entry |
| QA-31 | Emergency tow spends 15,000 and recovers the ship without checkpointing the transaction or restoring stored galaxy coordinates | Reproduced visible Starport/5,000 balance while exported checkpoint remained Hyperspace/20,000; compiled repaired checkpoint records Starport [125,100], 5,000, fuel 10, hull 100 and one tariff entry |
| QA-32 | Rounded hull percentage marks 249.5/250 as nominal and prevents finishing repairs | Use exact health for repair eligibility and minimum 0.1 m³ charge; compiled UI offered 99.8% repair, consumed 0.1 Aluminum, saved hull 250 and one completion message |
| QA-33 | Per-tick rounding changes healing/repair rates, and medical updates redraw UI every frame | Preserve fractional health, format only displays, and use synchronous crew/subsystem/task cells; exact 30/60/120 Hz regressions passed; compiled patient and dead-crew checks, reload and exact pause passed; medical UI fell from 61 to about 16 commits/s |
| QA-34 | Field repairs spend minerals without checkpointing their prepaid task or completion | Checkpoint start, finish and abort; compiled sensor task saved at 95% with 0.5 Copper deducted, reloaded to 100%, retained Copper 1.5 and one completion message; abort saved at 95.35%, stayed stopped after reload and kept Copper 1.5; active task clearly labels prepaid minerals and abort explains consumption |
| QA-35 | Narrow screens collapse flight view and bridge console to zero height beneath gauges/log; no flight touch steering | Give flight view a bounded minimum height, scroll the stacked panels, retain compact vital HUD and provide pointer steering using existing console styling; compiled five viewport sizes passed; held east steering moved to [126.542,100], spent fuel, then release stopped movement and consumption; viewport override reset |
| QA-36 | Corrupt crew, subsystem, patient and repair records pass import validation and can replace a playable mission | Failing subsystem regression reproduced acceptance; validate maintenance records, retain legacy optional defaults; eight regressions plus compiled invalid-repair import rejection passed, previous E coordinates/task preserved |
| QA-37 | Ruin artifacts overflow a nearly full rover and cannot be recovered after an unsuccessful first visit | Reproduced 49 + 1.5 = 50.5 m³; separate exploration/recovery, require whole-artifact capacity and checkpoint recovery; compiled blocked visit retained the relic, unloading allowed one recovery, and a completed ruin no longer blocked pickup of dropped cargo beside it |
| QA-38 | A hostile lifeform exactly overlapping the rover divides by zero and saves null coordinates | Reproduced null wildlife positions in an exported mission; safe fallback direction and extracted AI step keep coordinates finite; compiled overlap, restored save and movement passed |
| QA-39 | Picking up an armed Black Egg leaves its timer/tracker armed inside the rover, triggering destruction on a later ascent | Reproduced carried armed item with no deployed charge; pickup now disarms and clears its tracker, loading legacy carried charges migrates them safely; compiled recovery, boarding and ascent retained the Egg without destruction |
| QA-40 | Stunner selects dead/already stunned targets, and dead-specimen pickup logs a full bounty although its value is halved | Choose the nearest active living target and log the actual bounty; compiled stunner skipped inactive specimens, three captures transferred, actual depot sales paid 600/1,200/1,200 exactly once with saved ledger entries |
| QA-41 | Known ruins are placed randomly near every landing, and changing landing coordinates moves resources/cargo to a different world location | Track landing origin and visited regions, map canonical ruin coordinates, rebase retained entities and generate only new regions; all 811 generated surfaces have finite unique entities; compiled Nexus appeared at 47N/45E, a native UI round trip restored dropped Copper to (3,2) at 20N/45E and retained Nexus exploration without duplicating regions |
| QA-42 | Landing fuel guard compares a larger unrounded amount than the displayed burn, and fatal landing leaves full hull displayed | Share precise burn rules for eligibility/descent/ascent; set hull 0 on fatal descent; compiled exact 0.2 fuel burns succeeded with 0 remaining, no-fuel ascent rejected, and 8.70 G collapse displayed hull 0 |
| QA-43 | Mining rounds 0.05 m³ free space up to 0.1 and can exceed rover capacity | Floor available mining increments, preserve fractional deposit remainder, and show insufficient-space feedback; compiled 49.95 m³ hold stayed 49.95 and the 2.7 m³ deposit remained unchanged |
| QA-44 | Driving, firing, wildlife and timers continue beneath blocking surface dialogs | Reproduced a 3.6 km drive while cargo inventory covered the screen; pause simulation for cargo/look/map/ruin/recovery dialogs, clear held inputs and reject background shortcuts; compiled held arrow/Space left position and fuel unchanged while an aggressive creature was nearby |
| QA-45 | A rover at zero fuel away from the ship has no playable recovery route | Reproduced zero-fuel rover 5 km away without Board or recovery controls; expose existing 15,000 M.U. Interstel tow, recover/refuel rover and retain cargo; compiled cancellation, one charge, Starport recovery, 100% rover fuel, cargo preservation, immediate reload and 375px invoice passed |
| QA-46 | Corrupt planetary origins/entity records can replace a mission, and missing legacy subsystem fields retain prior mission state | Validate optional geographic data, surface flags and finite entity/velocity records; restore missing subsystem/disabled-state defaults explicitly; new codec and cross-mission regressions passed |
| QA-47 | Crew assignment changes are lost on refresh and selectors lack accessible station names | Reproduced unassigned Captain exporting the former officer ID; checkpoint each change, label all six selectors, show a disabled deceased current officer until replaced; compiled unassignment exported null immediately |
| QA-48 | Training near a species cap claims the full learning rate instead of the actual gain | Reproduced 249 to 250 reporting +9; display/log actual gain and preview the capped boost; compiled Human/Velox/Thrynn/Elowan cap sessions saved 250, charged 300 each and displayed +1 |
| QA-49 | Thrynn advertises a zero fuel offer, substitutes a one-unit reward, rounds fractional cargo, and removes all copies of a traded relic | Quote using space released by one relic, enforce the exact positive quote and live capacity, remove one copy and preserve fractional fuel; compiled full hold offered/paid 1.5, duplicate-Cone case retained one Cone with total occupied volume 50 and exactly one trade ledger entry |
| QA-50 | Veloxi accepts four units as full payment of nine-unit tribute and reports a false payment | Reproduced fuel 4 becoming 0 while dialogue claimed 9 paid; full-amount guard and visible disabled Yes/required/aboard feedback; compiled 4/9 rejected, 9.05/9 saved 0.05, refusal retained fuel and saved hostile combat state |
| QA-51 | Diplomatic questions, transactions and relationship flags do not checkpoint | Reproduced successful Thrynn trade exporting its pre-trade fuel and relic; checkpoint hail, response, posture, subject and link closure; compiled trade, tribute and all sacred relic accept/refuse results exported their exact new inventory/flags immediately |
| QA-52 | Alien communications mood/posture and tactical group state diverge after tribute, relic surrender or crew hostility | Synchronize both representations and combat activation; compiled Orb/Ellipsoid surrender made the group Friendly and stopped combat, tribute granted Neutral clearance, all refusals and crew-hostility cases saved mood 100/Hostile/combat true |
| QA-53 | A saved pending question at zero seconds never times out; a fixed-step catch-up can resolve the same object more than once | Resolve zero timers and guard each question/business object against repeated handling; Close Link resolves pending business and disconnects; compiled zero-second trade declined once, ordinary question answered No once, both cleared pending state and retained correct inventory |
| QA-54 | Shared overlay caps every dialog at 448 px, squeezing large layouts; communications header hides Close Link on phones and shows stale captain lines | Let children apply their declared widths, wrap response rows, stack the phone header and update/reset current dialogue; compiled comms is 768 px, log/starmap 896 px at desktop, phone controls remain within 375 px with no horizontal overflow; current hail caption is correct |
| QA-55 | Notice read flags and evaluation acknowledgements are not checkpointed immediately | Reproduced Mark Unread exporting read=true; checkpoint both notice readers plus individual/bulk acknowledgement; compiled saved read=false and read evaluation arrays without altering the 47,564 balance |
| QA-56 | Malformed diplomatic records and negative artifact volumes can replace a playable mission | Validate comms posture/mood/history, pending quote/tribute/question fields and nonnegative relic volume; invalid/valid diplomatic codec regressions pass |
| QA-57 | Graphics Quality only changes its selected button; CRT and screen-shake preferences are omitted from mission saves | Reproduced High and Low both rendering 1350x780 with preferences absent from export; quality now selects scene raster density and all choices checkpoint; compiled High 1350x780, Low 675x390, Medium 900x520 retained CSS 900x520, Low/CRT-on/shake-off survived reload; interface text and 60 Hz physics stay independent of scene density |
| QA-58 | Closing communications requests nonexistent aliens/513.mp3 and logs HTTP 404 | Browser reproduced the warning; GitHub connector confirms the only absent numeric recordings in 1-556 are synthesized Mysterions 185-187 and silent interface cue 513; voice engine now completes 513 without fetching, including in a queue; three regressions and compiled link closure with no new warnings passed |
| QA-59 | Missing legacy preferences inherit another mission's choices; invalid volume/settings records can replace a save, and sliders lack accessible labels | Restore explicit defaults even without a settings object, validate optional enum/boolean/0-1 volume fields, label toggles/sliders and stack phone sliders; compiled legacy load after Low/CRT/audio changes restored High, CRT off, shake on, 45/60/80% volumes and effects/banter on; phone 375px panel had no horizontal overflow; codec regressions passed |
| QA-60 | Full-slot replacement depends on a browser-native prompt without an in-game mission review or integrated backup action | Added review/export/cancel/replace dialog. Chrome native checks: all five snapshots unchanged after Escape, Enter safely cancelled, exported text and downloaded file matched E, focus wrapped/restored, 375px layout fit, a concurrent change required renewed review, and only E became a fresh 12,000 M.U. mission; A-D retained exact hashes after reload. Initial in-app input failures were infrastructure evidence, not proof of a game defect |
| QA-61 | Casualty succession chooses every post by Science skill, does not checkpoint and can attribute later messages to a dead officer | Compiled casualty assigned Finn (Engineering 20) despite surviving Cora (180); select by each station skill, checkpoint surviving crew changes and exclude dead speakers. Compiled retest saved Cora as Engineer, preserved it on reload, logged one death/six successions and no subsequent dead-speaker messages; total crew loss displayed correctly with hull 50; ten regressions passed |
| QA-62 | Repair, trade and jettison stock mutations round away fractional minerals | Compiled repair consumed all 0.15 Aluminum for a 0.1 charge. Preserve stock remainders and display two decimal places in manifests. All seven native repair cases retained 0.05, and buying/selling 0.1 changed 0.15 to 0.25 then 0.15 with correct credits; five regressions passed |
| QA-63 | Cargo jettison does not checkpoint and removing one relic can remove every identical copy | Checkpoint all four cargo categories and remove the selected relic index only. Compiled disposal saved fuel 1.05, Copper 0.05, one remaining Cone from two copies, and no specimen without a manual save |
| QA-64 | Gallery controls open behind pause/export overlays, previews inherit old console/zoom/modals, and species scenes select unused hard-coded IDs | Raise the developer panel above the other overlays, clear scene presentation state, use overview zoom and select the actual roster index by species. Native rechecks showed Avery/Bex/Cora/Dara/Echo correctly, visible stellar classes, working pause-to-gallery navigation, and all 115 scenes opened |
| QA-65 | Tactical camera uses base 1280x720 dimensions and a fixed zoom floor, clipping the player on shorter canvases | Fit against the actual visible canvas and initialize encounter framing before its first draw. Nine framing regressions passed; compiled desktop screenshot contains the player/fleet, and 375px phone view contains both ships and firing controls in a 360x406 canvas without horizontal overflow |
| QA-66 | Crystal Planet radiation resets on mission load, permitting reloads to postpone damage thresholds | Serialize live tick/remainder state, validate it, checkpoint each pulse and retain one terminal transition with hull 0. Native saved tick 69/remainder 1.9833 resumed to tick 70/hull 125 with one threshold message; paused exposure stayed exact, Orb protection cleared exposure and kept hull 250, terminal exposure showed incineration. Twelve regressions passed |
| QA-67 | Weapon charges, landing burns and salvage additions round continuous fuel stocks | Compiled laser changed 19.95005 to 19.85. Preserve fuel precision and read live cooldown/position/fuel/projectile state when firing. Native retest: one laser plus one missile saved 19.35005; Mysterions remained immune to both, Gazurtoid to missiles. Double-click consumed one laser shot; one precision regression passed |
| QA-68 | Dated corporate bulletins never arrive after the initial mission setup | Native date 29-10-4620 still had only the opening memo. Release missing catalog notices once their date is reached and checkpoint them; retain read flags and earned milestones. Native retest had all seven IDs and six newly unread entries with unchanged 47,564 balance; day 1 released IDs 1/2 only. Seven scheduling regressions passed |
| QA-69 | Stellar incineration leaves full hull displayed | Native timed Arth flare at 01-01-4621 showed game over with hull 250. Set hull 0 in both timed flare and already-flared system entry paths. Both compiled native retests displayed hull 0 and the incineration outcome |
| QA-70 | Reinforcement counters never produce distress calls or waves | Original quarter-second eligibility/call/arrival rules implemented, with integer arrival odds, all eight callers, retained wrecks, healthy arrivals 15 cells around the current player and a 20-entry lifetime cap. Compiled home call checkpoint, exact pause, reload, non-homeworld wave at entry 20 and 19-20 ship phone/desktop rendering passed |
| QA-71 | Ordinary exploration never starts encounters, and prototype fleets use random galaxy positions | Use the original catalog's 316 modeled encounters and raw orbital slots; add normal flight/orbit contact, two-star-hour tracking and persistent sparse fleet changes. Compiled canonical-0 hyperspace, canonical-7 system and all four homeworld contacts passed; reload did not duplicate the contact; clean B did not inherit E's fleet ledger |
| QA-72 | Casualty surrender is absent and attacks/dialogue can restore hostility | Implement original non-homeworld Spemin/Thrynn/Veloxi casualty rule, persistent surrender, lowered shields, disabled firing and surrender-line precedence. Compiled Thrynn retained surrender after a laser shot, reload, hail and hostile statement. A fresh visit resets conversation flags while retaining casualties, pending calls and entry counts |
| QA-73 | Home fleets skip warning order, offer ordinary business and can fire before their final warning | Use separate saved hail/response/refusal counters, original context flags and final-warning attack/disconnect. Corrected IDs 94/95 to homeworld-only and 394/483 to space, matching recovered STARB.COM context masks. All four home fleets passed; no combat before the final warning, no priority trade interruption, no repeated attack announcement after reload and no ceasefire by hailing after attack |
| QA-74 | Selling one duplicate relic deletes every copy but pays once | Reproduced two Cones becoming zero with one 45,000 payment. Sell by selected inventory index and give each card a unique key. Compiled retest retained one Cone and checkpointed balance 55,000 from 10,000 without a manual save |

Current automated suite: 705 checks. Typecheck and build passed, with all 114
source images preserved by hash. Compiled diplomacy checks exposed the missing
513 recording request (QA-58); the final compiled link-closure check produced
no new errors or warnings after its repair.
Live browser audio subsequently decoded and started captain line 546 (8.0 s,
effects off), then queued Veloxi line 399 (12.0 s, Veloxi effects). These are
real Web Audio playback diagnostics, not a certification of the physical speakers.
In-app browser input later stopped reaching the page. Its input trace recorded
no mouse/key events; no pending JavaScript dialog was reported. Native UI QA
continued in a separate Chrome session. The download event notification timed
out, but the actual .sfsave file was found and its snapshot hash matched the
baseline. Temporary input tracing was removed from the source.
Build emits its existing large-bundle advisory; optimization acceptance remains
separate from correctness coverage.

GitHub connector read-only verification: the voice repository main branch at
`e476b00b15c4738d5f1249087e6081945c50ff6a` contains 552 alien and 972 crew MP3
recordings. No remote files or settings were changed.

Latest compiled checkpoints: E is QA EXPLORER at Bank, 47,564 M.U., after survey
and interest tests; B is a fresh unnamed mission, 12,000 M.U., with clean
defaults. A remains Junior Crew, 12,000 M.U., Ship Configuration in its save.
Dev and production-preview servers remain running locally. A third preview on
4174 is a disposable full-slot QA origin, isolated from original missions. No
publication or GitHub changes were made.

The app update stopped the prior servers/session. Dev 5173 and isolated compiled
preview 4174 were restarted. The restored in-app tab was an error document with
a blocked data: URL. After the user reopened the HTTP game in Edge, live native
QA continued there: main tab 283010067, isolated QA tab 283010074. Original
in-app browser saves were not replaced. Do not claim fresh validation of that
older browser profile from the new Edge session.

Latest evidence includes artifacts/gallery/audit.json and its 115 screenshots,
qa-seven-repairs.json, qa-heat-mid.sfsave, qa-heat-reloaded.sfsave,
qa-three-quest-relics.sfsave, qa-acquisition-victory.sfsave and
qa-weapon-precision-fixed.sfsave. Native Uhlek hail returned no response.
Avoid download/filechooser event waits in the browser connector.

Additional native hazards passed: nebula entry lowered shields, attempts to
raise them inside the haze were rejected, and gas giant descent left orbit,
fuel and hull intact. Both live timed and already-flared entry incineration
paths now display hull 0. Later notices are no longer pending.

The user resolved reinforcement behavior: documented original behavior is
authoritative. COMM-OV CALL-FOR-SHIPS/SHIPS-ARRIVE and the Unity port's
Encounter.DistressCallPass are the source, including all eight eligible callers,
quarter-second passes and a 20-entry lifetime cap. Both implementations use
integer division for arrival odds: one in 16 for one survivor, one in 10 for two.
The caller table includes Interstel police; neither this prototype nor the
referenced shipped encounter catalog contains an authored police encounter.

The 316 encounters of the twelve already modeled races now use the original
catalog's coordinates, locations, raw orbital slots and vessel types. The port's
separate Enterprise easter egg is outside this modeled roster. Normal flight
contacts, two-hour tracking passes and sparse persistent fleet state are wired.
Compiled browser checks passed an Elowan contact at 178,88 with one saved contact
after reload, the Spemin home fleet at raw orbit slot 6 (planet index 0), a saved
Thrynn surrender, and a pending non-homeworld wave ending at exactly 20 entries.
The surrender also survived a laser shot, reload, hail and hostile statement.
All 15 compiled browser scenarios now pass. The report and screenshots are in
artifacts/qa-encounters-report.json, qa-homeworld-final-warning.sfsave,
qa-surrender-after-reload-dialogue.sfsave, qa-single-copy-relic-sale.sfsave,
qa-large-wave-phone.png and qa-encounter-performance.png. No page JavaScript
errors were observed in those isolated sessions. An additional 57,200 ordinary
dialogue selections passed their race/homeworld/surrender context audit.

Latest production bundle: index-KCf-oxGi.js. A large-fleet local headless run
reported 164-165 fps, p95 frame intervals 6.2-6.3 ms, update/draw 0.7-0.8 ms and
14 UI updates/second. These are local measurements, not a claim about every
device or GitHub Pages. The existing large-bundle advisory remains.

Original-rule sources: COMM-OV CALL-FOR-SHIPS / SHIPS-ARRIVE / WE850 and the
Unity port's Encounter.DistressCallPass, UpdateCowardice, FindHomeworldWarning,
SpaceflightController tracking and recovered PHRASECONTRL context masks.
The catalog was transcribed from the user's public starflight-unity-port at
cfaab977c245f9e8846ad1b4159eb4f1f464e8ae. Wrecks intentionally retain turn
slots, matching the original icon turn model; they remain salvageable.

After the Node update the old project path no longer existed. The saved working
copy was found at E:\Code\project-files with the same source changes and QA
artifacts. Current runtime is Node v24.22.1 / npm 11.21.1. Dev port 5173 and
isolated compiled preview port 4174 were restarted there. The shared browser
automation tools are absent from the current chat; a fresh isolated Playwright
Chrome process can test the local app. It uses no personal browser profile or
existing missions. No project files were moved by the agent.

## Feature and artwork completeness follow-up

The preceding pass tested implemented flows; it did not establish roadmap parity
or completion of every requested illustration. The user's follow-up prompted a
separate source, asset and compiled-browser check on 2026-10-22. This check found
open work below. The earlier 705 passing regressions and 15 scenarios remain
historical evidence for their tested behavior, not proof that these omissions
are implemented. The completion statement must not be read as feature complete.

Sources compared:

- This remake's `design/game_design_document.json` and
  `design/asset_manifest.json`, against its actual application paths.
- The local Unity reference's `ROADMAP.md`, especially 6.4 and Phase 8,
  and `Assets/Scripts/Spaceflight/Locations/Encounter.cs`. That roadmap's DONE
  labels apply to the Unity port, not to this browser remake. Later original-code
  findings can supersede earlier design assumptions under the user's fidelity
  rule. Not every roadmap item's implementation has yet been audited here.

| ID | Finding | Evidence and current state |
| --- | --- | --- |
| C-01 | Crew illustrations remain emoji | Open artwork gap. The design requests Human, Android, Thrynn, Elowan and Velox portraits; those five crew portrait IDs are absent from the runtime manifest. `CrewPortrait` in App.tsx:1652 renders platform emoji at :1697. A fresh compiled Personnel session displayed the astronaut emoji and no portrait image. Screenshot: `artifacts/qa-completeness-crew.png`. Alien diplomat portraits are separate and do exist. |
| C-02 | Generated Spemin transport illustration is unused in combat | Open active graphics mismatch. App.tsx:15565 distinguishes Warship from all other Spemin vessels and draws the scout for Transport. The transport PNG exists and decodes. A compiled session containing one Transport drew `alien_ship_spemin_scout.png` 189 times and never drew the transport image. Screenshot and draw instrumentation: `artifacts/qa-completeness-spemin-transport.png`, `qa-completeness-ui.json`. |
| C-03 | Flat Device protection is detected but never applied | Open missing mechanic, source confirmed. `hasFlatDevice` has only its declaration (App.tsx:3714). `advanceLifeform` and the attack handler at :12082 never consume it, despite the artifact description promising 10% attack rates. Reference roadmap 8.28 specifies the original hit-roll change. |
| C-04 | Lifeform recording and automatic survey-data payouts are absent | Open missing mechanic, source confirmed. `recorded` is initialized false but never read or updated by gameplay. `discoveredSpecies` is only initialized/restored/reset/saved, with no discovery update. Docking has no survey-data redemption path. Manual captured-specimen sales do work and are distinct. The remake design promises survey bounties; reference roadmap 6.4 distinguishes recorded data from captured specimens. |
| C-05 | Giving the Crystal Orb to the Veloxi does not reopen its original site | Open story recovery gap, source confirmed. App.tsx:6060 removes the Orb from the hold but does not reset the recovered surface ruin. Surface records persist. Reference roadmap 8.2 and `Encounter.ReturnCrystalOrbToItsSite` reopen the site unless its planet was destroyed. This needs an acquisition, handover, revisit and reload regression. |
| C-06 | Wildlife attacks do not injure crew | Open original-mechanic gap, source confirmed. The attack path at App.tsx:12082 applies effects and removes 2.5 rover fuel, with no crew vitality change. Reference roadmap 6.5 includes injury, durability and treatment. Existing tests of medical treatment and succession do not prove that wildlife can cause those injuries. |
| C-07 | Permanent surface depletion conflicts with the later original-code roadmap | Open fidelity conflict. QA-03 intentionally preserved deposits across orbit departure. Reference roadmap 8.19 supersedes its earlier persistence rule: ordinary minerals, lifeforms and random curios refill when leaving orbit; fixed artifact sites need separate rules. The remake retains the whole surface record across break-orbit. Reconcile lifecycle boundaries without discarding fixed-site/story state or save compatibility. |
| C-08 | Translation applies crew bonuses after taking the square root | Open rule mismatch, source confirmed. `alien.ts:351` takes sqrt(skill), adds race bonuses, then multiplies the sum by 16.7; the reference `Encounter.GetTranslationStrength` adds the applicable bonuses to skill before the integer square root. It also restricts matching-race bonuses differently. The current calculation can reach perfect translation too early. |
| C-09 | Explicit Copy and Reset save-slot actions are absent | Design discrepancy. The remake design's controls promise Switch/Copy/Reset/Resume. Current slots provide Save/Load/Export, with separate import and new-mission replacement. Those support some equivalent workflows, but there are no explicit Copy or Reset actions. Any reset implementation must retain backup/replacement safeguards. |
| C-10 | Artifact purchases and evaluation-time interest do not match the design text | Design discrepancies requiring source reconciliation. Trade Depot artifact cards provide appraisal and sale, with no shop stock to buy. Interest is accrued on launch, not on evaluation resolution. Both are promised by the remake design; do not invent new rules merely to match stale prose when the original sources decide otherwise. |
| C-11 | One preserved image is incorrectly generated but inactive | Inactive asset defect. `assets/images/sun_arth.png` visibly depicts a circular station rather than a sun. It is absent from the runtime asset manifest; the active sun is drawn procedurally and its size fix remains valid. Replace or retire this file only when establishing the final asset inventory. |

Fresh artwork inventory: all 114 PNG files decoded and contained visible pixels;
all literal `assets['...']` lookups resolved to declared runtime keys. There are
101 runtime IDs referring to 93 unique files, plus 21 preserved PNGs outside that
manifest. Fourteen design-manifest IDs have no same-named runtime entry. Those
counts include deliberate procedural replacements, renamed assets and retained
generation candidates; they are not fourteen automatically missing graphics.
The sun file and crew portraits were inspected separately before classifying.

All original assets were visually screened on five new contact sheets:
`artifacts/qa-original-assets-1.png` through `qa-original-assets-5.png`.
Inventory and decode results: `artifacts/qa-completeness-assets.json`.
The two new compiled UI inspections used synthetic imported missions in fresh
isolated Chrome contexts and reported no page JavaScript errors. No application
source, artwork, personal saves or published site was changed in this follow-up.

The four wildlife sprites and the procedural transmission displays are existing
representations, not broken image loads. More species-specific art or alternate
animations require a scoped art inventory before calling them placeholders.
Remaining roadmap items, every animation frame, and all campaign combinations
have not yet been given a complete parity acceptance pass.

## Acceptance boundary

Keep untested rows explicit. Fixture checks do not establish an unaided campaign
playthrough, and a local build does not establish GitHub Pages deployment.
The previously tested flows pass their recorded checks, but the completeness
follow-up above has open gameplay and artwork issues. This game is not yet
accepted as roadmap complete or free of placeholders. Every possible campaign
route and original-game feature has not been exhausted. All changes remain local.


## 2026-10-22 player-experience resolution

The earlier C-01 through C-11 open rows above are historical. Their implemented
fixes and current verification are recorded in [PLAYER_EXPERIENCE_REPORT.md](PLAYER_EXPERIENCE_REPORT.md).
All eleven now have passing checks, with 983 automated checks, 21 native player-experience
checks (19 compiled and two renderer inspections), 15 encounter scenarios,
115 fresh gallery scenes, full voice inventory and a guided campaign victory
that survives reload. No publication occurred. The new Sonilo soundtrack awaits
user-generated audio, hosted 12UI closeout did not run successfully, and the
report explicitly retains broader original-parity boundaries and newly identified
Mechan/question-scheduler follow-up work. This does not claim every original
feature or campaign combination has been exhausted.


## Original communications follow-up, 2026-10-22

The Mechan recognition and question-scheduler follow-up listed above is now implemented.
The current report records 1,061 automated checks, 12 compiled communications
scenarios, 15 encounter regressions and 21 player-experience checks (19 compiled
and two renderer inspections). Hostile dialogue is distinct from combat, original
answer deltas/timers and Mechan recognition/Heaven permission are active, and
legacy homeworld battle state survives import. Mission-slot isolation is verified.
Original recorded texts/IDs and retained original images remain unchanged.
The two user-generated Cosmic Curiosity variations still await audio access;
the music integration and broader original-parity boundaries remain explicit.


## Music playback follow-up, 2026-10-22

The current report records 1,091 automated checks, adding 30 music regressions.
Six native audio scenarios comprise two compiled game checks and four isolated
source harness checks with real AudioContexts/HTMLAudio. One score bed now
handles volume, pause, dialogue ducking, platform mute and scene changes. The
generic remote overlay was retired. Synthetic loop fixtures verify the playback
path; the actual Cosmic Curiosity variations still await audio-file access and
have not been represented as heard or integrated.


## Conversation lifecycle follow-up, 2026-10-22

The current report records 1,133 automated checks, including 120 original-communications checks, and 11 additional compiled lifecycle scenarios. Queued replies, original hail delays and limits, encounter-long lore refusal, ordered lore/transmitter continuation, optional save migration and retained ship-log transcripts are verified. Nomad's terminating 28.64-second recording finishes naturally; explicit close and returning to title cancel playback. A question that provokes combat clears its pending reply. The earlier guided victory still imports and reloads with its ending, treasury, inventory and crew preserved. Homeworld warning and Orb handover regressions use the original delayed handshake. The separate Sonilo soundtrack still awaits actual audio.


## Final player-experience closeout, 2026-10-22T23:35:58.923Z

Current evidence supersedes the earlier pending-music notes: 1,164 automated
assertions, 67 compiled browser scenarios, 11 source renderer/audio checks,
115 gallery scenes, typecheck/build/resource validation and five isolated fresh
commissions (three historical, two additional). Seven new scanner scenarios
verify original readings/consumed analysis, pause and midscan reload, expert
certainty and 390px layout, raw orbit slots/departure, inoperative sensors and
crew-healing clock stability, artifact gates and ship Status. The accepted local
Sonilo score again passed six actual-recording scenarios including its full
natural loop. See PLAYER_EXPERIENCE_REPORT.md and artifacts/player-experience-acceptance.json
for exact scope and limitations. No public deployment.


## Title/port soundtrack correction, 2026-10-22T23:50:24.908Z

The user's reported local entry-point mismatch is fixed. Title and ordinary
Starport/docking now use the accepted local recording; combat/victory/memorial
retain dedicated cues. Two additional compiled scenarios check the actual file
hash, single source, port continuity and pause/resume. All six existing music
scenarios pass again. Totals are 1,166 unit assertions, 69 compiled scenarios
and 11 source harness checks; the earlier gameplay/gallery evidence remains
unchanged. See artifacts/qa-title-port-music-report.json.


## User feedback verification, October 22, 2026

1,170 unit assertions pass. This build reran 37 compiled scenarios and 12 source renderer/audio checks, including seven new feedback cases. Reports qa-feedback-report.json and qa-feedback-motion-report.json measure actual ship sizes, 119/119 adjacent globe changes, desktop/phone pacing, sustained mining audio, no repeated crew requests, volume, pause/movement and controlled visibility. The actual retro replacement passes qa-sonilo-report.json, including a full natural loop. The combined 75 compiled inventory includes 38 prior encounter/communication/lifecycle cases; gallery and campaign evidence are prior. See current PLAYER_EXPERIENCE_REPORT.md section for exact boundaries.


## Final local goal closeout — October 22, 2026 at 9:16 PM

All 77 compiled scenarios, 12 source renderer/audio checks and 115 gallery scenes were refreshed on assets/index-CYCkW77-.js (SHA-256 c3d1e651830b84210baaa74b3ed56f02f3ce62a62a96dfb56387479c31fa68d5). All 1,187 unit assertions, asset/voice checks and both new fresh missions pass. No carried-forward compiled batch remains in this closeout. See artifacts/goal-closeout.json for execution timestamps and hashes, goal-missions-report.json for normal-control play, and PLAYER_EXPERIENCE_REPORT.md for consolidated fixes/assets/limits. This continuation kept all changes local.


## Bay-scale follow-up — October 22, 2026 at 9:51 PM

Two affected compiled launch scenarios rerun with berth-relative hull size, American MANEUVERING text, HUD clearance and natural desktop/phone completion. All 1,187 unit assertions, typecheck, build and resource checks pass. The other 75 compiled scenarios, 12 source harness checks and 115 gallery scenes remain the prior full-pass evidence. See artifacts/bay-scale-followup.json.
