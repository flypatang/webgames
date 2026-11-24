# Drift Lines
slug: drift-lines · genre: top-down racing (time trial) · session length: 1–5 min per track

## Pitch
A neon top-down drift racer on endless procedurally generated tracks. Each track comes from a seed. Race your own ghost, chain drifts for boost, and shave tenths off a 3-lap time trial.

## Core loop
Brake into a corner → flick into a drift → hold the drift angle to fill boost → release on the exit with boost → beat the ghost by a few tenths → retry instantly.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Steer | ← → / A D | left/right thirds of the bottom half of the screen (hold) |
| Throttle | auto (always on) | auto |
| Brake / drift trigger | ↓ / S / Space (hold) | the middle third of the bottom half (hold) |
| Boost | ↑ / W / Shift | the BOOST button (bottom-right) |
| Restart run instantly | R | the ↺ button |
| Pause | P / Esc | the pause button |

## Track generation (seeded, mulberry32)
- Pick 10–14 control points on a jittered circle (radius 900–1300 world px, angular jitter ±12°, radial jitter ±30%), sorted by angle, then smoothed into a closed Catmull-Rom spline sampled every 8 px.
- Reject and regenerate (next PRNG draw) if the curvature radius is anywhere < 70 px or if non-adjacent track segments come within 2.2× the track width of each other (self-overlap check, coarse grid).
- Track width 120 px. Kerbs (red/white) on the outside of tight corners (curvature radius < 220). A start/finish line at sample 0, plus 8 hidden checkpoints evenly spaced (all must be passed in order for a lap to count).
- Off-track = grass: grip × 0.45, max speed × 0.55, plus dust particles. There are no walls; going > 300 px from the centerline resets the car to the last checkpoint after 1 s (+2 s penalty).

## Car physics (fixed 120 Hz step)
- Bicycle-lite model: position, heading, velocity vector. Engine force 520 px/s², drag 0.9·v, max speed 560 px/s (boost 720).
- Grip: lateral velocity is damped toward 0 at rate 9/s normally. **Drift**: while the brake is held above 250 px/s with steering input, rear grip drops: lateral damping 1.6/s, steering rate ×1.4, speed loss 60 px/s². Releasing the brake ends the drift (grip blends back over 0.25 s).
- Steering rate 2.6 rad/s × speed factor (lower at very low and very high speed).
- **Boost meter** 0–100: while drifting with a slip angle between 15° and 55°, +35/s (×1.5 between 25° and 45°, the "sweet spot", shown by the car glow turning from blue to pink). Spinning out (slip > 75°) dumps the meter. Boost drains 50/s, giving +180 px/s² and a raised max speed.

## Modes
- **Time trial**: 3 laps, countdown 3-2-1. The ghost = your best run on this seed (stored compactly: position/heading sampled at 20 Hz, localStorage key `driftLines.ghost.<seed>`, capped at the last 20 seeds). Live delta vs the ghost at each checkpoint (+0.42 red / −0.31 green).
- **Medals** per track from a target time computed from track length: gold = length / 470 px/s × 3 laps, silver ×1.08, bronze ×1.18.
- **Track select**: "Daily" (seed = yyyymmdd), "Random" (new seed), or type a seed. Show the track minimap preview + the best time + the medal.

## Camera
Follows the car with look-ahead (velocity × 0.35 s), rotation fixed (north-up), zoom 1.0 at rest out to 0.8 at max speed. On portrait phones, zoom out an extra 15%.

## Feel & juice
- Palette: asphalt #14141f, the track edge glow #3df2ff, kerbs #ff3b6b/#ffffff, grass #0f2a1e, car #ffe14d with a glowing trail; tire marks (dark strips that fade after 6 s, a capped buffer) while drifting.
- Sounds: an engine (a sawtooth whose pitch is proportional to speed, through a low-pass), a drift screech (filtered noise whose gain follows the slip), a boost whoosh, checkpoint blips, a lap chime, a medal fanfare.
- Screen shake on a spin-out (3 px). A slow-mo 0.3 s on the finish line.

## Screens
- Title/track select (above). HUD: lap n/3, the current time, the best, the ghost delta, the boost meter (a vertical bar), a minimap (top-right) with the car + ghost dots.
- Pause (resume / restart / track select). Results: the time, lap splits, medal, "New best!" and Retry / Next random / Change track.

## Acceptance checklist
- [ ] Generated tracks are valid for 1000 seeds (no self-overlap, min curvature respected), and the same seed = the same track.
- [ ] Laps only count with all checkpoints passed in order; going backwards doesn't count; the reset-to-checkpoint penalty works.
- [ ] Drift + boost feel controllable; the sweet-spot glow is visible; spin-outs are possible but avoidable.
- [ ] The ghost replays exactly and is stored per seed; the delta is correct at checkpoints.
- [ ] Balance evidence (seeded harness, ≥ 20 seeds): a scripted pure-pursuit driver (no drifting) finishes within bronze–silver; the same driver with a simple corner-drift rule beats its own no-drift time on ≥ 70% of seeds (the drift must be worth it). Medal formula adjusted if not.
- [ ] Touch zones work with multi-touch (steer + brake at once) at 375 px; the minimap and HUD are readable.
- [ ] Restart is instant (< 100 ms) and resets the run; bests persist.
