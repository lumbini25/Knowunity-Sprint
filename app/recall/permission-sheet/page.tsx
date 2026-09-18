'use client';

/* The second beat of the permission primer: the sheet that actually asks. Same
   component as the primer route, with the sheet raised.

   `useRouter` rather than `useRecallNav` — see the primer route: this happens
   before the session exists. "Allow" is where the loop actually begins. */

import { useRouter } from 'next/navigation';
import { PermissionPrimerScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return (
    <PermissionPrimerScreen
      showSheet
      /* Granted. Straight into the first term — the primer never returns. */
      onAllow={() => router.push('/recall/idle')}
      /* The opt-out, as easy as the opt-in. Voice_UX principle 3.

         AND IT IS THE ONLY WAY OUT, deliberately. There was a ✕ on the sheet
         wired back to the priming beat; Figma draws no ✕, and the sheet reads
         better without one — a dismissal is a third answer to a two-answer
         question, and the student who does not want the mic has "Type
         instead" sitting right there, which is a decision rather than a
         retreat. */
      onUseText={() => router.push('/recall/text-fallback')}
    />
  );
}
