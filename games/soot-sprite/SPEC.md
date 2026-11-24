# Soot Sprite
slug: soot-sprite · genre: vertical platformer (endless climber) · session length: 2–5 min

## Pitch
You're a little soot sprite wall-jumping up an endless, crooked chimney while a tide of embers rises from below. Grab sparks to fuel a double-jump, slip through narrow flues, and see how high you can climb before the heat catches you.

## Core loop
Read the next chimney section → wall-jump zig-zag → choose the risky spark line or the safe route → stay ahead of the rising embers → the climb gets faster and the shaft gets trickier.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Move left/right | ← → / A D | hold the left / right half of the screen |
| Jump / wall-jump / double-jump | Space / ↑ / W (hold for a higher jump) | tap with a second finger, or swipe up anywhere; a quick tap on either half while touching the wall also jumps |
| Pause | P / Esc | pause button |

(Touch alternative: a "one-thumb mode" toggle on the title: the sprite auto-runs toward the nearest wall and any tap jumps. It must be completable at 375 px.)

## World
- Logical width 360 px (the shaft), with a variable viewport height. Generated in **segments** 240 px tall, stacked upward, from a seeded PRNG. Each segment picks a template and is parameterized:
  1. Zig-zag ledges (left/right alternating, ledge width 60–100).
  2. Narrow flue (the walls pinch to 90–120 px wide for 200 px: pure wall-jumping).
  3. Crumble ledges (fall 0.5 s after being touched, respawn after 4 s).
  4. Spike vents (a ledge with a fire vent active 1.2 s on / 1.5 s off, telegraphed by a glow 0.4 s before).
  5. Open drop (no walls for a 150 px span: requires a double-jump or a lucky line; always paired with a spark placed mid-span).
- Template weights by height: only 1–2 for the first 1000 px; then add 3, 4, 5 progressively. A **solvability rule**: any segment's next foothold must be within a reachable envelope (≤ 110 px vertical with a single jump from a ledge or a wall; ≤ 170 px when a spark is guaranteed on the route). Verify with a reachability check during generation; regenerate the segment if it fails.

## Physics (fixed 120 Hz step)
- Gravity 1500 px/s², max fall 700 px/s (wall slide max 140 px/s while pressing into a wall).
- Run speed 190 px/s with accel 2200 and air control 0.75.
- Jump velocity 520 (a variable jump: releasing early multiplies the upward velocity by 0.45). A wall-jump pushes 260 px/s away from the wall and 500 up; a 0.12 s input lock away from the wall. Coyote time 0.08 s; jump buffer 0.1 s.
- **Sparks**: collectibles (r 7) that give 1 double-jump charge (max 2 stored, shown as orbiting dots). The double-jump velocity is 460.
- Hazards: spike vents and the ember tide kill. Landing on a crumble ledge starts its timer.

## Ember tide
Starts 300 px below the player and rises at 40 px/s, +4 px/s per 500 px of climbed height (max 150). If the player is more than 600 px above it, it speeds up ×2 until within 450 (rubber-band so it stays threatening). Touching it = death. A heat shimmer + an orange glow + a warning vignette when within 150 px.

## Scoring
Score = max height climbed (in "meters" = px/10) + 25 per spark. Milestone banners every 100 m. Best height in localStorage `sootSprite.best`, with a "best height" line drawn on the wall during play.

## Feel & juice
- Palette: brick #2a1a17 with procedurally drawn mortar lines, soot sprite #111 with big white eyes and a fuzzy outline, sparks #ffcf4d, embers #ff6a2b → #ffd27a gradient, vents #ff3d2e.
- Squash and stretch on jump/land, little soot puffs on a wall-jump, spark pickups with a twinkle sound and a bright pop, a crumble shake + pebble particles, an ember whoosh loop that gets louder as it nears.
- Death: the sprite poofs into ash; slow-mo 0.4 s; "Climbed 312 m".

## Screens
- Title: name, an animated sprite idling on a ledge, the controls, one-thumb toggle, best.
- HUD: height (m), sparks/double-jump charges, the distance to the embers (bar), pause.
- Pause; game over with the height, sparks, best, and retry.

## Acceptance checklist
- [ ] Wall-jumping feels tight (coyote time, jump buffer, variable jump all work); no sticking to the walls or tunneling at max fall speed.
- [ ] Every generated segment is solvable (reachability check; fuzz 2000 segments with zero unsolvable).
- [ ] Crumble ledges, vents (with a telegraph) and the open drop + guaranteed spark behave per spec.
- [ ] The ember tide speed/rubber-banding works; death and restart are clean.
- [ ] Balance evidence (seeded harness, ≥ 20 runs): a scripted climber bot that follows the reachability path with human-like 120 ms input delay reaches a median of 150–400 m; it never dies to an unsolvable segment.
- [ ] Touch: both the two-zone mode and the one-thumb mode are playable at 375 px; multi-touch (hold right + tap jump) works.
- [ ] Restart resets everything; best persists.
