import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { SummarySmallCards } from './SummarySmallCards';

/** Verbatim from the Figma component "summarySmallCards" (node 15676:15996). */
const FIGMA_DESCRIPTION = `Paired stat tiles for the session summary screen. Fixed layout: left tile shows recalled count (green), right tile shows need-review count (red).

**LAYER ANATOMY**

\`\`\`
Container (left)    fill: background/surface, radius: Radius/300
                    padding: Space/400 horizontal, Space/300 vertical, gap: Space/100
  Score text        numeral, Greed/Headline XS Bold (font/size/md), fill: feedback/success/surface/bold
  Label             "Recalled", Greed/Caption M Bold (font/size/xs), fill: feedback/success/surface/bold
Container (right)   fill: background/surface, radius: Radius/300
  Score text        numeral, Greed/Headline XS Bold (font/size/md), fill: feedback/error/bold
  Label             "Need Review", Greed/Caption M Bold, fill: feedback/error/bold
\`\`\`

**TOKEN NOTE:** *"Original tile backgrounds were raw alpha fills (12% green, 20% red) with no semantic token. Bound to background/surface as the nearest available token per design decision. Visual difference from original: tiles appear dark rather than tinted. Request feedback/success/surface/wash and feedback/error/surface/wash tokens for the intended tinted look."*

**DON'T**
- Do not separate the two tiles — they are a single component designed as a pair.
- Do not add a third tile — use \`statTile\` for additional standalone stats.

design-system.md adds: **"Summary screen, as the primary recalled/review split. Single variant."**

---

**No variant axis and no properties.** The component set defines nothing at all — \`componentPropertyDefinitions\` is empty — so there is nothing to turn into variant props. The four content props are the numbers and captions; the first DON'T is why there is no way to render a single tile.

**Nothing was reusable.** \`textBlock\` is the only stacked heading-and-caption pair, but it pairs two *different* type styles per variant, and this tile sets its score and its label in the same one. Nothing else in the library is a stat tile.

**No new tokens were needed** — every binding resolved, including \`radius/inner\` (12), which was added for \`recallResponseCard\` and turns out to be exactly this tile's \`Radius/300\`.

---

**Three things in the file no longer match the descriptions.**

**1. The two tiles have different fills now.** The TOKEN NOTE says both are bound to \`background/surface\`. Only the left one still is. The right tile is bound to \`feedback/error/surface/subtle\` — so the red tile has been given its tinted wash and the green one has not. That is visible in the component: one dark tile beside one tinted tile.

**2. That wash now has a token.** \`feedback/error/surface/subtle\` is a \`COMPOSE_COLOR\` expression in Figma — \`color/red/200\` at 20% — which is why it had no counterpart at first. It has since been added to \`tokens.json\` along with the success, warning and partial washes, so this tile carries Figma's actual binding.

**3. The label is not a caption.** Both descriptions say the label is \`Greed/Caption M Bold (font/size/xs)\` — 12px. In the file both the score *and* the label are set in \`font/size/md\` at \`font/lineHeight/sm\`, semibold, loose tracking: 18/20, which is \`headline/XS-bold\`. The label matches the score exactly. The nodes were followed.

**The green text is also a step lighter than documented.** The descriptions say \`feedback/success/surface/bold\` (\`green/500\`); the nodes bind \`feedback/success/surface/label/subtle\` (\`green/300\`) — the brighter mint. Followed the nodes.`;

const meta = {
  title: 'Components/SummarySmallCards',
  component: SummarySmallCards,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    recalledCount: { control: 'text' },
    recalledLabel: { control: 'text' },
    reviewCount: { control: 'text' },
    reviewLabel: { control: 'text' },
  },
  // 318px is the width Figma draws the pair at.
  decorators: [
    (Story) => (
      <div style={{ width: '318px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SummarySmallCards>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's own defaults: 7 recalled, 3 to review. */
export const Default: Story = {
  name: 'summarySmallCards',
  args: { recalledCount: 7, recalledLabel: 'Recalled', reviewCount: 3, reviewLabel: 'Need Review' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('7')).toBeVisible();
    await expect(canvas.getByText('Recalled')).toBeVisible();
    await expect(canvas.getByText('3')).toBeVisible();
    await expect(canvas.getByText('Need Review')).toBeVisible();

    const [recalled, review] = [...canvasElement.querySelectorAll('.knw-summarycards__tile')] as HTMLElement[];

    // Proves the token stylesheet reached the tiles: the two fills differ,
    // which is the change the TOKEN NOTE has not caught up with.
    await expect(getComputedStyle(recalled).backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(getComputedStyle(review).backgroundColor).toBe('rgba(252, 165, 165, 0.2)');

    // Radius/300, which is radius/inner.
    await expect(getComputedStyle(recalled).borderRadius).toBe('12px');
    await expect(getComputedStyle(recalled).paddingTop).toBe('12px');
    await expect(getComputedStyle(recalled).paddingLeft).toBe('16px');

    // Both tiles fill, so they split the row evenly.
    const wr = Math.round(recalled.getBoundingClientRect().width);
    const wv = Math.round(review.getBoundingClientRect().width);
    await expect(wr).toBe(wv);

    // Figma draws the pair 68 tall: 12 + 20 + 4 + 20 + 12.
    await expect(Math.round(recalled.getBoundingClientRect().height)).toBe(68);
  },
};

export const Colours: Story = {
  name: 'Tile colours',
  args: { recalledCount: 7, reviewCount: 3 },
  play: async ({ canvas }) => {
    // Green tile: the brighter mint the nodes bind, not the green/500 the
    // description names.
    await expect(getComputedStyle(canvas.getByText('Recalled')).color).toBe('rgb(74, 229, 176)');
    await expect(getComputedStyle(canvas.getByText('7')).color).toBe('rgb(74, 229, 176)');

    // Red tile.
    await expect(getComputedStyle(canvas.getByText('Need Review')).color).toBe('rgb(252, 165, 165)');
    await expect(getComputedStyle(canvas.getByText('3')).color).toBe('rgb(252, 165, 165)');
  },
};

export const Typography: Story = {
  name: 'Score and label share one style',
  args: { recalledCount: 7 },
  play: async ({ canvas }) => {
    // Both are headline/XS-bold at 18/20 — the label is not a caption, which is
    // where the description is wrong.
    const score = getComputedStyle(canvas.getByText('7'));
    const label = getComputedStyle(canvas.getByText('Recalled'));
    await expect(score.fontSize).toBe('18px');
    await expect(score.lineHeight).toBe('20px');
    await expect(score.fontWeight).toBe('600');
    await expect(label.fontSize).toBe(score.fontSize);
    await expect(label.lineHeight).toBe(score.lineHeight);
    await expect(label.fontWeight).toBe(score.fontWeight);
  },
};

/** A perfect session, and a hard one — the tiles never resize. */
export const OtherScores: Story = {
  name: 'Other scores',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--semantic-space-layout-m)' }}>
      <SummarySmallCards recalledCount={10} reviewCount={0} />
      <SummarySmallCards recalledCount={0} reviewCount={10} />
      <SummarySmallCards recalledCount={128} reviewCount={64} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const tiles = [...canvasElement.querySelectorAll('.knw-summarycards__tile')] as HTMLElement[];
    await expect(tiles).toHaveLength(6);
    // Every tile is the same width regardless of the number it holds.
    const widths = tiles.map((t) => Math.round(t.getBoundingClientRect().width));
    await expect(new Set(widths).size).toBe(1);
  },
};
