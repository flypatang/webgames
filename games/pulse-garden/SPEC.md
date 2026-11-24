# Pulse Garden
slug: pulse-garden · genre: rhythm · session length: 2–4 min per song

## Pitch
A rhythm game where every on-beat tap grows a glowing garden. Each song is generated live from a seed, so there are infinite tracks, and your accuracy literally shapes the plants.

## Core loop
Notes travel along 3 vine lanes toward a ring of seeds → tap the lane on the beat → hits play the melody note and grow that lane's plant; misses wilt it → at the end of the song you see the garden you grew.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Hit lane 1 / 2 / 3 | J K L (alternates: ← ↓ →) | tap the lane's hit pad (bottom third of the screen, split in 3) |
| Hold notes | hold the key | hold the finger |
| Pause | P / Esc | pause button |

## Music generation (WebAudio, all synthesized)
- Song = seed (an integer) → seeded PRNG (mulberry32). BPM 90–130 (by difficulty). Key: a random root from C..B, minor pentatonic.
- 4 layers scheduled with the AudioContext clock (a lookahead scheduler: every 25 ms schedule the events of the next 100 ms): kick (sine 150→40 Hz, every beat), hat (filtered noise, 8ths), bass (triangle, root/fifth per bar), and pad (2 detuned saws, low-pass, chord per 2 bars).
- The **melody** is NOT played automatically: each note chart event has a pitch, and it sounds only when the player hits it (pluck: square + quick decay). A miss plays nothing (a soft muted click).
- Length: 32 bars (~1:00–1:25) for Easy, 48 bars for Normal/Hard.

## Chart generation
- Grid: 8th notes. For each bar, a pattern density p (Easy 0.25, Normal 0.4, Hard 0.55) decides whether each 8th slot has a note; downbeats are always a note on Easy. Never more than 1 note per slot (no chords) on Easy/Normal; Hard allows 2-lane chords at 10%.
- Lane = melody pitch mapped low/mid/high (contour-following: the melody walks the pentatonic scale by steps ±1–2, and its lane follows its pitch band). Centering bias: after 6+ consecutive notes in one band, the next steps bias toward the middle, so every lane gets ≥ 15% of a song's notes.
- Hold notes: ~12% of notes are candidates (not Easy), lasting 2–4 eighths; a hold that would not leave a 1-eighth gap before the next same-lane note becomes a tap (the effective share is ~5–8%).
- Sections repeat (AABA phrasing over 8-bar blocks) so songs are learnable.

## Timing & judgment
- All timing is from `audioCtx.currentTime` (never from rAF time). Notes are rendered by `(noteTime − now) × scrollSpeed`.
- Windows: Perfect ±45 ms, Good ±90 ms, Miss beyond that (a note passing +90 ms is a miss). A **stray press** (no note within ±90 ms in that lane) resets the combo and costs that lane's plant −0.5 growth (no accuracy change). Hold: must be held until the end − 60 ms.
- **Calibration**: a 4-beat tap test on the title (Settings → Calibrate) storing an offset in localStorage `pulseGarden.offset`, applied to judgment.
- Score: Perfect 300, Good 100, ×(1 + combo/50, max ×2). Accuracy % = weighted hits (Perfect 1.0, Good 0.7, Miss 0; a hold counts as one note, scored on its head, and an early release counts as a Miss). Songs start with a 4-beat count-in. 48-bar form: A A B A A A. Grade S ≥95, A ≥88, B ≥78, C ≥65, else D.

## Garden
- 3 plants, one per lane, each a procedural L-system-ish branching stem drawn at the top of its lane. Growth 0–100: Perfect +1.2, Good +0.7, Miss −1.5 (it wilts: the color desaturates, droops). Flowers bloom at 40/70/95 with a burst.
- The end screen shows the final garden large, plus the grade, the accuracy, the max combo and the seed (with "Replay this song" and "New song").

## Difficulty
Title menu: Easy / Normal / Hard (BPM 90–100 / 105–115 / 120–130, the densities above, scroll speed 280/340/420 px/s).

## Feel & juice
- Palette: bg #0d0b1a → #1a1238, lanes #3ee6a8 / #7aa2ff / #ff7ad9, notes as glowing seeds, the hit ring pulses on every beat (driven by the audio clock).
- Hit: a lane flash + petal particles + "PERFECT"/"GOOD" text; combo milestones (25/50/100) give a garden-wide sparkle.
- The fail state: if all 3 plants reach 0 → the song ends early ("The garden withered").

## Screens
- Title: name, difficulty select, seed field (optional; random by default), Calibrate, best grade per difficulty, controls.
- Play: 3 vertical lanes, hit pads, the plants at the top, score/combo/accuracy.
- Pause (suspends the AudioContext); results.

## Acceptance checklist
- [ ] The audio starts only after a user gesture; no clicks/pops; the scheduler keeps time when frames drop.
- [ ] Notes reach the hit line exactly on their beat (visual vs audio sync within one frame).
- [ ] Judgment windows and the calibration offset work; hold notes work for keys and touch.
- [ ] The same seed + difficulty produces the identical song and chart.
- [ ] Pause/resume keeps audio and notes in sync; visibilitychange pauses.
- [ ] Multi-touch: two lanes can be held at once on touch.
- [ ] Results screen; best grade per difficulty persists; restart works.
- [ ] Expose window.__game also with `songTime`.
