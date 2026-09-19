"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import {
  contributionDetailQueryKey,
  isContributionGiftParam,
  invalidateContributionOperationQueries,
  contributionFromDetail,
  crmRetryPayloadFromScope,
} from "./contribution-detail-model";
import { ContributionDetailSheet } from "./contribution-detail-sheet";
// The shell reads the detail query hook from this file and the overlay
// mounts the shell for refunds; both sides only reference the other inside
// function bodies, so evaluation order is safe.
import { OPERATION_DEFINITIONS } from "./operation-definitions";
import { ContributionOperationShell } from "./operation-shell";

import type {
  ContributionSourceSurface,
  CrmPostFailedScope,
  ViewerProjectedContributionDetail,
} from "@asym/api/admin/contribution-operations";

async function fetchContributionDetail(donationId: string) {
  const response = await fetch(
    `/api/admin/contribution-operations/${encodeURIComponent(donationId)}`,
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
  const validDonationId = isContributionGiftParam(donationId)
    ? donationId
    : null;

  return useQuery({
    enabled: Boolean(validDonationId),
    queryFn: () => fetchContributionDetail(validDonationId!),
    queryKey: contributionDetailQueryKey(validDonationId ?? "none"),
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

async function postContributionOperation(input: {
  actionType: "approve_staged_gift" | "retry_staged_gift" | "resend_receipt";
  contributionId: string;
  stagedGiftId: string;
  sourceSurface: ContributionSourceSurface;
  payload?: Record<string, unknown>;
  /**
   * Revision of the detail the staffer is acting on (ADR-CD-022). The server
   * rejects the action with a 409 when the gift changed since this load, so
   * direct Send receipt / Approve / Retry never execute against unreviewed
   * data.
   */
  expectedRevision?: string | null;
}) {
  const response = await fetch("/api/admin/contribution-operations/actions", {
    body: JSON.stringify({
      actionType: input.actionType,
      contributionId: input.contributionId,
      expectedRevision: input.expectedRevision ?? null,
      payload: input.payload ?? {},
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
  const validDonationId = isContributionGiftParam(donationId)
    ? donationId
    : null;
  const detailQuery = useContributionDetail(validDonationId);

  // Refund entry point (issue #265): the sheet's "Refund gift" action opens
  // the shared operation shell for the gift it was requested for. Keying the
  // open state by donation id means switching or closing the gift can never
  // leave a stale refund dialog pointed at another contribution.
  const [refundDonationId, setRefundDonationId] = useState<string | null>(null);
  const refundShellOpen =
    refundDonationId !== null && refundDonationId === validDonationId;

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

  const approveMutation = useMutation({
    mutationFn: (input: { contributionId: string; stagedGiftId: string }) =>
      postContributionOperation({
        ...input,
        actionType: "approve_staged_gift",
        expectedRevision: detailQuery.data?.revision ?? null,
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
    mutationFn: (input: {
      contributionId: string;
      stagedGiftId: string;
      scope?: CrmPostFailedScope;
    }) =>
      postContributionOperation({
        actionType: "retry_staged_gift",
        contributionId: input.contributionId,
        stagedGiftId: input.stagedGiftId,
        expectedRevision: detailQuery.data?.revision ?? null,
        payload: crmRetryPayloadFromScope(input.scope),
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
        expectedRevision: detailQuery.data?.revision ?? null,
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
  const detailErrorMessage =
    donationId && !validDonationId
      ? "Invalid contribution link."
      : detailQuery.isError
        ? detailQuery.error instanceof Error
          ? detailQuery.error.message
          : "Could not load contribution detail."
        : null;

  return (
    <>
      <ContributionDetailSheet
        contribution={contribution}
        actionAvailability={detailQuery.data?.actionAvailability}
        designations={detailQuery.data?.designations}
        errorMessage={detailErrorMessage}
        providerProof={detailQuery.data?.providerProof ?? null}
        crmPostState={detailQuery.data?.crm ?? null}
        recurring={detailQuery.data?.recurring}
        correctionRequests={detailQuery.data?.correctionRequests}
        receiptDelivery={detailQuery.data?.receiptDelivery ?? null}
        onDecided={onActionSuccess}
        isLoading={Boolean(validDonationId && detailQuery.isPending)}
        isOpen={Boolean(donationId)}
        onClose={onClose}
        onRetry={validDonationId ? () => void detailQuery.refetch() : undefined}
        onApproveStagedGift={(stagedGiftId, contributionId) =>
          approveMutation.mutate({ contributionId, stagedGiftId })
        }
        onRetryStagedGift={(stagedGiftId, contributionId) =>
          retryMutation.mutate({ contributionId, stagedGiftId })
        }
        onRetryCrmPost={(scope, stagedGiftId, contributionId) =>
          retryMutation.mutate({ contributionId, stagedGiftId, scope })
        }
        onSendReceipt={(stagedGiftId, contributionId) =>
          receiptMutation.mutate({ contributionId, stagedGiftId })
        }
        onRefund={(contributionId) => setRefundDonationId(contributionId)}
        isActionPending={
          approveMutation.isPending ||
          retryMutation.isPending ||
          receiptMutation.isPending
        }
      />

      <ContributionOperationShell
        open={refundShellOpen}
        onClose={() => setRefundDonationId(null)}
        operation={OPERATION_DEFINITIONS.refund}
        donationId={refundDonationId}
        sourceSurface={sourceSurface}
        onRowRefresh={onActionSuccess}
      />
    </>
  );
}
