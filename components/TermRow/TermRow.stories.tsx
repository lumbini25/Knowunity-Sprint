import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { TermRow } from './TermRow';

const DESCRIPTION = `One term's outcome on the session summary. Built from the Figma component **termRow** (16311:14136), as instanced on \`17 Summary\` (16311:14220).

**Four end states**, each with its own glyph, label and colour so they read apart in greyscale: **Unaided** (check, \`feedback/success\`), **Hinted** (half circle, \`feedback/partial\`), **Revealed** (eye, \`feedback/error\`), **Skipped** (dash, neutral). The label comes from \`outcome\` and is not a prop — Figma: *"Never change a tag's label on an instance."*

**The whole row is the target**, 64 tall, and opens that term's detail. Without \`onOpen\` it is plain content with no chevron.

**Two departures, both logged in design-system.md:** Figma renders Hinted orange because its \`feedback/partial/bold\` has drifted from tokens.json (violet); the binding is followed. And the fourth state is a guess — the set is unpublished, so Skipped stands in for it. The frame's per-term XP is not drawn; the design owner dropped it.`;

const meta = {
  title: 'Components/TermRow',
  component: TermRow,
  parameters: { layout: 'padded', docs: { description: { component: DESCRIPTION } } },
  argTypes: { outcome: { control: 'radio', options: ['Unaided', 'Hinted', 'Revealed', 'Skipped'] } },
  decorators: [
    (Story) => (
      <ul style={{ width: '358px', margin: 0, padding: 0 }}>
        <Story />
      </ul>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TermRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unaided: Story = {
  args: { title: 'Turning points', outcome: 'Unaided', onOpen: fn() },
  play: async ({ canvas, canvasElement, args }) => {
    const row = canvas.getByRole('button', { name: /Turning points/ });
    // "A 64 minimum height", at the rendered size.
    await expect(Math.round(row.getBoundingClientRect().height)).toBeGreaterThanOrEqual(64);
    await userEvent.click(row);
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    // The label is the outcome's, and the badge shares its colour.
    const tag = canvasElement.querySelector('.knw-termrow__tag') as HTMLElement;
    const badge = canvasElement.querySelector('.knw-termrow__badge') as HTMLElement;
    await expect(tag.textContent).toBe('Unaided');
    await expect(getComputedStyle(badge).backgroundColor).toBe(getComputedStyle(tag).backgroundColor);
    await expect(canvasElement.querySelector('.knw-termrow__chevron')).toBeTruthy();
    // No XP column — dropped by the design owner.
    await expect(canvas.queryByText(/XP/)).toBeNull();
  },
};

export const Hinted: Story = { args: { title: 'Appeasement', outcome: 'Hinted', onOpen: fn() } };

export const Revealed: Story = { args: { title: 'The post-war order', outcome: 'Revealed', onOpen: fn() } };

export const Skipped: Story = {
  args: { title: 'Total war', outcome: 'Skipped', onOpen: fn() },
  play: async ({ canvasElement }) => {
    // Neutral: a skip was never judged, so it borrows no verdict colour.
    const tag = canvasElement.querySelector('.knw-termrow__tag') as HTMLElement;
    await expect(getComputedStyle(tag).color).toBe('rgba(245, 243, 255, 0.68)');
  },
};

export const NotOpenable: Story = {
  name: 'onOpen unset — plain content',
  args: { title: 'Turning points', outcome: 'Unaided' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvasElement.querySelector('.knw-termrow__chevron')).toBeNull();
  },
};
