import type { ReactNode } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import { CheckIcon } from '../RecallResponseCard/icons';
import { ChevronRightIcon } from '../FolderCard/icons';
import { CircleHalfIcon, EyeIcon, SkipDashIcon } from './icons';
import './TermRow.css';

/**
 * termRow
 *
 * One term's outcome on the session summary. Built from the Figma component
 * "termRow" (16311:14136), instanced on `17 Summary` (16311:14220).
 *
 * From its Figma description:
 *
 *   Four end states, each carrying its own icon and label as well as a colour,
 *   so they read apart in greyscale. The whole row is the tap target and it
 *   opens that term's sheet, so it needs a Pressed state and a 64 minimum
 *   height. Reach for it in the summary list and nowhere else.
 *   Never change a tag's label on an instance to say something the variant
 *   does not: if you need a fifth outcome, that is a new variant and a
 *   decision.
 *
 * The label is decided by `outcome` and is not a prop, which is how that last
 * rule is enforced rather than documented.
 *
 * THE FOURTH STATE IS A GUESS, AND SAYS SO. The frame draws Unaided, Revealed
 * and Hinted; the component set is not published, so its fourth variant could
 * not be read. The session has exactly one more outcome — a skip — so that is
 * the fourth here, drawn neutral with a dash. Open question in design-system.md.
 *
 * NO XP. The frame prints "+15 XP" beside each tag; the design owner dropped
 * per-term XP, so the column is not drawn.
 */

export type TermOutcomeKind = 'Unaided' | 'Hinted' | 'Revealed' | 'Skipped';

const GLYPH: Record<TermOutcomeKind, ReactNode> = {
  Unaided: <CheckIcon />,
  Hinted: <CircleHalfIcon />,
  Revealed: <EyeIcon />,
  Skipped: <SkipDashIcon />,
};

export interface TermRowProps {
  /** The term's name. */
  title?: string;
  /** Which end state. Picks the badge, its glyph, the tag and its label. */
  outcome?: TermOutcomeKind;
  /**
   * Open this term's detail. Without it the row is plain content — no
   * chevron, no button — because a row that looks tappable and does nothing
   * is the failure CLAUDE.md names first.
   */
  onOpen?: () => void;
}

export function TermRow({ title = 'Turning points', outcome = 'Unaided', onOpen }: TermRowProps) {
  const content = (
    <>
      <span className="knw-termrow__badge" aria-hidden="true">
        <IconSlot size="250">{GLYPH[outcome]}</IconSlot>
      </span>
      <span className="knw-termrow__title">{title}</span>
      <span className="knw-termrow__tag">{outcome}</span>
      {onOpen ? (
        <span className="knw-termrow__chevron" aria-hidden="true">
          <IconSlot size="250">
            <ChevronRightIcon />
          </IconSlot>
        </span>
      ) : null}
    </>
  );

  return (
    <li className="knw-termrow" data-outcome={outcome}>
      {onOpen ? (
        <button type="button" className="knw-termrow__row" onClick={onOpen}>
          {content}
        </button>
      ) : (
        <span className="knw-termrow__row">{content}</span>
      )}
    </li>
  );
}
