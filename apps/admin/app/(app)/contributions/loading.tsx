import { PageShell } from "@asym/ui/components/primitives/page-shell";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import { CONTRIBUTIONS_PAGE_META } from "../../../components/table-page-meta";

export default function Loading() {
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
