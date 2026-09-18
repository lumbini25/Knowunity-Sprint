import type { ReactNode } from 'react';

/**
 * The scripted session.
 *
 * There is no speech-to-text and no judge. This file is the contract that
 * replaces them, per SPEC.md: "Each term carries a fixed script — a pre-written
 * transcript and a fixed verdict per round, advanced by tapping send. A
 * deterministic session makes every state reachable on a known path and demos
 * the same way twice."
 *
 * CONTENT IS A DRAFT. sprint-context.md lists hint authoring as still open. The
 * voice is taken from the one term Figma works through in full (`hint ladder`,
 * node 15833:9103, "historical thinking"): an analogy, then the analogy
 * explained, then the missing concept named — never the answer itself.
 */

/* ------------------------------------------------------------------ */
/* The ladder                                                          */
/* ------------------------------------------------------------------ */

/**
 * The five rungs the `hints` ladder draws. Four are attempts; `reveal` is where
 * a term ends when all four miss.
 */
export type Rung = 'attempt1' | 'hint1' | 'hint2' | 'hint3' | 'reveal';

export const RUNGS: Rung[] = ['attempt1', 'hint1', 'hint2', 'hint3', 'reveal'];

/** The ladder's own labels, in rung order. */
export const RUNG_LABELS: Record<Rung, string> = {
  attempt1: 'Attempt 1',
  hint1: 'Hint 1',
  hint2: 'Hint 2',
  hint3: 'Hint 3',
  reveal: 'Reveal',
};

/**
 * What a pass is worth at each rung.
 *
 * A pass on the first attempt and a pass after three hints must not read the
 * same number: the summary counts terms "explained unaided", and that count is
 * only meaningful if the score records how much help was taken. `reveal` scores
 * nothing — reading the answer back is not a recall.
 */
/**
 * THE SCORE IS A DIAGNOSIS, NOT A GRADE — how much of the concept the answer
 * covered, and nothing about how much help it took.
 *
 * This used to be `SCORE_BY_RUNG`: 100 / 85 / 70 / 55, fifteen points docked
 * per hint. That is a mark, and a punitive one, on a feature whose whole
 * purpose is to offer hints — it teaches students to refuse them. It also
 * contradicted `sprint-context.md`, which says the summary shows a count
 * "because a count states what the student did rather than converting it into
 * a mark," while every verdict card converted it into a mark four times a term.
 *
 * The judge returns a per-concept rubric, so the number comes from the rubric:
 * the share of the concept's points the answer actually covered. Figma's own
 * 65% on term 2 is 2 points of 3 — it was always coverage, never a grade.
 *
 * TAKING A HINT COSTS NOTHING. Passing on hint 3 with every point covered is
 * 100%, the same as passing unaided. How much help was needed is still
 * recorded — `passedAt` carries it, and the summary's Hinted / Perfect split
 * reports it — but as a fact about the session, not as a deduction.
 */
export function scoreFromRubric(take: Pick<ScriptedTake, 'got' | 'stillMissing' | 'verdict'>): number | null {
  const got = take.got?.length ?? 0;
  const missing = take.stillMissing?.length ?? 0;
  const total = got + missing;
  if (total > 0) return Math.round((got / total) * 100);
  /* No rubric on this take. A pass covered the concept; anything else has no
     coverage to report, and inventing one would be the grade coming back. */
  return take.verdict === 'Correct' ? 100 : null;
}

/**
 * Below this, the misheard control appears. A confidence rule generalises where
 * a per-term flag does not.
 */
export const CONFIDENCE_THRESHOLD = 0.6;

/**
 * How long the processing screen holds before the verdict lands.
 *
 * This is MOCKED LATENCY, not a design motion value — it stands in for the
 * STT + judge round-trip the brief targets at under 4s, the same way the 342px
 * keyboard reserve stands in for device chrome. Both are literals with a reason
 * rather than tokens, because there is nothing in `tokens/tokens.json` they
 * could come from and inventing a motion token to hold a fake network call
 * would be inventing the wrong thing.
 *
 * The real motion — the orb's pulse, the card's reveal — stays unbuilt until a
 * motion scale exists. See design-system.md, Gaps.
 */
