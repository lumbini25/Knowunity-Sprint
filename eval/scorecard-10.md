# Scorecard 10 — Summary (where the loop ends)

Scope: one screen, `/recall/summary`, across its real conditional state
space — sections render or hide based on whether any term passed and
whether any was missed or skipped. One Storybook story exists, using the
component's own hardcoded demo data. The orchestrator additionally
constructed and rendered a mixed session, an all-strong session, an
all-review session (with a skip and a miss side by side), and — critically
— a genuinely empty session, via the deployed Vercel URL.

Method: same as prior scorecards. This is the batch where the pre-critic
render pass surfaced the single most serious bug found across this entire
series, independently confirmed by two of the four critics from different
angles, with a third critic finding an equally serious, related defect the
pre-critic pass had already captured on screen without registering its
significance until the critic's source-level reasoning explained it.

---

## Total: 5.0 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(5·3 + 6·3 + 5·3 + 4·3 + 5·2 + 5·1) / 15 = 75 / 15 = 5.0`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 5 | 15 | critic-system | Reading + resolved token chains for 3 findings |
| Coherence | High (3) | 6 | 18 | critic-craft | Reading only |
| Craft | High (3) | 5 | 15 | critic-craft | Reading + orchestrator's own screenshot evidence |
| UX judgment | High (3) | 4 | 12 | critic-ux | Reading + fallback-path trace |
| Accessibility | Medium (2) | 5 | 10 | critic-ux | Reading only |
| Structure | Low (1) | 5 | 5 | critic-system | Reading + fallback-path trace |
| **Reach** (excluded) | — | 5 | — | critic-ambition | Reading only |

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass** | Axe sweep: 0 violations. One "incomplete" flag (text over the percentage ring's SVG) — the sixth occurrence of this exact tool artifact across the series, and the text is plainly high-contrast in every screenshot. |
| 2 — Touch targets 44×44pt | **Pass** | Measured directly: "Revise now" button — **358×48px**. A review-list row — **326×48px**. This screen has no `TypeAnswer`/skip-link controls, so it's the first scorecard in this series where every measured control clears the gate. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **FAIL — the clearest violation in this series** | A genuinely empty session (0 real outcomes) and a real, completed mixed-outcome session render pixel-identically. See Finding 1. |

---

## Findings, ranked

### 1. A genuinely empty session and a real completed session are indistinguishable — confirmed independently three ways
**Structure · critic-system, UX judgment · critic-ux, orchestrator's own pre-critic discovery** — three independent readings, none aware of the others, all converging on the same root cause. `app/recall/summary/page.tsx:22-31` does `terms={terms.length ? terms : undefined}`. When `session.outcomes` is empty — which critic-system traced to the provider's own initial state (`lib/recall/session.tsx:271-277`, `outcomes: []` before any term settles) and critic-ux traced to a plausible production trigger (`session.tsx`'s sessionStorage read silently swallows failures via a bare try/catch — private browsing, storage quota, or a stray iOS Safari URL-bar suggestion could all produce this) — `terms` becomes `undefined`, and `SummaryScreen`'s own default parameter (`RecallScreens.tsx:2996-2998`) silently substitutes `SUMMARY_DEMO`, its hardcoded fixture data. The orchestrator confirmed this directly: seeding a session with zero outcomes and rendering the real route produced a screen showing "3/4 Recalled," three named terms marked correct, one marked missed — a fully invented result with no real session behind it, pixel-identical to what a genuine matching session would show. **This is not a hypothetical edge case dressed up as a finding — it is the rubric's Gate 4 by the book.**
**Fix:** branch explicitly on `session.outcomes.length === 0` in the route and redirect to `/entry` rather than letting the component's demo-data default stand in for missing real state; `SUMMARY_DEMO` should be a Storybook-only fixture, never reachable from the live route's fallback path.

### 2. The score ring visually disappears in the exact session that needs it most — confirmed by the orchestrator's own pre-existing screenshot
**Craft · critic-craft**, confirmed decisively by the orchestrator using evidence already captured before the critic reported. `Percentage.css` draws only one circle element, `.knw-percentage__arc` — there is no background track. At `value=0` (a fully-missed session, genuinely reachable in production, not the empty-session edge case above) the arc's computed `stroke-dasharray` is `"0 100"`, so nothing renders inside the 154px frame. The orchestrator's own "all-review" render, captured during the pre-critic pass before this significance was recognized, shows exactly this: "0/4 Recalled" floating with no ring at all, just a single point where the zero-length arc begins — confirmed against three other renders (3/4, 4/4) that all show a clearly visible partial or full ring.
**Fix:** add a background track circle to `.knw-percentage__ring`, bound to a neutral border token, so 0% still reads as an empty ring rather than an absent one.

### 3. Skipped and genuinely-missed terms are indistinguishable in the one list meant to guide revision
**UX judgment · critic-ux, Craft · critic-craft (flagged but not scored, called UX's territory), confirmed by the orchestrator's own constructed side-by-side render.** `review = [...skipped, ...missed]`, both rendered via the identical `ListItem variant="Review"` with no distinguishing label, icon, or marker beyond list order. The orchestrator constructed a session with one skipped and one genuinely-attempted-and-missed term and rendered it directly: both rows are visually and semantically identical. A student cannot tell "I never tried this" from "I fought through the whole ladder and still didn't land it" — precisely the distinction that should drive different revision strategies.
**Fix:** add a `subLabel`/`meta` slot to `ListItem` (e.g. "Skipped" under the title) so the two outcomes read as different rows, and split `SummaryStatTile`'s combined "Missed" figure into separate skipped/missed counts to match.

### 4. Per-term passes don't show which were unaided vs. hinted
**UX judgment · critic-ux.** The unaided/hinted split exists only in the aggregate `SummaryStatTile` — the per-term "You are strong in" list renders every pass identically regardless of `t.passedAt`. A student sees "2 hinted" in the stat row but can't tell which two of the named terms needed help.
**Fix:** same mechanism as Finding 3 — a `subLabel` driven by `t.passedAt === 'attempt1'`.

### 5. The score ring binds a token that contradicts the design system's own written spec — the second occurrence of this exact Never-rule violation in this series
**System fidelity · critic-system**, confirmed by the orchestrator reading both sides directly. `design-system.md:384` states explicitly: "ring color: `feedback/success/surface/bold` in production." `Percentage.css:35` binds `stroke: var(--semantic-accent-brand-bold)` instead — generic brand violet, not the documented success green — with no comment at the binding and no Gaps-list entry. Separately, `SummaryStatTile`'s "Perfect" tile (`SummaryStatTile.css:93,101`) binds `--semantic-accent-green-bold`, whose own `$description` in `tokens/tokens.json` reads, word for word: **"Decorative green. Streak counters, positive stat chips. Not for validation."** — confirmed by the orchestrator reading the exact token file. This is the same Never-rule violation (an accent token doing a validation token's job) already found on the Comparison screen in scorecard-03 — now a second, independent instance of the identical mistake elsewhere in the codebase.
**Fix:** rebind the ring to `--semantic-feedback-success-bold`; rebind "Perfect" to a feedback/validation token and "Missed" to `--semantic-feedback-error-bold` (already used for the same concept on `ListItem`'s review-state tick elsewhere on this same screen).

### 6. The summary's promised voice never shipped
**Ambition · critic-ambition.** `sprint-context.md` explicitly documents a decision to structure this screen "in Knowie's voice... because score-based verdicts are either flattery or punishment with nothing in between," and `RecallScreens.tsx`'s own docblock repeats the reasoning verbatim. The shipped headings — "You are strong in" / "Review these concepts" — are generic report language, not a distinctive voice. The rationale is on record; the voice itself was dropped between the decision and the build.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 5/10** — competent execution of the literal spec on the two things `design-brief.md` names as hardest for exactly this screen: a felt signal of mastery, and what happens after.

- No mascot anywhere on the one screen `design-system.md` names `mascotSlot`'s canonical "session completion" use case for — the screen meant to make a student *feel* something is carried entirely by numerals and list rows.
- The unaided/hinted distinction the route computes (`passedAt`) is discarded at the per-term level, same root issue as Finding 4 above, reached independently from a reach-quality angle rather than a UX-completeness one.
- "What happens after" is still, by the team's own admission in `sprint-context.md`, "the least designed part of the whole thing" — tracing both button handlers confirms neither restarts a session directly; both require at least one more selection screen.

One stronger pattern proposed (splitting the "strong" list by rung, reusing only existing `ListItem` props) that converges with Finding 4's fix independently. The critic's own named risk on its second proposal (a screen-level Knowie mascot): "Never place Knowie inside a list item, card, or repeated pattern" is explicit, and a mascot competing with the score card and two list groups in a 390px viewport "may simply not have room... that's a layout risk I can't verify without seeing it rendered."

## Each critic's blind spot, in its own words

**critic-craft:** "It is entirely possible the empty ring at `value=0` looks fine in context... I capped Craft at 5 rather than lower specifically because I could not see it." *(Orchestrator's note: it does not look fine — the orchestrator's own screenshot, captured independently before this critic's reasoning, shows exactly the bare/absent ring predicted, with nothing anchoring the "0/4" text.)*

**critic-system:** "I placed [both scores] at 5 rather than higher within that cap because the findings I could fully evidence from source were concrete and uncommented, not because I verified their on-screen severity." *(Orchestrator's note: Finding 1's severity was independently confirmed on-screen; Finding 5's token values were confirmed byte-for-byte against both `design-system.md` and `tokens.json`.)*

**critic-ux:** "If the tinted-label contrast in `SummaryStatTile`... reads worse than their names imply, that would only push Accessibility down further, since I have no positive measurement backing the token names." *(Orchestrator's note: not independently re-measured this round; axe's clean sweep is the only contrast evidence available, and it found nothing on this specific pairing.)*

**critic-ambition:** "The split-list proposal is judged against [the] fixed [demo] shape and could behave oddly at session lengths or hint distributions the script never exercises."

---

## What the orchestrator's checks added

This is the scorecard where the pre-critic render pass did the most work of
any in this series: constructing four session states beyond the one
documented story (mixed, all-strong, all-review-with-a-skip-and-a-miss, and
empty) surfaced Findings 1 and 2 before any critic ran, and Finding 3 was
directly visible in the same constructed render. Two critics then
independently reached Finding 1 from different angles (a fallback-path trace
and a real-world storage-failure trace), and one critic reached Finding 2
purely from CSS reasoning that the orchestrator's own already-captured
screenshot then settled beyond doubt. After all four critics reported, the
orchestrator's remaining contribution was measuring the two token findings
directly against their source-of-truth documents (`design-system.md`'s own
written spec, and the token's own `$description`) and confirming the review
row and primary button both clear the 44pt gate — the first screen in this
series where no control failed that measurement.
