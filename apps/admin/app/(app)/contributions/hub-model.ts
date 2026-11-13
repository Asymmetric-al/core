import { getContributionReceiptSendBlock } from "@asym/api/admin/contribution-operations/catalog";
import {
  formatSharedContributionAmount,
  isSharedReceiptSuppressed,
} from "@asym/api/admin/contribution-shared";

import type { Contribution } from "./types";

/**
 * Pure read-model helpers for the Contributions Hub: donor labels, the
 * search predicate and the summary totals. Money stays in integer cents and
 * every amount is formatted through `formatSharedContributionAmount`.
 */

/**
 * Safety ceiling for the hub's client-side table. The hub filters, sorts and
 * totals in the browser, so it loads every page through the server cursor;
 * past this many gifts it stops and labels the totals as covering the most
 * recent gifts only.
 */
export const ADMIN_CONTRIBUTIONS_LOAD_CEILING = 5000;

/**
 * True when the loaded list reached the ceiling, so totals and filters cover
 * only the most recent gifts rather than every gift on record.
 */
export function isContributionLoadCapped(rowCount: number): boolean {
  return rowCount >= ADMIN_CONTRIBUTIONS_LOAD_CEILING;
}

/** Display name for a gift's donor; anonymous gifts never show a name. */
export function contributionDonorLabel(contribution: Contribution): string {
  if (contribution.isAnonymous) {
    return "Anonymous";
  }
  return contribution.donorName || contribution.donorEmail || "Unknown donor";
}

/**
 * Secondary donor line. Anonymous gifts withhold contact details on the hub
 * exactly as the detail sheet does.
 */
export function contributionDonorDetail(contribution: Contribution): string {
  if (contribution.isAnonymous) {
    return "Donor details hidden";
  }
  return (
    contribution.organizationName ||
    contribution.donorEmail ||
    contribution.donorType ||
    "No donor details"
  );
}

function searchableValues(contribution: Contribution): Array<string | null> {
  const designation = contribution.shared.designationSummary;
  const donorValues = contribution.isAnonymous
    ? ["Anonymous"]
    : [
        contribution.donorName,
        contribution.donorEmail,
        contribution.organizationName,
      ];
  return [
    ...donorValues,
    designation.fundName,
    designation.missionaryName,
    contribution.transactionId,
  ];
}

/**
 * Hub search: donor name, email and organization, fund, recipient and
 * transaction id, plus the whole gift id (the last part of the link the row
 * menu's "Copy link" copies). The gift id only matches in
 * full: its hex fragments would otherwise match ordinary name searches.
 * Anonymous gifts only match "Anonymous" so search cannot reveal who gave
 * them.
 */
export function matchesContributionSearch(
  contribution: Contribution,
  query: unknown,
): boolean {
  const needle = typeof query === "string" ? query.trim().toLowerCase() : "";
  if (!needle) {
    return true;
  }
  if (contribution.id.toLowerCase() === needle) {
    return true;
  }
  return searchableValues(contribution).some((value) =>
    value ? value.toLowerCase().includes(needle) : false,
  );
}

export interface CurrencyAmount {
  currencyCode: string;
  cents: number;
}

export interface ContributionHubSummary {
  totalCount: number;
  /**
   * Money received and kept, per currency: completed gifts net of any
   * refund. A fully refunded gift adds nothing.
   */
  received: CurrencyAmount[];
  /**
   * Completed gifts by the shared payment status, the same meaning as the
   * Status filter and badge (a fully refunded gift is "Refunded").
   */
  receivedCount: number;
  /** Refunded money, per currency (full and partial refunds). */
  refunded: CurrencyAmount[];
  refundedCount: number;
  /** Pending and processing gifts, per currency. */
  pending: CurrencyAmount[];
  pendingCount: number;
  /** Average completed gift, per currency (rounded to whole cents). */
  average: CurrencyAmount[];
  recurringCount: number;
}

function addCents(
  totals: Map<string, { cents: number; count: number }>,
  currencyCode: string,
  cents: number,
) {
  const current = totals.get(currencyCode) ?? { cents: 0, count: 0 };
  totals.set(currencyCode, {
    cents: current.cents + cents,
    count: current.count + 1,
  });
}

function toAmounts(
  totals: Map<string, { cents: number; count: number }>,
): CurrencyAmount[] {
  return [...totals.entries()].map(([currencyCode, total]) => ({
    currencyCode,
    cents: total.cents,
  }));
}

/**
 * Summary totals for the loaded gifts, kept per currency so gifts in
 * different currencies are never added together. Settled gifts (grid status
 * completed) count as received net of refunds; completed counts use the
 * shared payment status, as the Status filter does (issue #274), so a fully
 * refunded gift is counted as refunded, not completed. Pending and
 * processing gifts are pending.
 */
