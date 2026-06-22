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

export default function Page() {
  return (
    <Suspense fallback={<ContributionsPageFallback />}>
      <PageClient />
    </Suspense>
  );
}
