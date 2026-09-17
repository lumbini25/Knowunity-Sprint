/**
 * The checkmark from the Figma "Checkbox" component set (node 4139:312),
 * taken from the file rather than redrawn.
 *
 * A 12 x 8.67 filled path inside a 16px slot, inset by (2, 3.33), so it is
 * translated to match. Fill is currentColor, set by the box that wraps it --
 * design-system.md notes vector paths cannot be variable-bound in Figma, so the
 * colour has to be inherited.
 */

export function CheckIcon({ className }: { className?: string }) {
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
      <g transform="translate(2 3.33)">
        <path
          fillRule="nonzero"
          fill="currentColor"
          d="M 10.86 0.2 C 11.12 -0.07 11.54 -0.07 11.8 0.2 C 12.06 0.46 12.06 0.88 11.8 1.14 L 4.47 8.47 C 4.21 8.73 3.79 8.73 3.53 8.47 L 0.2 5.14 C -0.07 4.88 -0.07 4.46 0.2 4.2 C 0.46 3.93 0.88 3.93 1.14 4.2 L 4 7.06 L 10.86 0.2 Z"
        />
      </g>
    </svg>
  );
}
