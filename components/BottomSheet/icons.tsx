/**
 * The two icons the bottomSheet's app bar carries, taken from the Figma
 * component (node 3675:30952) rather than redrawn: x-close on the left,
 * square on the right.
 *
 * Both are filled paths sitting inside a 24px slot — x-close is a 14px glyph
 * inset by 5, square a 20px glyph inset by 2 — so each is translated to match.
 * Fill is currentColor, which the button sets from a token; design-system.md
 * notes that vector paths cannot be variable-bound in Figma, so the colour has
 * to be inherited rather than carried by the path.
 */

type IconProps = { className?: string };

export function XCloseIcon({ className }: IconProps) {
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
      <g transform="translate(5 5)">
        <path
          fillRule="nonzero"
          fill="currentColor"
          d="M 12.293 0.293 C 12.683 -0.098 13.316 -0.098 13.707 0.293 C 14.097 0.683 14.097 1.316 13.707 1.707 L 8.414 7 L 13.707 12.293 C 14.097 12.683 14.097 13.316 13.707 13.707 C 13.316 14.097 12.683 14.097 12.293 13.707 L 7 8.414 L 1.707 13.707 C 1.316 14.097 0.683 14.097 0.293 13.707 C -0.098 13.316 -0.098 12.683 0.293 12.293 L 5.586 7 L 0.293 1.707 C -0.098 1.316 -0.098 0.683 0.293 0.293 C 0.683 -0.098 1.316 -0.098 1.707 0.293 L 7 5.586 L 12.293 0.293 Z"
        />
      </g>
    </svg>
  );
}

export function SquareIcon({ className }: IconProps) {
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
      <g transform="translate(2 2)">
        <path
          fillRule="nonzero"
          fill="currentColor"
          d="M 18 5.8 C 18 4.943 18 4.361 17.963 3.911 C 17.927 3.473 17.862 3.248 17.782 3.092 C 17.59 2.716 17.284 2.41 16.908 2.218 C 16.752 2.138 16.527 2.073 16.089 2.037 C 15.639 2 15.057 2 14.2 2 L 5.8 2 C 4.943 2 4.361 2 3.911 2.037 C 3.473 2.073 3.248 2.138 3.092 2.218 C 2.716 2.41 2.41 2.716 2.218 3.092 C 2.138 3.248 2.073 3.473 2.037 3.911 C 2 4.361 2 4.943 2 5.8 L 2 14.2 C 2 15.057 2 15.639 2.037 16.089 C 2.073 16.527 2.138 16.752 2.218 16.908 C 2.41 17.284 2.716 17.59 3.092 17.782 C 3.248 17.862 3.473 17.927 3.911 17.963 C 4.361 18 4.943 18 5.8 18 L 14.2 18 C 15.057 18 15.639 18 16.089 17.963 C 16.527 17.927 16.752 17.862 16.908 17.782 C 17.284 17.59 17.59 17.284 17.782 16.908 C 17.862 16.752 17.927 16.527 17.963 16.089 C 18 15.639 18 15.057 18 14.2 L 18 5.8 Z M 20 14.2 C 20 15.024 20.001 15.702 19.956 16.252 C 19.91 16.814 19.812 17.331 19.564 17.816 C 19.181 18.569 18.569 19.181 17.816 19.564 C 17.331 19.812 16.814 19.91 16.252 19.956 C 15.702 20.001 15.024 20 14.2 20 L 5.8 20 C 4.976 20 4.298 20.001 3.748 19.956 C 3.186 19.91 2.669 19.812 2.184 19.564 C 1.431 19.181 0.819 18.569 0.436 17.816 C 0.188 17.331 0.09 16.814 0.044 16.252 C -0.001 15.702 0 15.024 0 14.2 L 0 5.8 C 0 4.976 -0.001 4.298 0.044 3.748 C 0.09 3.186 0.188 2.669 0.436 2.184 C 0.819 1.431 1.431 0.819 2.184 0.436 C 2.669 0.188 3.186 0.09 3.748 0.044 C 4.298 -0.001 4.976 0 5.8 0 L 14.2 0 C 15.024 0 15.702 -0.001 16.252 0.044 C 16.814 0.09 17.331 0.188 17.816 0.436 C 18.569 0.819 19.181 1.431 19.564 2.184 C 19.812 2.669 19.91 3.186 19.956 3.748 C 20.001 4.298 20 4.976 20 5.8 L 20 14.2 Z"
        />
      </g>
    </svg>
  );
}
