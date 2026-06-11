"use client";

import {
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
  ADMIN_CRM_RECORDS_QUERY_KEY,
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
} from "@asym/database/hooks";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { ContributionDetailSheet } from "./contribution-detail-sheet";
import { ADMIN_CONTRIBUTIONS_QUERY_KEY } from "./use-admin-contributions";

import type { Contribution } from "./types";
import type {
  ContributionDetail,
  ContributionSourceSurface,
  ViewerProjectedContributionDetail,
} from "@asym/api/admin/contribution-operations";

export const ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY = [
  "admin",
  "contribution-detail",
] as const;

export function contributionDetailQueryKey(donationId: string) {
  return [...ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY, donationId] as const;
}

/**
 * Invalidates every query that renders shared contribution fields so the
 * Contributions Hub, CRM donor gift history, and the open detail overlay
 * refresh from the same database truth after an operation (ADR-CD-032).
 */
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
    queryClient.invalidateQueries({
      queryKey: ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY,
    }),
    queryClient.invalidateQueries({
      queryKey: ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
    }),
    queryClient.invalidateQueries({
      queryKey: ADMIN_CRM_RECORDS_QUERY_KEY,
    }),
  ]);
}

async function fetchContributionDetail(donationId: string) {
  const response = await fetch(
    `/api/admin/contribution-operations/${donationId}`,
    { headers: { accept: "application/json" } },
  );

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load contribution detail.");
  }

  const body = (await response.json()) as {
    contribution: ViewerProjectedContributionDetail;
  };
  return body.contribution;
}

