/*
 * Fails if a raw hex colour reaches a rendered element.
 *
 * CLAUDE.md: "Every colour, size, spacing, radius and type value comes from
 * tokens/tokens.json" and "Never a CSS fallback value: var(--token, #333)".
 * This is that rule, enforced.
 *
 * It scans components/ and app/ — the screens paint too, so a literal typed
 * into a page.tsx has to fail the same way one typed into a component does.
 *
 * IT IGNORES COMMENTS, AND THAT IS THE WHOLE DESIGN. Every hex string in
 * components/ today — 68 of them — sits inside a TOKEN NOTE comment recording
 * what Figma's raw value was at a binding that departs from it. Writing those
 * notes is what CLAUDE.md asks for. A check that flagged them would report 68
 * false positives and zero real findings, and would be switched off within a
 * day. Comments are replaced with newlines rather than removed, so the line
 * numbers it prints still match the file.
 *
 * IT SKIPS .stories.tsx for the same reason one step along: their hex lives in
 * Markdown docs strings describing which token a value came from, which is
 * documentation about colour, not colour.
 *
 * What is left is hex that can actually paint something: a CSS declaration, a
 * fill="#..." on an SVG, a style={{ color: '#...' }}.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/* fileURLToPath, not URL.pathname: this repo's directory has a space in it,
   and pathname hands back "Knowunity%20Sprint". */
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SCAN = ['components', 'app'].map((dir) => join(ROOT, dir));
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

/* app/globals.css is generated from tokens/tokens.json, so its hex values ARE
   the tokens — the one place in either tree where a literal colour is the
   right answer. app/fonts.css and app/index.css are hand-authored and hold
   none, so they are scanned like anything else. */
const GENERATED = new Set([join(ROOT, 'app', 'globals.css')]);

/** Every .css and .tsx under the scanned roots, minus stories and generated output. */
function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return files(full);
    if (name.endsWith('.stories.tsx') || GENERATED.has(full)) return [];
    return /\.(css|tsx)$/.test(name) ? [full] : [];
  });
}

/** Blanks comments, keeping every newline so line numbers do not shift. */
const blank = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));

const found = [];

for (const file of SCAN.flatMap((dir) => files(dir))) {
  const lines = blank(readFileSync(file, 'utf8')).split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(HEX)) {
      found.push(`${relative(ROOT, file)}:${i + 1}:${m.index + 1}  ${m[0]}`);
    }
  });
}

if (found.length) {
  console.error(`\nRaw hex colour in ${found.length} place(s) — use a semantic token:\n`);
  for (const f of found) console.error(`  ${f}`);
  console.error('\nThe value you need is in tokens/tokens.json. If it is not, say so');
  console.error('rather than writing the hex — design-system.md has a Gaps list.\n');
  process.exit(1);
}

console.log('check:tokens — no raw hex in components/ or app/. Every colour is a token.');
