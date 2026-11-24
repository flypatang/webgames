#!/usr/bin/env node
'use strict';
// Smoke test for games. Plays each game headless in two passes and reports PASS/FAIL per check.
//
// Usage (from the repo root or any cwd; paths are relative to the cwd):
//   node tools/smoke.js games/<slug>
//   node tools/smoke.js --all            # every games/<dir>/ that has an index.html
// Optional env: SMOKE_SEED=<int> to replay the same random input sequence.
//
// Exit code 0 only if every check in every game passes.

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const PASSES = [
  { name: 'desktop', viewport: { width: 960, height: 640 }, touch: false },
  { name: 'mobile', viewport: { width: 375, height: 667 }, touch: true },
];
const PLAY_MS = 6000;
const ACTION_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];
const MAX_DETAIL_ERRORS = 10;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Small seeded PRNG (mulberry32) so a failing run can be replayed with SMOKE_SEED.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function findTargets(arg) {
  if (arg !== '--all') return [arg.replace(/[\\/]+$/, '')];
  const root = path.resolve('games');
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, 'index.html')))
    .map((d) => path.join('games', d.name))
    .sort();
}

// Runs one viewport pass. Never throws: unexpected failures become a failed check.
async function runPass(browser, gameDir, pass, seed) {
  const rng = mulberry32(seed);
  const checks = [];
  const errors = [];
  const externals = [];
  const states = []; // distinct __game.state values, in the order first seen
  let initial = null;
  let actions = 0;
  const check = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail });
  const note = (s) => {
    if (!states.includes(s)) states.push(s);
  };
  const started = Date.now();

  let context;
  try {
    context = await browser.newContext({
      viewport: pass.viewport,
      hasTouch: pass.touch,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    page.on('request', (req) => {
      const url = req.url();
      // data:, blob: and about: never leave the page, so they are not external requests.
      if (!/^(file|data|blob|about):/i.test(url)) externals.push(url);
    });

    const readState = () =>
      page
        .evaluate(() => {
          const g = window.__game;
          if (!g) return '<no __game>';
          const s = g.state;
          if (s === undefined) return '<undefined>';
          return typeof s === 'object' ? JSON.stringify(s) : String(s);
        })
        .catch((e) => `<eval error: ${e.message.split('\n')[0]}>`);

    const tapAt = (x, y) => (pass.touch ? page.touchscreen.tap(x, y) : page.mouse.click(x, y));
    const canvasBox = () => page.locator('canvas').first().boundingBox();

    // 1. Load the file:// URL. domcontentloaded, so a slow external resource cannot hang the pass.
    const fileUrl = pathToFileURL(path.join(gameDir, 'index.html')).href;
    try {
      await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 5000 });
      check('page loads', true);
    } catch (e) {
      check('page loads', false, e.message.split('\n')[0]);
    }

    // 2. Canvas present.
    const hasCanvas = (await page.locator('canvas').count()) > 0;
    check('<canvas> present', hasCanvas, hasCanvas ? '' : 'no <canvas> element');

    // 3. window.__game with state and score, within 2s.
    let gameReady = false;
    try {
      await page.waitForFunction(
        () => {
          const g = window.__game;
          return !!g && typeof g === 'object' && 'state' in g && 'score' in g;
        },
        null,
        { timeout: 2000, polling: 100 }
      );
      gameReady = true;
      check('window.__game has state and score within 2s', true);
    } catch {
      check('window.__game has state and score within 2s', false, 'missing or no state/score after 2s');
    }

    // 4. Play session (only if the game is reachable).
    if (gameReady && hasCanvas) {
      initial = await readState();
      note(initial);
      await sleep(500);
      try {
        await page.keyboard.press('Enter');
        note(await readState());
        await page.keyboard.press('Space');
        note(await readState());
        const box = await canvasBox();
        if (box) await tapAt(box.x + box.width / 2, box.y + box.height / 2);
        note(await readState());

        const deadline = Date.now() + PLAY_MS;
        while (Date.now() < deadline) {
          if (rng() < 0.6) {
            const key = ACTION_KEYS[Math.floor(rng() * ACTION_KEYS.length)];
            await page.keyboard.down(key);
            await sleep(20 + rng() * 60);
            await page.keyboard.up(key);
          } else {
            const b = await canvasBox();
            if (!b) break;
            await tapAt(b.x + rng() * b.width, b.y + rng() * b.height);
          }
          actions++;
          note(await readState());
          await sleep(20 + rng() * 60);
        }
      } catch (e) {
        check('play session runs without interruption', false, e.message.split('\n')[0]);
      }
      check(
        'state changes during play (game starts)',
        states.length >= 2,
        `initial=${initial}; seen=[${states.join(', ')}]; actions=${actions}`
      );

      // 5. Canvas is not a single flat color.
      const sample = await page
        .evaluate(() => {
          const c = document.querySelector('canvas');
          if (!c || c.width === 0 || c.height === 0) return { error: 'canvas has zero size' };
          const ctx = c.getContext('2d');
          if (!ctx) return { error: 'no 2D context (not a 2D canvas?)' };
          const COLS = 64;
          const ROWS = 48;
          const colors = new Set();
          try {
            for (let j = 0; j < ROWS; j++) {
              for (let i = 0; i < COLS; i++) {
                const x = Math.min(c.width - 1, Math.floor(((i + 0.5) * c.width) / COLS));
                const y = Math.min(c.height - 1, Math.floor(((j + 0.5) * c.height) / ROWS));
                const d = ctx.getImageData(x, y, 1, 1).data;
                colors.add(`rgba(${d[0]},${d[1]},${d[2]},${d[3]})`);
              }
            }
          } catch (e) {
            return { error: `getImageData failed: ${e.message.split('\n')[0]}` };
          }
          return { distinct: colors.size, colors: [...colors].slice(0, 3) };
        })
        .catch((e) => ({ error: `evaluate failed: ${e.message.split('\n')[0]}` }));
      if (sample.error) {
        check('canvas is not blank', false, sample.error);
      } else {
        check(
          'canvas is not blank',
          sample.distinct > 1,
          sample.distinct > 1 ? `${sample.distinct} distinct colors in 64x48 sample` : `single color ${sample.colors[0]}`
        );
      }
    } else {
      check('state changes during play (game starts)', false, 'skipped: no canvas or __game');
      check('canvas is not blank', false, 'skipped: no canvas or __game');
    }

    // Screenshot (saved even on failure, to help debugging).
    if (hasCanvas) {
      const shotDir = path.join(gameDir, '.smoke');
      fs.mkdirSync(shotDir, { recursive: true });
      try {
        await page.screenshot({ path: path.join(shotDir, `${pass.name}.png`) });
      } catch (e) {
        check('screenshot saved', false, e.message.split('\n')[0]);
      }
    }

    // 6. Escape and P should pause without throwing.
    const errorsBeforePause = errors.length;
    try {
      await page.keyboard.press('Escape');
      await sleep(150);
      await page.keyboard.press('KeyP');
      await sleep(150);
      const readable = (await readState()) !== '<no __game>';
      const newErrors = errors.slice(errorsBeforePause);
      check(
        'Escape and P keys raise no errors',
        readable && newErrors.length === 0,
        !readable ? 'window.__game gone after pause keys' : newErrors.join(' | ')
      );
    } catch (e) {
      check('Escape and P keys raise no errors', false, e.message.split('\n')[0]);
    }

    // 7. Whole-pass checks.
    check(
      'no external requests (non-file: URLs)',
      externals.length === 0,
      externals.slice(0, 5).join(' ')
    );
    check(
      'no console errors or uncaught exceptions',
      errors.length === 0,
      errors.slice(0, MAX_DETAIL_ERRORS).join(' | ') +
        (errors.length > MAX_DETAIL_ERRORS ? ` (+${errors.length - MAX_DETAIL_ERRORS} more)` : '')
    );
  } catch (e) {
    check('unexpected harness error', false, e.message.split('\n')[0]);
  } finally {
    if (context) await context.close().catch(() => {});
  }

  return {
    name: pass.name,
    viewport: pass.viewport,
    touch: pass.touch,
    checks,
    states,
    errors,
    elapsedMs: Date.now() - started,
  };
}

