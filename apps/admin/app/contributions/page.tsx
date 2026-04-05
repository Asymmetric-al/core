"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { useEffect, useState } from "react";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
import { mockContributions } from "./data";
import { ContributionsMainBody, ContributionsPageActions } from "./main-body";

import type { Contribution } from "./types";

export default function ContributionsPage() {
  const [isPagePending, setIsPagePending] = useState(true);
  const [data] = useState<Contribution[]>(mockContributions);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsPagePending(false);
    }, 250);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      actions={<ContributionsPageActions />}
    >
      <BoneyardSkeleton
        name="admin-contributions-content"
        loading={isPagePending}
        fallback={<ContributionsBoneyardFallback />}
        fixture={
          <ContributionsMainBody
            data={mockContributions}
            isLoading={false}
            onSelectContribution={() => {}}
          />
        }
        snapshotConfig={{
          excludeSelectors: ["[data-no-skeleton]", "svg.lucide", "svg"],
          excludeTags: ["footer"],
        }}
      >
        <ContributionsMainBody
          data={data}
          isLoading={isPagePending}
          onSelectContribution={setSelectedContribution}
        />
      </BoneyardSkeleton>

      <ContributionDetailSheet
        contribution={selectedContribution}
        onClose={() => setSelectedContribution(null)}
      />
    </PageShell>
  );
}
