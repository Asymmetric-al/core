import { Suspense } from "react";

import { DashboardShellSkeleton } from "./dashboard-shell-skeleton";

/**
 * The dashboard group's Suspense boundary. The nested
 * `donor-dashboard/layout.tsx` reads the request (`getAuthContext()`) inside
 * its own boundary, behind its skeleton frame, where its role gate and the
 * portal's document scope wrap the header and the pages (WP2b, AL-2675). This
 * boundary stays as the group's backstop, so no request-time read under it
 * can commit a blank page. A `loading.tsx` cannot serve here: it does not wrap
 * the layout of its own segment.
 *
 * The nested layout's role gate is defence in depth, not the primary one:
 * `apps/donor/proxy.ts` puts `/donor-dashboard` behind `allowedRoles`, so a
 * wrong-role visitor is turned away at the edge. Both are pinned by
 * `tests/unit/apps/donor/static-shell-contract.test.ts`.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<DashboardShellSkeleton />}>{children}</Suspense>;
}
