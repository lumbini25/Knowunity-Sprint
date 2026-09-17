/* Icons used by the recall screens.

   Paths are copied verbatim from the Figma nodes so the shapes are the file's
   rather than a redraw. `currentColor` lets the stylesheet set the fill from a
   token instead of baking a colour into the markup. */

/**
 * Bolt — the XP glyph in `Top Nav Default`.
 *
 * Taken from the first vector of the XP group inside the rebuilt header: a
 * single closed NONZERO path, 17.93 × 22, which is Phosphor `Lightning` at
 * **Fill** weight. The group layers a second, outlined vector over it bound to
 * `accent/blue/subtle` (#0A1635) — that overlay is what makes the bolt render
 * hollow in Figma, and it is deliberately not reproduced here. The app's bolt
 * is solid.
 */
export function BoltIcon() {
  return (
    <svg
      viewBox="0 0 17.934 22"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="nonzero"
        d="M4.76562 22 C3.82994 22 2.94682 21.4981 2.45269 20.6864 C1.95857 19.8748 1.91651 18.8816 2.34756 18.0165 C3.13606 16.4146 3.75635 15.1757 4.22945 14.2146 C3.77737 14.2146 3.27273 14.2146 2.70501 14.2146 C1.55906 14.2146 0.560296 13.5097 0.171303 12.4204 C-0.228203 11.3311 0.0871968 10.135 0.949289 9.38738 C3.23068 7.41165 8.69761 3.03301 11.757 0.587379 C12.2406 0.202913 12.8188 0 13.4181 0 C14.3958 0 15.3 0.54466 15.7836 1.40971 C16.2567 2.26408 16.2357 3.33204 15.731 4.17573 L13.8702 7.28349 L15.2264 7.28349 C16.3618 7.28349 17.3606 7.98835 17.7601 9.06699 C18.1596 10.1456 17.8547 11.3417 17.0031 12.1 L6.54238 21.3165 C6.04825 21.7544 5.41745 21.9893 4.77614 21.9893 L4.76562 22 Z"
      />
    </svg>
  );
}

/** The mic on the explain-out-loud card. `lesson` draws it at 30, in the
    card's own label colour, so it inherits currentColor like the bolt does. */
export function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" aria-hidden="true" focusable="false">
      <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M5 11a7 7 0 0 0 14 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 21h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
