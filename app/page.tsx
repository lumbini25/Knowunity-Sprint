import Link from 'next/link';
import './index.css';

/**
 * The prototype's index.
 *
 * Replaces the create-next-app template, as CLAUDE.md asks. It is scaffolding
 * rather than a designed screen — a way into the recall states while the flow
 * between them is still being built — so it deliberately carries no mascot, no
 * scaffold and no chrome that would imply it is part of the product.
 */

const SCREENS = [
  { href: '/entry', name: 'Home — start here', state: 'Entry 1' },
  { href: '/entry/compose', name: 'Compose a set', state: 'Entry 2' },
  { href: '/entry/ready', name: 'Explain out loud — ready', state: 'Entry 3' },
  { href: '/entry/folders', name: 'Choose a folder', state: 'Entry 4' },
  { href: '/recall/idle', name: 'Idle', state: 'State 9' },
  { href: '/recall/recording', name: 'Listening', state: 'State 10' },
  { href: '/recall/answer-sent', name: 'The take', state: 'State 10b' },
  { href: '/recall/processing', name: 'Knowie thinking', state: 'State 12' },
  { href: '/recall/result', name: 'Partial — the hint ladder', state: 'State 13' },
  { href: '/recall/correct', name: 'Correct — the pass', state: 'State 13a' },
  { href: '/recall/correct-feedback', name: "Correct — Knowie's answer", state: 'State 13b' },
  { href: '/recall/reveal', name: 'Reveal — the ladder runs out', state: 'State 14' },
  { href: '/recall/wrong', name: 'Wrong — after the reveal', state: 'State 14a' },
  { href: '/recall/comparison', name: 'Comparison — both answers', state: 'State 14b' },
  { href: '/recall/rating', name: 'Session rating', state: 'State 15' },
  { href: '/recall/summary', name: 'Summary', state: 'State 16' },
  { href: '/recall/lesson', name: 'Lesson — revise', state: 'After 16' },
  { href: '/recall/exit', name: 'Exit sheet', state: 'State 8' },
  { href: '/recall/no-audio', name: 'Nothing heard', state: 'State 11' },
  { href: '/recall/misheard', name: 'Misheard transcript', state: 'State 11b' },
  { href: '/recall/re-record', name: 'Re-record offer', state: 'State 11c' },
  { href: '/recall/text-fallback', name: 'Text fallback turn', state: 'State 6' },
  { href: '/recall/permission-primer', name: 'Mic permission primer', state: 'State 7' },
  { href: '/recall/permission-sheet', name: 'Mic permission sheet', state: 'State 7b' },
  { href: '/recall/permission-denied', name: 'Permission denied', state: 'State 8' },
] as const;

export default function Home() {
  return (
    <main className="knw-index">
      <h1 className="knw-index__title">Explain Out Loud</h1>
      <p className="knw-index__lede">
        Recall states from <code>reference/Voice_UX.md</code>. Each one is the same component the
        Storybook story renders. Start at <strong>Idle</strong> and click through — the loop runs
        end to end from there.
      </p>
      <ul className="knw-index__list">
        {SCREENS.map((s) => (
          <li key={s.href}>
            <Link className="knw-index__link" href={s.href}>
              <span className="knw-index__state">{s.state}</span>
              <span className="knw-index__name">{s.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
