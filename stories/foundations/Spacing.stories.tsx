import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useMemo } from 'react';
import { Group, Layer, Meta as TokenMeta, Page } from './Foundation';
import { byValue, resolveAll, tokensUnder } from './tokens';

/**
 * Spacing exists only in the primitive layer -- the semantic layer covers
 * colour and type. Sorted by value so the scale reads in order, from the
 * largest negative step up to the largest positive one.
 */
const spaceTokens = byValue(tokensUnder('primitive.space'));

function Spacing() {
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(spaceTokens)),
    [],
  );

  return (
    <Page
      title="Spacing"
      intro="Every step on the spacing scale, drawn at its real width. Negative steps pull layout back rather than adding space, so they are drawn as a dashed outline at the same magnitude."
    >
      <Layer
        name="Primitive"
        note="There is no semantic spacing layer. The semantic layer covers colour and type only, so these primitives are what components consume for spacing."
      >
      <Group name="primitive.space">
        {spaceTokens.map((token) => {
          const size = typeof token.raw === 'number' ? token.raw : 0;
          const negative = size < 0;
          return (
            <div className="fnd-row" key={token.path}>
              <div
                className={negative ? 'fnd-bar fnd-bar-negative' : 'fnd-bar'}
                // Width still comes from the token; negatives are flipped with
                // calc so the bar has a drawable magnitude.
                style={{
                  width: negative ? `calc(var(${token.name}) * -1)` : `var(${token.name})`,
                }}
              />
              <TokenMeta token={token} value={resolved[token.name] ?? ''} />
            </div>
          );
        })}
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
    // Both ends of the scale render.
    await expect(canvas.getByText('--primitive-space-negative-600')).toBeVisible();
    await expect(canvas.getByText('--primitive-space-4000')).toBeVisible();

    // The scale reads in order. Importing the JSON hoists integer-like keys
    // ahead of string ones, so without an explicit sort the negative steps
    // land after the positive ones -- this catches that.
    const values = [...canvasElement.querySelectorAll('.fnd-value')].map((el) =>
      el.textContent?.trim(),
    );
    await expect(values[0]).toBe('-24px');
    await expect(values[values.length - 1]).toBe('160px');

    // No spacing token carries a $description, so every row must say so
    // rather than leaving the line blank.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(spaceTokens.length);
  },
};
