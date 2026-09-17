import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { HintLadder } from './HintLadder';

const meta = {
  title: 'Components/HintLadder',
  component: HintLadder,
  parameters: {
    docs: {
      description: {
        component: `Built from the Figma component \`hints\`, node \`15831:8194\`, instanced on all four frames of the \`hint ladder\` section.

Four steps — **Hint 1 · Hint 2 · Hint 3 · Reveal** — showing how much help the student has taken on the current term.

**\`attempt1\` is not a step.** The ladder counts help taken, and the unaided attempt is the absence of it. Figma draws four steps, not five, and on \`attempt1\` none is active.

**The active step is taller as well as brighter.** \`sprint-context.md\` makes that a standing constraint: every state in this loop is distinguishable by shape as well as colour, because colour alone fails contrast and cannot carry meaning on its own.

**One departure from Figma.** The file draws climbed rungs identically to the ones ahead, which loses the fact that they are spent. Here they keep the brand hue at \`accent/brand/subtle\`, so the row reads as a path travelled.

TOKEN NOTES. The dot is 10×10 in Figma and no size step is 10 — \`space/layout/M\` (12) is the nearest bound value. The rule is 18×2; \`stroke/strong\` carries the height. Both logged in \`design-system.md\`.`,
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '390px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof HintLadder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unaided: Story = {
  name: 'rung=attempt1 — nothing lit',
  args: { rung: 'attempt1' },
  play: async ({ canvas, canvasElement }) => {
    // Four steps, never five. The unaided attempt is not a rung of help.
    await expect(canvasElement.querySelectorAll('.knw-ladder__step')).toHaveLength(4);
    await expect(canvasElement.querySelector('[data-state="active"]')).toBeNull();
    await expect(canvas.getByLabelText('No hints used yet')).toBeVisible();
  },
};

export const Hint1: Story = {
  name: 'rung=hint1',
  args: { rung: 'hint1' },
  play: async ({ canvas, canvasElement }) => {
    const active = canvasElement.querySelector('[data-state="active"]') as HTMLElement;
    await expect(active.textContent).toBe('Hint 1');

    // accent/brand/bold — violet/500, the same value the in-card hint label takes.
    const dot = active.querySelector('.knw-ladder__dot') as HTMLElement;
    await expect(getComputedStyle(dot).backgroundColor).toBe('rgb(145, 120, 230)');

    await expect(canvas.getByLabelText('Hint 1, step 1 of 4')).toBeVisible();
  },
};

export const Hint3: Story = {
  name: 'rung=hint3 — two rungs spent',
  args: { rung: 'hint3' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-state="done"]')).toHaveLength(2);
    await expect(canvasElement.querySelectorAll('[data-state="todo"]')).toHaveLength(1);

    // THE ACTIVE STEP IS TALLER, not only brighter. Colour alone cannot carry
    // state here — that is a standing constraint, not a preference.
    const active = canvasElement.querySelector('[data-state="active"] .knw-ladder__marker') as HTMLElement;
    const todo = canvasElement.querySelector('[data-state="todo"] .knw-ladder__marker') as HTMLElement;
    await expect(active.getBoundingClientRect().height)
      .toBeGreaterThan(todo.getBoundingClientRect().height);
  },
};

export const Reveal: Story = {
  name: 'rung=reveal — the end of the ladder',
  args: { rung: 'reveal' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('[data-state="done"]')).toHaveLength(3);
    await expect(canvasElement.querySelectorAll('[data-state="todo"]')).toHaveLength(0);
  },
};

export const EveryRung: Story = {
  name: 'Every rung',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['attempt1', 'hint1', 'hint2', 'hint3', 'reveal'] as const).map((r) => (
        <HintLadder key={r} rung={r} />
      ))}
    </div>
  ),
};
