import type { HTMLAttributes, ReactNode } from 'react';
import { CheckMarkIcon } from './icons';
import './ListItem.css';

/**
 * listItem
 *
 * Built from the Row inside the Figma components "strongCard" (15676:16060)
 * and "reviewTopicCard" (15676:16081).
 *
 * Those two are described in design-system.md as:
 *
 *   strongCard — List of topics the student recalled well. Shown on the summary
 *   screen after a session.
 *
 *   reviewTopicCard — List of topics the student needs to revisit.
 *
 *   DON'T: Do not add more than three rows — the component has no scroll or
 *   overflow behaviour.
 *
 * The row is a layer inside those cards, not a component of its own, so Figma
 * has no variants for it. `variant` is derived from the only thing that differs
 * between the two cards: which `Checkbox` state the marker takes.
 *
 * THE MARKER IS A CHECKBOX, AND BOTH VARIANTS CHECK. Both cards instance
 * `Checkbox Selection=Selected`; only `State` differs — `Default` draws a solid
 * `highlight/indicator` disc with a `text/primary` tick, `Error` draws a dark
 * error fill ringed in `feedback/error` with the same tick in that red. So the
 * review row is a *checked* item marked wrong, not a cross, and design-system.md
 * is now out of date where it says "a red X icon instead of a green checkmark":
 * neither the X nor the green exists in the file any more. The tick is the same
 * glyph in both, which is why `CrossMarkIcon` is gone.
 *
 * THE ROW HAS NO BLOCK PADDING. Its 48px height comes from the checkbox's own
 * 48×48 tap box, which is what Figma draws and also what WCAG 2.5.8 wants — a
 * padded row with a 24px marker would have met the height and missed the
 * target.
 *
 * AND IT DOES NOT IMPORT `Checkbox`, deliberately — do not "fix" that. The real
 * component is a `<button role="checkbox">` with `aria-checked` and an
 * `onToggle`. Nothing on the summary toggles: the rows report what happened in
 * a session that is over. Instancing it would put six operable checkboxes on a
 * results screen, every one of them inert, which is exactly the class of dead
 * control this project already went through every route to remove — and a
 * screen reader would announce six checkboxes where there are none. Figma
 * instances `Checkbox` because a picture of a checked box is the fastest way to
 * draw one; in code the picture is the marker below, and `Checkbox.css` and
 * this file draw the disc from the same tokens so the two cannot drift.
 */

export type ListItemVariant = 'Strong' | 'Review';

export interface ListItemProps extends HTMLAttributes<HTMLLIElement> {
  /** Derived from the two cards, not a Figma variant axis. */
  variant?: ListItemVariant;
  /** The topic. */
  label?: string;
  /** Figma draws a top stroke on every row after the first. */
  showDivider?: boolean;
}

export function ListItem({
  variant = 'Strong',
  label = 'Causes of the Civil Rights Movement',
  showDivider = false,
  ...rest
}: ListItemProps) {
  return (
    <li
      className={`knw-listitem knw-listitem--${variant}${showDivider ? ' knw-listitem--divided' : ''}`}
      {...rest}
    >
      {/* Figma's `Checkbox` instance: a 48×48 box holding a 24px disc. The box
          carries no fill of its own — it is the tap target the disc sits in. */}
      <span className="knw-listitem__marker">
        <span className="knw-listitem__box">
          <span className="knw-listitem__icon">
            <CheckMarkIcon />
          </span>
        </span>
      </span>
      <p className="knw-listitem__label">{label}</p>
    </li>
  );
}

export interface ListItemGroupProps extends HTMLAttributes<HTMLUListElement> {
  /** The rows. design-system.md says no more than three. */
  children?: ReactNode;
  /** What the list covers, so it is not announced as an unnamed list. */
  label?: string;
}

/**
 * The card the rows sit in — strongCard and reviewTopicCard are the same card
 * with different rows inside.
 */
export function ListItemGroup({ children, label, ...rest }: ListItemGroupProps) {
  return (
    <ul className="knw-listitem-group" aria-label={label} {...rest}>
      {children}
    </ul>
  );
}
