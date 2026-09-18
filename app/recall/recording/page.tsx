'use client';

/* The screen lives in components/screens/RecallScreens so the route and the
   Storybook story render the exact same component. This route reads the
   session and turns destinations into navigation; the screen stays pure.

   The route is `recording` because that is what session.Destination and
   SPEC.md call it. Figma calls the screen "Listening", and so does the orb's
   caption — the three names are reconciled in design-system.md rather than
   churned here.

   LISTENING ENDS ITSELF. The orb moves to say "you are speaking and I am
   listening", so it has to stop when the speaking does — otherwise the screen
   keeps making a claim about sound that is no longer arriving, and the student
   is left hunting for a control to prove they finished. The take is handed
   over on silence, exactly as it would be on a device.

   WHERE IT LANDS DEPENDS ON WHETHER THE WORDS CAME BACK. `handOver` asks the
   transcription question — not the judging one, which is processing's job:

     heard cleanly            -> `answer-sent`, which reads the words back
     heard below threshold    -> `misheard`, which asks whether they are right
     nothing heard at all     -> `no-audio`

   Sending a bad transcript to "answer sent" would read it back as though it
   had been captured, and ask the student to confirm words they were never
   really given. Neither failure branch consumes the rung.

   The tap is kept, and now means "send now" rather than "send at all": it goes
   through the same branch, so nobody is ever waiting on the mock. */

import { useEffect, useState } from 'react';
import { ListeningScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { SPEAKING_MS, SILENCE_MS } from '../../../lib/recall/script';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();
  const send = () => go(session.handOver());

  /* Two beats, because stopping is two events: the speaking, then the silence
     that is read as its end. `talking` drives the waveform and the orb, so
     flipping it is what the student actually sees stop. */
  const [talking, setTalking] = useState(true);

  useEffect(() => {
    const stop = setTimeout(() => setTalking(false), SPEAKING_MS);
    return () => clearTimeout(stop);
  }, []);

  useEffect(() => {
    if (talking) return;
    const handOver = setTimeout(send, SILENCE_MS);
    return () => clearTimeout(handOver);
    /* `send` is a fresh closure each render; the timer is keyed to `talking`,
       which changes once. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talking]);

  return (
    <ListeningScreen
      talking={talking}
      progress={(session.termIndex / session.termCount) * 100}
      progressText={`${session.termIndex + 1} of ${session.termCount}`}
      onSend={send}
      onTypeAnswer={goTo('text-fallback')}
      onSkip={() => go(session.skip())}
      onExit={session.requestExit}
    />
  );
}
