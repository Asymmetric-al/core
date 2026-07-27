"use client";

import type {} from "react/experimental";

import { useReducedMotion } from "@asym/lib/motion";
import {
  ViewTransitionRouteLayerContext,
  isViewTransitionsFeatureEnabled,
  useSupportsViewTransitions,
} from "@asym/lib/view-transitions";
import { ViewTransition } from "react";

type RouteMainTemplateProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * `template.tsx` variant of {@link RouteMainViewTransitionBoundary}.
 *
 * Identical behaviour minus `key={usePathname()}` — Next.js keys templates per
 * route, so `enter`/`exit` fire without the hook. That matters because
 * `usePathname()` suspends on routes with params `generateStaticParams()`
 * doesn't cover, and this wraps `{children}`, so in a layout it held every page
 * below it out of the static shell. A Suspense boundary can't rescue that: its
 * fallback may not contain `{children}`
 * (https://nextjs.org/docs/messages/blocking-prerender-client-hook).
 *
 * Use the boundary version only where the wrapper must persist across navigations.
 */
export function RouteMainViewTransitionTemplate({
  children,
  className,
}: RouteMainTemplateProps) {
  const reduceMotion = useReducedMotion();
  const supportsViewTransitions = useSupportsViewTransitions();
  const enabled =
    isViewTransitionsFeatureEnabled() &&
    supportsViewTransitions &&
    reduceMotion !== true;

  const content = className ? (
    <div className={className}>{children}</div>
  ) : (
    <>{children}</>
  );

  if (!enabled) {
    return (
      <ViewTransitionRouteLayerContext.Provider value={false}>
        {content}
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
        {content}
      </ViewTransition>
    </ViewTransitionRouteLayerContext.Provider>
  );
}
