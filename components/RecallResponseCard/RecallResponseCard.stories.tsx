import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { RecallResponseCard } from './RecallResponseCard';

/** Verbatim from the Figma component set "recallResponseCard" (node 15712:18958). */
const FIGMA_DESCRIPTION = `Result surface for one evaluated recall attempt in the Explain Out Loud loop. Shows the verdict badge, a transcript of what the student said, Knowie's response, and — on an incorrect result — a structured breakdown of what was missing.

**VARIANT AXIS**
- \`State\` — one of: Default | Reveal | Correct
- \`showMissingSection\` (boolean, Default only) — True for incorrect, False for partial

**PROPERTIES**
- \`badgeLabel\` (text) — verdict label inside the badge pill. Defaults: "✗  Not quite" / "↺  Almost there" / "Answer" / "✓  Correct"
- \`transcriptText\` (text, Default states only) — STT transcript of the student's answer
- \`showMissingSection\` (boolean, Default states only) — toggles the Divider, Missing Label, and Missing List. **Never set to True on Reveal or Correct** — those states do not contain the missing section layers
- \`nextActionLabel\` (text) — right-aligned link below the card
- \`percentageText\` (text, Correct only) — score inside the percentage circle. Default: "100%"

**USE:** once per term, per attempt, after Knowie returns a verdict. Default/True — incorrect answer · Default/False — partial answer · Reveal — after student taps "Reveal answer" · Correct — passing answer.

**DON'T**
- Do not use during the processing state — this component appears only once a verdict exists.
- Do not set \`showMissingSection=True\` on Reveal or Correct.
- Do not swap the Left Accent Strip colour — it is a Correct-state affordance only.
- Do not put more than three bullets in Missing List.

Each variant also carries its own description:

> **Default/True** — Incorrect result. Student's answer did not land. Shows error badge, transcript of what was heard, errorButton row, Divider, and Missing Section listing the missing concepts as bullets.
>
> **Default/False** — Partial result. Student touched the concept but didn't fully cover it. Shows partial badge, transcript, and errorButton row. No Divider or Missing Section.
>
> **Reveal** — Model answer revealed. Transcript and Action Buttons replaced by full model answer text. Nothing sits below the card. Badge reads 'Answer' in neutral pill.
>
> **Correct** — Passing result. Percentage circle (44×44) and green '✓ Correct' badge replace the standard badge row. Action Buttons replaced by Knowie Answer text block. Left Accent Strip runs along left edge of card.

---

**The component set reports an error in Figma.** Both \`variantGroupProperties\` and \`componentPropertyDefinitions\` throw *"Component set has existing errors"*, so the axes could not be read from the API and were taken from the variant names and the description instead. The likely cause is visible in the geometry: three variants are 390 wide and \`State=Correct\` is 358. There is also a **second, undescribed copy** of this set on the *Final Design — core flow* page (node 15712:18743) whose variants are 2px shorter. The described one on *Knowunity Components* was used.

**The prose names four tokens that do not exist.** \`feedback/error/surface/bold\`, \`feedback/partial/surface/bold\` and \`feedback/success/surface/bold\` are all written with a \`surface\` segment that \`tokens.json\` does not have. Reading the nodes instead of the prose, the real bindings are \`feedback/error/bold\`, \`feedback/success/surface/bold\` → \`green/500\` = \`feedback/success/bold\`, and so on — every one resolves to a token that exists under the shorter name. **The bindings are fine; the description is stale.**

**The badge label on the incorrect card is bound to a green token.** Figma binds it to \`feedback/success/surface/label/bold\` (\`green/950\`) — on a red error chip. Both that and the correct badge use the same variable. It is almost certainly a slip, but \`green/950\` is a near-black and reads fine on red, so the file's binding is kept rather than silently corrected. \`feedback/error/label/bold\` is what it should probably be.

**The transcript is dimmer on Default than on Correct.** Default binds it to \`text/secondary\`, Correct to \`text/primary\`. The prose says \`text/light\` for both. The nodes were followed.

**The Action Buttons are not \`errorButton\` instances.** Both descriptions say "Primary Action — errorButton verdict=Misheard". In the file they are plain frames named Primary Action and Secondary Action with their own fills and strokes, so there is no \`errorButton\` dependency and nothing to reuse from it.

**Five tokens were added, each traced to a bound Figma variable:**

| token | value | Figma |
|---|---|---|
| \`space/layout/2XL\` | 32 | \`Space/800\`, the card's gap |
| \`radius/inner\` | 12 | \`Radius/300\`, Knowie Answer corners |
| \`radius/strip\` | 4 | \`Radius/100\`, accent strip corners |
| \`size/bullet\` | 5 | Missing List bullet |
| \`size/score/badge\` | 44 | Percentage Circle |

Unlike most gaps this session these were all *already bound* in Figma — the semantic layer simply had no name at those values.

**Nothing was reusable, and one near-miss is worth naming.** The Correct state's 44px score ring looks like \`percentage\`, but that component is a 121px arc with a score and a caption; this is a closed 44px ring with a bare percentage. Different token, different content, no shared markup. \`chips\` does not fit the badge either — its axes are size/color/active with Primary and pro fills, not verdict colours. The only reuse is \`XCloseIcon\` from BottomSheet for the ✗ on the incorrect badge.

**State=Reveal carries nothing under the card.** Figma gives it the Card and a Helper Label — "Try it yourself after reading" — where the other three states carry "Next question" or "Reveal answer". The helper is not built: on the screen the idle voiceFab sits directly below the card with "Say it back" written above it, which says the same thing at the control, at the moment the student can act on it. Two instructions for one action read as two. The \`helperLabel\` prop is gone with it.

**The badges were rebuilt in Figma while this component was being written, and the code follows the new nodes.** All three glyph badges now put their icon in an \`iconSlot\` at \`Size=200\` and keep the words in the label, instead of baking a character into the string:

| variant | glyph | label |
|---|---|---|
| Default/True | \`Cancel icon\` in iconSlot 200 | "Not quite" |
| Default/False | \`rewind icon\` in iconSlot 200 | "Almost there" |
| Reveal | none | "Answer" |
| Correct | \`Check\` in iconSlot 200 | "Correct" |

**That makes \`iconSlot\` a real reuse.** The component built earlier in this project is exactly what the file now instantiates, so the badges use it at \`size="200"\` rather than sizing three icons by hand.

**The partial badge is no longer a filled pill.** It now has no fill at all, a 2px \`Stroke/Heavy Border\` in \`feedback/partial/surface/bold\` (→ \`violet/400\` = \`feedback/partial/bold\`), and its label in the same violet. It used to be solid violet with a near-white label. Worth knowing if you remember it the old way.

**\`State=Correct\` is now 390 wide.** It was 358 when first read — the odd one out among four variants — and its card now pads evenly at 16 on all four sides. The set still reports *"Component set has existing errors"* through the plugin API, so the axes are still taken from the variant names.

**The set's prose description is now out of date in two more places.** It still documents the \`badgeLabel\` defaults as "✗  Not quite" / "↺  Almost there" / "Answer" / "✓  Correct" with the glyph in the string, and still describes the partial badge as \`feedback/partial/surface/bold\` *fill*. Both were true before the rebuild.

**Three contrast failures, all faithful to Figma and all left alone:**

| element | on | ratio | |
|---|---|---|---|
| "App misheard me" \`feedback/error/bold\` | \`feedback/error/subtle\` | 4.41:1 | just under AA |
| Next action label \`text/disabled\` | page | **3.77:1** | fails AA |
| Partial badge \`feedback/partial/label/bold\` | \`feedback/partial/bold\` | 3.97:1 | fails AA |

The next-action label is the same \`text/disabled\` problem \`tabs\` and \`voiceFab\` report — one token change fixes all three components. The other two are this component's own pairings.

**Two DON'Ts are enforced rather than documented.** \`showMissingSection\` is ignored outside Default, and the missing list is capped at three items.`;

