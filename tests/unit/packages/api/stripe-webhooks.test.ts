import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getPaymentIntentLatestChargeId,
  handleStripeWebhookEvent,
  POST,
} from "../../../../packages/api/src/stripe/webhooks";

import type { NextRequest } from "next/server";

const mockState = vi.hoisted(() => ({
  adminClient: null as unknown,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () =>
    mockState.adminClient
      ? { client: mockState.adminClient, error: null }
      : { client: null, error: "Supabase admin client unavailable." },
}));

function createSupabaseDonationMock(row: Record<string, unknown> | null) {
  const updateValues: Record<string, unknown>[] = [];
  const rawEvents: Record<string, unknown>[] = [];
  const stagedGifts: Record<string, unknown>[] = [];
  const donationMaybeSingle = vi
    .fn()
    .mockResolvedValue({ data: row, error: null });
  const donationSelectEq = vi.fn(() => ({ maybeSingle: donationMaybeSingle }));
  const donationSelect = vi.fn(() => ({ eq: donationSelectEq }));
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn((values: Record<string, unknown>) => {
    updateValues.push(values);
    return { eq: updateEq };
  });
  const rpc = vi.fn((fn: string) => {
    if (fn === "claim_stripe_raw_event") {
      if (rawEvents[0]) {
        rawEvents[0] = {
          ...rawEvents[0],
          lock_id: "lock-1",
          processing_status: "processing",
        };
      }

      return Promise.resolve({ data: { claimed: true }, error: null });
    }
    return Promise.resolve({ data: {}, error: null });
  });
  const from = vi.fn((table: string) => {
    if (table === "donations") {
      return { select: donationSelect, update };
    }

    if (table === "stripe_raw_events") {
      const makeFilter = () => {
        const filter = {
          eq: vi.fn(() => filter),
          maybeSingle: vi.fn(async () => ({
            data: rawEvents[0] ?? null,
            error: null,
          })),
          single: vi.fn(async () => ({
            data: rawEvents[0] ?? null,
            error: rawEvents[0] ? null : { message: "not found" },
          })),
        };
        return filter;
      };

      return {
        insert: vi.fn((values: Record<string, unknown>) => {
          const inserted = {
            id: "raw-event-1",
            correlation_id: "correlation-1",
            process_attempts: 0,
            processing_status: "received",
            raw_payload: values.raw_payload,
            ...values,
          };
          rawEvents[0] = inserted;
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({ data: inserted, error: null })),
            })),
          };
        }),
        select: vi.fn(() => makeFilter()),
      };
    }

    if (table === "staged_gifts") {
      const makeFilter = () => {
        const filter = {
          eq: vi.fn(() => filter),
          maybeSingle: vi.fn(async () => ({
            data: stagedGifts[0] ?? null,
            error: null,
          })),
          single: vi.fn(async () => ({
            data: stagedGifts[0] ?? null,
            error: stagedGifts[0] ? null : { message: "not found" },
          })),
        };
        return filter;
      };
      return {
        insert: vi.fn((values: Record<string, unknown>) => {
          const inserted = {
            id: "staged-gift-1",
            allocation_status: "single_allocation",
            crm_post_status: "not_required",
            donor_match_status: "matched",
            metadata: {},
            receipt_status: "pending",
            status: "received",
            ...values,
          };
          stagedGifts[0] = inserted;
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({ data: inserted, error: null })),
            })),
          };
        }),
        select: vi.fn(() => makeFilter()),
        update: vi.fn((values: Record<string, unknown>) => ({
          eq: vi.fn(() => {
            stagedGifts[0] = { ...(stagedGifts[0] ?? {}), ...values };
            return {
              select: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: stagedGifts[0] ?? null,
                  error: null,
                })),
              })),
            };
          }),
        })),
      };
    }

    if (
      table === "staged_gift_allocations" ||
      table === "staged_gift_audit_events"
    ) {
      return {
        insert: vi.fn(async () => ({ error: null })),
      };
    }

    return {
      insert: vi.fn(async () => ({ error: null })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => ({ data: null, error: null })),
        })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
    };
  });

  return {
    client: { from, rpc },
    from,
    maybeSingle: donationMaybeSingle,
    rpc,
    select: donationSelect,
    selectEq: donationSelectEq,
    update,
    updateEq,
    updateValues,
  };
}

function createSignedStripeRequest(payload: unknown, webhookSecret: string) {
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
  const signature = `t=${timestamp},v1=${digest}`;

  return new Request("https://example.com/api/webhooks/stripe", {
    body,
    headers: {
      "content-type": "application/json",
      "stripe-signature": signature,
    },
    method: "POST",
  }) as NextRequest;
}

