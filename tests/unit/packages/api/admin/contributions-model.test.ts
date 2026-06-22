import { describe, expect, it } from "vitest";

import { buildSharedContributionRowFields } from "../../../../../packages/api/src/admin/contribution-shared/row-contract";
import { buildContributionGridRow } from "../../../../../packages/api/src/admin/contributions/model";

describe("api/admin/contributions/model", () => {
  it("builds a UI-safe contribution row with nonprofit admin fields", () => {
    const row = buildContributionGridRow({
      donation: {
        id: "donation-1",
        donor_id: "donor-1",
        missionary_id: "missionary-1",
        fund_id: "fund-1",
        amount: 250,
        currency: "usd",
        status: "processing",
        donation_type: "one_time",
        payment_method: "card",
        is_recurring: false,
        recurring_interval: null,
        notes: "Large offline follow-up required",
        stripe_payment_intent_id: "pi_123",
        gift_date: "2026-04-08",
        campaign_id: "campaign-1",
        pledge_id: null,
        processed_at: null,
        completed_at: null,
        failed_at: null,
        error_code: null,
        error_message: null,
        stripe_charge_id: "ch_123",
        refunded_at: null,
        refund_amount: 0,
        source: "direct",
        created_at: "2026-04-08T10:00:00.000Z",
        updated_at: "2026-04-08T12:00:00.000Z",
      },
      donor: {
        id: "donor-1",
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "+1 555-0000",
        type: "foundation",
        location: "San Francisco, CA",
        organization: "Alice Foundation",
        notes: "VIP partner",
      },
      profile: {
        display_name: null,
        first_name: "Alice",
        last_name: "Johnson",
        email: "alice@example.com",
        avatar_url: "https://example.com/avatar.png",
      },
      fund: {
        id: "fund-1",
        name: "Clean Water Initiative",
      },
      missionary: {
        id: "missionary-1",
        display_name: "John Martinez",
      },
    });

    expect(row.id).toBe("donation-1");
    expect(row.donorName).toBe("Alice Johnson");
    expect(row.status).toBe("pending");
    expect(row.type).toBe("One-time");
    expect(row.paymentMethod).toBe("Credit Card");
    expect(row.source).toBe("Online");
    expect(row.receiptStatus).toBe("pending");
    expect(row.amountGross).toBe(250);
    expect(row.fundName).toBe("Clean Water Initiative");
    expect(row.missionaryName).toBe("John Martinez");
    expect(row.donorType).toBe("foundation");
    expect(row.organizationName).toBe("Alice Foundation");
  });

  it("falls back gracefully for anonymous and sparse rows", () => {
    const row = buildContributionGridRow({
      donation: {
        id: "donation-2",
        donor_id: null,
        missionary_id: null,
        fund_id: null,
        amount: 75,
        currency: "usd",
        status: "failed",
        donation_type: null,
        payment_method: null,
        is_recurring: null,
        recurring_interval: null,
        notes: null,
        stripe_payment_intent_id: null,
        gift_date: "2026-04-01",
        campaign_id: null,
        pledge_id: null,
        processed_at: null,
        completed_at: null,
        failed_at: "2026-04-01T11:00:00.000Z",
        error_code: "card_declined",
        error_message: "Card declined",
        stripe_charge_id: null,
        refunded_at: null,
        refund_amount: 0,
        source: "import",
        created_at: "2026-04-01T10:00:00.000Z",
        updated_at: "2026-04-01T10:00:00.000Z",
      },
      donor: null,
      profile: null,
      fund: null,
      missionary: null,
    });

    expect(row.donorName).toBe("Anonymous");
    expect(row.donorEmail).toBe("");
    expect(row.type).toBe("One-time");
    expect(row.paymentMethod).toBe("Other");
    expect(row.source).toBe("Import");
    expect(row.fundName).toBe("General Fund");
    expect(row.receiptStatus).toBe("pending");
  });

  it("embeds the shared contribution row contract and mirrors overlapping fields", () => {
    const donation = {
      id: "donation-3",
      donor_id: "donor-1",
      missionary_id: "missionary-1",
      fund_id: "fund-1",
      amount: 50_000,
      currency: "usd",
      status: "completed",
      donation_type: "one_time",
      payment_method: "card",
      is_recurring: false,
      recurring_interval: null,
      notes: null,
      stripe_payment_intent_id: "pi_900",
      gift_date: "2026-05-01",
      campaign_id: null,
      pledge_id: null,
      processed_at: null,
      completed_at: "2026-05-01T09:00:00.000Z",
      failed_at: null,
      error_code: null,
      error_message: null,
      stripe_charge_id: "ch_900",
      refunded_at: null,
      refund_amount: 5_000,
      source: "online",
      created_at: "2026-05-01T08:00:00.000Z",
      updated_at: "2026-05-01T08:30:00.000Z",
    };
    const donor = {
      id: "donor-1",
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: null,
      type: null,
      location: null,
      organization: null,
      notes: null,
    };
    const fund = { id: "fund-1", name: "Clean Water Initiative" };
    const missionary = { id: "missionary-1", display_name: "John Martinez" };
    const stagedGift = {
      id: "staged-1",
      status: "posted",
      review_reason: null,
      receipt_status: "sent",
      receipt_send_log_id: null,
      crm_post_status: "posted",
    };
    const corrections = [{ status: "pending" }];

    const row = buildContributionGridRow({
      donation,
      donor,
      profile: null,
      fund,
      missionary,
      stagedGift,
      corrections,
    });

    expect(row.shared).toEqual(
      buildSharedContributionRowFields({
        donation,
        donor,
        profile: null,
        fund,
        missionary,
        stagedGift,
        corrections,
      }),
    );

    expect(row.amount).toBe(row.shared.amountCents);
    expect(row.date).toBe(row.shared.giftDate);
    expect(row.status).toBe(row.shared.paymentStatus);
    expect(row.receiptStatus).toBe(row.shared.receiptStatus);
    expect(row.crmPostStatus).toBe(row.shared.crmPostStatus);
    expect(row.fundName).toBe(row.shared.designationSummary.fundName);
    expect(row.donorName).toBe(row.shared.donorName);
    expect(row.shared.refundState).toBe("partial_refund");
    expect(row.shared.correctionState).toBe("pending");
  });
});
