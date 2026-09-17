# SPEC.md

Voice-based active recall for Knowunity: the student speaks a term out loud, Knowie replies in text, and a four-round hint ladder carries them from a cold attempt to either a clean explanation or a side-by-side comparison with the model answer.

Nothing here is real — no speech-to-text, no audio capture, no model call. The recall runs off a fixed script so every state is reachable on a known path and the demo runs identically twice.

---

## How this prototype is put together

**The prototype is the Next.js app in this repo.** Not a Storybook, not a clickable Figma, not a video.

- **Every screen is a page with its own route** under `app/recall/`, and the student reaches it by clicking something on the previous screen. A screen that can only be reached by typing a URL is not finished.
- **Each route file is a thin wrapper and nothing else.** The screen itself lives in `components/screens/RecallScreens/RecallScreens.tsx`, so the route and the Storybook story render the same component. `app/recall/text-fallback/page.tsx` is the whole pattern: `'use client'`, one import, one `return`.
- **Storybook stays the component catalog.** It is where a component's states are enumerated, documented and tested. It is not where the flow lives — the flow lives in the routes.
- `app/page.tsx` is a scaffolding index that lists the routes. It is a dev convenience, deliberately undesigned, and is not part of the student's path.
- `app/globals.css` and `build/css/tokens.css` are generated from `tokens/tokens.json` by `npm run tokens:css` and `npm run tokens`. Never hand-edited.

---

## Screens, in build order

Easiest first. Fourteen of the seventeen exist as routes today and the scripted session walks from the first question to the last by clicking alone.

| # | Screen | Route | Status |
|---|---|---|---|
| E1 | Home — the front door | `/entry` | **Built** |
| E2 | Compose a set | `/entry/compose` | **Built** |
| E3 | Explain out loud — ready | `/entry/ready` | **Built** |
| E4 | Choose a folder | `/entry/folders` | **Built** |
| 1 | Mic permission primer | `/recall/permission-primer` | Built |
| 2 | Mic permission sheet | `/recall/permission-sheet` | Built |
| 3 | Permission denied | `/recall/permission-denied` | Built |
| 4 | Text fallback turn | `/recall/text-fallback` | Built |
| 5 | The take | `/recall/answer-sent` | Built |
| 6 | Misheard transcript | `/recall/misheard` | Built |
| 7 | Re-record offer | `/recall/re-record` | Built |
| 8 | Exit sheet | `/recall/exit` | **Built** |
| 9 | Idle | `/recall/idle` | **Built** |
| 10 | Listening | `/recall/recording` | **Built** |
| 11 | Nothing heard | `/recall/no-audio` | **Built** |
| 12 | Processing | `/recall/processing` | **Built** |
| 13 | Partial — the hint ladder | `/recall/result` | **Built** |
| 13a | Correct — the pass | `/recall/correct` | **Built** |
| 13b | Correct — Knowie's answer | `/recall/correct-feedback` | **Built** |
| 14 | Reveal — the ladder runs out | `/recall/reveal` | **Built** |
| 14a | Wrong — after the reveal | `/recall/wrong` | **Built** |
| 14b | Comparison — both answers | `/recall/comparison` | **Built** |
| 15 | Session rating | `/recall/rating` | **Built** |
| 16 | Summary | `/recall/summary` | **Built** |
| 17 | Second pass | `/recall/second-pass` | Not built |

**The loop is wired and walkable.** `app/recall/layout.tsx` holds `RecallSessionProvider`; every route reads the session and turns its destinations into navigation, while the screens stay pure so each one still renders in Storybook without a provider.

**The loop has a front door, and it closes.** `/entry` → a topic → a set → the ladder → the summary → back to `/entry/ready`. Until the entry screens existed every screen assumed a session was already running and `/recall/idle` opened on term 1 of a script nothing had chosen.

**Every control on every built screen now goes where this document says it goes.** The summary's "Try again" was the last one outstanding — its destination, the Explain Out Loud entry screen, simply did not exist. The only handler still deliberately unwired is "Enable microphone", whose destination is iOS Settings and therefore outside the app; the home screen's other three feature chips are drawn but not pressable, because Scan, Quiz and Summarize are out of scope and sending them somewhere plausible would be the dishonest option in a demo.

---

## The entry path

Four screens, from `entrypoint AI Chat`. They are how a student picks what to practise.

### E1 · Home — `/entry` — `Entrypoint 1` (`15618:8632`)

Knowie, a greeting at `headline/L`, and a scrolling feature rail over the composer. **One feature is live.** Tapping **Explain out loud** goes to `/entry/compose`; the recent-folder chip goes to `/entry/folders`.

### E2 · Compose a set — `/entry/compose` — `selecting explain feature` + `choosing chip`

**Two Figma frames, one screen.** They differ only by what is in the field, so `value` is the difference. The feature chip stays attached to the composer until the student removes it — that is what makes the next message a practice set rather than a question. Typing is mocked like the speech: `chatInput` is presentational and has no `onChange`, so the field arrives carrying the topic and **Send** moves the student on to `/entry/ready`.

### E3 · Explain out loud — ready — `/entry/ready` — `explain out ready` (`15619:8880`)

The screen that starts a session, and **the summary's "Try again" destination**. The card is the button: Figma draws no CTA inside it, so the whole 314×104 surface is the affordance. It is drawn but not tappable for a short `generating` beat — mocked latency like the judge's, a named constant rather than a motion token.

