import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Chips } from './Chips';

/** Verbatim from the Figma component set "chips" (node 9003:8679). */
const FIGMA_DESCRIPTION = `Pill-shaped label with optional leading and trailing icons. 4 sizes, Primary and Pro color variants, active/inactive states. The Pro variant doubles as the PRO badge.

**USE:** Category tags, filter toggles, mode labels, and PRO badges.

**DON'T:** Use as a CTA. No loading or disabled state — use button for actions.

---

\`color\` only changes anything while \`active\` is True. An inactive Primary chip and an inactive Pro chip are identical — both rest on \`background/surface\`.

A chip renders as plain text by default. Pass \`onPress\` and it becomes a toggle button reporting \`aria-pressed\`; without it there is nothing to click, which keeps chips out of CTA duty as the description asks.`;

const meta = {
  title: 'Components/Chips',
  component: Chips,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    size: { control: 'radio', options: ['XXS', 'XS', 'S', 'M'] },
    color: { control: 'radio', options: ['Primary', 'pro'] },
    active: { control: 'radio', options: ['False', 'True'] },
    showLeftIcon: { control: 'boolean' },
    showRightIcon: { control: 'boolean' },
    Text: { control: 'text' },
  },
  args: { Text: 'Practice round' },
  tags: ['autodocs'],
} satisfies Meta<typeof Chips>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ===== Primary ===== */

export const XxsPrimaryFalse: Story = {
  name: 'size=XXS, color=Primary, active=False',
  args: { size: 'XXS', color: 'Primary', active: 'False' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Practice round')).toBeVisible();

    // Proves the token stylesheet reached the chip: it rests on
    // background/surface (navy 800) at the XXS control height, fully rounded.
    const chip = canvasElement.querySelector('.knw-chip') as HTMLElement;
    const s = getComputedStyle(chip);
    await expect(s.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(s.height).toBe('20px');
    await expect(s.borderRadius).toBe('9999px');
  },
};

export const XxsPrimaryTrue: Story = {
  name: 'size=XXS, color=Primary, active=True',
  args: { size: 'XXS', color: 'Primary', active: 'True' },
  play: async ({ canvasElement }) => {
    // Active Primary swaps to the brand fill and its paired label colour.
    const chip = canvasElement.querySelector('.knw-chip') as HTMLElement;
    await expect(getComputedStyle(chip).backgroundColor).toBe('rgb(244, 242, 255)');
    await expect(getComputedStyle(chip).color).toBe('rgb(9, 12, 24)');
  },
};

export const XsPrimaryFalse: Story = {
  name: 'size=XS, color=Primary, active=False',
  args: { size: 'XS', color: 'Primary', active: 'False' },
};

export const XsPrimaryTrue: Story = {
  name: 'size=XS, color=Primary, active=True',
  args: { size: 'XS', color: 'Primary', active: 'True' },
};

export const SPrimaryFalse: Story = {
  name: 'size=S, color=Primary, active=False',
  args: { size: 'S', color: 'Primary', active: 'False' },
};

export const SPrimaryTrue: Story = {
  name: 'size=S, color=Primary, active=True',
  args: { size: 'S', color: 'Primary', active: 'True' },
};

export const MPrimaryFalse: Story = {
  name: 'size=M, color=Primary, active=False',
  args: { size: 'M', color: 'Primary', active: 'False' },
};

export const MPrimaryTrue: Story = {
  name: 'size=M, color=Primary, active=True',
  args: { size: 'M', color: 'Primary', active: 'True' },
  play: async ({ canvasElement }) => {
    // M is the largest step: 40px tall on the body type style.
    const chip = canvasElement.querySelector('.knw-chip') as HTMLElement;
    await expect(getComputedStyle(chip).height).toBe('40px');
    await expect(getComputedStyle(chip).fontSize).toBe('15px');
  },
};

/* ===== pro ===== */

export const XxsProFalse: Story = {
  name: 'size=XXS, color=pro, active=False',
  args: { size: 'XXS', color: 'pro', active: 'False', Text: 'PRO' },
  play: async ({ canvasElement }) => {
    // Inactive pro is identical to inactive Primary — the colour axis only
    // takes effect once the chip is active.
    const chip = canvasElement.querySelector('.knw-chip') as HTMLElement;
    await expect(getComputedStyle(chip).backgroundColor).toBe('rgb(34, 36, 47)');
  },
};

export const XxsProTrue: Story = {
  name: 'size=XXS, color=pro, active=True',
  args: { size: 'XXS', color: 'pro', active: 'True', Text: 'PRO' },
  play: async ({ canvasElement }) => {
    // This pairing is the PRO badge: pro/bold (gold 400) with pro/label/bold
    // (gold 950) on it.
    const chip = canvasElement.querySelector('.knw-chip') as HTMLElement;
    await expect(getComputedStyle(chip).backgroundColor).toBe('rgb(245, 181, 61)');
    await expect(getComputedStyle(chip).color).toBe('rgb(42, 29, 4)');
  },
};

export const XsProFalse: Story = {
  name: 'size=XS, color=pro, active=False',
  args: { size: 'XS', color: 'pro', active: 'False', Text: 'PRO' },
};

export const XsProTrue: Story = {
  name: 'size=XS, color=pro, active=True',
  args: { size: 'XS', color: 'pro', active: 'True', Text: 'PRO' },
};

export const SProFalse: Story = {
  name: 'size=S, color=pro, active=False',
  args: { size: 'S', color: 'pro', active: 'False', Text: 'PRO' },
};

export const SProTrue: Story = {
  name: 'size=S, color=pro, active=True',
  args: { size: 'S', color: 'pro', active: 'True', Text: 'PRO' },
};

export const MProFalse: Story = {
  name: 'size=M, color=pro, active=False',
  args: { size: 'M', color: 'pro', active: 'False', Text: 'PRO' },
};

export const MProTrue: Story = {
  name: 'size=M, color=pro, active=True',
  args: { size: 'M', color: 'pro', active: 'True', Text: 'PRO' },
};

/* ===== icon slots and toggle behaviour ===== */

export const WithoutIcons: Story = {
  name: 'showLeftIcon=false, showRightIcon=false',
  args: { size: 'S', color: 'Primary', active: 'False', showLeftIcon: false, showRightIcon: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-chip__icon')).toHaveLength(0);
  },
};

export const AsToggle: Story = {
  name: 'onPress set (filter toggle)',
  args: { size: 'S', color: 'Primary', active: 'True', Text: 'Coach me', onPress: () => {} },
  play: async ({ canvas }) => {
    // With a handler the chip becomes a real toggle and reports its state.
    const chip = canvas.getByRole('button', { name: 'Coach me' });
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
  },
};
