import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Percentage } from './Percentage';

/** Verbatim from the Figma component "percentage" (node 15676:15985). */
const FIGMA_DESCRIPTION = `Circular session score display for the summary screen. Shows recalled fraction ("7/10") and a "Recalled" label inside a rotating donut ring SVG.

**LAYER ANATOMY**

\`\`\`
percentage          154×154, absolute-layout
  Container         centered, vertical, holds score + label text
    Score text      "7/10", Greed/Headline M Bold (font/size/xl, font/lineHeight/md — closest token to 32px)
                    fill: text/light, tracking: font/tracking/tight
    Recalled label  "Recalled", Greed/Body S Regular (font/size/sm, font/lineHeight/sm)
                    fill: text/tertiary, tracking: font/tracking/loose
  Icon (donut ring) SVG 154×154, absolute, rotated −90°
                    ring color: feedback/success/surface/bold in production
\`\`\`

**TOKEN NOTE:** *"lineHeight for score text is bound to font/lineHeight/md (24px) — the design value of 32px has no token. Request font/lineHeight/lg2 (32px) or use the headline M text style once it covers 32px line height."*

**Single variant. No component properties. Score and label are text-editable.**

design-system.md repeats the same note and adds: **"Summary screen only."**

---

**Nothing was reusable.** \`textBlock\` is the only heading-and-caption pair in the library, but its four variants pair \`display/M\`+\`headline/XS\` down to \`body/S-bold\`+\`caption/S\`, and this needs \`headline/M\`+\`body/S-regular\`. No variant matches, and these two texts sit inside a ring rather than stacking on their own.

**Figma rebuilt this component after it was first built here, and the code follows the new file.** It is now a component set (\`15765:19368\`) with a \`Property 1\` axis of Default | Variant2, the set description is empty, and both changes below came out of that rebuild:

| property | before | now |
|---|---|---|
| Score type | Bold 28/**24** | Bold 28/**32** |
| Label type | Regular **15/20** (\`body/S-regular\`) | Regular **18/24** (\`body/M-regular\`) |
| Container | 63×44 | 65×56 |

**The TOKEN NOTE's gap is now closed on both sides.** It asked for a \`font/lineHeight/lg2\` at 32px. \`font/lineHeight/lg\` was already 32 and \`headline/M\` already composed 28/32/bold/tight, so the score was built at 32 from the start — and Figma has since moved the score to 28/32 itself. The file and the code now agree. **design-system.md's Gaps still lists \`font/lineHeight/lg2\` as an open request; it can be struck.**

**The \`Property 1\` axis was not turned into a prop.** Its two variants are preset score-and-arc pairs — Default is 7/10 at ~80%, Variant2 is 3/10 at ~34% — and \`value\` with \`total\` already produces both, plus every score in between. Adding a variant prop would mean two ways to say the same thing, and the arc would stop tracking the number. The \`Property 1=Variant2\` story below renders that variant's values through the props.

**No variant axis, so no variant props.** The file says "Single variant. No component properties" outright. \`value\` and \`total\` replace the editable "7/10" text because the same two numbers also drive the arc — a score that disagrees with the ring should not be expressible.

**The ring in Figma does not match the score it surrounds.** Its arc sweeps −5.0122 rad ≈ 287°, which is 79.8%, while the label reads 7/10. Here the arc is computed from \`value / total\`, so 7/10 draws 70%. Figma's arc is a design-time drawing, the same way \`progressIndicator\`'s five preset steps are.

**The ring colour is the file's, not the description's.** The description says *"ring color: feedback/success/surface/bold in production"*, but no such token exists — \`feedback/success\` has \`bold\`, \`subtle\` and two label roles, none of them a "surface/bold". The ellipse is actually bound to \`accent/brand/bold\`, so that is what is used. Either add the token or correct the description.

**Two tokens were added:** \`size/score/ring\` (121) and \`size/score/stroke\` (8), both measured off the ellipse — Figma binds neither, and the ring thickness is only recoverable from its \`innerRadius\` of 0.8735. The 154 outer frame needed no token: it is the ring plus \`space/layout/L\` padding, which lands at 153 against Figma's 154.

**Figma's rounded arc caps needed no radius token.** The ellipse carries \`Radius/150\` (6) on its corners; \`stroke-linecap: round\` produces the same soft ends from the stroke width alone.

**The arc carries no numbers from React.** The circle is given \`pathLength="100"\`, so its dash array is a percentage and every dimension — centre, radius, stroke width — stays in the stylesheet as a token.`;

