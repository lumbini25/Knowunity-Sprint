'use client';

/* Where the loop ends.

   The session records an outcome per term; this route turns those into the two
   lists and the split. Nothing is computed here that the session does not
   already know — `passedAt` carries which rung a pass landed on, which is the
   whole basis for "explained unaided" versus "took a hint". */

import { SummaryScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRouter } from 'next/navigation';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
  const { goTo } = useRecallNav();
  const router = useRouter();

  /* Outcomes carry a termId; the titles live on the script. Terms the student
     never reached are simply absent, which is correct — the summary reports
     the session that happened, not the one that was planned. */
  const terms = session.outcomes.map((o) => ({
    title: SESSION.find((t) => t.id === o.termId)?.title ?? o.termId,
    passedAt: o.passedAt,
    skipped: o.skipped,
  }));

  return (
    <SummaryScreen
      topic={`World history · ${session.termCount} concepts`}
      terms={terms.length ? terms : undefined}
      /* "Revise now" goes to the lesson — the concept back in front of the
         student before they try explaining it again.

         "Try again" goes to `/entry/ready`, the Explain Out Loud entry screen
         (`explain out ready`, 15619:8880). That was the last unwired control
         in the build: the destination did not exist. Now the loop closes —
         summary → entry → a fresh session. */
      onRevise={goTo('lesson')}
      onTryAgain={() => router.push('/entry/ready')}
    />
  );
}
