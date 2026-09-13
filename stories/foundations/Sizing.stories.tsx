import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useMemo } from 'react';
import { Group, Layer, Meta as TokenMeta, Page } from './Foundation';
import { byValue, resolveAll, tokensUnder } from './tokens';

/**
 * The three size scales that are not spacing or radius. design-system.md names
 * these by their Figma names -- "weight: Stroke/Heavy Border", "iconSlot
 * Size=400" -- so this page is what maps those names to a custom property and
 * a pixel value.
 */
const iconTokens = byValue(tokensUnder('primitive.icon'));
const illustrationTokens = byValue(tokensUnder('primitive.illustration'));
const strokeTokens = byValue(tokensUnder('primitive.stroke'));
const allSizes = [...iconTokens, ...illustrationTokens, ...strokeTokens];

function Sizing() {
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(allSizes)),
    [],
  );

  return (
    <Page
      title="Sizing"
      intro="Icon sizes, illustration sizes and stroke weights, each drawn at its real size. These are the scales component specs refer to by name."
    >
      <Layer
        name="Primitive"
        note="There is no semantic sizing layer. The semantic layer covers colour and type only, so these primitives are what components consume."
      >
        <Group name="icon">
          {iconTokens.map((token) => (
            <div className="fnd-row" key={token.path}>
              <div
                className="fnd-size-box"
                style={{ width: `var(${token.name})`, height: `var(${token.name})` }}
              />
              <TokenMeta token={token} value={resolved[token.name] ?? ''} />
            </div>
          ))}
        </Group>

        <Group name="illustration">
          {illustrationTokens.map((token) => (
            // Stacked: the largest is 320px and would not fit the row's
            // visual column.
            <div className="fnd-row-stacked" key={token.path}>
              <div
                className="fnd-size-box"
                style={{ width: `var(${token.name})`, height: `var(${token.name})` }}
              />
              <TokenMeta token={token} value={resolved[token.name] ?? ''} />
            </div>
          ))}
        </Group>

        <Group name="stroke">
          {strokeTokens.map((token) => (
            <div className="fnd-row" key={token.path}>
              <div
                className="fnd-stroke-line"
                style={{ borderTopWidth: `var(${token.name})` }}
              />
              <TokenMeta token={token} value={resolved[token.name] ?? ''} />
            </div>
          ))}
        </Group>
      </Layer>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Sizing',
  component: Sizing,
  parameters: { layout: 'fullscreen' },
  // The largest illustration is 320px, which will not fit the 390px device
  // width alongside its name and value.
  globals: { viewport: { value: undefined } },
  tags: ['autodocs'],
} satisfies Meta<typeof Sizing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  play: async ({ canvas }) => {
    for (const group of ['icon', 'illustration', 'stroke']) {
      await expect(canvas.getByRole('heading', { name: group })).toBeVisible();
    }

    // Both ends of each scale, resolved from the generated stylesheet.
    await expect(canvas.getByText('--primitive-icon-100')).toBeVisible();
    await expect(canvas.getByText('--primitive-icon-400')).toBeVisible();
    await expect(canvas.getByText('--primitive-illustration-4000')).toBeVisible();

    // These two are the tokens design-system.md calls Stroke/Border and
    // Stroke/Heavy Border. Their values are why this page exists.
    await expect(canvas.getByText('--primitive-stroke-border')).toBeVisible();
    await expect(canvas.getByText('--primitive-stroke-heavy-border')).toBeVisible();
    await expect(canvas.getByText(/^2px/)).toBeVisible();
    await expect(canvas.getByText(/^320px/)).toBeVisible();

    // None of these carry a $description.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(allSizes.length);
  },
};
