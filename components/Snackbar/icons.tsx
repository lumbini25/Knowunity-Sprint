/**
 * The three status icons from the Figma component set "snackbar"
 * (node 9003:8995), taken from the file rather than redrawn.
 *
 * Each is a 22px filled path inset by 1 inside a 24px slot. Fill is
 * currentColor, set by the snackbar per variant -- design-system.md notes
 * vector paths cannot be variable-bound in Figma, so the colour is inherited.
 */

type IconProps = { className?: string };

function Circle({ d, className }: IconProps & { d: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="translate(1 1)">
        <path fillRule="nonzero" fill="currentColor" d={d} />
      </g>
    </svg>
  );
}

/** variant=Default */
export function InfoCircleIcon(props: IconProps) {
  return (
    <Circle
      {...props}
      d="M 20 11 C 20 6.03 15.97 2 11 2 C 6.03 2 2 6.03 2 11 C 2 15.97 6.03 20 11 20 C 15.97 20 20 15.97 20 11 Z M 10 15 L 10 11 C 10 10.45 10.45 10 11 10 C 11.55 10 12 10.45 12 11 L 12 15 C 12 15.55 11.55 16 11 16 C 10.45 16 10 15.55 10 15 Z M 11.01 6 C 11.56 6 12.01 6.45 12.01 7 C 12.01 7.55 11.56 8 11.01 8 L 11 8 C 10.45 8 10 7.55 10 7 C 10 6.45 10.45 6 11 6 L 11.01 6 Z M 22 11 C 22 17.08 17.08 22 11 22 C 4.92 22 0 17.08 0 11 C 0 4.92 4.92 0 11 0 C 17.08 0 22 4.92 22 11 Z"
    />
  );
}

/** variant=Success */
export function CheckCircleIcon(props: IconProps) {
  return (
    <Circle
      {...props}
      d="M 20 11 C 20 6.03 15.97 2 11 2 C 6.03 2 2 6.03 2 11 C 2 15.97 6.03 20 11 20 C 15.97 20 20 15.97 20 11 Z M 14.79 7.29 C 15.18 6.9 15.82 6.9 16.21 7.29 C 16.6 7.68 16.6 8.32 16.21 8.71 L 10.21 14.71 C 9.82 15.1 9.18 15.1 8.79 14.71 L 5.79 11.71 C 5.4 11.32 5.4 10.68 5.79 10.29 C 6.18 9.9 6.82 9.9 7.21 10.29 L 9.5 12.59 L 14.79 7.29 Z M 22 11 C 22 17.08 17.08 22 11 22 C 4.92 22 0 17.08 0 11 C 0 4.92 4.92 0 11 0 C 17.08 0 22 4.92 22 11 Z"
    />
  );
}

/** variant=Error */
export function AlertCircleIcon(props: IconProps) {
  return (
    <Circle
      {...props}
      d="M 20 11 C 20 6.03 15.97 2 11 2 C 6.03 2 2 6.03 2 11 C 2 15.97 6.03 20 11 20 C 15.97 20 20 15.97 20 11 Z M 11.01 14 C 11.56 14 12.01 14.45 12.01 15 C 12.01 15.55 11.56 16 11.01 16 L 11 16 C 10.45 16 10 15.55 10 15 C 10 14.45 10.45 14 11 14 L 11.01 14 Z M 10 11 L 10 7 C 10 6.45 10.45 6 11 6 C 11.55 6 12 6.45 12 7 L 12 11 C 12 11.55 11.55 12 11 12 C 10.45 12 10 11.55 10 11 Z M 22 11 C 22 17.08 17.08 22 11 22 C 4.92 22 0 17.08 0 11 C 0 4.92 4.92 0 11 0 C 17.08 0 22 4.92 22 11 Z"
    />
  );
}
