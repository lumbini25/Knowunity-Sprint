'use client';

/* The take — the listening loop's second half.

   The screen lives in components/screens/RecallScreens so the route and the
   Storybook story render the exact same component. This route reads the
   session and turns destinations into navigation; the screen stays pure.

   Two beats. It opens on the take the student has not yet submitted, where
   Continue, Retry and the trash are all live and the screen WAITS — that wait
   is what makes "cancel and re-record before send" (brief F2) reachable. On
   Continue it flashes the acknowledgement for 300ms and hands over to the
   judge. The screen owns the move between beats; this file only says where the
   second one goes. A story passes no onAdvance, so it holds and stays
   inspectable.

   THREE EXITS, AND ONLY ONE COSTS A RUNG:
     Continue  submit this take       → processing, rung consumed
     Retry     say it again           → listening, rung intact
     Trash     throw the take away    → idle, rung intact  */

import { AnswerSentScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <AnswerSentScreen
      transcript={session.take?.transcript}
      onAdvance={goTo('processing')}
      onRetry={goTo('recording')}
      onDiscard={() => go(session.discard())}
      onTypeAnswer={goTo('text-fallback')}
      onSkip={() => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
