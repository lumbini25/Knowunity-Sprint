'use client';

/* The only wrong verdict in the loop, and it sits past the whole ladder: four
   rungs spent, the model answer read, said back, and it still did not land.
   Nothing routes here mid-ladder — a miss on a hint climbs to the next one. */

import { WrongScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <WrongScreen
      transcript={session.verdict?.transcript}
      missingItems={session.term.missingItems}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      /* The orb opens the comparison rather than another attempt: there is no
         attempt left to make, and what the student needs now is to see the two
         answers next to each other. */
      onCompare={goTo('comparison')}
      onNextQuestion={() => go(session.advance())}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
