'use client';

/* The screen itself lives in components/screens/RecallScreens so the route and
   the Storybook story render the exact same component.

   SCAFFOLDING, NOT THE DOOR — a decision, not an oversight. This route and
   `/recall/permission-sheet` duplicate a flow the loop already runs for real:
   `/recall/idle` raises this exact primer inline, over local component state,
   the first time a session actually needs the mic. That inline version is the
   one a student taps through; this standalone pair exists only so the state
   can be opened directly by URL and viewed in Storybook without stepping
   through a session first. Neither is in `Destination`, and neither should
   be: wiring them in would give the loop two live primers answering the same
   question. See sprint-context.md, "Not building". */

import { useRouter } from 'next/navigation';
import { PermissionPrimerScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return <PermissionPrimerScreen onStart={() => router.push('/recall/permission-sheet')} />;
}
