import { describe, expect, it, vi } from "vitest";

import { confirmCheckoutPayment } from "../../../../packages/lib/payments/confirm-checkout-payment";

/**
 * Public-giving WIRING — client-safe checkout orchestration.
 *
 * `confirmCheckoutPayment` submits a donation and derives the outcome from the
 * SERVER-returned PaymentIntent status via the confirmation contract. The
 * network + Stripe confirmation is injected as a transport so the orchestration
 * is unit-testable with a mocked money path (no live DB / Stripe).
 *
 * The one rule these tests enforce: success is ONLY ever reported when the
 * transport returns a server-confirmed `succeeded` status. The orchestration
 * never fabricates success.
 */

const baseRequest = {
  amountCents: 5000,
  currency: "usd",
  missionaryId: "miss-1",
  frequency: "one-time" as const,
  rail: "card" as const,
  donor: { email: "a@example.com", firstName: "Ada", lastName: "Lovelace" },
};

describe("confirmCheckoutPayment", () => {
  it("reports success ONLY when the server confirms a succeeded PaymentIntent", async () => {
    const transport = vi.fn().mockResolvedValue({
      paymentIntentStatus: "succeeded",
    });
    const result = await confirmCheckoutPayment(baseRequest, { transport });

    expect(transport).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    expect(result.outcome.isSuccess).toBe(true);
    expect(result.outcome.showConfirmation).toBe(true);
  });

  it("reports an honest pending (not success) for a processing rail", async () => {
    const transport = vi
      .fn()
      .mockResolvedValue({ paymentIntentStatus: "processing" });
    const result = await confirmCheckoutPayment(
      { ...baseRequest, rail: "ach_debit" },
      { transport },
    );

    expect(result.ok).toBe(true);
    expect(result.outcome.isSuccess).toBe(false);
    expect(result.outcome.showConfirmation).toBe(true);
    expect(result.outcome.state).toBe("processing");
  });

  it("never fabricates success when the transport reports a non-succeeded status", async () => {
    const transport = vi
      .fn()
      .mockResolvedValue({ paymentIntentStatus: "requires_action" });
    const result = await confirmCheckoutPayment(baseRequest, { transport });

    expect(result.ok).toBe(false);
    expect(result.outcome.isSuccess).toBe(false);
    expect(result.outcome.showConfirmation).toBe(false);
  });

  it("surfaces a transport failure honestly (no success) rather than throwing", async () => {
    const transport = vi
      .fn()
      .mockRejectedValue(new Error("guest money endpoint unavailable"));
    const result = await confirmCheckoutPayment(baseRequest, { transport });

    expect(result.ok).toBe(false);
    expect(result.outcome.isSuccess).toBe(false);
    expect(result.error).toMatch(/unavailable/i);
  });
});
