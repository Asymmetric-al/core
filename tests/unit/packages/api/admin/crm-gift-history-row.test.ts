import { describe, expect, it } from "vitest";

import { buildContributionActionAvailability } from "../../../../../packages/api/src/admin/contribution-operations/action-availability";
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
      viewerCapabilities: ["contributions.use_provider_actions"],
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

  it("exposes inline actions with detail-identical blocked reasons (#270)", () => {
    const failedStagedGift = {
      ...stagedGift,
      status: "failed",
      crm_post_status: "failed",
      twenty_record_id: "twenty-history-1",
    };
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: failedStagedGift,
      provider: { stripePaymentIntentId: "pi_1", stripeChargeId: "ch_1" },
      viewerCapabilities: [
        "contributions.view_detail",
        "contributions.request_corrections",
        "contributions.apply_corrections",
        "contributions.manage_receipts",
        "contributions.retry_crm_post",
        "contributions.run_refunds",
        "contributions.use_provider_actions",
      ],
    });

    // The detail surface derives availability from the same shared inputs;
    // every overlapping entry must match exactly.
    const detailAvailability = buildContributionActionAvailability({
      stagedGift: {
        id: failedStagedGift.id,
        status: failedStagedGift.status,
        receiptStatus: failedStagedGift.receipt_status,
        crmPostStatus: failedStagedGift.crm_post_status,
      },
      paymentStatus: donation.status,
      refund: {
        amountCents: row.shared.amountCents,
        refundedAmountCents: row.shared.refundedAmountCents,
        hasProviderCharge: true,
      },
    });
    for (const detailEntry of detailAvailability) {
      expect(
        row.inlineActions.entries.find(
          (entry) => entry.actionType === detailEntry.actionType,
        ),
      ).toEqual(detailEntry);
    }

    expect(row.inlineActions.nextBestActionType).toBe("resend_receipt");
    const postingEntries = row.inlineActions.entries.filter((entry) =>
      ["approve_staged_gift", "retry_staged_gift"].includes(entry.actionType),
    );
    expect(postingEntries).toHaveLength(2);
    for (const entry of postingEntries) {
      expect(entry.available).toBe(false);
      expect(entry.blockedReason).toMatch(
        /no longer an active product workflow/i,
      );
      expect(entry.nextStep).toMatch(/historical evidence.*Asym/i);
    }
    expect(
      row.inlineActions.entries.map((entry) => entry.actionType),
    ).toContain("stripe_replay");
    expect(row.twentyRecordId).toBe(failedStagedGift.twenty_record_id);
  });

  it("keeps PaymentIntent-only refund proof aligned for refund-capable requesters", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift,
      provider: { stripePaymentIntentId: "pi_1", stripeChargeId: null },
      viewerCapabilities: [
        "contributions.run_refunds",
        "contributions.request_corrections",
      ],
    });

    expect(
      row.inlineActions.entries.find((entry) => entry.actionType === "refund"),
    ).toMatchObject({
      actionType: "refund",
      available: false,
      blockedReason: "Refund processing is not available yet.",
    });
  });

  it("keeps provider replay available for charge-only gifts like contribution detail", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift,
      provider: { stripePaymentIntentId: null, stripeChargeId: "ch_1" },
      viewerCapabilities: [
        "contributions.use_provider_actions",
        "contributions.request_corrections",
      ],
    });

    expect(
      row.inlineActions.entries.find(
        (entry) => entry.actionType === "stripe_replay",
      ),
    ).toMatchObject({
      actionType: "stripe_replay",
      available: true,
      blockedReason: null,
    });
  });

  it("omits approval-gated replay when provider staff cannot request corrections", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift,
      provider: { stripePaymentIntentId: "pi_1", stripeChargeId: "ch_1" },
      viewerCapabilities: ["contributions.use_provider_actions"],
    });

    expect(
      row.inlineActions.entries.find(
        (entry) => entry.actionType === "stripe_replay",
      ),
    ).toBeUndefined();
  });

  it("keeps no-staged-gift workflow actions visible with blocked reasons (#258)", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: null,
      provider: { stripePaymentIntentId: "pi_1", stripeChargeId: "ch_1" },
      viewerCapabilities: [
        "contributions.view_detail",
        "contributions.request_corrections",
        "contributions.apply_corrections",
        "contributions.manage_receipts",
        "contributions.retry_crm_post",
        "contributions.run_refunds",
        "contributions.use_provider_actions",
      ],
    });

    // Workflow actions stay visible with reasons instead of disappearing,
    // and never call the donation itself invalid.
    const postingEntries = row.inlineActions.entries.filter((entry) =>
      ["approve_staged_gift", "retry_staged_gift"].includes(entry.actionType),
    );
    expect(postingEntries).toHaveLength(2);
    for (const entry of postingEntries) {
      expect(entry.available).toBe(false);
      expect(entry.blockedReason).toMatch(
        /no longer an active product workflow/i,
      );
      expect(entry.nextStep).toMatch(/historical evidence.*Asym/i);
      expect(entry.blockedReason).not.toMatch(/invalid|missing donation/i);
    }

    const receiptEntry = row.inlineActions.entries.find(
      (entry) => entry.actionType === "resend_receipt",
    );
    expect(receiptEntry).toMatchObject({
      available: false,
      blockedReason: expect.stringMatching(/no staged gift/i),
      nextStep: expect.stringMatching(/valid/i),
    });

    // Refund does not require a staged gift, but the shared route currently
    // blocks it until the provider-safe finance workflow is wired (#700).
    const refundEntry = row.inlineActions.entries.find(
      (entry) => entry.actionType === "refund",
    );
    expect(refundEntry).toMatchObject({
      available: false,
      blockedReason: "Refund processing is not available yet.",
    });
  });

  it("hides inline operations the viewer has no capability for", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: { ...stagedGift, twenty_record_id: "twenty-hidden" },
      provider: { stripePaymentIntentId: "pi_1", stripeChargeId: "ch_1" },
      viewerCapabilities: [
        "contributions.view_detail",
        "contributions.request_corrections",
      ],
    });

    expect(
      row.inlineActions.entries.map((entry) => entry.actionType).sort(),
    ).toEqual(["amount_correction", "fund_correction"]);
    expect(row.inlineActions.nextBestActionType).toBeNull();
    expect(row.twentyRecordId).toBeNull();
  });
});
