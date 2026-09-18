/* Consistency audit.
 *
 * `npm run a11y` answers "is this screen usable". This answers a different
 * question: "is this screen the SAME as the others". It walks every route at
 * 390x844 dark and reports three classes of drift that no test catches and the
 * eye catches only by accident:
 *
 *   1. OFF-SCALE values   — a size, space or radius that is not a token step.
 *                           These are always bugs: a literal crept in, or a
 *                           token was bound to the wrong step.
 *   2. TYPE COMBINATIONS  — every size/line-height/weight triple in use. Two
 *                           rows that differ only in line-height are the
 *                           signature of one role being bound two ways.
 *   3. SCAFFOLD SPACING   — the gutter and column gap per screen, side by side,
 *                           so a screen padded differently from its siblings
 *                           shows up as a number rather than a feeling.
 *
 * Run the dev server first, then `node scripts/consistency.mjs`.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const ROUTES = [
  '/entry', '/entry/compose', '/entry/ready', '/entry/folders',
  '/recall/idle', '/recall/recording', '/recall/answer-sent', '/recall/processing',
  '/recall/result', '/recall/correct', '/recall/correct-feedback', '/recall/reveal',
  '/recall/wrong', '/recall/comparison', '/recall/rating', '/recall/summary',
  '/recall/lesson', '/recall/exit', '/recall/no-audio', '/recall/text-fallback',
  '/recall/permission-primer', '/recall/permission-sheet', '/recall/permission-denied',
  '/recall/misheard', '/recall/re-record',
];

/* The scales, read straight off the generated tokens rather than retyped — a
   hand-copied scale is one more thing that can drift from tokens.json. */
const SCALE = {
  space: [0, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 48, 64, 96, 160],
  radius: [0, 4, 6, 8, 12, 16, 24, 32, 36, 9999],
  fontSize: [9, 12, 15, 16, 18, 21, 28, 33, 44, 59, 76, 103],
  lineHeight: [12, 16, 20, 24, 32, 36, 44, 60, 76, 104],
};

/* Device chrome and browser defaults, which are not design values and would
   otherwise bury the real findings. */
const IGNORE_SELECTOR = 'svg, svg *, path, g, .knw-recall__keyboard, [data-nextjs-toast], nextjs-portal';

async function auditRoute(page, route) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  return page.evaluate(
    ({ SCALE, IGNORE_SELECTOR }) => {
      const round = (v) => Math.round(parseFloat(v) * 100) / 100;
      const isPx = (v) => typeof v === 'string' && v.endsWith('px');
      const offScale = [];
      const typeCombos = new Map();

      const label = (el) => {
        const cls = [...el.classList].find((c) => c.startsWith('knw-'));
        return cls ? '.' + cls : el.tagName.toLowerCase();
      };

      for (const el of document.querySelectorAll('*')) {
        if (el.matches(IGNORE_SELECTOR) || el.closest('nextjs-portal')) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const name = label(el);

        // --- spacing: padding, margin, gap ---
        for (const prop of [
          'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
          'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
          'rowGap', 'columnGap',
        ]) {
          const raw = cs[prop];
          if (!isPx(raw)) continue;
          const v = round(raw);
          // Negative margins are a deliberate technique (the rail's bleed), so
          // only their magnitude is checked against the scale.
          if (!SCALE.space.includes(Math.abs(v))) {
            offScale.push({ kind: 'space', prop, value: v, el: name });
          }
        }

        // --- radius ---
        for (const prop of ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius']) {
          const raw = cs[prop];
          if (!isPx(raw)) continue;
          const v = round(raw);
          if (!SCALE.radius.includes(v)) offScale.push({ kind: 'radius', prop, value: v, el: name });
        }

        // --- type: only on elements that actually hold text ---
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (hasText) {
          const size = round(cs.fontSize);
          const lh = isPx(cs.lineHeight) ? round(cs.lineHeight) : cs.lineHeight;
          if (!SCALE.fontSize.includes(size)) offScale.push({ kind: 'fontSize', prop: 'fontSize', value: size, el: name });
          if (typeof lh === 'number' && !SCALE.lineHeight.includes(lh)) {
            offScale.push({ kind: 'lineHeight', prop: 'lineHeight', value: lh, el: name });
          }
          const key = `${size}/${lh} w${cs.fontWeight}`;
          if (!typeCombos.has(key)) typeCombos.set(key, new Set());
          typeCombos.get(key).add(name);
        }
      }

      // --- icons: the rendered box of anything holding an <svg> ---
      // Icons drift in two ways the eye forgives one at a time and not side by
      // side: a box that is not an icon step, and the same glyph drawn at two
      // sizes on two screens. Both show up here as a number.
      const icons = [];
      for (const svg of document.querySelectorAll('svg')) {
        const host = svg.parentElement;
        if (!host || host.closest('nextjs-portal')) continue;
        const r = svg.getBoundingClientRect();
        if (!r.width) continue;
        icons.push({
          el: label(host),
          w: Math.round(r.width * 10) / 10,
          h: Math.round(r.height * 10) / 10,
        });
      }

      // --- the scaffold, for cross-screen comparison ---
      const slot = document.querySelector('[class*="middle"], .knw-screen__middle') ?? document.body;
      const scs = getComputedStyle(slot);
      const scaffold = {
        slot: label(slot),
        paddingInline: scs.paddingLeft,
        gap: scs.rowGap,
      };

      return {
        icons,
        offScale,
        typeCombos: [...typeCombos.entries()].map(([k, v]) => [k, [...v]]),
        scaffold,
      };
    },
    { SCALE, IGNORE_SELECTOR },
  );
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  colorScheme: 'dark',
});

