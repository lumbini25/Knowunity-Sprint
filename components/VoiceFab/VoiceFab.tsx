import type { HTMLAttributes, ReactNode } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import { CheckIcon } from '../Checkbox/icons';
import { MicIcon } from './icons';
import { TrashIcon } from './TrashIcon';
import './VoiceFab.css';

/**
 * voiceFab
 *
 * Built from the Figma component set "voiceFab" (node 15703:17937).
 *
 * From the component's Figma description:
 *
 *   Circular tap target for voice input in the Explain Out Loud recall loop.
 *
 *   VARIANT AXIS
 *     state — one of: Idle | Recording | Sent | Disabled | Thinking | Deny
 *
 *   PROPERTIES
 *     label (text) — Overrides the caption below the button.
 *     showLabel (boolean) — Hides the Label node. Default: true.
 *     icon (instance swap) — Swaps the icon in state=Sent. Default: iconSlot
 *       Size=400. In state=Idle and state=Recording the icon is the mic
 *       illustration (custom vectors, not swappable via this property).
 *
 *   DONT
 *     Do not use state=Recording when the student has already sent their
 *     answer.
 *     Do not add a second label node — use the showLabel property.
 *     Do not resize the Ring ellipse independently of the Button — both scale
 *     together.
 *
 * Thinking and Disabled are non-interactive, per design-system.md: "Do not
 * expose a tap target in this state."
 */

export type VoiceFabState = 'Idle' | 'Recording' | 'Sent' | 'Disabled' | 'Thinking' | 'Deny';

/** Figma sets a different label default per state. */
const DEFAULT_LABEL: Record<VoiceFabState, string> = {
  Idle: 'Tap to answer',
  Recording: 'Tap to send',
  Sent: 'Answer sent',
  Disabled: 'Microphone unavailable',
  Thinking: 'Evaluating…',
  Deny: 'Microphone blocked',
};

/** Figma draws no ring on Disabled, and the orb states replace it. */
const HAS_RING: Record<VoiceFabState, boolean> = {
  Idle: true,
  Sent: true,
  Recording: false,
  Disabled: false,
  Thinking: false,
  /* Deny keeps Idle's structure — ring, button, mic — and recolours it. */
  Deny: true,
};

/**
 * Figma draws Idle's caption above the button and every other state's below.
 * design-system.md's anatomy lists the Label last in all of them, so the two
 * disagree — the file is followed here, because the file is what renders.
 */
const LABEL_ON_TOP: Record<VoiceFabState, boolean> = {
  Idle: true,
  Recording: false,
  Sent: false,
  Disabled: false,
  Thinking: false,
  /* Deny inherits Idle's layout, caption above the button included. */
  Deny: true,
};

const INTERACTIVE: Record<VoiceFabState, boolean> = {
  Idle: true,
  Recording: true,
  Sent: true,
  Disabled: false,
  Thinking: false,
  /* Tapping a blocked mic does nothing — the escape is the button below. */
  Deny: false,
};

export interface VoiceFabProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Figma variant axis. */
  state?: VoiceFabState;
  /** Figma: label. Falls back to the per-state default. */
  label?: string;
  /** Figma: showLabel. */
  showLabel?: boolean;
  /** Figma: icon. Swaps the glyph in state=Sent only. */
  icon?: ReactNode;
  /** Called when the student taps. Not wired in the non-interactive states. */
  onPress?: () => void;
  /**
   * Shows the discard control beside the orb. Not a Figma property — the
   * component's own description calls for it ("taps the trash discard icon to
   * cancel and re-record") but the set carries no such axis.
   */
  showDiscard?: boolean;
  /** Called when the student discards the take. */
  onDiscard?: () => void;
}

export function VoiceFab({
  state = 'Idle',
  label,
  showLabel = true,
  icon,
  onPress,
  showDiscard = false,
  onDiscard,
  ...rest
}: VoiceFabProps) {
  const text = label ?? DEFAULT_LABEL[state];
  /* A STATE THAT CAN BE TAPPED IS NOT THE SAME AS ONE THAT DOES SOMETHING.
     `Sent` is interactive by state, but on `cancel option` the orb is status —
     it reads "Answer sent" and the decisions live in the buttons beside it.
     Rendering a <button> there anyway put a focusable, clickable control in
     the tab order that did nothing, which is worse for a keyboard or screen
     reader user than for anyone else. So a state only exposes a tap target
     when something is actually wired to it. */
  const interactive = INTERACTIVE[state] && Boolean(onPress);
  const isOrb = state === 'Recording' || state === 'Thinking';

  const surface = (
    <>
      {HAS_RING[state] && <span className="knw-fab__ring" />}
      <span className="knw-fab__button">
        {state === 'Sent' ? (
          <span className="knw-fab__icon">
            {/* Figma's default for the icon property is iconSlot Size=400. */}
            <IconSlot size="400">{icon ?? <CheckIcon />}</IconSlot>
          </span>
        ) : isOrb ? null : (
          <span className="knw-fab__glyph">
            <MicIcon />
          </span>
        )}
      </span>
      {isOrb && <span className="knw-fab__sheen" />}
    </>
  );

  const caption = showLabel ? <p className="knw-fab__label">{text}</p> : null;

  return (
    <div className={`knw-fab knw-fab--${state}`} {...rest}>
      {LABEL_ON_TOP[state] && caption}

      {/* The discard control sits to the LEFT of the orb, so the row reads
          "throw this away" then "send it" in the direction the student reads.
          The row is centred on the orb, not on the pair, so adding the trash
          does not shift the orb off the screen's centre line. */}
      <div className="knw-fab__row">
        {/* Voice_UX principle 2: "Always let the student cancel and re-record
            before sending." It rides with state=Sent, not Recording — `answer
            sent` is the screen that draws it, and that is the moment a take
            exists to throw away. During Recording there is nothing recorded
            yet to discard. */}
        {showDiscard && state === 'Sent' && (
          <button
            type="button"
            className="knw-fab__discard"
            aria-label="Discard and re-record"
            onClick={onDiscard}
          >
            <IconSlot size="200">
              <TrashIcon />
            </IconSlot>
          </button>
        )}

        {interactive ? (
          <button
            type="button"
            className="knw-fab__stage"
            aria-label={text}
            onClick={onPress}
          >
            {surface}
          </button>
        ) : (
          // Thinking and Disabled expose no tap target at all.
          <div className="knw-fab__stage" role="img" aria-label={text}>
            {surface}
          </div>
        )}
      </div>

      {!LABEL_ON_TOP[state] && caption}
    </div>
  );
}
