import { describe, expect, it } from "vitest";

import { makeMobileContribution } from "./contribution-mobile-fixture";
// eslint-disable-next-line no-restricted-imports -- AL-1894: App read-model regression test at its module boundary.
import {
  contributionDonorDetail,
  contributionDonorLabel,
  effectiveContributionStatus,
  formatCurrencyAmounts,
  bulkReceiptRowsToSend,
  matchesContributionSearch,
  planBulkReceipt,
  summarizeContributions,
} from "../../../../../apps/admin/app/(app)/contributions/hub-model";

import type { ContributionGridRow as Contribution } from "@asym/api/admin/contributions/types";

describe("matchesContributionSearch", () => {
  const gift = makeMobileContribution({
    donorName: "Priscilla Adeyemi",
    donorEmail: "priscilla@example.org",
    organizationName: "Okafor Family Trust",
    transactionId: "pi_3Nx81",
  });

  it("matches the donor email the placeholder promises, not only the name", () => {
    expect(matchesContributionSearch(gift, "priscilla@example")).toBe(true);
    expect(matchesContributionSearch(gift, "adeyemi")).toBe(true);
  });

  it("matches organization, fund and transaction id case-insensitively", () => {
    expect(matchesContributionSearch(gift, "okafor family")).toBe(true);
    expect(matchesContributionSearch(gift, "GENERAL fund")).toBe(true);
    expect(matchesContributionSearch(gift, "PI_3NX")).toBe(true);
  });

  it("finds a gift by the full gift id that Copy gift ID copies", () => {
    const noTransaction = makeMobileContribution({
      id: "8f3a2c1d-5b6e-4f70-9a8b-0c1d2e3f4a5b",
      transactionId: null,
    });
    expect(matchesContributionSearch(noTransaction, noTransaction.id)).toBe(
      true,
    );
    expect(
      matchesContributionSearch(
        noTransaction,
        ` ${noTransaction.id.toUpperCase()} `,
      ),
    ).toBe(true);
    // Hex fragments of the id must not match ordinary searches ("bead",
    // "fac", "2c1d"), so only the whole id finds the gift.
    expect(matchesContributionSearch(noTransaction, "2c1d")).toBe(false);
    expect(matchesContributionSearch(noTransaction, "8f3a2c1d")).toBe(false);
  });

  it("keeps every row for an empty query and drops rows that do not match", () => {
    expect(matchesContributionSearch(gift, "")).toBe(true);
    expect(matchesContributionSearch(gift, "   ")).toBe(true);
    expect(matchesContributionSearch(gift, undefined)).toBe(true);
    expect(matchesContributionSearch(gift, "zebra")).toBe(false);
  });

  it("never reveals an anonymous donor through search", () => {
    const anonymous = makeMobileContribution({
      donorName: "Hidden Person",
      donorEmail: "hidden@example.org",
      isAnonymous: true,
    });
    expect(matchesContributionSearch(anonymous, "hidden")).toBe(false);
    expect(matchesContributionSearch(anonymous, "anonymous")).toBe(true);
  });
});

describe("donor labels", () => {
  it("shows Anonymous and withholds contact details for anonymous gifts", () => {
    const anonymous = makeMobileContribution({ isAnonymous: true });
    expect(contributionDonorLabel(anonymous)).toBe("Anonymous");
    expect(contributionDonorDetail(anonymous)).toBe("Donor details hidden");
  });

  it("prefers organization, then email, then donor type", () => {
    expect(
      contributionDonorDetail(
        makeMobileContribution({ organizationName: "Peachtree Health" }),
      ),
    ).toBe("Peachtree Health");
    expect(contributionDonorDetail(makeMobileContribution())).toBe(
      "alpha@example.invalid",
    );
    expect(
      contributionDonorDetail(
        makeMobileContribution({ donorEmail: "", donorType: "Church" }),
      ),
    ).toBe("Church");
  });
});

