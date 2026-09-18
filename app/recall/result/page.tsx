'use client';

/* The verdict, and the next rung.

   `session.verdict` carries the take that was judged; `session.rungScript`
   carries the hint for the rung the ladder has MOVED TO, which is why the
   verdict holds its own rung rather than reading the current one. A pass
   settles the term and leaves `resolved` true, so the next action advances
   instead of offering another attempt. */

import { ResultScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { formatScore } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();
  const { verdict, rungScript, resolved } = session;

  return (
    <ResultScreen
      verdict={verdict?.verdict ?? 'Wrong'}
      rung={session.rung}
      question={session.term.question}
      gotItems={session.verdict?.got}
      stillMissingItems={session.verdict?.stillMissing}
      transcript={verdict?.transcript}
      /* A settled term has no next rung, so no hint. */
      hint={resolved ? undefined : rungScript?.hint?.body}
      hintLabel={rungScript?.hint?.label}
      /* This route was already right; it goes through the shared formatter so
         the two can never drift apart again. */
      score={formatScore(verdict?.score)}
      missingItems={session.term.missingItems}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      /* A pass moves on; a miss offers another attempt at the new rung. */
      onRecord={resolved ? () => go(session.advance()) : goTo('recording')}
      nextActionLabel={resolved ? 'Next question' : 'Skip question'}
      onNextAction={resolved ? () => go(session.advance()) : () => go(session.skip())}
      onTypeAnswer={goTo('text-fallback')}
      onExit={session.requestExit}
    />
  );
}
