import { Suspense } from "react";

import { DashboardShellSkeleton } from "./dashboard-shell-skeleton";

/**
 * Suspense boundary for the cookie read (`await getAuthContext()`) in the
 * nested `donor-dashboard/layout.tsx`. A `loading.tsx` cannot serve here: it
 * does not wrap the layout of its own segment, so the boundary has to live one
 * level up.
 *
 * That nested layout holds the app's only role enforcement — the edge
 * middleware gates on signed-in, not on role. Keep the gate there; moving it to
 * a redirect-only sibling would render dashboard children to a wrong-role user.
 */
export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<DashboardShellSkeleton />}>{children}</Suspense>;
}
