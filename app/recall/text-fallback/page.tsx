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

/* Sent sits for a beat before the judge takes it. Mocked latency, like the
   judge's — a named constant, not a motion token. */
const SENT_MS = 450;

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  /* WHAT THE STUDENT TYPES, FOR REAL. Not session state: a reload should open
     on an empty box rather than resume a half-written answer. The judge is
     still scripted — `answerByText()` judges the rung's clean take — so the
     words do not change the verdict, which is the mock this prototype is. */
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const id = setTimeout(() => go(session.answerByText()), SENT_MS);
    return () => clearTimeout(id);
    /* `go` and `session` are fresh each render; the timer is keyed to the
       send, which happens once. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent]);

  return (
    <TextFallbackScreen
      prompt={session.term.question}
      value={value}
      onChange={setValue}
      sent={sent}
      onSend={() => {
        if (value.trim()) setSent(true);
      }}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onUseVoice={goTo('idle')}
      /* NOT OFFERED ON THE TURN REACHED FROM THE REVEAL. The reveal says saying
         it back is required, and `skip()` would overwrite the settled miss
         with `skipped: true`. The ✕ still leaves. */
      onSkip={session.rung === 'reveal' ? undefined : () => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
