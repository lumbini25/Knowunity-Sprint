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
      /* The opt-out, as easy as the opt-in. Voice_UX principle 3. */
      onUseText={() => router.push('/recall/text-fallback')}
      /* Dismissing the sheet drops back to the priming beat, not out of the
         flow — the student has not said no, only not-yet. */
      onDismissSheet={() => router.push('/recall/permission-primer')}
    />
  );
}
