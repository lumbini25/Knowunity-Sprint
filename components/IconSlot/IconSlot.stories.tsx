import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { IconSlot } from './IconSlot';
import { SearchIcon } from '../TextField/icons';
import { CheckCircleIcon } from '../Snackbar/icons';

/** Verbatim from the Figma component set "iconSlot" (node 9003:8809). */
const FIGMA_DESCRIPTION = `Internal icon sizing scaffold. 6 sizes (100–400) tied to the Icon token scale. Variant is labelled "Size (IGNORE)" — it is set by the parent component, not chosen per instance.

**USE:** Inside other components wherever an icon appears. Always prefer iconSlot over a raw vector.

**DON'T:** Change the size variant manually — the parent component owns it.

---

**This component sets size and nothing else.** No colour, no padding, no background. That is the point of the DON'T: the parent owns the size, and the icon inside inherits \`currentColor\` from whatever component the slot sits in. Every icon in this project is already drawn with \`fill="currentColor"\`, so a slot dropped into a button picks up the button's label colour with no extra wiring.

**Two tokens were added to complete the icon scale.** The six steps map one-to-one onto \`Icon/100\`–\`Icon/400\`, but the semantic layer only named four of them — \`size/icon/{XS,S,M,L}\` for 12, 16, 20, 24. The primitives \`icon/100\` (8) and \`icon/400\` (32) already existed with no semantic name, so \`size/icon/XXS\` and \`size/icon/XL\` now close the scale. Nothing new was measured or guessed; two existing primitives got the names the other four already had.

| Figma | px | token |
|---|---|---|
| Size=100 | 8 | \`size/icon/XXS\` **(new)** |
| Size=150 | 12 | \`size/icon/XS\` |
| Size=200 | 16 | \`size/icon/S\` |
| Size=250 | 20 | \`size/icon/M\` |
| Size=300 | 24 | \`size/icon/L\` |
| Size=400 | 32 | \`size/icon/XL\` **(new)** |

**The prop is \`size\`, not \`Size (IGNORE)\`.** The "(IGNORE)" is an instruction to designers in the Figma UI, not part of the property's meaning, and it cannot be a JSX prop name. The options are unchanged.

**The existing components do not use this slot yet.** design-system.md says to prefer iconSlot over a raw vector everywhere, but Button, Chips, BottomSheet, Snackbar, ChatInput, FolderCard, ListItem, Checkbox and TextField were all built before this existed and size their icons directly. Retrofitting them is a separate job — worth doing, and not done here.`;

const meta = {
  title: 'Components/IconSlot',
  component: IconSlot,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    size: { control: 'radio', options: ['100', '150', '200', '250', '300', '400'] },
  },
  // The slot has no colour of its own, so the wrapper supplies one to inherit —
  // exactly as a parent component would.
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px', color: 'var(--semantic-text-primary)' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof IconSlot>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Size100: Story = {
  name: 'Size=100',
  args: { size: '100' },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    const s = getComputedStyle(slot);
    await expect(s.width).toBe('8px');
    await expect(s.height).toBe('8px');

    // Proves the slot is size only: it paints no background of its own.
    await expect(s.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};

export const Size150: Story = {
  name: 'Size=150',
  args: { size: '150' },
  play: async ({ canvasElement }) => {
    const s = getComputedStyle(canvasElement.querySelector('.knw-iconslot') as HTMLElement);
    await expect(s.width).toBe('12px');
    await expect(s.height).toBe('12px');
  },
};

export const Size200: Story = {
  name: 'Size=200',
  args: { size: '200' },
  play: async ({ canvasElement }) => {
    const s = getComputedStyle(canvasElement.querySelector('.knw-iconslot') as HTMLElement);
    await expect(s.width).toBe('16px');
    await expect(s.height).toBe('16px');
  },
};

export const Size250: Story = {
  name: 'Size=250',
  args: { size: '250' },
  play: async ({ canvasElement }) => {
    const s = getComputedStyle(canvasElement.querySelector('.knw-iconslot') as HTMLElement);
    await expect(s.width).toBe('20px');
    await expect(s.height).toBe('20px');
  },
};

export const Size300: Story = {
  name: 'Size=300',
  args: { size: '300' },
  play: async ({ canvasElement }) => {
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    const s = getComputedStyle(slot);
    await expect(s.width).toBe('24px');
    await expect(s.height).toBe('24px');

    // The icon fills the box exactly, as Figma's FILL/FILL swap instance does.
    const svg = slot.querySelector('svg') as SVGElement;
    await expect(Math.round(svg.getBoundingClientRect().width)).toBe(24);
  },
};

export const Size400: Story = {
  name: 'Size=400',
  args: { size: '400' },
  play: async ({ canvasElement }) => {
    const s = getComputedStyle(canvasElement.querySelector('.knw-iconslot') as HTMLElement);
    await expect(s.width).toBe('32px');
    await expect(s.height).toBe('32px');
  },
};

/** The default swap. Figma's instance-swap default is a placeholder square. */
export const DefaultSwap: Story = {
  name: 'Default instance — square',
  args: { size: '300' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-iconslot svg')).toBeTruthy();
  },
};

/** Any icon can go in the slot — this is Figma's instance-swap property. */
export const SwappedIcon: Story = {
  name: 'Swapped instance',
  args: { size: '300', children: <SearchIcon /> },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('.knw-iconslot svg') as SVGElement;
    await expect(Math.round(svg.getBoundingClientRect().height)).toBe(24);
  },
};

/** The whole scale at once, which is how the set reads in Figma. */
export const AllSizes: Story = {
  name: 'All sizes',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--semantic-space-layout-l)' }}>
      <IconSlot size="100" />
      <IconSlot size="150" />
      <IconSlot size="200" />
      <IconSlot size="250" />
      <IconSlot size="300" />
      <IconSlot size="400" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const widths = [...canvasElement.querySelectorAll('.knw-iconslot')].map((el) =>
      Math.round(el.getBoundingClientRect().width),
    );
    // One to one with Icon/100–400, in order, no repeats.
    await expect(widths).toEqual([8, 12, 16, 20, 24, 32]);
  },
};

/**
 * Colour comes from the parent, which is why the slot sets none. Both slots
 * here are identical; only the wrapper's colour differs.
 */
export const InheritsColour: Story = {
  name: 'Colour inherited from parent',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--semantic-space-layout-l)' }}>
      <span style={{ color: 'var(--semantic-feedback-success-bold)' }}>
        <IconSlot size="300">
          <CheckCircleIcon />
        </IconSlot>
      </span>
      <span style={{ color: 'var(--semantic-text-tertiary)' }}>
        <IconSlot size="300">
          <CheckCircleIcon />
        </IconSlot>
      </span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const slots = [...canvasElement.querySelectorAll('.knw-iconslot')] as HTMLElement[];
    const colours = slots.map((el) => getComputedStyle(el).color);
    // Same component, two colours — the slot never sets one itself.
    await expect(colours[0]).not.toBe(colours[1]);
    await expect(colours[0]).toBe('rgb(0, 195, 134)');
  },
};
