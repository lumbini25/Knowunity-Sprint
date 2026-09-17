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
  FoldersScreen,
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
  render: () => <HomeScreen onExplainOutLoud={fn()} onOpenFolder={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'Evening study session Harry?' })).toBeVisible();

    // ONE FEATURE IS LIVE AND THE OTHERS SAY SO. Figma draws four; only
    // Explain out loud is in scope, so only it is pressable. Making the rest
    // navigate somewhere plausible would be the dishonest option in a demo.
    await expect(canvas.getByRole('button', { name: 'Explain out loud' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Quiz' })).toBeNull();
    await expect(canvas.getByText('Quiz')).toBeVisible();

    // The rail scrolls rather than wrapping — four chips do not fit 390, and
    // the file runs them off the right edge.
    const rail = canvasElement.querySelector('.knw-home__rail') as HTMLElement;
    await expect(getComputedStyle(rail).overflowX).toBe('auto');
    await expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);

    // 33 Bold — headline/L, bound exactly.
    const h = canvas.getByRole('heading', { name: 'Evening study session Harry?' });
    await expect(getComputedStyle(h).fontSize).toBe('33px');
  },
};

export const Compose: Story = {
  name: 'Entry 2 · Compose a set',
  render: () => <ComposeScreen onSend={fn()} onClearFeature={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // THE CHIP IS THE POINT. Picking the feature on the home screen attaches it
    // to the composer, and it stays attached until the student takes it off —
    // that is what makes the next message a practice set rather than a question.
    await expect(canvas.getByText('Explain out loud')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Remove Explain out loud' })).toBeVisible();

    // The keyboard's room is reserved without drawing the keys — device chrome,
    // the same constant the text fallback uses.
    await expect(canvasElement.querySelector('.knw-recall__keyboard')).toBeTruthy();
  },
};

export const ExplainEntry: Story = {
  name: 'Entry 3 · Explain out loud — ready',
  render: () => <ExplainEntryScreen onStart={fn()} onFeedback={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // THE CARD IS THE BUTTON. Figma draws no CTA inside it; the whole surface is
    // the affordance, which is how the app's feature tiles behave.
    const card = canvas.getByRole('button', { name: /Explain out loud/ });
    await expect(card.classList.contains('knw-entry__start')).toBe(true);
    await expect(card).toBeEnabled();

    // The student's turn is a pill on the right; Knowie's is running text at
    // full width. The file reserves the bubble for the student.
    const student = canvasElement.querySelector('.knw-entry__student') as HTMLElement;
    const reply = canvasElement.querySelector('.knw-entry__reply') as HTMLElement;
    await expect(getComputedStyle(student).alignItems).toBe('flex-end');
    await expect(reply.tagName).toBe('P');

    // A control with nothing wired to it is not drawn — the thumbs appear only
    // because this story passes onFeedback.
    await expect(canvas.getByText('Happy with the answer?')).toBeVisible();
  },
};

export const ExplainEntryGenerating: Story = {
  name: 'Entry 3b · Still generating',
  render: () => <ExplainEntryScreen generating onStart={fn()} />,
  play: async ({ canvas }) => {
    // Drawn but not tappable: `choosing chip` (15866:11790) shows the card in
    // place while Knowie is still writing the set.
    await expect(canvas.getByText('Generating…')).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Explain out loud/ })).toBeDisabled();
  },
};

export const Folders: Story = {
  name: 'Entry 4 · Choose a folder',
  render: () => <FoldersScreen onOpen={fn()} />,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'World History Foundations' })).toBeVisible();
    await expect(canvas.getByText('What have you studied so far?')).toBeVisible();
    // The other way in: something already studied, rather than a topic typed
    // into the chat. Both paths end at a set of concepts and the orb.
    await expect(canvas.getByText('World War II')).toBeVisible();
    await expect(canvas.getByText('1939 – 1945')).toBeVisible();
  },
};

