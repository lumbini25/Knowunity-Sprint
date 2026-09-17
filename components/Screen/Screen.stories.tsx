import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { BottomSheet } from '../BottomSheet/BottomSheet';
import { Button } from '../Button/Button';
import { ChatInput } from '../ChatInput/ChatInput';
import { Chips } from '../Chips/Chips';
import { Screen } from './Screen';

/** Verbatim from the Figma component set "scaffold" (node 3085:9242). */
const FIGMA_DESCRIPTION = `Used to quickly create screens using our components, making use of Figma Slots. Allows for quickly testing how designs look on different device types.

---

**\`size\` ships one option, not eight.** Figma offers iPhone 13, L - 17 Pro Max, XS - iPhone SE, four iPad sizes and MacBook Air 13'. CLAUDE.md's first rule is *"390px, dark mode, iOS only. No light mode, no desktop, no breakpoints"* — so only \`iPhone 13\` is built. The other seven are out of scope for this sprint rather than missing.

**Two things Figma draws are left to iOS.** The status bar is OS chrome carrying raw colours and foreign \`Core/*\` variables; the scaffold reserves its height with \`env(safe-area-inset-top)\` instead, which is what design-system.md asks for. The device's rounded corners are likewise the OS's, so no radius is applied to the root — in a real browser there is nothing behind the screen to round against.

**One value could not be bound.** Figma's root carries a 10px gap between sections; the spacing scale goes 8 → 12, so there is no token for it. The slots carry their own padding and the body flexes to fill, which reproduces the layout without an untokenised value.

Composition follows design-system.md's Screen scaffold: navigation at the top, a scrolling body, and the primary action pinned low "so thumbs reach them without shifting grip".`;

const meta = {
  title: 'Components/Screen',
  component: Screen,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    size: { control: 'radio', options: ['iPhone 13'] },
    showTopNavSlot: { control: 'boolean' },
    showBottomNavSlot: { control: 'boolean' },
    showBottomSheetBackground: { control: 'boolean' },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Screen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every slot filled from components this project already has. */
export const IPhone13: Story = {
  name: 'size=iPhone 13',
  args: {
    size: 'iPhone 13',
    topNavigation: <Chips size="S" color="Primary" active="True" Text="Practice round" />,
    middleContent: (
      <>
        <p style={{ margin: 0 }}>
          Say what you remember about photosynthesis. There is no wrong answer — the point is
          to get it out loud.
        </p>
        <p style={{ margin: 0 }}>
          Knowie will tell you what you covered and what you missed.
        </p>
      </>
    ),
    bottomContent: <Button variant="Primary" size="L" CTA="Start recall" />,
  },
  play: async ({ canvas, canvasElement }) => {
    // Every slot rendered, using existing components.
    await expect(canvas.getByText('Practice round')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Start recall' })).toBeVisible();

    // Proves the token stylesheet reached the scaffold.
    const screen = canvasElement.querySelector('.knw-screen') as HTMLElement;
    await expect(getComputedStyle(screen).backgroundColor).toBe('rgb(9, 12, 24)');

    // The body is what scrolls; the action stays pinned below it.
    const body = canvasElement.querySelector('.knw-screen__middle') as HTMLElement;
    const bottom = canvasElement.querySelector('.knw-screen__bottom') as HTMLElement;
    await expect(getComputedStyle(body).overflowY).toBe('auto');
    await expect(Math.round(body.getBoundingClientRect().bottom)).toBeLessThanOrEqual(
      Math.ceil(bottom.getBoundingClientRect().top),
    );
  },
};

export const ChatInputInBottomSlot: Story = {
  name: 'bottomContent = ChatInput',
  args: {
    size: 'iPhone 13',
    topNavigation: <Chips size="S" color="Primary" active="False" Text="Coach me" />,
    middleContent: <p style={{ margin: 0 }}>Ask Knowie anything about this topic.</p>,
    bottomContent: <ChatInput status="Inactive" />,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Record voice' })).toBeVisible();
  },
};

export const WithBottomSheet: Story = {
  name: 'showBottomSheetBackground=true, bottomSheetOnly set',
  args: {
    size: 'iPhone 13',
    middleContent: <p style={{ margin: 0 }}>Your progress is saved as you go.</p>,
    showBottomSheetBackground: true,
    bottomSheetOnly: (
      <BottomSheet
        height="S"
        title="Leave this session?"
        middleSection={<p style={{ margin: 0 }}>Your progress on this topic is saved.</p>}
        bottomSection={
          <>
            <Button variant="Primary" size="L" CTA="Keep learning" />
            <Button variant="Tertiary" size="M" CTA="Leave anyway" />
          </>
        }
      />
    ),
  },
  play: async ({ canvas, canvasElement }) => {
    // The sheet sits above a scrim that dims the screen behind it.
    await expect(canvas.getByRole('heading', { name: 'Leave this session?' })).toBeVisible();
    const scrim = canvasElement.querySelector('.knw-screen__scrim') as HTMLElement;
    await expect(scrim).not.toBeNull();
    await expect(getComputedStyle(scrim).backgroundColor).toBe('rgba(10, 10, 10, 0.5)');
  },
};

export const SlotsHidden: Story = {
  name: 'showTopNavSlot=false, showBottomNavSlot=false',
  args: {
    size: 'iPhone 13',
    topNavigation: <Chips size="S" color="Primary" active="True" Text="Practice round" />,
    middleContent: <p style={{ margin: 0 }}>Content only — both chrome slots are off.</p>,
    bottomContent: <Button variant="Primary" size="L" CTA="Start recall" />,
    showTopNavSlot: false,
    showBottomNavSlot: false,
  },
  play: async ({ canvasElement }) => {
    // The booleans hide the slots rather than the components inside them.
    await expect(canvasElement.querySelector('.knw-screen__top')).toBeNull();
    await expect(canvasElement.querySelector('.knw-screen__bottom')).toBeNull();
    await expect(canvasElement.querySelector('.knw-screen__middle')).not.toBeNull();
  },
};
