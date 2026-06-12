"use client";

import {
  AnimatePresence,
  LayoutGroup,
  LazyMotion,
  MotionConfig,
  domAnimation,
  m,
  useInView,
  useReducedMotion,
} from "motion/react";
import { type ReactNode } from "react";

export const motion = m;

export {
  AnimatePresence,
  LayoutGroup,
  LazyMotion,
  domAnimation,
  useInView,
  useReducedMotion,
};
export type {
  HTMLMotionProps,
  Transition,
  UseInViewOptions,
  Variant,
  Variants,
} from "motion/react";

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={domAnimation}>
      {/* reducedMotion="user" disables transform/layout animations for
          prefers-reduced-motion users across every motion component,
          complementing the CSS baseline in packages/ui/styles/globals.css. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
