import type { Decorator } from '@storybook/nextjs-vite';
import './keyboard-inset.css';

/**
 * Reserves the space an iOS keyboard occupies, so any screen can be checked
 * keyboard-raised.
 *
 * The Figma "Keyboard" component exists to "verify that primary CTAs remain
 * reachable above the keyboard", and its description says not to ship it:
 * the real keyboard is drawn by the operating system at runtime. This gives
 * the same answer without a fake keyboard in the codebase.
 *
 * Toggle it from the Storybook toolbar, or pin it on a story with
 * `globals: { keyboard: 'raised' }`.
 */

/*
 * Height of the iOS keyboard on a 390pt device, from the Figma asset
 * (node 3086:16935, 390x342). Like the 390px device width, this is a device
 * characteristic rather than a design decision, so it lives in build config --
 * tokens.json deliberately omits the Responsive collection for the same reason.
 */
const IOS_KEYBOARD_HEIGHT = 342;

export const withKeyboardInset: Decorator = (Story, context) => {
  if (context.globals.keyboard !== 'raised') return <Story />;

  return (
    <div className="knw-kb-frame">
      <div className="knw-kb-screen">
        <Story />
      </div>
      <div
        className="knw-kb-inset"
        style={{ height: `${IOS_KEYBOARD_HEIGHT}px` }}
        aria-hidden="true"
      >
        <span className="knw-kb-label">
          iOS keyboard · {IOS_KEYBOARD_HEIGHT}px · drawn by the system, not by us
        </span>
      </div>
    </div>
  );
};
