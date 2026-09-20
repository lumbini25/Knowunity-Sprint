import type { ButtonHTMLAttributes } from 'react';
import { CheckIcon } from './icons';
import './Checkbox.css';

/**
 * Checkbox
 *
 * Built from the Figma component set "Checkbox" (node 4139:312). Both variant
 * axes carry the same names and the same options as Figma.
 *
 * From the component's Figma description:
 *
 *   Selection control. Check/uncheck for lists, onboarding checklists,
 *   multi-select, T&C acceptance.
 *
 * Rendered as a button with role="checkbox" rather than a native input, because
 * the box is drawn from tokens; the role and aria-checked keep it announced and
 * operated as a checkbox.
 *
 * SINGLE-SELECT MODE. `role="radio"` switches what this is announced as
 * without changing a pixel of it, which is the resolution design-system.md's
 * Gaps list asks for by name: "Request radio / radioGroup, **or a documented
 * single-select mode on Checkbox**". The session rating screen draws three of
 * these for one mutually-exclusive question — Figma's own frame shows exactly
 * one filled — and enforcing that only in the click handler left a screen
 * reader announcing three independent toggles, so a student using one was told
 * they could pick all three. `aria-checked` carries both roles unchanged; the
 * caller supplies the surrounding `role="radiogroup"` and the arrow-key
 * navigation that a radio group owes its user.
 */

export type CheckboxSelection = 'Unselected' | 'Selected';
export type CheckboxState = 'Default' | 'Error' | 'Disabled';
export type CheckboxRole = 'checkbox' | 'radio';

export interface CheckboxProps
  // onToggle is omitted as well: React declares its own toggle handler on
  // button attributes, and this one carries the requested selection instead.
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onChange' | 'onToggle' | 'disabled' | 'type'
  > {
  /** Figma variant axis. */
  Selection?: CheckboxSelection;
  /** Figma variant axis. Disabled blocks interaction; Error marks it invalid. */
  State?: CheckboxState;
  /** What the checkbox is for. Required so it is never announced unlabelled. */
  label: string;
  /**
   * What this is announced as. `radio` for one choice out of several — see
   * the note above. Visual treatment is identical either way; only the
   * accessibility tree changes.
   */
  role?: CheckboxRole;
  /** Called with the selection the student is asking for. */
  onToggle?: (next: CheckboxSelection) => void;
}

export function Checkbox({
  Selection = 'Unselected',
  State = 'Default',
  label,
  role = 'checkbox',
  onToggle,
  ...rest
}: CheckboxProps) {
  const isSelected = Selection === 'Selected';
  const isDisabled = State === 'Disabled';

  return (
    <button
      type="button"
      role={role}
      aria-checked={isSelected}
      aria-label={label}
      aria-invalid={State === 'Error' || undefined}
      disabled={isDisabled}
      className={`knw-checkbox knw-checkbox--${Selection} knw-checkbox--${State}`}
      onClick={() => onToggle?.(isSelected ? 'Unselected' : 'Selected')}
      {...rest}
    >
      <span className="knw-checkbox__box">
        {isSelected ? (
          <span className="knw-checkbox__mark">
            <CheckIcon />
          </span>
        ) : null}
      </span>
    </button>
  );
}
