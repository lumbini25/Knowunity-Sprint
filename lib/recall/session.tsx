'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  SESSION,
  scoreFromRubric,
  getRung,
  isContestable,
  isSilent,
  nextRung,
  rungIndex,
} from './script';
import type { Rung, ScriptedRung, ScriptedTake, ScriptedTerm, Verdict } from './script';

/**
 * The session the mocked recall runs on.
 *
 * Every "which leads to" row in SPEC.md assumes something that knows which term
 * the student is on, which rung of the ladder, and what the last take's
 * confidence was. This is that thing. It holds no opinion about layout — the
 * screens read it, and the routes turn its destinations into navigation.
 *
 * THREE THINGS COST THE STUDENT NOTHING, and each is a method that does not
 * advance the rung: discarding a take before send, contesting a transcript the
 * app misheard, and a recording nothing was heard in. SPEC.md states all three
 * as contract; they are enforced here rather than remembered at each call site.
 */

/* ------------------------------------------------------------------ */
/* Shape                                                               */
/* ------------------------------------------------------------------ */

/** Where a screen's action sends the student. Routes own the URLs, not this. */
export type Destination =
  | 'idle'
  | 'recording'
  | 'answer-sent'
  /* The judge working. `submit()` never returns this — it is where the student
     is sent to WAIT for submit(), which the processing route then calls. */
  | 'processing'
  | 'no-audio'
  | 'misheard'
  | 're-record'
  /* A miss, with the next rung's hint under it. THE PARTIAL PATH — this is the
     hint ladder, and the only screen a hint is ever read on. */
  | 'result'
  /* A pass. Its own screen, not `result` with a green badge: `correct-answer`
     (15664:13017) draws a mascot, no ladder and no restated question, none of
     which the ladder frames have. */
  | 'correct'
  /* What Knowie would have said, offered after a pass so the student can
     compare their words to it. `correct-feedback` (15664:13061). */
  | 'correct-feedback'
  /* The say-it-back after the reveal still missed. The ONLY route to a wrong
     verdict, and it sits past the whole ladder. */
  | 'wrong'
  /* The model answer beside what the student actually said. */
  | 'comparison'
  /* THE WRONG PATH'S END, and the only place a term is declared wrong. There is
     no standalone wrong verdict: a miss climbs the ladder, and only a miss on
     the last rung lands here. */
  | 'reveal'
  | 'text-fallback'
  /* The concept, read again before another attempt. */
  | 'lesson'
  | 'exit'
  /* The confidence self-report, between the last term and the summary. */
  | 'rating'
  | 'summary';

/** What happened to one term, once it is behind the student. */
export interface TermOutcome {
  termId: string;
  /** The rung a pass landed on. `null` when the term was missed or skipped. */
  passedAt: Rung | null;
  score: number | null;
  skipped: boolean;
}

/** The verdict currently on screen, if any. */
export interface DisplayedVerdict {
  /** The rung the take was made at — where the score comes from. */
  rung: Rung;
  verdict: Verdict;
  transcript: string;
  score: number | null;
  contestable: boolean;
  /** The Partial breakdown, carried from the take so the result screen can
      draw what landed beside what is still absent. Empty on every other
      verdict — only Partial splits an answer in two. */
  got: string[];
  stillMissing: string[];
}

