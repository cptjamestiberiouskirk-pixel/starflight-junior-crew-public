# Regression, adversarial and security validation — October 29, 2026

The tests found a save-editor responsiveness bug. A near-limit encoded payload
could keep the browser busy for about 19 seconds before validation could be
clicked. The slot was preserved, but the delay caused the adversarial UI test
to time out. Import and export code fields now disable wrapping, spellcheck and
automatic text corrections. Payload limits, decoding, storage and save format
are unchanged.

The focused regression measured the over-limit case at 2.1 seconds in the fixed
compiled game and 2.9 seconds in the extracted Windows tester. A save at the exact
4 MiB decoded limit imported successfully; above-limit content was rejected with
the existing slot byte-for-byte unchanged. Export recovery also passed. These
are local measurements, not hardware performance guarantees.

## Checks

- 10,833 regression assertions across 36 suites; TypeScript, build and resource
  verification passed.
- All 87 historical/adversarial save cases passed on the fixed compiled bundle.
- 53 isolated server path/range/MIME/security cases, 68 dependency-guard cases,
  14 server-limit cases, 163 source-size checks and six runtime-cache cases passed.
- Seven native-launcher and six extracted-package browser cases passed.
- Seven upgrade checks passed: five previous-to-new save-transition checks,
  exact bundle identity with the 87-case result, and the three-case boundary
  regression rerun through the extracted package's native server.
- Eight live Science view/layout cases and the play/pause/resume/log clock
  regression passed on the updated private server.

The current npm audit returned zero advisories. This does not clear the separate
[Snyk picomatch advisory](https://security.snyk.io/vuln/SNYK-JS-PICOMATCH-21248802):
Snyk still lists no fixed upstream release as of this review. The project's
checksum-bound mitigation remains installed and all positive/negative guard
tests passed. No suppression or package-version disguise was added. This was a
local test pass and advisory review, not a new Snyk/Codex cloud code scan.

## Updated private package

| Item | Verified value |
| --- | --- |
| ZIP | Starflight-Junior-Crew-Windows-x64-20261029-save-editor.zip |
| Bytes | 1,111,925,322 |
| SHA-256 | `f3b194b530e9611a4114fba21d448dd46eb4bc2e799bc37103cdfd779a45ab94` |
| Files | 3,927; all ZIP CRCs and extracted manifest hashes passed |
| Bundle | `assets/index-Ctojkw-U.js` |
| Bundle SHA-256 | `af2034d02bc893b3f62175b92e866588f1a8b46c9494b2e246e00a8a0a6ff9f2` |

The private preview remains at port 4174 and the native tester at 4188, both under
`/starflight-junior-crew/`. All 3,918 preview game files matched the extracted
manifest; five earlier static assets remain available for already-open tabs.
The previous Science ZIP was retained and rehashed unchanged. No tester ZIP was
uploaded to GitHub or published as a public binary release.

Owner browser profiles and saves were not accessed or modified. Browser tests
used fictional saves in physically muted, disposable profiles. At a stopping
point, save/export current progress before refreshing the existing browser tab.
Keep the same browser/profile and address to continue existing saves. These are
current-host checks, not independent clean-Windows/audio/device/campaign testing.
