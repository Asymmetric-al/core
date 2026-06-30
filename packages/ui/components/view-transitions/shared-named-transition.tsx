"use client";

import type {} from "react/experimental";

import { useReducedMotion } from "@asym/lib/motion";
import {
  isViewTransitionsFeatureEnabled,
  useSupportsViewTransitions,
} from "@asym/lib/view-transitions";
import { ViewTransition } from "react";

type SharedNamedViewTransitionProps = {
  name: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Shared-element morph between routes: same stable `name` on list + detail (or shell + page).
 * Falls back to plain children when VT is off or reduced motion is on.
 */
export function SharedNamedViewTransition({
  name,
  children,
  className,
}: SharedNamedViewTransitionProps) {
  const reduceMotion = useReducedMotion();
  const supportsViewTransitions = useSupportsViewTransitions();
  const enabled =
    isViewTransitionsFeatureEnabled() &&
    supportsViewTransitions &&
    reduceMotion !== true;

  if (!enabled) {
    return className ? (
      <div className={className}>{children}</div>
    ) : (
      <>{children}</>
    );
  }

  return (
    <ViewTransition name={name} default="none" share="asym-vt-share-morph">
      {className ? <div className={className}>{children}</div> : children}
    </ViewTransition>
  );
}
