'use client';

/* Where the loop ends.

   The session records an outcome per term; this route hands them to the
   summary, one `termRow` each. Nothing is computed here that the session does not
   already know — `passedAt` carries which rung a pass landed on, which is the
   whole basis for "explained unaided" versus "took a hint". */

import { useEffect, useRef, useState } from 'react';
import { SummaryScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRouter } from 'next/navigation';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
  const router = useRouter();
  const { go } = useRecallNav();

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
  /* LEAVING ON PURPOSE IS NOT "NOTHING TO SUMMARISE". "Redo" starts a fresh
     session, which empties the outcomes this page is rendering — and the
     redirect below then fired before the push to the first question landed,
     sending the student to the front door instead. Found walking the flow;
     no story could see it, because stories render the screen, not the route. */
  const leaving = useRef(false);

  useEffect(() => {
    if (ready && empty && !leaving.current) router.replace('/entry');
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
      terms={terms}
      /* WHAT THE STUDENT SAID ABOUT THEMSELVES, one screen back. It decides
         which way on leads: "I need to practice" puts the redo first. */
      confidence={session.confidence}
      /* A ROW OPENS ITS OWN TERM. The detail is about the row that was
         tapped, so the term's id travels with the tap. */
      onOpenTerm={(i) =>
        router.push(`/recall/comparison?term=${encodeURIComponent(session.outcomes[i].termId)}`)
      }
      /* Continue leaves the finished session for the front door, where the
         whole rail and the week's topics are. */
      onContinue={() => router.push('/entry')}
      /* "Redo N terms": the whole set again, fresh, from term 1. */
      onRedo={() => {
        leaving.current = true;
        go(session.startAt(0));
      }}
    />
  );
}
