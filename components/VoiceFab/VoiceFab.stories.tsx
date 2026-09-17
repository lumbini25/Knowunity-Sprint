import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { VoiceFab } from './VoiceFab';
import { SearchIcon } from '../TextField/icons';

/** Verbatim from the Figma component set "voiceFab" (node 15703:17937). */
const FIGMA_DESCRIPTION = `Circular tap target for voice input in the Explain Out Loud recall loop.

**VARIANT AXIS** — \`state\`: Idle | Recording | Sent | Disabled | Thinking

**PROPERTIES**
- \`label\` (text) — Overrides the caption below the button. Idle default: "Tap to answer" · Recording default: "Tap to send" · Sent default: "Answer sent".
- \`showLabel\` (boolean) — Hides the Label node. Default: true. Set to false when the parent screen provides its own label, or for compact placements.
- \`icon\` (instance swap) — Swaps the icon in state=Sent. Default: iconSlot Size=400. In state=Idle and state=Recording the icon is the mic illustration (custom vectors, not swappable via this property).

**DON'T**
- Do not use state=Recording when the student has already sent their answer.
- Do not add a second label node — use the \`showLabel\` property.
- Do not resize the Ring ellipse independently of the Button — both scale together.

Each state also carries its own description in Figma:

> **Idle** — Mic is ready. Student has not started speaking. Ring at 15% opacity. Icon: mic. Label: 'Tap to answer'.
>
> **Recording** — Student is actively speaking. Ring pulses at full opacity (mascot/primary). Push-to-talk: student taps the button again to submit, or taps the trash discard icon to cancel and re-record.
>
> **Sent** — Momentary confirmation that the answer was dispatched. Shown for ~600ms before Thinking.
>
> **Thinking** — Knowie is evaluating. Label: 'Evaluating…', fill: text/disabled. Non-interactive — do not expose a tap target in this state.
>
> **Disabled** — Microphone permission denied or feature gated. interactive/disabled fill. Icon: mic at text/disabled. No ring. Non-interactive.

---

**Built from:** \`IconSlot\` at \`Size=400\` — which is what Figma's \`icon\` property actually points at (node \`9003:8810\`) — plus \`CheckIcon\` from Checkbox for the Sent glyph. The mic is four vectors copied from the file.

**Figma rebuilt voiceFab after this was written, and the code follows the new nodes.** Three changes:

| property | before | now |
|---|---|---|
| Idle + Sent button fill | \`interactive/primary\` (near-white) | \`accent/brand/bold\` (violet) |
| Thinking orb | 140, blur 3.92 | **172**, blur **4.82** |
| Thinking overlay | empty rect, nothing drawn | a real image, SCREEN blend |

That last one reverses what is recorded below: Thinking's overlay rectangle used to have \`fills: []\`. The rebuild added a second Mask Group with an actual image in it, so Thinking now has its own sheen — far fainter than Recording's — exported to \`public/images/voicefab-thinking-orb.png\`. \`size/fab/thinking\` (172) was added and \`effect/blur-soft\` moved from 4 to 5.

**Two of the three "blockers" turned out not to exist.** Reading the layer tree suggested Recording and Thinking needed a blue \`mascot/orb\` gradient and two raster assets. Rendering the variants showed otherwise:

- The orb gradient ellipse is \`isMask: true\` — it is the mask shape, not a fill, so **the blue never paints**. Both orb states are \`mascot/primary\` violet. No blue tokens were needed and none were added.
- Thinking's overlay rectangle has \`fills: []\`. It is empty. Thinking is the violet orb with a slight defocus, nothing more.
- Only Recording has a real asset: a greyscale highlight on black, meant for \`screen\` blending. It was **exported from Figma at 2×** to \`public/images/voicefab-recording-orb.png\` rather than approximated.

**Ten tokens were added, all traced to a value in the file.** Nothing was measured by eye:

| token | value | where it came from |
|---|---|---|
| \`size/fab/ring\` | 170 | Ring ellipse |
| \`size/fab/button\` | 140 | Button ellipse |
| \`size/fab/orb\` | 215 | Recording orb |
| \`size/fab/glyph\` | 56 | mic container (Figma draws 55.4) |
| \`mascot/ring/idle\` | violet 500 @ 15% | Ring opacity, Idle |
| \`mascot/ring/sent\` | violet 500 @ 20% | Ring opacity, Sent |
| \`mascot/glow\` | white @ 40% | Recording drop shadow — **already existed** as \`alpha/light-40\`, so it aliases that |
| \`effect/glow\` | 37 | Recording shadow blur (36.86) |
| \`effect/blur-soft\` | 4 | Thinking layer blur (3.92) |

**Figma contradicts itself about Recording.** Both the component description and design-system.md give Recording the Idle anatomy — Ring 170 + Button 140 + mic icon. The actual \`state=Recording\` node is the orb at 215×215 with the mic layer *hidden*, built like Thinking. The node was followed, not the prose, because the node is what renders.

**Idle puts its caption above the button; every other state puts it below.** design-system.md's anatomy lists the Label last in all of them, so the file and the docs disagree. Rendering the variants confirmed the file: Idle really does draw "Tap to answer" on top. The file is followed here, because the file is what renders — but one of the two is wrong and it is worth deciding which.

**The Thinking and Disabled labels fail AA, and are kept deliberately.** Both bind to \`text/disabled\` — 40% white — which reads 3.77:1 on the page, under the 4.5:1 minimum. The bindings are exactly what Figma specifies so they have not been changed. \`text/tertiary\` (48%, 4.66:1) is the smallest fix. This is the same failure \`tabs\` reports on its inactive labels, from the same token — worth fixing once in \`tokens.json\` rather than per component.

**Nothing animates.** design-system.md gates this explicitly: *"Animation values for voiceFab recording pulse, thinkingBubble orb … must be agreed before they are used in code."* Recording's "ring pulses" and Thinking's orb are both static here, which is exactly how Figma draws them. The motion spec is still an open request.`;

