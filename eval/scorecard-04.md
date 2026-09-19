# Scorecard 04 — Correct, the pass (`/recall/correct`, isolated)

Scope: one screen, one state — `CorrectScreen`. No prop produces a materially
different visual state (a partial pass is a different screen, `/recall/result`).
This is the same screen scorecard-03 already graded as part of a three-screen
batch; this is a from-scratch, blind, screen-only rerun with four fresh critic
instances, per request, so the numbers below are directly comparable
per-dimension scores for this screen alone rather than a batch reading.

Method: same as scorecard-01/02/02 — rendered before any critic ran (single
state, confirmed no Gate-4 comparison is possible), four critics each worked
blind in isolated contexts with only this screen, then the orchestrator
verified what a shell could check.

---

## Total: 5.9 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(7·3 + 6·3 + 6·3 + 6·3 + 3·2 + 7·1) / 15 = 88 / 15 = 5.9`

This is the highest of the four scorecards. The screen is individually solid;
its problems are contained (two under-sized controls, one reused glyph, no
motion) rather than structural.

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 7 | 21 | critic-system | Reading + hand-traced 9 tokens to their generated pixel values, all matched; capped at 7 for no render |
| Coherence | High (3) | 6 | 18 | critic-craft | Reading only |
| Craft | High (3) | 6 | 18 | critic-craft | Reading only |
| UX judgment | High (3) | 6 | 18 | critic-ux | Reading only |
| Accessibility | Medium (2) | 3 | 6 | critic-ux | Reading only |
| Structure | Low (1) | 7 | 7 | critic-system | Reading + traced actual router call sites; capped at 7 for no render |
| **Reach** (excluded) | — | 6 | — | critic-ambition | Reading + Storybook docs only |

All four critics again reported zero working `test-run` calls — every attempt
returned "Tests are already running" (contention from the other panels this
session ran in parallel). Every score above is self-capped at 7.

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass, narrowly — worth flagging** | critic-ux hand-computed the "Next question" label at "≈4.6:1, just over the gate... close enough that I'd want the tool's number before trusting it." The orchestrator measured the actual rendered colour (`rgba(245,243,255,0.48)` on `rgb(9,12,24)`) and computed **4.65:1** — confirming the critic's estimate almost exactly. It passes, but by 0.15 of a ratio point; any future opacity or colour-step change to this label is one snap away from failing. |
| 2 — Touch targets 44×44pt | **FAIL** | "Next question" and "Type your answer" both measured at **≈16px tall** in scorecard-03's direct measurement of these exact same components (350×16 and 93×16 respectively) — this screen doesn't change between that run and this one, so the measurement stands. Both isolated-panel critics (system in the batch run, ux here) independently predicted the same ~16px figure from token arithmetic before the orchestrator ever measured it. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **N/A** | Only one state exists. |

---

## Findings, ranked

### 1. "Next question" — the documented default forward path — is ~16px tall; "Compare with Knowie" — the documented optional detour — is a 140px orb
**Accessibility + UX judgment · critic-ux, finding 1 & 3.** The component's own doc comment states the intent: "'Next question' settles and moves; the orb opens the model answer" (`RecallScreens.tsx:2360-2364`) — i.e. Next question is the expected default. But it renders via `.knw-rrc__next--button` with `padding: 0` and no `min-height` (`RecallResponseCard.css:403-431`), landing at ~16px, against the orb's 140px (`--primitive-size-fab-button`). A student in a hurry is mechanically steered toward the detour they weren't trying to take. Confirmed at 350×16px in the batch measurement.
**Fix:** apply `--semantic-size-tap-target-min` as a transparent hit area, the same pattern `.knw-recall__exit` already uses (its own comment names this exact technique: "Controls shorter than this keep it as a transparent hit area").

### 2. "Type your answer" — the brief's non-negotiable escape hatch — is the same ~16px
**Accessibility · critic-ux, finding 2.** `TypeAnswer.css:6-27`, `padding: 0`, no `min-height`. Confirmed at 93×16px in the batch measurement — same fix as Finding 1.

