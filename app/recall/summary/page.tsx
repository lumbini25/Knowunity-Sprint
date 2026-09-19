'use client';

/* Where the loop ends.

   The session records an outcome per term; this route turns those into the two
   lists and the split. Nothing is computed here that the session does not
   already know — `passedAt` carries which rung a pass landed on, which is the
   whole basis for "explained unaided" versus "took a hint". */

import { useEffect, useState } from 'react';
import { SummaryScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRouter } from 'next/navigation';
import { useRecallSession } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';
import { SESSION_FOLDER } from '../../../lib/recall/folders';

export default function Page() {
  const session = useRecallSession();
  const router = useRouter();

  /* NOTHING TO SUMMARISE IS NOT AN EMPTY SUMMARY — IT IS NOT A SUMMARY.
     `terms` used to be handed over as `terms.length ? terms : undefined`, and
     an undefined `terms` falls through to `SummaryScreen`'s own default
     parameter, which is `SUMMARY_DEMO` — the fixture its Storybook story
     renders. A student with no session at all was shown "3/4 Recalled" over
     four named concepts, invented, and indistinguishable from a real result.

     The fixture is right where it is: a story needs data, and the default is
     how it gets it. What was wrong is the live route reaching that default at
     all, so the route now decides for itself. There is no screen for a session
     that did not happen, so the student goes back to the front door. */
  const empty = session.outcomes.length === 0;

  /* ONE COMMIT LATE, DELIBERATELY, AND NOT BY A TIMER.
     The provider restores a saved session from sessionStorage in its own mount
     effect (`lib/recall/session.tsx`), and React runs passive effects child
     first — so on a hard reload of this URL this page sees `outcomes: []` one
     pass BEFORE the restore lands. Redirecting on that first pass throws away a
     real, finished session every time somebody reloads their own summary, which
     is a worse bug than the one being fixed. It was not hypothetical: a
     deferred `setTimeout(…, 0)` was tried here first and LOST the race — a
     seeded three-outcome session reloaded straight out to `/entry`.

     So nothing is timed. This flag flips in a mount effect, which puts its
     update in the same passive-effect flush as the provider's restore — React
     batches both into one re-render, so by the time `ready` is true the
     outcomes are either restored or genuinely absent, never in flight. A timer
     races the scheduler; this waits on it.

     The lint rule below is aimed at state that should have been derived during
     render. This is the case it cannot see, and the same exception the provider
     itself takes: what is being waited on lives outside React, in browser
     storage that does not exist until after hydration. It fires once. */
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  /* `replace`, not `push`: a summary that never rendered should not sit in
     history, or Back would land on it and bounce straight out again. */
  useEffect(() => {
    if (ready && empty) router.replace('/entry');
  }, [ready, empty, router]);

  if (empty) return null;

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
      /* The set the student actually practised, not a subject typed here by
         hand — the summary named "World history" while the questions were about
         something else. */
      topic={`${SESSION_FOLDER.title} · ${session.termCount} concepts`}
      terms={terms}
      /* WHAT THE STUDENT SAID ABOUT THEMSELVES, one screen back. Everything
         else here is the script's view of the session; this is theirs, and
         where the two disagree the screen takes theirs — a hinted pass that
         left them unsure joins the review list. Persisted, so returning to
         this summary later shows the same lists, and answering differently
         after more practice moves them. */
      confidence={session.confidence}
      /* "Revise now" goes to the REVISE SCREEN — the lesson, holding the term
         the student did worst on. It used to hand them back the folder shelf
         on the reasoning that what comes after a session is choosing the next
         material. That reads well in the abstract and badly in the loop: the
         summary has just named the concepts they missed, and the next tap
         answered "which folder?" — a question they had already answered — when
         the one they need is "that concept, again". `/recall/lesson` with no
         folder is exactly that screen, and its own "Explain out loud" card is
         the way back into the ladder.

         The shelf is still one tap further on, from the lesson's back control.
         Decision reversed deliberately; the old reasoning is kept above so the
         next person does not re-argue it from scratch.

         "Try again" goes to the FRONT DOOR, not back into Explain out loud.
         It used to push `/entry/ready`, which drops the student straight into
         a fresh session on the same feature — a narrower choice than the words
         promise. From `/entry` the whole rail is available, so "try again" can
         mean the same feature, a different one, or a different topic. The two
         together give the student the shelf (Revise now) or the chat (Try
         again), which is every way out of a finished session. */
      onRevise={() => router.push('/recall/lesson')}
      onTryAgain={() => router.push('/entry')}
    />
  );
}
