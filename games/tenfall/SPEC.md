# Tenfall
slug: tenfall · genre: puzzle · session length: 3–8 min

## Pitch
Numbered tiles drop into a 6-column well. Make any straight line of adjacent tiles (horizontal or vertical) that adds up to exactly 10 and it shatters, so the tiles above it tumble down into new sums and chains.

## Core loop
See the current tile + the next 2 → choose a column → drop → sums resolve and cascade → plan around awkward numbers before the well overflows.

## Controls
| Action | Keyboard | Pointer/Touch |
|---|---|---|
| Move the drop cursor | ← → / A D | move pointer over a column / drag |
| Drop | ↓ / Space / S | tap/click a column (drops there) |
| Hold/swap the current tile (once per drop) | C / Shift | tap the HOLD box |
| Pause | P / Esc | pause button |

## Entities & rules
- Grid of 6 columns × 10 rows. Cell size fits the screen; the board sits centered with a side panel (desktop) or a top panel (narrow screens < 520 px).
- **Tiles**: values 1–9. Random generation uses a weighted bag: 1–5 weight 3, 6–9 weight 2. Every 8th tile is guaranteed to be the complement (10 − v) of a random tile currently on the board top surface (if any), to reduce frustration.
- **Drop**: the tile falls instantly to the lowest empty cell in the column (animated, 0.15 s). Dropping into a full column = game over.
- **Clear detection** after each settle: find every maximal-or-not contiguous horizontal or vertical run of length ≥ 2 whose sum is exactly 10 (check all sub-runs). Mark all cells in any such run; clear them simultaneously. Then apply gravity per column, and repeat (chain) until no clears remain.
- **Scoring**: each cleared tile = 10 pts × run length bonus (2 tiles ×1, 3 ×1.5, 4+ ×2), multiplied by chain step (1, 2, 3, …). A full-row clear (all 6 cells in one row in a cleared set) gives +500.
- **Wild tile "★"** (appears 1 in 25 from level 3): when it lands it takes the value that makes the best immediate clear (the largest number of tiles cleared); if none, it becomes 5.
- **Rock tile "■"** (from level 4, 1 in 15 drops, inserted as the current tile): has no value, never part of a sum, and is destroyed when an orthogonally adjacent clear happens.
- **Level**: every 15 tiles cleared, the level goes up by 1. From level 2, a "pressure" timer: if you don't drop within T seconds the tile auto-drops in the cursor column (T = 8 s at level 2, −0.5 s per level, min 3 s), shown as a shrinking bar.
- **Garbage**: from level 5, every 10 drops a row of random tiles (values 1–9, guaranteed no instant 10-sum) pushes up from the bottom; if that pushes a tile above row 10 → game over.

## Difficulty curve
Driven by the level, as above: faster pressure timer, rocks at level 4, garbage rows at level 5, wilds from level 3 as the release valve.

## Win / lose
Endless. Game over when a tile can't be placed or garbage overflows. Best score in localStorage `tenfall.best`.

## Feel & juice
- Palette: bg #14121f, well #1f1c33 with a subtle grid, tiles colored by value along a gradient from #4cc9f0 (1) through #b5179e to #f72585 (9), white bold numerals. Rock #555a66. Wild: rainbow shimmer.
- A ghost preview of where the tile will land in the hovered column, and preview highlight: if dropping here would make a 10, outline the would-be-cleared cells softly.
- Clear: tiles flash white, then burst into particles; a "10!" pop; the chain counter grows ("CHAIN ×3"), with a pitch that rises per chain step (square wave 440·1.25^chain Hz). Drop: a soft thunk. Garbage: a low rumble + 4 px shake.

## Screens
- Title: name, a 3-step mini tutorial (illustrated with tiles: 3+7, 2+3+5, vertical 4/6), controls, best score.
- HUD: score, level, current tile (large), next 2, HOLD box, pressure bar.
- Pause overlay; game over with score, best, longest chain, tiles cleared, retry.

## Acceptance checklist
- [ ] Horizontal and vertical runs that sum to 10 clear, including runs inside longer lines (e.g. row 8 1 2 7 clears 1 2 7 but not 8; row 9 1 2 7 clears all four because 9+1 and 1+2+7 both sum to 10) and overlapping runs.
- [ ] Chains resolve correctly, with an increasing multiplier.
- [ ] The landing preview is accurate, and the 10-highlight preview matches the actual first clear.
- [ ] Hold works once per drop.
- [ ] Wild, rock, pressure timer and garbage behave per spec at their levels.
- [ ] Game over triggers correctly; restart resets everything; best persists.
- [ ] Fully playable by touch at 375 px wide.
