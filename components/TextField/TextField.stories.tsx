import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TextField } from './TextField';
import { XCloseIcon } from '../BottomSheet/icons';

const FIGMA_DESCRIPTION = `Single-line text entry with an optional title above and an optional caption below.

**The Figma component has no description.** Neither the set (\`Text Field\`, node 4517:2132) nor any of its three variants carries one, so there is no "what it's for" or "don't do this" to quote here. Everything below is read off the layers instead. If a description gets written in Figma, it belongs in this block verbatim.

**VARIANT AXIS** — \`Variant\`: Default | Error | Placeholder

**COMPONENT PROPERTIES** — Figma also exposes \`showTitle\`, \`showLeadingIcon\`, \`showTrailingIcon\`, \`showCaption\`, \`Title Text\`, \`Placeholder\` and \`(Error) caption\`. All seven are props here under the same names, camel-cased.

**How the three variants actually differ.** Default and Placeholder are the same box — Figma draws two variants of one frame, one holding \`User input...\` and one holding the placeholder. Error changes the border to \`feedback/error\` and draws the caption unconditionally in the same red; on Default and Placeholder the caption sits behind \`showCaption\` and is off by default.

---

**The component is not in design-system.md.** It lives on the *Mascot & components* page in the Working log, not on *Knowunity Components*, and no entry describes it. It is a general-purpose field, not one of the recall-flow components. Worth adding, or worth deciding it is out of scope.

**The field is 46px tall here, 41px in Figma.** Figma sets the input text in Inter Variable 14 with automatic line height (≈17px). The system has no 14px step — \`body/S\` is 15/20 — so \`12 + 20 + 12\` plus the border comes to 46. The same drift was recorded on ChatInput. Nothing was invented to close it.

**\`radius/input\` exists but is the wrong size.** Figma binds this field to \`Radius/400\` (16), so it uses \`radius/card\`. The semantic \`radius/input\` is 24, which is what a grown multi-line input uses. Two real values, one of which now has the more obvious name — worth renaming in tokens.json rather than working around here.

**The search glyph is bound to \`background/contrast\`.** That is a *surface* role being used as an icon colour. It resolves to the same white as \`text/primary\`, so nothing looks wrong, but the binding says the wrong thing. Kept faithful to the file.

**\`background/input\` means two different fills.** Figma's variable resolves to white at 10%; tokens.json resolves the token of the same name to an opaque \`navy/900\`. The name is the contract, so the token is used. On the dark page the two read almost identically, but they are not the same colour and the file and the repo should be reconciled.

**The trailing slot is empty in Figma.** \`showTrailingIcon\` reveals a 32px circular target holding a 16px icon slot with nothing in it, so the icon is a slot prop here rather than a fixed glyph.`;

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    variant: { control: 'radio', options: ['Default', 'Error', 'Placeholder'] },
    showTitle: { control: 'boolean' },
    titleText: { control: 'text' },
    placeholder: { control: 'text' },
    showCaption: { control: 'boolean' },
    errorCaption: { control: 'text' },
    showLeadingIcon: { control: 'boolean' },
    showTrailingIcon: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px', padding: 'var(--semantic-space-layout-l)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Variant=Default',
  args: { variant: 'Default', defaultValue: 'User input...' },
  play: async ({ canvas, canvasElement }) => {
    const input = canvas.getByLabelText('E.g., Name') as HTMLInputElement;
    await expect(input.value).toBe('User input...');

    // Proves the token stylesheet reached the field: the fill, border and
    // radius are all the ones Figma binds.
    const field = canvasElement.querySelector('.knw-textfield__field') as HTMLElement;
    const s = getComputedStyle(field);
    await expect(s.backgroundColor).toBe('rgb(26, 28, 38)');
    await expect(s.borderTopColor).toBe('rgba(255, 255, 255, 0.1)');
    await expect(s.borderTopWidth).toBe('1px');
    await expect(s.borderRadius).toBe('16px');
    await expect(s.paddingLeft).toBe('12px');

    // 46px, not Figma's 41 — see the docs above.
    await expect(Math.round(field.getBoundingClientRect().height)).toBe(46);

    // Entered text reads at full contrast.
    await expect(getComputedStyle(input).color).toBe('rgb(244, 242, 255)');

    // The caption is off by default on this variant.
    await expect(canvasElement.querySelector('.knw-textfield__caption')).toBeNull();
  },
};

