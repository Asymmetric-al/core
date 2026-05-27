"use client";

import {
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
  useContributionNeedsAttention,
} from "@asym/database/hooks";
import { BoneyardSkeleton } from "@asym/ui/components/boneyard-skeleton";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ContributionsBoneyardFallback } from "./boneyard-fallback";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
import { boneyardContributionsFixture, mockContributions } from "./data";
import { ContributionsMainBody, ContributionsPageActions } from "./main-body";
import {
  ADMIN_CONTRIBUTIONS_QUERY_KEY,
  useAdminContributions,
} from "./use-admin-contributions";

import type { Contribution } from "./types";

/** When `"1"`, table data comes from `mockContributions` (local dev only). */
const USE_MOCK_CONTRIBUTIONS_UI =
  process.env.NEXT_PUBLIC_ADMIN_CONTRIBUTIONS_USE_MOCK === "1";

async function postContributionOperation(input: {
  actionType: "approve_staged_gift" | "retry_staged_gift" | "resend_receipt";
  contributionId: string;
  stagedGiftId: string;
}) {
  const response = await fetch("/api/admin/contribution-operations/actions", {
    body: JSON.stringify({
      actionType: input.actionType,
      contributionId: input.contributionId,
      payload: { stagedGiftId: input.stagedGiftId },
      sourceSurface: "contribution_hub",
      stagedGiftId: input.stagedGiftId,
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Staged gift action failed.");
  }

  return response.json();
}

export async function invalidateContributionOperationQueries(
  queryClient: QueryClient,
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY,
    }),
    queryClient.invalidateQueries({
      queryKey: MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
    }),
  ]);
}

export default function ContributionsPage() {
  const contributionsQuery = useAdminContributions();
  const needsAttentionQuery = useContributionNeedsAttention();
  const queryClient = useQueryClient();
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);
  const approveMutation = useMutation({
    mutationFn: (input: { contributionId: string; stagedGiftId: string }) =>
      postContributionOperation({
        ...input,
        actionType: "approve_staged_gift",
      }),
    onError(error) {
      toast.error(
        error instanceof Error ? error.message : "Could not approve gift.",
      );
    },
    async onSuccess() {
      toast.success("Gift queued for finance posting.");
      await invalidateContributionOperationQueries(queryClient);
      setSelectedContribution(null);
    },
  });
  const retryMutation = useMutation({
    mutationFn: (input: { contributionId: string; stagedGiftId: string }) =>
      postContributionOperation({
        ...input,
        actionType: "retry_staged_gift",
      }),
    onError(error) {
      toast.error(error instanceof Error ? error.message : "Could not retry.");
    },
    async onSuccess() {
      toast.success("Gift retry queued.");
      await invalidateContributionOperationQueries(queryClient);
      setSelectedContribution(null);
    },
  });
  const receiptMutation = useMutation({
    mutationFn: (input: { contributionId: string; stagedGiftId: string }) =>
      postContributionOperation({
        ...input,
        actionType: "resend_receipt",
      }),
    onError(error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send receipt.",
      );
    },
    async onSuccess() {
      toast.success("Receipt send recorded.");
      await invalidateContributionOperationQueries(queryClient);
      setSelectedContribution(null);
    },
  });

  const isError = contributionsQuery.isError;
  const isPagePending = contributionsQuery.isPending;
  const contributionRows = isError
    ? []
    : USE_MOCK_CONTRIBUTIONS_UI
      ? mockContributions
      : (contributionsQuery.data ?? []);
  const needsAttentionGroups = isError
    ? []
    : (needsAttentionQuery.data?.groups ?? []);

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
      density="compact"
      actions={<ContributionsPageActions />}
    >
      <div data-testid="mc-contributions-live">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-100 rounded-3xl">
            <div className="size-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
              <AlertCircle className="size-8 text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 uppercase tracking-tight">
              Load failed
            </h3>
            <p className="text-sm text-zinc-500 mt-2 max-w-sm font-medium">
              {errorMessage}
            </p>
            <Button
              type="button"
              onClick={() => void contributionsQuery.refetch()}
              variant="outline"
              className="mt-6 h-10 px-6 rounded-xl font-semibold uppercase tracking-widest text-[10px]"
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
                data={boneyardContributionsFixture}
                isLoading={false}
                onSelectContribution={() => {}}
                needsAttentionGroups={[]}
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
              needsAttentionGroups={needsAttentionGroups}
              onSelectContribution={setSelectedContribution}
            />
          </BoneyardSkeleton>
        )}

        <ContributionDetailSheet
          contribution={selectedContribution}
          onClose={() => setSelectedContribution(null)}
          onApproveStagedGift={(stagedGiftId, contributionId) =>
            approveMutation.mutate({ contributionId, stagedGiftId })
          }
          onRetryStagedGift={(stagedGiftId, contributionId) =>
            retryMutation.mutate({ contributionId, stagedGiftId })
          }
          onSendReceipt={(stagedGiftId, contributionId) =>
            receiptMutation.mutate({ contributionId, stagedGiftId })
          }
          isActionPending={
            approveMutation.isPending ||
            retryMutation.isPending ||
            receiptMutation.isPending
          }
        />
      </div>
    </PageShell>
  );
}
