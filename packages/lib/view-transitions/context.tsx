"use client";

import { createContext, use } from "react";

/** True when children are wrapped in the shared route-level ViewTransition boundary (feature on + browser support + motion allowed). */
export const ViewTransitionRouteLayerContext = createContext(false);

export function useWithinViewTransitionRouteLayer(): boolean {
  return use(ViewTransitionRouteLayerContext);
}
