import type { HTMLAttributes, ReactNode } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import { TranscriptSection } from '../TranscriptSection/TranscriptSection';
import { CancelIcon, RewindIcon, CheckIcon, HintIcon } from './icons';
import './RecallResponseCard.css';

/**
 * recallResponseCard
 *
 * Built from the Figma component set "recallResponseCard" (node 15712:18958)
 * on the Knowunity Components page.
 *
 * From the component's Figma description:
 *
 *   Result surface for one evaluated recall attempt in the Explain Out Loud
 *   loop. Shows the verdict badge, a transcript of what the student said,
 *   Knowie's response, and — on an incorrect result — a structured breakdown
 *   of what was missing.
 *
 *   VARIANT AXIS
 *     State — one of: Wrong | Misheard | Partial | Reveal | Correct
 *     showMissingSection (boolean, Wrong only)
 *
 *   DONT
 *     Do not use during the processing state — this component appears only
 *     once a verdict exists.
 *     Do not set showMissingSection=True on Reveal or Correct.
 *     Do not swap the Left Accent Strip colour — it is a Correct-state
 *     affordance only.
 *     Do not put more than three bullets in Missing List.
 *
 * The last two DON'Ts are enforced here rather than left to the caller:
 * `showMissingSection` is ignored outside Wrong, and the list is capped at
 * three.
 *
 * THE SET WAS REBUILT. It used to be `Default | Reveal | Correct`, where
 * Default carried a boolean that decided incorrect-vs-partial. Those are now
 * three first-class states — `Wrong`, `Partial` and the new `Misheard` — so
 * the verdict is the variant rather than something derived from a flag.
 *
 * TOKEN NOTE: Figma has renamed the whole `feedback/*` family to insert a
 * `surface` segment — `feedback/partial/surface/bold` where this file says
 * `feedback/partial/bold`. The values are identical (violet-400, green-500,
 * green-950), so nothing renders differently, and the rename is not adopted
 * here because Figma's own `error` branch still carries both spellings. Logged
 * in design-system.md.
 */

export type RecallResponseCardState =
  | 'Wrong'
  | 'Misheard'
  | 'Partial'
  | 'Reveal'
  | 'Correct';

/**
 * Figma's per-state defaults for the badge and the next-action link.
 *
 * The verdict glyph is a real icon component in an `iconSlot` at Size=200 —
 * "Cancel icon", "rewind icon", "Check" — so the label carries the words only.
 * The set's prose description still writes the glyph into the string
 * ("✗  Not quite"); the nodes are what the file draws.
 */
const DEFAULTS: Record<
  RecallResponseCardState,
  { badge: string; next: string; icon: ReactNode; primary: string; secondary: string; score: string }
> = {
  /* THE TWO BUTTONS ARE NOT THE SAME PAIR ON EVERY STATE, which this map used
     to assume. The set draws Retry / Continue on Wrong and Partial — another
     attempt, or move on — and App misheard me / That's what I said on Misheard,
     which is a claim about the transcript rather than about the answer. One
     shared default meant Wrong and Partial both offered to appeal a
     transcription that was never in question. */
  Wrong: { badge: 'Not quite', next: 'Next question', icon: <CancelIcon />, primary: 'Retry', secondary: 'Continue', score: '0%' },
  Misheard: { badge: 'Didn’t catch that', next: 'Next question', icon: <CancelIcon />, primary: 'App misheard me', secondary: 'That’s what I said', score: '0%' },
  Partial: { badge: 'Almost there', next: 'Reveal answer', icon: <RewindIcon />, primary: 'Retry', secondary: 'Continue', score: '65%' },
  Reveal: { badge: 'Answer', next: 'Next question', icon: null, primary: 'Retry', secondary: 'Continue', score: '0%' },
  Correct: { badge: 'Correct', next: 'Next question', icon: <CheckIcon />, primary: 'Retry', secondary: 'Continue', score: '100%' },
};

/** The states that carry the transcript plus the two verdict-correction buttons. */
const CONTESTABLE = new Set<RecallResponseCardState>(['Wrong', 'Misheard', 'Partial']);

/** The states that lead with the score ring beside the badge. */
const HAS_SCORE = new Set<RecallResponseCardState>(['Partial', 'Correct']);

