import type { HTMLAttributes, ReactNode } from 'react';
import './ButtonGroup.css';

/**
 * buttonGroup
 *
 * Built from the Figma component set "buttonGroup" (node 9003:8455).
 *
 * From the component's Figma description:
 *
 *   Two controls composed together. Vertical stacks two equal-weight buttons.
 *   Horizontal pairs a compact buttonIcon with a full labelled button —
 *   different visual weights by design, with the icon as the subordinate
 *   action.
 *
 *   USE: Vertical for equal choices ("Keep learning" / "Leave anyway").
 *   Horizontal for a primary CTA alongside a compact secondary (close icon +
 *   "Continue").
 *
 *   DON'T: Treat the horizontal pair as equals — if both need equal weight,
 *   use vertical.
 *
 *   VARIANT AXES
 *     variant — one of: Horizontal | Vertical
 *     size    — one of: M | L
 *
 * The group carries no colour, radius or type of its own. It is a layout: the
 * buttons passed into it keep every binding they already own, which is why
 * `size` here only has to match the `size` set on them.
 *
 * ONE GAP. Figma's Horizontal variant pairs a `buttonIcon` with a `button`, and
 * `buttonIcon` is not built in this library. Horizontal therefore lays out
 * whatever two children it is given, with the first compact and the second
 * filling the row — the shape Figma draws, without the component that belongs
 * in the first slot. Logged in design-system.md.
 */

export type ButtonGroupVariant = 'Horizontal' | 'Vertical';
export type ButtonGroupSize = 'M' | 'L';

export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma variant axis. */
  variant?: ButtonGroupVariant;
  /** Figma variant axis. Must match the `size` set on the buttons inside. */
  size?: ButtonGroupSize;
  /** The two controls. */
  children?: ReactNode;
}

export function ButtonGroup({
  variant = 'Vertical',
  size = 'M',
  children,
  ...rest
}: ButtonGroupProps) {
  return (
    <div
      className={`knw-buttongroup knw-buttongroup--${variant} knw-buttongroup--${size}`}
      {...rest}
    >
      {children}
    </div>
  );
}
