'use client';

/* The screen lives in components/screens/RecallScreens so the route and the
   Storybook story render the exact same component. The route's whole job is to
   read the session and turn its destinations into navigation — the screen
   itself never touches the context, which is what keeps it renderable in
   Storybook, where no provider exists. */

import { IdleScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <IdleScreen
      intro={session.rung === 'attempt1' ? session.term.intro : undefined}
      prompt={session.term.question}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onRecord={goTo('recording')}
      onTypeAnswer={goTo('text-fallback')}
      onSkip={() => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
