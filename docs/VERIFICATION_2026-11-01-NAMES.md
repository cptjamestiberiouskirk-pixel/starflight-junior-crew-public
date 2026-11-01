# November 1 dance, names and portrait verification

The accepted game entry is `assets/index-Co6Evlxn.js`, SHA-256
`d81299b7dea8aa93b2fa92f49f2bc5644b067fc1fb262d543a48f7d3c0aa57af`.

The change fixes clipped starport dance poses without editing the image, adds
Starflight 1 and Starflight 2 name sources, and gives every source existing-name
and species-aware unique-name modes. Recruit previews match known or selected
name styles where the existing artwork supports them. Undefined identities stay
neutral. See [crew names](CREW_NAMES.md) for provenance and limitations.

Source acceptance passed 62,809 assertions, including 12,512 name checks, type
checking, production build, resource integrity and security regressions. The exact
build passed 46 native Playwright cases: 21 name/portrait cases, 14 dance cases
and 11 crew-assignment regressions. These include 50 category/mode/species
combinations, canonical-list exhaustion, bounded collision handling, portrait
preview/enlist/save/reload and compact layout. The recruit modal now uses the full
game overlay so its controls are not clipped by the Personnel card.

No new save fields or remapping of saved portrait identities were introduced.
Artwork, recorded voices, ship configuration and progression rules are unchanged.
Tests use physically muted disposable browser profiles and fictional missions;
owner saves and browser profiles are not accessed.

The private Windows archive is
`Starflight-Junior-Crew-Windows-x64-20261101-dance-names-tested.zip`,
1,113,017,407 bytes and 3,927 files, SHA-256
`06bddd78ce75dcc82ebc87f3748bbdc7406093b5c982e305cd54e6b187df16bd`.
All archive CRCs and extracted manifest hashes passed. It retains the previous
Node 24.22.1 runtime and fixed port 4188; no installer or save migration is needed
for this change. Continue with the same browser profile and address.

The Windows ZIP and raw evidence remain private and are excluded from both
repositories. This is development-PC acceptance; independent clean-machine
Windows acceptance, human audio review and a new complete packaged campaign
playthrough are not established by these targeted tests.

Final extracted-package acceptance: native launcher 7/7, native browser 6/6,
import size boundaries 3/3 and targeted names/dance/crew cases 46/46 passed.
The same-origin upgrade checks passed 7/7, including continuation without re-import
and preserved crew, equipment, credits and mission data. The previous private
ZIP remains unchanged. All these sessions were muted and disposable.
