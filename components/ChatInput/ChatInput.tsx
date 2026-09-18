import type { HTMLAttributes, ReactNode } from 'react';
import { XCloseIcon } from '../BottomSheet/icons';
import { LoadingIcon, MicrophoneIcon, PlusIcon, SendIcon } from './icons';
import './ChatInput.css';

/**
 * Chat Input
 *
 * Built from the Figma component set "Chat Input" (node 3249:84007). The Status
 * axis carries the same name and the same options as Figma.
 *
 * From the component's Figma description:
 *
 *   The text input bar for the Knowie chat interface. 6 status variants:
 *   Inactive (empty, placeholder visible), Typing (user is entering text),
 *   Ready to send (text present, send affordance active), Long input (text
 *   exceeds one line), Recording (microphone is capturing voice), Loading
 *   (awaiting a response).
 *
 *   USE: The persistent input bar at the bottom of any Knowie chat or coaching
 *   session. Swap the status variant to reflect the current interaction state —
 *   never manually hide or show internal elements.
 *
 *   DON'T: Use for non-chat text entry. Do not leave the component in Inactive
 *   state while the user is typing.
 */

export type ChatInputStatus =
  | 'Inactive'
  | 'Typing'
  | 'Ready to send'
  | 'Long input'
  | 'Recording'
  | 'Loading';

export interface ChatInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Figma variant axis. Drives every internal element; never set them by hand. */
  status?: ChatInputStatus;
  /** Placeholder shown when there is no value. */
  placeholder?: string;
  /** The text the student has entered. */
  value?: string;
  /** Leading action. Becomes a discard control while Recording. */
  onLeadingPress?: () => void;
  /** Trailing action: microphone, send, or inert while Loading. */
  onTrailingPress?: () => void;
  /**
   * Draw the send affordance even on a status that would otherwise show the
   * microphone.
   *
   * ONE MICROPHONE PER SCREEN. Figma's composer on `selecting explain feature`
   * shows Send with the field still empty, and the reason is legibility rather
   * than state: the Explain out loud chip attached just above it already
   * carries a mic, and a second mic beside it says the same word twice about
   * two different things. The screens that attach a feature pass this; the
   * plain composer does not, and keeps the microphone.
   */
  showSend?: boolean;
  /**
   * Accessible name for the trailing control when it is the send affordance.
   *
   * It exists because `showSend` can draw Send before there is anything to
   * send — on the empty composer the button supplies the topic, and calling
   * that "Send" would be a label that lies about what pressing it does.
   */
  sendLabel?: string;
  /**
   * Makes the text area itself pressable.
   *
   * TYPING IS MOCKED HERE, as the speech is. On a device the field takes focus
   * and the OS raises a keyboard; this prototype has no text entry, so Figma's
   * own prototype models it as a tap — `full container` on `selecting explain
   * feature` navigates to `choosing chip`, the identical screen with the topic
   * already in the field. This is that tap.
   */
  onFieldPress?: () => void;
  /**
   * Content pinned INSIDE the field, on its own line above the text — Figma's
   * `EolChip` sitting inside `chat box` on `choosing chip` (15896:16019).
   *
   * This is what makes an attached feature read as part of the message the
   * student is about to send, rather than as a separate control floating above
   * the composer. The field is a row until something is passed here and a
   * wrapped two-line box after, so every status without an attachment renders
   * exactly as it did.
   */
  attachment?: ReactNode;
}

/** Maps the Figma status onto the class the stylesheet keys off. */
const MODIFIER: Record<ChatInputStatus, string> = {
  Inactive: 'inactive',
  Typing: 'typing',
  'Ready to send': 'ready-to-send',
  'Long input': 'long-input',
  Recording: 'recording',
  Loading: 'loading',
};

/** Statuses whose trailing control is the send button rather than a bare icon. */
const SENDS = new Set<ChatInputStatus>(['Ready to send', 'Long input', 'Recording']);

/** Statuses that show the student's own text rather than the placeholder. */
const SHOWS_VALUE = new Set<ChatInputStatus>(['Ready to send', 'Long input']);

export function ChatInput({
  status = 'Inactive',
  placeholder = 'Ask anything...',
  value = '',
  onLeadingPress,
  onTrailingPress,
  showSend = false,
  sendLabel = 'Send',
  onFieldPress,
  attachment,
  ...rest
}: ChatInputProps) {
  const isRecording = status === 'Recording';
  const isLoading = status === 'Loading';
  const showsValue = SHOWS_VALUE.has(status);

  return (
    <div className={`knw-chat knw-chat--${MODIFIER[status]}`} {...rest}>
      {/* Drawn only when something is wired to it. Figma's composer always
          carries the "+", and in the chat screens it means attach a file — but
          in the recall text turn there is nothing to attach, and a control that
          does nothing when tapped is worse than one that is not there. Same
          rule as bottomSheet's trailing square and voiceFab's orb. */}
      {onLeadingPress ? (
        <button
          type="button"
          className="knw-chat__leading"
          aria-label={isRecording ? 'Discard recording' : 'Add attachment'}
          onClick={onLeadingPress}
        >
          {isRecording ? <XCloseIcon /> : <PlusIcon />}
        </button>
      ) : null}

      <div
        className={`knw-chat__field${attachment ? ' knw-chat__field--with-attachment' : ''}`}
      >
        {/* First child, so it takes the top line of the box and the text and
            send share the one beneath — the order Figma's `chat box` uses. */}
        {attachment ? <div className="knw-chat__attachment">{attachment}</div> : null}

        {/* A button only when something is listening — the rule the leading
            control and voiceFab already follow. Left alone it stays a plain
            div, so the five statuses that do not take a field tap are
            unchanged. */}
        {onFieldPress ? (
          <button type="button" className="knw-chat__text knw-chat__text--pressable" onClick={onFieldPress}>
            {status === 'Typing' ? <span className="knw-chat__caret" aria-hidden="true" /> : null}
            <span className="knw-chat__value">{showsValue ? value : placeholder}</span>
          </button>
        ) : (
          <div className="knw-chat__text">
            {/* Typing shows the caret ahead of the placeholder, as Figma does. */}
            {status === 'Typing' ? <span className="knw-chat__caret" aria-hidden="true" /> : null}
            <span className="knw-chat__value">{showsValue ? value : placeholder}</span>
          </div>
        )}

        {SENDS.has(status) || showSend ? (
          <button
            type="button"
            className="knw-chat__send"
            aria-label={sendLabel}
            onClick={onTrailingPress}
          >
            <span className="knw-chat__send-icon">
              <SendIcon />
            </span>
          </button>
        ) : (
          <button
            type="button"
            className="knw-chat__trailing-icon"
            aria-label={isLoading ? 'Waiting for a reply' : 'Record voice'}
            aria-busy={isLoading || undefined}
            disabled={isLoading}
            onClick={onTrailingPress}
          >
            {isLoading ? <LoadingIcon /> : <MicrophoneIcon />}
          </button>
        )}
      </div>
    </div>
  );
}
