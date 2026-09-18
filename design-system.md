# Knowunity Design System

Rules, not values. Every value lives in `tokens/tokens.json`. This file tells you how to use the system.

---

## Component selection

### When to reach for each component

**button** — any labelled action. Primary for the single most important CTA on a screen. Secondary for supporting actions (Skip, Cancel, filter). Tertiary for lowest-emphasis options. One Primary per screen; if a second action is needed it must be Secondary.

**buttonIcon** — icon-only actions where the icon is self-explanatory without a label: close, microphone, share, settings. If a reasonable person would need a label to understand what the button does, use button instead.

**buttonGroup** — paired actions at the bottom of a screen. Use vertical when both actions need equal weight ("Keep learning" / "Leave anyway"). Use horizontal when one action is primary and the other is compact and subordinate — the horizontal layout places a buttonIcon alongside a full button, and the icon is always the subordinate of the pair.

**chips** — tags, toggles, and mode indicators ("Practice Round", "Coach Me"), filter selectors, and the PRO badge. Not for navigation and not for primary CTAs. Chips have no loading or disabled state; if an action needs either, use button.

**appBar** — top navigation chrome on every screen that has a back action, a title, or contextual controls. Content is slotted in; the component carries no navigation logic. Maximum two actions on the right side.

**progressIndicator** — completion bars for exam plan steps, session progress, and quiz position (for example, 1/3). The preset progress steps (0, 25, 50, 75, 100) are design-time representations. In production the bar width is driven by real data.

**snackbar** — transient feedback that requires no decision: "Saved", "Something went wrong", "Session resumed". Two lines maximum. If the message requires a user response before continuing, use a modal or bottom sheet instead.

**textBlock** — a heading and caption pair for section headers, card titles, and empty state headings. Not for interactive labels or button text; it has no press state.

**mascotSlot** — Knowie illustration for full-screen emotional moments: celebrations, empty states, onboarding, session completion. Not for list items, cards, or any repeated pattern. Knowie is a screen-level character.

**iconSlot** — internal sizing scaffold. Always use iconSlot wherever an icon appears inside a component rather than placing a raw vector. The size variant is set by the parent component and must not be overridden per instance.

**recallResponseCard** — result surface for one evaluated recall attempt in the Explain Out Loud loop. Use after Knowie returns a verdict; never during processing. See full spec below.

**voiceFab** — circular tap target for voice input in the Explain Out Loud recall loop. See full spec below.

**waveformCard** — 24-bar voice amplitude visualiser shown during the listening phase of the recall loop. See full spec below.

**thinkingBubble** — orb animation shown while Knowie is evaluating. Used inside voiceFab state=Thinking. See full spec below.

**chipFeedback** — inline verdict badge pill for standalone result display outside a card. See full spec below.

**percentage** — circular session score display for the summary screen. See full spec below.

**summarySmallCards** — paired recalled/need-review stat tiles for the session summary. See full spec below.

**strongCard** — list of topics the student recalled well, shown on the summary screen. See full spec below.

**reviewTopicCard** — list of topics the student needs to revisit, shown on the summary screen. See full spec below.

**transcriptSection** — "WHAT YOU SAID" label above a tinted transcript box on the result screen. See full spec below.

**statTile** — single stat tile: large number above a subdued label. See full spec below.

**folderCard** — study folder entry card with a colour-band header. See full spec below.

**feedback Button** — two-option action row inside recallResponseCard for flagging a transcription error. Renamed from `errorButton` in Figma. See full spec below.

**Check** — 32×32 checkmark icon used in voiceFab state=Sent. See full spec below.

**typeAnswerComponent** — keyboard icon + "Type your answer" text-fallback link. See full spec below.

---

## Scaffold and slots

### Screen scaffold

Every screen is composed in order from top to bottom:

1. **appBar** — navigation chrome. Always at the top. Contains a slot for arbitrary content. The bar owns no navigation logic.
2. **Content area** — the scrollable body of the screen. Consumes `background/page` as its base fill.
3. **Primary action** — a button or buttonGroup pinned to the bottom of the safe area. Primary CTAs sit low so thumbs reach them without shifting grip.

Safe area insets must be applied at the top (status bar) and bottom (home indicator). Use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` with `viewport-fit=cover`, or apply equivalent fixed padding.

### appBar slot

The slot accepts any combination of:
- A back or close buttonIcon on the left
- A title text node in the center
- Up to two buttonIcon instances on the right, or one button on the right

Do not place more than two actions on the right. Do not place a full labelled button on both left and right simultaneously; that pattern breaks the visual balance and is not represented in the component variants.

### buttonGroup composition

Vertical: two button instances of equal weight. Use for binary decisions where neither option dominates.

Horizontal: one buttonIcon (left, subordinate) alongside one button (right, primary). The icon button is always the lesser action. If both actions need equal prominence, use vertical.

### Feedback card composition

A result card is composed as:

1. **Card container fill**: always `background/surface`. Never a `feedback.*` token.
2. **Badge**: a pill using `feedback.{state}.surface.bold` as fill and `feedback.{state}.surface.label.bold` for text on it.
3. **Body copy**: `text/primary` for primary content the student must read; `text/secondary` for supporting text (transcript, bullet items).
4. **Accent elements** (dots, strips, ring strokes): `feedback.{state}.surface.bold`.
5. **Zone wash fills** (inset surfaces, tinted sections): `feedback.{state}.surface.subtle` — never on the enclosing card.
6. **Border** (optional): `border/default` for bordered surfaces (Knowie answer box, neutral badge in Reveal state).

Never mix feedback fill tokens across states on a single card. A card is one state. The complete implementation of this pattern lives in `recallResponseCard`.

---

## recallResponseCard

Result surface for one evaluated recall attempt in the Explain Out Loud loop. Shows the verdict badge, a transcript of what the student said, Knowie's response, and — on an incorrect result — a structured breakdown of what was missing.

### Variant axis: State

`State` with an additional boolean `showMissingSection` encoded in the variant name on Default.

**State=Default, showMissingSection=True** — incorrect result. Student's answer did not land. Shows error badge (`feedback/error/surface/bold`), transcript of what was heard, `feedback Button` row, Divider, and Missing Section listing the missing concepts as bullets. `nextActionLabel` default: "Next question".

**State=Default, showMissingSection=False** — partial result. Student touched the concept but didn't fully cover it. Shows partial badge (`feedback/partial/surface/bold`), transcript, and `feedback Button` row. No Divider or Missing Section. `nextActionLabel` default: "Reveal answer".

**State=Reveal** — model answer revealed. Transcript and Action Buttons replaced by full model answer text (`text/primary`). Helper label "Try it yourself after reading" sits below card. Badge reads "Answer" in neutral pill (`background/surface` + `border/default` stroke). `nextActionLabel` default: "Next question".

**State=Correct** — passing result. Percentage circle (44×44, `feedback/success/surface/bold` ring) and green "✓ Correct" badge replace the standard badge row. Action Buttons replaced by Knowie Answer text block (`background/surface`, `border/default`, `Radius/300`). Left Accent Strip (`feedback/success/surface/bold`, 3px wide) runs along left edge of card.

### Properties

`badgeLabel` (text) — verdict label inside the badge pill. Defaults per state: "✗  Not quite" / "↺  Almost there" / "Answer" / "✓  Correct". Override when localising.

`transcriptText` (text, Default states only) — STT transcript of the student's answer.

`showMissingSection` (boolean, Default states only) — toggles the Divider, Missing Label, and Missing List. True = incorrect. False = partial. Never set to True on Reveal or Correct; those states do not contain the missing section layers.

`nextActionLabel` (text) — right-aligned link below the card.

`percentageText` (text, Correct only) — score inside the percentage circle. Default: "100%". Override with the actual session score.

### Layer anatomy

All values are token names. See `tokens/tokens.json` for resolved values.

```
recallResponseCard
  Card                     fill: background/surface, radius: Radius/400
                           padding: Space/400 top/bottom, Space/300 left/right
                           gap: Space/800
    Response Body          vertical, gap: Space/200 (Default/Reveal), Space/400 (Correct)
      Badge                pill, radius: Radius/Full
                           fill: feedback/error/surface/bold       (Default/True)
                                 feedback/partial/surface/bold     (Default/False)
                                 background/surface + border/default stroke (Reveal)
                                 feedback/success/surface/bold     (Correct)
        Badge Label        Greed/Caption S Bold — color: state label token
      [Percentage Circle]  Correct only — 44×44, absolute layout
        Ring               Ellipse 44×44, stroke: feedback/success/surface/bold
                           weight: Stroke/Heavy Border, align: inside, no fill
        Percentage Text    Greed/Caption M Regular, fill: feedback/success/surface/label/bold
      Transcript           fill: background/elevated, radius: Radius/200
                           padding: Space/200 all sides
        Transcript Text    Greed/Body S Regular, fill: text/primary
      Action Buttons       horizontal, gap: Space/300, padding: Space/200 top/bottom
                           Default states only
        Primary Action     feedback Button verdict=Misheard
        Secondary Action   feedback Button verdict=Confirmed
      [Model Answer Text]  Reveal only — Greed/Body S Regular, fill: text/primary
      [Knowie Answer]      Correct only — fill: background/surface, stroke: border/default
                           radius: Radius/300, padding: Space/300
        Answer Text        Greed/Body S Regular, fill: text/primary
      Missing Section      Default/True only — vertical, gap: Space/200
        Divider            Rectangle 1px, fill: border/default
        Missing Content    vertical, gap: Space/100
          Missing Label    "WHAT WAS MISSING", Greed/Caption S Bold
                           fill: feedback/error/bold
          Missing List     vertical, gap: Space/100
            Missing Item   horizontal, gap: Space/200, align: center
              Bullet       Ellipse 5×5, fill: feedback/error/bold
              Item Text    Greed/Caption M Regular, fill: text/secondary
  [Left Accent Strip]      Correct only — Rectangle 3×(card height − 4)
                           fill: feedback/success/surface/bold, radius: Radius/100
                           positioned at left wrapper edge, inset 2px from top
  Next Action Label        Greed/Caption M Bold, fill: text/disabled, right-aligned
  [Helper Label]           Reveal only — Greed/Caption M Bold
                           fill: text/secondary, center-aligned
```

Typography: all five properties (`fontFamily`, `fontStyle`, `fontSize`, `lineHeight`, `letterSpacing`) are bound to Typography collection variables. Font: Greed Standard-TRIAL throughout.

### When to reach for it

Once per term, per attempt, after Knowie returns a verdict. Default/True for incorrect, Default/False for partial, Reveal after the student taps "Reveal answer", Correct for a passing answer.

### What not to do

Do not use during the processing state — this component appears only once a verdict exists. Do not set `showMissingSection=True` on Reveal or Correct. Do not swap the Left Accent Strip colour — it is a Correct-state affordance only. Do not put more than three bullets in Missing List.

---

## voiceFab

Circular tap target for voice input in the Explain Out Loud recall loop.

### The orb sits `space/layout/xl` (24) below the content above it, on every turn

One distance, everywhere the orb appears: listening, the take, processing, the two ladder screens, correct, correct-feedback, reveal, wrong and misheard. Nine screens, 24 on all of them.

It was not, and nothing had chosen otherwise — it was inherited. Each screen's column sets its own `gap` for its own stack, and the gap applies to the orb along with everything else, so the same component came out **24** on the listening and take screens, **16** on the two hint-ladder screens (`.knw-recall--result` tightens its column for the ladder, the ask bar and the card), and **0** on processing, where the column is flush because Figma stacks the `thinking` pose straight onto the transcript box. At 0 the orb butted against the transcript.

Figma is unambiguous that the approach should match: `reveal`, `hint2` and `cancel option` all draw the same `voiocefab` frame — 390 × 300, padding 8, orb at y21 — whether the orb follows a card or a transcript. `hint3` is the single exception at 258 with no padding, and it is the frame whose column also carries the promoted hint panel.

The two screens whose columns run tighter make up the difference on `.knw-recall__fab` itself, written as `xl − l` rather than as `8`, so it stays true if either token moves. **A column gap is for the column's own stack; the orb's approach to the content is a separate decision and is stated separately.**

### Variant axis: state

**state=Idle** — mic is ready. Student has not started speaking. Ring at 15% opacity. Icon: mic. Label: "Tap to answer" in Figma; the build says **"Speak to start"** — the caption names the act rather than the gesture, on every screen with a resting orb.

**state=Recording** — student is actively speaking. Ring pulses at full opacity (`mascot/primary`). Button fill: `interactive/primary`. Icon: mic illustration (fixed asset, not swappable via icon property). Label: "Tap to send". Push-to-talk: student taps the button again to submit, or taps the trash discard icon to cancel and re-record.

**state=Sent** — momentary confirmation that the answer was dispatched. Shown for ~600ms before Thinking. Fill same as Idle. Icon: checkmark. Label: "Answer sent".

**state=Thinking** — Knowie is evaluating. Button surface replaced by `thinkingBubble` orb animation (`mascot/orb/start` → `mascot/orb/end` gradient, blend: screen). Label: "Evaluating…", fill: `text/disabled`. Non-interactive — do not expose a tap target in this state.

**state=Disabled** — feature gated. `interactive/disabled` fill. Icon: mic at `text/disabled`. No ring. Non-interactive.

**state=Deny** — microphone permission refused. Idle's structure recoloured: the `mascot/primary` ring survives, so the student recognises the same orb, but the button turns `feedback/destructive/bold` and the mic glyph drops to `feedback/error/surface/subtle`. Non-interactive — tapping a blocked mic does nothing, and the escape is the `buttonGroup` below it on the screen. Label (when shown): "Microphone blocked".

Use **Deny** when permission was refused and **Disabled** when the feature itself is unavailable. The difference matters: Deny has a fix the student can act on, Disabled does not.

TOKEN NOTES: Figma binds Deny's button to `feedback/destructive/surface/bold 2`, a name the token file does not carry; `feedback/destructive/bold` is the semantic equivalent and is what the build uses. Deny's Figma **description is still Idle's**, word for word ("Mic is ready… Label: 'Tap to answer'") — the nodes were followed, not the prose.

### Properties

`label` (text) — overrides the caption below the button. Idle default: "Speak to start" (Figma says "Tap to answer"). Recording default: "Tap to send". Sent default: "Answer sent".

`showLabel` (boolean) — hides the Label node. Default: true. Set to false when the parent screen provides its own label, or for compact placements.

`icon` (instance swap) — swaps the icon in state=Sent. Default: iconSlot Size=400. In state=Idle and state=Recording the icon is the mic illustration (custom vectors, not swappable via this property — those states use a fixed mic asset scaled to the button).

### Layer anatomy (Idle / Recording / Sent)

```
voiceFab
  Button Group              fixed 170×170, clips ring + button + icon
    Ring                    Ellipse 170×170, fill: mascot/primary (hover glow)
    Button                  Ellipse 140×140, fill: interactive/primary (tap surface)
    Center Icon Container   FRAME or INSTANCE holding the icon asset
  Label                     Greed/Caption M Bold, fill: text/secondary