export const JUDGE_LATENCY_MS = 2600;

/**
 * How long the scripted student speaks for, and the pause that ends it.
 *
 * THE ORB'S MOVEMENT IS THE CLAIM, SO IT HAS TO STOP. A moving orb says "you
 * are speaking and I am listening"; if it keeps moving until the student taps
 * it, the screen is asserting something about sound that stopped arriving
 * seconds ago. So listening ends the way it does on a device — the take is
 * handed over when the speaking does.
 *
 * Two values because the transition is two events, not one: the speaking, and
 * the silence that is read as the end of it. Showing the silence briefly is
 * what makes the send legible as a consequence rather than a jump cut.
 *
 * Mocked latency, like `JUDGE_LATENCY_MS`, not design motion — there is no
 * speech detection here and nothing in `tokens/tokens.json` these could come
 * from. Tapping the orb still sends immediately, so the student is never
 * waiting on the mock.
 */
export const SPEAKING_MS = 3200;
export const SILENCE_MS = 700;

/* ------------------------------------------------------------------ */
/* Shape                                                               */
/* ------------------------------------------------------------------ */

export type Verdict = 'Correct' | 'Partial' | 'Wrong';

/**
 * One recording at one rung.
 *
 * A rung can hold more than one take, because two things cost the student
 * nothing and so must not consume a rung:
 *   confidence === 0            nothing was heard at all
 *   confidence < THRESHOLD      heard badly — the misheard control appears
 * Both leave the rung where it is and hand the next take to the same rung.
 */
export interface ScriptedTake {
  transcript: string;
  /** 0 = nothing heard. Below CONFIDENCE_THRESHOLD = contestable. */
  confidence: number;
  verdict: Verdict;
  /**
   * Overrides the rubric. Figma draws 65% on term 2's first attempt where the
   * rubric computes 67 (2 points of 3); the file's number wins where it is
   * explicit. Leave it off and the score comes from `got` / `stillMissing`.
   */
  score?: number;
  /**
   * The Partial breakdown, drawn on `/recall/result` when the verdict is
   * Partial. `partial` (15620:9496) splits the answer in two — what landed,
   * and what is still absent — which is the difference between a partial
   * verdict and a wrong one: something was credited.
   *
   * Only meaningful on a Partial take. Both are capped at three by the card.
   */
  got?: string[];
  stillMissing?: string[];
}

export interface ScriptedHint {
  label: string;
  body: ReactNode;
}

export interface ScriptedRung {
  rung: Rung;
  /** Shown on this rung's screen. `attempt1` has none — it is the unaided try. */
  hint?: ScriptedHint;
  /** Consumed in order. */
  takes: ScriptedTake[];
}

export interface ScriptedTerm {
  id: string;
  /**
   * The term's short name, for the summary's lists.
   *
   * `question` is a ReactNode and a whole sentence; `id` is a slug. Neither
   * reads as a topic in a list, so the name is authored rather than derived.
   */
  title: string;
  /** Knowie's framing line. Attempt 1 only, where Knowie is asking rather than reporting. */
  intro?: ReactNode;
  /** A node, not a string: the app bolds the key term in place. */
  question: ReactNode;
  /** Shown on the reveal rung. */
  modelAnswer: string;
  /** "WHAT WAS MISSING". The card slices at three. */
  missingItems: string[];
  rungs: ScriptedRung[];
}

/* ------------------------------------------------------------------ */
/* The four terms                                                      */
/* ------------------------------------------------------------------ */

/**
 * Four terms, chosen to show recovery rather than only success:
 *   1  a clean pass, first attempt
 *   2  a pass after one hint            — Figma's worked example
 *   3  a low-confidence retry           — the misheard path
 *   4  a full miss through all four     — to the reveal, via nothing-heard
 */
