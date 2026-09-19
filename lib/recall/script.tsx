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
 * The score as the response card prints it, inside its 44px ring.
 *
 * ONE FORMATTER, BECAUSE TWO CALL SITES DISAGREED ABOUT THE SCALE.
 * `scoreFromRubric` above returns a percentage already on 0–100, and the
 * authored takes are written the same way — 55, 65, 60. `/recall/result`
 * printed `${score}%` and was right. `/recall/correct` printed
 * `${Math.round(score * 100)}%` and multiplied a percentage by a hundred, so a
 * pass rendered `6500%` or `10000%` and ran clean out of the ring and across
 * the card.
 *
 * IT ONLY EVER SHOWED MID-SESSION, which is why it survived. Opening
 * `/recall/correct` by URL has no verdict to read, so the card fell back to its
 * own `100%` default and measured correctly against Figma every time; the bug
 * needed a real playthrough to appear.
 *
 * The clamp is not defensive noise. A percentage of one term recalled cannot be
 * above 100 or below 0, so anything outside that range is a bug upstream — and
 * a wrong number inside the ring is a smaller failure than a right one spilling
 * across the screen it sits on.
 */
export function formatScore(score: number | null | undefined): string | undefined {
  if (score == null || Number.isNaN(score)) return undefined;
  return `${Math.round(Math.min(100, Math.max(0, score)))}%`;
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
 *   1  Turning points     a clean pass, first attempt
 *   2  Appeasement        a pass after one hint   — Figma's worked example
 *   3  Total war          a low-confidence retry  — the misheard path
 *   4  The post-war order a full miss through all four, via nothing-heard
 *
 * WORLD WAR II, BECAUSE THAT IS THE FOLDER THE STUDENT CHOSE. The set used to
 * teach method — primary sources, historiography — while the shelf offered
 * periods, so whichever folder was opened, these four questions arrived. The
 * content is now the folder's; the four PATHS above are unchanged, because
 * they are the demo: every confidence, verdict and score below is the same
 * number it was, so each screen in the loop is still reachable.
 *
 * THE FULL MISS IS THE POST-WAR ORDER, DELIBERATELY. Slot 4 needs a term the
 * scripted student fails at through every rung, which means authoring four
 * wrong answers about it. Doing that to the Holocaust — the other candidate in
 * this folder — would be writing a student fumbling it for a demo, so the
 * institutions got the slot instead.
 */
export const SESSION: ScriptedTerm[] = [
  {
    id: 'turning-points',
    title: 'Turning points',
    intro:
      "Welcome to your study session on World War II. Let's start with the moments the war swung on.",
    question: (
      <>
        What were the major <strong>turning points</strong> of World War II, and why were they
        significant?
      </>
    ),
    modelAnswer:
      'Stalingrad, Midway and D-Day are the three usually named. Each one ended an advance and started a retreat: Stalingrad stopped Germany in the east, Midway broke Japan’s naval initiative in the Pacific, and D-Day opened the western front Germany could no longer hold on two sides.',
    missingItems: [
      'Names at least one turning point',
      'Says which way the momentum shifted',
      'Explains why that mattered to the outcome',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          {
            transcript:
              '"Stalingrad and D-Day, mainly. Stalingrad is where the German advance east finally broke, and D-Day put an army back into western Europe so Germany was fighting both sides at once."',
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
              A turning point is not just a big battle. It is the point after which one side stops
              advancing and starts losing ground. Which battles changed the direction of travel?
            </>
          ),
        },
        takes: [
          {
            transcript: '"There were a lot of big battles. Stalingrad was one of the big ones."',
            confidence: 0.9,
            verdict: 'Partial',
            score: 55,
            got: ['Names at least one turning point'],
            stillMissing: [
              'Says which way the momentum shifted',
              'Explains why that mattered to the outcome',
            ],
          },
        ],
      },
      {
        rung: 'hint2',
        hint: {
          label: 'Hint 2',
          body: (
            <>
              Before Stalingrad, Germany was <strong>advancing</strong> east. After it, it was
              retreating, and never advanced there again. That reversal is the thing being asked
              about.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"Stalingrad reversed it — Germany was pushing east and after that it was falling back the whole way. Midway did the same to Japan in the Pacific."',
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
              You are being asked two things: <strong>which</strong> moments turned the war, and{' '}
              <strong>what</strong> they turned it from and to. Name one and say what changed
              after it.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"Stalingrad, Midway and D-Day. Each one ended an advance and began a retreat — that is what makes them turning points rather than just large battles."',
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
    id: 'appeasement',
    title: 'Appeasement',
    question: (
      <>
        What was <strong>appeasement</strong>, and why did it fail?
      </>
    ),
    modelAnswer:
      'Appeasement was the policy of conceding to Hitler’s demands in the hope that each concession would be the last — the Rhineland, Austria, then the Sudetenland at Munich in 1938. It failed because the demands were not the point: each one bought time and territory for the next, so conceding fed the thing it was meant to satisfy.',
    missingItems: [
      'Concession to avoid war',
      'Names Munich or the Sudetenland',
      'Why conceding made war more likely',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          /* A low-confidence take — "the app misheard me" is offered before the
             verdict is allowed to stand. Contesting it hands back the clean
             take below, and costs the student no rung. */
          {
            transcript: '"It was when Britain kept a pease? with Hitler to avoid a war, I think."',
            confidence: 0.55,
            verdict: 'Partial',
            score: 65,
            got: ['Concession to avoid war'],
            stillMissing: ['Names Munich or the Sudetenland', 'Why conceding made war more likely'],
          },
          {
            transcript:
              '"It was when Britain and France kept giving Hitler what he asked for to avoid another war."',
            confidence: 0.92,
            verdict: 'Partial',
            score: 65,
            got: ['Concession to avoid war'],
            stillMissing: ['Names Munich or the Sudetenland', 'Why conceding made war more likely'],
          },
        ],
      },
      {
        rung: 'hint1',
        hint: {
          label: 'Hint 1',
          body: (
            <>
              Chamberlain came back from a meeting in 1938 holding a piece of paper and promising
              “peace for our time”. Which city, and what had just been handed over?
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"Munich — they let Hitler take the Sudetenland from Czechoslovakia to avoid a war, and it did not stop him, he took the rest of it anyway."',
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
              Each concession was meant to be the <strong>last</strong> one. Think about what that
              assumption got wrong about what Hitler wanted.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"Every time they gave something up they thought it would be the end of it. It was not — it just bought him more room for the next demand."',
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
              Two halves: <strong>what</strong> was conceded, and <strong>why</strong> conceding
              made the war more likely rather than less.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"Giving in to Hitler — the Rhineland, Austria, the Sudetenland at Munich — hoping each one was the last. It failed because it fed the demands instead of ending them."',
            confidence: 0.95,
            verdict: 'Correct',
          },
        ],
      },
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
    id: 'total-war',
    title: 'Total war',
    question: (
      <>
        What does <strong>total war</strong> mean, and how did World War II show it?
      </>
    ),
    modelAnswer:
      'Total war is when a state turns its whole society over to the war — factories, food, labour and civilians included — and stops treating the home front as separate from the fighting. In World War II that meant rationing, conscripted industry, women in war work, and cities bombed precisely because production and morale had become military targets.',
    missingItems: [
      'The whole economy is mobilised',
      'Civilians are not outside it',
      'An example: rationing, war industry or bombing',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          /* Nothing usable came back. No rung is consumed; the student retries
             into the clean take below. */
          {
            transcript: '"Total war is when... the whole... uh... hm, sorry."',
            confidence: 0.38,
            verdict: 'Wrong',
          },
          {
            transcript:
              '"It is when the entire country is put to work on the war, not just the army — factories, rationing, everyone."',
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
              Think about a family at home in 1942 — the food they could buy, the job the mother
              took, the shelter in the garden. How much of that is the war?
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"Everyone had rationing and people went to work in the factories for the war effort."',
            confidence: 0.91,
            verdict: 'Partial',
            score: 60,
            got: ['An example: rationing, war industry or bombing'],
            stillMissing: ['The whole economy is mobilised', 'Civilians are not outside it'],
          },
        ],
      },
      {
        rung: 'hint2',
        hint: {
          label: 'Hint 2',
          body: (
            <>
              If a factory making bomber parts is a military target, so is the street around it.
              That is the line total war <strong>erases</strong>.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"There stops being a difference between the front and home. Civilians are inside the war — that is why cities were bombed."',
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
              Two things: the whole <strong>economy</strong> is turned over to the war, and
              <strong> civilians</strong> are no longer outside it. Say both.
            </>
          ),
        },
        takes: [
          {
            transcript:
              '"The whole economy goes into the war and civilians are part of it rather than outside it — rationing, war factories, and bombing the cities that housed them."',
            confidence: 0.95,
            verdict: 'Correct',
          },
        ],
      },
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
    id: 'post-war-order',
    title: 'The post-war order',
    question: (
      <>
        What <strong>new order</strong> did the Allies build after 1945, and what was it meant to
        prevent?
      </>
    ),
    modelAnswer:
      'The United Nations, the Bretton Woods institutions and the division of Germany between the occupying powers. All of it was built against the memory of 1919: a settlement that punished without rebuilding, and left no standing forum to stop the next crisis. The post-war order tried to bind the victors together instead, though the Cold War split it within a few years.',
    missingItems: [
      'Names the UN or the occupation of Germany',
      'Built to prevent a repeat of 1919',
      'Rebuilding rather than punishing',
    ],
    rungs: [
      {
        rung: 'attempt1',
        takes: [
          /* Nothing was heard at all. Its own state, its own cause, and no rung
             consumed — see `isSilent`. */
          { transcript: '', confidence: 0, verdict: 'Wrong' },
          {
            transcript: '"They made some treaties and Germany got split up I think."',
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
              After the First World War the settlement punished Germany and then left everyone to
              it. What did the Allies build in 1945 that 1919 had no version of?
            </>
          ),
        },
        takes: [
          {
            transcript: '"Was it the League of Nations? Or something like that anyway."',
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
              It still exists, it sits in New York, and the point of it was that the powers would
              have to keep <strong>talking</strong> rather than only arming.
            </>
          ),
        },
        takes: [
          {
            transcript: '"Something in America... I cannot remember what it was called."',
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
              The <strong>United Nations</strong>. Now the second half: what did 1919 do that 1945
              deliberately did not?
            </>
          ),
        },
        takes: [
          {
            transcript: '"The United Nations. I am not sure about the rest of it."',
            confidence: 0.94,
            verdict: 'Wrong',
          },
        ],
      },
      {
        rung: 'reveal',
        takes: [
          {
            transcript:
              '"The UN, and Germany occupied rather than just fined — because 1919 punished and walked away."',
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
