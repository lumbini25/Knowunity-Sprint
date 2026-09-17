import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { ListItem, ListItemGroup } from './ListItem';

const FIGMA_DESCRIPTION = `The repeating row inside \`strongCard\` and \`reviewTopicCard\`: a marker, then the topic.

**There is no listItem component in Figma.** The row is a layer — \`Container (×3), horizontal, gap Space/300, padding Space/400 inline and Space/0 block\` — inside those two cards, so there is no variant axis to turn into props. \`variant\` is derived from the only difference between the two cards: which \`Checkbox\` state the marker takes. Everything else about them is identical.

From the two cards' own Figma descriptions:

> **strongCard** — List of topics the student recalled well. Shown on the summary screen after a session.
>
> **reviewTopicCard** — List of topics the student needs to revisit.
>
> **DON'T:** Do not add more than three rows — the component has no scroll or overflow behaviour. Use \`strongCard\` for topics recalled well and \`reviewTopicCard\` for those needing review; do not mix them in one card.

---

**The marker is a \`Checkbox\`, and both variants check.** Both cards instance \`Checkbox Selection=Selected\`; only \`State\` differs. \`Default\` draws a solid \`highlight/indicator\` disc with a \`text/primary\` tick. \`Error\` draws a dark error fill ringed in \`feedback/error\`, with the *same tick* in that red. So a review row reads as a completed item marked wrong, not as a cross — there is no X anywhere in the file, and no green.

**The row has no block padding.** Its 48px height is the checkbox's own 48×48 tap box. That is what Figma draws, and it is also what WCAG 2.5.8 wants: a padded row around a bare 24px marker would have met the height and missed the target.

**TOKEN NOTES.** Two bindings depart, both to the nearest bound step:

- \`highlight/indicator\` → **\`highlight/border\`**. The semantic layer carries the exact value (violet/highlight, \`#9d85ff\`) under one name only, documented as the edge of the active tab. A \`highlight/indicator\` alias is requested in design-system.md's Gaps — the value is right, the name is one role narrow.
- \`feedback/errorSurface\` (\`#3a1417\`) → **\`feedback/error/subtle\`**. Nothing resolves to it: red/950 is darker (\`#2a0808\`), red/900 lighter (\`#532831\`). red/900 is the nearer step and is already the fill behind a wrong result.

The stroke and the tick on the review marker are \`feedback/error\` exactly, and the strong tick is \`text/primary\` exactly.`;

const meta = {
  title: 'Components/ListItem',
  component: ListItem,
  parameters: {
    layout: 'centered',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    variant: { control: 'radio', options: ['Strong', 'Review'] },
    label: { control: 'text' },
    showDivider: { control: 'boolean' },
  },
  // Width only. A single row needs a list around it to be valid markup, but the
  // multi-row stories bring their own, so that wrapper is per-story.
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '390px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Strong: Story = {
  name: 'variant=Strong',
  args: { variant: 'Strong', label: 'Causes of the Civil Rights Movement' },
  decorators: [(Story) => <ListItemGroup label="Topics"><Story /></ListItemGroup>],
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Causes of the Civil Rights Movement')).toBeVisible();

    // Proves the token stylesheet reached the row: Checkbox State=Default is a
    // solid highlight disc with the tick in text/primary.
    const box = canvasElement.querySelector('.knw-listitem__box') as HTMLElement;
    await expect(getComputedStyle(box).backgroundColor).toBe('rgb(157, 133, 255)');
    const icon = canvasElement.querySelector('.knw-listitem__icon') as HTMLElement;
    await expect(getComputedStyle(icon).color).toBe('rgb(244, 242, 255)');

    // Space/400 inline, Space/0 block — the height comes from the checkbox.
    const row = canvasElement.querySelector('.knw-listitem') as HTMLElement;
    const s = getComputedStyle(row);
    await expect(s.paddingTop).toBe('0px');
    await expect(s.paddingLeft).toBe('16px');
    await expect(s.columnGap).toBe('12px');

    // A 24px disc inside a 48px tap box, which is what clears WCAG 2.5.8.
    await expect(getComputedStyle(box).width).toBe('24px');
    const marker = canvasElement.querySelector('.knw-listitem__marker') as HTMLElement;
    await expect(getComputedStyle(marker).width).toBe('48px');
    await expect(Math.round(row.getBoundingClientRect().height)).toBe(48);
  },
};

export const Review: Story = {
  name: 'variant=Review',
  args: { variant: 'Review', label: 'Civil Rights Act of 1964' },
  decorators: [(Story) => <ListItemGroup label="Topics"><Story /></ListItemGroup>],
  play: async ({ canvasElement }) => {
    // Checkbox State=Error: the same tick, ringed rather than filled. Stroke and
    // tick are feedback/error exactly; the fill is the nearest bound step.
    const box = canvasElement.querySelector('.knw-listitem__box') as HTMLElement;
    const s = getComputedStyle(box);
    await expect(s.borderTopColor).toBe('rgb(255, 107, 107)');
    await expect(s.borderTopWidth).toBe('2px');
    await expect(s.backgroundColor).toBe('rgb(83, 40, 49)');
    const icon = canvasElement.querySelector('.knw-listitem__icon') as HTMLElement;
    await expect(getComputedStyle(icon).color).toBe('rgb(255, 107, 107)');
  },
};

export const WithDivider: Story = {
  name: 'showDivider=true',
  args: { variant: 'Strong', label: 'Key historical figures', showDivider: true },
  decorators: [(Story) => <ListItemGroup label="Topics"><Story /></ListItemGroup>],
  play: async ({ canvasElement }) => {
    const row = canvasElement.querySelector('.knw-listitem') as HTMLElement;
    await expect(getComputedStyle(row).borderTopWidth).toBe('1px');
  },
};

/** How the row is actually used: three of them, which is the documented maximum. */
export const StrongCard: Story = {
  name: 'strongCard — three rows',
  render: () => (
    <ListItemGroup label="Topics you recalled well">
      <ListItem variant="Strong" label="Causes of the Civil Rights Movement" />
      <ListItem variant="Strong" label="Key historical figures" showDivider />
      <ListItem variant="Strong" label="Montgomery Bus Boycott" showDivider />
    </ListItemGroup>
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('list', { name: 'Topics you recalled well' })).toBeVisible();
    await expect(canvasElement.querySelectorAll('.knw-listitem')).toHaveLength(3);
    // Only the rows after the first carry a divider.
    await expect(canvasElement.querySelectorAll('.knw-listitem--divided')).toHaveLength(2);
  },
};

export const ReviewTopicCard: Story = {
  name: 'reviewTopicCard — three rows',
  render: () => (
    <ListItemGroup label="Topics to revisit">
      <ListItem variant="Review" label="Civil Rights Act of 1964" />
      <ListItem variant="Review" label="Voting Rights Act" showDivider />
      <ListItem variant="Review" label="Brown v. Board of Education" showDivider />
    </ListItemGroup>
  ),
  play: async ({ canvas }) => {
    // A named list, so it is not announced as an unlabelled group of items.
    await expect(canvas.getByRole('list', { name: 'Topics to revisit' })).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};
