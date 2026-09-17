import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { ButtonGroup } from './ButtonGroup';
import { Button } from '../Button/Button';

const DESCRIPTION = `Two controls composed together. Vertical stacks two equal-weight buttons. Horizontal pairs a compact buttonIcon with a full labelled button — different visual weights by design, with the icon as the subordinate action.

**USE**: Vertical for equal choices ("Keep learning" / "Leave anyway"). Horizontal for a primary CTA alongside a compact secondary (close icon + "Continue").

**DON'T**: Treat the horizontal pair as equals — if both need equal weight, use vertical.

---

**It is a layout, nothing else.** The group binds no colour, radius or type: the buttons inside keep every token they already own. That is why \`size\` here exists only to match the \`size\` set on them, and why the stylesheet is twelve lines.

**Vertical has no gap.** Figma butts the two 48-high rows flush against each other, so the pair reads as one block rather than two separate decisions.

**One gap.** Figma's Horizontal variant pairs a \`buttonIcon\` with a \`button\`, and \`buttonIcon\` is not built in this library. Horizontal here lays out whatever two children it is given — the first compact, the second filling the row — which is the shape Figma draws, without the component that belongs in the first slot.`;

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
    docs: { description: { component: DESCRIPTION } },
  },
  decorators: [(Story) => (<div style={{ width: '358px' }}><Story /></div>)],
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VerticalM: Story = {
  name: 'variant=Vertical, size=M',
  args: { variant: 'Vertical', size: 'M' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="Primary" size="M" CTA="Type instead" onClick={fn()} />
      <Button variant="Secondary" size="M" CTA="Enable microphone" onClick={fn()} />
    </ButtonGroup>
  ),
  play: async ({ canvas, canvasElement }) => {
    const primary = canvas.getByRole('button', { name: 'Type instead' });
    const secondary = canvas.getByRole('button', { name: 'Enable microphone' });

    // Stacked, in that order, flush — no gap between the rows.
    const a = primary.getBoundingClientRect();
    const b = secondary.getBoundingClientRect();
    await expect(b.top).toBeGreaterThanOrEqual(a.top);
    await expect(Math.round(b.top - a.bottom)).toBe(0);

    // Both fill the group's width, which is what makes them equal weight.
    const group = canvasElement.querySelector('.knw-buttongroup') as HTMLElement;
    const w = Math.round(group.getBoundingClientRect().width);
    await expect(Math.round(a.width)).toBe(w);
    await expect(Math.round(b.width)).toBe(w);
  },
};

export const HorizontalM: Story = {
  name: 'variant=Horizontal, size=M',
  args: { variant: 'Horizontal', size: 'M' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="Secondary" size="M" CTA="Back" onClick={fn()} />
      <Button variant="Primary" size="M" CTA="Continue" onClick={fn()} />
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    const back = canvas.getByRole('button', { name: 'Back' });
    const cont = canvas.getByRole('button', { name: 'Continue' });

    // One row, subordinate first.
    const a = back.getBoundingClientRect();
    const b = cont.getBoundingClientRect();
    await expect(Math.round(a.top)).toBe(Math.round(b.top));
    await expect(a.right).toBeLessThanOrEqual(b.left);

    // The labelled control takes the remaining width, so the two are not equals
    // — which is the DON'T this variant exists to encode.
    await expect(b.width).toBeGreaterThan(a.width);
  },
};

export const VerticalL: Story = {
  name: 'variant=Vertical, size=L',
  args: { variant: 'Vertical', size: 'L' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="Primary" size="L" CTA="Keep learning" onClick={fn()} />
      <Button variant="Secondary" size="L" CTA="Leave anyway" onClick={fn()} />
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    // The description's own example of an equal pair.
    await expect(canvas.getByRole('button', { name: 'Keep learning' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Leave anyway' })).toBeVisible();
  },
};

export const HorizontalL: Story = {
  name: 'variant=Horizontal, size=L',
  args: { variant: 'Horizontal', size: 'L' },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="Secondary" size="L" CTA="Back" onClick={fn()} />
      <Button variant="Primary" size="L" CTA="Continue" onClick={fn()} />
    </ButtonGroup>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Back' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible();
  },
};
