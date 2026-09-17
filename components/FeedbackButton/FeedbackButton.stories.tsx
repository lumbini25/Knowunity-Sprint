import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { FeedbackButton } from './FeedbackButton';

/** Verbatim from the Figma component set "feedback Button" (node 15700:17854). */
const FIGMA_DESCRIPTION = `Two-option action row inside recallResponseCard. Allows the student to flag a transcription error or confirm their answer was heard correctly.

**VARIANT AXIS** — \`verdict\`: Misheard | Confirmed

**LAYER ANATOMY (both variants)**

\`\`\`
[variant frame]   pill, radius: Radius/Full, Stroke/Border
                  padding: Space/300 horizontal, Space/200 vertical, gap: Space/300
  Label           verdict text, Greed/Caption S Bold (font/size/2xs, font/lineHeight/2xs)
                  tracking: font/tracking/loose
\`\`\`

**TOKEN BINDING**

| verdict | fill | stroke | label |
|---|---|---|---|
| Misheard | \`feedback/error/surface/subtle\` | \`feedback/error/bold\` | \`feedback/error/bold\` |
| Confirmed | \`background/surface\` | \`border/default\` | \`text/secondary\` |

**USE:** Only inside recallResponseCard Action Buttons row. Equal FILL width halves of the card interior.

**DON'T:** Do not place freestanding on a screen — it has no standalone meaning outside the result card.

Each variant carries its own description:

> **Misheard** — 'App misheard me'. Triggers a re-attempt without counting against the hint ladder.
>
> **Confirmed** — 'That's what I said'. Confirms the transcript was correct; answer is evaluated as-is.

---

**The component has been renamed.** Figma now calls it \`feedback Button\`; design-system.md still calls it \`errorButton\` throughout — in the component list, in recallResponseCard's anatomy, and in the naming-convention section that cites \`errorButton\` as an example of correct camelCase. The new name also breaks that convention: it has a space and a capital B, where the rule says "Component sets use camelCase, no spaces".

**The Misheard fill is Figma's own binding.** Figma expresses \`feedback/error/surface/subtle\` as a \`COMPOSE_COLOR\` expression — \`color/red/200\` at 20% — which \`tokens.json\` could not represent, so this used \`feedback/error/subtle\` as a stand-in. That token now exists and is bound here, so the fill matches the file exactly.

**The label is \`feedback/error/label/subtle\`, not \`feedback/error/bold\`.** Figma binds the bold fill as text, which reads 3.61:1 on the wash. The pair's own text token clears AA at 5.28:1. That is the one deliberate departure from the file.

**Nothing was reusable.** \`Button\` is the obvious candidate and does not fit: its axes are variant/size/state on \`interactive/*\` tokens at control heights 32/40/56, while this is a fixed 30px pill on \`feedback/error/*\` at \`caption/S-bold\`. No variant of one produces the other.

**This is what recallResponseCard's Action Buttons should be — but currently are not.** Both that component's description and design-system.md say "Primary Action — errorButton verdict=Misheard", yet in the file those are plain frames, not instances. They also disagree on type: the inline frames use \`caption/M-bold\` (12/16), this component uses \`caption/S-bold\` (9/12). Built faithfully to this set; **RecallResponseCard has not been changed**, since swapping it would alter a component already reviewed. Worth reconciling in one direction or the other.

**\`label\` is not a Figma property.** The set defines only \`verdict\`; each variant hard-codes its own string. The prop exists for localisation and defaults to the file's wording.

**Width follows the USE note, not the frame.** Each variant is drawn at a fixed 112, but the description says "Equal FILL width halves of the card interior", so the button fills the space it is given.`;

const meta = {
  title: 'Components/FeedbackButton',
  component: FeedbackButton,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    verdict: { control: 'radio', options: ['Misheard', 'Confirmed'] },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '160px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof FeedbackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Misheard: Story = {
  name: 'verdict=Misheard',
  args: { verdict: 'Misheard' },
  play: async ({ canvas, canvasElement }) => {
    const btn = canvas.getByRole('button', { name: 'App misheard me' });
    await expect(btn).toBeVisible();

    // Proves the token stylesheet reached the button: the error pairing, a
    // pill, and the 1px border Figma binds.
    const s = getComputedStyle(btn);
    // The label takes `feedback/error/label/subtle`, not the `bold` red the
    // border takes — the contrast pass moved every live label onto its
    // `label/*` counterpart to clear AA. Same token family, lighter step.
    await expect(s.color).toBe('rgb(252, 165, 165)');
    await expect(s.borderTopColor).toBe('rgb(255, 107, 107)');
    await expect(s.backgroundColor).toBe('rgba(252, 165, 165, 0.2)');
    await expect(s.borderTopWidth).toBe('1px');
    await expect(s.borderRadius).toBe('9999px');

    // caption/S-bold, which is what this set uses — not the 12/16 the inline
    // buttons inside recallResponseCard draw.
    await expect(s.fontSize).toBe('9px');
    await expect(s.lineHeight).toBe('12px');
    await expect(s.fontWeight).toBe('600');

    // 8 + 12 + 8 + 2 borders = 30, exactly Figma's height.
    await expect(Math.round(canvasElement.querySelector('.knw-fbtn')!.getBoundingClientRect().height)).toBe(30);
  },
};

export const Confirmed: Story = {
  name: 'verdict=Confirmed',
  args: { verdict: 'Confirmed' },
  play: async ({ canvas }) => {
    const btn = canvas.getByRole('button', { name: 'That’s what I said' });
    await expect(btn).toBeVisible();

    // The neutral pairing: surface fill, default border, secondary label.
    const s = getComputedStyle(btn);
    await expect(s.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(s.borderTopColor).toBe('rgba(255, 255, 255, 0.1)');
    await expect(s.color).toBe('rgba(245, 243, 255, 0.68)');
  },
};

export const CustomLabel: Story = {
  name: 'label override',
  args: { verdict: 'Misheard', label: 'Das war falsch' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Das war falsch' })).toBeVisible();
  },
};

/**
 * How the file says to use it: two equal halves of the card interior. The
 * DON'T rules out anything else.
 */
export const ActionRow: Story = {
  name: 'Action Buttons row',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--semantic-space-layout-m)', width: '332px' }}>
      <FeedbackButton verdict="Misheard" />
      <FeedbackButton verdict="Confirmed" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const btns = [...canvasElement.querySelectorAll('.knw-fbtn')] as HTMLElement[];
    await expect(btns).toHaveLength(2);
    // Equal halves, as the USE note requires.
    const [a, b] = btns.map((el) => Math.round(el.getBoundingClientRect().width));
    await expect(a).toBe(b);
  },
};
