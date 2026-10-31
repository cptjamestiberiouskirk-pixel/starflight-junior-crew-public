# Local security mitigations

The October 26 Snyk review found a development-tool dependency issue and missing
resource limits in the optional Windows tester server. These changes do not alter
game rules, save formats, equipment or audio defaults.

## Temporary picomatch guard

SNYK-JS-PICOMATCH-21248802 affects picomatch 4.0.7 in Vite's development toolchain.
Snyk lists no fixed release as of October 26, 2026. `npm ci` / `npm install` run
`scripts/guard-picomatch.mjs` after installation. It checks the exact known parser
SHA-256 and installs a narrow guard in every installed lockfile copy. Unknown
versions or modified parser content fail closed and require review. The guard is
idempotent and cannot be disabled with picomatch's maxExtglobRecursion option.

Repeated extglobs containing wildcard/group syntax, empty branches or overlapping
literal prefixes (for example `+(*)`, `+(*a|b)` and `+(a|aa)`) now throw
`ERR_UNSAFE_REPEATED_EXTGLOB`. Those ambiguous forms
are not used by this project's build configuration. Ordinary globstars, braces,
negation and literal repeated groups remain supported and are regression-tested.
This is a local mitigation, not an upstream fixed version: Snyk's package-based
dependency scan may continue reporting the advisory. No ignore rule hides it.

Do not disable npm lifecycle scripts when installing for development. If scripts
were disabled, run `node scripts/guard-picomatch.mjs` before invoking build tools.
Run `npm run check:security` after dependency changes. When an upstream fix is
available, review it, upgrade and retire this guard with the same adversarial and
build regressions; do not delete it solely to make installation succeed.

The October 29 recheck passed all 68 guard cases across both installed copies.
The current npm audit reports zero advisories in its database, while the separate
Snyk advisory still lists no fixed release. This project-specific mitigation is
enabled; the upstream advisory is not claimed closed. See the
[latest regression/security verification](VERIFICATION_2026-10-29-REGRESSION.md).

## Windows tester server

The server still binds only to 127.0.0.1 with strict Host checking and read-only
routes. It now caps sockets, active responses, request rate and idle sockets.
Status requests, HEAD and redirects share the same admission control as file
streams. Overload produces 429/503 plus Retry-After without opening files. Normal
parallel game loads and media byte ranges remain supported. Path containment and
junction checks remain enabled. Local HTTP does not provide TLS confidentiality
on a hostile local machine; this server is not for network hosting.

## Source analysis coverage

`App.tsx` owns the unchanged state hooks, simulation and save handlers.
`GameInterface.tsx` renders the existing markup from an inferred typed state
object. Both files are below Snyk Code's 1 MB per-file limit. The security check
fails before any source module reaches 900,000 bytes. This prevents the previous
oversized-file exclusion; it does not establish that any scanner detects every
vulnerability.
