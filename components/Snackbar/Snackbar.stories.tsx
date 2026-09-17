import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Snackbar } from './Snackbar';

/** Verbatim from the Figma component set "snackbar" (node 9003:8995). */
const FIGMA_DESCRIPTION = `Transient notification bar. Icon, up to 2 lines of text, and a chips action. 3 variants: Default, Success, Error.

**USE:** Brief system feedback that needs no decision — "Saved," "Something went wrong." Success and Error map to feedback/success and feedback/error tokens.

**DON'T:** Use when the user must read and respond before continuing. Use a modal or bottom sheet instead.

---

**The action is not the Chips component, though it looks like one.** Figma's action is an instance of \`chips/S/Info/True\` — a second chip family that is not part of the \`chips\` component set. It differs in two ways: its colours are Info, Success and Error where \`chips\` offers Primary and pro, and its label is \`body.S-bold\` (15px) where \`chips\` size=S uses \`caption.M-bold\` (12px). Geometry is identical. Reusing Chips would have given the wrong text size and no matching colour, so the action is built inline. Worth deciding whether those three belong in the \`chips\` set.

**Naming differs from \`tokens.json\`, values do not.** Figma reaches for \`feedback/success/surface/bold\` and \`feedback/error/surface/bold\`; the token file has no \`surface\` level. Every colour matched an existing token exactly, so nothing was invented:

| Figma | value | bound to |
|---|---|---|
| \`accent/blue/bold\` | \`#5fa0fc\` | \`accent/blue/bold\` |
| \`feedback/success/surface/bold\` | \`#00c386\` | \`feedback/success/bold\` |
| \`feedback/success/surface/label/bold\` | \`#0a1f18\` | \`feedback/success/label/bold\` |
| \`feedback/error/bold\` | \`#ff6b6b\` | \`feedback/error/bold\` |
| \`feedback/error/surface/bold\` | \`#2a0808\` | \`feedback/error/label/bold\` |

\`design-system.md\` uses the same \`feedback.{state}.surface.bold\` naming, so this mismatch is not only in Figma.

**One dead reference:** the root's block padding binds to \`Padding/sm\`, which is not a variable in the file. It paints 8px — the same as the inline padding beside it — so it maps to \`space/layout/S\` without ambiguity.

A hidden Tertiary \`button\` sits inside the Figma component in all three variants. It is switched off everywhere, so it is not built.`;

const meta = {
  title: 'Components/Snackbar',
  component: Snackbar,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    variant: { control: 'radio', options: ['Default', 'Success', 'Error'] },
    Text: { control: 'text' },
    actionLabel: { control: 'text' },
  },
  args: { actionLabel: 'Undo' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'variant=Default',
  args: { variant: 'Default', Text: 'Session resumed where you left off.' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Session resumed where you left off.')).toBeVisible();

    // Transient feedback is announced politely, never interrupting.
    const bar = canvasElement.querySelector('.knw-snackbar__bar') as HTMLElement;
    await expect(bar).toHaveAttribute('role', 'status');
    await expect(bar).toHaveAttribute('aria-live', 'polite');

    // Proves the token stylesheet loaded: the bar is the light surface
    // whatever the variant, and Default carries the blue accent.
    await expect(getComputedStyle(bar).backgroundColor).toBe('rgb(244, 242, 255)');
    const icon = canvasElement.querySelector('.knw-snackbar__icon') as HTMLElement;
    await expect(getComputedStyle(icon).color).toBe('rgb(95, 160, 252)');

    const action = canvas.getByRole('button', { name: 'Undo' });
    await expect(getComputedStyle(action).backgroundColor).toBe('rgb(95, 160, 252)');
  },
};

export const Success: Story = {
  name: 'variant=Success',
  args: { variant: 'Success', Text: 'Saved.' },
  play: async ({ canvas, canvasElement }) => {
    // Success maps to the feedback/success pair.
    const icon = canvasElement.querySelector('.knw-snackbar__icon') as HTMLElement;
    await expect(getComputedStyle(icon).color).toBe('rgb(0, 195, 134)');
    const action = canvas.getByRole('button', { name: 'Undo' });
    await expect(getComputedStyle(action).backgroundColor).toBe('rgb(0, 195, 134)');
    await expect(getComputedStyle(action).color).toBe('rgb(10, 31, 24)');

    // The bar itself does not change colour with the variant.
    const bar = canvasElement.querySelector('.knw-snackbar__bar') as HTMLElement;
    await expect(getComputedStyle(bar).backgroundColor).toBe('rgb(244, 242, 255)');
  },
};

export const Error: Story = {
  name: 'variant=Error',
  args: { variant: 'Error', Text: 'Something went wrong. Nothing was lost.' },
  play: async ({ canvas, canvasElement }) => {
    const icon = canvasElement.querySelector('.knw-snackbar__icon') as HTMLElement;
    await expect(getComputedStyle(icon).color).toBe('rgb(255, 107, 107)');
    const action = canvas.getByRole('button', { name: 'Undo' });
    await expect(getComputedStyle(action).backgroundColor).toBe('rgb(255, 107, 107)');
  },
};

/** The description caps the message at two lines; longer copy clamps. */
export const TwoLineMaximum: Story = {
  name: 'Text = two lines maximum',
  args: {
    variant: 'Default',
    Text: 'Up to 2 lines of text. Keep it as short as possible. Anything longer than this is clamped rather than pushing the bar taller and taller.',
  },
  play: async ({ canvasElement }) => {
    const label = canvasElement.querySelector('.knw-snackbar__label') as HTMLElement;
    await expect(getComputedStyle(label).webkitLineClamp).toBe('2');
    // Clamped, so the copy never grows the bar past two lines.
    await expect(label.scrollHeight).toBeGreaterThan(label.clientHeight);
  },
};

/** The action is optional; without a label the snackbar is text only. */
export const WithoutAction: Story = {
  name: 'actionLabel unset',
  args: { variant: 'Success', Text: 'Saved.', actionLabel: undefined },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-snackbar__action')).toBeNull();
  },
};
