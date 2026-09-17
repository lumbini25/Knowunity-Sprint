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
 */

export type FolderCardAccent = 'Blue' | 'Magenta' | 'Gold';

export interface FolderCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Figma variant axis. Gold is reserved for PRO-gated folders. */
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

          <button
            type="button"
            className="knw-folder__chevron"
            aria-label={`Open ${title}`}
            onClick={onOpen}
          >
            <span className="knw-folder__chevron-icon">
              <ChevronRightIcon />
            </span>
          </button>
        </div>

        <div className="knw-folder__strip" />

        <p className="knw-folder__date">{dateLabel}</p>
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
