---
name: build-screen
description: "Applies when building or editing any screen in this Knowunity voice-recall prototype. Triggers on: 'build the X screen', 'add a screen', 'the idle screen', 'the result screen', 'wire up the flow', a route under app/recall/, or any edit to components/screens/. Covers where screens live, how to resolve SPEC.md against the Figma file, which components exist in Storybook, what to do when one doesn't, and what to report when the screen is done. Do NOT use for component-only work with no screen attached, or for token changes."
---

# Building a screen in this prototype

## A screen is a route, not a story

Every screen is a page in the Next.js app, at its own route, reachable by **clicking from the
screen before it**. Storybook is the catalog for components only.

**A screen that exists only as a Storybook story is not built.** Neither is one you can only reach
by typing its URL.

The split this repo uses:

| Where | What |
|---|---|
| `app/recall/<name>/page.tsx` | The route. `'use client'`, one import, reads the session, passes plain props. Nothing else. |
| `components/screens/RecallScreens/RecallScreens.tsx` | The screen itself, as a pure component with defaulted props. |
| `RecallScreens.stories.tsx` | The same component, so a story and a route render identical markup. |
| `app/recall/layout.tsx` | `RecallSessionProvider`. Do not add a provider per page — each route is its own tree, so that resets the session on every push. |

**Routes read the session; screens stay pure.** `useRecallSession()` throws outside the provider, so
a screen that calls it directly stops rendering in Storybook. Read it in the route, pass props down.

Add the route to `app/page.tsx`'s `SCREENS` array and to `ROUTES` in `scripts/a11y.mjs`. A route
missing from either is unreachable or unchecked.

## The method

### 1. Read SPEC.md first

Find the screen's row in the build-order table and its section. That gives you its states, its
components, what the student can do, and **where each action goes**. SPEC.md is the contract.

### 2. Check whether the screen has a Figma frame

Some do, some don't, and it changes everything downstream. Use the `figma-console` MCP
(`figma_execute` with `getNodeByIdAsync`) and search the `Final Design- core flow` and `recall loop`
pages by frame name.

Guard every traversal — this file has broken instance sublayers that throw on
`componentProperties` and on `findAll`. Walk `node.children` manually inside try/catch, and coerce
`figma.mixed` (a Symbol) before returning it.

**Screenshot the frame before you trust your reading of it.** `figma_capture_screenshot` costs one
call and catches the two ways a node walk misleads — a layer that is present but `visible: false`,
and a name-filtered search that never saw the layers you did not think to name. See the checks under
"Then check Figma" below, which exist because both of those shipped.

### 3. Query Storybook for every component you will use

Call `mcp__storybook__docs-list` once, then `docs-show` for each component. **Never assume a prop
exists**, including obvious-sounding ones. If it is not in the docs or a story, it does not exist.

Real examples of why: `Button` has no `children` and no `disabled` — it takes `CTA` and
`state="Disabled"`. `Screen` has no `children`, only slots. `VoiceFab`'s `showDiscard` renders
**only** when `state === 'Sent'`. `ProgressIndicator`'s `showText` does nothing at
`thickness="16"`.

### 4. Compose from what Storybook has

Storybook is the only place to look for something to reuse. **Most of the Figma library was never
built in code** — a component existing in Figma tells you nothing about whether you can import it.

### 5. When something you need isn't in Storybook

Build it **inside the screen**, from tokens, and add one line to `component-gaps.md`: what it was,
and which screen needed it. Do not stop to ask.

**If that same thing is already on the list from another screen, build it properly instead** — its
own directory under `components/`, with a `.css` and a `.stories.tsx` — and remove both lines from
`component-gaps.md`. Twice means it is a component.

### 6. Every value comes from the generated tokens

`var(--semantic-*)` only. No raw hex, no raw px, and **never a fallback**: `var(--token, #333)` is
prohibited. Components consume the semantic layer — a `--primitive-*` in a component file is a bug.

Type is bound as a complete five-property set (`font-family`, `font-weight`, `font-size`,
`line-height`, `letter-spacing`), never partially.

If a value you need has no token: take the **nearest existing step**, comment the departure at the
binding, and log it in `design-system.md`'s Gaps list. Never invent a token, and never hard-code the
measured value to preserve it. The rare literal (the 342px keyboard reserve) is device chrome, not a
design value, and carries a paragraph saying so.

To change tokens: edit `tokens/tokens.json`, then run `npm run tokens:css` **and** `npm run tokens`.
`app/globals.css` and `build/css/tokens.css` are generated — never hand-edit them.

### 7. One concept, one icon — across every screen, not just this one

**Before drawing any icon, check what the rest of the app already uses for that
idea.** `components/*/icons.tsx` is the whole set; grep it. If the concept is
already drawn somewhere, import that one. A second drawing of the same idea is
a bug even when both are extracted from Figma, because the student reads them as
two different things.

This has gone wrong four times, and each looked local while it was happening:

