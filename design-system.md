# Knowunity Design System

Rules, not values. Every value lives in `tokens.json`. This file tells you how to use the system.

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

**errorButton** — two-option action row inside recallResponseCard for flagging a transcription error. See full spec below.

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
3. **Body copy**: `text/light` for primary content the student must read; `text/secondary` for supporting text (transcript, bullet items).
4. **Accent elements** (dots, strips, ring strokes): `feedback.{state}.surface.bold`.
5. **Zone wash fills** (inset surfaces, tinted sections): `feedback.{state}.surface.subtle` — never on the enclosing card.
6. **Border** (optional): `border/default` for bordered surfaces (Knowie answer box, neutral badge in Reveal state).

Never mix feedback fill tokens across states on a single card. A card is one state. The complete implementation of this pattern lives in `recallResponseCard`.

---

## recallResponseCard

Result surface for one evaluated recall attempt in the Explain Out Loud loop. Shows the verdict badge, a transcript of what the student said, Knowie's response, and — on an incorrect result — a structured breakdown of what was missing.

### Variant axis: State

`State` with an additional boolean `showMissingSection` encoded in the variant name on Default.

**State=Default, showMissingSection=True** — incorrect result. Student's answer did not land. Shows error badge (`feedback/error/surface/bold`), transcript of what was heard, `errorButton` row, Divider, and Missing Section listing the missing concepts as bullets. `nextActionLabel` default: "Next question".

**State=Default, showMissingSection=False** — partial result. Student touched the concept but didn't fully cover it. Shows partial badge (`feedback/partial/surface/bold`), transcript, and `errorButton` row. No Divider or Missing Section. `nextActionLabel` default: "Reveal answer".

**State=Reveal** — model answer revealed. Transcript and Action Buttons replaced by full model answer text (`text/light`). Helper label "Try it yourself after reading" sits below card. Badge reads "Answer" in neutral pill (`background/surface` + `border/default` stroke). `nextActionLabel` default: "Next question".

**State=Correct** — passing result. Percentage circle (44×44, `feedback/success/surface/bold` ring) and green "✓ Correct" badge replace the standard badge row. Action Buttons replaced by Knowie Answer text block (`background/surface`, `border/default`, `Radius/300`). Left Accent Strip (`feedback/success/surface/bold`, 3px wide) runs along left edge of card.

### Properties

`badgeLabel` (text) — verdict label inside the badge pill. Defaults per state: "✗  Not quite" / "↺  Almost there" / "Answer" / "✓  Correct". Override when localising.

`transcriptText` (text, Default states only) — STT transcript of the student's answer.

`showMissingSection` (boolean, Default states only) — toggles the Divider, Missing Label, and Missing List. True = incorrect. False = partial. Never set to True on Reveal or Correct; those states do not contain the missing section layers.

`nextActionLabel` (text) — right-aligned link below the card.

`percentageText` (text, Correct only) — score inside the percentage circle. Default: "100%". Override with the actual session score.

### Layer anatomy

All values are token names. See `tokens.json` for resolved values.

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
        Transcript Text    Greed/Body S Regular, fill: text/light
      Action Buttons       horizontal, gap: Space/300, padding: Space/200 top/bottom
                           Default states only
        Primary Action     errorButton verdict=Misheard
        Secondary Action   errorButton verdict=Confirmed
      [Model Answer Text]  Reveal only — Greed/Body S Regular, fill: text/light
      [Knowie Answer]      Correct only — fill: background/surface, stroke: border/default
                           radius: Radius/300, padding: Space/300
        Answer Text        Greed/Body S Regular, fill: text/light
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

### Variant axis: state

**state=Idle** — mic is ready. Student has not started speaking. Ring at 15% opacity. Icon: mic. Label: "Tap to answer".

**state=Recording** — student is actively speaking. Ring pulses at full opacity (`mascot/primary`). Button fill: `interactive/primary`. Icon: mic illustration (fixed asset, not swappable via icon property). Label: "Tap to send". Push-to-talk: student taps the button again to submit, or taps the trash discard icon to cancel and re-record.

**state=Sent** — momentary confirmation that the answer was dispatched. Shown for ~600ms before Thinking. Fill same as Idle. Icon: checkmark. Label: "Answer sent".

**state=Thinking** — Knowie is evaluating. Button surface replaced by `thinkingBubble` orb animation (`mascot/orb/start` → `mascot/orb/end` gradient, blend: screen). Label: "Evaluating…", fill: `text/disabled`. Non-interactive — do not expose a tap target in this state.

**state=Disabled** — microphone permission denied or feature gated. `interactive/disabled` fill. Icon: mic at `text/disabled`. No ring. Non-interactive.

### Properties

