/**
 * Shared motion timing aligned with `docs/ai/skills/anim` — subtle, transform-first.
 * Use from client components only (`motion/react`, `@asym/lib/motion`).
 */

import type { Transition } from "motion/react";

/** Ease-out for entrances (decelerate into place). */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

/** Ease-in for exits (accelerate away). */
export const EASE_IN_SOFT = [0.4, 0, 1, 1] as const;

export const DURATION_MICRO = 0.15;
export const DURATION_STANDARD = 0.25;
export const DURATION_SLOW = 0.35;

/** Stagger between related children (seconds). */
export const STAGGER_TIGHT = 0.045;
export const STAGGER_MEDIUM = 0.06;

/** Hover / tap scale — matches shadcn `maia` button variant band. */
export const SCALE_HOVER_SUBTLE = 1.02;
export const SCALE_TAP_SUBTLE = 0.98;

export const transitionStandard: Transition = {
  duration: DURATION_STANDARD,
  ease: EASE_OUT_SOFT,
};

export const transitionSlow: Transition = {
  duration: DURATION_SLOW,
  ease: EASE_OUT_SOFT,
};

export const transitionExitQuick: Transition = {
  duration: DURATION_MICRO,
  ease: EASE_IN_SOFT,
};

export const springTap: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

/** Modal-style entrance scale (not from 0). */
export const SCALE_ENTRANCE = 0.96;

function isReduced(reduceMotion: boolean | null): boolean {
  return reduceMotion === true;
}

/** Mount: fade + small rise. When reduced motion, no tween. */
export function propsHeroEntrance(
  reduceMotion: boolean | null,
  delay = 0,
  y = 8,
): {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  transition: Transition;
} {
  if (isReduced(reduceMotion)) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { ...transitionStandard, delay },
  };
}

/** In-view: fade + rise. */
export function propsFadeRiseInView(
  reduceMotion: boolean | null,
  options?: { y?: number; delay?: number; duration?: number },
): {
  initial: { opacity: number; y: number };
  whileInView: { opacity: number; y: number };
  viewport: { once: boolean };
  transition: Transition;
} {
  const y = options?.y ?? 12;
  const delay = options?.delay ?? 0;
  const duration = options?.duration ?? DURATION_STANDARD;
  if (isReduced(reduceMotion)) {
    return {
      initial: { opacity: 1, y: 0 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration, ease: EASE_OUT_SOFT, delay },
  };
}

/** In-view: fade + scale from SCALE_ENTRANCE. */
export function propsScaleFadeInView(
  reduceMotion: boolean | null,
  options?: { duration?: number },
): {
  initial: { opacity: number; scale: number };
  whileInView: { opacity: number; scale: number };
  viewport: { once: boolean };
  transition: Transition;
} {
  const duration = options?.duration ?? DURATION_SLOW;
  if (isReduced(reduceMotion)) {
    return {
      initial: { opacity: 1, scale: 1 },
      whileInView: { opacity: 1, scale: 1 },
      viewport: { once: true },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, scale: SCALE_ENTRANCE },
    whileInView: { opacity: 1, scale: 1 },
    viewport: { once: true },
    transition: { duration, ease: EASE_OUT_SOFT },
  };
}
