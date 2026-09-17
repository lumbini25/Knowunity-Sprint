import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TextBlock } from './TextBlock';

/** Verbatim from the Figma component set "textBlock" (node 9003:9039). */
const FIGMA_DESCRIPTION = `Heading and caption pair. 4 sizes (XL–S), caption toggled by boolean. No icons, no interactive state.

**USE:** Section headers, card titles, empty state headings. XL for screen-level, S for card-level.

**DON'T:** Use for interactive labels or button text — it has no press state.

---

**Every value matched a semantic token exactly.** Seven type styles, two gaps and two colours, all bound in Figma, all landing on an existing token with the same font size, line height, weight and tracking. No approximations, no drift, nothing added to \`tokens.json\`. This is the first component in the project where that was true.

| variant | title | caption | gap | align |
|---|---|---|---|---|
| XL | \`display/M\` 76/76 | \`headline/XS-regular\` 18/20 | \`layout/XS\` | centre |
| L | \`headline/XL\` 44/44 | \`headline/XS-regular\` 18/20 | \`layout/XS\` | centre |
| M | \`body/M-bold\` 18/24 | \`caption/M-regular\` 12/16 | \`layout/XXS\` | left |
| S | \`body/S-bold\` 15/20 | \`caption/S-regular\` 9/12 | \`layout/XXS\` | left |

**Alignment is part of the variant, not a prop.** XL and L are centred, M and S are left-aligned. Figma sets \`textAlignHorizontal\` per variant with no property to override it, so there is no \`align\` prop here either.

**Two token names read oddly, and both are correct.** The M and S *titles* use \`body/*\` styles rather than \`headline/*\` — \`headline/XS-bold\` is 18/**20**, but Figma draws the M title at 18/**24**, so \`body/M-bold\` is the exact match. The XL and L *captions* use \`headline/XS-regular\`, a headline style doing caption duty. In both cases all four attributes match, so the token is right and only the name is surprising.

**\`headingLevel\` is not a Figma property.** Figma has no concept of heading rank; the browser does. The title renders as \`h2\` by default and the prop exists so a page of these nests correctly for screen readers. Nothing else in the component is invented.`;

const meta = {
  title: 'Components/TextBlock',
  component: TextBlock,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    variant: { control: 'radio', options: ['XL', 'L', 'M', 'S'] },
    title: { control: 'text' },
    caption: { control: 'text' },
    showCaption: { control: 'boolean' },
    headingLevel: { control: 'select', options: [1, 2, 3, 4, 5, 6] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px', padding: 'var(--semantic-space-layout-l)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TextBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const XL: Story = {
  name: 'variant=XL',
  args: { variant: 'XL', title: 'Nice work', caption: 'You recalled 18 of 24 concepts.' },
  play: async ({ canvas, canvasElement }) => {
    const title = canvas.getByRole('heading', { name: 'Nice work' });
    const s = getComputedStyle(title);

    // Proves the token stylesheet reached the block: display/M, at the colour
    // and tracking Figma binds.
    await expect(s.fontSize).toBe('76px');
    await expect(s.lineHeight).toBe('76px');
    await expect(s.fontWeight).toBe('700');
    await expect(s.color).toBe('rgb(244, 242, 255)');
    // tracking/tight is -1, emitted as -0.01em — -0.76px at this size.
    await expect(s.letterSpacing).toBe('-0.76px');

    const caption = canvas.getByText('You recalled 18 of 24 concepts.');
    const cs = getComputedStyle(caption);
    await expect(cs.fontSize).toBe('18px');
    await expect(cs.lineHeight).toBe('20px');
    await expect(cs.fontWeight).toBe('400');
    await expect(cs.color).toBe('rgba(245, 243, 255, 0.68)');

    // Screen-level sizes are centred, with the wider of the two gaps.
    const block = canvasElement.querySelector('.knw-textblock') as HTMLElement;
    await expect(getComputedStyle(block).rowGap).toBe('4px');
    await expect(getComputedStyle(block).textAlign).toBe('center');
  },
};

export const L: Story = {
  name: 'variant=L',
  args: { variant: 'L', title: 'Ready to start?', caption: 'Six topics from your last session.' },
  play: async ({ canvas, canvasElement }) => {
    const s = getComputedStyle(canvas.getByRole('heading', { name: 'Ready to start?' }));
    await expect(s.fontSize).toBe('44px');
    await expect(s.lineHeight).toBe('44px');
    await expect(s.fontWeight).toBe('700');

    // L shares XL's caption style and centring.
    const cs = getComputedStyle(canvas.getByText('Six topics from your last session.'));
    await expect(cs.fontSize).toBe('18px');
    await expect(cs.lineHeight).toBe('20px');

    const block = canvasElement.querySelector('.knw-textblock') as HTMLElement;
    await expect(getComputedStyle(block).textAlign).toBe('center');
  },
};

export const M: Story = {
  name: 'variant=M',
  args: { variant: 'M', title: 'Topics to revisit', caption: 'Three from this session.' },
  play: async ({ canvas, canvasElement }) => {
    // body/M-bold, not headline/XS-bold — the line height is 24, not 20.
    const s = getComputedStyle(canvas.getByRole('heading', { name: 'Topics to revisit' }));
    await expect(s.fontSize).toBe('18px');
    await expect(s.lineHeight).toBe('24px');
    await expect(s.fontWeight).toBe('600');

    const cs = getComputedStyle(canvas.getByText('Three from this session.'));
    await expect(cs.fontSize).toBe('12px');
    await expect(cs.lineHeight).toBe('16px');

    // Card-level sizes are left-aligned, with the tighter gap.
    const block = canvasElement.querySelector('.knw-textblock') as HTMLElement;
    await expect(getComputedStyle(block).rowGap).toBe('2px');
    await expect(getComputedStyle(block).textAlign).toBe('left');
  },
};

export const S: Story = {
  name: 'variant=S',
  args: { variant: 'S', title: 'Civil rights', caption: '24 concepts' },
  play: async ({ canvas, canvasElement }) => {
    const s = getComputedStyle(canvas.getByRole('heading', { name: 'Civil rights' }));
    await expect(s.fontSize).toBe('15px');
    await expect(s.lineHeight).toBe('20px');
    await expect(s.fontWeight).toBe('600');

    // The smallest caption on the scale.
    const cs = getComputedStyle(canvas.getByText('24 concepts'));
    await expect(cs.fontSize).toBe('9px');
    await expect(cs.lineHeight).toBe('12px');

    const block = canvasElement.querySelector('.knw-textblock') as HTMLElement;
    await expect(getComputedStyle(block).textAlign).toBe('left');
  },
};

export const NoCaption: Story = {
  name: 'showCaption=false',
  args: { variant: 'M', title: 'Topics to revisit', showCaption: false },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'Topics to revisit' })).toBeVisible();
    await expect(canvasElement.querySelector('.knw-textblock__caption')).toBeNull();
  },
};

/** The whole axis at once, which is how the set reads in Figma. */
export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--semantic-space-layout-xl)' }}>
      <TextBlock variant="XL" title="Header" caption="Caption" />
      <TextBlock variant="L" title="Header" caption="Caption" />
      <TextBlock variant="M" title="Header" caption="Caption" />
      <TextBlock variant="S" title="Header" caption="Caption" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-textblock')).toHaveLength(4);

    // The four sizes step down, and none of them repeat.
    const sizes = [...canvasElement.querySelectorAll('.knw-textblock__title')].map((el) =>
      parseFloat(getComputedStyle(el).fontSize),
    );
    await expect(sizes).toEqual([76, 44, 18, 15]);
  },
};
