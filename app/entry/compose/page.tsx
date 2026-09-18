'use client';

/* The composer with Explain out loud attached.

   TWO FIGMA FRAMES, ONE ROUTE. The prototype walks `selecting explain feature`
   (chip attached, field empty) → `choosing chip` (the same screen with the
   topic in the field) on a tap of the composer, then on to `explain out ready`.
   The two frames differ only by what is in the field, so the difference is
   state rather than a second route — and the tap that fills it is how this
   prototype mocks typing, exactly as Figma's own prototype does. */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ComposeScreen } from '../../../components/screens/RecallScreens/RecallScreens';

/* What the student "types". Figma writes "World History/" with the caret; the
   set the session actually runs is world history, so the two agree. */
const TOPIC = 'World history';

export default function Page() {
  const router = useRouter();
  const [value, setValue] = useState('');

  return (
    <ComposeScreen
      value={value}
      onFill={() => setValue(TOPIC)}
      onSend={() => router.push('/entry/ready')}
      /* Taking the chip off drops back to a plain chat, which this prototype
         does not have — so it returns to the front door rather than to a screen
         that is not built. */
      onClearFeature={() => router.push('/entry')}
      onBack={() => router.push('/entry')}
    />
  );
}