const meta = {
  title: 'Components/RecallResponseCard',
  component: RecallResponseCard,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: FIGMA_DESCRIPTION } },
  },
  argTypes: {
    State: { control: 'radio', options: ['Wrong', 'Misheard', 'Partial', 'Reveal', 'Correct'] },
    showMissingSection: { control: 'boolean' },
    badgeLabel: { control: 'text' },
    transcriptText: { control: 'text' },
    nextActionLabel: { control: 'text' },
    percentageText: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '390px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof RecallResponseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IncorrectWithMissing: Story = {
  name: 'State=Wrong, showMissingSection=True',
  args: { State: 'Wrong', showMissingSection: true, onPrimaryAction: fn(), onSecondaryAction: fn() },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText(/Not quite/)).toBeVisible();
    await expect(canvas.getByText('Next question')).toBeVisible();
    await expect(canvas.getByText('WHAT WAS MISSING')).toBeVisible();

    // Proves the token stylesheet reached the card: surface fill, 24px corners,
    // and the Space/800 gap Figma sets on the card.
    //
    // 24, not Figma's 16. Figma draws three radii for three recall surfaces —
    // bubble 8, card 16, answer 24 — where the app measures one consistent 24
    // across recall-processing, recall-partial and recall-correct. The
    // screenshots are the authority on specs, so every recall surface takes
    // radius/input. See design-system.md, "Which source wins".
    const card = canvasElement.querySelector('.knw-rrc__card') as HTMLElement;
    const cs = getComputedStyle(card);
    await expect(cs.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(cs.borderRadius).toBe('24px');
    await expect(cs.rowGap).toBe('32px');

    // The error badge takes feedback/error/bold, with the cancel glyph in an
    // iconSlot at Size=200 rather than a character in the label.
    const badge = canvasElement.querySelector('.knw-rrc__badge') as HTMLElement;
    await expect(getComputedStyle(badge).backgroundColor).toBe('rgb(255, 107, 107)');
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('16px');
    await expect(slot.querySelector('svg')).toBeTruthy();

    // Three bullets, each in the error colour at the token size.
    const items = canvasElement.querySelectorAll('.knw-rrc__missing-item');
    await expect(items).toHaveLength(3);
    const bullet = canvasElement.querySelector('.knw-rrc__bullet') as HTMLElement;
    const bs = getComputedStyle(bullet);
    await expect(bs.width).toBe('5px');
    await expect(bs.backgroundColor).toBe('rgb(255, 107, 107)');

    // Both verdict-correction buttons are real controls.
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Continue' })).toBeVisible();

    // No accent strip outside Correct.
    await expect(canvasElement.querySelector('.knw-rrc__strip')).toBeNull();
  },
};