export interface RecallSession {
  term: ScriptedTerm;
  termIndex: number;
  termCount: number;
  /** The rung the ladder points at. */
  rung: Rung;
  /** The hint and takes for the current rung. */
  rungScript: ScriptedRung | undefined;
  /**
   * The take the student is about to submit.
   *
   * A rung holds more than one take — contesting a transcript and a silent
   * recording both hand the next one to the SAME rung — so `rungScript.takes[0]`
   * is only right until either of those happens. The screens need the one in
   * play, and `takeIndex` is deliberately not exposed: the index is bookkeeping,
   * the take is the fact.
   */
  take: ScriptedTake | undefined;
  /** The verdict to draw above the hint, if the student has answered. */
  verdict: DisplayedVerdict | null;
  /** True once the term is settled — a pass, or the reveal has been spoken. */
  resolved: boolean;
  outcomes: TermOutcome[];
  xp: number;
  /**
   * Whether the exit sheet is raised.
   *
   * SESSION STATE, NOT ROUTE STATE, and deliberately. Pushing a route to show
   * the sheet unmounts the turn behind it, so the scrim dims an empty page —
   * and a sheet over nothing is not a sheet. Raising it in place keeps the
   * screen the student is leaving visible underneath, which is the whole
   * grammar of the pattern. Not persisted: a reload should not reopen it.
   */
  exitOpen: boolean;
  /**
   * Whether the microphone has been asked for yet this session.
   *
   * False on a new tab, which is what makes `/recall/idle` open on the
   * permission primer instead of the first question — the "first-encounter
   * screen" `reference/Voice_UX.md` lists as a Must, and which nothing routed
   * to before: the three permission screens existed but only the dev index
   * linked them.
   */
  micGranted: boolean;
  /**
   * Allow. Records the ask and lets the turn through.
   *
   * It does NOT claim the microphone works — this prototype captures no audio,
   * and pretending to hold a real grant would be the dishonest bit. It records
   * only that the student has been asked and said yes.
   */
  grantMic: () => void;
  /** ✕ on any turn. */
  requestExit: () => void;
  /** Stay — back to exactly the turn they were on, because it never left. */
  dismissExit: () => void;

  /**
   * The speaking has stopped and a take exists. Where does it go?
   *
   * THIS IS A TRANSCRIPTION QUESTION, NOT A JUDGING ONE, and the two are
   * different moments. Whether the words came back cleanly is known the instant
   * capture ends; whether they were the right words is not known until the
   * judge has run. So this asks only the first: a take nothing was heard in
   * goes to `no-audio`, one heard below `CONFIDENCE_THRESHOLD` goes to
   * `misheard`, and a clean one goes to `answer-sent` to be read back and sent.
   *
   * CONSUMES NOTHING. A transcription failure is never the student's fault, so
   * neither branch moves the rung — the same rule `submit` already applies.
   */
  handOver: () => Destination;
  /** Consume the current take. Returns where the student goes next. */
  submit: () => Destination;
  /**
   * "Send" on the text fallback.
   *
   * THE TEXT PATH IS THE SAME LADDER, NOT A SIDE DOOR. It goes to `processing`
   * like every other answer, so the judge runs during the same wait; what
   * changes is that `submit()` then skips the two microphone failures. Nothing
   * the student types can be unheard or misheard, and sending a typed answer to
   * "we didn't catch anything" was the loop telling someone who had just
   * written a paragraph that it heard nothing — on the screen that exists
   * precisely because they could not speak.
   *
   * So a typed answer climbs the four rungs, reaches the reveal, and settles
   * through rating into the summary by exactly the route a spoken one takes.
   */
  answerByText: () => Destination;
  /** "That's what I said" — the contested verdict stands, and the rung moves. */
  confirm: () => Destination;
  /** The take is thrown away before send. No rung consumed. */
  discard: () => Destination;
  /** "Knowie misheard me". Returns the clean take. No rung consumed. */
  contest: () => Destination;
  /** Nothing was heard. No rung consumed. */
  retryAfterSilence: () => Destination;
  /** Skip the term. Scores as a miss, and leads the revise list. */
  skip: () => Destination;
  /** Move on once a term is settled. */
  advance: () => Destination;
  /** Leave, keeping the bonus waiting. */
  saveAndLeave: () => Destination;
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

/**
 * "Save and leave" has to survive the student actually leaving — SPEC.md's
 * verification walks out of the session and back in. sessionStorage is the
 * right lifetime: a reload keeps the session, a new tab starts clean.
 */
const STORAGE_KEY = 'knw.recall.session';

interface Persisted {
  termIndex: number;
  rung: Rung;
  takeIndex: number;
  outcomes: TermOutcome[];
  /**
   * Whether the student has been asked for the microphone yet.
   *
   * IN sessionStorage, NOT localStorage, AND THAT IS THE POINT. A permission
   * primer is a first-encounter screen, so it needs a definition of "first"
   * — and for a prototype being demonstrated, the useful one is **a new tab is
   * a new student**. localStorage would show it once per browser and never
   * again, which is right for a shipping app and useless for showing anyone
   * how the feature opens.
   *
   * Real permission state lives with the OS and is never ours to remember;
   * this only records that the ask has happened.
   */
  micGranted: boolean;
}

function read(): Persisted | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Persisted) : null;
  } catch {
    /* Private mode, blocked storage, a bad parse. A session that cannot be
       restored is not a session that should crash. */
    return null;
  }
}

