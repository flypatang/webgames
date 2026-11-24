# Wisp Herder
slug: wisp-herder · genre: action / herding · session length: 3–6 min

## Pitch
You're a lantern-keeper in a night meadow. Glowing wisps flock like birds and shy away from your light. Push the flock into the shrine before the shadow-moths pick off the stragglers.

## Core loop
Read the flock's shape → circle and press from behind to steer it → pinch stragglers back in → guide the group through the shrine gate → the next night is bigger and moodier.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Move the keeper | WASD / arrows | the keeper walks toward the held pointer/finger |
| Flare (big repel burst, 3 s cooldown) | Space | double-tap / right-click |
| Pause | P / Esc | pause button |

## Entities & rules
- Logical playfield 800×600 (landscape), scaled and letterboxed. On portrait phones, use a 600×800 logical field (same rules).
- **Keeper**: radius 12, speed 170 px/s (pointer: moves toward the target point, stopping within 6 px). Repel aura radius 110.
- **Wisps** (boids): radius 5, max speed 90, max force 140 px/s². Weights: separation 1.6 (radius 18), alignment 0.8 (radius 50), cohesion 0.7 (radius 60), wander 0.3, edge-avoid 1.5 (within 30 px of a wall, except across the shrine gate span), fear of moths 1.8 (within 70 px), and repel from the keeper 2.5 × (1 − d/110)² within 110. Flare: an instant impulse of 260 px/s away from the keeper within 200 px (it may exceed the max speed and decays back at exp(−3t)), plus a ring VFX; it affects wisps and moths alike.
- **Shrine**: a gate 120 px wide on one edge (a random edge each night, never the same as the previous night), plus a 60 px deep glowing zone. A wisp entering the zone is "saved": it spirals in and fades (+10 pts, chime).
- **Shadow-moths**: from night 2. Radius 9, speed 60, they target the wisp farthest from the flock centroid; touching it = that wisp is lost (dims and flies off), then the moth **feeds** for 2.5 s (stationary, pulsing; the flare stun lasts 4 s on a feeding moth). Moths flee the keeper's aura (repel 3.0) and are stunned 2 s by a flare. Count = night − 1 (max 5); they respawn from the edges 4 s after being stunned off-screen.
- **Obstacles**: 3–6 stone circles (r 20–45), placed randomly with ≥ 90 px of clearance from the shrine and the spawn area; wisps and the keeper collide with them (push-out).
- **Night**: N wisps = 12 + 4·(night−1) (max 40), spawned clustered in the field opposite the shrine. Timer = 70 s + 5 s·night. The night ends when no wisps remain in the field (saved + lost = N) or the timer hits 0 (the remaining wisps count as lost).
- **Pass**: saved ≥ 60% of N → next night. Otherwise game over. Bonus (on a pass only): +5 per second left; "Perfect" (no losses) +100. Wind gusts are a positional drift.

## Difficulty curve
More wisps, more moths (night−1, max 5), more obstacles (3 + night/2, max 6), and from night 4 a wind gust every 10 s pushes all wisps 40 px/s in a random direction for 2 s (with a direction arrow shown 1 s beforehand).

## Win / lose
Endless nights; game over on a failed night. Best score in localStorage `wispHerder.best`.

## Feel & juice
- Palette: deep night #0a1420 → #13243a gradient, grass tufts drawn procedurally, wisps #bff8ff with additive glow and short trails, keeper lantern #ffcf6b with a soft radial light (draw a darkness overlay with the lantern + wisps as light holes, alpha 0.55), moths #3a1d4a with flickering wings, shrine #8fffc1.
- Save: a rising chime (pentatonic note by count). Loss: a muffled low thud + the wisp dims. Flare: a whoosh + a white ring + 4 px shake. Night clear: a soft chord + "Night N cleared" banner.

## Screens
- Title: name, a small live flock wandering behind, the controls, best score.
- HUD: night, timer, saved/needed (e.g. "9 / 10 needed of 16"), flare cooldown ring around the keeper, score.
- Between nights: a summary card (saved, lost, bonus), tap/Space to continue. Pause; game over with the reached night and score.

## Acceptance checklist
- [ ] The flock behaves cohesively and visibly avoids the keeper; it can be steered into the shrine by a human with ~20 s of practice.
- [ ] Wisps never get permanently stuck in corners or inside obstacles.
- [ ] Moths pick off stragglers, flee the aura, and are stunned by a flare.
- [ ] Night pass/fail threshold and timer work; the summary is correct.
- [ ] Portrait phones get a rotated field with the same playability; touch move + double-tap flare work at 375 px.
- [ ] Performance: 40 wisps + 5 moths at 60 fps (use simple O(n²), fine at this size).
- [ ] Restart resets everything; best persists.
