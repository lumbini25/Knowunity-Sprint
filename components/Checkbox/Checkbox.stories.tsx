import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Checkbox } from './Checkbox';

/** Verbatim from the Figma component set "Checkbox" (node 4139:312). */
const FIGMA_DESCRIPTION = `Selection control. Check/uncheck for lists, onboarding checklists, multi-select, T&C acceptance.

---

**The Figma component's colours.** These resolve in the file — an earlier note here said they did not, which was wrong; \`figma.variables.getVariableByIdAsync\` returns every one of them. What is true is that two have no counterpart of the same name in \`tokens.json\`, so they take the nearest living token:

| Figma | renders | bound to | |
|---|---|---|---|
| \`highlight/indicator\` | \`#9d85ff\` | \`highlight/border\` \`#9d85ff\` | exact value, one role narrow |
| \`feedback/error\` | \`#ff6b6b\` | \`feedback/error/bold\` | exact |
| \`feedback/errorSurface\` | \`#3a1417\` | \`feedback/error/subtle\` \`#532831\` | nearest |
| \`interactive/disabled\` | \`#ffffff4d\` | \`interactive/disabled\` | exact |

\`Selection=Selected, State=Default\` binds fill **and** stroke to \`highlight/indicator\`. That used to take \`border/selected\` (violet/500, \`#9178e6\`) as "the nearest violet", which was a step off: \`highlight/border\` carries \`#9d85ff\` exactly. The slip only showed once \`listItem\` drew the same disc from the same node and the two violets sat side by side. A \`highlight/indicator\` alias is requested in \`design-system.md\`'s Gaps — the value is right, the name is one role narrow.

The **unselected** ring still takes \`border/selected\`. No variant binds a stroke on an unselected box, so nothing in the file contradicts it.

Geometry needed no substitutions: the 48px tap target, 24px box, pill radius, heavy ring and 16px checkmark are all bound.

**Note:** this component is not specified in \`design-system.md\`. The \`Check\` entry there is a different thing — a 32×32 checkmark used inside \`voiceFab\`.`;

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    Selection: { control: 'radio', options: ['Unselected', 'Selected'] },
    State: { control: 'radio', options: ['Default', 'Error', 'Disabled'] },
    label: { control: 'text' },
  },
  args: { label: 'Accept terms' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UnselectedDefault: Story = {
  name: 'Selection=Unselected, State=Default',
  args: { Selection: 'Unselected', State: 'Default' },
  play: async ({ canvas, canvasElement }) => {
    const box = canvas.getByRole('checkbox', { name: 'Accept terms' });
    await expect(box).toHaveAttribute('aria-checked', 'false');

    // Proves the token stylesheet reached the component: a 48px tap target
    // around a 24px pill-shaped ring in border/selected, with no fill.
    await expect(getComputedStyle(box).width).toBe('48px');
    const inner = canvasElement.querySelector('.knw-checkbox__box') as HTMLElement;
    const s = getComputedStyle(inner);
    await expect(s.width).toBe('24px');
    await expect(s.borderTopWidth).toBe('2px');
    await expect(s.borderTopColor).toBe('rgb(145, 120, 230)');
    await expect(s.backgroundColor).toBe('rgba(0, 0, 0, 0)');

    // Unselected shows no checkmark.
    await expect(canvasElement.querySelector('.knw-checkbox__mark')).toBeNull();
  },
};

export const SelectedDefault: Story = {
  name: 'Selection=Selected, State=Default',
  args: { Selection: 'Selected', State: 'Default' },
  play: async ({ canvas, canvasElement }) => {
    const box = canvas.getByRole('checkbox', { name: 'Accept terms' });
    await expect(box).toHaveAttribute('aria-checked', 'true');

    // Selected fills the box and shows the checkmark. Fill and ring are both
    // highlight/border (#9d85ff), which is what Figma's highlight/indicator
    // resolves to — not border/selected, a step darker at #9178e6.
    const inner = canvasElement.querySelector('.knw-checkbox__box') as HTMLElement;
    const is = getComputedStyle(inner);
    await expect(is.backgroundColor).toBe('rgb(157, 133, 255)');
    await expect(is.borderTopColor).toBe('rgb(157, 133, 255)');
    const mark = canvasElement.querySelector('.knw-checkbox__mark') as HTMLElement;
    await expect(mark.querySelector('svg path')).not.toBeNull();
    await expect(getComputedStyle(mark).color).toBe('rgb(244, 242, 255)');
  },
};

export const UnselectedError: Story = {
  name: 'Selection=Unselected, State=Error',
  args: { Selection: 'Unselected', State: 'Error' },
  play: async ({ canvas, canvasElement }) => {
    // Error marks the control invalid for assistive technology, not just red.
    const box = canvas.getByRole('checkbox', { name: 'Accept terms' });
    await expect(box).toHaveAttribute('aria-invalid', 'true');
    const inner = canvasElement.querySelector('.knw-checkbox__box') as HTMLElement;
    await expect(getComputedStyle(inner).borderTopColor).toBe('rgb(255, 107, 107)');
  },
};

export const SelectedError: Story = {
  name: 'Selection=Selected, State=Error',
  args: { Selection: 'Selected', State: 'Error' },
  play: async ({ canvasElement }) => {
    // A selected error box keeps the red ring over a deep red surface.
    const inner = canvasElement.querySelector('.knw-checkbox__box') as HTMLElement;
    const s = getComputedStyle(inner);
    await expect(s.borderTopColor).toBe('rgb(255, 107, 107)');
    await expect(s.backgroundColor).toBe('rgb(83, 40, 49)');
  },
};

export const UnselectedDisabled: Story = {
  name: 'Selection=Unselected, State=Disabled',
  args: { Selection: 'Unselected', State: 'Disabled' },
  play: async ({ canvas }) => {
    // Disabled is a real disabled control, not just a greyed one.
    await expect(canvas.getByRole('checkbox', { name: 'Accept terms' })).toBeDisabled();
  },
};

export const SelectedDisabled: Story = {
  name: 'Selection=Selected, State=Disabled',
  args: { Selection: 'Selected', State: 'Disabled' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('checkbox', { name: 'Accept terms' })).toBeDisabled();
    // Still reads as checked while disabled.
    await expect(canvas.getByRole('checkbox', { name: 'Accept terms' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(canvasElement.querySelector('.knw-checkbox__mark')).not.toBeNull();
  },
};
