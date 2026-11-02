# Crew names and portrait matching

Personnel → **Create** offers five categories: Star Trek, Star Wars, The Expanse,
Starflight 1 and Starflight 2. **Any series** mixes those categories.

- **Existing names** selects an unused character name or established short form
  from the selected list, without inventing a new canonical identity. If all
  matching names are used, Generate is disabled and explains the alternatives.
- **Generate unique names** makes new combinations inspired by the category and
  selected species. Human names use given names and surnames, Velox names use
  insectoid patterns, Thrynn names use sibilant patterns, Elowan names use softer
  patterns, and Androids receive model-style designations. These are authored
  naming conventions for this game, not assertions about official alien languages
  or the other franchises' biology. Generated names avoid the current roster,
  current draft and existing-name catalogues; uniqueness is within those lists,
  not a claim that a spelling has never appeared anywhere else in fiction.

Each source has its own human given-name vocabulary as well as surnames and alien
syllables. Explicit preferred styles affect every species' generated spelling.
Android masculine/feminine options use an authored nickname with the source's
model designation; neutral uses a model designation alone. Velox and Thrynn use
different authored endings for the selected style while retaining neutral portrait
classification. These are creative naming preferences, not alien biological rules.
Choose the source, species and style, then press **Generate name**; changing an
option alone preserves the current draft rather than renaming a typed recruit.

Names retain the existing 14-character limit. Generation is local and requires
no online service or credits. Recruitment limits, costs, species skills, recorded
voices, missions and save format are unchanged.

## Portraits

The recruit preview shows the exact existing portrait that will be saved on
enlistment. Automatic matching uses known fictional character presentation or
the generated name's authored style. **Preferred style** filters new generation;
a known character's style takes priority if the draft name is edited manually.
For a custom name without catalogued information, the player can choose a style.
The game does not infer a person's gender from arbitrary typed names.

Masculine/feminine tags describe presentation in the fictional Human, Elowan and
Android artwork. Unclassified alien designs remain neutral. Neutral names can
use any portrait; where a requested presentation has no artwork, existing neutral
art is retained. These are visual pairing preferences, not biological traits or
gameplay statistics. Existing saved crew portraits are never reshuffled or
reclassified during load. No artwork or voice recording was regenerated.

The larger recruit dialog uses the full game overlay rather than being clipped
by the Personnel panel. It scrolls on compact screens, keeping every field and
the enlist/cancel actions reachable.

## Original Starflight references

The Starflight 1 list uses the original [technical reference manual](https://www.mocagh.org/ea/starflight-alt-manual.pdf)
and [EA cluebook](https://mocagh.org/ea/starflight-cluebook.pdf). The cluebook's
named crew includes Max Zarfleen, McGuin, Vok Phenocti, Pushti Vetufixi, Falerion
and Bethamial. The shorter documented form **Vetufixi** fits the original name
limit. The manual supplies the other briefing participants and the Thrynn
captain's surname, **Thyrrthynnn**. That captain is explicitly described as female;
unspecified identities stay neutral. The cluebook itself cautions against imposing
human gender pronouns on Elowan, so those canonical names have neutral metadata.

The Starflight 2 list uses its [EA cluebook](https://www.mocagh.org/ea/starflight2-cluebook.pdf)
([alternate scan](https://www.starflt.com/sf2cluebook.pdf)) and
[technical reference manual](https://www.mocagh.org/ea/starflight2-manual.pdf).
The cluebook introduces Phloon de Lux, Slim, Ptexok, Rrexolixi and Cionia; the
manual's Star Reports name Nix Killjoy and Xenopotex. Unknown presentation or
species information is not filled in by guessing. Existing-name mode borrows
names as references and does not change the player's selected species.

The existing three franchise lists are retained. New spelling patterns are
explicitly inspired creations, separate from those documented names.

## Verification

Local results and rendered screenshots are retained under
`artifacts/crew-names-20261101/` and `artifacts/concourse-dance-20261101/`.
The source/style correction and deterministic browser comparisons are retained in
`artifacts/full-playthrough-20261101/`.
Source assertions cover every category/species/mode/style, duplicates, exhausted
lists, invalid RNG/enum input, length limits, matching portrait selection and
unchanged saved appearances. Native browser checks use physically muted disposable
profiles; owner profiles and saves are not accessed.
