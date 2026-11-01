# Unique crew assignments

November 1, 2026. Implemented after completion of the separate [second deep testing pass](VERIFICATION_2026-11-01-SECOND-PASS.md), as requested.

Each officer can hold one bridge role. The assignment controls disable officers already serving elsewhere, explain their current role, and reject an invalid selection even if the disabled option is bypassed. Vacate a role before moving its officer. Launch requires six different living officers; certification and departure clearance use the same distinct-officer count.

Assignments remain editable in **Pause > Crew Assignments** during a mission. Casualty succession considers only living officers without another assignment. If none is available, that role stays vacant; other officers keep their own duties. Short-handed missions can continue, while Starport launch still requires all six roles.

The save format is unchanged. Older duplicate assignments are accepted on import and restore. Loading retains the first role for each officer, displays repeated roles as vacant, and opens a paused review. Both ordinary and queued checkpoint writes are inhibited during review. The player can confirm and save the reviewed assignments or cancel to the title without saving. No crew, equipment, location or campaign progress is reset.

The shared assignment form reuses the existing crew cards and portraits. Existing recordings and audio defaults are retained; all native tests use physically muted disposable browsers and do not attach to the owner's browser profile or saves.

Verification evidence and final results are recorded in `artifacts/crew-assignments-20261101/verification.json` and `REPORT.md`. The source and private local preview are the delivery targets for this change; the private Windows tester ZIP and both GitHub repositories are separate releases.

## Observed results

- **50,229 source assertions pass**, including 34,939 crew-assignment assertions covering 4,096 assignment maps and every role's casualty, occupied-officer, spare, vacancy and certification cases.
- **55 compiled-game Playwright cases pass:** 11 crew cases, 13 deep feature cases, 15 player/Science/clock cases, 10 campaign failure cases and six launch/pause cases. The crew cases include disabled-option bypass, swaps, save/reload, duplicate legacy imports, cancel without saving, a one-person legacy mission, in-flight reassignment, denied departure and compact controls.
- The prior campaign's **unedited earned pre-arm checkpoint** completes victory, save and reload on this build, with six living officers and the same six distinct assignments. The prior economic grind and earlier story stages are provenance, not rerun on this revision.
- Typecheck, production build, dependency mitigation (68 checks), source-size bounds (186 files), and private server limits (14 checks) pass. An unchanged security repeat passed after a child-startup timeout during browser load; the original log is retained. No upstream advisory resolution is claimed.
- Desktop and compact crew-panel screenshots were inspected. Muted native browser tests check playback behavior elsewhere in the regression suite; they do not establish human listening or physical-device acceptance.

Tested entry: `assets/index-UbzWuYtI.js`; SHA-256 `cb83ec7729418f29f3bce8b57eab8a0329e49a0a8cf02435f0ee2a745020d9cd`. A repeated build produces the same hash. Delivery retains all 3,940 non-index files from the previous private preview, including the old bundles required by already-open tabs. Coverage is finite and does not prove every possible game state.
