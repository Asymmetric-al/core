import { headers } from "next/headers";
import { Suspense } from "react";

import { MCShell } from "../mc-shell";

import { DashboardSkeleton } from "@/features/mission-control/components/patterns/skeletons";
import { getProtectedShellState } from "@/lib/admin-access";

/**
 * Stream: the auth/role gate and the Mission Control bootstrap read are
 * request-time data, so they sit behind this boundary while the skeleton
 * prerenders into the static shell of every route in the group.
 *
 * Do NOT hoist `{children}` out of this boundary. `getProtectedShellState`
 * redirects unauthorized users, and `proxy.ts` enforces authentication only —
 * never role (see `lib/admin-access.ts`). With children outside, a signed-in
 * donor's browser would receive flushed admin markup before the redirect
 * reached the stream.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ProtectedShell>{children}</ProtectedShell>
    </Suspense>
  );
}

async function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-asym-pathname") ?? "/";
  const shellState = await getProtectedShellState(pathname);

  return <MCShell initialState={shellState}>{children}</MCShell>;
}
