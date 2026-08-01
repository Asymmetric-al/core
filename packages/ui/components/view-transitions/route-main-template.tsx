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
 * Same animation contract, but with no `usePathname()` read. A `template.js`
 * gets a fresh instance — and therefore a remount — from the framework on every
 * navigation, so Next supplies the key that the boundary variant has to derive
 * from the pathname itself. Removing that read is what lets a route with a
 * dynamic param prerender a static shell under Cache Components: a URL read in
 * a shared layout is request data, and it blocks the whole subtree.
 *
 * Templates key per *segment level*, not per full pathname. Navigating between
 * two children of the same dynamic segment (e.g. `/workers/a` -> `/workers/b`)
 * therefore may not remount this template; add a nested `template.tsx` in that
 * segment if enter/exit parity is needed there.
 *
 * Render this as a SIBLING of persistent chrome (navbar/footer), never above
 * it, so route transitions animate only the content region.
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
