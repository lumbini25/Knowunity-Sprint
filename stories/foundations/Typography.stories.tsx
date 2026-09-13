import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer, Meta as TokenMeta, Page, PlainRow } from './Foundation';
import { byValue, groupBySegment, resolveAll, tokensUnder, type Token } from './tokens';

/**
 * A text style is five tokens -- fontFamily, fontWeight, fontSize, lineHeight
 * and letterSpacing -- sharing a path such as semantic.typeScale.display.L.
 * Authored order is scale order, largest first, so it is kept as-is.
 */
const styles: Array<[string, Token[]]> = [];
for (const token of tokensUnder('semantic.typeScale')) {
  const stylePath = token.path.split('.').slice(0, 4).join('.');
  const existing = styles.find(([path]) => path === stylePath);
  if (existing) existing[1].push(token);
  else styles.push([stylePath, [token]]);
}

/** The raw font values the text styles are built from. */
const primitiveFont = tokensUnder('primitive.font');
const primitiveGroups = groupBySegment(primitiveFont, 2).map(
  ([group, tokens]) =>
    // Sizes, line heights and tracking are numeric scales; sort them by value.
    [group, tokens.every((t) => typeof t.raw === 'number') ? byValue(tokens) : tokens] as [
      string,
      Token[],
    ],
);

const SPECIMEN = 'Recall what you learned today';

function Specimen({ tokens }: { tokens: Token[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [computed, setComputed] = useState<Record<string, string>>({});

  // Read the five properties back off the rendered specimen, so the values
  // printed are the ones the browser actually applied.
  useEffect(() => {
    if (!ref.current) return;
    const style = getComputedStyle(ref.current);
    setComputed({
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
    });
  }, []);

  const name = (property: string) =>
    tokens.find((token) => token.path.endsWith(`.${property}`))?.name ?? '';

  return (
    <div className="fnd-row-stacked">
      <p
        ref={ref}
        className="fnd-specimen"
        style={{
          fontFamily: `var(${name('fontFamily')})`,
          fontWeight: `var(${name('fontWeight')})`,
          fontSize: `var(${name('fontSize')})`,
          lineHeight: `var(${name('lineHeight')})`,
          letterSpacing: `var(${name('letterSpacing')})`,
        }}
      >
        {SPECIMEN}
      </p>
      {tokens.map((token) => {
        const property = token.path.split('.').pop() ?? '';
        return <TokenMeta key={token.path} token={token} value={computed[property] ?? ''} />;
      })}
    </div>
  );
}

function Typography() {
  const resolved = useMemo(
    () => (typeof document === 'undefined' ? {} : resolveAll(primitiveFont)),
    [],
  );

  return (
    <Page
      title="Type"
      intro="Both layers of the type system: the text styles components use, and the raw font values they are built from."
    >
      <Layer
        name="Semantic"
        note="Every text style in the semantic layer, rendered at its real size in scale order. Each style lists its five tokens with the value the browser resolved."
      >
        {styles.map(([stylePath, tokens]) => (
          <Group key={stylePath} name={stylePath.replace('semantic.typeScale.', '')}>
            <Specimen tokens={tokens} />
          </Group>
        ))}
      </Layer>

      <Layer
        name="Primitive"
        note="The raw font values. Text styles alias into these; components use the styles above, never these directly."
      >
        {primitiveGroups.map(([group, tokens]) => (
          <Group key={group} name={group}>
            {tokens.map((token) => (
              <PlainRow key={token.path}>
                <TokenMeta token={token} value={resolved[token.name] ?? ''} />
              </PlainRow>
            ))}
          </Group>
        ))}
      </Layer>
    </Page>
  );
}

const meta = {
  title: 'Foundations/Type',
  component: Typography,
  parameters: { layout: 'fullscreen' },
  // Display L is 103px; it needs more than the 390px device width.
  globals: { viewport: { value: undefined } },
  tags: ['autodocs'],
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  play: async ({ canvas }) => {
    // Both layers render.
    await expect(canvas.getByRole('heading', { name: 'Semantic' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'Primitive' })).toBeVisible();

    // All 19 styles render, the largest first.
    await expect(canvas.getByRole('heading', { name: 'display.L' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'caption.S-regular' })).toBeVisible();

    // Every primitive font group renders.
    for (const [group] of primitiveGroups) {
      await expect(canvas.getByRole('heading', { name: group })).toBeVisible();
    }

    // Proves the type tokens resolved rather than falling back to a browser
    // default: Display L is 103px, per its own description in tokens.json.
    const specimens = canvas.getAllByText(SPECIMEN);
    await expect(getComputedStyle(specimens[0]).fontSize).toBe('103px');
    await expect(getComputedStyle(specimens[0]).fontWeight).toBe('900');

    // typeScale tokens all carry a description; primitives carry none.
    const missing = canvas.getAllByText(/No description in tokens\.json/);
    await expect(missing).toHaveLength(primitiveFont.length);
  },
};
