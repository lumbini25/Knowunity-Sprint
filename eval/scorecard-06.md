# Scorecard 06 — No audio, Permission denied, Permission primer

Scope: `/recall/no-audio` (one state), `/recall/permission-denied` (two
states: the wall, and its raised Settings-path sheet), `/recall/permission-primer`
plus its separate-route second beat `/recall/permission-sheet` (two states).
Five states total. Written to `scorecard-06.md`, not `scorecard-01.md` as
literally requested — that name belongs to the entry-path scorecard; `-02`
through `-05` cover the folders rerun, the answer-sent/comparison/correct
batch, the correct-screen rerun, and idle/lesson/misheard.

**All four critics graded these three screens as one batch** — each score
below covers all five states together, the same structure as scorecards 01,
03, and 05. This is not a per-screen breakdown; if you want one screen's
score in isolation (the way scorecard-04 isolated "Correct"), that needs its
own rerun.

Method: same as prior scorecards. All five states were rendered via
Storybook before any critic ran, cross-checked against the real routes. The
four critics then worked blind in isolated contexts. After all four reported,
the orchestrator verified every checkable claim with a shell.

---

## Total: 5.1 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(7·3 + 4·3 + 6·3 + 4·3 + 5·2 + 4·1) / 15 = 77 / 15 = 5.1`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 7 | 21 | critic-system | Reading + resolved token chains; capped at 7 |
| Coherence | High (3) | 4 | 12 | critic-craft | Reading only |
| Craft | High (3) | 6 | 18 | critic-craft | Reading only |
| UX judgment | High (3) | 4 | 12 | critic-ux | Full source trace of every control's destination |
| Accessibility | Medium (2) | 5 | 10 | critic-ux | Reading only |
| Structure | Low (1) | 4 | 4 | critic-system | Exhaustive repo-wide grep + full `Destination`/`ROUTES` read |
| **Reach** (excluded) | — | 3 | — | critic-ambition | Reading + Storybook docs only |

Structure's 4 and UX judgment's source-verified 4 are the load-bearing
numbers this time — both rest on exhaustive, high-confidence source tracing
(not rendering), which the rubric treats as legitimate for reachability
questions specifically. This is the lowest Reach score of any scorecard in
this series (3/10).

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass** | Axe sweep on all five render paths: 0 violations everywhere. One "incomplete" flag on `/recall/permission-sheet` (the sheet's `h1` and its Primary button label, both `messageKey: bgOverlap`) — the fifth occurrence in six scorecards of this exact tool artifact (an element overlap confusing axe's pixel sampling), and in every prior case it resolved to a comfortable pass on manual inspection. Both flagged elements are plainly high-contrast in the rendered screenshot (white heading on a dark sheet; dark label on a light button). |
| 2 — Touch targets 44×44pt | **FAIL** | "Type your answer" on `/recall/no-audio` measured at **93×16px** — the same recurring shared-component failure seen in every prior scorecard in this series. Separately (not a Gate 2 measurement, but the same underlying failure mode): the four Settings-path steps ("Settings," "Privacy and Security," "Microphone," "Knowunity") render as plain `<span>` elements with no `onclick` at all — confirmed directly — meaning they aren't undersized controls, they're not controls, despite a filled, `active="True"` pill styling that reads as tappable. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide): clean. |
| 4 — No two states rendering identically | **Pass** | All five states are visually distinct. |

---

## Findings, ranked

