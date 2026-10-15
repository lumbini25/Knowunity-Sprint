import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, fn } from 'storybook/test';
import {
  AnswerSentScreen,
  IdleScreen,
  ListeningScreen,
  ProcessingScreen,
  ResultScreen,
  NoAudioScreen,
  RevealScreen,
  WrongScreen,
  ComparisonScreen,
  HomeScreen,
  ComposeScreen,
  ExplainEntryScreen,
  CorrectScreen,
  CorrectFeedbackScreen,
  SessionRatingScreen,
  SummaryScreen,
  ExitScreen,
  LessonScreen,
  TextFallbackScreen,
  PermissionPrimerScreen,
  PermissionDeniedScreen,
  MisheardScreen,
  ReRecordScreen,
  QuizScreen,
  SummarizeScreen,
} from './RecallScreens';

const DESCRIPTION = `Five states from \`reference/Voice_UX.md\`'s **"States to design"** checklist that had no React counterpart. Four are "Must"; one is "If time".

| # | State | Triage | Figma |
|---|---|---|---|
| 5 | Cancel & re-record before send | Must | No screen — composed |
| 6 | Text fallback turn | Must | Component exists, instanced on zero screens |
| 7 | Mic permission primer + OS prompt | Must | None — composed |
| 8 | Permission denied → route to text | Must | None — composed |
| 11 | Very noisy / garbled transcript | If time | \`upon clicking app misheard me\` ✓ |

---

**These are compositions, not new components.** Every element is something already in this library — \`Screen\`, \`VoiceFab\`, \`TypeAnswer\`, \`TextBlock\`, \`TextField\`, \`Button\`, \`MascotSlot\`, \`RecallResponseCard\` — and every value comes from a token those components already own. The screen CSS carries layout only: no colour, no type, no sizes.

**\`transcriptSection\` is not on the misheard screen.** The plan put it above the card; building it showed the two print the same string twice, which is the confusion its own *"What not to do"* warns about — *"Do not confuse with the Transcript layer inside recallResponseCard."* The card wins, because it is what state 11 is about. \`transcriptSection\` belongs on a screen that shows what was heard without a verdict card — the result screens — so it currently has no screen consumer here.

**Four of the five have no Figma design.** Their anatomy is written into \`design-system.md\` marked *"specified in code first; not yet in Figma"*, so the file can be drawn from the build rather than the other way round. Treat the layout as a proposal; the token bindings are not.

**Every recall turn carries both escapes.** \`CLAUDE.md\`: *"Every recall screen keeps a text fallback and a way out."* Voice_UX lists "Text fallback turn" and "Skip a term" as separate Musts, and \`sprint-context.md\` says *"Skip is available on every turn"* — Figma draws it on the Idle screen only. \`RecallEscapes\` puts both on every screen here.

**The discard control is new on \`voiceFab\`.** Its Figma description calls for it — *"taps the trash discard icon to cancel and re-record"* — but the set carries no axis for one, so \`showDiscard\` / \`onDiscard\` were added. The glyph is the \`Trash\` component (node \`15787:19576\`), variant \`Property 1=Default\`.

**\`Trash\`'s \`white\` variant binds a primitive.** \`color/neutral/0\`, which breaks \`CLAUDE.md\`'s *"Components consume the semantic layer only."* The \`Default\` variant is used instead; the white one should be rebound.

**Copy is written, not borrowed.** Voice_UX principle 3 drives the primer — explain the value before the OS dialog, and make opting out as easy as opting in. Principle 5 drives the denied screen: say what is missing, how to get it back, and offer a way forward that needs no microphone. Sentence case throughout per \`CLAUDE.md\`.`;

const meta = {
  title: 'Screens/Recall states',
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: DESCRIPTION } },
  },
  decorators: [(Story) => (<div style={{ width: '390px' }}><Story /></div>)],
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * THE ENTRY PATH. Until these existed the prototype had no front door: every
 * screen assumed a session was already running, and `/recall/idle` opened on
 * term 1 of a script nothing had chosen.
 */
export const Home: Story = {
  name: 'Entry 1 · Home',
  render: () => <HomeScreen onExplainOutLoud={fn()} onSelectTopic={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The redesigned front door (16307:8816).
    const h = canvas.getByRole('heading', { name: 'Evening, Harry. Ready to test what stuck?' });
    await expect(h).toBeVisible();
    // 33 Bold — headline/L, two lines across the full 358.
    await expect(getComputedStyle(h).fontSize).toBe('33px');
    await expect(Math.round(h.getBoundingClientRect().width)).toBe(358);
    await expect(canvas.getByText(/Pick one and explain it out loud/)).toBeVisible();

    // The app bar is still there.
    await expect(canvas.getByLabelText('Menu')).toBeVisible();
    await expect(canvas.getByText('Upgrade')).toBeVisible();

    // THE WEEK'S TOPICS, one topicRow each, every one a control.
    const rows = canvasElement.querySelectorAll('.knw-home__list .knw-topic');
    await expect(rows).toHaveLength(4);
    await expect(canvas.getByRole('button', { name: /Turning points/ })).toBeVisible();

    // The rail, in Figma's order, with Explain out loud live.
    const labels = [...canvasElement.querySelectorAll('.knw-home__rail .knw-chip__label')].map((c) => c.textContent);
    await expect(labels.slice(0, 3)).toEqual(['Quiz', 'Summarize', 'Explain out loud']);
    await expect(canvas.getByRole('button', { name: 'Explain out loud' })).toBeVisible();
    // No recent-folder chip — it opened the folder screen, which is gone.
    await expect(canvas.queryByText('Chemistry prep')).toBeNull();

    // The rail still scrolls rather than wrapping.
    const rail = canvasElement.querySelector('.knw-home__rail') as HTMLElement;
    await expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
  },
};

const pickTopic = fn();

export const HomePickTopic: Story = {
  name: 'Entry 1b · Home — a topic carries which one',
  render: () => <HomeScreen onSelectTopic={pickTopic} />,
  play: async ({ canvas }) => {
    /* A DESTINATION IS ABOUT THE THING THAT WAS TAPPED. Four rows leading to
       one place would make the list decorative, so the handler gets the row's
       index — tapping the third row says 2, not 0. */
    await userEvent.click(canvas.getByRole('button', { name: /Total war/ }));
    await expect(pickTopic).toHaveBeenCalledWith(2);
  },
};

/**
 * Figma's `selecting explain feature`: the chip attached, the field still
 * empty. Its prototype taps the composer to reach `choosing chip` — the same
 * screen with the topic in it — so the two frames are this story and the next,
 * and the tap between them is how the prototype mocks typing.
 */