const meta = {
  title: 'Components/VoiceFab',
  component: VoiceFab,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    state: { control: 'radio', options: ['Idle', 'Recording', 'Sent', 'Disabled', 'Thinking'] },
    label: { control: 'text' },
    showLabel: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof VoiceFab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
  name: 'state=Idle',
  args: { state: 'Idle', onPress: fn() },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Tap to answer')).toBeVisible();
    // Idle is a real tap target.
    await expect(canvas.getByRole('button', { name: 'Tap to answer' })).toBeVisible();

    // Proves the token stylesheet reached the fab: ring 170, button 140, and
    // the halo at 15%.
    const ring = canvasElement.querySelector('.knw-fab__ring') as HTMLElement;
    const rs = getComputedStyle(ring);
    await expect(rs.width).toBe('170px');
    await expect(rs.backgroundColor).toBe('rgba(145, 120, 230, 0.15)');

    const button = canvasElement.querySelector('.knw-fab__button') as HTMLElement;
    const bs = getComputedStyle(button);
    await expect(bs.width).toBe('140px');
    await expect(bs.backgroundColor).toBe('rgb(145, 120, 230)');

    // The mic sits at the token glyph size, in the on-primary colour.
    const glyph = canvasElement.querySelector('.knw-fab__glyph') as HTMLElement;
    await expect(getComputedStyle(glyph).width).toBe('56px');
    await expect(getComputedStyle(glyph).color).toBe('rgb(9, 12, 24)');

    // Idle is the one state whose caption sits above the button.
    const label = canvasElement.querySelector('.knw-fab__label') as HTMLElement;
    const stage = canvasElement.querySelector('.knw-fab__stage') as HTMLElement;
    await expect(label.getBoundingClientRect().top).toBeLessThan(stage.getBoundingClientRect().top);
  },
};

export const Recording: Story = {
  name: 'state=Recording',
  args: { state: 'Recording', onPress: fn() },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Tap to send')).toBeVisible();

    // The orb is larger than the resting button and takes the mascot violet.
    const button = canvasElement.querySelector('.knw-fab__button') as HTMLElement;
    const bs = getComputedStyle(button);
    await expect(bs.width).toBe('215px');
    await expect(bs.backgroundColor).toBe('rgb(145, 120, 230)');
    // White glow at the token blur radius.
    await expect(bs.boxShadow).toContain('37px');

    // The exported highlight is layered on at screen blend.
    const sheen = canvasElement.querySelector('.knw-fab__sheen') as HTMLElement;
    await expect(sheen).toBeTruthy();
    const ss = getComputedStyle(sheen);
    await expect(ss.mixBlendMode).toBe('screen');
    await expect(ss.backgroundImage).toContain('voicefab-recording-orb.png');

    // No ring: the orb replaces it.
    await expect(canvasElement.querySelector('.knw-fab__ring')).toBeNull();
  },
};

export const Sent: Story = {
  name: 'state=Sent',
  args: { state: 'Sent', onPress: fn() },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Answer sent')).toBeVisible();

    // Same surface as Idle; the halo lifts from 15% to 20%.
    const ring = canvasElement.querySelector('.knw-fab__ring') as HTMLElement;
    await expect(getComputedStyle(ring).backgroundColor).toBe('rgba(145, 120, 230, 0.2)');

    // The glyph is an IconSlot at Size=400, which is what Figma's icon
    // property defaults to.
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    await expect(slot).toBeTruthy();
    await expect(getComputedStyle(slot).width).toBe('32px');
  },
};