```

### Layer anatomy (Thinking)

```
voiceFab
  Center Voice UI   GROUP — Voice Fab instance + Mask Group (orb visual)
  Mask Group        GROUP — Ellipse, fill: gradient mascot/orb/start → mascot/orb/end
  Label             Greed/Caption M Bold, fill: text/disabled — non-interactive, "Evaluating…"
```

### What not to do

Do not use state=Recording when the student has already sent their answer. Do not add a second label node — use the `showLabel` property. Do not resize the Ring ellipse independently of the Button — both scale together.

---

## waveformCard

24-bar voice amplitude visualiser shown during the listening phase of the Explain Out Loud recall loop. Bars scale with the student's voice amplitude in production — this component shows the design-time resting position.

### Variant axis: state

**state=Idle** — microphone is on, student is not speaking. All 24 bars use `background/contrast` (#f4f2ff).

TOKEN NOTE: `background/contrast` is intentionally repurposed here. The resolved near-white value reads as flat/silent bars against the dark `background/surface` card — which is the correct visual for an idle waveform. If `background/contrast` changes (e.g. in a light-mode token set) these bars will drift. Introduce `mascot/waveform/idle` at that point.

In production, bars breathe gently at minimum height (motion layer, no design token).

DIMENSION NOTE: Card 358×90. Horizontal pad 64px each side → 230px inner width. Waveform frame 228×56 (2px breathing room each side, not a token). Bar math: 24 bars × 4px + 23 gaps × 4px + inner pad 8px each side = 204px content + 24px headroom. If bar count changes, update the Waveform frame width manually.

**state=Talking** — student is actively speaking. Bars 01–20: `mascot/primary` (#9178e6). Bars 21–24: `interactive/secondary` (rgba 255,255,255,0.10).

TAIL BAR TOKEN NOTE: `interactive/secondary` is repurposed for bars 21–24. Its semantic meaning is "ghost button fill" but the resolved value (10% white) correctly represents a fading amplitude tail. If the ghost button fill changes for theming reasons, bars 21–24 will drift. Introduce `mascot/waveform/tail` at that point.

Bar heights are animation data — overridden by the motion layer in production. Heights shown here are design-time resting positions only.

DIMENSION NOTE: same card and waveform dimensions as state=Idle.

### Layer anatomy

```
waveformCard              358×90, fill: background/surface, stroke: border/default
                          radius: Radius/400
  Waveform                228×56, horizontal auto-layout
                          gap: Space/200, padding: Space/200 left/right
    Bar 01 … Bar 24       3.5px wide, radius: Radius/Full
                          fill: background/contrast (Idle)
                                mascot/primary (Talking, bars 01–20)
                                interactive/secondary (Talking, bars 21–24)
```

### When to reach for it

Place directly below `mascotSlot` in the listening screen. Switch to state=Talking when audio capture starts; switch to state=Idle when the student is not yet speaking or has paused.

### What not to do

Do not use this component in the thinking state. Once the answer is sent, replace with `voiceFab` at state=Thinking. A waveform in the thinking state implies audio is still being captured.

---

## thinkingBubble

Orb animation shown while Knowie is evaluating a student's answer. Composed of a voiceFab SVG asset beneath a masked gradient orb (`mascot/orb/start` → `mascot/orb/end`, blend: screen). Used in voiceFab state=Thinking — this is the visual behind that state.

### Variant axis: size

**size=Mid** — default. 279×234. For the standard in-loop Thinking state.

**size=Large** — 290×290. For screens where Thinking occupies more vertical space.

### Layer anatomy

```
thinkingBubble
  Center Voice UI   GROUP — Voice Fab SVG + Mask Group stacked
    Voice Fab       SVG asset scaled to variant size
    Mask Group      GROUP — Ellipse masked by orb gradient
                    fill: gradient mascot/orb/start → mascot/orb/end, blend: screen
```

TOKEN NOTE: inner geometry (Rectangle 387/388, Line 1/2) sits inside a scaled instance and cannot be variable-bound through the plugin API. Values are proportional to size and scale with the variant frame. No token binding needed — these are purely visual artifacts of the orb SVG.

### What not to do

Do not add a text label inside this component — the label belongs to `voiceFab`. Do not use this component outside the Thinking state context.

---

## chipFeedback

Inline verdict badge pill for a single recall result. Three variants covering Correct, Partial, and Wrong results.

### Variant axis: verdict

**verdict=Correct** — solid fill `feedback/success/surface/bold`. Label "✓ Correct". Use after a passing answer.

**verdict=Partial** — no fill. Stroke 2px `feedback/partial/surface/bold`. ArrowCounterClockwise icon. Label "Almost there". Use when the student partially answered.

**verdict=Wrong** — solid fill `feedback/error/bold`. X icon. Label "Not quite". Use when the answer did not land.

### Layer anatomy

```
chipFeedback          pill, radius: Radius/Full
                      padding: Space/100 top/bottom, Space/300 left/right, gap: Space/200
  [Icon]              SVG icon — Correct: none | Partial: ArrowCounterClockwise 16×16
                                 Wrong: X 12×12
  Label               Greed/Caption M Bold, fill: state label token
                      Correct: feedback/success/surface/label/bold
                      Partial: feedback/partial/surface/bold
                      Wrong:   feedback/success/surface/label/bold (dark text on red)
```

TOKEN BINDING: Correct fill `feedback/success/surface/bold` / Partial stroke 2px `feedback/partial/surface/bold` / Wrong fill `feedback/error/bold`.

### When to reach for it

Use for standalone verdict display outside a card — summary rows, inline in lists. Inside `recallResponseCard` the Badge layer is used directly; `chipFeedback` is not nested inside the card.

### What not to do

Do not use verdict=Partial fill tokens on verdict=Correct and vice versa. Do not resize the pill — it hugs its label content.

---

## percentage

Circular session score display for the summary screen. Shows recalled fraction ("7/10") and a "Recalled" label inside a rotating donut ring SVG.

### Layer anatomy

```
percentage            154×154, absolute layout
  Container           centered, vertical
    Score text        "7/10", Greed/Headline M Bold (font/size/xl)
                      fill: text/primary, tracking: font/tracking/tight
                      lineHeight: font/lineHeight/md (24px — nearest token to design value of 32px)
    Recalled label    "Recalled", Greed/Body S Regular (font/size/sm, font/lineHeight/sm)
                      fill: text/tertiary, tracking: font/tracking/loose
  Icon (donut ring)   SVG 154×154, absolute, rotated −90°
                      ring color: feedback/success/surface/bold in production
```

TOKEN NOTE: `lineHeight` for score text is bound to `font/lineHeight/md` (24px) — the design value of 32px has no token. Request `font/lineHeight/lg2` (32px).

### When to reach for it

Summary screen only. Single variant, no component properties. Score and label are text-editable.

---

## summarySmallCards

Paired stat tiles for the session summary screen. Fixed layout: left tile shows recalled count (green), right tile shows need-review count (red).

### Layer anatomy

```
summarySmallCards     horizontal, gap: Space/300
  Container (left)    fill: background/surface, radius: Radius/300
                      padding: Space/400 horizontal, Space/300 vertical, gap: Space/100
    Score text        numeral, Greed/Headline XS Bold (font/size/md)
                      fill: feedback/success/surface/bold
    Label             "Recalled", Greed/Caption M Bold (font/size/xs)
                      fill: feedback/success/surface/bold
  Container (right)   fill: background/surface, radius: Radius/300
    Score text        numeral, Greed/Headline XS Bold (font/size/md)
                      fill: feedback/error/bold
    Label             "Need Review", Greed/Caption M Bold (font/size/xs)
                      fill: feedback/error/bold
```

TOKEN NOTE: original tile backgrounds were raw alpha fills (12% green, 20% red) with no semantic token. Bound to `background/surface` as the nearest available token. Tiles appear dark rather than tinted. Request `feedback/success/surface/wash` and `feedback/error/surface/wash` tokens for the intended tinted look.

### When to reach for it

Summary screen, as the primary recalled/review split. Single variant.

### What not to do

Do not separate the two tiles — they are a single component designed as a pair. Do not add a third tile — use `statTile` for additional standalone stats.

---

## strongCard

List of topics the student recalled well. Shown on the summary screen after a session.

### Layer anatomy

```
strongCard            fill: background/surface, radius: Radius/400
                      padding: Space/400 horizontal, Space/300 vertical, gap: Space/150
  Container (×3)      horizontal, gap: Space/300, padding: Space/400 inline, Space/0 block
                      height comes from the Checkbox — 48, or 49 with the divider
                      divider between rows: border/default 1px top stroke
    Checkbox          Selection=Selected, State=Default — a 48×48 tap box
      Box             Icon/300, radius Radius/Full, 2px stroke
                      fill + stroke: highlight/indicator
        Icon Slot     Icon/200, checkmark SVG, fill: text/primary
    Label             topic text, Greed/Body S Regular (font/size/sm), fill: text/secondary
```

**The marker is a `Checkbox` instance, not a bare icon on a wash.** It used to be a 20×20 circle bound to `background/surface` with a green tick, and the note here asked for `feedback/success/surface/wash` to make that circle visible. The file has since replaced the whole marker: there is no wash, no green, and no invisible circle, so that request is withdrawn. SVG vector paths still cannot be variable-bound — the checkmark's stroke weight is a raw path value.

TOKEN NOTE: `highlight/indicator` has no counterpart of that name in `tokens.json`. `highlight/border` carries the exact value and is what the build takes. See Gaps.

**In code the marker is static, not a `Checkbox`.** `components/Checkbox` is a `<button role="checkbox">`; nothing on the summary toggles, so instancing it would put six operable-but-inert checkboxes on a results screen and announce six checkboxes to a screen reader. `listItem` draws the disc from the same tokens instead. Figma instances the component because a picture of a checked box is the fastest way to draw one.

### When to reach for it

Summary screen, immediately before `reviewTopicCard`.

### What not to do

Do not add more than three rows — the component has no scroll or overflow behaviour. Do not use this for topics that need review — use `reviewTopicCard` for those.

---

## reviewTopicCard

List of topics the student needs to revisit. Identical structure to `strongCard`; the marker's `Checkbox` takes `State=Error` instead of `State=Default`.

### Layer anatomy

```
reviewTopicCard       fill: background/surface, radius: Radius/400
                      padding: Space/400 horizontal, Space/300 vertical, gap: Space/150
  Container (×3)      horizontal, gap: Space/300, padding: Space/400 inline, Space/0 block
                      divider: border/default 1px top stroke
    Checkbox          Selection=Selected, State=Error — a 48×48 tap box
      Box             Icon/300, radius Radius/Full, 2px stroke
                      fill: feedback/errorSurface, stroke: feedback/error
        Icon Slot     Icon/200, checkmark SVG, fill: feedback/error
    Label             topic text, Greed/Body S Regular (font/size/sm), fill: text/secondary
```

**There is no X.** Both cards draw the same tick; only the disc around it changes. A review row is a *checked* item marked wrong — the student answered it, and it did not land — which is a different claim from an empty or crossed-out one. The earlier "red X icon instead of a green checkmark" is no longer in the file, and neither is the green.

TOKEN NOTE: `feedback/errorSurface` (`#3a1417`) has no token — red/950 is darker, red/900 lighter. The build takes `feedback/error/subtle` (red/900), the nearer step and already the fill behind a wrong result. The stroke and the tick are `feedback/error` exactly. The older request for `feedback/error/surface/wash` is withdrawn: the wash it was for no longer exists in the design.

