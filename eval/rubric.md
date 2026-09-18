# Grading rubric — Knowunity voice recall prototype

Six dimensions, scored 1–10. Four hard gates, scored pass/fail and reported
separately from the dimensions.

The anchors below are written for **this** prototype: 390px dark-mode iOS,
voice in and text out, a mocked recall loop. They reference
`reference/Voice_UX.md`'s six principles and its Must/If-time/Out-of-scope
table, and `design-brief.md`'s hard constraints and mandate. A grader who has
not read both cannot apply this rubric.

---

## Two scoring rules that govern everything below

**1. "Looks good" is a 6, not a 9.**

A 6 is competent work that a reasonable person would ship. It is the score for
a screen with even rhythm, consistent type and no obvious mistakes. It is not
a criticism — most good work is a 6.

A **9 survives a senior critique untouched**. Not "they had only small notes" —
*untouched*. Every value is the value someone would have chosen on purpose, and
when asked "why this and not the next step up," the answer is already written
down at the binding. If a critique would move anything, it is an 8.

**2. A dimension scores 8 or above only if it was verified by rendering,
measuring or testing. Never from reading code.**

Reading `padding-block-start: 0` tells you a rule exists. It does not tell you
what the student sees — a wrapper can sit at a perfect 24 while the visible
element sits at 40, because the component inside carries its own padding.
That exact case shipped here and read correctly in source.

So: to award 8+, say in the score what you ran. Rendered at 390×844 and
measured the box. Walked the flow by tapping. Ran `npm run consistency` and
diffed it. Clicked the control and watched where it went. **A score of 8, 9 or
10 with no stated verification is capped at 7** by the grader who reviews the
grade.

Verification that counts:

| Method | What it can prove |
| --- | --- |
| Rendering at 390×844 dark and measuring boxes | Spacing, alignment, overflow, what is actually visible |
| Walking the flow by tapping only | Reachability, dead ends, whether a destination lies |
| `npm run consistency` before and after | New type rows, off-scale values, gutter drift |
| `npm run a11y` | Axe violations across all routes |
| `npm run check:tokens` | Raw hex that can paint |
| Storybook `test-run` | Per-state assertions |
| Reading the source | Intent. Never outcome. |

---

## The dimensions

### 1. System fidelity — **High**

*Does every value trace back to a token, and every component to the library.*

Scores the discipline of the build: whether the design system is the source of
values, or a place to look things up when convenient. The failure mode is
invisible — a hard-coded value renders identically to a token today and breaks
silently when the token moves.

**4** — Values are mostly tokens, but raw hex or raw px appear in component
source. A `--primitive-*` is referenced directly from a component, bypassing
the semantic layer. Something was built inline that Storybook already had.

**6** — `npm run check:tokens` is clean and every colour binds to a semantic
token. But type is bound partially — `font-size` and `font-weight` without
`letter-spacing` — or a value was snapped to the nearest step with no note
saying it was snapped, so the next person reads an approximation as a decision.

**9** — Every value a semantic token; type bound as the complete five-property
set every time. Where Figma's value has no token, the nearest step was taken,
**commented at the binding**, and logged in `design-system.md`'s Gaps list — all
three, not one of them. No primitives in component files. Nothing was built
inline that the library had. The Gaps list is short, and each entry reads as a
request to the system rather than an excuse for a departure.

### 2. Coherence — **High**

*Does it read as one product, or as screens that arrived separately.*

Scores whether a student moving through 25 screens experiences one thing. The
tell is not whether screens are individually good — it is whether you can guess
which one was built last.

Two strands, and a score needs both. **Surface** is whether the screens look
like one product. **Transition** is whether moving between them behaves like
one product: whether the student can predict where a tap goes, and is right.
A prototype can be pixel-consistent and still incoherent, because the thing
being learned screen to screen is the interaction, not the padding.

**4**

*Surface* — Screens work in isolation. The same idea has two treatments: two
mic glyphs for one concept, a text character `✕` sitting among real SVG icons,
gutters that vary by screen, the mascot at a different height each time.

*Transition* — The student cannot predict where a tap goes. A control's label
describes one thing and the tap does another. A path loops: an action returns
to a screen already left, with no way onward that does not involve the browser's
back button. Reaching some screen at all requires the address bar.

**6**

*Surface* — Gutters and type are consistent; nothing jars.

*Transition* — Every tap goes somewhere sensible and nothing loops. But the
model has seams: a control in the same position means different things on two
screens with no reason given, or one concept carries two captions — the resting
orb saying "Tap to answer" here and something else there — so the student
re-reads a control they had already learned. A destination is right but
unannounced, so arriving is a small surprise rather than the expected next
thing.

**9**

*Surface* — `npm run consistency` adds no new row to the type table, and the
gutter and gap columns are identical across every route that should match. The
orb sits the same distance from the content on every turn — measured to the
**visible** orb, not the box around it. A stranger clicking through cannot tell
the build order.

