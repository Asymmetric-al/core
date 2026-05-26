import { describe, expect, it } from "vitest";

import { buildDonorPortalSnapshot } from "../../../../../packages/api/src/donor-portal/model";

describe("donor portal model", () => {
  it("builds a self-service snapshot from owned donor data only", () => {
    const snapshot = buildDonorPortalSnapshot({
      now: new Date("2026-05-15T00:00:00.000Z"),
      profile: {
        id: "profile-1",
        email: "donor@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
        full_name: "Ada Lovelace",
        display_name: null,
        phone: "+15555550100",
        avatar_url: null,
      },
      donor: {
        id: "donor-1",
        tenant_id: "tenant-1",
        profile_id: "profile-1",
        missionary_id: null,
        name: null,
        email: "donor@example.com",
        phone: null,
        mobile: null,
        preferred_contact: "email",
        avatar_url: null,
        location: null,
        status: "active",
        giving_preferences: { receiptDelivery: "email" },
        total_given: 25_000,
        first_gift_date: "2026-01-01",
        last_gift_date: "2026-05-01T00:00:00.000Z",
        last_gift_amount: 10_000,
        gift_count: 2,
        frequency: "monthly",
        joined_date: "2026-01-01",
        receipt_email_frequency: "monthly",
        default_update_frequency: "weekly",
        preferred_language: "en",
        do_not_contact: false,
        do_not_email: false,
        has_active_pledge: true,
        stripe_customer_id: "cus_123",
      },
      donations: [
        {
          id: "donation-1",
          amount: 10_000,
          currency: "usd",
          status: "completed",
          donation_type: "recurring",
          payment_method: null,
          is_recurring: true,
          recurring_interval: "month",
          gift_date: "2026-05-01T00:00:00.000Z",
          created_at: "2026-05-01T00:00:00.000Z",
          completed_at: null,
          processed_at: null,
          stripe_payment_intent_id: "pi_123",
          stripe_charge_id: "ch_123",
          fund: null,
          missionary: {
            id: "missionary-1",
            profile: {
              id: "missionary-profile-1",
              display_name: "The Millers",
              full_name: null,
              first_name: null,
              last_name: null,
              avatar_url: "https://example.com/avatar.png",
            },
          },
        },
        {
          id: "donation-2",
          amount: 15_000,
          currency: "usd",
          status: "processing",
          donation_type: "one_time",
          payment_method: "ACH",
          is_recurring: false,
          recurring_interval: null,
          gift_date: "2026-04-01T00:00:00.000Z",
          created_at: "2026-04-01T00:00:00.000Z",
          completed_at: null,
          processed_at: null,
          stripe_payment_intent_id: "pi_456",
          stripe_charge_id: null,
          fund: { id: "fund-1", name: "Clean Water" },
          missionary: null,
        },
      ],
      pledges: [
        {
          id: "pledge-1",
          amount: 10_000,
          currency: "usd",
          frequency: "monthly",
          status: "active",
          start_date: "2026-01-01",
          end_date: null,
          next_payment_date: "2026-06-01",
          next_charge_at: null,
          stripe_subscription_id: "sub_123",
          stripe_payment_method_id: "pm_123",
          payment_method: null,
          total_paid: 50_000,
          total_expected: 120_000,
          payments_completed: 5,
          payments_remaining: 7,
          fund: null,
          missionary: null,
        },
      ],
      feedPreferences: null,
    });

    expect(snapshot.profile.displayName).toBe("Ada Lovelace");
    expect(snapshot.summary.yearToDateCents).toBe(10_000);
    expect(snapshot.summary.receiptCount).toBe(1);
    expect(snapshot.summary.statementYears).toEqual([2026]);
    expect(snapshot.donations[0]).toMatchObject({
      id: "donation-1",
      amount: 100,
      receiptUrl: "/api/donor/receipts/donation-1",
      status: "Succeeded",
      type: "Recurring",
      designation: {
        name: "The Millers",
        type: "missionary",
      },
    });
    expect(snapshot.donations[1]?.status).toBe("Processing");
    expect(snapshot.recurringGifts[0]).toMatchObject({
      id: "pledge-1",
      paymentMethodLabel: "Stripe managed",
      stripeSubscriptionId: "sub_123",
    });
    expect(snapshot.paymentMethods[0]).toMatchObject({
      source: "stripe_subscription",
      stripeManaged: true,
      recurringGiftIds: ["pledge-1"],
    });
  });

  it("shows refunded donations honestly instead of collapsing them into failures", () => {
    const snapshot = buildDonorPortalSnapshot({
      now: new Date("2026-05-15T00:00:00.000Z"),
      profile: {
        id: "profile-1",
        email: "donor@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
        full_name: "Ada Lovelace",
        display_name: null,
        phone: null,
        avatar_url: null,
      },
      donor: {
        id: "donor-1",
        tenant_id: "tenant-1",
        profile_id: "profile-1",
        missionary_id: null,
        name: null,
        email: "donor@example.com",
        phone: null,
        mobile: null,
        preferred_contact: "email",
        avatar_url: null,
        location: null,
        status: "active",
        giving_preferences: null,
        total_given: 0,
        first_gift_date: null,
        last_gift_date: null,
        last_gift_amount: null,
        gift_count: 1,
        frequency: null,
        joined_date: null,
        receipt_email_frequency: "monthly",
        default_update_frequency: "weekly",
        preferred_language: "en",
        do_not_contact: false,
        do_not_email: false,
        has_active_pledge: false,
        stripe_customer_id: "cus_123",
      },
      donations: [
        {
          id: "donation-refunded",
          amount: 10_000,
          currency: "usd",
          status: "refunded",
          donation_type: "one_time",
          payment_method: "card",
          is_recurring: false,
          recurring_interval: null,
          gift_date: "2026-05-01T00:00:00.000Z",
          created_at: "2026-05-01T00:00:00.000Z",
          completed_at: "2026-05-01T00:00:00.000Z",
          processed_at: null,
          stripe_payment_intent_id: "pi_refunded",
          stripe_charge_id: "ch_refunded",
          fund: { id: "fund-1", name: "Clean Water" },
          missionary: null,
        },
      ],
      pledges: [],
      feedPreferences: null,
    });

    expect(snapshot.donations[0]?.status).toBe("Refunded");
    expect(snapshot.summary.receiptCount).toBe(0);
    expect(snapshot.summary.yearToDateCents).toBe(0);
  });
});
