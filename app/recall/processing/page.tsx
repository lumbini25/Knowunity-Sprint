'use client';

/* The judge runs HERE, not on the take screen.

   `submit()` is what consumes the rung and computes the verdict, and calling
   it during the wait is what makes the wait mean something: the 2.6s is the
   judge working, not a decorative pause in front of a decision already made.
   Its return value is the destination — result, misheard, no-audio or reveal —
   so this route holds, then goes wherever the verdict says. */

import { ProcessingScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { JUDGE_LATENCY_MS } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
  const { go } = useRecallNav();

  return (
    <ProcessingScreen
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      holdMs={JUDGE_LATENCY_MS}
      onDone={() => go(session.submit())}
      onExit={session.requestExit}
    />
  );
}
