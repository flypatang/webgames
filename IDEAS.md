# Shipped & queued concepts
Check this before pitching so concepts and genres stay varied.

| # | slug | title | genre | core mechanic | status |
|---|---|---|---|---|---|
| 1 | orbit-courier | Orbit Courier | arcade physics | release from orbit, gravity slingshot | shipped |
| 2 | tenfall | Tenfall | puzzle | drop tiles, lines summing to 10 clear | shipped |
| 3 | wisp-herder | Wisp Herder | action / herding | boids flock repelled by keeper's light | shipped |
| 4 | pulse-garden | Pulse Garden | rhythm | seeded generated songs, hits grow plants | shipped |
| 5 | candle-crypt | Candle Crypt | turn-based roguelike | wax = HP + clock, light radius | shipped |
| 6 | hedgewise | Hedgewise | maze-building tower defense | hedges reroute the path, gnomes sit on hedges | building |
| 7 | drift-lines | Drift Lines | top-down racing | seeded tracks, drift fills boost, ghost | building |
| 8 | soot-sprite | Soot Sprite | vertical platformer | wall-jump climber vs rising embers | building |

## Backlog (minor follow-ups)
- orbit-courier: a respawn-caused retarget shouldn't reset the combo; the THRUST_A comment (line 34) is stale.
- pulse-garden: the results-screen plants are limited by the lane-width clamp (the 1.9× scale has little visible effect); consider a wider results layout.
- pulse-garden: a hold released during pause is dropped on resume (acceptable; could keep it until a re-press).
