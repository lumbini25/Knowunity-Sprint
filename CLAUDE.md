@AGENTS.md

# Knowunity voice recall prototype

Mocked voice-based active recall for Knowunity: a 390px dark-mode iOS web app, deployed to Vercel.

## Hard rules

- 390px, dark mode, iOS only. No light mode, no desktop, no breakpoints.
- Every colour, size, spacing, radius and type value comes from `tokens/tokens.json`. If a value is missing, stop and ask.
- Build from the components in `design-system.md`. If nothing fits, stop and ask before making one.
- Components consume the semantic layer only.
- `app/globals.css` and `build/css/tokens.css` are both generated. Change `tokens/tokens.json`, then run `npm run tokens:css` and `npm run tokens`.
- The UI font is Greed VF, loaded via `next/font/local` in the root layout. Never treat it as an installed system font.
- The recall is mocked: no speech-to-text, no audio capture, no model calls.
- Knowie replies in text. Knowie never speaks.
- Sentence case on every label, button, heading and message. Proper nouns only: Knowie, Knowunity, PRO.
- Every screen uses the scaffold in `design-system.md` and applies safe-area insets top and bottom.
- Every recall screen keeps a text fallback and a way out, per the hard constraints in `design-brief.md`.
- Every control clears `size/tapTarget/min` at its **rendered** size, not its token size. A 24px glyph inside a 48px button passes; a 48 declared on something that renders 16 tall does not. `npm run a11y` now checks this but only to axe's floor of 24, where ours is 48 — so a 32×32 control passes the harness and still breaks this rule. Measure when it matters.
- Every control shows that it was focused and that it was pressed. Both, token-bound, in something other than opacity. Neither state appears in a screenshot, so a missing one is invisible in review.
- Every state change gets a second beat. Something that was one way and is now another has to be seen crossing: bind a `motion/*` duration and easing, or write at the binding why it is instant. Two traps sit inside this one — never animate a resting style to invisible (`opacity: 0` under `animation-fill-mode: both` blanks the component's own default state, which broke eight stories at once), and an entrance that moves geometry is still moving while a test measures, so await `getAnimations({ subtree: true })` before reading a box.
- A destination is about the thing that was tapped. If a screen lists several things and they all lead to one place, the list is decorative — carry what was chosen through the navigation. A handler that ignores the argument its own component passes it type-checks cleanly.
- Check `sprint-context.md` before proposing anything — the decision may already be made, or explicitly out of scope.

## Never

- Never a CSS fallback value: `var(--token, #333)`.
- Never a primitive token in a component.
- Never hand-edit `app/globals.css` or `build/css/tokens.css`.
- Never invent a token to close a gap. Take the nearest step, comment the departure at the binding, **and** add it to `design-system.md`'s Gaps list naming the component it came from. All three, or it is a private note — so far the binding comment gets written and the log entry forgotten.
- Never draw a control that does nothing. No handler, no control — not as a live-looking button, not as inert text styled like the working one beside it. And the reverse: a surface that reads as tappable must not answer in one corner only. A student cannot tell "nothing happened" from "nothing registered".
- Never let a label promise a destination it doesn't deliver. "Menu" that routes away is not a menu; a chip named after the last thing the student did lands on that thing. Nothing type-checks a noun against a route, so read the words against the handler.
- Never a second drawing of an idea the app already draws. `components/*/icons.tsx` is the whole icon set — grep it before adding a glyph and import the one that exists, because the student reads two drawings as two meanings even when both came out of Figma. And never a text character where an icon belongs: `✕` and `☰` take their weight from the type binding and will not match the SVGs beside them. This has shipped four times — the mic, the streak, the exit, the hint — and the rule was already written in the build-screen skill each time, which is why it is here instead: the skill is loaded when a screen is built, and every one of those four arrived during an edit afterwards.
- Never let two controls that look alike cost differently. Same size, same shape, same place in the layout is a promise about consequence — the tap that throws a take away must not be drawn like the tap that moves on. Where the cost is real and hidden, the control asks first.
- Never design a recall state without `reference/Voice_UX.md`.
- Never put reference material in `public/`.
- Never add a dependency without asking.
- The remaining component-level prohibitions live in `design-system.md` under "Never do this". Read it before styling anything.

## Verification

A clean result is evidence about what was inspected and nothing else. Most defects that survived a review here survived it green.

- **Know the blind spot before quoting the result.** A defect a check cannot express passes forever, and the report still reads green. `a11y` ran WCAG 2.1 tags for the whole run of scorecards, so it could not fail a tap target — 2.5.8 is a 2.2 rule — and printed "0 violations" while nine screens shipped under the floor; it runs 2.2 now, at axe's 24px floor rather than our 48. `a11y` and `consistency` walk different lists on purpose, and `consistency`'s own `ROUTES` comment is where that reason lives. `check:tokens` reads `components/` and `app/` only, and only colours that can paint.
- **Not run is not clean.** Timed out, skipped, errored, capped, unreachable — every one of those means unchecked. Report it that way; never let it settle into a pass.
- **Check the thing, not the description of it.** Comments, Storybook prose, `design-system.md` entries and SPEC.md all go stale independently of the code they describe. Where a description disagrees with the render, the render is what ships.
- **Ask what the harness added.** A synthetic click leaves a focus ring no real tap would; a story's `play` function can manufacture the state it then observes. A behaviour seen only under test may belong to the test.
- **Say what you ran, and over what.** "Clean" without a scope is a claim, not a check.
- **A claim about the tooling is part of the tooling.** Change what a check covers and you have not finished until every sentence describing that coverage moves with it, in the same edit — this file, the script's own header, the rubric. The bullets above are written to be specific, which is what makes them useful and what makes them rot: the tap-target line here was wrong within the hour, because the tag list was fixed and the sentence about it was not. A rule naming a hole that has since been closed teaches the next reader to discount the rule.

## Storybook

When working on UI, use the storybook tools to read the component library before answering or writing anything. Never assume a component prop exists. Query the documentation, and use only props that are documented or shown in a story. If a prop isn't there, stop and ask me.

A prop existing is not permission to use it — read what the docs say about *when*. Components carry their own DON'Ts ("Do not use accent=Gold for standard study folders — Gold signals PRO content"), and a value the type system accepts can still be reserved for a meaning this screen has no claim to. If the docs restrict it and the call site doesn't meet the restriction, stop and ask me.

## Files

| File | Read it when |
| --- | --- |
| `tokens/tokens.json` | Before writing any style value. Every value in the system. |
| `design-system.md` | Before building or styling anything. Which component to use, how to bind tokens, what never to do. |
| `design-brief.md` | Before building a state I haven't specified. Constraints, mandate, open questions. |
| `sprint-context.md` | Before proposing a flow or a screen. Decisions made, and what we are not building. |
| `component-gaps.md` | Before building a new screen. A running list of things built inline during a screen build because Storybook had nothing — if what you need is already on it, build it properly as a component instead. |
| `reference/Voice_UX.md` | Before designing any recall state. Six principles, and the "States to design" checklist to work against when building screens. |
| `reference/` | When matching a layout. Screenshots of the existing app and the recall flow, alongside `reference/Voice_UX.md`. |
| `app/` | Building a screen. Read `AGENTS.md` first — this is not the Next.js you know. |
| `app/globals.css` | To look up a generated custom-property name. Generated output, never an input. |
| `app/layout.tsx` | Setting viewport, fonts or metadata. Still carries create-next-app defaults. |
| `app/page.tsx` | Building the entry screen. Still the create-next-app template — replace it, don't extend it. |
| `scripts/generate-globals-css.py` | When `npm run tokens:css` fails. It exits non-zero on any broken reference. |
| `scripts/consistency.mjs` | After any type, spacing or icon change. `npm run consistency` walks every route and prints the type combinations actually rendered, off-scale values and per-screen gutters. It proves the build agrees with itself — Figma is what proves it agrees with the design, so check both. |
| `scripts/check-tokens.mjs` | After building anything. `npm run check:tokens` scans `components/` and `app/` and fails with the file and line of any raw hex colour that can paint — comments and generated files excluded. |
| `scripts/a11y.mjs` | After any screen change. `npm run a11y` walks every route in its `ROUTES` list with axe. **Know what it does not cover:** it runs WCAG 2.1 tags only, and tap-target size is 2.5.8, a 2.2 rule — so "0 violations" says nothing about the tap-target rule above, and a route missing from `ROUTES` is never audited at all. |
| `style-dictionary.config.mjs` | Changing how `build/css/tokens.css` is built. Custom-property naming and the value transforms live here. |
| `build/css/tokens.css` | To look up a generated custom-property name. Generated by `npm run tokens`, never an input. Tracked in git so a fresh clone builds. |
| `public/` | Adding or looking up a real app asset. |
| `package.json` | Before adding a script or dependency. |
| `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` | Only when a build or lint fails. Stock create-next-app. |
| `.claude/skills/` | Loaded automatically: ui-designer, ux-designer, ux-motion, interactive-prototype. |
| `.claude/launch.json` | Changing how `next dev` starts. |
| `README.md` | Never. Stale create-next-app boilerplate. |
| `hello.html` | Never. Leftover scratch file — delete it. |
