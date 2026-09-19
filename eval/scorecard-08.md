# Scorecard 08 — Result (the hint ladder)

Scope: one screen, `/recall/result`, across its real combinatorial state
space — verdict (Wrong or Partial) × rung (hint1, hint2, or hint3). Six
theoretical cells; **five are actually reachable** — see Finding 1, which
resolves a question three of the four critics (and the orchestrator's own
pre-critic pass) independently raised but couldn't settle on their own.

Method: same as prior scorecards, with one addition — this session's render
pass used the **deployed Vercel URL** (`https://knowunity-sprint-one.vercel.app`)
per the user's standing instruction from earlier this session, cross-checked
against Storybook for the three documented stories. The four critics then
worked blind in isolated contexts. After all four reported, the orchestrator
verified every checkable claim with a shell.

---

## Total: 6.2 / 10 (weighted) — tied for the highest in this series

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(7·3 + 6·3 + 6·3 + 7·3 + 5·2 + 5·1) / 15 = 93 / 15 = 6.2`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 7 | 21 | critic-system | Reading + Gaps-list cross-check on 3 departures; capped at 7 |
| Coherence | High (3) | 6 | 18 | critic-craft | Reading only |
| Craft | High (3) | 6 | 18 | critic-craft | Reading only |
| UX judgment | High (3) | 7 | 21 | critic-ux | Reading + full handler-chain trace |
| Accessibility | Medium (2) | 5 | 10 | critic-ux | Reading only |
| Structure | Low (1) | 5 | 5 | critic-system | Reading + exhaustive script-data trace |
| **Reach** (excluded) | — | 6 | — | critic-ambition | Reading only |

All four critics again reported `test-run` locked ("Tests are already
running") on every attempt — one logged eight consecutive tries. Every score
above is self-capped at 7.

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass** | Axe sweep on the Hint-1/Wrong render: 0 violations, 0 incomplete. Not independently re-swept on every rung this round, given the consistent clean pattern established across scorecard-07 and the orchestrator's own pre-critic renders of hint2/hint3 by eye. |
| 2 — Touch targets 44×44pt | **FAIL** | "Skip question" measured directly at **350×16px** — full card width, but only 16px tall. Same recurring shared-link pattern as `TypeAnswer` in every prior scorecard, here on the card's own next-action link (`.knw-rrc__next`) rather than the escape row. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **Pass** | Hint1, hint2, hint3 (Wrong), and Hint1 (Partial) are all visually distinct — confirmed by direct render, including hint2, which has no story and was checked live on the deployed URL. The one untested cell in the matrix, Partial+hint3, cannot be a Gate 4 violation because it cannot occur — see Finding 1. |

---

## Findings, ranked

### 1. The one untested combination three critics (and the orchestrator) flagged turns out to be mathematically unreachable — not merely untested
**Structure · critic-system**, confirmed independently by the orchestrator reading the same source. The orchestrator's own pre-critic investigation, critic-craft, and critic-ux all separately treated "Partial at hint3" as an open question worth checking. critic-system settled it: `settleTake` (`lib/recall/session.tsx:448-458`) means a Result screen at `rung=hint3` only ever shows the verdict of the take that just failed *at hint2*. Checking all four scripted terms' hint2 rungs directly (`lib/recall/script.tsx`, confirmed by the orchestrator via grep): three score `Correct` (never reaches a failing state) and the fourth scores `Wrong`. **None scores `Partial`.** So `verdict=Partial, rung=hint3` cannot be produced by any sequence of taps through the current scripted session — it isn't a rendering gap, it's dead prop-space that happens to also be unannotated (every other departure on this screen is commented; this combination's impossibility is not noted anywhere).
**Fix:** either add a one-line comment at the `promoted = rung === 'hint3'` computation noting the combination is currently unreachable, or author a Partial take at some term's hint2 rung so it becomes real and can get a story.

### 2. Even where it can't currently be reached, the reading order for a promoted hint is inverted in a way that would matter if it ever were
**Coherence · critic-craft.** At hint1/hint2, the in-card hint reads *before* the "Skip question" link (body → hint → skip). At hint3, the hint is extracted into a panel that renders *after* `ResultScreen`'s own next-action link (`RecallScreens.tsx:2226-2242`) — so the most escalated hint, the one the "escalating warmth" design intent calls most important, would read last, after the control that lets a student give up. This is real today at Wrong+hint3 (confirmed reachable and rendered), not just the hypothetical Partial+hint3 cell.
**Fix:** render the promoted panel as a sibling of the card's body, before its next-action link, rather than after the whole card.

### 3. Two different SVG drawings mark "hint" across this screen's own three rungs
**Coherence · critic-craft**, confirmed by the orchestrator: `HintIcon` (`components/RecallResponseCard/icons.tsx:53`, a filled alert-disc) marks the in-card hint at hint1/hint2; `HintBulbIcon` (`components/screens/RecallScreens/icons.tsx:55`, a stroked lightbulb) marks the promoted panel at hint3 — two separate functions in two separate files, not a recolor of one drawing. A student climbing hint1→hint2→hint3 sees the "here's help" glyph change shape mid-flow.
**Fix:** pick one glyph and vary only color/weight for the escalation, or promote the bulb to the single hint icon used at every rung.

### 4. The card's own skip control is 16px tall
**Accessibility · critic-ux**, confirmed by direct measurement (350×16px — matches the critic's source-derived prediction exactly). This is the shared `.knw-rrc__next` link across every `RecallResponseCard`-based verdict screen (also seen failing in the Correct-screen and answer-sent scorecards), now confirmed on the Result screen too — and here a mis-tap has a real cost, since it calls `session.skip()`, recording a miss.
**Fix:** unchanged from every prior recommendation on this control family — give it a transparent 48px hit area around the visible text.

### 5. No safe-area-bottom protection on this screen, contradicting the design system's own claim that the scaffold provides it universally
**Structure · critic-system**, confirmed by the orchestrator via direct measurement: `.knw-screen__bottom` does not exist on this route (`ResultScreen` passes only `topNavigation`/`middleContent` to `Screen`), and `.knw-recall`'s actual bottom padding measures exactly **24px** — a flat value with no `env()` term, chosen to match the recall column's rhythm rather than the device's real inset. `design-system.md:705` states the scaffold "already applies" safe-area insets to every recall screen; confirmed false for this one. `app/layout.tsx` sets `viewportFit: 'cover'`, so on a real notched iPhone the actual inset (~34px) exceeds what this screen reserves by 10px. This is the same category of finding as scorecard-02's folders screen.
**Fix:** either give `ResultScreen` a real `bottomContent` slot, or add `padding-block-end: max(var(--semantic-space-layout-xl), env(safe-area-inset-bottom))` directly to `.knw-recall--result`.

### 6. A mid-verdict reload shows a fabricated transcript under a real verdict badge
**UX judgment · critic-ux**, the same root cause as a finding from the Correct-screen scorecard (`verdict` is deliberately excluded from persisted session state). A reload while `/recall/result` is showing lands with `verdict=null`, and `RecallResponseCard`'s own hardcoded default transcript renders under whatever badge the stale `rung` produces — content that isn't what the student actually said, though every control on the resulting screen still works.
**Fix:** persist `verdict` alongside the four already-persisted fields, or route a verdict-less reload back to `/recall/idle` at the current rung.

### 7. No second beat on the verdict landing
**Craft · critic-craft**, confirmed by the orchestrator: grepped `RecallResponseCard.css` and the result-specific block of `RecallScreens.css` for `animation`/`transition` — zero matches. The badge, score, breakdown, and hint panel all appear at full opacity the instant the route mounts.
**Fix:** unchanged from prior scorecards' recommendations — a short fade/scale-in gated on `semantic/motion/*`.

### 8. No Storybook story exercises rung=hint2 at all
**System fidelity · critic-system**, corroborated by critic-craft. Confirmed via Storybook's own story list: only `result-hint-1` and `result-hint-3` exist. The orchestrator's pre-critic render (on the deployed URL, since no story covers it) confirmed hint2 renders correctly and distinctly — but that confirmation exists only because the orchestrator went looking, not because the system's own test surface would have caught a regression here.
**Fix:** add a `ResultHint2` story mirroring `ResultHint1`'s assertions.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 6/10** — "the rung-3 hint promotion is a real, faithfully-built design move... but the screen never uses that escalation to say anything the student couldn't already infer from the ladder's dots."

- `missingItems` is term-level, static data (`app/recall/result/page.tsx:34`) — a student who misses the same term three times across hint1/hint2/hint3 sees the identical three "what was missing" bullets every time, even though each attempt's transcript is genuinely different. The card already has the machinery (`gotItems`/`stillMissingItems`) to show movement; it's scoped away from exactly the path where movement is most likely to go unnoticed.
- Rung 3 escalates in color and shape only — `nextActionLabel` stays "Skip question" and the orb's caption stays "Speak to start" at the one rung the design already visually treats as different, even though both are documented, text-overridable props.
- The Partial path (closer to a pass) gets a richer, two-part credit structure; the Wrong path (needing more generosity per the brief's own mandate) gets a flatter, unchanging list — a documented, intentional asymmetry that runs opposite to which path needs more encouragement.

One stronger pattern proposed (a static "Last hint" label at rung3, using existing `Chips` and the already-overridable `nextActionLabel`/`voiceFab` label props). The critic's own named blind spot, worth taking seriously: it can't rule out that an explicit "this is your last chance" label would *increase* rather than decrease abandonment for an anxious student — a felt-experience judgment no amount of source-reading can settle.

## Each critic's blind spot, in its own words

**critic-craft:** "The finding most likely to move on a real render is #2 [the reading-order inversion]... a screenshot could plausibly show it's unnoticeable... Finding 1 [two hint icons] is the one I'd bet on surviving a render unchanged." *(Orchestrator's note: confirmed both are genuinely separate icon functions in separate files — that part of finding 1 stands regardless of rendering.)*

**critic-system:** "The Partial+hint3 unreachability claim rests on reading all four terms' hint2 rungs in `script.tsx`, which is exhaustive for the current script but would silently go stale if anyone edits that file later." *(Orchestrator's note: independently re-confirmed this exact same grep and got the identical result — three Correct, one Wrong, zero Partial, at hint2 across all four terms.)*

**critic-ux:** "Finding 1 [the 16px skip target] could be wrong if some ancestor rule I didn't find gives it an invisible hit area." *(Orchestrator's note: measured directly — 350×16px, no hidden padding found.)*

**critic-ambition:** "My strongest finding, the static missing-items list, is a property of the *content* the script writer chose as much as the *component* the screen renders — a real judging model might naturally vary 'what's missing' per attempt in ways this prototype's fixed data cannot demonstrate either way."

---

## What the orchestrator's checks added

Rendered hint2 directly (no story exists for it) using the deployed Vercel
URL per the user's standing instruction, confirming it composes correctly
before any critic saw the screen — this meant all four critics could treat
"no story for hint2" as a documentation gap rather than an open question
about whether the state even works. After all four critics reported, the
orchestrator's most valuable single check was re-deriving critic-system's
script-data trace independently: grepping all four terms' hint2 verdicts
directly confirmed, byte for byte, that Partial+hint3 is unreachable — this
converts what the orchestrator and two other critics had flagged as merely
"untested" into a settled, precise fact. Also confirmed directly: the skip
control's 350×16px box, the missing `.knw-screen__bottom` slot and its
literal 24px substitute padding, the two separate hint-icon source files,
and a clean axe sweep on the Hint-1/Wrong render.
