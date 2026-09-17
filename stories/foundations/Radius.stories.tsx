import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useMemo } from 'react';
import { Group, Layer, Meta as TokenMeta, Page } from './Foundation';
import { byValue, resolveAll, tokensUnder, type Token } from './tokens';

/** The raw scale, sorted by value. */
const radiusTokens = byValue(tokensUnder('primitive.radius'));

/** Roles components consume. */
const semanticRadius = tokensUnder('semantic.radius');

const allRadius = [...radiusTokens, ...semanticRadius];

function Box({ token, value }: { token: Token; value: string }) {
  return (
    <div className="fnd-row">
      <div className="fnd-radius-box" style={{ borderRadius: `var(${token.name})` }} />
      <TokenMeta token={token} value={value} />
    </div>
  );
}

function Radius() {
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(allRadius)),
    [],
  );

  return (
    <Page
      title="Radius"
      intro="Every corner radius, applied to a box of one size so the steps can be compared. The last step is large enough to round any box it is applied to into a pill."
    >
      <Layer
        name="Semantic"
        note="Named for the shape it produces. This is the layer components consume."
      >
        <Group name="semantic.radius">
          {semanticRadius.map((token) => (
            <Box key={token.path} token={token} value={resolved[token.name] ?? ''} />
          ))}
        </Group>
      </Layer>

      <Layer
        name="Primitive"
        note="The raw scale the semantic roles alias into. Components never consume these directly."
      >
        <Group name="primitive.radius">
          {radiusTokens.map((token) => (
            <Box key={token.path} token={token} value={resolved[token.name] ?? ''} />
          ))}
        </Group>
      </Layer>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Radius',
  component: Radius,
  parameters: { layout: 'fullscreen' },
  globals: { viewport: { value: undefined } },
  tags: ['autodocs'],
} satisfies Meta<typeof Radius>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'Semantic' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Primitive' })).toBeVisible();

    await expect(canvas.getByText('--semantic-radius-pill')).toBeVisible();
    await expect(canvas.getByText('--primitive-radius-100')).toBeVisible();
    await expect(canvas.getByText('--primitive-radius-full')).toBeVisible();

    // The raw scale is in ascending order, resolved from the generated CSS.
    const primitiveValues = [...canvasElement.querySelectorAll('.fnd-value')]
      .map((el) => el.textContent?.trim())
      .filter((text) => text && !text.includes('←'));
    await expect(primitiveValues[0]).toBe('4px');
    await expect(primitiveValues[primitiveValues.length - 1]).toBe('9999px');

    // Semantic radius carries a description; no primitive does.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(radiusTokens.length);
  },
};