export interface RecallResponseCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma variant axis. */
  State?: RecallResponseCardState;
  /**
   * Figma variant axis, Wrong only. Every other state draws no such layers, so
   * it is ignored there.
   */
  showMissingSection?: boolean;
  /** Figma: badgeLabel. Falls back to the per-state default. */
  badgeLabel?: string;
  /** Figma: transcriptText. Default and Correct states. */
  transcriptText?: string;
  /** Figma: nextActionLabel. Falls back to the per-state default. */
  nextActionLabel?: string;
  /** Figma: percentageText. Partial and Correct. Falls back to the per-state
      default — 65 on Partial, 100 on Correct. */
  percentageText?: string;
  /** The concepts the student missed. Figma's DON'T caps this at three. */
  missingItems?: string[];
  /**
   * What the student DID get, on Partial only. `partial` (15620:9496) draws a
   * two-part breakdown under the transcript: what landed, then what is still
   * absent. Nothing draws unless this or `stillMissingItems` is set.
   */
  gotItems?: string[];
  /**
   * The other half of that breakdown. Kept apart from `missingItems` because
   * the two lists are drawn differently and mean different things: Wrong's
   * "WHAT WAS MISSING" is the whole verdict, where Partial's "STILL MISSING"
   * is the remainder after something was credited.
   */
  stillMissingItems?: string[];
  /** The model answer. Reveal only — Correct no longer carries an answer box. */
  answerText?: string;
  /** The helper line under the card. Reveal only. */
  helperLabel?: string;
  /** Labels on the two verdict-correction buttons. Default only. */
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  /**
   * Figma: the `hint1` frame inside Card, a sibling of Response Body — the
   * ladder's rung label, "Hint 1". Nothing draws unless `hint` is set too.
   */
  hintLabel?: string;
  /**
   * The hint itself. A node rather than a string, because hints bold a term in
   * place exactly as questions do.
   *
   * The hint lives INSIDE the card on rungs 1 and 2. On rung 3 the screen
   * promotes it into its own panel below the card instead — see
   * `hint ladder` node 15833:9103, where the layer is named "escalating
   * warmth" — so on that rung the screen passes no hint here.
   */
  hint?: ReactNode;
  /**
   * Makes the next-action a real control.
   *
   * Figma sets the label to "Skip Question" on the hint rungs, where it is the
   * screen's only skip — so it cannot stay the inert `<p>` it was. Left unset
   * it stays a `<p>`, which is what the states that only report a verdict want.
   */
  onNextAction?: () => void;
}

