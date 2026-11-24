#!/usr/bin/env node
'use strict';
// Builds the root index.html gallery from games/*/SPEC.md.
//
// Usage (from the repo root, or any cwd: paths are relative to the cwd):
//   node tools/gallery.js
//
// Each games/<slug>/ needs SPEC.md (title = first "# " heading, genre from the
// "slug: ... · genre: X" line, blurb = paragraph under "## Pitch") and index.html.

const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.resolve('games');
const OUT_FILE = path.resolve('index.html');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripMarkdown(s) {
  return s
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSpec(text, fallbackTitle) {
  const lines = text.split(/\r?\n/);

  const titleLine = lines.find((l) => /^#\s+/.test(l));
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : fallbackTitle;

  const slugLine = lines.find((l) => /^\s*slug:/i.test(l)) || '';
  const genreMatch = slugLine.match(/genre:\s*([^·|]+)/i);
  const genre = genreMatch ? genreMatch[1].trim() : '';

  // Pitch: first non-empty paragraph under "## Pitch", ending at a blank line or next heading.
  let pitch = '';
  const pitchIdx = lines.findIndex((l) => /^##\s+pitch\s*$/i.test(l.trim()));
  if (pitchIdx !== -1) {
    const para = [];
    for (let i = pitchIdx + 1; i < lines.length; i++) {
      const l = lines[i].trim();
      if (/^#{1,6}\s/.test(l)) break;
      if (l === '') {
        if (para.length) break;
        continue;
      }
      para.push(l);
    }
    pitch = stripMarkdown(para.join(' '));
  }

  return { title, genre, pitch };
}

function collectGames() {
  if (!fs.existsSync(GAMES_DIR)) return [];
  const games = [];
  const dirs = fs
    .readdirSync(GAMES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  for (const slug of dirs) {
    const specPath = path.join(GAMES_DIR, slug, 'SPEC.md');
    if (!fs.existsSync(specPath)) continue;
    if (!fs.existsSync(path.join(GAMES_DIR, slug, 'index.html'))) {
      console.warn(`skipping ${slug}: SPEC.md present but no index.html`);
      continue;
    }
    const info = parseSpec(fs.readFileSync(specPath, 'utf8'), slug);
    games.push({ slug, ...info });
  }
  games.sort((a, b) => a.title.localeCompare(b.title));
  return games;
}

function card(g) {
  const href = `games/${encodeURIComponent(g.slug)}/index.html`;
  return `
    <a class="card" href="${esc(href)}">
      ${g.genre ? `<span class="genre">${esc(g.genre)}</span>` : ''}
      <h2>${esc(g.title)}</h2>
      ${g.pitch ? `<p>${esc(g.pitch)}</p>` : ''}
      <span class="play">Play &rarr;</span>
    </a>`;
}

function render(games) {
  const body = games.length
    ? `<main class="grid">${games.map(card).join('')}</main>`
    : '<p class="empty">No games yet.</p>';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Game Factory</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #f5f6fa;
    --card: #ffffff;
    --fg: #14161c;
    --muted: #5b6170;
    --accent: #3457d5;
    --border: #dfe2ea;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0e1015;
      --card: #171a22;
      --fg: #e8eaf0;
      --muted: #9aa1b2;
      --accent: #8fb0ff;
      --border: #272c38;
    }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; }
  body {
    background: var(--bg);
    color: var(--fg);
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    padding: 32px 16px 48px;
    overflow-x: hidden;
  }
  header, .grid { max-width: 1100px; margin: 0 auto; }
  header { margin-bottom: 24px; }
  header h1 { margin: 0; font-size: 1.6rem; letter-spacing: -0.01em; }
  header p { margin: 4px 0 0; color: var(--muted); font-size: 0.95rem; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
    gap: 16px;
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 18px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    color: inherit;
    text-decoration: none;
    min-width: 0;
    transition: border-color 0.15s ease, transform 0.15s ease;
  }
  .card:hover, .card:focus-visible { border-color: var(--accent); transform: translateY(-2px); outline: none; }
  .card h2 { margin: 0; font-size: 1.15rem; overflow-wrap: anywhere; }
  .card p { margin: 0; color: var(--muted); font-size: 0.95rem; overflow-wrap: anywhere; }
  .genre {
    align-self: flex-start;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--accent);
    border: 1px solid currentColor;
    border-radius: 999px;
    padding: 1px 8px;
  }
  .play { margin-top: auto; padding-top: 6px; color: var(--accent); font-weight: 600; font-size: 0.9rem; }
  .empty { color: var(--muted); }
  @media (prefers-reduced-motion: reduce) { .card { transition: none; } .card:hover { transform: none; } }
</style>
</head>
<body>
<header>
  <h1>Game Factory</h1>
  <p>${games.length} ${games.length === 1 ? 'game' : 'games'}</p>
</header>
${body}
</body>
</html>
`;
}

function main() {
  const games = collectGames();
  fs.writeFileSync(OUT_FILE, render(games), 'utf8');
  console.log(`wrote ${path.relative(process.cwd(), OUT_FILE) || OUT_FILE} (${games.length} games)`);
}

main();
