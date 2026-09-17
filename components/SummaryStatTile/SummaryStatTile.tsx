import type { HTMLAttributes } from 'react';
import './SummaryStatTile.css';

/**
 * summaryStatTile
 *
 * Built from the Figma component "Summary Stat tile" (node 15857:10047).
 *
 * From the component's Figma description:
 *
 *   "This 3 tile system should be. shown on summary screen."
 *
 * NOT A VARIANT SET. Its parent in the file is a section, not a component set,
 * so there are no variants to map onto props — the three tiles are fixed, and
 * what changes is the numbers in them. That is also why this is one component
 * rather than three: the row only means something whole. Hinted, Perfect and
 * Missed divide one session between them, and a tile on its own would invite
 * being used as a general-purpose stat, which is what `statTile` already is.
 *
 * DO NOT use this for the recalled / need-review pair — that is
 * `summarySmallCards`, which is a two-tile component for exactly that split.
 * DO NOT use it outside the summary; the description is explicit.
 *
 * TOKEN NOTE: Figma sets the figure at 24/20 Heavy. Neither half exists in the
 * scale — 24 sits between 21 and 28, and the only semantic step carrying Heavy
 * is `display/L` at 76, so 24/Heavy has no step at all. `headline/S` (21, Bold)
 * is the nearest bound step and is what this takes. Logged in design-system.md.
 */

export interface SummaryStatTileProps extends Omit<HTMLAttributes<HTMLDListElement>, 'children'> {
  /** Terms passed after taking a hint. Figma's default: 3. */
  hinted?: number | string;
  /** Terms explained unaided. Figma's default: 6/10. */
  perfect?: number | string;
  /** Terms the ladder ran out on. Figma's default: 1. */
  missed?: number | string;
  hintedLabel?: string;
  perfectLabel?: string;
  missedLabel?: string;
}

export function SummaryStatTile({
  hinted = 3,
  perfect = '6/10',
  missed = 1,
  hintedLabel = 'Hinted',
  perfectLabel = 'Perfect',
  missedLabel = 'Missed',
  ...rest
}: SummaryStatTileProps) {
  /* Figma's order, which is also the order the session reads in: how much help
     was taken, then what needed none, then what got away. */
  const tiles: Array<{ tone: 'hinted' | 'perfect' | 'missed'; label: string; value: number | string }> = [
    { tone: 'hinted', label: hintedLabel, value: hinted },
    { tone: 'perfect', label: perfectLabel, value: perfect },
    { tone: 'missed', label: missedLabel, value: missed },
  ];

  return (
    /* A <dl>: three label/value pairs is exactly what one is, and it pairs them
       for a screen reader rather than leaving six loose strings in a row. */
    <dl className="knw-statrow" {...rest}>
      {tiles.map(({ tone, label, value }) => (
        <div key={tone} className="knw-statrow__tile" data-tone={tone}>
          <dt className="knw-statrow__label">{label}</dt>
          <dd className="knw-statrow__value">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
