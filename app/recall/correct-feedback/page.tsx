'use client';

/* The second beat of the correct loop: what Knowie would have said, offered
   after a pass so the student can read it against their own words.

   Nothing here is judged and nothing costs a rung — the term was settled the
   moment the pass was recorded. Saying it back goes through the recorder, and
   `submit()` finds a resolved term and advances. */

import { CorrectFeedbackScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { goTo } = useRecallNav();

  return (
    <CorrectFeedbackScreen
      answer={session.term.modelAnswer}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onSayItBack={goTo('recording')}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
