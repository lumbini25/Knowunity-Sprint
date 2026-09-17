import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { Button } from './Button';

/**
 * Verbatim from the Figma component set "button" (node 9003:6667), so anyone
 * opening this in Storybook reads what the designer wrote.
 */
const FIGMA_DESCRIPTION = `Labelled button with optional left and right icons. 3 variants (Primary, Secondary, Tertiary), 3 sizes, 4 states. Expects 1–2 word labels.

**USE:** Primary for the main CTA, Secondary for supporting actions (Skip, Cancel), Tertiary for lowest emphasis.

**DON'T:** Use two Primary buttons on the same screen.`;

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    variant: { control: 'radio', options: ['Primary', 'Secondary', 'Tertiary'] },
    size: { control: 'radio', options: ['S', 'M', 'L'] },
    state: { control: 'radio', options: ['Default', 'Pressed', 'Disabled', 'Loading'] },
    showLeftIcon: { control: 'boolean' },
    showRightIcon: { control: 'boolean' },
    CTA: { control: 'text' },
  },
  // Figma expects 1-2 word labels.
  args: { CTA: 'Start recall' },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ===== Primary ===== */

export const PrimarySDefault: Story = {
  name: 'variant=Primary, size=S, state=Default',
  args: { variant: 'Primary', size: 'S', state: 'Default' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Start recall' });
    await expect(button).toBeVisible();

    // Proves the token stylesheet reached the component rather than the
    // browser's default button styling: Primary's fill is
    // interactive/primary, which resolves to violet 50 (#f4f2ff).
    const surface = button.querySelector('.knw-button__surface') as HTMLElement;
    await expect(getComputedStyle(surface).backgroundColor).toBe('rgb(244, 242, 255)');
    await expect(getComputedStyle(surface).height).toBe('32px');
  },
};

export const PrimarySPressed: Story = {
  name: 'variant=Primary, size=S, state=Pressed',
  args: { variant: 'Primary', size: 'S', state: 'Pressed' },
};

export const PrimarySDisabled: Story = {
  name: 'variant=Primary, size=S, state=Disabled',
  args: { variant: 'Primary', size: 'S', state: 'Disabled' },
  play: async ({ canvas }) => {
    // Disabled is a real disabled button, not just a grey one.
    const button = canvas.getByRole('button', { name: 'Start recall' });
    await expect(button).toBeDisabled();

    // Primary drops its brand fill for background/surface (navy 800).
    const surface = button.querySelector('.knw-button__surface') as HTMLElement;
    await expect(getComputedStyle(surface).backgroundColor).toBe('rgb(34, 36, 47)');
  },
};

export const PrimarySLoading: Story = {
  name: 'variant=Primary, size=S, state=Loading',
  args: { variant: 'Primary', size: 'S', state: 'Loading' },
  play: async ({ canvas }) => {
    // The label is hidden while loading, so the button keeps its name through
    // aria-label and announces itself as busy.
    const button = canvas.getByRole('button', { name: 'Start recall' });
    await expect(button).toHaveAttribute('aria-busy', 'true');

    const label = button.querySelector('.knw-button__label') as HTMLElement;
    await expect(getComputedStyle(label).display).toBe('none');
  },
};

export const PrimaryMDefault: Story = {
  name: 'variant=Primary, size=M, state=Default',
  args: { variant: 'Primary', size: 'M', state: 'Default' },
};

export const PrimaryMPressed: Story = {
  name: 'variant=Primary, size=M, state=Pressed',
  args: { variant: 'Primary', size: 'M', state: 'Pressed' },
};

export const PrimaryMDisabled: Story = {
  name: 'variant=Primary, size=M, state=Disabled',
  args: { variant: 'Primary', size: 'M', state: 'Disabled' },
};

export const PrimaryMLoading: Story = {
  name: 'variant=Primary, size=M, state=Loading',
  args: { variant: 'Primary', size: 'M', state: 'Loading' },
};

export const PrimaryLDefault: Story = {
  name: 'variant=Primary, size=L, state=Default',
  args: { variant: 'Primary', size: 'L', state: 'Default' },
  play: async ({ canvas }) => {
    // L steps up to the 56px control height and the headline S type style.
    const button = canvas.getByRole('button', { name: 'Start recall' });
    const surface = button.querySelector('.knw-button__surface') as HTMLElement;
    await expect(getComputedStyle(surface).height).toBe('56px');

    const label = button.querySelector('.knw-button__label') as HTMLElement;
    await expect(getComputedStyle(label).fontSize).toBe('21px');
  },
};

export const PrimaryLPressed: Story = {
  name: 'variant=Primary, size=L, state=Pressed',
  args: { variant: 'Primary', size: 'L', state: 'Pressed' },
};

export const PrimaryLDisabled: Story = {
  name: 'variant=Primary, size=L, state=Disabled',
  args: { variant: 'Primary', size: 'L', state: 'Disabled' },
};

export const PrimaryLLoading: Story = {
  name: 'variant=Primary, size=L, state=Loading',
  args: { variant: 'Primary', size: 'L', state: 'Loading' },
};

/* ===== Secondary ===== */

export const SecondarySDefault: Story = {
  name: 'variant=Secondary, size=S, state=Default',
  args: { variant: 'Secondary', size: 'S', state: 'Default', CTA: 'Skip' },
  play: async ({ canvas }) => {
    // Secondary rests on background/surface with the primary text colour.
    const button = canvas.getByRole('button', { name: 'Skip' });
    const surface = button.querySelector('.knw-button__surface') as HTMLElement;
    await expect(getComputedStyle(surface).backgroundColor).toBe('rgb(34, 36, 47)');
  },
};