### 3. The resting-orb glyph means "tap to speak" everywhere else in the loop; here it doesn't speak
**Coherence · critic-craft, finding 1.** `VoiceFab state="Idle"` with `label="Compare with Knowie"` (`RecallScreens.tsx:2417-2418`) draws the identical mic glyph the Idle/Reveal states use to mean "this will record" — but `onCompare` routes to `/recall/correct-feedback`, a read-only screen (confirmed: `app/recall/correct/page.tsx:37`, `goTo('correct-feedback')`). The code's own comment admits this is inherited rather than decided ("Figma captions the orb 'Tap to answer', which is Idle's default label rather than a decision"). A student who has learned "the violet circle starts my turn" gets a wrong prediction from the control's own shape, not just its caption — this is the rubric's Transition-6 anchor by name.
**Fix:** either give the "compare" action its own non-mic glyph, or reconsider whether this action belongs on a `VoiceFab` at all.

### 4. Neither control on the screen has a pressed state
**Craft · critic-craft, finding 2.** Grepped `VoiceFab.css` and `RecallResponseCard.css`: both define `:focus-visible`, neither defines `:active`. Repo-wide, `:active` exists only in `Button.css`, `BottomSheet.css`, and `ChatInput.css` — neither of this screen's two tapped controls is among them.
**Fix:** add `:active` treatments matching `Button.css`'s existing Pressed pattern.

### 5. No second beat on the one moment the screen exists to deliver
**Craft · critic-craft, finding 3.** Zero `@keyframes`/`transition` on `.knw-rrc__score-ring`, `.knw-rrc__badge`, or `.knw-rrc__strip` — contrasted directly against `VoiceFab.css`'s own two designed motion states, built (per that file's comment) specifically because a static equivalent "reads as a frozen app." The verdict simply appears.
**Fix:** a short scale/opacity-in on mount, or a fill animation on the score ring from 0 to the reported percentage.

### 6. A reload mid-session shows a different verdict than the one actually earned
**Structure · critic-system, finding 1**, confirmed by the orchestrator reading `lib/recall/session.tsx:212-226`'s `Persisted` interface directly: it holds `termIndex`, `rung`, `takeIndex`, `outcomes`, `micGranted` — **no `verdict` field**. `app/recall/correct/page.tsx:18-31` reads `session.verdict` straight through; on a fresh reload it comes back `null`/undefined and `CorrectScreen`'s hardcoded default props (a fixed "Historical thinking..." transcript, 100%) render regardless of what the student actually said or scored. This is a documented, deliberate tradeoff in the source comment, not an oversight, but it means the screen's *content* does not survive a reload, only the session's position.
**Fix, if wanted:** persist `verdict` alongside the other four fields; otherwise document the reload behavior explicitly in `sprint-context.md` so it isn't mistaken for a bug later.

