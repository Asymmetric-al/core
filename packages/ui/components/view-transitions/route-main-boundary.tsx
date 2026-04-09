"use client";

import type {} from "react/experimental";

import { useReducedMotion } from "@asym/lib/motion";
import {
  ViewTransitionRouteLayerContext,
  clientDocumentSupportsViewTransitions,
  isViewTransitionsFeatureEnabled,
} from "@asym/lib/view-transitions";
import { ViewTransition } from "react";

type RouteMainBoundaryProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps the app shell `<main>` (or equivalent) so route changes animate only the content region.
 * No-op when the feature flag is off, the browser lacks support, or the user prefers reduced motion.
 */
export function RouteMainViewTransitionBoundary({
  children,
  className,
}: RouteMainBoundaryProps) {
  const reduceMotion = useReducedMotion();
  const enabled =
    isViewTransitionsFeatureEnabled() &&
    clientDocumentSupportsViewTransitions() &&
    reduceMotion !== true;

  if (!enabled) {
    return (
      <ViewTransitionRouteLayerContext.Provider value={false}>
        {className ? (
          <div className={className}>{children}</div>
        ) : (
          <>{children}</>
        )}
      </ViewTransitionRouteLayerContext.Provider>
    );
  }

  return (
    <ViewTransitionRouteLayerContext.Provider value={true}>
      <ViewTransition
        default="none"
        enter="asym-vt-route-enter"
        exit="asym-vt-route-exit"
      >
        {className ? <div className={className}>{children}</div> : children}
      </ViewTransition>
    </ViewTransitionRouteLayerContext.Provider>
  );
}
