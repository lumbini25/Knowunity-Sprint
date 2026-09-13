/**
 * Style Dictionary build configuration.
 *
 *   npm run tokens
 *
 * Reads the DTCG token files in tokens/ and writes CSS custom properties to
 * build/css/tokens.css. Custom property names are derived from each token's
 * own path -- semantic.interactive.primary becomes
 * --semantic-interactive-primary. Nothing is shortened or renamed.
 *
 * The generated file is committed, so a fresh clone builds without running
 * this first.
 */

/**
 * Figma stores font weights as style names ("SemiBold"). CSS font-weight only
 * accepts numbers or a handful of keywords, so the names are mapped here.
 * This mapping is a build-time decision, not a token -- it lives in the config,
 * not in tokens/tokens.json. Add a row here if the type ramp gains a weight.
 */
const FONT_WEIGHTS = { Regular: 400, SemiBold: 600, Bold: 700, Heavy: 900 };

/** Header written at the top of every generated file. */
const GENERATED_NOTE = [
  'This file is generated. Do not edit it by hand.',
  'Source: tokens/tokens.json',
  'Regenerate: npm run tokens',
];

export default {
  // Every .json file under tokens/, at any depth. More token files can be
  // added to the folder and they are picked up without touching this config.
  source: ['tokens/**/*.json'],

  hooks: {
    fileHeaders: {
      'knowunity/generated': () => GENERATED_NOTE,
    },

    transforms: {
      // Dimensions are stored as bare numbers (16, -24). The design system is
      // a fixed 390px iOS layout, so they are pixels, not rem.
      'knowunity/dimension-to-px': {
        type: 'value',
        filter: (token) => token.$type === 'dimension',
        transform: (token) => `${token.$value}px`,
      },

      // "SemiBold" -> 600. Fails the build on an unmapped weight rather than
      // emitting a font-weight the browser will ignore.
      'knowunity/font-weight-to-number': {
        type: 'value',
        filter: (token) => token.$type === 'fontWeight',
        transform: (token) => {
          const weight = FONT_WEIGHTS[token.$value];
          if (weight === undefined) {
            throw new Error(
              `Unmapped font weight "${token.$value}" at ${token.path.join('.')}. ` +
                'Add it to FONT_WEIGHTS in style-dictionary.config.mjs.',
            );
          }
          return weight;
        },
      },

      // The only $type: number tokens are letter-spacing, stored as raw
      // percentages because Figma could not variable-bind them. CSS
      // letter-spacing takes no percentage, so -1 becomes -0.01em.
      'knowunity/letter-spacing-to-em': {
        type: 'value',
        filter: (token) => token.$type === 'number',
        transform: (token) => `${token.$value / 100}em`,
      },
    },
  },

  platforms: {
    css: {
      transforms: [
        'name/kebab',
        'color/css',
        'fontFamily/css',
        'knowunity/dimension-to-px',
        'knowunity/font-weight-to-number',
        'knowunity/letter-spacing-to-em',
      ],
      buildPath: 'build/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            // Keep the two-layer alias chain: a semantic token points at its
            // primitive with var(), instead of being flattened to a literal.
            outputReferences: true,
            fileHeader: 'knowunity/generated',
          },
        },
      ],
    },
  },
};