### When to reach for it

Summary screen, immediately after `strongCard`. If the student recalled everything, omit this component rather than showing an empty card.

### What not to do

Do not use for topics the student recalled well — use `strongCard` for those.

---

## transcriptSection

"WHAT YOU SAID" section label above a tinted transcript box. Shows the STT transcript of the student's last answer on the result screen.

### Layer anatomy

```
transcriptSection     vertical, gap: Space/200
  Section Label       "WHAT YOU SAID", Greed/Caption S Bold (font/size/2xs, font/lineHeight/2xs)
                      fill: text/disabled, tracking: font/tracking/loose
  Transcript box      fill: background/elevated, radius: Radius/200, clips content
    Transcript Text   Greed/Caption M Regular (font/size/xs, font/lineHeight/xs)
                      fill: text/secondary, padding: Space/300 left, Space/200 top
```

TOKEN NOTE: `background/elevated` is the nearest available token to the original rgba(255,255,255,0.05) fill. The token description explicitly covers this use case.

### When to reach for it

Result screen, outside and above `recallResponseCard`, to show the full transcript when the card itself truncates it.

### What not to do

Do not use during the processing state — it requires a verdict to have content. Do not confuse with the Transcript layer inside `recallResponseCard` — that is a different layer, not this component.

---

## statTile

A single stat tile: large number above a subdued label. Used on the summary screen for aggregate session stats (e.g. "24 Concepts").

### Layer anatomy

```
statTile              fill: background/surface, radius: Radius/300
                      padding: Space/300 vertical, gap: Space/050, center-aligned
  Number              numeral, Greed/Body S Bold (font/size/sm, font/lineHeight/sm)
                      fill: text/primary
  Label               category text, Greed/Body S Regular (font/size/sm, font/lineHeight/sm)
                      fill: text/tertiary
```

### When to reach for it

Summary screen, in a horizontal row alongside other `statTile` instances or `summarySmallCards`. Single variant, no component properties. Number and label are text-editable.

### What not to do

Do not use `statTile` for the recalled/need-review pair — use `summarySmallCards` for those.

---

## folderCard

Study folder entry card. Colour-band header above a metadata row with title, description, chevron, and a concept count badge.

### Variant axis: accent

**accent=Blue** — standard folder. Header and tab fill: `accent/blue/bold`.

**accent=Gold** — PRO folder. Header and tab fill: `pro/bold`. Use only for PRO-gated content.

### Layer anatomy

```
folderCard            390px outer wrapper, padding: Space/400
  folder1             card frame, fill: background/surface, radius: Radius/400
                      stroke: border/default, weight: Stroke/Border
    Header band       fill: accent/blue/bold (Blue) or pro/bold (Gold)
    Metadata row      horizontal, fill: background/surface, stroke: border/default top
                      padding: Space/400, gap: Space/300
      Text column     vertical, gap: Space/100
        Title         Greed/Headline XS Bold (font/size/md, font/lineHeight/sm)
                      fill: text/primary
        Description   Greed/Body S Regular (font/size/sm, font/lineHeight/sm)
                      fill: text/secondary
      Chevron btn     32×32, fill: background/floating, radius: Radius/Full
    Progress strip    gradient: accent colour → transparent, 3px tall
    Date label        absolute, Greed/Body S Bold, fill: interactive/label/secondary
  Tab above card      absolute, 56×10, radius: Radius/200 top corners, fill: accent colour
  Concept badge       absolute, fill: background/scrim, blur 8px, radius: Radius/Full
                      padding: Space/300 left/right, Space/100 top/bottom, gap: Space/100
    Count label       Greed/Caption M Regular (font/size/xs), fill: text/tertiary
```

TOKEN NOTE: `folder1` fill bound to `background/surface` as nearest token. Original `#1e1e2e` sits between `background/page` and `background/surface` with no matching token. Request `background/card`.

### What not to do

Do not use accent=Gold for standard study folders — Gold signals PRO content.

---

## feedback Button

Renamed from `errorButton` in Figma. Two-option action row inside `recallResponseCard`. Allows the student to flag a transcription error or confirm their answer was heard correctly.

### Variant axis: verdict

**verdict=Misheard** — "App misheard me". Fill: `feedback/error/subtle`. Stroke: `feedback/error/bold`, weight: `Stroke/Border`. Label: `feedback/error/bold`. Triggers a re-attempt without counting against the hint ladder.

**verdict=Confirmed** — "That's what I said". Fill: `background/surface`. Stroke: `border/default`, weight: `Stroke/Border`. Label: `text/secondary`. Confirms the transcript was correct; answer is evaluated as-is.

### Layer anatomy

```
feedback Button       pill, radius: Radius/Full, weight: Stroke/Border
                      padding: Space/300 horizontal, Space/200 vertical
                      FILL width — equal halves of card interior in auto-layout
  Label               Greed/Caption S Bold (font/size/2xs, font/lineHeight/2xs)
                      tracking: font/tracking/loose
                      fill: feedback/error/bold (Misheard) or text/secondary (Confirmed)
```

### When to reach for it

Only inside `recallResponseCard` Action Buttons row. Never freestanding.

### What not to do

Do not place on a screen outside `recallResponseCard` — it has no standalone meaning. Do not equalise the two button labels by making them the same style; the contrast between Misheard (error fill) and Confirmed (surface fill) is intentional.

---

## Check

32×32 checkmark icon component. Used in `voiceFab` state=Sent as the center icon confirming the answer was dispatched.

### Layer anatomy

```
Check         32×32 frame, fill: text/primary
  [SVG]       checkmark vector path (fill not variable-bindable — raw path)
```

TOKEN NOTE: outer frame fill is bound to `text/primary` as the nearest white token. SVG vector paths inside cannot be variable-bound through the plugin API.

### When to reach for it

Exclusively as the `icon` instance swap on `voiceFab` state=Sent. Use at its native 32×32 size — `voiceFab` positions it inside Center Icon Container.

### What not to do

Do not use as a standalone action button — it has no press state. Do not resize — it is sized for the `voiceFab` button well.

---

## buttonGroup

Two controls composed together. Vertical stacks two equal-weight buttons. Horizontal pairs a compact `buttonIcon` with a full labelled `button` — different visual weights by design, with the icon as the subordinate action.

### Variant axes

**variant** — `Horizontal` | `Vertical`. **size** — `M` | `L`, and it must match the `size` set on the buttons inside.

### Layer anatomy

```
buttonGroup (Vertical)   vertical, gap: 0 — the two 48-high rows sit flush
  button                 variant=Primary,   fills the group's width
  button                 variant=Secondary, fills the group's width

buttonGroup (Horizontal) horizontal, gap: Space/200
  buttonIcon             compact, hugs
  button                 fills the rest of the row
```

TOKEN NOTE: the group binds **nothing**. No colour, no radius, no type — the buttons inside keep every token they already own. The stylesheet is layout only, which is why `size` exists purely to match what is set on the children.

### When to reach for it

Vertical for equal choices ("Keep learning" / "Leave anyway", "Type Instead" / "Enable Microphone"). Horizontal for a primary CTA alongside a compact secondary (close icon + "Continue").

### What not to do

Do not treat the horizontal pair as equals — if both need equal weight, use vertical. Do not set widths on the buttons themselves; the group owns the width and the button owns everything else.

**Gap**: Figma's Horizontal variant pairs a `buttonIcon`, which this library does not have. Horizontal currently lays out whatever two children it is given — the right shape, without the component that belongs in the first slot.

---

## typeAnswerComponent

Keyboard icon + "Type your answer" label. The text-fallback escape for students who cannot speak right now.

### Layer anatomy

```
typeAnswerComponent   358px wide, horizontal, gap: Space/200, center-aligned
  Keyboard icon       16×16 SVG
  Label               "Type your answer", Greed/Caption M Bold (font/size/xs, font/lineHeight/xs)
                      fill: text/disabled, tracking: font/tracking/loose
```

TOKEN NOTE: keyboard icon outer fill bound to `text/primary` as nearest white token. SVG path fills inside cannot be variable-bound.

### When to reach for it

Always visible below `voiceFab` on every recall screen. Required by the brief's accessibility constraint — the non-voice path for students who cannot or prefer not to speak.

### What not to do

Do not hide this component conditionally. Do not move it inside `voiceFab` — it sits at screen level, not inside the FAB component.

---

## Recall state screens

Screens from `reference/Voice_UX.md`'s "States to design" list, built in React. Three now have a Figma screen to follow — `answer sent` `15707:18257`, `mic permission` `15794:19616` and `text fallback` `15794:20147` — and the rest are marked **specified in code first; not yet in Figma**, so the file can be drawn from the build rather than the build guessed from the file. All are compositions of existing components: the screen CSS carries layout, and the few type and colour bindings it does own are noted below.

All wrap the `Screen` scaffold, which already applies the safe-area insets. They live in `components/screens/RecallScreens/`; stories under `Screens/Recall states`.

### Two Example Screens patterns that do NOT apply here

Both were proposed as improvements to the recall screens, both were built, and both were taken back out. Recorded so they are not proposed a third time.

**The bottom Scrim.** Every screen in ✨ Example Screens pins a 390 × 151 gradient (transparent → `background/page`, `ABSOLUTE`, `vertical: MAX`) to the bottom of `middleContent`, so content dissolves above a pinned CTA. **Zero of the eleven recall screens carry one**, and no screenshot in `reference/` shows one — the list on `study-plan-map.png` holds a constant `#22242F` all the way to y740, where a fade would have dimmed it. It is a chat-and-list-surface pattern. On the recall turn it would have faded the orb, which sits in exactly that band.

**The mascot shadow.** `Idle` and `answer sent` both carry `Ellipse 75` — 134 × 24 on `background/elevated` — and the Example Screens draw it visibly under a free-standing mascot. In the recall screens it is placed at y262–286 beneath a bubble that starts at y172, so it is **fully covered and never renders**; no screenshot shows one either. It is a leftover from a layout where the mascot did not overlap the bubble. Reproducing it adds an invisible element.

The rule both cases point at: **Example Screens is where the visual language lives, but a pattern only transfers to the recall loop if the recall screens or the screenshots show it too.**

### Recall surfaces are radius 24

Figma draws the question bubble at `Radius/200` (8), the verdict card at `Radius/400` (16) and the student's answer bubble at 24 — three radii for three surfaces. The app draws **all three at 24**: `recall-processing`, `recall-partial` and `recall-correct` each show a 23px corner inset, measured identically. One consistent radius in the app against three in the file reads as drift, so `radius/input` (24) is used throughout.

### The recall gutter is 20

The scaffold's slots pad **16**, and every recall surface in the app is drawn at **20** with a 350 column — measured on `recall-processing`, `recall-partial`, `recall-correct` and `recall-result`, which agree to the pixel across 129–220 rows each. `space/gutter` carries it: a role rather than a scale step, because the layout scale runs 16 then 24 with nothing between.

The recall screens and `recallResponseCard` both cancel the slot's gutter and apply `space/gutter` in its place, so the 20 is stated rather than arrived at as "the slot's 16 plus 4".

### Which source wins

`reference/*.png` — the shipped app — is the authority on **specs**: padding, spacing, size, type scale, colour. The Figma screens are the authority on **decisions**: what is on a screen, in what order, and which component does the job.

Where they disagree, the screenshots win on measurements and Figma wins on composition. Two conflicts this has already settled:

- The question bubble fill is `background/surface`. The screenshots sample `#22242F` exactly; the raw `#1C1C2A` in `Idle` and `answer sent` is the outlier.
- Measurements taken once become system rules rather than per-screen readings. The mascot's overlap with the panel below it is **37.5% of the mascot's height** — measured off `Idle` and `answer sent` at 41px on a 109 mascot — and applies to every screen that stacks the two, not only the ones already drawn.
- **That overlap is measured to the visible panel, not the wrapper box.** `recallResponseCard` pads 12 above its own surface, so tucking to its box put the mascot at 27.5% on the misheard screen while the bubble screens sat at 37.5%. Anything with its own block padding has to be pulled up by that padding first.

#### When a pattern has no screenshot

The rule above only decides a conflict. It says nothing about the commoner case: Figma draws something the shipped app has never drawn. Silently treating those values as measured is how a Figma-only decision gets laundered into a spec.

**So before binding a value off a Figma screen, check the screenshots for the pattern — not the screen.** Either one is true, and each says exactly what to do:

1. **The pattern exists in the app.** The screenshots set the spec, even when they show it in a different context. The element is re-bound to what the app draws, and Figma keeps only the composition. Where the measured value falls between two scale steps, take the nearest step and say so in the rule — a value with no token is never invented to preserve a measurement.
2. **The pattern exists nowhere in the app.** Figma is the sole source, and that is stated in the comment at the binding rather than left to look like a measurement. Values that sit off the scale stay flagged; they are a design decision awaiting a token, not a spec.

Two live cases, both on the text fallback:

