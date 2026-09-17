'use client';

/* Four rungs spent. The answer, and one optional chance to say it back.

   The term is already settled by the time this renders — `submit()` records
   the miss before returning `reveal` — so both actions here advance. */

import { RevealScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { goTo } = useRecallNav();

  return (
    <RevealScreen
      question={session.term.question}
      answer={session.term.modelAnswer}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      /* Neither path is judged and neither costs a rung — `submit()` sees the
         reveal rung, finds nothing to judge, and advances. What the student
         buys is the saying.

         There is no "next question": the way on is to answer. Both of these
         advance the term, so the screen has two ways forward and no way to tap
         past the answer without engaging with it. */
      onSayItBack={goTo('recording')}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
