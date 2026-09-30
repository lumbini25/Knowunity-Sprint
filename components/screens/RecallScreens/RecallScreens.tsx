import type { KeyboardEvent, ReactNode } from 'react';
import { useEffect, useId, useState } from 'react';
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
import { ChipFeedback } from '../../ChipFeedback/ChipFeedback';
import { FolderCard } from '../../FolderCard/FolderCard';
import { FOLDERS } from '../../../lib/recall/folders';
import type { Folder } from '../../../lib/recall/folders';
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
  ChevronLeftIcon,
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
  onBack,
  onHistory,
  inChat = false,
}: {
  xp?: number;
  streak?: number;
  /** The real thing: opens the app's menu in place. */
  onMenu?: () => void;
  /**
   * Leaves the screen.
   *
   * SEPARATE FROM `onMenu` BECAUSE IT IS A DIFFERENT CONTROL. Every sub-screen
   * of the entry chat passed its "go back to /entry" handler as `onMenu`, so
   * the bar drew a hamburger, announced itself as "Menu", and then navigated
   * away — three things that do not agree. A student reading the glyph expects
   * a drawer over this screen; a screen reader is told the same; the tap does
   * neither.
   *
   * Wired here instead, the leading control draws the app's existing close
   * glyph and says "Close". No new icon: ✕ is already what this prototype
   * means by "leave this screen", on every recall turn, and the build-screen
   * skill's rule is explicit that a control in the same position on two
   * screens is not automatically the same control.
   *
   * Pass one or the other. `onMenu` wins if both are given, since a screen
   * with a real menu has somewhere better to put its way out.
   */
  onBack?: () => void;
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
      ) : onBack ? (
        /* The glyph follows the action, not the position. */
        <button type="button" className="knw-recall__exit" aria-label="Close" onClick={onBack}>
          <span className="knw-entry__appbar-icon">
            <CloseIcon />
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
  /**
   * A recent folder, straight into its concepts.
   *
   * IT CARRIES WHICH FOLDER. The chip is labelled after the last thing the
   * student worked on, and the handler took no argument — so tapping the one
   * control named "Chemistry prep" led to a screen headed "World History
   * Foundations" over three unrelated folders, with no way back to the thing
   * they tapped for. The label was already a promise; this is the screen
   * keeping it.
   */
  onOpenFolder?: (folder: string) => void;
  /**
   * The rail's other two live features, one screen each.
   *
   * They used to be `undefined` on purpose — "drawn and not pressable" — but
   * an inert `Chips` renders as a `<span>` that looks exactly like the live
   * chip beside it, so the two read as tappable and gave nothing back when
   * tapped. That is `reference/Voice_UX.md` principle 1's failure mode moved
   * from a microphone to a finger. Each now opens the single screen Figma's
   * `Ai Chat/ Quiz` draws for it.
   */
  onQuiz?: () => void;
  onSummarize?: () => void;
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
  onQuiz,
  onSummarize,
  onMenu,
  onHistory,
}: HomeScreenProps) {
  /* Which handler each rail chip gets. Scan is still the one feature with no
     screen behind it, so it stays a label rather than a button — `Chips`
     draws a `<span>` without `onPress`, which is the honest rendering of a
     thing that does not open. */
  const RAIL_ACTIONS: Record<string, (() => void) | undefined> = {
    'Explain out loud': onExplainOutLoud,
    Quiz: onQuiz,
    Summarize: onSummarize,
  };
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
              const open = RAIL_ACTIONS[label];
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
                  onPress={open}
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
              onPress={onOpenFolder ? () => onOpenFolder(HOME_RECENT.label) : undefined}
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
  value = 'World War II',
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
      topNavigation={<ChatHeader onBack={onBack} inChat />}
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

          {/* Drawn here for the same reason as on the text fallback, and on the
              same authority: `choosing chip` (16012:23063) puts a `key board`
              frame in its bottomContent — the chat row, then the `Keyboard`
              instance at x=0, 390x342, visible. Full width, at the component's
              own size. A composer with no keys under it reads as a screenshot
              rather than a screen you can type on. */}
          <Image
            className="knw-recall__keyboard"
            src="/images/ios-keyboard.png"
            alt=""
            aria-hidden="true"
            width={390}
            height={342}
            unoptimized
          />
        </div>
      }
    />
  );
}

export interface FoldersScreenProps {
  title?: string;
  /**
   * The folders to show.
   *
   * A PROP SO THAT NONE IS EXPRESSIBLE. The list was a module constant, which
   * meant the empty state was not something the screen could be asked for —
   * not a state that was cut, a state that could not be reached. A student
   * whose folders have not loaded, or who has never studied anything, is the
   * first thing this screen will meet in a real app.
   */
  folders?: Folder[];
  onOpen?: (folder: string) => void;
  /** Nothing studied yet — the way to make the first set. */
  onCompose?: () => void;
  onBack?: () => void;
}

/**
 * Follows `choose folder screen`, node `15647:11079`.
 *
 * The other way in: rather than describing a topic in the chat, the student
 * picks something they have already studied. Both paths end at the same place —
 * a set of concepts and the orb.
 *
 * THE EMPTY STATE HAS NO FIGMA FRAME. The file draws the list and nothing
 * else, so what an empty shelf says is a decision rather than a reading: it
 * names what is missing, says why the shelf is empty rather than broken, and
 * offers the one thing that fills it. `reference/Voice_UX.md`'s rule that
 * every state keeps a way out applies here as much as to a recall turn — an
 * empty list with no action is a dead end wearing a sentence.
 */
