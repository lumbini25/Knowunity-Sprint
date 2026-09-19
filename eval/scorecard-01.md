# Scorecard 01 — Entry path

Scope: the four built entry routes and their six distinct states —
`/entry` (Home), `/entry/compose` (empty, filled), `/entry/ready` (generating,
ready), `/entry/folders` (Folders). `app/recall/*` is out of scope for this
scorecard.

Method: all six states were rendered at 390×844, dark mode, before any critic
ran (Playwright, `next dev` on :3000). The three adversarial critics
(craft/coherence, system/structure, ux/accessibility) and the one non-adversarial
critic (ambition) each ran in an isolated context with only the screen list,
`eval/rubric.md`, and their own two dimensions — none saw this document, each
other's prompts, or each other's findings while working. After all four
reported back, the orchestrating session ran the checks none of the critics
have a shell for (`npm run check:tokens`, `npm run a11y`, and direct
Playwright measurement of the specific controls the UX critic flagged from
source) to settle the four hard gates on real evidence rather than each
critic's own capped-at-7 reasoning.

---

## Total: 4.4 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total). This number exists because
it was asked for — the rubric itself warns against collapsing six dimensions
into one figure, since the weights describe which failures are survivable,
not an arithmetic average. Read the per-dimension table below the total; the
total alone hides that Coherence (3) and Craft (4) are the load-bearing
failures, not Structure (7).

`(6·3 + 3·3 + 4·3 + 4·3 + 4·2 + 7·1) / 15 = 66 / 15 = 4.4`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 6 | 18 | critic-system | Reading only (own scripts unavailable); capped at 7 by its own rule |
| Coherence | High (3) | 3 | 9 | critic-craft | Reading only; label/destination facts, not pixels |
| Craft | High (3) | 4 | 12 | critic-craft | Reading only; `test-run` timed out 3×, capped at 7 |
| UX judgment | High (3) | 4 | 12 | critic-ux | Reading only; `test-run` timed out 6×, capped at 7 |
| Accessibility | Medium (2) | 4 | 8 | critic-ux | Token arithmetic, not measurement; capped at 7 |
| Structure | Low (1) | 7 | 7 | critic-system | Reading + hand-arithmetic on CSS; capped at 7 |
| **Reach** (excluded) | — | 5 | — | critic-ambition | Reading + Storybook docs only |

All three adversarial critics hit the same wall independently: no shell, so
none could run `test-run`, `check:tokens`, `a11y`, or a real render, which the
rubric's own rule caps at 7 regardless of severity. The orchestrator ran what
they couldn't; results below.

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass** | `npm run a11y`: 0 violations across all 26 routes including all 4 entry routes. Ran two additional targeted axe passes for the states the route sweep never opens (Entry 2b compose-filled, Entry 3 post-generating) — 0 violations on both. |
| 2 — Touch targets 44×44pt | **FAIL** | Measured (Playwright `boundingBox()`, not token arithmetic) at 390×844: Home "Explain out loud" chip **163.7×40px** (height short); Home/Entry-3 `ChatInput` trailing mic button **24×24px**; `FolderCard` chevron on Entry 4 **32×32px**; Compose's "Remove Explain out loud" ✕ **16×16px**. Four controls under the floor, including the single control that starts the entire feature. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens`: "no raw hex in components/ or app/. Every colour is a token." |
| 4 — No two states rendering identically | **Pass, with a caveat worth reading** | No pair is pixel-identical. But Entry 3 ("ready") and Entry 3b ("still generating") differ by exactly one caption word — no dimming, no motion, no icon change; `.knw-entry__start` has no `:disabled` rule at all. Confirmed by direct screenshot comparison before any critic ran, and independently found by critic-craft (finding 4), critic-system ("outside my dimensions"), and critic-ambition (observation 3). Not a gate failure by the letter, but it is the gate's named failure mode in substance. |

---

## Findings, ranked

Each finding is the responsible critic's own wording, condensed, with its
file/line evidence kept intact. "Corroboration" notes where an independent
critic hit the same underlying bug from its own dimension, unprompted.

### 1. `MascotSlot` nested inside a card — an explicit "Never do this" violation
**System fidelity · critic-system.** `RecallScreens.tsx:908-910` places `<MascotSlot><Knowie pose="excited" /></MascotSlot>` directly inside `.knw-entry__start` — the docblock at `:850` and `design-system.md:1155` both call this "the Explain out loud card." `design-system.md`'s Never list states: "Never place Knowie (mascotSlot) inside a list item, card, or any repeated pattern." This is on Entry 3, the screen that starts every session in the prototype.
**Fix:** move `Knowie` to a screen-level position beside the card (as Home and Compose already do), or get explicit design sign-off logged as a documented exception.
**Verified by:** reading the JSX nesting against the docblock and the Never list — a structural fact, not a rendering fact.

