import type { Metadata, Viewport } from 'next';
import './globals.css';

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
  // The font, colour and type come from globals.css, which is generated from
  // tokens/tokens.json — the same stylesheet Storybook loads, so a route and a
  // story render identically.
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
