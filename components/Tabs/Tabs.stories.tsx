import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { Tabs, Tab } from './Tabs';

/** Verbatim from the Figma component set "Tabs" (node 4146:17273). */
const FIGMA_DESCRIPTION = `A horizontal tab bar for switching between sibling views. 4 variants by tab count: 2, 3, 4, or 5 tabs. Each tab is a Tab instance with a label text node. The active state is handled at the tab item level.

**USE:** Top-level navigation between peer content sections — for example Sources, Chat, and Tools in a subject folder. Use 2–5 tabs only; the variants do not support fewer than 2 or more than 5.

**DON'T:** Use tabs for sequential steps or flows where the user must complete one before accessing the next — use a progress indicator and separate screens instead. Do not use more than five tabs; beyond that, navigation intent becomes unclear on mobile.

**The \`Tab\` set has no description of its own.** Its axis is \`State\`: Active | Inactive, plus a \`Label\` text property. It is exported alongside \`Tabs\` because Figma models it as a component set rather than a layer.

---

**The active underline is Figma's own \`highlight/border\`.** It is \`#9d85ff\`, off the violet scale and brighter than \`border/selected\` (\`violet/500\`, \`#9178e6\`), which was used as a stand-in while the token was missing. \`highlight/border\` now exists in \`tokens.json\`, so the underline matches the file. Worth noting \`border/selected\`'s description still reads *"Selected cards, **active tabs**"* — two tokens now claim this role.

**The inactive label departs from Figma, deliberately.** Figma binds \`text/disabled\` — 40% white, 3.79:1 on the page, under AA. An inactive tab is not disabled: it is tappable, and tapping it is the entire point. \`text/tertiary\` (48%) clears AA at 4.62:1 and is what is bound here. The Figma variable is also arguably misnamed for this use.

**The type is off-system by 1px.** Figma sets the label in Inter SemiBold 17 with automatic line height (≈21px). The Greed scale has no 17 — \`headline/XS-bold\` is 18/20 — so the tab comes out 30px tall against Figma's 29. The same drift was recorded on TextField and ChatInput. Nothing was invented to close it.

**The 4px top radius is dropped, and renders identically.** Figma binds \`Radius/100\` to the tab's top corners, but the tab has no background fill and no top border in either state, so the radius has nothing to round — it is invisible in the file too. The system has no semantic radius at 4, and rather than add one for a value that cannot be seen, it is omitted and recorded here.

**Keyboard behaviour is not from Figma.** \`role="tab"\` carries a contract Figma cannot express: left and right arrows move between tabs, and only the active tab sits in the page's tab order. Without it the bar fails as navigation for anyone not using touch.`;

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    tabCount: { control: 'radio', options: ['2', '3', '4', '5'] },
    activeIndex: { control: { type: 'number', min: 0, max: 4 } },
    labels: { control: 'object' },
  },
  // 350px is the width Figma draws the set at: 390 less a 20px page margin
  // each side.
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ===== Tab count ===== */

export const TabCount2: Story = {
  name: 'Tab count=2',
  args: { tabCount: '2', labels: ['Sources', 'Chat'] },
  play: async ({ canvas, canvasElement }) => {
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(2);

    // Proves the token stylesheet reached the bar: the active tab takes the
    // selected border at the heavy stroke width, and the full-contrast label.
    const active = canvasElement.querySelector('.knw-tab--Active') as HTMLElement;
    const s = getComputedStyle(active);
    await expect(s.borderBottomColor).toBe('rgb(157, 133, 255)');
    await expect(s.borderBottomWidth).toBe('2px');
    await expect(s.color).toBe('rgb(244, 242, 255)');
    await expect(s.paddingTop).toBe('4px');
    await expect(s.paddingLeft).toBe('12px');

    // The inactive tab carries the same 2px edge, drawn in nothing, so the bar
    // does not shift when the selection moves.
    const inactive = canvasElement.querySelector('.knw-tab--Inactive') as HTMLElement;
    const is = getComputedStyle(inactive);
    await expect(is.borderBottomWidth).toBe('2px');
    await expect(is.borderBottomColor).toBe('rgba(0, 0, 0, 0)');
    await expect(is.color).toBe('rgba(245, 243, 255, 0.48)');

    // Two tabs, equal halves of the 350px bar.
    const widths = tabs.map((t) => Math.round(t.getBoundingClientRect().width));
    await expect(widths).toEqual([175, 175]);
  },
};

export const TabCount3: Story = {
  name: 'Tab count=3',
  args: { tabCount: '3', labels: ['Sources', 'Chat', 'Tools'] },
  play: async ({ canvas }) => {
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);
    // Equal thirds, matching Figma's 116.67.
    const widths = tabs.map((t) => t.getBoundingClientRect().width);
    await expect(Math.round(widths[0] * 100) / 100).toBe(116.66);
  },
};

