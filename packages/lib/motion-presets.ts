/**
 * Shared motion timing aligned with `docs/ai/skills/anim` — subtle, transform-first.
 * Use from client components only (`motion/react`, `@asym/lib/motion`).
 *
 * These constants mirror the CSS motion tokens in
 * `packages/ui/styles/globals.css` (`--ease-*`, `--duration-*`,
 * `--stagger-*`, `--scale-*`). When updating one side, update the other
 * so CSS-only and `motion/react` consumers share one contract.
 */

import type { Transition } from "./motion";

/* ------------------------------------------------------------------ */
/*  Easing — mirrors --ease-*-soft / --ease-drawer in globals.css     */
/* ------------------------------------------------------------------ */

/** Strong ease-out for entrances/exits — `cubic-bezier(0.22, 1, 0.36, 1)`. */
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

/** Strong ease-in for exits — `cubic-bezier(0.4, 0, 1, 1)`. */
export const EASE_IN_SOFT = [0.4, 0, 1, 1] as const;

/** Strong ease-in-out for on-screen movement — `cubic-bezier(0.77, 0, 0.175, 1)`. */
export const EASE_IN_OUT_SOFT = [0.77, 0, 0.175, 1] as const;

/** iOS-like drawer curve — `cubic-bezier(0.32, 0.72, 0, 1)`. */
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

/* ------------------------------------------------------------------ */
/*  Durations (seconds) — mirror --duration-* in globals.css          */
/*  Product UI stays under 300ms unless explicitly ceremonial.        */
/* ------------------------------------------------------------------ */

/** 120ms — button/tile press feedback. */
export const DURATION_PRESS = 0.12;
/** 150ms — hover, color change, micro-interactions. */
export const DURATION_MICRO = 0.15;
/** 220ms — tooltip, popover, dropdown, select, modal. */
export const DURATION_STANDARD = 0.22;
/** 240ms — view-transition route enter/exit (matches `--duration-route`). */
export const DURATION_ROUTE = 0.24;
/** 280ms — view-transition shared element morph (matches `--duration-shared`). */
export const DURATION_SHARED = 0.28;
/** 320ms — sheet / drawer (matches `--duration-drawer`). */
export const DURATION_DRAWER = 0.32;
/** 350ms — slow ceremonial entrance for hero/marketing surfaces. */
export const DURATION_SLOW = 0.35;

/* ------------------------------------------------------------------ */
/*  Stagger (seconds) — mirrors --stagger-* in globals.css            */
/* ------------------------------------------------------------------ */

/** 45ms between related items. */
export const STAGGER_TIGHT = 0.045;
/** 60ms — slightly looser stagger. */
export const STAGGER_MEDIUM = 0.06;

/* ------------------------------------------------------------------ */
/*  Transform tokens — mirror --scale-* in globals.css                */
/* ------------------------------------------------------------------ */

/** Subtle hover scale. */
export const SCALE_HOVER_SUBTLE = 1.02;
/** Subtle press scale. Never go below 0.95 — that's cartoon territory. */
export const SCALE_TAP_SUBTLE = 0.98;
/** Modal-style entrance scale (not from 0). */
export const SCALE_ENTRANCE = 0.96;

/* ------------------------------------------------------------------ */
/*  Pre-built Transitions                                              */
/* ------------------------------------------------------------------ */

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

/**
 * Spring for **gestures only** (drag/swipe momentum, decorative
 * mouse-tracking). Do NOT use for steady-state UI like buttons,
 * stat cards, or list rows — see `docs/ai/skills/anim/SKILL.md`.
 */
export const springTap: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

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
