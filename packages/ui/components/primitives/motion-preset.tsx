"use client";

import { useReducedMotion } from "@asym/lib/motion";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  motion as m,
  useInView,
  type HTMLMotionProps,
  type UseInViewOptions,
  type Transition,
  type Variant,
} from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";
import * as React from "react";

type MotionComponent = keyof typeof m;

interface MotionPresetProps {
  children?: React.ReactNode;
  className?: string;
  component?: MotionComponent;
  transition?: Transition;
  delay?: number;
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  inViewOnce?: boolean;
  blur?: string | boolean;
  slide?:
    | {
        direction?: "up" | "down" | "left" | "right";
        offset?: number;
      }
    | boolean;
  fade?: { initialOpacity?: number; opacity?: number } | boolean;
  zoom?:
    | {
        initialScale?: number;
        scale?: number;
      }
    | boolean;
  motionProps?: Omit<
    HTMLMotionProps<"div">,
    "children" | "className" | "ref" | "transition"
  >;
  ref?: React.Ref<HTMLDivElement | null>;
}

const motionComponents = m as unknown as Record<
  MotionComponent,
  React.ComponentType<HTMLMotionProps<"div">>
>;
const EMPTY_MOTION_PROPS: MotionPresetProps["motionProps"] = {};

function mergeTransition(
  base: Transition,
  delay: number,
  reduceMotion: boolean,
): Transition {
  if (reduceMotion) {
    return { ...base, duration: 0, delay: 0 };
  }
  return {
    ...base,
    delay: (base?.delay ?? 0) + delay,
  };
}

type MotionSlideDirection = "up" | "down" | "left" | "right";

function motionSlideAxis(direction: MotionSlideDirection): "x" | "y" {
  switch (direction) {
    case "up":
    case "down":
      return "y";
    case "left":
    case "right":
      return "x";
    default: {
      const _exhaustive: never = direction;
      return _exhaustive;
    }
  }
}

function motionSlideHiddenOffset(
  direction: MotionSlideDirection,
  offset: number,
): number {
  switch (direction) {
    case "left":
    case "up":
      return -offset;
    case "right":
    case "down":
      return offset;
    default: {
      const _exhaustive: never = direction;
      return _exhaustive;
    }
  }
}

function buildMotionPresetVariants({
  blur,
  slide,
  fade,
  zoom,
}: Pick<MotionPresetProps, "blur" | "slide" | "fade" | "zoom">): {
  hidden: Variant;
  visible: Variant;
} {
  const hiddenVariant: Variant = {};
  const visibleVariant: Variant = {};

  if (blur) {
    hiddenVariant.filter = blur === true ? "blur(10px)" : `blur(${blur})`;
    visibleVariant.filter = "blur(0px)";
  }

  if (slide) {
    const offset = slide === true ? 100 : (slide.offset ?? 100);
    const direction = slide === true ? "left" : (slide.direction ?? "left");
    const axis = motionSlideAxis(direction);

    hiddenVariant[axis] = motionSlideHiddenOffset(direction, offset);
    visibleVariant[axis] = 0;
  }

  if (fade) {
    hiddenVariant.opacity = fade === true ? 0 : (fade.initialOpacity ?? 0);
    visibleVariant.opacity = fade === true ? 1 : (fade.opacity ?? 1);
  }

  if (zoom) {
    hiddenVariant.scale = zoom === true ? 0.5 : (zoom.initialScale ?? 0.5);
    visibleVariant.scale = zoom === true ? 1 : (zoom.scale ?? 1);
  }

  return { hidden: hiddenVariant, visible: visibleVariant };
}

function MotionPreset({
  ref,
  children,
  className,
  component = "div",
  transition = transitionStandard,
  delay = 0,
  inView = true,
  inViewMargin = "0px",
  inViewOnce = true,
  blur = false,
  slide = false,
  fade = false,
  zoom = false,
  motionProps = EMPTY_MOTION_PROPS,
}: MotionPresetProps) {
  const localRef = React.useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  React.useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
    ref,
    () => localRef.current,
  );

  const inViewResult = useInView(localRef, {
    once: inViewOnce,
    margin: inViewMargin,
  });

  const isInView = !inView || inViewResult;
  const variants = buildMotionPresetVariants({ blur, slide, fade, zoom });
  const MotionComponent = motionComponents[component] || m.div;

  const effectiveTransition = mergeTransition(
    transition,
    delay,
    Boolean(reduceMotion),
  );

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence>
        <MotionComponent
          ref={localRef}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          exit="hidden"
          variants={variants}
          transition={effectiveTransition}
          className={className}
          {...motionProps}
        >
          {children}
        </MotionComponent>
      </AnimatePresence>
    </LazyMotion>
  );
}

export { MotionPreset, type MotionPresetProps };
