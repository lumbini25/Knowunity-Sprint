# Scorecard 02 — Entry 4 · Choose a folder (`/entry/folders`)

Scope: one screen, one state. `FoldersScreen` takes no prop that changes its
list — no empty, loading, or error variant exists in the code, so there was
nothing to render beyond the single state and nothing to compare it against
for Gate 4. This is graded as its own unit, separate from `scorecard-01.md`
(the wider entry path, which also covers this same screen as one of six
states) — run per the user's explicit request, with fresh, independently-blind
critics.

Method: same as scorecard-01 — the screen was rendered and inspected before
any critic ran, the four critics each worked in an isolated context with only
this screen, `eval/rubric.md`, and their own dimensions, and after all four
reported back the orchestrator ran the checks none of them have a shell for.
In this case that orchestrator pass **overturned one critic claim and
confirmed another that looked identical on paper** — see "What the
orchestrator's render pass added" below; read it before trusting the
Accessibility gate line at face value.

---

## Total: 3.9 / 10 (weighted)

Weights: High = 3, Medium = 2, Low = 1 (15 total).

`(7·3 + 3·3 + 3·3 + 3·3 + 3·2 + 5·1) / 15 = 59 / 15 = 3.9`

## Per-dimension table

| Dimension | Weight | Score | Weighted | Critic | Verified by |
|---|---|---|---|---|---|
| System fidelity | High (3) | 7 | 21 | critic-system | Reading only; capped at 7 |
| Coherence | High (3) | 3 | 9 | critic-craft | Reading only |
| Craft | High (3) | 3 | 9 | critic-craft | Reading only |
| UX judgment | High (3) | 3 | 9 | critic-ux | Reading only |
| Accessibility | Medium (2) | 3 | 6 | critic-ux | Reading only — **see correction below** |
| Structure | Low (1) | 5 | 5 | critic-system | Reading only; capped at 7 |
| **Reach** (excluded) | — | 4 | — | critic-ambition | Reading + Storybook docs only |

All four critics again had no shell this session (`test-run` timed out or
returned "already running" on every attempt across all four), so every score
above is source-derived and self-capped at 7 by the critics' own stated rule.

## Hard gates

| Gate | Result | Evidence |
|---|---|---|
| 1 — Contrast 4.5:1 | **Pass — corrects both critics** | Both critic-system and critic-ux cited `FolderCard.stories.tsx`'s documentation of "known contrast failures, kept deliberately" (date label as low as 1.64:1), appropriately caveated as unverified. The orchestrator checked: `npm run a11y` on `/entry/folders` reports 0 violations and 0 incomplete; direct `getComputedStyle` measurement of the rendered date labels against their band colours gives 6.64:1 (Blue), 6.77:1 (Magenta), 9.06:1 (Gold) — all comfortably passing; and the current `FolderCard.css` shows the date label already bound per-accent to `--semantic-accent-{blue,magenta}-label-bold` / `--semantic-pro-label-bold`, with the badge label's own code comment stating it was deliberately set to `--semantic-text-primary` specifically because `text/tertiary` was found to fail ("5.32:1 at worst, on gold"). **The Storybook component's descriptive prose is stale — it documents a contrast bug that has already been fixed in the CSS.** This is worth flagging loudly: it is exactly the failure mode of grading from documentation the critics are stuck with (no shell, no render) — both handled it correctly by capping their own confidence, but the underlying claim they had no way to check does not hold. |
| 2 — Touch targets 44×44pt | **FAIL** | Measured directly: `.knw-folder__chevron`, the only actionable control on the screen, is exactly **32×32px** — matching both critics' token-arithmetic prediction exactly. |
| 3 — No raw hex in component source | **Pass** | `npm run check:tokens` (repo-wide, run once, covers this screen): clean. |
| 4 — No two states rendering identically | **N/A** | Only one state exists; there is nothing to compare it against. This absence is itself Finding 10 below, not a gate result. |

---

## Findings, ranked

### 1. Every folder leads to the same screen, and that screen isn't about any of them
**UX judgment · critic-ux**, independently reached from the wider entry panel's critic-craft and critic-ux in `scorecard-01.md` — four separate blind critic instances across two separate orchestration runs converged on this same bug. `app/entry/folders/page.tsx:16` — `onOpen={() => router.push('/recall/lesson')}` — discards the `folder` argument `FoldersScreen` already passes (`RecallScreens.tsx:798`: `onOpen={() => onOpen?.(f.title)}`). Worse, `/recall/lesson` (`app/recall/lesson/page.tsx:21-29`) derives its content from `session.outcomes.find(...)` — the weakest term of an in-progress recall session — which has no relationship to "a folder's concepts" at all when reached from here with no session running.
**Fix:** thread the tapped folder's identity through to `/recall/lesson` (route param or session field), and have that route read it instead of falling through to session outcomes when arriving from Folders.

