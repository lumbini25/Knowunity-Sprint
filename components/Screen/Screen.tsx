import type { HTMLAttributes, ReactNode } from 'react';
import './Screen.css';

/**
 * scaffold
 *
 * Built from the Figma component set "scaffold" (node 3085:9242).
 *
 * From the component's Figma description:
 *
 *   Used to quickly create screens using our components, making use of Figma
 *   Slots. Allows for quickly testing how designs look on different device
 *   types.
 *
 * The four Figma SLOT properties become props of the same names, as do the
 * three booleans. The size axis is restricted to iPhone 13 — CLAUDE.md's first
 * rule is 390px, iOS only, no desktop and no breakpoints, so the seven other
 * device sizes in Figma are out of scope rather than unbuilt.
 *
 * Composition follows design-system.md's Screen scaffold: navigation at the
 * top, a scrolling body, and the primary action pinned low.
 */

/** Figma offers eight; this project builds one. */
export type ScreenSize = 'iPhone 13';

export interface ScreenProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma variant axis, narrowed to the only size this project ships. */
  size?: ScreenSize;
  /** Figma SLOT: back buttons, titles, streak counters. */
  topNavigation?: ReactNode;
  /** Figma SLOT: the scrolling body of the screen. */
  middleContent?: ReactNode;
  /** Figma SLOT: bottom navigation, chat input, or the primary action. */
  bottomContent?: ReactNode;
  /** Figma SLOT: a bottom sheet raised over the screen. */
  bottomSheetOnly?: ReactNode;
  /** Figma boolean property. */
  showTopNavSlot?: boolean;
  /** Figma boolean property. */
  showBottomNavSlot?: boolean;
  /** Figma boolean property: dims the screen behind a raised sheet. */
  showBottomSheetBackground?: boolean;
}

export function Screen({
  size = 'iPhone 13',
  topNavigation,
  middleContent,
  bottomContent,
  bottomSheetOnly,
  showTopNavSlot = true,
  showBottomNavSlot = true,
  showBottomSheetBackground = false,
  ...rest
}: ScreenProps) {
  return (
    <div className="knw-screen" data-size={size} {...rest}>
      {/* Reserves the status bar; iOS draws the bar itself. */}
      <div className="knw-screen__statusbar" aria-hidden="true" />

      {showTopNavSlot && topNavigation ? (
        <div className="knw-screen__top">{topNavigation}</div>
      ) : null}

      {middleContent ? (
        // The body is the part that scrolls, so it has to be keyboard-reachable
        // on its own.
        <div className="knw-screen__middle" tabIndex={0}>
          {middleContent}
        </div>
      ) : null}

      {showBottomNavSlot && bottomContent ? (
        <div className="knw-screen__bottom">{bottomContent}</div>
      ) : null}

      {showBottomSheetBackground ? (
        <div className="knw-screen__scrim" aria-hidden="true" />
      ) : null}

      {bottomSheetOnly ? <div className="knw-screen__sheet">{bottomSheetOnly}</div> : null}
    </div>
  );
}