export const AnswerSent: Story = {
  name: 'The take · beat 1 (state 5 lives here)',
  render: () => (
    <AnswerSentScreen onSend={fn()} onRetry={fn()} onDiscard={fn()} onSkip={fn()} onTypeAnswer={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    // A take exists and has NOT been submitted, so this beat WAITS — which is
    // what makes "cancel and re-record before send" (brief F2) reachable at
    // all. An earlier build ran the whole screen as a 300ms flash and killed it.
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();

    // WHAT WAS HEARD, NOT WHAT WAS ASKED. An earlier build drew a question
    // bubble here; the node draws a transcript, and by this beat checking the
    // transcript is the entire point — Voice_UX principle 4.
    await expect(canvas.getByText('WHAT YOU SAID')).toBeVisible();
    await expect(canvasElement.querySelector('.knw-recall__bubble')).toBeNull();

    // THE ORB IS STATUS, NOT A CONTROL. Figma captions it "Answer sent" and
    // puts the decisions in the buttons, which is what makes the trash, Retry
    // and Continue three different things rather than three ways out.
    await expect(canvasElement.querySelector('.knw-fab--Sent')).toBeTruthy();
    await expect(canvas.queryByRole('button', { name: 'Tap to send' })).toBeNull();

    const discard = canvas.getByRole('button', { name: 'Discard and re-record' });
    await expect(discard).toBeVisible();

    // The trash glyph rides in an iconSlot at Size=200.
    const slot = discard.querySelector('.knw-iconslot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('16px');

    // The trash sits to the LEFT of the orb.
    const orb = canvasElement.querySelector('.knw-fab__stage') as HTMLElement;
    await expect(discard.getBoundingClientRect().right)
      .toBeLessThanOrEqual(orb.getBoundingClientRect().left);

    // `cancel option`'s 40×40 interactive/secondary pill.
    const ds = getComputedStyle(discard);
    await expect(ds.width).toBe('40px');
    await expect(ds.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');

    // Both escapes are present, as they are on every recall turn.
    await expect(canvas.getByRole('button', { name: 'Type your answer' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();

    // Knowie at mascotSlot size=2XL, the size the frame uses, in the WAITING
    // pose — the decision on this beat is the student's, and excited is the
    // pose Knowie asks in.
    const slotEl = canvasElement.querySelector('.knw-mascot') as HTMLElement;
    await expect(slotEl.classList.contains('knw-mascot--2XL')).toBe(true);
    await expect(canvas.getByLabelText('Knowie, waiting')).toBeVisible();

    // THE TRANSCRIPT IS NOT TUCKED. `knw-recall__prompt` carries the question
    // bubble's 37.5% overlap and reusing it dragged the transcript up under
    // Knowie's feet; here they meet instead.
    const mascotBox = slotEl.getBoundingClientRect();
    const said = canvasElement.querySelector('.knw-transcript') as HTMLElement;
    await expect(said.getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(mascotBox.bottom - 1);

    // The progress count is not drawn — Top Nav Default sets showText=false —
    // but it is not discarded either: it reaches the progressbar's name, so it
    // is still available to anyone not reading the fill.
    await expect(canvas.queryByText('1/4')).toBeNull();
    await expect(canvas.getByRole('progressbar', { name: 'Terms answered: 1 of 4' }))
      .toBeVisible();

    // The XP cluster: the bolt is SOLID and takes accent/blue/bold, the exact
    // colour the app renders XP in.
    const xp = canvas.getByLabelText('0 XP this session');
    await expect(getComputedStyle(xp).color).toBe('rgb(95, 160, 252)');
    await expect(xp.querySelectorAll('svg path')).toHaveLength(1);

    // The row fits: border-box on the header, or the padding is added to the
    // 100% and the figure clips off the right edge.
    const header = canvasElement.querySelector('.knw-recall__header') as HTMLElement;
    await expect(Math.round(xp.getBoundingClientRect().right))
      .toBeLessThanOrEqual(Math.round(header.getBoundingClientRect().right));

    await expect(xp.textContent).toBe('0');
  },
};

export const AnswerSentConfirmed: Story = {
  name: 'The take · beat 2, the 300ms flash',
  // `sent` pins the beat. The route lets the screen move between the two
  // itself; a story has to hold one still, and no onAdvance is passed, so the
  // 300ms timer never arms and the beat stays inspectable.
  render: () => <AnswerSentScreen sent onDiscard={fn()} onTypeAnswer={fn()} onSkip={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // Submitted. The caption is voiceFab's own default for Sent, and Knowie
    // has taken the answer away — the same pose the processing screen this
    // flash hands off to uses, so the mascot carries through unbroken.
    await expect(canvasElement.querySelector('.knw-fab--Sent')).toBeTruthy();
    await expect(canvas.getByText('Answer sent')).toBeVisible();
    await expect(canvas.getByLabelText('Knowie, thinking')).toBeVisible();

    // THE DECISION IS OVER, SO THE CONTROLS FOR IT ARE GONE. Continue, Retry
    // and the trash all go — a control nobody can reach in 300ms should not be
    // drawn. This is the assertion that keeps the two beats from collapsing.
    await expect(canvas.queryByRole('button', { name: 'Continue' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Retry' })).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Discard and re-record' })).toBeNull();

    // The transcript holds still across both beats, so the flash does not read
    // as a layout jump.
    await expect(canvas.getByText('WHAT YOU SAID')).toBeVisible();

    // The escapes stay put. They are a hard rule from CLAUDE.md — every recall
    // screen keeps a text fallback and a way out.
    await expect(canvas.getByRole('button', { name: 'Type your answer' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();
  },
};

export const TextFallback: Story = {
  name: '6 · Text fallback turn',
  render: () => <TextFallbackScreen onSend={fn()} onUseVoice={fn()} onSkip={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // Knowie's turn is plain text with the mascot beneath it — NO surface.
    // Only the student's turn gets a bubble, and that asymmetry is what makes
    // it read as a conversation rather than two identical blocks.
    const ask = canvasElement.querySelector('.knw-recall__ask-text') as HTMLElement;
    await expect(ask).toBeVisible();
    await expect(getComputedStyle(ask).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    const answer = canvasElement.querySelector('.knw-recall__answer-text') as HTMLElement;
    const as = getComputedStyle(answer);
    await expect(as.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(as.borderRadius).toBe('24px');

    // The student's turn is mirrored right, with the avatar outside the bubble.
    const avatar = canvasElement.querySelector('.knw-recall__avatar') as HTMLElement;
    await expect(avatar.getBoundingClientRect().left)
      .toBeGreaterThanOrEqual(answer.getBoundingClientRect().right);
    await expect(ask.getBoundingClientRect().left)
      .toBeLessThan(answer.getBoundingClientRect().left);

    // chatInput carries the composer, so the way back to voice is one tap.
    await expect(canvasElement.querySelector('.knw-chat')).toBeTruthy();

    // NO DEAD SPACE. The keyboard is up on a typing turn, and the conversation
    // is bottom-aligned, so the student's last turn sits just above the
    // composer rather than leaving ~500px of nothing between them.
    const kb = canvasElement.querySelector('.knw-recall__keyboard') as HTMLElement;
    await expect(kb).toBeTruthy();
    await expect(getComputedStyle(kb).height).toBe('342px');
    const composer = canvasElement.querySelector('.knw-chat') as HTMLElement;
    const gap = composer.getBoundingClientRect().top - answer.getBoundingClientRect().bottom;
    await expect(gap).toBeLessThan(80);

    // Skip is still under the question, on the right.
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();
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
  render: () => (
    <PermissionPrimerScreen showSheet onAllow={fn()} onUseText={fn()} onDismissSheet={fn()} />
  ),
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-sheet')).toBeTruthy();
    await expect(canvas.getByRole('heading', { name: /access your mic/ })).toBeVisible();

    // Voice_UX principle 3: the opt-out sits beside Allow, not absent and not
    // buried. Both are size L in a vertical buttonGroup.
    const allow = canvas.getByRole('button', { name: 'Allow' });
    const type = canvas.getByRole('button', { name: 'Type instead' });
    await expect(allow).toBeVisible();
    await expect(type).toBeVisible();
    await expect(canvasElement.querySelector('.knw-buttongroup--Vertical')).toBeTruthy();
    await expect(Math.round(allow.getBoundingClientRect().width))
      .toBe(Math.round(type.getBoundingClientRect().width));

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
    // the sheet first to find the way forward. So there are two: the screen's
    // Primary M, and the sheet's Secondary L.
    const typeInstead = canvas.getAllByRole('button', { name: 'Type instead' });
    await expect(typeInstead).toHaveLength(2);
    await expect(typeInstead.some((b) => b.classList.contains('knw-button--L'))).toBe(true);
  },
};

export const Misheard: Story = {
  name: '11 · Misheard transcript',
  render: () => <MisheardScreen onMisheard={fn()} onConfirmed={fn()} onRetry={fn()} />,
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
    await expect(canvas.getByRole('button', { name: 'Tap to answer' })).toBeVisible();

    // No skip: the free re-attempt is already here, so a skip would trade it
    // for a recorded miss.
    await expect(canvas.queryByRole('button', { name: 'Skip question' })).toBeNull();

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
  render: () => <ReRecordScreen onContinue={fn()} onNextQuestion={fn()} />,
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

    // buttonGroup Vertical: the two choices sit flush and equal-weight, and
    // they sit under the mascot block rather than pinned to the bottom slot —
    // which is where Figma places them.
    await expect(canvasElement.querySelector('.knw-buttongroup--Vertical')).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-screen__bottom')).toBeNull();
    const cont = canvas.getByRole('button', { name: 'Continue' });
    const next = canvas.getByRole('button', { name: 'Next question' });
    await expect(Math.round(next.getBoundingClientRect().top - cont.getBoundingClientRect().bottom))
      .toBe(0);
  },
};

/** The escapes are the point: every turn has a way out that isn't voice. */
export const EscapesAlwaysPresent: Story = {
  name: 'Every turn has a way out',
  render: () => <AnswerSentScreen onTypeAnswer={fn()} onSkip={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    const type = canvas.getByRole('button', { name: 'Type your answer' });
    const skip = canvas.getByRole('button', { name: 'Skip question' });
    await userEvent.click(type);
    await userEvent.click(skip);
    await expect(type).toBeVisible();
    await expect(skip).toBeVisible();

    // Skip sits under what Knowie put on screen, not down among the bottom
    // escapes — the Idle screen's placement. On the take that panel is the
    // transcript rather than the question bubble, so the anchor is `__said`.
    const panel = canvasElement.querySelector(
      '.knw-recall__said, .knw-recall__prompt',
    ) as HTMLElement;
    const skipBox = skip.getBoundingClientRect();
    await expect(skipBox.top).toBeGreaterThanOrEqual(panel.getBoundingClientRect().bottom);
    await expect(skipBox.top).toBeLessThan(type.getBoundingClientRect().top);

    // And it is pushed to the right edge of the content column.
    const row = canvasElement.querySelector('.knw-recall__skip') as HTMLElement;
    await expect(Math.round(row.getBoundingClientRect().right - skipBox.right)).toBe(0);
  },
};

export const Idle: Story = {
  name: '9 · Idle',
  render: () => <IdleScreen onRecord={fn()} onSkip={fn()} onTypeAnswer={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The resting state: the question is up and the orb is waiting.
    await expect(canvas.getByRole('button', { name: 'Tap to answer' })).toBeVisible();

    // Idle is the ONLY recall turn that asks the question in the bubble, with
    // Knowie tucked behind it. Everything downstream restates it flat.
    await expect(canvasElement.querySelector('.knw-recall__bubble')).toBeTruthy();
    const mascot = canvasElement.querySelector('.knw-recall__mascot') as HTMLElement;
    const bubble = canvasElement.querySelector('.knw-recall__bubble') as HTMLElement;
    const overlap = mascot.getBoundingClientRect().bottom - bubble.getBoundingClientRect().top;
    await expect(+(overlap / mascot.getBoundingClientRect().height).toFixed(3)).toBe(0.375);

    // Both escapes, as on every turn.
    await expect(canvas.getByRole('button', { name: 'Type your answer' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();

    // THE EXIT IS A THUMB TARGET, NOT A GLYPH BOX. It was 24 square — the WCAG
    // 2.5.8 floor exactly, on the control most likely to be hit by accident.
    // axe never flagged it: target size is a WCAG 2.2 rule and the harness runs
    // 2.1. Asserted here instead.
    const exit = canvas.getByRole('button', { name: 'Leave session' });
    const box = exit.getBoundingClientRect();
    await expect(Math.round(box.width)).toBeGreaterThanOrEqual(44);
    await expect(Math.round(box.height)).toBeGreaterThanOrEqual(44);

    // The progress bar is thickness=16, which is what all six recall frames
    // bind. The component defaults to 24.
    const bar = canvasElement.querySelector('.knw-progress') as HTMLElement;
    await expect(getComputedStyle(bar).height).toBe('16px');

    // Skip is right-aligned caption/M SemiBold on text/secondary — measured off
    // this frame: textAlignHorizontal=RIGHT, 12px, SemiBold.
    const skip = canvasElement.querySelector('.knw-recall__skip') as HTMLElement;
    const skipBtn = canvas.getByRole('button', { name: 'Skip question' });
    await expect(Math.round(skipBtn.getBoundingClientRect().right))
      .toBe(Math.round(skip.getBoundingClientRect().right));
    await expect(getComputedStyle(skipBtn).fontSize).toBe('12px');
  },
};

export const ListeningTalking: Story = {
  name: '10 · Listening — sound arriving',
  render: () => <ListeningScreen talking onSend={fn()} onSkip={fn()} onTypeAnswer={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The caption is "Listening", not voiceFab's own "Tap to send" default —
    // on this screen the caption's job is to say what the app is doing.
    await expect(canvas.getByRole('button', { name: 'Listening' })).toBeVisible();
    await expect(canvasElement.querySelector('.knw-fab--Recording')).toBeTruthy();

    // The waveform says sound is arriving. This is the whole screen.
    await expect(canvas.getByLabelText('Recording your answer')).toBeVisible();

    // NO QUESTION BUBBLE. Neither Figma frame has one — the question belongs
    // to idle, and this screen's job is status.
    await expect(canvasElement.querySelector('.knw-recall__bubble')).toBeNull();

    // NO DISCARD. Nothing is recorded yet to throw away; voiceFab enforces it.
    await expect(canvas.queryByRole('button', { name: 'Discard and re-record' })).toBeNull();
  },
};

export const ListeningSilent: Story = {
  name: '10b · Listening — paused',
  render: () => <ListeningScreen talking={false} onSend={fn()} />,
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
    // NOTHING IS INTERACTIVE. Voice_UX 1C: "Can do: nothing interactive." The
    // orb is a role=img, not a button, so a student cannot double-submit by
    // tapping it again — which is the failure this state exists to prevent.
    await expect(canvasElement.querySelector('.knw-fab--Thinking')).toBeTruthy();
    await expect(canvas.queryByRole('button', { name: 'Evaluating…' })).toBeNull();
    await expect(canvas.getByLabelText('Evaluating…')).toBeVisible();

    // The transcript stays up: it is the evidence the answer landed.
    await expect(canvas.getByText('WHAT YOU SAID')).toBeVisible();
    await expect(canvas.getByLabelText('Knowie is thinking')).toBeVisible();
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

    // A hint tightens the card's gap to Space/200. Without the modifier it
    // would silently inherit the 32 the hintless states use.
    await expect(getComputedStyle(card).rowGap).toBe('8px');

    // THE CARD DRAWS ITS OWN BADGE AND CONTEST BUTTONS. Exactly one of each —
    // composing chipFeedback or feedbackButton alongside would repeat them,
    // which is the bug that once printed the transcript twice.
    await expect(canvasElement.querySelectorAll('.knw-rrc__badge')).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('.knw-transcript')).toHaveLength(1);

    // The next-action is a real control here — Figma labels it "Skip Question",
    // and it is this screen's only skip.
    await expect(canvas.getByRole('button', { name: 'Skip question' })).toBeVisible();

    // The orb is ON this screen: the next attempt starts here, not back at idle.
    await expect(canvas.getByRole('button', { name: 'Tap to answer' })).toBeVisible();

    // The question is restated flat, with no mascot tucked behind it.
    await expect(canvasElement.querySelector('.knw-recall__askbar')).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-recall__mascot')).toBeNull();
  },
};

export const ResultHint3: Story = {
  name: '13b · Result — the hint promoted out of the card',
  render: () => (
    <ResultScreen
      rung="hint3"
      verdict="Wrong"
      hintLabel="Hint 3"
      hint="Ask yourself: if two historians describe the same event differently, what would a historical thinker do?"
      onRecord={fn()}
      onNextAction={fn()}
    />
  ),
  play: async ({ canvasElement }) => {
    // AT RUNG 3 THE HINT LEAVES THE CARD. Figma names the layer "escalating
    // warmth": the last hint before the answer gets its own surface, a larger
    // step and a warm label, so it cannot be mistaken for the previous two.
    const panel = canvasElement.querySelector('.knw-recall__hint-panel') as HTMLElement;
    await expect(panel).toBeTruthy();
    await expect(canvasElement.querySelector('.knw-rrc__hint')).toBeNull();

    // The panel sits BELOW the card, not inside it.
    const card = canvasElement.querySelector('.knw-rrc') as HTMLElement;
    await expect(panel.getBoundingClientRect().top)
      .toBeGreaterThanOrEqual(card.getBoundingClientRect().bottom);

    // feedback/warning/surface/subtle — gold/900 at 20%. Figma binds a variable
    // called "Pro Background" here, which is the paid tier's colour and has no
    // counterpart in tokens.json.
    await expect(getComputedStyle(panel).backgroundColor).toBe('rgba(58, 45, 11, 0.2)');
  },
};

export const NoAudio: Story = {
  name: '11 · Nothing heard',
  render: () => <NoAudioScreen onRetry={fn()} onTypeAnswer={fn()} />,
  play: async ({ canvas }) => {
    // The copy says the system failed to hear, not that the student failed to
    // speak, and it says the attempt is free.
    await expect(canvas.getByText(/didn’t catch anything/)).toBeVisible();
    await expect(canvas.getByText(/doesn’t count/)).toBeVisible();

    // Flat bars, because that is literally what happened.
    await expect(canvas.getByLabelText('Microphone on, waiting for you to speak')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Try again' })).toBeVisible();
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

    const mascotBox = slot.getBoundingClientRect();
    const card = canvasElement.querySelector('.knw-rrc__card') as HTMLElement;
    const cardBox = card.getBoundingClientRect();
    // The card climbs over Knowie rather than sitting under him.
    await expect(cardBox.top).toBeLessThan(mascotBox.bottom);
    // And the surface lands at the 350 both screenshots draw, not 32 narrower.
    await expect(Math.round(cardBox.width)).toBe(350);

    // The card reports the pass and what was said, and offers nothing to
    // contest — there is no appealing being right.
    await expect(canvas.getByText('Correct')).toBeVisible();
    await expect(canvas.getByText('100%')).toBeVisible();
    await expect(canvas.getByText('WHAT YOU SAID')).toBeVisible();
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
  render: () => <CorrectFeedbackScreen onSayItBack={fn()} onTypeAnswer={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // The model answer, to read against what the student actually said.
    await expect(canvas.getByText(/critically analyzing evidence/)).toBeVisible();
    await expect(canvas.getByText('Try it yourself after reading')).toBeVisible();

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

    await expect(canvas.getByRole('button', { name: 'Say it back' })).toBeVisible();
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

    // SINGLE CHOICE, though Figma draws checkboxes. The three options are
    // mutually exclusive readings of one feeling, and the frame shows exactly
    // one filled. There is no radio in this system, so the box is a Checkbox
    // and the behaviour is made single-select.
    const boxes = canvas.getAllByRole('checkbox');
    await expect(boxes).toHaveLength(3);
    for (const b of boxes) await expect(b).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(boxes[0]);
    await expect(boxes[0]).toHaveAttribute('aria-checked', 'true');

    // THE WHOLE ROW IS THE TARGET, not just the 24px disc at the end of it —
    // every list row in the app takes a tap anywhere along it, and one that
    // looks the same but only answers at one end is the kind of thing a student
    // blames themselves for. Clicking the LABEL selects.
    await userEvent.click(canvas.getByText('Somewhat less confident'));
    await expect(boxes[2]).toHaveAttribute('aria-checked', 'true');
    await expect(boxes[0]).toHaveAttribute('aria-checked', 'false');

    // One focus stop per row, though: the <li> takes no tabindex and no role.
    const rows = canvasElement.querySelectorAll('.knw-rating__option');
    for (const row of rows) {
      await expect(row.hasAttribute('tabindex')).toBe(false);
      await expect(row.hasAttribute('role')).toBe(false);
    }

    // ANSWERING IS OPTIONAL, so there is a way back to having not answered,
    // and Continue never waits on a choice.
    await userEvent.click(boxes[2]);
    await expect(boxes[2]).toHaveAttribute('aria-checked', 'false');
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeEnabled();
  },
};

/**
 * THE PARTIAL VERDICT, which had no screen story until now — both result
 * stories ran `verdict="Wrong"`, so the one path the ladder exists for was
 * only ever exercised through the card in isolation.
 */
export const ResultPartial: Story = {
  name: '13 · Partial — what landed, and what did not',
  render: () => (
    <ResultScreen
      rung="hint1"
      verdict="Partial"
      score="65%"
      gotItems={['Context and evidence-based thinking', 'Critical source evaluation']}
      stillMissingItems={['Building a reasoned interpretation from evidence']}
      onRecord={fn()}
      onNextAction={fn()}
    />
  ),
  play: async ({ canvas, canvasElement }) => {
    // `partial` (15620:9496) splits the answer in two under the transcript.
    // That is the difference between partial and wrong: something was credited.
    await expect(canvas.getByText('WHAT YOU GOT')).toBeVisible();
    await expect(canvas.getByText('STILL MISSING')).toBeVisible();
    await expect(canvas.getByText('Context and evidence-based thinking')).toBeVisible();

    // And no Wrong-style list, which is a different section with a different
    // meaning — "none of this landed".
    await expect(canvas.queryByText('WHAT WAS MISSING')).toBeNull();

    // The ladder is still on screen: a partial answer is partway, and the
    // screen's job is to say how far.
    await expect(canvasElement.querySelector('.knw-ladder')).toBeTruthy();
    await expect(canvas.getByText('65%')).toBeVisible();
    await expect(canvas.getByText('Almost there')).toBeVisible();
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
  name: '14b · Comparison — both answers',
  render: () => <ComparisonScreen onRevise={fn()} onTryAgain={fn()} onExit={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // SPEC listed this as row 14 and nothing ever built it — the row was
    // renamed "Reveal" when the hint ladder arrived and the comparison quietly
    // stopped existing. The two are different screens: the reveal shows the
    // answer so it can be SAID; this shows it against the saying.
    await expect(canvas.getByText('Concept you missed')).toBeVisible();
    await expect(canvas.getByText('Correct answer')).toBeVisible();
    await expect(canvas.getByText('Your answer')).toBeVisible();

    // ONE CONSTRUCTION FOR BOTH CARDS. Figma builds them differently — the
    // correct-answer card puts its header inside the surface with a stroke
    // around the whole card, the your-answer card puts its header outside with
    // the stroke under it. Reading them as a pair is the point of the screen,
    // and two constructions make that harder for no gain.
    const cards = canvasElement.querySelectorAll('.knw-compare__card');
    await expect(cards).toHaveLength(2);
    const [a, b] = [...cards].map((c) => getComputedStyle(c as HTMLElement));
    await expect(a.borderTopWidth).toBe(b.borderTopWidth);
    await expect(a.borderTopColor).toBe(b.borderTopColor);
    await expect(a.backgroundColor).toBe(b.backgroundColor);
    await expect(a.borderRadius).toBe(b.borderRadius);

    // The model answer is broken into points, not left as prose: "what did I
    // miss" is answerable against a list and not against a paragraph.
    await expect(canvasElement.querySelectorAll('.knw-listitem').length).toBeGreaterThan(1);

    // No orb and no progress — the term is over. Two ways on: read it again,
    // or try it again.
    await expect(canvasElement.querySelector('.knw-fab')).toBeNull();
    await expect(canvas.queryByRole('progressbar')).toBeNull();
    await expect(canvas.getByRole('button', { name: 'Revise now' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Try again' })).toBeVisible();
  },
};

export const Reveal: Story = {
  name: '14 · Reveal',
  render: () => <RevealScreen onSayItBack={fn()} onTypeAnswer={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    // Reveal drops the transcript and the contest buttons — there is nothing
    // left to contest — and shows the model answer instead.
    await expect(canvasElement.querySelector('.knw-transcript')).toBeNull();
    await expect(canvas.queryByRole('button', { name: 'App misheard me' })).toBeNull();
    await expect(canvas.getByText(/critically analyzing evidence/)).toBeVisible();
    await expect(canvas.getByText('Try it yourself after reading')).toBeVisible();

    // THE WAY ON IS TO ANSWER. There is no "next question" here: a student who
    // has just read the answer says it back or types it, because tapping past
    // it is the version of this screen that teaches nothing.
    await expect(canvas.getByRole('button', { name: 'Say it back' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Type your answer' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Next question' })).toBeNull();

    // Not trapped, though — both of those advance the term.
  },
};

export const Summary: Story = {
  name: '16 · Summary',
  render: () => <SummaryScreen onRevise={fn()} onTryAgain={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    const title = canvas.getByRole('heading', { name: 'Here’s how it went' });
    await expect(title).toBeVisible();

    // Figma sets 28 Bold and LEFT. Both were wrong: headline/XL is 44, two
    // steps up, and the head was centred on a reading of `recall-summary.png`
    // that treated alignment as a spec rather than as composition.
    const t = getComputedStyle(title);
    await expect(t.fontSize).toBe('28px');
    await expect(getComputedStyle(title.parentElement as HTMLElement).textAlign).toBe('left');

    // A COUNT, NOT A GRADE. The ring reads how many were explained, not a mark
    // out of a hundred — sprint-context.md: a count states what the student
    // did, a percentage converts it into a verdict on them.
    await expect(canvas.getByText('3/4')).toBeVisible();
    await expect(canvas.getByText('Recalled')).toBeVisible();
    await expect(canvas.queryByText('75%')).toBeNull();

    // WHAT CAME NATURALLY LEADS. Strong above review, never the other way
    // round: the same information reversed opens with a deficit.
    const groups = [...canvasElement.querySelectorAll('.knw-summary__group-label')];
    await expect(groups.map((g) => g.textContent)).toEqual([
      'You are strong in',
      'Review these concepts',
    ]);

    // `summaryStatTile` splits the total rather than repeating it, in Figma's
    // order: 1 hinted, 2 unaided of 4, 1 missed — which sums to the 4 the ring
    // is out of.
    const tiles = [...canvasElement.querySelectorAll('.knw-statrow__tile')];
    await expect(tiles.map((t) => t.getAttribute('data-tone')))
      .toEqual(['hinted', 'perfect', 'missed']);
    await expect(tiles.map((t) => t.querySelector('dd')!.textContent))
      .toEqual(['1', '2/4', '1']);

    // Each tile takes its own accent pair, not one label colour stretched
    // across three hues.
    const label = tiles[0].querySelector('dt') as HTMLElement;
    await expect(getComputedStyle(label).color).not.toBe(
      getComputedStyle(tiles[1].querySelector('dt') as HTMLElement).color,
    );

    await expect(canvas.getByRole('button', { name: 'Revise now' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Try again' })).toBeVisible();
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
  name: 'Lesson — where "Revise now" lands',
  render: () => <LessonScreen onExplainOutLoud={fn()} onBack={fn()} />,
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('heading', { name: 'Primary sources' })).toBeVisible();

    // The three stats, as a <dl> — a set of label/value pairs is what that
    // element is for, and it pairs them for a screen reader too.
    const stats = [...canvasElement.querySelectorAll('.knw-lesson__stat')];
    await expect(stats).toHaveLength(3);
    await expect(stats.map((s) => s.querySelector('dt')!.textContent))
      .toEqual(['Concepts', 'Est. time', 'Difficulty']);

    // THE WHOLE CARD IS THE TARGET, not a card with a button inside it —
    // which is what Figma draws and what a thumb expects at 358×104. It is
    // the way back into the loop, so it sits in the bottom slot.
    const eol = canvasElement.querySelector('.knw-lesson__eol') as HTMLElement;
    await expect(eol.tagName).toBe('BUTTON');
    await expect(eol.textContent).toContain('Explain out loud');

    // accent/blue/subtle. Figma binds a variable called "EOL Card background"
    // (#0B1E4A) with no counterpart in tokens.json; this is the nearest bound
    // colour and the right role.
    await expect(getComputedStyle(eol).backgroundColor).toBe('rgb(10, 22, 53)');

    // The title and the body describe the same thing — they used to disagree.
    await expect(canvas.getByText(/A primary source is evidence/)).toBeVisible();
  },
};
