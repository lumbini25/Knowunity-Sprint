import type { HTMLAttributes } from 'react';
import { ChevronRightIcon, ConceptGridIcon } from './icons';
import './FolderCard.css';

/**
 * folderCard
 *
 * Built from the Figma component set "folderCard" (node 15700:17819).
 *
 * From the component's Figma description:
 *
 *   Study folder entry card. Colour-band header above a metadata row with
 *   title, description, chevron, and a concept count badge.
 *
 *   DON'T: Do not use accent=Gold for standard study folders — Gold signals
 *   PRO content.
 *
 * THE THIRD ACCENT IS GREEN, AND WAS ONLY EVER NAMED GOLD. The set's variant
 * read `accent=Gold` while its band was bound to the green variable — 0,195,134,
 * which is `accent/green/bold` — so the code took the name and bound
 * `pro/bold` (#f5b53d) to a card the file paints #00c386. That is how a folder
 * ended up wearing PRO's gold: not a wrong choice, a wrong reading of a stale
 * label. The variant is now `accent=Green` in Figma and here, and the DON'T
 * above keeps its force — gold is not a folder accent at all, so there is no
 * longer a variant to reach for by mistake.
 */

export type FolderCardAccent = 'Blue' | 'Magenta' | 'Green';

export interface FolderCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Figma variant axis. Gold is not among them: it signals PRO, never a folder. */
  accent?: FolderCardAccent;
  /** Folder name. */
  title?: string;
  /** What the folder covers. */
  description?: string;
  /** The period the folder spans, shown over the colour band. */
  dateLabel?: string;
  /** How many concepts the folder holds. */
  conceptCount?: string;
  /** Called when the card is opened. */
  onOpen?: () => void;
}

export function FolderCard({
  accent = 'Blue',
  title = 'World War II',
  description = 'Causes, key battles, the Holocaust, and the post-war order.',
  dateLabel = '1939 – 1945',
  conceptCount = '18 concepts',
  onOpen,
  ...rest
}: FolderCardProps) {
  return (
    <article className={`knw-folder knw-folder--${accent}`} {...rest}>
      <div className="knw-folder__card">
        <div className="knw-folder__band" />

        <div className="knw-folder__meta">
          <div className="knw-folder__text">
            <h3 className="knw-folder__title">{title}</h3>
            <p className="knw-folder__description">{description}</p>
          </div>

          {/* DECORATIVE NOW. The chevron was the only way into a folder — a 32px
              circle in the corner of a 358×282 card that reads, correctly, as
              one big tappable thing. The glyph still says "this opens"; it is
              no longer the only place that is true. `aria-hidden` because the
              control below already carries the name. */}
          <span className="knw-folder__chevron" aria-hidden="true">
            <span className="knw-folder__chevron-icon">
              <ChevronRightIcon />
            </span>
          </span>
        </div>

        <div className="knw-folder__strip" />

        <p className="knw-folder__date">{dateLabel}</p>

        {/* THE CONTROL IS THE CARD. Laid over the whole surface rather than
            wrapping it, which is what keeps the accessible name short: a
            <button> around this content would be announced as its every word —
            title, description, date and count in one breath — where "Open
            World War II" is what the student actually needs.

            Last in the card, so it paints above the band, the strip and the
            absolutely-positioned date. Without that, the top two thirds of the
            card would still be dead.

            Drawn only when something is wired to it, the rule this build keeps
            everywhere: a control that does nothing when tapped is worse than
            one that is not there. */}
        {onOpen ? (
          <button
            type="button"
            className="knw-folder__open"
            aria-label={`Open ${title}`}
            onClick={onOpen}
          />
        ) : null}
      </div>

      {/* Decorative: the tab is the folder metaphor, it carries no meaning. */}
      <div className="knw-folder__tab" aria-hidden="true" />

      <div className="knw-folder__badge">
        <span className="knw-folder__badge-icon" aria-hidden="true">
          <ConceptGridIcon />
        </span>
        <span className="knw-folder__badge-label">{conceptCount}</span>
      </div>
    </article>
  );
}
