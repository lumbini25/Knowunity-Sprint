# sprint-context.md

Voice-based active recall for Knowunity. Students speak a term out loud; Knowie replies in text.
Push-to-talk only, no voice output, no real STT or AI judge. Prototype ships to Vercel at 390px dark-mode iOS.

**Concept:** A 4-round recall ladder entered from the AI chat screen via a chip above the chat input, with generous judging and a mastery-framed summary. Students get 4 attempts per term before an answer is marked wrong; on a wrong outcome the screen shows a right-answer/your-answer comparison and a CTA to revise.

**Placement:** AI chat → "Explain Out Loud" chip above chat input → pre-recall screen (student picks topic from list → picks folder → sees topic breakdown → option to revise) → Explain Out Loud suggestion → recall loop → summary → second pass → "Do you want to revise?"

---

## Decisions

### Entry

- Entry is a suggestion chip inside AI chat, because placement after AI chat ensures maximum activation
- The suggestion screen leads with the retention claim rather than the term list, because the reason speaking works is the part students have not met before, and it is what has to earn the first tap
- The topic breakdown before the loop exists to offer a last look before being tested, because a student sent from a quiz straight into recall may not yet understand the concept well enough to explain it, and that difference is the one between a test and an ambush
- The student picks session length (3-5 terms) on the suggestion screen, because committing to a size they can finish is a completion lever, and the indicator has to handle the range anyway
- The mic permission primer appears before the OS dialog fires, because a cold OS prompt is denied far more often
- The primer never returns once permission is granted, because it did its job and re-showing it puts friction in front of the student already activated
- A student who denied permission opens straight into a text session, with a single quiet mic re-enable affordance, because iOS cannot be re-prompted and greeting them with the denied wall every visit is how a feature gets abandoned

### What the mock actually does

- Each term carries a fixed script: a pre-written transcript and a fixed verdict per round, advanced by tapping send, because a deterministic session makes every state reachable on a known path and demos the same way twice
- The scripted session is four terms: a clean pass, a pass after one hint, a low-confidence retry, and a full miss to the comparison screen, because whatever the script contains is what a reviewer believes the design does, and it has to show recovery rather than only success
- Every scripted transcript carries a confidence score; below threshold the misheard control appears, because a confidence rule generalises where a per-term flag does not
- Claiming misheard returns that term's clean, high-confidence transcript and does not consume a round, because a transcription failure is never the student's fault and the control has to visibly work once without looping
- Zero confidence is its own state — "we didn't catch anything" — and consumes no round, because nothing heard and heard badly are different problems and usually different causes
- Processing is `voiceFab state=Thinking` holding the 2-4s, then the result card fading in, because the orb is already built, is unmistakably not Recording, and does not have to fake a skeleton of a card whose height varies by verdict
- The wait is calm and slow — roughly a 1.6s pulse cycle, roughly a 250ms reveal — because it should read as considered thought rather than machinery, in a moment where the news might be bad

### The loop

- Four rounds per term: round 1 unaided, rounds 2 and 3 each add a hint, round 4 is the final attempt with the most direct hint; still wrong after four routes to the comparison screen
- Each round is a fresh full answer, not a supplement, because every attempt is then judged whole and the score means one clean thing (**this reverses the earlier "Add to your answer" decision**)
- The transcript is read-only on every round and re-recording is the only correction, because keyboard correction reintroduces the friction voice input exists to remove (**this resolves the earlier contradiction between the editable round-1 transcript and the read-only rule**)
- The hint sits in the verdict card and the question bubble is left unchanged, because a student re-answering whole needs the original question intact, and Knowie's question and Knowie's feedback should read as different kinds of thing
- Hints are analogical and escalate: an analogy, then the analogy explained, then the missing concept named — never the answer itself
- A pass auto-advances after one beat; a miss waits for a tap, because good news should not stall the loop and a hint should not scroll past before it has been read
- Push-to-talk with explicit send only, because auto-endpointing fails in background noise and that failure is the most common voice input problem
- Recording has a soft cap near 60s, warned before it lands and auto-sending at it, because a ceiling is not endpointing, and discarding a long answer is the most demoralising thing this loop could do
- Cancel and re-record are always available before send, because a fumbled first sentence must not force a bad submission
- Skip is available on every turn, because the brief requires no student ever be trapped
- Skip scores as a miss but leads the revise list, because a term you could not start is the clearest gap you have
- The comparison screen sets the student's last transcript against the model answer, because seeing the gap is what four rounds ended here for, and their actual words are the unarguable half of it
- Say-it-back follows the comparison and is **required, not optional** — by voice or by keyboard, but the reveal screen carries no "next question". It is the only moment in the loop where the student has a correct answer in front of them to say out loud, and reading one and tapping past it teaches nothing (**this supersedes the earlier "optional say-it-back" decision**). Neither path is judged and neither costs a rung: the term is already settled, and what the student buys is the saying
- Text mode runs the identical ladder and hints, with say-it-back becoming type-it-again, because the denied screen promises text answers are recorded the same way and the mastery number has to mean one thing

