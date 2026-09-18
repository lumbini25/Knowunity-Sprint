'use client';

/* The pass. One of three verdict paths, and the only one with its own screen:
   partial is the hint ladder at `/recall/result`, and wrong is only ever
   declared once the ladder runs out, at `/recall/reveal`.

   The term is already settled by the time this renders — `submit()` records the
   pass before returning `correct` — so nothing here is judged. */

import { CorrectScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { formatScore } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  const shown = session.verdict;

  return (
    <CorrectScreen
      transcript={shown?.transcript}
      /* The score the judge gave, not a flat 100: passing on hint 3 is still a
         pass, and the card should not claim it was unaided.

         THROUGH `formatScore`, not formatted here. This line used to multiply
         by 100 — but `verdict.score` is already a percentage, so a real pass
         rendered `10000%` and ran straight out of the card's 44px ring. The
         result route printed the same field correctly, which is the tell: one
         field, two call sites, two answers. Now there is one. */
      score={formatScore(shown?.score)}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      /* The two ways on do different things. "Next question" settles and moves;
         the orb opens the model answer to read this one against. */
      onNextQuestion={() => go(session.advance())}
      onCompare={goTo('correct-feedback')}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
