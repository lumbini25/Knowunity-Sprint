# sprint-context.md

Voice-based active recall for Knowunity. Students speak a term out loud; Knowie replies in text.
Push-to-talk only, no voice output, no real STT or AI judge. Prototype ships to Vercel at 390px dark-mode iOS.

**Concept:** A 4-round recall ladder entered from the AI chat screen via a chip above the chat input, with generous judging and a mastery-framed summary. Students get 4 attempts per term before an answer is marked wrong; on a wrong outcome the screen shows a right-answer/your-answer comparison and a CTA to revise.

**Placement:** AI chat → "Explain Out Loud" chip above chat input → pre-recall screen (student picks topic from list → picks folder → sees topic breakdown → option to revise) → Explain Out Loud suggestion → recall loop → summary → "Do you want to revise?"

---

## Decisions

- Entry is a suggestion chip inside AI chat, because placement after AI chat ensures maximum activation
- Round 1 shows an editable transcript with a re-record option, because the student needs to see what was heard before committing to a submission
- Rounds 2-3 show a read-only transcript with an "Add to your answer" chip (not "Say it again"), because re-record at that stage implies starting over, not supplementing
- Round 4 (wrong outcome) locks the term and routes to a right-answer/your-answer comparison screen with a revise CTA, because after four rounds the value is in seeing the gap and acting on it, not retrying
- Push-to-talk with explicit send only, because auto-endpointing fails in background noise and that failure is the most common voice input problem
- Cancel and re-record are always available before send, because a fumbled first sentence must not force a bad submission
- Skip is available on every turn, because the brief requires no student ever be trapped
- Blank or silent recording does not consume a round, because an accidental mic tap must not count as an attempt
- Text fallback is reachable in one tap at all times, because situational and permanent inability to speak share the same solution
- Mic permission primer screen appears before the OS dialog fires, because a cold OS prompt is denied far more often
- Mic-denied state routes to text fallback with an explanation, not a dead end, because that is the brief's core constraint applied to permissions
- All four states (idle, recording, processing, result) are visually distinct using shape or icon alongside color, because color alone fails contrast requirements and cannot carry meaning on its own
- Processing state uses a skeleton screen, not a spinner, because a 2-4s fake latency is a primary design deliverable, not a loading edge case
- Transcript is displayed read-only after each submission; correcting it is not a step, because keyboard correction reintroduces the friction voice input is meant to remove
- Borderline pass/partial cases resolve to pass in the mocked judge, because a false wrong is more demoralizing than a false partial
- XP is shown and collected on the summary screen only, because in-loop XP display competes with the recall itself for attention
- Summary is structured as "Came naturally" / "Worth revisiting" sections in Knowie's voice, because score-based verdicts are either flattery or punishment with nothing in between
- Session is 3-5 terms; the progress indicator must accommodate that range without implying a fixed count
- Mic affordance sits in the bottom third of the screen (thumb zone), because it is the most-tapped control in the entire loop
- Prototype hard-codes three scenarios (strong answer, partial, miss) with a real 2-4s processing delay, because the processing state must be designed, not skipped

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
