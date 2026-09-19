# Scorecard 07 — Processing, Session rating, Re-record

Scope: `/recall/processing` (one state), `/recall/rating` (two states: no
option selected, one option selected — confirmed by direct interaction, not
just the default story), `/recall/re-record` (one state). Four states total.
Written to `scorecard-07.md`, not `scorecard-01.md` as literally requested —
that name belongs to the entry-path scorecard; `-02` through `-06` cover the
five prior batches in this series.

Method: same as the prior six. All four states were rendered via Storybook
and cross-checked against the real routes before any critic ran. One
apparent anomaly was chased down and resolved before critics were dispatched
(see below). The four critics then worked blind in isolated contexts. After
all four reported, the orchestrator verified every checkable claim with a
shell.

---

## Total: 6.2 / 10 (weighted) — the highest of any scorecard in this series

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(7·3 + 5·3 + 6·3 + 6·3 + 7·2 + 7·1) / 15 = 93 / 15 = 6.2`

This batch is measurably cleaner than the prior six: no orphaned routes, no
false-affordance controls, no explicit Never-list violations, and the axe
sweep came back with zero violations *and* zero "incomplete" flags on all
three routes — the first scorecard in this series where that tool-artifact
pattern didn't show up at all.

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 7 | 21 | critic-system | Reading + 3 spot-checked tokens, all matched; capped at 7 |
| Coherence | High (3) | 5 | 15 | critic-craft | Reading only |
| Craft | High (3) | 6 | 18 | critic-craft | Reading only |
| UX judgment | High (3) | 6 | 18 | critic-ux | Reading + handler-chain trace |
| Accessibility | Medium (2) | 7 | 14 | critic-ux | Reading only |
| Structure | Low (1) | 7 | 7 | critic-system | Reading + full route/session-graph trace |
| **Reach** (excluded) | — | 4 | — | critic-ambition | Reading only |

All four critics again reported zero working `test-run` calls this session.
Every score above is self-capped at 7.

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass, cleanly** | Axe sweep on all three routes: 0 violations, 0 incomplete. First scorecard in this series with no tool-artifact flag to investigate. |
| 2 — Touch targets 44×44pt | **FAIL** | "Type your answer" on `/recall/re-record` measured at **93×16px** — the same recurring shared `TypeAnswer` component now confirmed failing on nine separate screens across all seven scorecards in this series. The rating screen's own `Checkbox` control, by contrast, measured a clean **48×48px**, confirming the system does get this right when a control isn't `TypeAnswer`. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **Pass** | All four states are visually distinct, including the two rating states — confirmed by direct interaction on the real route (see below). |

---

## Pre-critic finding: a false alarm, resolved

Storybook's default render of the Session rating screen showed a stray blue
focus-rectangle around "Somewhat less confident," which looked at first like
it might indicate the selected state has no real, persistent visual
distinction. Traced to source: the story's own `play` function exercises a
full select → reselect → deselect sequence via `userEvent.click()`, and a
synthetic click leaves a genuine `:focus-visible` outline that a real pointer
tap wouldn't. Tested directly on the live route with a real click instead:
selection renders as a filled violet circle with a checkmark, clearly
distinct from the empty outline, and persists after clicking elsewhere. Not
a finding — flagged here only so the record is complete about what was
checked and ruled out before any critic saw these screens.

## Findings, ranked

### 1. Re-record's progress header is hardcoded to "0 of 4" — confirmed false by all four critics independently, and by direct side-by-side measurement
**Coherence · critic-craft (score-defining), independently reached by critic-system (unscored aside), critic-ux (scored Finding 2), and critic-ambition.** `RecallScreens.tsx:1805` — `<RecallHeader progress={0} progressText="0 of 4" onExit={onExit} />` — is a literal hardcoded value; `ReRecordScreenProps` has no `progress`/`progressText` field to override it, even though `app/recall/re-record/page.tsx` already calls `useRecallSession()` one line above and could read `session.termIndex`/`session.termCount` exactly as `/recall/processing` already does.
The orchestrator confirmed this isn't theoretical: seeded a session at `termIndex: 2` and rendered both `/recall/idle` and `/recall/re-record` side by side. **Idle correctly reports "Terms answered: 3 of 4" (50%); Re-record, at the identical session position, reports "Terms answered: 0 of 4" (0%).** This is also read aloud to screen readers as false status — a direct violation of Voice_UX principle 1 ("show system status at every moment") on the exact screen meant to reassure a student that a transcription failure wasn't their fault.
**Fix:** add `progress`/`progressText` to `ReRecordScreenProps`, thread `session.termIndex`/`session.termCount` through exactly as `app/recall/processing/page.tsx` already does.

### 2. "Next question" on Re-record silently forfeits the term, with a label that hides the cost
**UX judgment · critic-ux**, independently reached by critic-ambition from a different angle (Reach observation 4). `app/recall/re-record/page.tsx:16` — `onNextQuestion={() => go(session.skip())}` — calls the identical function the dedicated "I don't know" Skip control uses, recording a scored miss that lands on the revise list. But the button reads "Next question," not "Skip," and unlike the take screen's own discard action (which the codebase's own history shows was deliberately given a confirmation sheet), this control fires immediately with no warning. A student recovering from a misheard transcript — explicitly "never the student's fault" per the screen's own design intent — can lose the term with one misread tap.
**Fix:** either rename the control to name its actual cost ("Skip this term"), or route it through the same confirmation pattern the take screen's discard action already uses.

### 3. Two directly contradictory comments about the same layout decision sit in the same stylesheet
**Coherence · critic-craft**, confirmed by the orchestrator reading both blocks directly. `RecallScreens.css:635-639`: "THE BUTTONS DIVERGE... **They are pinned to the bottom slot here**, because... design-system.md asks for [CTAs low]." `RecallScreens.css:659-661`, describing the identical buttons on the identical screen: "The re-record choice sits **under the mascot block rather than in the bottom slot**." The JSX settles it — `ReRecordScreen` never passes `bottomContent` to `Screen`, so nothing is structurally pinned low; the second comment is the accurate one, and design-system.md's own "CTAs low so thumbs reach them" principle is silently not applied here, with no exception logged anywhere.
**Fix:** delete the stale comment block, and either move the buttons into a real `bottomContent` slot or log an explicit exception.

### 4. Session rating's only interactive control has no pressed or focus-visible state at all
**Craft · critic-craft**, confirmed by the orchestrator: grepped `Checkbox.css` for `:hover`, `:active`, `:focus-visible` — zero matches (the only text hits are substrings inside unrelated token names like `--semantic-interactive-disabled`). Contrast with `Button.css`, which does define `:active`.
**Fix:** add a `:focus-visible` rule matching the pattern `VoiceFab.css` already uses, plus a pressed-state treatment differing by more than opacity.

### 5. Session rating's single-select list uses `role="checkbox"` per row instead of a radio group
**Accessibility · critic-ux.** `Checkbox.tsx` hardcodes `role="checkbox"`; the rating screen's `choose()` enforces single-select *behaviorally* but the accessibility tree still announces three independent toggles. Honestly logged as a known gap in `design-system.md:1162` ("No radio, and three checkboxes doing one's job"), which keeps it off the UX-judgment ledger per the rubric's "named as a known gap" clause — but the screen-reader experience itself is unfixed, which is what Accessibility scores.
**Fix:** wrap the options in a real `role="radiogroup"`/`role="radio"` pattern, or build the already-requested radio component.

### 6. No Storybook story demonstrates the rating screen's selected state
**Craft · critic-craft.** The one `SessionRating` story never sets `value`, so the composed Selected treatment (violet-filled circle + checkmark) has never been checked side-by-side with Unselected in the design system's own verification surface — the orchestrator's pre-critic investigation is what actually confirmed it renders correctly, not any existing story or test.
**Fix:** add a second story pinning `value="I need to practice"`.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 4/10** — "these three screens execute the spec correctly... but none of the three does anything with what it collects or signals beyond the single beat it was asked to cover."

- Session rating asks the one confidence question the brief's own mandate needs ("overconfidence has to cost something") and then discards the answer entirely by design — the route's own comment says so explicitly: "the answer is not recorded anywhere."
- The processing wait shows the identical composition regardless of what's actually at stake (a first attempt vs. the last take before reveal) — `HintLadder` already exists and is used on every screen that follows, but not on the wait that precedes each one.
- Re-record's progress bug (independently reached here too, Finding 1 above) means the one screen meant to prove "this cost you nothing" would visibly contradict that promise if anyone looked at the header.

Two stronger patterns proposed, both built from existing documented components (`HintLadder` on Processing and Re-record; `Snackbar` as an acknowledgment beat on Session rating). The critic's own named blind spot: it flags its own `HintLadder`-during-the-wait proposal as the one most likely to backfire, since the codebase already tried and deliberately removed a second positional indicator from this exact screen for "showing the same number twice" — the critic is proposing to partially reverse a considered decision without having seen how it would actually read.

## Each critic's blind spot, in its own words

**critic-craft:** "The two findings most likely to evaporate or worsen under a real look are... the un-pinned Re-record CTA block... and the softer mascot-pose-tone note." *(Orchestrator's note: the CTA-pinning contradiction is confirmed as a documentation fact regardless of how it visually reads; not independently re-measured for dead-space severity this round.)*

**critic-system:** "I sampled 6 token values... out of the roughly 50 distinct custom properties these three screens actually reference." *(Orchestrator's note: this is the cleanest System fidelity report of the series — zero Never-violations found, and the orchestrator's own spot-check of the "0 of 4" issue confirms it as the report's one adjacent, correctly-unscored observation.)*

**critic-ux:** "If `--semantic-size-tap-target-min` resolves differently than its declared 48px value in an actual browser... every accessibility finding above collapses or gets worse." *(Orchestrator's note: measured directly — 48×48px exact, matching the token's stated value precisely.)*

**critic-ambition:** "My claim that the wait 'never varies with stakes' is true of the four scripted terms as authored, but I can't confirm how a real judge's variable latency... would change that impression once live."

---

## What the orchestrator's checks added

Chased down and resolved a false alarm before dispatching any critic (the
Storybook focus-ring artifact on the rating screen), which meant the four
critics graded the rating screen's two real states rather than being misled
by a testing artifact neither of them could have distinguished from a real
bug without a live interaction test. After all four critics reported, the
orchestrator's single most valuable check was rendering `/recall/idle` and
`/recall/re-record` side by side at an identical seeded session position —
turning four independent but individually-uncertain claims about the "0 of
4" bug into one directly-observed contradiction (50% vs. 0% at the same
`termIndex`). Also confirmed the two contradictory CSS comments exist
verbatim as quoted, confirmed `Checkbox.css` has zero pressed/focus rules,
and confirmed the `TypeAnswer` control fails its now-familiar 93×16px
measurement on this screen too. This is the first scorecard in the series
where the axe sweep required no follow-up investigation at all.