One icon per concept across all 26 routes. **To check it:** list the ideas the
app expresses — microphone, exit, hint, streak, correct, keyboard, discard —
then count the distinct drawings of each across every screen. More than one
drawing of one idea is not a 9, however reasonable each was locally: the
student reads two glyphs as two things. Note that `npm run consistency` reports
icon boxes that drift in **size** but cannot tell you two glyphs **mean** the
same thing, so this count is done by eye.

*Transition* — Every screen is reached by tapping from the one before, and the
student could have predicted each arrival before tapping. A control names the
act it performs, so a caption reading "Say it back" records and one reading
"Next question" advances — never the reverse. The same act is the same word
everywhere. Where a screen's own logic would produce a different destination
than the rest of the loop, the loop wins and the file says so. No path returns
the student to a screen they have already resolved, and the browser's back
button is never the only way forward. Verified by walking the whole session by
tap and, at each control, saying where it will go **before** pressing it.

### 3. Craft — **High**

*Spacing, rhythm, states, the small deliberate decisions.*

Scores what is visible on screen and nowhere else: whether every control has
its full set of states, whether the vertical rhythm repeats rather than being
re-invented per screen, and whether anything has a **second beat** — the small
movement or detail that separates a screen that works from one that feels made.

This dimension is graded by looking, never by reading. Whether a decision was
written down belongs to System fidelity; whether it can be seen belongs here.

**It is scored across every screen, and the score is the floor rather than the
ceiling.** Craft that appears on the idle screen and not on "nothing heard" is
not a level of craft, it is a demo. The screens nobody walks a stakeholder
through — permission denied, silent recording, misheard, the exit sheet — are
where this dimension is actually decided, because they are where finish gets
dropped when a sprint runs short. Grade the weakest screen, not the best one.

Where Coherence asks whether the screens agree with each other, Craft asks
whether the *same level of finish* reaches all of them.

**4** — Controls have a default state and little else: no pressed, no disabled,
no empty. The waveform sits static while the screen says "Listening", so the
only evidence that sound is arriving is a word. Headings wrap mid-phrase.
Elements are mathematically centred in ways that read as off. The wait is a
dead spinner, which Voice_UX principle 6 names specifically as the thing not
to do. Finish varies visibly screen to screen: the main loop is worked and the
edge cases are placeholders wearing the right tokens.

**6** — Every state that the flow can reach exists and is distinct. Rhythm is
even, spacing lands on the scale, nothing jars in a screenshot, and it holds up
across the main loop rather than on one screen. But nothing has a second beat:
sheets appear rather than rise, the orb is a still shape while recording, the
XP figure arrives at its number rather than counting to it, and a verdict lands
with no beat of acknowledgment before the next prompt — which the brief asks
for by name. Or the loop is finished and the failure screens are thinner:
correct and reveal have their states, "nothing heard" and "permission denied"
have one each. **This is the honest score for most competent work, and it is
not a criticism.**

**9** — The orb breathes on `semantic/motion/*` while recording, so the claim
that sound is arriving is visual and not merely textual (principle 1: show
status at every moment, and colour alone is not enough). The wait is a designed,
calm state rather than a spinner (principle 6). Raised sheets rise, and what
they cover stays legible behind them. Pressed and disabled states exist and
differ from default by more than opacity. Headings break where a person would
break them. Where mathematical centring reads as off — an ear, a glyph with
uneven bearings — it is optically corrected, and the correction is visible when
you toggle it. A senior critique finds nothing to move.

And all of that is true on every screen, including the ones the walkthrough
skips. Pick the three screens least likely to be demoed — "nothing heard",
"permission denied", the exit sheet — and grade those. If they hold, the score
holds; if the answer is "well, those are edge cases", the score is a 6.

### 4. UX judgment — **High**

*Are the states handled, the hierarchy clear, the failure paths designed.*

Scores against Voice_UX's states table and the brief's hard constraints. The
failure states are the feature — a prototype with only its happy path has not
addressed the brief, which is explicit that a false "wrong" is more
demoralising here than in a quiz.

**4** — The happy path works end to end. Misheard, silent recording and denied
permission are missing, or present but dead-ending. A student who cannot speak
right now has no way through.

**6** — Every **Must** in Voice_UX's table is built: idle, recording,
processing, pass/partial/fail, cancel-and-re-record, text fallback, permission
primer, permission denied, skip. But the judgment inside them is not fully
worked: "the app misheard me" is not separated from "I didn't know it"
(principle 4), or one of the four no-cost paths quietly consumes a rung, or the
summary flatters rather than reports.

**9** — All nine Musts built and reachable by tapping. A misheard transcript
reads as the system's fault, not the student's, because what was heard is shown
alongside the verdict (principle 4) — and correcting it is never required.
Every path the brief says costs nothing genuinely costs nothing, verified by
walking each one. Text is reachable in one tap from every turn (principle 5).
No screen traps: every required action has a way out, including for a student
who cannot speak. The summary's claim is earned — overconfidence costs
something and underconfidence is rewarded, per the mandate. Where an edge case
is out of scope, it is named as a known gap rather than silently absent.

### 5. Accessibility — **Medium**

*Contrast, touch targets, whether meaning ever rests on colour alone.*

