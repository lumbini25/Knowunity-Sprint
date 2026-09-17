import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { MascotSlot } from './MascotSlot';

/** Verbatim from the Figma component set "mascotSlot" (node 9003:8873). */
const FIGMA_DESCRIPTION = `Container for Knowie mascot illustrations. 4 sizes (XL–4XL), standby pose only.

**USE:** Full-screen emotional moments — celebrations, empty states, onboarding, session completion. Match size to available screen space.

**DON'T:** Use inside list items or cards. Knowie is a screen-level character.

---

**This is the container only.** Knowie's standby pose is a single Bézier path of 311,377 characters — the smallest size exports to a 269 KB SVG, larger than every component in this project combined. So the slot works like \`iconSlot\`: it owns the size, and the illustration is passed as children. The stories show a stand-in so the four sizes can be compared.

**When you do slot the real artwork in, its three colours have semantic tokens waiting.** Figma binds them to primitives instead, two of which are not in \`tokens.json\` at all — the file's own \`$metadata\` calls them out: *"Homie/Inkwell and Homie/Eyes are orphaned primitives not referenced by any semantic token."* All three match by value:

| Figma binding | value | should be |
|---|---|---|
| \`Homie/Inkwell\` (body) | \`#9178e6\` | \`mascot/primary\` |
| \`color/neutral/0\` (eye whites) | \`#ffffff\` | \`mascot/eyes\` |
| \`Homie/Eyes\` (pupils) | \`#0a0a0a\` | \`mascot/pupils\` |

Those three semantic tokens are described as "Knowie mascot body fill / eye whites / pupils — illustration use only", so they exist for exactly this.

**Accessibility:** the slot is decorative and hidden by default, because the surrounding copy usually carries the meaning. Pass \`label\` when Knowie's expression is the message.`;

const meta = {
  title: 'Components/MascotSlot',
  component: MascotSlot,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    size: { control: 'radio', options: ['XL', '2XL', '3XL', '4XL'] },
    label: { control: 'text' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MascotSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const XL: Story = {
  name: 'size=XL',
  args: { size: 'XL' },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    const s = getComputedStyle(slot);
    // 64px slot with the constant 12px inset, per Figma.
    await expect(s.width).toBe('64px');
    await expect(s.height).toBe('64px');
    await expect(s.padding).toBe('12px');

    // Decorative by default: nothing to announce without a label.
    await expect(slot).toHaveAttribute('aria-hidden', 'true');
  },
};

export const XXL: Story = {
  name: 'size=2XL',
  args: { size: '2XL' },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('120px');
  },
};

export const XXXL: Story = {
  name: 'size=3XL',
  args: { size: '3XL' },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('200px');
  },
};

export const XXXXL: Story = {
  name: 'size=4XL',
  args: { size: '4XL' },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('320px');

    // The stand-in fills the padded box: 320 less 12 either side.
    const inner = canvasElement.querySelector('.knw-mascot__placeholder') as HTMLElement;
    await expect(Math.round(inner.getBoundingClientRect().width)).toBe(296);
  },
};

/** What it looks like with an illustration slotted in. */
export const WithIllustration: Story = {
  name: 'children = illustration',
  args: {
    size: '3XL',
    label: 'Knowie, waiting',
    children: (
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="50" fill="var(--semantic-mascot-primary)" />
        <circle cx="34" cy="42" r="13" fill="var(--semantic-mascot-eyes)" />
        <circle cx="66" cy="42" r="13" fill="var(--semantic-mascot-eyes)" />
        <circle cx="36" cy="45" r="6" fill="var(--semantic-mascot-pupils)" />
        <circle cx="64" cy="45" r="6" fill="var(--semantic-mascot-pupils)" />
      </svg>
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    // With a label the slot becomes an image with a name.
    const slot = canvas.getByRole('img', { name: 'Knowie, waiting' });
    await expect(slot).toBeVisible();
    await expect(slot).not.toHaveAttribute('aria-hidden');

    // The stand-in gives way to the slotted artwork, which fills the box.
    await expect(canvasElement.querySelector('.knw-mascot__placeholder')).toBeNull();
    const art = slot.querySelector('svg') as SVGElement;
    await expect(Math.round(art.getBoundingClientRect().width)).toBe(176);
  },
};
