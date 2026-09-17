import type { HTMLAttributes } from 'react';
import './TranscriptSection.css';

/**
 * transcriptSection
 *
 * Built from the Figma component "transcriptSection" (node 15676:16088).
 *
 * From the component's Figma description:
 *
 *   "WHAT YOU SAID" section label above a tinted transcript box. Shows the STT
 *   transcript of the student's last answer on the result screen.
 *
 *   DONT
 *     Do not use this component during the processing state — it requires a
 *     verdict to have content.
 *     Do not confuse with the Transcript layer inside recallResponseCard —
 *     that is a different component.
 *
 * Voice_UX principle 4 is why this exists: showing what was heard makes a
 * misheard answer read as "the app misheard me", not "I failed".
 */

export interface TranscriptSectionProps extends HTMLAttributes<HTMLElement> {
  /** The section label. Figma's default. */
  label?: string;
  /** The transcript of what the student said. */
  transcript?: string;
}

export function TranscriptSection({
  label = 'WHAT YOU SAID',
  transcript = '"...context and... being critical of sources. Primary source is available in archives."',
  ...rest
}: TranscriptSectionProps) {
  return (
    /* A <div>, not a <section aria-label>. It was a landmark when this was a
       standalone block on a result screen; now `recallResponseCard` instances
       one per verdict, and several on a page made a set of identically-named
       landmarks — which axe flags, correctly: a transcript inside a card is
       not a region of the page. The visible label still names it, and it is a
       real <p> rather than an aria-label, so nothing is lost. */
    <div className="knw-transcript" {...rest}>
      <p className="knw-transcript__label">{label}</p>
      <div className="knw-transcript__box">
        <p className="knw-transcript__text">{transcript}</p>
      </div>
    </div>
  );
}
