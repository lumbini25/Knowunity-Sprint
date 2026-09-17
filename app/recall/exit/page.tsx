'use client';

/* The ✕'s destination, and the last dead control in the prototype.

   `router.back()` rather than a route, for both ways of staying: the student
   came from a turn and should return to exactly that turn, which only history
   knows. Pushing somewhere named would guess.

   Leaving goes through `saveAndLeave()`, which settles the term in flight as
   skipped and moves the index on, so resuming later starts the NEXT term
   rather than dropping the student back into the one they walked away from. */

import { useRouter } from 'next/navigation';
import { ExitScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go } = useRecallNav();
  const router = useRouter();

  return (
    <ExitScreen
      onKeepGoing={() => router.back()}
      onLeave={() => go(session.saveAndLeave())}
    />
  );
}
