import { describe, expect, it, vi } from "vitest";

import {
  updateInvoicePledge,
  updateSubscriptionPledge,
} from "../../../../packages/api/src/stripe/recurring";

import type Stripe from "stripe";

const PLEDGE_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const TENANT_ID = "11111111-1111-4111-8111-111111111111";

function createPledgeClientMock(pledgeRow: Record<string, unknown> | null) {
  const updates: Record<string, unknown>[] = [];
  const maybeSingle = vi
    .fn()
    .mockResolvedValue({ data: pledgeRow, error: null });
  const tenantEq = vi.fn(() => ({ maybeSingle }));
  const subscriptionEq = vi.fn(() => ({ eq: tenantEq, maybeSingle }));
  const select = vi.fn(() => ({ eq: subscriptionEq }));
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn((values: Record<string, unknown>) => {
    updates.push(values);
    return { eq: updateEq };
  });
  const from = vi.fn(() => ({ select, update }));

  return {
    client: { from } as never,
    updates,
    subscriptionEq,
    tenantEq,
    from,
  };
}

function pledgeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: PLEDGE_ID,
    tenant_id: TENANT_ID,
    status: "active",
    failed_charge_count: 0,
    payments_completed: 4,
    ...overrides,
  };
}

/** API 2026-05-27.dahlia: period end lives on subscription items. */
function subscriptionFixture(
  overrides: Record<string, unknown> = {},
  currentPeriodEnd = 1_780_000_000,
) {
  return {
    items: { data: [{ current_period_end: currentPeriodEnd }] },
    ...overrides,
  } as unknown as Stripe.Subscription;
}

