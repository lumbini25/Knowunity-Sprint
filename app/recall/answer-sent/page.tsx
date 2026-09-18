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
     Trash     ask first, then drop   → the NEXT question, scored as a miss

   THE TRASH ASKS, AND THEN IT COSTS SOMETHING. It used to drop the take on
   the first tap and return to `idle` on the same term with the rung intact.
   `bottom sheet for delete control` (16073:26275) revises both halves: a Yes
   / No confirmation stands in front of it, and its body says "you will be
   moved forward to the next question".

   So Yes is `skip()`, not `discard()`. Deleting the only take and moving on
   means nobody answered the term, and `skip()` is the call that records that
   — `settleTerm({ skipped: true })` — as well as advancing. `discard()`
   returns to the same question and now has no caller; it is left in the
   session API rather than removed as a side effect of a copy change.

   SPEC.md:227, :636 and :713 still describe the old behaviour. */

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
      onDiscard={() => go(session.skip())}
      onTypeAnswer={goTo('text-fallback')}
      onSkip={() => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
