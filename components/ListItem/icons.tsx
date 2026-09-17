/**
 * The row marker from the Figma components "strongCard" (15676:16060) and
 * "reviewTopicCard" (15676:16081).
 *
 * ONE GLYPH, NOT TWO. Both cards instance the same `Checkbox` with
 * `Selection=Selected`; the `State` axis changes the disc's fill and stroke and
 * recolours this tick, but never swaps it. There is no cross in the file, which
 * is why `CrossMarkIcon` was removed rather than left unused.
 *
 * It is a stroked path, so it uses currentColor and the row sets the colour per
 * variant. design-system.md notes vector paths cannot be variable-bound in
 * Figma, and that the stroke weight is a raw path value.
 */

type IconProps = { className?: string };

/** Checkbox Selection=Selected: the tick inside the disc, drawn in a 16 slot. */
export function CheckMarkIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M 3.5 8.25 L 6.5 11.25 L 12.5 5.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
