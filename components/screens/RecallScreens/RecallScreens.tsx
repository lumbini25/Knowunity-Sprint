import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Screen } from '../../Screen/Screen';
import { VoiceFab } from '../../VoiceFab/VoiceFab';
import { TypeAnswer } from '../../TypeAnswer/TypeAnswer';
import { ChatInput } from '../../ChatInput/ChatInput';
import { BottomSheet } from '../../BottomSheet/BottomSheet';
import { TextBlock } from '../../TextBlock/TextBlock';
import { Button } from '../../Button/Button';
import { ButtonGroup } from '../../ButtonGroup/ButtonGroup';
import { Chips } from '../../Chips/Chips';
import { FolderCard } from '../../FolderCard/FolderCard';
import { Checkbox } from '../../Checkbox/Checkbox';
import { MascotSlot } from '../../MascotSlot/MascotSlot';
import { ProgressIndicator } from '../../ProgressIndicator/ProgressIndicator';
import { RecallResponseCard } from '../../RecallResponseCard/RecallResponseCard';
import { IconSlot } from '../../IconSlot/IconSlot';
import { Percentage } from '../../Percentage/Percentage';
import { ListItem, ListItemGroup } from '../../ListItem/ListItem';
import { SummaryStatTile } from '../../SummaryStatTile/SummaryStatTile';
import { TranscriptSection } from '../../TranscriptSection/TranscriptSection';
import { WaveformCard } from '../../WaveformCard/WaveformCard';
import { HintLadder } from '../../HintLadder/HintLadder';
import type { Rung } from '../../../lib/recall/script';
import {
  BoltIcon,
  FlameIcon,
  MenuIcon,
  HistoryIcon,
  ProBadge,
  ComposeIcon,
  CloseIcon,
  HintBulbIcon,
  ScanIcon,
  RailMicIcon,
  QuizIcon,
  SummarizeIcon,
  NotebookIcon,
  NavChatIcon,
  NavSearchIcon,
  NavTargetIcon,
  NavTrophyIcon,
} from './icons';
import { XCloseIcon } from '../../BottomSheet/icons';
import { CheckMarkIcon } from '../../ListItem/icons';
import './RecallScreens.css';

/**
 * Recall-state screens.
 *
 * Five states from `reference/Voice_UX.md`'s "States to design" checklist that
 * had no React counterpart. Each is a composition of components that already
 * exist — nothing new is drawn, and every value comes from a token a component
 * already owns.
 *
 * Four of the five have no Figma design (5, 7, 8 and the skip pattern). Their
 * anatomy is written into design-system.md marked "specified in code first;
 * not yet in Figma", so the file can be drawn from the build.
 *
 * Two rules from CLAUDE.md apply to every screen here:
 *   "Every recall screen keeps a text fallback and a way out."
 *   "Never trap the student."
 * That is why `TypeAnswer` and the skip control appear on every recall turn,
 * not only where Figma happens to draw them.
 */

/* ------------------------------------------------------------------ */
/* Shared parts, taken from the `answer sent` and `Idle` screens.      */
/* ------------------------------------------------------------------ */

/** Knowie's poses, exported from the `mascotSlot` instances in those screens. */
const KNOWIE = {
  /** `Homie=3262:90202`. The pose `Idle` and `answer sent` both use. */
  excited: '/images/knowie-excited.png',
  /** `Homie=3262:90197`. The pose `mic permission` uses. */
  standby: '/images/knowie-standby.png',
  /**
   * `thinking`, node 4514:1029. The one pose that is NOT a `mascotSlot`
   * instance — `thinking progress` places the component directly at 122×132,
   * off every illustration step. Drawn at its Figma size rather than snapped
   * to `XL` (64) or `2XL` (120), because it is the only thing on that screen
   * and 120 would crop the ears. Logged in design-system.md.
   */
  thinking: '/images/knowie-thinking.png',
  /**
   * The crying pose from `exit screen` (15807:21978). Not a `mascotSlot`
   * instance either — the file places ten loose vectors straight into the
   * sheet — so it is boxed at `size/fab/thinking` and contained, the same way
   * `thinking` is. See `.knw-plea__art`.
   *
   * HOW IT WAS GOT OUT OF THE FILE, because the obvious way does not work.
   * `exportAsync` on the vectors' own frame returns a blank image — the shapes
   * render only through something the parent contributes — so the pose was cut
   * out of a 4× render of the whole screen instead, then flood-filled from the
   * border to take the sheet's fill back off. It is genuinely transparent, not
   * a navy tile that happens to match; the only trace left is a dark fringe on
   * the antialiased edge, which is invisible on any dark ground and would show
   * on a light one. Re-export it properly if the file ever renders it alone.
   * Logged in design-system.md.
   */
  sad: '/images/knowie-sad.png',
} as const;

function Knowie({ pose }: { pose: keyof typeof KNOWIE }) {
  return (
    <Image
      className="knw-recall__knowie"
      src={KNOWIE[pose]}
      alt=""
      width={200}
      height={200}
      unoptimized
    />
  );
}

/**
 * The turn's header: close, progress, XP.
 *
 * Follows `Top Nav Default` (node `15807:22130`): one 56-high row carrying the
 * exit control, `progressIndicator`, and the XP cluster on the right.
 *
 * The XP figure starts at 0 and the progress count is not drawn, both matching
 * `Top Nav Default`.
 *
 * TOKEN NOTE: the bolt and the figure take `accent/blue/bold` (#5FA0FC), the
 * exact colour the app renders XP in. Figma binds both one step lighter, to
 * `accent/blue/label/subtle` (#7BA8F2).
 *
 * The count is hidden, not discarded: `progressText` still reaches the
 * progressbar's accessible name, because removing a visible label should not
 * remove the information from assistive tech. Sighted students get the fill,
 * everyone else still hears "Terms answered: 1 of 4".
 */
export function RecallHeader({
  progress = 25,
  progressText = '1 of 4',
  xp = 0,
  onExit,
}: {
  progress?: number;
  /** Not rendered — carried in the progressbar's accessible name. */
  progressText?: string;
  /**
   * XP so far this session. Static through the whole loop by design: XP is a
   * flat completion bonus, so this reads 0 on every recall screen and changes
   * once, at the summary. Do not wire it to per-term outcomes.
   */
  xp?: number;
  onExit?: () => void;
}) {
  return (
    <div className="knw-recall__header">
      {/* A CONTROL WITH NOTHING WIRED IS NOT DRAWN — the rule the sheet's ✕ and
          the card's next-action already follow, applied to the way out.
          Processing is the one turn that passes no `onExit`: the judge is
          mid-verdict, there is nothing to go back to yet, and a ✕ there would
          abandon a take that is about to be answered. Every other screen wires
          it, so every other screen draws it. */}
      {onExit ? (
        <button type="button" className="knw-recall__exit" aria-label="Leave session" onClick={onExit}>
          <span className="knw-entry__appbar-icon">
            <CloseIcon />
          </span>
        </button>
      ) : (
        /* The slot stays so the bar keeps its width and the progress keeps its
           position — the row is measured against Figma's, not against whether
           this turn has an exit. */
        <span className="knw-recall__exit-slot" aria-hidden="true" />
      )}
      {/* thickness=16, which is what every recall frame in the file binds —
          `Idle`, `cancel option`, `student talking`, `thinking progress`,
          `hint 1` and `reveal` all six. The component defaults to 24; this
          header was built on that default and was 8px heavy on every screen.
          `showText` has no effect at 16 by design, and nothing is lost: the
          count was never drawn, only spoken, and `label` still carries it. */}
      <ProgressIndicator
        progress={progress}
        thickness="16"
        showText={false}
        label={`Terms answered: ${progressText}`}
      />
      {/* The bolt and the figure mean one thing together, so they are named as
          one unit — the pattern `mascotSlot` and `waveformCard` already use.
          `aria-label` on a bare <p> is prohibited: a paragraph has no role that
          takes a name. */}
      <div className="knw-recall__xp" role="img" aria-label={`${xp} XP this session`}>
        <span className="knw-recall__xp-icon">
          <BoltIcon />
        </span>
        {xp}
      </div>
    </div>
  );
}

/**
 * The question bubble.
 *
 * `answer sent` and `Idle` draw the same card: a 24/28-padded box at
 * `Radius/200`, holding Knowie's framing line and then the question itself,
 * both at 18/24 regular — `body/M-regular`. The second paragraph carries a
 * 20px top inset, which is why they are separate blocks rather than one.
 *
 * TOKEN NOTE: Figma's fill is a raw #1C1C2A with no variable behind it — the
 * same unbound card colour `folderCard` has, and the reason `background/card`
 * is already an open request. `background/surface` is the nearest bound token
 * and is what every other card in this library uses.
 */