- **The student's avatar — case 1.** Figma drew a coral disc at `control/L` (56). A coral scan across all fifteen screenshots finds coral in exactly three places: the streak chip on `chat-learning` and `existing-user-entry`, the error red on `recall-summary`, and the study-plan step icons. **No coral avatar exists in the app.** What does exist is one profile disc in the bottom nav of `detailed-lesson-by-chat.png`: 25×25, `#22242F` = `background/surface`, near-white initial. The build takes that treatment — `background/surface` and `text/primary` — at `control/S` (32), the nearest step to 25 and the only one that still reads as a small quiet disc. Figma keeps the placement; the screenshots took the colour and the weight.
- **The inline mascot — case 2.** Both chat screenshots put Knowie centred at ~91–95px as the hero of an empty state, standalone. The text fallback uses Knowie inline, marking one speaker's turn in a running conversation. **The role is different, so the measurement does not transfer** — a hero mascot is not a chat mascot, and the screenshots contain no chat mascot to measure. Figma is the sole source here. Its 44 sits below every illustration step (XL 64, 2XL 120, 3XL 200, 4XL 320), so the build holds `XL` and the 44 is logged as a gap rather than hard-coded.

### Shared parts

```
Recall header          horizontal, gap: Space/300, padding: Space/200 block, Space/400 inline
  Exit                 "✕", Greed/Headline S, fill: text/primary
  progressIndicator    showText=false — the fill carries progress, no number.
                       The count goes into the bar's accessible name instead.
  XP                   Bolt (Phosphor Lightning, Fill) + the figure, starting at 0,
                       both on accent/blue/bold, figure at Greed/Headline XS Bold,
                       gap Space/100, named as one unit with role="img"

mascotSlot             tucked BEHIND the question bubble, so only the head shows
Question bubble        fill: background/surface, radius: Radius/200, padding: Space/600
  Intro                Greed/Body M Regular, fill: text/primary   (optional)
  Question             Greed/Body M Regular, fill: text/primary, Space/600 top inset
                       the key term is bold IN PLACE — Greed/Body M Bold weight

Skip                   bare text control, right-aligned under the bubble
                       Greed/Caption M Bold, fill: text/secondary
```

**Knowie tucks behind the bubble.** `reference/recall-processing.png` and `reference/recall-partial.png` both show only the mascot's head above the bubble's top edge, and Figma's `Idle` measures the same: the `mascotSlot` starts at y=0 and the bubble at y=115 of a 181 slot, a 66px overlap. The build pulls the bubble up by two `layout/2XL` steps (64), the nearest the scale gets. Do not lay the two out as separate blocks — the overlap is what makes Knowie read as *asking* rather than *illustrating*.

**The key term is bold in place**, not pulled out into a heading — `reference/recall-processing.png` sets "…constitutes a **primary source** and provide an example of one." The prompt props are `ReactNode` for exactly this.

TOKEN NOTES. `answer sent` and `Idle` fill the bubble with a raw `#1C1C2A` and no variable; `text fallback` binds `background/surface` on the same card, which is what all three use here. The header's `✕` is drawn at 22/22 with no matching step — `headline/S` is the nearest bound one. Figma sets the progress counter at 14/20 and the XP figure at 16/24, neither of which exists in the scale.

### The loop's screens, and three names for two things

Built against Figma: `student talking` / `student not talking` (listening), `cancel option` (the take), `thinking progress` (processing), and the four frames of `hint ladder` (result and reveal).

**Three names had to be reconciled rather than left to drift:**

| Thing | Figma | `session.Destination` / route | React component |
|---|---|---|---|
| The student speaking | "Listening" | `recording` | `ListeningScreen` |
| The answer being read back | `reveal` | `reveal` | `RevealScreen` |
| The take, pre-submit | "cancel option" | `answer-sent` | `AnswerSentScreen` |

The route names were kept because `lib/recall/session.tsx` already declared them and churning a state machine for a label buys nothing. The **caption** follows Figma — the orb on the listening screen says "Listening", not `voiceFab`'s own "Tap to send" default. SPEC.md row 14 used to say "Comparison at `/recall/comparison`", a third name for the reveal; it now says `reveal` like the other two.

### What the result screen does NOT inherit from a recall turn

Two rules that hold everywhere else are deliberately off here, because none of the four `hint ladder` frames has them:

- **No mascot, so no 37.5% tuck.** Idle asks the question with Knowie behind it; the result screen *restates* the question in a plain 64-high bar so the student can answer without scrolling back. Knowie reporting is not Knowie asking.
- **No question bubble.** Same reason. `.knw-recall__askbar` is the flat restatement, at `body/S` on `background/surface` at `radius/input`.

The listening screen keeps the tuck — the waveform is the panel Knowie leans over — but drops the question bubble, which neither frame draws.

### The hint ladder escalates in shape, not only in words

Rungs 1 and 2 put the hint **inside** `recallResponseCard`, as a sibling of its body — which is where Figma draws `hint1`, and why the card's gap tightens from `Space/800` to `Space/200` when one is present. Rung 3 **promotes** it into its own panel below the card, a step larger and on a warm surface; Figma's layer name is "escalating warmth".

**A pass carries no hint**, enforced in `ResultScreen` rather than left to the caller: there is no next rung to hint at. A default prop beats an explicit `undefined`, so the rule has to live with the invariant, not the wiring.

### Answer sent — and where Voice_UX state 5 lives

Follows `answer sent`, node `15707:18257`.

**State 5 is not a screen, it is a control.** "Cancel & re-record before send" (Must, brief F2) is the trash beside the orb. An earlier build invented a screen to house it; the control belongs on the screen that already draws it, and `showDiscard` on `voiceFab` is what discharges Voice_UX principle 2.

```
Screen
  topNavigation       Recall header
  middleContent
    mascotSlot        size=2XL, pose "excited", in a Space/300 block
    Question bubble   intro + question
    Skip
    voiceFab          state=Sent, showDiscard
    typeAnswerComponent
```

The discard control renders as `answer sent` draws it (node `15793:19582`): a 40×40 pill, fill `interactive/secondary`, radius `Radius/Full`, its right edge `Space/400` clear of the orb's box and vertically centred on it — **to the LEFT of the orb**. It is absolutely positioned so adding it does not shift the orb off the screen's centre line.

**Request in Figma**: a `showDiscard` boolean on the `voiceFab` set, visible on `state=Sent` only — that is where `answer sent` draws it, and the moment a take exists to throw away. During Recording nothing has been captured yet to discard.

### Screen 6 — text fallback turn

Follows `text fallback`. The turn is a conversation, not a form.

```
Screen
  topNavigation       Recall header
  middleContent       vertical, gap: Space/400, BOTTOM-ALIGNED
    Ask               NO surface — plain text + the mascot beneath it
      Text            Greed/Body M Regular, fill: text/primary
      mascotSlot      size=XL, pose "standby"
    Skip              right-aligned
    Answer            horizontal, gap: Space/200, right-aligned
      Text            fill: background/surface, radius: Radius/600 (radius/input),
                      padding: Space/300, Greed/Body M Regular, fill: text/primary
      Avatar          the student's initial, Greed/Body M Bold,
                      fill: accent/coral/subtle on accent/coral/label/subtle, Radius/Full
  bottomContent
    chatInput         status=Inactive
    Keyboard reserve  342 — see below
```

**Only the student's turn gets a surface.** Figma's question container is 358 × 140 at radius 4 with **no fill**: Knowie's turn is plain text with the mascot under it. Giving one side of the conversation a surface is what makes it read as a conversation — an earlier build put the question in a filled bubble with a tail, and Knowie's turn then looked like the student's.

**The keyboard is up, by definition, and it is drawn.** This is the typing turn, so the screen lays out against the height the keyboard leaves. Figma draws the frame **1018** tall for the same reason: 342 of it is the `Keyboard` instance.

This was previously an empty 342 reserve, on the reasoning that the real keyboard belongs to the operating system. That is true of a shipped app and false of a prototype — in a browser no keyboard ever rises, so the one screen whose premise is typing was the only screen showing no way to type, and the blank read as a bug rather than as restraint. The asset is the `Keyboard` **component**, `3086:16935`, exported at 3× to `public/images/ios-keyboard.png` — not the instance inside the `text fallback` frame, which is resized to 358. Same rule as the alert icon: *a frame shows one instance, the component page shows the thing itself.*

**Full bleed, at 390 × 342.** `choosing chip` (`16012:23063`) settles it: its `bottomContent` holds a `key board` frame whose `Keyboard` instance sits at **x=0, 390 × 342** — the component's own size, edge to edge. The 16 inset in the `text fallback` frame is its container's, not the keyboard's, and honouring it would mean either distorting the export by 8% or losing 28px off the reserve. The compose screen draws the same asset the same way.

**Tailwind's preflight will clamp any full-bleed image.** `img { max-width: 100% }` silently caps the width while the negative margin still applies, so the element comes out shifted rather than wide. `max-width: none` is required alongside the bleed.

**The conversation is bottom-aligned**, the way a chat is: turns stack upward from just above the composer, so empty space sits above the first message rather than below the last.

**Bottom-aligned with an auto margin, never `justify-content: flex-end`.** The pair `flex-end` + `min-height: 100%` hid the question below roughly 740px of viewport: `min-height` overrode the flex item's automatic minimum size, so it shrank while its children did not, and `flex-end` pushed the overflow off the **top**. Overflow in the start direction is not counted in `scrollHeight`, so the slot rendered no scrollbar and the question was unreachable, not merely clipped. An auto margin distributes only free space, so it collapses to zero when there is none and the turns fall back to normal top-down flow — the container then scrolls, question first.

`npm run consistency` reports that auto margin as an off-scale space on `.knw-recall__ask` (58 at a 844 viewport). It is a false positive and expected: the number is whatever free height happens to be left, so it changes with the viewport and is not a value anyone chose. Same class as the calc-derived `-69` on `.knw-recall__mascot`. Do not replace it with a token.

`chatInput` at rest carries the mic as its trailing control, which is the one-tap way back to voice — this screen needs no separate "speak instead".

TOKEN NOTES: Figma resizes the `mascotSlot` instance to 44, below every step of the set (XL 64, 2XL 120, 3XL 200, 4XL 320); `XL` is used. The 342 keyboard height is device chrome rather than a design value — the same call `.storybook/withKeyboardInset.tsx` makes for the same number — so it is a literal, not a token.

### Screen 7 — mic permission primer

**It is a two-beat screen.** The `mic permission` section holds four nodes and the screen frame is only the first: the screen primes, and the **sheet** asks.

```
Screen                showTopNavSlot=false
  middleContent
    mascotSlot        size=3XL, pose "standby", centred in the space above
    Headline          "You're ready", Greed/Headline L, fill: text/primary, centred
  bottomContent
    button            variant=Primary, size=M, "Let's Go"     -> raises the sheet

bottomSheet           height=M, node 15794:19867, 390 x 476
  app bar      72      the HANDLE ALONE. No x-close.
  middleSection 268
    mascotSlot  120    size=2XL, pose "standby"
                 24    gap
    copy block  116    320 wide, centred
      title      72    "Knowie would like to access your mic", headline/L 33/36
                  4    gap
      caption    40    "By giving access to the microphone you can practice
                       answers and strengthen your memory", body/S 15/20,
                       fill: text/secondary
  bottomSection 136    padding 16
    buttonGroup 104    358 wide, gap 8
      button     48    variant=Primary,   size=M, "Allow"
      button     48    variant=Secondary, size=M, "Type instead"
```

The section's fourth node is a mock of the **iOS native dialog** that fires after Allow — reference, not a screen to build.

Voice_UX principle 3 is the whole design: you get one native prompt, so never fire it cold. Explain the value first, and let the student opt out just as easily. The opt-out is on the **sheet**, beside Allow and at the same size — reading only the screen frame makes the design look like a one-way door into the OS dialog, and it is not.

**Four things the first build of the sheet got wrong**, each worth keeping because each was invisible until the frame was measured against it:

1. **The caption was passed as the sheet's `descriptor`**, which renders in the APP BAR. So the explanation sat *above* the mascot, in `caption/M`, before the question it explains — the sheet opened on its own small print. Figma stacks title over caption in one block under the mascot, and `textBlock` has a `caption` prop for exactly this.
2. **The app bar drew a ✕.** Figma's is the handle alone, and `BottomSheet`'s own `Type=Default` story says so. A dismissal is a third answer to a two-answer question, and the opt-out is already on the sheet.
3. **The title was `textBlock variant="L"` — 44/44.** Figma sets 33/36. No variant maps: L is `headline/XL` (44), M drops to `body/M-bold` (18). Bound on the screen, the same way and for the same reason as the priming beat's own headline. **A `textBlock` variant at `headline/L` is now wanted by two screens.**
4. **The buttons stacked flush.** Figma separates them by 8 — and the file is not contradicting its own component, because what it draws here is a **frame** named `buttonGroup`, not an instance of the set. Applied on the screen, so the twelve other uses keep the composition the set draws.

**The app bar was 76 against Figma's 72 — fixed in the component, and it moved every sheet.** The bar row is right: `.knw-sheet__action` reserves `size/tapTarget/min` (48) and the padding is 12 either side, which is 72. What was wrong is that the grabber was stacked ON TOP of that as a flex row of its own, adding its 4. Figma's app bar is 72 *including* the grabber — a 32 × 4 pill at y6, measured off the sheet, with the body starting at 72. The handle is now taken out of flow (`position: absolute`, `top: space/inset/xxs`, which is 6 exactly), so the bar keeps its height and the pill lands where the file draws it.

