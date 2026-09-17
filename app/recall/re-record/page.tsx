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
      onNextQuestion={() => go(session.skip())}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
