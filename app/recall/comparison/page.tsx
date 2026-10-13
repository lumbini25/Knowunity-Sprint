'use client';

/* What Knowie would have said, beside what the student actually said.

   REACHED TWO WAYS.
   - From a summary row (`?term=<id>`): one term's detail — the "Tap any topic
     to play back what you said and read the full answer" the summary promises.
     Next walks to the next term's detail, then back to the summary; Try again
     starts that term fresh; ✕ closes back to the summary.
   - From the wrong ending, with no `term`: the term just missed. Next moves on
     through the session; Try again goes back into the loop. */

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ComparisonScreen } from '../../../components/screens/RecallScreens/RecallScreens';
import { useRecallSession, useRecallNav } from '../../../lib/recall/session';
import { SESSION } from '../../../lib/recall/script';

/* The full answer as the sentences it is made of — "read the full answer",
   one checked point each. */
function points(answer: string): string[] {
  return answer.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function Comparison() {
  const session = useRecallSession();
  const { go, goTo } = useRecallNav();
  const router = useRouter();
  const termId = useSearchParams().get('term');

  if (termId) {
    const at = session.outcomes.findIndex((o) => o.termId === termId);
    const outcome = session.outcomes[at];
    const index = SESSION.findIndex((t) => t.id === termId);
    const term = SESSION[index] ?? session.term;
    const next = session.outcomes[at + 1];
    const unaided = outcome?.passedAt === 'attempt1';

    return (
      <ComparisonScreen
        question={term.question}
        answerPoints={points(term.modelAnswer)}
        /* `null`, never undefined — see the prop: undefined would let the
           screen's fixture speak for a skipped term. */
        transcript={outcome?.transcript ?? null}
        tag={unaided ? null : outcome?.skipped ? 'Skipped' : 'Previous mistake'}
        onNext={() =>
          router.push(next ? `/recall/comparison?term=${encodeURIComponent(next.termId)}` : '/recall/summary')
        }
        /* That term, fresh — not the whole set. */
        onTryAgain={() => go(session.startAt(Math.max(0, index)))}
        onExit={() => router.push('/recall/summary')}
        exitLabel="Close"
      />
    );
  }

  return (
    <ComparisonScreen
      question={session.term.question}
      answerPoints={points(session.term.modelAnswer)}
      transcript={session.verdict?.transcript ?? null}
      onNext={() => go(session.advance())}
      /* BACK INTO THE LOOP — the prototype wires this screen's second exit to
         `idle`: a student who has just read what they missed can try it. */
      onTryAgain={goTo('idle')}
      onExit={session.requestExit}
    />
  );
}

/* `useSearchParams` needs a boundary on a prerendered route. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <Comparison />
    </Suspense>
  );
}
