/**
 * The icons the Chat Input carries, taken from the Figma component set
 * (node 3249:84007) rather than redrawn.
 *
 * Each is a filled path inside its slot, translated to match Figma's inset.
 * plus, microphone-01 and loading-01 sit in a 24px slot; send-03 sits in a
 * 16px one. Fill is currentColor, set by the element that wraps them --
 * design-system.md notes vector paths cannot be variable-bound in Figma, so
 * the colour has to be inherited rather than carried by the path.
 *
 * x-close is not redefined here; the Recording state imports the one the
 * BottomSheet already uses.
 */

type IconProps = { className?: string };

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true" focusable="false">
      <g transform="translate(4 4)">
        <path
          fillRule="nonzero"
          fill="currentColor"
          d="M 7 15 L 7 9 L 1 9 C 0.45 9 0 8.55 0 8 C 0 7.45 0.45 7 1 7 L 7 7 L 7 1 C 7 0.45 7.45 0 8 0 C 8.55 0 9 0.45 9 1 L 9 7 L 15 7 C 15.55 7 16 7.45 16 8 C 16 8.55 15.55 9 15 9 L 9 9 L 9 15 C 9 15.55 8.55 16 8 16 C 7.45 16 7 15.55 7 15 Z"
        />
      </g>
    </svg>
  );
}

export function MicrophoneIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true" focusable="false">
      <g transform="translate(4 1)">
        <path
          fillRule="nonzero"
          fill="currentColor"
          d="M 0 11 L 0 9 C 0 8.45 0.45 8 1 8 C 1.55 8 2 8.45 2 9 L 2 11 C 2 14.31 4.69 17 8 17 C 11.31 17 14 14.31 14 11 L 14 9 C 14 8.45 14.45 8 15 8 C 15.55 8 16 8.45 16 9 L 16 11 C 16 15.08 12.95 18.44 9 18.94 L 9 20 L 12 20 C 12.55 20 13 20.45 13 21 C 13 21.55 12.55 22 12 22 L 4 22 C 3.45 22 3 21.55 3 21 C 3 20.45 3.45 20 4 20 L 7 20 L 7 18.94 C 3.05 18.44 0 15.08 0 11 Z M 10 4 C 10 2.9 9.1 2 8 2 C 6.9 2 6 2.9 6 4 L 6 11 C 6 12.1 6.9 13 8 13 C 9.1 13 10 12.1 10 11 L 10 4 Z M 12 11 C 12 13.21 10.21 15 8 15 C 5.79 15 4 13.21 4 11 L 4 4 C 4 1.79 5.79 0 8 0 C 10.21 0 12 1.79 12 4 L 12 11 Z"
        />
      </g>
    </svg>
  );
}

export function LoadingIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true" focusable="false">
      <g transform="translate(1.25 1.25)">
        <path
          fillRule="nonzero"
          fill="currentColor"
          d="M 9.75 20.75 L 9.75 16.75 C 9.75 16.2 10.2 15.75 10.75 15.75 C 11.3 15.75 11.75 16.2 11.75 16.75 L 11.75 20.75 C 11.75 21.3 11.3 21.75 10.75 21.75 C 10.2 21.75 9.75 21.3 9.75 20.75 Z M 5.79 14.29 C 6.18 13.9 6.82 13.9 7.21 14.29 C 7.6 14.68 7.6 15.32 7.21 15.71 L 4.38 18.54 C 3.99 18.93 3.36 18.93 2.96 18.54 C 2.57 18.14 2.57 17.51 2.96 17.12 L 5.79 14.29 Z M 15.79 15.79 C 16.18 15.4 16.82 15.4 17.21 15.79 L 17.91 16.5 C 18.3 16.89 18.3 17.52 17.91 17.91 C 17.52 18.3 16.89 18.3 16.5 17.91 L 15.79 17.21 C 15.4 16.82 15.4 16.18 15.79 15.79 Z M 4.5 9.75 C 5.05 9.75 5.5 10.2 5.5 10.75 C 5.5 11.3 5.05 11.75 4.5 11.75 L 1 11.75 C 0.45 11.75 0 11.3 0 10.75 C 0 10.2 0.45 9.75 1 9.75 L 4.5 9.75 Z M 20 9.75 C 20.55 9.75 21 10.2 21 10.75 C 21 11.3 20.55 11.75 20 11.75 L 18.5 11.75 C 17.95 11.75 17.5 11.3 17.5 10.75 C 17.5 10.2 17.95 9.75 18.5 9.75 L 20 9.75 Z M 3.17 3.25 C 3.56 2.86 4.2 2.86 4.59 3.25 L 6.71 5.37 C 7.1 5.76 7.1 6.4 6.71 6.79 C 6.32 7.18 5.68 7.18 5.29 6.79 L 3.17 4.67 C 2.78 4.28 2.78 3.64 3.17 3.25 Z M 16.71 3.46 C 17.1 3.07 17.73 3.07 18.12 3.46 C 18.51 3.85 18.51 4.48 18.12 4.87 L 16.71 6.29 C 16.32 6.68 15.68 6.68 15.29 6.29 C 14.9 5.9 14.9 5.26 15.29 4.87 L 16.71 3.46 Z M 9.75 3.5 L 9.75 1 C 9.75 0.45 10.2 0 10.75 0 C 11.3 0 11.75 0.45 11.75 1 L 11.75 3.5 C 11.75 4.05 11.3 4.5 10.75 4.5 C 10.2 4.5 9.75 4.05 9.75 3.5 Z"
        />
      </g>
    </svg>
  );
}

/** Sits in a 16px slot, unlike the others. */
export function SendIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 16 16" width="100%" height="100%" fill="none" aria-hidden="true" focusable="false">
      <g transform="translate(1.56 1.62)">
        <path
          fillRule="nonzero"
          fill="currentColor"
          d="M 0.82 0.01 C 1.05 -0.02 1.25 0.04 1.35 0.07 C 1.49 0.12 1.65 0.2 1.82 0.27 L 12.96 5.28 C 13.12 5.36 13.28 5.43 13.41 5.5 C 13.5 5.55 13.68 5.66 13.8 5.85 L 13.85 5.94 L 13.9 6.04 C 13.99 6.3 13.97 6.58 13.85 6.82 C 13.73 7.07 13.52 7.2 13.41 7.26 C 13.28 7.33 13.12 7.4 12.96 7.47 L 1.82 12.49 C 1.66 12.56 1.49 12.64 1.36 12.68 C 1.24 12.72 0.99 12.8 0.73 12.73 C 0.42 12.64 0.18 12.42 0.06 12.13 C -0.04 11.87 0.01 11.62 0.04 11.49 C 0.08 11.35 0.13 11.18 0.19 11.01 L 1.73 6.4 L 0.19 1.74 C 0.13 1.57 0.07 1.4 0.04 1.26 C 0.01 1.14 -0.04 0.89 0.06 0.63 L 0.11 0.52 C 0.24 0.28 0.46 0.1 0.72 0.03 L 0.82 0.01 Z M 2.91 5.71 L 6.1 5.71 C 6.47 5.71 6.77 6.01 6.77 6.38 C 6.77 6.75 6.47 7.05 6.1 7.05 L 2.92 7.05 L 1.55 11.15 L 12.14 6.38 L 1.55 1.61 L 2.91 5.71 Z"
        />
      </g>
    </svg>
  );
}
