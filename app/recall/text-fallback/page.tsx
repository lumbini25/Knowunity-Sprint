'use client';

/* The text path runs the identical ladder and the identical hints as voice —
   the denied screen promises answers are recorded the same way, and the
   mastery number has to mean one thing. So sending here goes to the judge
   exactly as Continue does on the take screen. */

import { TextFallbackScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <TextFallbackScreen
      prompt={session.term.question}
      onSend={goTo('processing')}
      onUseVoice={goTo('idle')}
      onSkip={() => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
