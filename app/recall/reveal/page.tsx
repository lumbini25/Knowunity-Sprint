'use client';

/* The answer — four rungs spent, or asked for on rung 3 — and one chance to
   say it back.

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
      /* Not judged and costs no rung — `submit()` sees the reveal rung and
         advances. What the student buys is the saying.

         ONE WAY ON, by the design owner's call: "Try now" goes to the
         recorder, which carries its own "Type your answer". No orb and no
         text fallback on this screen — see `RevealScreen`. */
      onTryNow={goTo('recording')}
      onExit={session.requestExit}
    />
  );
}
