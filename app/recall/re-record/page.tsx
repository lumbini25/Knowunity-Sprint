'use client';

/* What contesting a transcript leads to. The rung has not moved, so Continue
   goes back to the mic at the same rung rather than costing an attempt. */

import { ReRecordScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <ReRecordScreen
      onContinue={goTo('recording')}
      /* Named for what it does. It was `onNextQuestion`, under a button that
         read "Next question" — both describing paging forward, where the call
         is `skip()`: a recorded miss on the revise list. The screen exists to
         tell the student a bad transcript cost them nothing, so the one
         control that DOES cost something has to say so. */
      onSkip={() => go(session.skip())}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
