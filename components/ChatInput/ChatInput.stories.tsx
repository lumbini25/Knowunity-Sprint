import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { ChatInput } from './ChatInput';

/** Verbatim from the Figma component set "Chat Input" (node 3249:84007). */
const FIGMA_DESCRIPTION = `The text input bar for the Knowie chat interface. 6 status variants: Inactive (empty, placeholder visible), Typing (user is entering text), Ready to send (text present, send affordance active), Long input (text exceeds one line), Recording (microphone is capturing voice), Loading (awaiting a response). Contains an input container with placeholder text, a leading icon slot, and a trailing icon slot.

**USE:** The persistent input bar at the bottom of any Knowie chat or coaching session. Swap the status variant to reflect the current interaction state — never manually hide or show internal elements.

**DON'T:** Use for non-chat text entry. For standalone form fields use a text field component. Do not leave the component in Inactive state while the user is typing.

---

**Two things differ from the Figma file, both deliberate:**

- **Type.** Every text node in the Figma component is Inter Variable 14px with no text style applied, which is neither the system font nor a step on the type scale. The text binds to \`body.S-bold\` instead — 15px semibold in Greed Standard-TRIAL — so it is token-bound and matches \`button\`.
- **The send mark.** Figma binds it to \`interactive/secondary\`, which is 10% white on a near-white button and therefore invisible. It uses \`interactive/label/primary\` here, the pairing the system documents for a light fill.
- **The placeholder.** Figma binds it to \`text/disabled\`, which is 3.8:1 on the field and fails WCAG AA. It uses \`text/tertiary\` here — 4.86:1 — which also reads better, since a placeholder is a prompt rather than a disabled control.

Recording is a visual state only. Nothing captures audio.`;

const meta = {
  title: 'Components/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    status: {
      control: 'radio',
      options: ['Inactive', 'Typing', 'Ready to send', 'Long input', 'Recording', 'Loading'],
    },
    placeholder: { control: 'text' },
    value: { control: 'text' },
  },
  args: { placeholder: 'Ask anything...', onLeadingPress: fn() },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inactive: Story = {
  name: 'Status=Inactive',
  args: { status: 'Inactive', onLeadingPress: fn() },
  play: async ({ canvas, canvasElement }) => {
    // Empty, placeholder visible, microphone offered.
    await expect(canvas.getByText('Ask anything...')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Record voice' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Add attachment' })).toBeVisible();

    // Proves the token stylesheet loaded: the field rests on background/input
    // and the leading control is a 56px circle. Note the token resolves to an
    // opaque navy 900; Figma's own background/input is a 10% white wash over
    // the page, which lands in much the same place.
    const field = canvasElement.querySelector('.knw-chat__field') as HTMLElement;
    await expect(getComputedStyle(field).backgroundColor).toBe('rgb(26, 28, 38)');
    const leading = canvasElement.querySelector('.knw-chat__leading') as HTMLElement;
    await expect(getComputedStyle(leading).width).toBe('56px');

    // The placeholder is on the type scale, not Figma's off-system 14px Inter.
    const text = canvasElement.querySelector('.knw-chat__text') as HTMLElement;
    await expect(getComputedStyle(text).fontSize).toBe('15px');
  },
};

export const Typing: Story = {
  name: 'Status=Typing',
  args: { status: 'Typing', onLeadingPress: fn() },
  play: async ({ canvasElement }) => {
    // The caret is what separates Typing from Inactive.
    const caret = canvasElement.querySelector('.knw-chat__caret') as HTMLElement;
    await expect(caret).not.toBeNull();
    await expect(getComputedStyle(caret).width).toBe('1px');
  },
};

export const ReadyToSend: Story = {
  name: 'Status=Ready to send',
  args: { status: 'Ready to send', value: 'Something truly smart', onLeadingPress: fn() },
  play: async ({ canvas, canvasElement }) => {
    // The student's text replaces the placeholder, in the primary text colour.
    await expect(canvas.getByText('Something truly smart')).toBeVisible();
    const text = canvasElement.querySelector('.knw-chat__text') as HTMLElement;
    await expect(getComputedStyle(text).color).toBe('rgb(244, 242, 255)');

    // The send affordance takes over from the microphone: a 40px light circle.
    const send = canvas.getByRole('button', { name: 'Send' });
    await expect(getComputedStyle(send).width).toBe('40px');
    await expect(getComputedStyle(send).backgroundColor).toBe('rgb(244, 242, 255)');
    // And the mark on it is legible rather than Figma's 10% white.
    await expect(getComputedStyle(send).color).toBe('rgb(9, 12, 24)');
  },
};

export const LongInput: Story = {
  name: 'Status=Long input',
  args: {
    onLeadingPress: fn(),
    status: 'Long input',
    value:
      'Something truly smart & often surprisingly long and winding and never ending so crazy long these texts sometimes become. Likely students copy-pasting stuff...',
  },
  play: async ({ canvasElement }) => {
    // Past one line the container squares off, and the text wraps.
    const field = canvasElement.querySelector('.knw-chat__field') as HTMLElement;
    await expect(getComputedStyle(field).borderRadius).toBe('24px');
    await expect(field.getBoundingClientRect().height).toBeGreaterThan(56);
  },
};

export const Recording: Story = {
  name: 'Status=Recording',
  args: { status: 'Recording', onLeadingPress: fn() },
  play: async ({ canvas }) => {
    // The leading action becomes a discard control, and send stays available.
    await expect(canvas.getByRole('button', { name: 'Discard recording' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeVisible();
  },
};

/**
 * The reason the Figma "Keyboard" asset exists: checking the bar is still
 * reachable with the keyboard up. The keyboard is drawn by the operating
 * system, so this reserves its height rather than drawing one. Toggle it on
 * any story from the Keyboard control in the toolbar.
 */
export const KeyboardRaised: Story = {
  name: 'Status=Typing, keyboard raised',
  args: { status: 'Typing', onLeadingPress: fn() },
  globals: { keyboard: 'raised' },
  // A keyboard-raised check needs the whole screen, not a centred box.
  parameters: { layout: 'fullscreen' },
  play: async ({ canvas, canvasElement }) => {
    const bar = canvasElement.querySelector('.knw-chat') as HTMLElement;
    const inset = canvasElement.querySelector('.knw-kb-inset') as HTMLElement;
    await expect(inset).not.toBeNull();

    // The bar has to sit clear of the reserved keyboard space, or the student
    // cannot reach it.
    await expect(Math.round(bar.getBoundingClientRect().bottom)).toBeLessThanOrEqual(
      Math.ceil(inset.getBoundingClientRect().top),
    );
    await expect(canvas.getByRole('button', { name: 'Record voice' })).toBeVisible();
  },
};

export const Loading: Story = {
  name: 'Status=Loading',
  args: { status: 'Loading', onLeadingPress: fn() },
  play: async ({ canvas }) => {
    // Awaiting a reply: the trailing control announces itself busy and is inert.
    const trailing = canvas.getByRole('button', { name: 'Waiting for a reply' });
    await expect(trailing).toBeDisabled();
    await expect(trailing).toHaveAttribute('aria-busy', 'true');
  },
};
