# component-gaps.md

Things a screen needed that Storybook did not have.

Each line is something built **inside a screen** rather than as a component, because it was needed
once. **If the same thing appears here twice, build it properly** — its own directory under
`components/` with a `.css` and a `.stories.tsx` — and delete both lines. Twice means it is a
component, not a one-off.

This is not the same list as `design-system.md`'s Gaps, which tracks missing **tokens**. This one
tracks missing **components**.

| What | Screen it was for | Date |
|---|---|---|
| **Key term callout** — a bordered, tinted box holding a label and one line of definition. `textBlock` is the closest thing in Storybook and has no surface and no border, so there was nothing to reach for. Bound to the **decorative** green ramp (`accent/green/*`), not `feedback/success/*`: a key term is a category marker, not a verdict. | `/entry/summarize` | 2026-09-19 |
| **Quiz answer option** — a card-shaped control with a resting state and a correct/wrong state. `button` is a pill and has no verdict state; `listItem` is a row with a fixed tick. Bound to the **feedback** ramp, the opposite call from the callout above and for the opposite reason. | `/entry/quiz` | 2026-09-19 |
| **Quiz result bar** — the verdict, a feedback row and two actions on a tinted surface in `Screen`'s bottom slot. `bottomSheet` was the near miss: it is the right shape but implies something to dismiss, and there is nothing here to dismiss — the way on is "Continue". Its contents are all real components (`chipFeedback`, `chips`, `buttonGroup`); only the tinted container is local. | `/entry/quiz` | 2026-09-19 |

## Token requests this list points at

Tokens are not components, so the entries live in `design-system.md`'s Gaps and this is only a
finger pointing at them.

| Token | Why | Screen | Status |
|---|---|---|---|
| `effect/blur-glow` at 10 | The mic permission primer's mascot is a glow, and the glow is the screen. Figma's 20 `LAYER_BLUR` works out to about CSS `blur(10px)` — Figma drives a Gaussian at sigma ≈ radius/2 where CSS `blur(N)` sets sigma = N. The scale had 5 and 16: 5 rendered tighter than designed, 16 turned Knowie into an unreadable smear. | `/recall/permission-primer` | **Added.** In `tokens/tokens.json`, and the primer binds it. |

**One screen is enough to earn a token when nothing on the scale can stand in.** That is the
opposite of this list's component rule — twice means build it — and the difference is that a
component built once can live inside the screen that needs it, while a value has nowhere to live
but the scale.

**Closed.** The coloured stat tile, drawn inline on the summary, is now `components/SummaryStatTile` with its own stories — built from Figma's `Summary Stat tile` (`15857:10047`). That is the round trip this list is for.
