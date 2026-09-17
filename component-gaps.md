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
| _(nothing yet)_ | | |

**Closed.** The coloured stat tile, drawn inline on the summary, is now `components/SummaryStatTile` with its own stories — built from Figma's `Summary Stat tile` (`15857:10047`). That is the round trip this list is for.
