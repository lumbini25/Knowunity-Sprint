import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useMemo } from 'react';
import { Group, Meta as TokenMeta, Page } from './Foundation';
import { groupBySegment, resolveAll, tokensUnder, type Token } from './tokens';

/** Semantic colours, grouped by role: background, interactive, text, and so on. */
const semanticColors = tokensUnder('semantic').filter((token) => token.type === 'color');
const semanticGroups = groupBySegment(semanticColors, 1);

/** The raw palette the semantic layer aliases into, grouped by colour family. */
const primitiveColors = tokensUnder('primitive.color');
const primitiveGroups = groupBySegment(primitiveColors, 2);

const LAYERS = {
  semantic: {
    title: 'Colors / semantic',
    intro:
      'Named for the job the colour does. This is the layer components consume. Every one is an alias into a primitive, shown after the resolved value.',
    groups: semanticGroups,
  },
  primitive: {
    title: 'Colors / primitive',
    intro:
      'The raw palette, grouped by colour family. These hold the literal values; components never consume them directly.',
    groups: primitiveGroups,
  },
} as const;

export type LayerName = keyof typeof LAYERS;

function Colors({ layer }: { layer: LayerName }) {
  const { title, intro, groups } = LAYERS[layer];
  const tokens: Token[] = groups.flatMap(([, group]) => group);

  // Resolved once, on first render. The values come from the browser reading
  // build/css/tokens.css, not from anything restated here. Both stylesheets are
  // imported at module load, so they are already applied by the time this runs.
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(tokens)),
    [tokens],
  );

  return (
    <Page title={title} intro={intro}>
      {groups.map(([group, groupTokens]) => (
        <Group key={group} name={group}>
          {groupTokens.map((token) => (
            <div className="fnd-row" key={token.path}>
              <div className="fnd-swatch" style={{ background: `var(${token.name})` }} />
              <TokenMeta token={token} value={resolved[token.name] ?? ''} />
            </div>
          ))}
        </Group>
      ))}
    </Page>
  );
}

const meta = {
  title: 'Foundations/Colors',
  component: Colors,
  parameters: { layout: 'fullscreen' },
  // Swatch grids need the room, so these pages are not held to the 390px
  // device width that component stories open at.
  globals: { viewport: { value: undefined } },
  tags: ['autodocs'],
} satisfies Meta<typeof Colors>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Semantic: Story = {
  args: { layer: 'semantic' },
  play: async ({ canvas }) => {
    // Every semantic group renders.
    for (const [group] of semanticGroups) {
      await expect(canvas.getByRole('heading', { name: group })).toBeVisible();
    }

    // Proves the page reads the generated stylesheet: background/page resolves
    // through its alias to navy 950 (#090c18). Fails if tokens.css did not load.
    const resolvedNavy = await canvas.findAllByText(/rgb\(9, 12, 24\)/);
    await expect(resolvedNavy.length).toBeGreaterThan(0);

    // Every semantic colour carries a description, so the "no description"
    // message must not appear on this layer at all.
    await expect(canvas.queryByText(/No description in tokens\.json/)).toBeNull();
  },
};

export const Primitive: Story = {
  args: { layer: 'primitive' },
  play: async ({ canvas }) => {
    // Every colour family renders.
    for (const [group] of primitiveGroups) {
      await expect(canvas.getByRole('heading', { name: group })).toBeVisible();
    }

    // Primitives hold literal values and are never aliases.
    await expect(canvas.getByText('--primitive-color-navy-950')).toBeVisible();

    // None of them carry a $description.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(primitiveColors.length);
  },
};
