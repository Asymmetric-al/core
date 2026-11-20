import { TenantDocument } from "@asym/auth/tenant-navigation";
import { headers } from "next/headers";
import { Suspense } from "react";

import { MCShell } from "../mc-shell";

import { ShellSkeleton } from "@/features/mission-control/components/patterns/skeletons";
import { getTenantShell } from "@/lib/admin-access";

/**
 * Stream: the auth/role gate and the Mission Control bootstrap read are
 * request-time data, so they sit behind this boundary while the skeleton
 * prerenders into the static shell of every route in the group.
 *
 * Do NOT hoist `{children}` out of this boundary. `getTenantShell` redirects
 * users without an admin role or a tenant (`lib/admin-access.ts`).
 * `proxy.ts` already rejects wrong-role sessions at the edge, but this gate is
 * the defense in depth behind it: with children outside, admin markup would
 * flush to the browser before the gate's redirect reached the stream.
 *
 * Every page here lives under the tenant in the page address (plan 5.2):
 * `TenantDocument` fixes the document's scope from what the proxy decided and
 * reloads when the address's tenant or sub-role ever differs from it. The
 * static shell holds no tenant, so every tenant gets the same one.
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
  const { scope, shellState } = await getTenantShell(pathname);

  return (
    <TenantDocument scope={scope}>
      <MCShell initialState={shellState}>{children}</MCShell>
    </TenantDocument>
  );
}
