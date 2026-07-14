import { describe, expect, it } from "vitest";

import {
  filterSharedContributions,
  hasSharedContributionIssue,
  matchesSharedContributionFilter,
  SHARED_CONTRIBUTION_FILTERS,
  type SharedContributionFilter,
} from "../../../../../packages/api/src/admin/contribution-shared/filters";
import { buildContributionGridRow } from "../../../../../packages/api/src/admin/contributions/model";
import { buildCrmGiftHistoryRow } from "../../../../../packages/api/src/admin/crm/detail/gift-history";

import type { SharedContributionRowFields } from "../../../../../packages/database/types/contribution-shared";

function sharedFields(
  overrides: Partial<SharedContributionRowFields> = {},
): SharedContributionRowFields {
  return {
    donationId: "donation-1",
    amountCents: 25_000,
    currencyCode: "USD",
    giftDate: "2026-05-01",
    donorId: "donor-1",
    donorName: "Alice Johnson",
    designationSummary: {
      fundId: "fund-1",
      fundName: "Clean Water Initiative",
      missionaryId: null,
      missionaryName: null,
      lineCount: 1,
    },
    paymentStatus: "completed",
    receiptStatus: "sent",
    crmPostStatus: "posted",
    refundState: "none",
    refundedAmountCents: 0,
    correctionState: "none",
    recurringLinkState: "none",
    ...overrides,
  };
}

