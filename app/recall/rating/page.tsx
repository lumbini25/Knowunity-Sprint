'use client';

/* The confidence self-report, between the last term and the score.

   It is asked HERE rather than on the summary because a number changes the
   answer: after seeing 6/10, "how confident are you now?" measures a reaction
   to the score rather than a feeling about the material.

   AND IT IS NOW READ. The answer used to go nowhere — the screen's own comment
   said so — which made the question a toll gate wearing a question's clothes.
   It is recorded on the session and the summary sorts by it: a student who
   says they need practice gets their hinted passes moved into the review list,
   because a term that only landed with help and left them unsure is the one
   they will lose first. */

import {
  RATING_OPTIONS,
  SessionRatingScreen,
} from '../../../components/screens/RecallScreens/RecallScreens';
import type { RatingOption } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import type { Confidence } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';

/* THE ROW'S POSITION IS THE LEVEL, which is only true because `RATING_OPTIONS`
   is ordered low → medium → high. It was not — the array ran low, high, medium
   while its own comment claimed otherwise — and a mapping written against that
   order would have recorded "pretty confident" as the middle of the scale
   without anything looking wrong. The order is the contract; this reads it
   rather than restating it. */
const LEVELS: Confidence[] = ['low', 'medium', 'high'];

function toLevel(option: RatingOption | null): Confidence | null {
  if (!option) return null;
  const i = RATING_OPTIONS.indexOf(option);
  return i === -1 ? null : LEVELS[i];
}

function toOption(level: Confidence | null): RatingOption | null {
  if (!level) return null;
  return RATING_OPTIONS[LEVELS.indexOf(level)] ?? null;
}

export default function Page() {
  const session = useRecallSession();
  const { goTo } = useRecallNav();

  return (
    <SessionRatingScreen
      /* Every term the session covered, in the order it covered them. Read from
         the script rather than the session: by the time this renders the term
         index is spent, and the list is what was scheduled, not where the
         student got to. */
      topics={SESSION.map((t) => t.title)}
      /* Held by the session, so coming back to this screen shows what they
         already answered rather than an empty scale. */
      value={toOption(session.confidence)}
      onChange={(next) => session.setConfidence(toLevel(next))}
      /* Continue is always live: the question is optional, and a self-report
         the student cannot decline is a toll gate rather than a question.
         Declining leaves `confidence` null, and the summary then sorts the way
         it always did. */
      onContinue={goTo('summary')}
    />
  );
}