### 7. The badge always says "✓ Correct," whether the pass was clean or scraped off hint 3
**Ambition · critic-ambition, observation 1.** `RecallResponseCard`'s documented `badgeLabel` prop is never overridden (`RecallScreens.tsx:2408-2414`), even though the route's own code comment says explicitly: "passing on hint 3 is still a pass, and the card should not claim it was unaided." The honesty is confined to a number in a 44px ring; the one line of text the student actually reads doesn't carry it.
**Fix (ambition's proposal, built entirely from existing documented props):** when `session.verdict.rung !== 'attempt1'`, override `badgeLabel` (e.g. "✓ Passed, with a hint") and `VoiceFab`'s `label` to something that names the stakes rather than the uniform default.

### 8. Checked and not a problem: the primary control does not get pushed below the fold
**Originally a Structure concern raised by critic-system** (finding 2: `VoiceFab` sits in `middleContent` rather than `bottomContent`, against the scaffold's own "primary action pinned to bottom" rule, with the concern that a tall column could push it out of view). The orchestrator measured the rendered fab directly: **x:20, y:403, width:350, height:250** — bottom edge at 653px, comfortably within the 844px viewport, with `.knw-screen__middle`'s `scrollHeight` (788) equal to its `clientHeight` (788) — no overflow at all. The scaffold-rule departure is real as a documentation question, but the practical risk the critic raised does not materialize on this screen's actual content length.

### 9. Two different drawings of one checkmark
**Craft · critic-craft, finding 4** (lowest-weighted by the critic itself, since the two don't render side by side on this screen). `RecallResponseCard/icons.tsx`'s `CheckIcon` (path 12.5×9) differs from `Checkbox/icons.tsx`'s `CheckIcon` (path 12×8.67), which `VoiceFab`'s Sent state imports instead of the former.
**Fix:** have `VoiceFab` import `RecallResponseCard`'s `CheckIcon`, which already matches this file's `iconSlot Size=200` convention.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 6/10** — "clean, correct, and already carries real craft... but it stops at reporting a pass, not at making the difference between an earned and a scraped pass legible."

Same core observation as Finding 7 above, plus: Knowie's pose is uniformly "excited" regardless of score (`RecallScreens.tsx:2397`), so the mandate's "overconfidence has to cost something" is answered at the summary but never felt at the moment the win actually happens. Two stronger patterns proposed, both built from documented existing props (`badgeLabel`, `VoiceFab`'s `label`) or components (`Chips` as a static "Hint used" tag) — no new component or token needed for either. The critic's own named blind spot: its second proposal (a `Chips` tag annotating a result card) is "the only piece asking an existing component to do a job no story or spec anywhere shows it doing," and it flags this as its weakest inference, not its strongest — worth weighing that caveat before treating either proposal as ready to build.

*Disclosure, reported for the record:* this critic noted that a `grep` for "auto-advance" incidentally surfaced one line from `eval/scorecard-03.md`, said it did not read the file or use its content, and independently re-verified the underlying claim from source before deciding not to use it. The claim in question (no auto-advance timer on a pass) doesn't appear as a scored finding in this report, so nothing here rests on that exposure.

## Each critic's blind spot, in its own words

**critic-craft:** "The finding most likely to evaporate under a real render is finding 2 [no pressed state] if some ancestor element... supplies a default browser `:active` darkening I didn't grep for." *(Orchestrator did not independently re-check this one — flagged here as still open.)*

**critic-system:** "Both scores are capped at 7 in the score line itself for exactly this reason [zero executed scripts]... I sampled 9 tokens end-to-end... out of the dozens this screen's component chain touches." *(Orchestrator's note: the reload/Persisted-interface finding, this critic's highest-confidence Structure claim, was independently confirmed by reading the exact same interface — it holds. The below-the-fold concern did not hold under direct measurement — see Finding 8.)*

**critic-ux:** "If browser default button metrics... add back more height than the explicit `padding: 0` should allow, Findings 1 and 2 shrink from 'categorical failure' to 'still under 44pt but less dramatically so.'" *(Orchestrator's note: measured directly in scorecard-03 at exactly 350×16 and 93×16 — no hidden padding found; the finding holds at full severity, not a softened version of it.)*

**critic-ambition:** "The mock's fixed per-rung scores make 'score < 100 implies a hint was used' true by construction, and that equivalence could break the moment scoring is real, which would make my badge-copy gating logic wrong in exactly the direction the brief warns against."

---

## What the orchestrator's checks added

Measured the "Next question" label's actual rendered contrast — **4.65:1**,
confirming critic-ux's own hand-estimate to within 0.05 and settling Gate 1 as
a genuine but narrow pass rather than an open question. Read the `Persisted`
interface in `lib/recall/session.tsx` directly and confirmed `verdict` is
excluded, exactly as critic-system's Structure finding claimed. Measured
`VoiceFab`'s actual bounding box and the middle content's scroll dimensions:
no overflow, so the below-the-fold risk critic-system raised as a paper
concern does not manifest on this screen's real content length — the one
claim in this batch that checked out as "real issue, no practical
consequence" rather than either fully confirmed or overturned.