`label` (text) — overrides the caption below the button. Idle default: "Tap to answer". Recording default: "Tap to send". Sent default: "Answer sent".

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
                      fill: text/light, tracking: font/tracking/tight
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
  Row (×3)            horizontal, gap: Space/300, padding: Space/300 top/bottom
                      divider between rows: border/default 1px top stroke
    Icon container    20×20, fill: background/surface, radius: Radius/Full
      Icon            checkmark SVG vector path
    Label             topic text, Greed/Body S Regular (font/size/sm), fill: text/secondary
```

TOKEN NOTE: icon container fill bound to `background/surface` as nearest token. Original intent was 20%-opacity green wash. Request `feedback/success/surface/wash`. SVG vector paths cannot be variable-bound — checkmark stroke weight is a raw path value.

### When to reach for it

Summary screen, immediately before `reviewTopicCard`.

### What not to do

Do not add more than three rows — the component has no scroll or overflow behaviour. Do not use this for topics that need review — use `reviewTopicCard` for those.

---

## reviewTopicCard

List of topics the student needs to revisit. Identical structure to `strongCard` with a red X icon instead of a green checkmark.

### Layer anatomy

```
reviewTopicCard       fill: background/surface, radius: Radius/400
                      padding: Space/400 horizontal, Space/300 vertical, gap: Space/150
  Row (×3)            horizontal, gap: Space/300, padding: Space/300 top/bottom
                      divider: border/default 1px top stroke
    Icon container    20×20, fill: background/surface, radius: Radius/Full
      Icon            X SVG vector path
    Label             topic text, Greed/Body S Regular (font/size/sm), fill: text/secondary
```

TOKEN NOTE: icon container fill bound to `background/surface` as nearest token. Original intent was 20%-opacity red wash. Request `feedback/error/surface/wash`.

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
                      fill: text/light
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
                      fill: text/light
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

## errorButton

Two-option action row inside `recallResponseCard`. Allows the student to flag a transcription error or confirm their answer was heard correctly.

### Variant axis: verdict

**verdict=Misheard** — "App misheard me". Fill: `feedback/error/subtle`. Stroke: `feedback/error/bold`, weight: `Stroke/Border`. Label: `feedback/error/bold`. Triggers a re-attempt without counting against the hint ladder.

**verdict=Confirmed** — "That's what I said". Fill: `background/surface`. Stroke: `border/default`, weight: `Stroke/Border`. Label: `text/secondary`. Confirms the transcript was correct; answer is evaluated as-is.

### Layer anatomy

```
errorButton           pill, radius: Radius/Full, weight: Stroke/Border
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
Check         32×32 frame, fill: text/light
  [SVG]       checkmark vector path (fill not variable-bindable — raw path)
