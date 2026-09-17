'use client';

/* The transcript came back below the confidence threshold, so the student gets
   to say so before the verdict stands. `contest()` hands back this rung's
   clean take and does NOT move the rung — a transcription failure is never the
   student's fault. */

import { MisheardScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <MisheardScreen
      transcript={session.verdict?.transcript}
      onMisheard={() => go(session.contest())}
      /* "That's what I said" lets the verdict stand — and letting it stand
         means CONSUMING the take, not just navigating to the screen that shows
         it. This used to be `goTo('result')`, which moved the student without
         moving the rung: answering again handed back the same contestable take
         and the same misheard screen, with no way out but the back button. */
      onConfirmed={() => go(session.confirm())}
      /* The orb is "say it again right now" — the same claim as "Knowie
         misheard me", minus the offer screen. It has to go through `contest()`
         for that: a rung holds several takes, and only contest advances to the
         next one. Routing straight to the mic instead handed the student the
         SAME bad transcript on every attempt, which is a loop with no exit. */
      onRetry={() => {
        session.contest();
        go('recording');
      }}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
