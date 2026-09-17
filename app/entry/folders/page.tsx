'use client';

/* The second way in. Both paths end at the same place: a set of concepts and
   the orb. */

import { useRouter } from 'next/navigation';
import { FoldersScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return (
    <FoldersScreen
      /* The folder's concepts — the lesson screen, which already exists and is
         the same `detailed page` shape Figma draws for a folder. */
      onOpen={() => router.push('/recall/lesson')}
      onBack={() => router.push('/entry')}
    />
  );
}
