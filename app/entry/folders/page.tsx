'use client';

/* The second way in. Both paths end at the same place: a set of concepts and
   the orb.

   THIS SCREEN USED TO BE CONTENT-BLIND. Three different promises led here —
   Home's "Chemistry prep" chip, the ready card's "World history foundations",
   and a direct visit — and all three drew the same hardcoded heading over the
   same three folders. Then `onOpen` threw away which folder was tapped and
   pushed a bare `/recall/lesson`, so the tap that reached the screen and the
   tap that left it were both discarded.

   Both ends now carry an identity. `?topic=` is what the student asked for and
   becomes the heading; `?folder=` is what they picked and travels on to the
   lesson. A query string rather than session state on purpose: `/entry/*` sits
   outside the recall provider and starts no session, so there is nothing here
   to hold it in — and a folder identity that survives a shared link is the
   honest shape for "which folder am I looking at". */

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FoldersScreen } from '../../../components/screens/RecallScreens/RecallScreens';

function Folders() {
  const router = useRouter();
  const params = useSearchParams();

  /* Undefined rather than empty, so the screen falls back to its own default
     heading when nobody said what they came for. */
  const topic = params.get('topic') ?? undefined;

  return (
    <FoldersScreen
      title={topic}
      /* The folder's concepts — the lesson screen, which already exists and is
         the same `detailed page` shape Figma draws for a folder. It reads the
         session to decide what to show, which is right when it is reached
         after a miss and wrong when it is reached from here, so the folder's
         own name is passed and the lesson prefers it. */
      onOpen={(folder) =>
        router.push(`/recall/lesson?folder=${encodeURIComponent(folder)}`)
      }
      /* The way out of an empty shelf. `/entry/compose` is where a set gets
         made, which is the one thing that fills this screen. The prototype's
         folder list is a fixture and never actually empties, so this is only
         reached from the story — but the state is now something the screen can
         be asked for rather than something it cannot express. */
      onCompose={() => router.push('/entry/compose')}
      onBack={() => router.push('/entry')}
    />
  );
}

/* `useSearchParams` opts a route into client-side rendering, and every route
   here is prerendered — without the boundary the build fails outright. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Folders />
    </Suspense>
  );
}
