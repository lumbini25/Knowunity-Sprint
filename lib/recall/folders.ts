import { SESSION } from './script';

/**
 * The shelf.
 *
 * ONE SOURCE, BECAUSE THE LIST AND THE LESSON HAVE TO AGREE. The folder list
 * lived as a constant inside `RecallScreens.tsx` and the lesson screen derived
 * its content from the recall session, so the two never met: tapping "Civil
 * Rights Movement" opened a lesson about primary sources, because the lesson
 * asked the session what the student was struggling with and the session — not
 * yet started — had nothing to say. Both now read this.
 *
 * WHICH FOLDER THE SESSION IS ABOUT. The script used to teach METHOD — primary
 * sources, historiography — while the shelf offered PERIODS, so no folder's
 * contents matched the questions that followed it. The script is now World War
 * II, which is also what Figma's own skip-loop frame asks about, so the folder
 * and the loop are the same subject. Its count is read from the script rather
 * than typed beside it, so the number cannot drift.
 *
 * WHY THE OTHER TWO CARRY NO SESSION. A session is four terms, each with a
 * model answer, three analogical hint rungs and scripted takes. `sprint-
 * context.md` is explicit under Still open: "Hint authoring ... Only the
 * scripted session's four terms are needed for the prototype." So the other
 * folders are real folders with real reading, and they say so by not offering
 * a speaking set rather than by offering one that would run the wrong script.
 */
export interface Folder {
  title: string;
  /** What the folder covers. Shown on the card. */
  description: string;
  /** Sits over the colour band. A period for a period, a role for a method set. */
  dateLabel: string;
  conceptCount: string;
  accent: 'Blue' | 'Magenta' | 'Green';
  /** The reading the lesson screen shows once this folder is opened. */
  reading: string;
  /**
   * Whether a scripted recall session exists for this folder.
   *
   * Only World War II has one. The lesson draws its "Explain out loud"
   * card from this: wired where there is something to practise, absent where
   * there is not — the same rule every other control in this build follows.
   */
  hasSession: boolean;
}

export const FOLDERS: Folder[] = [
  {
    title: 'World War II',
    description: 'Turning points, appeasement, total war, and the order built afterwards.',
    dateLabel: '1939 – 1945',
    conceptCount: `${SESSION.length} concepts`,
    accent: 'Blue',
    reading:
      'Six years that redrew the map and the rules. This set works through the moments the war actually turned on, the policy that failed to prevent it, what it meant to fight a war with a whole society rather than an army, and the institutions the Allies built in 1945 so that the peace would hold better than the last one did.',
    hasSession: true,
  },
  {
    title: 'The Cold War',
    description: 'Containment, the arms race, proxy conflicts, and the thaw.',
    dateLabel: '1947 – 1991',
    conceptCount: '22 concepts',
    accent: 'Magenta',
    reading:
      'Forty years in which the two strongest states on earth never fought each other directly. The Cold War is the case study for deterrence: both sides built weapons they intended never to use, and fought instead through proxies, embargoes, space programmes and sport.',
    hasSession: false,
  },
  {
    title: 'Civil Rights Movement',
    description: 'Key figures, landmark rulings, and the road to the Voting Rights Act.',
    dateLabel: '1954 – 1968',
    conceptCount: '10 concepts',
    accent: 'Green',
    reading:
      'A campaign that won its ground in courtrooms and on streets at the same time. Brown v. Board made segregation illegal in schools; it took another decade of organised, deliberately visible protest before the Civil Rights Act and the Voting Rights Act made the ruling mean something in daily life.',
    hasSession: false,
  },
];

/** The folder a route was opened for, by title. */
export function findFolder(title: string | null | undefined): Folder | undefined {
  if (!title) return undefined;
  return FOLDERS.find((f) => f.title === title);
}

/** The one folder the recall loop can actually run. */
export const SESSION_FOLDER = FOLDERS.find((f) => f.hasSession)!;
