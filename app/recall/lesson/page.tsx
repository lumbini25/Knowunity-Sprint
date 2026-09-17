'use client';

/* Where "Revise now" lands.

   sprint-context.md: "the topic breakdown before the loop exists to offer a
   last look before being tested … that difference is the one between a test
   and an ambush." Same reason applies after a miss: the student is sent back
   to read the concept, and the explain-out-loud card is the way back in.

   The topic is the term they struggled with most — the first on the review
   list, which `skip()` and a rung-4 miss both feed. */

import { LessonScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  const weakest = session.outcomes.find((o) => o.skipped || o.passedAt === null);
  const term = weakest ? SESSION.find((t) => t.id === weakest.termId) : undefined;

  return (
    <LessonScreen
      eyebrow="World history"
      title={term?.title ?? 'Primary sources'}
      conceptCount={session.termCount}
      body={term?.modelAnswer}
      practiceTopic="World history foundations"
      /* Straight back into the loop, at the term they are revising. `advance()`
         is not right here — nothing was answered; this restarts the reading. */
      onExplainOutLoud={goTo('idle')}
      onBack={() => go('summary')}
    />
  );
}
