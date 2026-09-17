'use client';

import { ExitOverlay } from '../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from './session';

/**
 * Renders the exit sheet over whichever recall route is showing.
 *
 * It lives beside the provider in `app/recall/layout.tsx` because that is the
 * only thing every recall route shares — which is exactly what the sheet needs:
 * the turn the student is leaving stays mounted underneath it. Pushing a route
 * instead would unmount that turn and dim an empty page.
 *
 * A thin client wrapper so the layout itself can stay a server component.
 */
export function ExitOverlayHost() {
  const session = useRecallSession();
  const { go } = useRecallNav();

  return (
    <ExitOverlay
      open={session.exitOpen}
      onKeepGoing={session.dismissExit}
      onLeave={() => go(session.saveAndLeave())}
    />
  );
}
