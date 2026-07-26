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
 * Identical behaviour, minus the `key={usePathname()}`: Next.js already gives a
 * template a unique key per route, so the unmount/mount pair that makes
 * `enter`/`exit` fire comes from the framework instead of a hook.
 *
 * That difference is the entire point. `usePathname()` suspends while
 * prerendering a route with a dynamic param that `generateStaticParams()`
 * doesn't cover, and this component wraps `{children}`. In a layout it
 * therefore held every page below it out of the static shell — `/[...cmsSlug]`
 * and `/sign/[token]` prerendered with no page content at all. A Suspense
 * boundary can't rescue that: its fallback must not contain `{children}`
 * (https://nextjs.org/docs/messages/blocking-prerender-client-hook), so the
 * children stay out of the shell either way. Removing the read is the fix.
 *
 * Use this in `template.tsx`. Use the boundary version only where the wrapper
 * must persist across navigations.
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
