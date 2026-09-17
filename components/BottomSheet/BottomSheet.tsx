import type { HTMLAttributes, ReactNode } from 'react';
import { SquareIcon, XCloseIcon } from './icons';
import './BottomSheet.css';

/**
 * bottomSheet
 *
 * Built from the Figma component set "bottomSheet" (node 3675:30952). The
 * height axis carries the same name and the same options as Figma, and the two
 * Figma SLOT properties become the `middleSection` and `bottomSection` props.
 *
 * The app bar inside the sheet has two Figma variants and this covers both.
 * `Type=dismissAndAction` is x-close on the left and square on the right, both
 * 24px icons in 40px circular buttons inside 48px tap targets; `Type=Default`
 * is the handle alone. Which one you get follows from what you wire: pass
 * `onDismiss` for the ✕, `onAction` for the square, neither for Default.
 *
 * The Figma component has no description. Everything the stories document about
 * when to use it comes from design-system.md, not from the designer.
 */

export type BottomSheetHeight = 'S' | 'M' | 'L';

export interface BottomSheetProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'children'> {
  /**
   * Figma variant axis. Caps how tall the sheet grows; the body scrolls past
   * it. The sheet still hugs shorter content.
   */
  height?: BottomSheetHeight;
  /** App bar title. */
  title?: string;
  /** Optional sub-title. Hidden by default, matching the Figma component. */
  descriptor?: string;
  /** Figma SLOT: the scrolling body. */
  middleSection?: ReactNode;
  /** Figma SLOT: actions pinned below the body. A button or buttonGroup. */
  bottomSection?: ReactNode;
  /** Called when the leading x-close action is pressed. */
  onDismiss?: () => void;
  /** Called when the trailing square action is pressed. */
  onAction?: () => void;
  /** Accessible name for the leading action. */
  dismissLabel?: string;
  /**
   * Accessible name for the trailing action. Figma names the icon `square` but
   * says nothing about what it does, so this is a placeholder worth setting.
   */
  actionLabel?: string;
  /** Replaces the leading x-close button entirely. */
  leadingAction?: ReactNode;
  /** Replaces the trailing square button entirely. */
  trailingAction?: ReactNode;
}

function ActionButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress?: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className="knw-sheet__action-button" aria-label={label} onClick={onPress}>
      <span className="knw-sheet__action-icon">{children}</span>
    </button>
  );
}

export function BottomSheet({
  height = 'S',
  title,
  descriptor,
  middleSection,
  bottomSection,
  onDismiss,
  onAction,
  dismissLabel = 'Close',
  actionLabel = 'Select',
  leadingAction,
  trailingAction,
  ...rest
}: BottomSheetProps) {
  return (
    <section className={`knw-sheet knw-sheet--${height}`} aria-label={title} {...rest}>
      <div className="knw-sheet__appbar">
        {/* Decorative: the sheet is dismissed through the x-close action, not
            by dragging, so the handle carries no role of its own. */}
        <div className="knw-sheet__handle" aria-hidden="true" />

        <div className="knw-sheet__bar">
          {/* Same rule as the trailing square below: a control with nothing to
              do is not drawn. Figma's app bar has a second variant, `Default`,
              which is the handle and nothing else — the `exit screen`
              (15807:21978) uses it, and a sheet whose only two actions are the
              buttons underneath has no business also offering an inert ✕. So
              `onDismiss` is what decides, and `Type=Default` is simply the
              call without it. */}
          <span className="knw-sheet__action">
            {leadingAction ??
              (onDismiss ? (
                <ActionButton label={dismissLabel} onPress={onDismiss}>
                  <XCloseIcon />
                </ActionButton>
              ) : null)}
          </span>

          <div className="knw-sheet__titles">
            {title ? <h2 className="knw-sheet__title">{title}</h2> : null}
            {descriptor ? <p className="knw-sheet__descriptor">{descriptor}</p> : null}
          </div>

          {/* A CONTROL WITH NOTHING TO DO IS NOT DRAWN.
              Figma's app bar is the `dismissAndAction` variant, so the square
              is always in the file — but the file "says nothing about what it
              does", and every sheet in this prototype was shipping a mystery
              button that did nothing when tapped. It now appears only when
              something is wired to it, the same way recallResponseCard's
              next-action only becomes a button when a handler arrives.

              The SLOT stays either way: it is what balances the titles against
              the close button on the other side, so removing it would shift
              the header off-centre. */}
          <span className="knw-sheet__action">
            {trailingAction ??
              (onAction ? (
                <ActionButton label={actionLabel} onPress={onAction}>
                  <SquareIcon />
                </ActionButton>
              ) : null)}
          </span>
        </div>
      </div>

      {middleSection ? (
        // The body scrolls once the sheet hits its height cap, so it has to be
        // reachable by keyboard on its own -- a scrollable region that cannot
        // take focus is unreachable for anyone not using a pointer.
        <div className="knw-sheet__middle" tabIndex={0}>
          {middleSection}
        </div>
      ) : null}

      {bottomSection ? <div className="knw-sheet__bottom">{bottomSection}</div> : null}
    </section>
  );
}
