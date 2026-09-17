'use client';

/* The pass. One of three verdict paths, and the only one with its own screen:
   partial is the hint ladder at `/recall/result`, and wrong is only ever
   declared once the ladder runs out, at `/recall/reveal`.

   The term is already settled by the time this renders — `submit()` records the
   pass before returning `correct` — so nothing here is judged. */

import { CorrectScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  const shown = session.verdict;

  return (
    <CorrectScreen
      transcript={shown?.transcript}
      /* The score the judge gave, not a flat 100: passing on hint 3 is still a
         pass, and the card should not claim it was unaided. */
      score={shown?.score != null ? `${Math.round(shown.score * 100)}%` : undefined}
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
