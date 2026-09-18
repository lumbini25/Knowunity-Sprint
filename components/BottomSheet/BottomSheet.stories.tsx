import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { Button } from '../Button/Button';
import { BottomSheet } from './BottomSheet';

/**
 * The Figma component set carries no description, so there is nothing of the
 * designer's to quote. What follows is attributed to design-system.md instead,
 * and the gap is stated plainly rather than papered over.
 */
const DOCS = `**This component has no description in Figma.** Unlike \`button\`, the \`bottomSheet\` set (node \`3675:30952\`) has an empty description field, so there is no USE / DON'T guidance from the designer. Everything below comes from \`design-system.md\`.

**Use it for** a message or choice that requires a response before the student can continue. \`design-system.md\` routes you here from \`snackbar\`: *"If the message requires a user response before continuing, use a modal or bottom sheet instead."*

**Composition** follows the screen scaffold — the body scrolls, and the actions stay pinned to the bottom of the safe area, because "Primary CTAs sit low so thumbs reach them without shifting grip."

**\`height\`** caps how tall the sheet grows. The sheet still hugs shorter content; once it reaches the cap the body scrolls and the actions stay put.

**Known gaps, all flagged rather than invented:**
- No Figma description, and no entry for this component in \`design-system.md\`.
- The app bar actions need \`buttonIcon\`, which is not built. Their slots render at the correct size but empty.
- No z-index token exists for overlays — \`design-system.md\` lists this under Gaps, so a consumer must decide layering itself.
- This renders as a labelled region, not a modal dialog. Nothing in Figma or \`design-system.md\` specifies focus trapping or a scrim, so none is implemented.`;

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DOCS } },
  },
  argTypes: {
    height: { control: 'radio', options: ['S', 'M', 'L'] },
    title: { control: 'text' },
    descriptor: { control: 'text' },
  },
  // A bottom sheet sits against the bottom edge of the phone.
  decorators: [
    (Story) => (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Leave this session?',
    middleSection: <p style={{ margin: 0 }}>Your progress on this topic is saved. You can pick it up again whenever you like.</p>,
    bottomSection: (
      <>
        <Button variant="Primary" size="M" CTA="Keep learning" />
        <Button variant="Tertiary" size="M" CTA="Leave anyway" />
      </>
    ),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeightS: Story = {
  name: 'height=S',
  // The handlers are what make the two app-bar actions appear at all — without
  // one, that side is not drawn, because a control that does nothing is not a
  // control. Together they are Figma's `Type=dismissAndAction`; neither of them
  // is `Type=Default`. The assertions below cover their rendered form.
  args: { height: 'S', onDismiss: fn(), onAction: fn() },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'Leave this session?' })).toBeVisible();

    // The app bar's two actions, as Figma's Type=dismissAndAction variant has
    // them: x-close on the left, square on the right.
    const dismiss = canvas.getByRole('button', { name: 'Close' });
    const action = canvas.getByRole('button', { name: 'Select' });
    await expect(dismiss).toBeVisible();
    await expect(action).toBeVisible();

    // Both are 40px circles carrying a 24px icon in text/primary.
    for (const button of [dismiss, action]) {
      const s = getComputedStyle(button);
      await expect(s.width).toBe('40px');
      await expect(s.height).toBe('40px');
      await expect(s.color).toBe('rgb(244, 242, 255)');
      await expect(button.querySelector('svg path')).not.toBeNull();
    }
    const icon = dismiss.querySelector('svg') as SVGElement;
    await expect(Math.round(icon.getBoundingClientRect().width)).toBe(24);

    // The 48px tap target still surrounds the 40px button.
    const target = canvasElement.querySelector('.knw-sheet__action') as HTMLElement;
    await expect(getComputedStyle(target).width).toBe('48px');

    // Proves the token stylesheet reached the component: the sheet rests on
    // background/surface (navy 800) with the sheet radius on its top corners
    // only, and caps at the S height.
    const sheet = canvasElement.querySelector('.knw-sheet') as HTMLElement;
    const styles = getComputedStyle(sheet);
    await expect(styles.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(styles.borderTopLeftRadius).toBe('36px');
    await expect(styles.borderBottomLeftRadius).toBe('0px');
    await expect(styles.maxHeight).toBe('300px');
  },
};