describe("recurring donation lifecycle through Stripe Billing (#291)", () => {
  it("updates the pledge from a subscription lifecycle event", async () => {
    const mock = createPledgeClientMock(pledgeRow());

    const outcome = await updateSubscriptionPledge({
      supabaseAdmin: mock.client,
      subscription: subscriptionFixture({
        id: "sub_1",
        status: "active",
        pause_collection: null,
      }),
      eventType: "customer.subscription.updated",
    });

    expect(outcome).toMatchObject({
      action: "pledge_subscription_updated",
      handled: true,
      pledgeId: PLEDGE_ID,
    });
    expect(mock.updates[0]).toMatchObject({ status: "active" });
    expect(mock.updates[0]?.next_charge_at).toMatch(/^2026-/);
    expect(mock.subscriptionEq).toHaveBeenCalledWith(
      "stripe_subscription_id",
      "sub_1",
    );
  });

  it("scopes pledge lookup to the stored tenant when provided", async () => {
    const mock = createPledgeClientMock(pledgeRow());

    await updateSubscriptionPledge({
      supabaseAdmin: mock.client,
      subscription: subscriptionFixture({
        id: "sub_1",
        status: "active",
        pause_collection: null,
      }),
      eventType: "customer.subscription.updated",
      tenantId: TENANT_ID,
    });

    expect(mock.subscriptionEq).toHaveBeenCalledWith(
      "stripe_subscription_id",
      "sub_1",
    );
    expect(mock.tenantEq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
  });

  it("cancels the pledge when the subscription is deleted", async () => {
    const mock = createPledgeClientMock(pledgeRow());

    const outcome = await updateSubscriptionPledge({
      supabaseAdmin: mock.client,
      subscription: {
        id: "sub_1",
        status: "canceled",
        canceled_at: 1_700_000_000,
      } as unknown as Stripe.Subscription,
      eventType: "customer.subscription.deleted",
    });

    expect(outcome.action).toBe("pledge_cancelled");
    expect(mock.updates[0]).toMatchObject({ status: "cancelled" });
    expect(mock.updates[0]?.end_date).toBe("2023-11-14");
  });

  it("marks the pledge paused when Stripe pauses collection", async () => {
    const mock = createPledgeClientMock(pledgeRow());

    await updateSubscriptionPledge({
      supabaseAdmin: mock.client,
      subscription: {
        id: "sub_1",
        status: "active",
        pause_collection: { behavior: "void" },
      } as unknown as Stripe.Subscription,
      eventType: "customer.subscription.updated",
    });

    expect(mock.updates[0]).toMatchObject({ status: "paused" });
  });

  it("never resurrects a cancelled pledge from a stale subscription update", async () => {
    // Stripe does not guarantee event ordering, and the recovery scan can
    // replay a customer.subscription.updated snapshot (status "active",
    // created before the cancellation) after customer.subscription.deleted
    // already cancelled the pledge. Cancellation is terminal.
    const mock = createPledgeClientMock(pledgeRow({ status: "cancelled" }));

    const outcome = await updateSubscriptionPledge({
      supabaseAdmin: mock.client,
      subscription: subscriptionFixture({
        id: "sub_1",
        status: "active",
        pause_collection: null,
      }),
      eventType: "customer.subscription.updated",
    });

    expect(outcome).toMatchObject({
      action: "pledge_cancellation_preserved",
      handled: true,
      pledgeId: PLEDGE_ID,
    });
    // No write at all: neither status nor next_charge_at may land.
    expect(mock.updates).toHaveLength(0);
  });

  it("treats a replayed subscription deletion as an idempotent re-cancel", async () => {
    const mock = createPledgeClientMock(pledgeRow({ status: "cancelled" }));

    const outcome = await updateSubscriptionPledge({
      supabaseAdmin: mock.client,
      subscription: {
        id: "sub_1",
        status: "canceled",
      } as unknown as Stripe.Subscription,
      eventType: "customer.subscription.deleted",
    });

    expect(outcome.action).toBe("pledge_cancelled");
    expect(mock.updates[0]).toMatchObject({ status: "cancelled" });
  });

  it("records a successful invoice payment on the pledge", async () => {
    const mock = createPledgeClientMock(pledgeRow({ failed_charge_count: 2 }));

    const outcome = await updateInvoicePledge({
      supabaseAdmin: mock.client,
      invoice: {
        id: "in_1",
        subscription: "sub_1",
        status_transitions: { paid_at: 1_700_000_000 },
      } as unknown as Stripe.Invoice,
      outcome: "paid",
    });

    expect(outcome.action).toBe("pledge_invoice_paid");
    expect(mock.updates[0]).toMatchObject({
      status: "active",
      failed_charge_count: 0,
      payments_completed: 5,
      last_charge_at: "2023-11-14T22:13:20.000Z",
    });
  });

  it("never reactivates a cancelled pledge from a late invoice payment", async () => {
    // Stripe does not guarantee event ordering: the final invoice.paid can
    // arrive after customer.subscription.deleted already cancelled the pledge.
    const mock = createPledgeClientMock(
      pledgeRow({ status: "cancelled", payments_completed: 7 }),
    );

    const outcome = await updateInvoicePledge({
      supabaseAdmin: mock.client,
      invoice: {
        id: "in_late",
        subscription: "sub_1",
      } as unknown as Stripe.Invoice,
      outcome: "paid",
    });

    expect(outcome.action).toBe("pledge_invoice_paid");
    expect(mock.updates[0]?.status).toBeUndefined();
    expect(mock.updates[0]).toMatchObject({
      payments_completed: 8,
      failed_charge_count: 0,
    });
  });

  it("resolves the subscription id from basil-shaped invoices", async () => {
    // API version 2025-03-31.basil moved the reference to
    // invoice.parent.subscription_details.subscription.
    const mock = createPledgeClientMock(pledgeRow());

    const outcome = await updateInvoicePledge({
      supabaseAdmin: mock.client,
      invoice: {
        id: "in_basil",
        parent: { subscription_details: { subscription: "sub_basil" } },
      } as unknown as Stripe.Invoice,
      outcome: "paid",
    });

    expect(outcome.handled).toBe(true);
    expect(mock.subscriptionEq).toHaveBeenCalledWith(
      "stripe_subscription_id",
      "sub_basil",
    );
  });

  it("tracks a failed invoice payment without inventing a new status", async () => {
    const mock = createPledgeClientMock(pledgeRow({ failed_charge_count: 1 }));

    const outcome = await updateInvoicePledge({
      supabaseAdmin: mock.client,
      invoice: {
        id: "in_1",
        subscription: { id: "sub_1" },
      } as unknown as Stripe.Invoice,
      outcome: "failed",
    });

    expect(outcome.action).toBe("pledge_invoice_payment_failed");
    expect(mock.updates[0]).toMatchObject({ failed_charge_count: 2 });
    expect(mock.updates[0]?.status).toBeUndefined();
    expect(mock.updates[0]?.last_charge_attempt).toBeTruthy();
  });

  it("ignores lifecycle events that match no pledge with a safe reason", async () => {
    const mock = createPledgeClientMock(null);

    const outcome = await updateSubscriptionPledge({
      supabaseAdmin: mock.client,
      subscription: {
        id: "sub_unknown",
        status: "active",
      } as unknown as Stripe.Subscription,
      eventType: "customer.subscription.updated",
    });

    expect(outcome.handled).toBe(false);
    expect(outcome.action).toBe("ignored");
    expect(outcome.reason).toContain("sub_unknown");
    expect(outcome.reason).not.toMatch(/sk_|whsec_|secret/i);
  });
});
