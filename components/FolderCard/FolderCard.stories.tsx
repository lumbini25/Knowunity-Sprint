import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { FolderCard } from './FolderCard';

/** Verbatim from the Figma component set "folderCard" (node 15700:17819). */
const FIGMA_DESCRIPTION = `Study folder entry card. Colour-band header above a metadata row with title, description, chevron, and a concept count badge.

**VARIANT AXIS** — Blue | Magenta | Green.

**The axis has two names right now, and this is the honest version:** Figma calls it \`Color\`; this component's prop is still \`accent\`. It was \`accent\` in Figma too until it was renamed, and the code has not followed yet. The options match; only the label differs. Renaming the prop would also bring it in line with \`chips\`, which already uses \`color\` for the same kind of axis.

**DON'T:** Do not use Gold for standard study folders — Gold signals PRO content. There is no longer a Gold variant to reach for: see the rename note below.

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

**Figma's description is out of date.** It still reads *"accent — one of: Blue | Gold"* and *"Header band fill: accent/blue/bold (Blue) or pro/bold (Gold)"*. The set carries three: Blue, Magenta and Green.

**THE THIRD VARIANT WAS NAMED GOLD AND PAINTED GREEN.** Its band was bound to the green variable — \`0,195,134\`, which is \`accent/green/bold\` — while the variant option still read \`Gold\`. The build took the name and bound \`pro/bold\` (#f5b53d), which is how a plain study folder ended up wearing the colour the system reserves for PRO. The variant is \`Green\` in the file and here, sitting beside blue and magenta as the third decorative category accent.

**THE CARD IS 358 WIDE, AND THE COMPONENT ADDS NO SIDE GUTTER.** Figma's padding on each variant is top 16, bottom 16, **left 0, right 0** — that space is clearance for the tab poking above the card and the strip below it, not a margin. \`choose folder screen\` (15647:11079) draws the card row at the full 390 and applies the 16 itself, so the visible card comes out 358.

This component carried 16 on all four sides, so in the app the screen's gutter and the component's stacked and the card rendered **326**. Two things gave it away: that is the exact width a reviewer predicted from the stacking and which a later measurement appeared to disprove — by measuring the 358 wrapper rather than the card inside it — and \`.knw-folder__tab\`'s raw \`left: 33px\`, lifted from Figma where the variant has no side padding, was landing at 17. The stories are framed at 390 with the screen's gutter so the canvas shows the 358 the app shows.

**THE WHOLE CARD IS THE CONTROL.** The chevron used to be the only way in — a 32px circle in the corner of a card that reads as one tappable thing, and under the 44pt floor on both axes. It is decorative and \`aria-hidden\` now; a transparent button is laid over the card instead. Laid *over* rather than wrapped around, so the accessible name stays "Open <title>" rather than the card's every word, and it is the card's last child so it sits above the band, the strip and the date. It is drawn only when \`onOpen\` is wired.

**The progress strip is blue in every variant.** Figma's gradient stop is \`#3a6eb0\` on all three, so a green folder would get a blue strip. Since both the description and design-system.md call it "accent colour → transparent", each variant uses its own accent here — which is the documented intent, and is why the strip differs from the file.

**Contrast, measured.** Each variant's date label binds that accent's own \`label/bold\` token, which is precisely what those tokens are for ("Text on accent.<hue>.bold"). Both measured pairings clear AA: Blue \`blue-950\` on \`blue-400\` is **6.64:1**; Green \`green-950\` on \`green-500\` is **7.49:1**. The old gold pairing went with the variant.

An earlier version of this note listed the date label as \`interactive/label/secondary\` failing at 1.64–2.39:1. That describes a binding this component no longer uses — the accent \`label/bold\` tokens replaced it, and the numbers above are the current ones. The badge label over the band scrim is the one pairing here still worth re-measuring.`;

