import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useMemo } from 'react';
import { Group, Layer, Meta as TokenMeta, Page } from './Foundation';
import { byValue, resolveAll, tokensUnder } from './tokens';

/** Radius, like spacing, exists only in the primitive layer. Sorted by value. */
const radiusTokens = byValue(tokensUnder('primitive.radius'));

function Radius() {
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(radiusTokens)),
    [],
  );

  return (
    <Page
      title="Radius"
      intro="Every corner radius, applied to a box of one size so the steps can be compared. The last step is large enough to round any box it is applied to into a pill."
    >
      <Layer
        name="Primitive"
        note="There is no semantic radius layer. The semantic layer covers colour and type only, so these primitives are what components consume for corner radius."
      >
        <Group name="primitive.radius">
          {radiusTokens.map((token) => (
            <div className="fnd-row" key={token.path}>
              <div className="fnd-radius-box" style={{ borderRadius: `var(${token.name})` }} />
              <TokenMeta token={token} value={resolved[token.name] ?? ''} />
            </div>
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
    await expect(canvas.getByText('--primitive-radius-100')).toBeVisible();
    await expect(canvas.getByText('--primitive-radius-full')).toBeVisible();

    // Resolved from the generated stylesheet, and in ascending order.
    const values = [...canvasElement.querySelectorAll('.fnd-value')].map((el) =>
      el.textContent?.trim(),
    );
    await expect(values[0]).toBe('4px');
    await expect(values[values.length - 1]).toBe('9999px');

    // No radius token carries a $description either.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(radiusTokens.length);
  },
};
