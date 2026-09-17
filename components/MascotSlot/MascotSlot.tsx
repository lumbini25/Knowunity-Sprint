import type { HTMLAttributes, ReactNode } from 'react';
import './MascotSlot.css';

/**
 * mascotSlot
 *
 * Built from the Figma component set "mascotSlot" (node 9003:8873).
 *
 * From the component's Figma description:
 *
 *   Container for Knowie mascot illustrations. 4 sizes (XL–4XL), standby pose
 *   only.
 *
 *   USE: Full-screen emotional moments — celebrations, empty states,
 *   onboarding, session completion. Match size to available screen space.
 *
 *   DON'T: Use inside list items or cards. Knowie is a screen-level character.
 *
 * This is the container, which is what Figma calls it. The illustration is
 * passed as children, the same way iconSlot takes an icon — Knowie's standby
 * pose is a single 311,000-character path, far too heavy to inline.
 */

export type MascotSlotSize = 'XL' | '2XL' | '3XL' | '4XL';

export interface MascotSlotProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma variant axis. Match it to the space the screen has. */
  size?: MascotSlotSize;
  /** The illustration. Fills the slot's padded box. */
  children?: ReactNode;
  /**
   * What Knowie is expressing here, for anyone not seeing the illustration.
   * Left off, the slot is decorative and hidden from assistive technology —
   * which is right when the surrounding copy already says it.
   */
  label?: string;
}

export function MascotSlot({ size = 'XL', children, label, ...rest }: MascotSlotProps) {
  return (
    <div
      className={`knw-mascot knw-mascot--${size}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {children ?? <span className="knw-mascot__placeholder" />}
    </div>
  );
}
