import { useRef, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import './Tabs.css';

/**
 * Tabs
 *
 * Built from the Figma component set "Tabs" (node 4146:17273), whose tabs are
 * instances of the separate set "Tab" (node 3729:12963).
 *
 * From the Tabs Figma description:
 *
 *   A horizontal tab bar for switching between sibling views. 4 variants by
 *   tab count: 2, 3, 4, or 5 tabs. Each tab is a Tab instance with a label
 *   text node. The active state is handled at the tab item level.
 *
 *   USE: Top-level navigation between peer content sections — for example
 *   Sources, Chat, and Tools in a subject folder. Use 2–5 tabs only; the
 *   variants do not support fewer than 2 or more than 5.
 *
 *   DON'T: Use tabs for sequential steps or flows where the user must complete
 *   one before accessing the next — use a progress indicator and separate
 *   screens instead. Do not use more than five tabs; beyond that, navigation
 *   intent becomes unclear on mobile.
 *
 * The Tab set itself carries no description in Figma.
 */

export type TabCount = '2' | '3' | '4' | '5';
export type TabState = 'Active' | 'Inactive';

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Figma variant axis on the Tab set. */
  State?: TabState;
  /** Figma: Label. */
  label?: string;
}

/** One tab. Figma models this as its own component set, so it is exported. */
export function Tab({ State = 'Inactive', label = 'Label', ...rest }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      className={`knw-tab knw-tab--${State}`}
      aria-selected={State === 'Active'}
      tabIndex={State === 'Active' ? 0 : -1}
      {...rest}
    >
      <span className="knw-tab__label">{label}</span>
    </button>
  );
}

const DEFAULT_LABELS = ['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4', 'Tab 5'];

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Figma variant axis, named "Tab count" there. The description limits the
   * bar to 2–5, which is why this is not an open number.
   */
  tabCount?: TabCount;
  /** One label per tab. Short of `tabCount`, the rest fall back to defaults. */
  labels?: string[];
  /** Which tab is Active. Every other tab is Inactive. */
  activeIndex?: number;
  /** Called with the index of the tab the user chose. */
  onChange?: (index: number) => void;
  /** What the bar navigates, so it is not announced as an unnamed tab list. */
  label?: string;
}

export function Tabs({
  tabCount = '2',
  labels = DEFAULT_LABELS,
  activeIndex = 0,
  onChange,
  label = 'Sections',
  ...rest
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const count = Number(tabCount);

  // Figma holds five Tab instances in every variant and hides the ones past
  // the count; the same five labels are sliced here.
  const visible = Array.from({ length: count }, (_, i) => labels[i] ?? DEFAULT_LABELS[i]);

  // role="tab" carries a keyboard contract: arrows move between tabs, and only
  // the active one is in the tab order. Figma has no way to express this.
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();

    const next = (activeIndex + step + count) % count;
    onChange?.(next);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('.knw-tab');
    buttons?.[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      className="knw-tabs"
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {visible.map((text, i) => (
        <Tab
          key={i}
          State={i === activeIndex ? 'Active' : 'Inactive'}
          label={text}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}
