import { describe, expect, it } from "vitest";

import { buildContributionActionAvailability } from "../../../../../packages/api/src/admin/contribution-operations/action-availability";
import { buildContributionDetail } from "../../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { projectContributionDetailForViewer } from "../../../../../packages/api/src/admin/contribution-operations/viewer-projection";
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

const FULL_CAPABILITIES = [
  "contributions.view_detail",
  "contributions.request_corrections",
  "contributions.apply_corrections",
  "contributions.manage_receipts",
  "contributions.retry_crm_post",
  "contributions.run_refunds",
  "contributions.use_provider_actions",
];

/**
 * Contribution detail built from the same gift the CRM row uses, so parity
 * assertions compare real derivations on both sides (#270).
 */
function buildDetailForParity(provider: {
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
}) {
  return buildContributionDetail({
    donation: {
      id: donation.id,
      tenantId: "tenant-1",
      donorId: donation.donor_id,
      missionaryId: donation.missionary_id,
      fundId: donation.fund_id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      donationType: "one_time",
      paymentMethod: "card",
      isRecurring: false,
      recurringInterval: null,
      notes: null,
      stripePaymentIntentId: provider.stripePaymentIntentId,
      stripeChargeId: provider.stripeChargeId,
      giftDate: donation.gift_date,
      campaignId: null,
      pledgeId: null,
      processedAt: null,
      completedAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      refundedAt: donation.refunded_at,
      refundAmount: donation.refund_amount,
      source: "online",
      createdAt: donation.created_at,
      updatedAt: donation.updated_at,
    },
    donor: {
      id: donor.id,
      profileId: null,
      name: donor.name,
      email: donor.email,
      phone: null,
      location: null,
      organization: null,
    },
    fund,
    missionary: { id: missionary.id, name: missionary.display_name },
    stagedGift: {
      id: stagedGift.id,
      status: stagedGift.status,
      receiptStatus: stagedGift.receipt_status,
      crmPostStatus: stagedGift.crm_post_status,
      reviewReason: null,
      twentyRecordId: null,
    },
  });
}

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
      crm_post_status: "failed",
      twenty_record_id: null,
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

    expect(row.inlineActions.nextBestActionType).toBe("retry_staged_gift");
    expect(
      row.inlineActions.entries.map((entry) => entry.actionType),
    ).toContain("stripe_replay");
  });

  it("keeps refund availability identical inline and in detail for payment-intent-only gifts (#270)", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: { ...stagedGift, twenty_record_id: null },
      provider: { stripePaymentIntentId: "pi_only", stripeChargeId: null },
      viewerCapabilities: FULL_CAPABILITIES,
    });
    const detail = buildDetailForParity({
      stripePaymentIntentId: "pi_only",
      stripeChargeId: null,
    });

    const detailRefund = detail.actionAvailability.find(
      (entry) => entry.actionType === "refund",
    );
    const inlineRefund = row.inlineActions.entries.find(
      (entry) => entry.actionType === "refund",
    );

    // The detail read model treats a payment intent as refundable provider
    // proof; the CRM adapter must produce the identical entry.
    expect(inlineRefund).toEqual(detailRefund);
    expect(inlineRefund).toMatchObject({
      available: true,
      blockedReason: null,
    });
  });

  it("keeps provider replay identical inline and in detail for charge-only gifts (#270)", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: { ...stagedGift, twenty_record_id: null },
      provider: { stripePaymentIntentId: null, stripeChargeId: "ch_only" },
      viewerCapabilities: FULL_CAPABILITIES,
    });
    const projected = projectContributionDetailForViewer(
      buildDetailForParity({
        stripePaymentIntentId: null,
        stripeChargeId: "ch_only",
      }),
      FULL_CAPABILITIES,
    );

    const detailReplay = projected.actionAvailability.find(
      (entry) => entry.actionType === "stripe_replay",
    );
    const inlineReplay = row.inlineActions.entries.find(
      (entry) => entry.actionType === "stripe_replay",
    );

    expect(inlineReplay).toEqual(detailReplay);
    expect(inlineReplay).toMatchObject({
      available: true,
      blockedReason: null,
    });
  });

  it("hides inline operations the viewer has no capability for", () => {
    const row = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary,
      stagedGift: { ...stagedGift, twenty_record_id: null },
      provider: { stripePaymentIntentId: "pi_1", stripeChargeId: "ch_1" },
      viewerCapabilities: [
        "contributions.view_detail",
        "contributions.request_corrections",
      ],
    });

    expect(
      row.inlineActions.entries.map((entry) => entry.actionType).sort(),
    ).toEqual([
      "amount_correction",
      "fund_correction",
      "refund",
      "stripe_replay",
    ]);
    expect(row.inlineActions.nextBestActionType).toBeNull();
  });
});
