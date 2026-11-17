import { getAuthContext } from "@asym/auth/context";
import { redirectInTenant, tenantHref } from "@asym/auth/tenant-server";

import PageClient from "./page-client";
import { canAccessEveOperationsWorkspace } from "./workspace-access";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eve operations",
  description:
    "Observe and control Eve governance state before autonomous operation.",
};

export default async function Page() {
  const auth = await getAuthContext();
  if (!auth.isAuthenticated) {
    await redirectInTenant(
      `/login?next=${encodeURIComponent(await tenantHref("/admin/eve"))}`,
    );
  }
  if (!canAccessEveOperationsWorkspace(auth)) {
    await redirectInTenant("/no-access");
  }

  return <PageClient />;
}