export const Disabled: Story = {
  name: 'state=Disabled',
  args: { state: 'Disabled' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Microphone unavailable')).toBeVisible();

    // Non-interactive: design-system.md says do not expose a tap target.
    await expect(canvas.queryByRole('button')).toBeNull();

    // No ring, and the button takes the disabled fill.
    await expect(canvasElement.querySelector('.knw-fab__ring')).toBeNull();
    const button = canvasElement.querySelector('.knw-fab__button') as HTMLElement;
    await expect(getComputedStyle(button).backgroundColor).toBe('rgba(255, 255, 255, 0.3)');

    // Mic and label both drop to the disabled text colour.
    const glyph = canvasElement.querySelector('.knw-fab__glyph') as HTMLElement;
    await expect(getComputedStyle(glyph).color).toBe('rgba(255, 255, 255, 0.4)');
  },
};

export const Deny: Story = {
  name: 'state=Deny',
  args: { state: 'Deny' },
  play: async ({ canvas, canvasElement }) => {
    // Idle's structure, recoloured: the ring survives, which is what keeps it
    // recognisable as the same orb rather than a different control.
    await expect(canvasElement.querySelector('.knw-fab__ring')).toBeTruthy();
    const glyph = canvasElement.querySelector('.knw-fab__glyph') as HTMLElement;
    await expect(glyph).toBeTruthy();

    // The button turns destructive and the mic drops to the error wash.
    const button = canvasElement.querySelector('.knw-fab__button') as HTMLElement;
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(255, 107, 107)');

    // Non-interactive: tapping a blocked mic does nothing, so there is no
    // tap target at all — the escape is the button below it on the screen.
    await expect(canvas.queryByRole('button')).toBeNull();

    // Figma's own label on this variant is still Idle's; the caption here says
    // what the state actually is. `showLabel=false` on the denied screen.
    await expect(canvas.getByText('Microphone blocked')).toBeVisible();
  },
};

export const Thinking: Story = {
  name: 'state=Thinking',
  args: { state: 'Thinking' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Evaluating…')).toBeVisible();

    // Non-interactive, per the state's own description.
    await expect(canvas.queryByRole('button')).toBeNull();

    // The violet orb at the resting size, slightly defocused. Figma's mask
    // group paints nothing, so there is no gradient here.
    const button = canvasElement.querySelector('.knw-fab__button') as HTMLElement;
    const bs = getComputedStyle(button);
    await expect(bs.width).toBe('172px');
    await expect(bs.backgroundColor).toBe('rgb(145, 120, 230)');
    await expect(bs.filter).toBe('blur(5px)');

    // The label dims along with the state, and sits below the orb.
    const label = canvasElement.querySelector('.knw-fab__label') as HTMLElement;
    await expect(getComputedStyle(label).color).toBe('rgba(245, 243, 255, 0.48)');
    const stage = canvasElement.querySelector('.knw-fab__stage') as HTMLElement;
    await expect(label.getBoundingClientRect().top).toBeGreaterThan(stage.getBoundingClientRect().top);
  },
};

/* ===== properties ===== */

export const NoLabel: Story = {
  name: 'showLabel=false',
  args: { state: 'Idle', showLabel: false, onPress: fn() },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-fab__label')).toBeNull();
    // The button keeps its name even with the caption hidden.
    await expect(canvas.getByRole('button', { name: 'Tap to answer' })).toBeVisible();
  },
};

export const CustomLabel: Story = {
  name: 'label override',
  args: { state: 'Idle', label: 'Hold to explain' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Hold to explain')).toBeVisible();
  },
};

export const SwappedIcon: Story = {
  name: 'icon swap (state=Sent)',
  args: { state: 'Sent', icon: <SearchIcon />, onPress: fn() },
  play: async ({ canvasElement }) => {
    // Figma's icon property only affects Sent; the slot still sizes it.
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('32px');
    await expect(slot.querySelector('svg')).toBeTruthy();
  },
};

/** All five states, which is how the set reads in Figma. */
export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--semantic-space-layout-xl)' }}>
      <VoiceFab state="Idle" onPress={fn()} />
      <VoiceFab state="Recording" onPress={fn()} />
      <VoiceFab state="Sent" onPress={fn()} />
      <VoiceFab state="Thinking" />
      <VoiceFab state="Disabled" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-fab')).toHaveLength(5);
    // Three of the five are tappable; Thinking and Disabled are not — and
    // "tappable" now also means a handler was supplied, because a state that
    // can be tapped is not the same as one that does something.
    await expect(canvasElement.querySelectorAll('button.knw-fab__stage')).toHaveLength(3);
    // Only Idle and Sent draw a halo.
    await expect(canvasElement.querySelectorAll('.knw-fab__ring')).toHaveLength(2);
  },
};