One change, and the exit sheet and the permission-denied settings sheet each gained back the 4 they were sitting low by. **Where a shared component is 4px out, check whether the error is in the row or in what is stacked around it** — the temptation was to shave the tap target, which would have been wrong twice over.

ONE DEPARTURE, for want of a token: the **screen frame** carries a 20px LAYER_BLUR over the mascot block — see the `effect/blur-glow` entry in Gaps, which this screen closed.

**The measure is 326, not Figma's 320.** The sheet's body already pads 16, leaving 358; another `space/layout/l` each side gives 326, and every value stays on the scale where Figma's 35 gutter is on nothing. The width is only buying line breaks, and both lines have tens of pixels of slack before the next word could join them — so 326 breaks exactly where 320 does. Measured: title 72 tall (two lines), caption 40 (two lines), both matching the frame to the pixel.

### Screen 8 — permission denied

Follows `mic permission denied`, node `15798:21003`.

```
Screen
  middleContent       vertical, gap: Space/800, centred
    Hero              vertical, gap: Space/800
      Orb             vertical, gap: Space/400
        voiceFab      state=Deny, showLabel=false
        Title         "Mic Access Denied", Greed/Headline S, fill: interactive/primary
      Body            Greed/Body M Regular, fill: text/secondary, centred
    Cards             vertical, gap: Space/800
      Card            fill: background/surface, radius: Radius/400, padding: Space/400,
                      gap: Space/300
        Title         Greed/Headline XS Bold, fill: text/primary
        Body          Greed/Body S Regular, fill: text/secondary
      Card            "To Re-enable Mic Access" + the Settings path
        chips         size=XS, color=Primary, active=True, both icon slots off
                      Settings › Privacy and Security › Microphone › Knowunity
  bottomContent
    buttonGroup       variant=Vertical, size=M
      button          variant=Primary,   size=M, "Type Instead"
      button          variant=Secondary, size=M, "Enable Microphone"
```

The orb is `voiceFab state=Deny` — a state added to the set after this screen was first built. It keeps Idle's ring-and-mic structure and recolours it destructive, so the shape the student already knows reads as blocked rather than absent. The screen owes them two things and gives each its own card: what they lose without the mic, and the exact path back to it.

The Settings trail is a **path, not four actions**, which is why it is chips in an ordered list rather than buttons.

### When to reach for these

When building the recall flow. Screens 5, 6, 7 and 8 are the states the flow cannot ship without — the primer gates the microphone, denial is the dead end, the text turn is the accessibility floor, and re-record is what makes a first take safe to attempt.

### What not to do

Do not treat screen 8's anatomy as agreed design — its token bindings come from the components and are firm, but the layout is a proposal until it is drawn. Do not drop the text fallback or skip from a recall turn to save vertical space. Do not move skip down among the bottom escapes: `Idle` and `text fallback` both attach it to the question, on the right, which is what makes it read as "skip *this* term" rather than "leave the session". Do not stack `transcriptSection` above `recallResponseCard` on the misheard screen: the card carries its own transcript layer, so the two together print the same string twice.

---

## Component authoring conventions

These rules govern every component on the Knowunity Components page. Anything adding a new component must follow them so new components are native next to existing ones.

### Component set naming

Component sets use camelCase, no spaces: `recallResponseCard`, `voiceFab`, `waveformCard`, `chipFeedback`, `folderCard`. The name describes the thing, not the screen it appears on. `voiceInputButton` is correct. `explainOutLoudMicButton` is not.

`feedback Button` breaks this rule — it has a space and a capital B. It was renamed from `errorButton`, which followed the convention. Worth renaming back, or relaxing the rule.

### Variant axis naming

Variant axes use camelCase. Axis values use sentence case. The full variant name in Figma concatenates all axes and values with commas: `State=Default, showMissingSection=True`.

A dedicated variant axis is only justified when different values produce structural differences — layers that appear, disappear, or change role. When the difference is color or text alone, use a property instead. The `State` axis is always the primary axis. Secondary axes (like `showMissingSection`) encode structural toggles that would otherwise require additional State values.

Axis names describe what they control, not what they are called internally: `state` not `property1`, `verdict` not `type`, `accent` not `color`, `size` not `variant`.

### Component properties

Text properties use camelCase names ending in the layer they target: `badgeLabel`, `transcriptText`, `nextActionLabel`. This makes the binding target unambiguous.

Boolean properties are named after what they show, not what they hide: `showMissingSection`, `showLabel`.

Instance swap properties name the layer they replace: `icon`.

### Layer naming

Every layer inside a component has a name that describes its role, not its appearance or position.

Correct: `Badge`, `Badge Label`, `Transcript`, `Transcript Text`, `Missing Section`, `Missing List`, `Missing Item`, `Bullet`, `Item Text`, `Left Accent Strip`, `Divider`, `Next Action Label`, `Helper Label`, `Knowie Answer`, `Answer Text`, `Percentage Circle`, `Ring`, `Percentage Text`, `Response Body`, `Card`, `Header Row`, `Action Buttons`, `Primary Action`, `Secondary Action`, `Waveform`, `Bar 01`…`Bar 24`, `Button Group`, `Ring`, `Button`, `Center Icon Container`, `Label`.

Wrong: `Frame 47`, `Rectangle`, `green strip`, `bottom text`, `Container`.

Compound layer names use title case with spaces: `Missing Section`, `Left Accent Strip`, `Center Icon Container`. Single-word layers use title case: `Badge`, `Divider`, `Ring`, `Label`.

Layers that only appear in one variant are marked with square brackets in anatomy diagrams: `[Left Accent Strip]`, `[Helper Label]`. In Figma, toggle their visibility rather than deleting them from other variants — this keeps the layer tree consistent and avoids broken instance overrides.

### Auto-layout rules

Every frame inside a component uses auto-layout. No free-floating frames except documented absolute elements (Left Accent Strip, Percentage Circle, folderCard tab and badge), which are explicitly noted as absolute in their anatomy.

Vertical frames hug height (`primaryAxisSizingMode = AUTO`) and hold their width via a fixed counter axis (`counterAxisSizingMode = FIXED`). Set sizing modes after `resize()`, not before — the Figma plugin API overrides them on resize.

Text nodes that wrap get their width set to a concrete pixel value before `textAutoResize = HEIGHT` is applied.

### Token binding

Every color fill, stroke color, spacing value, radius, stroke weight, and all five typography properties (`fontSize`, `lineHeight`, `letterSpacing`, `fontFamily`, `fontStyle`) must be bound to a variable from `tokens/tokens.json`. No hardcoded values. If the right token does not exist, stop and request it — document the gap in the component description and in the Gaps section below.

SVG vector paths inside icon frames cannot be variable-bound through the plugin API. This is a known API limitation; document it in the component description.

Typography binds `fontFamily` to `font/family/default` and `fontStyle` to `font/weight/semibold` or `font/weight/regular`. The font family for all components is Greed Standard-TRIAL, resolved through the variable.

Stroke weights bind to `Stroke/Border` (1px) or `Stroke/Heavy Border` (2px).

### Feedback token routing

The card container always uses `background/surface`. Never a `feedback.*` token on the card fill.

`feedback.*.surface.bold` → badge fills, bullet dots, accent strips, ring strokes.
`feedback.*.surface.label.bold` → text on those bold surfaces.
`feedback.*.surface.subtle` → zone wash fills behind grouped content.
`feedback.*.bold` (without `surface`) → used for `feedback/error/bold` on Missing Label text and `feedback Button` Primary Action stroke/label.

### Writing a Figma description

Every component set and every variant must have a description. Structure:

```
One-line summary of what it is.

VARIANT AXIS (for component sets with variants)
  axisName — one of: Value1 | Value2 | Value3

PROPERTIES (if any)
  propertyName (type) — what it does. Default: "value".

LAYER ANATOMY
  ComponentName    fill/stroke/layout tokens
    Child Layer    tokens
      ...

TOKEN NOTE (if any binding uses a nearest-available token rather than an exact match)

USE: when to reach for this component.

DONT
  Specific rule.
  Specific rule.
```

Variant descriptions are one to three sentences: what this state shows, the key token differences from other states, and any default property value specific to this state.

---

## Naming conventions

### Token naming

Tokens follow the pattern `{layer}/{group}/{role}/{modifier}`.

- **Layer**: `primitive` or `semantic`. Only the semantic layer is consumed by components.
- **Group**: the semantic category. Colour — `background`, `interactive`, `text`, `border`, `state`, `mascot`, `pro`, `accent`, `feedback`. Type — `typeScale`. Layout — `size`, `space`, `radius`.
- **Role**: the specific job — `bold`, `subtle`, `label`, `primary`, `secondary`.
- **Modifier**: a state or sub-role — `bold`, `subtle`, `hover`, `active`.

The role describes the job, never the appearance. `feedback/success/surface/bold` is correct. `feedback/success/green` is not. Appearance words belong in the primitive layer only.

### Layout tokens

Colour and type are not the only semantic groups. Spacing, sizing and radius have a semantic layer too, and components consume it rather than the raw scales.

| Use it for | Token |
| --- | --- |
| Height of a button, chip or input | `size/control/{S,M,L}` |
| Icon inside a control | `size/icon/{S,M,L}` |
| Minimum tap target a short control keeps as a transparent hit area | `size/tapTarget/min` |
| Horizontal padding inside a control | `space/inset/{S,M,L}` |
| Gap between an icon and its label | `space/gap/{S,M,L}` |
| Optical nudge that centres a label against its pill | `space/opticalShift/{S,M,L}` |
| Fully rounded ends — buttons, chips, badges | `radius/pill` |

`primitive/space`, `primitive/radius`, `primitive/icon` and `primitive/size` are the raw scales these alias into. A component never reads them directly. If a component needs a layout value that has no semantic role, that is a gap to surface, not a primitive to reach for.

### Reference syntax

Semantic tokens reference primitives using curly brace syntax in `tokens/tokens.json`: `{primitive.color.violet.500}`. In CSS this becomes a custom property chain: `var(--semantic-feedback-success-bold)`. Never write a value directly.

### Text content

Sentence case everywhere: labels, buttons, headings, error messages. Capitalise proper nouns only (Knowie, Knowunity, PRO). Never title-case a sentence.

---

## Never do this

**Never invent a value that is not in `tokens/tokens.json`.** If a spacing, color, radius, or size value is missing, stop and request it. The absence of a token is a gap to surface, not a gap to fill silently.

**Never use a CSS fallback value.** `var(--semantic-text-primary, #f4f2ff)` hides a broken reference. Fix the pipeline; do not paper over it.

**Never read a primitive directly in a component.** Components consume the semantic layer. `var(--primitive-color-violet-500)` bypasses semantic tokens and will not respond to theming.

**Never put an appearance word in a semantic name.** `text.violet` or `background.dark` are wrong regardless of what value they hold. The name must describe the role.

**Never use two Primary buttons on the same screen.** One Primary CTA per screen. A second action at the same hierarchy level must be Secondary.

**Never place Knowie (mascotSlot) inside a list item, card, or any repeated pattern.** Knowie is a screen-level emotional signal.

**Never override iconSlot's size variant per instance.** The parent component owns the icon size.

**Never use an accent token for a validation or feedback state.** `accent/green/bold` is for streaks and decorative stats. `feedback/success/surface/bold` is for correct answers. They resolve to the same primitive today but exist separately so they can diverge.

**Never use `feedback/destructive` tokens for validation errors.** `feedback/destructive` is for irreversible actions. `feedback/error` is for validation states.

**Never apply a text token to a non-text layer.** `text/*` tokens are scoped to text fill only.

**Never apply a border token as a fill.** `border/*` tokens are scoped to stroke color only.

---

## Gaps in the current system

Known absences. Do not fill them with invented values. Surface them as requests.

**Closed since this list was written.** `feedback/{success,error,warning,partial}/surface/subtle` (the 20% washes — Figma expresses these as `COMPOSE_COLOR` expressions, which is why they had no counterpart), `highlight/border`, `border/subtle`, `size/bar/*`, `size/icon/{XXS,XL}`, `size/fab/*`, `size/score/*`, `size/bullet`, `radius/{inner,strip}`, `space/layout/2XL`, `effect/{glow,blur-soft}`, `mascot/{glow,ring/*}`, and `font/lineHeight/lg2` — which turned out never to be needed, since `font/lineHeight/lg` is already 32 and Figma has since moved the `percentage` score to 28/32.