export const Placeholder: Story = {
  name: 'Variant=Placeholder',
  args: { variant: 'Placeholder' },
  play: async ({ canvas, canvasElement }) => {
    // Same box as Default; the difference is that nothing has been typed.
    const input = canvas.getByLabelText('E.g., Name') as HTMLInputElement;
    await expect(input.value).toBe('');
    await expect(input.placeholder).toBe('Tell us more about yourself');

    const field = canvasElement.querySelector('.knw-textfield__field') as HTMLElement;
    await expect(getComputedStyle(field).borderTopColor).toBe('rgba(255, 255, 255, 0.1)');
  },
};

export const Error: Story = {
  name: 'Variant=Error',
  args: { variant: 'Error', defaultValue: 'User input...' },
  play: async ({ canvas, canvasElement }) => {
    // The border and the caption both turn red, and the caption appears
    // without showCaption being set.
    const field = canvasElement.querySelector('.knw-textfield__field') as HTMLElement;
    await expect(getComputedStyle(field).borderTopColor).toBe('rgb(255, 107, 107)');

    const caption = canvas.getByText('Explanation message');
    await expect(caption).toBeVisible();
    await expect(getComputedStyle(caption).color).toBe('rgb(255, 107, 107)');

    // The error is announced, not just drawn.
    const input = canvas.getByLabelText('E.g., Name');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Explanation message');
  },
};

export const NoTitle: Story = {
  name: 'showTitle=false',
  args: { variant: 'Placeholder', showTitle: false },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-textfield__title')).toBeNull();
    // With no visible label the title text still names the field.
    await expect(canvas.getByLabelText('E.g., Name')).toBeVisible();
  },
};

export const WithCaption: Story = {
  name: 'showCaption=true',
  args: { variant: 'Default', showCaption: true, errorCaption: 'We will never show this publicly.' },
  play: async ({ canvas }) => {
    const caption = canvas.getByText('We will never show this publicly.');
    await expect(caption).toBeVisible();
    // Not an error, so it stays in the supporting-text colour.
    await expect(getComputedStyle(caption).color).toBe('rgba(245, 243, 255, 0.68)');
  },
};

export const NoLeadingIcon: Story = {
  name: 'showLeadingIcon=false',
  args: { variant: 'Placeholder', showLeadingIcon: false },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-textfield__leading')).toBeNull();
  },
};

export const WithTrailingIcon: Story = {
  name: 'showTrailingIcon=true',
  args: {
    variant: 'Default',
    defaultValue: 'User input...',
    showTrailingIcon: true,
    trailingIcon: <XCloseIcon />,
    trailingLabel: 'Clear field',
  },
  play: async ({ canvas, canvasElement }) => {
    // Figma leaves the slot empty, so this reuses the X from BottomSheet to
    // show what the slot is for.
    const button = canvas.getByRole('button', { name: 'Clear field' });
    await expect(button).toBeVisible();

    const s = getComputedStyle(canvasElement.querySelector('.knw-textfield__trailing') as HTMLElement);
    await expect(s.width).toBe('32px');
    await expect(s.height).toBe('32px');
  },
};

/** The whole axis at once, which is how the set reads in Figma. */
export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--semantic-space-layout-xl)' }}>
      <TextField variant="Placeholder" titleText="E.g., Name" />
      <TextField variant="Default" titleText="E.g., Name" defaultValue="User input..." />
      <TextField variant="Error" titleText="E.g., Name" defaultValue="User input..." />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-textfield')).toHaveLength(3);
    // Only the Error field draws a caption without being asked.
    await expect(canvasElement.querySelectorAll('.knw-textfield__caption')).toHaveLength(1);
  },
};