export const ComposeEmpty: Story = {
  name: 'Entry 2a · Compose — empty',
  render: () => <ComposeScreen value="" onFill={fn()} onClearFeature={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The chip is attached before a word is typed — that is what makes the next
    // message a practice set rather than a question. Scoped to the composer:
    // "Explain out loud" is now on this screen TWICE, once on the rail and once
    // attached, which is the point — picking a feature does not remove it from
    // the rail, so the label alone no longer identifies the attached one.
    const attached = canvasElement.querySelector('.knw-chat__attachment') as HTMLElement;
    await expect(attached).toBeTruthy();
    await expect(attached.textContent).toContain('Explain out loud');
    await expect(canvas.getByText('Tell me what you want to practice...')).toBeVisible();

    // THE CHAT BAR, NOT THE FRONT DOOR'S. Figma changes two things between
    // `entrypoint` and this screen, one tap later: the trailing control becomes
    // compose rather than history, and the streak goes. Both follow from where
    // the student is — inside a chat the useful control is a NEW chat, and a
    // streak is a home-screen statistic. The build carried the home bar
    // straight through, so the app bar did not change when the screen did.
    await expect(canvas.getByLabelText('New chat')).toBeVisible();
    await expect(canvas.queryByLabelText('History')).toBeNull();
    await expect(canvas.queryByLabelText('3 day streak')).toBeNull();
    await expect(canvas.getByLabelText('2 XP')).toBeVisible();

    // The field takes a tap, which is this prototype's typing.
    await expect(canvasElement.querySelector('.knw-chat__text--pressable')).toBeTruthy();

    // ONE MICROPHONE ON THIS SCREEN, and it is the chip's. `status="Inactive"`
    // puts chatInput's own mic in the trailing slot, so the empty composer drew
    // two mics a few pixels apart — the chip's blue one meaning "this will be
    // spoken", and a thin white one meaning "record". Figma draws Send here
    // instead, which is also what makes this frame and the next agree.
    await expect(canvasElement.querySelector('.knw-chat__trailing-icon')).toBeNull();
    await expect(canvasElement.querySelector('.knw-chat__send')).toBeTruthy();

    // And the label says what pressing it does. There is nothing to send yet —
    // it supplies the topic — so calling it "Send" would be a lie the screen
    // reader would read out.
    await expect(canvas.getByRole('button', { name: 'Add your topic' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Send' })).toBeNull();
  },
};

export const Compose: Story = {
  name: 'Entry 2b · Compose a set',
  render: () => <ComposeScreen onSend={fn()} onClearFeature={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // THE CHIP IS THE POINT. Picking the feature on the home screen attaches it
    // to the composer, and it stays attached until the student takes it off —
    // that is what makes the next message a practice set rather than a question.
    //
    // Scoped to the composer, because the label is on this screen twice now:
    // attaching a feature does not remove it from the rail above.
    const attached = canvasElement.querySelector('.knw-chat__attachment') as HTMLElement;
    await expect(attached.textContent).toContain('Explain out loud');
    await expect(canvas.getByRole('button', { name: 'Remove Explain out loud' })).toBeVisible();

    // AND THE CHIP CARRIES THE MIC. Figma's `EolChip` is mic + label + ✕, and
    // the mic is what says the next message will be spoken. The first pass ran
    // `showLeftIcon={false}`, which dropped it.
    const chip = attached.querySelector('.knw-chip') as HTMLElement;
    await expect(chip.querySelector('.knw-chip__icon svg')).toBeTruthy();

    // It carries the feature's own accent — the chip and the rail are built
    // from one entry, so the attached mic is literally the rail's icon.
    await expect(chip.querySelector('[data-accent="blue"]')).toBeTruthy();

    // AND IT IS THE ONLY MIC, in this state as in the empty one. The trailing
    // control is the send affordance in both, so the two frames of this screen
    // draw the same icons — see `Entry 2a`, which asserts the same thing before
    // the topic arrives.
    await expect(canvasElement.querySelector('.knw-chat__trailing-icon')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeVisible();

    // `chip container` — THE FEATURE RAIL, the same chips the front door draws
    // and in the same accents, MINUS the one now attached below. Offering
    // Explain out loud again would offer something already chosen, and would
    // put the same chip on screen twice meaning two different things: once a
    // choice, once a state.
    //
    // This asserted Camera / Gallery / Files, which is what the frame held at
    // the time and no longer does — so the composer's row was a different set
    // of icons from the rail one screen earlier. Rail and chip now come from
    // one array, which is what stops them drifting again.
    const rail = canvasElement.querySelector('.knw-entry__sources') as HTMLElement;
    const railLabels = [...rail.querySelectorAll('.knw-chip__label')].map((e) => e.textContent);
    await expect(railLabels).toEqual(['Quiz', 'Summarize', 'Scan', 'Chemistry prep']);
    await expect(railLabels).not.toContain('Explain out loud');

    // Four chips, four accents — the colour coding survives the screen change.
    const accents = new Set(
      [...rail.querySelectorAll('.knw-accent-icon')].map(
        (el) => getComputedStyle(el as HTMLElement).color,
      ),
    );
    await expect(accents.size).toBe(4);

    // Drawn, not wired: this prototype only carries Explain out loud, and that
    // one is already attached rather than offered.
    await expect(rail.querySelectorAll('button')).toHaveLength(0);

    // It overflows on purpose and scrolls — and because nothing inside it is a
    // tab stop, the region itself has to be reachable by keyboard or the chips
    // past the edge are pointer-only.
    await expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
    await expect(rail.getAttribute('tabindex')).toBe('0');

    // The keyboard is drawn, full width, at the component's own 390x342 —
    // `choosing chip` (16012:23063) puts it in bottomContent at x=0, and the
    // text fallback draws the same asset the same way.
    const kb = canvasElement.querySelector('.knw-recall__keyboard') as HTMLElement;
    await expect(kb).toBeTruthy();
    await expect(kb.getAttribute('src')).toContain('ios-keyboard.png');
    await expect(getComputedStyle(kb).height).toBe('342px');
  },
};

export const ExplainEntry: Story = {
  name: 'Entry 3 · Explain out loud — ready',
  render: () => <ExplainEntryScreen phase="settled" onStart={fn()} onFeedback={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // 16307:11255 — the settled line, and the card takes a tap.
    await expect(canvas.getByText(/Here you go. Explain each idea out loud/)).toBeVisible();
    const card = canvas.getByRole('button', { name: /Explain out loud/ });
    await expect(card.classList.contains('knw-entry__start')).toBe(true);
    await expect(card).toBeEnabled();
    await expect(canvas.getByText('World War II foundations')).toBeVisible();
    await expect(canvas.getByText('Smart Answer')).toBeVisible();

    // The student's turn is a pill on the right; Knowie's is running text.
    const student = canvasElement.querySelector('.knw-entry__student') as HTMLElement;
    await expect(getComputedStyle(student).alignItems).toBe('flex-end');

    // NO MASCOT IN THE CARD — Figma draws one there; the Never list forbids it.
    await expect(card.querySelector('.knw-mascot')).toBeNull();

    // THE THUMBS ANSWER THE TAP. The choice is shown as a pressed chip.
    await userEvent.click(canvas.getByRole('button', { name: /Helpful/ }));
    await expect(
      canvasElement.querySelector('.knw-entry__feedback-row [data-active="true"]')?.textContent,
    ).toContain('Helpful');
  },
};

export const ExplainEntryComposing: Story = {
  name: 'Entry 3a · Knowie composing',
  render: () => <ExplainEntryScreen phase="composing" onStart={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // 16307:8815: Knowie beside "Composing", the plan, the card generating.
    await expect(canvas.getByRole('status')).toHaveTextContent('Composing');
    await expect(canvas.getByText(/focused speaking-practice set/)).toBeVisible();
    await expect(canvas.getByText('Generating')).toBeVisible();
    // Drawn but not tappable until the set exists.
    await expect(canvas.getByRole('button', { name: /Explain out loud/ })).toBeDisabled();
    // No feedback on a turn that is still being written.
    await expect(canvas.queryByText('Happy with the answer?')).toBeNull();
    await expect(canvasElement.querySelector('.knw-entry__start .knw-mascot')).toBeNull();
  },
};

export const ExplainEntryReadyBeat: Story = {
  name: 'Entry 3b · The set arrives',
  render: () => <ExplainEntryScreen phase="ready" onStart={fn()} />,
  play: async ({ canvas }) => {
    // 16307:8573 — "Nice pick", for the 0.8s before it settles. Figma wires
    // the card only on the settled frame, so it waits too.
    await expect(canvas.getByText(/Nice pick/)).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Explain out loud/ })).toBeDisabled();
    await expect(canvas.getByText('Happy with the answer?')).toBeVisible();
  },
};

/**
 * THE CHAT BOX TAKES A TAP. A tap raises the same drawn keyboard the text
 * fallback uses, directly under the field, and a tap on the thread above
 * lowers it again.
 */
export const ExplainEntryTyping: Story = {
  name: 'Entry 3c · Tapped the chat box',
  render: () => <ExplainEntryScreen onStart={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-recall__keyboard')).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Ask anything' }));

    const keyboard = canvasElement.querySelector('.knw-recall__keyboard') as HTMLElement;
    await expect(keyboard).toBeTruthy();
    const field = canvasElement.querySelector('.knw-chat') as HTMLElement;
    await expect(keyboard.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      field.getBoundingClientRect().bottom,
    );

    await userEvent.click(canvas.getByText('World history', { selector: '.knw-entry__bubble' }));
    await expect(canvasElement.querySelector('.knw-recall__keyboard')).toBeNull();
  },
};