export const SecondarySPressed: Story = {
  name: 'variant=Secondary, size=S, state=Pressed',
  args: { variant: 'Secondary', size: 'S', state: 'Pressed', CTA: 'Skip' },
};

export const SecondarySDisabled: Story = {
  name: 'variant=Secondary, size=S, state=Disabled',
  args: { variant: 'Secondary', size: 'S', state: 'Disabled', CTA: 'Skip' },
};

export const SecondarySLoading: Story = {
  name: 'variant=Secondary, size=S, state=Loading',
  args: { variant: 'Secondary', size: 'S', state: 'Loading', CTA: 'Skip' },
};

export const SecondaryMDefault: Story = {
  name: 'variant=Secondary, size=M, state=Default',
  args: { variant: 'Secondary', size: 'M', state: 'Default', CTA: 'Skip' },
};

export const SecondaryMPressed: Story = {
  name: 'variant=Secondary, size=M, state=Pressed',
  args: { variant: 'Secondary', size: 'M', state: 'Pressed', CTA: 'Skip' },
};

export const SecondaryMDisabled: Story = {
  name: 'variant=Secondary, size=M, state=Disabled',
  args: { variant: 'Secondary', size: 'M', state: 'Disabled', CTA: 'Skip' },
};

export const SecondaryMLoading: Story = {
  name: 'variant=Secondary, size=M, state=Loading',
  args: { variant: 'Secondary', size: 'M', state: 'Loading', CTA: 'Skip' },
};

export const SecondaryLDefault: Story = {
  name: 'variant=Secondary, size=L, state=Default',
  args: { variant: 'Secondary', size: 'L', state: 'Default', CTA: 'Skip' },
};

export const SecondaryLPressed: Story = {
  name: 'variant=Secondary, size=L, state=Pressed',
  args: { variant: 'Secondary', size: 'L', state: 'Pressed', CTA: 'Skip' },
};

export const SecondaryLDisabled: Story = {
  name: 'variant=Secondary, size=L, state=Disabled',
  args: { variant: 'Secondary', size: 'L', state: 'Disabled', CTA: 'Skip' },
};

export const SecondaryLLoading: Story = {
  name: 'variant=Secondary, size=L, state=Loading',
  args: { variant: 'Secondary', size: 'L', state: 'Loading', CTA: 'Skip' },
};

/* ===== Tertiary ===== */

export const TertiarySDefault: Story = {
  name: 'variant=Tertiary, size=S, state=Default',
  args: { variant: 'Tertiary', size: 'S', state: 'Default', CTA: 'Not now' },
  play: async ({ canvas }) => {
    // Tertiary is label only: no fill, no horizontal padding.
    const button = canvas.getByRole('button', { name: 'Not now' });
    const surface = button.querySelector('.knw-button__surface') as HTMLElement;
    const styles = getComputedStyle(surface);
    await expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(styles.paddingLeft).toBe('0px');
  },
};

export const TertiarySPressed: Story = {
  name: 'variant=Tertiary, size=S, state=Pressed',
  args: { variant: 'Tertiary', size: 'S', state: 'Pressed', CTA: 'Not now' },
};

export const TertiarySDisabled: Story = {
  name: 'variant=Tertiary, size=S, state=Disabled',
  args: { variant: 'Tertiary', size: 'S', state: 'Disabled', CTA: 'Not now' },
};

export const TertiarySLoading: Story = {
  name: 'variant=Tertiary, size=S, state=Loading',
  args: { variant: 'Tertiary', size: 'S', state: 'Loading', CTA: 'Not now' },
};

export const TertiaryMDefault: Story = {
  name: 'variant=Tertiary, size=M, state=Default',
  args: { variant: 'Tertiary', size: 'M', state: 'Default', CTA: 'Not now' },
};

export const TertiaryMPressed: Story = {
  name: 'variant=Tertiary, size=M, state=Pressed',
  args: { variant: 'Tertiary', size: 'M', state: 'Pressed', CTA: 'Not now' },
};

export const TertiaryMDisabled: Story = {
  name: 'variant=Tertiary, size=M, state=Disabled',
  args: { variant: 'Tertiary', size: 'M', state: 'Disabled', CTA: 'Not now' },
};

export const TertiaryMLoading: Story = {
  name: 'variant=Tertiary, size=M, state=Loading',
  args: { variant: 'Tertiary', size: 'M', state: 'Loading', CTA: 'Not now' },
};

export const TertiaryLDefault: Story = {
  name: 'variant=Tertiary, size=L, state=Default',
  args: { variant: 'Tertiary', size: 'L', state: 'Default', CTA: 'Not now' },
};

export const TertiaryLPressed: Story = {
  name: 'variant=Tertiary, size=L, state=Pressed',
  args: { variant: 'Tertiary', size: 'L', state: 'Pressed', CTA: 'Not now' },
};

export const TertiaryLDisabled: Story = {
  name: 'variant=Tertiary, size=L, state=Disabled',
  args: { variant: 'Tertiary', size: 'L', state: 'Disabled', CTA: 'Not now' },
};

export const TertiaryLLoading: Story = {
  name: 'variant=Tertiary, size=L, state=Loading',
  args: { variant: 'Tertiary', size: 'L', state: 'Loading', CTA: 'Not now' },
};

/* ===== icon slots ===== */

export const WithLeftIcon: Story = {
  name: 'showLeftIcon=true',
  args: { variant: 'Primary', size: 'M', state: 'Default', showLeftIcon: true },
};

export const WithRightIcon: Story = {
  name: 'showRightIcon=true',
  args: { variant: 'Primary', size: 'M', state: 'Default', showRightIcon: true },
};
