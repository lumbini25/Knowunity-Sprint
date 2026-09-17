import type { HTMLAttributes, ReactNode } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import { CancelIcon, RewindIcon, CheckIcon } from '../RecallResponseCard/icons';
import './ChipFeedback.css';

/**
 * chipFeedback
 *
 * Built from the Figma component set "chipFeedback" (node 15676:15999).
 *
 * From the component's Figma description:
 *
 *   Inline verdict badge pill for a single recall result. Three variants
 *   covering Correct, Partial, and Wrong results.
 *
 *   VARIANT AXIS
 *     verdict — one of: Correct | Partial | Wrong
 *
 *   TOKEN BINDING
 *     Correct  fill: feedback/success/surface/bold
 *              label: feedback/success/surface/label/bold
 *     Partial  stroke 2px: feedback/partial/surface/bold
 *              label: feedback/partial/surface/bold
 *     Wrong    fill: feedback/error/bold
 *              label: feedback/success/surface/label/bold (dark text on red)
 *
 *   NOTE: superseded by the Badge layer inside recallResponseCard for use
 *   within the recall card. Use chipFeedback for standalone verdict display
 *   outside the card (summary rows, inline in lists).
 *
 *   DONT
 *     Do not use verdict=Partial fill tokens on verdict=Correct and vice versa.
 *     Do not resize the pill — it hugs its label content.
 *
 * The glyphs come from the icon components the card's chipFeedback instances
 * swap in, not from the placeholders the master set still holds — see the
 * story docs.
 */

export type ChipFeedbackVerdict = 'Correct' | 'Partial' | 'Wrong';

/** Figma hard-codes a label and a glyph per variant; neither is a property. */
const VERDICTS: Record<ChipFeedbackVerdict, { label: string; icon: ReactNode }> = {
  Correct: { label: 'Correct', icon: <CheckIcon /> },
  Partial: { label: 'Almost there', icon: <RewindIcon /> },
  Wrong: { label: 'Not quite', icon: <CancelIcon /> },
};

export interface ChipFeedbackProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma variant axis. */
  verdict?: ChipFeedbackVerdict;
  /**
   * The label. Not a Figma property — each variant hard-codes its own string,
   * so this exists for localisation and defaults to the file's wording.
   */
  label?: string;
  /** Replaces the verdict's glyph. Pass null to drop it. */
  icon?: ReactNode;
}

export function ChipFeedback({
  verdict = 'Correct',
  label,
  icon,
  ...rest
}: ChipFeedbackProps) {
  const glyph = icon === undefined ? VERDICTS[verdict].icon : icon;

  return (
    <span className={`knw-chipfb knw-chipfb--${verdict}`} {...rest}>
      {/* Figma wraps every glyph in an iconSlot at Size=200. */}
      {glyph && <IconSlot size="200">{glyph}</IconSlot>}
      <span className="knw-chipfb__label">{label ?? VERDICTS[verdict].label}</span>
    </span>
  );
}
