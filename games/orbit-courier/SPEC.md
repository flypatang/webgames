# Orbit Courier
slug: orbit-courier · genre: arcade physics · session length: 2–5 min

## Pitch
You're a tiny delivery drone slingshotting between planets. One button lets go of your current orbit; your momentum and the gravity wells around you decide where you land. Deliver parcels to the glowing planet before the fuel clock runs out.

## Core loop
Orbit planet → time the release so the tangent line aims at the next planet → get captured by its gravity → a tiny thrust correction mid-flight → land in orbit → deliver/pick up → repeat as the course scrolls upward.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Release from orbit (when orbiting) | Space / Enter | tap / click |
| Micro-thrust while flying (hold, costs fuel) | Space / Up held | press and hold |
| Pause | P / Esc | pause button, top-right |

## Entities & rules
- World units = CSS pixels of a 480×800 logical playfield (portrait), scaled to fit and letterboxed.
- **Drone**: radius 6. While orbiting, it circles the planet at `orbitR = planet.r + 28` with angular speed `ω = 2.2 rad/s / sqrt(planet.r/30)`; direction alternates CW/CCW per planet (stored per planet). On release, velocity = tangent × (ω·orbitR).
- **Flight**: each planet pulls with `a = G·m / d²`, G·m = 300000·(r/30)² (≈90 px/s² at the orbit band of an r=30 planet). The planet just departed exerts NO gravity until the drone has once exited its well (d > wellR), so releases always leave cleanly, but only within `wellR = r·4`, so near-misses visibly curve toward the orbit band. The dotted preview must include this gravity. Max speed 420. While held in flight, thrust is 120 px/s² pointed from the drone toward the current target planet (a steering correction), and drains fuel at 10/s.
- **Capture**: if the drone enters `orbitR ± 10` of any planet other than the one it just left (or that same one after 0.6 s), snap it into orbit at its current angle, keeping the direction of travel's sign. Show a capture ring pulse.
- **Crash**: touching a planet surface (d < r + 6) or an asteroid → lose a life, respawn orbiting the last planet; 3 lives.
- **Lost**: leaving the screen by >60 px on the sides or bottom → lose a life (same respawn).
- **Planets**: r 18–44, random hue; procedurally placed going upward, gaps 140–240 px vertically, x in [60, 420], never overlapping wells too much (min center distance = r1 + r2 + 90).
- **Parcels**: exactly one planet ahead (2–4 planets up) is the **target** (pulsing gold ring + arrow indicator if off-screen). Reaching orbit there = delivery: +100 × combo, +40 fuel (cap 100), new target assigned further up. **Overshoot**: capturing a planet above the target (by index) counts as a miss: combo resets to 1, and a new target is assigned 2–4 planets above the captured one. Respawns never place the drone on the target planet.
- **Stars**: small collectibles floating between planets, +10 each, radius 5.
- **Asteroids** (from score 600): radius 10–16, drifting slowly horizontally, bouncing between screen sides.
- **Fuel**: starts at 100 and drains at 2.5/s always (the clock) plus thrust use. Capturing a planet higher than any reached before gives +6 fuel ("+fuel" text). At 0 the game is over.
- **Camera**: smoothly scrolls so the drone sits at ~65% screen height; never scrolls down.
- **Combo**: delivering with ≤2 intermediate captures = combo +1 (×1…×5); otherwise reset to 1.

## Difficulty curve
Every 3 deliveries: gaps grow +10 px (max 300), base drain +0.3/s (max 5.5), asteroid count per screen +1 (max 4), and some planets (20%, rising to 40%) slowly drift sideways at 20 px/s.

## Win / lose
Endless. The run ends when lives = 0 or fuel = 0. Score = points; best score saved to localStorage `orbitCourier.best`.

## Feel & juice
- Palette: space bg #0b1026 → #1b1446 vertical gradient, with a parallax starfield in 2 layers. Drone #7cf7ff with a fading trail (last 20 positions). Target ring #ffd166. Danger #ff4d6d.
- A dotted predicted trajectory (next 1.8 s, simulated with gravity, slow fade) while orbiting; if it ends in a capture, draw a bright ring on that planet (gold if it's the target). Orbit bands are drawn at alpha ~0.18.
- Release: a soft "whoop" (sine 300→600 Hz, 0.12 s). Capture: a bell (triangle 880 Hz, quick decay). Delivery: an arpeggio of 3 notes + gold particle burst + "+300 ×3" floating text. Crash: noise burst + 8 px screen shake for 0.3 s.
- The fuel bar turns red and pulses below 25.

## Screens
- Title: name, an animated orbiting demo drone, the controls, best score, "Tap / Space to start".
- HUD: score (top-left), combo, lives as drone icons, fuel bar (top, full width), pause button.
- Pause overlay. Game over: reason ("OUT OF FUEL" / "NO LIVES LEFT"), score, best (with "NEW BEST" if beaten), deliveries count, "Tap / Space to retry".

## Acceptance checklist
- [ ] Release from orbit flies along the tangent, and the trajectory preview matches the real path for its first 0.3 s.
- [ ] Captures occur reliably when passing through a planet's orbit band; no capture of the just-left planet within 0.6 s.
- [ ] The target indicator is always visible (arrow when off-screen).
- [ ] Crashes and going off-screen cost a life and respawn safely (0.8 s invulnerability, no instant re-crash).
- [ ] Fuel drains, and deliveries refill it; the game ends at 0 fuel.
- [ ] Asteroids appear after 600 points; the difficulty ramps per the curve.
- [ ] Restart fully resets everything; best score persists.
- [ ] Touch: tap releases, and hold thrusts in flight; works at 375 px wide.
