'use client';

/* Knowie builds the set, then offers it. Tapping the card opens the set's
   lesson — the last look before the session.

   It is also where the summary's "Try again" lands. */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExplainEntryScreen,
  type ExplainEntryPhase,
} from '../../../components/screens/RecallScreens/RecallScreens';

/* Mocked latency, like the judge's — named constants with a comment saying
   so, not motion tokens, because these are how long a model would take, not
   design values.

   COMPOSING_MS stands in for the click Figma's prototype uses to leave the
   composing frame; there is nothing for the student to click there, so the
   build waits instead. READY_MS is Figma's own: `explain out ready`
   (16307:8573) moves to 16307:11255 after 0.8s. */
const COMPOSING_MS = 1200;
const READY_MS = 800;

export default function Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<ExplainEntryPhase>('composing');

  useEffect(() => {
    const a = setTimeout(() => setPhase('ready'), COMPOSING_MS);
    const b = setTimeout(() => setPhase('settled'), COMPOSING_MS + READY_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, []);

  return (
    <ExplainEntryScreen
      phase={phase}
      /* THE CARD OPENS THE LESSON. The redesign drops the folder shelf: the
         card goes straight to the set's lesson details, and the lesson's
         "Explain out loud" starts the session. */
      onStart={() => router.push('/recall/lesson?from=ready')}
      onBack={() => router.push('/entry')}
    />
  );
}
