# Source snapshot and verification

October 29 latest update: distinct Science Analysis/Ship status illustrations and
scrolling compact cards are included, along with a fix for multi-megabyte save-code
editor stalls. The source passed 10,833 regression assertions, all 87 adversarial
save cases, security guards, TypeScript and build/resource checks. A permanent
browser test covers size-boundary responsiveness, slot preservation, exact-limit
import and export recovery. The rebuilt private Windows tester passed native
launcher/browser and previous-version continuation checks. The private preview
retains port 4174 and the tester retains port 4188; browser save origins and
formats are unchanged. See the [current verification](docs/VERIFICATION_2026-10-29-REGRESSION.md).

October 28 update: the maintainer authorized source availability at
https://github.com/cptjamestiberiouskirk-pixel/starflight-junior-crew-public.
That repository starts with fresh history and excludes private development
history, saves and local artifacts. The original repository remains private.
LICENSE.md permits personal play/study and private modifications; redistribution
and commercial reuse require permission. The Windows ZIP stays local/private;
no Pages deployment is part of this source publication.

The October 26 evidence below is historical. Source publication does not add
independent Windows, human listening or package campaign acceptance.

The October 26, 2026 synchronization brings the private repository up to the
accepted local game source, artwork/configuration library, regression suites,
design documentation and Windows launcher tooling. Source history is retained.
Historical development artifacts remain local; older tracked artifact files are
removed from the current source tree without rewriting Git history.

## Reproduce the standalone build

Use Node.js 24 and npm with the committed lockfile:

```sh
npm ci
npm run typecheck
npm run check:security
npm test
npm run build
npm run check:build
```

The runtime needs no API keys. Crew and alien recordings load from the existing
voice repository; the game keeps dialogue visible if a recording cannot load.
Approved artwork, ship configurations, fonts, music and effects build locally.
Tests write disposable output under ignored `artifacts/`.

The historical October 26 Windows tester uses `assets/index-ChqdbkwB.js`, SHA-256
`0b63fdcaf5daa163d43bcf47fb300850796764bb618e0eca49afcccabcf02570`.
The security-remediated source passed 10,718 assertions across 34 suites, clean
installation, typecheck and build/resource verification. The replacement ZIP's
actual extraction passed 87 native Edge save cases, seven launcher cases, six
packaged-browser cases, six upgrade-flow checks (including that save suite),
53 server regressions and 14 server security cases. An existing browser save
continued across the old-to-new EXE upgrade without import.

The earlier October 25 `index-BBIBGkdF.js` tester and its evidence remain
historical. Earlier full campaigns, seven QA backup round-trips and long soaks
belong to their recorded builds; they were not newly repeated for this ZIP.
See [current verification](docs/VERIFICATION_2026-10-26.md). These checks do not
certify every device, save or audio output, and are not a new Cloud scan.

## Windows packaging tools

On Windows x64, `node tools/windows-tester/build.mjs` builds the frozen accepted
tester from `dist/`. It checks `tools/windows-tester/accepted-build.json` before
packaging. A different compiled build requires new verification and an intentional
manifest update. It needs the installed Node runtime's adjacent `LICENSE` and
the Windows .NET Framework C# compiler. `zip.py` uses Python only on the packaging
computer; players need neither Python nor development tools.

The tools retain the historical default output, `artifacts/windows-tester-20261026/`;
existing packages and ZIPs are not overwritten. Set `JUNIOR_TESTER_EVIDENCE_DIR` to a new directory
under project `artifacts/` for another run. Use the same directory for launcher,
browser and ZIP commands. The historical default archive name ends in
`20261026-security.zip` unless `JUNIOR_TESTER_ARCHIVE_NAME` selects a new safe
ZIP basename. The October 29 rebuild uses a fresh evidence directory and
`Starflight-Junior-Crew-Windows-x64-20261029.zip`. The accepted manifest is updated
intentionally after verification, not automatically by the packager.

The optional browser test uses an installed `playwright` package, or the local
module path supplied through `PLAYWRIGHT_MODULE_PATH`. Native launcher tests
require Edge at the conventional Windows installation path. All browser testing
uses physically muted disposable profiles. See [tester instructions](WINDOWS_TESTING.md).

## Scope boundaries

No `.env` files, credentials, personal saves, browser profiles, migration archives,
local evidence archives, dependencies, compiled distribution or tester ZIP are
part of this source synchronization. Links in historical design reports to local
artifact evidence may be unavailable from a clone; they are provenance references,
not prerequisites for building or running the game.

The repository remains private. The existing Pages workflow is manual-only;
source synchronization does not run it, deploy a site, upload a release or start
a paid security scan. Both original Cloud findings were remediated locally; the
historical Cloud report scanned an older revision and is not replaced by this sync.
