import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useMemo } from 'react';
import { Group, Layer, Meta as TokenMeta, Page } from './Foundation';
import { byValue, groupBySegment, resolveAll, tokensUnder } from './tokens';

/**
 * The raw scale, sorted by value so it reads in order from the largest
 * negative step up to the largest positive one.
 */
const spaceTokens = byValue(tokensUnder('primitive.space'));

/** Roles components consume: inset, gap and the optical centring nudge. */
const semanticSpace = tokensUnder('semantic.space');
const semanticGroups = groupBySegment(semanticSpace, 2);

const allSpace = [...spaceTokens, ...semanticSpace];

function Bar({ token, value }: { token: (typeof spaceTokens)[number]; value: string }) {
  const size = typeof token.raw === 'number' ? token.raw : 0;
  const negative = size < 0;
  return (
    <div className="fnd-row" key={token.path}>
      <div
        className={negative ? 'fnd-bar fnd-bar-negative' : 'fnd-bar'}
        // Width still comes from the token; negatives are flipped with calc so
        // the bar has a drawable magnitude.
        style={{ width: negative ? `calc(var(${token.name}) * -1)` : `var(${token.name})` }}
      />
      <TokenMeta token={token} value={value} />
    </div>
  );
}

function Spacing() {
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(allSpace)),
    [],
  );

  return (
    <Page
      title="Spacing"
      intro="Every step on the spacing scale, drawn at its real width. Negative steps pull layout back rather than adding space, so they are drawn as a dashed outline at the same magnitude."
    >
      <Layer
        name="Semantic"
        note="Named for the job the space does. This is the layer components consume: inset is padding inside a control, gap sits between an icon and its label, and the optical nudge centres a label against its pill."
      >
        {semanticGroups.map(([group, tokens]) => (
          <Group key={group} name={`semantic.space.${group}`}>
            {tokens.map((token) => (
              <Bar key={token.path} token={token} value={resolved[token.name] ?? ''} />
            ))}
          </Group>
        ))}
      </Layer>

      <Layer
        name="Primitive"
        note="The raw scale the semantic roles alias into. Components never consume these directly."
      >
        <Group name="primitive.space">
          {spaceTokens.map((token) => (
            <Bar key={token.path} token={token} value={resolved[token.name] ?? ''} />
          ))}
        </Group>
      </Layer>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Spacing',
  component: Spacing,
  parameters: { layout: 'fullscreen' },
  // The largest step is 160px; the row also carries its name and description.
  globals: { viewport: { value: undefined } },
  tags: ['autodocs'],
} satisfies Meta<typeof Spacing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  play: async ({ canvas, canvasElement }) => {
    // Both layers render.
    await expect(canvas.getByRole('heading', { name: 'Semantic' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Primitive' })).toBeVisible();

    // Both ends of the raw scale render.
    await expect(canvas.getByText('--primitive-space-negative-600')).toBeVisible();
    await expect(canvas.getByText('--primitive-space-4000')).toBeVisible();

    // The raw scale reads in order. Importing the JSON hoists integer-like keys
    // ahead of string ones, so without an explicit sort the negative steps land
    // after the positive ones -- this catches that.
    const primitiveValues = [...canvasElement.querySelectorAll('.fnd-value')]
      .map((el) => el.textContent?.trim())
      .filter((text) => text && !text.includes('←'));
    await expect(primitiveValues[0]).toBe('-24px');
    await expect(primitiveValues[primitiveValues.length - 1]).toBe('160px');

    // Semantic space tokens carry a description; no primitive does.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(spaceTokens.length);
  },
};