### 2. Three different promises resolve to one identical, content-blind screen, which then discards the tap that reached it
**Coherence · critic-craft**, independently corroborated as a UX destination-lies finding by **critic-ux**.
- Craft: `app/entry/ready/page.tsx:40` and `app/entry/page.tsx:22` both route to `/entry/folders`, which hardcodes `FOLDERS` (`RecallScreens.tsx:757-761`) and `title = 'World History Foundations'` (`:771`) regardless of how it was entered. `app/entry/folders/page.tsx:16` — `onOpen={() => router.push('/recall/lesson')}` — then discards which folder was tapped.
- UX (same bug, different lens): `RecallScreens.tsx:373` labels the recent-folder chip "Chemistry prep"; tapping it lands on a screen headed "World History Foundations" over three unrelated folders (World War II, Cold War, Civil Rights). "A student tapping the one chip explicitly labelled after what they were just doing lands on a screen headed [something else] with no path back to what they tapped for."
**Fix:** thread the folder/topic identity from whichever entry point was tapped into `FoldersScreen`'s props, and carry the tapped folder's identity into what `onOpen` navigates to.
**Verified by:** reading all four route handlers and the hardcoded arrays — a routing/data-binding fact, not a rendering fact.

### 3. Four controls fail the 44×44pt gate, one of them the control that starts the whole feature
**Accessibility · critic-ux**, values independently re-measured by the orchestrator (see Gate 2 above — the critic's token-arithmetic predictions and the rendered measurements matched exactly on all four controls).
**Fix, per control:** promote the Home "Explain out loud" chip to `size="L"` or pad it to clear 44 vertically; gate `ChatInput`'s trailing button the same way its leading button and field already are, so an unwired instance renders no focusable control at all (this also fixes finding 6 below); wrap the `FolderCard` chevron and the chip's ✕ in a ≥44×44 hit area without growing the visible glyph.

### 4. No custom control in the entry path has a pressed state
**Craft · critic-craft.** Grepped `Chips.css`, `RecallScreens.css`, `app/globals.css` for `:active` — none exist, only `:focus-visible`. `Chips.css` also sets `-webkit-tap-highlight-color: transparent`, actively removing the one native affordance a touch device would otherwise supply. This includes the Entry 3 "start" card, the single most important tap target in the entry path.
**Fix:** add a token-bound `:active` treatment to `.knw-chip--pressable`, `.knw-entry__start`, and `.knw-recall__exit`.

### 5. "Still generating" and "ready" are functionally indistinguishable
**Craft · critic-craft**, independently flagged by **critic-system** and **critic-ambition**, and by the orchestrator's own pre-critic render comparison — four independent readings converging on the same screen. See Gate 4 above for the full evidence; this is listed here because it is also a scored Craft finding, not only a gate note. `disabled={generating}` (`RecallScreens.tsx:884`) has no corresponding `:disabled` rule anywhere in `RecallScreens.css`.
**Fix:** give `.knw-entry__start[disabled]` a distinct treatment — reduced-opacity content, a pulse on Knowie, anything beyond the caption swap.

### 6. A labelled, focusable "Record voice" button that does nothing sits on three of six entry screens
**UX judgment · critic-ux.** `ChatInput.tsx:176-186` renders the trailing mic/send button unconditionally, unlike its leading button and field, which the same file explicitly gates: "a control that does nothing when tapped is worse than one that is not there" (`:124-128`). `HomeScreen` (`:484`) and `ExplainEntryScreen` (`:929`, covering both Entry 3 and 3b) call `<ChatInput status="Inactive" .../>` with nothing wired, so the rendered button carries `aria-label="Record voice"` and `onClick={undefined}` — on a voice-first product's front door.
**Fix:** gate the trailing button the same way the leading button and field already are.

### 7. Gold, reserved for PRO, is spent on a plain folder
**System fidelity, named as a Coherence break too · critic-system**, cross-referenced by **critic-craft**. `FolderCard.tsx:15-16` documents "Do not use accent=Gold for standard study folders — Gold signals PRO content"; `RecallScreens.tsx:760` assigns `accent: 'Gold'` to "Civil Rights Movement," which is not PRO-gated. The entry path establishes gold = PRO one screen earlier via `ProBadge`, then reassigns it.
**Fix:** change the accent to Blue or Magenta per the component's own rule.

### 8. Two "dead" feature chips give zero feedback on tap, indistinguishable from an unregistered touch
**UX judgment · critic-ux.** Quiz and Summarize render via `Chips` with `onPress={undefined}`, rendering as an inert `<span>` visually identical to the live "Explain out loud" chip. "Voice_UX principle 1's exact failure mode... reapplied to a tap instead of a mic."
**Fix:** either wire a "coming soon" affordance or visually distinguish inert chips from live ones.

### 9. Two drawings of "microphone" on the same screen, twice over
**Coherence · critic-craft.** `RailMicIcon` (blue) on the rail chip and `ChatInput`'s own `MicrophoneIcon` (thin white outline, unwired — see finding 6) both appear on Home and on Entry 3/3b. `ComposeScreen` was already hardened against this exact problem (`showSend` forced true); Home and Ready were not.
**Fix:** pass `showSend` (or otherwise suppress the trailing mic) on the Home and Ready `ChatInput` instances too.

### 10. A departure commented at the binding but never logged in the Gaps list
**System fidelity · critic-system.** `RecallScreens.css:1254-1262`'s magenta accent substitution is reasoned identically to the already-logged "EOL Card background" gap, but is not itself in `design-system.md`'s Gaps list. Two of the 9-bar's required three ("comment at the binding, logged in Gaps, and named as a request") are present; the log entry is missing.
**Fix:** add one Gaps-list line in the same form as the EOL card entry.

### 11. `aria-pressed` misapplied to a navigational control
**Accessibility · critic-ux.** Any `Chips` with `onPress` unconditionally renders `aria-pressed`. Home's "Explain out loud" chip uses `onPress` purely to navigate, so a screen reader announces "toggle button, not pressed" for a control that leaves the screen entirely.
**Fix:** gate `aria-pressed` behind an explicit `toggle` prop, or route navigational chips through a plain button.

### 12. Dead CSS from an abandoned composition
**System fidelity · critic-system.** `.knw-entry__attached` / `.knw-entry__attached-clear` (`RecallScreens.css:1413-1437`) are token-clean but have zero consumers anywhere in the repo — `ComposeScreen` moved to `ChatInput`'s `attachment` prop instead.
**Fix:** delete, or comment why they're held in reserve.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 5** — "a faithful, careful build of decisions `sprint-context.md` already made; it doesn't reach past them, and in one clear case... it reaches short of a decision the project itself already committed to."

- The retention-claim screen (`ExplainEntryScreen`) spends its one block of running text on scope description, not on the reason speaking beats reading — the exact claim `sprint-context.md:17` says has to earn the first tap.
- Session length (3–5 terms), a documented completion lever in `sprint-context.md:19`, never made it into `ExplainEntryScreenProps` — the card reports a number Knowie chose, never asks the student to choose one.
- "Still generating" is carried by one word where the system's own cited principle says a word isn't enough (converges with Finding 5 above, reached independently from a reach/ambition angle rather than a craft one).
- `ExplainEntryScreen` is also the summary's "Try again" destination but every prop is written for a first encounter — a returning student sees the identical generic pitch.
- The two ways into the feature (Compose, Folders) don't acknowledge each other — `FoldersScreen` has no connection to `HOME_RECENT`, the "last worked on" chip Home already computes.

Two stronger patterns proposed, both built only from existing components (a session-length `Chips` toggle row; a `TextBlock` caption on Home carrying the retention claim). Ambition's own stated blind spot: every proposal is read from markup and Figma, not seen rendered, and its highest-risk proposal (the session-length picker) is gated on content-authoring work the sprint has explicitly deferred — it "looks cheapest in a component list and is actually gated on the least available thing in the codebase."

## Each critic's blind spot, in its own words

**critic-craft:** "I have no shell and every `test-run` attempt timed out, so nothing here was seen rendered... The findings most likely to survive a real render unchanged are 1, 2, and 6 [routing/data-binding facts]... The ones most likely to soften on inspection are 3 and 4 [pressed/disabled states] — it's possible a browser default... gives some faint pressed feedback the stylesheet doesn't show explicitly." *(Orchestrator's note: finding 4/Gate-4's caption-only distinction was independently confirmed by direct screenshot comparison — it does not soften.)*

**critic-system:** "I ran no shell command and obtained no working Storybook test result... every 'clean' verdict above is a verdict I reasoned to from static text, not one I observed rendered or executing... I sampled two token pairs against `app/globals.css`... out of the roughly 40 distinct semantic tokens the entry path's CSS references." *(Orchestrator's note: `check:tokens` ran clean against all of them, not just the sample.)*

**critic-ux:** "Every touch-target number above... comes from adding up CSS custom properties, not from a ruler on a rendered screen... finding 2 (the FolderCard chevron) is the one I'd re-check first, since it's the only one gating an entire screen's usability." *(Orchestrator's note: all four numbers were re-measured on the rendered page and matched exactly — 40, 24, 32, and 16px respectively. Gate 2 fails on measured evidence, not estimate.)*

**critic-ambition:** "I never saw the six screens render... this whole path terminates in a scripted, single-outcome session, so any claim I make about 'activation' is against a mocked funnel... the proposal most likely to fail on contact with the real product is the session-length Chips picker... it's the proposal that looks cheapest in a component list and is actually gated on the least available thing in the codebase."

---

## What the orchestrator's own render pass added

Before any critic ran, all six states were rendered and compared by eye:
no route showed horizontal overflow past 390px (checked programmatically —
`scrollWidth` equalled `clientWidth` at 390 on all four routes), and every
state was visually distinct from its neighbors except the generating/ready
pair (Finding 5 / Gate 4). After all four critics reported, the orchestrator
closed the verification gap every critic named as its own cap: `check:tokens`
(clean), `npm run a11y` across all 26 routes plus two interaction-only states
none of the critics could reach (clean), and direct measurement of the four
controls Accessibility flagged from source (all four confirmed exactly as
predicted, and Gate 2 now fails on rendered evidence rather than estimate).
