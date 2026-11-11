# Release readiness

**November 11, 2026: updated source-available preview; Windows package remains a private tester.**

The docs are written for a new player. Public availability, rights clearance and
independent technical acceptance remain separate decisions.

| Area | Status / evidence needed |
| --- | --- |
| Game introduction/features | Player-first README explains setting, objectives, expedition loop and systems. |
| Player onboarding | Spoiler-free first mission, navigation, surveys, mining, trade, repairs and campaign guidance. |
| Controls/support | Dedicated controls, FAQ, Windows guide and private bug-report template. |
| Screenshots | Actual current-build fictional mission captures with provenance; no owner saves. |
| Source/build | Fresh-history source preview at cptjamestiberiouskirk-pixel/starflight-junior-crew-public; original development repository remains private. Source/build/package instructions available. |
| Local verification | Updated source passed typecheck, 63,148 source assertions and production build/resource checks. [November 11 summary](VERIFICATION_2026-11-11-SOURCE.md). Earlier November 2 coverage includes 253 compiled-game browser cases and earned victory/reload; those results retain their [dated scope](VERIFICATION_2026-11-02-DEEP-FEATURES.md). |
| Windows ZIP | Latest accepted private tester is November 8, with exploration/guidance fixes, earned equipment persistence, oversized-relic feedback and controlled-loss recovery checks. [Scope and limitations](VERIFICATION_2026-11-11-SOURCE.md). ZIP stays private; no public binary release or site deployment. |
| Security | November 4 Snyk, npm audit and OSV dependency checks found zero vulnerabilities. Snyk Code's 13 alerts were source-reviewed with no validated reportable issue. Picomatch advisory revoked; tested guard retained. App source size exclusion removed. [Limits](SECURITY_MITIGATIONS.md). |
| Clean Windows machine | November 5 normal-user clean Windows checks covered the November 2 tester's launch, voyage, save/import, restart, updates and shutdown. Later noninteractive guest checks do not renew normal-user Edge or audible-audio acceptance. [Dated coverage](VERIFICATION_2026-11-11-SOURCE.md). |
| Devices/accessibility/audio | Small-screen emulation, keyboard controls, software fallback and representative audio playback/decoding checks exist. Physical devices, screen-reader speech and human listening remain open. |
| Final packaged campaign/soak | November 2 earned victory/reload retains its [dated package scope](VERIFICATION_2026-11-02-PACKAGE.md). November 11 added a 30-minute docked session, 40 menu cycles, eight checkpoint checks and full browser/server restart on the November 8 tester. [Stability and limits](VERIFICATION_2026-11-11-SOURCE.md). Broader flight/progression and longer soaks remain unverified. |
| Licensing/credits | October 28: maintainer authorizes proceeding on the basis that licensing issues are resolved. LICENSE.md permits personal noncommercial play/study and private modifications; redistribution/commercial reuse requires permission. Third-party rights and notices remain separate. This is the maintainer's release decision, not a claim of independently verified rights clearance. |
| Download/support route | Owner authorized public source at starflight-junior-crew-public under the personal-use license. Public Issues accepts nonsensitive bug reports. No public binary download is supplied. |
| Website | Not deployed; Pages remains manual-only. |

## Independent Windows test procedure

Use a clean Windows 10/11 x64 machine/VM with Edge/Chrome and no Python, Node or
Git installed. Use only the tester ZIP supplied by the maintainer.

1. Record package build/hash, OS, browser, display scale and resolution.
2. Extract to a path with spaces; double-click the launcher.
3. Complete commissioning and a short ordinary survey/mining return voyage.
4. Save/export, close/reopen, import into an empty slot and compare progress.
5. Check local visuals/music/effects, online voices and readable offline dialogue.
6. Exit the tray server; ensure unrelated port occupants are not interrupted.
7. Back up, extract an update separately and verify continued save access.
8. Exit and remove the extracted folder; check for orphan tester processes.
9. Record failures as well as successes; do not weaken Windows protections.

The dated checks above cover specific builds and environments. This procedure
remains useful for independent acceptance on another machine. Public source
updates do not publish the Windows package or close device, audio or rights
acceptance gaps. Pages remains undeployed and manual-only.
