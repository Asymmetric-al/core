"use client";

import {
  AnimatePresence,
  LayoutGroup,
  LazyMotion,
  domAnimation,
  m,
} from "motion/react";
import { type ReactNode } from "react";

export const motion = m;

export { AnimatePresence, LayoutGroup };

interface MotionProviderProps {
  children: ReactNode;
}

export function MotionProvider({ children }: MotionProviderProps) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