- **The composer's mic** was `chatInput`'s thin outline while the rail's was the
  blue `RailMicIcon` — the same "Explain out loud" chip, two glyphs, one screen
  apart.
- **The streak** reused `BoltIcon`, so the app bar showed one glyph twice in two
  colours and called one of them a flame.
- **The exit and the menu** were the text characters `✕` and `☰` among real
  SVGs, so their weight tracked the font rather than the icon set.
- **The hint label** drew a filled lightbulb where the frame has a stroked
  alert-circle.

Two rules that would have caught all four:

- **A control in the same position on two screens is not automatically the same
  control.** The app bar's trailing slot is `clock-rewind` on the front door and
  compose inside a chat; the difference is meaning, not drift. Check what it
  does there before reusing what is there.
- **Never a text character where an icon belongs.** A font glyph changes weight
  with the type binding and will not match the SVGs beside it.

Check this deliberately when you finish, by looking at the screen you built
NEXT TO the one before it — `npm run consistency` reports icon boxes that drift
in size, but it cannot tell you two glyphs mean the same thing.

### 8. 390px, dark mode, iOS only

No light mode, no desktop, no breakpoints. Safe-area insets top and bottom come from `Screen`.

### 9. Build every state SPEC.md lists, including the failure ones

The failure states are the point of this feature — a misheard transcript, a silent recording, a
denied mic. A screen with only its happy path is half-built.

Two rules from `CLAUDE.md` apply to every recall screen: a **text fallback reachable in one tap**,
and **a way out**. Sentence case on every label; proper nouns are Knowie, Knowunity, PRO.

### 10. Every action goes where SPEC.md says

**A button that leads nowhere means the screen isn't finished.** Use `useRecallNav()`'s `go` /
`goTo` with a `Destination` rather than hand-writing URLs.

If a destination genuinely does not exist yet, leave the handler **off** and comment why, naming the
route it is waiting on — wiring it would mean a 404 or a lie. Say so in your report.

## When you're done

Run all of it:

```
npx tsc --noEmit && npm run lint
npm run build
npm run dev          # then, in another terminal:
npm run a11y         # must be 0 violations
npm run consistency  # the new screen must not add a row to the type table
```

Plus Storybook's `test-run` — the MCP tool, not a package script. It wedges periodically; a full
Storybook restart is the only fix, killing the vitest worker is not enough.

Then **walk the flow in the browser at 390×844 in dark mode**, clicking only. If any screen needed
the address bar, it is not done.

### `npm run consistency` — does this screen match the others?

`scripts/consistency.mjs` walks every route at 390×844 dark and reports what no other check sees:
values that are not a token step, **every size/line-height/weight triple in use**, icon boxes, and
the gutter and gap per screen side by side.

**The type table is the part that matters.** `SPEC.md` names the combinations the system uses; the
audit prints the combinations actually rendered. A new screen must not add a row. A row that appears
once, or two rows differing only in weight, is a partial type binding — and the usual cause is an
element nobody styled taking `font-weight` from the browser instead of a token. That is invisible by
eye and obvious here: it is how a `<strong>` rendering at the user-agent's 700 among the token's 600,
and an exit control rendering at 400 among Bold, were both found.

Run it **before and after**, so you can see what your screen added rather than guessing.

### Then check Figma — the audit cannot tell you whether you match the design

**Always check the screen against its Figma frame before calling it done.** `npm run consistency`
proves the build agrees with *itself*; only Figma proves it agrees with the *design*. A screen can be
perfectly consistent and perfectly wrong — every value a clean token step, every one of them the
wrong step. Pull the frame with `figma-console` and compare the built screen property by property:
type, spacing, padding, icon, colour.

**Look at the frame, do not only read it.** `figma_capture_screenshot` on the node settles in one
glance what a node walk gets wrong, and node walks get this file wrong in two specific ways:

- **Present is not the same as on.** A layer in the tree may be `visible: false`. The home rail's
  four `iconSlot`s are all switched off and hold a placeholder square, which was once read as "Figma
  wants four icons we do not have". It wants none of them.
- **A filtered walk is not a walk.** Searching the tree by name finds only what you guessed the name
  would be. The same rail's real glyphs are called `Group 2136139921` and the like, so a search for
  `/iconSlot|mic/` reported one icon on a rail that has five.

Both of those shipped. A screenshot would have caught either in seconds.

### Then report

**If the screen had a Figma frame:** list every difference between what you built and the frame.
Every one, including the ones you are confident about. Figma is the authority on **composition**;
`reference/*.png` is the authority on **specs** — padding, spacing, size, type, colour. Where a
pattern appears in no screenshot at all, say that Figma is the sole source rather than letting a
Figma value look like a measurement.

**If it had no frame:** read `design-brief.md` and `reference/Voice_UX.md` for how the state should
behave, then tell me **what you had to decide that wasn't written down anywhere**. Those decisions
are the output — they are what goes into `design-system.md` and `sprint-context.md` so the next
screen doesn't re-decide them.

Either way, name anything you added to `component-gaps.md` and any handler you left unwired.
