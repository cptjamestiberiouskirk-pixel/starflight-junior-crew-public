# Release readiness

**October 28, 2026: source-available preview; Windows package remains a private tester.**

The docs are written for a new player. Public availability, rights clearance and
independent technical acceptance remain separate decisions.

| Area | Status / evidence needed |
| --- | --- |
| Game introduction/features | Player-first README explains setting, objectives, expedition loop and systems. |
| Player onboarding | Spoiler-free first mission, navigation, surveys, mining, trade, repairs and campaign guidance. |
| Controls/support | Dedicated controls, FAQ, Windows guide and private bug-report template. |
| Screenshots | Actual current-build fictional mission captures with provenance; no owner saves. |
| Source/build | Fresh-history source preview at cptjamestiberiouskirk-pixel/starflight-junior-crew-public; original development repository remains private. Source/build/package instructions available. |
| Local verification | Security-remediated source passed clean install/typecheck, 10,718 assertions and build/resources. Current ZIP extraction passed launcher, browser, upgrade, 87 save and server regression/security checks. [Exact scope](VERIFICATION_2026-10-26.md). |
| Windows ZIP | October 26 security rebuild verified locally, including old-to-new save continuation without import; no public release asset uploaded. |
| Security | Local mitigations verified; upstream picomatch advisory and reviewed static alerts remain visible. App source size exclusion removed. [Limits](SECURITY_MITIGATIONS.md). |
| Clean Windows machine | Pending independent machine/clean VM launch, first voyage, online/offline behavior, save/import, updates and shutdown. Development-PC checks do not close this item. |
| Devices/accessibility/audio | Partial: small-screen emulation, keyboard and software fallback checked; physical devices, screen-reader output and human listening remain separate coverage. |
| Final packaged campaign/soak | Pending fresh package-level campaign/soak; earlier campaigns/soaks belong to their documented earlier builds. |
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

This procedure is not a claim that clean-VM, device or rights checks passed.
The owner authorized public source separately from package acceptance.
Source publication does not close portable-package acceptance gaps.