Medium weight, but note that two of the four hard gates live here — a
prototype can score 6 on this dimension and still be disqualified.

**4** — Primary screens pass; secondary text, captions and disabled states
fail contrast. Some targets are under 44pt. The verdict states are told apart
by hue alone.

**6** — `npm run a11y` reports 0 violations across every route. But meaning
still rests on colour somewhere — pass, partial and fail distinguished by
green/amber/red with the same glyph — which principle 1 rules out explicitly:
colour alone is not enough, pair it with shape, icon or motion. Or focus order
inside a raised sheet does not return where it came from.

**9** — 0 violations, **and** every state carries a second channel: a shape, an
icon, or a word, not only a hue. Every tap target measured at ≥44pt rather than
assumed from the design — including captions that look like button labels and
therefore will be tapped. A raised sheet takes focus and returns it. The text
fallback is genuinely equivalent, not a lesser mode: same rungs, same hints,
same route to the summary.

### 6. Structure — **Low**

*Does the layout hold together and the thing render.*

Low weight because it is table stakes: passing it earns little, failing it
undermines every other dimension's evidence, since nothing above can be
verified on a screen that does not render.

**4** — It renders, but something overflows 390px, or a screen is reachable
only by typing its URL.

**6** — Every route renders at 390×844 dark with no horizontal scroll, safe-area
insets top and bottom, and `npm run build` succeeds.

**9** — Every screen reached by tapping from the screen before it, with the
address bar never touched during a full walk of the session. Reload mid-session
restores the same term and rung. No route renders differently in Storybook than
it does in the app, because both mount the same component.

---

## How to combine

Report six scores and the gate result. Do not average them into a single
number — the weights are about **which failures are survivable**, not about
arithmetic:

- A **High** dimension at 4 is a finding that has to be fixed. Three Highs at 6
  is a competent prototype; three Highs at 9 is an exceptional one.
- **Medium** at 4 is a finding. Medium at 6 with all gates passed is acceptable.
- **Low** at 4 invalidates the evidence for everything else — fix it and
  re-grade, rather than scoring around it.

---

## Hard gates

Pass/fail, assessed separately from the six dimensions. **A failed gate is
reported as a failed gate, not as a lower score** — it does not trade off
against strength elsewhere, and a prototype that fails one is not shippable
regardless of how it scored above.

### Gate 1 — Contrast at 4.5:1 for body text

Every piece of body text meets 4.5:1 against the surface it actually sits on,
not against the page background it was designed over. Card-on-page and
sheet-on-card both change the ground.

*How to verify:* `npm run a11y` catches the routes; check raised sheets and any
state that only appears on interaction separately, since a route walk never
opens them. Secondary and disabled text are where this fails.

### Gate 2 — Touch targets at 44pt

Every interactive element is at least 44×44pt of actual hit area. The visible
shape may be smaller; the target may not be.

*How to verify:* measure the rendered box of every control at 390×844 — not the
icon inside it. Include controls that only appear in one state, such as a
discard pill, and check anything that reads as a label but sits outside its
control's hit area: if it looks tappable, it will be tapped.

### Gate 3 — No raw hex in component source

No hex literal that can paint anything — a CSS declaration, an SVG `fill`, an
inline style — anywhere in `components/` or `app/`. Hex inside a comment
recording what Figma's raw value was is not a violation; that note is what the
system asks for. Generated files are exempt, because their hex *is* the token.

*How to verify:* `npm run check:tokens`. It exits non-zero and prints
`file:line:col` for each finding.

### Gate 4 — No two states that should differ rendering identically

Any two states the design distinguishes must be distinguishable on screen. A
state that exists in the code, in a variant axis or in a props table, but
renders the same as its neighbour, has not been built.

*How to verify:* render the pair side by side and look. Storybook's all-states
stories are for exactly this. Watch specifically for: verdict states separated
only by a hue; a disabled control identical to its enabled form; an orb state
whose only difference is a value that resolved to the same token; and any state
whose variant is set but whose visual override was never written.

---

## What a grade looks like

> **System fidelity 7** — `check:tokens` clean, no primitives in components,
> type bound in full. Not 8: the two snapped values in the summary carry a
> comment at the binding but are not in the Gaps list, so the system was never
> told. *Verified: ran check:tokens; grepped for `--primitive-` outside the
> generated stylesheet; read the two bindings.*
>
> **Coherence 7** — *Surface* holds: `consistency` adds no type row, one icon
> per concept across 26 routes, the resting orb sits 24 from the content on all
> nine screens that show one. *Transition* is where it loses the 9: the take
> screen's trash warns that deleting moves the student on, and it does — but
> the orb one screen earlier reads "Say it back" and also moves them on, so the
> same promise resolves two ways. Not 6, because nothing loops and every screen
> is tap-reachable. *Verified: ran consistency before and after; measured the
> orb's visible top against the element above it on each of the nine at
> 390×844; walked the full session by tap, predicting each destination before
> pressing — two predictions wrong, both on captions.*

Every 8+ names its verification. Every score below 6 names the one thing that
would raise it.
