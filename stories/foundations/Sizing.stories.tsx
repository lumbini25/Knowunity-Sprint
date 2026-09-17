import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useMemo } from 'react';
import { Group, Layer, Meta as TokenMeta, Page } from './Foundation';
import { byValue, groupBySegment, resolveAll, tokensUnder, type Token } from './tokens';

/**
 * The size scales that are not spacing or radius. design-system.md names these
 * by their Figma names -- "weight: Stroke/Heavy Border", "iconSlot Size=400" --
 * so this page is what maps those names to a custom property and a pixel value.
 */
const iconTokens = byValue(tokensUnder('primitive.icon'));
const illustrationTokens = byValue(tokensUnder('primitive.illustration'));
const strokeTokens = byValue(tokensUnder('primitive.stroke'));
const controlTokens = byValue(tokensUnder('primitive.size'));
const primitiveSizes = [...controlTokens, ...iconTokens, ...illustrationTokens, ...strokeTokens];

/** Roles components consume: control heights, icon sizes, minimum tap target. */
const semanticSizes = tokensUnder('semantic.size');
const semanticGroups = groupBySegment(semanticSizes, 2);

/** Border widths components consume. */
const semanticStroke = tokensUnder('semantic.stroke');

const allSizes = [...primitiveSizes, ...semanticSizes, ...semanticStroke];

function SquareRow({ token, value }: { token: Token; value: string }) {
  return (
    <div className="fnd-row">
      <div
        className="fnd-size-box"
        style={{ width: `var(${token.name})`, height: `var(${token.name})` }}
      />
      <TokenMeta token={token} value={value} />
    </div>
  );
}

function Sizing() {
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(allSizes)),
    [],
  );

  return (
    <Page
      title="Sizing"
      intro="Control heights, icon sizes, illustration sizes and stroke weights, each drawn at its real size. These are the scales component specs refer to by name."
    >
      <Layer
        name="Semantic"
        note="Named for the job the size does. This is the layer components consume: a control height, the icon inside it, and the minimum tap target a short control keeps as a transparent hit area."
      >
        {semanticGroups.map(([group, tokens]) => (
          <Group key={group} name={`semantic.size.${group}`}>
            {tokens.map((token) => (
              <SquareRow key={token.path} token={token} value={resolved[token.name] ?? ''} />
            ))}
          </Group>
        ))}

        <Group name="semantic.stroke">
          {semanticStroke.map((token) => (
            <div className="fnd-row" key={token.path}>
              <div className="fnd-stroke-line" style={{ borderTopWidth: `var(${token.name})` }} />
              <TokenMeta token={token} value={resolved[token.name] ?? ''} />
            </div>
          ))}
        </Group>
      </Layer>

      <Layer
        name="Primitive"
        note="The raw scales the semantic roles alias into. Components never consume these directly."
      >
        <Group name="primitive.size.control">
          {controlTokens.map((token) => (
            <SquareRow key={token.path} token={token} value={resolved[token.name] ?? ''} />
          ))}
        </Group>

        <Group name="primitive.icon">
          {iconTokens.map((token) => (
            <SquareRow key={token.path} token={token} value={resolved[token.name] ?? ''} />
          ))}
        </Group>

        <Group name="primitive.illustration">
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

        <Group name="primitive.stroke">
          {strokeTokens.map((token) => (
            <div className="fnd-row" key={token.path}>
              <div className="fnd-stroke-line" style={{ borderTopWidth: `var(${token.name})` }} />
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
    await expect(canvas.getByRole('heading', { name: 'Semantic' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Primitive' })).toBeVisible();

    for (const group of [
      'semantic.size.control',
      'semantic.size.icon',
      'semantic.size.tapTarget',
      'semantic.stroke',
      'primitive.size.control',
      'primitive.icon',
      'primitive.illustration',
      'primitive.stroke',
    ]) {
      await expect(canvas.getByRole('heading', { name: group })).toBeVisible();
    }

    // The roles the button consumes.
    await expect(canvas.getByText('--semantic-size-control-m')).toBeVisible();
    await expect(canvas.getByText('--semantic-size-tap-target-min')).toBeVisible();

    // These two are the tokens design-system.md calls Stroke/Border and
    // Stroke/Heavy Border. Their values are why this page exists.
    await expect(canvas.getByText('--primitive-stroke-border')).toBeVisible();
    await expect(canvas.getByText('--primitive-stroke-heavy-border')).toBeVisible();
    // Name rather than value: 320px now appears twice, once for the primitive
    // and once for the semantic role that aliases it.
    await expect(canvas.getByText('--primitive-illustration-4000')).toBeVisible();
    await expect(canvas.getByText('--semantic-size-illustration-4-xl')).toBeVisible();

    // Semantic sizes carry a description; no primitive does.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(primitiveSizes.length);
  },
};
