# Private Windows tester: Science graphics update — October 29, 2026

The private Windows x64 tester now includes distinct contextual illustrations
for Science Analysis and Ship status, plus a scrollable card grid on short
compact screens. It retains the labeled Expedition clock and all earlier
presentation improvements. Ship artwork, equipment/gameplay rules, recorded
voices and save serialization are unchanged.

| Item | Verified value |
| --- | --- |
| ZIP | Starflight-Junior-Crew-Windows-x64-20261029-science.zip |
| Size | 1,111,925,288 bytes |
| SHA-256 | `8f80635a6125e17ae9d1a6d5c74e2517ee22cf8efdbf5b860984de9be9912deb` |
| Files | 3,927; all archive CRCs and extracted-file manifest hashes passed |
| Game bundle | `assets/index-YGzkWVHr.js` |
| Bundle SHA-256 | `b68c6722bb7d99d26f483dbe87c54d311fde6322951e7a1e2ad28b03d2608499` |
| Runtime | Bundled Node.js 24.22.1, Windows x64 |

The earlier October 29 ZIP is retained; its SHA-256 was rechecked unchanged.
The new ZIP and checksum companion remain local/private. No tester ZIP was
uploaded to GitHub or published as a public binary release or deployment.

The extracted ZIP passed seven native launcher checks, six packaged-browser
checks, and seven previous-to-new upgrade checks. These include all 87 historical
and malformed-save cases and all 16 clock/layout checks. A save created in the
previous tester continued at the identical browser origin without re-import;
crew, equipment, credits and mission values survived saving and reloading.

Both updated Science tabs passed eight browser cases at widths 1440, 1024, 390
and 320 pixels through the updated private server. The 320-pixel checks also
confirmed that the last cards can be scrolled fully into view. No page errors or
failed HTTP resources occurred in these cases. The source review passed 10,833
regression assertions across 36 suites, TypeScript, build and resource checks.
The packaged server is byte-identical to the existing hardened source; all 14
server-limit checks passed.

The private preview keeps `http://127.0.0.1:4174/starflight-junior-crew/` and the
native Windows tester keeps `http://127.0.0.1:4188/starflight-junior-crew/`.
Both served the new bundle with matching HTTP SHA-256 and no-store headers.
All 3,918 current private-preview game files matched the extracted manifest.
Three previous static assets remain available on the private preview for
already-open tabs; no browser tab was refreshed automatically.

Owner browser profiles and saves were not accessed or modified. Tests used
fictional missions in fresh, physically muted browser profiles. Keep using the
same browser/profile and address for existing saves; the two ports have separate
storage. At a stopping point, save/export current progress before refreshing an
already-open game tab to load the new graphics.

These are current-host checks, not independent clean-Windows, human audio,
physical-device or full campaign/soak certification. The earlier
[Windows verification](VERIFICATION_2026-10-29-WINDOWS.md) remains available as
historical evidence. See [Windows tester instructions](../WINDOWS_TESTING.md).
