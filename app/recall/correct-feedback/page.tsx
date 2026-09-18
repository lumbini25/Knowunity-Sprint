'use client';

/* The second beat of the correct loop: what Knowie would have said, offered
   after a pass so the student can read it against their own words.

   Nothing here is judged and nothing costs a rung — the term was settled the
   moment the pass was recorded, so the only thing left is to move on.
   `advance()` returns `idle` with the next term loaded, which is Figma's
   `Next question after correct answer` (16071:25942), or `rating` when this
   was the last term.

   IT USED TO ROUTE THROUGH THE RECORDER. The orb read "Say it back" and went
   to `/recording`, which re-ran a term that was already settled: the take was
   judged again, `submit()` returned the same verdict, and the student landed
   back on `/correct` — the screen they had just left. A pass could not be
   walked away from without the browser's back button. */

import { CorrectFeedbackScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <CorrectFeedbackScreen
      answer={session.term.modelAnswer}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onNextQuestion={() => go(session.advance())}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
