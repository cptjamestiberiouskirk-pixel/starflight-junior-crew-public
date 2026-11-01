# Second deep testing pass - November 1, 2026

Three independent adversarial agents challenged save arithmetic, gameplay transitions,
and the first pass's test quality. Seven further game defects were reproduced and
fixed locally. The run used physically muted, disposable Playwright profiles;
owner browser profiles and existing saves were not accessed or changed.

Final candidate: `assets/index-DSQrIe52.js`, SHA-256
`63d9efbe49c8efc5ebe5430c08929f1a27b274eb2433c246d81da7c04eba696a`.
The local verification manifest records the completed suite results and their
build identities; earlier failed attempts were retained rather than overwritten.

## Findings and changes

| Finding | Resulting behavior |
| --- | --- |
| Extreme imported money overflowed interest and corrupted saved credits | Monetary fields retain signed/fractional values within inclusive safe numerical precision. Invalid imports/restores are rejected before replacement. |
| Negative projectile speed eventually produced infinite coordinates | Negative speeds are rejected; zero and ordinary forward speeds remain valid. |
| Extreme wildlife velocity overflowed saved positions | Current and cached surface velocities use a generous numerical guard, retaining missing defaults and normal historical values. |
| Launch preparation progressed during pause/title | Clamp and transporter phases freeze, resume their remaining time, settle interest once and cancel correctly on mission changes. |
| A stale transporter beam appeared after changing missions | Beam and particles clear on reset/load without canceling the intended launch transition. |
| Extreme interest-day indices blocked progression | Both canonical and legacy optional indices must be whole days within the supported calendar. Missing defaults and legacy alias fallback are retained. |
| One temporary hangar asset failure stalled launch indefinitely | Full preload errors are handled, assets retry with a bounded budget, and exhaustion shows an explicit failure/skip caption. A later player-initiated bay shot can retry. |

Checkpoint writing now validates the actual snapshot and serialized byte budget
before touching storage. Invalid, unsafe finite and oversized transient states
preserve the previous checkpoint and report that saving was blocked. Saving
recovers after state correction. Ordinary money, debt, fractional legacy values,
equipment rules, interest division order, time rules, ship/media files, voices
and save schema are preserved. This pass precedes the separately requested
unique-crew-assignment rule change.

The first launch-pause implementation had a room-exit cancellation regression;
an independent native retest caught it, and the corrected candidate passed.
The test harness also now rejects empty case selections, checks pause for more
than a full clock tick, selects actual prelude phases rather than assuming a
900ms delay, and binds errors to their originating pages.

## Campaign provenance

The second fresh mission began with empty storage on the preceding `dad2053e...`
build. Normal controls recruited/trained/assigned six crew, completed 17 earned
mining voyages, purchased expedition equipment, obtained the Black Egg and Orb,
answered the visible drone questions, found the Nexus, armed the Egg, escaped
and reached persistent victory with six living crew and `isDev: false`.
Known chart guidance was used, without fabricated progress, developer tools or
seeded randomness in that campaign.

Its immutable earned equipment checkpoint was imported unchanged through the
normal UI and replayed through the story on the beam-fixed candidate. Its actual
earned pre-arm Nexus checkpoint then completed victory/save/reload on the final
candidate above. This is earned continuation across fixes; the entire economic
grind was not restarted on every compiled revision. Rare, malformed and boundary
states were tested separately using explicitly fictional imports.

## Coverage

| Layer | Passing observations |
| --- | --- |
| Source | 15,290 assertions, typecheck and production build; resource hashes and local security/limit checks |
| Final production queue | 13 economy/crew/colony, 10 defeat/color, 66 prior gameplay, 3 size boundaries, 32 render inputs, 32 numeric-state, 6 prelude and 4 asset-recovery cases |
| Historical/adversarial saves | 87 cases on the final candidate |
| Broader repeat | 15 encounters, 3 cross-system, 9 maps, 20 wildlife, 11 weather, 5 recorded playback/pause cases and 18 native audio samples |
| Buttons | 327 definitions, 323 reachable in 286 snapshots; all 104 reachable conditional controls in both states, 141 boundary cases and 17 prior-defect/write/reset cases |
| Voice files | 1,524 existing referenced files matched pinned repository Git blobs and decoded to finite, nonzero PCM; output physically muted |
| Independent feedback | Three reviews, targeted red-to-green reproducers, 43 additional validator candidates with historical controls, six phase-selected launch/title/slot checks and long-clock/compact Science checks |

The four unrendered legacy button definitions remain explicitly classified:
two contradictory `On Planet` ancestor branches, an optional landing callback
without a production caller, and an unused legacy Overlay. Actual ascent,
disembark and landing controls were exercised elsewhere. Structural outcome
coverage alone is not proof that every enabled blinking control is applicable
in every continuous or random state; the independent condition matrix supplies
specific correctness assertions.

Button instrumentation and voice inventory checks retain their own build/file
identities in the manifest. Instrumented state tests are separate from ordinary
player acceptance and are never included in production. Final recovery tests
inject one GLB or PNG failure, and a permanent failure case verifies bounded
requests, a clear caption, existing Enter skip, one interest payment and reload.
Production server rate limits were not changed to make tests pass.

## Evidence and limits

Local evidence is under `artifacts/second-pass-20261101/`: `verification.json`,
`FINDINGS.md`, campaign provenance/videos, original failures and the three agents'
reports. Test code is in `tools/windows-tester/` and `tools/button-audit/`.
The Windows ZIP, accepted package manifest and both GitHub repositories were not
updated by this pass. Testing uses separate profiles and leaves owner saves
untouched. Publishing and package rebuilding remain separate actions.

Finite tests do not prove every possible state. Muted native playback/decoding
does not certify human listening. Physical devices, accessibility, all animation
frames and independent clean Windows installations remain separate acceptance
work. Existing dependency advisory mitigation is verified locally; upstream
resolution is not claimed.
