# Scorecard 05 — Idle, Lesson, Misheard

Scope: `/recall/idle` (three states: the mic-permission primer, its raised
sheet, and the granted Idle turn itself), `/recall/lesson` (one state),
`/recall/misheard` (one state). Five states total. Written to
`scorecard-05.md`, not `scorecard-01.md` as literally requested — that name
belongs to the entry-path scorecard; `-02` is the folders-only rerun, `-03`
the answer-sent/comparison/correct batch, `-04` the correct-screen-only
rerun.

Method: same as the prior four. All five states were rendered via Storybook
before any critic ran, cross-checked against the real routes (session storage
seeded per `scripts/a11y.mjs`'s own pattern). The four critics then each
worked blind, in isolated contexts, with only these three screens,
`eval/rubric.md`, and their own dimensions. After all four reported, the
orchestrator verified every checkable claim with a shell.

---

## Total: 5.3 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(6·3 + 4·3 + 6·3 + 6·3 + 4·2 + 6·1) / 15 = 80 / 15 = 5.3`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 6 | 18 | critic-system | Reading + 8 spot-checked token pairs, all matched; capped at 7 |
| Coherence | High (3) | 4 | 12 | critic-craft | Reading only |
| Craft | High (3) | 6 | 18 | critic-craft | Reading only |
| UX judgment | High (3) | 6 | 18 | critic-ux | Reading only |
| Accessibility | Medium (2) | 4 | 8 | critic-ux | Reading only |
| Structure | Low (1) | 6 | 6 | critic-system | Reading + traced router call sites; capped at 7 |
| **Reach** (excluded) | — | 6 | — | critic-ambition | Reading + Storybook docs only |

All four critics again reported zero working `test-run` calls (one attempted
six times, another for the full session duration — the system critic's run
alone took over two hours of wall-clock retries before giving up). Every
score above is self-capped at 7.

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass** | Axe sweep on all four render paths (Idle, Idle-primer, Lesson, Misheard): 0 violations. One "incomplete" flag on Idle (`.knw-recall__intro`, `messageKey: elmPartiallyObscuring`) investigated by hand: text `rgb(244,242,255)` on bubble `rgb(34,36,47)` — comfortably high contrast; the flag is a tool artifact from Knowie's mascot deliberately overlapping the speech bubble (the same "37.5% overlap" intent documented elsewhere in this codebase), not a real failure. |
| 2 — Touch targets 44×44pt | **FAIL** | Measured directly: "Skip question" on Idle — **73×16px**; "Type your answer" — **93×16px** (same shared component seen failing in every prior scorecard); Misheard's two verdict-correction buttons, "App misheard me" and "That's what I said" — **157×34px each**, the exact controls Voice_UX principle 4 is built around. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **Pass, but see Finding 1** | All five states are visually distinct. But Misheard's "Next question" label is not a genuine fourth escape route — see Finding 1, which is the substantive version of what this gate exists to catch: a control that reads as live and isn't. |

---

## Findings, ranked

### 1. Misheard shows a dead "Next question" control, pixel-identical to a working one — found by the orchestrator, not corroborated by any critic
Confirmed on the real running route, not just Storybook: `MisheardScreen` never passes `onNextAction` to `RecallResponseCard` (`RecallScreens.tsx:1744-1748`), and its own code comment states why — **"Skip is deliberately absent... a skip here would trade a retry that costs nothing for a recorded miss."** But `RecallResponseCard.tsx:359-368` falls back to rendering the label anyway as a plain `<p className="knw-rrc__next">`, and `RecallResponseCard.css:403-431`'s own comment states the two forms are "indistinguishable on screen and differ only in what a screen reader and a keyboard get." Measured directly: `tagName: "P"`, `onclick: null`, `cursor: "auto"`. A student sees "Next question" in the exact position and style it occupies as a working link on Correct and Wrong, and it does nothing here. This is the intent stated in the screen's own comment being defeated by a shared component's default fallback.
**Fix:** either pass a real no-op-safe `onNextAction` that's genuinely absent from the render (the component needs a third state — "omit entirely" — distinct from "render as inert text"), or add a prop to suppress the `<p>` fallback when a screen deliberately wants no next-control at all.

### 2. Lesson's back control is a raw text glyph — the exact defect the system already found, fixed, and turned into a rule
**Coherence · critic-craft, System fidelity · critic-system** — independently found by both. `RecallScreens.tsx:3293-3295` renders `‹` as literal text inside `.knw-recall__exit`, not an SVG — confirmed by the orchestrator via direct DOM inspection: `hasSvg: false`, `textContent: "‹"`. `design-system.md:1147` records this precise pattern already closed once: *"The recall exit was a text `✕`... Never a text character where an icon belongs is now a rule in the build-screen skill."* The library already has a matching precedent for a drawn chevron (`ChevronRightIcon`, `FolderCard/icons.tsx:13`). Also uncaught by its own story: the `Lesson` play function never asserts anything about this control (critic-craft's Finding 3), which is how a defect this well-documented survived reintroduction.
**Fix:** draw a `ChevronLeftIcon` matching the codebase's existing icon-box convention and swap it in; add a story assertion that the control contains an `<svg>`.

### 3. Lesson can describe one term while the retry quizzes a different one entirely
**UX judgment · critic-ux**, confirmed by the orchestrator reading `lib/recall/session.tsx:614-626`'s `skip()` directly. `app/recall/lesson/page.tsx:21`: `session.outcomes.find(o => o.skipped || o.passedAt === null)` returns the **first** unresolved outcome in settle order — but `skip()` settles a skipped term into `outcomes` immediately, at the moment it's skipped, not at the moment the student later arrives at Lesson. Concretely: skip term 1, pass terms 2–3 normally, miss term 4 to the reveal, tap "Revise now" — Lesson displays term 1's title and body (the long-since-skipped one), while "Explain out loud" routes to `/recall/idle`, which reads `session.term` from live `termIndex` and quizzes on term 4. `sprint-context.md`'s own justification for this screen — "the difference between a test and an ambush" — is defeated by its own logic, on exactly the path Skip (an in-scope Voice_UX Must) puts a real student on.
**Fix:** key the lesson content off `session.term` (the term actually about to be re-attempted), not a separately-scanned `outcomes` array.

### 4. Two more controls fail the 44pt gate: Idle's Skip and text-fallback, Misheard's two verdict buttons
**Accessibility · critic-ux**, all values matched exactly by direct orchestrator measurement (see Gate 2). The Skip/text-fallback pair is the same shared `.knw-recall__skip-control`/`.knw-typeanswer` components already found failing in every prior scorecard in this series — this is now confirmed on a fourth and fifth screen.
**Fix:** `min-height: var(--semantic-size-tap-target-min)` on both, plus increased `padding-block` on `.knw-rrc__action` for the Misheard buttons.

### 5. Four Lesson type bindings drop `letter-spacing` while sibling rules in the same file bind the complete set
**System fidelity · critic-system**, confirmed by the orchestrator reading all four rules directly: `.knw-lesson__stat-value`, `.knw-lesson__stat-label`, `.knw-lesson__eol-title`, `.knw-lesson__eol-time` (`RecallScreens.css:2022-2038, 2107-2121`) each bind family/weight/size/line-height but omit `letter-spacing` — and the token they're missing (`--primitive-font-tracking-loose`, 0.01em) is non-zero, so the rendered tracking is measurably different from the token's intent. `design-system.md:1140` already records this exact defect category as supposedly closed elsewhere.
**Fix:** add the missing `letter-spacing` declaration to each of the four rules, per the critic's exact line numbers.

### 6. The permission sheet has no entrance motion
**Craft · critic-craft**, confirmed by the orchestrator: grepped `BottomSheet.css` for `transition|animation|@keyframes` — zero matches. This is the rubric's own Craft-6 anchor verbatim ("sheets appear rather than rise").
**Fix:** add a mount transition (`translateY(100%)` → `translateY(0)`) gated behind `prefers-reduced-motion`, matching the pattern `VoiceFab.css` already uses for the orb's motion states.

### 7. Misheard's progress indicator is hardcoded to "0 of 4" regardless of actual session position
**Flagged by critic-system as adjacent evidence, not scored under their dimensions** — confirmed by the orchestrator: `aria-label="Terms answered: 0 of 4"` measured directly on the real route, because `app/recall/misheard/page.tsx` passes no `progress`/`progressText` props at all, falling through to `RecallHeader`'s defaults. `Idle`'s identical header component, by contrast, computes real values from `session.termIndex`/`session.termCount`. A student misheard on term 3 of 4 sees "0 of 4."
**Fix:** wire `progress`/`progressText` from `session` the same way `app/recall/idle/page.tsx:61-62` already does.

### 8. Corrected framing, kept for the record
**UX judgment · critic-ux** pointed out, correctly, that this orchestrator's prompt mischaracterized "misheard" as a Voice_UX Must — `reference/Voice_UX.md`'s table actually lists "very noisy / garbled transcript" as **If time**, not Must. Only the permission primer is a genuine Must in this batch. The critic graded Misheard against its real, lighter obligation, which it clears well: an amber badge (not colour alone — distinct icon and copy from Wrong), the transcript shown, correcting it never required. Noted here so the score isn't misread as crediting a Must the reference doc doesn't name.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 6/10** — every hard constraint and Must is met with real care, but "nowhere does a screen push past the decision it was handed into something a spec-follower wouldn't have arrived at on their own."

- Lesson computes exactly which concepts a student missed (`missingItems`, already on every scripted term) and discards it before rendering — showing the same generic paragraph to a student who missed one clause and one who missed the whole concept. `sprint-context.md`'s own "test vs. ambush" framing is answered generically rather than specifically.
- Two of Lesson's three stats (`estimatedTime`, `difficulty`) are fixed defaults never wired per term — only `conceptCount` reflects real session data.
- The permission primer's copy — the single highest-leverage moment in the flow, per Voice_UX principle 3's "one native ask" — never touches the brief's actual differentiator (a felt "I actually know this" signal); it reads like generic mic-onboarding copy.
- A lesson-triggered retry renders identically to a first attempt: `IdleScreen`'s `intro` only shows on `rung === 'attempt1'`, so a student who just reread material specifically to close a named gap sees the exact same opening line as someone meeting the term cold.

Two stronger patterns proposed, both requiring no new component: threading `missingItems` into `LessonScreen` via existing `ListItem` rows, and rewriting the primer's two text nodes to state the retrieval claim directly. The critic's own named blind spot: it could not confirm the `ListItem` proposal fits above the pinned CTA on a real 390×844 viewport, and named this "the pattern most likely to collapse on contact with the real product" — citing the design system's own documented history of exactly this kind of overflow (`design-system.md:1129`).

## Each critic's blind spot, in its own words

**critic-craft:** "I cannot rule out that the Lesson back-button character... renders smaller or more benign than the CSS suggests... [and] I cannot confirm the sheet actually looks static rather than merely lacking a named CSS transition." *(Orchestrator's note: the glyph claim is confirmed exactly — `hasSvg: false` on the live DOM. The sheet-transition claim also holds — zero animation rules found anywhere in the file.)*

**critic-system:** "I did not read every rule in the 2,900-line `RecallScreens.css` file end to end, only the blocks whose class names I could trace from the four components' JSX." *(Orchestrator's note: the four letter-spacing gaps this critic did trace were confirmed exactly as claimed.)*

**critic-ux:** "If a native `<button>` reset or an ancestor I didn't grep adds padding or an invisible hit-slop, Findings 2 and 3 could shrink or disappear." *(Orchestrator's note: measured directly — 73×16, 93×16, 157×34, all matching the critic's predictions with no hidden padding found.)* This critic also corrected the orchestrator's own task framing (Finding 8) — a critic pushing back on the prompt it was given, rather than accepting a mischaracterization, is itself worth noting as a sign the "grade blind" instruction is working as intended.

**critic-ambition:** "I did not trace every branch of `session.tsx` to confirm which term is 'weakest' under a partial-only or skip-only session" — this turned out to be exactly the mechanism critic-ux's Finding 3 (the Lesson term-mismatch bug) hinges on, reached independently from a different angle (content-quality vs. correctness) without either critic seeing the other's work.

---

## What the orchestrator's render pass added

Found the batch's single most serious defect (Finding 1, the dead "Next
question" ghost on Misheard) before any critic ran, by comparing this
screen's controls against the equivalent live ones on Idle and Correct and
tracing the difference to source — confirmed on the real production route
(`<p>`, `cursor: auto`, no handler), not just inferred from Storybook. Also
confirmed, before dispatching critics, that Knowie's heavy blur on the
permission-primer screen is deliberate (`RecallScreens.css:293-317`
documents a Figma-to-CSS blur-radius conversion at length) rather than a
broken render — worth stating plainly since a blurred mascot is exactly the
kind of thing a first glance would flag as an asset-loading failure. After
all four critics reported, direct measurement confirmed every touch-target
and CSS-absence claim exactly as predicted, and resolved Idle's one axe
"incomplete" flag as a tool artifact from a deliberate mascot/bubble overlap
rather than a real contrast failure — the fourth time in five scorecards this
exact axe failure mode (an element overlap or non-standard glyph confusing
the contrast checker) has shown up and resolved to a non-issue on inspection.
