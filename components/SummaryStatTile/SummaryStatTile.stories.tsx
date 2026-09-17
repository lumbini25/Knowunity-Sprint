import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { SummaryStatTile } from './SummaryStatTile';

/**
 * The component's own Figma description, quoted, plus what the file does not
 * say and a reader still needs.
 */
const DESCRIPTION = `Built from the Figma component **"Summary Stat tile"** (node \`15857:10047\`).

From the component's Figma description:

> "This 3 tile system should be. shown on summary screen."

---

**It is not a variant set.** Its parent in the file is a section rather than a component set, so there are no variants to map onto props. The three tiles are fixed; what changes is the numbers in them.

**That is also why it is one component and not three.** Hinted, Perfect and Missed divide a single session between them — the row only means something whole. A tile on its own would invite being used as a general-purpose stat, and that is what \`statTile\` already is.

**WHAT NOT TO DO**

- **Do not use it for the recalled / need-review pair.** That is \`summarySmallCards\`, a two-tile component built for exactly that split.
- **Do not use it outside the summary screen.** The description is explicit about where it belongs.
- **Do not mix the accent families.** Each tile takes one pair — the bold surface, the label colour made for that surface, and the same bold again for the figure. Borrowing a label token from another family is the swap \`design-system.md\`'s "Never do this" exists to stop.

---

**TOKEN NOTE.** Figma sets the figure at **24/20 Heavy**. Neither half exists in the system: 24 sits between the scale's 21 and 28, and the only semantic step carrying Heavy is \`display/L\` at 76 — so \`24/Heavy\` has no step to take. **\`headline/S\` (21, Bold)** is the nearest bound one and is what this uses. Everything else maps exactly: \`accent/{blue,green,brand}/bold\` on the three surfaces, the matching \`accent/*/label/bold\` on each label, \`background/page\` on the inner panel, \`radius/card\` on both, \`radius/strip\` on the label, and \`body/S-bold\` for the label type.

**The labels are sentence case in the source and capitalised in CSS.** Figma types two of the three in capitals and one in sentence case; the capitals are a type treatment, so \`text-transform\` carries them and the strings obey \`CLAUDE.md\`.`;

const meta = {
  title: 'Components/SummaryStatTile',
  component: SummaryStatTile,
  parameters: { docs: { description: { component: DESCRIPTION } } },
  decorators: [
    (Story) => (
      <div style={{ width: '390px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SummaryStatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Summary Stat tile',
  args: { hinted: 3, perfect: '6/10', missed: 1 },
  play: async ({ canvas, canvasElement }) => {
    // Figma's own defaults, in Figma's order: how much help was taken, then
    // what needed none, then what got away.
    const tiles = [...canvasElement.querySelectorAll('.knw-statrow__tile')];
    await expect(tiles).toHaveLength(3);
    await expect(tiles.map((t) => t.getAttribute('data-tone')))
      .toEqual(['hinted', 'perfect', 'missed']);
    await expect(tiles.map((t) => t.querySelector('dd')!.textContent))
      .toEqual(['3', '6/10', '1']);

    // Each tile takes ONE accent pair: surface, its label colour, and the same
    // bold again for the figure.
    const hinted = tiles[0] as HTMLElement;
    const surface = getComputedStyle(hinted).backgroundColor;
    const figure = getComputedStyle(hinted.querySelector('dd') as HTMLElement).color;
    await expect(surface).toBe('rgb(95, 160, 252)');
    await expect(figure).toBe(surface);

    // The figure is headline/S — 21, Bold. Figma's 24/Heavy has no step.
    await expect(getComputedStyle(hinted.querySelector('dd') as HTMLElement).fontSize).toBe('21px');

    // A <dl>, so each label is paired with its figure rather than read as six
    // loose strings.
    await expect(canvas.getByText('Hinted').tagName).toBe('DT');
  },
};

export const APerfectSession: Story = {
  name: 'Nothing missed',
  args: { hinted: 0, perfect: '4/4', missed: 0 },
  play: async ({ canvasElement }) => {
    // The tiles never resize or disappear on a zero — the split is the point,
    // and a missing tile would read as a different session rather than a
    // better one.
    await expect(canvasElement.querySelectorAll('.knw-statrow__tile')).toHaveLength(3);
    const values = [...canvasElement.querySelectorAll('dd')].map((d) => d.textContent);
    await expect(values).toEqual(['0', '4/4', '0']);
  },
};

export const AHardSession: Story = {
  name: 'Mostly missed',
  args: { hinted: 1, perfect: '1/4', missed: 2 },
};

export const LongFigures: Story = {
  name: 'Two-digit counts',
  args: { hinted: 12, perfect: '18/30', missed: 10 },
  play: async ({ canvasElement }) => {
    // The row is three equal columns, so a longer figure does not push the
    // others out of line.
    const w = [...canvasElement.querySelectorAll('.knw-statrow__tile')]
      .map((t) => Math.round(t.getBoundingClientRect().width));
    await expect(new Set(w).size).toBe(1);
  },
};