describe("summarizeContributions", () => {
  it("totals integer cents from the shared amount by status and gift type", () => {
    const rows = [
      makeMobileContribution({ id: "a", status: "completed" }),
      makeMobileContribution({
        id: "b",
        status: "completed",
        type: "Recurring",
        shared: {
          ...makeMobileContribution().shared,
          amountCents: 2550,
        },
      }),
      makeMobileContribution({ id: "c", status: "pending" }),
      makeMobileContribution({ id: "d", status: "processing" }),
      makeMobileContribution({ id: "e", status: "failed" }),
    ];

    const summary = summarizeContributions(rows);

    expect(summary.totalCount).toBe(5);
    expect(summary.receivedCount).toBe(2);
    expect(summary.received).toEqual([{ currencyCode: "USD", cents: 12550 }]);
    expect(summary.pendingCount).toBe(2);
    expect(summary.pending).toEqual([{ currencyCode: "USD", cents: 20000 }]);
    // Math.round(12550 / 2) = 6275 cents.
    expect(summary.average).toEqual([{ currencyCode: "USD", cents: 6275 }]);
    expect(summary.recurringCount).toBe(1);
  });

  it("counts received money net of refunds, and completed gifts as the Status filter does", () => {
    const shared = makeMobileContribution().shared;
    const rows = [
      makeMobileContribution({ id: "kept", status: "completed" }),
      // Partly refunded: still completed, but only $70.00 stayed received.
      makeMobileContribution({
        id: "partial",
        status: "completed",
        shared: {
          ...shared,
          refundState: "partial",
          refundedAmountCents: 3000,
        },
      }),
      // Fully refunded: donations.status stayed "completed", but the shared
      // payment status (what the Status filter and badge use) is refunded.
      makeMobileContribution({
        id: "refunded",
        status: "completed",
        shared: {
          ...shared,
          paymentStatus: "refunded",
          refundState: "refunded",
          refundedAmountCents: 10000,
        },
      }),
    ];

    const summary = summarizeContributions(rows);

    expect(summary.received).toEqual([{ currencyCode: "USD", cents: 17000 }]);
    expect(summary.receivedCount).toBe(2);
    expect(summary.refunded).toEqual([{ currencyCode: "USD", cents: 13000 }]);
    expect(summary.refundedCount).toBe(2);
    // Math.round(17000 / 2) = 8500 cents per completed gift.
    expect(summary.average).toEqual([{ currencyCode: "USD", cents: 8500 }]);
  });

  it("preserves actual refunds when a correction lowers the effective gift amount", () => {
    const gift = makeMobileContribution({
      shared: {
        ...makeMobileContribution().shared,
        amountCents: 7500,
        refundedAmountCents: 8000,
        refundState: "partial",
      },
    });

    const summary = summarizeContributions([gift]);

    expect(summary.refunded).toEqual([{ currencyCode: "USD", cents: 8000 }]);
    expect(summary.refundedCount).toBe(1);
    expect(summary.received).toEqual([{ currencyCode: "USD", cents: 0 }]);
  });
  it("keeps each currency separate instead of adding euros to dollars", () => {
    const eur = makeMobileContribution({
      id: "eur",
      shared: {
        ...makeMobileContribution().shared,
        amountCents: 5000,
        currencyCode: "eur",
      },
    });
    const summary = summarizeContributions([
      makeMobileContribution({ id: "usd" }),
      eur,
    ]);

    expect(summary.received).toEqual([
      { currencyCode: "USD", cents: 10000 },
      { currencyCode: "EUR", cents: 5000 },
    ]);
    expect(formatCurrencyAmounts(summary.received)).toBe("$100.00 + €50.00");
  });

  it("formats an empty total as zero in the fallback currency", () => {
    expect(formatCurrencyAmounts([])).toBe("$0.00");
  });
});

describe("effectiveContributionStatus", () => {
  it("shows a fully refunded gift as refunded, as the Status filter matches it", () => {
    const shared = makeMobileContribution().shared;
    expect(
      effectiveContributionStatus(
        makeMobileContribution({
          status: "completed",
          shared: { ...shared, paymentStatus: "refunded" },
        }),
      ),
    ).toBe("refunded");
    // Partial refunds stay completed; other grid statuses are unchanged.
    expect(
      effectiveContributionStatus(
        makeMobileContribution({
          status: "completed",
          shared: { ...shared, refundState: "partial" },
        }),
      ),
    ).toBe("completed");
    expect(
      effectiveContributionStatus(
        makeMobileContribution({ status: "processing" }),
      ),
    ).toBe("processing");
  });
});

