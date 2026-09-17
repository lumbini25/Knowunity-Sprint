'use client';

/* The composer with Explain out loud attached. One screen, two Figma frames —
   `selecting explain feature` and `choosing chip` differ only by what is in the
   field. */

import { useRouter } from 'next/navigation';
import { ComposeScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return (
    <ComposeScreen
      onSend={() => router.push('/entry/ready')}
      /* Taking the chip off drops back to a plain chat, which this prototype
         does not have — so it returns to the front door rather than to a screen
         that is not built. */
      onClearFeature={() => router.push('/entry')}
      onBack={() => router.push('/entry')}
    />
  );
}
