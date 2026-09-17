import type { HTMLAttributes } from 'react';
import './Percentage.css';

/**
 * percentage
 *
 * Built from the Figma component "percentage" (node 15676:15985).
 *
 * Figma has since turned this into a component set (15765:19368) with a
 * `Property 1` axis of Default | Variant2. Those two variants are only preset
 * score/arc pairs — 7/10 at ~80% and 3/10 at ~34% — which `value` and `total`
 * already produce, so no variant prop was added. Every other change in that
 * rebuild is reflected here.
 *
 * From the component's Figma description:
 *
 *   Circular session score display for the summary screen. Shows recalled
 *   fraction ("7/10") and a "Recalled" label inside a rotating donut ring SVG.
 *
 *   TOKEN NOTE: lineHeight for score text is bound to font/lineHeight/md
 *   (24px) — the design value of 32px has no token. Request
 *   font/lineHeight/lg2 (32px) or use the headline M text style once it covers
 *   32px line height.
 *
 *   Single variant. No component properties. Score and label are
 *   text-editable.
 *
 * design-system.md repeats the same note and adds: "Summary screen only."
 *
 * The note's second suggestion is the one taken here. `headline/M` already
 * composes 28/32/bold/tight, which is the 32px design value it asks for, so no
 * `lg2` token is needed — and Figma has since moved the score to 28/32 itself,
 * so the file and the code now agree and the note's gap is closed on both
 * sides.
 */

export interface PercentageProps extends HTMLAttributes<HTMLDivElement> {
  /** How many the student recalled. Drives both the fraction and the arc. */
  value?: number;
  /** How many there were. */
  total?: number;
  /** The caption under the score. Text-editable in Figma. */
  label?: string;
}

export function Percentage({
  value = 7,
  total = 10,
  label = 'Recalled',
  ...rest
}: PercentageProps) {
  const safeTotal = total > 0 ? total : 1;
  const percent = Math.round(Math.min(1, Math.max(0, value / safeTotal)) * 100);

  return (
    <div
      className="knw-percentage"
      role="img"
      aria-label={`${value} of ${total} ${label.toLowerCase()}`}
      {...rest}
    >
      <svg className="knw-percentage__ring" aria-hidden="true" focusable="false">
        {/* pathLength normalises the circumference to 100, so the dash array is
            a percentage and the geometry stays entirely in the stylesheet. */}
        <circle
          className="knw-percentage__arc"
          pathLength={100}
          strokeDasharray={`${percent} 100`}
        />
      </svg>

      <div className="knw-percentage__content">
        <p className="knw-percentage__score">
          {value}/{total}
        </p>
        <p className="knw-percentage__label">{label}</p>
      </div>
    </div>
  );
}
