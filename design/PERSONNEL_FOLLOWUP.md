# Personnel, bridge logs and atmosphere follow-up

Local Personnel and presentation follow-up: multi-category atomic training, science-fiction name generation, faster reliable idle dance, recorded assignment acknowledgements, shared bridge-log filters/search and visible planetary atmospheres.

Current build: `assets/index-Bn8PWQq6.js`, SHA-256 `18e5275a4ff9cebca2064673b1f2349a82aceea6091043630280446ce6382d06`. Save your current mission, then refresh http://127.0.0.1:4174/starflight-junior-crew/ to load it. Existing saves need no conversion or new mission.

## Delivered changes

| Request | Result |
|---|---|
| Train several categories together | Check any combination of Science, Navigation, Engineering, Communications and Medicine, review the total and choose **Train selected**. Each remains 300 M.U.; original learning rates and species caps are preserved. The roster, balance, ledger and save update as one purchase. Empty, unaffordable, capped, deceased and Android cases are guarded; repeated-click purchase is prevented. |
| Restore starport dance | The original ten-frame animation now starts after eight idle seconds. Walking stops it; pause freezes it; unrelated keys leave its countdown intact. Before changes, a 24-second native run confirmed the old 20-second dance still worked. |
| Generate crew names | **Generate name** offers Star Trek, Star Wars, The Expanse or Any series. Names stay within the original 14-character limit, avoid current roster names case-insensitively and remain editable before enlistment. A bounded suffix fallback handles pool exhaustion. Existing names and portraits are preserved. |
| Crew-assignment voiceovers | Selecting a living officer now plays an exact existing recording for that species, with the newly assigned officer shown as speaker. Clearing a post stays quiet. Existing voice volume, banter and serious-scene rules remain active. |
| Sidebar communications/bridge filters | Category selection for All messages, Bridge updates, Alerts and Crew banter, plus literal text/speaker/post search, matching count and Reset. Sidebar and Full Log share state. Legacy entries without a type count as bridge updates. Empty results are explained; no log records are deleted or rewritten. |
| Visible atmospheric planets | The outer atmospheric glow was being cut off by the same circular clip used for the planet. It now draws after that clip is restored. Stronger, composition-tinted rims keep a minimum visible thickness at system zoom; clouds remain clipped to the globe and shaded by its existing day/night lighting. Airless worlds remain airless. |

The Tailwind configuration also omitted the components directory. Native screenshot review caught unstyled new controls, so components are now scanned explicitly. Explicit accessible filter labels and tighter training-dialog spacing prevent ambiguous controls and a clipped desktop purchase footer. Existing painted art remains in place; no replacement media was created or retired.

## Verification and actual gameplay

**3,932 unit assertions passed**, including 1,405 new checks across all category subsets/species, exact cost and cap boundaries, invalid balances, roster/name collisions, RNG boundaries, exhausted name pools, exact recorded-line membership, dance frames/input and literal/category log filtering. Typecheck, production build and bundled-resource checks passed.

**64 compiled native Chrome scenarios passed on this bundle:** 15 targeted personnel/voice/filter/atmosphere cases, one fresh personnel gameplay session, 15 crew regressions, 12 Science workspace cases, 15 flight cases and six navigation/save adversarial cases. Each report binds its cases to the bundle hash. Cases include desktop and 390-pixel controls, multi-category public save/reload, exact funds and rapid double-click, insufficient funds/cancellation, capped/deceased/Android officers, persistent portraits and assignments, all five real remote recordings, shared filters/search/reset, native atmosphere draws outside the clip, scan gates, maps, Leave Orbit and rapid starmap hovering.

A new isolated commission started through **Start New Mission**, with no imported starting fixture or developer state changes. It enlisted three officers using the three name sources, trained the selected officer in three categories for 900 M.U., assigned a captain and exported its earned public save. It retained three living officers, 11,100 M.U. and developer mode off. Its native video was decoded successfully: 5.0 seconds, 1440×1000. This is a focused personnel play session; the earlier two complete flight voyages remain historical.

Actual assignment recording hashes and durations are in `qa-personnel.json`. All five were fetched, decoded and started with positive voice gain while the browser's physical sound output was muted. This establishes technical playback, not a listening verdict. Banter-off and vacant-post cases made no crew recording request.

Preservation checks retain all **113 original images, 556 alien dialogue entries, 980 crew lines and 3,672 approved ship configurations**. Both source and shipped images match their hashes. Armor coverage, terrain generation, mission rules and save schema remain intact. The previous acceptance chain was verified and archived before edits. Failed/intermediate evidence remains under `pre-style-fix` and `pre-compact-dialog`; those runs are not counted as final passes.

## Evidence and limits

- [Current integration manifest](../artifacts/personnel-followup/integration.json)
- [Native functional cases](../artifacts/personnel-followup/qa-personnel.json)
- [Fresh personnel gameplay](../artifacts/personnel-followup/fresh-personnel.json)
- [Asset preservation](../artifacts/personnel-followup/resource-verification.json)

- 64 scoped compiled native Chrome scenarios and 3932 unit assertions passed on the current bundle. The previous 100-scenario pass and two full flight voyages remain archived historical evidence.
- The new actual gameplay session starts at Start New Mission and recruits, trains and assigns three officers through ordinary controls. It is a starport personnel session, not another flight voyage or campaign victory.
- Assignment recordings are the existing five species-specific crew lines. Actual fetch, decode and positive-gain playback were verified with physical output muted. Artistic listening was not performed. Voices volume, banter controls and existing serious-scene suppression are respected; the original remote recording service remains required.
- The idle dance was reproduced before changes after 20 seconds; this follow-up changes its delay to eight seconds and prevents unrelated key presses resetting it. Existing dance artwork is retained.
- Atmospheric visuals use actual density, weather and composition. Airless planets gain no fake atmosphere. The rim now renders outside the planet clip, with zoom-aware minimum thickness; cloud movement and original terrain remain intact.
- Existing game artwork and styling were retained. 12UI skill guidance was consulted; no new hosted design, target conversion, comparison or pixel-perfect certification is claimed.
- All changes remain local. No new generated media, paid service calls, Blender work, commits, pushes or publishing. Personal browser saves were untouched.
