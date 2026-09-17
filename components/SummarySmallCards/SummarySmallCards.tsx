import type { HTMLAttributes } from 'react';
import './SummarySmallCards.css';

/**
 * summarySmallCards
 *
 * Built from the Figma component "summarySmallCards" (node 15676:15996).
 *
 * From the component's Figma description:
 *
 *   Paired stat tiles for the session summary screen. Fixed layout: left tile
 *   shows recalled count (green), right tile shows need-review count (red).
 *
 *   TOKEN NOTE
 *     Original tile backgrounds were raw alpha fills (12% green, 20% red) with
 *     no semantic token. Bound to background/surface as the nearest available
 *     token per design decision. Visual difference from original: tiles appear
 *     dark rather than tinted. Request feedback/success/surface/wash and
 *     feedback/error/surface/wash tokens for the intended tinted look.
 *
 *   DONT
 *     Do not separate the two tiles — they are a single component designed as
 *     a pair.
 *     Do not add a third tile — use statTile for additional standalone stats.
 *
 * The first DON'T is why this renders both tiles and exposes no way to render
 * one: they are a pair, not a list.
 */

export interface SummarySmallCardsProps extends HTMLAttributes<HTMLDivElement> {
  /** How many the student recalled. Shown in the left tile. */
  recalledCount?: number | string;
  /** The left tile's caption. */
  recalledLabel?: string;
  /** How many need another look. Shown in the right tile. */
  reviewCount?: number | string;
  /** The right tile's caption. */
  reviewLabel?: string;
}

export function SummarySmallCards({
  recalledCount = 7,
  recalledLabel = 'Recalled',
  reviewCount = 3,
  reviewLabel = 'Need Review',
  ...rest
}: SummarySmallCardsProps) {
  return (
    <div className="knw-summarycards" {...rest}>
      <div className="knw-summarycards__tile knw-summarycards__tile--recalled">
        <p className="knw-summarycards__score">{recalledCount}</p>
        <p className="knw-summarycards__label">{recalledLabel}</p>
      </div>

      <div className="knw-summarycards__tile knw-summarycards__tile--review">
        <p className="knw-summarycards__score">{reviewCount}</p>
        <p className="knw-summarycards__label">{reviewLabel}</p>
      </div>
    </div>
  );
}
