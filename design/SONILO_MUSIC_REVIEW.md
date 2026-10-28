# Starflight: Junior Crew — existing Sonilo music comparison

## Retro electronic replacement — October 22, 2026

The user rejected the earlier Lower Deck Voyage selection as lounge-like and chose **Retro electronic space adventure**. One new creator-account batch generated Neon Starfield Voyage and Cosmic Circuit Odyssey. Neon is the current local recording, selected from the requested style and Sonilo description, then decoded and technically tested; this agent has no auditory input. The earlier comparison below is historical. Source IDs, actual bytes/hash, credits and exact prompt are in artifacts/sonilo-review/retro-replacement.json. No project files were uploaded and no public deployment occurred.

Reviewed locally on October 22, 2026. No new Sonilo generation, upload or publication.

**User-accepted selection: Generation 2, Variation 2 — Lower Deck Voyage.**
Its Sonilo description supplies the warm orchestral/electronic blend and crew
camaraderie requested for Junior Crew, without the more overt whimsical lead
character described for Junior Crew Odyssey. It also has the strongest measured
harmonic similarity across the candidate loop windows tested here. This makes
it the best supported local integration candidate from the available evidence.

**Listening boundary:** this agent can control the signed-in browser and decode
the downloaded files, but browser playback is not an auditory input to the
agent. Musical descriptions below are Sonilo's descriptions, and the suitability
judgments are inferences from those descriptions plus PCM measurements. They
are not claims of having heard the four tracks. No assertion is made that every
track is vocal-free, that every melody is suitable, or that the selected seam is
musically transparent to a listener. The user accepted this selection. That acceptance does not imply an auditory review by this agent.

| Existing track | Exploration and tone, inferred from Sonilo description | Dialogue and dynamics, measured | Looping, measured |
| --- | --- | --- | --- |
| G1 V1 — Cosmic Curiosity | Closest explicit retro/orchestral brief; optimistic, playful warmth. Strong alternative if orchestral character is the priority. | -16.95 dBFS RMS; 12.16 dB P90–P10 level range, the largest contrast of the four. Quiet-to-loud variation may make balancing less consistent. | Best candidate chroma similarity 0.908; clear source fade-out. |
| G1 V2 — Junior Crew Odyssey | Bright woodwinds and soaring horns suggest a more foreground adventure cue; potentially better for a feature moment than extended mining or conversation. | -16.95 dBFS RMS; 9.51 dB level range. Description suggests more prominent melody; that is not directly verified by listening. | Strong usable candidate 0.915 before its fade-out; the highest raw match (0.917) lies in the fading tail and is unsuitable without level correction. |
| G2 V1 — Cosmic Curiosity | Spacious electronic pads and playful leads; strongest described electronic/retro alternative, less explicit orchestral character. | -16.53 dBFS RMS; 7.63 dB level range, the steadiest of the four. Potentially easiest to keep at a consistent background level. | Best candidate 0.880; matching windows have larger level differences. Source fades out. |
| **G2 V2 — Lower Deck Voyage** | Warm, lighthearted orchestral/electronic hybrid and gentle wonder; best inferred balance of space exploration and animated ensemble tone. | -16.77 dBFS RMS; 9.75 dB level range. Requires ducking like the others. | **0.974** match from the head window at 12.5 seconds to the tail window ending at about 345 seconds, with reasonably similar levels. Selected for integration. |

The filtered 300–3500 Hz energy fraction was approximately 94%, 94%, 97% and
99%, respectively. This simple biquad-band measurement is not a perceptual
speech-intelligibility score and does not prove that one track masks words less
than another. All four therefore receive the existing voice-aware music duck.
None of the four decoded source files contains samples at or beyond full scale.

## Sources and local integration

