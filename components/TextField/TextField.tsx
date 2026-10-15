import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { SearchIcon } from './icons';
import './TextField.css';

/**
 * Text Field
 *
 * Built from the Figma component set "Text Field" (node 4517:2132).
 *
 * The set carries no description in Figma — not on the set and not on any of
 * its three variants — so the behaviour below is read off the layers rather
 * than quoted. The story docs say the same thing where anyone opening
 * Storybook will see it.
 *
 * Anatomy, from Figma:
 *
 *   Text Field                vertical, gap Space/150
 *     Title                   "E.g., Name", behind showTitle
 *     Frame                   vertical, gap Space/050
 *       Field                 horizontal, gap Space/150, padding Space/300,
 *                             Radius/400, fill background/input,
 *                             stroke border/default (feedback/error on Error)
 *         Icon Slot           24px, behind showLeadingIcon, search-lg
 *         Input               body text
 *         Button icon         32px, behind showTrailingIcon, empty slot
 *       Caption               behind showCaption; on Error, always drawn in
 *                             feedback/error
 */

export type TextFieldVariant = 'Default' | 'Error' | 'Placeholder';

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'placeholder'> {
  /** Figma variant axis, named `Variant` there. */
  variant?: TextFieldVariant;
  /** Figma: showTitle. */
  showTitle?: boolean;
  /** Figma: Title Text. */
  titleText?: string;
  /** Figma: Placeholder. */
  placeholder?: string;
  /** Figma: showCaption. Ignored on Error, where the caption is always drawn. */
  showCaption?: boolean;
  /** Figma: (Error) caption. Used for the helper line in every variant. */
  errorCaption?: string;
  /** Figma: showLeadingIcon. */
  showLeadingIcon?: boolean;
  /** Replaces the default search-lg glyph. */
  leadingIcon?: ReactNode;
  /** Figma: showTrailingIcon. The slot is empty in the file. */
  showTrailingIcon?: boolean;
  /** Goes in the trailing slot. */
  trailingIcon?: ReactNode;
  /** What the trailing control does. */
  onTrailingClick?: () => void;
  /** Announced name for the trailing control. */
  trailingLabel?: string;
  /**
   * A multi-line field — a <textarea> in the same frame. The text fallback's
   * iteration (`15 Text fallback, empty`, 16311:12322) draws a 160-tall box
   * for an explanation, which one line cannot hold. Not a Figma variant: the
   * set has no multi-line axis, so this is the build's, and it changes only
   * the input element, never the field's chrome.
   */
  multiline?: boolean;
  /** Visible lines when `multiline`. */
  rows?: number;
}

export function TextField({
  variant = 'Default',
  showTitle = true,
  titleText = 'E.g., Name',
  placeholder = 'Tell us more about yourself',
  showCaption = false,
  errorCaption = 'Explanation message',
  showLeadingIcon = true,
  leadingIcon,
  showTrailingIcon = false,
  trailingIcon,
  onTrailingClick,
  trailingLabel = 'Clear',
  multiline = false,
  rows = 6,
  ...rest
}: TextFieldProps) {
  const inputId = useId();
  const captionId = useId();

  // Figma draws the Error caption unconditionally; the other two put it behind
  // showCaption.
  const hasCaption = variant === 'Error' || showCaption;

  return (
    <div className={`knw-textfield knw-textfield--${variant}`}>
      {showTitle && (
        <label className="knw-textfield__title" htmlFor={inputId}>
          {titleText}
        </label>
      )}

      <div className="knw-textfield__block">
        <div className="knw-textfield__field">
          {showLeadingIcon && (
            <span className="knw-textfield__leading" aria-hidden="true">
              {leadingIcon ?? <SearchIcon />}
            </span>
          )}

          <span className="knw-textfield__input-wrap">
            {multiline ? (
              <textarea
                id={inputId}
                className="knw-textfield__input knw-textfield__input--multiline"
                rows={rows}
                placeholder={placeholder}
                aria-invalid={variant === 'Error' || undefined}
                aria-describedby={hasCaption ? captionId : undefined}
                aria-label={showTitle ? undefined : titleText}
                {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
              />
            ) : (
              <input
                id={inputId}
                className="knw-textfield__input"
                type="text"
                placeholder={placeholder}
                aria-invalid={variant === 'Error' || undefined}
                aria-describedby={hasCaption ? captionId : undefined}
                aria-label={showTitle ? undefined : titleText}
                {...rest}
              />
            )}
          </span>

          {showTrailingIcon && (
            <button
              type="button"
              className="knw-textfield__trailing"
              aria-label={trailingLabel}
              onClick={onTrailingClick}
            >
              <span className="knw-textfield__trailing-icon" aria-hidden="true">
                {trailingIcon}
              </span>
            </button>
          )}
        </div>

        {hasCaption && (
          <p className="knw-textfield__caption" id={captionId}>
            {errorCaption}
          </p>
        )}
      </div>
    </div>
  );
}
