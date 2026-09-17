import type { ButtonHTMLAttributes } from 'react';
import './FeedbackButton.css';

/**
 * feedback Button
 *
 * Built from the Figma component set "feedback Button" (node 15700:17854).
 * design-system.md still calls it `errorButton`; the file has been renamed.
 *
 * From the component's Figma description:
 *
 *   Two-option action row inside recallResponseCard. Allows the student to
 *   flag a transcription error or confirm their answer was heard correctly.
 *
 *   VARIANT AXIS
 *     verdict — one of: Misheard | Confirmed
 *
 *   TOKEN BINDING
 *     Misheard   fill: feedback/error/subtle  stroke: feedback/error/bold
 *                label: feedback/error/bold
 *     Confirmed  fill: background/surface  stroke: border/default
 *                label: text/secondary
 *
 *   USE: Only inside recallResponseCard Action Buttons row. Equal FILL width
 *   halves of the card interior.
 *
 *   DONT
 *     Do not place freestanding on a screen — it has no standalone meaning
 *     outside the result card.
 *
 * Per-variant descriptions add the behaviour:
 *
 *   Misheard  — "App misheard me". Triggers a re-attempt without counting
 *               against the hint ladder.
 *   Confirmed — "That's what I said". Confirms the transcript was correct;
 *               answer is evaluated as-is.
 */

export type FeedbackButtonVerdict = 'Misheard' | 'Confirmed';

/** Figma hard-codes a label per variant; there is no text property on the set. */
const DEFAULT_LABEL: Record<FeedbackButtonVerdict, string> = {
  Misheard: 'App misheard me',
  Confirmed: 'That’s what I said',
};

export interface FeedbackButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma variant axis. */
  verdict?: FeedbackButtonVerdict;
  /**
   * The label. Not a Figma property — each variant hard-codes its own string,
   * so this exists for localisation and defaults to the file's wording.
   */
  label?: string;
}

export function FeedbackButton({
  verdict = 'Misheard',
  label,
  ...rest
}: FeedbackButtonProps) {
  return (
    <button type="button" className={`knw-fbtn knw-fbtn--${verdict}`} {...rest}>
      {label ?? DEFAULT_LABEL[verdict]}
    </button>
  );
}