describe("Stripe webhook handler", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_unit";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit";
    mockState.adminClient = null;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it("extracts the latest charge id from string and object PaymentIntent shapes", () => {
    expect(
      getPaymentIntentLatestChargeId({
        latest_charge: "ch_string",
      } as Parameters<typeof getPaymentIntentLatestChargeId>[0]),
    ).toBe("ch_string");

    expect(
      getPaymentIntentLatestChargeId({
        latest_charge: { id: "ch_object" },
      } as Parameters<typeof getPaymentIntentLatestChargeId>[0]),
    ).toBe("ch_object");
  });

  it("verifies the Stripe signature and completes a matched donation", async () => {
    const supabase = createSupabaseDonationMock({
      amount: 5000,
      currency: "usd",
      donor_id: "donor-1",
      fund_id: "fund-1",
      id: "donation-1",
      missionary_id: null,
      status: "pending",
      stripe_payment_intent_id: "pi_1",
      stripe_charge_id: null,
      tenant_id: "tenant-1",
    });
    mockState.adminClient = supabase.client;

    const response = await POST(
      createSignedStripeRequest(
        {
          data: {
            object: {
              id: "pi_1",
              latest_charge: "ch_1",
              object: "payment_intent",
            },
          },
          id: "evt_1",
          object: "event",
          type: "payment_intent.succeeded",
        },
        "whsec_unit",
      ),
    );

    await expect(response.json()).resolves.toMatchObject({
      action: "payment_intent_completed",
      donationId: "donation-1",
      eventId: "evt_1",
      eventType: "payment_intent.succeeded",
      handled: true,
      paymentIntentId: "pi_1",
      received: true,
    });
    expect(response.status).toBe(200);
    expect(supabase.updateValues[0]).toMatchObject({
      completed_at: expect.any(String),
      error_code: null,
      error_message: null,
      failed_at: null,
      processed_at: expect.any(String),
      status: "completed",
      stripe_charge_id: "ch_1",
      updated_at: expect.any(String),
    });
  });

  it("rejects webhook requests with an invalid signature", async () => {
    const supabase = createSupabaseDonationMock({
      amount: 5000,
      id: "donation-1",
      status: "pending",
      stripe_payment_intent_id: "pi_1",
    });
    mockState.adminClient = supabase.client;

    const response = await POST(
      new Request("https://example.com/api/webhooks/stripe", {
        body: JSON.stringify({ id: "evt_bad" }),
        headers: {
          "content-type": "application/json",
          "stripe-signature": "bad-signature",
        },
        method: "POST",
      }) as NextRequest,
    );

    await expect(response.json()).resolves.toEqual({
      error: "Invalid Stripe signature.",
    });
    expect(response.status).toBe(400);
    expect(supabase.update).not.toHaveBeenCalled();
  });

  it("records failed payment intent events without overwriting completed donations", async () => {
    const supabase = createSupabaseDonationMock({
      amount: 5000,
      id: "donation-1",
      status: "completed",
      stripe_payment_intent_id: "pi_1",
    });

    const outcome = await handleStripeWebhookEvent(
      supabase.client as never,
      {
        data: {
          object: {
            id: "pi_1",
            last_payment_error: {
              code: "card_declined",
              message: "The card was declined.",
            },
            object: "payment_intent",
          },
        },
        id: "evt_failed",
        object: "event",
        type: "payment_intent.payment_failed",
      } as never,
    );

    expect(outcome).toMatchObject({
      action: "terminal_status_preserved",
      donationId: "donation-1",
      handled: true,
      paymentIntentId: "pi_1",
    });
    expect(supabase.update).not.toHaveBeenCalled();
  });

  it("marks fully refunded charges as refunded", async () => {
    const supabase = createSupabaseDonationMock({
      amount: 5000,
      id: "donation-1",
      status: "completed",
      stripe_payment_intent_id: "pi_1",
    });

    const outcome = await handleStripeWebhookEvent(
      supabase.client as never,
      {
        data: {
          object: {
            amount_refunded: 5000,
            id: "ch_1",
            object: "charge",
            payment_intent: "pi_1",
          },
        },
        id: "evt_refunded",
        object: "event",
        type: "charge.refunded",
      } as never,
    );

    expect(outcome).toMatchObject({
      action: "charge_refunded",
      donationId: "donation-1",
      handled: true,
      paymentIntentId: "pi_1",
    });
    expect(supabase.updateValues[0]).toMatchObject({
      refund_amount: 5000,
      refunded_at: expect.any(String),
      status: "refunded",
      stripe_charge_id: "ch_1",
      updated_at: expect.any(String),
    });
  });
});
