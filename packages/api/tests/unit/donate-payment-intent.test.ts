import { describe, expect, it, vi } from "vitest";

import { createDonationPaymentIntent } from "../../src/donate/payment-intent";

/**
 * TDD — server-side PaymentIntent leg of the donate flow (money path).
 * Pure over an injected Stripe client (no DB): the saga and the future guest
 * path both call this. Unit test mocks Stripe; a separate integration test
 * exercises the REAL Stripe TEST API.
 */

function mockStripe(overrides: Record<string, unknown> = {}) {
  const create = vi.fn().mockResolvedValue({
    id: "pi_123",
    client_secret: "cs_test",
    status: "requires_payment_method",
    amount: 5000,
    currency: "usd",
    ...overrides,
  });
  return { stripe: { paymentIntents: { create } } as never, create };
}

const baseParams = {
  amountCents: 5000,
  currency: "USD",
  idempotencyKey: "idem-key-1",
  customerId: "cus_9",
  metadata: {
    donation_id: "don-1",
    donor_id: "donor-1",
    fund_id: "fund-1",
    tenant_id: "tenant-1",
  },
};

describe("createDonationPaymentIntent", () => {
  it("creates a PaymentIntent with integer minor-units amount, lowercased currency, metadata + idempotency", async () => {
    const { stripe, create } = mockStripe();
    const result = await createDonationPaymentIntent(stripe, baseParams);

    expect(create).toHaveBeenCalledTimes(1);
    const [body, options] = create.mock.calls[0]!;
    expect(body.amount).toBe(5000);
    expect(body.currency).toBe("usd");
    expect(body.customer).toBe("cus_9");
    expect(body.automatic_payment_methods).toEqual({ enabled: true });
    expect(body.metadata).toMatchObject({
      donation_id: "don-1",
      fund_id: "fund-1",
      tenant_id: "tenant-1",
    });
    // idempotency key is namespaced so it can't collide with the customer create.
    expect(options).toEqual({ idempotencyKey: "idem-key-1:payment_intent" });

    expect(result).toEqual({
      paymentIntentId: "pi_123",
      clientSecret: "cs_test",
      status: "requires_payment_method",
      amountCents: 5000,
      currency: "usd",
    });
  });

  it("omits the customer field when no customerId is given", async () => {
    const { stripe, create } = mockStripe();
    await createDonationPaymentIntent(stripe, {
      ...baseParams,
      customerId: undefined,
    });
    const [body] = create.mock.calls[0]!;
    expect("customer" in body).toBe(false);
  });

  it("drops undefined metadata values (Stripe requires string values)", async () => {
    const { stripe, create } = mockStripe();
    await createDonationPaymentIntent(stripe, {
      ...baseParams,
      metadata: { donation_id: "don-1", missionary_id: undefined },
    });
    const [body] = create.mock.calls[0]!;
    expect(body.metadata).toEqual({ donation_id: "don-1" });
  });

  it("rejects a non-positive or non-integer amount before calling Stripe", async () => {
    const { stripe, create } = mockStripe();
    await expect(
      createDonationPaymentIntent(stripe, { ...baseParams, amountCents: 0 }),
    ).rejects.toThrow();
    await expect(
      createDonationPaymentIntent(stripe, { ...baseParams, amountCents: 12.5 }),
    ).rejects.toThrow();
    expect(create).not.toHaveBeenCalled();
  });
});