export function RecallResponseCard({
  State = 'Wrong',
  showMissingSection = true,
  badgeLabel,
  transcriptText = '"Primary sources are documents I wrote about the event afterwards."',
  nextActionLabel,
  percentageText,
  gotItems = ['Context and evidence-based thinking', 'Critical source evaluation'],
  stillMissingItems = ['Building a reasoned interpretation from evidence'],
  missingItems = [
    'Firsthand connection to the event',
    'Created at the time',
    'Not filtered through interpretation',
  ],
  answerText = 'Historical thinking is the process of weighing evidence, placing it in context, and judging how reliable it is.',
  helperLabel = 'Try it yourself after reading',
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  hintLabel = 'Hint 1',
  hint,
  onNextAction,
  ...rest
}: RecallResponseCardProps) {
  // The boolean only exists on Wrong; every other state draws no such layers.
  const missing = State === 'Wrong' && showMissingSection;

  /* PARTIAL'S BREAKDOWN, which is a different thing from Wrong's list even
     though both are bulleted absences. Wrong says "none of this landed";
     Partial says "this landed, this did not", and the file draws the second
     one larger and in text/primary because it is the part the student is meant
     to read and act on rather than a footnote to a verdict. */
  const breakdown =
    State === 'Partial' && (gotItems.length > 0 || stillMissingItems.length > 0);
  /* Contestable BY STATE, and only drawn when someone is listening.
     The result screen never shows a contestable verdict — `submit()` routes
     those to the misheard screen before a verdict is ever displayed — so the
     card was rendering two buttons there that did nothing when tapped. Same
     rule as the next-action below: a control arrives with its handler. */
  const contestable = CONTESTABLE.has(State) && Boolean(onPrimaryAction || onSecondaryAction);
  const scored = HAS_SCORE.has(State);

  const badge = badgeLabel ?? DEFAULTS[State].badge;
  const next = nextActionLabel ?? DEFAULTS[State].next;
  const primaryLabel = primaryActionLabel ?? DEFAULTS[State].primary;
  const secondaryLabel = secondaryActionLabel ?? DEFAULTS[State].secondary;
  /* Figma draws 65 on Partial and 100 on Correct. One default for both put a
     Partial card at 100%, which contradicts its own "Almost there". */
  const percentage = percentageText ?? DEFAULTS[State].score;
  const badgeIcon = DEFAULTS[State].icon;

  // Figma wraps every verdict glyph in an iconSlot at Size=200.
  const badgePill = (
    <span className="knw-rrc__badge">
      {badgeIcon && <IconSlot size="200">{badgeIcon}</IconSlot>}
      <span className="knw-rrc__badge-label">{badge}</span>
    </span>
  );

  return (
    <div className={`knw-rrc knw-rrc--${State}`} {...rest}>
      <div className="knw-rrc__wrapper">
        {State === 'Correct' && <span className="knw-rrc__strip" aria-hidden="true" />}

        {/* The modifier, not `:has()`. Figma's Card gap is 8 on the two frames
            that carry a hint and 32 on the two that don't, and 32 is what the
            card ships with — so a hint added as a second child would silently
            space at 32. Stating it as a variant keeps that deterministic. */}
        <div className={`knw-rrc__card${hint ? ' knw-rrc__card--with-hint' : ''}`}>
          <div className="knw-rrc__body">
            {/* Partial and Correct lead with the score ring beside the badge;
                the other three lead with the badge alone. */}
            {scored ? (
              <div className="knw-rrc__header">
                <div className="knw-rrc__score">
                  <span className="knw-rrc__score-ring" aria-hidden="true" />
                  <p className="knw-rrc__score-text">{percentage}</p>
                </div>
                {badgePill}
              </div>
            ) : (
              badgePill
            )}

            {/* The card no longer draws its own transcript box — the rebuilt
                set instances `transcriptSection`, label and all. That settles
                the two-treatments problem: there is one transcript component
                and the card uses it. Reveal has no transcript; it shows the
                model answer instead. */}
            {State === 'Reveal' ? (
              <p className="knw-rrc__model-text">{answerText}</p>
            ) : (
              <TranscriptSection transcript={transcriptText} />
            )}

            {/* Wrong, Misheard and Partial all let the student separate "the
                app misheard me" from "I got it wrong" — Voice_UX principle 4.
                Reveal and Correct have nothing to contest. */}
            {contestable && (
              <div className="knw-rrc__actions">
                <button
                  type="button"
                  className="knw-rrc__action knw-rrc__action--primary"
                  onClick={onPrimaryAction}
                >
                  {primaryLabel}
                </button>
                <button
                  type="button"
                  className="knw-rrc__action knw-rrc__action--secondary"
                  onClick={onSecondaryAction}
                >
                  {secondaryLabel}
                </button>
              </div>
            )}

            {breakdown && (
              /* ITS OWN WRAPPER, not `knw-rrc__missing`. Reusing that class
                 made two different sections answer to one name, and the
                 stories that count `.knw-rrc__missing` to prove Partial draws
                 no Wrong-list started passing for the wrong reason. */
              <div className="knw-rrc__breakdown-block">
                <div className="knw-rrc__divider" />
                <div className="knw-rrc__breakdown">
                  {gotItems.length > 0 && (
                    <div className="knw-rrc__breakdown-group" data-part="got">
                      <p className="knw-rrc__breakdown-label">WHAT YOU GOT</p>
                      <ul className="knw-rrc__breakdown-list">
                        {/* Capped at three like the Wrong list, and for the
                            same reason: the card has no scroll. */}
                        {gotItems.slice(0, 3).map((item) => (
                          <li key={item} className="knw-rrc__breakdown-item">
                            <span className="knw-rrc__breakdown-dot" aria-hidden="true" />
                            <span className="knw-rrc__breakdown-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stillMissingItems.length > 0 && (
                    <div className="knw-rrc__breakdown-group" data-part="missing">
                      <p className="knw-rrc__breakdown-label">STILL MISSING</p>
                      <ul className="knw-rrc__breakdown-list">
                        {stillMissingItems.slice(0, 3).map((item) => (
                          <li key={item} className="knw-rrc__breakdown-item">
                            <span className="knw-rrc__breakdown-dot" aria-hidden="true" />
                            <span className="knw-rrc__breakdown-text">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {missing && (
              <div className="knw-rrc__missing">
                <div className="knw-rrc__divider" />
                <div className="knw-rrc__missing-content">
                  <p className="knw-rrc__missing-label">WHAT WAS MISSING</p>
                  <ul className="knw-rrc__missing-list">
                    {/* Figma's DON'T: no more than three bullets. */}
                    {missingItems.slice(0, 3).map((item) => (
                      <li key={item} className="knw-rrc__missing-item">
                        <span className="knw-rrc__bullet" aria-hidden="true" />
                        <span className="knw-rrc__missing-text">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* A SIBLING OF THE BODY, NOT A CHILD OF IT. Figma draws `hint1` as
              its own frame beside Response Body inside Card, which is what
              keeps the hint clear of the verdict rather than reading as part
              of it. */}
          {hint && (
            <div className="knw-rrc__hint">
              <p className="knw-rrc__hint-label">
                <IconSlot size="200">
                  <HintIcon />
                </IconSlot>
                {hintLabel}
              </p>
              <div className="knw-rrc__hint-body">{hint}</div>
            </div>
          )}
        </div>
      </div>

      {/* Reveal swaps the next-action link for the helper line; it does not
          carry both.

          The link becomes a real <button> only when a handler is supplied.
          Figma sets it to "Skip Question" on the hint rungs, where it is the
          screen's only skip — but the states that merely report a verdict have
          nothing to tap, and their stories assert exactly that. */}
      {State === 'Reveal' ? (
        <p className="knw-rrc__helper">{helperLabel}</p>
      ) : onNextAction ? (
        <button
          type="button"
          className="knw-rrc__next knw-rrc__next--button"
          onClick={onNextAction}
        >
          {next}
        </button>
      ) : (
        <p className="knw-rrc__next">{next}</p>
      )}
    </div>
  );
}
