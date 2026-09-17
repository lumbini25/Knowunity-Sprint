/* Icons used by voiceFab.

   Paths are copied verbatim from Figma's vector nodes, so the shape is the
   file's, not a redraw. `currentColor` lets the stylesheet set the colour from
   a token rather than baking one into the markup. */

/**
 * The mic illustration used in state=Idle, Recording and Disabled.
 *
 * Figma's description calls this "a fixed mic asset scaled to the button" and
 * says it is not swappable through the `icon` property. It is four vectors in
 * a 55.4 square: the capsule, the cradle arc, the stem and the foot.
 */
export function MicIcon() {
  return (
    <svg
      viewBox="0 0 55.42 55.42"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Capsule */}
      <g transform="translate(18.96 4.38)">
        <path
          fill="currentColor"
          d="M 8.75 0 C 13.582491626342136 0 17.5 3.9175082882629573 17.5 8.749999809265137 L 17.5 20.41666622161865 C 17.5 25.24915774262083 13.582491626342136 29.16666603088379 8.75 29.16666603088379 C 3.9175083736578626 29.16666603088379 0 25.24915774262083 0 20.41666622161865 L 0 8.749999809265137 C 0 3.9175082882629573 3.9175083736578626 0 8.75 0 Z"
        />
      </g>
      {/* Cradle */}
      <g transform="translate(10.21 27.71)">
        <path
          stroke="currentColor"
          strokeWidth="3.6458"
          strokeLinecap="round"
          d="M 0 0 C 0 9.664374788602192 7.835625211397808 17.5 17.5 17.5 C 27.164374788602192 17.5 35 9.664374788602192 35 0"
        />
      </g>
      {/* Stem */}
      <g transform="translate(27.71 45.21)">
        <path stroke="currentColor" strokeWidth="3.6458" strokeLinecap="round" d="M 0 0 L 0 7.291666507720947" />
      </g>
      {/* Foot */}
      <g transform="translate(20.42 52.5)">
        <path stroke="currentColor" strokeWidth="3.6458" strokeLinecap="round" d="M 0 0 L 14.583333015441895 0" />
      </g>
    </svg>
  );
}
