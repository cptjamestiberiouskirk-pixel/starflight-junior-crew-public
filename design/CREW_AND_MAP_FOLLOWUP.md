# Crew diversity, maps and navigation follow-up

Completed locally on 23 October 2026. Production entry: `assets/index-D_l_pyQ4.js`. SHA-256: `937ceb0c29497044e0b2b08fa63d2cef34e2a96f28519da653392bde4dc9bc70`.

**2,137 unit assertions and 47 compiled Chrome browser scenarios passed**, with typecheck, production build, full resource hashes and original corpus preservation checks. The 44 earlier scenario types use isolated synthetic fixtures; three new rover checks restore an earned gameplay checkpoint. Two additional actual fresh missions used empty isolated profiles and ordinary controls; see [fresh gameplay results](FRESH_GAMEPLAY_FOLLOWUP.md). No user save was edited, and no commit, push or publication occurred.

## Issues and fixes

| Issue | Result |
| --- | --- |
| Every new recruit of a race reused one face | Ten new illustrated identities per race, plus each retained original: **11 portraits per race / 55 total**. Recruitment uses every unused face before balanced reuse. All roster entries, including reserves and memorial records, reserve their image. Released faces can be reused. |
| Appearance could change on restore | Optional `CrewMember.portraitId` persists once assigned. Legacy rosters migrate deterministically; the first legacy member of each race retains the original face. Names, skills, durability, voices and assignments remain unchanged. Existing explicit portrait choices remain fixed. |
| Night-side ship became transparent | Illumination now changes brightness with material alpha fixed at 1. Planet occlusion remains. **2885 actual configured-hull draws across 21 seconds** had alpha 1 throughout, with 29 distinct lighting states. |
| Science details fell below the viewport | The bridge console has a bounded, keyboard-focusable scrolling region and stable scrollbar space. A **Survey map & contacts** button jumps to the new map and contact controls. The approved Science/survey layout was already integrated; its lower portion was unreachable. |
| Landing map clipped at the bottom | One 2:1 rectangle fits both viewport dimensions and is shared by drawing and pointer conversion. Fractional CSS dimensions are converted to the rounded drawing viewport. Desktop, short laptop and phone pointers passed within one rendered pixel plus integer-degree quantization. |
| Phone opening Landing hid the map above the viewport | Location changes reset inherited scroll positions. This additional fault was found during adversarial testing. |
| Numbers on mineral symbols were unclear | Group labels now say **4 minerals**, **2 lifeforms**, etc.; the legend explains the count and dashed uncertainty halo. These are counts of grouped known sites, not mineral grades or amounts. |
| Contacts lined up in latitude rows | New orbital sampling uses repeatable, planet-specific stratified jitter instead of fixed latitude rows. Surface objects retain real IDs and coordinates. Old discoveries stay where they were recorded; a rescan adds the new sample regions without deleting old findings. |
| Topo dialog and global findings clipped | The topo dialog scrolls within the viewport, keeps the local projection's aspect ratio and initially exposes the planetwide survey. Local and global maps are explicitly distinguished; unobserved areas remain unknown. Navigation marks draw above contacts. |
| Phone rover controls squeezed beside the steering pad | Actual gameplay exposed 23 px-wide buttons. Action, cargo and weapon grids now occupy a full row on phones with 44 px minimum button height; earned-checkpoint checks at 320, 390 and 768 px passed. |
| Selected rover destination disappeared after reload | Optional saved `roverWaypoint` restores the actual destination. Its coordinates and remaining distance are visible. Arrival/manual steering retain the original cancellation behavior. |
| Leaving orbit was hidden behind Navigation → Maneuver | A direct **Leave Orbit** button invokes the existing departure logic. The transition save explicitly records Star System, cleared orbit index and resulting position; public reloads from Bridge, Science and Navigation passed with unchanged fuel. |
| Starmap jumped when hover telemetry changed height | The chart keeps its 250:220 aspect ratio, and telemetry occupies a fixed bounded area. Fifty rapid star hovers on each desktop/phone run produced **zero layout shift**. Star ID zero is handled as a valid selected target. |

## Armor confirmation

