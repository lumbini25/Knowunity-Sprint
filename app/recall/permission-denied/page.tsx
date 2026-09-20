'use client';

/* The dead end the brief says we cannot afford, so neither control here is
   decorative: one goes forward without a microphone, the other says how to get
   one back.

   SCAFFOLDING, NOT A LIVE STATE — a decision, not an oversight. Nothing in
   this mocked prototype calls a real permission API, so there is no genuine
   "the OS denied the mic" event anywhere in the session to route from; the
   loop has no way to arrive here honestly. The screen stays built, real, and
   reachable by URL and Storybook so the design exists and is auditable — see
   sprint-context.md, "Not building" — but it is not in `Destination`, and
   `onMicEnabled` below only navigates rather than granting anything, for the
   same reason `/recall/permission-sheet` does: there is no session here to
   grant against. */

import { useRouter } from 'next/navigation';
import { PermissionDeniedScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return (
    <PermissionDeniedScreen
      onUseText={() => router.push('/recall/text-fallback')}
      /* "Enable microphone" cannot open iOS Settings from a web prototype, and
         for once that is not only a prototype limit: even in the real app the
         switch lives in Settings, so the button's honest job is to say where
         and then take the student back. The screen raises the sheet itself;
         this route only says where "I've turned it on" lands.

         That closes a real hole rather than a fake one. Before this, the denied
         screen had NO path back to voice at all — a student who went and
         enabled the mic came back to a screen whose only button was "Type
         instead". */
      onMicEnabled={() => router.push('/recall/idle')}
    />
  );
}