describe("planBulkReceipt", () => {
  it("sends only gifts the server would receipt and names why the rest are skipped", () => {
    const ready = makeMobileContribution({ id: "ready" });
    const pending = makeMobileContribution({
      id: "pending",
      status: "pending",
    });
    const processing = makeMobileContribution({
      id: "processing",
      status: "processing",
    });
    const noRecord = makeMobileContribution({
      id: "no-record",
      stagedGiftId: null,
    });

    const plan = planBulkReceipt([ready, pending, processing, noRecord]);

    expect(plan.ready.map((row) => row.id)).toEqual(["ready"]);
    expect(plan.skippedCount).toBe(3);
    expect(plan.skipped).toEqual([
      { reason: "The payment is not completed yet.", count: 2 },
      {
        reason: "No processed gift record to send a receipt from yet.",
        count: 1,
      },
    ]);
  });

  it("skips a suppressed receipt with the server's reason even though the grid shows Not sent", () => {
    const base = makeMobileContribution({ id: "suppressed" });
    const suppressed = makeMobileContribution({
      id: "suppressed",
      receiptStatus: "not_sent",
      shared: {
        ...base.shared,
        receiptStatus: "not_sent",
        receiptSuppressed: true,
      } as Contribution["shared"],
    });
    const notRequired = makeMobileContribution({
      id: "not-required",
      receiptStatus: "not_sent",
      shared: { ...base.shared, receiptStatus: "not_sent" },
    });

    const plan = planBulkReceipt([suppressed, notRequired]);

    expect(plan.ready.map((row) => row.id)).toEqual(["not-required"]);
    expect(plan.skipped).toEqual([
      { reason: "Receipts are suppressed for this gift.", count: 1 },
    ]);
  });

  it("keeps gifts whose receipt was already sent apart from first sends", () => {
    const fresh = makeMobileContribution({ id: "fresh" });
    const sent = makeMobileContribution({
      id: "sent",
      receiptStatus: "sent",
      receiptSent: true,
    });
    const failed = makeMobileContribution({
      id: "failed",
      receiptStatus: "failed",
    });
    const sentButPending = makeMobileContribution({
      id: "sent-pending",
      receiptStatus: "sent",
      receiptSent: true,
      status: "pending",
    });

    const plan = planBulkReceipt([fresh, sent, failed, sentButPending]);

    // A failed receipt never reached the donor, so it is a first send.
    expect(plan.ready.map((row) => row.id)).toEqual(["fresh", "failed"]);
    expect(plan.alreadySent.map((row) => row.id)).toEqual(["sent"]);
    // A server-blocked gift is skipped whatever its receipt status.
    expect(plan.skippedCount).toBe(1);
    expect(plan.skipped).toEqual([
      { reason: "The payment is not completed yet.", count: 1 },
    ]);
  });

  it("sends already-sent gifts again only when resends are included", () => {
    const fresh = makeMobileContribution({ id: "fresh" });
    const sent = makeMobileContribution({
      id: "sent",
      receiptStatus: "sent",
      receiptSent: true,
    });
    const plan = planBulkReceipt([fresh, sent]);

    expect(bulkReceiptRowsToSend(plan, false).map((row) => row.id)).toEqual([
      "fresh",
    ]);
    expect(bulkReceiptRowsToSend(plan, true).map((row) => row.id)).toEqual([
      "fresh",
      "sent",
    ]);
  });

  it("reports nothing skipped when every gift is ready", () => {
    const plan = planBulkReceipt([makeMobileContribution()]);
    expect(plan.ready).toHaveLength(1);
    expect(plan.alreadySent).toEqual([]);
    expect(plan.skipped).toEqual([]);
    expect(plan.skippedCount).toBe(0);
  });
});
