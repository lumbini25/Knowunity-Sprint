'use client';

/* What Knowie would have said, beside what the student actually said.

   SPEC.md listed this as row 14 "Comparison" and nothing ever built it — the
   row was renamed "Reveal" when the hint-ladder section arrived, and the
   comparison quietly stopped existing. They are different screens: the reveal
   shows the answer so it can be SAID; this shows it against the saying. */

import { ComparisonScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { goTo } = useRecallNav();

  return (
    <ComparisonScreen
      question={typeof session.term.question === 'string' ? session.term.question : session.term.title}
      /* The model answer as the points it is made of — `missingItems` is
         already that list, and it is what the verdict card just told the
         student they missed. Same facts, same order. */
      answerPoints={session.term.missingItems}
      transcript={session.verdict?.transcript}
      onRevise={goTo('lesson')}
      /* BACK INTO THE LOOP, not on to the next term. The prototype wires this
         screen's second exit to `idle` — a student who has just read what they
         missed should be able to try it, which is the whole reason the screen
         shows them both answers. `advance()` moved them past it instead. */
      onTryAgain={goTo('idle')}
      onExit={session.requestExit}
    />
  );
}