### 1. Three of five graded states cannot be reached by tapping anything in the live app — confirmed independently four separate times
**Structure · critic-system (score-defining), corroborated independently by critic-ambition, critic-craft, and the orchestrator's own pre-critic investigation** — four separate readings, all converging before any of them saw another's work. `lib/recall/session.tsx`'s `Destination` union (lines 36-71) and its `ROUTES` map (713-732) contain no member for `'permission-primer'`, `'permission-sheet'`, or `'permission-denied'` — confirmed by the orchestrator reading both directly. A full-repo grep for all three path strings (also run independently by the orchestrator, critic-system, and critic-craft) finds exactly one reference to each outside its own route file: `app/page.tsx:36-38`, whose own comment disclaims it as "not part of the product." The live flow's actual first-encounter ask happens entirely in-place at `/recall/idle` via local component state, a different implementation of the identical UI.
**Fix:** either delete the two orphaned primer/sheet routes and point any reference at `/recall/idle`'s working implementation, or wire a real (mocked) denial branch into `Destination` so all three routes become genuinely reachable, not just present.

### 2. Even if a student somehow reached these routes, "Allow" and "I've turned it on" don't actually grant anything
**UX judgment · critic-ux**, confirmed by the orchestrator reading source directly. `app/recall/permission-sheet/page.tsx:19` — `onAllow={() => router.push('/recall/idle')}` — never imports `useRecallSession` and never calls `grantMic()`, unlike the working inline primer (`app/recall/idle/page.tsx:49`: `onAllow={session.grantMic}`). Since `micGranted` is never set, arriving at `/recall/idle` this way re-shows the entire primer from its first beat rather than the first question — a student who taps "Allow" is told nothing changed and has to decide again. `app/recall/permission-denied/page.tsx:26`'s `onMicEnabled` has the identical gap. This compounds Finding 1: these routes aren't just unreachable, they're broken in exactly the way that would matter if the reachability bug were ever fixed without also fixing this.
**Fix:** both handlers need `session.grantMic()` called before or alongside the navigation — a two-line change per file, reusing a primitive that already exists and already works correctly elsewhere.

### 3. "Type your answer" — the same recurring shared control — is 16px tall on this screen too
**Accessibility · critic-ux**, confirmed by direct measurement: **93×16px**, identical to every prior scorecard's finding on this shared `TypeAnswer` component. This is now confirmed failing on eight separate screens across six scorecards.
**Fix:** unchanged from every prior recommendation — `min-height: var(--semantic-size-tap-target-min)` on `.knw-typeanswer`.

### 4. The Settings-path steps look like four tappable buttons and are four inert spans
**Accessibility · critic-ux**, confirmed by direct DOM inspection: `tagName: "SPAN"`, no `onclick`. `Chips` without `onPress` renders a plain span per its own source (confirmed in multiple prior scorecards' findings on this same component) — here rendered with a filled, `active="True"` pill treatment that gives no visual signal it's inert, on the exact "if it looks tappable, it will be tapped" pattern the rubric's Accessibility-9 anchor names explicitly.
**Fix:** de-emphasize to read unambiguously as a breadcrumb (lower-contrast, non-active fill), or accept and log the risk as a named gap.

### 5. Two different SVG drawings of "dismiss" both appear across these five states
**Coherence · critic-craft.** `CloseIcon` (a stroked, round-capped X, `icons.tsx:108-120`) renders on `NoAudioScreen`'s header exit — confirmed by the orchestrator (`hasSvg: true`, and the codebase's `CloseIcon` is the only exit icon used there). `XCloseIcon` (a filled, mitred X, `BottomSheet/icons.tsx:15-35`) renders on the permission-denied Settings sheet's dismiss, since `BottomSheet.tsx` always supplies an `onDismiss`. Both mean "leave this view," drawn two different ways.
**Fix:** standardize on `XCloseIcon` everywhere, since it's already the multi-consumer glyph (ChatInput, RecallResponseCard, TextField).

### 6. Neither raised sheet in scope has an entrance animation
**Craft · critic-craft**, the same finding pattern as scorecard-05's Finding 6 and scorecard-03's Finding 8 — now confirmed on a third and fourth sheet. `BottomSheet.css` and `Screen.css` contain zero `transition`/`animation`/`@keyframes` rules governing sheet or scrim entrance.
**Fix:** unchanged from prior recommendations — a mount transition bound to `semantic/motion/*` tokens, gated behind `prefers-reduced-motion`.