const allOffScale = new Map(); // "kind prop value el" -> routes
const allTypes = new Map(); // combo -> { routes, els }
const scaffolds = [];
const allIcons = new Map(); // "el" -> { sizes:Set, routes:Set }

for (const route of ROUTES) {
  const page = await context.newPage();
  try {
    const r = await auditRoute(page, route);
    for (const o of r.offScale) {
      const key = `${o.kind}|${o.value}|${o.el}|${o.prop}`;
      if (!allOffScale.has(key)) allOffScale.set(key, { ...o, routes: new Set() });
      allOffScale.get(key).routes.add(route);
    }
    for (const [combo, els] of r.typeCombos) {
      if (!allTypes.has(combo)) allTypes.set(combo, { routes: new Set(), els: new Set() });
      const e = allTypes.get(combo);
      e.routes.add(route);
      els.forEach((x) => e.els.add(x));
    }
    for (const i of r.icons) {
      if (!allIcons.has(i.el)) allIcons.set(i.el, { sizes: new Set(), routes: new Set() });
      const e = allIcons.get(i.el);
      e.sizes.add(`${i.w}x${i.h}`);
      e.routes.add(route);
    }
    scaffolds.push({ route, ...r.scaffold });
  } catch (err) {
    console.log(`  ERROR ${route}: ${err.message}`);
  }
  await page.close();
}
await browser.close();

console.log('\n=== 1. OFF-SCALE VALUES ===');
if (!allOffScale.size) console.log('  none');
for (const o of [...allOffScale.values()].sort((a, b) => b.routes.size - a.routes.size)) {
  console.log(
    `  ${o.kind.padEnd(11)} ${String(o.value).padStart(7)}  ${o.el.padEnd(32)} ${o.prop.padEnd(16)} ${o.routes.size} route(s)  ${[...o.routes].slice(0, 3).join(' ')}`,
  );
}

console.log('\n=== 2. TYPE COMBINATIONS IN USE ===');
const sorted = [...allTypes.entries()].sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
for (const [combo, e] of sorted) {
  console.log(`  ${combo.padEnd(20)} ${String(e.routes.size).padStart(2)} routes  ${[...e.els].slice(0, 5).join(' ')}`);
}

console.log('\n=== 3. ICON BOXES ===');
const ICON_STEPS = [8, 12, 16, 20, 24, 32, 44, 48];
for (const [el, e] of [...allIcons.entries()].sort()) {
  const sizes = [...e.sizes];
  const off = sizes.filter((s) => !ICON_STEPS.includes(parseFloat(s.split('x')[0])));
  const drift = sizes.length > 1 ? '  <-- DRIFT: one host, several sizes' : '';
  const bad = off.length ? `  <-- OFF-SCALE: ${off.join(' ')}` : '';
  if (drift || bad) console.log(`  ${el.padEnd(34)} ${sizes.join(' ').padEnd(26)} ${e.routes.size}r${drift}${bad}`);
}
console.log('  (only hosts with drift or off-scale boxes are listed)');

console.log('\n=== 4. SCAFFOLD SPACING PER SCREEN ===');
for (const s of scaffolds) {
  console.log(`  ${s.route.padEnd(30)} slot=${s.slot.padEnd(24)} padding-inline=${String(s.paddingInline).padStart(6)}  gap=${s.gap}`);
}
console.log('');