All four were downloaded using the existing signed-in Edge Sonilo Library at
`https://sonilo.com/dashboard/library`. Generation and variation numbering were
verified in the page. Each source is 360.0254 seconds, stereo AAC decoded at
44.1 kHz; each download is about 11.6 MB. Exact file hashes and byte sizes are in
`artifacts/sonilo-review/manifest.json`; all four original downloads are retained
there as g1v1.m4a, g1v2.m4a, g2v1.m4a and g2v2.m4a.

The selected original is copied byte-for-byte into
`assets/music/lower-deck-voyage-g2-v2.m4a`. Vite bundles a local hashed copy and
uses a URL relative to its configured project base. Playback requires no Sonilo
account, streaming URL, token or network request to Sonilo. The source file is
not destructively trimmed or re-encoded.

The Web Audio player uses source seconds **12.5–345.0**, with a **2.5-second
equal-power crossfade**. Initial playback lasts 332.5 seconds; subsequent
periods last 330 seconds because the opening 2.5 seconds have already been
mixed into the outgoing tail. The opening buildup and final fade-out are
excluded. The 2.5-second interval would equal one four-beat bar at the requested
96 BPM, but the actual tempo/beat grid was not independently certified.

Title, Starport, docking, exploration, peaceful alien contact, orbit and planetary surface scenes use this
recording. Existing procedural combat, victory and memorial cues remain
in use. Only one music bed is enabled at a time. The existing music slider and
the existing 0.32 recorded-track mix scale govern playback. Audible recorded
dialogue multiplies the music gain by 0.28, about **-11.06 dB**, then releases
smoothly after the voice ends. Recorded dialogue and voice IDs are unchanged.

## Verification

`artifacts/qa-sonilo-report.json` contains actual native Chrome results, separate
from the older synthetic PCM harness tests. It covers the compiled local asset,
pause/resume and saved volume, real-recording duck/recovery with existing alien
voice ID 1, zero volume/platform mute, rapid resume, actual-PCM loop rendering,
HTMLAudio controls and a full natural Web Audio loop cycle. Exact timing and
results are recorded there rather than inferred from the source configuration.

Actual audio testing reproduced a stale autoplay-unlock callback that resumed
the music clock after the pause menu opened. The player now checks current
playing/mute/visibility state before unlocking, and rechecks after asynchronous
resume. The compiled pause-clock reproducer is retained in
`artifacts/sonilo-review/pause-clock-reproducer.json`. The first test also had an
invalid orbit fixture with a missing planet index; its error is preserved as
`first-qa-fixture-failure.json`, not counted as a game defect.

Native PCM loop rendering measured peak amplitude 0.8852, a maximum final mix
amplitude of 0.2833 at full music slider, and maximum stereo turnaround sample
step 0.00533. No zero-audio gap appeared in the 10 ms windows spanning the
rendered actual turnaround (minimum RMS 0.05698). These demonstrate digital
continuity and headroom, not a listener's approval of harmony or phrasing.

The selected compressed asset is 11,605,779 bytes. Native 44.1 kHz raw decoding
uses 127,016,960 PCM bytes; the processed loop uses 117,306,000 bytes. Both can
exist during preparation, about 244 MB combined, before raw data is collected.
Four local decode samples took approximately 426–455 ms. These are analysis-rate measurements.
At the default native Chrome AudioContext rate of 48 kHz, the actual selected
source decodes to 138,249,752 bytes and its loop occupies 127,680,000 bytes,
about 266 MB combined during preparation. That separate local profile took
753 ms to decode and 25.5 ms to prepare the loop. Its exact results are in
artifacts/sonilo-review/runtime-profile.json. Mobile memory pressure and other
devices remain untested.

**Fallback boundary:** with Web Audio explicitly disabled, HTMLAudio plays,
pauses, resumes, follows volume and enables native looping on the real source.
It uses the original six-minute file including its fade-out; it cannot use this
Web Audio crossfade. Gapless musical looping is not certified for that fallback.

The player-experience report, progress file and acceptance audit retain this
human-listening and fallback limitation. No broader original-game parity or
additional unaided campaign victory is claimed by these audio tests.
