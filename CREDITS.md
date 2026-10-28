# Credits and asset provenance

**Project direction and maintenance:** cptjamestiberiouskirk-pixel.

An independent fan remake inspired by the 1986 *Starflight*, continued from a
Google Playground export. The established hull, original-style rules, authored
galaxy/dialogue material, campaign and existing recordings were retained through
the recent presentation and usability work.

This records provenance, not ownership of third-party works or proof of
redistribution permission. See [licensing status](LICENSE.md).

## Content and creative tools

| Material | Recorded provenance / location |
| --- | --- |
| Original-game foundations | 1986 Starflight; retained world, encounter and dialogue context also trace through the maintainer's Unity-port work. Junior Crew adds documented presentation/usability adaptations. |
| Cartoon scenes and original hull | Preserved export artwork in assets/images and atlas sources in assets/source-images; [asset descriptions](design/asset_manifest.json). Original rights and generation-account terms need confirmation before broader redistribution. |
| Diverse crew portraits | Approved animated atlas library in assets/crew; original atlases preserved. |
| Configured ship artwork | 3,672 whole-ship images in assets/ships, with invariant original hull and fitted equipment. Historical geometry/render work used Blender; no further Blender work is authorized. [Configuration record](design/SHIP_CONFIGURATION_COMPLETION.md). |
| Painted hangar and bay | Approved retained models/textures in assets/models and runtime renderers in utils; installed equipment remains visible. |
| Terrain/map materials | Meshy CLI-created atlas derivatives in assets/ui/terrain; runtime terrain relief, contacts and waypoints. |
| Illustrated Science | Approved 12UI-assisted layouts/cutouts plus actual materials, planets and ship imagery; assets/ui/science. |
| Exploration soundtrack | Neon Starfield Voyage, generated through Sonilo and retained in assets/music. Lower Deck Voyage is retired from exploration and retained for provenance. [Music review](design/SONILO_MUSIC_REVIEW.md). |
| Bay/mining effects | Mirelo-generated recordings in assets/audio plus retained/procedural effects. Mining uses an original industrial effect, not copied EVE Online audio. |
| Crew and alien voices | Existing ElevenLabs recordings served from [starflight-dispatch-voices](https://github.com/cptjamestiberiouskirk-pixel/starflight-dispatch-voices). Text, IDs, casting and hashes retained. [Dialogue inventory](design/DIALOGUE_ROADMAP.md). |
| Development and documentation | Maintainer-directed, AI-assisted implementation, tests and writing; source history records the work. |

Tool names describe production methods, not endorsements or blanket licenses.
No new paid asset generation was used for these docs. [Documentation screenshots](docs/screenshots/README.md)
are actual game captures from disposable fictional QA missions, not concept art
or personal owner saves.

## Software and fonts

| Component | License / credit |
| --- | --- |
| React / React DOM | MIT; Meta Platforms and contributors |
| Three.js | MIT; Three.js authors |
| Lucide icons | ISC; Lucide contributors; Feather-derived icons retain their MIT notice |
| Tailwind CSS | MIT; Tailwind Labs and contributors |
| Rajdhani, Orbitron, Chakra Petch | SIL Open Font License 1.1; respective bundled Fontsource package notices |
| Portable Node.js | Node.js/OpenJS Foundation and bundled third-party components; complete runtime license retained |

Complete notices ship in the build's licenses folder and the portable package's
runtime/NODE-LICENSE.txt. See [third-party notices](THIRD_PARTY_NOTICES.md) for the
retained export inventory. Build tools keep their installed package licenses.

## References and affiliations

Starflight, Star Trek, Star Wars, The Expanse and other referenced titles,
characters and marks belong to their respective rights holders. Name pools and
comedic tone are fan references, not an official franchise product. Credits do
not replace permission: a public-release review must consider references as well
as code, data, images, recordings and music.
