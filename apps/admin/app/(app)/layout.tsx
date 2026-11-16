import { headers } from "next/headers";
import { Suspense } from "react";

import { MCShell } from "../mc-shell";

import { ShellSkeleton } from "@/features/mission-control/components/patterns/skeletons";
import { getProtectedShellState } from "@/lib/admin-access";

/**
 * Stream: the auth/role gate and the Mission Control bootstrap read are
 * request-time data, so they sit behind this boundary while the skeleton
 * prerenders into the static shell of every route in the group.
 *
 * Do NOT hoist `{children}` out of this boundary. `getProtectedShellState`
 * redirects users without an admin role or a tenant (`lib/admin-access.ts`).
 * `proxy.ts` already rejects wrong-role sessions at the edge, but this gate is
 * the defense in depth behind it: with children outside, admin markup would
 * flush to the browser before the gate's redirect reached the stream.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <ProtectedShell>{children}</ProtectedShell>
    </Suspense>
  );
}

async function ProtectedShell({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-asym-pathname") ?? "/";
  const shellState = await getProtectedShellState(pathname);

  return <MCShell initialState={shellState}>{children}</MCShell>;
}
