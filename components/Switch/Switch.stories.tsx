import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { Switch, type SwitchActive } from './Switch';

const FIGMA_DESCRIPTION = `Two-state toggle for a setting that applies immediately.

**The Figma component has no description.** Neither the set (\`switch\`, node 4154:16180) nor any of its four variants carries one, so there is no "what it's for" or "don't do this" to quote here. Everything below is read off the layers instead. If a description gets written in Figma, it belongs in this block verbatim.

**VARIANT AXES** — \`state\`: Default | Disabled · \`isActive\`: True | False

**What each combination draws:**

| state | isActive | track | knob |
|---|---|---|---|
| Default | False | \`background/elevated\` | \`interactive/label/secondary\` |
| Default | True | \`interactive/primary\` | \`interactive/label/primary\` |
| Disabled | False | \`background/elevated\` | \`interactive/disabled\` |
| Disabled | True | \`interactive/disabled\` | \`interactive/disabled\` |

Note the asymmetry: disabling an *off* switch dims only the knob and leaves the resting track, but disabling an *on* switch dims the track as well, so it cannot be mistaken for live. That is Figma's choice, not an inference.

---

**Every colour matched a token exactly.** Five bindings, five exact hits, nothing approximated.

**One size had no token: the 52px track.** The knob (24), the track height (32), the 4px inset and the pill radius are all bound, but nothing in the system is 52. Rather than add a token for a single component, the width is written as the sum it actually is — one control height plus one knob travel, \`calc(size/control/S + size/control/XXS)\` — which is exact and contains no raw number. If switches spread beyond this one place, \`size/switch/track\` is the request to make.

**The knob's travel distance is never written down.** The on state anchors the knob to the right inset instead of moving it by a measured amount, so the travel falls out of the track width. Change the width and the knob still lands correctly.

**\`isActive\` is a string, not a boolean.** Figma's options are the words \`True\` and \`False\`, and the standing rule is that variants become props with the same names and the same options. \`chips\` already models its \`active\` axis the same way, so the two are consistent.

**Keyboard and screen-reader behaviour is not from Figma.** The switch renders as a real \`<button role="switch">\` with \`aria-checked\`, so it is reachable by keyboard and announces its state. Figma has no way to express any of that.`;

