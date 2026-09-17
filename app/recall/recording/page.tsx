'use client';

/* The screen lives in components/screens/RecallScreens so the route and the
   Storybook story render the exact same component. This route reads the
   session and turns destinations into navigation; the screen stays pure.

   The route is `recording` because that is what session.Destination and
   SPEC.md call it. Figma calls the screen "Listening", and so does the orb's
   caption — the three names are reconciled in design-system.md rather than
   churned here. */

import { ListeningScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <ListeningScreen
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onSend={goTo('answer-sent')}
      onTypeAnswer={goTo('text-fallback')}
      onSkip={() => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
