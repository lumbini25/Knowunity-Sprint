import type { Preview } from '@storybook/nextjs-vite'
import { themes } from 'storybook/theming'
import { withKeyboardInset } from './withKeyboardInset'

// The design system itself. tokens.css declares every custom property;
// preview.css applies them to the canvas. Order matters -- tokens first.
//
// fonts.css declares Greed VF for the catalog, because Storybook does not run
// the Next root layout that loads it; app/fonts.css pins the width axis, and is
// shared with the app rather than duplicated so the two cannot drift.
import '../build/css/tokens.css'
import './fonts.css'
import '../app/fonts.css'
import './preview.css'

/* The prototype is iOS-only at a fixed 390px. Device width is deliberately
   not a design token (see the Responsive note in tokens/tokens.json), so it
   belongs here in build config. */
const IPHONE_390 = {
  name: 'iPhone (390 x 844)',
  styles: { width: '390px', height: '844px' },
  type: 'mobile',
} as const;

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    // Dark mode only. The canvas background comes from
    // --semantic-background-page in preview.css, so Storybook's own
    // light/dark background switcher is turned off rather than fighting it.
    backgrounds: { disable: true },

    // Docs pages use Storybook's dark chrome to match.
    docs: { theme: themes.dark },

    // Component stories open at 390px. Docs pages render their stories
    // inline and are not constrained by this, so a page of swatches gets
    // the full width.
    viewport: { options: { iphone390: IPHONE_390 } },
  },

  // Reserves the space an iOS keyboard takes, so any screen can be checked
  // keyboard-raised. The keyboard itself is drawn by the operating system --
  // the Figma asset exists only to answer "can the student still reach the CTA".
  globalTypes: {
    keyboard: {
      description: 'Reserve the space an iOS keyboard occupies',
      toolbar: {
        title: 'Keyboard',
        icon: 'mobile',
        items: [
          { value: 'hidden', title: 'Keyboard hidden' },
          { value: 'raised', title: 'Keyboard raised' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [withKeyboardInset],

  // The viewport each story opens with. Still switchable from the toolbar.
  initialGlobals: {
    viewport: { value: 'iphone390', isRotated: false },
    keyboard: 'hidden',
  },
};

export default preview;