### 2. The only actionable control on the screen is 32×32px
**Accessibility · critic-ux**, measured by the orchestrator (see Gate 2). The chevron is the sole way to open any folder; the surrounding 358×282px card (colour band, title, description, badge) has no `onClick` anywhere on it, so a card that reads as fully tappable responds only in one small corner.
**Fix:** move `onOpen` onto the whole `<article>`, drop the chevron to decorative.

### 3. All three cards show the same description, and it's World War II's
**Craft · critic-craft**, independently corroborated by critic-system ("outside my dimensions") and critic-ambition (observation 1). `FOLDERS` (`RecallScreens.tsx:757-761`) never passes `description`; `FolderCard.tsx:39`'s default — "Causes, key battles, the Holocaust, and the post-war order" — is WWII-specific and renders unchanged under "The Cold War" and "Civil Rights Movement." Confirmed by the orchestrator's own render before any critic ran (scrolled the inner `.knw-screen__middle` container to see all three cards, since a `fullPage` screenshot misses it).
**Fix:** add a `description` per entry in `FOLDERS` and pass it through.

### 4. No bottom safe-area inset on this route at all
**Structure · critic-system**, confirmed by the orchestrator. `FoldersScreen` passes no `bottomContent`, so `.knw-screen__bottom` — the only element `Screen.css` gives `env(safe-area-inset-bottom)` to — never mounts (`document.querySelector('.knw-screen__bottom')` returns null on this route, orchestrator-measured). `.knw-screen__middle`'s own padding-bottom measures 8px, from `--semantic-space-layout-s`, with no safe-area term at all. On a real notched device the last folder card gets zero reserved clearance from the home indicator, contradicting CLAUDE.md's explicit hard rule ("every screen... applies safe-area insets top and bottom") and `app/layout.tsx`'s own comment asserting the scaffold does this unconditionally.
**Fix:** either give `FoldersScreen` a real `bottomContent`, or move the bottom safe-area padding onto `.knw-screen__middle` unconditionally in `Screen.css` so it doesn't depend on a slot being filled.

### 5. Gold — the app's PRO signal — is spent on an ungated folder
**Coherence · critic-craft**, cross-referenced by critic-ux as a System-fidelity issue. `RecallScreens.tsx:760` assigns `accent: 'Gold'` to "Civil Rights Movement" against `FolderCard.tsx`'s own documented rule: "Do not use accent=Gold for standard study folders — Gold signals PRO content." No PRO badge, lock, or gated `onOpen` distinguishes it from the other two.
**Fix:** change the accent to Blue or Magenta.

### 6. "Menu" is captioned as a menu and wired as a full exit
**Coherence · critic-craft**, independently reached again by critic-ux. The hamburger icon (`aria-label="Menu"`) is wired to `onBack`, which is `router.push('/entry')` — a full navigation away from the screen, not an in-place menu. This is the same finding as scorecard-01's Finding 2, now confirmed a second time from a screen-scoped, independently-blind pass.
**Fix:** relabel/redraw as a back/exit control, or build an actual menu.

### 7. The only actionable control has no pressed or focus-visible state
**Craft · critic-craft.** `FolderCard.css`'s `.knw-folder__chevron` has a base style only — no `:hover`, `:active`, or `:focus-visible` anywhere in the file, and Storybook's own docs confirm no pressed/disabled variant was ever built for `FolderCard`. Critic's own caveat: browsers do apply a default focus outline even with no authored rule, so this specific finding is the one most likely to soften on a real render — flagged as such by the critic itself, not softened here.
**Fix:** add `:focus-visible` and `:active` treatments matching `.knw-recall__exit`'s pattern elsewhere in the same stylesheet.

### 8. No empty state exists, and its absence is not logged as a scope decision
**Accessibility · critic-ux.** `FoldersScreenProps` takes no data prop that could ever produce zero folders; nothing in `sprint-context.md` or `component-gaps.md` names this as a deliberate cut.
**Fix:** either add an empty-state branch, or add one line to `sprint-context.md`'s "Not building" list.

### 9. A Gaps-list entry names two components carrying an offset pattern, not the three that actually do
**System fidelity · critic-system.** `design-system.md:1215` names `recallResponseCard` and `voiceFab`'s raw-pixel offsets; `FolderCard.css:100-145`'s three absolute offsets (tab, badge, date) are commented at each binding as "already recorded under Gaps" but the specific component is never named in the entry itself.
**Fix:** amend the Gaps entry to include `folderCard`.