export const Partial: Story = {
  name: 'State=Partial',
  args: { State: 'Partial', showMissingSection: false, onPrimaryAction: fn(), onSecondaryAction: fn() },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText(/Almost there/)).toBeVisible();
    // Partial offers the reveal instead of moving on.
    await expect(canvas.getByText('Reveal answer')).toBeVisible();

    // Partial is an outlined pill, not a filled one: no fill and a 2px violet
    // stroke. The label sits a step lighter than the stroke — the contrast pass
    // moved it to `feedback/partial/label/subtle` to clear AA.
    const badge = canvasElement.querySelector('.knw-rrc__badge') as HTMLElement;
    const bs = getComputedStyle(badge);
    await expect(bs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(bs.borderTopWidth).toBe('2px');
    await expect(bs.borderTopColor).toBe('rgb(123, 101, 224)');
    await expect(getComputedStyle(canvas.getByText('Almost there')).color).toBe('rgb(167, 139, 250)');

    // The glyph is the rewind icon in an iconSlot at Size=200.
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('16px');

    // NO WRONG-STYLE MISSING SECTION on a partial result — but it does carry
    // its own breakdown, which is a different thing. `partial` (15620:9496)
    // splits the answer in two: what landed, then what is still absent. Wrong's
    // list says "none of this landed"; this says "something did".
    await expect(canvasElement.querySelector('.knw-rrc__missing')).toBeNull();
    await expect(canvasElement.querySelector('.knw-rrc__breakdown-block')).toBeTruthy();
    await expect(canvas.getByText('WHAT YOU GOT')).toBeVisible();
    await expect(canvas.getByText('STILL MISSING')).toBeVisible();

    // Green for what landed, violet for what did not. Both take the
    // `label/subtle` tier, one step lighter than the file: feedback/partial/bold
    // at 9px on background/surface is 3.51:1, under AA, which axe caught here
    // rather than anyone catching it by eye.
    await expect(getComputedStyle(canvas.getByText('WHAT YOU GOT')).color).toBe('rgb(74, 229, 176)');
    await expect(getComputedStyle(canvas.getByText('STILL MISSING')).color).toBe('rgb(167, 139, 250)');

    // 15 Regular on text/primary, larger than Wrong's 12 on text/secondary.
    // The file draws them differently on purpose: Wrong's list is a footnote to
    // a verdict, this is the part the student acts on. Logged in
    // design-system.md in case a designer wants them to match.
    const item = canvasElement.querySelector('.knw-rrc__breakdown-text') as HTMLElement;
    await expect(getComputedStyle(item).fontSize).toBe('15px');

    // RETRY AND CONTINUE, not the misheard pair. The set draws Retry/Continue
    // on Wrong and Partial — another attempt, or move on — and "App misheard
    // me" only on Misheard, which is a claim about the transcript rather than
    // about the answer. One shared default had all three offering to appeal a
    // transcription that was never in question.
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'App misheard me' })).toBeNull();

    // 65%, not 100 — a card reading "Almost there" over a perfect score
    // contradicted itself.
    await expect(canvas.getByText('65%')).toBeVisible();

    // The actions stay.
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();
  },
};

