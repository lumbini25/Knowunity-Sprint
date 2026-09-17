'use client';

/* Nothing was heard. `retryAfterSilence()` hands back the next take at the
   SAME rung — an accidental mic tap must never count as an attempt. */

import { NoAudioScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <NoAudioScreen
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onRetry={() => go(session.retryAfterSilence())}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