const meta = {
  title: 'Components/FolderCard',
  component: FolderCard,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    accent: { control: 'radio', options: ['Blue', 'Magenta', 'Green'] },
    title: { control: 'text' },
    description: { control: 'text' },
    dateLabel: { control: 'text' },
    conceptCount: { control: 'text' },
  },
  /* Wired for every story. The card draws its control only when something is
     listening — the rule this build keeps everywhere — so an unwired card is a
     display card, not the tappable one these stories are about. */
  args: { onOpen: fn() },
  /* THE SCREEN'S GUTTER, SO THE CANVAS SHOWS THE CARD THE APP SHOWS.
     The component is fluid — it fills whatever column it is given, and in the
     app that column is `.knw-screen__middle`, which pads 16 each side of a 390
     screen for a 358 card. Rendered bare, the story stretched the card to the
     full canvas and quietly disagreed with both Figma and the route.

     The frame is fixed rather than inherited because a docs page renders its
     stories inline and is not constrained by the 390 viewport, so on that page
     the card would stretch again. 390 as a literal is the standing call in
     `.storybook/preview.tsx`: "Device width is deliberately not a design token
     ... it belongs here in build config." */
  decorators: [
    (Story) => (
      <div
        style={{
          width: '390px',
          maxWidth: '100%',
          boxSizing: 'border-box',
          paddingInline: 'var(--semantic-space-layout-l)',
        }}
      >
        <Story />
      </div>
    ),
  ],
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

    /* 358 — the width Figma draws and the width the route renders. The
       component adds no side gutter of its own (its padding is 16 top and
       bottom, 0 either side); the 390 frame around this story supplies the
       screen's 16, exactly as `.knw-screen__middle` does in the app. Carrying
       a gutter here as well is what made the card 326. */
    await expect(Math.round(card.getBoundingClientRect().width)).toBe(358);

    /* The tab's offset is measured from the card's edge, which is what its raw
       `left: 33px` means in Figma. Under a second gutter it sat at 17. */
    const tab = canvasElement.querySelector('.knw-folder__tab') as HTMLElement;
    await expect(
      Math.round(tab.getBoundingClientRect().left - card.getBoundingClientRect().left),
    ).toBe(33);

    // The date now takes the accent's own label token, not white on the band.
    const date = canvasElement.querySelector('.knw-folder__date') as HTMLElement;
    await expect(getComputedStyle(date).color).toBe('rgb(6, 23, 59)');
    await expect(getComputedStyle(card).borderRadius).toBe('16px');

    /* THE WHOLE CARD IS THE TARGET, not the chevron. The chevron was a 32px
       circle in the corner of a 358×282 card that reads as one tappable thing
       — so the card promised a tap everywhere and answered in one corner.
       Asserted by geometry, because the name alone would still pass if the
       control shrank back to the glyph. */
    const open = canvas.getByRole('button', { name: 'Open World War II' });
    await expect(open).toBeVisible();

    /* Against the card's PADDING box, not its border box. `inset: 0` on an
       absolutely-positioned child resolves inside the border, so the target is
       the card less its 1px rim — and the card clips to its radius anyway, so
       a negative inset would only be clipped back. `clientWidth` is the
       padding box by definition, which makes this an equality rather than a
       tolerance. */
    const o = open.getBoundingClientRect();
    await expect(Math.round(o.width)).toBe(card.clientWidth);
    await expect(Math.round(o.height)).toBe(card.clientHeight);

    // And the chevron is no longer a control, so it is not announced as one.
    await expect(canvasElement.querySelector('button.knw-folder__chevron')).toBeNull();
    await expect(
      (canvasElement.querySelector('.knw-folder__chevron') as HTMLElement).getAttribute('aria-hidden'),
    ).toBe('true');
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

export const Green: Story = {
  name: 'accent=Green',
  args: {
    accent: 'Green',
    title: 'Civil Rights Movement',
    description: 'Key figures, landmark rulings, and the road to the Voting Rights Act.',
    dateLabel: '1954 – 1968',
  },
  play: async ({ canvasElement }) => {
    /* The third accent is green and always was — the variant simply carried
       the name `Gold`, so the build bound `pro/bold` (245,181,61) to a card
       Figma paints in the green variable. This asserts the paint, not the
       name: 0,195,134 is `accent/green/bold`, the same value the file's band
       is bound to, and the same ramp blue and magenta sit on. */
    const band = canvasElement.querySelector('.knw-folder__band') as HTMLElement;
    const tab = canvasElement.querySelector('.knw-folder__tab') as HTMLElement;
    await expect(getComputedStyle(band).backgroundColor).toBe('rgb(0, 195, 134)');
    await expect(getComputedStyle(tab).backgroundColor).toBe('rgb(0, 195, 134)');
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
        accent="Green"
        title="Civil Rights Movement"
        description="Key figures, landmark rulings, and the road to the Voting Rights Act."
        dateLabel="1954 – 1968"
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
