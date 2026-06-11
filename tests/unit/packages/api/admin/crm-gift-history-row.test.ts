import { describe, expect, it } from "vitest";

import { buildSharedContributionRowFields } from "../../../../../packages/api/src/admin/contribution-shared/row-contract";
import { buildContributionGridRow } from "../../../../../packages/api/src/admin/contributions/model";
import { buildCrmGiftHistoryRow } from "../../../../../packages/api/src/admin/crm/detail/gift-history";

const donation = {
  id: "donation-1",
  donor_id: "donor-1",
  missionary_id: "missionary-1",
  fund_id: "fund-1",
  amount: 25_000,
  currency: "usd",
  status: "completed",
  gift_date: "2026-04-08",
  refund_amount: 0,
  refunded_at: null,
  created_at: "2026-04-08T10:00:00.000Z",
  updated_at: "2026-04-08T12:00:00.000Z",
};

const donor = {
  id: "donor-1",
  name: "Alice Johnson",
  email: "alice@example.com",
};

const fund = { id: "fund-1", name: "Clean Water Initiative" };
const missionary = { id: "missionary-1", display_name: "John Martinez" };

const stagedGift = {
  id: "staged-1",
  status: "posted",
  receipt_status: "sent",
  crm_post_status: "posted",
};

describe("admin/crm/detail/gift-history", () => {
  it("adapter-maps CRM gift history rows onto the shared row contract", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: { ...stagedGift, twenty_record_id: "twenty-1" },
      corrections: [{ status: "applied" }],
    });

    expect(row.shared).toEqual(
      buildSharedContributionRowFields({
        donation,
        donor,
        profile: null,
        fund,
        missionary,
        stagedGift,
        corrections: [{ status: "applied" }],
      }),
    );

    expect(row.donationId).toBe("donation-1");
    expect(row.id).toBe("donation-1");
    expect(row.amountCents).toBe(row.shared.amountCents);
    expect(row.currencyCode).toBe(row.shared.currencyCode);
    expect(row.giftDate).toBe(row.shared.giftDate);
    expect(row.paymentStatus).toBe(row.shared.paymentStatus);
    expect(row.receiptStatus).toBe(row.shared.receiptStatus);
    expect(row.crmPostStatus).toBe(row.shared.crmPostStatus);
    expect(row.fundName).toBe(row.shared.designationSummary.fundName);
    expect(row.missionaryName).toBe(
      row.shared.designationSummary.missionaryName,
    );

    expect(row.stagedGiftId).toBe("staged-1");
    expect(row.twentyRecordId).toBe("twenty-1");
    expect(row.canResendReceipt).toBe(true);
  });

  it("uses gift_date and General Fund fallback like the Hub does", () => {
    const row = buildCrmGiftHistoryRow({
      donation: { ...donation, fund_id: null, gift_date: null },
      donor,
      fund: null,
      missionary: null,
      stagedGift: null,
      corrections: [],
    });

    expect(row.giftDate).toBe(donation.created_at);
    expect(row.fundName).toBe("General Fund");
    expect(row.canResendReceipt).toBe(false);
    expect(row.stagedGiftId).toBeNull();
  });

  it("derives split-gift summaries from the same designation set as the Hub", () => {
    const designationSet = {
      lines: [
        {
          id: "alloc-1",
          amountCents: 10_000,
          currencyCode: "USD",
          fundId: "fund-1",
          fundName: "Clean Water Initiative",
          fundType: "project" as const,
          missionaryId: null,
          missionaryName: null,
          memo: null,
          restriction: null,
          correctionState: "none" as const,
        },
        {
          id: "alloc-2",
          amountCents: 15_000,
          currencyCode: "USD",
          fundId: "fund-2",
          fundName: "Martinez Family Support",
          fundType: "missionary" as const,
          missionaryId: "missionary-1",
          missionaryName: "John Martinez",
          memo: null,
          restriction: null,
          correctionState: "none" as const,
        },
      ],
      totalAmountCents: 25_000,
      reconcilesToGiftAmount: true,
      issues: [],
    };

    const crmRow = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: { ...stagedGift, twenty_record_id: null },
      designationSet,
    });

    const hubRow = buildContributionGridRow({
      donation: {
        ...donation,
        donation_type: "one_time",
        payment_method: "card",
        is_recurring: false,
        recurring_interval: null,
        notes: null,
        stripe_payment_intent_id: "pi_1",
        campaign_id: null,
        pledge_id: null,
        processed_at: null,
        completed_at: null,
        failed_at: null,
        error_code: null,
        error_message: null,
        stripe_charge_id: null,
        source: "online",
      },
      donor: {
        ...donor,
        phone: null,
        type: null,
        location: null,
        organization: null,
        notes: null,
      },
      profile: null,
      fund,
      missionary,
      stagedGift: {
        ...stagedGift,
        review_reason: null,
        receipt_send_log_id: null,
      },
      designationSet,
    });

    expect(crmRow.shared.designationSummary).toEqual({
      fundId: null,
      fundName: "2 designations",
      missionaryId: null,
      missionaryName: null,
      lineCount: 2,
    });
    expect(crmRow.shared.designationSummary).toEqual(
      hubRow.shared.designationSummary,
    );
  });

  it("produces the identical shared fields the Contributions Hub row produces", () => {
    const corrections = [{ status: "pending" }];
    const crmRow = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: { ...stagedGift, twenty_record_id: null },
      corrections,
    });

    const hubRow = buildContributionGridRow({
      donation: {
        ...donation,
        donation_type: "one_time",
        payment_method: "card",
        is_recurring: false,
        recurring_interval: null,
        notes: null,
        stripe_payment_intent_id: "pi_1",
        campaign_id: null,
        pledge_id: null,
        processed_at: null,
        completed_at: null,
        failed_at: null,
        error_code: null,
        error_message: null,
        stripe_charge_id: null,
        source: "online",
      },
      donor: {
        ...donor,
        phone: null,
        type: null,
        location: null,
        organization: null,
        notes: null,
      },
      profile: null,
      fund,
      missionary,
      stagedGift: {
        ...stagedGift,
        review_reason: null,
        receipt_send_log_id: null,
      },
      corrections,
    });

    expect(crmRow.shared).toEqual(hubRow.shared);
  });
});
