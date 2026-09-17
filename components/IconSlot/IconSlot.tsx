import type { HTMLAttributes, ReactNode } from 'react';
import { SquareIcon } from '../BottomSheet/icons';
import './IconSlot.css';

/**
 * iconSlot
 *
 * Built from the Figma component set "iconSlot" (node 9003:8809).
 *
 * From the component's Figma description:
 *
 *   Internal icon sizing scaffold. 6 sizes (100–400) tied to the Icon token
 *   scale. Variant is labelled "Size (IGNORE)" — it is set by the parent
 *   component, not chosen per instance.
 *
 *   USE: Inside other components wherever an icon appears. Always prefer
 *   iconSlot over a raw vector.
 *
 *   DON'T: Change the size variant manually — the parent component owns it.
 *
 * design-system.md says the same: "internal sizing scaffold. Always use
 * iconSlot wherever an icon appears inside a component rather than placing a
 * raw vector. The size variant is set by the parent component and must not be
 * overridden per instance."
 *
 * That DON'T is why this component takes no colour and no spacing. It is a box
 * at one of six sizes; the icon inside inherits `currentColor` from the parent.
 */

/** The six Icon-scale steps, named the way Figma names them. */
export type IconSlotSize = '100' | '150' | '200' | '250' | '300' | '400';

export interface IconSlotProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Figma variant axis, labelled "Size (IGNORE)" there. The parent component
   * owns this — it is not a per-instance choice.
   */
  size?: IconSlotSize;
  /**
   * The icon. Figma models this as an instance-swap property whose default is
   * a placeholder square.
   */
  children?: ReactNode;
}

export function IconSlot({ size = '300', children, ...rest }: IconSlotProps) {
  return (
    <span className={`knw-iconslot knw-iconslot--${size}`} aria-hidden="true" {...rest}>
      {children ?? <SquareIcon />}
    </span>
  );
}
