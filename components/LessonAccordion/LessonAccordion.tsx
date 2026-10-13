'use client';

import { useId, useState, type ReactNode } from 'react';
import { IconSlot } from '../IconSlot/IconSlot';
import { BookIcon } from './icons';
import './LessonAccordion.css';

/**
 * lessonAccordion
 *
 * One section of a lesson, built from the `sectionHeader` rows in Figma's
 * `Lesson details accordion closed` (16311:15771): an outlined pill with the
 * section's name and an open-book glyph. Figma draws only the closed state —
 * the frame's own name says there is an open one — so the open panel is this
 * component's, and is the reading the section holds.
 *
 * WHY IT EXPANDS. The lesson screen is the "last look before being tested"
 * sprint-context.md asks for. A pill that looks pressable and leads nowhere is
 * the dead control CLAUDE.md forbids; expanding in place keeps the student on
 * the screen they are about to start from.
 *
 * Uncontrolled by default (`defaultOpen`), controlled when `open` is passed —
 * the same hybrid `ExplainEntryScreen` uses for its keyboard, so a story can
 * pin a state and a screen can just render it.
 */
export interface LessonAccordionProps {
  /** The section's name, on the pill. */
  title?: string;
  /** What opens under it. */
  children?: ReactNode;
  /** Open on first render. Ignored when `open` is set. */
  defaultOpen?: boolean;
  /** Pin the state from outside. */
  open?: boolean;
  /** Called with the next state on every tap. */
  onToggle?: (open: boolean) => void;
}

export function LessonAccordion({
  title = 'Turning points',
  children = 'Stalingrad, Midway and D-Day are the three usually named.',
  defaultOpen = false,
  open: openProp,
  onToggle,
}: LessonAccordionProps) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const panelId = useId();

  return (
    <div className="knw-accordion" data-open={open}>
      <button
        type="button"
        className="knw-accordion__header"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          const next = !open;
          if (openProp === undefined) setOpenState(next);
          onToggle?.(next);
        }}
      >
        <span className="knw-accordion__title">{title}</span>
        <span className="knw-accordion__icon">
          <IconSlot size="300">
            <BookIcon />
          </IconSlot>
        </span>
      </button>

      {/* ALWAYS IN THE TREE, collapsed by its grid row rather than unmounted,
          so opening is a crossing the eye can follow rather than a jump. The
          inner wrapper is what clips. `hidden` from assistive tech while
          closed, via `inert`, so a screen reader does not read a closed
          section. */}
      <div
        id={panelId}
        className="knw-accordion__panel"
        role="region"
        aria-label={title}
        inert={!open}
      >
        <div className="knw-accordion__clip">
          <div className="knw-accordion__body">{children}</div>
        </div>
      </div>
    </div>
  );
}
