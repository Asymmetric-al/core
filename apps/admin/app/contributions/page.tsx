import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Suspense } from "react";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import PageClient from "./page-client";
import { CONTRIBUTIONS_PAGE_META } from "../../components/table-page-meta";

function ContributionsPageFallback() {
  return (
    <PageShell
      title={CONTRIBUTIONS_PAGE_META.title}
      description={CONTRIBUTIONS_PAGE_META.description}
      density={CONTRIBUTIONS_PAGE_META.density}
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
