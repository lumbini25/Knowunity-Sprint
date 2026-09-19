# Scorecard 09 — Reveal

Scope: one screen, one reachable state — `/recall/reveal`. No prop produces
a materially different composition; the model answer, question, and controls
are the only variables, none of which change the layout.

Method: same as prior scorecards. Rendered via both Storybook and the
deployed Vercel URL before any critic ran — this batch turned up a
significant, fully-confirmed rendering bug in that pass, described below.
The four critics then worked blind in isolated contexts with only this
screen. Three of them independently rediscovered the same bug from the same
source lines without seeing each other's work or the orchestrator's
pre-critic note.

---

## Total: 4.9 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(7·3 + 4·3 + 4·3 + 5·3 + 5·2 + 4·1) / 15 = 74 / 15 = 4.9`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 7 | 21 | critic-system | Reading + Gaps-list cross-check; capped at 7 |
| Coherence | High (3) | 4 | 12 | critic-craft | Reading + cross-comparison of 6 identical call sites |
| Craft | High (3) | 4 | 12 | critic-craft | Reading only |
| UX judgment | High (3) | 5 | 15 | critic-ux | Full handler-chain trace, confirmed by orchestrator |
| Accessibility | Medium (2) | 5 | 10 | critic-ux | Reading only |
| Structure | Low (1) | 4 | 4 | critic-system | Reading + pixel-exact arithmetic, confirmed by orchestrator's direct measurement |
| **Reach** (excluded) | — | 6 | — | critic-ambition | Reading only |

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass** | Axe sweep: 0 violations, 0 incomplete. |
| 2 — Touch targets 44×44pt | **FAIL** | "Type your answer" measured at **93×16px** — the same recurring shared `TypeAnswer` component, now confirmed failing on a tenth-plus screen across this series. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **N/A** | Only one state exists. The screen's real structural defect isn't a duplicate-state problem — see Finding 1 below, which is Structure's own separate "renders, but overflows 390px" failure mode, not a Gate 4 case. |

---

## Pre-critic finding, independently confirmed by three of four critics

Before any critic saw this screen, the orchestrator found and measured a
rendering bug: `RevealScreen`'s JSX (`RecallScreens.tsx:2561-2565`) wraps
`RecallResponseCard` in `.knw-recall__bleed` **twice** — two identical
nested `<div>`s, apparently a leftover from an edit. That class applies a
bleed transform meant to be used once (`margin-inline: -20px; width:
calc(100% + 40px)`); applied twice, the effects compound. The orchestrator
measured the inner div directly: **430px wide, positioned from x=-20 to
x=410** — 20px hanging off both edges of the 390px screen. Visually, the
answer card renders edge-to-edge with zero side margin, while the question
bubble immediately above it on the same screen keeps the normal ~20px
gutter — a plainly visible inconsistency in the rendered screenshot.