async function smokeGame(browser, target, seed) {
  const gameDir = path.resolve(target);
  console.log(`\n== ${target} ==`);
  console.log(`   seed=${seed} (replay with SMOKE_SEED=${seed})`);
  if (!fs.existsSync(path.join(gameDir, 'index.html'))) {
    console.log('   [FAIL] index.html exists: not found');
    return false;
  }

  let allOk = true;
  const gameStart = Date.now();
  for (let i = 0; i < PASSES.length; i++) {
    const pass = PASSES[i];
    const res = await runPass(browser, gameDir, pass, seed + i);
    const label = `${pass.name} ${pass.viewport.width}x${pass.viewport.height}${pass.touch ? ' (touch)' : ''}`;
    console.log(`\n   -- ${label} (${(res.elapsedMs / 1000).toFixed(1)}s)`);
    for (const c of res.checks) {
      const detail = c.detail ? `  -- ${c.detail}` : '';
      console.log(`   [${c.ok ? 'PASS' : 'FAIL'}] ${c.name}${c.ok ? '' : detail}`);
      if (c.ok && c.name.startsWith('state changes') && c.detail) console.log(`          ${c.detail}`);
      if (!c.ok) allOk = false;
    }
    console.log(`   states seen: [${res.states.join(', ')}]`);
    if (res.errors.length) {
      console.log(`   errors (${res.errors.length}):`);
      for (const e of res.errors.slice(0, MAX_DETAIL_ERRORS)) console.log(`     - ${e}`);
    }
    console.log(`   screenshot: ${path.join(gameDir, '.smoke', `${pass.name}.png`)}`);
  }
  const elapsed = ((Date.now() - gameStart) / 1000).toFixed(1);
  console.log(`\n   RESULT ${target}: ${allOk ? 'PASS' : 'FAIL'} (${elapsed}s)`);
  return allOk;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('usage: node tools/smoke.js games/<slug> | node tools/smoke.js --all');
    return 2;
  }
  const targets = findTargets(arg);
  if (targets.length === 0) {
    console.error('no games found (expected games/<slug>/index.html)');
    return 1;
  }

  const seed = Number(process.env.SMOKE_SEED) || Date.now() % 1000000007;
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const t of targets) {
      results.push({ t, ok: await smokeGame(browser, t, seed) });
    }
  } finally {
    await browser.close();
  }

  if (results.length > 1) {
    const passed = results.filter((r) => r.ok).length;
    console.log(`\nSUMMARY: ${passed}/${results.length} games passed`);
    for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'} ${r.t}`);
  }
  return results.every((r) => r.ok) ? 0 : 1;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err);
    process.exit(1);
  }
);