export const NoTrailingAction: Story = {
  name: 'onAction unset — no trailing square',
  args: { height: 'S', onDismiss: fn() },
  play: async ({ canvas, canvasElement }) => {
    // THE COMMON CASE. Most sheets have no second action, and drawing one
    // anyway shipped a mystery button that did nothing when tapped — caught by
    // clicking every control on every route, not by any story.
    await expect(canvas.queryByRole('button', { name: 'Select' })).toBeNull();

    // Close is unaffected — it was wired, so it is drawn.
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeVisible();

    // The slot itself stays, so the titles keep their centre against the close
    // button on the other side.
    const slot = canvasElement.querySelector('.knw-sheet__action') as HTMLElement;
    await expect(slot).toBeTruthy();
    await expect(getComputedStyle(slot).width).toBe('48px');
  },
};

/**
 * Figma's other app-bar variant. Wire neither handler and the bar is the
 * handle alone — which is what `exit screen` (`15807:21978`) draws, and what
 * the mic permission sheet now draws too. Use it when the sheet's buttons are
 * the whole decision: a third, silent way out only muddies which is which.
 */
export const TypeDefault: Story = {
  name: 'Type=Default — handle only',
  // No title either, matching the variant — so the region takes its name from
  // an aria-label instead, or it is announced as an unnamed group.
  args: { height: 'S', title: undefined, 'aria-label': 'Leave this session?' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('region', { name: 'Leave this session?' })).toBeVisible();
    await expect(canvas.queryByRole('heading')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Close' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Select' })).toBeNull();

    // The handle is still there, and still decorative — the sheet is dismissed
    // through its own actions, never by dragging.
    const handle = canvasElement.querySelector('.knw-sheet__handle') as HTMLElement;
    await expect(handle).toBeTruthy();
    await expect(handle.getAttribute('aria-hidden')).toBe('true');

    // Nothing is left tabbable in the bar, so the first stop is the body.
    const bar = canvasElement.querySelector('.knw-sheet__bar') as HTMLElement;
    await expect(bar.querySelectorAll('button')).toHaveLength(0);
  },
};

export const HeightM: Story = {
  name: 'height=M',
  args: { height: 'M' },
  play: async ({ canvasElement }) => {
    const sheet = canvasElement.querySelector('.knw-sheet') as HTMLElement;
    await expect(getComputedStyle(sheet).maxHeight).toBe('494px');
  },
};

export const HeightL: Story = {
  name: 'height=L',
  args: { height: 'L' },
  play: async ({ canvasElement }) => {
    const sheet = canvasElement.querySelector('.knw-sheet') as HTMLElement;
    await expect(getComputedStyle(sheet).maxHeight).toBe('768px');
  },
};

/** The Figma app bar hides its sub-title by default; this turns it on. */
export const WithDescriptor: Story = {
  name: 'descriptor=visible',
  args: { height: 'S', descriptor: 'Nothing is lost' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Nothing is lost')).toBeVisible();
  },
};

/**
 * The body overflows the S cap, so it scrolls while the actions stay pinned.
 * This is what the height axis is actually for.
 */
export const BodyScrolls: Story = {
  name: 'height=S, body overflows',
  args: {
    height: 'S',
    middleSection: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i} style={{ margin: 0 }}>
            Recall point {i + 1}. Saying an answer out loud is what makes it stick.
          </p>
        ))}
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const body = canvasElement.querySelector('.knw-sheet__middle') as HTMLElement;
    // The body is the part that scrolls, not the sheet.
    await expect(getComputedStyle(body).overflowY).toBe('auto');
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

    // The actions are still on screen.
    const sheet = canvasElement.querySelector('.knw-sheet') as HTMLElement;
    const bottom = canvasElement.querySelector('.knw-sheet__bottom') as HTMLElement;
    await expect(bottom.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      Math.ceil(sheet.getBoundingClientRect().bottom),
    );
  },
};
