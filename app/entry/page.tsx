'use client';

/* The app's front door, and the loop's missing first step. Every other screen
   in this prototype assumed a session was already running; this is where one
   gets chosen.

   NO SESSION PROVIDER HERE. `/entry` sits outside `app/recall/`, so it reads no
   session and starts none — the session begins when the student taps the
   Explain out loud card on `/entry/ready`, and the provider mounts with the
   first recall route. */

import { useRouter } from 'next/navigation';
import { HomeScreen } from '../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return (
    <HomeScreen
      onExplainOutLoud={() => router.push('/entry/compose')}
      /* The other way in: something already studied, straight to its concepts.
         THE CHIP'S LABEL TRAVELS WITH THE TAP. It used to push a bare
         `/entry/folders`, which hardcodes its own heading — so the one control
         named after what the student was last doing landed them on a screen
         about something else. The folder screen now takes what it was opened
         for. */
      onOpenFolder={(folder) =>
        router.push(`/entry/folders?topic=${encodeURIComponent(folder)}`)
      }
      /* The rail's other two features. One screen each, and both end back
         here — see the routes for why neither grows a loop. */
      onQuiz={() => router.push('/entry/quiz')}
      onSummarize={() => router.push('/entry/summarize')}
    />
  );
}
