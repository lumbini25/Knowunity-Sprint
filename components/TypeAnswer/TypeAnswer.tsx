import type { ButtonHTMLAttributes } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import { KeyboardIcon } from './icons';
import './TypeAnswer.css';

/**
 * typeAnswerComponent
 *
 * Built from the Figma component "typeAnswerComponent" (node 15676:16031).
 *
 * From the component's Figma description:
 *
 *   Keyboard icon + "Type your answer" label. The text-fallback escape for
 *   students who cannot speak right now.
 *
 *   USE: Always visible below voiceFab on every recall screen. Required by the
 *   brief's accessibility constraint — the non-voice path for students who
 *   cannot or prefer not to speak.
 *
 *   DONT
 *     Do not hide this component conditionally.
 *     Do not move it inside voiceFab — it sits at screen level, not inside the
 *     FAB component.
 *
 * It renders as a real button because it is the tap target that opens the text
 * path; Figma draws it as a row of two layers with no interactive state.
 */

export interface TypeAnswerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma's label. Text-editable in the file. */
  label?: string;
}

export function TypeAnswer({ label = 'Type your answer', ...rest }: TypeAnswerProps) {
  return (
    <button type="button" className="knw-typeanswer" {...rest}>
      {/* Figma draws the glyph at 16, which is iconSlot Size=200. */}
      <IconSlot size="200">
        <KeyboardIcon />
      </IconSlot>
      <span className="knw-typeanswer__label">{label}</span>
    </button>
  );
}
