'use client';

/* The app's front door. Every other screen in this prototype assumed a session
   was already running; this is where one gets chosen.

   NO SESSION PROVIDER HERE. `/entry` sits outside `app/recall/`, so it reads no
   session. A topic row seeds one in storage with `startSessionAt` and the
   provider picks it up when the first recall route mounts — see that function
   for why it is not a call into the provider. */

import { useRouter } from 'next/navigation';
import { HomeScreen } from '../../components/screens/RecallScreens/RecallScreens';
import { SESSION } from '../../lib/recall/script';
import { startSessionAt } from '../../lib/recall/session';

/* The rows are the session's own terms, so every row leads to a question the
   loop can ask — the design owner's call over Figma's four labels. */
const TOPICS = SESSION.map((t) => ({ title: t.title, kind: t.kind }));

export default function Page() {
  const router = useRouter();

  return (
    <HomeScreen
      topics={TOPICS}
      /* THE TAP CARRIES WHICH TERM. Recall starts on the row the student
         chose, not on term 1. */
      onSelectTopic={(index) => {
        startSessionAt(index);
        router.push('/recall/idle');
      }}
      onExplainOutLoud={() => router.push('/entry/compose')}
      /* The chat box opens the same composer — Figma's prototype sends a tap
         on this frame there. */
      onOpenChat={() => router.push('/entry/compose')}
      /* The rail's other two features. One screen each, and both end back
         here. */
      onQuiz={() => router.push('/entry/quiz')}
      onSummarize={() => router.push('/entry/summarize')}
    />
  );
}