const meta = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    state: { control: 'radio', options: ['Default', 'Disabled'] },
    isActive: { control: 'radio', options: ['True', 'False'] },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px', padding: 'var(--semantic-space-layout-l)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultFalse: Story = {
  name: 'state=Default, isActive=False',
  args: { state: 'Default', isActive: 'False', label: 'Voice replies' },
  play: async ({ canvas, canvasElement }) => {
    const el = canvas.getByRole('switch', { name: 'Voice replies' });
    await expect(el).toHaveAttribute('aria-checked', 'false');

    // Proves the token stylesheet reached the switch: the resting track, the
    // knob colour, and the 52×32 pill Figma draws.
    const s = getComputedStyle(el);
    await expect(s.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
    await expect(s.width).toBe('52px');
    await expect(s.height).toBe('32px');

    const knob = canvasElement.querySelector('.knw-switch__knob') as HTMLElement;
    const ks = getComputedStyle(knob);
    await expect(ks.backgroundColor).toBe('rgb(244, 242, 255)');
    await expect(ks.width).toBe('24px');
    await expect(ks.left).toBe('4px');
  },
};

export const DefaultTrue: Story = {
  name: 'state=Default, isActive=True',
  args: { state: 'Default', isActive: 'True', label: 'Voice replies' },
  play: async ({ canvas, canvasElement }) => {
    const el = canvas.getByRole('switch', { name: 'Voice replies' });
    await expect(el).toHaveAttribute('aria-checked', 'true');

    // On flips both fills: the track takes the primary CTA colour and the knob
    // takes the colour that sits on top of it.
    await expect(getComputedStyle(el).backgroundColor).toBe('rgb(244, 242, 255)');

    const knob = canvasElement.querySelector('.knw-switch__knob') as HTMLElement;
    await expect(getComputedStyle(knob).backgroundColor).toBe('rgb(9, 12, 24)');

    // The knob sits against the right inset, 24px from the left of a 52px track.
    await expect(Math.round(knob.offsetLeft)).toBe(24);
  },
};

export const DisabledFalse: Story = {
  name: 'state=Disabled, isActive=False',
  args: { state: 'Disabled', isActive: 'False', label: 'Voice replies' },
  play: async ({ canvas, canvasElement }) => {
    const el = canvas.getByRole('switch', { name: 'Voice replies' });
    await expect(el).toBeDisabled();

    // Only the knob dims — the track keeps its resting fill.
    await expect(getComputedStyle(el).backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
    const knob = canvasElement.querySelector('.knw-switch__knob') as HTMLElement;
    await expect(getComputedStyle(knob).backgroundColor).toBe('rgba(255, 255, 255, 0.3)');
  },
};

export const DisabledTrue: Story = {
  name: 'state=Disabled, isActive=True',
  args: { state: 'Disabled', isActive: 'True', label: 'Voice replies' },
  play: async ({ canvas, canvasElement }) => {
    const el = canvas.getByRole('switch', { name: 'Voice replies' });
    await expect(el).toBeDisabled();
    await expect(el).toHaveAttribute('aria-checked', 'true');

    // Here the track dims too, so an on switch cannot be mistaken for live.
    await expect(getComputedStyle(el).backgroundColor).toBe('rgba(255, 255, 255, 0.3)');
    const knob = canvasElement.querySelector('.knw-switch__knob') as HTMLElement;
    await expect(getComputedStyle(knob).backgroundColor).toBe('rgba(255, 255, 255, 0.3)');
  },
};

/** Tapping moves the knob. Disabled switches do not respond. */
export const Interactive: Story = {
  name: 'Toggling',
  render: function Render() {
    const [active, setActive] = useState<SwitchActive>('False');
    return <Switch state="Default" isActive={active} onToggle={setActive} label="Voice replies" />;
  },
  play: async ({ canvas, canvasElement }) => {
    const el = canvas.getByRole('switch', { name: 'Voice replies' });
    await expect(el).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(el);
    await expect(el).toHaveAttribute('aria-checked', 'true');
    await expect(Math.round((canvasElement.querySelector('.knw-switch__knob') as HTMLElement).offsetLeft)).toBe(24);

    await userEvent.click(el);
    await expect(el).toHaveAttribute('aria-checked', 'false');
    await expect(Math.round((canvasElement.querySelector('.knw-switch__knob') as HTMLElement).offsetLeft)).toBe(4);
  },
};

export const DisabledDoesNotToggle: Story = {
  name: 'Disabled does not toggle',
  render: function Render() {
    const [active, setActive] = useState<SwitchActive>('False');
    return <Switch state="Disabled" isActive={active} onToggle={setActive} label="Voice replies" />;
  },
  play: async ({ canvas }) => {
    const el = canvas.getByRole('switch', { name: 'Voice replies' });
    await userEvent.click(el);
    // Still off: a disabled button never fires its handler.
    await expect(el).toHaveAttribute('aria-checked', 'false');
  },
};

/** All four combinations, which is how the set reads in Figma. */
export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: 'var(--semantic-space-layout-l)' }}>
      <Switch state="Default" isActive="False" label="Default off" />
      <Switch state="Default" isActive="True" label="Default on" />
      <Switch state="Disabled" isActive="False" label="Disabled off" />
      <Switch state="Disabled" isActive="True" label="Disabled on" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-switch')).toHaveLength(4);
    // Two knobs sit left, two sit right.
    const lefts = [...canvasElement.querySelectorAll('.knw-switch__knob')].map(
      (k) => Math.round((k as HTMLElement).offsetLeft),
    );
    await expect(lefts).toEqual([4, 24, 4, 24]);
  },
};
