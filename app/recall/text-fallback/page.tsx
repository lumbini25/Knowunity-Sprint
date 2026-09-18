'use client';

/* The text path runs the identical ladder and the identical hints as voice —
   the denied screen promises answers are recorded the same way, and the
   mastery number has to mean one thing. So sending here goes to the judge
   exactly as Continue does on the take screen.

   IT USED TO LAND ON "WE DIDN'T CATCH ANYTHING". Send pushed straight to
   `processing`, which runs the plain `submit()` — and `submit()` still asks the
   two microphone questions first: was anything heard, and was it heard well.
   One term in the script opens on a silent take and another on a garbled one,
   so a student who typed a full answer on either was told the app heard
   nothing, on the one screen that exists because they could not speak. The
   ladder was never reached, and neither were rating and summary.

   `answerByText()` is the same submission with those two questions dropped,
   because neither can be true of something typed. Everything after is shared:
   same rungs, same hints, same verdicts, same settle. */

import { TextFallbackScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  return (
    <TextFallbackScreen
      prompt={session.term.question}
      onSend={() => go(session.answerByText())}
      onUseVoice={goTo('idle')}
      onSkip={() => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
