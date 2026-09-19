'use client';

/* The rail's Quiz chip, which used to lead nowhere.

   ONE QUESTION, AND THEN BACK. `sprint-context.md` scopes no quiz loop, so
   this is the single screen Figma's `Ai Chat/ Quiz` (13499:3851) draws and
   nothing behind it — the question, the two answers, the verdict, and a way
   on. "Continue" returns to the front door rather than dealing a second
   question, because a second question is a feature and this is a pattern.

   NO SESSION HERE. `/entry/*` sits outside the recall provider, so the
   answered state is local to the screen. Nothing about a quiz answer belongs
   in the recall session — that session is about explaining out loud, and
   mixing the two would put quiz outcomes in the recall summary. */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuizScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();
  const [chosen, setChosen] = useState<number | null>(null);

  return (
    <QuizScreen
      chosen={chosen}
      onAnswer={setChosen}
      /* Both ways out lead home. "Why?" would open Knowie's explanation, which
         is the summarize screen's job rather than a second quiz state — so it
         goes there, carrying nothing, since the question is a fixture. */
      onWhy={() => router.push('/entry/summarize')}
      onContinue={() => router.push('/entry')}
      onExit={() => router.push('/entry')}
      onFeedback={() => {}}
    />
  );
}
