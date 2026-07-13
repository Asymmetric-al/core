import { hasContributionPermission } from "@asym/api/admin/contribution-operations";
import {
  getAuthContext,
  type AuthContext,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Suspense } from "react";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import PageClient from "./page-client";

function ContributionsPageFallback() {
  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      density="compact"
    >
      <ContributionsBoneyardFallback />
    </PageShell>
  );
}

function isAuthenticatedContext(
  auth: AuthContext,
): auth is AuthenticatedContext {
  return auth.isAuthenticated;
}

function canManageOfflineContributions(auth: AuthContext): boolean {
  if (!isAuthenticatedContext(auth)) {
    return false;
  }

  return hasContributionPermission(auth, "finance:manage_contributions");
}

export default async function Page() {
  const auth = await getAuthContext();
  const canManageContributions = canManageOfflineContributions(auth);

  return (
    <Suspense fallback={<ContributionsPageFallback />}>
      <PageClient canManageContributions={canManageContributions} />
    </Suspense>
  );
}
