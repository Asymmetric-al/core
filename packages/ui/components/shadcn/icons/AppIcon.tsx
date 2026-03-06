"use client";

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
 */
export const AppIcon = React.memo(function AppIcon({
  icon: Icon,
  animated = false,
  className,
  size = 16,
  strokeWidth = 2,
  ...props
}: AppIconProps) {
  // Keep the default path as a plain Lucide icon.
  if (!animated) {
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
  return (
    <LazyMotion features={domAnimation}>
      <m.span
        initial={{ scale: 0.8, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
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