export const Reveal: Story = {
  name: 'State=Reveal',
  args: { State: 'Reveal' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Answer')).toBeVisible();
    // Reveal carries nothing under the card. The helper line it used to draw
    // said the same thing as "Say it back" above the orb, one screen element
    // earlier and further from the control.
    await expect(canvas.queryByText('Try it yourself after reading')).toBeNull();

    // A neutral outlined pill, not a verdict colour.
    const badge = canvasElement.querySelector('.knw-rrc__badge') as HTMLElement;
    const bs = getComputedStyle(badge);
    await expect(bs.backgroundColor).toBe('rgb(34, 36, 47)');
    await expect(bs.borderTopColor).toBe('rgba(255, 255, 255, 0.1)');
    // Reveal is the one badge with no glyph.
    await expect(canvasElement.querySelector('.knw-iconslot')).toBeNull();

    // Reveal carries the helper line instead of a next-action link, not both.
    await expect(canvasElement.querySelector('.knw-rrc__next')).toBeNull();

    // Transcript and actions are both replaced by the model answer.
    await expect(canvasElement.querySelector('.knw-rrc__transcript')).toBeNull();
    await expect(canvasElement.querySelector('.knw-rrc__actions')).toBeNull();
    const model = canvasElement.querySelector('.knw-rrc__model-text') as HTMLElement;
    await expect(getComputedStyle(model).color).toBe('rgb(244, 242, 255)');
  },
};

