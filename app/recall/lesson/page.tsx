'use client';

/* The set's lesson — the last look before the session, and where "Revise now"
   lands after one.

   sprint-context.md: "the topic breakdown before the loop exists to offer a
   last look before being tested … that difference is the one between a test
   and an ambush." */

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LessonScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';
import { SESSION_FOLDER } from '../../../lib/recall/folders';

/* Every term in the set, each opening on its reading. */
const SECTIONS = SESSION.map((t) => ({ title: t.title, body: t.modelAnswer }));

function Lesson() {
  const session = useRecallSession();
  const { go } = useRecallNav();
  const router = useRouter();
  const params = useSearchParams();

  /* THE SCREEN IS REACHED TWO WAYS AND THEY WANT DIFFERENT THINGS.
     From the ready card, nothing has been asked yet: every section starts
     closed and "Explain out loud" starts a fresh session on term 1.
     From the summary's "Revise now", the student is here to re-read the term
     they are about to retry — `session.term`, the one source the loop itself
     uses — so that section opens and the button goes straight back in. */
  const fromReady = params.get('from') === 'ready';

  return (
    <LessonScreen
      eyebrow="1939 – 1945"
      title={SESSION_FOLDER.title}
      conceptCount={session.termCount}
      sections={SECTIONS}
      openIndex={fromReady ? undefined : session.termIndex}
      onExplainOutLoud={fromReady ? () => go(session.startAt(0)) : () => go('idle')}
      onBack={fromReady ? () => router.push('/entry/ready') : () => go('summary')}
    />
  );
}

/* `useSearchParams` opts a route into client-side rendering, and every route
   here is prerendered — without the boundary the build fails outright. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Lesson />
    </Suspense>
  );
}