- **Tokens that exist only in code** — `primitive/size/control/{S,M,L}` and the whole `semantic/size`, `semantic/space` and `semantic/radius` layer were added while building `button` and have no Figma variables behind them. **Re-exporting from Figma would drop them.** Add them in Figma before the next export, or treat the token file as the source of truth and stop exporting over it. Figma has no semantic collection for non-colour values, so this needs a new collection, not just new variables.
- **`size/bar/{M,S,track}`** — `progressIndicator` is the only component whose heights Figma does not bind at all: 24, 20 and 16 are raw frame sizes and `thickness` is a variant label, not a variable. `size/control/XS` (24) and `size/control/XXS` (20) both describe chips, and nothing was 16 except `size/icon/S`. A bar-thickness role now exists in code. Request `Bar/M`, `Bar/S` and `Bar/Track` in Figma's Size collection.
- **`size/icon/{XXS,XL}`** — the Icon scale runs `Icon/100`–`Icon/400` in Figma, but the semantic layer only named the middle four. `primitive/icon/100` (8) and `primitive/icon/400` (32) already existed with no semantic alias; `iconSlot` needs all six. Both now exist in code. No Figma change needed — the variables are already there, only the semantic names were missing.
- **The exit control's tap target was the glyph's size** — `.knw-recall__exit` was `size/control/XS` (24) square, which is the WCAG 2.5.8 floor exactly, on the most accidentally-pressed control in the loop. Nothing caught it: axe checks target size only under WCAG 2.2 and the harness runs 2.1. Figma wraps the ✕ in a 44×44 `App Bar Button Icon`; the build takes `size/tapTarget/min` (48), the system's own answer, which clears Figma's 44 and — with the row's 8 bottom padding — reproduces `Top Nav Default`'s 56 height exactly. **The header's `padding-block` changed to `0 / layout-S` to match, so this moved every recall screen, not just idle.** Asserted in the idle story so it cannot regress.
- ~~**The exit sheet has no Figma frame**~~ — IT HAS ONE NOW: `exit screen`, node `15807:21978`, and it is built from the frame. The earlier code-first version is superseded, but two of its decisions survive because the frame agrees: **staying is the primary and leaving the secondary** (the student already chose to leave by tapping ✕; the sheet surfaces the cheaper option rather than re-asking), and **the sheet is raised in place from the recall layout rather than routed**, so the turn stays behind the scrim. **One decision was overruled and is worth keeping on the record:** the old descriptor named plainly that the term in flight would count as skipped, per `sprint-context.md` — *"'progress is saved' would otherwise hide a real cost until the summary, which is where trust in the number gets decided."* Figma's copy is *"Let me help you prep."*, which is warmer and says less. The frame does not answer that argument; it simply does not make it. **And the file overflows its own sheet:** `bottomSheetOnly` is 468, its three parts add to 540, so no height is both faithful and sufficient. The build takes `sheet/L` and hugs.
- **`Type=Default` on the sheet app bar** — Figma's `bottomSheet` app bar has two variants and only `dismissAndAction` was built. `Default` is the handle alone, which is what the exit sheet uses. Rather than add a variant prop, the rule already governing the trailing square now governs the leading ✕: **wire `onDismiss` and it is drawn, omit it and it is not.** So `Type=Default` is simply the call with neither handler. Two stories asserted a ✕ they had never wired; both are corrected, and `Type=Default — handle only` documents the variant.
- **`.knw-chat` is `chatInput`'s root class, and a screen took it** — the entry screen's first pass named its chat column `.knw-chat`, which silently restyled the composer on every screen that has one: a flex column with a 12 gap where a row belongs. Renamed to `.knw-entry`. **Component class names are owned by the component**; a screen that wants a chat column picks its own prefix. Nothing in the build enforces that — worth a lint rule if the CSS grows.
- ~~**The home rail's feature icons do not exist**~~ — **closed. All five were in the file the whole time.** Every rail chip carries a two-tone glyph with its own accent: Scan a violet camera, Explain out loud a blue mic, Quiz a magenta bulb, Summarize a green spark over ruled lines, Chemistry prep a coral notebook. Every colour resolves to an `accent/*` token already in `tokens.json`; nothing was invented and nothing is missing. Extracted into `RecallScreens/icons.tsx`, coloured by `.knw-home__rail-icon[data-accent]`.

  **This entry was wrong twice, and both ways are worth recording, because they are the two ways to misread a Figma node.**
  1. *Present ≠ on.* The first pass saw an `iconSlot` on each chip and logged four missing glyphs. Those slots are `visible: false`, holding the placeholder `square` — so the rail shipped with no icons at all.
  2. *A filtered walk is not a walk.* The correction searched the tree for `/iconSlot|mic/` and concluded the rail had exactly one icon, on Explain out loud. The other four glyphs are named `Group 2136139921` and the like, so the filter never saw them. **A screenshot settled in one look what two traversals got wrong** — when a conclusion is about what a screen *looks* like, render it before writing it down.
