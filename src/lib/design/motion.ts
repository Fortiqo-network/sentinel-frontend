/**
 * Canonical motion language for the cinematic frontend.
 *
 * Every animation — GSAP timelines, Framer Motion variants, Lenis easing —
 * pulls its durations and easing curves from here so the whole experience
 * shares one rhythm. Treat these as design tokens, not magic numbers.
 */

/**
 * Easing curves as cubic-bezier control-point tuples.
 *
 * `expo` is the signature Sentinel curve: a fast, confident departure that
 * settles softly — used for hero reveals and section entrances. `power` is a
 * gentler variant for smaller UI moves. `linear` is reserved for continuous,
 * scroll-bound motion where any easing would feel laggy.
 */
export const EASING = {
  expo: [0.16, 1, 0.3, 1],
  power: [0.22, 1, 0.36, 1],
  smooth: [0.4, 0, 0.2, 1],
  linear: [0, 0, 1, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/** GSAP-flavoured easing strings mirroring {@link EASING}. */
export const GSAP_EASE = {
  expo: "expo.out",
  power: "power3.out",
  smooth: "power2.inOut",
  linear: "none",
} as const;

/** Durations in seconds, the unit GSAP and Framer Motion both expect. */
export const DURATION = {
  instant: 0.18,
  fast: 0.35,
  base: 0.6,
  slow: 0.9,
  cinematic: 1.4,
} as const;

/** Stagger intervals (seconds) for sequencing grouped children. */
export const STAGGER = {
  tight: 0.05,
  base: 0.09,
  loose: 0.16,
} as const;

/**
 * Default Framer Motion transition for entrance animations.
 * Spread into a `transition` prop and override `duration`/`delay` as needed.
 */
export const ENTER_TRANSITION = {
  duration: DURATION.base,
  ease: EASING.expo,
} as const;

/**
 * The viewport reveal margin shared by scroll-triggered Framer Motion
 * sections — start the animation slightly before the element is fully in view.
 */
export const REVEAL_VIEWPORT = { once: true, margin: "-12% 0px -12% 0px" } as const;
