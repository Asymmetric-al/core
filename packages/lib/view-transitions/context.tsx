"use client";

import { createContext, useContext } from "react";

/** True when children are wrapped in the shared route-level ViewTransition boundary (feature on + browser support + motion allowed). */
export const ViewTransitionRouteLayerContext = createContext(false);

export function useWithinViewTransitionRouteLayer(): boolean {
  return useContext(ViewTransitionRouteLayerContext);
}
