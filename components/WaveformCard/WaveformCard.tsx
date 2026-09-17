import type { CSSProperties, HTMLAttributes } from 'react';
import './WaveformCard.css';

/**
 * waveformCard
 *
 * Built from the Figma component set "waveformCard" (node 15667:13354).
 *
 * From the component's Figma description:
 *
 *   24-bar voice amplitude visualiser shown during the listening phase of the
 *   Explain Out Loud recall loop. Bars scale with the student's voice amplitude
 *   in production — this component shows the design-time resting position.
 *
 *   USE: Place directly below mascotSlot in the listening screen. Switch to
 *   state=Talking when audio capture starts; switch to state=Idle when the
 *   student is not yet speaking or has paused.
 *
 *   DON'T: Use this component in the thinking state. Once the answer is sent,
 *   replace with voiceFab at state=Thinking. A waveform in the thinking state
 *   implies audio is still being captured.
 */

export type WaveformCardState = 'Idle' | 'Talking';

/**
 * The resting positions Figma draws. Both variants use the same 24 values —
 * they are design-time data, not design values, so they are overridable.
 */
export const RESTING_AMPLITUDES = [
  10, 22, 15, 28, 38, 24, 44, 20, 34, 18, 42, 26,
  36, 16, 30, 12, 40, 20, 32, 42, 18, 26, 12, 8,
] as const;

/** Figma fades the last four bars. */
const TAIL_FROM = 20;

export interface WaveformCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma variant axis. */
  state?: WaveformCardState;
  /**
   * Bar amplitudes. The component's description calls these animation data, so
   * production passes live values; the default is Figma's resting position.
   */
  amplitudes?: readonly number[];
}

export function WaveformCard({
  state = 'Idle',
  amplitudes = RESTING_AMPLITUDES,
  ...rest
}: WaveformCardProps) {
  // Figma's row is 44 tall at its tallest bar; heights arrive as a share of it
  // so the row never overflows whatever the motion layer sends.
  const peak = Math.max(...amplitudes, 1);

  return (
    <div
      className={`knw-waveform knw-waveform--${state}`}
      role="img"
      aria-label={state === 'Talking' ? 'Recording your answer' : 'Microphone on, waiting for you to speak'}
      {...rest}
    >
      <div className="knw-waveform__bars">
        {amplitudes.map((a, i) => (
          <span
            key={i}
            className="knw-waveform__bar"
            data-tail={i >= TAIL_FROM ? 'true' : undefined}
            style={{ '--knw-bar': `${(a / peak) * 100}%` } as CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
