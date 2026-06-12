"use client";

import type {} from "react/experimental";

import { useReducedMotion } from "@asym/lib/motion";
import {
  ViewTransitionRouteLayerContext,
  isViewTransitionsFeatureEnabled,
  useSupportsViewTransitions,
} from "@asym/lib/view-transitions";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

type RouteMainBoundaryProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps the app shell `<main>` (or equivalent) so route changes animate only the content region.
 * No-op when the feature flag is off, the browser lacks support, or the user prefers reduced motion.
 *
 * The `<ViewTransition>` is keyed by pathname: this boundary lives in persistent
 * layouts, where enter/exit would otherwise never fire after the initial mount
 * (layouts persist across navigations) and the children-swap "update" trigger is
 * deliberately suppressed by `default="none"` so Suspense reveals and
 * revalidations stay silent. Keying forces an unmount/mount pair per navigation
 * (the skill's "Force Re-Enter with key" pattern), which is also what
 * `template.tsx` semantics would give: route-content state resets on navigation
 * when the feature flag is on.
 */
export function RouteMainViewTransitionBoundary({
  children,
  className,
}: RouteMainBoundaryProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const supportsViewTransitions = useSupportsViewTransitions();
  const enabled =
    isViewTransitionsFeatureEnabled() &&
    supportsViewTransitions &&
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
        key={pathname}
        default="none"
        enter="asym-vt-route-enter"
        exit="asym-vt-route-exit"
      >
        {className ? <div className={className}>{children}</div> : children}
      </ViewTransition>
    </ViewTransitionRouteLayerContext.Provider>
  );
}
