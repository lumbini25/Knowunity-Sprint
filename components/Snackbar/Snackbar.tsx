import type { HTMLAttributes, ReactNode } from 'react';
import { AlertCircleIcon, CheckCircleIcon, InfoCircleIcon } from './icons';
import './Snackbar.css';

/**
 * snackbar
 *
 * Built from the Figma component set "snackbar" (node 9003:8995).
 *
 * From the component's Figma description:
 *
 *   Transient notification bar. Icon, up to 2 lines of text, and a chips
 *   action. 3 variants: Default, Success, Error.
 *
 *   USE: Brief system feedback that needs no decision — "Saved," "Something
 *   went wrong." Success and Error map to feedback/success and feedback/error
 *   tokens.
 *
 *   DON'T: Use when the user must read and respond before continuing. Use a
 *   modal or bottom sheet instead.
 */

export type SnackbarVariant = 'Default' | 'Success' | 'Error';

export interface SnackbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma variant axis. Drives the icon and the action colour. */
  variant?: SnackbarVariant;
  /** Figma text property. Two lines maximum, per design-system.md. */
  Text?: string;
  /** Label on the action. Omit it and the snackbar carries no action. */
  actionLabel?: string;
  /** Called when the action is pressed. */
  onAction?: () => void;
}

const ICON: Record<SnackbarVariant, ReactNode> = {
  Default: <InfoCircleIcon />,
  Success: <CheckCircleIcon />,
  Error: <AlertCircleIcon />,
};

export function Snackbar({
  variant = 'Default',
  Text = 'Up to 2 lines of text. Keep it as short as possible.',
  actionLabel,
  onAction,
  ...rest
}: SnackbarProps) {
  return (
    <div className={`knw-snackbar knw-snackbar--${variant}`} {...rest}>
      {/* Transient feedback that needs no decision: announced politely so it
          never interrupts what the student is doing. */}
      <div className="knw-snackbar__bar" role="status" aria-live="polite">
        <span className="knw-snackbar__icon" aria-hidden="true">
          {ICON[variant]}
        </span>

        <div className="knw-snackbar__text">
          <p className="knw-snackbar__label">{Text}</p>
        </div>

        {actionLabel ? (
          <button type="button" className="knw-snackbar__action" onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