- ~~**No flame for the streak**~~ — **closed.** The flame was always in `Top Nav Default`, built exactly like the bolt beside it: a `coral/400` silhouette under a `coral/950` inner vector. Extracted as `FlameIcon`, silhouette alone, the treatment `BoltIcon` documents. The colour binding never changed — `accent/coral/bold` was already right; only the drawing was wrong, and the bar showed one glyph twice in two colours until now. Asserted in the Entry 1 story by comparing the two paths, so they cannot silently converge again.
- ~~**The app bar's controls were typographic**~~ — **closed.** The menu and history controls were the characters `☰` and `⟳`, which take the running font's weight and metrics and so never matched the icons beside them. Both are now the file's own vectors: a three-bar menu (the last bar half-length) and `clock-rewind`, a clock whose ring breaks into three dots. The **PRO lockup** replaces a `Chips color="pro" active="True"`, which painted a solid gold pill with dark text where the app draws a gold ring with the word set inside it; Figma models the whole mark as one boolean union, so it is one path in `pro/bold`.
- ~~**`chatInput`'s text is one step and one weight off**~~ — **closed.** `.knw-chat__text` bound `body/S-bold` (15/20 SemiBold) where Figma draws **18/24 Regular** in the field on every frame with a composer. Now `body/M-regular`. It was the largest type mismatch in the build and the hardest to see, because it was wrong on all 26 routes at once — nothing sat beside it looking right. The story asserted the wrong value too, which is how it survived: **a test that pins a mistake defends it.**
- ~~**The exit ✕ bound three type properties out of five**~~ — **closed.** `.knw-recall__exit` set family, size and line-height and left `font-weight` and `letter-spacing` to the browser, so the ✕ rendered at the user-agent's 400 on 14 routes — a weight nobody chose. Same defect, same day, as an unstyled `<strong>` on `/recall/text-fallback` taking the user-agent's **700** while every other emphasised term in the app is the token's 600. Both are exactly what "bind type as a complete five-property set, never partially" exists to catch, and neither was visible without measuring.
- ~~**The build ran two button sizes at once**~~ — **closed. Every `Button` is size M.** The recall and permission screens used M (48 tall, label `body/S-bold` 15/20); comparison, rating, summary, exit and the sheets used L (56 tall, label `headline/S` 21/24). Two primary buttons, split by screen family, which is what "the mic permission primer button seems small" was pointing at. All 30 `size="L"` bindings are now M. The audit confirms it: `.knw-button__label` used to appear in two rows of the type table and now appears in one.
- ~~**A CTA was 350 on a recall turn and 358 everywhere else**~~ — **closed.** `.knw-recall` bleeds out of the slot's 16 gutter and re-pads with `space/gutter` (20), the wider measure a recall turn reserves for its question, card and orb. Correct for those; wrong for the buttons, which changed width as the student moved between screens. `.knw-recall .knw-buttongroup` now cancels the difference — expressed as `gutter − layout/l` so it stays correct if either token moves, rather than hard-coding 4.
- **`chatInput` has an `attachment` slot** — content pinned inside the field, on its own line above the text, which is Figma's `chat box`: the `EolChip` and then the row of text and send. The composer's attached feature belongs *inside* the message being written, not in a strip above it. The field is a row until something is passed and a wrapped two-line box after, so the five statuses without an attachment render unchanged.
- **`chips` has `onRightIconPress`** — makes the trailing icon its own control inside the pill, which is how `EolChip` draws its ✕. Deliberately separate from `onPress`: a pressable chip is a toggle and reports `aria-pressed`, and removing something is not a toggle. Before this the ✕ was a 44px button *beside* the chip — two controls for one thing.
- **`npm run consistency` exists now, and is the reason those three were found.** `scripts/consistency.mjs` walks all 25 screen routes at 390×844 dark and reports three things `npm run a11y` cannot: values that are not a token step, every size/line-height/weight triple in use, and the gutter and gap per screen side by side. The type table is the useful half — the build rendered **15** combinations where `SPEC.md` says 13, and the two extras were both a browser default leaking in. It now reports exactly 13. Run it after any type or spacing change.
- **An icon step at 10** — `folderCard`'s badge `Icon` frame is **10 square**, checked against the component on the Knowunity Components page, so `.knw-folder__badge-icon` renders the right size. What is wrong is the token: it borrows `size/tab`, a *tab* measurement that happens to equal 10, because the icon scale has 8 and 12 and nothing between. 12 would be visibly larger than the component, so the size stays and the borrow stays commented. **Request `size/icon/XXS` at 10.**
- ~~**The recall exit was a text `✕`**~~ — **closed.** A font glyph takes its weight from whatever type the element binds, so the exit rendered at the header's `headline/S` Bold among real SVGs and would have moved again the next time that binding changed. Now `CloseIcon`: Figma's own 14.5 square in the 24 app-bar box, stroked 1.5 with round caps. **Never a text character where an icon belongs** is now a rule in the build-screen skill.
- ~~**Two alert circles**~~ — **closed, and the lesson is about sources.** The hint's mark had been drawn twice from screen frames — a filled lightbulb, then a stroked circle-and-bang off `Hint1` — while the design system already owned `WarningCircle` (15984:22874) on the **Knowunity Components** page: a filled disc with the exclamation knocked out, in variants 24 and 16 that are the same drawing at the same 0.8125 ratio. The hint now uses the component. **A frame shows one instance; the component page shows the thing itself** — when a concept has a component, that is the source, and a frame is only evidence about where it gets used. `Snackbar`'s Error icon is deliberately left alone: its Info / Success / Error trio comes from the snackbar's own component set and is internally matched.
- ~~**The app bar was one bar on every entry screen**~~ — **closed.** `entrypoint` and `selecting explain feature` are one tap apart and Figma changes two things between them: the trailing control goes from **`clock-rewind`** (your history) to **compose** (a new chat), and the **streak chip disappears**, leaving Upgrade and XP. Both follow from where the student is — inside a chat the useful control is a *new* chat, and a streak is a home-screen statistic, not something a message being written is about. The build carried the front door's bar straight through, so the bar did not change when the screen did. `ChatHeader` now takes `inChat`. **A control in the same position on two screens is not automatically the same control** — check what it does there before reusing it.
- ~~**WANTED: a blur step at 10**~~ — **closed: `effect/blur-glow` (10) now exists**, requested by and built for this one screen. Kept distinct from `effect/glow` (37), which is an outer glow *radius* cast by a control that stays sharp; this is the subject itself going out of focus. The reasoning that produced it is worth keeping: between `effect/blur-soft` (5) and `effect/blur` (16) — the mic permission primer (`15794:19616`) puts a 20 `LAYER_BLUR` on the mascot block, and that is the screen: Knowie as a glow behind "You're ready" rather than a character in front of it. **Figma's radius is not a CSS radius.** Figma drives a Gaussian at sigma ≈ radius/2; CSS `blur(N)` sets sigma = N. So Figma's 20 is about `blur(10px)`, and binding `effect/blur` (16) on the raw number turned the mascot into an unreadable smear. Converted first, `effect/blur-soft` is the nearer step (|10−5| < |10−16|) and is what ships — but the design sits between the two, so **request a blur token at 10**. *Convert the unit before choosing the nearest step; the conversion can change which step is nearest.*
- **Greed Condensed is a second width the type scale does not model** — the typeface is one variable file with a `wdth` axis (75 Condensed → 130 Extended), and Figma runs two of those widths: **Standard for all UI and body text**, **Condensed Heavy for two brand moments on the front door** — the greeting (32/32.7) and the app-bar figures (21.8/21.8). Both `primitive.font.family.default` and `.display` were set to the Standard face, so the `display` family token exists but names the same thing as `default`, and `display/L` — the only role binding it, and the only role at weight Heavy — is unused. **Decision: stay on the Standard headline steps** (`headline/L`, `headline/S`); the Condensed face is not modelled. Revisit by pointing `font.family.display` at a second `@font-face` pinned to `wdth` 75 and adding display steps at 33 and 21 — no new font file, the same one at another width.
- **The rail chips are detached from `chips` in Figma** — the entrypoint's rail draws 40-tall pills with an **18/24** label, while the `chips` component set's largest size (M) is 40-tall with **15/20**. The build follows the component. The file is what disagrees with itself; worth reconciling there rather than adding a size in code.
- **`chatInput`'s text is one step and one weight off** — Figma draws the field's text and placeholder at **18/24 Regular** (`body/M-regular`) on every frame that has a composer (`entrypoint`, `choosing chip`, `explain out ready`); `.knw-chat__text` binds **`body/S-bold`** (15/20 SemiBold). So the composer reads smaller and heavier than designed on all 26 routes. Not changed yet — it is a shared component and the correction is a visible change everywhere, so it wants a decision rather than a drive-by edit.
- **Entry 1 had no app bar and no bottom nav** — not a token gap; a build omission worth recording because it is what made the front door not read as the app. `HomeScreen` ran `showTopNavSlot={false}` while the file gives it the same bar as every other entry screen, and the five-item nav was never built at all. Both now render. **The rule about unwired controls needed sharpening to do it:** "a control with nothing wired to it is not drawn" was being read as *the chrome disappears*, which is how the header went missing. What the rule protects against is a **focusable control that does nothing** — so the glyph is always drawn, and it is a `<button>` only when a handler exists, otherwise a `<span role="img">`. Same rule `VoiceFab` already applies to `Thinking` and `Disabled`.
- **`EOL Card background`** — the Explain out loud card binds a Figma variable at `#0B1E4A` with no counterpart in `tokens.json`. It takes **`accent/blue/subtle`** (blue/900, `#0A1635`): blue/950 is a closer number but is only exposed as `accent/blue/label/bold`, a *text* colour, and a label token on a surface is the swap "Never do this" exists to stop. Nearest step **in the right role** beats nearest number. Request a card-surface blue.
- **The Partial breakdown is drawn larger than Wrong's list, and the file means it** — `partial` (`15620:9496`) sets its bullets at **15 Regular on `text/primary`**; the component set's Wrong variant sets "WHAT WAS MISSING" at **12 Regular on `text/secondary`**. Both are bulleted absences, so the difference looks like drift, but it reads as deliberate: Wrong's list is a footnote to a verdict, Partial's is the part the student acts on before the next attempt. Built as drawn, on both. **Worth confirming** — if they should match, it is one line.
- **A `bold` accent used as small text on a surface should be assumed to fail AA.** This has now caught the build three times — the in-card hint label, the Partial breakdown's "STILL MISSING", and the comparison's "YOUR ANSWER" — each time with the same fix: move one step to the `label/subtle` tier, same hue, enough contrast. The `bold` tier is a *fill*; the `label/subtle` tier is what the system provides for text on a dark ground. **Treat it as a rule, not as three incidents.** The green half of each pair usually passes (green/500 is bright enough); it is the violets that fail.
- **`feedback/partial/bold` fails AA at 9px** — the breakdown's "STILL MISSING" label binds `feedback/partial/surface/bold` in Figma, which resolves to violet/400 (`#7B65E0`): **3.51:1** on `background/surface`, caught by axe in the story rather than by eye. Both labels take the `label/subtle` tier instead — violet/300 and green/300 — which clears AA and lands green on the colour the file already uses for that group's dot. Same call design-system.md already records for the in-card hint label; the pattern is now three deep, so **a 9px label on a `bold` accent should be treated as failing by default.**
- ~~**`recallResponseCard`'s two action buttons were the same pair on every state**~~ — FIXED. The set draws **Retry / Continue** on Wrong and Partial — another attempt, or move on — and **App misheard me / That's what I said** only on Misheard, which is a claim about the transcript rather than about the answer. One shared default had all three offering to appeal a transcription that was never in question. Now per-state, like `badgeLabel` and `nextActionLabel` already were. **`percentageText` had the same shape of bug:** one default of `100%` put a Partial card reading "Almost there" over a perfect score. Now 65 on Partial, 100 on Correct.
- **`/recall/result` labels the card's next-action "Skip question", where `partial` labels it "Reveal answer"** — two Figma sections disagree. The `hint ladder` section (`15833:9103`) is the newer work and the one `/recall/result` is built against, so the ladder's label wins and Skip stays the screen's only skip. Recorded because the older frame is the one a reader is likely to open.
- **`space/layout/3XL`** — `session rating` (`15675:15580`) sets Space/1200 (48) between its blocks, and the layout scale stops at 2XL (32). 48 exists as a primitive but only under a size role, `size/tapTarget/min`, which is not a spacing value. 2XL is the nearest bound step and is what the screen takes. Request a 3XL step.
- **No radio, and three checkboxes doing one's job** — the same screen asks a single-choice question and Figma draws it as three `Checkbox` instances, with exactly one filled. A radio group is the correct semantics; this system has no radio component, so `Checkbox` is used and the behaviour made single-select. Request `radio` / `radioGroup`, or a documented single-select mode on `Checkbox`.
- ~~**A success state on `Checkbox`**~~ — NOT A GAP, a decision. The chosen row in that frame is filled `feedback/success/surface/subtle` and ringed `border/success`, hand-detached with no variant behind it. The build keeps `Selection=Selected, State=Default` — violet — on purpose: **green means *correct* everywhere else in this app** (the verdict chip on `recall-correct.png`, the Perfect tile on the summary, the strong-topics list), and nothing on the rating screen is being marked. A student choosing "I need to practice" and getting a green tick is being congratulated on an admission. Violet is the app's *selection* colour — the active tab, the chosen chip — and selection is what this is. No new variant is needed.
- ~~**`mascotSlot`'s variant disagrees with its drawn size**~~ — RESOLVED by the screenshots, which are the authority on specs. `correct-answer`, `correct-feedback` and `session rating` each set the variant to **3XL** and then resize the instance to 100×100, 96×96 and 120×120; the component's 3XL is **200**. `recall-correct.png` and `recall-partial.png` both draw Knowie at roughly 100 across with the card over his lower third, which is **2XL** (120) — the same size, and the same 37.5% tuck, as every other recall turn in this build. So the variant label is the odd one out, and the correct-loop screens reuse `.knw-recall__mascot` rather than inventing a second mascot block. Worth fixing in the file: three instances claiming a size they are not drawn at.
- **The `sad` mascot could not be exported** — `exit screen`'s illustration is ten loose vectors in a frame, and `exportAsync` on that frame returns a blank image: the shapes render only through something the parent contributes. The pose was cut out of a 4× render of the whole screen and the sheet's fill flood-filled back off, so the asset is genuinely transparent, with a dark fringe on the antialiased edge that is invisible on any dark ground. **Re-export it properly if the file ever renders it in isolation.** Its box is 173×188, off every illustration step, so it takes `size/fab/thinking` (172) — the same workaround the `thinking` mascot already uses, and the second case for the `size/illustration/M` request above.
- **A card inside a sheet cannot be `background/surface`** — that is the sheet's own fill, so the card disappears into it. `background/elevated` is the layer token for a panel on a surface, which is what `recallResponseCard`'s transcript box already uses. `.knw-recall__card--on-sheet` carries it.
- ~~**The summary's stat tile has no component**~~ — RESOLVED. It is `components/SummaryStatTile`, built from Figma's `Summary Stat tile` (`15857:10047`), and the `component-gaps.md` entry is closed. One token gap stands behind it, below.
- **No type step is 24, and no small step carries Heavy** — `Summary Stat tile` sets its figure at 24/20 Heavy. The size scale runs 21 then 28, and the only semantic step using the `Heavy` primitive is `display/L` at 76, so `24/Heavy` has no step to take at all. The build uses `headline/S` (21, Bold). Request either a 24 primitive with a step on it, or a small Heavy step — the figure on a summary tile is unlikely to be the last place that wants one.
- **The summary's composition differs between Figma and the app** — `reference/recall-summary.png` draws three outcome buckets including a **Skipped** one; Figma draws a score ring, three stat tiles and strong/review cards with no skipped bucket at all. Figma wins on composition, so that is what got built, and skipped terms head the review card per `sprint-context.md`. Recorded here because it is a genuine composition conflict rather than a spec one, which the "Which source wins" rule does not cover.
- **`highlight/indicator`** — Figma's `Checkbox` binds the selected disc's fill and stroke to it, and `strongCard` inherits that through its instances. The semantic layer carries the exact value (`violet/highlight`, `#9d85ff`) under one name only: **`highlight/border`**, documented as *the edge of the active tab*. Both `checkbox` and `listItem` take it, so the value is right and the name is one role narrow. Request a `highlight/indicator` alias. **How it surfaced is the point:** `checkbox` had bound this to `border/selected` (`#9178e6`) as "the nearest violet" — a step off, invisible on its own, obvious the moment `listItem` drew the same disc beside it from the same node. The same story's older note claimed these Figma variables no longer existed; they resolve fine, and that claim is now corrected in the story.
- ~~**The scroll fade at the foot of the summary**~~ — NOT WANTED. Figma ends `middleContent` with a 390×151 `Scrim`, and no token comes near 151, so this sat as a request. It is now a decision: **no fade on the summary or the rating.** Closing it, and `size/scrim/fade` is not needed. The original note follows for the record: ** — Figma's `middleContent` ends in a 390×151 `Scrim`, a linear gradient of `background/page`, which is how the file tells the student the review list continues under the pinned actions. No token comes near 151: the size scale's nearest roles are `illustration/2XL` (120) and `illustration/3XL` (200), and neither is a fade height. Built without it rather than with an invented value, so the list currently runs under the buttons with no visual hint. Request `size/scrim/fade`.
- **`headline/XL` is 44, not 28** — the summary title and the lesson title were both bound to it against Figma's 28/Bold, which is `headline/M`; `XL` was read as "the top of the headline range" rather than as a named size. Both now take `headline/M`, and the summary story asserts `28px` so it cannot drift back. Not a token gap — a naming trap worth writing down, since the scale's four headline steps are 21 / 28 / 33 / 44 and only one of them is where its name suggests.
- **`.knw-screen` was `min-height: 100vh` with `overflow: hidden`** — RESOLVED. On the first screen whose content exceeded the viewport (the summary, at 887 against 844) the column grew and the overflow clipped the last 43px, taking half the bottom slot's second button with no way to scroll to it. Now `height: 100vh`, so the middle scrolls and the slots stay put — which is what `.knw-screen__middle`'s `flex: 1 1 auto; min-height: 0` was always written for. **A latent scaffold bug, like the sheet overflow before it.**
- **`hintLadder`'s dot is 10×10 and its rule is 18×2** — neither is on a scale. The size scale runs `control/XXS` 20, `XS` 24, `S` 32, and `size/bullet` is 5; `space/layout/M` (12) is the nearest bound value that is a size at all, and at 10px the 2px difference reads as nothing. The rule takes `size/control/XXS` (20) for width against Figma's 18, and `stroke/strong` for its height against 2. Request `size/dot` and `size/rule` if the ladder is drawn anywhere else.
- **The in-card hint label is 10/12, and its colour fails AA** — no step is 10 (the scale runs 9, 12, 15, 16, 18), so `caption/S` (9) is the nearest. Figma binds `text/link` (violet/500), which is **4.43:1** on `background/surface` — under AA by seven hundredths, and at 9px nothing qualifies as large text. The build takes `feedback/partial/label/subtle` (#A78BFA, 5.67:1), which is also the better name: a hint is feedback on a partial answer, not a link.
- **The promoted hint panel binds a PRO colour in Figma** — a variable named `Pro Background` (#E88C30 at 12%) with no counterpart in `tokens.json`, and the paid tier's colour doing a hint's job, which "Never do this" #8 forbids. The build takes `feedback/warning/surface/subtle` (gold/900-wash), the family the gold label on that same panel already belongs to. The label itself, `text/warning`, matches Figma exactly.
- **The `thinking` mascot is 122×132** — off every illustration step (XL 64, 2XL 120, 3XL 200, 4XL 320), and `thinking progress` places the component directly rather than through a `mascotSlot`. The build sizes its box with `size/fab/thinking` (172) and contains the image inside, so the pose keeps its proportions. Request `size/illustration/M` if a third mascot size is wanted.
- ~~**The processing header draws `progressIndicator` at `thickness="16"`**~~ — RESOLVED, and it was not one frame. All six recall frames bind 16: `Idle`, `cancel option`, `student talking`, `thinking progress`, `hint 1` and `reveal`. `recallHeader` was built on the component's 24 default and was 8px heavy on every screen in the loop. Now passes `thickness="16"` explicitly. Nothing is lost by the switch — `showText` has no effect at 16 by design, and the count was never drawn here anyway, only carried in the bar's accessible name.
- **No avatar size, and no avatar role at all** — the app draws exactly one avatar, the 25×25 profile disc in the bottom nav of `detailed-lesson-by-chat.png`. The text fallback needs the same treatment beside a chat message, and the size scale has nothing between `control/XS` (24) and `control/S` (32). It takes `control/S`, which is a control size doing an avatar's job. Request `size/avatar/{S,M}` and a semantic role, so an avatar stops borrowing a button's scale.
- **The inline chat mascot is 44** — Figma draws Knowie at 44×44 beside the student's turn on the text fallback. Every illustration step is larger: XL 64, 2XL 120, 3XL 200, 4XL 320. The build holds `XL`, which is 20px over. This is the one place a mascot marks a speaker rather than illustrating a state, and the shipped app has no counterpart to measure against, so the 44 is a live design decision rather than drift. Request `size/illustration/L` (44), or confirm the inline mascot should be 64.
- **`radius/300` (12px)** — `progressIndicator`'s track binds to it. No semantic radius sits at 12; the value exceeds half the track height so the browser clamps it to a pill, and `radius/pill` renders identically. Harmless today, wrong if the track ever grows taller than 24.
- **`iconSlot` is not used by the components built before it** — `design-system.md` says to prefer `iconSlot` over a raw vector everywhere, but `button`, `chips`, `bottomSheet`, `snackbar`, `chatInput`, `folderCard`, `listItem`, `checkbox` and `textField` all size their icons directly. Retrofitting them is outstanding work, not a token gap.
- **`size/fab/*` and the voiceFab effects** — `voiceFab`'s geometry is entirely unbound in Figma: the ring (170), button (140), recording orb (215) and mic glyph (55.4) are raw frame sizes with no variables behind them. `size/fab/{ring,button,orb,glyph}`, `mascot/ring/{idle,sent}`, `effect/glow` (37) and `effect/blur-soft` (4) now exist in code, each traced to a measured value in the file. Request the matching Figma variables.
- **`text/disabled` fails AA wherever it labels something live** — 40% white reads 3.77:1 on `background/page`. It is used for `tabs` inactive labels and for `voiceFab`'s Thinking and Disabled captions, all of which are read rather than decorative. `text/tertiary` (48%) clears AA at 4.66:1. One decision fixes every component at once.
- **`mascot/orb/start` and `mascot/orb/end` never render** — they bind the gradient on `voiceFab`'s Mask Group ellipse, but that ellipse is `isMask: true`, so the gradient defines the mask shape and is never painted. Confirmed by exporting the variants: both orb states render as `mascot/primary` violet, not blue. The two variables also alias `blue/500` and `blue/700`, which do not exist as primitives. Either wire them into something that renders or retire them.
- **`voiceFab` state=Recording does not match its own description** — both the component description and the anatomy above give Recording the Idle structure (Ring 170 + Button 140 + mic icon). The actual node is the orb at 215×215 with the mic layer hidden, built like Thinking. The node is what renders, so the node was followed.
- **`voiceFab` state=Idle puts its caption above the button** — every other state puts it below, which is what the anatomy above specifies. Confirmed by export. One of the two is wrong.
- **voiceFab motion is still unspecified** — Recording's "ring pulses at full opacity" and Thinking's orb are described as animations but drawn static in Figma, and no motion tokens exist, so both are static in code. Same root gap as the Motion tokens entry above; noted here because voiceFab is the component that visibly depends on it.
- **Light mode** — the semantic layer has dark mode values only. No light mode aliases exist.
- ~~**Motion tokens**~~ — CLOSED, and this one was added rather than requested, so it needs a look. There were no duration or easing tokens at all, and the recording orb had to move: a still orb on a screen whose waveform is also static reads as a screenshot, which is Voice_UX principle 1's exact failure — *"if the student can't tell whether the app is recording, they freeze."* A scale now lives in `tokens/tokens.json` under `primitive.duration`, `primitive.easing` and `semantic.motion`:

  | Token | Value | For |
  |---|---|---|
  | `motion/duration/instant` | 120ms | A state flipping under a finger |
  | `motion/duration/quick` | 200ms | A control answering — the orb changing size |
  | `motion/duration/settle` | 320ms | Something arriving or leaving |
  | `motion/duration/breath` | 1600ms | One cycle of a loop. Long on purpose: a fast pulse reads as urgency, and the student is meant to keep talking |
  | `motion/easing/standard` | `cubic-bezier(0.2, 0, 0, 1)` | Anything the student caused |
  | `motion/easing/enter` | `cubic-bezier(0, 0, 0, 1)` | Something appearing |
  | `motion/easing/continuous` | `cubic-bezier(0.4, 0, 0.6, 1)` | Loops only — symmetric, so no frame reads as the start |

  The values are a first proposal against `ux-motion`'s education profile (playful, 200–400ms), not a measured match to anything in Figma, which draws every state static. **Change them in `tokens/tokens.json` and re-run `npm run tokens:css` and `npm run tokens`.** `scripts/generate-globals-css.py` learned two DTCG types to carry them: `duration` (whose value brings its own unit, unlike `dimension`) and `cubicBezier` (kept as a CSS string rather than the spec's four-number array, because a custom property has to hold one value).
- **The recording orb breathes its sheen, not its button** — and the reason is worth keeping. The first pass animated `transform` on `.knw-fab__button`, which is the tap target: a control that moves under a thumb is harder to hit, and it is the primary control on the screen. It also hung every Storybook Recording story, because an element that never settles never becomes clickable. The breath moved to `.knw-fab__sheen` and the glow stayed on the button as a `box-shadow` only — nothing that changes the element's box. **A looping `transform` on an interactive element is a bug, not a style choice.**
- **`prefers-reduced-motion` is handled once, in `voiceFab`** — it holds the orb at the lit end of the cycle rather than removing the cue, because a student who cannot see that the app is listening is back in front of the screen principle 1 warns about. Nothing else in the build animates yet; when something does, it needs its own block.
- **Focus ring as a composed token** — `border/focus` provides the color and `Stroke/Heavy Border` provides the width, but they are not paired into a single token. Consuming code must apply both manually.
- **Hover and active states** — only the `interactive` family has explicit hover and active state tokens. `feedback`, `border`, and `accent` families have resting state only.
- **Tablet and desktop breakpoints** — the Responsive collection covers Desktop (1200px), Tablet (768px), Mobile (375px), but semantic layout tokens (column count, margin width, max-width) do not exist.
- **Z-index scale** — no layering tokens. Code consuming bottom sheets, modals, snackbars, and tooltips must agree on z-index values independently.
- **`feedback/error/label/muted`** — the "WHAT WAS MISSING" label in `recallResponseCard` uses `feedback/error/bold` at full opacity as the closest available token. The design intent is a 60%-opacity muted red. Request `feedback/error/label/muted`.
- **`background/card`** — `folderCard`'s `#1e1e2e` base fill sits between `background/page` and `background/surface` with no matching token. Currently bound to `background/surface`. Request `background/card`.
- **`mascot/waveform/idle`** — `waveformCard` state=Idle repurposes `background/contrast` for bar fills. Introduce this token if `background/contrast` changes in a future theme. Figma compounds this: the Idle bars carry **no fill binding at all**, though the component description specifies `background/contrast`. The description was followed.
- **`mascot/waveform/tail`** — `waveformCard` state=Talking repurposes `interactive/secondary` for bars 21–24. Introduce this token if the ghost button fill changes.
- **`waveformCard` bar width is 3.5px with no token** — the nearest is `size/strip` (3), which the code binds. A half-pixel width is unlikely to be intentional; either round the Figma value to 3 and reuse `size/strip`, or add a `Bar/Waveform` variable. Related: **`waveformCard` Talking Bar 19 binds `mascot/eyes`**, not `mascot/primary` like bars 01–18 and 20. Its own description says 01–20 are `mascot/primary`, so the description was followed and the node looks like a slip.
- **Three labels depart from Figma's binding to clear AA** — `typeAnswerComponent`, `transcriptSection` and `statTile` all bind `text/disabled` or `text/tertiary` in Figma and all render at **4.5:1 or worse** against the surface behind them. Each uses `text/secondary` in code instead. `statTile` is the sharp case: `text/tertiary` clears AA at 4.62:1 on `background/page` but falls to **4.34:1** on `background/surface`, which is where the tile actually sits — the contrast depends on the parent, so the token alone cannot be judged. Same root cause as the `text/disabled` entry above; one decision on the label tokens fixes all of them.
- **Absolute-position offsets** — the Left Accent Strip in `recallResponseCard` and the Ring/Button in `voiceFab` use raw pixel offsets. No spatial offset tokens exist.
- **SVG vector paths** — fills and strokes on raw Bézier paths inside icon SVGs cannot be variable-bound through the plugin API. This affects icon paths in `Check`, `strongCard`, `reviewTopicCard`, `folderCard`, and `typeAnswerComponent`.
- **Components documented here but not built** — `thinkingBubble` (blocked on the motion tokens above, so state 3 of the recall flow stays unbuilt), `strongCard` and `reviewTopicCard` (largely covered by `listItem`; build only if the summary screen needs the distinct treatment).
- **`recallResponseCard State=Misheard` — one token differs from Figma, deliberately.** The chip was redesigned amber to solve a contrast failure, but the new binding is worse: `Pro Background` (`#E88C30`, the PRO chip's fill borrowed across) with `feedback/warning/surface/label/subtle` (gold-300) is **1.77:1**, against 3.91:1 before. `label/subtle` is the light half of the warning pair and belongs on the dark `warning/subtle`, not a bright fill; the stroke has the same problem at 1.41:1. The build keeps the amber decision and uses the system's own pairing — `feedback/warning/label/bold` on `feedback/warning/bold` — which is **10.73:1**, with the chip at 8.49:1 on the card. Rebind in Figma and the two agree.
- **Figma has renamed the whole `feedback/*` family** to insert a `surface` segment — `feedback/partial/surface/bold` where `tokens.json` says `feedback/partial/bold`. The values are identical (violet-400, green-500, green-950), so nothing renders differently, and the rename is **not adopted**: Figma's own `error` branch still carries both spellings (`feedback/error/bold` *and* `feedback/error/surface/bold`), so the rename is not settled on that side either. Adopt it in one pass once it is, or drop the `surface` segment there.
- **`buttonIcon` does not exist** — `buttonGroup`'s Horizontal variant pairs one with a labelled `button`. Until it is built, Horizontal lays out whatever two children it is given. Everything else in the group is complete.
- **`state=Deny` and `state=Disabled` overlap** — both mean "the mic is not available", and `voiceFab` now carries both. The build uses Deny for refused permission (there is a fix) and Disabled for a gated feature (there is not). Confirm that split, or retire one.
- **The header's type steps do not exist** — the older screens set the progress counter at **14/20** and the XP figure at **16/24**. The scale has 12, 15, 18, 21, 28, 33 and no 14 or 16, so `progressIndicator` supplies its own label. The rebuilt `Top Nav Default` sets the XP figure at **18/20**, which is `headline/XS-bold` and needs nothing new — only the older headers still carry the unmatched steps.
- **~~The XP colour has no token~~ — WRONG, corrected.** `accent/blue/bold → color/blue/400 → #5FA0FC` exists and is an **exact** match for the colour the app renders XP in (sampled from `reference/recall-partial.png` and `recall-processing.png`). The earlier claim that `#3B8DFF` "exists nowhere in the token file" was a bad read. What is actually true: the `⚡` emoji text node is painted a raw, unbound `#3B8DFF` that matches nothing, and three screens still carry it — `Idle` `15684:17498`, `text fallback` `15794:20147`, `cancell and rerecord` `15794:20029`.
- **The XP bolt is bound to two wrong steps of the blue** — the rebuilt header layers two vectors: a solid silhouette on `accent/blue/label/subtle` (`#7BA8F2`) with Phosphor's *outlined* version stacked over it on `accent/blue/subtle` (`#0A1635`, **1.09:1** on `background/page`). `accent/blue/subtle` is a surface token; as a glyph interior it is invisible, so the bolt reads as an outline with a hole while the app's is solid. **Code takes the first vector alone on `accent/blue/bold`** — that path is already Phosphor `Lightning` at Fill weight, so no new asset was needed. Delete the overlay in Figma and rebind, and the two agree.
- **The XP figure's size is off-scale** — Figma draws the bolt 18 × 22. The icon scale has 16 and 20 and nothing between, so code sizes it by **height** at `size/icon/M` (20) and lets the width follow the glyph's aspect, rather than inventing a 22.
- **No translucent blue tint exists** — the blue family is bold / label-bold / subtle / label-subtle, all opaque. The `feedback/*` families express their 20% washes as `COMPOSE_COLOR`; blue has no equivalent. Only needed if the XP bolt stays duotone.
- **The `✕` exit glyph is 22/22** — no step matches; `headline/S` (21/24) is the nearest bound one and is what the header uses.
- **The question bubble's fill is unbound in two screens out of three** — `answer sent` and `Idle` fill it with a raw `#1C1C2A`; `text fallback` binds `background/surface` on the same card. `background/surface` is what the build uses. Same family as the `background/card` request above; one of the three is wrong.
- **`textBlock` has no variant at `headline/L`** — `mic permission`'s headline is 33/36, which is exactly `headline/L`, but the set jumps from `L` (`headline/XL`, 44) to `XL` (`display/M`, 76). The screen binds the tokens directly. Request a `textBlock` variant at this step.
- **`mic permission` carries a 20px LAYER_BLUR** over its mascot block. The only blur token is `effect/blur-soft` (4). Either add a token for it or drop the effect — as drawn, it also bakes into every image export of anything inside that frame.
- **`mascotSlot` is resized off-scale in `text fallback`** — the instance is 44 wide, below `XL` (64), the smallest step in the set. `XL` is used in code.
- **`Trash` binds `mascot/eyes` for its glyph** — a mascot colour role on a UI icon. It resolves to the same white as `text/primary`, which is what the build uses. (The `Property 1=white` variant binds the `color/neutral/0` **primitive**, which breaks "components consume the semantic layer only". Rebind both.)

---

## Relationship between files

`tokens/tokens.json` — every value in the system. Source of truth for what exists. Consult it before writing any value in code or Figma.

`design-system.md` — this file. Rules for how to use what exists. No values are repeated here; if a rule refers to a color or size, the name it uses is the token name and the value lives in `tokens/tokens.json`.

When the two files conflict, fix the conflict rather than choosing one over the other. A rule that references a token that does not exist in `tokens/tokens.json` is a broken rule. A token in `tokens/tokens.json` that has no rule in `design-system.md` is an undocumented token.
