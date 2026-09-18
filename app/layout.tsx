import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
// Authored, and loaded after the generated tokens so the width pin wins.
import './fonts.css';

/**
 * Greed VF — the UI typeface, self-hosted.
 *
 * NOT AN INSTALLED FONT. Until now `tokens.json` named the family
 * `"Greed Standard-TRIAL"` and nothing shipped the file, so the prototype drew
 * in Greed only on a machine with the trial installed — and in a system font
 * everywhere else, including CI and Chromatic. `next/font/local` hashes the
 * file into the build and serves it from our own origin, so the typeface
 * travels with the app.
 *
 * `src` is relative to THIS file, and the file stays in `app/`. next/font
 * fingerprints and serves it itself, which is why a self-hosted font must not
 * sit in `public/` — a copy there would be a second, unhashed, uncached route
 * to the same bytes.
 *
 * ONE FACE, NOT SIX. A variable font carries its whole weight range in one
 * file, so `weight` is declared as the range `'300 900'` rather than as a
 * separate `@font-face` per weight. The browser interpolates, and every
 * `font-weight` the type scale asks for — 400, 500, 600, 700 — is a real
 * instance rather than a browser-synthesised fake bold.
 *
 * `slnt` (−14 to 0) is left alone: the design uses no italic, and `style` is
 * declared `normal` so nothing synthesises one.
 *
 * WIDTH IS THE TRAP. The `wdth` axis runs 75–130 and its default is **75,
 * which the font names "Condensed"**. The design is Greed *Standard* — `wdth`
 * 100. `declarations` advertises the face's real width range, which is what
 * lets plain `font-stretch: 100%` (in `app/fonts.css`) map to `wdth 100`
 * instead of every screen quietly rendering a width narrower than the design.
 */
const greed = localFont({
  src: './GreedCollectionVF-TRIAL.ttf',
  // The variable axis, as a range. One file covers Light through Heavy.
  weight: '300 900',
  style: 'normal',
  /* `swap` is the reason text never disappears: the browser paints the
     fallback immediately and repaints in Greed when it arrives, instead of
     holding the text invisible while the font loads (the "flash of invisible
     text" a default `font-display` gives you). */
  display: 'swap',
  /* The stack behind it. These are also the metrics next/font measures against
     to size its fallback, so the swap moves the text as little as possible. */
  fallback: ['system-ui', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif'],
  /* Exposes the family as a custom property instead of a class, so the design
     tokens can name it. `--primitive-font-family-*` points here, which is how
     one font reaches all 26 routes without a component changing. */
  variable: '--font-greed',
  /* Tells CSS the face spans Condensed (75%) to Extended (130%). Without this
     the browser assumes a single `normal` width and ignores `font-stretch`. */
  declarations: [{ prop: 'font-stretch', value: '75% 130%' }],
});

export const metadata: Metadata = {
  title: 'Explain Out Loud',
  description: 'Voice-based active recall for Knowunity.',
};

/**
 * `viewportFit: 'cover'` is the one that matters. `Screen` reserves the status
 * bar and the home indicator with `env(safe-area-inset-*)`, and those resolve
 * to zero unless the viewport covers the display cutouts — so without this the
 * scaffold's insets silently do nothing on device.
 *
 * The prototype is iOS-only at a fixed 390px in dark mode, per CLAUDE.md, which
 * is why the colour scheme is declared rather than inferred.
 *
 * SCALING IS NOT PINNED, AND MUST NOT BE. `maximumScale: 1` with
 * `userScalable: false` was here and it fails WCAG 1.4.4 on every route —
 * caught by `npm run a11y`, which is exactly the class of defect a story
 * cannot see, since no story owns a <meta name="viewport">. A student with low
 * vision has to be able to pinch-zoom a 390px screen. It also bought nothing:
 * iOS Safari has ignored `user-scalable=no` since iOS 10.
 *
 * Fixing the layout at 390px is a design decision about the canvas. Preventing
 * someone from magnifying that canvas is a different decision, and not one the
 * 390px rule implies.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // Colour and type come from globals.css, which is generated from
  // tokens/tokens.json — the same stylesheet Storybook loads, so a route and a
  // story render identically.
  //
  // `greed.variable` is the class that defines `--font-greed`. It goes on
  // <html> rather than <body> so anything rendered outside the body flow —
  // a portal, a dialog, Next's own error overlay — is still inside the element
  // that declares it.
  return (
    <html lang="en" className={greed.variable}>
      <body>{children}</body>
    </html>
  );
}
