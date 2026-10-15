import type { LiHTMLAttributes } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import { DocIcon } from './icons';
import './TopicRow.css';

/**
 * topicRow
 *
 * Built from the Figma component set "Topics list view" (Property 1=Default),
 * as instanced four times in the entry screen's `lesson` list (16307:8816):
 *
 *   [ring + doc icon]  Title                        [Event]
 *
 * One row per thing the student covered this week. The whole row is the
 * control — the screen says "Pick one and explain it out loud", so a tap on a
 * row starts recall on that row's term.
 *
 * THE RING IS PROGRESS. Figma draws a track (`border/default`) under an arc
 * (`accent/brand/bold`) around a filled core — every instance at a full 360°,
 * which reads as "covered". `progress` keeps the arc a value rather than a
 * picture; it defaults to Figma's 100.
 *
 * THE TAG IS THE KIND OF THING. "Event" in `accent/blue/label/subtle` (a step
 * lighter than Figma's `accent/blue/bold`, which fails AA on the pill),
 * "Concept" in `text/secondary`, both on a `background/elevated` pill.
 *
 * TOKEN NOTE — Figma's redesign shrank the ring to ~33 around a ~22 core
 * holding a ~14 glyph (it was 48 / 32 / 20). The nearest steps are
 * `control/s` 32, `control/xxs` 20 and `icon/xs` 12, with `stroke/strong` 2
 * for Figma's scaled ~2.8 stroke. design-system.md, Gaps.
 */

export type TopicKind = 'Event' | 'Concept';

export interface TopicRowProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'onSelect'> {
  /** The term's name. */
  title?: string;
  /** The tag on the right. */
  kind?: TopicKind;
  /** How far round the ring is drawn, 0–100. Figma: 100 on every row. */
  progress?: number;
  /**
   * Start on this topic. Required for the row to be a control — without it the
   * row renders as plain text with no button, because a row that looks
   * tappable and does nothing is the failure CLAUDE.md names first.
   */
  onSelect?: () => void;
}

export function TopicRow({
  title = 'Turning points',
  kind = 'Event',
  progress = 100,
  onSelect,
  ...rest
}: TopicRowProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const content = (
    <>
      <span className="knw-topic__step" aria-hidden="true">
        <svg className="knw-topic__ring" viewBox="0 0 32 32">
          <circle className="knw-topic__track" cx="16" cy="16" r="15" />
          <circle
            className="knw-topic__progress"
            cx="16"
            cy="16"
            r="15"
            pathLength={100}
            strokeDasharray={`${clamped} 100`}
          />
        </svg>
        <span className="knw-topic__core">
          <IconSlot size="150">
            <DocIcon />
          </IconSlot>
        </span>
      </span>
      <span className="knw-topic__title">{title}</span>
      <span className="knw-topic__tag" data-kind={kind}>
        {kind}
      </span>
    </>
  );

  return (
    <li className="knw-topic" {...rest}>
      {onSelect ? (
        <button type="button" className="knw-topic__row" onClick={onSelect}>
          {content}
        </button>
      ) : (
        <span className="knw-topic__row">{content}</span>
      )}
    </li>
  );
}
