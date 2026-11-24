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
- Reject and regenerate (next PRNG draw) if the curvature radius is anywhere < 70 px, or if the tightest corner's radius is > 180 px (every track needs a corner worth drifting), or if non-adjacent track segments come within 2.2× the track width of each other (self-overlap check, coarse grid).
- Track width 120 px. Kerbs (red/white) on the outside of tight corners (curvature radius < 220). A start/finish line at sample 0, plus 8 hidden checkpoints evenly spaced (all must be passed in order for a lap to count).
- Off-track = grass: grip × 0.45, max speed × 0.55, plus dust particles. There are no walls; going > 300 px from the centerline resets the car to the last checkpoint after 1 s (+2 s penalty).

## Car physics (fixed 120 Hz step)
- Bicycle-lite model: position, heading, velocity vector. Engine force 520 px/s², drag 0.9·v, max speed 560 px/s (boost 720).
- **Grip mode**: lateral velocity is damped toward 0 at rate 9/s, but the grip force is limited to 750 px/s² of lateral acceleration. Cornering beyond that limit **understeers**: the car slides wide (the excess lateral velocity isn't removed) and scrubs speed at 320 px/s² while over the limit. Plain braking (brake with no steering, or below 250 px/s) is 700 px/s².
- **Drift** (arcade model): starts when the brake is held above 250 px/s with steering input. While drifting, the car's slip angle (heading vs velocity direction) eases toward a target = 15° + 30°·|steer| (full steer = 45°) at 6 rad/s, on the steer side; the velocity direction rotates toward the heading at the steering rate × 1.4 (so the car turns tighter than grip allows), the speed bleeds only 25 px/s², and the grip limit doesn't apply. (Note: at 45° slip the thrust is ×cos(slip), so a steady drift is ~380 px/s; drift wins in tight corners and through boost.) Releasing the brake ends the drift: over 0.25 s the velocity **direction** swings to the heading while its **magnitude is preserved** (no speed lost on exit).
- Steering rate 2.6 rad/s × speed factor (lower at very low and very high speed). Keyboard steer eases toward ±1 at 4/s; touch is the same.
- **Grass slide**: in grip mode on grass, slip can grow large (a sideways slide that bleeds speed). This is intended feedback, not a fail state.
- **Overspeed** (after boost ends, or entering grass): speed above the current max isn't clamped instantly; it decays toward the max at 250 px/s².
- **Boost meter** 0–100: while drifting with a slip between 15° and 55°, +35/s (×1.5 in the 30°–50° sweet spot, shown by the car glow turning from blue to pink). Boost drains 50/s, giving +180 px/s² and a raised max speed.

## Modes
- **Time trial**: 3 laps, countdown 3-2-1. The ghost = your best run on this seed (stored compactly: position/heading sampled at 20 Hz, localStorage key `driftLines.ghost.<seed>`, capped at the last 20 seeds). Live delta vs the ghost at each checkpoint (+0.42 red / −0.31 green).
- **Medals** per track from a target time computed from track length: gold = length / V_GOLD × 3 laps, silver ×1.08, bronze ×1.18. V_GOLD = 525 px/s (calibrated by the reviewer's optimized drivers: a skilled drift driver ≈ gold × 1.01–1.02, no-drift ≈ bronze).
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
- [ ] Drift + boost feel controllable; the sweet-spot glow is visible; no instant speed snaps.
- [ ] The ghost replays exactly and is stored per seed; the delta is correct at checkpoints.
- [ ] Balance evidence (seeded harness, ≥ 20 seeds): the drift driver (drift into corners whose radius is < 250 px, using boost on straights) beats the same driver without drifting on ≥ 70% of seeds; the no-drift driver lands between silver and bronze; V_GOLD is calibrated as above.
- [ ] Touch zones work with multi-touch (steer + brake at once) at 375 px; the minimap and HUD are readable.
- [ ] Restart is instant (< 100 ms) and resets the run; bests persist.
