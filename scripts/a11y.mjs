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
 * WHAT IT AUDITS: every route in ROUTES, at 390px dark, against WCAG 2.0–2.2
 * A/AA, with a seeded FINISHED session so the summary renders. A route that
 * redirects is a failure, never a pass. WHAT IT DOES NOT: tap targets above
 * axe's 24px floor (ours is 48), and any state reached only by interacting.
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
  '/entry/quiz',
  '/entry/summarize',
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
  /* The summary's term detail — the same route reached from a tapped row,
     which renders a different screen from the wrong-ending one above. */
  '/recall/comparison?term=appeasement',
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

  /* `/recall/idle` opens on the mic permission primer for a student who has
     not been asked yet, so without this the audit would check the primer twice
     — once here and once at `/recall/permission-primer`, which is its own route
     — and never check the first turn at all. Seeding the flag audits the turn;
     the primer keeps its own row. Set before any page script runs, so the
     provider reads it on its first render. */
  await context.addInitScript(() => {
    try {
      /* A FINISHED SESSION, NOT AN EMPTY ONE. With `outcomes: []` the
         summary has nothing to summarise and redirects to /entry — so for as
         long as this seed was empty, /recall/summary audited the front door
         and reported it clean. One outcome per end state, so every termRow
         variant is on the page axe reads. The turn routes ignore outcomes. */
      window.sessionStorage.setItem(
        'knw.recall.session',
        JSON.stringify({
          termIndex: 0,
          rung: 'attempt1',
          takeIndex: 0,
          outcomes: [
            { termId: 'turning-points', passedAt: 'attempt1', score: 100, skipped: false, transcript: '"Stalingrad and D-Day."' },
            { termId: 'appeasement', passedAt: 'hint2', score: 100, skipped: false, transcript: '"Munich, 1938."' },
            { termId: 'total-war', passedAt: null, score: null, skipped: true },
            { termId: 'post-war-order', passedAt: null, score: null, skipped: false, transcript: '"The United Nations."' },
          ],
          micGranted: true,
        }),
      );
    } catch {
      /* Blocked storage. The audit still runs; idle just shows the primer. */
    }
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

    /* A REDIRECT IS NOT A PASS. If the route sent the page somewhere else,
       auditing what loaded would report that page's result under this
       route's name — which is how /recall/summary printed "ok" while showing
       /entry. answer-sent is the one route that leaves on purpose, after a
       300ms beat, so it is checked before that beat can elapse. */
    const landed = new URL(page.url());
    if (landed.pathname + landed.search !== route && route !== '/recall/answer-sent') {
      failures.push({ route, error: `redirected to ${landed.pathname}${landed.search} — not audited` });
      await page.close();
      continue;
    }

    /* answer-sent holds 300ms and then routes away. Auditing it after the beat
       would audit the verdict screen twice and never audit this one, so the
       audit has to happen inside the beat — hence no settle wait here. */
    await page.addScriptTag({ content: AXE_SOURCE });
    /* WCAG 2.2 IS IN THE LIST, AND IT WAS NOT. The tags stopped at 2.1, so
       `target-size` — 2.5.8, a 2.2 rule — could not be reported by this
       harness at all. It still printed "0 violations" on every route while
       controls shipped under the floor on nine screens, which is the exact
       shape CLAUDE.md's Verification section warns about: a check that
       reassures about a defect it cannot express.

       THIS IS A FLOOR, NOT THE RULE. axe's `target-size` fails at 24×24 —
       WCAG's minimum — where this project's own rule is
       `size/tapTarget/min` (48) at the RENDERED size. So a 32×32 control
       passes here and still breaks CLAUDE.md. Green on this line means "no
       control is beneath the web's floor", not "every control is big
       enough". Measure when it matters. */
    const results = await page.evaluate(async () => {
      // @ts-expect-error — axe is injected above, not imported.
      return await window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
        },
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