export function useContributionDetail(donationId: string | null) {
  return useQuery({
    enabled: Boolean(donationId),
    queryFn: () => fetchContributionDetail(donationId!),
    queryKey: contributionDetailQueryKey(donationId ?? "none"),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

async function postContributionOperation(input: {
  actionType: "approve_staged_gift" | "retry_staged_gift" | "resend_receipt";
  contributionId: string;
  stagedGiftId: string;
  sourceSurface: ContributionSourceSurface;
}) {
  const response = await fetch("/api/admin/contribution-operations/actions", {
    body: JSON.stringify({
      actionType: input.actionType,
      contributionId: input.contributionId,
      payload: { stagedGiftId: input.stagedGiftId },
      sourceSurface: input.sourceSurface,
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

function contributionTypeFromDetail(
  detail: ContributionDetail,
): Contribution["type"] {
  return detail.recurring.isRecurring ? "Recurring" : "One-time";
}

function paymentMethodFromDetail(
  detail: ContributionDetail,
): Contribution["paymentMethod"] {
  const method = detail.payment.method.toLowerCase();
  if (method.includes("card")) return "Credit Card";
  if (method.includes("bank") || method.includes("ach")) {
    return "Bank Transfer";
  }
  if (method.includes("check")) return "Check";
  if (method.includes("cash")) return "Cash";
  if (method.includes("paypal")) return "PayPal";
  return "Other";
}

export function contributionFromDetail(
  detail: ContributionDetail,
): Contribution {
  const shared = detail.shared;
  const stagedGift = detail.stagedGift;
  const crmPostStatus = shared.crmPostStatus;

  return {
    shared,
    id: shared.donationId,
    donorId: shared.donorId,
    donorName: shared.donorName,
    donorEmail: detail.donor?.email ?? "",
    donorAvatar: null,
    donorType: null,
    donorPhone: detail.donor?.phoneNumbers[0] ?? null,
    donorLocation: detail.donor?.location ?? null,
    organizationName: detail.donor?.organization ?? null,
    amount: shared.amountCents,
    amountGross: shared.amountCents,
    amountNet: detail.amount.net,
    amountFee: detail.amount.fee,
    amountTaxDeductible: detail.amount.taxDeductible,
    currency: detail.amount.currency,
    date: shared.giftDate,
    contributionDate: shared.giftDate,
    createdAt: detail.gift.createdAt,
    updatedAt: detail.gift.updatedAt,
    settlementDate: null,
    depositDate: null,
    status: shared.paymentStatus,
    subStatus: null,
    type: contributionTypeFromDetail(detail),
    paymentMethod: paymentMethodFromDetail(detail),
    source: "Online",
    fundId: shared.designationSummary.fundId,
    fundCode: shared.designationSummary.fundId,
    fundName: shared.designationSummary.fundName,
    missionaryId: shared.designationSummary.missionaryId,
    missionaryName: shared.designationSummary.missionaryName,
    campaignId: detail.gift.campaignId,
    receiptStatus: shared.receiptStatus,
    receiptSent: shared.receiptStatus === "sent",
    receiptSentAt: null,
    stagedGiftId: stagedGift?.id ?? null,
    stagedGiftStatus:
      stagedGift?.status === "received" ||
      stagedGift?.status === "needs_review" ||
      stagedGift?.status === "ready_to_post" ||
      stagedGift?.status === "posted" ||
      stagedGift?.status === "failed" ||
      stagedGift?.status === "refunded" ||
      stagedGift?.status === "voided"
        ? stagedGift.status
        : null,
    stagedGiftReviewReason: stagedGift?.reviewReason ?? null,
    crmPostStatus,
    annualStatementEligible: true,
    entryMethod: "api",
    reconciliationStatus:
      crmPostStatus === "posted"
        ? "reconciled"
        : crmPostStatus === "failed" || crmPostStatus === "blocked"
          ? "review"
          : "unreconciled",
    transactionId:
      detail.payment.stripe.paymentIntentId ??
      detail.payment.stripe.chargeId ??
      detail.id,
    externalTransactionId: detail.payment.stripe.chargeId,
    processorTransactionId: detail.payment.stripe.paymentIntentId,
    notes: null,
    notesPreview: null,
    isAnonymous: detail.donor === null,
  };
}

/**
 * Shared contribution detail overlay keyed by the canonical `donation.id`.
 *
 * Both the Contributions Hub and CRM donor gift history render this overlay
 * so the same gift opens the same detail experience from every entry surface.
 * The overlay loads canonical detail itself; the host surface only supplies
 * the `donation.id` and removes it from its route state on close.
 */
export function ContributionDetailOverlay({
  donationId,
  sourceSurface,
  onClose,
  onActionSuccess,
}: {
  donationId: string | null;
  sourceSurface: ContributionSourceSurface;
  onClose: () => void;
  /** Lets the host surface show a quiet freshness indicator (ADR-CD-022). */
  onActionSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const detailQuery = useContributionDetail(donationId);

  /**
   * Stale-save recovery (ADR-CD-022): when the server rejects a save
   * because the gift changed, refetch the latest detail so the staff member
   * can review and retry from current truth.
   */
  const recoverFromStaleSave = (error: unknown) => {
    if (
      error instanceof Error &&
      /changed since you loaded/i.test(error.message) &&
      donationId
    ) {
      void queryClient.invalidateQueries({
        queryKey: contributionDetailQueryKey(donationId),
      });
    }
  };

  useEffect(() => {
    if (detailQuery.isError && donationId) {
      toast.error(
        detailQuery.error instanceof Error
          ? detailQuery.error.message
          : "Could not open contribution.",
      );
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailQuery.isError, donationId]);

  const approveMutation = useMutation({
    mutationFn: (input: { contributionId: string; stagedGiftId: string }) =>
      postContributionOperation({
        ...input,
        actionType: "approve_staged_gift",
        sourceSurface,
      }),
    onError(error) {
      toast.error(
        error instanceof Error ? error.message : "Could not approve gift.",
      );
      recoverFromStaleSave(error);
    },
    async onSuccess() {
      toast.success("Gift queued for finance posting.");
      await invalidateContributionOperationQueries(queryClient);
      onActionSuccess?.();
      onClose();
    },
  });
  const retryMutation = useMutation({
    mutationFn: (input: { contributionId: string; stagedGiftId: string }) =>
      postContributionOperation({
        ...input,
        actionType: "retry_staged_gift",
        sourceSurface,
      }),
    onError(error) {
      toast.error(error instanceof Error ? error.message : "Could not retry.");
      recoverFromStaleSave(error);
    },
    async onSuccess() {
      toast.success("Gift retry queued.");
      await invalidateContributionOperationQueries(queryClient);
      onActionSuccess?.();
      onClose();
    },
  });
  const receiptMutation = useMutation({
    mutationFn: (input: { contributionId: string; stagedGiftId: string }) =>
      postContributionOperation({
        ...input,
        actionType: "resend_receipt",
        sourceSurface,
      }),
    onError(error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send receipt.",
      );
      recoverFromStaleSave(error);
    },
    async onSuccess() {
      toast.success("Receipt send recorded.");
      await invalidateContributionOperationQueries(queryClient);
      onActionSuccess?.();
      onClose();
    },
  });

  const contribution = detailQuery.data
    ? contributionFromDetail(detailQuery.data)
    : null;

  return (
    <ContributionDetailSheet
      contribution={donationId ? contribution : null}
      actionAvailability={detailQuery.data?.actionAvailability}
      designations={detailQuery.data?.designations}
      providerProof={detailQuery.data?.providerProof ?? null}
      recurring={detailQuery.data?.recurring}
      onClose={onClose}
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
  );
}
