'use client';

/* The screen lives in components/screens/RecallScreens so the route and the
   Storybook story render the exact same component. The route's whole job is to
   read the session and turn its destinations into navigation — the screen
   itself never touches the context, which is what keeps it renderable in
   Storybook, where no provider exists.

   A NEW STUDENT IS ASKED FOR THE MICROPHONE BEFORE THE FIRST QUESTION.
   `reference/Voice_UX.md` lists the primer as a Must — "first-encounter
   screen" — and it was built, and nothing reached it: `/recall/permission-
   primer` existed but only the dev index linked it, so the ask never happened
   in the flow. It happens here because this is the first screen that wants the
   microphone, and asking anywhere earlier would be asking before the reason is
   on screen.

   IT IS THE SAME ROUTE, NOT A REDIRECT. Pushing to the primer and back would
   put two entries in history between the lesson and the first question, so
   "back" would walk the student through a permission dialog they have already
   answered. Rendering it in place keeps `/recall/idle` meaning "the first
   turn", whichever half of it is currently on screen — the same reasoning
   `exitOpen` uses for the exit sheet. */

import { useState } from 'react';
import {
  IdleScreen,
  PermissionPrimerScreen,
} from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';

export default function Page() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();

  /* The primer's two beats. Not session state: which half of the primer is on
     screen matters for exactly as long as the primer does, and a reload part
     way through should start the ask again rather than resume it mid-sentence. */
  const [sheetUp, setSheetUp] = useState(false);

  if (!session.micGranted) {
    return (
      <PermissionPrimerScreen
        onStart={() => setSheetUp(true)}
        showSheet={sheetUp}
        /* No dismiss. Figma's sheet has no ✕, and both answers to the question
           are on the sheet: Allow, or type instead. */
        /* Allow records the ask and falls through to the turn below — no
           navigation, because this is already the right route. */
        onAllow={session.grantMic}
        /* The opt-out is never a dead end: the whole ladder is playable by
           typing, which is the text fallback's reason for existing. */
        onUseText={goTo('text-fallback')}
      />
    );
  }

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