### Header and XP

- The header carries close, progress, and an XP figure that starts at 0, because that is what `Top Nav Default` draws (**supersedes the earlier "bonus on offer, +50 on finish" decision**)
- Progress is fixed at session start but the n/total count is **not drawn** — the fill carries it, because the header reads quieter without a number competing with the XP figure beside it (**supersedes the earlier "shown as n/total" decision**). The count is still spoken: it is carried in the progress bar's accessible name, because hiding a label visually should not hide the information from assistive tech
- XP is a flat bonus for completing the session with nothing per term, because XP rewards finishing while mastery reports what you know, and the two signals should not do each other's job
- The bonus survives leaving and is waiting on return, because the incentive should point at finishing rather than at not-leaving

- The XP figure does not move during the loop — it reads 0 on every recall screen and changes once, at the summary, when the completion bonus lands, because a figure that never ticks cannot compete with the recall for attention while still keeping XP visible as a thing the session is worth

### Leaving and resuming

- Exit opens a save-and-resume sheet, not a research instrument, because a student trying to leave should not be handed a form
- The sheet names plainly that the term in flight will count as skipped, and offers to finish it first, because "progress is saved" would otherwise hide a real cost until the summary, which is where trust in the number gets decided
- Resuming moves to the next term and marks the abandoned one skipped, because nobody should be dropped back into the struggle they left

### Failure paths

- Judge timeout shows "taking a moment", retries once silently, then offers the keyboard, because every failure has to end on a way forward
- Blank or silent recording does not consume a round, because an accidental mic tap must not count as an attempt
- The wired prototype runs one clean scripted session; every failure state stays reachable and documented as its own Storybook story, because the flow should stay a product rather than a harness and the state list should stay auditable

### Summary and after

- The summary ring shows a count of terms explained unaided, not a grade, because a count states what the student did rather than converting it into a mark
- "Came naturally" leads and the biggest-gap headline sits beneath it, because the same information in that order does not meet a struggling student with a deficit before anything is acknowledged
- Summary is structured as "Came naturally" / "Worth revisiting" in Knowie's voice, because score-based verdicts are either flattery or punishment with nothing in between
- An immediate second pass runs all weak terms back through the full ladder under one CTA, and a term passed there is marked "on second pass", because the effort deserves recording and the record still has to be truthful
- A term that misses again on the second pass stops there and stays named on the revise list, because two full ladders is enough for one sitting
- The revise CTA returns to the topic breakdown with the weak terms marked, because it closes the loop on the screen that offered a look in the first place

### Standing constraints

- All four states (idle, recording, processing, result) are visually distinct using shape or icon alongside color, because color alone fails contrast requirements and cannot carry meaning on its own
- Borderline pass/partial cases resolve to pass in the mocked judge, because a false wrong is more demoralizing than a false partial
- Text fallback is reachable in one tap at all times, because situational and permanent inability to speak share the same solution
- Mic-denied state routes to text fallback with an explanation, not a dead end, because that is the brief's core constraint applied to permissions
- Mic affordance sits in the bottom third of the screen (thumb zone), because it is the most-tapped control in the entire loop

### Build order

- The loop and its states ship first, then the entry path, because the loop is where the brief says the design problem lives, and a complete loop with a narrated entry demos better than a walkable path into a loop with holes

---

## Not building

- Knowie voice output (text only throughout)
- Auto-endpointing or silence detection
- Real STT or AI judge
- Tutoring, follow-up questions, or conversational branches off a recall turn
- Transcript correction as an interactive or required step
- Desktop, tablet, or responsive breakpoints
- RTL layout
- Language switching within a session
- Mic hardware-busy error handling (noted as known gap)
- A third pass, or any recovery beyond the second (noted as a deliberate stopping point)

---

## Still open

- **The XP number itself.** The bonus is flat and shown as "+50 on finish", but 50 is a placeholder — it has no relationship to XP values elsewhere in the product.
- **Hint authoring.** Three analogical rungs per term is real content work, and the analogies have to be good enough to nudge without teaching. Only the scripted session's four terms are needed for the prototype.
- **Whether mastery persists across sessions.** A term explained unaided today is not recorded as known tomorrow. Out of scope for the prototype; it is where the retention claim would eventually have to live.