**Three of the four critics found this independently, from the same source,
with no knowledge of the orchestrator's finding or each other's work:**
critic-craft (Coherence Finding 1, sharpened further — comparing all six
usages of the class in the file, this is the *only* one nested twice, and
called it "the tell that this is a leftover edit rather than a decision");
critic-system (Structure Finding 1, with the identical pixel math — 430px,
-20 to 410 — derived independently by tracing the token chain rather than
measuring, and matching the orchestrator's direct measurement exactly).

**One correction to what two critics predicted, worth stating precisely.**
Both critic-craft and critic-system reasoned that `.knw-screen__middle`'s
`overflow-y: auto` would compute `overflow-x` to `auto` as well per the CSS
spec, producing a **horizontal scrollbar**. The orchestrator checked this
directly: `document.documentElement.scrollWidth` equals `clientWidth` at
390 on the live page — **there is no scrollbar.** The overflowing 40px is
being silently clipped by an ancestor (most likely `.knw-screen`'s
`overflow: hidden`, which takes precedence over the middle slot's own
overflow behavior), not exposed as scrollable content. This is arguably the
worse of the two possible failure modes: a scrollbar would at least be
discoverable; silent clipping means the card's true edges simply don't
exist on screen, with no visible symptom beyond the missing gutter itself.

## Findings, ranked

### 1. The Reveal card renders 40px wider than the viewport and is silently clipped on both edges
**Structure · critic-system (score-defining), Coherence · critic-craft, confirmed directly by the orchestrator (measured before dispatching critics, and reconfirmed after — see above).** This is the rubric's own Structure-4 anchor by name: "it renders, but something overflows 390px." Both the mechanism (nested bleed div) and the outcome (silent clipping, not scrolling) are now fully settled by three independent readings plus direct measurement.
**Fix:** delete the inner `<div className="knw-recall__bleed">` and its closing tag at `RecallScreens.tsx:2562/2564`, leaving the single wrap every one of the other five usages of this idiom already uses.

### 2. The screen's own "required, not optional" claim is false — both of its two paths lead to a screen offering an unconditional Skip
**UX judgment · critic-ux**, confirmed by the orchestrator via direct navigation test. `RevealScreen`'s own code comment states the design intent explicitly: *"SAYING IT BACK IS REQUIRED, NOT OFFERED... there are two ways forward, they just both involve doing it."* But both `onSayItBack` (→ `/recall/recording`) and `onTypeAnswer` (→ `/recall/text-fallback`) land on screens that render `RecallSkip`/`RecallEscapes` with `onSkip={() => go(session.skip())}` wired unconditionally — no rung check (`app/recall/recording/page.tsx:68`, `app/recall/text-fallback/page.tsx:32`, both confirmed by the orchestrator reading the exact lines). The orchestrator confirmed this concretely for the "Type your answer" path: navigating from Reveal to `/recall/text-fallback` and finding "Skip question" genuinely visible and rendered there. Because `session.skip()` calls `settleTerm({..., skipped: true})`, which *overwrites* the existing outcome by `termId`, a student who read the full model answer and only declined to say or type it back gets silently reclassified from a real reveal (`skipped: false`) to a skip — the same category the summary's per-term breakdown uses for a term the student never engaged with at all.
**Fix:** gate `onSkip` on rung in both downstream route files: `onSkip={session.rung === 'reveal' ? undefined : () => go(session.skip())}` — the pattern of omitting a handler to omit a control already exists elsewhere in this same file.

### 3. `TypeAnswer` is 93×16px on this screen too
**Accessibility · critic-ux**, confirmed by direct measurement matching the prediction exactly. The same recurring shared-component failure as every prior scorecard in this series.
**Fix:** unchanged from every prior recommendation on this control.

### 4. Neither of the screen's interactive controls has a pressed state
**Craft · critic-craft.** Grepped `VoiceFab.css`, `RecallScreens.css`, `TypeAnswer.css`: only `:focus-visible` rules exist anywhere; zero `:active` rules. The "Say it back" orb — the screen's single required, primary CTA — gives no visual response to being pressed.
**Fix:** add `:active` treatments matching `Button.css`'s existing pattern.

### 5. No second beat on the screen that declares the term's final failure
**Craft · critic-craft.** Zero `@keyframes`/`transition` in `RecallResponseCard.css`, `HintLadder.css`, or `Screen.css` governing this screen's mount. The card, the ladder lighting its fourth dot, and the model answer all appear at full opacity instantly.
**Fix:** unchanged from prior scorecards' recommendations.

### 6. The screen has no heading anywhere in its DOM
**Accessibility · critic-ux.** The restated question and the model answer are both plain `<p>` tags; the "Answer" badge is a `<span>`. Contrast with `NoAudioScreen` in the same file, which explicitly sets `headingLevel={2}` on its equivalent text block. A screen-reader user has no landmark distinguishing "the question" from "the answer" on the one screen whose entire job is presenting a specific answer.
**Fix:** wrap the answer or its badge in an `<h2>`, following `TextBlock`'s existing `headingLevel` pattern.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 6/10** — "the requirement that say-it-back is mandatory... is a genuine designer's call that a spec-copier wouldn't make — it earns real credit. But everything else on this exact screen is the safest available execution of an already-built shell, at the one screen the brief names as unresolved."

- Zero acknowledgment at the highest-stakes moment in the loop: `NoAudioScreen`, a few hundred lines away in the same file, pairs a *much smaller* failure (a silent, cost-free recording) with an explicit `TextBlock` naming what happened. Four consecutive misses — the exact question `design-brief.md` calls open — gets nothing equivalent.
- The badge reads the same generic "Answer" it would show for a routine fact, despite `badgeLabel` being a documented, already-overridable prop.
- The orb's "Say it back" is pixel-identical to a first-attempt "Speak to start" — the screen's own lengthy comment argues why this ask is uniquely mandatory, but that argument never reaches the control itself.

One stronger pattern proposed with real self-awareness about its risk: a `chipFeedback` verdict marker near the askbar, which the critic itself flags as "the one proposal most likely to actively fight the brief's 'judge generously' constraint rather than serve it" — a red "Not quite" pill next to the answer the student is about to say back could read as punitive at exactly the wrong moment.

## Each critic's blind spot, in its own words

**critic-craft:** "Finding 1 is the one most likely to move on a real render... if some other ancestor I didn't trace clips or re-centers it harmlessly, the visual severity drops even though the code smell remains." *(Orchestrator's note: measured directly — it does clip, exactly as feared, not harmlessly re-centered. The code smell and the visual defect are the same thing.)*

**critic-system:** "The overflow finding above is the one place I'm most confident despite not rendering, because it's arithmetic on values I confirmed against three generated/source files rather than an assumption about behavior." *(Orchestrator's note: this confidence was well-placed on the existence and magnitude of the overflow — but the specific mechanism predicted, a horizontal scrollbar, did not occur. It's silent clipping instead. Confirming a defect's severity from arithmetic doesn't guarantee predicting its exact visible symptom.)*

**critic-ux:** "Finding 2 [the touch target] would collapse entirely if devtools showed a wrapper or reset rule I didn't trace supplying real padding." *(Orchestrator's note: measured directly — 93×16px, no hidden padding, matching nine-plus prior confirmations of this same control across the series.)*

**critic-ambition:** "The whole session is a fixed script... I'm judging a design against one scripted miss, not against how an acknowledgment beat or badge copy would read across the range of things a real judge would actually fail a student on."

---

## What the orchestrator's checks added

Found and precisely measured the bleed bug before any critic saw the screen
— this is the rare case in this series where the orchestrator's own
pre-critic pass surfaced the dominant finding first, and three of four
critics then rediscovered it independently, which is a strong signal the
bug is real and not a false alarm (unlike, for instance, scorecard-02's
card-width prediction, which measurement contradicted). The orchestrator's
most valuable single contribution after the critics reported was the
scrollbar-vs-clipping correction: two critics' identical, careful arithmetic
both predicted the wrong failure mode, and only direct measurement
(`scrollWidth === clientWidth === 390`) revealed the actual mechanism is
silent clipping. Also confirmed directly: the touch-target measurement, a
clean axe sweep, and — most significantly — that the screen's own
"required, not optional" design claim is genuinely false in the running
app, by navigating from Reveal through "Type your answer" and finding
"Skip question" rendered and visible on the far side.