export const SESSION: ScriptedTerm[] = [
  {
    id: 'primary-source',
    title: 'Primary sources',
    intro:
      "Welcome to your study session on world history. Let's start with how historians handle evidence.",
    question: (
      <>
        Could you explain what makes a source a <strong>primary source</strong>, and give an
        example of one?
      </>
    ),
    modelAnswer:
      'A primary source is evidence created at the time of the event by someone connected to it — a letter, a photograph, a treaty, a diary. It has not been filtered through anyone else’s interpretation.',
    missingItems: [
      'Firsthand connection to the event',
      'Created at the time',
      'Not filtered through interpretation',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          {
            transcript:
              '"A primary source is something made at the time by someone who was actually there — like a soldier’s diary from the war, rather than a textbook written about it later."',
            confidence: 0.94,
            verdict: 'Correct',
          },
        ],
      },
      {
        rung: 'hint1',
        hint: {
          label: 'Hint 1',
          body: (
            <>
              Think about the difference between a photograph of a protest and a news article
              describing it a week later. What does the camera have that the writer does not?
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"It\'s a source from the time, I think. Like an old book about the period."',
            confidence: 0.9,
            verdict: 'Partial',
            score: 55,
            got: ['Created at the time'],
            stillMissing: ['Firsthand connection to the event', 'Not filtered through interpretation'],
          },
        ],
      },
      {
        rung: 'hint2',
        hint: {
          label: 'Hint 2',
          body: (
            <>
              The camera was <strong>there</strong>. Nobody stood between the event and the
              record. That closeness is doing the work here.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"A primary source was made at the time by someone who was actually there — a photo, a letter, a diary. Nobody has interpreted it for you."',
            confidence: 0.93,
            verdict: 'Correct',
          },
        ],
      },
      {
        rung: 'hint3',
        hint: {
          label: 'Hint 3',
          body: (
            <>
              You are being asked about two things at once: <strong>when</strong> the record was
              made, and <strong>who</strong> made it. Both have to be true for a source to be
              primary.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"It has to be made at the time, and made by someone connected to the event. Both. A photograph of the protest, not an article about it."',
            confidence: 0.95,
            verdict: 'Correct',
          },
        ],
      },
      /* THE SAY-IT-BACK. The ladder has run out and the term is already
         recorded as missed, but the student reads the answer and says it — and
         the prototype (Prototype page, `reveal --orb--> cancel option -->
         correct-answer`) affirms that. It is judged Correct because they have
         the answer in front of them; it does NOT re-settle the term, so the
         summary still counts the miss. See `settleTake`. */
      {
        rung: 'reveal',
        takes: [
          {
            transcript: '"Said back in my own words, after reading it."',
            confidence: 0.96,
            verdict: 'Correct',
          },
        ],
      },
    ],
  },

  {
    id: 'historical-thinking',
    title: 'Historical thinking',
    question: <>Explain what historical thinking means, in your own words.</>,
    modelAnswer:
      'Historical thinking is the process of critically analyzing evidence to understand the past, rather than just memorizing facts or dates. It involves placing events within their specific context, identifying potential biases, and evaluating multiple perspectives to build a reasoned interpretation.',
    missingItems: [
      'Firsthand connection to the event',
      'Example of a primary source',
      'Distinction from secondary sources',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          {
            transcript:
              '"...context and... being critical of sources. Primary source is available in archives."',
            confidence: 0.55,
            verdict: 'Partial',
            score: 65,
            /* Figma's own breakdown on `partial` (15620:9496) — what the
               answer credited, and what it still owes. */
            got: ['Context and evidence-based thinking', 'Critical source evaluation'],
            stillMissing: ['Building a reasoned interpretation from evidence'],
          },
          /* The clean version of the same answer, handed back when the student
             contests the one above. A contestable take MUST be followed by
             another on the same rung — contesting advances the take without
             advancing the rung, so a rung that ends on a contestable take
             leaves the student with nothing to submit. Terms 3 and 4 pair
             theirs the same way. */
          {
            transcript:
              '"It\'s about context, and being critical of sources. A primary source is available in the archives."',
            confidence: 0.92,
            verdict: 'Partial',
            score: 65,
            /* Figma's own breakdown on `partial` (15620:9496) — what the
               answer credited, and what it still owes. */
            got: ['Context and evidence-based thinking', 'Critical source evaluation'],
            stillMissing: ['Building a reasoned interpretation from evidence'],
          },
        ],
      },
      {
        rung: 'hint1',
        hint: {
          label: 'Hint 1',
          body: (
            <>
              You&rsquo;ve got the sequence idea. But historical thinking goes further than
              ordering events &mdash; it&rsquo;s about <em>interrogating why</em> sources exist
              and what biases they carry.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"It’s not just knowing what happened — it’s asking who wrote the account, why they wrote it, and what they left out. You weigh the evidence in its context instead of taking it at face value."',
            confidence: 0.91,
            verdict: 'Correct',
          },
        ],
      },
      {
        rung: 'hint2',
        hint: {
          label: 'Hint 2',
          body: (
            <>
              Think about the difference between describing what happened and questioning why a
              source was written. Which one requires more critical thought?
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"You look at where the source came from and who made it, and you weigh it up rather than taking it at face value."',
            confidence: 0.94,
            verdict: 'Correct',
          },
        ],
      },
      {
        rung: 'hint3',
        hint: {
          label: 'Hint 3',
          body: (
            <>
              Ask yourself: if two historians describe the same event differently, what would a
              historical thinker do?
              {'\n\n'}
              They&rsquo;d ask <strong>who wrote it, why, and what they might have left out</strong>{' '}
              &mdash; not just what happened.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"It is reading evidence in its context, checking who made it and why, and building an interpretation you can defend."',
            confidence: 0.95,
            verdict: 'Correct',
          },
        ],
      },
      /* THE SAY-IT-BACK. The ladder has run out and the term is already
         recorded as missed, but the student reads the answer and says it — and
         the prototype (Prototype page, `reveal --orb--> cancel option -->
         correct-answer`) affirms that. It is judged Correct because they have
         the answer in front of them; it does NOT re-settle the term, so the
         summary still counts the miss. See `settleTake`. */
      {
        rung: 'reveal',
        takes: [
          {
            transcript: '"Said back in my own words, after reading it."',
            confidence: 0.96,
            verdict: 'Correct',
          },
        ],
      },
    ],
  },

  {
    id: 'neolithic-revolution',
    title: 'The Neolithic Revolution',
    question: (
      <>
        Could you explain what the <strong>Neolithic Revolution</strong> was, and why it marked
        such a turning point for early human societies?
      </>
    ),
    modelAnswer:
      'The Neolithic Revolution was the shift from hunting and gathering to settled farming. Growing food in one place produced a surplus, which allowed permanent settlements, larger populations, and — for the first time — people who did work other than finding food.',
    missingItems: [
      'The shift from foraging to farming',
      'Food surplus as the mechanism',
      'Permanent settlement and specialised work',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          /* Heard badly. The misheard control appears; contesting it costs
             nothing and hands the same rung its clean take. */
          {
            transcript:
              '"Neo... lithic settlement is when people... grew crowds and stopped moving around so much."',
            confidence: 0.38,
            verdict: 'Wrong',
          },
          {
            transcript:
              '"The Neolithic Revolution is when people stopped foraging and started farming. Growing food in one place meant they could settle down, store a surplus, and support more people than a roaming band ever could."',
            confidence: 0.93,
            verdict: 'Correct',
          },
        ],
      },
      {
        rung: 'hint1',
        hint: {
          label: 'Hint 1',
          body: (
            <>
              Picture a group that walks to its food every day, and a group that grows its food
              where it stands. What becomes possible for the second group that was never possible
              for the first?
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"They stopped moving around and started growing crops in one place."',
            confidence: 0.91,
            verdict: 'Partial',
            score: 60,
            got: ['Settling in one place', 'Farming rather than foraging'],
            stillMissing: ['What a surplus made possible'],
          },
        ],
      },
      {
        rung: 'hint2',
        hint: {
          label: 'Hint 2',
          body: (
            <>
              Staying put means you can store more than you eat today. A store of food is a store
              of <strong>time</strong> &mdash; and time is what somebody needs before they can do
              anything other than find the next meal.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"Staying in one place let them store a surplus, and a surplus bought time for people to do work that was not finding food."',
            confidence: 0.93,
            verdict: 'Correct',
          },
        ],
      },
      {
        rung: 'hint3',
        hint: {
          label: 'Hint 3',
          body: (
            <>
              The missing idea is <strong>surplus</strong>. Name what a surplus let people build
              that a day-to-day food supply never could.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"A surplus let people specialise — crafts, trade, writing, government — because not everyone had to spend the day finding food."',
            confidence: 0.95,
            verdict: 'Correct',
          },
        ],
      },
      /* THE SAY-IT-BACK. The ladder has run out and the term is already
         recorded as missed, but the student reads the answer and says it — and
         the prototype (Prototype page, `reveal --orb--> cancel option -->
         correct-answer`) affirms that. It is judged Correct because they have
         the answer in front of them; it does NOT re-settle the term, so the
         summary still counts the miss. See `settleTake`. */
      {
        rung: 'reveal',
        takes: [
          {
            transcript: '"Said back in my own words, after reading it."',
            confidence: 0.96,
            verdict: 'Correct',
          },
        ],
      },
    ],
  },

  {
    id: 'historiography',
    title: 'Historiography',
    question: (
      <>
        What does <strong>historiography</strong> study, and how is it different from studying
        history itself?
      </>
    ),
    modelAnswer:
      'Historiography is the study of how history has been written — which questions each generation asked, which sources it trusted, and how its own moment shaped the account it produced. History studies the past; historiography studies the historians.',
    missingItems: [
      'The writing of history, not the events',
      'How interpretations change over time',
      'The historian’s own context as evidence',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          /* Nothing heard. Consumes no rung — an accidental mic tap must never
             count as an attempt. */
          { transcript: '', confidence: 0, verdict: 'Wrong' },
          {
            transcript:
              '"Historiography is... the study of history. Like, the proper academic version of it, with the sources and the footnotes."',
            confidence: 0.88,
            verdict: 'Wrong',
          },
        ],
      },
      {
        rung: 'hint1',
        hint: {
          label: 'Hint 1',
          body: (
            <>
              Two historians write about the same war, fifty years apart, and reach different
              conclusions. Historiography is not interested in the war. What is it interested in?
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"It’s about the differences between the two accounts, I think. Comparing what they each said happened."',
            confidence: 0.9,
            verdict: 'Wrong',
          },
        ],
      },
      {
        rung: 'hint2',
        hint: {
          label: 'Hint 2',
          body: (
            <>
              Closer &mdash; but it is not the accounts being compared so much as the{' '}
              <strong>writers</strong>. Why did each of them ask the questions they asked?
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"So it’s looking at whether the historians were biased, and whether their sources were any good."',
            confidence: 0.92,
            verdict: 'Wrong',
          },
        ],
      },
      {
        rung: 'hint3',
        hint: {
          label: 'Hint 3',
          body: (
            <>
              The missing idea is that the historian&rsquo;s own moment is itself{' '}
              <strong>evidence</strong>. Historiography studies the writing of history, not the
              events &mdash; the historians, not the past.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"It’s about checking the historians’ work for mistakes and seeing which account got it right."',
            confidence: 0.94,
            verdict: 'Wrong',
          },
        ],
      },
      /* THE SAY-IT-BACK. The ladder has run out and the term is already
         recorded as missed, but the student reads the answer and says it — and
         the prototype (Prototype page, `reveal --orb--> cancel option -->
         correct-answer`) affirms that. It is judged Correct because they have
         the answer in front of them; it does NOT re-settle the term, so the
         summary still counts the miss. See `settleTake`. */
      {
        rung: 'reveal',
        takes: [
          {
            transcript:
              '"It was... the study of how history gets written? Something about the historians themselves."',
            confidence: 0.96,
            verdict: 'Wrong',
          },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Lookups                                                             */
/* ------------------------------------------------------------------ */

export function rungIndex(rung: Rung): number {
  return RUNGS.indexOf(rung);
}

export function nextRung(rung: Rung): Rung {
  return RUNGS[Math.min(rungIndex(rung) + 1, RUNGS.length - 1)];
}

export function getRung(term: ScriptedTerm, rung: Rung): ScriptedRung | undefined {
  return term.rungs.find((r) => r.rung === rung);
}

/** True when the take is contestable — "the app misheard me" is offered. */
export function isContestable(take: ScriptedTake): boolean {
  return take.confidence > 0 && take.confidence < CONFIDENCE_THRESHOLD;
}

/** True when nothing was heard at all. Its own state, and its own cause. */
export function isSilent(take: ScriptedTake): boolean {
  return take.confidence === 0;
}
