# Development and build instructions

For playing, use the [Windows tester](../WINDOWS_TESTING.md) or
[Player Guide](../PLAYER_GUIDE.md). This page is for contributors and maintainers.

## Source setup

Install Node.js 24 and Git. Personal source use is governed by
[LICENSE.md](../LICENSE.md); public access does not grant unrestricted reuse.

~~~sh
git clone https://github.com/cptjamestiberiouskirk-pixel/starflight-junior-crew-public.git
cd starflight-junior-crew-public
npm ci
npm run dev
~~~

Open http://127.0.0.1:5173/ and keep the server running. Ctrl+C stops it.
Windows developers should stop their own dev/preview servers before reinstalling
dependencies to avoid locking native build files. Never terminate another app's
process merely to free a port. The asset library makes a clone substantially
larger than a typical source-only JavaScript project.

## Validate and preview

~~~sh
npm run typecheck
npm run check:security
npm test
npm run build
npm run check:build
npm run preview
~~~

The preview address is http://127.0.0.1:4173/. Modules need HTTP; opening
dist/index.html directly as a file is unsupported. Relative build URLs support
subdirectory hosting. For a repository-style preview:

~~~sh
npm run preview -- --base /starflight-junior-crew/
~~~

Open http://127.0.0.1:4173/starflight-junior-crew/ with its final slash.
Different ports have separate save storage. Use exported backups for transfers.

Tests write ignored artifacts/ output. Unit audio/canvas cases use mocks and
do not prove physical output. Browser checks use muted disposable profiles and
fictional QA fixtures. Preserve owner saves, production volumes and prior evidence.
Do not present an old campaign result as a fresh test of a different build.
[Source-sync verification](../SOURCE_SYNC.md) records exact accepted build scope.

The resource verifier checks original images, ship configurations, portrait
atlases, local media/fonts, relative URLs and bundled notices.

### Large-save browser regression

With the local Windows tester running, run
`node tools/windows-tester/save-boundary.test.mjs` using an existing Playwright
installation. Set `PLAYWRIGHT_MODULE_PATH` to its module entry if it is not
available as `playwright` in this checkout. The test launches its own muted,
nonpersistent Edge profile and uses fictional saves; it never attaches to the
owner's browser. `JUNIOR_SAVE_TEST_URL` can select another 127.0.0.1 tester origin,
and `JUNIOR_SAVE_TEST_EVIDENCE` selects an output folder inside `artifacts/`.

It checks responsiveness and slot preservation for an encoded save just above
the decoded size limit, successful import at the exact limit, and export recovery.
The timing ceiling is a local regression guard, not a hardware performance claim.

For the smaller ship-image distribution, use Python 3 with Pillow's WebP support
(verified with Pillow 12.3.0), then run:

~~~sh
npm run build:optimized
npm run check:ship-runtime
npm run check:build
~~~

The optimizer verifies identical decoded RGBA pixels for every configuration and
uses WebP only when smaller. Approved PNG masters stay untouched. Derivatives and
their checksums live in the ignored artifacts/ship-runtime/ cache; production
copies only the selected image for each configuration. Development uses the
original PNGs. Builds without a cache remain supported and use originals; stale,
incomplete or corrupted completed caches fail validation. Keep the verified cache
when running check:build for an optimized build. Interrupted optimization can be
rerun safely. No generated image library needs to be committed alongside masters.

Tailwind's explicit source list includes both App.tsx and GameInterface.tsx;
include any future extracted interface entrypoints there as well.

## Source layout

| Path | Role |
| --- | --- |
| App.tsx | State hooks, simulation and save ownership |
| GameInterface.tsx | Existing typed render markup, separated for source analysis |
| galaxy.ts / galaxyData.ts | Authored galaxy and worlds |
| surface.ts | Surface content and generation |
| alien.ts / commData.ts / banter.ts | Encounters and dialogue |
| components/ | Science, mining, training, diagnostics and shared UI |
| utils/ | Rules, saves, flight, rendering, maps, audio and other helpers |
| assets/ | Approved images, models, ship library, music/effects and UI art |
| test-fixtures/ | Fictional developer fixtures, not owner saves |
| tools/windows-tester/ | Launcher, server, packager and native checks |
| design/ | Dated design and historical audit records |
| docs/ | Player help, development, screenshots and release readiness |

Historical design reports can reference local evidence excluded from Git.
Those links are provenance, not build dependencies. Follow the current
SOURCE_SYNC/readiness records instead of treating an old task list as live status.

## Portable Windows package

The [packaging section](../SOURCE_SYNC.md#windows-packaging-tools) describes
the frozen accepted-build manifest and dependencies. The builder checks the
compiled entry/hash, copies the game and unmodified Node runtime/license, and
compiles the native GUI launcher. Python is a build-time ZIP helper only.
Players use the resulting EXE without developer tools.

The optional browser harness uses a locally installed Playwright module or
PLAYWRIGHT_MODULE_PATH. No API key belongs in the client or launcher.

## Voices and recorded media

Alien recordings use aliens/<id>.mp3; crew files use crew/<hash>.mp3 in the
separate [voice repository](https://github.com/cptjamestiberiouskirk-pixel/starflight-dispatch-voices).
Crew filenames use FNV-1a over exact UTF-8 dialogue text. Preserve IDs, text,
casting and filename hashes when working on playback. Text remains visible if
recordings cannot load.

Current exploration music is local Neon Starfield Voyage; the older Lower Deck
Voyage is retained for provenance. Playback supports volume, pause/resume and
dialogue ducking. [Credits](../CREDITS.md) separate content from software notices.

## Diagnostics and settings

Append ?perf to a local game URL for current-browser measurements. Results are
not universal frame-rate promises. Graphics quality, CRT, shake, banter, voice
effects and volumes persist in supported mission saves.

Ctrl+Shift+D opens development diagnostics; 9. Telemetry & Lore can play a known
voice ID/hash. Other tools can change a mission or mark it DEV. Use only
disposable synthetic missions, never personal saves. Debug tools are not needed
for ordinary play.

## Embedded host

Standalone mode uses the local lifecycle adapter. Embedded mode is explicit:
VITE_PLAYGROUND_EMBEDDED=true. Cross-origin hosts must set
VITE_PLAYGROUND_PARENT_ORIGIN to one exact HTTP(S) origin at build time.
No wildcard, credentials or URL path is accepted. Parent source/origin and
response envelopes are validated; pending calls have deadlines/unmount cleanup.

## Deployment is a separate action

Source pushes do not deploy the game. The existing Pages workflow is manual-only.
Do not change repository visibility or run it without explicit publication
authorization and completed [release checks](RELEASE_READINESS.md).
An authorized maintainer can configure GitHub Pages to use Actions and run the
existing workflow, which validates/builds and uploads only dist. This document
is not authorization to do so. No site has been published by this documentation pass.
