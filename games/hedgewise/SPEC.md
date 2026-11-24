# Hedgewise
slug: hedgewise · genre: maze-building tower defense · session length: 6–12 min

## Pitch
Garden gnomes defend a moonlit herb garden from waves of hungry critters. You don't just place towers, you plant hedges that reshape the critters' path. The best defense is a long, winding maze lined with lanterns.

## Core loop
Between waves, spend seeds on hedges (cheap; they reroute the path) and gnome towers (expensive; they shoot) → watch the critters pathfind through your maze → earn seeds per kill → expand and upgrade before the next wave.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Select a build tool | 1 Hedge · 2 Pebble Gnome · 3 Frost Gnome · 4 Bell Gnome · Q Sell | tap the toolbar buttons |
| Place / upgrade / sell | arrows/WASD move the grid cursor, Space/Enter acts | tap a cell (shows a confirm ghost first; tap again to confirm) |
| Start the next wave now (+bonus seeds) | N | "Next wave" button |
| Speed ×1/×2 | F | speed button |
| Pause | P / Esc | pause button |

## Grid & path
- 12 columns × 16 rows (portrait-friendly; landscape centers the board with the toolbar on the right). Entrance: top-middle cell (col 5–6), exit: bottom-middle.
- Critters path with BFS on the grid (4-directional) from the entrance to the exit. Recompute when the layout changes; critters already walking re-path from their current cell.
- **Never block**: a placement that would leave no path from the entrance to the exit, or trap any living critter, is rejected (red ghost + "Path blocked" message). Validate with BFS before committing.
- Show the current path as faint dots during the build phase (and during waves at low alpha).

## Build items (costs in seeds)
| Item | Cost | Effect | Upgrades (Lv2 / Lv3) |
|---|---|---|---|
| Hedge | 2 | blocks the path; can be built on later? No: hedges are separate cells. A gnome can only be placed ON a hedge (it converts the hedge) | – |
| Pebble Gnome | 10 (+8 if no hedge underneath: auto-places a hedge) | single target, range 2.5 cells, 1 dmg, 0.6 s fire rate | 15: 2 dmg · 25: 3 dmg + range 3 |
| Frost Gnome | 15 | slows by 40% for 1.5 s, range 2 cells, 0.3 dmg, 1 s rate | 20: slow 55% · 30: also slows 2 nearby critters |
| Bell Gnome | 20 | area pulse every 2 s, 1.5 dmg to all within 1.5 cells | 25: 2.5 dmg · 35: radius 2 |
| Sell | – | refund 70% of the total invested (hedges 100% during the build phase) |
Gnomes target the critter **furthest along the path** within range.

## Critters (waves)
- Wave w composition from a table (and a formula after wave 10): Slug (HP 4, speed 1.0 cells/s, 1 seed), Beetle (HP 10, speed 0.7, armored: −0.5 per hit, min 0.3, 2 seeds), Hare (HP 3, speed 2.0, 2 seeds), Mole (HP 8, speed 0.9, from wave 6: ignores hedges, walks straight down the column (but not gnomes) — it must be shot, 3 seeds), Boss Badger every 5th wave (HP 60 + 30·(w/5−1), speed 0.5, 15 seeds).
- HP scale per wave: × (1 + 0.12·(w−1)). Count: 8 + 2w (max 40) for normal waves. Spawn interval 0.8 s.
- Waves 1–10 table: 1 slugs; 2 slugs; 3 slugs+hares; 4 beetles+slugs; 5 boss + slugs; 6 moles+slugs; 7 hares+beetles; 8 mixed; 9 beetles+moles; 10 boss + mixed. After 10: a random mix, weighted by the unlocked types.

## Economy
Start 40 seeds, 20 lives. A critter reaching the exit costs 1 life (boss: 5). Wave clear bonus: 5 + w. Calling the next wave early: +1 seed per remaining second of the 20 s build timer. (The build phase auto-ends after 20 s; the first build phase is unlimited until the player presses Next.)

## Win / lose
Endless waves; game over at 0 lives. Score = waves cleared × 100 + kills. Best wave and score in localStorage `hedgewise.best`.

## Feel & juice
- Palette: night garden #12201a → #1b2e24 checker, hedges #2f6b3a with rounded leafy tops, gnomes in red/blue/gold hats, critters as simple cute silhouettes with an HP bar when damaged. Lantern glow around each gnome (range ring visible while placing/selected).
- Projectiles: pebbles arc, frost is a sparkle beam, a bell ring expands. A kill gives a seed pop "+1" flying to the counter, and a small leaf burst. A life lost gives a red flash on the exit + a thump. A wave start horn (two square notes); a boss has a deeper horn + 4 px shake.

## Screens
- Title: name, a short "How to play" (3 lines: hedges reroute, gnomes sit on hedges, never fully block), controls, best.
- HUD: seeds, lives, wave, the next-wave preview icons, the toolbar with costs (greyed when unaffordable), speed and pause.
- Selected gnome panel: level, upgrade cost, sell value. Pause; game over with the wave reached, kills and score.

## Acceptance checklist
- [ ] Placement can never block the path or trap a critter (fuzz test: 10,000 random placement attempts on random boards).
- [ ] Critters re-path correctly mid-wave when a hedge is sold; moles ignore hedges but not gnomes (they path around gnomes only).
- [ ] Targeting = furthest along the path; frost slow and armor work; the bell hits all in radius.
- [ ] The economy, upgrade and sell refunds are exact.
- [ ] The early-call bonus and the build timer work; ×2 speed doesn't break physics (use a fixed timestep).
- [ ] Balance evidence (seeded harness, ≥ 20 runs): a scripted "reasonable" strategy (a serpentine hedge maze + mixed gnomes) reaches a median wave 12–20; a no-maze strategy (gnomes only beside the straight path) reaches a median wave 5–9.
- [ ] Fully playable by touch at 375 px (tap-confirm placement, readable toolbar).
- [ ] Restart resets everything; best persists.
