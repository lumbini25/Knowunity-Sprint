import type { ButtonHTMLAttributes } from 'react';
import './Switch.css';

/**
 * switch
 *
 * Built from the Figma component set "switch" (node 4154:16180).
 *
 * The set carries no description in Figma — not on the set and not on any of
 * its four variants — so there is no "what it's for" or "don't do this" to
 * quote. The behaviour below is read off the layers.
 *
 * Anatomy, from Figma:
 *
 *   switch            52×32, Radius/Full
 *     Knob            24×24, Radius/Full, inset Space/100 on all sides,
 *                     left at isActive=False, right at isActive=True
 *
 *   state=Default,  isActive=False  track background/elevated,
 *                                   knob  interactive/label/secondary
 *   state=Default,  isActive=True   track interactive/primary,
 *                                   knob  interactive/label/primary
 *   state=Disabled, isActive=False  track background/elevated,
 *                                   knob  interactive/disabled
 *   state=Disabled, isActive=True   track interactive/disabled,
 *                                   knob  interactive/disabled
 */

export type SwitchState = 'Default' | 'Disabled';
export type SwitchActive = 'True' | 'False';

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onToggle'> {
  /** Figma variant axis. */
  state?: SwitchState;
  /** Figma variant axis. */
  isActive?: SwitchActive;
  /** What the switch controls, so it is not announced as an unnamed button. */
  label?: string;
  /** Called with the value the switch would move to. */
  onToggle?: (next: SwitchActive) => void;
}

export function Switch({
  state = 'Default',
  isActive = 'False',
  label = 'Toggle',
  onToggle,
  onClick,
  ...rest
}: SwitchProps) {
  const disabled = state === 'Disabled';
  const on = isActive === 'True';

  return (
    <button
      type="button"
      role="switch"
      className={`knw-switch knw-switch--${state} knw-switch--${isActive}`}
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (!disabled) onToggle?.(on ? 'False' : 'True');
      }}
      {...rest}
    >
      <span className="knw-switch__knob" />
    </button>
  );
}
