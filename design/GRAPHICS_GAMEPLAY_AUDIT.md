# Graphics and gameplay audit

## First fix batch

| Reported issue | Change | Local verification |
| --- | --- | --- |
| Orbit is available only in the top bar | Added Orbit to the bottom bridge console, including Maneuver; disabled it when no planet is in range | Entered orbit around Planet 1 through the bottom control from Bridge and Maneuver |
| Movement and orbit entry stutter | Moved 36 frequently changing simulation values into synchronous cells; separated canvas frames from interface snapshots; added movement interpolation and pause reset; cached globe projection | Browser checks on development and compiled production builds; regression tests for substeps, interpolation, pauses, and globe-cache reuse |
| Ship grows as large as Planet 1 at 8× | Capped screen length at 18 pixels and 30% of the smallest planetary diameter | At 8×, Planet 1's diameter is 96 pixels and the ship length is 18; checked size bounds across five zoom levels and five planet sizes |
| Oversized magenta engine trail | Kept particle dimensions, nozzle offset, and drift independent of system zoom; shortened particle lifetime and reduced opacity/glow | Thrust in both directions with a Class 4 engine at 8×; cloud absent in captured production views |
| Sun changes size as it animates | Fixed the disc and corona extents; animate coronal light, ray opacity, and rotation instead | Radius invariance tests at six times for both stable and unstable stars; inspected the system view |

Orbit-entry testing also found that its autosave captured the previous location.
The entry checkpoint now explicitly stores the orbital location and planet index.
The compiled build was reloaded after entry and resumed in orbit successfully.

## Measurement scope

All measurements are from this machine's in-app browser. The source baseline
and the updated build ran locally; no Playground editor session or live GitHub
deployment was available for comparison. Existing cartoons and voice URLs are
preserved. A full campaign playthrough and broader hardware testing remain open.

Representative one-second samples before the fixes:

- Development system view: 72 FPS, 24.3 ms frame p95, 53 interface renders/s.
- Original compiled system view: 136 FPS, 12.1 ms frame p95, 58 interface renders/s.
- Original compiled orbit view: 88 FPS, 12.2 ms frame p95, 60 interface renders/s.

The updated compiled system view sampled 123–127 FPS, approximately 12.2 ms
frame p95, and zero interface renders/s while idle. A sample covering a brief
maneuver showed nine interface renders/s; continuous snapshots are capped at 15.
These samples describe observed runs, not a controlled cross-device benchmark.
The final compiled orbit sample measured 157 FPS, 6.2 ms frame p95, 0.5 ms
simulation/drawing time, and zero interface renders/s while idle, compared with
the original orbit sample's 88 FPS and 60 interface renders/s. The completed
automated run passed 271 checks, type checking, build, and asset verification.

## Reproduce

1. Run `npm run dev` and open `http://127.0.0.1:5173/?perf`.
2. Use a separate mission slot for diagnostics. Ctrl+Shift+D opens the original
   developer panel; its teleportation controls can place the ship in a system
   or orbit. Developer tools may mark that slot as a development mission.
3. Compare 0.65× overview and 8× zoom, move using Maneuver, and approach a planet.
4. Use the bottom Orbit control. Check the half-second entry transition,
   stationary and moving orbit views, and saving/reloading the orbital location.
5. Repeat with `npm run build` and
   `npm run preview -- --base /starflight-junior-crew/` at
   `http://127.0.0.1:4173/starflight-junior-crew/?perf`.

The isolated browser fixture uses Slot E and the ship name RENDER TEST. Slot A
was preserved. Screenshots, the fixture, and the original source copy are under
the ignored `artifacts/` directory; they are not included in the deployed build.

## Art tools

Use the existing images and `asset_manifest.json` prompts as the visual reference
for future artwork. The built-in image generator is available for 2D assets.
Blender is installed locally and can support consistent renders of modeled
ships and animated objects. Meshy produces 3D models, while Nano Banana provides
image generation and editing; neither has a direct tool connection configured
in this chat. No new external art service or generated asset was used in this batch.
