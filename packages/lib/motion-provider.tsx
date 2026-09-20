"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { type ReactNode } from "react";

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
