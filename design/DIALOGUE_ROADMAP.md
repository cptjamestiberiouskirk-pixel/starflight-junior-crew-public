# Dialogue roadmap review — October 24, 2026

**The queued Eleven v4 evaluation is complete. Keep the existing recordings.** A fresh connected GitHub inventory and current local dialogue IDs/text hashes match all **552 recordable comms lines and 972 full crew lines**, with no missing files. The four intentionally unrecorded comms entries are three synthesized Mysterion messages and one interface cue; eight Docker nickname fragments are not full spoken lines. Presence does not establish listening quality or full narration of dynamic UI/system text.

[Audit and source hashes](../artifacts/dialogue-roadmap-20261024/DIALOGUE_AUDIT.json) · [Live tree receipt](../artifacts/dialogue-roadmap-20261024/LIVE_TREE_REVALIDATION.json).

## Model choice for future additions

The current official catalog lists **`eleven_v4`** for expressive character speech and **`eleven_v4_turbo`** for low-latency use. v4 supports a 10,000-character request and audio tags. Multilingual v2 remains an option for consistent long passages. For this game's pre-recorded character lines, offline-authored v4 is the sensible candidate; runtime synthesis would add a network/cost dependency without improving the existing file lookup. This is an implementation recommendation, not a listening comparison. [Official models](https://elevenlabs.io/docs/overview/models).

The connected ElevenLabs MCP returned a v4 family prompting guide and a v4 TTS parameter schema without generating media. Its exposed schema lists language_code and a deprecated voice_id alias; do not assume every REST voice parameter is supported by this MCP route. Metadata access does not certify generation entitlement, available credits or quality. [Captured schema](../artifacts/dialogue-roadmap-20261024/MODEL_SCHEMA.json).

The installed text-to-speech skill's model table stops at v3, so current official documentation and the connected schema take precedence for model availability. Nothing needs installing or changing in the game's playback code for this review.

## Preserve compatibility

- Retain the exact existing comms IDs and UTF-8 banter text/FNV filenames, current voice casting, subtitles, queue priorities, interruption cleanup, ducking and save data.
- Keep any future v4 audition outside the runtime asset paths. Audition short/long lines, alien terminology, numbers, urgency and comedy without replacing accepted recordings.
- If additions are commissioned, obtain an actual service/account quote and fresh spending approval first. Record model/voice IDs, text hash, take, cost, output hash and provenance. Review pronunciation and clipping, then muted native queue/pause/cancel/ducking checks before integration. Add no live API key to the client.
- Do not change subtitles or line hashes to insert IPA/emotion tags. Any future generation prompt directions belong in a separate authoring manifest with the original display text retained.

Public API list pricing currently shows v4 **US$0.08 per 1,000 characters** and v4 Turbo **US$0.04**. Those figures are indicative and are not an authenticated MCP/account quote, permission to generate, tax allowance or retry budget. No paid pilot is needed to fix a missing recording: the current recordable inventory is complete. [Official pricing](https://elevenlabs.io/pricing/api).

## Work completed after acceptance

The user instructed, “assume I accept everything and continue working.” The accepted build remains `assets/index-D1PR-s-y.js`, SHA256 `49e6e8022cbf5dbbf817946eb3e68071c53ed4e04b32e4d4819900baef5008f7`; the audit verified it is unchanged. This continuation completed the model review, refreshed the voice inventory and corrected stale music/scanner documentation. No new media, source upload, owner-save change, runtime edit or publication occurred. The cancelled crew-assignment investigation was not reopened.
