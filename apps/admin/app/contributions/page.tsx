"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { useState } from "react";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
import { mockContributions } from "./data";
import { ContributionsMainBody, ContributionsPageActions } from "./main-body";

import type { Contribution } from "./types";

export default function ContributionsPage() {
  const [data] = useState<Contribution[]>(mockContributions);
  const [isLoading] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      actions={<ContributionsPageActions />}
    >
      <BoneyardSkeleton
        name="admin-contributions-content"
        loading={isLoading}
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
          isLoading={isLoading}
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
