import {
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
  ADMIN_CRM_RECORDS_QUERY_KEY,
  MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY,
} from "@asym/database/hooks";

import { ADMIN_CONTRIBUTIONS_QUERY_KEY } from "./use-admin-contributions";

import type { Contribution } from "./types";
import type {
  ContributionDetail,
  CrmPostFailedScope,
} from "@asym/api/admin/contribution-operations";
import type { QueryClient } from "@tanstack/react-query";

export const ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY = [
  "admin",
  "contribution-detail",
] as const;

export function contributionDetailQueryKey(donationId: string) {
  return [...ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY, donationId] as const;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isContributionGiftParam(value: string | null): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}

/**
 * Invalidates every query that renders shared contribution fields so the
 * Contributions Hub, CRM donor gift history, and the open detail overlay
 * refresh from the same database truth after an operation (ADR-CD-032).
 */
export async function invalidateContributionOperationQueries(
  queryClient: QueryClient,
  options?: {
    /**
     * TanStack Query resolves `invalidateQueries` even when the triggered
     * refetches fail. Callers that surface a stale-data warning on refresh
     * failure (the operation shell) opt into rejection instead.
     */
    throwOnError?: boolean;
  },
) {
  const refetchOptions = { throwOnError: options?.throwOnError ?? false };
  await Promise.all([
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CONTRIBUTIONS_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: MISSION_CONTROL_NEEDS_ATTENTION_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CONTRIBUTION_DETAIL_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CRM_RECORD_DETAIL_QUERY_KEY },
      refetchOptions,
    ),
    queryClient.invalidateQueries(
      { queryKey: ADMIN_CRM_RECORDS_QUERY_KEY },
      refetchOptions,
    ),
  ]);
}

/**
 * Scoped CRM retry payload (ADR-CD-012). A designation scope targets one
 * failed line; a parent scope (or no scope, for the legacy retry button)
 * retries the parent gift record.
 */
export function crmRetryPayloadFromScope(
  scope: CrmPostFailedScope | undefined,
): Record<string, unknown> {
  if (!scope) {
    return {};
  }
  if (scope.scope === "designation" && scope.allocationId) {
    return { scope: "designation", allocationId: scope.allocationId };
  }
  return { scope: "parent" };
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

function sourceFromDetail(detail: ContributionDetail): Contribution["source"] {
  switch (detail.gift.source) {
    case "mobile":
    case "Mobile":
      return "Mobile";
    case "in_person":
    case "in-person":
    case "In-person":
      return "In-person";
    case "mail":
    case "Mail":
      return "Mail";
    case "phone":
    case "Phone":
      return "Phone";
    case "import":
    case "Import":
      return "Import";
    default:
      return "Online";
  }
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
    source: sourceFromDetail(detail),
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
    isAnonymous: shared.donorId == null,
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