function write(state: Persisted) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* As above — persistence is a convenience here, never a requirement. */
  }
}

/* ------------------------------------------------------------------ */
/* Provider                                                            */
/* ------------------------------------------------------------------ */

const SessionContext = createContext<RecallSession | null>(null);

/**
 * Wraps every recall route. It lives in `app/recall/layout.tsx` rather than in
 * each page, because each route is its own React tree — a provider per page
 * would reset the session on every push.
 */
export function RecallSessionProvider({ children }: { children: ReactNode }) {
  /* THE FOUR PERSISTED VALUES ARE ONE STATE, not four.
     They are written together, restored together, and reset together when a
     term advances — and holding them apart meant restoring took four setState
     calls inside an effect, which is a cascading render the linter rightly
     objects to. One object, one update. `verdict` and `resolved` stay separate
     because they are not persisted: what is on screen should not survive a
     reload, only where the student had got to. */
  const [progress, setProgress] = useState<Persisted>({
    termIndex: 0,
    rung: 'attempt1',
    takeIndex: 0,
    outcomes: [],
    micGranted: false,
  });
  const { termIndex, rung, takeIndex, outcomes, micGranted } = progress;
  const [verdict, setVerdict] = useState<DisplayedVerdict | null>(null);
  const [resolved, setResolved] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  /**
   * Whether the answer now in front of the judge was typed rather than spoken.
   *
   * IN MEMORY, LIKE `verdict`, AND FOR THE SAME REASON. It describes one answer
   * in flight, not the session's progress, so it has no business in the
   * sessionStorage record — a reload mid-judge should land on a turn, not on a
   * half-finished submission.
   *
   * It exists so `submit()` stays the single entry to the judge. The processing
   * screen runs the judge during its wait and must not have to know which
   * screen the student came from; this is the session remembering instead.
   */
  const [typed, setTyped] = useState(false);

  /* Restore once, on mount.
     Deliberately not a `useState` initialiser: that runs during the server
     render too, where `sessionStorage` does not exist, and a client-only
     initial value is a hydration mismatch — the server would render term 1
     while the client renders term 3.

     The lint rule below objects to setState inside an effect because it
     usually means state that should have been derived during render. This is
     the exception it cannot see: the value lives outside React, in browser
     storage that only exists after hydration, so reading it in an effect and
     re-rendering once is the correct shape rather than a mistake. It fires at
     most once per session and only when there is something to resume. */
  useEffect(() => {
    const saved = read();
    /* Defaulted rather than spread blindly: a record written before
       `micGranted` existed has no such key, and `undefined` would read as
       "not asked" by luck rather than by decision. Saying so makes a
       mid-session reload keep whatever was already answered. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setProgress({ ...saved, micGranted: saved.micGranted ?? false });
  }, []);

  /* Skips the mount write, and only the mount write. */
  const mounted = useRef(false);

  /* NOTHING IS WRITTEN ON MOUNT.
     Effects fire in declaration order, so on a fresh page load this one runs in
     the same commit as the restore above — with `progress` still at its
     defaults, because the restore's setState has not re-rendered yet. It wrote
     term 1 rung 1 over whatever was saved, and the session was gone.

     A ref set inside the restore does not help: both effects are in the same
     commit, so it is already true by the time this runs. The only thing that
     distinguishes the bad write is that it is the FIRST one, so that is what is
     skipped. The restore's setState re-renders, this runs again with the
     restored value, and every later change persists normally.

     Nothing caught this during a click-through, because client-side navigation
     keeps the provider mounted — it only bites on a real reload, which is
     exactly the case SPEC.md's verification asks about. */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    write(progress);
  }, [progress]);

  const term = SESSION[Math.min(termIndex, SESSION.length - 1)];
  const rungScript = getRung(term, rung);

  /* Clamped, not indexed straight.
     Contesting a transcript and retrying after silence both advance the take
     without advancing the rung, so a rung whose last take is contestable or
     silent leaves `takes[takeIndex]` undefined — and an undefined take made
     `submit()` return without touching any state, which stranded the student
     on a stale verdict with no way forward and no error. The script should
     always pair such a take with a clean one, and now does; this clamp means a
     future authoring slip degrades to a repeated take rather than a dead end. */
  const takes = rungScript?.takes ?? [];
  const take: ScriptedTake | undefined = takes[Math.min(takeIndex, takes.length - 1)];

  const settleTerm = useCallback(
    (outcome: TermOutcome) => {
      setProgress((prev) => ({
        ...prev,
        outcomes: prev.outcomes.some((o) => o.termId === outcome.termId)
          ? prev.outcomes.map((o) => (o.termId === outcome.termId ? outcome : o))
          : [...prev.outcomes, outcome],
      }));
    },
    [],
  );

  const advance = useCallback((): Destination => {
    /* THE SESSION ENDS THROUGH THE RATING, not straight into the summary.
       `session rating` (15675:15580) asks how confident the student feels now,
       and it has to be asked before they see the score — afterwards it only
       measures their reaction to the number. */
    if (termIndex + 1 >= SESSION.length) return 'rating';
    setProgress((prev) => ({ ...prev, termIndex: termIndex + 1, rung: 'attempt1', takeIndex: 0 }));
    setVerdict(null);
    setTyped(false);
    setResolved(false);
    return 'idle';
  }, [termIndex]);

  /**
   * LET THE VERDICT STAND. Shared by `submit()` and `confirm()`, because those
   * are the same act arrived at two ways: the judge's verdict applies, the rung
   * moves or the term settles.
   *
   * It lives apart so the two cannot drift. They already had: `submit()` did all
   * of this, and confirming a misheard transcript merely NAVIGATED to the result
   * screen — the take was never consumed and the rung never moved, so answering
   * again handed back the same contestable take and the same screen. Term 2 was
   * unescapable without the browser's back button.
   */
  const settleTake = useCallback((take: ScriptedTake): Destination => {
    const passed = take.verdict === 'Correct';
    /* From the rubric, not from the rung. The number says how much of the
       concept the answer covered; the rung says how much help it took, and the
       two are reported separately because they are different facts. See
       `scoreFromRubric`. */
    const score = take.score ?? scoreFromRubric(take);

    setVerdict({
      rung,
      verdict: take.verdict,
      transcript: take.transcript,
      score,
      contestable: false,
      got: take.got ?? [],
      stillMissing: take.stillMissing ?? [],
    });

    if (passed) {
      /* THE REVEAL IS THE EXCEPTION: the term was already recorded as missed
         when the ladder ran out, and saying the answer back after reading it
         does not undo that. The student still gets the correct screen — the
         prototype affirms the saying — but the summary keeps the miss.
         Re-settling here would quietly turn every run-out into a pass. */
      if (rung === 'reveal') {
        setResolved(true);
        return 'correct';
      }

      /* A pass settles the term where it stands. The ladder stops at this rung
         and the rungs past it stay unfilled.

         'correct', NOT 'result'. The two are different screens in Figma, not
         one screen with a green badge: `correct-answer` (15664:13017) draws a
         3XL mascot and nothing else — no `hintLadder`, no restated question —
         where every `hint ladder` frame draws both and no mascot at all. The
         ladder is the shape of being partway there; a pass has no ladder left
         to show. */
      setResolved(true);
      settleTerm({ termId: term.id, passedAt: rung, score, skipped: false });
      return 'correct';
    }

    /* A MISS AT THE REVEAL HAS NOWHERE LEFT TO CLIMB. The student read the
       answer and said it back and it still did not land, which is the one
       place in this loop a wrong verdict is ever shown — the Prototype page
       wires exactly this: `reveal -> the take -> wrong`. Everywhere else a
       miss climbs, which is why there is no standalone wrong screen. */
    if (rung === 'reveal') {
      setResolved(true);
      return 'wrong';
    }

    /* A miss climbs one rung. The screen it lands on draws this verdict with
       the NEXT rung's hint beneath it — which is why the verdict carries its own
       rung rather than reading the current one. */
    const climbed = nextRung(rung);
    setProgress((prev) => ({ ...prev, rung: climbed, takeIndex: 0 }));

    if (climbed === 'reveal') {
      settleTerm({ termId: term.id, passedAt: null, score: null, skipped: false });
      return 'reveal';
    }
    return 'result';
  }, [rung, term.id, settleTerm]);

  /* Show a low-confidence transcript and let the student dispute it. Shared by
     `handOver` (at capture, the normal path) and `submit` (the backstop), so
     the two can never disagree about what a contestable take looks like. The
     rung does not move: a transcription failure is not the student's fault. */
  const showTranscriptAsContestable = useCallback(
    (bad: ScriptedTake): Destination => {
      setVerdict({
        rung,
        verdict: bad.verdict,
        transcript: bad.transcript,
        score: bad.score ?? null,
        contestable: true,
        got: bad.got ?? [],
        stillMissing: bad.stillMissing ?? [],
      });
      return 'misheard';
    },
    [rung],
  );

  /**
   * Where the take goes the moment the speaking stops. See `RecallSession`.
   *
   * The branch belongs HERE, not after the student has confirmed a transcript
   * they were never shown. "Answer sent" reads the words back — so if the words
   * are wrong, reading them back as though they were captured is the wrong
   * screen, and `misheard` is the one that exists for it.
   */
  const handOver = useCallback((): Destination => {
    /* No script for this rung. `submit` reports and climbs; here the honest
       move is the screen that shows the take, which is where the student was
       heading anyway. */
    if (!take) return 'answer-sent';
    if (isSilent(take)) return 'no-audio';
    if (isContestable(take)) return showTranscriptAsContestable(take);
    return 'answer-sent';
  }, [take, showTranscriptAsContestable]);

  const submit = useCallback((): Destination => {
    /* A RUNG WITH NO TAKE IS A SCRIPTING HOLE, and this used to swallow it.
       Returning 'result' without setting a verdict or moving the rung put the
       student back on the screen they just left, showing the verdict they had
       already answered — and the only way out was the browser's back button.
       Nine of the twelve hint rungs were empty when this was found, so it was
       not hypothetical: confirming a misheard transcript on term 3 climbed
       straight into one.

       It now climbs anyway. A hole degrades into "the ladder moved on", which
       is wrong but walkable, rather than into a loop with no exit. */
    if (!take) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `[recall] No take scripted for term "${term.id}" at rung "${rung}". ` +
            'Every rung the student can reach needs one — see lib/recall/script.tsx.',
        );
      }
      const climbedPastHole = nextRung(rung);
      setProgress((prev) => ({ ...prev, rung: climbedPastHole, takeIndex: 0 }));
      if (climbedPastHole === 'reveal') {
        settleTerm({ termId: term.id, passedAt: null, score: null, skipped: false });
        return 'reveal';
      }
      return 'result';
    }

    /* A TYPED ANSWER SKIPS THE TWO CAPTURE FAILURES, AND ONLY THOSE.
       "Nothing heard" and "heard badly" are both microphone outcomes. Neither
       can happen to something the student typed, and routing a typed answer to
       "we didn't catch anything" was the loop telling a student who had just
       written out a paragraph that it heard nothing — the single most
       confidence-destroying thing this flow could say, on the screen that
       exists because the student could not speak in the first place.

       The rest is identical on purpose: same rungs, same hints, same verdicts,
       the same `settleTake`, so the text path climbs the ladder and reaches
       rating and summary by exactly the route the voice path does. The text
       fallback is a way of answering, not a lesser mode — `reference/Voice_UX.md`
       principle 5 is that some students cannot speak at all.

       WHERE THE SCRIPT'S TAKE IS A CAPTURE FAILURE, THE CLEAN ONE IS USED.
       A silent take carries an empty transcript, and a contestable one carries
       a garbled transcript — showing either back as "what you said" after the
       student typed would be the same lie in a quieter font. Every rung that
       scripts a failure also scripts the clean take beside it, which is the one
       `contest()` and `retryAfterSilence()` already hand back. */
    if (typed) {
      setTyped(false);
      const clean = rungScript?.takes.find((t) => !isSilent(t) && !isContestable(t));
      return settleTake(clean ?? take);
    }

    /* Nothing heard. Its own state, its own cause, and no rung consumed. */
    if (isSilent(take)) return 'no-audio';

    /* Heard badly. The student gets to say so before the verdict stands.

       Normally already handled at capture by `handOver`, so this is the second
       line rather than the first — a take that reaches here contestable came in
       by a path that did not pass through the listening screen. Kept because
       the rule is "a bad transcript never counts against the student", and a
       rule with one enforcement point is a rule with one hole. */
    if (isContestable(take)) return showTranscriptAsContestable(take);

    return settleTake(take);
  }, [take, typed, rungScript, rung, term.id, settleTerm, settleTake, showTranscriptAsContestable]);

  /**
   * "Send" on the text fallback. Hands the typed answer to the judge.
   *
   * It goes to `processing` rather than straight to a verdict, because that is
   * where `submit()` runs and the wait is the judge working — the typed path
   * gets the same beat, and the screen the student lands on is a verdict on the
   * ladder rather than a capture failure.
   */
  const answerByText = useCallback((): Destination => {
    setTyped(true);
    return 'processing';
  }, []);


  /**
   * "That's what I said" — the transcript was right, so the verdict it produced
   * stands. Consumes the take exactly as a clean one would.
   */
  const confirm = useCallback((): Destination => {
    if (!take) return 'result';
    return settleTake(take);
  }, [take, settleTake]);

  /* The three that consume no rung. */

  const discard = useCallback((): Destination => {
    setVerdict(null);
    setTyped(false);
    return 'idle';
  }, []);

  const contest = useCallback((): Destination => {
    /* Returns this rung's clean, high-confidence take. The rung does not move:
       a transcription failure is never the student's fault. */
    setProgress((prev) => ({ ...prev, takeIndex: prev.takeIndex + 1 }));
    setVerdict(null);
    setTyped(false);
    return 're-record';
  }, []);

  const retryAfterSilence = useCallback((): Destination => {
    setProgress((prev) => ({ ...prev, takeIndex: prev.takeIndex + 1 }));
    setVerdict(null);
    setTyped(false);
    return 'idle';
  }, []);

  const skip = useCallback((): Destination => {
    settleTerm({ termId: term.id, passedAt: null, score: null, skipped: true });
    return advanceFrom(termIndex);
    function advanceFrom(index: number): Destination {
      /* Same end as `advance()`: the rating comes before the score. */
      if (index + 1 >= SESSION.length) return 'rating';
      setProgress((prev) => ({ ...prev, termIndex: index + 1, rung: 'attempt1', takeIndex: 0 }));
      setVerdict(null);
      setTyped(false);
      setResolved(false);
      return 'idle';
    }
  }, [term.id, termIndex, settleTerm]);


  /* Records the ask, nothing more. Goes through `setProgress` so it lands in
     the same sessionStorage record as the rung and the outcomes — one place
     that knows what this session has been through, not two. */
  const grantMic = useCallback(() => {
    setProgress((prev) => (prev.micGranted ? prev : { ...prev, micGranted: true }));
  }, []);

  const requestExit = useCallback(() => setExitOpen(true), []);
  const dismissExit = useCallback(() => setExitOpen(false), []);

  const saveAndLeave = useCallback((): Destination => {
    /* Resuming moves to the NEXT term and marks the abandoned one skipped —
       nobody gets dropped back into the struggle they left. */
    settleTerm({ termId: term.id, passedAt: null, score: null, skipped: true });
    setProgress((prev) => ({
      ...prev,
      termIndex: Math.min(prev.termIndex + 1, SESSION.length - 1),
      rung: 'attempt1',
      takeIndex: 0,
    }));
    setVerdict(null);
    setTyped(false);
    setResolved(false);
    setExitOpen(false);
    /* 'summary', not 'rating'. Leaving early skips the confidence question on
       purpose: a student on their way out is not in a position to answer it,
       and asking anyway is the research instrument sprint-context.md rejected,
       just moved one screen later. */
    return 'summary';
  }, [term.id, settleTerm]);

  const value = useMemo<RecallSession>(
    () => ({
      term,
      termIndex,
      termCount: SESSION.length,
      rung,
      rungScript,
      take,
      verdict,
      resolved,
      outcomes,
      exitOpen,
      micGranted,
      grantMic,
      requestExit,
      dismissExit,
      handOver,
      /* XP is a flat completion bonus. It reads 0 on every recall screen and
         moves once, at the summary. Do not wire it to per-term outcomes. */
      xp: 0,
      submit,
      answerByText,
      confirm,
      discard,
      contest,
      retryAfterSilence,
      skip,
      advance,
      saveAndLeave,
    }),
    [
      term, termIndex, rung, rungScript, take, verdict, resolved, outcomes, exitOpen,
      micGranted, grantMic, requestExit, dismissExit, handOver,
      submit, answerByText, confirm, discard, contest, retryAfterSilence, skip, advance,
      saveAndLeave,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

export function useRecallSession(): RecallSession {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useRecallSession must be used inside RecallSessionProvider');
  }
  return session;
}

const ROUTES: Record<Destination, string> = {
  idle: '/recall/idle',
  recording: '/recall/recording',
  'answer-sent': '/recall/answer-sent',
  processing: '/recall/processing',
  'no-audio': '/recall/no-audio',
  misheard: '/recall/misheard',
  're-record': '/recall/re-record',
  result: '/recall/result',
  correct: '/recall/correct',
  wrong: '/recall/wrong',
  comparison: '/recall/comparison',
  'correct-feedback': '/recall/correct-feedback',
  reveal: '/recall/reveal',
  'text-fallback': '/recall/text-fallback',
  lesson: '/recall/lesson',
  exit: '/recall/exit',
  rating: '/recall/rating',
  summary: '/recall/summary',
};

/**
 * Turns a destination into navigation. Keeps each route file to wiring rather
 * than a map of URLs repeated six times.
 */
export function useRecallNav() {
  const router = useRouter();
  const go = useCallback((to: Destination) => router.push(ROUTES[to]), [router]);
  /** For handlers that go somewhere fixed rather than somewhere computed. */
  const goTo = useCallback((to: Destination) => () => go(to), [go]);
  return { go, goTo };
}

export { rungIndex };