No armor artwork was replaced. Independent counts of the approved tactical coverage masks measured **20.0%, 40.0%, 60.0%, 80.0% and 100.0%**, respectively: 34,912 / 69,824 / 104,736 / 139,648 / 174,560 of 174,560 eligible hull-skin pixels. Coverage is cumulative and distributed across tactical regions rather than straight strips. Functional openings and separately mounted hardware remain outside eligible hull skin. All 3,672 full configuration images, approved bay models, weapon/armor textures and original artwork passed source/dist hashes.

## Created and retained assets

- Created **50 WebP expression atlases**, 3,972,406 bytes total, in `assets/crew/`; five original generated PNG sheets are retained under `artifacts/crew-diversity/source-sheets/`. A contact sheet and per-file hashes are retained.
- Each new face has ready, real closed-eye blink, alert and injured frames. The two reserved speech cells repeat ready; there is no new lip-sync feature. Existing memorial treatment and reduced-motion behavior remain.
- Added portrait allocation/migration and shared map/lighting utilities, two unit suites, native test drivers and provenance records. No original image or recording was deleted or retired.
- Kept the original name/species recruitment flow. Portrait appearances vary without adding a male/female selector or linking appearance to gameplay or voice selection.

## Verification

| Batch | Passed on this bundle |
| --- | ---: |
| Unit assertions: original rules, saves, ship/bay rendering, surface, communications, music and voices, plus new portrait/map adversarial cases | 2,137 |
| Crew recruitment, eleven unique faces for each race, all 50 atlas decodes, expression states, legacy migration, training/assignment/deletion, full roster and phone | 15 compiled |
| Full-orbit opacity, landing fit/input, rapid hover, direct orbit departure/reload, topo waypoint public reload and corrupt import preservation | 13 compiled |
| Science scroll, keyboard, wheel, filters and landing controls at 2560×1080, 1440×900, 1280×720, 1024×600 and 390×844 | 5 compiled |
| Configured diagnostics, zero/expert/lower skill Science, missing officer/broken sensors, living worlds, artifact ruins, shared landing/topo contacts and phone reload | 11 compiled |
| Earned mission B checkpoint: rover action/menu touch sizes and topo at 320, 390 and 768 px | 3 compiled |
| Typecheck, production build, source/dist hashes, corpus integrity and acceptance manifest chain | Passed |

Adversarial cases include 25 same-race personnel exhausting the eleven-face pool, invalid/cross-race portrait IDs, malformed waypoint data, unchanged existing storage after rejected imports, tiny/invalid map bounds, 1,000 grouped contacts, longitude seams, low science uncertainty, absent officers, failed hardware and persistent saved findings. Test development failures are retained in `initial-native-attempt.json`, `second-native-attempt.json`, `third-native-attempt.json`, `first-qa-map-navigation.json`, `second-qa-map-navigation.json` and the pre-fix clipping capture. They include test selector/CSS-unit/logger mistakes, and the real inherited phone-scroll bug. The final results supersede these attempts.

## Evidence and boundaries

Current reports: `artifacts/crew-diversity/integration.json`, `final-verification.json`, `qa-crew-diversity.json`, `qa-map-navigation.json`, `qa-sensor-scroll.json`, `science-regression/qa-science-maps.json`, `armor-coverage-verification.json` and `final-integrity.json`. Previous Science/map sources and reports were verified before edits and archived under `artifacts/crew-diversity/baseline/`.

There are eleven faces per race; a roster with more than eleven members of one race necessarily repeats faces, evenly. Existing explicitly assigned portrait IDs are preserved rather than silently changing a saved character's face. New sampling/contact localization remains a documented remake extension; the original environmental analysis and officer-skill rules remain. Old row-pattern findings remain accurate saved history until supplemented by rescanning. Native tests used isolated desktop Chrome profiles, not physical mobile hardware or a manual GOG session. Two new independently commissioned voyages are documented in FRESH_GAMEPLAY_FOLLOWUP.md and bring recorded fresh missions to eleven. Those full voyages ran on the archived pre-responsive bundle; the final four-line responsive change was separately verified with the earned B save and all 47 browser cases. No new guided victory, full gallery pass, musical listening judgment or human visual approval is claimed. Those older results remain historical.
