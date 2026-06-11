import { describe, expect, it } from "vitest";

import {
  buildSharedContributionRowFields,
  formatSharedContributionAmount,
  SHARED_CRM_POST_STATUS_LABELS,
  SHARED_CORRECTION_STATE_LABELS,
  SHARED_PAYMENT_STATUS_LABELS,
  SHARED_RECEIPT_STATUS_LABELS,
  SHARED_REFUND_STATE_LABELS,
} from "../../../../../packages/api/src/admin/contribution-shared/row-contract";

function makeDonation(
  overrides: Partial<{
    id: string;
    donor_id: string | null;
    missionary_id: string | null;
    fund_id: string | null;
    amount: number;
    currency: string;
    status: string | null;
    gift_date: string | null;
    refund_amount: number;
    refunded_at: string | null;
    created_at: string;
    updated_at: string;
  }> = {},
) {
  return {
    id: "donation-1",
    donor_id: "donor-1",
    missionary_id: null,
    fund_id: "fund-1",
    amount: 25_000,
    currency: "usd",
    status: "completed",
    gift_date: "2026-04-08",
    refund_amount: 0,
    refunded_at: null,
    created_at: "2026-04-08T10:00:00.000Z",
    updated_at: "2026-04-08T12:00:00.000Z",
    ...overrides,
  };
}

describe("admin/contribution-shared/row-contract", () => {
  it("derives the shared overlapping row fields from raw contribution data", () => {
    const shared = buildSharedContributionRowFields({
      donation: makeDonation(),
      donor: {
        id: "donor-1",
        name: "Alice Johnson",
        email: "alice@example.com",
      },
      profile: null,
      fund: { id: "fund-1", name: "Clean Water Initiative" },
      missionary: { id: "missionary-1", display_name: "John Martinez" },
      stagedGift: {
        id: "staged-1",
        status: "posted",
        receipt_status: "sent",
        crm_post_status: "posted",
      },
    });

    expect(shared).toEqual({
      donationId: "donation-1",
      amountCents: 25_000,
      currencyCode: "USD",
      giftDate: "2026-04-08",
      donorId: "donor-1",
      donorName: "Alice Johnson",
      designationSummary: {
        fundId: "fund-1",
        fundName: "Clean Water Initiative",
        missionaryId: "missionary-1",
        missionaryName: "John Martinez",
        lineCount: 1,
      },
      paymentStatus: "completed",
      receiptStatus: "sent",
      crmPostStatus: "posted",
      refundState: "none",
      refundedAmountCents: 0,
      correctionState: "none",
    });
  });

  it("falls back to General Fund, created_at gift date, and Anonymous donor", () => {
    const shared = buildSharedContributionRowFields({
      donation: makeDonation({
        donor_id: null,
        fund_id: null,
        gift_date: null,
      }),
      donor: null,
      profile: null,
      fund: null,
      missionary: null,
      stagedGift: null,
    });

    expect(shared.designationSummary.fundName).toBe("General Fund");
    expect(shared.designationSummary.fundId).toBeNull();
    expect(shared.giftDate).toBe("2026-04-08T10:00:00.000Z");
    expect(shared.donorName).toBe("Anonymous");
    expect(shared.receiptStatus).toBe("pending");
    expect(shared.crmPostStatus).toBeNull();
  });

  it("derives partial and full refund states from refund amounts", () => {
    const base = {
      donor: null,
      profile: null,
      fund: null,
      missionary: null,
      stagedGift: null,
    };

    const partial = buildSharedContributionRowFields({
      ...base,
      donation: makeDonation({ refund_amount: 10_000 }),
    });
    expect(partial.refundState).toBe("partial_refund");
    expect(partial.refundedAmountCents).toBe(10_000);

    const full = buildSharedContributionRowFields({
      ...base,
      donation: makeDonation({ refund_amount: 25_000, status: "refunded" }),
    });
    expect(full.refundState).toBe("refunded");
    expect(full.paymentStatus).toBe("refunded");

    const fullyRefundedStaleStatus = buildSharedContributionRowFields({
      ...base,
      donation: makeDonation({ refund_amount: 25_000, status: "completed" }),
    });
    expect(fullyRefundedStaleStatus.refundState).toBe("refunded");
    expect(fullyRefundedStaleStatus.paymentStatus).toBe("refunded");
  });

  it("derives correction state from correction record statuses", () => {
    const base = {
      donation: makeDonation(),
      donor: null,
      profile: null,
      fund: null,
      missionary: null,
      stagedGift: null,
    };

    expect(
      buildSharedContributionRowFields({
        ...base,
        corrections: [{ status: "applied" }, { status: "pending" }],
      }).correctionState,
    ).toBe("pending");

    expect(
      buildSharedContributionRowFields({
        ...base,
        corrections: [{ status: "applied" }, { status: "voided" }],
      }).correctionState,
    ).toBe("applied");

    expect(
      buildSharedContributionRowFields({
        ...base,
        corrections: [{ status: "failed" }],
      }).correctionState,
    ).toBe("none");
  });

  it("exposes one shared status vocabulary and amount formatting", () => {
    expect(SHARED_PAYMENT_STATUS_LABELS).toEqual({
      completed: "Completed",
      pending: "Pending",
      failed: "Failed",
      refunded: "Refunded",
    });
    expect(SHARED_RECEIPT_STATUS_LABELS).toEqual({
      sent: "Sent",
      pending: "Pending",
      failed: "Failed",
      not_sent: "Not sent",
    });
    expect(SHARED_CRM_POST_STATUS_LABELS).toEqual({
      not_required: "Not required",
      queued: "Queued",
      posted: "Posted",
      failed: "Failed",
      blocked: "Blocked",
    });
    expect(SHARED_REFUND_STATE_LABELS).toEqual({
      none: "No refund",
      partial_refund: "Partially refunded",
      refunded: "Refunded",
    });
    expect(SHARED_CORRECTION_STATE_LABELS).toEqual({
      none: "No corrections",
      pending: "Correction pending",
      applied: "Correction applied",
    });

    expect(formatSharedContributionAmount(25_000, "USD")).toBe("$250.00");
    expect(formatSharedContributionAmount(1_234_56, "USD")).toBe("$1,234.56");
  });
});
