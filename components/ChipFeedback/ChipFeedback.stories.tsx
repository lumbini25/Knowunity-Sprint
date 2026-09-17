import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ChipFeedback } from './ChipFeedback';

/** Verbatim from the Figma component set "chipFeedback" (node 15676:15999). */
const FIGMA_DESCRIPTION = `Inline verdict badge pill for a single recall result. Three variants covering Correct, Partial, and Wrong results.

**VARIANT AXIS** — \`verdict\`: Correct | Partial | Wrong

**LAYER ANATOMY (all variants)**

\`\`\`
[Icon]   SVG icon (Correct: none | Partial: ArrowCounterClockwise 16×16 | Wrong: X 12×12)
Label    verdict text, Greed/Caption M Bold, fill matches state label token
\`\`\`

**TOKEN BINDING**

| verdict | fill | stroke | label |
|---|---|---|---|
| Correct | \`feedback/success/surface/bold\` | — | \`feedback/success/surface/label/bold\` |
| Partial | none | 2px \`feedback/partial/surface/bold\` | \`feedback/partial/surface/bold\` |
| Wrong | \`feedback/error/bold\` | — | \`feedback/success/surface/label/bold\` (dark text on red) |

All variants: Radius/Full, padding Space/100 top/bottom, Space/300 left/right, gap Space/200.

**NOTE:** superseded by the Badge layer inside recallResponseCard for use within the recall card. Use chipFeedback for standalone verdict display outside the card (summary rows, inline in lists).

**DON'T**
- Do not use verdict=Partial fill tokens on verdict=Correct and vice versa.
- Do not resize the pill — it hugs its label content.

Each variant carries its own description:

> **Correct** — Solid fill feedback/success/surface/bold. Label '✓ Correct'. Use after a passing answer.
>
> **Wrong** — Solid fill feedback/error/bold. X icon. Label 'Not quite'. Use when the answer did not land.
>
> **Partial** — No fill. Stroke 2px feedback/partial/surface/bold. ArrowCounterClockwise icon. Label 'Almost there'. Use when the student partially answered.

---

**Built from two existing components.** \`IconSlot\` at \`size="200"\`, which is exactly what the file instantiates, and the \`CancelIcon\` / \`RewindIcon\` / \`CheckIcon\` glyphs already drawn for \`recallResponseCard\`. Nothing new was drawn and no new tokens were needed — every binding resolved.

**The master set still holds unswapped placeholders.** All three variants contain an \`iconSlot\` whose contents are the default \`square\`, bound to \`text/primary\`. Only the *instances* inside \`recallResponseCard\` have real glyphs swapped in. Rendering the master faithfully would put a grey square in every pill, so the swapped glyphs are used instead — the same three this component's instances show.

**The description's icon spec disagrees with both.** It says *"Correct: none | Partial: ArrowCounterClockwise 16×16 | Wrong: X 12×12"*, but every variant has a 16px slot, and Correct's instances carry a Check. The variant descriptions also write the glyph into the label — *"Label '✓ Correct'"* — while the node's text is just "Correct".

**Wrong's label is bound to a green token.** \`feedback/success/surface/label/bold\` (\`green/950\`) on a red pill. The description even acknowledges the result — "dark text on red" — so the value is intended even if the name is wrong. Kept as the file has it. The same binding appears on \`recallResponseCard\`'s incorrect badge.

**The \`NOTE\` is out of date.** It says chipFeedback is "superseded by the Badge layer inside recallResponseCard", but three of that card's four badges *are* chipFeedback instances. Only \`State=Reveal\` uses a plain Badge frame.

**Partial's stroke is aligned inside, so it is drawn as an inset ring.** Figma keeps all three pills at 24 tall: Correct and Wrong carry no stroke at all, and Partial's 2px sits inside the shape. A CSS border would have pushed Partial 4px taller than its siblings, so \`box-shadow: inset\` is used instead and every verdict measures 24.

**Partial's label has two leading spaces in the file.** \`"  Almost there"\`. The gap token already spaces the label from the glyph, so they are dropped here.

**\`label\` and the glyph are not Figma properties.** The set defines only \`verdict\`; each variant hard-codes both. Both are exposed as props for localisation, defaulting to the file's wording.`;

