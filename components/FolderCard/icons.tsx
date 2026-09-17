/**
 * The two icons in the Figma component set "folderCard" (node 15700:17819),
 * taken from the file rather than redrawn.
 *
 * Both are stroked paths, not filled, so they use currentColor on the stroke.
 * Figma binds both to color/alpha/light-48, whose semantic role is
 * text/tertiary — the wrapper sets that.
 */

type IconProps = { className?: string };

/** Sits in the 32px circular button on the metadata row. */
export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 7 12"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 1 1 L 6 6 L 1 10.99"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The 2x2 grid on the concept-count badge. */
export function ConceptGridIcon({ className }: IconProps) {
  const square = 'M 0.6 0 L 2.9 0 C 3.23 0 3.5 0.27 3.5 0.6 L 3.5 2.9 C 3.5 3.23 3.23 3.5 2.9 3.5 L 0.6 3.5 C 0.27 3.5 0 3.23 0 2.9 L 0 0.6 C 0 0.27 0.27 0 0.6 0 Z';
  return (
    <svg
      className={className}
      viewBox="0 0 10 10"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {[
        [1, 1],
        [5.5, 1],
        [1, 5.5],
        [5.5, 5.5],
      ].map(([x, y]) => (
        <path key={`${x}-${y}`} transform={`translate(${x} ${y})`} d={square} stroke="currentColor" strokeWidth="1" />
      ))}
    </svg>
  );
}
