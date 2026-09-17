import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { FolderCard } from './FolderCard';

/** Verbatim from the Figma component set "folderCard" (node 15700:17819). */
const FIGMA_DESCRIPTION = `Study folder entry card. Colour-band header above a metadata row with title, description, chevron, and a concept count badge.

**VARIANT AXIS** — \`accent\`: Blue | Gold

**DON'T:** Do not use accent=Gold for standard study folders — Gold signals PRO content.

**TOKEN NOTE (from Figma):** *"folder1 fill bound to background/surface as nearest token per design decision. Original #1e1e2e sits between background/page and background/surface with no matching token. Request background/card to cover this use case."* That request is also open in design-system.md's Gaps, so the card fill is a known compromise.

---

**Four values had no token, and now do.** The colour band, progress strip, tab and badge blur were unbound in Figma; each is now a semantic alias:

| | value | token |
|---|---|---|
| Colour band height | 148 | \`size/band\` |
| Progress strip height | 3 | \`size/strip\` |
| Tab height | 10 | \`size/tab\` |
| Badge background blur | 16 | \`effect/blur\` |

Two radii also gained semantic roles: \`radius/card\` (16) and \`radius/tab\` (8). Figma already bound both to primitives; there was simply no semantic name for them.

**Three absolute offsets stay as raw pixels** — the tab, the badge and the date label. design-system.md already records this under Gaps: *"Absolute-position offsets — no spatial offset tokens exist."* Each is marked in the stylesheet.

**Figma's description is out of date.** It still reads *"accent — one of: Blue | Gold"* and *"Header band fill: accent/blue/bold (Blue) or pro/bold (Gold)"*, but the set now carries a third variant, Magenta, bound to \`accent/magenta/bold\`. The description was not updated when it was added.

**The progress strip is blue in every variant.** Figma's gradient stop is \`#3a6eb0\` on Blue, Magenta *and* Gold, so a gold folder gets a blue strip. Since both the description and design-system.md call it "accent colour → transparent", each variant uses its own accent here — which is the documented intent, and is why the strip differs from the file.

**Known contrast failures, kept deliberately.** The bindings below are exactly what Figma specifies, and the decision was to stay faithful rather than diverge. The a11y panel reports them on every story:

| Element | On | Ratio | |
|---|---|---|---|
| Date label \`interactive/label/secondary\` | Blue band | 2.39:1 | fails AA |
| Date label \`interactive/label/secondary\` | Gold band | **1.64:1** | fails AA |
| Badge label \`text/tertiary\` | scrim over Blue | 2.89:1 | fails AA |
| Badge label \`text/tertiary\` | scrim over Gold | 2.47:1 | fails AA |

"PRO" at 1.64:1 on gold is effectively unreadable for some students. The system already has the pairings that would fix it — \`accent/blue/label/bold\` and \`pro/label/bold\`, whose descriptions say "text on this fill" — so this is a one-line change whenever it is wanted.`;

const meta = {
  title: 'Components/FolderCard',
  component: FolderCard,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    accent: { control: 'radio', options: ['Blue', 'Magenta', 'Gold'] },
    title: { control: 'text' },
    description: { control: 'text' },
    dateLabel: { control: 'text' },
    conceptCount: { control: 'text' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FolderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Blue: Story = {
  name: 'accent=Blue',
  args: { accent: 'Blue' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'World War II' })).toBeVisible();
    await expect(canvas.getByText('18 concepts')).toBeVisible();
    await expect(canvas.getByText('1939 – 1945')).toBeVisible();

    // Proves the token stylesheet reached the card: the band carries the blue
    // accent and the card sits on background/surface at the card radius.
    const band = canvasElement.querySelector('.knw-folder__band') as HTMLElement;
    await expect(getComputedStyle(band).backgroundColor).toBe('rgb(95, 160, 252)');
    await expect(getComputedStyle(band).height).toBe('148px');

    const card = canvasElement.querySelector('.knw-folder__card') as HTMLElement;
    await expect(getComputedStyle(card).backgroundColor).toBe('rgb(34, 36, 47)');

    // The date now takes the accent's own label token, not white on the band.
    const date = canvasElement.querySelector('.knw-folder__date') as HTMLElement;
    await expect(getComputedStyle(date).color).toBe('rgb(6, 23, 59)');
    await expect(getComputedStyle(card).borderRadius).toBe('16px');

    // The chevron is a real control with a name, not a decorative glyph.
    await expect(canvas.getByRole('button', { name: 'Open World War II' })).toBeVisible();
  },
};

export const Magenta: Story = {
  name: 'accent=Magenta',
  args: {
    accent: 'Magenta',
    title: 'Organic chemistry',
    description: 'Functional groups, reaction mechanisms, and naming.',
    dateLabel: 'Unit 5',
    conceptCount: '32 concepts',
  },
  play: async ({ canvasElement }) => {
    // Magenta was added to the set after the first build; band and tab both
    // take accent/magenta/bold.
    const band = canvasElement.querySelector('.knw-folder__band') as HTMLElement;
    const tab = canvasElement.querySelector('.knw-folder__tab') as HTMLElement;
    await expect(getComputedStyle(band).backgroundColor).toBe('rgb(232, 121, 192)');
    await expect(getComputedStyle(tab).backgroundColor).toBe('rgb(232, 121, 192)');
  },
};

export const Gold: Story = {
  name: 'accent=Gold',
  args: {
    accent: 'Gold',
    title: 'Exam crash course',
    description: 'A PRO folder. Everything you need the night before.',
    dateLabel: 'PRO',
  },
  play: async ({ canvasElement }) => {
    // Gold signals PRO, so the band and tab switch to the pro token.
    const band = canvasElement.querySelector('.knw-folder__band') as HTMLElement;
    const tab = canvasElement.querySelector('.knw-folder__tab') as HTMLElement;
    await expect(getComputedStyle(band).backgroundColor).toBe('rgb(245, 181, 61)');
    await expect(getComputedStyle(tab).backgroundColor).toBe('rgb(245, 181, 61)');
  },
};

/** Several folders stacked, which is how the card is actually used. */
export const InAList: Story = {
  name: 'accent=Blue, in a list',
  args: { accent: 'Blue' },
  render: (args) => (
    <>
      <FolderCard {...args} />
      <FolderCard
        accent="Blue"
        title="Cell biology"
        description="Organelles, mitosis, and how energy moves through a cell."
        dateLabel="Unit 3"
        conceptCount="24 concepts"
      />
      <FolderCard
        accent="Gold"
        title="Exam crash course"
        description="A PRO folder. Everything you need the night before."
        dateLabel="PRO"
        conceptCount="41 concepts"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    // Three cards stack without their absolutely-positioned tabs colliding.
    await expect(canvasElement.querySelectorAll('.knw-folder')).toHaveLength(3);
    const tabs = [...canvasElement.querySelectorAll('.knw-folder__tab')];
    const tops = tabs.map((t) => Math.round(t.getBoundingClientRect().top));
    await expect(new Set(tops).size).toBe(3);
  },
};
