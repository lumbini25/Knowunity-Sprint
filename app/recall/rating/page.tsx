'use client';

/* The confidence self-report, between the last term and the score.

   It is asked HERE rather than on the summary because a number changes the
   answer: after seeing 6/10, "how confident are you now?" measures a reaction
   to the score rather than a feeling about the material. */

import { SessionRatingScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallNav } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';

export default function Page() {
  const { goTo } = useRecallNav();

  return (
    <SessionRatingScreen
      /* Every term the session covered, in the order it covered them. Read from
         the script rather than the session: by the time this renders the term
         index is spent, and the list is what was scheduled, not where the
         student got to. */
      topics={SESSION.map((t) => t.title)}
      /* Continue is always live: the question is optional, and a self-report
         the student cannot decline is a toll gate rather than a question. The
         answer is not recorded anywhere — nothing in this prototype reads it,
         and pretending otherwise would be the more dishonest option. */
      onContinue={goTo('summary')}
    />
  );
}
