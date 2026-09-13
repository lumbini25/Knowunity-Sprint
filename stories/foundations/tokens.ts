/**
 * Reads tokens/tokens.json so the foundation pages document the real system
 * rather than a copy of it. Values shown on screen are resolved by the browser
 * from build/css/tokens.css -- see resolveProperty below -- so a page can never
 * drift from the generated stylesheet.
 */
import tokensJson from '../../tokens/tokens.json';

/** Shown wherever a token carries no $description, instead of an empty cell. */
export const NO_DESCRIPTION = 'No description in tokens.json';

export type TokenType = 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'number';

export interface Token {
  /** Dotted path as authored, e.g. semantic.interactive.primary */
  path: string;
  /** CSS custom property, e.g. --semantic-interactive-primary */
  name: string;
  type: TokenType;
  /** $value as authored: a literal for primitives, a {reference} for semantics. */
  raw: string | number;
  /** The referenced path when this token is an alias, otherwise null. */
  alias: string | null;
  description: string | null;
}

interface RawToken {
  $value: string | number;
  $type?: string;
  $description?: string;
}

type TokenNode = RawToken | { [key: string]: TokenNode };

function isToken(node: TokenNode): node is RawToken {
  return typeof node === 'object' && node !== null && '$value' in node;
}

/**
 * Turns a token path into its CSS custom property name. Mirrors the name/kebab
 * rule in style-dictionary.config.mjs, so typeScale -> type-scale and
 * 50-interactive stays 50-interactive.
 */
export function cssName(path: string): string {
  const body = path
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
  return `--${body}`;
}

function flatten(node: TokenNode, path = ''): Token[] {
  if (isToken(node)) {
    const raw = node.$value;
    const isAlias = typeof raw === 'string' && raw.startsWith('{') && raw.endsWith('}');
    return [
      {
        path,
        name: cssName(path),
        type: (node.$type ?? 'color') as TokenType,
        raw,
        alias: isAlias ? raw.slice(1, -1) : null,
        description: node.$description ?? null,
      },
    ];
  }
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => flatten(child as TokenNode, path ? `${path}.${key}` : key));
}

/** Every token in the file, in the order it was authored. */
export const allTokens: Token[] = flatten(tokensJson as unknown as TokenNode);

/** Tokens under a path prefix, keeping authored order (which is scale order). */
export function tokensUnder(prefix: string): Token[] {
  return allTokens.filter((t) => t.path === prefix || t.path.startsWith(`${prefix}.`));
}

/**
 * Sorts a numeric scale ascending by its own value.
 *
 * Authored order cannot be trusted for these: JavaScript hoists integer-like
 * object keys ("0", "100", "400") ahead of string keys ("negative-600", "050")
 * when the JSON is imported, which scrambles a scale that reads correctly in
 * the file. Sorting by value restores true scale order.
 */
export function byValue(tokens: Token[]): Token[] {
  return [...tokens].sort((a, b) => {
    const left = typeof a.raw === 'number' ? a.raw : Number.POSITIVE_INFINITY;
    const right = typeof b.raw === 'number' ? b.raw : Number.POSITIVE_INFINITY;
    return left - right;
  });
}

/** Groups tokens by one segment of their path, preserving first-seen order. */
export function groupBySegment(tokens: Token[], index: number): Array<[string, Token[]]> {
  const groups = new Map<string, Token[]>();
  for (const token of tokens) {
    const key = token.path.split('.')[index];
    const existing = groups.get(key);
    if (existing) existing.push(token);
    else groups.set(key, [token]);
  }
  return [...groups.entries()];
}

/**
 * Resolves a custom property the way the browser does: apply it to a throwaway
 * element and read the computed value back. This follows the whole
 * semantic -> primitive var() chain, so what a page prints is what the
 * generated stylesheet actually produces.
 */
export function resolveProperty(cssVar: string, property: string): string {
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.opacity = '0';
  probe.style.pointerEvents = 'none';
  probe.style.setProperty(property, `var(${cssVar})`);
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return value;
}

/** The CSS property used to resolve each token type into a readable value. */
const PROBE_PROPERTY: Record<TokenType, string> = {
  color: 'background-color',
  // margin-top rather than width: the spacing scale includes negative values,
  // and width would clamp those to zero.
  dimension: 'margin-top',
  fontFamily: 'font-family',
  fontWeight: 'font-weight',
  number: 'letter-spacing',
};

/** Resolves every given token to its computed value, keyed by custom property. */
export function resolveAll(tokens: Token[]): Record<string, string> {
  const resolved: Record<string, string> = {};
  for (const token of tokens) {
    resolved[token.name] = resolveProperty(token.name, PROBE_PROPERTY[token.type]);
  }
  return resolved;
}