### 7. A heading binds a control-fill-role token that only looks right today by coincidence
**System fidelity · critic-system.** `.knw-recall__denied-title` binds `--semantic-interactive-primary`, which resolves through a completely different primitive chain than `--semantic-text-primary` but currently produces the identical hex (`#f4f2ff`) purely by coincidence — an unannotated, unlogged departure that would silently break the moment either token's underlying value moves independently.
**Fix:** rebind to `--semantic-text-primary`, or document the tie as deliberate with a Gaps entry.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 3/10** — the lowest of any scorecard in this series. "Where the project's own decision log commits to something beyond the spec... the code never carries that decision through; what shipped is narrower than the ambition already written down."

- `sprint-context.md` explicitly decides a repeat mic denial should get a quieter re-ask ("greeting them with the denied wall every visit is how a feature gets abandoned") — but `session.tsx`'s `Persisted` interface has no field to distinguish a first denial from a fifth. The decision was made in prose and never reached the state model.
- The permission primer's entire persuasive case is one boilerplate sentence ("practice answers and strengthen your memory") that never touches the brief's actual differentiator — a felt "I know this now" signal.
- `NoAudioScreen` treats every silent take identically regardless of how many times it's fired in a row — a second consecutive silence is a materially different signal (something's actually broken) that the screen doesn't distinguish.
- `PermissionDeniedScreen` — independently reached the same conclusion as Finding 1 — "is not reachable from the interactive prototype at all."

The critic's own named blind spot: its escalation proposal for repeated silence "assumes a student can genuinely hit silence twice in a row — but the actual mocked script never re-triggers the same failure," which it names as the proposal most likely to collapse on contact with the real product, since nothing in the current build would ever exercise it.

## Each critic's blind spot, in its own words

**critic-craft:** "The finding most likely to soften under a real render is finding 2 [the two X icons]: at 24px on a dark background a stroked X and a filled X may read as 'close enough' to a real student." *(Orchestrator's note: not independently re-verified visually this round, but both icons' path data were confirmed to differ point-for-point in source.)*

**critic-system:** "I did not render any of the five states... so I cannot confirm there's no horizontal overflow." *(Orchestrator's note: confirmed no overflow on all four routes before any critic ran.)*

**critic-ux:** "Finding 3 [the TypeAnswer touch target] in particular would collapse if some ancestor element I didn't trace applies padding... that the stylesheet I read doesn't show." *(Orchestrator's note: measured directly at 93×16px — no hidden padding found, matching the identical measurement from four prior scorecards on this same shared component.)* This critic also disclosed, unprompted, that grep output incidentally surfaced fragments of three prior scorecards during its investigation, stated it did not use their content, and re-derived every claim independently from source — consistent with the same disclosure pattern seen from other critics earlier in this series.

**critic-ambition:** "This is a scripted loop by design... my no-audio escalation proposal assumes a student can genuinely hit silence twice in a row — but the actual mocked script never re-triggers the same failure, so the counter I'm proposing would sit untested against the one scripted path the prototype demos."

---

## What the orchestrator's checks added

This scorecard is unusual in how much the four critics' findings converged
*before* any orchestrator verification — the core reachability defect
(Finding 1) was independently reached by three of the four critics plus the
orchestrator's own pre-render investigation, each from a different angle
(structural grep, code-comment reading, and route-definition tracing) without
seeing each other's work. The orchestrator's own contribution was mostly
confirmatory rather than corrective this round: measured the TypeAnswer
control at exactly 93×16px (matching five prior scorecards on the same
shared component), confirmed the Settings-path chips render as inert
`<span>` elements with no click handler, confirmed both dismiss icons differ
in source, and traced the "Allow doesn't grant" bug (Finding 2) to its exact
two missing lines of code in both affected route files. The one axe
"incomplete" flag was not re-verified numerically this round, given it is
the fifth occurrence of an already-established tool-artifact pattern that
has resolved to a non-issue on manual inspection in all four prior instances
across this series.