export function summarizeContributions(
  contributions: readonly Contribution[],
): ContributionHubSummary {
  const received = new Map<string, { cents: number; count: number }>();
  const refunded = new Map<string, { cents: number; count: number }>();
  const pending = new Map<string, { cents: number; count: number }>();
  let recurringCount = 0;

  for (const contribution of contributions) {
    const currencyCode = (
      contribution.shared.currencyCode || "USD"
    ).toUpperCase();
    const cents = contribution.shared.amountCents;
    const refundedCents = Math.max(0, contribution.shared.refundedAmountCents);
    if (refundedCents > 0) {
      // Recorded refunds retain the original charge basis after an amount correction.
      addCents(refunded, currencyCode, refundedCents);
    }
    if (contribution.status === "completed") {
      if (contribution.shared.paymentStatus !== "refunded") {
        addCents(received, currencyCode, Math.max(0, cents - refundedCents));
      }
    } else if (
      contribution.status === "pending" ||
      contribution.status === "processing"
    ) {
      addCents(pending, currencyCode, cents);
    }
    if (contribution.type === "Recurring") {
      recurringCount += 1;
    }
  }

  const count = (totals: typeof received) =>
    [...totals.values()].reduce((sum, total) => sum + total.count, 0);

  return {
    totalCount: contributions.length,
    received: toAmounts(received),
    receivedCount: count(received),
    refunded: toAmounts(refunded),
    refundedCount: count(refunded),
    pending: toAmounts(pending),
    pendingCount: count(pending),
    average: [...received.entries()].map(([currencyCode, total]) => ({
      currencyCode,
      cents: Math.round(total.cents / total.count),
    })),
    recurringCount,
  };
}

/**
 * The status a gift's badge shows: its grid status, except that a fully
 * refunded gift (whose `donations.status` stays "completed") reads Refunded,
 * the same shared payment status the Status filter matches (issue #274).
 */
export function effectiveContributionStatus(
  contribution: Contribution,
): Contribution["status"] {
  return contribution.shared.paymentStatus === "refunded"
    ? "refunded"
    : contribution.status;
}

/** "$1,200.00", or "$1,200.00 + €50.00" when gifts span currencies. */
export function formatCurrencyAmounts(
  amounts: readonly CurrencyAmount[],
  fallbackCurrencyCode = "USD",
): string {
  if (amounts.length === 0) {
    return formatSharedContributionAmount(0, fallbackCurrencyCode);
  }
  return amounts
    .map((amount) =>
      formatSharedContributionAmount(amount.cents, amount.currencyCode),
    )
    .join(" + ");
}

const NO_STAGED_GIFT_RECEIPT_REASON =
  "No processed gift record to send a receipt from yet.";

export interface BulkReceiptPlan {
  /**
   * Gifts the server would receipt that have no delivered receipt yet
   * (not sent, pending or failed). The batch always sends these.
   */
  ready: Contribution[];
  /**
   * Gifts the server would receipt again: a receipt already reached the
   * donor, so sending gives them a second copy. Sent only when the admin
   * opts in, matching the single-gift "Resend receipt?" confirmation.
   */
  alreadySent: Contribution[];
  /** Why the other gifts are skipped, most common reason first. */
  skipped: Array<{ reason: string; count: number }>;
  skippedCount: number;
}

/**
 * Splits a bulk receipt selection with the server's `resend_receipt` rule
 * (`getContributionReceiptSendBlock`), so neither "Ready to send" nor
 * "Already sent" ever counts a gift the server would reject. The grid status
 * mirrors the donation status the server checks. The grid's receipt status
 * folds "suppressed" into "not_sent" for display, so the plan reads the
 * row's separate suppression flag and skips those gifts with the server's
 * own reason. Gifts whose receipt was already sent are kept apart so the
 * dialog can warn about a second copy.
 */
export function planBulkReceipt(
  rows: readonly Contribution[],
): BulkReceiptPlan {
  const ready: Contribution[] = [];
  const alreadySent: Contribution[] = [];
  const reasonCounts = new Map<string, number>();
  for (const row of rows) {
    const reason = row.stagedGiftId
      ? (getContributionReceiptSendBlock({
          receiptStatus: isSharedReceiptSuppressed(row.shared)
            ? "suppressed"
            : row.receiptStatus,
          paymentStatus: row.status,
        })?.blockedReason ?? null)
      : NO_STAGED_GIFT_RECEIPT_REASON;
    if (reason !== null) {
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
    } else if (row.receiptStatus === "sent") {
      alreadySent.push(row);
    } else {
      ready.push(row);
    }
  }
  const skipped = [...reasonCounts]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
  return {
    ready,
    alreadySent,
    skipped,
    skippedCount: rows.length - ready.length - alreadySent.length,
  };
}

/**
 * The gifts a bulk receipt batch sends: every first send, plus the
 * already-sent gifts only when the admin chose to send another copy.
 */
export function bulkReceiptRowsToSend(
  plan: BulkReceiptPlan,
  includeResends: boolean,
): Contribution[] {
  return includeResends ? [...plan.ready, ...plan.alreadySent] : plan.ready;
}
