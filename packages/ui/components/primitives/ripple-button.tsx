"use client";

import { useReducedMotion } from "@asym/lib/motion";
import {
  LazyMotion,
  domAnimation,
  motion as m,
  type HTMLMotionProps,
  type Transition,
} from "@asym/lib/motion";
import { EASE_OUT_SOFT } from "@asym/lib/motion-presets";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { buttonVariants } from "../shadcn/button";

import type { VariantProps } from "class-variance-authority";

const DEFAULT_RIPPLE_DURATION_S = 0.4;
const defaultRippleTransition: Transition = {
  duration: DEFAULT_RIPPLE_DURATION_S,
  ease: EASE_OUT_SOFT,
};

function rippleDurationMs(transition: Transition | undefined): number {
  const d =
    transition &&
    typeof transition === "object" &&
    "duration" in transition &&
    typeof (transition as { duration?: unknown }).duration === "number"
      ? (transition as { duration: number }).duration
      : DEFAULT_RIPPLE_DURATION_S;
  return Math.ceil(d * 1000);
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps
  extends HTMLMotionProps<"button">, VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  scale?: number;
  transition?: Transition;
}

function RippleButton({
  ref,
  children,
  onClick,
  className,
  variant,
  size,
  scale = 10,
  transition = defaultRippleTransition,
  ...props
}: RippleButtonProps) {
  const reduceMotion = useReducedMotion();
  const [ripples, setRipples] = React.useState<Ripple[]>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  const removeAfterMs = rippleDurationMs(transition);

  const createRipple = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (reduceMotion) return;
      const button = buttonRef.current;

      if (!button) return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, removeAfterMs);
    },
    [reduceMotion, removeAfterMs],
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);

      if (onClick) {
        onClick(event);
      }
    },
    [createRipple, onClick],
  );

  return (
    <LazyMotion features={domAnimation}>
      <m.button
        ref={buttonRef}
        data-slot="ripple-button"
        onClick={handleClick}
        className={cn(
          buttonVariants({ variant, size }),
          "relative overflow-hidden",
          className,
        )}
        {...props}
      >
        {children}
        {ripples.map((ripple) => (
          <m.span
            key={ripple.id}
            initial={{ scale: 0.95, opacity: 0.45 }}
            animate={{ scale, opacity: 0 }}
            transition={transition}
            className="pointer-events-none absolute size-5 rounded-full bg-current"
            style={{
              top: ripple.y - 10,
              left: ripple.x - 10,
            }}
          />
        ))}
      </m.button>
    </LazyMotion>
  );
}

export { RippleButton, type RippleButtonProps };
