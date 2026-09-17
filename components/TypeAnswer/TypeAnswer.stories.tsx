import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, fn } from 'storybook/test';
import { TypeAnswer } from './TypeAnswer';

/** Verbatim from the Figma component "typeAnswerComponent" (node 15676:16031). */
const FIGMA_DESCRIPTION = `Keyboard icon + "Type your answer" label. The text-fallback escape for students who cannot speak right now.

**LAYER ANATOMY**

\`\`\`
typeAnswerComponent   358px wide, horizontal, gap: Space/200, center-aligned
  Keyboard icon       16×16 SVG
  Label               "Type your answer", Greed/Caption M Bold (font/size/xs, font/lineHeight/xs)
                      fill: text/disabled, tracking: font/tracking/loose
\`\`\`

**TOKEN NOTE:** *"Keyboard icon fill bound to text/light as nearest white token. The SVG path fills inside the icon remain as vector paths (not bindable via plugin API)."*

**USE:** Always visible below voiceFab on every recall screen. Required by the brief's accessibility constraint — the non-voice path for students who cannot or prefer not to speak.

**DON'T**
- Do not hide this component conditionally.
- Do not move it inside voiceFab — it sits at screen level, not inside the FAB component.

---

**This component is instanced on zero screens in Figma.** It exists as a component and nothing places it. \`CLAUDE.md\` requires a text fallback on *every* recall screen and Voice_UX calls it *"Non-negotiable"* — so the gap is between the file and the docs, not in the docs.

**The label uses \`text/secondary\`, not Figma's \`text/disabled\`.** \`text/disabled\` is 40% white — 3.79:1 on the page, under AA. This is a control a student taps to escape a screen they cannot use; it has to be readable. \`text/secondary\` is 8.36:1.

**Built from \`IconSlot\` at \`size="200"\`** — Figma draws the glyph at 16×16, which is exactly that slot. The Keyboard path is copied from the file.

**It renders as a \`<button>\`.** Figma draws two static layers; this is the tap target that opens the text path, so it needs a real control and an accessible name.`;

const meta = {
  title: 'Components/TypeAnswer',
  component: TypeAnswer,
  parameters: { layout: 'centered', docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { label: { control: 'text' } },
  decorators: [(Story) => (<div style={{ width: '358px' }}><Story /></div>)],
  tags: ['autodocs'],
} satisfies Meta<typeof TypeAnswer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'typeAnswerComponent',
  args: {},
  play: async ({ canvas, canvasElement }) => {
    const btn = canvas.getByRole('button', { name: 'Type your answer' });
    await expect(btn).toBeVisible();

    // Proves the token stylesheet reached it: caption/M-bold at text/secondary,
    // not the text/disabled Figma binds.
    const s = getComputedStyle(btn);
    await expect(s.fontSize).toBe('12px');
    await expect(s.lineHeight).toBe('16px');
    await expect(s.fontWeight).toBe('600');
    await expect(s.color).toBe('rgba(245, 243, 255, 0.68)');
    await expect(s.columnGap).toBe('8px');

    // The glyph rides in an iconSlot at Size=200.
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('16px');
    await expect(slot.querySelector('svg')).toBeTruthy();
  },
};

export const CustomLabel: Story = {
  name: 'label override',
  args: { label: 'Tippe deine Antwort' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Tippe deine Antwort' })).toBeVisible();
  },
};

export const Tappable: Story = {
  name: 'Opening the text path',
  args: { onClick: fn() },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Type your answer' }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};
