import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ProgressIndicator } from './ProgressIndicator';

/** Verbatim from the Figma component set "progressIndicator" (node 9003:8923). */
const FIGMA_DESCRIPTION = `Horizontal completion bar. 2 color variants (Primary, Coral), 2 thicknesses (16, 24), 5 preset progress steps. Optional numeric label controlled by a boolean.

**USE:** Exam plan progress, session bars, quiz position indicators (e.g. 1/3). Show the numeric label when the percentage adds useful context.

**DON'T:** Treat the preset steps as live data — in production, bar width is driven by real data.

---

**\`progress\` takes any number, not just the five steps.** The DON'T above is the reason: the five variants are design-time representations, so constraining the prop to them would build the thing the description warns against. The five are still the stories, named the way Figma names them.

**One token was added: \`size/bar\`.** The bar heights are the only values in this component Figma does not bind — 24, 20 and 16 are raw frame sizes, and \`thickness\` is a variant label rather than a variable. \`size/control/XS\` is 24 and \`size/control/XXS\` is 20, but both describe chips, and nothing in the system was 16 except \`size/icon/S\`. Rather than put an icon token on a bar height, \`size/bar/{M,S,track}\` now exists as a role of its own — the same move \`size/band\`, \`size/strip\` and \`size/tab\` made for folderCard. Figma has no variables behind it yet; that request is logged in design-system.md's Gaps.

**The two thicknesses are different structures, not one bar at two heights.** \`thickness=24\` is an outer pill with a 2px gutter around an inset track. \`thickness=16\` is a single flush bar with no gutter.

**\`showText\` does nothing at \`thickness=16\`.** The 16 variants have no text node for the boolean to reveal — the property exists on the set, but only the 24 variants draw a label. That is Figma's behaviour and it is matched here rather than silently improved.

**\`progress=0\` is a dot, not an empty bar.** Figma draws the fill at the track's own height instead of zero width, so the bar never reads as broken or unloaded. Both thicknesses do this.

**Two smaller notes.** Figma's track stroke binds to \`border/subtle\`, which does not exist in tokens.json — but it resolves to white at 10%, which is exactly \`border/default\`, so the value is right and only the name drifted. And the track radius binds to \`Radius/300\` (12), which is more than half the track height in both thicknesses, so the browser clamps it to a pill; \`radius/pill\` renders identically and the system has no radius at 12.`;

const meta = {
  title: 'Components/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    variant: { control: 'radio', options: ['Primary', 'Coral'] },
    thickness: { control: 'radio', options: ['24', '16'] },
    progress: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    showText: { control: 'boolean' },
    text: { control: 'text' },
  },
  // 350px is the width Figma draws the set at: 390 less a 20px page margin
  // each side.
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ===== variant=Primary, thickness=24 ===== */

export const Primary24Progress0: Story = {
  name: 'variant=Primary, thickness=24, progress=0',
  args: { variant: 'Primary', thickness: '24', progress: 0, text: '0/12' },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector('.knw-progress') as HTMLElement;
    const track = canvasElement.querySelector('.knw-progress__track') as HTMLElement;
    const fill = canvasElement.querySelector('.knw-progress__fill') as HTMLElement;

    // Proves the token stylesheet reached the bar: the outer pill, the 2px
    // gutter and the inset track are all token-driven.
    const bs = getComputedStyle(bar);
    await expect(bs.height).toBe('24px');
    await expect(bs.padding).toBe('2px');
    await expect(bs.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
    await expect(getComputedStyle(track).height).toBe('20px');
    await expect(getComputedStyle(track).borderTopColor).toBe('rgba(255, 255, 255, 0.1)');

    // At zero the fill is a dot the height of the track, not nothing.
    await expect(Math.round(fill.getBoundingClientRect().width)).toBe(20);
    await expect(getComputedStyle(fill).backgroundColor).toBe('rgb(145, 120, 230)');

    // The label is off until showText asks for it.
    await expect(canvasElement.querySelector('.knw-progress__label')).toBeNull();
  },
};