export const TabCount4: Story = {
  name: 'Tab count=4',
  args: { tabCount: '4', labels: ['Sources', 'Chat', 'Tools', 'Notes'] },
  play: async ({ canvas }) => {
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(4);
    await expect(Math.round(tabs[0].getBoundingClientRect().width * 10) / 10).toBe(87.5);
  },
};

export const TabCount5: Story = {
  name: 'Tab count=5',
  args: { tabCount: '5', labels: ['Sources', 'Chat', 'Tools', 'Notes', 'Quiz'] },
  play: async ({ canvas }) => {
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(5);
    await expect(Math.round(tabs[0].getBoundingClientRect().width)).toBe(70);
  },
};

/* ===== Tab, State ===== */

export const TabStateActive: Story = {
  name: 'Tab — State=Active',
  render: () => (
    <div role="tablist" aria-label="One tab">
      <Tab State="Active" label="Sources" />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const tab = canvas.getByRole('tab', { name: 'Sources' });
    await expect(tab).toHaveAttribute('aria-selected', 'true');

    const s = getComputedStyle(canvasElement.querySelector('.knw-tab') as HTMLElement);
    await expect(s.borderBottomColor).toBe('rgb(157, 133, 255)');
    // headline/XS-bold — 1px off Figma's Inter 17, see the docs above.
    await expect(s.fontSize).toBe('18px');
    await expect(s.lineHeight).toBe('20px');
    await expect(s.fontWeight).toBe('600');
  },
};

export const TabStateInactive: Story = {
  name: 'Tab — State=Inactive',
  render: () => (
    <div role="tablist" aria-label="One tab">
      <Tab State="Inactive" label="Chat" />
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const tab = canvas.getByRole('tab', { name: 'Chat' });
    await expect(tab).toHaveAttribute('aria-selected', 'false');
    // Out of the page tab order until it becomes the active tab.
    await expect(tab).toHaveAttribute('tabindex', '-1');

    const s = getComputedStyle(canvasElement.querySelector('.knw-tab') as HTMLElement);
    await expect(s.color).toBe('rgba(245, 243, 255, 0.48)');
    await expect(s.borderBottomColor).toBe('rgba(0, 0, 0, 0)');
  },
};

/* ===== behaviour ===== */

/** Selection moves on tap. Only one tab is Active at a time. */
export const Interactive: Story = {
  name: 'Selecting a tab',
  render: function Render() {
    const [active, setActive] = useState(0);
    return (
      <Tabs
        tabCount="3"
        labels={['Sources', 'Chat', 'Tools']}
        activeIndex={active}
        onChange={setActive}
        label="Folder sections"
      />
    );
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('tab', { name: 'Sources' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(canvas.getByRole('tab', { name: 'Tools' }));
    await expect(canvas.getByRole('tab', { name: 'Tools' })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tab', { name: 'Sources' })).toHaveAttribute('aria-selected', 'false');

    // Exactly one underline, wherever the selection sits.
    await expect(canvasElement.querySelectorAll('.knw-tab--Active')).toHaveLength(1);
  },
};

/** Arrow keys move between tabs, which `role="tab"` requires. */
export const KeyboardNavigation: Story = {
  name: 'Arrow-key navigation',
  render: function Render() {
    const [active, setActive] = useState(0);
    return (
      <Tabs
        tabCount="3"
        labels={['Sources', 'Chat', 'Tools']}
        activeIndex={active}
        onChange={setActive}
        label="Folder sections"
      />
    );
  },
  play: async ({ canvas }) => {
    const first = canvas.getByRole('tab', { name: 'Sources' });
    first.focus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Chat' })).toHaveAttribute('aria-selected', 'true');

    // Wraps around the end rather than stopping.
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect(canvas.getByRole('tab', { name: 'Tools' })).toHaveAttribute('aria-selected', 'true');
  },
};

/** All four counts together, which is how the set reads in Figma. */
export const AllCounts: Story = {
  name: 'All tab counts',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--semantic-space-layout-xl)' }}>
      <Tabs tabCount="2" labels={['Sources', 'Chat']} label="Two" />
      <Tabs tabCount="3" labels={['Sources', 'Chat', 'Tools']} label="Three" />
      <Tabs tabCount="4" labels={['Sources', 'Chat', 'Tools', 'Notes']} label="Four" />
      <Tabs tabCount="5" labels={['Sources', 'Chat', 'Tools', 'Notes', 'Quiz']} label="Five" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bars = [...canvasElement.querySelectorAll('.knw-tabs')];
    await expect(bars.map((b) => b.querySelectorAll('.knw-tab').length)).toEqual([2, 3, 4, 5]);
    // Every bar has exactly one active tab.
    await expect(bars.every((b) => b.querySelectorAll('.knw-tab--Active').length === 1)).toBe(true);
  },
};
