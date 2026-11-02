# Independent repeat verification, November 1, 2026

This local development build repairs additional issues found by three independent
GPT-6 Astra reviewers and executable adversarial tests. GitHub and the private
Windows tester ZIP remain separate releases.

The repairs cover paused imports, copying over a running slot, preserving unrelated
damaged backups, restoring metadata-only legacy cards, and cancelling departure
when a crew assignment becomes vacant. Save As during departure keeps later writes
attached to the new slot. Importing over the running slot now explicitly restores
and loads that mission. To replace a running slot with a copy, return to the title
screen first; ordinary copies duplicate the stored checkpoint.

Movement now tracks the physical key through modifier changes. Artifact readings
share the actual surface coordinates and use correct hemispheres. Stellar flares
respect an encounter's physical origin. Crew recommendations avoid repeated roster
scans, ambiguous duplicate roster identities are rejected without rewriting the
backup, and transmission portraits match the full officer name. Recruit drafts
discard stale generated appearance metadata and explain unmatched name styles.

The accepted build passed **63,132 source assertions** and **245 compiled-game
Playwright cases across 19 suites**. A fresh mission earned its resources through
17 mining voyages and completed the campaign, victory, save and reload with six
living officers in six distinct roles. Typecheck, build/resource verification,
dependency mitigation checks and server limits also passed. Existing tests now
verify real Science panel selection, purchase inventories, focused editing during
Maneuver, and rendered portraits after reload.

Entry: `assets/index-D4r4pSNh.js`; SHA-256:
`05634e8e30d9d1013c4729a7ff0567c73e7ee9c29d61a3b1a7f1f68f27826ba4`.
Machine receipts, independent reviews and retained first attempts are local under
`artifacts/independent-pass-20261101/`.

Testing used muted disposable profiles and separate fictional imports for
adversarial states. The fresh campaign used known-chart guidance. Owner profiles
and saves were never accessed or refreshed. Coverage is finite; human listening
and physical-device acceptance are not claimed. Existing media, equipment rules,
mission rules and the save format were preserved.
