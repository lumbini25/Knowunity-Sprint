/**
 * Route-level accessibility harness.
 *
 * WHY THIS EXISTS ALONGSIDE STORYBOOK'S A11Y ADDON, WHICH ALSO RUNS AXE.
 *
 * The addon audits a component rendered alone in a canvas. That is the right
 * scope for a component and the wrong scope for a page: a whole class of
 * defect only appears once the parts are composed into a document, and every
 * one of these was a real bug in this repo rather than a hypothetical —
 *
 *   - duplicate landmarks, when five cards each carried <section aria-label>
 *   - a heading order that is fine per component and wrong down the page
 *   - <html lang> and <title>, which no story has
 *   - colour contrast against the real page background rather than the
 *     canvas's
 *   - ids that collide only when two instances share a document
 *
 * So: the addon guards components, this guards pages, and neither replaces
 * the other. Run both.
 *
 * USAGE
 *   npm run dev          # in one terminal
 *   npm run a11y         # in another
 *
 * Exits non-zero on any violation, so CI can gate on it.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core'), 'utf8');

const BASE = process.env.A11Y_BASE ?? 'http://localhost:3000';

/* Every route the student can reach. Keep in step with app/recall/ — a route
   missing here is a route nobody is checking. */
const ROUTES = [
  '/',
  '/entry',
  '/entry/compose',
  '/entry/ready',
  '/entry/folders',
  '/recall/idle',
  '/recall/recording',
  '/recall/answer-sent',
  '/recall/processing',
  '/recall/result',
  '/recall/correct',
  '/recall/correct-feedback',
  '/recall/reveal',
  '/recall/wrong',
  '/recall/comparison',
  '/recall/rating',
  '/recall/summary',
  '/recall/lesson',
  '/recall/exit',
  '/recall/no-audio',
  '/recall/text-fallback',
  '/recall/permission-primer',
  '/recall/permission-sheet',
  '/recall/permission-denied',
  '/recall/misheard',
  '/recall/re-record',
];

/* The prototype is 390px dark-mode iOS only, so audit it as that and nothing
   else. Auditing a dark-mode-only app in light mode reports contrast failures
   that do not exist for any real student. */
const VIEWPORT = { width: 390, height: 844 };

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: VIEWPORT,
    colorScheme: 'dark',
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  let total = 0;
  const failures = [];

  for (const route of ROUTES) {
    const page = await context.newPage();
    const url = `${BASE}${route}`;

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
    } catch {
      failures.push({ route, error: `could not load ${url} — is \`npm run dev\` running?` });
      await page.close();
      continue;
    }

    /* answer-sent holds 300ms and then routes away. Auditing it after the beat
       would audit the verdict screen twice and never audit this one, so the
       audit has to happen inside the beat — hence no settle wait here. */
    await page.addScriptTag({ content: AXE_SOURCE });
    const results = await page.evaluate(async () => {
      // @ts-expect-error — axe is injected above, not imported.
      return await window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
    });

    total += results.violations.length;

    if (results.violations.length === 0) {
      console.log(`  ok    ${route}`);
    } else {
      console.log(`  FAIL  ${route}  (${results.violations.length})`);
      for (const v of results.violations) {
        console.log(`          ${v.id} · ${v.impact} · ${v.help}`);
        for (const node of v.nodes.slice(0, 3)) {
          console.log(`            ${node.target.join(' ')}`);
        }
        if (v.nodes.length > 3) console.log(`            …and ${v.nodes.length - 3} more`);
      }
      failures.push({ route, count: results.violations.length });
    }

    await page.close();
  }

  await browser.close();

  console.log('');
  if (failures.length === 0) {
    console.log(`${ROUTES.length} routes, 0 violations.`);
    return;
  }
  for (const f of failures) {
    console.log(f.error ? `${f.route}: ${f.error}` : `${f.route}: ${f.count} violation(s)`);
  }
  console.log(`\n${total} violation(s) across ${failures.length} route(s).`);
  process.exitCode = 1;
}

main();