export function FoldersScreen({
  /* THE SHELF'S NAME, NOT A FOLDER'S. Figma titles this screen "World History
     Foundations", which read fine when no folder was called that — and now one
     is, so the heading and the first card said the same words and meant
     different things. It was Title Case too, against CLAUDE.md's sentence-case
     rule, which nothing had caught because it was read as a proper noun.

     Opened with a topic — from the ready card, or Home's recent chip — the
     heading is still what the student asked for. This is only the fallback. */
  title = 'Your folders',
  folders = FOLDERS,
  onOpen,
  onCompose,
  onBack,
}: FoldersScreenProps) {
  const empty = folders.length === 0;
  return (
    <Screen
      topNavigation={<ChatHeader onBack={onBack} />}
      middleContent={
        <div className="knw-folders">
          <div className="knw-folders__head">
            <h1 className="knw-folders__title">{title}</h1>
            {/* An h2, not a paragraph: `folderCard` titles are h3, so a page
                that jumped h1 → h3 left a hole in the outline — caught by axe
                in the story, not by looking at it. It is a section heading over
                the list either way. */}
            <h2 className="knw-folders__ask">
              {empty ? 'Nothing here yet' : 'What have you studied so far?'}
            </h2>
            <p className="knw-folders__hint">
              {empty
                ? 'Folders appear once you have studied something. Make a set and this shelf fills up.'
                : 'Choose one among the list to start revising'}
            </p>
          </div>

          {empty ? (
            /* Knowie, then the way out. The mascot is at screen level and
               alone — never inside a card, which is the rule the explain card
               was breaking. */
            <div className="knw-folders__empty">
              <MascotSlot size="2XL" label="Knowie, waiting">
                <Knowie pose="standby" />
              </MascotSlot>
              {/* A way out, not just a sentence. Drawn only when a caller can
                  actually take the student somewhere — the same rule the app
                  bar's controls follow. */}
              {onCompose ? (
                <Button variant="Primary" size="M" CTA="Make your first set" onClick={onCompose} />
              ) : null}
            </div>
          ) : (
            <div className="knw-folders__list">
              {folders.map((f) => (
                <FolderCard
                  key={f.title}
                  accent={f.accent}
                  title={f.title}
                  description={f.description}
                  dateLabel={f.dateLabel}
                  conceptCount={f.conceptCount}
                  onOpen={() => onOpen?.(f.title)}
                />
              ))}
            </div>
          )}
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
  topic = 'World War II',
  reply = "I'll make a focused speaking-practice set on World War II, covering the turning points, the policy that failed to prevent it, and the order built afterwards.",
  setTitle = 'World War II',
  duration = '~2-3 min',
  generating = false,
  onStart,
  onBack,
  onFeedback,
}: ExplainEntryScreenProps) {
  return (
    <Screen
      topNavigation={<ChatHeader onBack={onBack} />}
      middleContent={
        <div className="knw-entry">
          <div className="knw-entry__student">
            <p className="knw-entry__bubble">{topic}</p>
            {/* Which feature the message was sent with, named under it the way
                the file does — the chip the student attached in the composer. */}
            <p className="knw-entry__picked">✨ Explain out loud</p>
          </div>

          {/* KNOWIE OPENS THE REPLY, AND IS NOT IN THE CARD. This sat inside
              `.knw-entry__start` — a mascot nested in a card, which
              design-system.md's Never list forbids outright, on the one screen
              that starts every session. Out here it is a direct child of the
              chat column exactly as Home, Compose and the take screen already
              place it, so Knowie's turn begins with Knowie and the card below
              is a card.

              2XL, like every other screen-level mascot in this file. The XL it
              used inside the card was sized to fit the card, which is the
              tell: a mascot scaled by its container was a mascot in a
              container. */}
          <MascotSlot size="2XL" label="Knowie, ready">
            <Knowie pose="excited" />
          </MascotSlot>

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
/* The rail's other two features, one screen each                      */
/* ------------------------------------------------------------------ */

export interface SummarizeScreenProps {
  /** What the student asked, in their own words. */
  topic?: string;
  /** Knowie's opening line, above the key term. */
  intro?: string;
  /** The term the summary turns on. */
  term?: string;
  /** What that term means, in one line. */
  definition?: string;
  /** The explanation under the key term. */
  body?: string;
  /** 👍 / 👎 under the answer. Omit it and the row is not drawn. */
  onFeedback?: (helpful: boolean) => void;
  onBack?: () => void;
  onHistory?: () => void;
}

/**
 * Follows the first frame of `Ai Chat/ Quiz` (node `13499:3850`).
 *
 * ONE SCREEN, NOT A FEATURE. Summarize is a rail chip that had no destination,
 * so tapping it did nothing and looked identical to a tap the app missed. This
 * is the pattern the file draws for it — a question answered in Knowie's voice
 * with the key term called out — and it ends where it starts, at the chat.
 *
 * IT IS THE SAME CHAT TURN `ExplainEntryScreen` DRAWS, and deliberately so: the
 * student's question as a pill on the right, Knowie's answer as running text on
 * the left, the feedback row under it, the composer at the foot. Reusing
 * `.knw-entry` rather than inventing a second chat layout is what keeps the two
 * features looking like one app.
 *
 * WHAT IS NEW IS THE KEY TERM CALLOUT, and Storybook had nothing for it —
 * `textBlock` is a title and a caption with no surface and no border. Built
 * inside this screen from tokens and logged in component-gaps.md.
 */
export function SummarizeScreen({
  topic = "What's mitosis?",
  intro = 'Mitosis is how one cell makes an exact copy of itself.',
  term = 'Cell',
  definition = 'the tiny building block of living things',
  body = 'The cell is like a soccer team. Before the big match, it makes a full copy of its playbook so both new teams know exactly what to do. Then the cell carefully splits into two new cells, and each one gets the same instructions.',
  onFeedback,
  onBack,
  onHistory,
}: SummarizeScreenProps) {
  return (
    <Screen
      topNavigation={<ChatHeader onBack={onBack} onHistory={onHistory} />}
      middleContent={
        <div className="knw-entry">
          <div className="knw-entry__student">
            <p className="knw-entry__bubble">{topic}</p>
            <p className="knw-entry__picked">✨ Summarize</p>
          </div>

          {/* Screen level, never inside the callout below — the same Never
              rule the explain-out-loud card was breaking. */}
          <MascotSlot size="2XL" label="Knowie, explaining">
            <Knowie pose="excited" />
          </MascotSlot>

          <p className="knw-entry__reply">{intro}</p>

          {/* The key term, called out. Figma sets it in a green-bordered box
              because it is the one line worth carrying away from the answer. */}
          <div className="knw-keyterm">
            <p className="knw-keyterm__label">Key term</p>
            {/* TWO LINES, WHERE FIGMA HAS "Key Term: Cell" ON ONE. Sentence
                case is a CLAUDE.md rule and proper nouns are the only
                exception, so a colon would have forced either a capital
                mid-sentence or a term that reads as a typo. The label names
                what the box is; the term opens its own line, where a capital
                is simply correct. */}
            <p className="knw-keyterm__body">
              {term} — {definition}
            </p>
          </div>

          <p className="knw-entry__reply">{body}</p>

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
        /* Unwired, so it draws no microphone — the rule `chatInput` now keeps.
           There is nothing here to record, and this prototype captures no
           audio anywhere. */
        <ChatInput status="Inactive" placeholder="And what about…" />
      }
    />
  );
}

export interface QuizOption {
  label: string;
  correct?: boolean;
}

export interface QuizScreenProps {
  question?: string;
  /** Figma draws two. More would wrap rather than break. */
  options?: QuizOption[];
  /**
   * Which option the student picked, or `null` while the question stands.
   *
   * THE WHOLE SCREEN IS THIS ONE VALUE. Unanswered, the options are live and
   * there is no result. Answered, the options lock, the verdict appears, and
   * the way on is the button rather than another tap.
   */
  chosen?: number | null;
  progress?: number;
  progressText?: string;
  xp?: number;
  onAnswer?: (index: number) => void;
  /** Move on. The single screen ends here. */
  onContinue?: () => void;
  /** Knowie explains the answer. */
  onWhy?: () => void;
  onFeedback?: (helpful: boolean) => void;
  onExit?: () => void;
}

/**
 * Follows the second frame of `Ai Chat/ Quiz` (node `13499:3851`).
 *
 * ONE SCREEN, AND IT SAYS SO. The rail's Quiz chip had no destination; this is
 * the single question the file draws, with its answered state, and "Continue"
 * hands the student back rather than into a second question. A whole quiz loop
 * is a different piece of work and `sprint-context.md` has not scoped one.
 *
 * THE HEADER IS THE RECALL HEADER, because the frame draws the recall header:
 * ✕, a progress bar, the XP count. Same control in the same place doing the
 * same job, so it is the same component — the build-screen skill's rule about
 * a control in the same position runs both ways.
 *
 * A WRONG ANSWER STILL REVEALS THE RIGHT ONE. The frame only draws the correct
 * case, so this is a decision rather than a reading: marking the chosen option
 * wrong and leaving the student to guess which was right would make the one
 * screen that teaches teach nothing. Both are marked once the answer is in.
 *
 * THE OPTIONS ARE BUILT HERE, not from `button`. A quiz option is a tall
 * card-shaped control with a correct/wrong state, and `button` is a pill with
 * neither. Logged in component-gaps.md.
 */
export function QuizScreen({
  question = 'A cell copies its whole playbook before it splits. Why?',
  options = [
    { label: 'So both new cells get the same instructions', correct: true },
    { label: 'So the cell can grow bigger first' },
  ],
  chosen = null,
  progress = 20,
  progressText = '1 of 5',
  xp = 2,
  onAnswer,
  onContinue,
  onWhy,
  onFeedback,
  onExit,
}: QuizScreenProps) {
  const answered = chosen !== null && chosen !== undefined;
  const right = answered ? Boolean(options[chosen]?.correct) : false;

  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} xp={xp} onExit={onExit} />
      }
      middleContent={
        <div className="knw-quiz">
          <div className="knw-quiz__ask">
            <MascotSlot size="XL" label="Knowie, asking">
              <Knowie pose="standby" />
            </MascotSlot>
            <p className="knw-quiz__question">{question}</p>
          </div>

          <div className="knw-quiz__options">
            {options.map((o, i) => {
              /* Resting until an answer is in. After that the picked option
                 carries its verdict and the right one is always shown. */
              const state = !answered
                ? 'Resting'
                : o.correct
                  ? 'Correct'
                  : i === chosen
                    ? 'Wrong'
                    : 'Resting';
              return (
                <button
                  key={o.label}
                  type="button"
                  className="knw-quiz__option"
                  data-state={state}
                  /* Locked once answered — a second tap cannot change a
                     verdict the student has already been given. */
                  disabled={answered}
                  onClick={onAnswer ? () => onAnswer(i) : undefined}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      }
      bottomContent={
        answered ? (
          <div className="knw-quiz__result" data-verdict={right ? 'Correct' : 'Wrong'}>
            <div className="knw-quiz__result-head">
              {/* The system's own verdict chip, relabelled — Figma says
                  "Nice!", and `chipFeedback` documents `label` for exactly
                  this. No second drawing of a tick. */}
              <ChipFeedback
                verdict={right ? 'Correct' : 'Wrong'}
                label={right ? 'Nice!' : 'Not quite'}
              />
              {onFeedback ? (
                <div className="knw-entry__feedback-row">
                  <Chips size="S" color="Primary" active="False" Text="👍" showLeftIcon={false} showRightIcon={false} onPress={() => onFeedback(true)} />
                  <Chips size="S" color="Primary" active="False" Text="👎" showLeftIcon={false} showRightIcon={false} onPress={() => onFeedback(false)} />
                </div>
              ) : null}
            </div>

            <ButtonGroup variant="Horizontal" size="M">
              <Button variant="Secondary" size="M" CTA="Why?" onClick={onWhy} />
              <Button variant="Primary" size="M" CTA="Continue" onClick={onContinue} />
            </ButtonGroup>
          </div>
        ) : undefined
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
  /* NO HANDLER, NO CONTROL. Without this the button rendered anyway with
     `onClick={undefined}` — present, focusable, announced to a screen reader as
     a button, and doing nothing when tapped. A control that lies about being a
     control is worse than an absent one, and it made omitting the prop look
     like it omitted the skip when it did not.

     Every screen that means to offer skip passes a handler, so this changes
     nothing that exists; it makes leaving the prop off mean what it reads as.
     The turn reached from the reveal is the first caller to rely on it — see
     `app/recall/recording` and `app/recall/text-fallback`. */
  if (!onSkip) return null;

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
  /**
   * Throw the take away, on Yes from the discard sheet — never straight from
   * the trash, which only raises the sheet.
   *
   * It moves the student ON, which is what `bottom sheet for delete control`
   * (16073:26275) warns about in as many words: "you will be moved forward to
   * the next question". The route reaches that with `skip()`, not `discard()`
   * — deleting the only take and leaving means the term is answered by
   * nobody, and `skip()` is the call that records that outcome as well as
   * advancing. SPEC.md:227 and :636 describe the older behaviour, where the
   * trash returned to the same question with the rung intact.
   */
  onDiscard?: () => void;
  /**
   * Whether the discard sheet is up. Leave it unset and the screen owns it,
   * which is what the route wants; set it and the sheet is pinned, which is
   * what a story wants — the same arrangement `sent` uses above.
   */
  discardSheetOpen?: boolean;
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
  transcript = '"It was when Britain kept a pease? with Hitler to avoid a war, I think."',
  sent: sentProp,
  onSend,
  onRetry,
  onDiscard,
  discardSheetOpen: discardSheetOpenProp,
  onExit,
  onSkip,
  skipLabel,
  onAdvance,
  holdMs = 300,
  ...escapes
}: AnswerSentScreenProps) {
  const [sentState, setSentState] = useState(false);
  const sent = sentProp ?? sentState;

  /* Same arrangement as `sent`: the screen owns the sheet unless a story pins
     it. Not session state — a reload part way through a confirmation should
     open on the take again, not on the question about throwing it away. */
  const [discardRaised, setDiscardRaised] = useState(false);
  const discardSheetOpen = discardSheetOpenProp ?? discardRaised;

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

          <RecallSkip onSkip={onSkip} skipLabel={skipLabel} />
          <div className="knw-recall__fab">
            {/* THE ORB IS STATUS HERE, NOT A CONTROL. Figma captions it
                "Answer sent" on both beats and puts the decisions in the
                buttons — which is what makes the trash, Retry and Continue
                three different things rather than three ways to leave. */}
            {/* THE TRASH ASKS FIRST. `bottom sheet for delete control`
                (16073:26275) puts a confirmation between the pill and the
                discard, which is what a destructive control with no undo
                needs — the take is the only copy of what the student said. */}
            <VoiceFab
              state="Sent"
              onPress={undefined}
              showDiscard={!sent}
              onDiscard={() => setDiscardRaised(true)}
            />
          </div>
        </div>
      }
      bottomContent={
        /* THE DECISIONS MOVED BELOW THE ORB, and that is the one real cost of
           putting CTAs low on this screen. Figma draws Continue and Retry
           directly under the transcript, which reads well — but it also puts
           the primary action at y316 of an 844 viewport, the highest CTA in
           the build, with 110px of dead space under the orb.

           The orb is the thing that can move without losing anything, because
           here it is status and not a control: it says "answer sent" and
           takes no tap. So status keeps the middle of the column and the two
           decisions take the thumb zone, with the text path trailing them as
           it trails every other CTA in the build.

           Beat 2 has no decisions left — the take is gone to the judge — so
           the slot carries the text path alone rather than an empty group. */
        <div className="knw-recall__fab">
          {/* Horizontal, and it clears buttonGroup's own DON'T — the pair is
              not being treated as equals. Continue is Primary and carries the
              rung; Retry is Secondary and costs nothing. */}
          {!sent && (
            <ButtonGroup variant="Horizontal" size="M">
              <Button variant="Primary" size="M" CTA="Continue" onClick={handleSend} />
              <Button variant="Secondary" size="M" CTA="Retry" onClick={onRetry} />
            </ButtonGroup>
          )}
          <RecallEscapes {...escapes} />
        </div>
      }
      showBottomSheetBackground={discardSheetOpen}
      bottomSheetOnly={
        discardSheetOpen ? (
          <BottomSheet
            height="M"
            /* HANDLE ONLY, NO ✕ — the same call the mic sheet makes, and for
               the same reason: both ways out are on the sheet, so a third
               silent one in the corner only muddies which is which. */
            middleSection={
              <div className="knw-recall__sheet-body">
                <MascotSlot size="2XL" label="Knowie, asking">
                  <Knowie pose="standby" />
                </MascotSlot>

                <div className="knw-recall__sheet-copy">
                  <h2 className="knw-recall__sheet-title">
                    Are you sure you want to delete this answer?
                  </h2>
                  {/* THE FRAME'S OWN SENTENCE, and it is now true. The
                      revised node answers what the first draft left open:
                      deleting moves the student on, so this warns them before
                      they do it. SPEC.md:227 and :636 still describe the old
                      behaviour — the trash returning to the same question with
                      the rung intact — and are now stale on this point. */}
                  <p className="knw-recall__sheet-caption">
                    By deleting the answer you will be moved forward to the
                    next question.
                  </p>
                </div>
              </div>
            }
            bottomSection={
              <ButtonGroup variant="Vertical" size="M">
                {/* YES GOES THROUGH WITH IT, NO PUTS THE TAKE BACK.
                    The first draft of this frame offered "Say it again" and
                    "Type instead" — two ways to keep the turn and no way to
                    confirm — so the trash had nowhere to land. The revision
                    makes it an ordinary confirmation, and the take is still
                    there behind the sheet if the answer is No. */}
                <Button variant="Primary" size="M" CTA="Yes" onClick={onDiscard} />
                <Button
                  variant="Secondary"
                  size="M"
                  CTA="No"
                  onClick={() => setDiscardRaised(false)}
                />
              </ButtonGroup>
            }
          />
        ) : undefined
      }
    />
  );
}

/* ------------------------------------------------------------------ */
/* State 6 — Text fallback turn                                        */
/* ------------------------------------------------------------------ */

export interface TextFallbackScreenProps extends Pick<RecallEscapesProps, 'onSkip' | 'skipLabel'> {
  prompt?: ReactNode;
  /** What the student has typed. */
  answer?: string;
  /**
   * Which beat of the typing turn this is.
   *
   * THE SCREEN HAD ONE STATE AND THE TURN HAS THREE. It always drew a finished
   * answer sitting in the composer with Send live — so there was no picture of
   * the answer being written, and none of it having gone. A typed turn is:
   *
   *   Typing  the answer is going in, caret up, nothing sendable yet
   *   Ready   the answer is complete and Send is live
   *   Sent    it has left the composer and become the student's message
   *
   * `Sent` is what Figma's `text fallback` frame actually draws: the answer is
   * a message in the thread and the composer has reset to a placeholder. The
   * build was drawing it in the box instead, which is the Ready beat.
   */
  state?: 'Typing' | 'Ready' | 'Sent';
  /** What the composer offers once the answer has gone. Figma's own line. */
  placeholder?: string;
  /** The student's initial, on the avatar beside their own message. */
  initial?: string;
  onSend?: () => void;
  /** Back to the voice path — the student is never locked into text either. */
  onUseVoice?: () => void;
  /** Where the turn is in the session, for the header's bar. */
  progress?: number;
  progressText?: string;
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
  /* Figma's own strings, and now the folder's subject. The defaults described
     the Neolithic Revolution while the session asked about World War II — and
     the route never passed `answer` at all, so every real student typing an
     answer watched "Neolithic settelment is" appear in the box. A fixture
     standing in for live state, the same shape as the summary's demo data. */
  prompt = 'Could you explain what were the main causes of World War II, and how did the Treaty of Versailles contribute to the situation?',
  answer = 'The main causes of World War II included the harsh terms of the Treaty of Versailles, economic hardship, the rise of Nazi Germany and Adolf Hitler, and aggressive expansion by Germany,',
  state = 'Ready',
  placeholder = 'Tell me about why Germany attacked Poland in 1939?',
  initial = 'L',
  onSend,
  onUseVoice,
  progress = 0,
  progressText = '1 of 4',
  onExit,
  onSkip,
  skipLabel,
}: TextFallbackScreenProps) {
  const sent = state === 'Sent';

  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
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

          {/* The student's turn, mirrored right and given the surface.
              ONLY ONCE IT HAS BEEN SENT. An answer still in the composer is
              not yet a message: drawing it in both places at once said the
              student had said something they had not finished saying. */}
          {sent ? (
            <div className="knw-recall__answer">
              <p className="knw-recall__answer-text">{answer}</p>
              <span className="knw-recall__avatar" aria-hidden="true">
                {initial}
              </span>
            </div>
          ) : null}
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
          {/* THE COMPOSER IS THE STATE. Typing draws the caret against the
              words going in and offers no Send, because there is nothing
              finished to send. Ready holds the whole answer with Send live.
              Sent is empty again — the answer has become the message above —
              and carries Figma's own placeholder, unwired, so it draws no
              trailing control at all. */}
          {state === 'Typing' ? (
            <ChatInput status="Typing" placeholder={answer} />
          ) : sent ? (
            <ChatInput status="Inactive" placeholder={placeholder} />
          ) : (
            <ChatInput status="Ready to send" value={answer} onTrailingPress={onSend} />
          )}
          {/* THE KEYBOARD IS DRAWN, NOT JUST RESERVED.

              This was an empty 342px box on the reasoning that the real
              keyboard belongs to the operating system. That is true of a
              shipped app and false of a prototype: in a browser no keyboard
              ever rises, so the one screen whose whole premise is typing was
              the one screen showing no way to type. The blank read as a bug,
              not as restraint.

              The asset is the `Keyboard` COMPONENT, node 3086:16935 on the
              Knowunity components page — not the resized instance sitting in
              the `text fallback` frame. Same rule as the alert icon: a frame
              shows one instance, the component page shows the thing itself.
              Exported at 3x to public/images/ios-keyboard.png.

              Like the 390px device width, it is device chrome rather than a
              design value, so its dimensions are constants and not tokens —
              the same call .storybook/withKeyboardInset.tsx already makes. */}
          <Image
            className="knw-recall__keyboard"
            src="/images/ios-keyboard.png"
            alt=""
            aria-hidden="true"
            width={390}
            height={342}
            unoptimized
          />
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
   *
   * There is no `onDismissSheet`. Figma's app bar on this sheet is the grabber
   * alone, so there is no ✕ to wire — and the sheet is not a thing to escape
   * from, it is the question itself. Both answers are on it.
   */
  showSheet?: boolean;
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
            /* HANDLE ONLY, NO ✕. Figma's app bar here is the grabber and
               nothing else, and `BottomSheet`'s own Type=Default story already
               says so in as many words — wire neither handler and the bar is
               the handle alone. The ✕ that used to be here made a third way
               out of a two-way decision, and this sheet already has its
               opt-out: "Type instead" sits beside Allow, which is exactly
               where Voice_UX principle 3 wants it rather than hidden in a
               corner as a dismissal. */
            middleSection={
              <div className="knw-recall__sheet-body">
                <MascotSlot size="2XL" label="Knowie, asking">
                  <Knowie pose="standby" />
                </MascotSlot>

                {/* BOTH HALVES OF THE COPY LIVE IN THE BODY.

                    The caption was passed as the sheet's `descriptor`, which
                    renders it in the APP BAR — so the explanation sat above
                    the mascot in caption/M, before the question it explains,
                    and the sheet opened on its own small print. Figma stacks
                    title over caption in one block under the mascot.

                    NOT `TextBlock`, for want of a variant. Figma sets the
                    title at 33/36 — `headline/L` — and no variant maps: L is
                    `headline/XL` (44) and M drops all the way to
                    `body/M-bold` (18). That is the same gap the primer's own
                    headline is bound around three screens up, and it is logged
                    in design-system.md rather than closed by inventing one. */}
                <div className="knw-recall__sheet-copy">
                  <h2 className="knw-recall__sheet-title">
                    Knowie would like to access your mic
                  </h2>
                  <p className="knw-recall__sheet-caption">
                    By giving access to the microphone you can practice answers
                    and strengthen your memory
                  </p>
                </div>
              </div>
            }
            bottomSection={
              /* Figma draws this pair 8 apart, where `buttonGroup`'s own
                 component stacks them flush — and the file agrees with itself,
                 because what it draws here is a FRAME named "buttonGroup", not
                 an instance of the set. The gap is applied on this screen
                 rather than in the component, so the twelve other places the
                 group is used keep the composition the set actually draws. */
              <div className="knw-recall__sheet-actions">
                <ButtonGroup variant="Vertical" size="M">
                  <Button variant="Primary" size="M" CTA="Allow" onClick={onAllow} />
                  <Button variant="Secondary" size="M" CTA="Type instead" onClick={onUseText} />
                </ButtonGroup>
              </div>
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
  /**
   * "I've turned it on" was tapped and the mic is still blocked. The sheet's
   * own caption says so, in place of the instructions — so the tap is answered
   * rather than doing nothing, with no new component to carry the answer.
   */
  stillBlocked?: boolean;
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
 * `active=False` — a path, not four actions, which is why they are not
 * buttons.
 *
 * ACTIVE=FALSE, NOT FIGMA'S ACTIVE=TRUE. The node draws them filled, which is
 * the treatment `Chips` reserves for a pressed toggle or a selected state —
 * exactly the affordance these are not. A filled, on-brand pill with no
 * `onPress` reads as four working buttons that turn out to do nothing, which
 * is the same "looks tappable, isn't" failure the build avoids everywhere
 * else a control has no handler. `active=False` is `Chips`' own resting,
 * label-only fill — the state it already renders for every other non-toggled
 * chip in the library — so the trail reads as a breadcrumb instead.
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
  stillBlocked = false,
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
                    {/* Figma sets both icon slots off — the chip is a label.
                        `active=False`, not Figma's True — see the doc comment
                        above: this is a breadcrumb, not four dead buttons. */}
                    <Chips
                      size="XS"
                      color="Primary"
                      active="False"
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
            descriptor={
              stillBlocked
                ? "The mic is still off. Flip the switch in Settings, then tap I've turned it on again."
                : "iOS only asks once, so the switch lives in Settings now. Here's the path — come back when you've flipped it."
            }
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
                        active="False"
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
  /**
   * Where the student is in the session.
   *
   * THE HEADER WAS HARDCODED. This screen passed nothing, so the bar read
   * "0 of 4" whichever term the student was actually on — misheard on term 3,
   * told they had answered none. Every other turn in the loop computes these
   * from the session; this one now takes them the same way.
   */
  progress?: number;
  progressText?: string;
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
 * THE ORB IS LIVE. It reads `state=Idle` — "Speak to start" — because the whole
 * point of this screen is that the student can say it again. It was `Disabled`
 * while the screen was being drawn, which would have said "Microphone
 * unavailable" on the one screen that most needs a working mic.
 *
 * Skip is deliberately absent, matching the file: the screen already offers a
 * free re-attempt, so a skip here would trade a retry that costs nothing for a
 * recorded miss.
 */
export function MisheardScreen({
  transcript = '"It was when Britain kept a pease? with Hitler to avoid a war, I think."',
  progress = 0,
  progressText = '1 of 4',
  onMisheard,
  onConfirmed,
  onRetry,
  onExit,
  ...escapes
}: MisheardScreenProps) {
  return (
    <Screen
      topNavigation={
        <RecallHeader progress={progress} progressText={progressText} onExit={onExit} />
      }
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
  /**
   * Give the term up. It calls the same `session.skip()` every other skip in
   * the loop calls, so it records a miss and puts the term on the revise
   * list — which is why it is no longer named `onNextQuestion`. See the
   * component's note on the label.
   */
  onSkip?: () => void;
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
 * THE SECOND CHOICE NAMES ITS COST. It read "Next question", which sounds
 * like paging forward and is not: it calls `session.skip()`, the same
 * function the loop's own Skip control calls, so the term is recorded as a
 * miss and lands on the revise list. On the one screen whose whole premise is
 * that a transcription failure was "never the student's fault", a control
 * that quietly charges them for it is the wrong control. It is "Skip
 * question" now — the same words the loop uses for the same action
 * everywhere else, because one action should not have two names.
 *
 * THREE DEPARTURES FROM THE FILE, all spacing or placement:
 *   - The mascot-to-headline gap is 37, which is off the scale (the steps
 *     either side are 32 and 48). `layout/2XL` is used.
 *   - `Frame 2147207702` pads the button block by 16 block, which is what the
 *     actions wrapper here reproduces.
 *   - **The choice is pinned to the bottom slot, where Figma floats it at
 *     y351 over 365px of empty frame.** design-system.md asks for "CTAs low so
 *     thumbs reach them without shifting grip", and an audit of every built
 *     route found this screen among only three whose primary action sat in the
 *     top half of the viewport. The file's own placement reads as an
 *     unfinished frame rather than an intent; the system's rule wins.
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
  onSkip,
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
        </div>
      }
      bottomContent={
        /* The same block every screen whose CTA is pinned low now uses: the
           choice, then the text path under it. `.knw-recall__fab` is the
           wrapper that carries the fab-block-to-link gap, so the distance
           from the buttons to "Type your answer" is the one value it is on
           every other screen rather than the bottom slot's own 4. */
        <div className="knw-recall__fab">
          {/* Size M — the one button size the build uses, on every screen. */}
          <ButtonGroup variant="Vertical" size="M">
            <Button variant="Primary" size="M" CTA="Continue" onClick={onContinue} />
            <Button variant="Secondary" size="M" CTA="Skip question" onClick={onSkip} />
          </ButtonGroup>

          {/* The text path. Figma's frame offers only the two buttons, but
              CLAUDE.md makes a text fallback non-negotiable on every recall
              screen and this is one — a student contesting a transcript may
              well be contesting it because speaking is not working for them
              right now. */}
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
  /* NO DEFAULT, BECAUSE ABSENCE IS THE COMMON CASE. Knowie's welcome belongs
     to the session, not to every turn: only the first term authors an `intro`,
     so the route passes `undefined` for the other three — and a default here
     filled that silence with "Welcome to your study session ... let's start
     with the foundations of human development" on terms 2, 3 and 4. Skipping
     to the last question greeted the student three questions in, under a line
     naming a different term's topic.

     Same shape as the summary screen's demo-data default: a fixture standing
     in for real state on a live route. A story that wants the welcome passes
     it. */
  intro,
  prompt = (
    <>
      What were the major <strong>turning points</strong> of World War II, and why were they
      significant?
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
  /** The question, restated under the waveform. A node, so the key term is
      bold where the app bolds it. */
  prompt?: ReactNode;
  progress?: number;
  progressText?: string;
  /** Stop and hand the take over. */
  onSend?: () => void;
  onExit?: () => void;
}

/**
 * Follows `student talking` (16219:12449) and `student not talking`, its
 * unchanged sibling. The two frames are identical but for the waveform's
 * state, which carries the screen's primary job: showing that sound is
 * arriving.
 *
 * THE QUESTION NOW STAYS ON SCREEN — a reversal of this screen's earlier
 * design, where neither Figma frame drew one and the reasoning was that the
 * question belongs to idle, the moment before. The current frame draws it
 * under the waveform card, in the same surface QuestionBubble already renders
 * for idle and answer-sent, minus the intro line: Voice_UX principle 1 (status
 * is the most important job) still holds, but losing sight of what was asked
 * while giving a long spoken answer is its own way to strand a student, and
 * the updated design answers that by restating rather than re-asking. The
 * mascot stays tucked 37.5% behind the waveform, as it does behind the bubble
 * everywhere else.
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
  prompt = (
    <>
      What were the major <strong>turning points</strong> of World War II, and why were they
      significant?
    </>
  ),
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
          {/* Restated, not re-asked: the same bubble idle draws, without the
              intro line Knowie already delivered a turn ago. */}
          <QuestionBubble question={prompt} />
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
  transcript = '"It was when Britain kept a pease? with Hitler to avoid a war, I think."',
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

          {/* ONE PROGRESS BAR ON THIS SCREEN, NOT TWO.

              Figma's `thinking progress` draws a second `progressIndicator`
              under the transcript at 350x24, and it was built. It is removed:
              both bars were fed the same session percentage, so the screen
              showed the same number twice — and the lower one read as "the
              judge is working" while actually reporting "you are on term 1 of
              4", which is the worse kind of wrong. It sat at 0 for the whole
              wait on the first term. The header keeps the session bar, which is
              the one every other screen in the loop also carries. */}
          <div className="knw-recall__judging">
            <TranscriptSection transcript={transcript} />
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
      What was <strong>appeasement</strong>, and why did it fail?
    </>
  ),
  transcript = '"It was when Britain and France kept giving Hitler what he asked for to avoid another war."',
  hint = (
    <>
      Chamberlain came back from a meeting in 1938 holding a piece of paper and promising
      &ldquo;peace for our time&rdquo;. Which city, and what had just been handed over?
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
        </div>
      }
      bottomContent={
        /* PINNED LOW, where this sat mid-screen at y335. There is no orb on
           this screen to hold the bottom of the column, so "Try again" simply
           stopped wherever the content above it ended — which put the one
           control on a dead-end screen in the top half of the viewport,
           against design-system.md's "CTAs low so thumbs reach them". The
           whole block moves, so the button-to-link gap is unchanged. */
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
  transcript = '"Stalingrad and D-Day, mainly. Stalingrad is where the German advance east finally broke, and D-Day put an army back into western Europe so Germany was fighting both sides at once."',
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
  /** Move on to the next question. The term is already passed; nothing here
      is judged, so this settles nothing and only advances. */
  onNextQuestion?: () => void;
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
  answer = 'Stalingrad, Midway and D-Day are the three usually named. Each one ended an advance and started a retreat: Stalingrad stopped Germany in the east, Midway broke Japan’s naval initiative in the Pacific, and D-Day opened the western front Germany could no longer hold on two sides.',
  progress = 0,
  progressText = '1 of 4',
  onNextQuestion,
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

          {/* THE ORB MOVES ON; IT DOES NOT RECORD.
              Figma's `Next question after correct answer` (16071:25942) is
              what follows this screen, and the term is already passed, so
              there is nothing left here to judge. Saying it back routed
              through the recorder, which re-ran a settled term and landed the
              student back on `correct` — the screen they had just left.

              The caption says what the tap does. `result` reaches the same
              conclusion by the same reasoning: `resolved ? advance() : record`. */}
          <div className="knw-recall__fab">
            <VoiceFab state="Idle" label="Next question" onPress={onNextQuestion} />
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
 * an "Answer" badge, with nothing beneath it. Figma draws a helper line there
 * reading "Try it yourself after reading"; the orb below already carries "Say
 * it back", which is the same instruction at the control the student uses.
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
      What <strong>new order</strong> did the Allies build after 1945, and what was it meant to
      prevent?
    </>
  ),
  answer = 'The United Nations, the Bretton Woods institutions and the division of Germany between the occupying powers. All of it was built against the memory of 1919: a settlement that punished without rebuilding, and left no standing forum to stop the next crisis.',
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

          {/* ONE BLEED, LIKE EVERY SIBLING. `knw-recall__bleed` clears the
              slot's gutter and re-applies the card's own, so it is a transform
              that must be applied exactly once. Nested, it compounded: the card
              measured 430px on a 390px screen, hanging 20px off each edge and
              clipped by an ancestor's overflow rather than scrolling, so
              nothing about it looked broken. The block pull doubled with it. */}
          <div className="knw-recall__bleed">
            <RecallResponseCard State="Reveal" answerText={answer} />
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
  transcript = '"The United Nations. I am not sure about the rest of it."',
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
  question = 'What new order did the Allies build after 1945, and what was it meant to prevent?',
  answerPoints = [
    'The United Nations, the Bretton Woods institutions, and the division of Germany between the occupying powers.',
    'All of it was built against the memory of 1919 — a settlement that punished without rebuilding, and left no standing forum to stop the next crisis.',
  ],
  transcript = '"The UN, and Germany occupied rather than just fined — because 1919 punished and walked away."',
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
        /* Revising always leads here. This screen is reached only after a miss
           that ran the whole ladder out, so there is no reading of it where
           another attempt is the better offer — unlike the summary, which sees
           a whole session and asks the student how it felt. */
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

/**
 * Figma's three rows, ordered as a scale: least confident first.
 *
 * THE COMMENT SAID THIS AND THE ARRAY DID NOT. The order was low, high,
 * medium — "I need to practice", "pretty confident", "somewhat less
 * confident" — so the three rows were three unrelated statements rather than
 * positions on a line. A scale is read by where an option SITS: a student who
 * knows they are somewhere in the middle should be able to reach for the
 * middle row without reading all three. Out of order, every answer costs a
 * full re-read, which is the opposite of what a one-tap self-report is for.
 *
 * Reordered low → medium → high. Figma lists them in its own order; this is a
 * deliberate departure, because the rows are a scale in meaning whatever order
 * they sit in the file.
 *
 * "for most part" also gained its article.
 */
export const RATING_OPTIONS = [
  'I need to practice',
  'Somewhat less confident',
  'I am pretty confident for the most part',
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
  /* The shelf's own folders. "American Colonial History" was never one of
     them, so the one screen that asks what the student wants to revise next
     offered something the app cannot open. */
  topics = ['World War II', 'The Cold War', 'Civil Rights Movement'],
  value: valueProp,
  onChange,
  onContinue,
}: SessionRatingScreenProps) {
  const [picked, setPicked] = useState<RatingOption | null>(null);
  const value = valueProp !== undefined ? valueProp : picked;
  const titleId = useId();

  const choose = (option: RatingOption) => {
    /* Tapping the chosen row again clears it — the question is optional, so
       there has to be a way back to having not answered it. */
    const next = value === option ? null : option;
    setPicked(next);
    onChange?.(next);
  };

  /* ARROWS MOVE, SPACE CHOOSES — a deliberate departure from the APG radio
     pattern, which checks each option as the arrow lands on it.

     That auto-select assumes answering is mandatory, and here it is not: the
     screen's own rule is that Continue is always live and nothing is
     required. With APG's behaviour a keyboard student could not read the
     three options without having answered by the time they reached the third,
     and the only way back to "I would rather not say" would be to find the
     one they accidentally chose and press it again. Focus and selection stay
     separate, so arrowing through the list commits to nothing.

     Everything else the pattern asks for is here: one tab stop for the group,
     wrapping arrows, and both axes accepted because a vertical list read
     horizontally is still the same list. */
  const onOptionKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
    const back = event.key === 'ArrowUp' || event.key === 'ArrowLeft';
    if (!forward && !back) return;

    const radios = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
    );
    const here = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (here === -1) return;

    /* Preventing the default only once the key is known to be one this group
       handles, and only once focus is actually inside it — otherwise this
       swallows the page scroll on a screen that has nothing to do with the
       rating. */
    event.preventDefault();
    radios[(here + (forward ? 1 : -1) + radios.length) % radios.length]?.focus();
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
              <h1 className="knw-rating__title" id={titleId}>
                How confident are you now?
              </h1>

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

          {/* A RADIO GROUP, BECAUSE THAT IS THE QUESTION BEING ASKED. The
              three options are mutually exclusive readings of one feeling and
              `choose()` has always enforced that — but enforcing it only in
              the handler left the accessibility tree describing three
              independent checkboxes, so a student on a screen reader was told
              they could pick all three of "I need to practice", "Somewhat
              less confident" and "I am pretty confident". The behaviour was
              single-select and the announcement was not.

              The group is named by the question itself rather than a second
              label written for screen readers alone — there is already a
              heading on screen saying exactly what this is for. */}
          <ul
            className="knw-rating__options"
            role="radiogroup"
            aria-labelledby={titleId}
            onKeyDown={onOptionKeyDown}
          >
            {RATING_OPTIONS.map((option, index) => (
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
                /* PRESENTATIONAL, because the list stopped being a list the
                   moment the <ul> became the radio group. A radiogroup owns
                   radios, so these rows are layout around them — and left
                   as real listitems they are orphans: axe fails the screen
                   with "<li> elements must be contained in a <ul> or <ol>",
                   since their parent now answers to `radiogroup` instead.
                   The markup stays a list for the CSS and the DOM; only the
                   announcement changes. */
                role="presentation"
                onClick={() => choose(option)}
              >
                <p className="knw-rating__option-label" aria-hidden="true">
                  {option}
                </p>
                <Checkbox
                  label={option}
                  role="radio"
                  Selection={value === option ? 'Selected' : 'Unselected'}
                  State="Default"
                  /* ONE TAB STOP FOR THE GROUP, not three. A radio group is a
                     single control from the keyboard's point of view: Tab
                     reaches it, arrows move inside it, Tab leaves it. With no
                     answer yet the first option holds the stop, which is what
                     the pattern asks for when nothing is selected. */
                  tabIndex={(value === null ? index === 0 : value === option) ? 0 : -1}
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
  /**
   * What the student said about themselves on the rating screen, one screen
   * back. `null` when they declined to answer, which is allowed.
   *
   * THE SECOND OPINION, AND IT IS ALLOWED TO DISAGREE. Everything else on this
   * screen sorts terms by what the SCRIPT saw: passed, hinted, missed. This is
   * what the STUDENT saw. Where the two agree it changes nothing; where they
   * disagree it is the more useful of the two, because a term that only landed
   * with a hint and left the student unsure is precisely the one they will
   * fail on next week.
   *
   * So `low` moves the hinted passes into the review list. Not a nag — the
   * student asked for it, in the only question this loop asks them.
   */
  confidence?: 'low' | 'medium' | 'high' | null;
  /** Back to the topic breakdown with the weak terms marked. */
  onRevise?: () => void;
  /** Run the weak terms back through the ladder. */
  onTryAgain?: () => void;
}

const SUMMARY_DEMO: SummaryTerm[] = [
  { title: 'Turning points', passedAt: 'attempt1', skipped: false },
  { title: 'Appeasement', passedAt: 'hint1', skipped: false },
  { title: 'Total war', passedAt: 'attempt1', skipped: false },
  { title: 'The post-war order', passedAt: null, skipped: false },
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
  topic = 'World War II · 4 concepts',
  terms = SUMMARY_DEMO,
  confidence = null,
  onRevise,
  onTryAgain,
}: SummaryScreenProps) {
  const passed = terms.filter((t) => t.passedAt !== null);
  const unaided = passed.filter((t) => t.passedAt === 'attempt1');
  const hinted = passed.filter((t) => t.passedAt !== 'attempt1');
  const missed = terms.filter((t) => t.passedAt === null && !t.skipped);
  const skipped = terms.filter((t) => t.skipped);

  /* THE STUDENT'S OWN ANSWER DECIDES WHAT COUNTS AS UNFINISHED. Said they need
     practice, and the terms that only landed with a hint join the review list
     — they passed, and the student has just said they do not trust them. The
     strong list keeps the unaided passes, which are the ones nobody is
     arguing about. */
  const wantsMore = confidence === 'low';
  const strong = wantsMore ? unaided : passed;

  /* Skipped first: a term the student could not start is the clearest gap they
     have, which is why sprint-context.md puts it at the head of the list.
     Hinted passes come last — they are the softest kind of gap. */
  const review = wantsMore ? [...skipped, ...missed, ...hinted] : [...skipped, ...missed];

  /* WHICH WAY OUT LEADS. Revising is the primary action for anyone who is not
     sure; someone who says they are confident is offered another go instead.
     The two controls never change, only which one is the filled one — the
     student always has both. */
  const reviseLeads = confidence !== 'high';

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
            {/* `missed` counts the review list, so when a hinted pass moves
                into it the tile moves with it — the number under the ring and
                the list below it are the same claim. */}
            <SummaryStatTile
              hinted={hinted.length}
              perfect={`${unaided.length}/${terms.length}`}
              missed={review.length}
            />
          </div>

          {/* Figma nests the review block inside StrongAreas, which is what
              keeps the two lists tighter to each other than to the card above. */}
          <div className="knw-summary__groups">
            {strong.length > 0 && (
              <section className="knw-summary__group">
                <h2 className="knw-summary__group-label">You are strong in</h2>
                {/* ListItemGroup, not a div: `ListItem` renders an <li>, so its
                    parent has to be a real list or the rows are orphaned — axe
                    catches it, and a screen reader loses the count. It is also
                    `strongCard` itself, so the screen adds no styling of its
                    own on top. */}
                <ListItemGroup label="Topics you recalled well">
                  {strong.map((t, i) => (
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
          <Button
            variant={reviseLeads ? 'Primary' : 'Secondary'}
            size="M"
            CTA="Revise now"
            onClick={onRevise}
          />
          <Button
            variant={reviseLeads ? 'Secondary' : 'Primary'}
            size="M"
            CTA="Try again"
            onClick={onTryAgain}
          />
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
  /**
   * Back to the shelf, for a folder with no speaking set behind it.
   *
   * WITHOUT THIS THE SCREEN ENDED AT ITS OWN LAST PARAGRAPH. A folder that has
   * no scripted session draws no practice card — correctly, since the card
   * would start a different folder's questions — and what was left was reading
   * with nothing under it. The back control in the bar is a way out, but a
   * screen whose only forward motion is the top-left corner is a screen that
   * has stopped. This says plainly why there is no card, and offers the thing
   * that does have one.
   */
  onBrowseFolders?: () => void;
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
  title = 'Turning points',
  conceptCount = 9,
  estimatedTime = '~18 min',
  difficulty = 'Medium',
  body = 'Stalingrad, Midway and D-Day are the three usually named. Each one ended an advance and started a retreat: Stalingrad stopped Germany in the east, Midway broke Japan’s naval initiative in the Pacific, and D-Day opened the western front Germany could no longer hold on two sides.',
  practiceTopic = 'World War II',
  practiceTime = '~2-3 min',
  onExplainOutLoud,
  onBrowseFolders,
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
          {/* A DRAWN CHEVRON, NOT THE CHARACTER `‹`. See `ChevronLeftIcon`:
              this was a text glyph, which is the one defect design-system.md
              had already recorded as closed. Wrapped in the same icon box the
              app bar's controls use, so it sizes off the icon scale rather
              than off the font. */}
          <button type="button" className="knw-recall__exit" aria-label="Back" onClick={onBack}>
            <span className="knw-entry__appbar-icon">
              <ChevronLeftIcon />
            </span>
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

          {/* KNOWIE AT SCREEN LEVEL, NOT IN THE CARD. This sat inside
              `.knw-lesson__eol` — a mascot nested in a card, which
              design-system.md's Never list forbids outright, and the same
              violation the Explain out loud card was carrying. Out here it is
              a child of the screen's own column, exactly as Home, Compose and
              the take screen place it, and the card below is a card.

              Only where there is a set to practise: the mascot is the
              invitation, so on a folder with nothing behind it there is
              nothing for Knowie to be waiting for. */}
          {onExplainOutLoud ? (
            <div className="knw-lesson__mascot">
              <MascotSlot size="2XL" label="Knowie, ready">
                <Knowie pose="standby" />
              </MascotSlot>
            </div>
          ) : null}
        </div>
      }
      bottomContent={
        /* The card is a button, not a card with a button in it — the whole
           block is the target, which is what Figma draws and what a thumb
           expects at that size.

           DRAWN ONLY WHERE THERE IS SOMETHING TO PRACTISE. It rendered
           unconditionally, so a lesson opened for a folder with no scripted
           session offered a full-width "Explain out loud" card that did
           nothing — the largest dead control in the build. Unwired it is not
           there, and `Screen` gives the body the bottom safe-area inset in its
           place. */
        onExplainOutLoud ? (
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
        </button>
        ) : onBrowseFolders ? (
          /* No speaking set behind this folder. Say so, and offer the one that
             has one — a reading screen with nothing under it is not a dead end
             in the strict sense, since the bar still goes back, but it is a
             screen that stops. */
          <div className="knw-lesson__no-set">
            <p className="knw-lesson__no-set-note">
              No speaking set for this folder yet. World War II has one ready.
            </p>
            <Button
              variant="Secondary"
              size="M"
              CTA="Choose another folder"
              onClick={onBrowseFolders}
            />
          </div>
        ) : undefined
      }
    />
  );
}
