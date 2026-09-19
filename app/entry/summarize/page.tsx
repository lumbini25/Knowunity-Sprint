'use client';

/* The rail's Summarize chip, which used to lead nowhere.

   ONE SCREEN. Figma's `Ai Chat/ Quiz` (13499:3850) draws Summarize as a chat
   turn — the student's question, Knowie's answer, and the key term called out
   of it — so that is what this is. There is no compose step in front of it:
   the rail chip is the ask, and the answer is already on screen, which is the
   same shape `/entry/ready` uses for Explain out loud.

   The header's menu control goes back, the way every other entry screen's
   does. */

import { useRouter } from 'next/navigation';
import { SummarizeScreen } from '../../../components/screens/RecallScreens/RecallScreens';

export default function Page() {
  const router = useRouter();

  return (
    <SummarizeScreen
      onBack={() => router.push('/entry')}
      /* No `onHistory`. It would draw a "History" control that goes to the
         front door — the same mislabel the leading control just stopped
         making. Unwired, the bar draws the glyph as an image, which is the
         honest rendering of chrome with no destination in a prototype. */
      /* Drawn, and deliberately inert beyond being pressable: this prototype
         records no feedback anywhere. The thumbs exist in the file and a
         control that cannot be pressed at all would be the worse lie. */
      onFeedback={() => {}}
    />
  );
}
