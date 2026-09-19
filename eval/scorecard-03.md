# Scorecard 03 — The take, Comparison, Correct

Scope: `/recall/answer-sent` (three states: beat 1 waiting, the delete
confirmation sheet, beat 2's 300ms flash), `/recall/comparison` (one state),
`/recall/correct` (one state). Five states total. Written to
`scorecard-03.md`, not `scorecard-01.md` as literally requested — that name is
taken by the entry-path scorecard, and `-02` by the folders-only scorecard;
following the numbering already established for those two runs.

Method: same as scorecard-01/02. All five states were rendered before any
critic ran — the three `AnswerSentScreen` states and `Correct`/`Comparison`
via their Storybook stories (`screens-recall-states--*`, all dark by default
per `.storybook/preview.tsx`), cross-checked against the real running routes
(session storage seeded the way `scripts/a11y.mjs` already does, so
`session.take` renders genuine scripted content). The four critics then each
worked in isolated contexts with only these three screens, `eval/rubric.md`,
and their own dimensions. After all four reported, the orchestrator verified
every claim that could be checked with a shell — this batch had unusually
good agreement between critic prediction and measurement (see below).

---

## Total: 5.0 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(6·3 + 4·3 + 6·3 + 5·3 + 3·2 + 6·1) / 15 = 75 / 15 = 5.0`

This is the strongest of the three scorecards so far, and the gap between it
and scorecard-01/02 is informative: this trio's worst problems are contained
(mistuned button hierarchy, missing motion, one wrong token) rather than
structural (destinations that lie, content that's simply wrong).

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 6 | 18 | critic-system | Reading only; capped at 7 |
| Coherence | High (3) | 4 | 12 | critic-craft | Reading only |
| Craft | High (3) | 6 | 18 | critic-craft | Reading only; "the honest 6, not a 4 — nothing is missing... only undecorated" |
| UX judgment | High (3) | 5 | 15 | critic-ux | Reading only |
| Accessibility | Medium (2) | 3 | 6 | critic-ux | Reading only — **partially overturned, see Gate 1** |
| Structure | Low (1) | 6 | 6 | critic-system | Reading only; capped at 7 |
| **Reach** (excluded) | — | 6 | — | critic-ambition | Reading + Storybook docs only |

All four critics again reported zero working `test-run` calls this session —
every attempt returned "tests are already running," which is very likely
contention between the multiple critic agents this orchestration ran in
parallel across two concurrent scorecards. None of the four scores above
carries a rendered/tested verification; all are explicitly self-capped at 7.

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass, with a tool blind spot worth reading** | `npm run a11y`-equivalent axe run on all three routes: **0 violations**. Two "incomplete" flags investigated by hand: (a) `/recall/comparison`'s `.knw-recall__exit` — flagged `messageKey: "nonBmp"`, meaning axe's contrast engine cannot reliably measure a non-standard Unicode glyph. This is not a contrast failure, but it is a second, independent way the raw-`✕`-instead-of-`CloseIcon` bug (Finding 4 below) is worse than cosmetic: it also defeats automated accessibility auditing on that control. (b) `/recall/correct`'s `.knw-rrc__score-text` ("100%") — flagged `bgOverlap`, `contrastRatio: 0`. Manually computed from the actual rendered colours (text `rgb(74,229,176)` on card `rgb(34,36,47)`): **9.64:1**, comfortably passing — axe's flag is a tool artifact from the overlapping percentage-ring SVG, not a real problem. |
| 2 — Touch targets 44×44pt | **FAIL** | Measured directly on the rendered routes: "Type your answer" **93×16px** (both `/recall/answer-sent` and `/recall/correct`); "Skip question" **73×16px**; the discard/trash pill **40×40px** (matches its own code comment's stated spec exactly); "Next question" on Correct — **the single most-tapped forward control in the entire loop** — **350×16px**. All four match the critics' predictions exactly. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **Pass** | All five states (beat 1, discard sheet, beat 2, Correct, Comparison) are visually distinct — confirmed by the orchestrator's render pass before any critic ran. The beat-1→beat-2 transition is a strong distinction: Knowie's pose changes from alert "waiting" to a sleepy, one-eye-closed "thinking" pose, and Continue/Retry/trash disappear together. |

---

## Findings, ranked

### 1. Four controls fail the 44×44pt gate, one of them the loop's single most-tapped control
**Accessibility · critic-ux**, all four values independently re-measured by the orchestrator and matched exactly (see Gate 2). "Next question" on Correct is the primary forward action past every pass in the entire session; it is 16px tall.
**Fix, per control:** add `min-height: var(--semantic-size-tap-target-min)` to `.knw-typeanswer`, `.knw-recall__skip-control`, and `.knw-rrc__next--button`; wrap `.knw-fab__discard`'s 40px pill in a 48px hit area the way `.knw-button` already wraps its own pill.

### 2. The discard sheet's button hierarchy makes the costly choice look like the recommended one
**UX judgment · critic-ux.** `RecallScreens.tsx:1210-1216` — `<Button variant="Primary" CTA="Yes" onClick={onDiscard} />` beside `<Button variant="Secondary" CTA="No" />`. The sheet's own copy admits the stakes ("you will be moved forward to the next question"), but Primary is this system's affirmative/"go" treatment everywhere else — a rushed student reads button weight before button label. Confirmed by the orchestrator reading the exact JSX (`variant="Primary" CTA="Yes"`, `variant="Secondary" CTA="No"`, verbatim).
**Fix:** swap the variants.

### 3. A raw text `✕` sits where every other exit control uses a real SVG icon — and it defeats automated contrast auditing too
**Coherence · critic-craft**, independently corroborated by critic-ux ("outside my dimensions"). `ComparisonScreen`'s own top bar (`RecallScreens.tsx:2713`) renders a literal `✕` character; `AnswerSentScreen` and `CorrectScreen` both use `RecallHeader`, which renders `CloseIcon` (`icons.tsx:96-107`'s own comment documents this exact defect was already found and fixed once — for `RecallHeader` — and `ComparisonScreen` was never migrated). Confirmed by the orchestrator via direct DOM inspection: `textContent: "✕"`, `hasSvg: false`. The orchestrator's own axe run independently rediscovered this from a different angle — see Gate 1's `nonBmp` note.
**Fix:** replace the `✕` with `<CloseIcon />`, matching `RecallHeader`'s markup, or have `ComparisonScreen` render `RecallHeader` itself.

### 4. `ComparisonScreen` binds a decorative token to a correctness signal, against an explicit Never rule — and against its own tick marks three lines later
**System fidelity · critic-system.** `RecallScreens.css:2226-2228` sets the "Correct answer" header to `var(--semantic-accent-green-bold)`. `design-system.md:1109`: *"Never use an accent token for a validation or feedback state. `accent/green/bold` is for streaks and decorative stats. `feedback/success/surface/bold` is for correct answers."* Confirmed by the orchestrator reading the token's own inline comment in `build/css/tokens.css:238`: *"Decorative green. Streak counters, positive stat chips. Not for validation."* The same screen's tick markers (`RecallScreens.css:2281`) correctly use `--semantic-feedback-success-bold` for the identical concept — the screen contradicts itself, not just the rule.
**Fix:** change `RecallScreens.css:2227` to `var(--semantic-feedback-success-bold)`.

### 5. The take screen's trash icon and its "Skip question" link both forfeit the term — while Retry, the control that actually costs nothing, sits directly beside the trash
**UX judgment · critic-ux.** `app/recall/answer-sent/page.tsx:47-50`: `onDiscard` and `onSkip` are the identical call (`session.skip()`); the genuinely free `discard()` function exists in `session.tsx` but the route file's own comment says it "has no caller." A trash icon conventionally signals undo, not forfeit, and it sits next to Retry — the control that is the actual undo.
**Fix:** either restore `discard()` as the trash's real handler, or restyle the pill so it doesn't read as a lightweight undo.

### 6. Comparison's header uses a different inline gutter than the other two screens' headers, for the same job
**Coherence · critic-craft**, confirmed by direct measurement. `.knw-lesson__bar` (Comparison): `padding-inline: 16px`. `.knw-recall__header` (AnswerSent, Correct): `padding-inline: 12px`. Orchestrator measured both directly: **16px vs 12px, exact match** to the critic's claim.
**Fix:** align `.knw-lesson__bar`'s padding to `var(--semantic-space-layout-m)`, or fold `ComparisonScreen` onto `RecallHeader` entirely (also fixes Finding 3).

### 7. Neither raised sheet in scope manages focus
**Accessibility · critic-ux.** `BottomSheet.tsx` has no `role="dialog"`, `aria-modal`, or focus call anywhere in the file; `Screen.tsx` marks only the scrim `aria-hidden`, not the content behind the sheet — so a keyboard or screen-reader user can still reach and activate controls behind an open sheet.
**Fix:** focus the sheet on mount, return focus to the opener on close, mark the screen behind it `inert` while a sheet is open.

### 8. No screen in this batch has a "second beat"
**Craft · critic-craft**, confirmed by the orchestrator: grepped `BottomSheet.css` and `Screen.css` for `transition|animation|@keyframes` — zero matches. The discard sheet appears rather than rises; the 300ms flash swaps buttons and Knowie's pose via a hard conditional with no crossfade; the Correct screen's "100%" arrives at its number rather than counting to it.
**Fix:** add a rise transition to the sheet, a crossfade to the beat transition, and a brief count-up to the score text, using the `semantic/motion/*` tokens already used elsewhere in the codebase (e.g. `VoiceFab.css`'s pattern).

### 9. The discard/trash pill is a fixed 40×40, below the gate, by its own stated design
**Accessibility · critic-ux**, confirmed by direct measurement (40.0×40.0px exact). The component's own code comment states 40×40 as the intended spec — not a translation slip.
**Fix:** wrap in a 48px hit area, matching `.knw-button`'s own pattern.

### 10. The Comparison story asserts nothing about its header, so Finding 3 is invisible to CI
**Coherence · critic-craft.** The story checks headings, both answer cards, tick colour, and the two CTAs, but never queries the exit control or checks it contains an `<svg>`.
**Fix:** add an assertion that `.knw-recall__exit` contains an `svg`.

### 11. A pointless "Type answer" escape sits on the already-resolved Correct screen
**UX judgment · critic-ux.** The term is already settled by the time `CorrectScreen` renders (`app/recall/correct/page.tsx:8`: "nothing here is judged"), yet `onTypeAnswer` is still wired, routing to text-fallback and back through a several-second `processing` re-judge of an already-passed take, landing on the identical screen with the identical score.
**Fix:** don't pass `onTypeAnswer` into `CorrectScreen` — a resolved term has nothing left to answer.

### 12. Noted as a positive: one departure carries the full three-part Gaps discipline
**System fidelity · critic-system.** `CorrectScreen`'s mascot-size departure (3XL in Figma, drawn at 2XL) has a comment at the binding *and* a matching `design-system.md:1164` Gaps entry *and* the nearest-matching-role token — all three, which the rubric's 9-anchor asks for and which most departures in this codebase (per scorecard-01/02) don't manage.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 6/10** — "careful, deeply reasoned work — genuinely a designer's decisions in places... but the two screens closest to the brief's actual centerpiece... do the version that reports rather than the version that lands."

- `CorrectScreen` never auto-advances, contradicting `sprint-context.md:41`'s own stated rule ("a pass auto-advances after one beat... good news should not stall the loop") — the exact timer mechanism exists forty lines away in the same file for `AnswerSentScreen`'s own 300ms beat, and wasn't reused here.
- The percentage ring is the entire vehicle for the brief's "overconfidence has to cost something" mandate — nothing distinguishes an unaided pass from a hinted one except a number in a 44px circle, when `ChipFeedback` (documented, existing) could say it in words.
- `ComparisonScreen`'s verdict is carried by one eyebrow string ("Concept you missed") with no colour, icon, or `ChipFeedback` treatment — on the one screen whose entire premise is delivering bad news.
- The comparison does the diffing for nobody: the model answer and the student's transcript are two static blocks with nothing marking which point was actually missed, despite `sprint-context.md:47` naming "seeing the gap" as the reason four rounds end here.

Two stronger patterns proposed, both built from `ChipFeedback` alone (already documented, no new component): naming the mastery level on Correct, and marking per-point matched/missed on Comparison. Ambition's own named blind spot: the second proposal requires new authored data (a per-point matched flag) that doesn't exist in the script model today, and if that data were even slightly wrong, "it actively undermines the brief's... principle by looking like it's grading something the loop already called a miss" — named by the critic as the proposal most likely to collapse on contact with the real product.

## Each critic's blind spot, in its own words

**critic-craft:** "It's possible some parent component... supplies a mount transition I missed by grepping only the obvious files, which would move Craft toward 7-8." *(Orchestrator's note: grepped both files directly — `BottomSheet.css` and `Screen.css` — zero transition/animation/@keyframes rules found. This finding holds.)*

**critic-system:** "I ran zero of the scripts my two dimensions are normally judged by... I sampled five token bindings by hand... out of an unknown total, likely 60-plus declarations." *(Orchestrator's note: the Never-violation finding — accent-green-bold for validation — does not depend on rendering; confirmed exactly as stated, including the token's own inline comment.)*

**critic-ux:** "The ones that would collapse hardest under an actual render are the 'Next question' and 'Skip question' findings, since they depend on no other rule in the cascade adding invisible padding I didn't find via grep." *(Orchestrator's note: measured directly — they did not collapse. Next question: 350×16px. Skip question: 73×16px. Both exactly as predicted, no hidden padding found.)*

**critic-ambition:** "I have no browser... this whole path terminates... my finding about the trash/Retry/Skip overlap is about the *interaction design* being risky for a distracted student, which holds regardless of the mock — but it tells you nothing about whether a real judge would compound that risk."

---

## What the orchestrator's render pass added

Rendered all five states before any critic ran (Storybook for the three
`AnswerSentScreen` beats plus Correct and Comparison; cross-checked against
the real routes with session storage seeded to produce genuine scripted
content) — no two states rendered identically, and the beat-1→beat-2
transition in particular is a strong, deliberate distinction. After all four
critics reported, the orchestrator ran an axe sweep on all three routes (0
violations) and investigated both "incomplete" flags by hand: one turned out
to be a second, independent symptom of the raw-`✕`-glyph bug (Finding 3) —
axe's contrast engine cannot evaluate a non-standard Unicode character at
all — and the other resolved to a comfortable 9.64:1 pass once the actual
rendered colours were computed, exposing a tool artifact (`bgOverlap` from an
overlapping SVG) rather than a real defect. Every touch-target number the
critics predicted from token arithmetic (93×16, 73×16, 40×40, 350×16) was
then measured directly on the rendered page and matched exactly — this batch
had unusually strong agreement between capped-at-7 reasoning and rendered
reality, in contrast to scorecard-02's folders panel, where one prediction
(the card-width mismatch) did not survive measurement and one (the contrast
failure) was actively contradicted by it.
