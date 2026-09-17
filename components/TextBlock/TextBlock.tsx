import type { HTMLAttributes } from 'react';
import './TextBlock.css';

/**
 * textBlock
 *
 * Built from the Figma component set "textBlock" (node 9003:9039).
 *
 * From the component's Figma description:
 *
 *   Heading and caption pair. 4 sizes (XL–S), caption toggled by boolean. No
 *   icons, no interactive state.
 *
 *   USE: Section headers, card titles, empty state headings. XL for
 *   screen-level, S for card-level.
 *
 *   DON'T: Use for interactive labels or button text — it has no press state.
 *
 * design-system.md says the same in its own words: "a heading and caption pair
 * for section headers, card titles, and empty state headings. Not for
 * interactive labels or button text; it has no press state."
 */

export type TextBlockVariant = 'XL' | 'L' | 'M' | 'S';

export interface TextBlockProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma variant axis. XL is screen-level, S is card-level. */
  variant?: TextBlockVariant;
  /** Figma: title. */
  title?: string;
  /** Figma: caption. */
  caption?: string;
  /** Figma: showCaption. */
  showCaption?: boolean;
  /**
   * Which heading element the title renders as. Not a Figma property — Figma
   * has no concept of heading rank, but a page of these needs to nest
   * correctly or screen readers get a broken outline.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function TextBlock({
  variant = 'XL',
  title = 'Header',
  caption = 'Caption',
  showCaption = true,
  headingLevel = 2,
  ...rest
}: TextBlockProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <div className={`knw-textblock knw-textblock--${variant}`} {...rest}>
      <Heading className="knw-textblock__title">{title}</Heading>
      {showCaption && <p className="knw-textblock__caption">{caption}</p>}
    </div>
  );
}