**Tapping it goes to the folder picker, not into the ladder.** The end-to-end prototype is explicit — `explain out ready → choose folder screen → detailed page → idle` — and this used to push `/recall/idle` directly, skipping both. The student never chose what they were about to be tested on, and never got the last look at it that `sprint-context.md` calls *"the difference between a test and an ambush."*

### E4 · Choose a folder — `/entry/folders` — `choose folder screen` (`15647:11079`)

The other way in: something already studied rather than a topic typed into the chat. Opening a folder goes to `/recall/lesson`, whose "Explain out loud" starts the session. Both paths end at a set of concepts and the orb.

---

## Screen by screen

Component names below are the real entries in Storybook. `RecallHeader`, `QuestionBubble`, `RecallSkip`, `RecallEscapes` and `Knowie` are local parts exported from `components/screens/RecallScreens/RecallScreens.tsx`.

### 1 · Mic permission primer — `/recall/permission-primer`

Fires before the OS dialog, because a cold OS prompt is denied far more often.

**States** — one. The sheet-raised beat is screen 2, the same component with `showSheet`.

**Components** — `Screen`, `MascotSlot` (2XL) holding `Knowie` in the `standby` pose, `TextBlock` (XL), `ButtonGroup` (Vertical, L), `Button` (Primary L, Secondary L).

| The student can | Which leads to |
|---|---|
| Tap "Get started" | `/recall/permission-sheet` |

### 2 · Mic permission sheet — `/recall/permission-sheet`

The second beat: the screen primes, the sheet asks. Renders `PermissionPrimerScreen showSheet`.

**States** — one.

**Components** — `Screen` (`showBottomSheetBackground`, `bottomSheetOnly`), `BottomSheet` (height M, with descriptor), `MascotSlot` (2XL), `TextBlock` (L), `ButtonGroup` (Vertical, L), `Button` (Primary L "Allow", Secondary L "Type Instead").

| The student can | Which leads to |
|---|---|
| Tap "Allow" | `/recall/idle` — permission granted, straight into the first term |
| Tap "Type instead" | `/recall/text-fallback` |
| Dismiss the sheet | `/recall/permission-primer` — back to the priming beat |

The primer never appears again once permission is granted.

### 3 · Permission denied — `/recall/permission-denied`

The dead end the brief says we cannot afford. iOS cannot be re-prompted, so this screen explains how to re-enable and then gets out of the way.

**States** — one.

