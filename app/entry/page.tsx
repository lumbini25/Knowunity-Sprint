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
      /* The other way in: something already studied, straight to its concepts. */
      onOpenFolder={() => router.push('/entry/folders')}
    />
  );
}