describe("admin/contribution-shared/filters", () => {
  it("registers one definition per shared filter id", () => {
    expect(SHARED_CONTRIBUTION_FILTERS.map((filter) => filter.id)).toEqual([
      "receipt_affected",
      "pending_correction",
      "approval_state",
      "refund_state",
      "crm_post_state",
      "designation_issue",
      "recurring_link",
      "payment_status",
    ]);
  });

  it("receipt affected means a sent receipt with correction activity", () => {
    const affected = {
      shared: sharedFields({
        receiptStatus: "sent",
        correctionState: "applied",
      }),
    };
    const cleanSent = {
      shared: sharedFields({ receiptStatus: "sent", correctionState: "none" }),
    };
    const neverSent = {
      shared: sharedFields({
        receiptStatus: "not_sent",
        correctionState: "applied",
      }),
    };

    const filter: SharedContributionFilter = { id: "receipt_affected" };
    expect(matchesSharedContributionFilter(affected, filter)).toBe(true);
    expect(matchesSharedContributionFilter(cleanSent, filter)).toBe(false);
    expect(matchesSharedContributionFilter(neverSent, filter)).toBe(false);
  });

  it("evaluates parameterized state filters against shared fields", () => {
    const row = {
      shared: sharedFields({
        paymentStatus: "refunded",
        refundState: "refunded",
        crmPostStatus: "failed",
        correctionState: "pending",
        recurringLinkState: "provider_only",
      }),
    };

    expect(
      matchesSharedContributionFilter(row, { id: "pending_correction" }),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(row, {
        id: "approval_state",
        value: "pending",
      }),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(row, {
        id: "refund_state",
        value: "refunded",
      }),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(row, {
        id: "crm_post_state",
        value: "failed",
      }),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(row, {
        id: "recurring_link",
        value: "provider_only",
      }),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(row, {
        id: "payment_status",
        value: "refunded",
      }),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(row, {
        id: "payment_status",
        value: "completed",
      }),
    ).toBe(false);
  });

  it("treats a null CRM post status as not_required", () => {
    const row = { shared: sharedFields({ crmPostStatus: null }) };

    expect(
      matchesSharedContributionFilter(row, {
        id: "crm_post_state",
        value: "not_required",
      }),
    ).toBe(true);
  });

  it("flags designation issues from designation set context", () => {
    const withIssue = {
      shared: sharedFields(),
      designationIssues: ["Lines total $240.00 but the gift is $250.00."],
    };
    const clean = { shared: sharedFields(), designationIssues: [] };

    expect(
      matchesSharedContributionFilter(withIssue, { id: "designation_issue" }),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(clean, { id: "designation_issue" }),
    ).toBe(false);
  });

  it("composes compact issue filters from the shared definitions", () => {
    expect(
      hasSharedContributionIssue({
        shared: sharedFields({ crmPostStatus: "failed" }),
      }),
    ).toBe(true);
    expect(
      hasSharedContributionIssue({
        shared: sharedFields({ recurringLinkState: "provider_only" }),
      }),
    ).toBe(true);
    expect(hasSharedContributionIssue({ shared: sharedFields() })).toBe(false);
  });

  it("returns the same gifts for Hub and CRM rows built from the same data", () => {
    const donation = {
      id: "donation-9",
      donor_id: "donor-1",
      missionary_id: null,
      fund_id: "fund-1",
      amount: 25_000,
      currency: "usd",
      status: "completed",
      gift_date: "2026-05-01",
      refund_amount: 25_000,
      refunded_at: "2026-05-02T00:00:00.000Z",
      created_at: "2026-05-01T00:00:00.000Z",
      updated_at: "2026-05-02T00:00:00.000Z",
      // Provider recurrence without a pledge: recurring_link provider_only.
      is_recurring: true,
      recurring_interval: "month",
    };
    const donor = { id: "donor-1", name: "Alice", email: "a@example.com" };
    const fund = { id: "fund-1", name: "Clean Water Initiative" };
    const stagedGift = {
      id: "staged-9",
      status: "posted",
      receipt_status: "sent",
      crm_post_status: "failed",
    };
    const corrections = [{ status: "pending" }];

    const crmRow = buildCrmGiftHistoryRow({
      donation,
      donor,
      fund,
      missionary: null,
      stagedGift: { ...stagedGift, twenty_record_id: null },
      corrections,
    });
    const hubRow = buildContributionGridRow({
      donation: {
        ...donation,
        donation_type: "one_time",
        payment_method: "card",
        notes: null,
        stripe_payment_intent_id: "pi_9",
        campaign_id: null,
        pledge_id: null,
        processed_at: null,
        completed_at: null,
        failed_at: null,
        error_code: null,
        error_message: null,
        stripe_charge_id: "ch_9",
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
      missionary: null,
      stagedGift: {
        ...stagedGift,
        review_reason: null,
        receipt_send_log_id: null,
      },
      corrections,
    });

    const filters: SharedContributionFilter[][] = [
      [{ id: "receipt_affected" }],
      [{ id: "pending_correction" }],
      [{ id: "approval_state", value: "pending" }],
      [{ id: "refund_state", value: "refunded" }],
      [{ id: "crm_post_state", value: "failed" }],
      [{ id: "recurring_link", value: "provider_only" }],
      [{ id: "payment_status", value: "refunded" }],
      [{ id: "crm_post_state", value: "failed" }, { id: "pending_correction" }],
    ];

    for (const filterSet of filters) {
      const crmMatch = filterSharedContributions([crmRow], filterSet);
      const hubMatch = filterSharedContributions([hubRow], filterSet);

      expect(crmMatch.length).toBe(hubMatch.length);
      expect(crmMatch.length).toBe(1);
    }
  });

  it("keeps the payment_status meaning shared on the Hub row: a fully refunded gift whose donations.status stayed completed matches Refunded, not Completed", () => {
    const hubRow = buildContributionGridRow({
      donation: {
        id: "donation-10",
        donor_id: "donor-1",
        missionary_id: null,
        fund_id: "fund-1",
        amount: 25_000,
        currency: "usd",
        // Stripe never rewrote the row status after the refund…
        status: "completed",
        donation_type: "one_time",
        payment_method: "card",
        is_recurring: false,
        recurring_interval: null,
        notes: null,
        stripe_payment_intent_id: "pi_10",
        gift_date: "2026-05-01",
        campaign_id: null,
        pledge_id: null,
        processed_at: null,
        completed_at: null,
        failed_at: null,
        error_code: null,
        error_message: null,
        stripe_charge_id: "ch_10",
        refunded_at: "2026-05-02T00:00:00.000Z",
        // …but the refund covers the full amount.
        refund_amount: 25_000,
        source: "online",
        created_at: "2026-05-01T00:00:00.000Z",
        updated_at: "2026-05-02T00:00:00.000Z",
      },
      donor: {
        id: "donor-1",
        name: "Alice",
        email: "a@example.com",
        phone: null,
        type: null,
        location: null,
        organization: null,
        notes: null,
      },
      profile: null,
      fund: { id: "fund-1", name: "Clean Water Initiative" },
      missionary: null,
    });

    // The Hub-only grid status keeps its extended vocabulary…
    expect(hubRow.status).toBe("completed");
    // …while the shared payment status carries the refund-derived meaning
    // both surfaces must filter by (row-contract paymentStatus derivation vs
    // normalizeContributionGridStatus divergence).
    expect(hubRow.shared.paymentStatus).toBe("refunded");
    expect(
      matchesSharedContributionFilter(
        { shared: hubRow.shared },
        { id: "payment_status", value: "refunded" },
      ),
    ).toBe(true);
    expect(
      matchesSharedContributionFilter(
        { shared: hubRow.shared },
        { id: "payment_status", value: "completed" },
      ),
    ).toBe(false);
  });
});
