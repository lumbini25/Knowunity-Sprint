'use client';

/* Where the loop ends.

   The session records an outcome per term; this route turns those into the two
   lists and the split. Nothing is computed here that the session does not
   already know — `passedAt` carries which rung a pass landed on, which is the
   whole basis for "explained unaided" versus "took a hint". */

import { SummaryScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRouter } from 'next/navigation';
import { useRecallSession } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
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
      /* "Revise now" goes to the FOLDER PICKER, not to the lesson. The summary
         is where a session ends, and what a student does next is choose the
         material to revise — so it hands them back the shelf rather than
         reopening the one concept they just left. `/recall/lesson` shows a
         single set; `/entry/folders` is the choice between them.

         "Try again" goes to the FRONT DOOR, not back into Explain out loud.
         It used to push `/entry/ready`, which drops the student straight into
         a fresh session on the same feature — a narrower choice than the words
         promise. From `/entry` the whole rail is available, so "try again" can
         mean the same feature, a different one, or a different topic. The two
         together give the student the shelf (Revise now) or the chat (Try
         again), which is every way out of a finished session. */
      onRevise={() => router.push('/entry/folders')}
      onTryAgain={() => router.push('/entry')}
    />
  );
}
