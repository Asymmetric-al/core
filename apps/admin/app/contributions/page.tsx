"use client";

import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { Button } from "@asym/ui/components/shadcn/button";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
import { mockContributions } from "./data";
import { ContributionsMainBody, ContributionsPageActions } from "./main-body";
import { useAdminContributions } from "./use-admin-contributions";

import type { Contribution } from "./types";

export default function ContributionsPage() {
  const contributionsQuery = useAdminContributions();
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  const isError = contributionsQuery.isError;
  const isPagePending = contributionsQuery.isPending;
  const contributionRows = isError ? [] : (contributionsQuery.data ?? []);

  const errorMessage =
    contributionsQuery.error instanceof Error
      ? contributionsQuery.error.message
      : contributionsQuery.error != null
        ? String(contributionsQuery.error)
        : "Could not load contributions.";

  return (
    <PageShell
      title="Contributions"
      description="Track and manage all donations and contributions."
      actions={<ContributionsPageActions />}
    >
      {isError ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-100 rounded-3xl">
          <div className="size-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
            <AlertCircle className="size-8 text-rose-500" />
          </div>
          <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">
            Load failed
          </h3>
          <p className="text-sm text-zinc-500 mt-2 max-w-sm font-medium">
            {errorMessage}
          </p>
          <Button
            type="button"
            onClick={() => void contributionsQuery.refetch()}
            variant="outline"
            className="mt-6 h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      ) : (
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
            data={contributionRows}
            isLoading={isPagePending}
            onSelectContribution={setSelectedContribution}
          />
        </BoneyardSkeleton>
      )}

      <ContributionDetailSheet
        contribution={selectedContribution}
        onClose={() => setSelectedContribution(null)}
      />
    </PageShell>
  );
}
