import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { LessonAccordion } from './LessonAccordion';

const DESCRIPTION = `One section of a lesson. Built from the \`sectionHeader\` rows in Figma's **Lesson details accordion closed** (16311:15771): an outlined pill (\`border/strong\`, radius full, 12 / 24 padding) with the section name in Body S Bold and an open-book glyph in \`text/secondary\`.

**Figma draws only the closed state.** The open panel is this component's: the section's reading in Body S Regular, \`text/secondary\`, inset to the pill's text. Open, the pill's stroke moves to \`border/selected\`.

**USE** — on the lesson screen, one per term, as the last look before the session.

**DON'T** — do not use it as navigation; a pill that opens something should not also leave the screen.

**Motion** — opening crosses on \`motion/duration/settle\` via grid rows, and stops travelling under reduced motion.`;

const meta = {
  title: 'Components/LessonAccordion',
  component: LessonAccordion,
  parameters: { layout: 'padded', docs: { description: { component: DESCRIPTION } } },
  decorators: [
    (Story) => (
      <div style={{ width: '358px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof LessonAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: { title: 'Turning points', onToggle: fn() },
  play: async ({ canvas, canvasElement, args }) => {
    const header = canvas.getByRole('button', { name: 'Turning points' });
    await expect(header).toHaveAttribute('aria-expanded', 'false');
    // Clears the 48 floor at its rendered size.
    await expect(header.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    // Closed panels are out of the accessibility tree.
    const panel = canvasElement.querySelector('.knw-accordion__panel') as HTMLElement;
    await expect(panel.hasAttribute('inert')).toBe(true);

    await userEvent.click(header);
    await expect(header).toHaveAttribute('aria-expanded', 'true');
    await expect(args.onToggle).toHaveBeenCalledWith(true);
    await expect(panel.hasAttribute('inert')).toBe(false);

    // Wait for the opening to land before reading the box.
    await Promise.all(canvasElement.getAnimations({ subtree: true }).map((a) => a.finished));
    await expect(canvas.getByText(/Stalingrad, Midway and D-Day/)).toBeVisible();
    // Open shows on the pill too, in border/selected.
    await expect(getComputedStyle(header).borderTopColor).toBe('rgb(145, 120, 230)');
  },
};

export const Open: Story = {
  args: { title: 'Appeasement', defaultOpen: true, children: 'Conceding to an aggressor to avoid a war, as Britain and France did at Munich in 1938.' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Appeasement' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByText(/Munich in 1938/)).toBeVisible();
  },
};
