# Candle Crypt
slug: candle-crypt · genre: turn-based roguelike · session length: 5–10 min

## Pitch
A bite-sized roguelike where your candle is your life and your clock. Every step burns wax; every light you leave behind shows the way back. Dive as deep as the wax allows.

## Core loop
Step through a dark grid (only your candle's radius is visible) → bump to fight, grab wax and relics → decide whether to explore for loot or rush the stairs before the wax runs low → descend.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Move / attack (bump) | arrows / WASD (4-way) | swipe, or tap an adjacent tile; tapping a farther seen tile auto-walks one step per 120 ms along the shortest known path, stopping on damage/drain, a newly visible enemy, or descending |
| Wait one turn | Space / . | tap your own tile |
| Use relic slot 1/2 | 1 / 2 | tap the slot icon |
| Pause | P / Esc | pause button |

## Map
- Each floor is a 15×15 grid of rooms+corridors: generate 5–7 non-overlapping rectangular rooms (3–6 wide; rooms may touch; aim for an even spread of 5/6/7 rooms), connect them in sequence with L-shaped corridors, and add 1–2 extra connections for loops. Guarantee connectivity (BFS check; regenerate if not).
- Tiles: wall, floor, stairs (in the room farthest from the start by BFS), wax pickup, relic chest, sconce.
- Render: tile 32 logical px (the view is a 15×15 board scaled to fit, plus a HUD). **Light**: tiles within the candle radius (Euclidean, line of sight via a Bresenham check) are lit; seen-but-unlit tiles render dim (remembered); never-seen tiles are black.

## Rules
- Turn-based: the player acts, then every enemy acts. Animate moves tweened over 80 ms, but logic is instant.
- **Wax** (HP + clock): starts 100, max 100. Each player turn −1. Taking damage subtracts wax. Wax 0 = death. Light radius = 2 + ceil(wax/25) (so 3–6).
- **Pickups**: wax drips (+12), count per floor = max(2, rand(3..5) − floor((floor−1)/3)); descending gives +8.
- **Sconces**: 2 per floor; stepping next to one and pressing toward it lights it (cost 5 wax plus the normal 1-turn cost; needs wax > 6): it permanently lights radius 4 around it on this floor and enemies within it are "Revealed" (they take +1 damage).
- **Player attack**: 2 damage (+relic modifiers). Enemies:
  - Rat (floor 1+): 2 HP, −4 wax per hit, moves toward the player if within 6 tiles (BFS step), otherwise wanders.
  - Ghoul (floor 2+): 5 HP, −8 wax per hit, acts (moves or attacks) every other turn.
  - Wisp-eater (floor 3+): 3 HP, does no damage but drains 3 wax per turn while adjacent; moves 1 tile per turn; flees light (it won't step into sconce light).
  - Bone archer (floor 4+): 3 HP, stays put, shoots along the 8 straight/diagonal lines up to 5 tiles (blocked by walls/sconces): −4 wax; telegraphs with a red line one turn before firing.
  - Spawn: 3 + floor enemies (max 10), never within 4 tiles of the start.
- **Relics** (chests, 1 per floor; 2 slots; when full, choose a replacement): Ember Blade (+1 attack), Tallow Ward (the first hit the player takes each floor deals 0), Mirror Shard (use: swap places with any visible enemy, 1/floor; the player's landing tile is resolved as if stepped on), Smoke Bomb (use: for 3 turns enemies lose track AND don't attack or drain, even when adjacent; 1/floor), Long Wick (step cost only applies on every 2nd turn, i.e. −0.5 wax/turn; damage is unaffected), Bellows (use: push all adjacent enemies back 2 tiles, 1/floor; can't be used with no adjacent enemy). Stepping onto the stairs descends immediately, with no enemy phase (by design).
- **Score**: floor×100 + kills×10 + relics found×25.

## Difficulty curve
Enemy roster by floor as above; enemy count 3+floor (max 10); wax drips per the pickup formula. Spawn rule: Chebyshev ≥ 5 and walking distance ≥ 5 from the start.

## Win / lose
Endless descent; death at wax 0. Best floor and best score in localStorage `candleCrypt.best`.

## Feel & juice
- Palette: walls #2a2230, floor #3b3142 (lit) / #1a161e (remembered), candle light warm #ffcc66 radial gradient with flicker (radius jitter ±0.15 tiles), enemies as simple glyph-like silhouettes (rat, ghoul, wisp-eater, archer) drawn with canvas paths.
- Hit: a white flash on the target + "−2" text; taking damage: red vignette + 3 px shake; low wax (<25): the flame sputters and the heartbeat sound plays. Pickup wax: a tiny bright drip sound. Stairs: a descending tone sweep + fade transition.
- A message log (last 3 lines) at the bottom.

## Screens
- Title: name, a flickering candle illustration, the controls, best floor/score.
- HUD: a wax bar (also the candle icon height), floor, relic slots, log.
- Relic choice modal; pause; death screen with floor, kills, relics, score and the cause ("Snuffed by a Ghoul on floor 4").

## Acceptance checklist
- [ ] Floors are always connected; the stairs are reachable; nothing spawns inside walls.
- [ ] Line-of-sight lighting and remembered tiles are correct; enemies are only drawn when lit.
- [ ] Turn order is correct; each enemy type behaves per spec, including the archer telegraph and the wisp-eater avoiding light.
- [ ] Wax accounting is exact (step cost, damage, pickups, sconces, Long Wick).
- [ ] All six relics work; slot replacement works.
- [ ] Touch: swipe, tap-adjacent and tap-to-path all work at 375 px; auto-walk stops when an enemy appears.
- [ ] Restart resets everything; bests persist.
