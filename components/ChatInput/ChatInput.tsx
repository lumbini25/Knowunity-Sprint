import type { HTMLAttributes } from 'react';
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

      <div className="knw-chat__field">
        <div className="knw-chat__text">
          {/* Typing shows the caret ahead of the placeholder, as Figma does. */}
          {status === 'Typing' ? <span className="knw-chat__caret" aria-hidden="true" /> : null}
          <span className="knw-chat__value">{showsValue ? value : placeholder}</span>
        </div>

        {SENDS.has(status) ? (
          <button
            type="button"
            className="knw-chat__send"
            aria-label="Send"
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
