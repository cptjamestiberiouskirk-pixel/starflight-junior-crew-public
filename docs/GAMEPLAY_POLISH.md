# Gameplay presentation improvements — October 28–29, 2026

This source revision improves presentation while retaining the existing
simulation, equipment prices and capabilities, mission progression, hull and
recorded voices. It introduces no save schema or migration.

- Navigation focus adds a planet reticle and an off-screen direction pointer.
  Screen-space labels avoid earlier labels, controls, celestial bodies and the
  player ship. Planet coordinates, approach ranges and ship scale stay intact.
- Optional crew guidance follows current conditions, available officers and
  received bulletins without exposing undiscovered campaign destinations.
- Surface contacts have darker footing, selected deposits have a contrasting
  outline, and the rover has a contact shadow. A light terrain veil improves
  foreground contrast without replacing terrain or changing contact ranges.
- Upgrade comparisons show the existing table values for the installed and next
  class, mass, cost and armor coverage. Purchase handlers remain unchanged.
- Crew transmission subtitles follow the existing playback hash and use the
  speaker's established portrait with restrained motion. Reduced-motion settings
  suppress that animation. Alien subtitle text has a larger, contrasting panel.
- The existing stardate/hour is labeled **Expedition clock** in the main HUD,
  including a dedicated row on narrow screens and a readout in live alien
  transmissions. Autosave notifications no longer cover it on narrow screens.
  Time simulation, calendar rules and saved date fields remain unchanged.
- Production supports lossless ship-image derivatives, loaded on demand through
  the existing bounded image cache. All 3,672 masters remain in the source library.
- Science Analysis and Ship status use distinct contextual instruments instead
  of repeating the planet or ship portrait. Unknown analysis stays hidden, and
  shield/sensor/fuel diagrams follow existing equipment states. Short-screen card
  grids scroll so the illustrations remain readable.
- Import/export save-code fields disable wrapping and spelling assistance to
  reduce stalls with multi-megabyte payloads. Full save text, decoded size limits,
  validation, slot storage and export behavior remain unchanged.

The verified optimized library contains 3,671 WebP images and one original PNG.
Its size is 1,005,389,624 bytes compared with 1,550,595,355 original bytes: a
545,205,731-byte reduction (35.16%). All decoded RGBA pixels, including transparent
pixels, were compared before selecting each derivative. This reduces distribution
and image transfer size; it does not reduce a source clone containing the masters.
See [Development](DEVELOPMENT.md) for the reproducible optimized build commands.

The stylesheet now explicitly includes the extracted GameInterface.tsx in
Tailwind's source scan, restoring its responsive utility classes.

Validation uses unit regressions, resource checks and physically muted browsers
with fictional fixtures and disposable storage. Screenshots and detailed local
receipts are kept under the ignored artifacts/gameplay-polish-20261028/ directory.
The initial polish checks passed 10,801 assertions across 35 suites, six image-cache checks,
87 native save cases and the production browser/layout/resource checks.
The [October 29 verification](VERIFICATION_2026-10-29.md) covers the labeled clock
and current source update. The rebuilt private Windows tester now includes these
changes. The later Science/save-editor revision passed 10,833 assertions across
36 suites, the full 87-case adversarial save run and focused large-code boundary
checks. See the [latest source/package verification](VERIFICATION_2026-10-29-REGRESSION.md).
