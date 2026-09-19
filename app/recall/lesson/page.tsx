'use client';

/* Where "Revise now" lands.

   sprint-context.md: "the topic breakdown before the loop exists to offer a
   last look before being tested … that difference is the one between a test
   and an ambush." Same reason applies after a miss: the student is sent back
   to read the concept, and the explain-out-loud card is the way back in.

   The topic is the term they struggled with most — the first on the review
   list, which `skip()` and a rung-4 miss both feed. */

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LessonScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import type { ScriptedTerm } from '../../../lib/recall/script';
import { findFolder, SESSION_FOLDER } from '../../../lib/recall/folders';

function Lesson() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();
  const router = useRouter();
  const params = useSearchParams();

  /* THE SCREEN IS REACHED TWO WAYS AND THEY WANT DIFFERENT THINGS.
     After a miss, the student is here to re-read the term they struggled with,
     and the session knows which that is.

     Opened from a folder there is no session to ask, and this used to ask
     anyway: outcomes are empty, so the weakest term resolved to `undefined`
     and everything fell through to the first scripted term. Tapping "Civil
     Rights Movement" opened a lesson about primary sources, under a heading
     that said Civil Rights. The name was threaded; the content was not.

     The folder now carries its own reading, count and framing, so the screen
     after a choice is about the thing that was chosen. */
  const folder = findFolder(params.get('folder'));

  /* THE TERM ABOUT TO BE RE-ATTEMPTED, NOT THE FIRST UNRESOLVED ONE IN THE
     LIST. This scanned `outcomes` for the earliest skipped-or-missed entry —
     but `skip()` settles a term the moment it is skipped, so the scan returns
     whichever term was abandoned FIRST, while "Explain out loud" below routes
     to `/recall/idle`, which reads the live `termIndex`.

     Skip term 1, pass 2 and 3, miss 4 to the reveal, tap Revise now: the screen
     read about term 1 and the retry quizzed term 4. `sprint-context.md` calls
     this screen "the difference between a test and an ambush", and two sources
     for "which term" is how it became the ambush.

     `session.term` is the one source the loop itself uses. */
  const term: ScriptedTerm = session.term;

  if (folder) {
    return (
      <LessonScreen
        eyebrow="World history"
        title={folder.title}
        /* The folder's own count, not the session's. They agree on the
           foundations set because that count is read from the script; on the
           others the session has no opinion at all. */
        conceptCount={folder.conceptCount}
        body={folder.reading}
        practiceTopic={folder.title}
        /* ONLY WHERE THERE IS SOMETHING TO PRACTISE. One folder has a scripted
           session; the other two are real reading with no speaking set behind
           them yet. Offering the card anyway would start the foundations
           script under a Cold War heading, which is the incoherence this
           screen exists to end — so the card is absent rather than lying, the
           rule every other control in this build follows.

           See `lib/recall/folders.ts` for why only one set is scripted. */
        onExplainOutLoud={folder.hasSession ? goTo('idle') : undefined}
        /* The way on when there is no set behind this folder. */
        onBrowseFolders={folder.hasSession ? undefined : () => router.push('/entry/folders')}
        /* Back to the shelf, because that is where this was opened from.
           `summary` is right only for the after-a-miss path below — from a
           folder it would show the summary of a session that never ran. */
        onBack={() => router.push('/entry/folders')}
      />
    );
  }

  return (
    <LessonScreen
      eyebrow="World history"
      title={term.title}
      conceptCount={session.termCount}
      body={term?.modelAnswer}
      practiceTopic={SESSION_FOLDER.title}
      /* Straight back into the loop, at the term they are revising. `advance()`
         is not right here — nothing was answered; this restarts the reading. */
      onExplainOutLoud={goTo('idle')}
      onBack={() => go('summary')}
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