export const Correct: Story = {
  name: 'State=Correct',
  args: { State: 'Correct' },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText(/Correct/)).toBeVisible();
    await expect(canvas.getByText('100%')).toBeVisible();

    // The green badge and the score ring, both on feedback/success/bold, with
    // the check glyph in an iconSlot at Size=200.
    const badge = canvasElement.querySelector('.knw-rrc__badge') as HTMLElement;
    await expect(getComputedStyle(badge).backgroundColor).toBe('rgb(0, 195, 134)');
    const slot = canvasElement.querySelector('.knw-iconslot') as HTMLElement;
    await expect(getComputedStyle(slot).width).toBe('16px');

    const score = canvasElement.querySelector('.knw-rrc__score') as HTMLElement;
    await expect(getComputedStyle(score).width).toBe('44px');
    const ring = canvasElement.querySelector('.knw-rrc__score-ring') as HTMLElement;
    const rs = getComputedStyle(ring);
    await expect(rs.borderTopWidth).toBe('2px');
    await expect(rs.borderTopColor).toBe('rgb(0, 195, 134)');

    // THE FIGURE STAYS INSIDE THE RING. Not a style check — a guard against the
    // data. `/recall/correct` once multiplied an already-percentage score by
    // 100, so a real pass printed `10000%` and ran out of the circle and across
    // the card. It never showed by URL, only mid-session, because without a
    // verdict the card falls back to its own `100%`. `formatScore` in
    // lib/recall/script.tsx is the single formatter both routes now use; this
    // is the assertion that says what the ring can hold.
    const text = canvasElement.querySelector('.knw-rrc__score-text') as HTMLElement;
    const sb = score.getBoundingClientRect();
    const tb = text.getBoundingClientRect();
    await expect(tb.width).toBeLessThan(sb.width);
    await expect(tb.left).toBeGreaterThanOrEqual(sb.left);
    await expect(tb.right).toBeLessThanOrEqual(sb.right);

    // Correct has nothing to contest, so no action row — and the rebuilt set
    // dropped the Knowie answer block, leaving the transcript as the body.
    await expect(canvasElement.querySelector('.knw-rrc__actions')).toBeNull();
    await expect(canvasElement.querySelector('.knw-rrc__answer')).toBeNull();
    await expect(canvasElement.querySelector('.knw-transcript')).toBeTruthy();

    // The accent strip is a Correct-only affordance.
    const strip = canvasElement.querySelector('.knw-rrc__strip') as HTMLElement;
    const ss = getComputedStyle(strip);
    await expect(ss.width).toBe('3px');
    await expect(ss.backgroundColor).toBe('rgb(0, 195, 134)');
    await expect(ss.borderRadius).toBe('4px');
  },
};

/** The DON'T says never set it True outside Default — so it is ignored there. */
export const MissingIgnoredOutsideWrong: Story = {
  name: 'showMissingSection=True on Correct (ignored)',
  args: { State: 'Correct', showMissingSection: true },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.knw-rrc__missing')).toBeNull();
    // Still a Correct card, not a hybrid.
    await expect(canvasElement.querySelector('.knw-rrc__strip')).toBeTruthy();
  },
};

/** The DON'T caps the list at three, so a longer list is trimmed. */
export const MissingListCapped: Story = {
  name: 'More than three bullets (capped)',
  args: {
    State: 'Wrong',
    showMissingSection: true,
    missingItems: ['One', 'Two', 'Three', 'Four', 'Five'],
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-rrc__missing-item')).toHaveLength(3);
    await expect(canvas.queryByText('Four')).toBeNull();
  },
};

/** All five variants, which is how the rebuilt set reads in Figma. */
export const AllStates: Story = {
  name: 'All states',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <RecallResponseCard State="Wrong" showMissingSection />
      <RecallResponseCard State="Misheard" />
      <RecallResponseCard State="Partial" />
      <RecallResponseCard State="Reveal" />
      <RecallResponseCard State="Correct" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('.knw-rrc')).toHaveLength(5);
    // Exactly one missing section and one accent strip across the set.
    await expect(canvasElement.querySelectorAll('.knw-rrc__missing')).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('.knw-rrc__strip')).toHaveLength(1);
  },
};