export const Primary24Progress25: Story = {
  name: 'variant=Primary, thickness=24, progress=25',
  args: { variant: 'Primary', thickness: '24', progress: 25, text: '3/12' },
};

export const Primary24Progress50: Story = {
  name: 'variant=Primary, thickness=24, progress=50',
  args: { variant: 'Primary', thickness: '24', progress: 50, text: '6/12' },
  play: async ({ canvasElement }) => {
    // Half the track, within a pixel of Figma's 173 on a 346-wide track.
    const track = canvasElement.querySelector('.knw-progress__track') as HTMLElement;
    const fill = canvasElement.querySelector('.knw-progress__fill') as HTMLElement;
    const ratio = fill.getBoundingClientRect().width / track.getBoundingClientRect().width;
    await expect(ratio).toBeGreaterThan(0.49);
    await expect(ratio).toBeLessThan(0.51);
  },
};

export const Primary24Progress75: Story = {
  name: 'variant=Primary, thickness=24, progress=75',
  args: { variant: 'Primary', thickness: '24', progress: 75, text: '9/12' },
};

export const Primary24Progress100: Story = {
  name: 'variant=Primary, thickness=24, progress=100',
  args: { variant: 'Primary', thickness: '24', progress: 100, text: '12/12' },
  play: async ({ canvasElement }) => {
    // Full means the fill reaches the track's inner edge exactly.
    const track = canvasElement.querySelector('.knw-progress__track') as HTMLElement;
    const fill = canvasElement.querySelector('.knw-progress__fill') as HTMLElement;
    await expect(Math.round(fill.getBoundingClientRect().width)).toBe(
      Math.round(track.getBoundingClientRect().width) - 2,
    );
  },
};

/* ===== variant=Primary, thickness=16 ===== */

export const Primary16Progress0: Story = {
  name: 'variant=Primary, thickness=16, progress=0',
  args: { variant: 'Primary', thickness: '16', progress: 0 },
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector('.knw-progress') as HTMLElement;
    const fill = canvasElement.querySelector('.knw-progress__fill') as HTMLElement;

    // No gutter on this thickness: the track is flush with the outer pill.
    await expect(getComputedStyle(bar).height).toBe('16px');
    await expect(getComputedStyle(bar).padding).toBe('0px');
    await expect(getComputedStyle(canvasElement.querySelector('.knw-progress__track') as HTMLElement).height).toBe('16px');

    // The zero dot shrinks with the bar.
    await expect(Math.round(fill.getBoundingClientRect().width)).toBe(16);
  },
};

export const Primary16Progress25: Story = {
  name: 'variant=Primary, thickness=16, progress=25',
  args: { variant: 'Primary', thickness: '16', progress: 25 },
};

export const Primary16Progress50: Story = {
  name: 'variant=Primary, thickness=16, progress=50',
  args: { variant: 'Primary', thickness: '16', progress: 50 },
};

export const Primary16Progress75: Story = {
  name: 'variant=Primary, thickness=16, progress=75',
  args: { variant: 'Primary', thickness: '16', progress: 75 },
};

export const Primary16Progress100: Story = {
  name: 'variant=Primary, thickness=16, progress=100',
  args: { variant: 'Primary', thickness: '16', progress: 100 },
};

/* ===== variant=Coral, thickness=24 ===== */

export const Coral24Progress0: Story = {
  name: 'variant=Coral, thickness=24, progress=0',
  args: { variant: 'Coral', thickness: '24', progress: 0, text: '0/12' },
};

export const Coral24Progress25: Story = {
  name: 'variant=Coral, thickness=24, progress=25',
  args: { variant: 'Coral', thickness: '24', progress: 25, text: '3/12' },
};

