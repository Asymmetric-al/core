import { clientEnv } from "@asym/env";

/**
 * Single rollout switch for React View Transitions across apps.
 * Set `NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED=true` to opt in (still requires browser support + no reduced motion at runtime).
 */
export function isViewTransitionsFeatureEnabled(): boolean {
  return clientEnv.NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED === true;
}