const meta = {
  title: 'Components/ChipFeedback',
  component: ChipFeedback,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    verdict: { control: 'radio', options: ['Correct', 'Partial', 'Wrong'] },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ChipFeedback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Correct: Story = {
  name: 'verdict=Correct',
  args: { verdict: 'Correct' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Correct')).toBeVisible();

    // Proves the token stylesheet reached the chip: the success pairing at
    // caption/M-bold in a pill.
    const chip = canvasElement.querySelector('.knw-chipfb') as HTMLElement;
    const s = getComputedStyle(chip);
    await expect(s.backgroundColor).toBe('rgb(0, 195, 134)');
    await expect(s.color).toBe('rgb(10, 31, 24)');
    await expect(s.borderRadius).toBe('9999px');
    await expect(s.fontSize).toBe('12px');
    await expect(s.lineHeight).toBe('16px');
    await expect(s.paddingTop).toBe('4px');
    await expect(s.paddingLeft).toBe('12px');

    // The glyph rides in an iconSlot at Size=200.
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('16px');
    await expect(slot.querySelector('svg')).toBeTruthy();

    // 4 + 16 + 4 = 24, exactly Figma's height.
    await expect(Math.round(chip.getBoundingClientRect().height)).toBe(24);
  },
};

export const Partial: Story = {
  name: 'verdict=Partial',
  args: { verdict: 'Partial' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Almost there')).toBeVisible();

    // The outlined one: no fill, a 2px violet stroke, label in the same violet.
    const chip = canvasElement.querySelector('.knw-chipfb') as HTMLElement;
    const s = getComputedStyle(chip);
    await expect(s.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(s.boxShadow).toContain('inset');
    await expect(s.boxShadow).toContain('rgb(123, 101, 224)');
    await expect(s.color).toBe('rgb(167, 139, 250)');

    // The inside stroke keeps every verdict the same height as Figma's 24.
    await expect(Math.round(chip.getBoundingClientRect().height)).toBe(24);
  },
};

export const Wrong: Story = {
  name: 'verdict=Wrong',
  args: { verdict: 'Wrong' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Not quite')).toBeVisible();

    // Red fill with the near-black label the file binds.
    const chip = canvasElement.querySelector('.knw-chipfb') as HTMLElement;
    const s = getComputedStyle(chip);
    await expect(s.backgroundColor).toBe('rgb(255, 107, 107)');
    await expect(s.color).toBe('rgb(10, 31, 24)');
  },
};

export const CustomLabel: Story = {
  name: 'label override',
  args: { verdict: 'Correct', label: 'Richtig' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Richtig')).toBeVisible();
  },
};

/** The description says Correct has no icon, so the slot can be emptied. */
export const NoIcon: Story = {
  name: 'icon={null}',
  args: { verdict: 'Correct', icon: null },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Correct')).toBeVisible();
    await expect(canvasElement.querySelector('.knw-iconslot')).toBeNull();
  },
};

/** All three verdicts, which is how the set reads in Figma. */
export const AllVerdicts: Story = {
  name: 'All verdicts',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'var(--semantic-space-layout-m)' }}>
      <ChipFeedback verdict="Correct" />
      <ChipFeedback verdict="Partial" />
      <ChipFeedback verdict="Wrong" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const chips = [...canvasElement.querySelectorAll('.knw-chipfb')] as HTMLElement[];
    await expect(chips).toHaveLength(3);
    // Each hugs its own label, so no two are the same width.
    const widths = chips.map((c) => Math.round(c.getBoundingClientRect().width));
    await expect(new Set(widths).size).toBe(3);
  },
};
