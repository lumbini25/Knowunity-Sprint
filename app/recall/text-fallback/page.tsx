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

import { useEffect, useState } from 'react';
import { TextFallbackScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { isContestable, isSilent } from '../../../lib/recall/script';

/* The answer "types itself" for a beat before it can be sent, and sits sent
   for a beat before the judge takes it. Mocked latency, like the ready card's
   and the judge's — named constants with a comment saying so, not motion
   tokens, because no motion scale exists and neither is a design value. */
const TYPING_MS = 1100;
const SENT_MS = 450;

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  /* THE TURN HAS THREE BEATS AND THEY ARE NOT SESSION STATE. Which beat is on
     screen matters for exactly as long as this screen does; a reload should
     start the typing again rather than resume it half-written. Same call the
     mic primer's sheet makes. */
  const [state, setState] = useState<'Typing' | 'Ready' | 'Sent'>('Typing');

  useEffect(() => {
    const id = setTimeout(() => setState('Ready'), TYPING_MS);
    return () => clearTimeout(id);
  }, []);

  /* Sent hands over to the judge after its beat. `answerByText()` is the same
     submission as the take screen's, with the two microphone questions
     dropped — see the note above. */
  useEffect(() => {
    if (state !== 'Sent') return;
    const id = setTimeout(() => go(session.answerByText()), SENT_MS);
    return () => clearTimeout(id);
    /* `go` and `session` are fresh each render; the timer is keyed to the beat,
       which changes once. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  /* WHAT THE STUDENT "TYPED" IS THE SCRIPT'S OWN CLEAN TAKE, not a fixture.
     The route passed no answer at all, so every typed turn showed the
     component's default — "Neolithic settelment is" — under a World War II
     question. The clean take is the one `answerByText()` will actually judge,
     so the words on screen and the words being marked are the same words. */
  const clean = session.rungScript?.takes.find((t) => !isSilent(t) && !isContestable(t));
  const typed = (clean ?? session.take)?.transcript.replace(/^"|"$/g, '');

  return (
    <TextFallbackScreen
      prompt={session.term.question}
      answer={typed}
      state={state}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onSend={() => setState('Sent')}
      onUseVoice={goTo('idle')}
      /* NOT OFFERED ON THE TURN REACHED FROM THE REVEAL. The reveal states that
         saying it back is required rather than offered, and both of its paths
         land here or on `recording` — so a skip on either one is the tap past
         the answer the reveal says does not exist.

         It also mislabels the student. By the time the reveal is on screen the
         term is already settled as missed; `session.skip()` overwrites that
         outcome by termId with `skipped: true`, so somebody who read the whole
         model answer and only declined to repeat it lands in the summary's
         review list under the same heading as a term they never opened.

         Nobody is trapped, which is what sprint-context.md's "skip on every
         turn" is for: the header's ✕ still leaves the session, and both ways
         forward remain. What is gone is the one that quietly rewrites what
         happened. */
      onSkip={session.rung === 'reveal' ? undefined : () => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