### 10. Checked and not confirmed: a claimed card-width mismatch
**Originally System fidelity · critic-system**, finding 2 in that report — hand-computed from the CSS box model that `FolderCard`'s visible width would stack two 16px gutters (the scaffold's and the component's own) to render at 326px against the component's own 358px Storybook contract. The orchestrator measured the rendered card directly: **358×282px**, exactly matching the component's own contract, not the predicted 326px. The critic's own report flagged this as computed-not-measured and asked for exactly this check; the check says the reasoning didn't hold, most likely because a bleed rule elsewhere in `.knw-folders__list`'s cascade cancels the stacking the hand-calculation assumed. Reported here for completeness and as a demonstration of why the rubric caps unverified 8s — not because the critic did anything wrong, but because this is precisely the kind of claim that only rendering settles.

---

## Critic-ambition's read (excluded from the total, reported separately)

**Reach: 4/10** — "this screen answers the brief's open question 'how a student first meets it' with a plain content list, doing measurably less than its own sibling entry screen in the same file."

- The one prop that would make the three folders distinct (`description`) is the one never passed — independently the same bug Craft and System both flagged from their own angles.
- Gold is decorative, not the gate it's documented to be — same underlying issue as Finding 5, reached independently.
- This is one of two doors into the same session, and only one (the compose path, via `ExplainEntryScreen`) was designed as a moment — Knowie, a personalised reply, a "Smart Answer" chip. Folders gets an `h1`/`h2`/`p` and a list.
- The screen carries none of the commitment signal (session length as a completion lever) the sibling entry path already established via `sprint-context.md`'s own decision.

Two stronger patterns proposed, both built only from existing components (a Knowie framing moment mirroring `ExplainEntryScreen`; writing the `description` prop that already exists). Ambition's own named blind spot: it cannot render, so cannot confirm how the mismatched WWII description actually reads at 390px — though it correctly notes "the underlying data bug is real regardless" — and its own highest-risk proposal (Knowie framing parity) assumes the two entry doors should feel like the same kind of moment, which it flags as an assumption rather than a certainty.

## Each critic's blind spot, in its own words

**critic-craft:** "The one most likely to soften under a real render is [finding 4, no focus state]: browsers do apply a default focus outline even with no authored `:focus-visible` rule... Finding 5 [the card/chevron affordance-model mismatch] is the softest of the set and the first I'd expect to be argued away."

**critic-system:** "I ran no shell scripts at all... I sampled four token bindings end-to-end... out of the roughly twenty distinct custom properties this one screen touches, and I grepped two directories rather than the full `components/` and `app/` trees." *(Orchestrator's note: the card-width finding this same report raised as its highest-confidence Structure claim, Finding 2 in its own numbering, is the one the orchestrator's measurement did not confirm — see Finding 10 above.)*

**critic-ux:** "The touch-target finding is the one most likely to soften if a global button reset... I didn't find is actually in play, and the contrast numbers, while documented as axe-computed, weren't reproduced by me this session." *(Orchestrator's note: the touch-target finding held exactly — 32×32px confirmed. The contrast numbers did not hold — see Gate 1 correction above. This critic's own uncertainty language correctly predicted which of its two capped claims would survive rendering and which wouldn't, without knowing which was which.)* This critic also disclosed, unprompted, that a repo-wide grep incidentally surfaced a fragment of `scorecard-01.md` before it had scoped searches away from `eval/` — it reports having already reached the same destination-mismatch finding independently moments earlier, so the exposure did not shape the finding, but flagged it per its own grading-blind rule. Noted here for the record; the finding in question (Finding 1) is corroborated by four independent critic instances across two orchestration runs regardless, so this exposure does not change what to trust.

**critic-ambition:** "I have no browser this session, so any claim about how something looks... is inferred from the absence of styling rules, not from a screenshot... this whole path terminates in a scripted, single-outcome session... any claim I make about 'activation' is against a mocked funnel."

---

## What the orchestrator's render pass added

Rendered the one state at 390×844 dark before any critic ran, including scrolling the inner list container (a `fullPage` screenshot misses the third card — the scroll happens inside `.knw-screen__middle`, not the document). Confirmed the description bug by eye at that point, before any critic reported it independently. After all four critics reported, the orchestrator: ran `npm run a11y` (0 violations, 0 incomplete) and measured actual rendered contrast on all three date labels (6.64–9.06:1, all passing) — **overturning** the contrast-failure claim both System and UX critics cited from stale Storybook documentation; measured the chevron's hit box directly (32×32px, exactly as predicted — **confirming** Gate 2's failure on rendered evidence); measured the folder card's actual width (358px — **not confirming** critic-system's hand-computed 326px prediction); and confirmed structurally that `.knw-screen__bottom` never mounts on this route (**confirming** the missing safe-area finding). Two claims corrected, two confirmed, from four total render-based checks — a reasonable illustration of why the rubric caps ungrounded scores at 7 regardless of how careful the reasoning looks on paper.