export const AnswerSent: Story = {
  name: 'The take · beat 1 — play it back',
  render: () => (
    <AnswerSentScreen onSend={fn()} onRetry={fn()} onDiscard={fn()} onTypeAnswer={fn()} onExit={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    // `student talking` (16301:6933): the question stays up, the orb plays
    // the take back, the bin sits beside it, Retry beside Submit answer.
    await expect(canvasElement.querySelector('.knw-recall__bubble')).toBeTruthy();
    await expect(canvas.queryByText('WHAT YOU SAID')).toBeNull();

    // PLAYBACK IS MOCKED: Play turns to Stop and back. No audio exists.
    const play = canvas.getByRole('button', { name: 'Play your answer' });
    await userEvent.click(play);
    await expect(canvas.getByRole('button', { name: 'Stop playback' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Stop playback' }));
    await expect(canvas.getByRole('button', { name: 'Play your answer' })).toBeVisible();

    // The bin, to the left of the orb, still a 40 pill.
    const discard = canvas.getByRole('button', { name: 'Discard and re-record' });
    const orb = canvasElement.querySelector('.knw-fab__stage') as HTMLElement;
    await expect(discard.getBoundingClientRect().right).toBeLessThanOrEqual(orb.getBoundingClientRect().left);

    // Retry then Submit answer, side by side; Submit takes the width.
    const retry = canvas.getByRole('button', { name: 'Retry' });
    const submit = canvas.getByRole('button', { name: 'Submit answer' });
    await expect(retry.getBoundingClientRect().right).toBeLessThanOrEqual(submit.getBoundingClientRect().left);
    await expect(submit.getBoundingClientRect().width).toBeGreaterThan(retry.getBoundingClientRect().width);

    // The text path stays (CLAUDE.md). No skip on the take — the frame draws
    // none, and the bin returns to a turn that has one.
    await expect(canvas.getByRole('button', { name: 'Type your answer' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Skip question' })).toBeNull();
  },
};

export const AnswerSentDiscardSheet: Story = {
  name: 'The take · the delete confirmation',
  render: () => (
    <AnswerSentScreen discardSheetOpen onRetry={fn()} onDiscard={fn()} onTypeAnswer={fn()} onExit={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Are you sure you want to delete this answer?')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Yes' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'No' })).toBeVisible();
    await expect(canvas.getByText(/moved forward to the next question/)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Close' })).toBeNull();
    // Raised over the take, not instead of it: the question is still behind.
    await expect(canvasElement.querySelector('.knw-recall__bubble')).toBeTruthy();
  },
};

export const AnswerSentConfirmed: Story = {
  name: 'The take · beat 2, the 300ms flash',
  render: () => <AnswerSentScreen sent onDiscard={fn()} onTypeAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // Submitted: the orb reads "Answer sent", Knowie takes it away to judge.
    await expect(canvasElement.querySelector('.knw-fab--Sent')).toBeTruthy();
    await expect(canvas.getByText('Answer sent')).toBeVisible();
    await expect(canvas.getByLabelText('Knowie, thinking')).toBeVisible();
    // The decision is over, so its controls are gone — including playback.
    await expect(canvas.queryByRole('button', { name: 'Submit answer' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Retry' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Play your answer' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Discard and re-record' })).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Type your answer' })).toBeVisible();
  },
};

export const TextFallbackEmpty: Story = {
  name: '6a · Text fallback — empty',
  render: () => <TextFallbackScreen onSend={fn()} onUseVoice={fn()} onSkip={fn()} />,
  play: async ({ canvas }) => {
    // `15 Text fallback, empty` (16311:12322): a real box, waiting.
    const box = canvas.getByRole('textbox', { name: 'Your explanation' });
    await expect(box.tagName).toBe('TEXTAREA');
    await expect(box).toHaveAttribute('placeholder', 'Type your explanation');
    await expect(canvas.getByText(/judged the same way and count the same/)).toBeVisible();

    // "SEND ANSWER" WAITS FOR WORDS — nothing empty is judged.
    await expect(canvas.getByRole('button', { name: /Send answer/ })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Switch to voice' })).toBeVisible();

    // Skip lives in the bar on this screen, as the frame draws it.
    const skip = canvas.getByRole('button', { name: 'Skip' });
    await expect(skip.closest('.knw-recall__header')).toBeTruthy();
    await expect(skip.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

/* A stateful harness, so the story types for real — the route owns the value
   the same way. */
function TypedTextFallback() {
  const [value, setValue] = useState('');
  return <TextFallbackScreen value={value} onChange={setValue} onSend={fn()} onUseVoice={fn()} onSkip={fn()} />;
}

export const TextFallbackTyped: Story = {
  name: '6b · Text fallback — typed',
  render: () => <TypedTextFallback />,
  play: async ({ canvas }) => {
    // `16 Text fallback, typed` (16311:12479): the student types, and Send
    // comes alive the moment there are words.
    const box = canvas.getByRole('textbox', { name: 'Your explanation' });
    const send = canvas.getByRole('button', { name: /Send answer/ });
    await expect(send).toBeDisabled();
    await userEvent.type(box, 'Feudalism was a system where kings gave land');
    await expect(box).toHaveValue('Feudalism was a system where kings gave land');
    await expect(send).toBeEnabled();
  },
};

export const TextFallback: Story = {
  name: '6c · Text fallback — sent',
  render: () => (
    <TextFallbackScreen value="Feudalism was a system where kings gave land" sent onUseVoice={fn()} onSkip={fn()} />
  ),
  play: async ({ canvas }) => {
    // Gone to the judge: the button says so and takes no second tap.
    await expect(canvas.getByRole('button', { name: /Sent/ })).toBeDisabled();
    await expect(canvas.getByRole('textbox', { name: 'Your explanation' })).toHaveAttribute('readonly');
  },
};

export const PermissionPrimer: Story = {
  name: '7 · Mic permission primer',
  render: () => <PermissionPrimerScreen onStart={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The headline Figma writes, at the size it writes it: 33/36 — headline/L.
    const h = canvas.getByRole('heading', { name: 'You’re ready' });
    await expect(h).toBeVisible();
    const hs = getComputedStyle(h);
    await expect(hs.fontSize).toBe('33px');
    await expect(hs.lineHeight).toBe('36px');
    await expect(hs.textAlign).toBe('center');

    // Knowie at mascotSlot size=3XL, the size the screen uses.
    const slotEl = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(slotEl.classList.contains('knw-mascot--3XL')).toBe(true);

    // ONE button on the screen. The screen primes; the sheet asks. An earlier
    // build put Allow and its opt-out here, having read only the screen frame.
    await expect(canvas.getByRole('button', { name: 'Let’s go' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Allow' })).toBeNull();
    await expect(canvasElement.querySelector('.knw-sheet')).toBeNull();
  },
};

/** The second beat: the sheet is what actually asks for the microphone. */
export const PermissionSheet: Story = {
  name: '7b · Mic permission sheet',
  render: () => <PermissionPrimerScreen showSheet onAllow={fn()} onUseText={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-sheet')).toBeTruthy();

    // THE TITLE IS 33/36, which is `headline/L` and which no `textBlock`
    // variant reaches — L is headline/XL (44), M is body/M-bold (18). Bound on
    // the screen, the same way and for the same reason as the priming beat's
    // own headline.
    const h = canvas.getByRole('heading', { name: /access your mic/ });
    await expect(h).toBeVisible();
    const hs = getComputedStyle(h);
    await expect(hs.fontSize).toBe('33px');
    await expect(hs.lineHeight).toBe('36px');

    // AND THE CAPTION IS UNDER IT, not in the app bar. It was passed as the
    // sheet's `descriptor`, which put the explanation above the mascot in
    // caption/M — the sheet opened on its own small print.
    const cap = canvasElement.querySelector('.knw-recall__sheet-caption') as HTMLElement;
    await expect(cap).toBeTruthy();
    await expect(getComputedStyle(cap).fontSize).toBe('15px');
    await expect(cap.getBoundingClientRect().top).toBeGreaterThan(h.getBoundingClientRect().top);
    await expect(canvasElement.querySelector('.knw-sheet__descriptor')).toBeNull();

    // HANDLE ONLY. Figma's app bar is the grabber and nothing else, and a
    // dismissal would be a third answer to a two-answer question.
    await expect(canvas.queryByRole('button', { name: 'Close' })).toBeNull();

    // Voice_UX principle 3: the opt-out sits beside Allow, not absent and not
    // buried. Figma separates the pair by 8 where the component stacks flush —
    // what the sheet draws is a frame named buttonGroup, not an instance.
    const allow = canvas.getByRole('button', { name: 'Allow' });
    const type = canvas.getByRole('button', { name: 'Type instead' });
    await expect(allow).toBeVisible();
    await expect(type).toBeVisible();
    await expect(canvasElement.querySelector('.knw-buttongroup--Vertical')).toBeTruthy();
    await expect(Math.round(allow.getBoundingClientRect().width))
      .toBe(Math.round(type.getBoundingClientRect().width));
    await expect(Math.round(
      type.getBoundingClientRect().top - allow.getBoundingClientRect().bottom,
    )).toBe(8);

    // The screen behind it dims, which is what the raised sheet is for.
    await expect(canvasElement.querySelector('.knw-screen__scrim')).toBeTruthy();
  },
};

export const PermissionDenied: Story = {
  name: '8 · Permission denied',
  render: () => <PermissionDeniedScreen onUseText={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'Mic access denied' })).toBeVisible();

    // voiceFab state=Deny: Idle's structure, recoloured destructive, and no tap
    // target — tapping a blocked mic does nothing.
    const fab = canvasElement.querySelector('.knw-fab--Deny') as HTMLElement;
    await expect(fab).toBeTruthy();
    await expect(fab.querySelector('button')).toBeNull();
    const button = fab.querySelector('.knw-fab__button') as HTMLElement;
    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(255, 107, 107)');
    // The ring survives, which is what keeps it recognisable as the same orb.
    await expect(fab.querySelector('.knw-fab__ring')).toBeTruthy();

    // Both cards are present: what you lose, and how to get it back.
    await expect(canvas.getByRole('heading', { name: 'Without the mic' })).toBeVisible();
    await expect(canvas.getByRole('heading', { name: 'To re-enable mic access' })).toBeVisible();

    // The Settings trail, as four chips in order — a path, not four actions.
    const path = canvasElement.querySelectorAll('.knw-recall__path li');
    await expect(path).toHaveLength(4);
    await expect(path[0].textContent).toBe('Settings');
    await expect(path[3].textContent).toBe('Knowunity');

    // And it does not dead-end: buttonGroup carries both ways forward.
    await expect(canvasElement.querySelector('.knw-buttongroup--Vertical')).toBeTruthy();
    await expect(canvas.getByRole('button', { name: 'Type instead' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Enable microphone' })).toBeVisible();
  },
};

export const PermissionDeniedSettings: Story = {
  name: '8b · Permission denied — the Settings path',
  render: () => (
    <PermissionDeniedScreen showSheet onMicEnabled={fn()} onUseText={fn()} onDismissSheet={fn()} />
  ),
  play: async ({ canvas }) => {
    // "Enable microphone" cannot open iOS Settings from a web prototype — and
    // even in the real app the switch lives in Settings, not here. So the
    // button says where, and then offers the way back.
    await expect(canvas.getByText(/iOS only asks once/)).toBeVisible();

    // The path, as steps rather than the breadcrumb the card behind it draws.
    for (const step of ['Settings', 'Privacy and Security', 'Microphone', 'Knowunity']) {
      await expect(canvas.getAllByText(step).length).toBeGreaterThan(0);
    }

    // THE WAY BACK TO VOICE. Before this the denied screen had none: a student
    // who went and enabled the mic returned to a screen whose only button was
    // "Type instead".
    await expect(canvas.getByRole('button', { name: "I've turned it on" })).toBeVisible();

    // The text path is offered INSIDE the sheet too, not only on the scrimmed
    // screen behind it — the same pairing the permission primer's sheet uses.
    // A student who cannot go to Settings right now should not have to dismiss
    // the sheet first to find the way forward. So there are two, and they are
    // told apart by VARIANT, not size: the screen's is Primary, the sheet's is
    // Secondary beneath its own Primary.
    //
    // This asserted the sheet's was size L, which was true only because the
    // build ran two button sizes at once — M on the recall and permission
    // screens, L on the sheets and end-of-session screens. Every button is M
    // now, so size can no longer tell two buttons apart, and asserting it would
    // pin the inconsistency rather than the intent.
    const typeInstead = canvas.getAllByRole('button', { name: 'Type instead' });
    await expect(typeInstead).toHaveLength(2);
    await expect(typeInstead.some((b) => b.classList.contains('knw-button--Primary'))).toBe(true);
    await expect(typeInstead.some((b) => b.classList.contains('knw-button--Secondary'))).toBe(true);
    // One size, every button, every screen.
    await expect(typeInstead.every((b) => b.classList.contains('knw-button--M'))).toBe(true);
  },
};

export const Misheard: Story = {
  name: '11 · Misheard transcript',
  render: () => <MisheardScreen onMisheard={fn()} onConfirmed={fn()} onRetry={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // Principle 4: show what was heard, so a misheard answer reads as the app
    // failing, not the student. The card instances transcriptSection to do it.
    await expect(canvas.getByText('WHAT YOU SAID')).toBeVisible();
    await expect(canvasElement.querySelectorAll('.knw-transcript')).toHaveLength(1);

    // The amber chip is what separates "we mis-heard you" from "you were
    // wrong" before the label does — and it clears AA, which the violet and
    // the orange both failed to.
    const card = canvasElement.querySelector('.knw-rrc--Misheard') as HTMLElement;
    await expect(card).toBeTruthy();
    const chip = card.querySelector('.knw-rrc__badge') as HTMLElement;
    await expect(getComputedStyle(chip).backgroundColor).toBe('rgb(245, 181, 61)');

    // Both verdict-correction controls are present.
    await expect(canvas.getByRole('button', { name: 'App misheard me' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: /what I said/ })).toBeVisible();

    // THE ORB IS LIVE. This screen exists so the student can say it again, so
    // a disabled mic would contradict the whole screen.
    await expect(canvasElement.querySelector('.knw-fab--Idle')).toBeTruthy();
    await expect(canvas.getByRole('button', { name: 'Speak to start' })).toBeVisible();

    // No skip: the free re-attempt is already here, so a skip would trade it
    // for a recorded miss.
    await expect(canvas.queryByRole('button', { name: 'Skip question' })).toBeNull();

    /* MEASURE AFTER THE CARD HAS LANDED. `.knw-rrc` now rises on mount — the
       verdict is the most consequential thing this loop shows and it used to
       appear with no beat at all — so every `getBoundingClientRect` below runs
       mid-flight unless it waits. The card is translated down by
       `space/layout/M` at frame 0, which reads as a 12px error in the tuck
       measurement and nothing else.

       Waiting on the element's own animations rather than a fixed timeout, so
       this stays correct if the duration token changes. */
    await Promise.all(card.getAnimations({ subtree: true }).map((a) => a.finished));

    // The card clears the slot gutter and re-applies the recall gutter, so its
    // surface is 350 — what `recall-partial` and `recall-correct` both draw,
    // not the scaffold's 358.
    const surface = card.querySelector('.knw-rrc__card') as HTMLElement;
    const sb = surface.getBoundingClientRect();
    await expect(Math.round(sb.width)).toBe(350);
    await expect(Math.round(sb.left)).toBe(20);

    // The tuck is measured to the VISIBLE panel, not the wrapper box. The card
    // pads 12 above its own surface, so tucking to the box left the mascot at
    // 27.5% here while the bubble screens sat at 37.5%.
    const mascot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    const overlap = mascot.getBoundingClientRect().bottom - surface.getBoundingClientRect().top;
    await expect(Math.round(overlap)).toBe(45);
    await expect(+(overlap / mascot.getBoundingClientRect().height).toFixed(3)).toBe(0.375);
  },
};

export const ReRecord: Story = {
  name: '11b · Re-record offer',
  /* `onSkip`, not `onNextQuestion`. The handler calls `session.skip()` — a
     recorded miss on the revise list — so a name and a label that both said
     "next question" described paging forward while the call cost the student
     the term. Renamed at the component; this call site follows it. */
  render: () => <ReRecordScreen onContinue={fn()} onSkip={fn()} onTypeAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The second beat: the dispute is settled, only the choice is left. No
    // transcript, no card, no verdict.
    await expect(canvas.getByRole('heading', { name: /Sometimes it can happen/ }))
      .toBeVisible();
    await expect(canvasElement.querySelector('.knw-transcript')).toBeNull();
    await expect(canvasElement.querySelector('.knw-rrc')).toBeNull();

    // Measured off the render, because one node in this screen is a broken
    // instance reference that crashes traversal: headline/XS-bold.
    const h = canvas.getByRole('heading', { name: /Sometimes it can happen/ });
    const hs = getComputedStyle(h);
    await expect(hs.fontSize).toBe('18px');
    await expect(hs.lineHeight).toBe('20px');
    await expect(hs.textAlign).toBe('center');

    // Knowie stands free here — the only recall screen with nothing to tuck
    // behind — so there is no negative margin pulling anything over him.
    await expect(canvasElement.querySelector('.knw-recall__mascot')).toBeNull();
    await expect(canvasElement.querySelector('.knw-mascot')).toBeTruthy();

    /* buttonGroup Vertical: the two choices sit flush and equal-weight, and
       they are PINNED TO THE BOTTOM SLOT — the reverse of what this story used
       to assert. Figma floats them at y351 over 365px of empty frame, which an
       audit of every built route showed left this among only three screens
       whose primary action sat in the top half of the viewport, against
       design-system.md's "CTAs low so thumbs reach them". */
    await expect(canvasElement.querySelector('.knw-buttongroup--Vertical')).toBeTruthy();
    const bottom = canvasElement.querySelector('.knw-screen__bottom') as HTMLElement;
    await expect(bottom).toBeTruthy();
    await expect(bottom.querySelector('.knw-buttongroup')).toBeTruthy();

    /* THE SECOND CHOICE NAMES ITS COST. It read "Next question", which sounds
       like paging forward, while calling `session.skip()` — a recorded miss on
       the revise list. On the screen whose whole premise is that a bad
       transcript was never the student's fault, that is the one control that
       has to say what it charges. Same words the loop uses for the same action
       everywhere else. */
    const cont = canvas.getByRole('button', { name: 'Continue' });
    const skip = canvas.getByRole('button', { name: 'Skip question' });
    await expect(canvas.queryByRole('button', { name: 'Next question' })).toBeNull();
    await expect(Math.round(skip.getBoundingClientRect().top - cont.getBoundingClientRect().bottom))
      .toBe(0);

    // And the text path still trails the choice, as it does on every screen.
    await expect(bottom.querySelector('.knw-typeanswer')).toBeTruthy();
  },
};

/** The escapes are the point: every turn has a way out that isn't voice. */
export const EscapesAlwaysPresent: Story = {
  name: 'Every turn has a way out',
  render: () => <IdleScreen onRecord={fn()} onTypeAnswer={fn()} onSkip={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    const type = canvas.getByRole('button', { name: 'Type instead' });
    const skip = canvas.getByRole('button', { name: 'Skip question' });
    await expect(type).toBeVisible();
    await expect(skip).toBeVisible();

    // SKIP IS PINNED LOW NOW — a full-width bar in the bottom slot, below
    // everything else on the turn (recall iteration, 16301:6756).
    await expect(skip.closest('.knw-screen__bottom')).toBeTruthy();
    await expect(skip.getBoundingClientRect().top).toBeGreaterThan(type.getBoundingClientRect().bottom);
    await expect(Math.round(skip.getBoundingClientRect().width)).toBe(358);
    await expect(skip.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
    // The ✕ is the other way out.
    await expect(canvas.getByRole('button', { name: 'Leave session' })).toBeVisible();
    void canvasElement;
  },
};

export const Idle: Story = {
  name: '9 · Idle',
  render: () => (
    <IdleScreen
      intro="Welcome to your study session on world history. Let's start with how historians handle evidence."
      onRecord={fn()}
      onSkip={fn()}
      onTypeAnswer={fn()}
      onExit={fn()}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    // `idle` (16301:6756): "Tap to answer" over the mic, "Type instead" under.
    await expect(canvas.getByRole('button', { name: 'Tap to answer' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Type instead' })).toBeVisible();
    await expect(canvas.getByText(/Welcome to your study session/)).toBeVisible();

    // The question in the bubble, Knowie tucked behind it.
    const mascot = canvasElement.querySelector('.knw-recall__mascot') as HTMLElement;
    const bubble = canvasElement.querySelector('.knw-recall__bubble') as HTMLElement;
    const overlap = mascot.getBoundingClientRect().bottom - bubble.getBoundingClientRect().top;
    await expect(+(overlap / mascot.getBoundingClientRect().height).toFixed(3)).toBe(0.375);

    // Skip is the full-width bar at the bottom, not a link by the question.
    const skip = canvas.getByRole('button', { name: 'Skip question' });
    await expect(skip.closest('.knw-screen__bottom')).toBeTruthy();
    await expect(skip.classList.contains('knw-button--Primary')).toBe(true);

    // The exit is a thumb target.
    const exit = canvas.getByRole('button', { name: 'Leave session' });
    await expect(Math.round(exit.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    const bar = canvasElement.querySelector('.knw-progress') as HTMLElement;
    await expect(getComputedStyle(bar).height).toBe('16px');
  },
};

export const IdleLaterTurn: Story = {
  name: '9b · Idle — a later turn, no welcome',
  render: () => <IdleScreen onRecord={fn()} onSkip={fn()} onTypeAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('button', { name: 'Tap to answer' })).toBeVisible();
    // The greeting belongs to the first turn only.
    await expect(canvas.queryByText(/Welcome to your study session/)).toBeNull();
    await expect(canvasElement.querySelector('.knw-recall__intro')).toBeNull();
    await expect(canvasElement.querySelector('.knw-recall__prompt')).toBeTruthy();
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();
  },
};

export const ListeningTalking: Story = {
  name: '10 · Listening — sound arriving',
  render: () => <ListeningScreen talking onSend={fn()} onSkip={fn()} onTypeAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The caption is "Listening", not voiceFab's own "Tap to send" default —
    // on this screen the caption's job is to say what the app is doing.
    await expect(canvas.getByRole('button', { name: 'Listening' })).toBeVisible();
    await expect(canvasElement.querySelector('.knw-fab--Recording')).toBeTruthy();

    // The waveform says sound is arriving. This is the whole screen.
    await expect(canvas.getByLabelText('Recording your answer')).toBeVisible();

    // THE QUESTION STAYS ON SCREEN — the updated Figma frame (16219:12449)
    // restates it under the waveform, without the intro line idle carries.
    await expect(canvasElement.querySelector('.knw-recall__bubble')).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-recall__intro')).toBeNull();
    await expect(canvas.getByText(/turning points/)).toBeVisible();

    // NO DISCARD. Nothing is recorded yet to throw away; voiceFab enforces it.
    await expect(canvas.queryByRole('button', { name: 'Discard and re-record' })).toBeNull();

    // THE ITERATION (16301:6570): the question above, then under the orb a
    // live line with a running clock, and the bare waveform — no card.
    await expect(canvas.getByText(/^Listening, 0:0\d$/)).toBeVisible();
    const orb = canvasElement.querySelector('.knw-fab__stage') as HTMLElement;
    const wave = canvasElement.querySelector('.knw-waveform') as HTMLElement;
    await expect(wave.classList.contains('knw-waveform--bare')).toBe(true);
    await expect(wave.getBoundingClientRect().top).toBeGreaterThan(orb.getBoundingClientRect().bottom);
    const bubble = canvasElement.querySelector('.knw-recall__bubble') as HTMLElement;
    await expect(bubble.getBoundingClientRect().bottom).toBeLessThan(orb.getBoundingClientRect().top);

    // Skip, pinned low with every other turn's.
    const skip = canvas.getByRole('button', { name: 'Skip question' });
    await expect(skip.closest('.knw-screen__bottom')).toBeTruthy();
  },
};

export const ListeningSilent: Story = {
  name: '10b · Listening — paused',
  render: () => <ListeningScreen talking={false} onSend={fn()} onExit={fn()} />,
  play: async ({ canvas }) => {
    // The only thing that changes between Figma's two frames.
    await expect(canvas.getByLabelText('Microphone on, waiting for you to speak')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Listening' })).toBeVisible();
  },
};

export const Processing: Story = {
  name: '12 · Knowie thinking',
  // No onDone, so the hold never arms and the state stays inspectable.
  render: () => <ProcessingScreen />,
  play: async ({ canvas, canvasElement }) => {
    // AND NO WAY OUT, which is the one turn in the loop like that. The judge is
    // mid-verdict: there is nothing to go back to, and a ✕ here would abandon a
    // take that is about to be answered. `RecallHeader` draws the exit only
    // when one is wired, so the screen says it has none by wiring none.
    await expect(canvas.queryByRole('button', { name: 'Leave session' })).toBeNull();
    await expect(canvasElement.querySelector('.knw-recall__exit-slot')).toBeTruthy();
    // The slot stays, so the progress bar keeps the width and position it has
    // on every other screen rather than growing into the gap.

    // NOTHING IS INTERACTIVE. Voice_UX 1C: "Can do: nothing interactive." The
    // orb is a role=img, not a button, so a student cannot double-submit by
    // tapping it again — which is the failure this state exists to prevent.
    await expect(canvasElement.querySelector('.knw-fab--Thinking')).toBeTruthy();
    await expect(canvas.queryByRole('button', { name: 'Evaluating…' })).toBeNull();
    await expect(canvas.getByLabelText('Evaluating…')).toBeVisible();

    // The transcript stays up: it is the evidence the answer landed.
    await expect(canvas.getByText('WHAT YOU SAID')).toBeVisible();
    await expect(canvas.getByLabelText('Knowie is thinking')).toBeVisible();

    // ONE PROGRESS BAR, NOT TWO. Figma draws a second one under the transcript
    // and it was built, then removed: both were fed the same session
    // percentage, so the lower one read as "the judge is working" while
    // reporting "you are on term 1 of 4", and sat at 0 for the whole wait.
    await expect(canvasElement.querySelectorAll('[role="progressbar"]')).toHaveLength(1);

    // AND SOMETHING MOVES. With the second bar gone the screen was entirely
    // still for 2.6s, which is the frozen-app read Voice_UX 6 covers. The orb
    // drifts between the scale's two blur steps on the `breath` loop.
    const orb = canvasElement.querySelector('.knw-fab--Thinking .knw-fab__button') as HTMLElement;
    const os = getComputedStyle(orb);
    await expect(os.animationName).toBe('knw-fab-think');
    await expect(os.animationIterationCount).toBe('infinite');
    await expect(os.animationDirection).toBe('alternate');
  },
};

export const ResultHint1: Story = {
  name: '13 · Result — hint inside the card',
  render: () => (
    <ResultScreen rung="hint1" verdict="Wrong" onRecord={fn()} onNextAction={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    // THE HINT IS INSIDE THE CARD on rungs 1 and 2 — a sibling of the card's
    // body, which is where Figma draws `hint1`.
    const card = canvasElement.querySelector('.knw-rrc__card') as HTMLElement;
    await expect(card.querySelector('.knw-rrc__hint')).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-recall__hint-panel')).toBeNull();

    // THE HINT'S MARK TAKES THE LABEL'S COLOUR, and for a long time it did not.
    // `.knw-rrc--Wrong .knw-iconslot` reads "every icon slot in a wrong card"
    // and means "the badge's icon slot", so it also painted the hint's icon the
    // badge's dark green — legible on the red chip, invisible on the card.
    //
    // It hid because the mark used to be a FILLED lightbulb: a solid blob of
    // any dark colour still reads as an icon, just an indistinct one. Redrawn
    // as Figma's stroked alert-circle, a ring in the wrong colour is obvious.
    const hintLabel = card.querySelector('.knw-rrc__hint-label') as HTMLElement;
    const mark = hintLabel.querySelector('svg path') as SVGPathElement;
    await expect(mark).toBeTruthy();
    await expect(getComputedStyle(mark).fill).toBe(getComputedStyle(hintLabel).color);

    // A hint tightens the card's gap to Space/200. Without the modifier it
    // would silently inherit the 32 the hintless states use.
    await expect(getComputedStyle(card).rowGap).toBe('8px');

    // THE CARD DRAWS ITS OWN BADGE. Exactly one — composing chipFeedback
    // alongside would repeat it, which is the bug that once printed the
    // transcript twice.
    await expect(canvasElement.querySelectorAll('.knw-rrc__badge')).toHaveLength(1);
    // AND NO TRANSCRIPT. The revise ladder (16301:5515) drops "What you said"
    // from every hint rung: the card is the score, the verdict and the hint.
    await expect(canvasElement.querySelector('.knw-transcript')).toBeNull();

    // The next-action is a real control here — Figma labels it "Skip Question",
    // and it is this screen's only skip.
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();

    // The orb is ON this screen: the next attempt starts here, not back at idle.
    await expect(canvas.getByRole('button', { name: 'Speak to start' })).toBeVisible();

    // The question is restated flat, with no mascot tucked behind it.
    await expect(canvasElement.querySelector('.knw-recall__askbar')).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-recall__mascot')).toBeNull();
  },
};

export const ResultHint2: Story = {
  name: '13a · Result — hint 2, the middle rung',
  /* THE ONE RUNG WITH NO STORY. Only hint1 and hint3 were covered, so the
     middle of the ladder — the rung a student is most likely to actually see,
     since it needs only one miss to reach — had no test surface at all. It
     rendered correctly; nothing would have told us if it stopped. */
  render: () => (
    <ResultScreen rung="hint2" verdict="Partial" onRecord={fn()} onNextAction={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    // Still inside the card. Promotion happens at hint3 and nowhere earlier.
    const card = canvasElement.querySelector('.knw-rrc__card') as HTMLElement;
    await expect(card.querySelector('.knw-rrc__hint')).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-recall__hint-panel')).toBeNull();

    /* PARTIAL AT HINT2 IS REACHABLE, and is what the ladder now shows while
       the student climbs — `post-war-order`'s attempt1 and hint1 takes both
       score Partial, so this is the second of them. The card leads with the
       score ring rather than a bare verdict badge, which is the whole point of
       showing partial credit: a number that moved. */
    /* `.knw-rrc__score-ring`, NOT `.knw-percentage`. The card draws its own
       ring; `Percentage` is the standalone component the summary uses. Two
       different elements for the same idea, which is worth knowing before
       asserting on either. */
    await expect(canvasElement.querySelector('.knw-rrc__score-ring')).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-rrc__score-text')?.textContent).toBe('65%');

    // The ladder knows which rung it is on.
    const ladder = canvasElement.querySelector('.knw-ladder') as HTMLElement;
    await expect(ladder.getAttribute('aria-label')).toContain('2');

    // Same controls as every other ladder rung: a skip, and the orb.
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Speak to start' })).toBeVisible();
  },
};

export const ResultHint3: Story = {
  name: '13b · Result — hint 3, warm and inside the card',
  render: () => (
    <ResultScreen
      rung="hint3"
      verdict="Partial"
      hintLabel="Hint 3"
      hint="Ask yourself: if two historians describe the same event differently, what would a historical thinker do?"
      onRecord={fn()}
      onNextAction={fn()}
      onReveal={fn()}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    // HINT 3 IS BACK INSIDE THE CARD. It used to be promoted to a panel below
    // it; the revise ladder (16301:5617) keeps it in and warms it instead.
    const card = canvasElement.querySelector('.knw-rrc__card') as HTMLElement;
    const hint = card.querySelector('.knw-rrc__hint--warm') as HTMLElement;
    await expect(hint).toBeTruthy();

    // A LIGHTBULB HERE, NOT THE CARD'S ALERT-CIRCLE. Figma escalates the mark
    // with the rung — "notice this" on 1 and 2, "here is the idea" on the last.
    const label = hint.querySelector('.knw-rrc__hint-label') as HTMLElement;
    await expect(label.querySelector('circle')).toBeNull();
    const mark = label.querySelector('svg path') as SVGPathElement;
    await expect(mark).toBeTruthy();
    await expect(getComputedStyle(mark).stroke).toBe(getComputedStyle(label).color);
    await expect(getComputedStyle(mark).fill).toBe('none');

    // OUTLINED IN ITS LABEL'S GOLD at radius 12 — `radius/inner` — on the
    // warm wash. The outline is most of why it reads as the last hint.
    const style = getComputedStyle(hint);
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).toBe(getComputedStyle(label).color);
    await expect(style.borderTopLeftRadius).toBe('12px');
    await expect(style.backgroundColor).toBe('rgba(58, 45, 11, 0.2)');

    // THE SKIP BECOMES "REVEAL ANSWER" on the last rung, and the orb stays
    // for one more try.
    await expect(canvas.getByRole('button', { name: 'Reveal answer' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Skip question' })).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Speak to start' })).toBeVisible();
  },
};

export const ResultHint3Wrong: Story = {
  name: '13c · Result — wrong on the last rung',
  /* A WRONG ANSWER AT RUNG 3 GETS NO THIRD HINT. The revise ladder's "Wrong
     answer" frame (16301:5541) draws a 0% ring, "Not quite" and "What was
     missing", then offers the answer. The hint is passed here on purpose: the
     screen has to drop it, not the caller. */
  render: () => (
    <ResultScreen
      rung="hint3"
      verdict="Wrong"
      score="0%"
      hintLabel="Hint 3"
      hint="This hint must not render."
      onRecord={fn()}
      onNextAction={fn()}
      onReveal={fn()}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-rrc__hint')).toBeNull();
    await expect(canvas.queryByText('This hint must not render.')).toBeNull();

    // The red ring beside the badge — Wrong carries a score now.
    await expect(canvasElement.querySelector('.knw-rrc__score-ring')).toBeTruthy();
    await expect(canvas.getByText('0%')).toBeVisible();
    await expect(canvas.getByText('Not quite')).toBeVisible();
    await expect(canvas.getByText('WHAT WAS MISSING')).toBeVisible();
    await expect(canvasElement.querySelector('.knw-transcript')).toBeNull();

    await expect(canvas.getByRole('button', { name: 'Reveal answer' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Speak to start' })).toBeVisible();
  },
};

export const NoAudio: Story = {
  name: '11 · Didn’t catch that',
  render: () => <NoAudioScreen onRetry={fn()} onTypeAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas }) => {
    // 09c (16311:14691): the system failed to hear — not the student failing
    // to speak — and both ways on are free.
    await expect(canvas.getByRole('heading', { name: 'Didn’t catch that' })).toBeVisible();
    await expect(canvas.getByText(/Nothing came through/)).toBeVisible();
    const retry = canvas.getByRole('button', { name: 'Try again' });
    await expect(retry).toBeVisible();
    // The text fallback is a real button now, not the small link.
    await expect(canvas.getByRole('button', { name: 'Type instead' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Type your answer' })).toBeNull();
    // Both clear the 48 floor at their rendered size.
    await expect(retry.getBoundingClientRect().height).toBeGreaterThanOrEqual(48);
  },
};

/**
 * THE THREE VERDICT PATHS, and why only two of them have a verdict screen.
 *
 * - **Correct** — its own screen, `correct-answer` (`15664:13017`). A mascot,
 *   the card, the orb. No ladder.
 * - **Partial** — the hint ladder, `ResultScreen`. Already built; a miss climbs
 *   one rung and reads the next hint.
 * - **Wrong** — no standalone screen, by design. A term is only ever declared
 *   wrong once the ladder has run out, which is `RevealScreen`. There is no
 *   moment in the loop where "wrong" is a verdict a student can be handed
 *   without having been offered every hint first.
 */
export const Correct: Story = {
  name: '13a · Correct — the pass',
  render: () => (
    <CorrectScreen onCompare={fn()} onNextQuestion={fn()} onTypeAnswer={fn()} onExit={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    // NOT THE LADDER SHELL. `correct-answer` draws a 3XL mascot and neither of
    // the two things every hint-ladder frame draws — the ladder itself, and the
    // restated question. A four-rung ladder over a correct answer would tell
    // the student they are three steps from something.
    await expect(canvasElement.querySelector('.knw-ladder')).toBeNull();
    await expect(canvasElement.querySelector('.knw-recall__askbar')).toBeNull();
    // 2XL AND TUCKED — the same mascot block as every other recall turn.
    // `recall-correct.png` and `recall-partial.png` draw Knowie at about 100
    // across with the card over his lower third; 2XL (120) is the step that
    // lands on. Figma's instance says 3XL and is then resized to 96–120, and
    // 3XL is 200 — the screenshots and the drawn sizes agree with each other
    // and not with the label.
    const slot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(slot.classList.contains('knw-mascot--2XL')).toBe(true);

    /* MEASURE AFTER THE CARD HAS LANDED — the same wait `Misheard` carries,
       and for the same reason: `.knw-rrc` rises on mount, so every box read
       before it settles is 12px low. This assertion passed on timing luck
       rather than on the wait, which is worse than failing — the tuck it
       guards is a real invariant and the story would have started failing on
       a slower machine for a reason that has nothing to do with the tuck. */
    await Promise.all(
      canvasElement.getAnimations({ subtree: true }).map((a) => a.finished),
    );

    const mascotBox = slot.getBoundingClientRect();
    const card = canvasElement.querySelector('.knw-rrc__card') as HTMLElement;
    const cardBox = card.getBoundingClientRect();
    // The card climbs over Knowie rather than sitting under him.
    await expect(cardBox.top).toBeLessThan(mascotBox.bottom);
    // And the surface lands at the 350 both screenshots draw, not 32 narrower.
    await expect(Math.round(cardBox.width)).toBe(350);

    // The card reports the pass and shows Knowie's answer in place of the
    // transcript (16301:5619), and offers nothing to contest.
    await expect(canvas.getByText('Correct')).toBeVisible();
    await expect(canvas.getByText('100%')).toBeVisible();
    await expect(canvasElement.querySelector('.knw-transcript')).toBeNull();
    await expect(canvas.getByText(/Stalingrad, Midway and D-Day/)).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'App misheard me' })).toBeNull();

    // TWO WAYS ON, AND THEY DO DIFFERENT THINGS. "Next question" settles and
    // moves; the orb opens the model answer to read this one against.
    await expect(canvas.getByRole('button', { name: 'Next question' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Compare with Knowie' })).toBeVisible();

    // The text escape is on this turn like every other.
    await expect(canvas.getByRole('button', { name: 'Type your answer' })).toBeVisible();
  },
};

export const CorrectFeedback: Story = {
  name: "13b · Correct — Knowie's answer",
  render: () => <CorrectFeedbackScreen onNextQuestion={fn()} onTypeAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The model answer, to read against what the student actually said.
    await expect(canvas.getByText(/Stalingrad, Midway and D-Day/)).toBeVisible();
    await expect(canvas.queryByText('Try it yourself after reading')).toBeNull();

    // IT IS NOT THE REVEAL, though they share the card. Reveal is where a term
    // is declared wrong, so it keeps the ladder and restates the question the
    // student never managed to answer. Here the question is behind them.
    await expect(canvasElement.querySelector('.knw-ladder')).toBeNull();
    await expect(canvasElement.querySelector('.knw-recall__askbar')).toBeNull();
    // 2XL, not the 3XL the Figma instance's variant claims: all three
    // correct-loop frames resize the slot to between 96 and 120, and 3XL is
    // 200. The drawn size wins over the label.
    const slot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(slot.classList.contains('knw-mascot--2XL')).toBe(true);

    // THE TERM IS SETTLED, SO THE ORB MOVES ON. It used to read "Say it back"
    // and route through the recorder, which re-judged a passed term and put
    // the student back on `correct`. Figma's `Next question after correct
    // answer` (16071:25942) is what follows this screen.
    await expect(canvas.getByRole('button', { name: 'Next question' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Say it back' })).toBeNull();
  },
};

export const SessionRating: Story = {
  name: '15 · Session rating',
  render: () => <SessionRatingScreen onContinue={fn()} onChange={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'How confident are you now?' }))
      .toBeVisible();

    // NO TOP NAV. The session is over; there is no turn left to leave, so the
    // frame carries a status bar and nothing else.
    await expect(canvas.queryByRole('button', { name: 'Leave session' })).toBeNull();
    await expect(canvas.queryByRole('progressbar')).toBeNull();

    // The topics are a real list, so three of them are announced as three —
    // Figma draws them as three loose text layers, which reads as one
    // paragraph.
    await expect(canvasElement.querySelectorAll('.knw-rating__topic-list li')).toHaveLength(3);
    await expect(canvas.getByText('World War II').tagName).toBe('LI');

    // SINGLE CHOICE, AND NOW ANNOUNCED AS ONE. Figma draws checkboxes and the
    // behaviour has always been single-select, but the accessibility tree used
    // to describe three independent toggles — so a screen reader said "pick
    // any" about a question that takes one answer. `Checkbox` has a documented
    // radio mode; the list is the group, named by the question.
    const group = canvas.getByRole('radiogroup');
    await expect(group).toHaveAccessibleName('How confident are you now?');
    await expect(canvas.queryAllByRole('checkbox')).toHaveLength(0);
    const boxes = canvas.getAllByRole('radio');
    await expect(boxes).toHaveLength(3);
    for (const b of boxes) await expect(b).toHaveAttribute('aria-checked', 'false');

    // ONE TAB STOP FOR THE GROUP, not three: unanswered, the first row holds
    // it, and arrows move within the group from there.
    await expect(boxes.map((b) => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    await userEvent.click(boxes[0]);
    await expect(boxes[0]).toHaveAttribute('aria-checked', 'true');

    // THE WHOLE ROW IS THE TARGET, not just the 24px disc at the end of it —
    // every list row in the app takes a tap anywhere along it, and one that
    // looks the same but only answers at one end is the kind of thing a student
    // blames themselves for. Clicking the LABEL selects.
    await userEvent.click(canvas.getByText('Somewhat less confident'));
    await expect(boxes[1]).toHaveAttribute('aria-checked', 'true');
    await expect(boxes[0]).toHaveAttribute('aria-checked', 'false');

    /* THE ROWS ARE A SCALE, SO THEY ARE IN ORDER. They used to run low, high,
       medium — three statements rather than three positions — while the
       comment above the array claimed "least confident first". A student who
       knows they are in the middle should be able to reach for the middle row
       without reading all three. Asserted by index, because that is the only
       thing that broke. */
    await expect(boxes.map((b) => b.closest('li')!.textContent)).toEqual([
      'I need to practice',
      'Somewhat less confident',
      'I am pretty confident for the most part',
    ]);

    /* The row is a tap target and nothing more: no tabindex, so the keyboard
       gets one stop per option rather than two, and `role=presentation`,
       because the <ul> around it is the radio group now — a real listitem
       inside a radiogroup is an orphan, and axe fails the screen for it. */
    const rows = canvasElement.querySelectorAll('.knw-rating__option');
    for (const row of rows) {
      await expect(row.hasAttribute('tabindex')).toBe(false);
      await expect(row.getAttribute('role')).toBe('presentation');
    }

    // ANSWERING IS OPTIONAL, so there is a way back to having not answered,
    // and Continue never waits on a choice.
    await userEvent.click(boxes[1]);
    await expect(boxes[1]).toHaveAttribute('aria-checked', 'false');
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();

    // ARROWS MOVE, THEY DO NOT CHOOSE — the one deliberate departure from the
    // APG radio pattern, and the reason is the rule directly above: a student
    // reading the three options with the keyboard would otherwise have
    // answered the question by the time they reached the third.
    boxes[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(boxes[1]).toHaveFocus();
    await expect(boxes[1]).toHaveAttribute('aria-checked', 'false');

    // And they wrap, so the group has no dead end at either end.
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await expect(boxes[0]).toHaveFocus();
  },
};

/**
 * THE SELECTED TREATMENT, which no story pinned until now.
 *
 * `SessionRating` above only ever renders unanswered and reaches the filled
 * state through `userEvent` inside its own `play` — which means the composed
 * Selected row was never checkable side by side with Unselected in the
 * library's own verification surface, and a synthetic click leaves a
 * `:focus-visible` ring that a real tap would not, so what the story showed
 * was not what a student sees. This pins the state instead of performing it.
 */
export const SessionRatingChosen: Story = {
  name: '15b · Session rating — answered',
  render: () => (
    <SessionRatingScreen value="I need to practice" onContinue={fn()} onChange={fn()} />
  ),
  play: async ({ canvas }) => {
    const boxes = canvas.getAllByRole('radio');
    await expect(boxes[0]).toHaveAttribute('aria-checked', 'true');
    await expect(boxes[1]).toHaveAttribute('aria-checked', 'false');
    await expect(boxes[2]).toHaveAttribute('aria-checked', 'false');

    // THE CHOSEN ROW IS FILLED AND THE OTHERS ARE OUTLINES — the difference
    // this story exists to make visible. Asserted as "the fill is a colour"
    // rather than as a hex, so it survives a token moving.
    const fill = (b: HTMLElement) =>
      getComputedStyle(b.querySelector('.knw-checkbox__box') as HTMLElement).backgroundColor;
    await expect(boxes[0].className).toContain('knw-checkbox--Selected');
    await expect(fill(boxes[0])).not.toBe('rgba(0, 0, 0, 0)');
    await expect(fill(boxes[1])).toBe('rgba(0, 0, 0, 0)');
    // And it carries the checkmark, so the state does not rest on colour alone.
    await expect(boxes[0].querySelector('.knw-checkbox__mark')).toBeTruthy();
    await expect(boxes[1].querySelector('.knw-checkbox__mark')).toBeNull();

    // THE TAB STOP FOLLOWS THE ANSWER. Once something is chosen it is the
    // chosen row that holds the group's single stop, not the first row.
    await expect(boxes.map((b) => b.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);

    // Still optional, still live.
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
  },
};

/**
 * THE PARTIAL VERDICT on the ladder. The revise ladder (16301:5616) draws the
 * score ring, "Almost there" and the hint — and nothing between them.
 */
export const ResultPartial: Story = {
  name: '13 · Partial — the score and the hint',
  render: () => (
    <ResultScreen rung="hint1" verdict="Partial" score="65%" onRecord={fn()} onNextAction={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('65%')).toBeVisible();
    await expect(canvas.getByText('Almost there')).toBeVisible();
    await expect(canvasElement.querySelector('.knw-rrc__hint')).toBeTruthy();

    // NO TRANSCRIPT AND NO BREAKDOWN. Both used to sit between the score and
    // the hint; the redesign cut them so the next step is the next thing read.
    await expect(canvasElement.querySelector('.knw-transcript')).toBeNull();
    await expect(canvas.queryByText('WHAT YOU GOT')).toBeNull();
    await expect(canvas.queryByText('STILL MISSING')).toBeNull();
    await expect(canvas.queryByText('WHAT WAS MISSING')).toBeNull();

    await expect(canvasElement.querySelector('.knw-ladder')).toBeTruthy();
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();
  },
};

/**
 * THE END OF THE WRONG PATH. The Prototype page wires
 * `reveal -> the take -> wrong -> comparison -> summary`, and neither of these
 * two existed in the build.
 */
export const Wrong: Story = {
  name: '14a · Wrong — after the reveal',
  render: () => (
    <WrongScreen onCompare={fn()} onNextQuestion={fn()} onTypeAnswer={fn()} onExit={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    // NOT A STANDALONE WRONG VERDICT. It is reached only from the take that
    // follows the reveal — four rungs spent, the answer read, said back, and
    // still not landed. Nothing routes here mid-ladder, so no ladder is drawn.
    await expect(canvasElement.querySelector('.knw-ladder')).toBeNull();
    await expect(canvas.getByText('Not quite')).toBeVisible();
    await expect(canvas.getByText('WHAT WAS MISSING')).toBeVisible();

    // The mirror of the correct screen: same mascot, same shape, other card.
    const slot = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(slot.classList.contains('knw-mascot--2XL')).toBe(true);

    // The orb opens the comparison, not another attempt — there is no attempt
    // left to make.
    await expect(canvas.getByRole('button', { name: 'See the answer' })).toBeVisible();
  },
};

export const Comparison: Story = {
  name: '14b · Term detail — what you said, and the full answer',
  render: () => <ComparisonScreen onNext={fn()} onTryAgain={fn()} onExit={fn()} exitLabel="Close" />,
  play: async ({ canvas, canvasElement }) => {
    // `compare with knowie` (16319:17270): the tag, the question, both cards.
    await expect(canvas.getByText('Previous mistake')).toBeVisible();
    await expect(canvas.getByText('Correct answer')).toBeVisible();
    await expect(canvas.getByText('Your answer')).toBeVisible();

    // A drawn ✕, never the character — this screen used to print "✕".
    const close = canvas.getByRole('button', { name: 'Close' });
    await expect(close.textContent?.includes('✕')).toBe(false);
    await expect(close.querySelector('svg')).toBeTruthy();

    // One construction for both cards.
    const cards = canvasElement.querySelectorAll('.knw-compare__card');
    await expect(cards).toHaveLength(2);
    const [a, b] = [...cards].map((c) => getComputedStyle(c as HTMLElement));
    await expect(a.borderRadius).toBe(b.borderRadius);
    await expect(a.backgroundColor).toBe(b.backgroundColor);

    // The answer as points, each with the 16px green marker.
    await expect(canvasElement.querySelectorAll('.knw-compare__point').length).toBeGreaterThan(1);
    const tick = canvasElement.querySelector('.knw-compare__tick') as HTMLElement;
    await expect(getComputedStyle(tick).width).toBe('16px');

    // 21 Bold — headline/S, the frame's question step.
    const q = canvas.getByRole('heading', { level: 1 });
    await expect(getComputedStyle(q).fontSize).toBe('21px');

    await expect(canvas.getByRole('button', { name: 'Next' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Try again' })).toBeVisible();
  },
};

export const ComparisonUnaided: Story = {
  name: '14c · Term detail — an unaided pass',
  render: () => <ComparisonScreen tag={null} onNext={fn()} onTryAgain={fn()} onExit={fn()} />,
  play: async ({ canvas }) => {
    // Not a mistake, so not labelled one.
    await expect(canvas.queryByText('Previous mistake')).toBeNull();
  },
};

export const ComparisonSkipped: Story = {
  name: '14d · Term detail — a skip',
  render: () => <ComparisonScreen tag="Skipped" transcript={null} onNext={fn()} onTryAgain={fn()} onExit={fn()} />,
  play: async ({ canvas }) => {
    // Nothing to play back, said plainly rather than an empty box.
    await expect(canvas.getByText('You skipped this one.')).toBeVisible();
  },
};

export const Reveal: Story = {
  name: '14 · Reveal',
  render: () => <RevealScreen onTryNow={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // Reveal drops the transcript and the contest buttons — there is nothing
    // left to contest — and shows the model answer instead.
    await expect(canvasElement.querySelector('.knw-transcript')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'App misheard me' })).toBeNull();
    const answer = canvas.getByText(/United Nations, the Bretton Woods/);
    await expect(answer).toBeVisible();
    await expect(canvas.getByText('Try it yourself after reading')).toBeVisible();

    // THE ANSWER IS DRAWN AS THE ANSWER (16301:5618): success-green text in a
    // card outlined in the same green.
    const card = canvasElement.querySelector('.knw-rrc__card') as HTMLElement;
    await expect(getComputedStyle(card).borderTopWidth).toBe('1px');
    await expect(getComputedStyle(card).borderTopColor).toBe(getComputedStyle(answer).color);

    // ONE WAY ON — "Try now". No orb and no "Type your answer" on this screen,
    // the one recall screen exempt from the text-fallback rule (CLAUDE.md).
    // The recorder it leads to carries its own.
    await expect(canvas.getByRole('button', { name: 'Try now' })).toBeVisible();
    await expect(canvasElement.querySelector('.knw-fab__button')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Type your answer' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Next question' })).toBeNull();

    // The way out stays.
    await expect(canvas.getByRole('button', { name: 'Leave session' })).toBeVisible();
  },
};

export const Summary: Story = {
  name: '16 · Summary',
  render: () => <SummaryScreen onOpenTerm={fn()} onContinue={fn()} onRedo={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // `17 Summary` (16311:14220): one claim, then the rows it counted.
    const claim = canvas.getByRole('heading', { name: 'You explained 1 of 3 without help.' });
    await expect(getComputedStyle(claim).fontSize).toBe('33px');

    // A termRow per term, each with its own end state.
    const tags = [...canvasElement.querySelectorAll('.knw-termrow__tag')].map((t) => t.textContent);
    await expect(tags).toEqual(['Unaided', 'Revealed', 'Hinted']);
    await expect(canvas.getByText(/Tap any topic to play back/)).toBeVisible();

    // NO XP anywhere — dropped by the design owner.
    await expect(canvas.queryByText(/XP/)).toBeNull();
    await expect(canvasElement.querySelector('.knw-recall__xp')).toBeNull();

    // Continue leads; the redo carries the count.
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Redo 3 terms' })).toBeVisible();

    // The old ring, tiles and lists are gone.
    await expect(canvasElement.querySelector('.knw-percentage')).toBeNull();
    await expect(canvas.queryByText('You are strong in')).toBeNull();
  },
};

const openTerm = fn();

export const SummaryOpenTerm: Story = {
  name: '16b · Summary — a row opens its own term',
  render: () => <SummaryScreen onOpenTerm={openTerm} onContinue={fn()} onRedo={fn()} />,
  play: async ({ canvas }) => {
    // A destination about the thing tapped: the third row says 2.
    await userEvent.click(canvas.getByRole('button', { name: /Total war/ }));
    await expect(openTerm).toHaveBeenCalledWith(2);
  },
};

export const SummaryWantsPractice: Story = {
  name: '16c · Summary — "I need to practice"',
  render: () => <SummaryScreen confidence="low" onOpenTerm={fn()} onContinue={fn()} onRedo={fn()} />,
  play: async ({ canvasElement }) => {
    /* THE RATING STILL MATTERS. A student who says they need practice is
       offered the redo first; both ways on stay on screen. */
    const primary = canvasElement.querySelector('.knw-button--Primary') as HTMLElement;
    await expect(primary.textContent).toContain('Redo 3 terms');
  },
};

export const Exit: Story = {
  name: '8 · Exit sheet',
  render: () => <ExitScreen onKeepGoing={fn()} onLeave={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // `exit screen` (15807:21978): a plea, not a summary of consequences.
    // Knowie in tears, one 44pt line, one 21pt line under it.
    const title = canvas.getByRole('heading', { name: 'Please don’t leave' });
    await expect(title).toBeVisible();
    await expect(getComputedStyle(title).fontSize).toBe('44px');
    const body = canvas.getByText('Let me help you prep.');
    await expect(getComputedStyle(body).fontSize).toBe('21px');
    await expect(canvasElement.querySelector('.knw-plea__art')).toBeTruthy();

    // NOT A FORM. The beta's sheet asks "What made you stop?" over eight
    // reasons; sprint-context.md rejects that outright — a student trying to
    // leave should not be handed a research instrument. The frame agrees.
    await expect(canvas.queryByText(/what made you stop/i)).toBeNull();

    // Staying leads, because the student already chose to leave by tapping ✕
    // — the sheet's job is to make the cheaper option visible, not to re-ask.
    // Leaving stays one tap away, so it is a prompt and not a trap.
    const keep = canvas.getByRole('button', { name: 'Keep learning' });
    const leave = canvas.getByRole('button', { name: 'Leave' });
    await expect(keep.classList.contains('knw-button--Primary')).toBe(true);
    await expect(leave.classList.contains('knw-button--Secondary')).toBe(true);
    await expect(keep.getBoundingClientRect().bottom)
      .toBeLessThanOrEqual(leave.getBoundingClientRect().top);

    // App bar `Type=Default`: the handle alone. No ✕ — the two buttons are the
    // whole decision, and a third silent way out would only muddy which is
    // which.
    await expect(canvas.queryByRole('button', { name: 'Close' })).toBeNull();
    await expect(canvasElement.querySelector('.knw-sheet__handle')).toBeTruthy();
  },
};

export const Lesson: Story = {
  name: 'Lesson — the last look before the session',
  render: () => <LessonScreen onExplainOutLoud={fn()} onBack={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // 16311:15771: the violet header, three statTiles, a section per term.
    await expect(canvas.getByRole('heading', { name: 'World War II' })).toBeVisible();
    await expect(canvas.getByText('1939 – 1945')).toBeVisible();
    const folder = canvasElement.querySelector('.knw-lesson__folder') as HTMLElement;
    await expect(getComputedStyle(folder).backgroundColor).toBe('rgb(145, 120, 230)');

    // The stats are the statTile component, not a copy of it.
    await expect(canvasElement.querySelectorAll('.knw-lesson__stats .knw-stattile')).toHaveLength(3);

    // Four sections, all closed on arrival.
    const headers = canvasElement.querySelectorAll('.knw-accordion__header');
    await expect(headers).toHaveLength(4);
    await expect([...headers].every((h) => h.getAttribute('aria-expanded') === 'false')).toBe(true);

    // A section opens on its reading.
    await userEvent.click(canvas.getByRole('button', { name: 'Appeasement' }));
    await expect(canvas.getByRole('button', { name: 'Appeasement' })).toHaveAttribute('aria-expanded', 'true');

    // ONE CTA, LOW — Primary at size L, Figma's 56.
    const cta = canvas.getByRole('button', { name: 'Explain out loud' });
    await expect(Math.round(cta.getBoundingClientRect().height)).toBeGreaterThanOrEqual(48);
    // No mascot and no blue card any more.
    await expect(canvasElement.querySelector('.knw-mascot')).toBeNull();
  },
};

export const LessonRevising: Story = {
  name: 'Lesson — revising one term',
  /* From the summary's "Revise now": the term about to be retried opens on
     arrival, so the student lands on what they came back for. */
  render: () => <LessonScreen openIndex={1} onExplainOutLoud={fn()} onBack={fn()} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Appeasement' })).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('button', { name: 'Turning points' })).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.getByText(/Munich in 1938/)).toBeVisible();
  },
};

/* ===== the rail's other two features, one screen each ===== */

export const Summarize: Story = {
  name: 'Entry 6 · Summarize — one answer',
  render: () => <SummarizeScreen onBack={fn()} onHistory={fn()} onFeedback={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("What's mitosis?")).toBeVisible();

    // The key term is called out of the answer, not buried in it.
    const callout = canvasElement.querySelector('.knw-keyterm') as HTMLElement;
    await expect(callout).toBeTruthy();
    await expect(canvas.getByText('Key term')).toBeVisible();
    await expect(callout.textContent).toContain('tiny building block');

    /* ACCENT GREEN, NOT FEEDBACK GREEN — a key term is a category marker, not
       a verdict, and the two ramps' own descriptions forbid swapping them.

       WHAT THIS ASSERTION CAN AND CANNOT PROVE: `accent/green/*` and
       `feedback/success/*` resolve to the SAME primitives — green/500 and
       green/900 — so a computed colour cannot tell the two apart. This pins
       the value; only the stylesheet records the role. If the ramps ever
       diverge, this is the line that will catch the swap. */
    await expect(getComputedStyle(callout).borderTopColor).toBe('rgb(0, 195, 134)');
    await expect(getComputedStyle(callout).backgroundColor).toBe('rgb(10, 46, 34)');

    // Knowie is at screen level, never inside the callout.
    await expect(callout.querySelector('.knw-mascot')).toBeNull();

    // Nothing is listening, so the composer draws no microphone.
    await expect(canvas.queryByRole('button', { name: 'Record voice' })).toBeNull();
  },
};

export const Quiz: Story = {
  name: 'Entry 5 · Quiz — the question',
  render: () => <QuizScreen onAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText(/copies its whole playbook/)).toBeVisible();

    // Both answers are live, and neither carries a verdict yet.
    const options = [...canvasElement.querySelectorAll('.knw-quiz__option')] as HTMLButtonElement[];
    await expect(options).toHaveLength(2);
    for (const o of options) {
      await expect(o.disabled).toBe(false);
      await expect(o.dataset.state).toBe('Resting');
    }

    // The options clear the touch floor on their own height, so unlike the
    // chip they need no transparent hit area behind them.
    for (const o of options) {
      await expect(o.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }

    // No result until there is an answer.
    await expect(canvasElement.querySelector('.knw-quiz__result')).toBeNull();
  },
};

export const QuizAnswered: Story = {
  name: 'Entry 5b · Quiz — answered',
  render: () => <QuizScreen chosen={0} onContinue={fn()} onWhy={fn()} onFeedback={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    const options = [...canvasElement.querySelectorAll('.knw-quiz__option')] as HTMLButtonElement[];

    // Locked, so a second tap cannot change a verdict already given.
    for (const o of options) await expect(o.disabled).toBe(true);

    /* The right answer is marked, and the stylesheet binds the FEEDBACK ramp
       here — the opposite call from the key term's decorative green, because
       right and wrong is exactly what feedback/* is for. As above, the two
       ramps share their primitives, so this pins the value rather than the
       role. */
    await expect(options[0].dataset.state).toBe('Correct');
    await expect(getComputedStyle(options[0]).backgroundColor).toBe('rgb(10, 46, 34)');

    // The verdict is the system's own chip, relabelled — not a second tick.
    await expect(canvas.getByText('Nice!')).toBeVisible();

    // And a way on.
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Why?' })).toBeVisible();
  },
};

export const QuizAnsweredWrong: Story = {
  name: 'Entry 5c · Quiz — answered wrong',
  render: () => <QuizScreen chosen={1} onContinue={fn()} onWhy={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    const options = [...canvasElement.querySelectorAll('.knw-quiz__option')] as HTMLButtonElement[];

    /* A WRONG ANSWER STILL REVEALS THE RIGHT ONE. Figma only draws the correct
       case, so this is a decision rather than a reading: the one screen that
       teaches would teach nothing if it marked the miss and left the student
       guessing which was right. */
    await expect(options[1].dataset.state).toBe('Wrong');
    await expect(options[0].dataset.state).toBe('Correct');
    await expect(canvas.getByText('Not quite')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible();
  },
};
