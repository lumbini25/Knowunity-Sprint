import type { CSSProperties, HTMLAttributes } from 'react';
import './ProgressIndicator.css';

/**
 * progressIndicator
 *
 * Built from the Figma component set "progressIndicator" (node 9003:8923).
 *
 * From the component's Figma description:
 *
 *   Horizontal completion bar. 2 color variants (Primary, Coral), 2
 *   thicknesses (16, 24), 5 preset progress steps. Optional numeric label
 *   controlled by a boolean.
 *
 *   USE: Exam plan progress, session bars, quiz position indicators (e.g.
 *   1/3). Show the numeric label when the percentage adds useful context.
 *
 *   DON'T: Treat the preset steps as live data — in production, bar width is
 *   driven by real data.
 *
 * design-system.md says the same: "The preset progress steps (0, 25, 50, 75,
 * 100) are design-time representations. In production the bar width is driven
 * by real data."
 *
 * That DON'T is why `progress` accepts any number from 0 to 100 rather than
 * only the five Figma steps. The five are exposed as `ProgressStep` so a story
 * can name them the way the file does, but production passes real data.
 */

export type ProgressIndicatorVariant = 'Primary' | 'Coral';
export type ProgressIndicatorThickness = '24' | '16';

/** The five design-time steps Figma draws. Not a constraint on `progress`. */
export type ProgressStep = 0 | 25 | 50 | 75 | 100;

export interface ProgressIndicatorProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Figma variant axis. */
  variant?: ProgressIndicatorVariant;
  /** Figma variant axis. The bar's height in pixels, as the file names it. */
  thickness?: ProgressIndicatorThickness;
  /**
   * Figma variant axis, widened to any percentage from 0 to 100 because the
   * component's own description says the five steps are not live data.
   */
  progress?: number;
  /** Figma: showText. Has no effect at thickness=16 — see the story docs. */
  showText?: boolean;
  /** What the numeric label reads. Figma's examples are "0/12" … "12/12". */
  text?: string;
  /** What the bar is measuring, for screen readers. */
  label?: string;
}

export function ProgressIndicator({
  variant = 'Primary',
  thickness = '24',
  progress = 0,
  showText = false,
  text,
  label = 'Progress',
  style,
  ...rest
}: ProgressIndicatorProps) {
  const clamped = Math.min(100, Math.max(0, progress));

  // Figma only draws the label on the thickness=24 variants; the 16 ones have
  // no text node for showText to reveal.
  const hasLabel = showText && thickness === '24';
  const labelText = text ?? `${Math.round(clamped)}%`;

  return (
    <div
      className={`knw-progress knw-progress--${variant} knw-progress--${thickness}`}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      aria-valuetext={hasLabel ? labelText : undefined}
      style={{ '--knw-progress-fill': `${clamped}%`, ...style } as CSSProperties}
      {...rest}
    >
      <div className="knw-progress__track">
        <div className="knw-progress__fill" />
      </div>

      {hasLabel && <p className="knw-progress__label">{labelText}</p>}
    </div>
  );
}