export const Coral24Progress50: Story = {
  name: 'variant=Coral, thickness=24, progress=50',
  args: { variant: 'Coral', thickness: '24', progress: 50, text: '6/12' },
  play: async ({ canvasElement }) => {
    // Coral swaps the fill and nothing else.
    const fill = canvasElement.querySelector('.knw-progress__fill') as HTMLElement;
    await expect(getComputedStyle(fill).backgroundColor).toBe('rgb(251, 126, 91)');

    const bar = canvasElement.querySelector('.knw-progress') as HTMLElement;
    await expect(getComputedStyle(bar).backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
  },
};

export const Coral24Progress75: Story = {
  name: 'variant=Coral, thickness=24, progress=75',
  args: { variant: 'Coral', thickness: '24', progress: 75, text: '9/12' },
};

export const Coral24Progress100: Story = {
  name: 'variant=Coral, thickness=24, progress=100',
  args: { variant: 'Coral', thickness: '24', progress: 100, text: '12/12' },
};

/* ===== variant=Coral, thickness=16 ===== */

export const Coral16Progress0: Story = {
  name: 'variant=Coral, thickness=16, progress=0',
  args: { variant: 'Coral', thickness: '16', progress: 0 },
};

export const Coral16Progress25: Story = {
  name: 'variant=Coral, thickness=16, progress=25',
  args: { variant: 'Coral', thickness: '16', progress: 25 },
};

export const Coral16Progress50: Story = {
  name: 'variant=Coral, thickness=16, progress=50',
  args: { variant: 'Coral', thickness: '16', progress: 50 },
};

export const Coral16Progress75: Story = {
  name: 'variant=Coral, thickness=16, progress=75',
  args: { variant: 'Coral', thickness: '16', progress: 75 },
};

export const Coral16Progress100: Story = {
  name: 'variant=Coral, thickness=16, progress=100',
  args: { variant: 'Coral', thickness: '16', progress: 100 },
};

/* ===== showText ===== */

export const ShowText: Story = {
  name: 'showText=true',
  args: { variant: 'Primary', thickness: '24', progress: 50, showText: true, text: '6/12' },
  play: async ({ canvas, canvasElement }) => {
    const label = canvas.getByText('6/12');
    await expect(label).toBeVisible();

    // caption/S-bold, in the secondary label colour.
    const s = getComputedStyle(label);
    await expect(s.fontSize).toBe('9px');
    await expect(s.lineHeight).toBe('12px');
    await expect(s.fontWeight).toBe('600');
    await expect(s.color).toBe('rgb(244, 242, 255)');

    // Centred over the whole bar, not over the fill.
    const bar = canvasElement.querySelector('.knw-progress') as HTMLElement;
    const br = bar.getBoundingClientRect();
    const lr = label.getBoundingClientRect();
    await expect(Math.round(lr.left + lr.width / 2)).toBe(Math.round(br.left + br.width / 2));
  },
};

export const ShowTextOnThin: Story = {
  name: 'showText=true, thickness=16',
  args: { variant: 'Primary', thickness: '16', progress: 50, showText: true, text: '6/12' },
  play: async ({ canvasElement }) => {
    // Figma's 16 variants have no text node, so the boolean has nothing to
    // reveal. Matched rather than quietly improved.
    await expect(canvasElement.querySelector('.knw-progress__label')).toBeNull();
  },
};

/** Live data, which is what the DON'T says the bar is actually for. */
export const LiveValue: Story = {
  name: 'progress=37 (live data)',
  args: { variant: 'Primary', thickness: '24', progress: 37, showText: true, label: 'Exam plan progress' },
  play: async ({ canvas }) => {
    // Any percentage works, not only the five design-time steps.
    const bar = canvas.getByRole('progressbar', { name: 'Exam plan progress' });
    await expect(bar).toHaveAttribute('aria-valuenow', '37');
    await expect(canvas.getByText('37%')).toBeVisible();
  },
};
