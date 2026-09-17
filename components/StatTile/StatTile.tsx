import type { HTMLAttributes } from 'react';
import './StatTile.css';

/**
 * statTile
 *
 * Built from the Figma component "statTile" (node 15676:16170).
 *
 * From the component's Figma description:
 *
 *   A single stat tile: large number above a subdued label. Used on the summary
 *   screen for aggregate session stats (e.g. "24 Concepts").
 *
 *   USE: Sit in a horizontal row alongside other statTile instances or
 *   alongside summarySmallCards. Single variant, no component properties.
 *   Number and label are text-editable.
 *
 *   DONT: Do not use statTile for the recalled/need-review pair — use
 *   summarySmallCards for those.
 *
 * Checked against summarySmallCards before writing: that component's tiles are
 * a fixed pair with their own feedback colours and a different type scale, so
 * there was nothing to extract.
 */

export interface StatTileProps extends HTMLAttributes<HTMLDivElement> {
  /** The figure. */
  value?: number | string;
  /** What the figure counts. */
  label?: string;
}

export function StatTile({ value = 24, label = 'Concepts', ...rest }: StatTileProps) {
  return (
    <div className="knw-stattile" {...rest}>
      <p className="knw-stattile__number">{value}</p>
      <p className="knw-stattile__label">{label}</p>
    </div>
  );
}