export function QuestionBubble({
  intro,
  question,
}: {
  intro?: ReactNode;
  /** A node, not a string: the app's screenshots bold the key term in place. */
  question: ReactNode;
}) {
  return (
    <div className="knw-recall__bubble">
      {intro && <p className="knw-recall__intro">{intro}</p>}
      <p className="knw-recall__question">{question}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The entry path — how a student gets into the loop at all            */
/* ------------------------------------------------------------------ */

/**
 * The chat app bar the entry screens share: the menu, the three stat clusters,
 * and history. No progress and no ✕ — nothing has started yet, so there is
 * nothing to measure or to leave.
 *
 * NOT `RecallHeader`, and not a variant of it. That header exists to carry a
 * turn's progress and its way out; this one carries the account. Merging them
 * would give every recall turn a hamburger and this screen a progress bar for
 * a session that does not exist.
 */
export function ChatHeader({
  xp = 2,
  streak = 3,
  onMenu,
  onHistory,
  inChat = false,
}: {
  xp?: number;
  streak?: number;
  onMenu?: () => void;
  onHistory?: () => void;
  /**
   * The bar the chat screens draw, rather than the front door's.
   *
   * THE APP BAR IS NOT ONE BAR, AND THE DIFFERENCE IS DELIBERATE. `entrypoint`
   * and `selecting explain feature` — one tap apart — change two things
   * between them:
   *
   *   trailing icon   `clock-rewind` (your history)  ->  compose (a new chat)
   *   stat chips      Upgrade · XP · streak          ->  Upgrade · XP
   *
   * Both follow from where you are. On the front door the useful control is
   * what you did before; once you are inside a chat it is starting a fresh
   * one. And the streak is a home-screen statistic — a chat is about the
   * message being written, not about how many days you have shown up.
   */
  inChat?: boolean;
}) {
  const trailingIcon = inChat ? <ComposeIcon /> : <HistoryIcon />;
  const trailingLabel = inChat ? 'New chat' : 'History';

  return (
    <div className="knw-entry__header">
      {/* A control with nothing wired to it is not drawn — the same rule the
          sheet's ✕ and the card's next-action already follow. Both of these
          are real app chrome with no destination in a recall prototype, so
          they appear only if a caller gives them one. */}
      {/* DRAWN EITHER WAY; A BUTTON ONLY WHEN WIRED. The rule this build uses
          is `VoiceFab`'s — a state exposes a tap target only when something is
          listening — and the earlier reading of it dropped the glyph entirely,
          which left the front door with no app bar at all. The bar is chrome:
          it belongs on the screen whether or not this prototype has somewhere
          for it to go. What must not exist is a focusable control that does
          nothing, so unwired it renders as an image. */}
      {onMenu ? (
        <button type="button" className="knw-recall__exit" aria-label="Menu" onClick={onMenu}>
          <span className="knw-entry__appbar-icon">
            <MenuIcon />
          </span>
        </button>
      ) : (
        <span className="knw-recall__exit" role="img" aria-label="Menu">
          <span className="knw-entry__appbar-icon">
            <MenuIcon />
          </span>
        </span>
      )}

      <div className="knw-entry__stats">
        {/* The PRO lockup and the word beside it, which is how the file draws
            this: a gold ring reading PRO, then "Upgrade". Not a `Chips` — the
            first pass used `color="pro" active="True"`, which paints a solid
            gold pill with dark text, and the app's is an outline. */}
        <span className="knw-entry__upgrade">
          <span className="knw-entry__pro" aria-hidden="true">
            <ProBadge />
          </span>
          Upgrade
        </span>

        <span className="knw-entry__stat knw-entry__stat--xp" role="img" aria-label={`${xp} XP`}>
          <span className="knw-entry__stat-icon">
            <BoltIcon />
          </span>
          {xp}
        </span>

        {/* The streak — a front-door statistic, so the chat bar drops it, as
            Figma does one screen later. Coral is `accent/coral/bold`, which
            design-system.md reserves for decorative accents: a streak count is
            exactly that, and explicitly not an error. */}
        {inChat ? null : (
          <span className="knw-entry__stat knw-entry__stat--streak" role="img" aria-label={`${streak} day streak`}>
            <span className="knw-entry__stat-icon">
              {/* A FLAME, NOT A SECOND BOLT. The file has always drawn one here;
                  the build reused `BoltIcon` because nobody had extracted it, so
                  the bar showed the same glyph twice in two colours. */}
              <FlameIcon />
            </span>
            {streak}
          </span>
        )}
      </div>

      {/* History on the front door, compose inside a chat — Figma's own swap
          between `entrypoint` and `selecting explain feature`. */}
      {onHistory ? (
        <button type="button" className="knw-recall__exit" aria-label={trailingLabel} onClick={onHistory}>
          <span className="knw-entry__appbar-icon">{trailingIcon}</span>
        </button>
      ) : (
        <span className="knw-recall__exit" role="img" aria-label={trailingLabel}>
          <span className="knw-entry__appbar-icon">{trailingIcon}</span>
        </span>
      )}
    </div>
  );
}

/**
 * Figma's feature rail, in Figma's order, each with the glyph the file gives
 * it. `Explain out loud` is the live one.
 *
 * EVERY CHIP HAS AN ICON, and each carries its own accent — the rail is
 * colour-coded by feature, which is how the app tells them apart at a glance.
 * An earlier pass ran the rail icon-less on a misreading: these glyphs are
 * separate instances beside the chip's `iconSlot`, and it is the *slot* that is
 * switched off in the file, not the icon.
 */
export const HOME_FEATURES = [
  { label: 'Scan', Icon: ScanIcon, accent: 'brand' },
  { label: 'Explain out loud', Icon: RailMicIcon, accent: 'blue' },
  { label: 'Quiz', Icon: QuizIcon, accent: 'magenta' },
  { label: 'Summarize', Icon: SummarizeIcon, accent: 'green' },
] as const;

/**
 * The last thing the student worked on, riding the same rail — Figma puts
 * "Chemistry prep" at its end. Hoisted out of the home screen so the composer
 * can draw the identical rail rather than a copy of it.
 */
export const HOME_RECENT = { label: 'Chemistry prep', Icon: NotebookIcon, accent: 'coral' } as const;

/** The bottom bar. Only the tab the student is on is live. */
const HOME_NAV = [
  { label: 'Knowie', Icon: NavChatIcon, current: true },
  { label: 'Search', Icon: NavSearchIcon, current: false },
  { label: 'Goals', Icon: NavTargetIcon, current: false },
  { label: 'Leaderboard', Icon: NavTrophyIcon, current: false },
] as const;

export interface HomeScreenProps {
  /** Figma: "Evening study session, Harry?" */
  greeting?: string;
  /** The feature the prototype actually opens. */
  onExplainOutLoud?: () => void;
  /** A recent folder, straight into its concepts. */
  onOpenFolder?: () => void;
  /** The app bar's leading control. */
  onMenu?: () => void;
  /** The app bar's trailing control. */
  onHistory?: () => void;
}

/**
 * Follows `Entrypoint 1`, node `15618:8632` — the app's front door.
 *
 * ONE FEATURE IS LIVE, AND THE OTHERS SAY SO. Figma draws four: Scan, Explain
 * out loud, Quiz, Summarize. Only Explain out loud is in this prototype's
 * scope, so only it is wired — the rest are drawn but not pressable, which is
 * the same rule every other dead control in this build follows. Making them
 * navigate somewhere plausible would be the dishonest option in a demo.
 *
 * THE RAIL SCROLLS RATHER THAN WRAPPING. Four chips do not fit 390, and the
 * file draws them running off the right edge — which is the shipped app's
 * pattern for a feature rail and reads as "there are more" rather than as
 * something cut off.
 *
 * A NOTE ON `Chips`: its Figma description says to use `button` for actions,
 * and these are actions. The app draws chips here anyway, and `Chips` already
 * carries `onPress` for exactly this — a picker rail is a row of toggles, not
 * a row of CTAs, and a rail of Buttons would read as four competing primaries.
 */
export function HomeScreen({
  greeting = 'Evening study session, Harry?',
  onExplainOutLoud,
  onOpenFolder,
  onMenu,
  onHistory,
}: HomeScreenProps) {
  return (
    <Screen
      /* THE FRONT DOOR HAS AN APP BAR. The first pass ran this screen with
         `showTopNavSlot={false}`, so Entry 1 was the one entry screen with no
         header — while the file gives it the same bar as every other: menu,
         Upgrade, XP, streak, history. Its absence is most of why the screen
         did not read as the app. */
      topNavigation={<ChatHeader onMenu={onMenu} onHistory={onHistory} />}
      middleContent={
        <div className="knw-home">
          <MascotSlot size="2XL" label="Knowie, waiting">
            <Knowie pose="standby" />
          </MascotSlot>
          <h1 className="knw-home__greeting">{greeting}</h1>
        </div>
      }
      bottomContent={
        <div className="knw-home__foot">
          <div className="knw-home__rail">
            {HOME_FEATURES.map(({ label, Icon, accent }) => {
              const live = label === 'Explain out loud';
              return (
                <Chips
                  key={label}
                  size="M"
                  color="Primary"
                  /* THE RAIL DRAWS NO CHIP ACTIVE. Figma gives all four the
                     same `background/surface` fill and tells them apart by
                     their accent glyph, not by a filled pill. Marking the live
                     one `active="True"` painted it solid violet, which reads as
                     a selected filter rather than the one feature that opens. */
                  active="False"
                  Text={label}
                  showLeftIcon
                  leftIcon={
                    <span className="knw-accent-icon" data-accent={accent}>
                      <Icon />
                    </span>
                  }
                  showRightIcon={false}
                  onPress={live ? onExplainOutLoud : undefined}
                />
              );
            })}
            {/* The last thing the student worked on, as a chip on the same
                rail — the file puts "Chemistry prep" here. */}
            <Chips
              size="M"
              color="Primary"
              active="False"
              Text={HOME_RECENT.label}
              showLeftIcon
              leftIcon={
                <span className="knw-accent-icon" data-accent={HOME_RECENT.accent}>
                  <HOME_RECENT.Icon />
                </span>
              }
              showRightIcon={false}
              onPress={onOpenFolder}
            />
          </div>

          <ChatInput status="Inactive" placeholder="Ask anything" />

          {/* The bottom bar. Four tabs and the student's avatar, of which only
              the one they are on is real in this prototype — so the rest are
              drawn and not pressable, the same rule the rail's three dead
              features follow. Its absence was the other half of why Entry 1
              did not read as the app's front door. */}
          <nav className="knw-home__nav" aria-label="Main">
            {HOME_NAV.map(({ label, Icon, current }) => (
              <span
                key={label}
                className="knw-home__nav-item"
                data-current={current}
                role="img"
                aria-label={current ? `${label}, current page` : label}
              >
                <Icon />
              </span>
            ))}
            <span className="knw-home__nav-avatar" role="img" aria-label="Your profile">
              <Knowie pose="standby" />
            </span>
          </nav>
        </div>
      }
    />
  );
}

/** Figma's `chip container`, in Figma's order, with Figma's glyphs. */
/**
 * The composer's rail is THE FEATURE RAIL, the same one the front door draws.
 *
 * An earlier pass put Camera / Gallery / Files here — thin monochrome
 * attachment sources — because that is what `chip container` held at the time.
 * The file now draws the feature rail on `selecting explain feature` and
 * `choosing chip` both: Quiz, Summarize, Explain out loud, Chemistry prep,
 * Scan, scrolled, in their own accents. So the row does not change when the
 * student picks a feature; it keeps offering the others, which is what makes
 * swapping one for another an obvious move rather than a hidden one.
 *
 * Same array as the home rail plus the recent folder, so the two screens
 * cannot drift: one list, two screens.
 */
const ATTACHED_FEATURE =
  HOME_FEATURES.find((f) => f.label === 'Explain out loud') ?? HOME_FEATURES[0];

/**
 * THE RAIL DROPS WHAT IS ALREADY ATTACHED. Explain out loud has moved into the
 * composer, so offering it again on the rail above would be offering the
 * student something they have already chosen — and would put the same chip on
 * the screen twice with two different meanings, one a choice and one a state.
 *
 * Derived from the same list rather than retyped, so the rail and the chip can
 * never disagree about what Explain out loud looks like: the composer's mic is
 * literally `ATTACHED_FEATURE.Icon`.
 */
const COMPOSE_RAIL = [...HOME_FEATURES, HOME_RECENT].filter(
  (f) => f.label !== ATTACHED_FEATURE.label,
);

export interface ComposeScreenProps {
  /**
   * What is in the field. Figma's `choosing chip` draws "World History/", so
   * that is the default: typing is mocked here exactly as speech is mocked
   * everywhere else, and `chatInput` is a presentational component with no
   * `onChange` to wire. Pass '' to see the placeholder state.
   */
  value?: string;
  /**
   * Tapping the empty field, which is how this prototype mocks typing.
   *
   * Figma's prototype models it exactly this way: `selecting explain feature`
   * (chip attached, field empty) taps through to `choosing chip` (the same
   * screen with the topic in the field). Two frames, one screen, one tap —
   * which is why they are `value` here rather than two routes.
   */
  onFill?: () => void;
  /** Send the topic and let Knowie build a set. */
  onSend?: () => void;
  /** Drop the Explain out loud chip and go back to a plain chat. */
  onClearFeature?: () => void;
  onBack?: () => void;
}

/**
 * Follows `selecting explain feature` (`15683:16358`) and `choosing chip`
 * (`15866:11350`) — which are ONE screen at two moments, not two screens. The
 * only difference between the frames is whether the field is empty or reads
 * "World History/", so `value` is the difference and the screen is one.
 *
 * THE CHIP IS THE POINT. Picking Explain out loud on the home screen attaches
 * it to the composer, and it stays attached until the student removes it —
 * that is what makes the next message a practice set rather than a question.
 * Figma gives it an ✕, so it is removable here too.
 *
 * NO KEYBOARD DRAWN, but its space is reserved. Both frames show the OS
 * keyboard up; on a device the OS raises it when the field takes focus, so what
 * the screen owes is the room, not a drawing of the keys. The reserve is the
 * same device-chrome constant the text fallback already uses.
 *
 * TYPING IS MOCKED, like the speech. `chatInput` is presentational and has no
 * `onChange`, so the field arrives carrying the topic — which is the moment
 * `choosing chip` draws anyway — and Send is what moves the student on.
 */
export function ComposeScreen({
  value = 'World history',
  onFill,
  onSend,
  onClearFeature,
  onBack,
}: ComposeScreenProps) {
  return (
    <Screen
      /* The chat bar, not the front door's: compose instead of history, and no
         streak. Figma swaps both between `entrypoint` and `selecting explain
         feature`, the screen this one is. */
      topNavigation={<ChatHeader onMenu={onBack} inChat />}
      middleContent={
        /* Figma puts a `mascotSlot` at 120 here holding `standby` — the same
           pose and the same size the home screen uses. The first pass left this
           slot empty, which is why the screen read as a bare composer: Knowie
           is meant to be waiting above the field while the student types. */
        <div className="knw-entry knw-entry--compose">
          <MascotSlot size="2XL" label="Knowie, waiting">
            <Knowie pose="standby" />
          </MascotSlot>
        </div>
      }
      bottomContent={
        <div className="knw-recall__composer">
          {/* `chip container` — THE FEATURE RAIL, unchanged from the front
              door. Picking a feature attaches it to the composer; it does not
              take the others away, so the rail keeps offering them and
              swapping one for another stays an obvious move.

              Drawn, not wired, like the home rail's three dead features: the
              prototype only carries Explain out loud, and the one chip that
              would mean something here is the one already attached below. */}
          {/* FOCUSABLE BECAUSE IT SCROLLS AND NOTHING INSIDE IT DOES. None of
              these chips is wired, so the row holds no tab stop — and a region
              that scrolls with no way to reach it by keyboard is unreachable
              for anyone not using a pointer. axe flags exactly this
              (`scrollable-region-focusable`), and it only started flagging when
              the row went from three chips to five and began to overflow: the
              same markup was compliant at three purely because it fitted. */}
          <div
            className="knw-entry__sources"
            tabIndex={0}
            role="group"
            aria-label="Practice features"
          >
            {COMPOSE_RAIL.map(({ label, Icon, accent }) => (
              <Chips
                key={label}
                size="M"
                color="Primary"
                active="False"
                Text={label}
                showLeftIcon
                leftIcon={
                  <span className="knw-accent-icon" data-accent={accent}>
                    <Icon />
                  </span>
                }
                showRightIcon={false}
              />
            ))}
          </div>

          <ChatInput
            status={value ? 'Ready to send' : 'Inactive'}
            value={value}
            placeholder="Tell me what you want to practice..."
            /* Empty, the field takes a tap and fills; full, it sends. One
               screen, the prototype's two frames. */
            onFieldPress={value ? undefined : onFill}
            onTrailingPress={value ? onSend : onFill}
            /* ONE MICROPHONE ON THIS SCREEN, and it is the chip's.
               `status="Inactive"` would put `chatInput`'s own mic in the
               trailing slot, so the empty composer drew two mics a few pixels
               apart — the chip's blue one meaning "this will be spoken", and a
               thin white one meaning "record". Different drawings, different
               colours, the same word about two different things.

               Figma settles it by drawing Send on `selecting explain feature`
               even with the field empty, which is also what makes the two
               frames of this screen agree: the trailing control is the same
               glyph before and after the topic arrives. */
            showSend
            sendLabel={value ? 'Send' : 'Add your topic'}
            /* THE CHIP LIVES INSIDE THE BOX. Figma's `chat box` is a vertical
               frame holding the `EolChip` and then the row of text and send —
               the attached feature is part of the message being composed, not a
               control hovering above it. The first pass rendered it as a
               sibling above `chatInput`, which read as a separate toolbar and
               broke the one idea the screen exists to convey: what you type
               next will be spoken. */
            attachment={
              <Chips
                size="S"
                color="Primary"
                  /* RESTING, NOT ACTIVE — the same call the home rail makes.
                     Figma fills this chip with white at 10%, which on the dark
                     ground is the resting `background/surface`; `active="True"`
                     paints the solid violet-on-white pill instead, so the
                     composer's chip looked like a different component from the
                     rail's. Attachment is signalled by the chip being there at
                     all, and by the mic — not by inverting it. */
                  active="False"
                  Text={ATTACHED_FEATURE.label}
                  /* THE SAME MIC AS THE HOME RAIL, not a second one. A first
                     pass reached for `chatInput`'s `MicrophoneIcon` — a thin
                     white outline — so the identical chip, labelled "Explain
                     out loud", carried one glyph on the front door and another
                     in the composer. Figma draws the same blue mic in both: the
                     EolChip's vector is `RailMicIcon`'s drawing at 10 x 14.5
                     rather than 15 x 21.75, in the same `accent/blue/bold`.
                     `size="S"` matches the frame on the three values that
                     matter — 12 padding, caption/M-bold at 12/16, and the 16
                     icon box the mic is drawn at. */
                showLeftIcon
                leftIcon={
                  <span
                    className="knw-accent-icon"
                    data-accent={ATTACHED_FEATURE.accent}
                  >
                    <ATTACHED_FEATURE.Icon />
                  </span>
                }
                /* THE ✕ IS INSIDE THE PILL, as Figma draws it: mic, label, ✕,
                   one object. It was a separate 44px button beside the chip,
                   which read as two controls for one thing. `Chips` had no way
                   to make its trailing icon pressable, so it gained one —
                   `onRightIconPress`, deliberately distinct from `onPress`,
                   because a pressable chip reports `aria-pressed` and removing
                   something is not a toggle. */
                showRightIcon={Boolean(onClearFeature)}
                rightIcon={<XCloseIcon />}
                onRightIconPress={onClearFeature}
                rightIconLabel="Remove Explain out loud"
              />
            }
          />

          <div className="knw-recall__keyboard" aria-hidden="true" />
        </div>
      }
    />
  );
}

export interface FoldersScreenProps {
  title?: string;
  onOpen?: (folder: string) => void;
  onBack?: () => void;
}

/** Figma's three, in Figma's order. */
const FOLDERS = [
  { title: 'World War II', dateLabel: '1939 – 1945', conceptCount: '18 concepts', accent: 'Blue' as const },
  { title: 'The Cold War', dateLabel: '1947 – 1991', conceptCount: '22 concepts', accent: 'Magenta' as const },
  { title: 'Civil Rights Movement', dateLabel: '1954 – 1968', conceptCount: '10 concepts', accent: 'Gold' as const },
];

/**
 * Follows `choose folder screen`, node `15647:11079`.
 *
 * The other way in: rather than describing a topic in the chat, the student
 * picks something they have already studied. Both paths end at the same place —
 * a set of concepts and the orb.
 */
export function FoldersScreen({
  title = 'World History Foundations',
  onOpen,
  onBack,
}: FoldersScreenProps) {
  return (
    <Screen
      topNavigation={<ChatHeader onMenu={onBack} />}
      middleContent={
        <div className="knw-folders">
          <div className="knw-folders__head">
            <h1 className="knw-folders__title">{title}</h1>
            {/* An h2, not a paragraph: `folderCard` titles are h3, so a page
                that jumped h1 → h3 left a hole in the outline — caught by axe
                in the story, not by looking at it. It is a section heading over
                the list either way. */}
            <h2 className="knw-folders__ask">What have you studied so far?</h2>
            <p className="knw-folders__hint">Choose one among the list to start revising</p>
          </div>

          <div className="knw-folders__list">
            {FOLDERS.map((f) => (
              <FolderCard
                key={f.title}
                accent={f.accent}
                title={f.title}
                dateLabel={f.dateLabel}
                conceptCount={f.conceptCount}
                onOpen={() => onOpen?.(f.title)}
              />
            ))}
          </div>
        </div>
      }
    />
  );
}

export interface ExplainEntryScreenProps {
  /** What the student asked for. Figma: "World history". */
  topic?: string;
  /** Knowie's reply, above the card. */
  reply?: string;
  /** The set the card offers. */
  setTitle?: string;
  /** Figma: "~2-3 min". */
  duration?: string;
  /**
   * `true` while Knowie is still writing the set. The card is drawn but not
   * yet tappable — Figma's `choosing chip` (15866:11790) labels it
   * "Generating".
   */
  generating?: boolean;
  /** THE POINT OF THE SCREEN: start the session. */
  onStart?: () => void;
  onBack?: () => void;
  /** The thumbs. Not drawn unless something is wired to them. */
  onFeedback?: (helpful: boolean) => void;
}

/**
 * Follows `explain out ready`, node `15619:8880` — the screen that starts a
 * session, and until now the loop's missing front door.
 *
 * EVERY OTHER SCREEN IN THIS PROTOTYPE ASSUMED A SESSION WAS ALREADY RUNNING.
 * `/recall/idle` opens on term 1 of a script nothing chose. This is where the
 * choosing happens: the student names a topic in the chat, Knowie offers a set,
 * and tapping the card is what begins the ladder.
 *
 * IT IS ALSO THE SUMMARY'S "TRY AGAIN" DESTINATION — the one control in the
 * build that had nowhere to go.
 *
 * THE CARD IS A BUTTON, NOT A CARD WITH A BUTTON IN IT. Figma draws no CTA
 * inside it; the whole 314×104 surface is the affordance, which is how the
 * shipped app's feature tiles behave too.
 *
 * NOT A RECALL TURN, so it does not borrow `.knw-recall`'s centred column or
 * its 20 gutter. This is a chat thread: the student's turn is a pill on the
 * right, Knowie's is running text at full width.
 *
 * TOKEN NOTE: the card's fill is a Figma variable named "EOL Card background"
 * (#0B1E4A) with no counterpart in tokens.json. It takes `accent/blue/subtle`,
 * the nearest step that is also the right role. See `.knw-entry__start`.
 */
export function ExplainEntryScreen({
  topic = 'World history',
  reply = "I'll make a focused speaking-practice set for broad world history, covering the most important foundations.",
  setTitle = 'World history foundations',
  duration = '~2-3 min',
  generating = false,
  onStart,
  onBack,
  onFeedback,
}: ExplainEntryScreenProps) {
  return (
    <Screen
      topNavigation={<ChatHeader onMenu={onBack} />}
      middleContent={
        <div className="knw-entry">
          <div className="knw-entry__student">
            <p className="knw-entry__bubble">{topic}</p>
            {/* Which feature the message was sent with, named under it the way
                the file does — the chip the student attached in the composer. */}
            <p className="knw-entry__picked">✨ Explain out loud</p>
          </div>

          <Chips size="XS" color="pro" active="True" Text="Smart Answer" showLeftIcon={false} showRightIcon={false} />

          <p className="knw-entry__reply">{reply}</p>

          <button
            type="button"
            className="knw-entry__start"
            onClick={onStart}
            disabled={generating}
          >
            <span className="knw-entry__start-body">
              <span className="knw-entry__start-head">
                {/* The rail's mic, because this is the rail's feature. Figma
                    draws it at 30 in the same `#5fa0fc` the chip uses; the
                    build had `chatInput`'s thin outline, so Explain out loud
                    carried a third drawing on its third screen. */}
                <span className="knw-entry__start-mic">
                  <RailMicIcon />
                </span>
                <span className="knw-entry__start-labels">
                  <span className="knw-entry__start-action">Explain out loud</span>
                  <span className="knw-entry__start-time">
                    {generating ? 'Generating…' : duration}
                  </span>
                </span>
              </span>
              <span className="knw-entry__start-set">{setTitle}</span>
            </span>

            {/* Knowie peeking out of the card. XL (64) against the 44 the file
                draws — the same inline-mascot gap the text fallback already
                logs, and the same decision. */}
            <MascotSlot size="XL" label="Knowie, ready">
              <Knowie pose="excited" />
            </MascotSlot>
          </button>

          {onFeedback ? (
            <div className="knw-entry__feedback">
              <p className="knw-entry__feedback-ask">Happy with the answer?</p>
              <div className="knw-entry__feedback-row">
                <Chips size="S" color="Primary" active="False" Text="👍 Helpful" showLeftIcon={false} showRightIcon={false} onPress={() => onFeedback(true)} />
                <Chips size="S" color="Primary" active="False" Text="👎 Unhelpful" showLeftIcon={false} showRightIcon={false} onPress={() => onFeedback(false)} />
              </div>
            </div>
          ) : null}
        </div>
      }
      bottomContent={
        /* At rest, and no keyboard. Figma draws this frame mid-typing with the
           OS keyboard up, which is a moment rather than the screen's state —
           nothing is focused when a student arrives here, least of all when
           they arrive from the summary's "Try again". */
        <ChatInput status="Inactive" placeholder="Ask anything" />
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Shared escapes — the text fallback and skip, on every recall turn.  */
/* ------------------------------------------------------------------ */

export interface RecallEscapesProps {
  /** Called when the student takes the text path. */
  onTypeAnswer?: () => void;
  /** Called when the student skips the term. */
  onSkip?: () => void;
  /** Figma types "Skip Question"; sentence case is a CLAUDE.md rule, so this is
      "Skip question". sprint-context.md requires it on every turn. */
  skipLabel?: string;
}

/**
 * Skip, in the place and the treatment the `Idle` screen gives it: directly
 * under the question bubble, pushed to the right edge, set in
 * `caption/M-bold` on `text/secondary`.
 *
 * It is a bare text control, not `button variant=Tertiary` — Figma draws it as
 * a text layer with no surface, the same weight as `typeAnswerComponent`.
 * Attaching it to the question is what makes it read as "skip *this* term"
 * rather than "leave the session".
 */
export function RecallSkip({
  onSkip,
  skipLabel = 'Skip question',
}: Pick<RecallEscapesProps, 'onSkip' | 'skipLabel'>) {
  return (
    <div className="knw-recall__skip">
      <button type="button" className="knw-recall__skip-control" onClick={onSkip}>
        {skipLabel}
      </button>
    </div>
  );
}

/**
 * The text fallback, pinned to the bottom of a recall turn. Voice_UX lists it
 * as a "Must". Skip is the other Must, but it lives under the question — see
 * `RecallSkip`.
 */
export function RecallEscapes({ onTypeAnswer }: Pick<RecallEscapesProps, 'onTypeAnswer'>) {
  return (
    <div className="knw-recall__escapes">
      <TypeAnswer onClick={onTypeAnswer} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The take — the listening loop's second half, and where state 5 lives */
/* ------------------------------------------------------------------ */

export interface AnswerSentScreenProps extends RecallEscapesProps {
  /** What was heard. The screen exists so the student can check it. */
  transcript?: string;
  /** Say it again. Costs no rung — the take is replaced, not judged. */
  onRetry?: () => void;
  /**
   * Which of the screen's two beats to draw. Leave it unset and the screen
   * owns the transition itself, which is what the route wants; set it and the
   * beat is pinned, which is what a story wants.
   *
   * `false` — a take exists and has not been submitted. Discard and send.
   * `true`  — submitted. The 300ms flash before the verdict.
   */
  sent?: boolean;
  onSend?: () => void;
  onDiscard?: () => void;
  onExit?: () => void;
  /**
   * Where the sent beat goes when it ends. Wired, this is the verdict route.
   *
   * Leave it unset and the beat holds indefinitely — which is what every
   * Storybook story wants, since a story that advanced itself could not be
   * inspected.
   */
  onAdvance?: () => void;
  /** How long the sent beat holds before `onAdvance` fires. */
  holdMs?: number;
}

/**
 * Follows `cancel option`, node `15707:18257`: header, Knowie at `mascotSlot
 * size=2XL`, `transcriptSection`, a Continue / Retry pair, skip, then the orb
 * in a zone of its own with the text fallback beneath it.
 *
 * THIS IS THE LISTENING LOOP'S SECOND HALF, not a screen of its own. The
 * student stops speaking and lands here with a take in hand.
 *
 * AN EARLIER BUILD DREW A QUESTION BUBBLE HERE, and that was wrong twice over:
 * the node draws a transcript, and by this moment the question is not what the
 * student needs — checking what was heard is the entire reason the beat
 * exists. Voice_UX principle 4: showing what was heard is what lets a bad
 * result read as "the app misheard me" rather than "I failed".
 *
 * THREE EXITS, AND THEY ARE GENUINELY DIFFERENT. This is what the earlier
 * build collapsed:
 *
 *   Continue   submit this take            rung CONSUMED
 *   Retry      say it again                rung intact — the take is replaced
 *   Trash      throw the take away         rung intact — back to idle
 *
 * "Cancel & re-record before send" (Must, brief F2) is the trash, and it is
 * reachable because this beat waits. `voiceFab` carries no axis for it, so
 * `showDiscard` was added; it rides with `state=Sent`, the moment a take
 * exists to throw away, as a 40×40 pill to the LEFT of the orb.
 *
 * THE SCREEN HAS TWO BEATS, AND ONLY THE SECOND IS 300ms.
 *
 *   sent=false   A take exists and has NOT been submitted. Everything above is
 *                live and the screen waits.
 *   sent=true    Submitted. 300ms, no controls, then the judge.
 *
 * Both draw `voiceFab state=Sent` captioned "Answer sent" — on this screen the
 * orb is status, not a control, which is why tapping it does nothing and the
 * decisions sit in the buttons. Only the buttons and the pill differ between
 * beats, so the flash does not read as a layout jump.
 */
export function AnswerSentScreen({
  transcript = '"...context and... being critical of sources. Primary source is available in archives."',
  sent: sentProp,
  onSend,
  onRetry,
  onDiscard,
  onExit,
  onSkip,
  skipLabel,
  onAdvance,
  holdMs = 300,
  ...escapes
}: AnswerSentScreenProps) {
  const [sentState, setSentState] = useState(false);
  const sent = sentProp ?? sentState;

  /* The 300ms hold, and only on the second beat — the first waits for the
     student. Cleared on unmount so someone who leaves inside the beat is not
     dragged to the verdict by a timer that outlived its screen. */
  useEffect(() => {
    if (!sent || !onAdvance) return;
    const id = window.setTimeout(onAdvance, holdMs);
    return () => window.clearTimeout(id);
  }, [sent, onAdvance, holdMs]);

  const handleSend = () => {
    if (sent) return;
    setSentState(true);
    onSend?.();
  };

  return (
    <Screen
      topNavigation={<RecallHeader onExit={onExit} />}
      middleContent={
        <div className="knw-recall">
          {/* THE POSE CHANGES WITH THE BEAT, which is a departure from Figma.
              `cancel option` binds Homie=excited — the same pose `Idle` uses.
              But excited is Knowie ASKING, and by this screen he has already
              asked: beat 1 is him waiting on a decision that is the student's
              to make, and beat 2 is him taking the answer away to judge it.

              So beat 1 is `standby` — present, not grinning at someone who is
              deciding whether their answer was any good — and beat 2 is
              `thinking`, which also carries the mascot unbroken into the
              processing screen the flash hands off to. All three poses are
              real assets in public/images; nothing is invented. */}
          <div className="knw-recall__mascot knw-recall__mascot--flush">
            <MascotSlot size="2XL" label={sent ? 'Knowie, thinking' : 'Knowie, waiting'}>
              <Knowie pose={sent ? 'thinking' : 'standby'} />
            </MascotSlot>
          </div>

          {/* What was heard, not what was asked. The question belongs to the
              turn before this one — by now the student needs to check the
              transcript, which is the whole reason this beat exists. */}
          <div className="knw-recall__said">
            <TranscriptSection transcript={transcript} />
          </div>

          {/* Horizontal, and it clears buttonGroup's own DON'T — the pair is
              not being treated as equals. Continue is Primary and carries the
              rung; Retry is Secondary and costs nothing. */}
          {!sent && (
            <ButtonGroup variant="Horizontal" size="M">
              <Button variant="Primary" size="M" CTA="Continue" onClick={handleSend} />
              <Button variant="Secondary" size="M" CTA="Retry" onClick={onRetry} />
            </ButtonGroup>
          )}

          <RecallSkip onSkip={onSkip} skipLabel={skipLabel} />
          <div className="knw-recall__fab">
            {/* THE ORB IS STATUS HERE, NOT A CONTROL. Figma captions it
                "Answer sent" on both beats and puts the decisions in the
                buttons above — which is what makes the trash, Retry and
                Continue three different things rather than three ways to
                leave. */}
            <VoiceFab
              state="Sent"
              onPress={undefined}
              showDiscard={!sent}
              onDiscard={onDiscard}
            />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 6 — Text fallback turn                                        */
/* ------------------------------------------------------------------ */

export interface TextFallbackScreenProps extends Pick<RecallEscapesProps, 'onSkip' | 'skipLabel'> {
  prompt?: ReactNode;
  /** What the student has typed so far. Figma shows a half-written answer. */
  answer?: string;
  /** The student's initial, on the avatar beside their own message. */
  initial?: string;
  onSend?: () => void;
  /** Back to the voice path — the student is never locked into text either. */
  onUseVoice?: () => void;
  onExit?: () => void;
}

/**
 * Follows the `text fallback` screen, node `15794:20147`.
 *
 * Voice_UX, Must: "Text fallback turn — Accessibility + situational.
 * Non-negotiable." Principle 5: some students cannot speak at all, many more
 * cannot speak right now.
 *
 * ONLY THE STUDENT'S TURN GETS A SURFACE. The question is plain text with
 * Knowie small beneath it — Figma's container is 358 x 140 at radius 4 with no
 * fill at all. An earlier build put the question in a filled bubble with a
 * tail, which made Knowie's turn look like the student's. Giving one side of
 * the conversation a surface is what makes it read as a conversation.
 *
 * THE KEYBOARD IS UP, BY DEFINITION. This is the typing turn, so the screen is
 * laid out against the height the keyboard leaves — which is also what closes
 * the ~500px of dead space an earlier build had between the answer and the
 * composer. Figma draws the frame 1018 tall for the same reason: 342 of it is
 * the keyboard.
 *
 * The conversation is bottom-aligned, the way a chat is: turns stack upward
 * from just above the composer, so the empty space sits above the first
 * message rather than below the last one.
 *
 * TOKEN NOTE: Figma resizes the `mascotSlot` instance to 44, below every step
 * of the set (XL 64, 2XL 120, 3XL 200, 4XL 320). `XL` is used.
 */
export function TextFallbackScreen({
  prompt = 'Could you explain what the Neolithic Revolution was and why it marked such a significant turning point for early human societies?',
  answer = 'Neolithic settelment is',
  initial = 'L',
  onSend,
  onUseVoice,
  onExit,
  onSkip,
  skipLabel,
}: TextFallbackScreenProps) {
  return (
    <Screen
      topNavigation={<RecallHeader progress={0} progressText="0 of 3" onExit={onExit} />}
      middleContent={
        <div className="knw-recall knw-recall--chat">
          <div className="knw-recall__ask">
            <p className="knw-recall__ask-text">{prompt}</p>
            <MascotSlot size="XL" label="Knowie, asking">
              <Knowie pose="standby" />
            </MascotSlot>
          </div>

          <div className="knw-recall__turn-escapes">
            {/* The way BACK to voice. It lived on the composer's mic, and the
                mic is gone now that the trailing slot carries Send — so it
                moves here, beside skip, in the same bare-text treatment. The
                text path has to be reversible: CLAUDE.md requires text in one
                tap, and a student who switched because the room was loud
                should not be stuck in it once the room is quiet. */}
            <button type="button" className="knw-recall__skip-control" onClick={onUseVoice}>
              Answer out loud
            </button>
            <RecallSkip onSkip={onSkip} skipLabel={skipLabel} />
          </div>

          {/* The student's turn, mirrored right and given the surface. */}
          <div className="knw-recall__answer">
            <p className="knw-recall__answer-text">{answer}</p>
            <span className="knw-recall__avatar" aria-hidden="true">
              {initial}
            </span>
          </div>
        </div>
      }
      bottomContent={
        <div className="knw-recall__composer">
          {/* status="Ready to send", because on this screen there IS an answer
              in the box — `chat-learning.png` shows exactly this: typed text
              with the send control inside the field on the right.

              IT USED TO BE "Inactive", AND SEND WAS UNREACHABLE. chatInput's
              trailing slot is Send OR the mic depending on status, and Inactive
              draws the mic — so `onSend` had been wired to the LEADING control,
              which is labelled "Add attachment". A typed answer could not be
              sent, and the button that claimed to attach a file submitted it. */}
          <ChatInput
            status="Ready to send"
            value={answer}
            onTrailingPress={onSend}
          />
          {/* Reserves what the OS keyboard occupies. Like the 390px device
              width this is device chrome rather than a design value, so it is
              a constant here and not a token — the same call
              .storybook/withKeyboardInset.tsx already makes. */}
          <div className="knw-recall__keyboard" aria-hidden="true" />
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 7 — Mic permission primer                                     */
/* ------------------------------------------------------------------ */

export interface PermissionPrimerScreenProps {
  /** Raises the permission sheet — the screen's only action. */
  onStart?: () => void;
  /** On the sheet: fires the OS dialog. */
  onAllow?: () => void;
  /** On the sheet: the opt-out, straight to the text path. */
  onUseText?: () => void;
  /**
   * Whether the permission sheet is raised. The primer is a two-beat screen:
   * the screen primes, the sheet asks.
   */
  showSheet?: boolean;
  onDismissSheet?: () => void;
}

/**
 * Voice_UX, Must: "Mic permission primer + OS prompt — First-encounter screen
 * (F5)."
 *
 * Follows the `mic permission` screen, node `15794:19616`: Knowie centred in a
 * 48/16-padded block at `mascotSlot size=3XL` in the pose `standby`, the
 * headline beneath at 33/36 bold, and the action pinned to the bottom.
 *
 * IT IS A TWO-BEAT SCREEN. The `mic permission` section holds four nodes, and
 * the screen frame is only the first: the screen primes with "You're ready"
 * and a single `Let's Go`, and the `bottomSheet` (`15794:19867`) is what
 * actually asks — Knowie, "Knowie Would like to access your mic", and the
 * pair `Allow` / `Type Instead`. The section's fourth node is a mock of the
 * iOS dialog that fires after Allow.
 *
 * That is Voice_UX principle 3 built properly: the value is explained before
 * the OS prompt, and the opt-out sits beside Allow rather than being absent.
 * An earlier build put the pair on the screen itself, having read only the
 * screen frame and concluded the design had no opt-out at all.
 *
 * KNOWIE IS DELIBERATELY OUT OF FOCUS. Figma puts a 20px LAYER_BLUR on the
 * block holding the mascot, and it is the point of the composition rather than
 * decoration: Knowie is a soft glow behind "You're ready", not a character in
 * front of it. Bound to `effect/blur` (16), the nearest step. An earlier note
 * here said the only blur token was `effect/blur-soft` (4) and shipped the
 * mascot crisp — both tokens existed; nobody had looked.
 *
 * ONE THING NOT REPRODUCED, for want of a token:
 *   - The headline is 33/36 — `headline/L`. No `textBlock` variant maps to it
 *     (XL is `display/M` at 76, L is `headline/XL` at 44), so it is bound
 *     directly here. A `textBlock` variant at `headline/L` is logged as a gap.
 */
export function PermissionPrimerScreen({
  onStart,
  onAllow,
  onUseText,
  showSheet = false,
  onDismissSheet,
}: PermissionPrimerScreenProps) {
  return (
    <Screen
      showTopNavSlot={false}
      middleContent={
        <div className="knw-recall knw-recall--primer">
          <div className="knw-recall__hero">
            <MascotSlot size="3XL" label="Knowie, waiting">
              <Knowie pose="standby" />
            </MascotSlot>
          </div>
          <h1 className="knw-recall__headline">You&rsquo;re ready</h1>
          {/* Figma leaves ~230 between the headline and the button block, so
              "You're ready" lands about two thirds down rather than against
              the CTA. This is that space, and it takes its share of the column
              in Figma's own 2 : 1 proportion. */}
          <div className="knw-recall__primer-foot" aria-hidden="true" />
        </div>
      }
      bottomContent={
        <div className="knw-recall__escapes">
          {/* A GROUP OF ONE, so the CTA fills the 358 Figma draws. A bare Button
              hugs its label — this came out 82 wide against the frame's 358,
              which is the "button seems small" on this screen.

              SIZE M, LIKE EVERY OTHER BUTTON IN THE BUILD. Widening it to 358
              was only half the fix — the build also ran two button sizes at
              once: M (48 tall, label 15/20) on the recall and permission
              screens, L (56 tall, label 21/24) on comparison, rating, summary
              and exit. Every one is now M. One button, every screen. */}
          <ButtonGroup variant="Vertical" size="M">
            <Button variant="Primary" size="M" CTA="Let’s go" onClick={onStart} />
          </ButtonGroup>
        </div>
      }
      showBottomSheetBackground={showSheet}
      bottomSheetOnly={
        showSheet ? (
          <BottomSheet
            height="M"
            descriptor="By giving access to the microphone you can practice answers and strengthen your memory"
            onDismiss={onDismissSheet}
            dismissLabel="Close"
            middleSection={
              <div className="knw-recall__sheet-body">
                <MascotSlot size="2XL" label="Knowie, asking">
                  <Knowie pose="standby" />
                </MascotSlot>
                <TextBlock
                  variant="L"
                  title="Knowie would like to access your mic"
                  showCaption={false}
                  headingLevel={2}
                />
              </div>
            }
            bottomSection={
              <ButtonGroup variant="Vertical" size="M">
                <Button variant="Primary" size="M" CTA="Allow" onClick={onAllow} />
                <Button variant="Secondary" size="M" CTA="Type instead" onClick={onUseText} />
              </ButtonGroup>
            }
          />
        ) : undefined
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 8 — Permission denied → route to text                         */
/* ------------------------------------------------------------------ */

export interface PermissionDeniedScreenProps {
  onUseText?: () => void;
  /** Raises the sheet that shows the Settings path. */
  onEnableMic?: () => void;
  /**
   * Whether that sheet is up. Leave it unset and the screen owns the
   * transition, which is what the route wants; set it and the beat is pinned,
   * which is what a story wants. Same hybrid `answer sent` uses.
   */
  showSheet?: boolean;
  onDismissSheet?: () => void;
  /** The student has turned the mic on and is coming back to voice. */
  onMicEnabled?: () => void;
}

/** The Settings path, as chips — the trail Figma spells out on the second card. */
const SETTINGS_PATH = ['Settings', 'Privacy and Security', 'Microphone', 'Knowunity'] as const;

/**
 * Voice_UX, Must: "Permission denied → route to text — The dead-end you can't
 * afford."
 *
 * Follows the `mic permission denied` screen, node `15798:21003`. Two things
 * this screen owes the student, and the file gives each its own block: what
 * they are missing and how to get it back, and a way forward that does not
 * require the microphone at all.
 *
 * The orb is `voiceFab state=Deny` — a state that did not exist when this
 * screen was first built. It keeps Idle's ring-and-mic structure and recolours
 * it destructive, so the shape the student already knows reads as blocked
 * rather than absent. `showLabel=false` here: the headline under it says it.
 *
 * The Settings trail is four `chips` at `size=XS`, `color=Primary`,
 * `active=True` — a path, not four actions, which is why they are not buttons.
 *
 * TOKEN NOTE: `state=Deny`'s description in Figma is still Idle's, word for
 * word ("Mic is ready… Label: 'Tap to answer'"). The nodes were followed.
 */
export function PermissionDeniedScreen({
  onUseText,
  onEnableMic,
  showSheet: showSheetProp,
  onDismissSheet,
  onMicEnabled,
}: PermissionDeniedScreenProps) {
  const [raised, setRaised] = useState(false);
  const showSheet = showSheetProp ?? raised;
  return (
    <Screen
      middleContent={
        <div className="knw-recall knw-recall--denied">
          <div className="knw-recall__denied-hero">
            <div className="knw-recall__denied-orb">
              <VoiceFab state="Deny" showLabel={false} />
              <h2 className="knw-recall__denied-title">Mic access denied</h2>
            </div>
            <p className="knw-recall__denied-body">
              Knowunity needs the mic to hear your answer and help you strengthen your memory.
              You can type instead, or re-enable it in the settings
            </p>
          </div>

          <div className="knw-recall__denied-cards">
            <section className="knw-recall__card">
              <h3 className="knw-recall__card-title">Without the mic</h3>
              <p className="knw-recall__card-body">
                You can still complete the session by typing your answers. Text answers are
                recorded the same way.
              </p>
            </section>

            <section className="knw-recall__card">
              <h3 className="knw-recall__card-title">To re-enable mic access</h3>
              <ol className="knw-recall__path">
                {SETTINGS_PATH.map((step) => (
                  <li key={step}>
                    {/* Figma sets both icon slots off — the chip is a label. */}
                    <Chips
                      size="XS"
                      color="Primary"
                      active="True"
                      Text={step}
                      showLeftIcon={false}
                      showRightIcon={false}
                    />
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      }
      bottomContent={
        <div className="knw-recall__escapes">
          {/* Size M — the one button size the build uses, on every screen. */}
          <ButtonGroup variant="Vertical" size="M">
            <Button variant="Primary" size="M" CTA="Type instead" onClick={onUseText} />
            <Button
              variant="Secondary"
              size="M"
              CTA="Enable microphone"
              onClick={() => {
                setRaised(true);
                onEnableMic?.();
              }}
            />
          </ButtonGroup>
        </div>
      }
      showBottomSheetBackground={showSheet}
      bottomSheetOnly={
        showSheet ? (
          <BottomSheet
            height="M"
            descriptor="iOS only asks once, so the switch lives in Settings now. Here's the path — come back when you've flipped it."
            onDismiss={onDismissSheet ? onDismissSheet : () => setRaised(false)}
            dismissLabel="Close"
            middleSection={
              /* The same card the screen behind it draws — `text container` in
                 Figma: background/surface at Radius/400 with 16 padding — so
                 the path reads as the same object raised, not a second design
                 of it. */
              <div className="knw-recall__card knw-recall__card--on-sheet">
                <ol className="knw-recall__path">
                  {SETTINGS_PATH.map((step) => (
                    <li key={step}>
                      <Chips
                        size="XS"
                        color="Primary"
                        active="True"
                        Text={step}
                        showLeftIcon={false}
                        showRightIcon={false}
                      />
                    </li>
                  ))}
                </ol>
              </div>
            }
            bottomSection={
              <ButtonGroup variant="Vertical" size="M">
                <Button
                  variant="Primary"
                  size="M"
                  CTA="I've turned it on"
                  onClick={onMicEnabled}
                />
                <Button variant="Secondary" size="M" CTA="Type instead" onClick={onUseText} />
              </ButtonGroup>
            }
          />
        ) : undefined
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 11 — Very noisy / garbled transcript                          */
/* ------------------------------------------------------------------ */

export interface MisheardScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  transcript?: string;
  /** The student says the transcript is wrong — re-record without penalty. */
  onMisheard?: () => void;
  /** The student confirms the transcript — judge it as-is. */
  onConfirmed?: () => void;
  /** The orb. Live here: the student can just say it again. */
  onRetry?: () => void;
  onExit?: () => void;
}

/**
 * Follows the `misheard` screen, node `15824:3651`.
 *
 * Voice_UX, If time: "Very noisy / garbled transcript — Falls back to generous
 * judge or re-record."
 *
 * Principle 4: showing what was heard makes a misheard answer read as "the app
 * misheard me", not "I failed". `recallResponseCard State=Misheard` is the
 * control that distinction exists for — an amber chip rather than a red one,
 * so the colour separates a transcription failure from a wrong answer before
 * the label does.
 *
 * The card instances `transcriptSection` itself, so the screen does not stack
 * one above it. That was an open question until the set was rebuilt; the card
 * owns the transcript now.
 *
 * THE ORB IS LIVE. It reads `state=Idle` — "Tap to answer" — because the whole
 * point of this screen is that the student can say it again. It was `Disabled`
 * while the screen was being drawn, which would have said "Microphone
 * unavailable" on the one screen that most needs a working mic.
 *
 * Skip is deliberately absent, matching the file: the screen already offers a
 * free re-attempt, so a skip here would trade a retry that costs nothing for a
 * recorded miss.
 */
export function MisheardScreen({
  transcript = '"...context and... being critical of sources. Primary source is available in archives."',
  onMisheard,
  onConfirmed,
  onRetry,
  onExit,
  ...escapes
}: MisheardScreenProps) {
  return (
    <Screen
      topNavigation={<RecallHeader progress={0} progressText="0 of 4" onExit={onExit} />}
      middleContent={
        <div className="knw-recall">
          <div className="knw-recall__mascot">
            <MascotSlot size="2XL" label="Knowie, waiting">
              <Knowie pose="excited" />
            </MascotSlot>
          </div>

          {/* The card spans the full screen width — it carries its own 16
              inline padding, so it has to clear the slot's or the surface
              inside ends up 32 narrower than Figma draws it. */}
          <div className="knw-recall__bleed">
            <RecallResponseCard
              State="Misheard"
              transcriptText={transcript}
              onPrimaryAction={onMisheard}
              onSecondaryAction={onConfirmed}
            />
          </div>

          <div className="knw-recall__fab">
            <VoiceFab state="Idle" onPress={onRetry} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Re-record — the offer after the student contests the transcript     */
/* ------------------------------------------------------------------ */

export interface ReRecordScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  /** What Knowie says. Figma: "Sometimes it can happen. Do you want to try?" */
  prompt?: string;
  /** Take another go at the term. */
  onContinue?: () => void;
  /** Move on without re-answering. */
  onNextQuestion?: () => void;
  onExit?: () => void;
}

/**
 * Follows the `re record` screen, node `15816:23797`.
 *
 * The second beat of the state-11 recovery: the student has said the app
 * misheard them, and this offers the retry. It is deliberately bare — no
 * transcript, no card, no verdict — because the dispute is already settled and
 * the only thing left is the choice.
 *
 * TWO DEPARTURES FROM THE FILE, both spacing:
 *   - The mascot-to-headline gap is 37, which is off the scale (the steps
 *     either side are 32 and 48). `layout/2XL` is used.
 *   - `Frame 2147207702` pads the button block by 16 block, which is what the
 *     actions wrapper here reproduces.
 *
 * One node inside this screen (`I15816:23651;4794:5832;15816:23969`) is a
 * broken instance reference — present in the tree, resolving to nothing, and
 * it crashes any traversal that touches it. The headline's type was measured
 * off the render instead: ink 16px at a 20px line pitch, which is
 * `headline/XS-bold` (18/20 semibold).
 */
export function ReRecordScreen({
  prompt = 'Sometimes it can happen. Do you want to try?',
  onContinue,
  onNextQuestion,
  onExit,
  ...escapes
}: ReRecordScreenProps) {
  return (
    <Screen
      topNavigation={<RecallHeader progress={0} progressText="0 of 4" onExit={onExit} />}
      middleContent={
        <div className="knw-recall knw-recall--rerecord">
          {/* Knowie stands free of any bubble here — the only recall screen
              where that is true — so there is nothing to tuck behind. */}
          <MascotSlot size="2XL" label="Knowie, waiting">
            <Knowie pose="excited" />
          </MascotSlot>
          <h2 className="knw-recall__rerecord-prompt">{prompt}</h2>

          {/* The choice sits directly under the block, not pinned to the
              bottom of the screen. Figma places it at y351 with the space
              below left empty, and that is followed here. */}
          <div className="knw-recall__rerecord-actions">
            {/* Size M — the one button size the build uses, on every screen. */}
            <ButtonGroup variant="Vertical" size="M">
              <Button variant="Primary" size="M" CTA="Continue" onClick={onContinue} />
              <Button variant="Secondary" size="M" CTA="Next question" onClick={onNextQuestion} />
            </ButtonGroup>
          </div>

          {/* The text path. Figma's frame offers only Continue and Next
              question, but CLAUDE.md makes a text fallback non-negotiable on
              every recall screen and this is one — a student contesting a
              transcript may well be contesting it because speaking is not
              working for them right now. */}
          <RecallEscapes {...escapes} />
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 9 — Idle: the resting state of every term                     */
/* ------------------------------------------------------------------ */

export interface IdleScreenProps extends RecallEscapesProps {
  /** Knowie's framing line. Attempt 1 only, where Knowie is asking. */
  intro?: ReactNode;
  /** The question. A node, so the key term is bold where the app bolds it. */
  prompt?: ReactNode;
  progress?: number;
  progressText?: string;
  /** Start recording. */
  onRecord?: () => void;
  onExit?: () => void;
}

/**
 * The loop's spine: mic ready, question shown, nothing happening yet.
 *
 * Structurally this is the take screen with the orb swapped to `Idle` and the
 * transcript replaced by the question — so the 37.5% mascot tuck, the 20
 * gutter and the bubble's radius all come from rules already established
 * rather than being re-decided here.
 *
 * IDLE IS ATTEMPT 1 OF A TERM, NOT EVERY ROUND. Rounds 2 to 4 start from the
 * result screen, which carries its own orb — see `hint ladder`, where all four
 * frames end in a `voicefab` block. A student who has just read a hint does not
 * get bounced back to a blank prompt to use it.
 *
 * `voiceFab state=Idle` puts its caption ABOVE the button where every other
 * state puts it below. design-system.md logs that as an unresolved
 * contradiction between the file's own anatomy and its nodes; the node is what
 * renders, so the node is followed.
 */
export function IdleScreen({
  intro = "Welcome to your study session on world history. Let's start with the foundations of human development.",
  prompt = (
    <>
      Could you explain what the <strong>Neolithic Revolution</strong> was and why it marked such
      a significant turning point for early human societies?
    </>
  ),
  progress = 0,
  progressText = '1 of 4',
  onRecord,
  onExit,
  onSkip,
  skipLabel,
  ...escapes
}: IdleScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall">
          <div className="knw-recall__mascot">
            <MascotSlot size="2XL" label="Knowie, asking">
              <Knowie pose="excited" />
            </MascotSlot>
          </div>
          <div className="knw-recall__prompt">
            <QuestionBubble intro={intro} question={prompt} />
          </div>
          <RecallSkip onSkip={onSkip} skipLabel={skipLabel} />
          <div className="knw-recall__fab">
            <VoiceFab state="Idle" onPress={onRecord} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 10 — Listening: the student is speaking                       */
/* ------------------------------------------------------------------ */

export interface ListeningScreenProps extends RecallEscapesProps {
  /**
   * Whether sound is arriving. Figma draws this as two frames — `student
   * talking` and `student not talking` — that differ ONLY in the waveform.
   */
  talking?: boolean;
  /** Bar heights. Any positive scale; they are normalised to their own peak. */
  amplitudes?: readonly number[];
  progress?: number;
  progressText?: string;
  /** Stop and hand the take over. */
  onSend?: () => void;
  onExit?: () => void;
}

/**
 * Follows `student talking` (15620:9125) and `student not talking`
 * (15707:18513). The two frames are identical but for the waveform's state,
 * which is the whole point: the screen has to show that sound is arriving.
 *
 * NO QUESTION BUBBLE, AND THAT IS DELIBERATE — neither frame has one. The
 * question belongs to idle, the moment before; this screen's job is status,
 * and Voice_UX principle 1 says that job is the most important one in voice
 * UI. The mascot stays, tucked 37.5% behind the waveform exactly as it tucks
 * behind the bubble.
 *
 * NO CANCEL. Nothing is recorded yet to throw away — the discard lives on the
 * take screen, one beat later, where a take exists. `voiceFab` enforces this
 * itself: `showDiscard` renders only on `state=Sent`.
 *
 * TOKEN NOTE: the orb is captioned "Listening", which is what Figma sets on
 * both frames. `voiceFab`'s own default for Recording is "Tap to send" — that
 * belongs to a screen where the tap is the point, and here the caption's job
 * is to say what the app is doing.
 *
 * THE WAVEFORM IS STATIC, and that is a known shortfall rather than a choice.
 * No motion tokens exist, and inventing durations to animate it would be
 * inventing design values. What carries the state instead: the orb's size and
 * colour against Idle, the bar fills switching to `mascot/primary`, and the
 * card's accessible name changing to "Recording your answer".
 */
export function ListeningScreen({
  talking = true,
  amplitudes,
  progress = 0,
  progressText = '1 of 4',
  onSend,
  onExit,
  onSkip,
  skipLabel,
  ...escapes
}: ListeningScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall">
          <div className="knw-recall__mascot">
            <MascotSlot size="2XL" label="Knowie, listening">
              <Knowie pose="excited" />
            </MascotSlot>
          </div>
          {/* Same tuck wrapper the bubble uses — the waveform is the panel
              Knowie leans over here. */}
          <div className="knw-recall__prompt">
            <WaveformCard state={talking ? 'Talking' : 'Idle'} amplitudes={amplitudes} />
          </div>
          <RecallSkip onSkip={onSkip} skipLabel={skipLabel} />
          <div className="knw-recall__fab">
            <VoiceFab state="Recording" label="Listening" onPress={onSend} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 12 — Processing: the judge working                            */
/* ------------------------------------------------------------------ */

export interface ProcessingScreenProps {
  /** What was heard, held on screen while it is judged. */
  transcript?: string;
  progress?: number;
  progressText?: string;
  /** Where the wait ends. Unset and the screen holds — which stories want. */
  onDone?: () => void;
  /** How long the judge takes. Mocked latency, not a design value. */
  holdMs?: number;
  onExit?: () => void;
}

/**
 * Follows `thinking progress`, node `15675:15606`.
 *
 * Voice_UX principle 6: every turn has a round-trip the brief targets at under
 * 4s, and four seconds of blank screen feels broken. This is the screen that
 * covers it — Knowie in the `thinking` pose, the transcript still visible so
 * the student can see their answer landed, a progress bar, and the orb at
 * `state=Thinking`.
 *
 * NOTHING HERE IS INTERACTIVE, which is the point. Voice_UX 1C: "Can do:
 * nothing interactive." `voiceFab state=Thinking` enforces it in the component
 * — it renders a <div role="img">, not a button — so a student cannot double
 * submit by tapping the orb again, which is the failure this state exists to
 * prevent.
 *
 * THE TRANSCRIPT STAYS UP. Figma keeps it, and it is doing real work: it is the
 * evidence that the answer was received. `transcriptSection`'s own DON'T says
 * not to use it "during the processing state — it requires a verdict to have
 * content", but that warns against showing a verdict's transcript before a
 * verdict exists. What is shown here is what the student just said, which
 * exists the moment they stop talking.
 *
 * THE HOLD IS MOCKED LATENCY, not motion. It stands in for an STT and judge
 * round-trip, the same way the 342px keyboard reserve stands in for device
 * chrome — a literal with a reason, not a token. The orb's pulse is the part
 * that needs a motion scale, and it stays static until one exists.
 */
export function ProcessingScreen({
  transcript = '"...context and... being critical of sources. Primary source is available in archives."',
  progress = 0,
  progressText = '1 of 4',
  onDone,
  holdMs = 2600,
  onExit,
}: ProcessingScreenProps) {
  /* Cleared on unmount, so a student who leaves mid-judge is not dragged to a
     verdict by a timer that outlived its screen. */
  useEffect(() => {
    if (!onDone) return;
    const id = window.setTimeout(onDone, holdMs);
    return () => window.clearTimeout(id);
  }, [onDone, holdMs]);

  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall knw-recall--processing">
          {/* Not a mascotSlot. Figma places the `thinking` component directly
              at 122×132, which is off every illustration step. */}
          <div className="knw-recall__thinking" role="img" aria-label="Knowie is thinking">
            <Knowie pose="thinking" />
          </div>

          <div className="knw-recall__judging">
            <TranscriptSection transcript={transcript} />
            {/* The judge working. showText=false matches the instance, and the
                bar is decorative here — the live region below is what actually
                announces the state. */}
            <ProgressIndicator progress={progress} showText={false} label="Checking your answer" />
          </div>

          <div className="knw-recall__fab">
            <VoiceFab state="Thinking" />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 13 — Result: the verdict, and the next rung of the ladder     */
/* ------------------------------------------------------------------ */

export type ResultVerdict = 'Correct' | 'Partial' | 'Wrong';

export interface ResultScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  verdict?: ResultVerdict;
  /** Where the ladder stands. Drives `hintLadder` and where the hint renders. */
  rung?: Rung;
  /** The question, compact — this screen restates it, it does not ask it. */
  question?: ReactNode;
  transcript?: string;
  /** The hint for the NEXT attempt. Absent on a pass. */
  hint?: ReactNode;
  hintLabel?: string;
  score?: string;
  missingItems?: string[];
  /**
   * The Partial breakdown — what landed, and what is still absent. `partial`
   * (15620:9496) draws both under the transcript; the card owns them, so they
   * pass straight through.
   */
  gotItems?: string[];
  stillMissingItems?: string[];
  progress?: number;
  progressText?: string;
  /** Answer again, from this screen. */
  onRecord?: () => void;
  /** The card's next-action. Figma labels it "Skip Question" on the hint rungs. */
  onNextAction?: () => void;
  nextActionLabel?: string;
  onExit?: () => void;
}

/**
 * Follows the `hint ladder` section, node `15833:9103` — four frames, `hint 1`,
 * `hint2`, `hint3` and `reveal`, which share one shape.
 *
 * THE ORB IS ON THIS SCREEN, so the next attempt starts here. Every frame ends
 * in a `voicefab` block. There is no hop back to idle between rounds: a student
 * who has just read a hint uses it where they read it.
 *
 * NO MASCOT, AND THE QUESTION IS COMPACT. Neither is an oversight — no frame in
 * the section has a `mascotSlot`, and the question is a plain 64-high bar
 * rather than the tucked bubble. Idle asks the question; this screen restates
 * it so the student can answer without scrolling back.
 *
 * THE HINT MOVES AT RUNG 3. On rungs 1 and 2 it sits INSIDE the verdict card,
 * as `recallResponseCard`'s `hint` slot. On rung 3 Figma promotes it into its
 * own panel below the card, at a larger step with a warm label — the layer is
 * named "escalating warmth". So the last hint before the answer is
 * unmistakably the last hint.
 *
 * THE CARD DRAWS ITS OWN BADGE, SCORE AND CONTEST BUTTONS. Do not compose
 * `chipFeedback`, `feedbackButton` or `percentage` alongside it — they are
 * already inside, and adding them repeats all three. This is the same mistake
 * that once printed the transcript twice on the misheard screen.
 *
 * TOKEN NOTE: Figma fills the promoted hint's panel with a variable named "Pro
 * Background" (#E88C30 at 12%), which has no counterpart in tokens.json and is
 * the PRO tier's colour doing a hint's job. `feedback/warning/surface/subtle`
 * is the file's own warm wash and belongs to the same family as the gold label
 * Figma already puts on that panel.
 */
export function ResultScreen({
  verdict = 'Wrong',
  rung = 'hint1',
  question = (
    <>
      Explain what <strong>historical thinking</strong> means, in your own words.
    </>
  ),
  transcript = '"It\'s about putting events in the right order and remembering what happened when."',
  hint = (
    <>
      You&rsquo;ve got the sequence idea. But historical thinking goes further than ordering events
      — it&rsquo;s about interrogating why sources exist and what biases they carry.
    </>
  ),
  hintLabel = 'Hint 1',
  score = '65%',
  missingItems,
  gotItems,
  stillMissingItems,
  progress = 0,
  progressText = '1 of 4',
  onRecord,
  onNextAction,
  nextActionLabel = 'Skip question',
  onExit,
  ...escapes
}: ResultScreenProps) {
  /* A PASS HAS NO NEXT RUNG, SO IT CANNOT HAVE A HINT. Enforced here rather
     than left to the caller: `hint` carries a default so a bare render shows
     something, and a default beats an explicit `undefined` — which is exactly
     how a correct answer ended up being handed a hint for an attempt that will
     never happen. The invariant belongs with the rule, not the wiring. */
  const pending = verdict !== 'Correct' ? hint : undefined;

  /* Rung 3 is the last hint before the reveal, and Figma lifts it out of the
     card to say so. Every other rung keeps it inside. */
  const promoted = rung === 'hint3';
  const inCardHint = pending && !promoted ? pending : undefined;

  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall knw-recall--result">
          <HintLadder rung={rung} />

          {/* The question restated, not re-asked: a plain bar, no mascot. */}
          <p className="knw-recall__askbar">{question}</p>

          <div className="knw-recall__bleed">
            <RecallResponseCard
              State={verdict}
              showMissingSection={verdict === 'Wrong'}
              transcriptText={transcript}
              percentageText={score}
              missingItems={missingItems}
              gotItems={gotItems}
              stillMissingItems={stillMissingItems}
              hint={inCardHint}
              hintLabel={hintLabel}
              nextActionLabel={nextActionLabel}
              onNextAction={onNextAction}
            />
          </div>

          {promoted && pending && (
            <div className="knw-recall__hint-panel">
              {/* A LIGHTBULB, NOT THE CARD'S ALERT-CIRCLE — and there was no
                  mark here at all before. Figma escalates the glyph with the
                  rung: "notice this" inside the card on 1 and 2, "here is the
                  idea" once the hint has its own warm panel. Promoting the
                  hint had carried the label across and left the icon behind,
                  so the rung that shouts loudest was the only one silent. */}
              <p className="knw-recall__hint-panel-label">
                <IconSlot size="200">
                  <HintBulbIcon />
                </IconSlot>
                {hintLabel}
              </p>
              <p className="knw-recall__hint-panel-body">{pending}</p>
            </div>
          )}

          <div className="knw-recall__fab">
            <VoiceFab state="Idle" onPress={onRecord} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 11 — Nothing heard                                            */
/* ------------------------------------------------------------------ */

export interface NoAudioScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  progress?: number;
  progressText?: string;
  /** Try the same rung again. Costs nothing. */
  onRetry?: () => void;
  onExit?: () => void;
}

/**
 * Zero confidence is its own state, and it consumes no rung.
 *
 * "Nothing heard" and "heard badly" are different problems with different
 * causes — a muted mic against a noisy room — and sprint-context.md keeps them
 * apart for that reason. An accidental tap must never count as an attempt.
 *
 * THE COPY DOES NOT BLAME THE STUDENT. "We didn't catch anything" says the
 * system failed to hear, not that the student failed to speak, which is the
 * distinction Voice_UX principle 4 turns on.
 *
 * `waveformCard state=Idle` rather than an error icon: the flat bars are
 * literally what happened.
 */
export function NoAudioScreen({
  progress = 0,
  progressText = '1 of 4',
  onRetry,
  onExit,
  ...escapes
}: NoAudioScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall knw-recall--noaudio">
          <div className="knw-recall__mascot">
            <MascotSlot size="2XL" label="Knowie, waiting">
              <Knowie pose="standby" />
            </MascotSlot>
          </div>
          <div className="knw-recall__prompt">
            <WaveformCard state="Idle" />
          </div>
          <TextBlock
            variant="S"
            title="We didn’t catch anything"
            caption="This one doesn’t count — have another go."
            headingLevel={2}
          />
          <div className="knw-recall__fab">
            {/* A group of one, so the CTA fills its column like every other
                primary in the build. A bare Button hugs its label — this came
                out 91 wide beside 358s everywhere else. */}
            {/* Size M — the one button size the build uses, on every screen. */}
            <ButtonGroup variant="Vertical" size="M">
              <Button variant="Primary" size="M" CTA="Try again" onClick={onRetry} />
            </ButtonGroup>
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* The correct loop — a pass, and the answer to read it against        */
/* ------------------------------------------------------------------ */

export interface CorrectScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  transcript?: string;
  /** Figma's `100%`. A pass on a later rung scores lower. */
  score?: string;
  progress?: number;
  progressText?: string;
  /** See what Knowie would have said, and say it back. */
  onCompare?: () => void;
  /** The card's next-action. Figma labels it "Next question". */
  onNextQuestion?: () => void;
  onExit?: () => void;
}

/**
 * Follows `correct-answer`, node `15664:13017` — the pass, in the
 * `Correct Answer` section.
 *
 * ONE OF THREE VERDICT PATHS, AND THE ONLY ONE WITH ITS OWN SCREEN. Partial is
 * the hint ladder, which `ResultScreen` draws; wrong is only ever declared
 * after the ladder runs out, which is `RevealScreen`. So there is no standalone
 * wrong verdict screen, and this is not `ResultScreen` with a green badge.
 *
 * WHY IT IS A SEPARATE SCREEN. The ladder frames draw `hints` and a compact
 * question bar and no mascot; this frame draws a 3XL mascot and neither of the
 * other two. That is not decoration — the ladder is the shape of being partway
 * there, and a pass has stepped off it. Drawing a four-rung ladder above a
 * correct answer would say the student is three steps from something.
 *
 * THE CARD DOES NOT REPEAT THE QUESTION OR OFFER TO CONTEST. `State=Correct`
 * draws the ring, the badge and the transcript, and no contest buttons: there
 * is nothing to appeal about being right.
 *
 * TWO WAYS ON, AND THEY ARE NOT THE SAME. "Next question" settles and moves;
 * the orb opens `correct-feedback`, where Knowie's own answer is waiting to be
 * read against what the student actually said. Figma captions the orb "Tap to
 * answer", which is Idle's default label rather than a decision — the state is
 * `Idle` and the label comes with it. It is captioned for what it does here.
 */
export function CorrectScreen({
  transcript = '"Historical thinking is the process of critically analyzing evidence to understand the past, rather than just memorizing facts or dates."',
  score = '100%',
  progress = 0,
  progressText = '1 of 4',
  onCompare,
  onNextQuestion,
  onExit,
  ...escapes
}: CorrectScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall knw-recall--correct">
          {/* SIZE=2XL, AND TUCKED — the same mascot block every other recall
              turn uses, because the app draws every turn that way.
              `recall-correct.png` and `recall-partial.png` both put Knowie at
              roughly 100 across with the card overlapping his lower third; 2XL
              (120) is the step that lands on, and `.knw-recall__mascot` carries
              the 37.5% tuck measured off those same screenshots.

              Figma sets the variant to 3XL on all three correct-loop frames and
              then resizes the instance to 96, 100 and 120 — the component's 3XL
              is 200, twice what any of them draw. The screenshots and the
              drawn sizes agree with each other and not with the label, so the
              label is what gives. Logged in design-system.md. */}
          <div className="knw-recall__mascot">
            <MascotSlot size="2XL" label="Knowie, pleased">
              <Knowie pose="excited" />
            </MascotSlot>
          </div>

          {/* `__bleed`, like the ladder screens. The card carries its own 16
              inline and 12 block padding, so inside the slot's gutter its
              surface would come out 32 narrow and the tuck would measure to the
              wrapper instead of to what you can see. Both screenshots draw the
              surface at 350 with Knowie over its top third; this is what makes
              that true. */}
          <div className="knw-recall__bleed">
            <RecallResponseCard
              State="Correct"
              transcriptText={transcript}
              percentageText={score}
              nextActionLabel="Next question"
              onNextAction={onNextQuestion}
            />
          </div>

          <div className="knw-recall__fab">
            <VoiceFab state="Idle" label="Compare with Knowie" onPress={onCompare} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

export interface CorrectFeedbackScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  answer?: string;
  progress?: number;
  progressText?: string;
  /** Say the model answer back. Costs no rung — the term is already passed. */
  onSayItBack?: () => void;
  onExit?: () => void;
}

/**
 * Follows `correct-feedback`, node `15664:13061` — the second beat of the
 * correct loop.
 *
 * WHAT IT IS FOR. The student got it right in their own words; this is the
 * words Knowie would have used, so the two can be read against each other.
 * Voice_UX's whole argument for saying things out loud applies hardest here:
 * a right answer said once is not yet a right answer said well.
 *
 * IT IS NOT THE REVEAL, though they carry the same card. `RevealScreen` is
 * where a term is declared wrong, so it keeps the ladder on `reveal` and
 * restates the question the student never managed to answer. This screen has
 * no ladder and no question bar, because the question is behind them — it has
 * the mascot instead, which is what the frame draws.
 *
 * ONE DIFFERENCE FROM THE FRAME, on purpose: Figma draws the model answer in a
 * plain `background/surface` box, where `recallResponseCard State=Reveal` puts
 * an "Answer" badge above the same box. The component is used rather than a
 * second card built beside it — the badge is the only thing added, and having
 * one model-answer card rather than two is worth it.
 */
export function CorrectFeedbackScreen({
  answer = 'Historical thinking is the process of critically analyzing evidence to understand the past, rather than just memorizing facts or dates. It involves placing events within their specific context, identifying potential biases, and evaluating multiple perspectives to build a reasoned interpretation.',
  progress = 0,
  progressText = '1 of 4',
  onSayItBack,
  onExit,
  ...escapes
}: CorrectFeedbackScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall knw-recall--correct">
          {/* The same tucked 2XL block as the pass screen — see the note
              there. Knowie sits at one height across the whole loop. */}
          <div className="knw-recall__mascot">
            <MascotSlot size="2XL" label="Knowie, pleased">
              <Knowie pose="excited" />
            </MascotSlot>
          </div>

          <div className="knw-recall__bleed">
            <RecallResponseCard State="Reveal" answerText={answer} />
          </div>

          <div className="knw-recall__fab">
            <VoiceFab state="Idle" label="Say it back" onPress={onSayItBack} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 14 — Reveal: the answer, after four misses                    */
/* ------------------------------------------------------------------ */

export interface RevealScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  question?: ReactNode;
  /** The model answer. */
  answer?: string;
  progress?: number;
  progressText?: string;
  /** Say it back after reading. The screen's whole purpose. */
  onSayItBack?: () => void;
  onExit?: () => void;
}

/**
 * The fourth frame of the `hint ladder` section, so it shares result's shell:
 * the ladder at `reveal`, the compact question, the card, then the orb.
 *
 * `recallResponseCard State=Reveal` drops the transcript and the contest
 * buttons — there is nothing left to contest — and shows the model answer under
 * an "Answer" badge, with "Try it yourself after reading" beneath.
 *
 * SAYING IT BACK IS REQUIRED, NOT OFFERED. There is no "next question" here:
 * the way on is to answer, by voice or by keyboard. This is the only moment in
 * the loop where the student has a correct answer in front of them to say out
 * loud, and letting them tap past it is the version of this screen that
 * teaches nothing.
 *
 * Neither path is judged and neither costs a rung — the term was settled the
 * moment the ladder ran out. What they buy is the saying.
 */
export function RevealScreen({
  question = (
    <>
      Explain what <strong>historical thinking</strong> means, in your own words.
    </>
  ),
  answer = 'Historical thinking is the process of critically analyzing evidence to understand the past, rather than just memorizing facts or dates. It involves placing events within their specific context, identifying potential biases, and evaluating multiple perspectives to build a reasoned interpretation.',
  progress = 0,
  progressText = '1 of 4',
  onSayItBack,
  onExit,
  ...escapes
}: RevealScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall knw-recall--result">
          <HintLadder rung="reveal" />
          <p className="knw-recall__askbar">{question}</p>

          <div className="knw-recall__bleed">
            <div className="knw-recall__bleed">
            <RecallResponseCard State="Reveal" answerText={answer} />
          </div>
          </div>

          {/* NO "NEXT QUESTION". The student cannot move on without answering
              in one modality or the other — saying it back, or typing it.

              This reverses sprint-context.md's "optional say-it-back". Reading
              an answer and tapping past it is the version of this screen that
              teaches nothing, and the reveal is the one moment in the loop
              where the student has a correct answer in front of them to say
              out loud. Both remaining paths still advance the term, so nobody
              is trapped: there are two ways forward, they just both involve
              doing it. */}
          <div className="knw-recall__fab">
            <VoiceFab state="Idle" label="Say it back" onPress={onSayItBack} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* The wrong ending, and the comparison that follows it                */
/* ------------------------------------------------------------------ */

export interface WrongScreenProps extends Pick<RecallEscapesProps, 'onTypeAnswer'> {
  transcript?: string;
  missingItems?: string[];
  progress?: number;
  progressText?: string;
  /** See the two answers side by side. */
  onCompare?: () => void;
  onNextQuestion?: () => void;
  onExit?: () => void;
}

/**
 * Follows `wrong`, node `15888:15150` on the Prototype page.
 *
 * THIS IS NOT A STANDALONE WRONG VERDICT, and the distinction matters. The
 * prototype reaches it from the take that follows the REVEAL — so the student
 * has already climbed all four rungs, read the model answer, and said it back,
 * and it still did not land. Nothing routes here mid-ladder: a miss on hint 1
 * climbs to hint 2, which is what `settleTake` does.
 *
 * It is the mirror of `CorrectScreen` — same mascot, same shape, the other
 * card. The ladder is not drawn on either, because by this point there is no
 * ladder left.
 */
export function WrongScreen({
  transcript = '"It was a law that, um, stopped people from being treated differently based on their race."',
  missingItems,
  progress = 0,
  progressText = '1 of 4',
  onCompare,
  onNextQuestion,
  onExit,
  ...escapes
}: WrongScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
      middleContent={
        <div className="knw-recall knw-recall--correct">
          <div className="knw-recall__mascot">
            <MascotSlot size="2XL" label="Knowie, waiting">
              <Knowie pose="excited" />
            </MascotSlot>
          </div>

          <div className="knw-recall__bleed">
            <RecallResponseCard
              State="Wrong"
              showMissingSection
              transcriptText={transcript}
              missingItems={missingItems}
              nextActionLabel="Next question"
              onNextAction={onNextQuestion}
            />
          </div>

          <div className="knw-recall__fab">
            <VoiceFab state="Idle" label="See the answer" onPress={onCompare} />
            <RecallEscapes {...escapes} />
          </div>
        </div>
      }
    />
  );
}

export interface ComparisonScreenProps {
  /** The concept that got away. */
  question?: string;
  /** The model answer, as the points it is made of. */
  answerPoints?: string[];
  /** What the student actually said. */
  transcript?: string;
  /** Read the concept again. */
  onRevise?: () => void;
  /** Another go at this term. */
  onTryAgain?: () => void;
  onExit?: () => void;
}

/**
 * Follows `Active Recall Summary Screen`, node `15888:15245`, which the
 * Prototype page wires as `wrong --> here --> summary`.
 *
 * SPEC.md LISTED THIS AS ROW 14 "COMPARISON" AND NOTHING EVER BUILT IT. It was
 * renamed to "Reveal" when the hint-ladder section arrived, and the comparison
 * quietly stopped existing — but the two are different screens doing different
 * jobs. The reveal shows the model answer so the student can SAY it. This shows
 * it beside what they actually said, after the saying went wrong.
 *
 * READING THE TWO TOGETHER IS THE POINT, so neither card collapses and neither
 * scrolls on its own. The model answer is broken into the points it is made of
 * rather than left as a paragraph, because "what did I miss" is answerable
 * against a list and not against prose — which is the same reason
 * `recallResponseCard` breaks Wrong's verdict into WHAT WAS MISSING.
 *
 * NO ORB AND NO PROGRESS. The term is over; the two ways on are to read it
 * again or to try it again.
 */
export function ComparisonScreen({
  question = 'What was the Civil Rights Act of 1964?',
  answerPoints = [
    'The Civil Rights Act of 1964 was a landmark federal law that outlawed discrimination based on race, color, religion, sex, or national origin.',
    'It ended unequal application of voter registration requirements and racial segregation in schools, the workplace, and facilities that served the general public.',
  ],
  transcript = '"It was a law that, um, stopped people from being treated differently based on their race. I think it also had something to do with schools and, like, public places."',
  onRevise,
  onTryAgain,
  onExit,
}: ComparisonScreenProps) {
  return (
    <Screen
      topNavigation={
        <div className="knw-lesson__bar">
          <button
            type="button"
            className="knw-recall__exit"
            aria-label="Leave session"
            onClick={onExit}
          >
            ✕
          </button>
        </div>
      }
      middleContent={
        <div className="knw-compare">
          <div className="knw-compare__head">
            <p className="knw-compare__eyebrow">Concept you missed</p>
            <h1 className="knw-compare__question">{question}</h1>
          </div>

          <section className="knw-compare__card">
            <h2 className="knw-compare__card-head" data-part="correct">
              <span className="knw-compare__card-icon">
                <CheckMarkIcon />
              </span>
              Correct answer
            </h2>
            {/* NOT `listItem`, and that was wrong before. The marker here is
                GREEN and 16px — `border/success` ringing a `feedback/success/
                bold` disc with a `text/primary` tick — where `listItem`'s
                Strong is violet and 24px. They are not the same marker doing
                the same job: the summary's list says "you recalled this", the
                comparison's says "this is the correct answer". Sharing the
                component made the second one wear the first one's colour. */}
            <ul className="knw-compare__points">
              {answerPoints.map((point) => (
                <li key={point} className="knw-compare__point">
                  <span className="knw-compare__tick" aria-hidden="true">
                    <CheckMarkIcon />
                  </span>
                  <span className="knw-compare__point-text">{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* THE SAME CARD, DELIBERATELY. Figma builds these two differently —
              the correct-answer card puts its header inside the surface with a
              stroke around the whole card, the your-answer card puts its header
              outside with the stroke under it and the surface on the body only.
              Reading them as a pair is the entire point of this screen, and two
              constructions make that harder for no gain. Both take the first
              treatment.

              IT IS NOT `transcriptSection` ANY MORE, for the same reason: that
              component draws its own label and its own box, so wrapping it here
              produced a box inside a box and a second, smaller label. What it
              contributes — a labelled container — is what this card already
              is. */}
          <section className="knw-compare__card">
            <h2 className="knw-compare__card-head" data-part="yours">
              {/* The same mic the rest of the build uses. It inherits the card
                  head's colour, so it reads as "what you said" here rather than
                  as the feature — one drawing, the surrounding colour carrying
                  the meaning. */}
              <span className="knw-compare__card-icon">
                <RailMicIcon />
              </span>
              Your answer
            </h2>
            <p className="knw-compare__said">{transcript}</p>
          </section>
        </div>
      }
      bottomContent={
        <ButtonGroup variant="Vertical" size="M">
          <Button variant="Primary" size="M" CTA="Revise now" onClick={onRevise} />
          <Button variant="Secondary" size="M" CTA="Try again" onClick={onTryAgain} />
        </ButtonGroup>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* Session rating — asked before the score, never after                */
/* ------------------------------------------------------------------ */

/** Figma's three rows, in Figma's order: least confident first. */
export const RATING_OPTIONS = [
  'I need to practice',
  'I am pretty confident for most part',
  'Somewhat less confident',
] as const;

export type RatingOption = (typeof RATING_OPTIONS)[number];

export interface SessionRatingScreenProps {
  /** What the session covered. Figma lists three. */
  topics?: string[];
  /** Pin a choice. Leave it unset and the screen owns the selection. */
  value?: RatingOption | null;
  onChange?: (next: RatingOption | null) => void;
  /** On to the summary. */
  onContinue?: () => void;
}

/**
 * Follows `session rating`, node `15675:15580`.
 *
 * IT COMES BEFORE THE SUMMARY, and that ordering is the whole point. Asked
 * after the score, "how confident are you now?" measures the student's reaction
 * to a number rather than what they actually feel about the material. So
 * `advance()` and `skip()` both route the last term here, and Continue is what
 * reaches `/recall/summary`.
 *
 * LEAVING EARLY SKIPS IT. `saveAndLeave()` goes straight to the summary: a
 * student on their way out is not in a position to answer, and asking anyway
 * is the research instrument `sprint-context.md` rejected, moved one screen
 * later.
 *
 * NO TOP NAV. The frame has a status bar and nothing else — no ✕, no progress,
 * no XP. The session is over; there is no turn left to leave.
 *
 * ANSWERING IS OPTIONAL. Continue is always live, and nothing is required —
 * a self-report the student cannot decline is a toll gate, not a question.
 *
 * TWO DEPARTURES FROM THE FRAME, both about the control rather than the layout:
 *
 * 1. **It is single-choice, so choosing one clears the others.** Figma draws
 *    three `Checkbox` instances, which say "pick any" — but the options are
 *    mutually exclusive readings of the same feeling, and the frame shows
 *    exactly one filled. A radio group is the correct semantics and this system
 *    has no radio component, so `Checkbox` is used and the behaviour is made
 *    single-select. Requested in design-system.md.
 * 2. **The chosen row is violet, not green — and that is the design call, not
 *    a limitation.** Figma's selected box is filled
 *    `feedback/success/surface/subtle` and ringed `border/success`, a treatment
 *    hand-detached in the file with no variant behind it. Green means *correct*
 *    everywhere else in this app: the verdict chip on `recall-correct.png`, the
 *    Perfect tile on the summary, the strong-topics list. Nothing here is being
 *    marked. A student choosing "I need to practice" and getting a green tick
 *    for it is being congratulated on an admission, which is the opposite of
 *    what the screen is asking for. Violet is the app's *selection* colour —
 *    the active tab, the chosen chip — and selection is exactly what this is.
 *    So it takes `Selection=Selected, State=Default`, which is also the only
 *    real variant, and the two agree.
 */
export function SessionRatingScreen({
  topics = ['World War II', 'American Colonial History', 'Civil Rights Movement'],
  value: valueProp,
  onChange,
  onContinue,
}: SessionRatingScreenProps) {
  const [picked, setPicked] = useState<RatingOption | null>(null);
  const value = valueProp !== undefined ? valueProp : picked;

  const choose = (option: RatingOption) => {
    /* Tapping the chosen row again clears it — the question is optional, so
       there has to be a way back to having not answered it. */
    const next = value === option ? null : option;
    setPicked(next);
    onChange?.(next);
  };

  return (
    <Screen
      showTopNavSlot={false}
      middleContent={
        <div className="knw-rating">
          <div className="knw-rating__head">
            {/* 2XL, not the 3XL the variant claims — the instance is drawn at
                120×120, which is 2XL exactly, and it is the size Knowie is on
                every other screen in the loop. Not tucked here: there is no
                card under him to tuck behind, and the question below is the
                page's heading rather than a reply. */}
            <MascotSlot size="2XL" label="Knowie, asking">
              <Knowie pose="excited" />
            </MascotSlot>

            <div className="knw-rating__ask">
              <h1 className="knw-rating__title">How confident are you now?</h1>

              <div className="knw-rating__topics">
                <h2 className="knw-rating__topics-label">Topics covered</h2>
                <ul className="knw-rating__topic-list">
                  {topics.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <ul className="knw-rating__options">
            {RATING_OPTIONS.map((option) => (
              /* THE WHOLE ROW IS THE TARGET, not just the 24px disc at the end
                 of it. Every list row in the app — the study plan, the folder
                 list, the summary's own topics — takes a tap anywhere along it,
                 and a row that looks like those and only answers at one end is
                 the kind of thing a student blames themselves for.

                 The click is on the row and the focus stays on the checkbox:
                 the <li> takes no tabindex and no role, so a pointer gets the
                 whole row and a keyboard gets exactly one stop. The label is
                 the checkbox's accessible name, so it is announced once rather
                 than read out and then repeated. */
              <li
                key={option}
                className="knw-rating__option"
                onClick={() => choose(option)}
              >
                <p className="knw-rating__option-label" aria-hidden="true">
                  {option}
                </p>
                <Checkbox
                  label={option}
                  Selection={value === option ? 'Selected' : 'Unselected'}
                  State="Default"
                  /* The row already handles the tap; letting the box handle it
                     too would toggle twice and land back where it started. */
                  onToggle={undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      }
      bottomContent={
        /* A group of one, so Continue fills the 358 Figma draws. A bare Button
           hugs its label, and the scaffold's bottom slot centres it. */
        <ButtonGroup variant="Vertical" size="M">
          <Button variant="Primary" size="M" CTA="Continue" onClick={onContinue} />
        </ButtonGroup>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 16 — Summary: what the session actually showed                */
/* ------------------------------------------------------------------ */

export interface SummaryTerm {
  title: string;
  /** The rung a pass landed on. `null` for a miss or a skip. */
  passedAt: Rung | null;
  skipped: boolean;
}

export interface SummaryScreenProps {
  /** What the session covered. Figma: "Civil Rights Movement · 10 concepts". */
  topic?: string;
  terms?: SummaryTerm[];
  /** Back to the topic breakdown with the weak terms marked. */
  onRevise?: () => void;
  /** Run the weak terms back through the ladder. */
  onTryAgain?: () => void;
}

const SUMMARY_DEMO: SummaryTerm[] = [
  { title: 'Primary sources', passedAt: 'attempt1', skipped: false },
  { title: 'Historical thinking', passedAt: 'hint1', skipped: false },
  { title: 'The Neolithic Revolution', passedAt: 'attempt1', skipped: false },
  { title: 'Historiography', passedAt: null, skipped: false },
];

/**
 * Follows the `summary` section's scaffold, node `15857:10065`.
 *
 * A COUNT, NOT A GRADE. The ring reads "6/10 Recalled" in the file — how many
 * the student explained, not a mark out of a hundred. sprint-context.md is
 * explicit about why: a count states what they did, where a percentage
 * converts it into a verdict on them.
 *
 * WHAT CAME NATURALLY LEADS. Strong first, review second, in that order and
 * never the other way round — the same information reversed meets a struggling
 * student with a deficit before anything has been acknowledged.
 *
 * THE THREE TILES SPLIT THE COUNT RATHER THAN REPEATING IT. Perfect is unaided,
 * Hinted took help, Missed ran the ladder out. They sum to the total, which is
 * what makes the ring's fraction legible rather than decorative.
 *
 * WHERE THIS DEPARTS FROM `reference/recall-summary.png`. The shipped app draws
 * three outcome buckets — good explanations, needs practice, and a SKIPPED
 * bucket Figma has no equivalent for — with no ring and no tiles at all. Figma
 * is the authority on composition, so the ring and the two cards are what gets
 * built; but skipped terms still have to land somewhere, and sprint-context.md
 * already says where: "skip scores as a miss but leads the revise list". So
 * they head the review card rather than being dropped. Logged in
 * design-system.md.
 */
export function SummaryScreen({
  topic = 'World history · 4 concepts',
  terms = SUMMARY_DEMO,
  onRevise,
  onTryAgain,
}: SummaryScreenProps) {
  const passed = terms.filter((t) => t.passedAt !== null);
  const unaided = passed.filter((t) => t.passedAt === 'attempt1');
  const hinted = passed.filter((t) => t.passedAt !== 'attempt1');
  const missed = terms.filter((t) => t.passedAt === null && !t.skipped);
  const skipped = terms.filter((t) => t.skipped);

  /* Skipped first: a term the student could not start is the clearest gap they
     have, which is why sprint-context.md puts it at the head of the list. */
  const review = [...skipped, ...missed];

  return (
    <Screen
      topNavigation={
        <div className="knw-summary__head">
          <h1 className="knw-summary__title">Here&rsquo;s how it went</h1>
          <p className="knw-summary__topic">{topic}</p>
        </div>
      }
      middleContent={
        <div className="knw-recall knw-recall--summary">
          <div className="knw-summary__overview">
            <Percentage value={passed.length} total={terms.length} label="Recalled" />

            {/* `summaryStatTile`, now a real component — it was drawn inline
                here first and logged in component-gaps.md, which is what that
                list is for. Figma's own order: help taken, then unaided, then
                what got away. */}
            <SummaryStatTile
              hinted={hinted.length}
              perfect={`${unaided.length}/${terms.length}`}
              missed={review.length}
            />
          </div>

          {/* Figma nests the review block inside StrongAreas, which is what
              keeps the two lists tighter to each other than to the card above. */}
          <div className="knw-summary__groups">
            {passed.length > 0 && (
              <section className="knw-summary__group">
                <h2 className="knw-summary__group-label">You are strong in</h2>
                {/* ListItemGroup, not a div: `ListItem` renders an <li>, so its
                    parent has to be a real list or the rows are orphaned — axe
                    catches it, and a screen reader loses the count. It is also
                    `strongCard` itself, so the screen adds no styling of its
                    own on top. */}
                <ListItemGroup label="Topics you recalled well">
                  {passed.map((t, i) => (
                    <ListItem key={t.title} variant="Strong" label={t.title} showDivider={i > 0} />
                  ))}
                </ListItemGroup>
              </section>
            )}

            {review.length > 0 && (
              <section className="knw-summary__group">
                <h2 className="knw-summary__group-label">Review these concepts</h2>
                <ListItemGroup label="Topics to review">
                  {review.map((t, i) => (
                    <ListItem key={t.title} variant="Review" label={t.title} showDivider={i > 0} />
                  ))}
                </ListItemGroup>
              </section>
            )}
          </div>
        </div>
      }
      bottomContent={
        /* Figma parks these in `bottomSheetOnly` behind a scrim, which is a
           layout convenience in the file rather than a sheet — there is nothing
           to dismiss. `recall-summary.png` puts them flat at the bottom, and
           that is what the slot is for. */
        <ButtonGroup variant="Vertical" size="M">
          <Button variant="Primary" size="M" CTA="Revise now" onClick={onRevise} />
          <Button variant="Secondary" size="M" CTA="Try again" onClick={onTryAgain} />
        </ButtonGroup>
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 8 — Exit: leaving, and what it costs                          */
/* ------------------------------------------------------------------ */

export interface ExitScreenProps {
  /** Back to the turn they were on. */
  onKeepGoing?: () => void;
  /** Settle the term as skipped and leave. */
  onLeave?: () => void;
}

export interface PleaSheetBodyProps {
  /** Which Knowie. */
  pose?: keyof typeof KNOWIE;
  /** The 44pt line. */
  title?: string;
  /** The 21pt line under it. */
  body?: string;
}

/**
 * The body of `exit screen`'s sheet (`15807:21978`): an illustration, a
 * headline, and one line under it, centred.
 *
 * ONE CALLER TODAY, and it stays a named piece anyway because it is a shape
 * with a job — the app stopping the student and asking for something — rather
 * than an arbitrary slice of one sheet. It was briefly on the mic permission
 * sheet too; that was dropped, and the denied sheet keeps its own layout.
 *
 * NO WRAPPER ELEMENT. `bottomSheet`'s middle slot is already VERTICAL, gap
 * Space/600, padding 24/16/8/16, CENTER — Figma's middleSection to the value,
 * because both come from the same component. A second column here would only
 * re-declare it, so the pieces are returned as siblings.
 */
export function PleaSheetBody({ pose = 'sad', title, body }: PleaSheetBodyProps) {
  return (
    <>
      {/* The intrinsic size of the 2× export, so the aspect ratio is declared
          and the box below sizes the width. `alt=""`: the headline says what
          the drawing says, and announcing it twice helps nobody. */}
      <Image className="knw-plea__art" src={KNOWIE[pose]} alt="" width={384} height={415} unoptimized />
      <div className="knw-plea__text">
        {title ? <h2 className="knw-plea__title">{title}</h2> : null}
        {body ? <p className="knw-plea__body">{body}</p> : null}
      </div>
    </>
  );
}

/**
 * IT HAS A FIGMA FRAME NOW — `exit screen`, node `15807:21978`. An earlier
 * pass built this with no frame to follow, from the research notes and
 * `sprint-context.md`, and landed on a titled sheet with a descriptor naming
 * the cost and "Finish this term" / "Save and leave". The file has since drawn
 * it, and draws something quite different, so the frame is what ships.
 *
 * WHAT THE FRAME CHANGED. The sheet is now a plea, not a summary of
 * consequences: the handle-only app bar, Knowie in tears, **"Please don't
 * leave"** at 44, **"Let me help you prep."** under it, then **Keep learning**
 * and **Leave**. No title, no descriptor, no ✕.
 *
 * WHAT SURVIVES, AND WHY IT MATTERS. `sprint-context.md` rejected the beta's
 * eight-reason *"What made you stop?"* form — *"a student trying to leave
 * should not be handed a form"* — and the frame agrees: no survey, two
 * buttons. It also keeps the order the earlier build reasoned its way to.
 * Staying is the primary and leaving the secondary, because the student
 * already chose to leave by tapping ✕ and the sheet's job is to make the
 * cheaper option visible, not to re-ask the question they just answered. It is
 * not a trap either: leaving is one tap, right there.
 *
 * WHAT WAS LOST, and is worth saying out loud. The old descriptor named
 * plainly that the term in flight would count as skipped. Figma's copy does
 * not, and *"Let me help you prep."* is a warmer line that tells the student
 * less. `sprint-context.md` argued the cost should be named because "progress
 * is saved" otherwise hides it until the summary, "which is where trust in the
 * number gets decided". That argument is unanswered, not withdrawn — the frame
 * simply does not address it. Logged in design-system.md.
 */
/** The sheet itself, so the route and the in-place overlay draw the same thing. */
export function ExitSheet({ onKeepGoing, onLeave }: ExitScreenProps) {
  return (
    <BottomSheet
      /* L, not M. Figma's own frame says 468, but its parts add up to 540 —
         the app bar's 72, middleSection's 320 and bottomSection's 148 — so the
         file overflows its own sheet and there is no height that is both
         faithful and sufficient. M caps at 494 and scrolls the body, which cut
         "Let me help you prep." in half; L hugs the content instead. */
      height="L"
      /* Figma's app bar is `Type=Default`: the handle, and nothing else. No ✕,
         which is why no `onDismiss` — see the note in BottomSheet. The sheet
         still has a way out, and it is labelled "Leave". */
      aria-label="Please don’t leave"
      middleSection={
        <PleaSheetBody
          pose="sad"
          title="Please don’t leave"
          body="Let me help you prep."
        />
      }
      bottomSection={
        <ButtonGroup variant="Vertical" size="M">
          <Button variant="Primary" size="M" CTA="Keep learning" onClick={onKeepGoing} />
          <Button variant="Secondary" size="M" CTA="Leave" onClick={onLeave} />
        </ButtonGroup>
      }
    />
  );
}

/**
 * The sheet raised IN PLACE, over whatever turn the student was on.
 *
 * This is the one that ships. A route swap unmounts the screen behind, so the
 * scrim dims an empty page — and a sheet over nothing is not a sheet, it is a
 * dialog pretending to be one. Rendered from `app/recall/layout.tsx`, which is
 * the only thing every recall route shares, so the turn stays underneath.
 *
 * It reproduces `Screen`'s scrim and sheet slot rather than borrowing them,
 * because those are `position: absolute` inside one screen and this has to sit
 * over all of them. Same tokens, same geometry.
 */
export function ExitOverlay({ open, onKeepGoing, onLeave }: ExitScreenProps & { open?: boolean }) {
  if (!open) return null;
  return (
    <div className="knw-exit">
      <div className="knw-exit__scrim" onClick={onKeepGoing} aria-hidden="true" />
      <div className="knw-exit__sheet">
        <ExitSheet onKeepGoing={onKeepGoing} onLeave={onLeave} />
      </div>
    </div>
  );
}

/** The standalone route, so `/recall/exit` and the a11y harness have a page. */
export function ExitScreen({ onKeepGoing, onLeave }: ExitScreenProps) {
  return (
    <Screen
      showTopNavSlot={false}
      showBottomSheetBackground
      bottomSheetOnly={<ExitSheet onKeepGoing={onKeepGoing} onLeave={onLeave} />}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Lesson — where "Revise now" lands, and the way back into the loop    */
/* ------------------------------------------------------------------ */

export interface LessonScreenProps {
  /** The period or context line above the title. */
  eyebrow?: string;
  title?: string;
  conceptCount?: number | string;
  estimatedTime?: string;
  difficulty?: string;
  body?: string;
  /** What the explain-out-loud card offers to practise. */
  practiceTopic?: string;
  practiceTime?: string;
  /** Straight back into the recall loop. */
  onExplainOutLoud?: () => void;
  onBack?: () => void;
}

/**
 * Follows `lesson`, node `15866:12456`.
 *
 * Where "Revise now" goes from the summary: the concept back in front of the
 * student, to read before they try explaining it again. sprint-context.md is
 * explicit about why this exists — *"the topic breakdown before the loop exists
 * to offer a last look before being tested, because a student sent from a quiz
 * straight into recall may not yet understand the concept well enough to
 * explain it, and that difference is the one between a test and an ambush."*
 *
 * THE EXPLAIN-OUT-LOUD CARD IS THE POINT OF THE SCREEN, not decoration. It is
 * the way back into the loop, and it sits in the bottom slot where the thumb
 * already is.
 *
 * TOKEN NOTE: Figma fills that card with a variable named "EOL Card background"
 * (#0B1E4A) which has no counterpart in tokens.json. `accent/blue/subtle`
 * (#0A1635) is the nearest bound colour and the right role — a subtle surface
 * in the blue family the feature already uses for XP. Logged in
 * design-system.md.
 */
export function LessonScreen({
  eyebrow = 'World history',
  /* The default title and body have to describe the SAME thing. They did not:
     the title fell back to one term and the body to another, so a fresh
     session showed "Primary sources" over a paragraph about the Voting Rights
     Act. Both now come from the term the screen is most likely to be
     revising. */
  title = 'Primary sources',
  conceptCount = 9,
  estimatedTime = '~18 min',
  difficulty = 'Medium',
  body = 'A primary source is evidence created at the time of the event by someone connected to it — a letter, a photograph, a treaty, a diary. It has not been filtered through anyone else’s interpretation.',
  practiceTopic = 'World history foundations',
  practiceTime = '~2-3 min',
  onExplainOutLoud,
  onBack,
}: LessonScreenProps) {
  const stats: Array<[string, string]> = [
    [String(conceptCount), 'Concepts'],
    [estimatedTime, 'Est. time'],
    [difficulty, 'Difficulty'],
  ];

  return (
    <Screen
      topNavigation={
        <div className="knw-lesson__bar">
          <button type="button" className="knw-recall__exit" aria-label="Back" onClick={onBack}>
            ‹
          </button>
        </div>
      }
      middleContent={
        <div className="knw-recall knw-lesson">
          <div className="knw-lesson__folder">
            <p className="knw-lesson__eyebrow">{eyebrow}</p>
            <h1 className="knw-lesson__title">{title}</h1>
          </div>

          <dl className="knw-lesson__stats">
            {stats.map(([value, label]) => (
              <div key={label} className="knw-lesson__stat">
                <dd className="knw-lesson__stat-value">{value}</dd>
                <dt className="knw-lesson__stat-label">{label}</dt>
              </div>
            ))}
          </dl>

          <p className="knw-lesson__body">{body}</p>
        </div>
      }
      bottomContent={
        /* The card is a button, not a card with a button in it — the whole
           block is the target, which is what Figma draws and what a thumb
           expects at that size. */
        <button type="button" className="knw-lesson__eol" onClick={onExplainOutLoud}>
          <span className="knw-lesson__eol-body">
            <span className="knw-lesson__eol-head">
              {/* Same feature, same mic — the fourth surface Explain out loud
                  appears on, and the last one still drawing its own. */}
              <span className="knw-lesson__eol-icon" aria-hidden="true">
                <RailMicIcon />
              </span>
              <span className="knw-lesson__eol-copy">
                <span className="knw-lesson__eol-title">Explain out loud</span>
                <span className="knw-lesson__eol-time">{practiceTime}</span>
              </span>
            </span>
            <span className="knw-lesson__eol-topic">{practiceTopic}</span>
          </span>
          <MascotSlot size="XL">
            <Knowie pose="standby" />
          </MascotSlot>
        </button>
      }
    />
  );
}
