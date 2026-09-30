/**
 * The one real browser API in the prototype: asking for the microphone.
 *
 * WHY IT IS REAL WHEN NOTHING ELSE IS. The primer's whole reason for existing
 * is the dialog it prepares the student for — `sprint-context.md`: "The mic
 * permission primer appears before the OS dialog fires, because a cold OS
 * prompt is denied far more often." With the dialog mocked, the primer led
 * straight into the turn and prepared the student for nothing, and "denied"
 * could not happen at all, so the denied screen existed only by URL.
 *
 * NOTHING IS RECORDED. `getUserMedia` is the only way a page can make the
 * browser ask, and it hands back a live stream — which is stopped the moment it
 * arrives. The recall stays mocked: no audio is kept, sent, transcribed or
 * judged. What this buys is the question and the student's real answer to it.
 *
 * iOS ASKS ONCE, AND SO DOES A BROWSER. Once the student blocks it, asking
 * again returns `denied` without showing anything — which is why the denied
 * screen sends them to Settings rather than offering another prompt.
 */
export type MicAnswer =
  /** The student allowed it. */
  | 'granted'
  /** The student blocked it, now or earlier. */
  | 'denied'
  /**
   * The browser could not ask: no microphone on this machine, or no
   * `mediaDevices` (Storybook, an insecure origin). Not the student's answer,
   * so the caller treats it as allowed and the mocked turn carries on — a
   * reviewer on a desktop with no mic still gets a walkable prototype.
   */
  | 'unavailable';

export async function askForMic(): Promise<MicAnswer> {
  const devices = typeof navigator === 'undefined' ? undefined : navigator.mediaDevices;
  if (!devices?.getUserMedia) return 'unavailable';

  try {
    const stream = await devices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    return 'granted';
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'NotAllowedError' || error.name === 'SecurityError')
    ) {
      return 'denied';
    }
    return 'unavailable';
  }
}
