'use client';

/* The screen itself lives in components/screens/RecallScreens so the route and
   the Storybook story render the exact same component.

   `useRouter` rather than `useRecallNav`, deliberately: the permission screens
   happen BEFORE the session starts, so they have no term, no rung and nothing
   to read. `Destination` covers the loop; these two routes are the door. */

import { useRouter } from 'next/navigation';
import { PermissionPrimerScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return <PermissionPrimerScreen onStart={() => router.push('/recall/permission-sheet')} />;
}
