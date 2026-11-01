# November 1 audio failure fix and private tester verification

The game entry is `assets/index-DMj0CPl8.js`, SHA-256
`fad111cb016cc826a2fbda80f5e59aec3ddd4cd1c20de9afd4088f44429d9c23`.

The launch/docking sound's cached load promise can settle after a fetch or decode
failure without producing a buffer. Playback now resumes from that promise only
when the buffer exists and playback is still wanted. Failed audio remains silent
without a recursive microtask loop. Original recordings, successful playback,
speech ducking, game-clock seeking, pause behavior, gameplay and saves are unchanged.

The original code passed eight mock controls and failed four failure-path cases
through bounded child timeouts. All 12 now pass in
[cinematic-audio.test.ts](../cinematic-audio.test.ts), integrated into `npm test`.
The full suite passed 62,821 checks with the existing Node 24 runtime; type checking,
production build and resource checks also passed. These tests mock fetch and Web
Audio, producing no sound or network requests. The child timeout protects the
runner from a regression that could otherwise hang it indefinitely.

Four compiled-browser cases passed in physically muted disposable Edge contexts:
launch HTTP404, launch invalid WAV, docking network failure and normal launch.
Each exercised the audio request, completed the transition, remained responsive,
and saved/reloaded a fictional mission with its ship and crew preserved.
The permanent browser regression is
[cinematic-audio.test.mjs](../tools/windows-tester/cinematic-audio.test.mjs).

The private archive is `Starflight-Junior-Crew-Windows-x64-20261101-audio-fixed.zip`,
1,113,017,415 bytes, 3,927 files, SHA-256
`a5371a4b98ca51d56ba7a045ea34322cb0162ab2a428d9a8c82449659188606f`.
Every archive CRC passed. Node 24.22.1 and the fixed tester address on port 4188
are retained. Use the same browser profile and address for existing browser saves;
the developer preview on port 4174 has separate storage. Keep the previous package
until you confirm continuation in the new one.

The ZIP, raw evidence, profiles and test saves stay private and outside both source
repositories. No public binary attachment or website deployment is included.
This is development-PC acceptance, not clean-machine Windows certification,
human audio listening or a fresh complete packaged campaign playthrough.

Final extracted-package acceptance: all 3,927 manifest files verified, native
launcher 7/7, native browser 6/6, import boundaries 3/3, audio failure/playback
4/4 and launch pause/resume/save/reload 6/6 passed. Seven same-origin upgrade
checks passed from the previous dance/names tester. The exact stored checkpoint
was unchanged on the new title before continuation; no re-import was required.
Subsequent save/reload retained crew identities, portraits, skills, ship equipment,
credits and mission data. All browser profiles were disposable and physically
muted; owner saves were not accessed. The previous ZIP remains unchanged.
