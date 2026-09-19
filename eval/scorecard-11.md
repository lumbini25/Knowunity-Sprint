# Scorecard 11 — Session rating (standalone rerun)

Scope: one screen, `/recall/rating`, both real states — unselected default,
and one option selected (a filled violet circle with a checkmark;
single-select, tap-to-clear). This screen was already graded once as part
of a three-screen batch in `eval/scorecard-07.md` (Processing, Session
rating, Re-record); this is a fresh, isolated, blind rerun with four new
critic instances, per request.

Method: same as prior standalone reruns (folders, correct). Rendered both
states via the deployed URL before dispatching critics, including a
deselect check to confirm the toggle-off path returns cleanly to baseline.
Two of the four critics independently got Storybook's `test-run` to
actually execute this round — a first for several scorecards running —
producing real axe and DOM-assertion evidence rather than pure source
reading.

---

## Total: 6.3 / 10 (weighted) — the highest in this series

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(6·3 + 7·3 + 6·3 + 6·3 + 7·2 + 6·1) / 15 = 95 / 15 = 6.3`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 6 | 18 | critic-system | Reading + a working `test-run` pass |
| Coherence | High (3) | 7 | 21 | critic-craft | Reading + a working `test-run` pass on Transition |
| Craft | High (3) | 6 | 18 | critic-craft | Reading + a working `test-run` pass |
| UX judgment | High (3) | 6 | 18 | critic-ux | Reading only |
| Accessibility | Medium (2) | 7 | 14 | critic-ux | **Tested** — `test-run` on both real states, 0 axe violations each |
| Structure | Low (1) | 6 | 6 | critic-system | Reading only |
| **Reach** (excluded) | — | 5 | — | critic-ambition | Reading only |

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass** | Confirmed by two independently-executed `test-run` calls (unselected and forced-selected), 0 axe violations each — real test execution, not source inference, for the first time in several scorecards. |
| 2 — Touch targets 44×44pt | **Pass** | Measured directly: checkbox — **48×48px**. Full option row — **326×48px**. "Continue" button — **358×48px**. Only the second screen in this entire series (after Summary) where every measured control clears the gate. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **Pass** | Unselected and selected are clearly distinct (empty outline vs. filled violet + checkmark), and the deselect path returns cleanly to the exact unselected baseline with no lingering artifact — confirmed by direct render. |

---

## Findings, ranked

### 1. The only story tests 3 topics; the real route always renders 4
**Craft · critic-craft**, confirmed by the orchestrator via direct count on the live route. `RecallScreens.stories.tsx`'s `SessionRating` story uses the component's default `topics` prop — 3 hardcoded placeholder strings — and its own play function asserts exactly `toHaveLength(3)`. But `app/recall/rating/page.tsx:22` always passes `topics={SESSION.map((t) => t.title)}`, and `SESSION` currently has **4** entries — confirmed by the orchestrator counting every `id:` field in `lib/recall/script.tsx` directly. Nobody — the story, its assertions, or any critic — has ever rendered the topic-list length the production route actually produces. The orchestrator's live measurement found no overflow or layout problem at 4 topics, so the severity critic-craft flagged as an open question ("might genuinely push the rating options half off-screen") does not materialize — but the coverage gap itself is real regardless.
**Fix:** add a second story asserting the real 4-topic case, so the tested surface matches the shipped one.

### 2. The confidence self-report is collected, then permanently discarded
**UX judgment · critic-ux, Ambition · critic-ambition** — both independently reached this, matching the same finding already surfaced in scorecard-07's batch read of this screen. `RecallScreens.tsx:3271-3272` states outright: "The answer is not recorded anywhere — nothing in this prototype reads it." `app/recall/summary/page.tsx` has zero references to rating or confidence. The screen's own doc comment argues its placement is deliberate specifically so the feeling isn't contaminated by the score — but having earned that placement, the value is then never used anywhere, including on the summary screen the mandate says needs it most (per scorecard-10's own finding that the summary's promised "Knowie's voice" framing never shipped either).
**Fix:** thread the selected value into session state and have `SummaryScreen` reference it, even minimally — or name the gap explicitly in the code comment rather than implying the rating serves a purpose it doesn't.

### 3. The three-option scale isn't actually ordered as a scale, contradicting its own comment
**UX judgment · critic-ux**, confirmed by the orchestrator reading the array directly. `RecallScreens.tsx:3236-3240`'s own comment claims "Figma's three rows, in Figma's order: least confident first" — but the actual array is `['I need to practice', 'I am pretty confident for most part', 'Somewhat less confident']`: low → high → medium, not a monotonic scale. A tired or skimming student can't recognize a position on a line; they have to re-read all three.
**Fix:** reorder to low → medium → high (and fix the missing article in the middle option while there).

### 4. The selected checkbox's fill uses a token documented for a stroke role
**System fidelity · critic-system**, confirmed by the orchestrator reading the token chain directly. `Checkbox.css:78-81`'s selected-state rule sets `background: var(--semantic-highlight-border)`. Confirmed: that token's own description in `build/css/tokens.css` reads "Edge of the active tab. Brighter than border/selected and off the violet scale." — a stroke role, used here as a surface fill. This is disclosed at the binding and logged in `design-system.md`'s Gaps list requesting a proper `highlight/indicator` alias, but the critic's framing is exactly right: "disclosure records the decision, it doesn't make the binding correct."
**Fix:** request the `highlight/indicator` fill-role token the Gaps entry already asks for, and until it exists, flag the departure as Never-adjacent rather than a plain naming gap.

### 5. No second beat on the screen's only interaction
**Craft · critic-craft**, confirmed by the orchestrator: grepped `Checkbox.css` for `transition`, `:active`, `@keyframes` — zero matches, confirmed exactly. Selecting or clearing an option is an instant color swap with no transition, and because `Checkbox` is shared, fixing it here lifts every consumer across the app.
**Fix:** unchanged from prior recommendations — add a transition on `.knw-checkbox__box` bound to `semantic/motion/*` tokens.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 5/10** — "clean, correct, well-reasoned in its comments, and entirely a form: ask, tick, continue."

- Same discarded-value observation as Finding 2 above, reached independently.
- The topics list renders as plain, undifferentiated text even though the session already knows, per term, whether it passed unaided, hinted, or was skipped — the list is decoration at the one moment it could be evidence.
- Knowie's pose stays `"excited"` regardless of which of the three confidence levels is picked, even though the same file already has a `sad`/`standby` vocabulary used elsewhere for exactly this kind of tonal distinction.

Two stronger patterns proposed, both reusing only existing components (`ListItem`'s Strong/Review variants for the topic list; a pose swap on the existing `Knowie` element). The critic's own named risk: the pose-swap proposal might compete with the summary screen's own emotional beat one screen later — "only someone who can see both screens back to back would catch whether that reads as reinforcement or repetition."

## Each critic's blind spot, in its own words

**critic-craft:** "The finding most likely to evaporate under a real render is finding 1's severity — 4 topics might wrap cleanly with room to spare, or might genuinely push the rating options half off-screen." *(Orchestrator's note: measured directly — it wraps cleanly, no overflow, no scroll needed. The coverage gap stands; the severity concern doesn't.)*

**critic-system:** "My token-value spot-check was 8 tokens out of the hundreds in `tokens/tokens.json`... a mismatch elsewhere in the file would not have surfaced." *(Orchestrator's note: the specific token this critic's top finding depends on — `--semantic-highlight-border` — was independently re-confirmed, description and all.)*

**critic-ux:** "If the checkbox's 48px box turns out to be clipped by a parent's `overflow` or an unaccounted margin, the touch-target confidence collapses." *(Orchestrator's note: measured directly — 48×48px exact, no clipping, and this is now the second screen in the whole series where nothing failed Gate 2.)*

**critic-ambition:** "What reads as 'grounded in evidence' in this prototype is really 'grounded in whatever the script says happened' — a real judge's partial/borderline calls could make the Strong/Review split feel less trustworthy than it does here."

---

## What the orchestrator's checks added

Confirmed the deselect path returns cleanly to the exact unselected baseline
before dispatching any critic. After all four reported, direct measurement
resolved every open question this round: the live route genuinely renders 4
topics (not 3), with no layout problem at that count; all three interactive
elements (checkbox, full row, Continue) clear the 44pt gate comfortably; the
`highlight-border` token's stroke-only description was confirmed verbatim;
`Checkbox.css` genuinely has zero transition/active rules; and the
`RATING_OPTIONS` array's actual order was confirmed to contradict its own
adjacent comment. Two critics also independently got `test-run` to execute
successfully this round — a genuine rarity in this series — which is worth
noting as a small methodological win: it means Accessibility's 7 here rests
on real axe execution against both real states, not a capped, unverified
read.

**One thing to flag separately, unrelated to this screen's score:** while
counting `SESSION`'s terms in `lib/recall/script.tsx`, the orchestrator found
the current script content is a World War II set (Turning points,
Appeasement, Total war, Post-war order) — not the World History set (Primary
sources, Historical thinking, The Neolithic Revolution, Historiography) used
throughout every screenshot and finding in scorecard-08, -09, and -10. The
underlying content appears to have changed at some point since those
scorecards were written, presumably via a commit to the deployed
site's branch. This doesn't affect those scorecards' structural findings
(the bugs, token misuses, and missing states they document are about code
logic, not content) — but the specific quoted transcripts, term names, and
example screenshots in those three scorecards no longer match what the live
site currently shows. Worth a re-check if those scorecards are used for
anything beyond the structural findings.
