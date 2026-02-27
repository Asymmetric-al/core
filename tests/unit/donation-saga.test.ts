import { describe, expect, it, vi } from "vitest";

import { resolveRequiredIdempotencyKey } from "../../packages/api/src/donate/idempotency";
import {
  processDonationSagaOutboxEvent,
  processDueDonationSagaOutboxEvents,
} from "../../packages/api/src/donate/saga";

import type Stripe from "stripe";

function createStripeMock() {
  return {
    customers: {
      create: vi.fn(),
    },
    paymentIntents: {
      create: vi.fn(),
      cancel: vi.fn(),
    },
  } as unknown as Stripe;
}

describe("donation saga helpers", () => {
  it("processes a claimed event to completion", async () => {
    const rpc = vi.fn().mockImplementation((fn: string) => {
      if (fn === "claim_donation_saga_event") {
        return Promise.resolve({
          data: {
            claimed: true,
            donation_id: "don-1",
            donor_id: "dor-1",
            tenant_id: "ten-1",
            amount: 5000,
            currency: "usd",
            attempt_count: 1,
            idempotency_key: "idem-1",
            stripe_customer_id: "cus_existing",
          },
          error: null,
        });
      }
      if (fn === "complete_donation_saga_event") {
        return Promise.resolve({ data: { completed: true }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });
    const from = vi.fn(() => {
      throw new Error("from() should not be called in this path");
    });
    const supabaseAdmin = { rpc, from };

    const stripe = createStripeMock();
    (
      stripe.paymentIntents.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "pi_1",
      client_secret: "secret_1",
      status: "requires_payment_method",
    });

    const result = await processDonationSagaOutboxEvent({
      supabaseAdmin: supabaseAdmin as never,
      stripe,
      outboxId: "out-1",
      actorUserId: "usr-1",
    });

    expect(result).toEqual({
      status: "completed",
      donationId: "don-1",
      outboxId: "out-1",
      paymentIntentId: "pi_1",
      clientSecret: "secret_1",
    });
    expect(stripe.paymentIntents.create).toHaveBeenCalledTimes(1);
    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith("complete_donation_saga_event", {
      p_outbox_id: "out-1",
      p_lock_id: expect.any(String),
      p_stripe_payment_intent_id: "pi_1",
      p_stripe_customer_id: "cus_existing",
      p_gateway_response: {
        clientSecret: "secret_1",
        stripePaymentIntentId: "pi_1",
        stripeCustomerId: "cus_existing",
        stripeStatus: "requires_payment_method",
        attemptCount: 1,
      },
    });
  });

  it("returns stored completed state when claim is already consumed", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { claimed: false },
      error: null,
    });

    const single = vi.fn().mockResolvedValue({
      data: {
        id: "out-2",
        donation_id: "don-2",
        status: "completed",
        stripe_payment_intent_id: "pi_done",
        gateway_response: { clientSecret: "secret_done" },
      },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const supabaseAdmin = { rpc, from };

    const stripe = createStripeMock();

    const result = await processDonationSagaOutboxEvent({
      supabaseAdmin: supabaseAdmin as never,
      stripe,
      outboxId: "out-2",
      actorUserId: "usr-2",
    });

    expect(result).toEqual({
      status: "completed",
      donationId: "don-2",
      outboxId: "out-2",
      paymentIntentId: "pi_done",
      clientSecret: "secret_done",
    });
    expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
  });

  it("records failure when completion transition fails", async () => {
    const rpc = vi.fn().mockImplementation((fn: string) => {
      if (fn === "claim_donation_saga_event") {
        return Promise.resolve({
          data: {
            claimed: true,
            donation_id: "don-3",
            donor_id: "dor-3",
            tenant_id: "ten-3",
            amount: 7500,
            currency: "usd",
            attempt_count: 2,
            idempotency_key: "idem-3",
            stripe_customer_id: "cus_3",
          },
          error: null,
        });
      }
      if (fn === "complete_donation_saga_event") {
        return Promise.resolve({
          data: null,
          error: { message: "complete transition failed" },
        });
      }
      if (fn === "record_donation_saga_failure") {
        return Promise.resolve({ data: { ok: true }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });
    const from = vi.fn(() => {
      throw new Error("from() should not be called in this path");
    });
    const supabaseAdmin = { rpc, from };

    const stripe = createStripeMock();
    (
      stripe.paymentIntents.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "pi_3",
      client_secret: "secret_3",
      status: "requires_payment_method",
    });
    await expect(
      processDonationSagaOutboxEvent({
        supabaseAdmin: supabaseAdmin as never,
        stripe,
        outboxId: "out-3",
        actorUserId: "usr-3",
      }),
    ).rejects.toThrow("complete transition failed");

    expect(stripe.paymentIntents.cancel).not.toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith("record_donation_saga_failure", {
      p_outbox_id: "out-3",
      p_lock_id: expect.any(String),
      p_error_code: "donation_saga_error",
      p_error_message: "complete transition failed",
      p_retry_delay_seconds: 60,
      p_dead_letter_after: 5,
      p_actor_user_id: "usr-3",
    });
  });

  it("uses stable Stripe customer idempotency key across retries", async () => {
    let claimCount = 0;
    const rpc = vi.fn().mockImplementation((fn: string) => {
      if (fn === "claim_donation_saga_event") {
        claimCount += 1;
        return Promise.resolve({
          data: {
            claimed: true,
            outbox_id: "out-dup",
            donation_id: "don-dup",
            donor_id: "dor-dup",
            tenant_id: "ten-dup",
            amount: 1000,
            currency: "usd",
            attempt_count: claimCount,
            idempotency_key: "idem-dup",
            stripe_customer_id: null,
          },
          error: null,
        });
      }
      if (fn === "complete_donation_saga_event") {
        if (claimCount === 1) {
          return Promise.resolve({
            data: null,
            error: { message: "complete transition failed" },
          });
        }
        return Promise.resolve({ data: { completed: true }, error: null });
      }
      if (fn === "record_donation_saga_failure") {
        return Promise.resolve({ data: { ok: true }, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    });

    const donorSingle = vi.fn().mockResolvedValue({
      data: {
        id: "dor-dup",
        profile_id: "pro-dup",
        stripe_customer_id: null,
      },
      error: null,
    });
    const donorEq = vi.fn().mockReturnValue({ single: donorSingle });
    const donorSelect = vi.fn().mockReturnValue({ eq: donorEq });

    const profileSingle = vi.fn().mockResolvedValue({
      data: {
        email: "donor@example.com",
        first_name: "Donor",
        last_name: "User",
      },
      error: null,
    });
    const profileEq = vi.fn().mockReturnValue({ single: profileSingle });
    const profileSelect = vi.fn().mockReturnValue({ eq: profileEq });

    const from = vi.fn((table: string) => {
      if (table === "donors") {
        return { select: donorSelect };
      }
      if (table === "profiles") {
        return { select: profileSelect };
      }
      throw new Error(`Unexpected table lookup: ${table}`);
    });
    const supabaseAdmin = { rpc, from };

    const stripe = createStripeMock();
    (stripe.customers.create as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "cus_retry",
    });
    (
      stripe.paymentIntents.create as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "pi_retry",
      client_secret: "secret_retry",
      status: "requires_payment_method",
    });

    await expect(
      processDonationSagaOutboxEvent({
        supabaseAdmin: supabaseAdmin as never,
        stripe,
        outboxId: "out-dup",
        actorUserId: "usr-dup",
      }),
    ).rejects.toThrow("complete transition failed");

    const secondAttemptResult = await processDonationSagaOutboxEvent({
      supabaseAdmin: supabaseAdmin as never,
      stripe,
      outboxId: "out-dup",
      actorUserId: "usr-dup",
    });

    expect(secondAttemptResult.status).toBe("completed");
    expect(stripe.customers.create).toHaveBeenCalledTimes(2);
    expect(stripe.customers.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        metadata: expect.objectContaining({
          donor_id: "dor-dup",
          tenant_id: "ten-dup",
          user_id: "usr-dup",
        }),
      }),
      { idempotencyKey: "idem-dup:customer" },
    );
    expect(stripe.customers.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        metadata: expect.objectContaining({
          donor_id: "dor-dup",
          tenant_id: "ten-dup",
          user_id: "usr-dup",
        }),
      }),
      { idempotencyKey: "idem-dup:customer" },
    );
  });

  it("returns an empty summary when no due rows exist", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    const from = vi.fn();
    const supabaseAdmin = { rpc, from };

    const stripe = createStripeMock();

    const result = await processDueDonationSagaOutboxEvents({
      supabaseAdmin: supabaseAdmin as never,
      stripe,
      actorUserId: "usr-4",
      limit: 25,
    });

    expect(result).toEqual({
      attempted: 0,
      completed: 0,
      failed: 0,
      processing: 0,
      results: [],
    });
    expect(rpc).toHaveBeenCalledWith("claim_due_donation_saga_events", {
      p_limit: 25,
      p_lock_id: expect.any(String),
    });
  });

  it("requires idempotency key header for donation requests", () => {
    expect(() => resolveRequiredIdempotencyKey(new Headers())).toThrow(
      "Missing required idempotency-key header",
    );

    const legacyHeader = new Headers({
      "x-idempotency-key": " idem-legacy ",
    });
    expect(resolveRequiredIdempotencyKey(legacyHeader)).toBe("idem-legacy");
  });
});
