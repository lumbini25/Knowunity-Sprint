'use client';

/* The dead end the brief says we cannot afford, so neither control here is
   decorative: one goes forward without a microphone, the other says how to get
   one back.

   A LIVE STATE NOW, NOT SCAFFOLDING. This route used to be reachable only by
   URL, because nothing in the prototype asked the browser for the mic — there
   was no real "no" to route from. The primer's Allow now fires the browser's
   own prompt (`lib/recall/mic.ts`), and blocking it lands here.

   "I'VE TURNED IT ON" ASKS AGAIN. A browser, like iOS, only prompts once: once
   the student blocks the mic, asking again answers "denied" without showing
   anything, until they change it in settings. So the button checks — if the
   mic is on now, the turn opens; if it is still off, the sheet says so instead
   of the tap quietly doing nothing. */

import { useState } from 'react';
import { PermissionDeniedScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { askForMic } from '../../../lib/recall/mic';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();
  const [stillBlocked, setStillBlocked] = useState(false);

  return (
    <PermissionDeniedScreen
      onUseText={goTo('text-fallback')}
      onMicEnabled={async () => {
        const answer = await askForMic();
        if (answer === 'denied') {
          setStillBlocked(true);
          return;
        }
        session.grantMic();
        go('idle');
      }}
      stillBlocked={stillBlocked}
    />
  );
}
