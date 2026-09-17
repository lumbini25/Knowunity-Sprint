import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

/**
 * button
 *
 * Built from the Figma component set "button" (node 9003:6667). The three
 * variant axes below carry the same names and the same options as Figma.
 *
 * From the component's Figma description:
 *
 *   Labelled button with optional left and right icons. 3 variants (Primary,
 *   Secondary, Tertiary), 3 sizes, 4 states. Expects 1-2 word labels.
 *
 *   USE: Primary for the main CTA, Secondary for supporting actions (Skip,
 *   Cancel), Tertiary for lowest emphasis.
 *
 *   DON'T: Use two Primary buttons on the same screen.
 */

export type ButtonVariant = 'Primary' | 'Secondary' | 'Tertiary';
export type ButtonSize = 'S' | 'M' | 'L';
export type ButtonState = 'Default' | 'Pressed' | 'Disabled' | 'Loading';

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> {
  /** Figma variant axis. Primary is the single main CTA on a screen. */
  variant?: ButtonVariant;
  /** Figma size axis. */
  size?: ButtonSize;
  /**
   * Figma state axis. Pressed is also applied on real press, so the component
   * behaves as well as poses. Disabled sets the disabled attribute; Loading
   * sets aria-busy and swaps the label for a centre icon.
   */
  state?: ButtonState;
  /** Figma boolean property: show the left icon slot. */
  showLeftIcon?: boolean;
  /** Figma boolean property: show the right icon slot. */
  showRightIcon?: boolean;
  /** Figma text property: the label. Expects 1-2 words. */
  CTA?: string;
  /** Contents of the left icon slot. The slot is sized by the parent. */
  leftIcon?: ReactNode;
  /** Contents of the right icon slot. The slot is sized by the parent. */
  rightIcon?: ReactNode;
  /** Contents of the centre slot shown while Loading. */
  loadingIcon?: ReactNode;
}

export function Button({
  variant = 'Primary',
  size = 'S',
  state = 'Default',
  showLeftIcon = false,
  showRightIcon = false,
  CTA = '1/2 words',
  leftIcon,
  rightIcon,
  loadingIcon,
  ...rest
}: ButtonProps) {
  const isDisabled = state === 'Disabled';
  const isLoading = state === 'Loading';

  return (
    <button
      type="button"
      className={`knw-button knw-button--${variant} knw-button--${size}`}
      data-state={state}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      // The label is hidden while loading, so name the button explicitly.
      aria-label={isLoading ? CTA : undefined}
      {...rest}
    >
      <span className="knw-button__surface">
        <span className="knw-button__content">
          {showLeftIcon && !isLoading ? (
            <span className="knw-button__icon" aria-hidden="true">
              {leftIcon}
            </span>
          ) : null}

          <span className="knw-button__label">{CTA}</span>

          {isLoading ? (
            <span className="knw-button__icon" aria-hidden="true">
              {loadingIcon}
            </span>
          ) : null}

          {showRightIcon && !isLoading ? (
            <span className="knw-button__icon" aria-hidden="true">
              {rightIcon}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
