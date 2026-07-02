"use client";

import { createContext, use, useSyncExternalStore } from "react";

import { clientDocumentSupportsViewTransitions } from "./support";

/** True when children are wrapped in the shared route-level ViewTransition boundary (feature on + browser support + motion allowed). */
export const ViewTransitionRouteLayerContext = createContext(false);

export function useWithinViewTransitionRouteLayer(): boolean {
  return use(ViewTransitionRouteLayerContext);
}

const emptySubscribe = () => () => {};
const getServerSupportSnapshot = () => false;

/**
 * Hydration-safe browser-support check: the server (and the first client
 * render during hydration) reports `false`, then React re-renders with the
 * real capability. Calling the detection inline during render would make the
 * SSR HTML and the hydration render disagree (hydration mismatch).
 */
export function useSupportsViewTransitions(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    clientDocumentSupportsViewTransitions,
    getServerSupportSnapshot,
  );
}