**Components** — `Screen`, `VoiceFab` (state=Deny — Idle's structure on a destructive fill, non-interactive), `TextBlock`, `Button` (Primary M).

| The student can | Which leads to |
|---|---|
| Tap "Type instead" | `/recall/text-fallback` |
| Tap "Enable microphone" | Raises a sheet with the Settings path and the way back |

**The sheet is what "Enable microphone" can honestly do.** No app opens iOS Settings for you from the web, and even the real app only deep-links you there — the switch is not in Knowunity either way. So the button says *where*, and then offers the return trip.

That closes a real hole rather than a prototype one: **before this the denied screen had no path back to voice at all.** A student who went and enabled the mic came back to a screen whose only button was "Type instead".

| On the sheet | Which leads to |
|---|---|
| Tap "I've turned it on" | `/recall/idle` — back into the voice loop |
| Tap "Type instead" | `/recall/text-fallback` — offered here too, so nobody has to dismiss the sheet to find the way forward |
| Close | Back to the denied screen |

A student who has denied permission opens straight into a text session on later visits. They see this screen once, not every time.

### 4 · Text fallback turn — `/recall/text-fallback`

Runs the identical ladder and the identical hints as the voice path. Say-it-back becomes type-it-again. The mastery number has to mean one thing across both.

**States** — one per round; the round's prompt and the student's answer are props.

**Components** — `Screen`, `ChatInput` (Status=Inactive), `RecallSkip`, `MascotSlot` (XL) holding `Knowie` in `standby`, plus the chat bubble and avatar drawn locally.

| The student can | Which leads to |
|---|---|
| Send an answer | `/recall/processing`, then wherever the verdict says |
| Tap the mic in the composer | `/recall/idle` — back to voice |
| Tap "Skip question" | Next term, or `/recall/summary` if it was the last |
| Tap ✕ | `/recall/exit` |

### 5 · The take — `/recall/answer-sent`

**The listening loop's second half**, and the screen the student lands on when they stop speaking. Follows Figma's `cancel option` (`15707:18257`).

**Two beats, and only the second is 300ms.** Voice_UX state 5 — "cancel and re-record before send", Must, brief F2 — lives in the first, and lives there precisely because that beat *waits*.

**States** — `sent=false`: the take. `transcriptSection` shows what was heard, Continue and Retry are live, and so is the trash. `sent=true`: submitted. Controls gone, 300ms, then the judge.

**The orb is status here, not a control.** It reads "Answer sent" on both beats; the decisions sit in the buttons. That is what makes the three exits three different things rather than three ways out.

**Components** — `Screen`, `RecallHeader`, `MascotSlot` (2XL), `TranscriptSection`, `ButtonGroup` (Horizontal, M), `Button` (Primary M "Continue", Secondary M "Retry"), `RecallSkip`, `VoiceFab` (state=Sent, `showDiscard` on beat 1), `TypeAnswer`.

| The student can | Which leads to | Rung |
|---|---|---|
| Tap "Continue" | Beat 2, then `/recall/processing` after 300ms | **consumed** |
| Tap "Retry" | `/recall/recording` — say it again | intact |
| Tap the trash | `/recall/idle` — the take is dropped | intact |
| Tap "Type your answer" | `/recall/text-fallback` | — |
| Tap "Skip question" | Next term, or the summary | scores as a miss |
| Tap ✕ | `/recall/exit` — **not built, left unwired** | — |

### 6 · Misheard transcript — `/recall/misheard`

Separates "the app misheard me" from "I didn't know it" — Voice_UX principle 4. The misheard control only appears when the scripted transcript's confidence score is below threshold.

**States** — the screen is one state; `RecallResponseCard` carries five (`Wrong`, `Misheard`, `Partial`, `Reveal`, `Correct`). `Wrong`, `Misheard` and `Partial` are contestable and show the `FeedbackButton` row. `Partial` and `Correct` show a score.

**Components** — `Screen`, `RecallHeader`, `RecallResponseCard` (which instances `TranscriptSection` itself — the screen must not stack a second one), `FeedbackButton` (verdict=Misheard, verdict=Confirmed), `ChipFeedback`, `MascotSlot`, `TypeAnswer`.

| The student can | Which leads to |
|---|---|
| Tap "Knowie misheard me" | `/recall/re-record` |
| Tap "That's what I said" | `/recall/result` — the verdict stands |
| Tap "Type your answer" | `/recall/text-fallback` |
| Tap ✕ | `/recall/exit` |

### 7 · Re-record offer — `/recall/re-record`

What claiming misheard leads to. Returns that term's clean, high-confidence transcript and **does not consume a round** — a transcription failure is never the student's fault, and the control has to visibly work once without looping.

**States** — one.

**Components** — `Screen`, `RecallHeader`, `TranscriptSection`, `Button`, `MascotSlot`.

| The student can | Which leads to |
|---|---|
| Tap "Continue" | `/recall/result` — judged on the corrected transcript |
| Tap "Next question" | Next term |
| Tap ✕ | `/recall/exit` |

### 8 · Exit sheet — `/recall/exit`

A student trying to leave should not be handed a form. Knowie asks them to stay, and the two buttons are the whole decision.

**Figma frame: `exit screen`, node `15807:21978`.** It arrived after this screen was first built from research notes, and it replaced them. The notes described the *beta's* sheet — *"'What made you stop?' — 8 reasons. Primary: Keep learning. Secondary: Leave anyway."* — which `sprint-context.md` rejects outright, and the frame agrees: no survey, two buttons.

**What the frame changed.** The sheet is a plea, not a summary of consequences: a handle-only app bar, Knowie in tears, **"Please don't leave"** at 44, **"Let me help you prep."** under it. No title, no descriptor, **no ✕**.

**What it cost.** The old descriptor named plainly that the term in flight would count as skipped. Figma's copy does not. `sprint-context.md` argued the cost should be named because "progress is saved" otherwise hides it until the summary, which is where trust in that number gets decided. That argument is unanswered rather than withdrawn — see design-system.md.

**States** — one.

**Components** — `BottomSheet` (height L, no title, `Type=Default` app bar), `PleaSheetBody`, `ButtonGroup` (Vertical, L), `Button`.

**Raised in place, not routed.** The sheet lives in `app/recall/layout.tsx` and is opened by `session.requestExit()`, so the turn the student is leaving stays mounted behind the scrim. Pushing `/recall/exit` instead unmounted it and dimmed an empty page — and a sheet over nothing is a dialog pretending to be one. The route still exists, standalone, for the index and the a11y harness.

| The student can | Which leads to |
|---|---|
| Tap "Keep learning" | The turn they were on — it never left |
| Tap "Leave" | `/recall/summary`; the term in flight is settled as **skipped** and the index moves on |

**Staying is the primary.** The student already chose to leave by tapping ✕, so the sheet's job is to make the cheaper option visible rather than re-ask the question they just answered. Leaving stays one tap away, which is what keeps it a prompt and not a trap.

**There is no third way out.** The app bar is `Type=Default` — the handle alone — so the sheet has no ✕. Two buttons, two outcomes; a silent dismiss would only make it unclear which one it counted as.

**Resuming moves to the next term**, with the abandoned one marked skipped — nobody gets dropped back into the struggle they left.

### 9 · Idle — `/recall/idle`

The resting state of every term, and the loop's spine.

**States** — one. **Idle is attempt 1 of a term only.** Rounds 2 to 4 start from the result screen, which carries its own orb — a student who has just read a hint uses it where they read it, rather than being bounced back to a blank prompt.

**Components** — `Screen`, `RecallHeader`, `QuestionBubble`, `RecallSkip`, `VoiceFab` (state=Idle), `TypeAnswer`, `MascotSlot`.

| The student can | Which leads to |
|---|---|
| Tap the mic | `/recall/recording` |
| Tap "Type your answer" | `/recall/text-fallback` |
| Tap "Skip question" | Next term, or `/recall/summary` |
| Tap ✕ | `/recall/exit` |

### 10 · Listening — `/recall/recording`

Must be unmistakable. Push-to-talk with explicit send only — auto-endpointing fails in background noise, and that failure is the most common voice-input problem there is. Follows `student talking` (`15620:9125`) and `student not talking` (`15707:18513`).

**States** — `waveformCard state="Talking"` while sound is arriving, `state="Idle"` while paused. That is the only difference between Figma's two frames, and it is the whole screen's job.

**Components** — `Screen`, `RecallHeader`, `MascotSlot` (2XL, tucked 37.5% behind the waveform exactly as it tucks behind the question bubble), `WaveformCard`, `VoiceFab` (state=Recording, captioned **"Listening"**), `TypeAnswer`, `RecallSkip`.

**No question bubble** — neither frame has one. The question belongs to idle; this screen's job is status.

| The student can | Which leads to |
|---|---|
| Tap the orb to send | `/recall/answer-sent` |
| Tap "Type your answer" | `/recall/text-fallback` |
| Tap "Skip question" | Next term, or the summary |
| Tap ✕ | `/recall/exit` — **not built, left unwired** |

**No cancel on this screen.** Nothing is recorded yet to throw away; the discard lives one beat later, on the take, where a take exists. `VoiceFab` enforces it — `showDiscard` renders only on `state=Sent`.

**The 60s cap is undrawn.** `sprint-context.md` decides it — warned before it lands, auto-sending at it — but no Figma frame shows the warning, and no `Snackbar` is composed here yet. The decision stands; the screen does not yet honour it.

**The waveform is static.** No motion tokens exist (see Open), so what carries the state instead is the orb's size and colour against Idle, the bars switching to `mascot/primary`, and the card's accessible name changing to "Recording your answer".

### 11 · Nothing heard — `/recall/no-audio`

Zero confidence is its own state. Nothing heard and heard badly are different problems, usually with different causes, and neither consumes a round.

**States** — one.

**Components** — `Screen`, `RecallHeader`, `WaveformCard` (state=Idle), `TextBlock`, `Button`, `MascotSlot`.

| The student can | Which leads to |
|---|---|
| Tap "Try again" | `/recall/idle` |
| Tap "Type your answer" | `/recall/text-fallback` |

### 12 · Processing — `/recall/processing`

Covers the wait. Voice_UX principle 6: four seconds of blank screen feels broken. Follows `thinking progress` (`15675:15606`).

**States** — one.

**Components** — `Screen`, `RecallHeader`, `Knowie` in the **`thinking`** pose (a third mascot asset, drawn at `size/fab/thinking` — Figma places it at 122×132, off every illustration step), `TranscriptSection`, `ProgressIndicator`, `VoiceFab` (state=Thinking, captioned "Evaluating…").

**Nothing here is interactive**, and that is the point. Voice_UX 1C: *"Can do: nothing interactive."* `VoiceFab state=Thinking` enforces it in the component — a `<div role="img">`, not a button — so a student cannot double-submit by tapping the orb again, which is the failure this state exists to prevent.

**The transcript stays up.** It is the evidence the answer landed.

**`submit()` runs here.** The judge works during the wait, which is what makes the wait mean something rather than a decorative pause in front of a decision already made. Its return value is the destination.

| The student can | Which leads to |
|---|---|
| Wait | `/recall/result`, `/recall/misheard`, `/recall/no-audio` or `/recall/reveal`, whichever the verdict says |

**The hold is mocked latency, not motion** — `JUDGE_LATENCY_MS` in `lib/recall/script.tsx`, a literal with a reason, the same class as the 342px keyboard reserve. The orb's pulse is the part that needs a motion scale, and stays static until one exists.

### The three verdicts, and why only two have a verdict screen

Every take the judge accepts comes back **correct**, **partial** or **wrong**. Those are use cases, not screens, and they do not map one-to-one onto routes:

| Verdict | Where the student lands | Why |
|---|---|---|
| **Partial** | 13 · `/recall/result` — the hint ladder | A miss climbs one rung and reads the next hint. This is the shape of being partway there. |
| **Correct** | 13a · `/recall/correct`, then optionally 13b · `/recall/correct-feedback` | A pass has stepped off the ladder, so it does not draw one. |
| **Wrong** | 14 · `/recall/reveal`, then 14a · `/recall/wrong` | **A wrong verdict is only ever shown past the whole ladder.** Four rungs spent, the model answer read, said back — and still not landed. There is no moment mid-ladder where a student is handed "wrong" without having been offered every hint first: a miss on hint 1 climbs to hint 2. |

**The main flow, from the Prototype page** (`15884:13647`, flow starting point `hint 1`):

```
hint 1 ─▶ hint 2 ─▶ hint 3 ─▶ reveal ─▶ the take ─┬─▶ correct ─▶ rating ─▶ summary
                                                  └─▶ wrong ─▶ comparison ─▶ summary
summary ─▶ choose folder screen ─▶ lesson
```

Each arrow out of a hint rung is a **miss**; a correct answer at any rung leaves the ladder for 13a. The branch at the take is the same branch every rung has — pass or miss — and the reveal is simply the rung where a miss has nowhere left to climb.

### 13 · Partial — the hint ladder — `/recall/result`

**The breakdown is what makes partial different from wrong.** `partial` (`15620:9496`) splits the answer in two under the transcript — **WHAT YOU GOT**, then **STILL MISSING** — because something was credited. Wrong's list says "none of this landed"; this says "some of it did, here is the rest". The card owns both, so the screen passes them straight through and the session carries them on the take.

Drives the hint ladder and the affirmation. This is the **partial** path, and the only screen a hint is ever read on. Follows the `hint ladder` section (`15833:9103`), whose four frames share one shape:

```
RecallHeader
HintLadder            Hint 1 · Hint 2 · Hint 3 · Reveal
the question, COMPACT  a plain 64-high bar. No mascot.
RecallResponseCard     verdict + transcript + contest buttons + THE HINT (rungs 1–2)
[hint panel]           rung 3 only — the hint promoted out of the card
VoiceFab + TypeAnswer  the student re-answers HERE
```

**States** — `Correct`, `Partial`, `Wrong`, each a `RecallResponseCard` state, times where the ladder stands.

**Components** — `Screen`, `RecallHeader`, `HintLadder`, `RecallResponseCard`, `VoiceFab` (state=Idle), `TypeAnswer`.

**Not `ChipFeedback`, `FeedbackButton` or `Percentage`.** The card instances all three itself. Composing them alongside repeats all three on screen — the same bug that once printed the transcript twice on the misheard screen.

**No mascot, and the question is restated flat.** No frame in the section has a `mascotSlot`; idle asks the question, this screen restates it so the student can answer without scrolling back. The 37.5% tuck rule does not apply here.

**The hint moves at rung 3.** On rungs 1 and 2 it sits *inside* the verdict card, as `RecallResponseCard`'s `hint` slot. On rung 3 Figma promotes it into its own panel below the card, at a larger step with a warm label — the layer is named "escalating warmth" — so the last hint before the answer cannot be mistaken for the previous two.

**A pass carries no hint**, enforced in the screen rather than left to the caller: there is no next rung to hint at.

| The student can | Which leads to |
|---|---|
| Tap the orb, on a miss | `/recall/recording` — the next attempt, from this screen |
| Tap the orb, on a pass | Next term, or the summary |
| Tap the next-action ("Skip Question") | Next term, scored as a miss |
| Miss at rung 4 | `/recall/reveal` |
| Tap "Type your answer" | `/recall/text-fallback` |
| Tap ✕ | `/recall/exit` — **not built, left unwired** |

### 13a · Correct — the pass — `/recall/correct`

The **correct** path's first beat. Follows `correct-answer` (`15664:13017`).

**Why it is a separate screen rather than `/recall/result` with a green badge.** The ladder frames draw `hints` and a compact question bar and no mascot; this frame draws a 2XL mascot and neither of the other two. That is not decoration — the ladder is the shape of being partway there, and a four-rung ladder above a correct answer tells the student they are three steps from something.

**States** — one.

**Components** — `Screen`, `RecallHeader`, `MascotSlot` (2XL) holding `Knowie` in `excited`, `RecallResponseCard` (State=Correct), `VoiceFab` (state=Idle), `RecallEscapes`.

**Knowie is 2XL and tucked, like every other turn.** Figma sets the variant to 3XL on all three correct-loop frames and then resizes the instance to 96, 100 and 120 — 3XL is 200. `recall-correct.png` and `recall-partial.png` settle it: roughly 100 across, with the card over his lower third. That is 2XL and the same 37.5% tuck the idle screen already uses, so the correct loop reuses the same mascot block rather than inventing a second one. The one thing that would make a pass feel like a different product is Knowie sitting at a different height on it.

**The card draws no contest buttons.** There is nothing to appeal about being right.

| The student can | Which leads to |
|---|---|
| Tap "Next question" | The next term, or `/recall/rating` if it was the last |
| Tap the orb | `/recall/correct-feedback` — Knowie's own answer, to read this one against |
| Tap "Type your answer" | `/recall/text-fallback` |

**Figma captions the orb "Tap to answer"**, which is `VoiceFab` Idle's default label rather than a decision — nothing is being answered here. It is captioned "Compare with Knowie" for what it actually does.

### 13b · Correct — Knowie's answer — `/recall/correct-feedback`

The correct path's second beat. Follows `correct-feedback` (`15664:13061`).

The student got it right in their own words; this is the words Knowie would have used, so the two can be read against each other. A right answer said once is not yet a right answer said well.

**It is not the reveal, though they carry the same card.** The reveal is where a term is declared wrong, so it keeps the ladder on `reveal` and restates the question the student never managed to answer. Here the question is behind them, and the frame draws the mascot instead.

**States** — one. Nothing here is judged and nothing costs a rung — the term was settled the moment the pass was recorded.

**Components** — `Screen`, `RecallHeader`, `MascotSlot` (2XL), `RecallResponseCard` (State=Reveal), `VoiceFab` (state=Idle), `RecallEscapes`.

| The student can | Which leads to |
|---|---|
| Tap "Say it back" | `/recall/recording`; `submit()` finds a settled term and advances |
| Tap "Type your answer" | `/recall/text-fallback` |

**One difference from the frame:** Figma draws the model answer in a plain `background/surface` box, where `recallResponseCard State=Reveal` puts an "Answer" badge above the same box. The component is used rather than a second card built beside it — the badge is the only thing added.

### 14a · Wrong — after the reveal — `/recall/wrong`

Follows `wrong` (`15888:15150`). The mirror of 13a: same mascot, same shape, `recallResponseCard State=Wrong` with WHAT WAS MISSING. **No ladder is drawn, because by this point there is none left.**

| The student can | Which leads to |
|---|---|
| Tap the orb | `/recall/comparison` — the two answers side by side. Not another attempt; there is none left to make |
| Tap "Next question" | The next term, or `/recall/rating` if it was the last |

### 14b · Comparison — both answers — `/recall/comparison`

Follows `Active Recall Summary Screen` (`15888:15245`). **SPEC listed this as row 14 "Comparison" and nothing ever built it** — the row was renamed "Reveal" when the hint-ladder section arrived, and the comparison quietly stopped existing.

They are different screens. The reveal shows the model answer so the student can **say** it; this shows it **against the saying**, after the saying went wrong.

**Components** — `Screen`, `ListItemGroup` + `ListItem` (Strong) for the model answer's points, `ButtonGroup`, `Button`.

**Both cards are one construction, against the frame.** Figma builds them differently: the correct-answer card puts its header inside the surface with a stroke around the whole card; the your-answer card puts its header outside with the stroke under it and the surface on the body only. Reading the two as a pair is the point of the screen, so both take the first treatment. **It is not `transcriptSection`** for the same reason — that component draws its own label and its own box, which produced a box inside a box and a second, smaller label.

**The model answer is broken into points, not left as prose.** "What did I miss" is answerable against a list and not against a paragraph — the same reason `recallResponseCard` breaks a wrong verdict into WHAT WAS MISSING.

**No orb and no progress.** The term is over.

| The student can | Which leads to |
|---|---|
| Tap "Revise now" | `/recall/lesson` |
| Tap "Try again" | `/recall/idle` — back into the loop at this term. The prototype wires this screen's second exit there, and a student who has just read what they missed should be able to try it |

### 14 · Reveal — the ladder runs out — `/recall/reveal`

Where four rungs end. The fourth frame of the same Figma section, so the shell is identical to result.

**States** — one.

**Components** — `Screen`, `RecallHeader`, `HintLadder` (on `reveal`), the compact question bar, `RecallResponseCard` (State=Reveal — an "Answer" badge and the model answer, no transcript and no contest buttons, with "Try it yourself after reading" beneath), `VoiceFab` (state=Idle, captioned "Say it back"), `RecallSkip` ("Next question"), `TypeAnswer`.

**Saying it back is required, not offered.** There is no "next question" here: the way on is to answer, by voice or by keyboard. This is the only moment in the loop where the student has a correct answer in front of them to say out loud, and letting them tap past it is the version of this screen that teaches nothing.

**This reverses `sprint-context.md`'s "optional say-it-back".**

Neither path is judged and neither costs a rung — the term was settled the moment the ladder ran out. What the student buys is the saying.

| The student can | Which leads to |
|---|---|
| Tap "Say it back" | `/recall/recording`, then on send the next term — unjudged |
| Tap "Type your answer" | `/recall/text-fallback`, then on send the next term — unjudged |

**Two ways forward and no way past.** Nobody is trapped; both paths advance. They just both involve doing it.

### 15 · Session rating — `/recall/rating`

The confidence self-report, between the last term and the score. Follows `session rating` (`15675:15580`).

**It is asked before the summary, and that ordering is the point.** After seeing 6/10, "how confident are you now?" measures a reaction to the number rather than a feeling about the material. So `advance()` and `skip()` both route the last term here, and Continue is what reaches the summary.

**Leaving early skips it.** `saveAndLeave()` goes straight to the summary: a student on their way out is not in a position to answer, and asking anyway is the research instrument `sprint-context.md` rejected, moved one screen later.

**States** — one. No top nav: the frame carries a status bar and nothing else, because the session is over and there is no turn left to leave.

**Components** — `Screen` (`showTopNavSlot={false}`), `MascotSlot` (2XL) holding `Knowie` in `excited`, `Checkbox` ×3, `ButtonGroup` (Vertical, L), `Button` (Primary L).

| The student can | Which leads to |
|---|---|
| Pick one of the three readings | Stays here; picking another clears the first |
| Tap the chosen one again | Clears it — the question is optional |
| Tap "Continue" | `/recall/summary` |

**Two departures from the frame**, both about the control:

1. **It is single-choice**, though Figma draws checkboxes. The three options are mutually exclusive readings of one feeling and the frame shows exactly one filled. A radio group is the right semantics; this system has no radio, so `Checkbox` is used and made single-select.
2. **The chosen row is violet, not green — a decision, not a limitation.** Figma's selected box is filled `feedback/success/surface/subtle` and ringed `border/success`, hand-detached with no variant behind it. Green means *correct* everywhere else in this app; nothing here is being marked, and a student choosing "I need to practice" should not get a green tick for the admission. Violet is the app's selection colour, and selection is what this is.
3. **The whole row is the tap target**, not just the disc at the end of it. Every list row in the app answers a tap anywhere along it. The click sits on the row and the focus stays on the checkbox, so a pointer gets the whole row and a keyboard gets one stop.

**Nothing reads the answer.** It is not recorded anywhere, and pretending otherwise would be the more dishonest option in a mocked prototype.

### 16 · Summary — `/recall/summary`

A count of terms explained unaided, not a grade — a count states what the student did rather than converting it into a mark. Follows the `summary` section's scaffold (`15857:10065`).

**States** — one.

**Components** — `Screen`, `Percentage`, `ListItem` + `ListItemGroup` (variant=Strong, variant=Review), `ButtonGroup`, `Button`, plus a coloured stat tile drawn in the screen (logged in `component-gaps.md`).

**What came naturally leads.** Strong above review, in that order and never reversed: the same information the other way round meets a struggling student with a deficit before anything has been acknowledged.

**The three tiles split the count rather than repeating it** — Perfect (unaided), Hinted (took help), Missed. They sum to the total, which is what makes the ring's fraction legible rather than decorative.

**Skipped terms head the review list.** `sprint-context.md`: *"skip scores as a miss but leads the revise list"* — a term you could not start is the clearest gap you have.

| The student can | Which leads to |
|---|---|
| Tap "Revise now" | The topic breakdown with weak terms marked — **not built, left unwired** |
| Tap "Try again" | `/recall/second-pass` — **not built, left unwired** |

**Where this departs from `reference/recall-summary.png`.** The shipped app draws three outcome buckets — good explanations, needs practice, and a **Skipped** bucket Figma has no equivalent for — with no ring and no tiles at all. Figma is the authority on composition, so the ring and the two cards are what got built; skipped terms land at the head of the review card rather than being dropped.

**`SummarySmallCards` is not used here.** It is a two-tile Recalled/Need-Review pair; this screen needs a three-way split.

**XP does not appear.** `sprint-context.md` says the completion bonus lands at the summary, but neither the Figma frame nor the screenshot draws an XP figure on it. Flagged under Open.

### 17 · Second pass — `/recall/second-pass`

Runs every weak term back through the full ladder under one CTA. A term passed here is marked "on second pass" — the effort deserves recording, and the record still has to be truthful. A term that misses again stops there and stays named on the revise list; two full ladders is enough for one sitting.

**States** — reuses screens 9–15 with a flag, rather than duplicating them.

---

## Out of scope

Explicitly not built. These are known gaps, not oversights.

- Knowie voice output. Knowie replies in text throughout.
- Real speech-to-text, real audio capture, any model call.
- Auto-endpointing or silence detection.
- Tutoring, follow-up questions, or conversational branches off a recall turn.
- Transcript correction as an interactive step. The transcript is read-only on every round and re-recording is the only correction — keyboard correction reintroduces the friction voice input exists to remove.
- Mic hardware busy (on a call). Rare in practice.
- Language switching mid-session.
- A third pass, or any recovery beyond the second. A deliberate stopping point.
- Mastery persisting across sessions. A term explained unaided today is not recorded as known tomorrow.
- Desktop, tablet, responsive breakpoints, light mode, RTL. 390px dark-mode iOS only.
- **The exit sheet**, and with it the ✕ on every screen. The only control in the loop that goes nowhere.
- **The entry path** — the chat chip, topic list, folder pick, topic breakdown and suggestion screen. Deferred by build order, not by scope: the loop is where the brief says the design problem lives, and a complete loop with a narrated entry demos better than a walkable path into a loop with holes.

---

## How the mocked recall behaves

There is no speech-to-text and no judge. The behaviour below is the contract that replaces them.

**The script.** Each term carries a fixed script — a pre-written transcript and a fixed verdict per round — advanced by tapping send. A deterministic session makes every state reachable on a known path and demos the same way twice.

**The session is four terms**, chosen to show recovery rather than only success:

| Term | What it demonstrates |
|---|---|
| 1 | A clean pass, first round |
| 2 | A pass after one hint |
| 3 | A low-confidence retry — the misheard path |
| 4 | A full miss through all four rounds, to the comparison screen |

**Confidence drives the misheard control.** Every scripted transcript carries a confidence score. Below threshold, the misheard control appears; above it, it does not. A confidence rule generalises where a per-term flag does not.

**Four things cost the student nothing**, and each hands the next take to the *same* rung: discarding a take before send, tapping **Retry** on the take screen, claiming the app misheard, and a recording nothing was heard in. Only **Continue** consumes a rung.

**Claiming misheard costs nothing.** It returns that term's clean, high-confidence transcript and does not consume a round. A contestable take is always paired with a clean one on the same rung — a rung whose last take is contestable would leave the student with nothing to submit.

**Zero confidence is its own state.** "We didn't catch anything" is not a bad answer, and consumes no round. A blank or silent recording never counts as an attempt.

**Four rounds per term.** Round 1 unaided; rounds 2 and 3 each add a hint; round 4 is the final attempt with the most direct hint. Still wrong after four routes to the comparison screen. Each round is a **fresh full answer**, not a supplement, so every attempt is judged whole and the score means one clean thing.

**Hints are analogical and escalate** — an analogy, then the analogy explained, then the missing concept named. Never the answer itself.

**The judge is generous.** Borderline pass/partial cases resolve to pass, because a false wrong is more demoralising than a false partial.

**Skip scores as a miss but leads the revise list** — a term you could not start is the clearest gap you have.

**Timing.** Processing holds 2–4s. The wait is calm and slow: roughly a 1.6s pulse cycle, roughly a 250ms reveal. It should read as considered thought rather than machinery, in a moment where the news might be bad.

**XP.** The figure starts at 0 and does not move during the loop — it reads 0 on every recall screen and changes once, at the summary, when the flat completion bonus lands. A figure that never ticks cannot compete with the recall for attention while still keeping XP visible as something the session is worth. The bonus survives leaving and is waiting on return.

---

## Verification

How someone checks this is done and correct, end to end. Run from the repo root.

### 1 · The build is sound

```
npm run tokens:css      # regenerates app/globals.css — exits non-zero on a broken reference
npm run tokens          # regenerates build/css/tokens.css
npx tsc --noEmit        # clean
npm run lint            # clean except one known warning in style-dictionary.config.mjs
npm run build           # clean across every route
```

`git status` must show no diff in `app/globals.css` or `build/css/tokens.css` after the two token commands. A diff there means someone hand-edited generated output.

### 2 · The component catalog is green

```
npm run storybook
```

Then run Storybook's test-run across all stories — not a `package.json` test script. Every story passes and **accessibility violations are zero**. The `Screens/Recall states` entries are the same components the routes render, so a green story is evidence about the route.

### 2b · The routes are green

```
npm run dev      # one terminal
npm run a11y     # another
```

`scripts/a11y.mjs` runs axe over every route in a 390×844 dark-mode iOS context and exits non-zero on any violation. It must report **0 violations across 14 routes**.

This is not a duplicate of step 2. Storybook's addon audits a component alone in a canvas; this audits a document. The defects only the second can see are the ones this repo has actually shipped — duplicate landmarks when several cards carried the same `<section aria-label>`, heading order that is correct per component and wrong down the page, `<html lang>` and `<title>`, contrast against the real page background rather than the canvas's, and ids that collide only once two instances share a document. Its very first run caught `maximumScale: 1` / `userScalable: false` in `app/layout.tsx` failing WCAG 1.4.4 on all eight routes — a defect no story could ever surface, because no story owns a viewport meta tag.

Run both. Neither replaces the other. When a route is added to `app/recall/`, add it to `ROUTES` in the harness — a route missing from that list is a route nobody is checking.

### 3 · Every screen is reachable by clicking

```
npm run dev
```

Open `http://localhost:3000/recall/idle` at 390×844 in an iOS device frame, dark mode. Then walk the whole scripted session **without typing a URL again**:

Every turn: orb → listening → orb → the take (transcript, Continue / Retry / trash) → Continue → 300ms flash → processing → a verdict.

| Term | What it should do |
|---|---|
| 1 | Passes first attempt. **Badge "Correct", no hint** — a pass has no next rung. Ladder lights nothing. |
| 2 | Opens on a 0.55-confidence take → **misheard**. Contest it; the rung does **not** move. Re-answer → "Almost there", **ladder on Hint 1, hint inside the card**. Answer again → Correct, still Hint 1. |
| 3 | Same contest path, then Correct at attempt 1. |
| 4 | Opens on a silent take → **nothing heard**, rung intact. Then four misses: Hint 1 and Hint 2 **inside the card**, Hint 3 **promoted into its own panel below it**, then **reveal** — model answer, "Try it yourself after reading", no transcript, say-it-back offered. |

Then the escapes, which matter more than the happy path:

- From any turn, "Type your answer" reaches the text fallback in one tap.
- From the take screen, **Retry** returns to listening and the **trash** returns to idle, and neither moves the rung.
- **Reload mid-session.** `sessionStorage` restores the same term and rung. This is the check that catches a write-on-mount clobbering the save.

**The check that fails most often:** every screen in the walk must have been reached by a tap. If any step needed the address bar, that screen is not done. The one exception is stated above the table — ✕ is unwired until the exit sheet exists.

### 4 · The design holds

- 390px, dark mode. No light mode, no breakpoints.
- Every value traces to `tokens/tokens.json`. Grep the component CSS for a hex literal, a raw `px` outside a documented exception, or a `var(--token, fallback)` — all three are defects.
- Components consume the semantic layer only. A `--primitive-*` custom property inside a component file is a defect.
- Sentence case on every label. Proper nouns only: Knowie, Knowunity, PRO.
- Screens match `reference/*.png` on spec and the Figma file on composition. Where a pattern has no screenshot at all, the binding says so in a comment rather than passing a Figma value off as measured — the rule is written up in `design-system.md` under "When a pattern has no screenshot".

### 5 · Deployed

`npm run build` output deploys to Vercel, and the walk in step 3 repeats on a real iPhone in Safari. Safe-area insets apply top and bottom; the composer sits clear of the home indicator.

---

## Open

Undecided. Listed rather than settled.

- **There is no motion layer at all.** `tokens/tokens.json` has no duration, easing or delay tokens — the single hit for "motion" is inside the word "emotional". Processing turned out **not** to be blocked by this (Figma draws it static, and it ships), but three things stay still that should move: the recording orb's pulse, the waveform reading as live, and the result card's reveal. The two holds that *are* coded — the take's 300ms flash and `JUDGE_LATENCY_MS` — are mocked latency with a comment saying so, not design values. A motion scale would close all three at once.
- **The XP number, and where it lands.** The bonus is flat and drawn as 0 throughout the loop, but the figure is a placeholder with no relationship to XP values elsewhere in the product — and **the summary has nowhere to show it**. Neither the Figma frame nor `recall-summary.png` draws an XP figure there, so the one moment `sprint-context.md` says XP moves has no component for it.
- **The orb's size.** The shipped app measures roughly 146 total / 114 button. Figma draws 170 / 140 (`size/fab/ring`, `size/fab/button`), and the build follows Figma. This may be a deliberate redesign rather than drift — it needs a call, not a guess.
- **The inline chat mascot is 44.** Figma draws Knowie at 44×44 beside the student's turn on the text fallback. Every illustration step is larger (XL 64, 2XL 120, 3XL 200, 4XL 320), and no screenshot contains a chat mascot to measure against. The build holds `XL`. Either `size/illustration/L` (44) gets requested, or the inline mascot is confirmed at 64.
- **There is no avatar role in the system.** The app draws exactly one avatar — the 25×25 profile disc in the bottom nav. The text fallback borrows `control/S` (32), a control size doing an avatar's job. `size/avatar/{S,M}` is a request.
- **Hint authoring.** Three analogical rungs per term is real content work, and the analogies have to be good enough to nudge without teaching. Only the four scripted terms are needed for the prototype, but they are not written.
- **Whether the `feedback/*` rename is adopted.** Figma inserted a `surface` segment (`feedback/partial/surface/bold`). Values are identical, but Figma's own `error` branch still carries both spellings, so the rename is not settled there and has not been taken up in code.
