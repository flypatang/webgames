# Game Factory — Pipeline & Standards

## Roles (model split is mandatory)
| Stage | Who | Model |
|---|---|---|
| Concept, design spec, orchestration, final accept | Orchestrator | Opus |
| All code implementation and fixes | `game-builder` | Haiku |
| Code review + play-test verdict | `game-reviewer` | Sonnet |

The orchestrator never writes game code. The reviewer never edits files.

## Pipeline per game
1. **Concept**: the orchestrator picks an original concept that is not already in `IDEAS.md` (varied genres; no clones of existing branded games).
2. **Spec**: the orchestrator writes `games/<slug>/SPEC.md` from `templates/SPEC_TEMPLATE.md`.
3. **Build**: the Haiku builder implements `games/<slug>/index.html` and runs `node tools/smoke.js games/<slug>` until it passes.
4. **Review**: the Sonnet reviewer reads the spec and code, runs the smoke test, and returns `PASS` or `FAIL` with a numbered fix list.
5. **Fix loop**: on FAIL, the Haiku builder applies the fix list, then step 4 runs again. Stop after 3 rounds and escalate to the orchestrator.
6. **Ship**: the orchestrator updates `IDEAS.md`, regenerates the gallery (`node tools/gallery.js`) and commits `game: <slug> — <title>`.

## Technical standards (every game)
- One self-contained `index.html`: vanilla JS + `<canvas>`, inline CSS/JS, **no external requests** (no CDNs, fonts, images). Art is procedural or drawn shapes; sound uses WebAudio synthesis (muted until the first user input).
- States: title screen → playing → game over → restart, with no page reload needed.
- Controls: keyboard **and** pointer/touch. Show the controls on the title screen.
- Canvas scales to the window (letterboxed and DPR-aware), and the game stays playable at 375px wide.
- A fixed-timestep update (or a dt clamped to ≤ 50ms) so a tab switch doesn't break the physics.
- Persist a high score in `localStorage` (inside try/catch).
- Pause on `P`/`Esc` and on `visibilitychange`.
- Overlay priority: game over > pause > any other modal. Every modal must be dismissible by touch, and death/pause must never be hidden behind another modal.
- Movement keys support key-repeat (throttled) where holding a direction makes sense.
- Zero console errors. `requestAnimationFrame` for the game loop and rendering (the only allowed exception is a short `setInterval` WebAudio lookahead scheduler).
- Expose `window.__game = { state, score }` (kept updated) so the smoke test can observe it.
- Target size is under 1500 lines; readable, with sections commented.

- Balance claims need evidence: a seeded, deterministic harness (call the update function directly with a seeded RNG) and ≥ 20 runs per configuration. A handful of real-time bot runs proves nothing. Before blaming the game, check whether a bot's strategy is just weak.

## Quality bar (the reviewer judges this)
- Clear goal within 5 seconds, a satisfying core loop, and difficulty that ramps.
- Juice: screen shake/particles/tweens/sound on key events.
- No soft-locks, unwinnable states or input bugs; restart fully resets state.
