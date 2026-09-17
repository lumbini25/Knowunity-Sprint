'use client';

/* Knowie has a set ready. Tapping the card is what starts the session — the
   one control in this prototype that turns an idea into a running ladder.

   It is also where the summary's "Try again" lands, which was the last
   unwired control in the build. */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExplainEntryScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { SESSION } from '../../../lib/recall/script';

/* The set is "generated" for a beat before it can be tapped. Mocked latency,
   like the judge's — a named constant with a comment saying so, not a motion
   token, because no motion scale exists and this is not a design value. */
const GENERATING_MS = 900;

export default function Page() {
  const router = useRouter();
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setGenerating(false), GENERATING_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <ExplainEntryScreen
      generating={generating}
      /* The set is the script, so the card is not describing something the
         session will not deliver. */
      setTitle={`World history foundations · ${SESSION.length} concepts`}
      /* THE CARD PICKS A FOLDER, IT DOES NOT START THE LADDER. The end-to-end
         prototype is explicit: `explain out ready -> choose folder screen ->
         detailed page -> idle`. This used to push `/recall/idle` directly,
         which skipped both — the student never chose what they were about to be
         tested on, and never got the last look at it that `sprint-context.md`
         calls "the difference between a test and an ambush". */
      onStart={() => router.push('/entry/folders')}
      onBack={() => router.push('/entry')}
    />
  );
}
