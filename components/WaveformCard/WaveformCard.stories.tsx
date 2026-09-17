import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { WaveformCard } from './WaveformCard';

/** Verbatim from the Figma component set "waveformCard" (node 15667:13354). */
const FIGMA_DESCRIPTION = `24-bar voice amplitude visualiser shown during the listening phase of the Explain Out Loud recall loop. Bars scale with the student's voice amplitude in production — this component shows the design-time resting position.

**VARIANT AXIS** — \`state\`: Idle | Talking

**USE:** Place directly below mascotSlot in the listening screen. Switch to state=Talking when audio capture starts; switch to state=Idle when the student is not yet speaking or has paused.

**DON'T:** Use this component in the thinking state. Once the answer is sent, replace with voiceFab at state=Thinking. A waveform in the thinking state implies audio is still being captured.

Each variant carries its own description:

> **state=Idle** — Microphone is on, student is not speaking. All 24 bars use background/contrast (#f4f2ff). *TOKEN NOTE: background/contrast is intentionally repurposed here… Introduce mascot/waveform/idle at that point.*
>
> **state=Talking** — Bars 01–20: mascot/primary. Bars 21–24: interactive/secondary. *TAIL BAR TOKEN NOTE: interactive/secondary is repurposed for bars 21–24. Its semantic meaning is 'ghost button fill' but the resolved value (10% white) correctly represents a fading amplitude tail… Introduce mascot/waveform/tail at that point.*

---

**Bar heights are data, not design.** The component's own description says *"Bar heights are animation data — overridden by the motion layer in production."* They arrive as an \`amplitudes\` prop and are applied as a share of the tallest, so whatever the motion layer sends can never overflow the row. The default is Figma's resting position, the same call made on \`progressIndicator\`'s preset steps.

**Two token gaps, knowingly repurposed.** \`mascot/waveform/idle\` and \`mascot/waveform/tail\` are already open requests in design-system.md's Gaps. Idle uses \`background/contrast\` and the tail uses \`interactive/secondary\`, exactly as the file does — neither token was invented to close the gap.

**Bar width is 3.5px in Figma and has no token.** \`size/strip\` (3) is the nearest and is what is used; the half-pixel is invisible at 390px. Logged as a gap.

---

**Two things in the file that look wrong.**

**Idle's bars carry no fill binding at all.** Every one of the 24 is unbound, though the variant description specifies \`background/contrast\`. The description is followed here — otherwise the bars would be invisible.

**Talking's Bar 19 is bound to \`mascot/eyes\`**, not \`mascot/primary\`. Its own description says bars 01–20 are \`mascot/primary\`, so one bar out of 24 is in the wrong colour. The description is followed; the file should be corrected.`;

const meta = {
  title: 'Components/WaveformCard',
  component: WaveformCard,
  parameters: { layout: 'centered', docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { state: { control: 'radio', options: ['Idle', 'Talking'] } },
  decorators: [(Story) => (<div style={{ width: '358px' }}><Story /></div>)],
  tags: ['autodocs'],
} satisfies Meta<typeof WaveformCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  name: 'state=Idle',
  args: { state: 'Idle' },
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector('.knw-waveform') as HTMLElement;
    const s = getComputedStyle(card);

    // Proves the token stylesheet reached the card.
    await expect(s.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(s.borderTopColor).toBe('rgba(255, 255, 255, 0.1)');
    await expect(s.borderRadius).toBe('16px');
    await expect(s.paddingTop).toBe('16px');
    await expect(s.paddingLeft).toBe('32px');

    // 24 bars, all flat and silent.
    const bars = canvasElement.querySelectorAll('.knw-waveform__bar');
    await expect(bars).toHaveLength(24);
    const bs = getComputedStyle(bars[0] as HTMLElement);
    await expect(bs.backgroundColor).toBe('rgb(244, 242, 255)');
    await expect(bs.width).toBe('3px');
  },
};

export const Talking: Story = {
  name: 'state=Talking',
  args: { state: 'Talking' },
  play: async ({ canvasElement }) => {
    const bars = [...canvasElement.querySelectorAll('.knw-waveform__bar')] as HTMLElement[];
    await expect(bars).toHaveLength(24);

    // Bars 01-20 take the mascot violet.
    await expect(getComputedStyle(bars[0]).backgroundColor).toBe('rgb(145, 120, 230)');
    await expect(getComputedStyle(bars[19]).backgroundColor).toBe('rgb(145, 120, 230)');

    // Bars 21-24 are the fading tail.
    await expect(getComputedStyle(bars[20]).backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
    await expect(getComputedStyle(bars[23]).backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
  },
};

/** Amplitudes are live data in production, so any array works. */
export const LiveAmplitudes: Story = {
  name: 'amplitudes (live data)',
  args: { state: 'Talking', amplitudes: [4, 40, 8, 44, 12, 38, 6, 42, 10, 36, 5, 44, 9, 40, 7, 34, 11, 44, 6, 38, 8, 20, 10, 4] },
  play: async ({ canvasElement }) => {
    const bars = [...canvasElement.querySelectorAll('.knw-waveform__bar')] as HTMLElement[];
    // The tallest bar fills the row; nothing overflows it.
    const heights = bars.map((b) => b.getBoundingClientRect().height);
    const row = (canvasElement.querySelector('.knw-waveform__bars') as HTMLElement).getBoundingClientRect().height;
    await expect(Math.round(Math.max(...heights))).toBe(Math.round(row));
    await expect(heights.every((h) => h <= row + 0.5)).toBe(true);
  },
};

export const BothStates: Story = {
  name: 'Both states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--semantic-space-layout-m)' }}>
      <WaveformCard state="Idle" />
      <WaveformCard state="Talking" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-waveform')).toHaveLength(2);
    await expect(canvasElement.querySelectorAll('.knw-waveform__bar')).toHaveLength(48);
  },
};
