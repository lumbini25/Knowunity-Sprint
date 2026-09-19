import type { HTMLAttributes, ReactNode } from 'react';
import { SquareIcon } from '../BottomSheet/icons';
import './Chips.css';

/**
 * chips
 *
 * Built from the Figma component set "chips" (node 9003:8679). The three
 * variant axes below carry the same names and the same options as Figma.
 *
 * From the component's Figma description:
 *
 *   Pill-shaped label with optional leading and trailing icons. 4 sizes,
 *   Primary and Pro color variants, active/inactive states. The Pro variant
 *   doubles as the PRO badge.
 *
 *   USE: Category tags, filter toggles, mode labels, and PRO badges.
 *
 *   DON'T: Use as a CTA. No loading or disabled state — use button for actions.
 */

export type ChipSize = 'XXS' | 'XS' | 'S' | 'M';
export type ChipColor = 'Primary' | 'pro';
export type ChipActive = 'False' | 'True';

export interface ChipsProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Figma variant axis. */
  size?: ChipSize;
  /** Figma variant axis. Only tells the two apart while active is True. */
  color?: ChipColor;
  /** Figma variant axis. Kept as the Figma strings rather than a boolean. */
  active?: ChipActive;
  /** Figma boolean property: show the leading icon slot. */
  showLeftIcon?: boolean;
  /** Figma boolean property: show the trailing icon slot. */
  showRightIcon?: boolean;
  /** Figma text property: the label. Expects 1-2 words. */
  Text?: string;
  /** Contents of the leading icon slot. Sized by the chip. */
  leftIcon?: ReactNode;
  /** Contents of the trailing icon slot. Sized by the chip. */
  rightIcon?: ReactNode;
  /**
   * Makes the chip a button. Chips are labels and toggles, never CTAs — the
   * Figma description says to use button for actions.
   */
  onPress?: () => void;
  /**
   * Makes the TRAILING icon its own control, inside the chip — a remove or
   * dismiss affordance, as Figma's `EolChip` draws it (mic · label · ✕ in one
   * pill).
   *
   * Separate from `onPress` on purpose. A pressable chip is a toggle and
   * reports `aria-pressed`; removing something is not a toggle, so putting the
   * remove action on the chip itself would announce "toggle button, not
   * pressed" for a control that deletes. This gives the ✕ a real button with
   * its own label while the chip stays a label.
   */
  onRightIconPress?: () => void;
  /** Accessible name for the trailing control. Required when it is pressable. */
  rightIconLabel?: string;
  /**
   * Whether this chip is a toggle, and therefore reports `aria-pressed`.
   *
   * IT IS NOT THE SAME QUESTION AS `onPress`. Every pressable chip used to
   * report `aria-pressed` on the reasoning that "a pressable chip is a
   * toggle" — but Home's "Explain out loud" chip presses to *leave the
   * screen*, and a screen reader announced it as "toggle button, not pressed"
   * for a control that navigates. That tells a student the tap will switch
   * something on and leave them where they are, which is the opposite of what
   * it does.
   *
   * So the two are separated: `onPress` makes the chip a button, `toggle`
   * makes that button a toggle. A filter chip sets it; a chip that navigates
   * does not, and announces as a plain button.
   */
  toggle?: boolean;
}

export function Chips({
  size = 'XXS',
  color = 'Primary',
  active = 'False',
  showLeftIcon = true,
  showRightIcon = true,
  Text = '1/2 words',
  leftIcon,
  rightIcon,
  onPress,
  onRightIconPress,
  rightIconLabel,
  toggle = false,
  ...rest
}: ChipsProps) {
  const className = [
    'knw-chip',
    `knw-chip--${size}`,
    `knw-chip--${color}`,
    onPress ? 'knw-chip--pressable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {showLeftIcon ? (
        <span className="knw-chip__icon" aria-hidden="true">
          {leftIcon ?? <SquareIcon />}
        </span>
      ) : null}
      <span className="knw-chip__label">{Text}</span>
      {showRightIcon ? (
        onRightIconPress ? (
          <button
            type="button"
            className="knw-chip__icon knw-chip__icon--pressable"
            aria-label={rightIconLabel}
            onClick={onRightIconPress}
          >
            {rightIcon ?? <SquareIcon />}
          </button>
        ) : (
          <span className="knw-chip__icon" aria-hidden="true">
            {rightIcon ?? <SquareIcon />}
          </span>
        )
      ) : null}
    </>
  );

  /* `aria-pressed` only when the chip actually toggles — see `toggle`. A
     navigational chip is a plain button, and announces as one. */
  if (onPress) {
    return (
      <button
        type="button"
        className={className}
        data-active={active === 'True'}
        aria-pressed={toggle ? active === 'True' : undefined}
        onClick={onPress}
        {...rest}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={className} data-active={active === 'True'} {...rest}>
      {content}
    </span>
  );
}
