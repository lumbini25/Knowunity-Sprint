import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { StatTile } from './StatTile';

/** Verbatim from the Figma component "statTile" (node 15676:16170). */
const FIGMA_DESCRIPTION = `A single stat tile: large number above a subdued label. Used on the summary screen for aggregate session stats (e.g. "24 Concepts").

**LAYER ANATOMY**

\`\`\`
statTile            fill: background/surface, radius: Radius/300
                    padding: Space/300 vertical, gap: Space/050, center-aligned
  Number            numeral, Greed/Body S Bold (font/size/sm, font/lineHeight/sm), fill: text/light
  Label             category text, Greed/Body S Regular (font/size/sm), fill: text/tertiary
\`\`\`

**USE:** Sit in a horizontal row alongside other statTile instances or alongside summarySmallCards. Single variant, no component properties. Number and label are text-editable.

**DON'T:** Do not use statTile for the recalled/need-review pair — use summarySmallCards for those.

---

**Checked \`summarySmallCards\` first, and there was nothing to extract.** That component is a fixed *pair* of tiles carrying feedback colours and a larger type scale (\`headline/XS-bold\`, 18/20); this one is a single neutral tile at \`body/S-bold\` (15/20) on \`background/surface\`. Different tokens throughout — the DON'T is right that they are not interchangeable.

**The label uses \`text/secondary\`, not Figma's \`text/tertiary\`.** This one is subtler than the other contrast fixes: \`text/tertiary\` clears AA at 4.62:1 on \`background/page\`, but this tile sits on \`background/surface\`, which is lighter — the same token drops to **4.34:1** there. \`text/secondary\` is 7.23:1. A reminder that a text token's contrast is a property of the pairing, not of the token.

**No new tokens.** \`Radius/300\` is \`radius/inner\`, added for \`recallResponseCard\`; \`Space/050\` is \`space/layout/XXS\`. Everything else already existed.

**It is instanced on no screen in Figma**, though the description places it on the summary screen.`;

const meta = {
  title: 'Components/StatTile',
  component: StatTile,
  parameters: { layout: 'centered', docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { value: { control: 'text' }, label: { control: 'text' } },
  tags: ['autodocs'],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'statTile',
  args: {},
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('24')).toBeVisible();
    await expect(canvas.getByText('Concepts')).toBeVisible();

    // Proves the token stylesheet reached the tile.
    const tile = canvasElement.querySelector('.knw-stattile') as HTMLElement;
    const s = getComputedStyle(tile);
    await expect(s.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(s.borderRadius).toBe('12px');
    await expect(s.paddingTop).toBe('12px');
    await expect(s.rowGap).toBe('2px');

    const num = getComputedStyle(canvas.getByText('24'));
    await expect(num.fontSize).toBe('15px');
    await expect(num.fontWeight).toBe('600');
    await expect(num.color).toBe('rgb(244, 242, 255)');

    const lab = getComputedStyle(canvas.getByText('Concepts'));
    await expect(lab.fontWeight).toBe('400');
    await expect(lab.color).toBe('rgba(245, 243, 255, 0.68)');
  },
};

/** The USE note: a row of tiles is how it is meant to sit. */
export const InARow: Story = {
  name: 'A row of tiles',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--semantic-space-layout-m)' }}>
      <StatTile value={24} label="Concepts" />
      <StatTile value={5} label="Terms" />
      <StatTile value="4m" label="Time" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tiles = [...canvasElement.querySelectorAll('.knw-stattile')] as HTMLElement[];
    await expect(tiles).toHaveLength(3);
    // Every tile is the same height however long its label.
    const heights = new Set(tiles.map((t) => Math.round(t.getBoundingClientRect().height)));
    await expect(heights.size).toBe(1);
  },
};
