import { describe, expect, it } from "vitest";

import {
  classifyStripeWebhookProcessingError,
  resolveStripeEventReferences,
  sha256Hex,
} from "../../../../packages/api/src/stripe/event-store";

describe("Stripe raw event store helpers", () => {
  it("hashes raw webhook payloads without storing signature values", () => {
    expect(sha256Hex('{"id":"evt_1"}')).toMatch(/^[a-f0-9]{64}$/);
    expect(sha256Hex('{"id":"evt_1"}')).toBe(sha256Hex('{"id":"evt_1"}'));
  });

  it("resolves tenant and donation references from payment intent metadata", async () => {
    const references = await resolveStripeEventReferences({
      data: {
        object: {
          id: "pi_1",
          object: "payment_intent",
          metadata: {
            donation_id: "donation-1",
            tenant_id: "tenant-1",
          },
        },
      },
      id: "evt_1",
      object: "event",
      type: "payment_intent.succeeded",
    } as never);

    expect(references).toEqual({
      chargeId: null,
      donationId: "donation-1",
      paymentIntentId: "pi_1",
      tenantId: "tenant-1",
    });
  });

  it("classifies missing-record errors as permanent and database errors as retryable", () => {
    expect(
      classifyStripeWebhookProcessingError(new Error("Donation not found")),
    ).toMatchObject({
      code: "stripe_webhook_permanent_processing_error",
      retryable: false,
    });

    expect(
      classifyStripeWebhookProcessingError(new Error("database timeout")),
    ).toMatchObject({
      code: "stripe_webhook_retryable_processing_error",
      retryable: true,
    });
  });
});