const meta = {
  title: 'Components/Percentage',
  component: Percentage,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    value: { control: { type: 'number', min: 0 } },
    total: { control: { type: 'number', min: 1 } },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Percentage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma's own defaults: 7 of 10, "Recalled". */
export const Default: Story = {
  name: 'percentage',
  args: { value: 7, total: 10, label: 'Recalled' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('7/10')).toBeVisible();
    await expect(canvas.getByText('Recalled')).toBeVisible();

    // Proves the token stylesheet reached the component: headline/M at the
    // 32px line height the TOKEN NOTE asks for, not the 24 Figma fell back to.
    const ss = getComputedStyle(canvas.getByText('7/10'));
    await expect(ss.fontSize).toBe('28px');
    await expect(ss.lineHeight).toBe('32px');
    await expect(ss.fontWeight).toBe('700');
    await expect(ss.letterSpacing).toBe('-0.28px');
    await expect(ss.color).toBe('rgb(244, 242, 255)');

    // The label is body/S-regular in the tertiary colour.
    const ls = getComputedStyle(canvas.getByText('Recalled'));
    await expect(ls.fontSize).toBe('18px');
    await expect(ls.lineHeight).toBe('24px');
    await expect(ls.fontWeight).toBe('400');
    await expect(ls.color).toBe('rgba(245, 243, 255, 0.48)');

    // The ring is the token diameter and thickness.
    const ring = canvasElement.querySelector('.knw-percentage__ring') as SVGElement;
    await expect(getComputedStyle(ring).width).toBe('121px');
    const arc = canvasElement.querySelector('.knw-percentage__arc') as SVGCircleElement;
    await expect(getComputedStyle(arc).strokeWidth).toBe('8px');
    await expect(getComputedStyle(arc).stroke).toBe('rgb(145, 120, 230)');

    // The frame pads the ring out towards Figma's 154.
    const root = canvasElement.querySelector('.knw-percentage') as HTMLElement;
    await expect(Math.round(root.getBoundingClientRect().width)).toBe(153);

    // Score + label stack to Figma's 56-tall Container: 32 + 24.
    const content = canvasElement.querySelector('.knw-percentage__content') as HTMLElement;
    const score = canvas.getByText('7/10').getBoundingClientRect();
    const lab = canvas.getByText('Recalled').getBoundingClientRect();
    await expect(Math.round(lab.bottom - score.top)).toBe(56);
    await expect(content).toBeTruthy();

    // The arc covers 70%, matching the score rather than Figma's static 79.8%.
    await expect(arc.getAttribute('stroke-dasharray')).toBe('70 100');
  },
};

/** Figma's Property 1=Variant2, expressed through value and total. */
export const Variant2: Story = {
  name: 'Property 1=Variant2 (3/10)',
  args: { value: 3, total: 10, label: 'Recalled' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('3/10')).toBeVisible();
    // Figma's Variant2 arc sweeps 5.619 -> 3.458 rad, about 34%. Driving it
    // from the score gives a clean 30% and keeps ring and number in step.
    const arc = canvasElement.querySelector('.knw-percentage__arc') as SVGCircleElement;
    await expect(arc.getAttribute('stroke-dasharray')).toBe('30 100');
  },
};

export const Empty: Story = {
  name: 'value=0',
  args: { value: 0, total: 10 },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('0/10')).toBeVisible();
    // Nothing recalled draws no arc at all.
    const arc = canvasElement.querySelector('.knw-percentage__arc') as SVGCircleElement;
    await expect(arc.getAttribute('stroke-dasharray')).toBe('0 100');
  },
};

export const Full: Story = {
  name: 'value=total',
  args: { value: 10, total: 10 },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('10/10')).toBeVisible();
    // A perfect score closes the ring.
    const arc = canvasElement.querySelector('.knw-percentage__arc') as SVGCircleElement;
    await expect(arc.getAttribute('stroke-dasharray')).toBe('100 100');
  },
};

export const CustomLabel: Story = {
  name: 'label override',
  args: { value: 4, total: 12, label: 'Needs review' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('4/12')).toBeVisible();
    await expect(canvas.getByText('Needs review')).toBeVisible();
    // 4/12 rounds to 33%.
    const arc = canvasElement.querySelector('.knw-percentage__arc') as SVGCircleElement;
    await expect(arc.getAttribute('stroke-dasharray')).toBe('33 100');

    // The whole thing reads as one image, not three loose strings.
    await expect(canvas.getByRole('img', { name: '4 of 12 needs review' })).toBeVisible();
  },
};

/** A range of scores, to show the arc tracking the number. */
export const Range: Story = {
  name: 'A range of scores',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Percentage value={0} total={10} />
      <Percentage value={3} total={10} />
      <Percentage value={7} total={10} />
      <Percentage value={10} total={10} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dashes = [...canvasElement.querySelectorAll('.knw-percentage__arc')].map((a) =>
      a.getAttribute('stroke-dasharray'),
    );
    await expect(dashes).toEqual(['0 100', '30 100', '70 100', '100 100']);
  },
};
