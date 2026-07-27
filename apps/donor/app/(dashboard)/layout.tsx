import { Suspense } from "react";

import { DashboardShellSkeleton } from "./dashboard-shell-skeleton";

/**
 * Suspense boundary for the cookie read (`await getAuthContext()`) in the
 * nested `donor-dashboard/layout.tsx`. A `loading.tsx` cannot serve here: it
 * does not wrap the layout of its own segment, so the boundary has to live one
 * level up.
 *
 * Wrapping from above is deliberate. `donor-dashboard/layout.tsx` holds the
 * app's only role enforcement (`hasAnyContextRole` -> `redirect("/no-access")`)
 * — `packages/auth/middleware.ts` gates on `isProtectedPath && !userId` and
 * consults `allowedRoles` only in the E2E-bypass branch, so a real
 * Supabase-authenticated user with the wrong role passes the edge. Do not
 * refactor that gate into a redirect-only sibling; it would render dashboard
 * children to a wrong-role user.
 *
 * This fallback pre-empts the per-route `feed`/`history`/`wallet` loading
 * states on first paint. The dashboard is `robots: { index: false }`, so there
 * is no SEO cost.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<DashboardShellSkeleton />}>{children}</Suspense>;
}