```

TOKEN NOTE: outer frame fill is bound to `text/light` as the nearest white token. SVG vector paths inside cannot be variable-bound through the plugin API.

### When to reach for it

Exclusively as the `icon` instance swap on `voiceFab` state=Sent. Use at its native 32×32 size — `voiceFab` positions it inside Center Icon Container.

### What not to do

Do not use as a standalone action button — it has no press state. Do not resize — it is sized for the `voiceFab` button well.

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

TOKEN NOTE: keyboard icon outer fill bound to `text/light` as nearest white token. SVG path fills inside cannot be variable-bound.

### When to reach for it

Always visible below `voiceFab` on every recall screen. Required by the brief's accessibility constraint — the non-voice path for students who cannot or prefer not to speak.

### What not to do

Do not hide this component conditionally. Do not move it inside `voiceFab` — it sits at screen level, not inside the FAB component.

---

## Component authoring conventions

These rules govern every component on the Knowunity Components page. Anything adding a new component must follow them so new components are native next to existing ones.

### Component set naming

Component sets use camelCase, no spaces: `recallResponseCard`, `voiceFab`, `waveformCard`, `chipFeedback`, `folderCard`, `errorButton`. The name describes the thing, not the screen it appears on. `voiceInputButton` is correct. `explainOutLoudMicButton` is not.

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

Every color fill, stroke color, spacing value, radius, stroke weight, and all five typography properties (`fontSize`, `lineHeight`, `letterSpacing`, `fontFamily`, `fontStyle`) must be bound to a variable from `tokens.json`. No hardcoded values. If the right token does not exist, stop and request it — document the gap in the component description and in the Gaps section below.

SVG vector paths inside icon frames cannot be variable-bound through the plugin API. This is a known API limitation; document it in the component description.

Typography binds `fontFamily` to `font/family/default` and `fontStyle` to `font/weight/semibold` or `font/weight/regular`. The font family for all components is Greed Standard-TRIAL, resolved through the variable.

Stroke weights bind to `Stroke/Border` (1px) or `Stroke/Heavy Border` (2px).

### Feedback token routing

The card container always uses `background/surface`. Never a `feedback.*` token on the card fill.

`feedback.*.surface.bold` → badge fills, bullet dots, accent strips, ring strokes.
`feedback.*.surface.label.bold` → text on those bold surfaces.
`feedback.*.surface.subtle` → zone wash fills behind grouped content.
`feedback.*.bold` (without `surface`) → used for `feedback/error/bold` on Missing Label text and `errorButton` Primary Action stroke/label.

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
- **Group**: the semantic category — `background`, `interactive`, `text`, `border`, `state`, `mascot`, `pro`, `accent`, `feedback`.
- **Role**: the specific job — `bold`, `subtle`, `label`, `primary`, `secondary`.
- **Modifier**: a state or sub-role — `bold`, `subtle`, `hover`, `active`.

The role describes the job, never the appearance. `feedback/success/surface/bold` is correct. `feedback/success/green` is not. Appearance words belong in the primitive layer only.

### Reference syntax

Semantic tokens reference primitives using curly brace syntax in `tokens.json`: `{primitive.color.violet.500}`. In CSS this becomes a custom property chain: `var(--semantic-feedback-success-bold)`. Never write a value directly.

### Text content

Sentence case everywhere: labels, buttons, headings, error messages. Capitalise proper nouns only (Knowie, Knowunity, PRO). Never title-case a sentence.

---

## Never do this

**Never invent a value that is not in `tokens.json`.** If a spacing, color, radius, or size value is missing, stop and request it. The absence of a token is a gap to surface, not a gap to fill silently.

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

- **Light mode** — the semantic layer has dark mode values only. No light mode aliases exist.
- **Motion tokens** — no duration, easing, or delay tokens exist. Animation values for `voiceFab` recording pulse, `thinkingBubble` orb, and `recallResponseCard` result reveal must be agreed before they are used in code.
- **Focus ring as a composed token** — `border/focus` provides the color and `Stroke/Heavy Border` provides the width, but they are not paired into a single token. Consuming code must apply both manually.
- **Hover and active states** — only the `interactive` family has explicit hover and active state tokens. `feedback`, `border`, and `accent` families have resting state only.
- **Tablet and desktop breakpoints** — the Responsive collection covers Desktop (1200px), Tablet (768px), Mobile (375px), but semantic layout tokens (column count, margin width, max-width) do not exist.
- **Z-index scale** — no layering tokens. Code consuming bottom sheets, modals, snackbars, and tooltips must agree on z-index values independently.
- **`feedback/error/label/muted`** — the "WHAT WAS MISSING" label in `recallResponseCard` uses `feedback/error/bold` at full opacity as the closest available token. The design intent is a 60%-opacity muted red. Request `feedback/error/label/muted`.
- **`background/card`** — `folderCard`'s `#1e1e2e` base fill sits between `background/page` and `background/surface` with no matching token. Currently bound to `background/surface`. Request `background/card`.
- **`feedback/success/surface/wash`** — intended as the 12%-opacity green tile background in `summarySmallCards` and the 20%-opacity green icon container in `strongCard`. Currently bound to `background/surface`.
- **`feedback/error/surface/wash`** — intended as the 20%-opacity red tile background in `summarySmallCards` and the 20%-opacity red icon container in `reviewTopicCard`. Currently bound to `background/surface`.
- **`font/lineHeight/lg2` (32px)** — the `percentage` score text design value of 32px has no token. Currently bound to `font/lineHeight/md` (24px).
- **`mascot/waveform/idle`** — `waveformCard` state=Idle repurposes `background/contrast` for bar fills. Introduce this token if `background/contrast` changes in a future theme.
- **`mascot/waveform/tail`** — `waveformCard` state=Talking repurposes `interactive/secondary` for bars 21–24. Introduce this token if the ghost button fill changes.
- **Absolute-position offsets** — the Left Accent Strip in `recallResponseCard` and the Ring/Button in `voiceFab` use raw pixel offsets. No spatial offset tokens exist.
- **SVG vector paths** — fills and strokes on raw Bézier paths inside icon SVGs cannot be variable-bound through the plugin API. This affects icon paths in `Check`, `strongCard`, `reviewTopicCard`, `folderCard`, and `typeAnswerComponent`.

---

## Relationship between files

`tokens.json` — every value in the system. Source of truth for what exists. Consult it before writing any value in code or Figma.

`design-system.md` — this file. Rules for how to use what exists. No values are repeated here; if a rule refers to a color or size, the name it uses is the token name and the value lives in `tokens.json`.

When the two files conflict, fix the conflict rather than choosing one over the other. A rule that references a token that does not exist in `tokens.json` is a broken rule. A token in `tokens.json` that has no rule in `design-system.md` is an undocumented token.
