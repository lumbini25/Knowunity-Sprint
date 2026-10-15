import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { TopicRow } from './TopicRow';

const DESCRIPTION = `One topic the student covered this week, on the entry screen. Built from the Figma component set **"Topics list view"** (Property 1=Default), instanced in the entry screen's \`lesson\` list (16307:8816).

**LAYER ANATOMY** — a progress ring (track \`border/default\`, arc \`accent/brand/bold\`) around a filled \`accent/brand/bold\` core holding the doc glyph; the title in Body S Regular, \`text/primary\`; a kind tag on a \`background/elevated\` pill — "Event" in \`accent/blue/label/subtle\` (Figma binds \`accent/blue/bold\`, 4.27:1 on the pill, under AA), "Concept" in \`text/secondary\`.

**USE** — inside a list on a \`background/surface\` card, one row per term. The whole row is the control: tapping it starts recall on **that** term, so the handler must carry which one.

**DON'T** — do not render a row without \`onSelect\` beside rows that have one; without it the row is plain text on purpose. Do not use it for summary results — that is \`listItem\`.

**TOKEN NOTE** — Figma's redesign shrank the ring to ~33 around a ~22 core and a ~14 glyph (it was 48 / 32 / 20). The row takes the nearest steps: \`control/s\` 32, \`control/xxs\` 20, \`icon/xs\` 12, \`stroke/strong\` 2. Logged in design-system.md's Gaps.`;

const meta = {
  title: 'Components/TopicRow',
  component: TopicRow,
  parameters: { layout: 'fullscreen', docs: { description: { component: DESCRIPTION } } },
  argTypes: {
    kind: { control: 'radio', options: ['Event', 'Concept'] },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
  decorators: [
    (Story) => (
      <ul style={{ width: '358px', margin: 16, padding: 0, borderRadius: 16, overflow: 'hidden', background: 'var(--semantic-background-surface)' }}>
        <Story />
      </ul>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TopicRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Event: Story = {
  args: { title: 'Turning points', kind: 'Event', onSelect: fn() },
  play: async ({ canvas, canvasElement, args }) => {
    const row = canvas.getByRole('button', { name: /Turning points/ });
    // The whole row is the target, and it clears the 48 floor at its rendered size.
    const box = row.getBoundingClientRect();
    await expect(box.height).toBeGreaterThanOrEqual(48);
    await expect(Math.round(box.width)).toBe(358);

    await userEvent.click(row);
    await expect(args.onSelect).toHaveBeenCalledTimes(1);

    // Event tag in accent/blue/label/subtle — a step lighter than Figma's
    // accent/blue/bold, which fails AA on the pill (4.27:1).
    const tag = canvasElement.querySelector('.knw-topic__tag') as HTMLElement;
    await expect(tag.textContent).toBe('Event');
    await expect(getComputedStyle(tag).color).toBe('rgb(123, 168, 242)');

    // The smaller ring (16307:8816): control/s 32 around a control/xxs 20 core.
    const step = canvasElement.querySelector('.knw-topic__step') as HTMLElement;
    await expect(getComputedStyle(step).width).toBe('32px');
    const core = canvasElement.querySelector('.knw-topic__core') as HTMLElement;
    await expect(getComputedStyle(core).width).toBe('20px');

    // A full ring by default — Figma draws every row at 100.
    const arc = canvasElement.querySelector('.knw-topic__progress') as SVGCircleElement;
    await expect(arc.getAttribute('stroke-dasharray')).toBe('100 100');
  },
};

export const Concept: Story = {
  args: { title: 'Appeasement', kind: 'Concept', onSelect: fn() },
  play: async ({ canvasElement }) => {
    const tag = canvasElement.querySelector('.knw-topic__tag') as HTMLElement;
    await expect(tag.textContent).toBe('Concept');
    // text/secondary — the white at 68%.
    await expect(getComputedStyle(tag).color).toBe('rgba(245, 243, 255, 0.68)');
  },
};

export const PartProgress: Story = {
  name: 'Progress 40',
  args: { title: 'Total war', kind: 'Concept', progress: 40, onSelect: fn() },
  play: async ({ canvasElement }) => {
    const arc = canvasElement.querySelector('.knw-topic__progress') as SVGCircleElement;
    await expect(arc.getAttribute('stroke-dasharray')).toBe('40 100');
  },
};

export const NotSelectable: Story = {
  name: 'onSelect unset — plain text',
  args: { title: 'The post-war order', kind: 'Event' },
  play: async ({ canvas }) => {
    // No handler, no control: the row does not pretend to be tappable.
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getByText('The post-war order')).toBeVisible();
  },
};
