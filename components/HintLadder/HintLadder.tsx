import type { HTMLAttributes } from 'react';
import type { Rung } from '../../lib/recall/script';
import { RUNGS, RUNG_LABELS, rungIndex } from '../../lib/recall/script';
import './HintLadder.css';

/**
 * hintLadder
 *
 * Built from the Figma component `hints`, node 15831:8194, instanced on all
 * four frames of the `hint ladder` section (15833:9103).
 *
 * A four-step ladder — Hint 1 · Hint 2 · Hint 3 · Reveal — showing how much
 * help the student has taken on the current term. Each step is a 10×10 dot
 * joined by an 18×2 divider; the step in play is drawn taller (62 against 46)
 * and takes the brand fill, the rest sit on `background/surface`.
 *
 * This is Voice_UX principle 1 doing its job on the slowest axis in the loop.
 * The orb says what the app is doing this second; the ladder says where the
 * student is in the term — which is the thing that makes a fourth hint feel
 * like a position rather than a punishment.
 *
 * WHY THE RUNG TYPE IS IMPORTED RATHER THAN RE-DECLARED. The ladder and the
 * session have to agree on what the rungs are, and there is exactly one list:
 * `lib/recall/script.tsx`. A local union here would be a second one, free to
 * drift.
 *
 * `attempt1` is deliberately NOT a step. The ladder counts help taken, and the
 * unaided attempt is the absence of it — Figma draws four steps, not five, and
 * on `attempt1` none of them is active yet.
 */

/** The four steps Figma draws. `attempt1` is the unaided try and has no step. */
const STEPS: Rung[] = RUNGS.filter((r) => r !== 'attempt1');

export interface HintLadderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Where the student is. `attempt1` lights nothing. */
  rung?: Rung;
}

export function HintLadder({ rung = 'attempt1', ...rest }: HintLadderProps) {
  const current = rungIndex(rung);

  return (
    <div
      className="knw-ladder"
      role="img"
      aria-label={
        rung === 'attempt1'
          ? 'No hints used yet'
          : `${RUNG_LABELS[rung]}, step ${STEPS.indexOf(rung) + 1} of ${STEPS.length}`
      }
      {...rest}
    >
      {STEPS.map((step) => {
        const index = rungIndex(step);
        const state = index === current ? 'active' : index < current ? 'done' : 'todo';
        return (
          <div key={step} className="knw-ladder__step" data-state={state}>
            <span className="knw-ladder__rule" aria-hidden="true" />
            <span className="knw-ladder__marker">
              <span className="knw-ladder__dot" aria-hidden="true" />
              <span className="knw-ladder__label">{RUNG_LABELS[step]}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
