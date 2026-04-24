"use client";

import { useReducedMotion } from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";
import { type LucideIcon } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

export interface AppIconProps extends React.ComponentPropsWithoutRef<"svg"> {
  icon: LucideIcon;
  animated?: boolean;
  size?: number | string;
  strokeWidth?: number;
}

/**
 * AppIcon abstraction that renders a Lucide icon with optional animation.
 * Animate ONLY the active route icon as per Phase 3 requirements.
 *
 * Falls back gracefully to standard Lucide icons when animation is
 * disabled or the user prefers reduced motion.
 *
 * Motion contract:
 * - Entrance scale starts at 0.96 (not 0.8) per emil-design-eng
 *   ("never animate from scale(0); start nearly there").
 * - Standard tween (duration-standard, ease-out-soft) instead of a
 *   spring — this is a high-frequency surface (admin/missionary
 *   sidebar) that should feel calm, not bouncy.
 * - Reduced motion: render the static icon, no entrance.
 */
export const AppIcon = React.memo(function AppIcon({
  icon: Icon,
  animated = false,
  className,
  size = 16,
  strokeWidth = 2,
  ...props
}: AppIconProps) {
  const reduceMotion = useReducedMotion();

  // Graceful fallback: when not animated or when the user prefers reduced
  // motion, render the standard icon.
  if (!animated || reduceMotion) {
    return (
      <Icon
        className={cn("shrink-0", className)}
        size={size}
        strokeWidth={strokeWidth}
        {...props}
      />
    );
  }

  // Active route animation: subtle scale and opacity entrance.
  // Tween (not spring) and a near-final start scale keep this calm
  // for nav surfaces clicked dozens of times per session.
  return (
    <LazyMotion features={domAnimation}>
      <m.span
        initial={{ scale: 0.96, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={transitionStandard}
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          className,
        )}
      >
        <Icon size={size} strokeWidth={strokeWidth} {...props} />
      </m.span>
    </LazyMotion>
  );
});
