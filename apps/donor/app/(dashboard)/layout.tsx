import { Suspense } from "react";

import { DashboardShellSkeleton } from "./dashboard-shell-skeleton";

/**
 * Suspense boundary for the cookie read (`await getAuthContext()`) in the
 * nested `donor-dashboard/layout.tsx`. A `loading.tsx` cannot serve here: it
 * does not wrap the layout of its own segment, so the boundary has to live one
 * level up.
 *
 * The nested layout's role gate is defence in depth, not the primary one:
 * `apps/donor/proxy.ts` puts `/donor-dashboard` behind `allowedRoles`, so a
 * wrong-role visitor is turned away at the edge and never renders children.
 * Demoting that edge check would make the sibling gate unsafe — both are pinned
 * by `tests/unit/apps/donor/static-shell-contract.test.ts`.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<DashboardShellSkeleton />}>{children}</Suspense>;
}
