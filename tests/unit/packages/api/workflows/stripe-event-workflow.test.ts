import { createHmac } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InngestTestEngine } from "@inngest/test";

import type { NextRequest } from "next/server";

const {
  storeStripeRawEventMock,
  claimStripeRawEventMock,
  completeStripeRawEventMock,
  recordStripeRawEventFailureMock,
  requestWorkflowDispatchMock,
  getAdminClientMock,
} = vi.hoisted(() => ({
  storeStripeRawEventMock: vi.fn(),
  claimStripeRawEventMock: vi.fn(),
  completeStripeRawEventMock: vi.fn(),
  recordStripeRawEventFailureMock: vi.fn(),
  requestWorkflowDispatchMock: vi.fn(),
  getAdminClientMock: vi.fn(),
}));

vi.mock("../../../../../packages/api/src/stripe/event-store", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../../packages/api/src/stripe/event-store")
  >("../../../../../packages/api/src/stripe/event-store");
  return {
    ...actual,
    storeStripeRawEvent: storeStripeRawEventMock,
    claimStripeRawEvent: claimStripeRawEventMock,
    completeStripeRawEvent: completeStripeRawEventMock,
    recordStripeRawEventFailure: recordStripeRawEventFailureMock,
  };
});

vi.mock("../../../../../packages/api/src/workflows/ledger", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../../packages/api/src/workflows/ledger")
  >("../../../../../packages/api/src/workflows/ledger");
  return {
    ...actual,
    requestWorkflowDispatch: requestWorkflowDispatchMock,
  };
});

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

import { STRIPE_EVENT_PROCESS_EVENT } from "../../../../../packages/api/src/workflows/events";
import { stripeEventProcessing } from "../../../../../packages/api/src/workflows/functions/stripe-event-processing";
import { POST } from "../../../../../packages/api/src/stripe/webhooks";

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const RAW_EVENT_ID = "raw-event-1";

function storedEvent(overrides: Record<string, unknown> = {}) {
  return {
    id: RAW_EVENT_ID,
    stripeEventId: "evt_1",
    eventType: "payment_intent.succeeded",
    tenantId: TENANT_ID,
    donationId: null,
    stagedGiftId: null,
    processingStatus: "received",
    processAttempts: 0,
    correlationId: "corr-1",
    duplicate: false,
    rawPayload: {},
    ...overrides,
  };
}

function createSignedStripeRequest(payload: unknown, webhookSecret: string) {
  const body = JSON.stringify(payload);
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${body}`)
    .digest("hex");

  return new Request("https://example.com/api/webhooks/stripe", {
    body,
    headers: {
      "content-type": "application/json",
      "stripe-signature": `t=${timestamp},v1=${digest}`,
    },
    method: "POST",
  }) as NextRequest;
}

function paymentIntentEvent() {
  return {
    id: "evt_1",
    object: "event",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_1",
        object: "payment_intent",
        metadata: { tenant_id: TENANT_ID, donation_id: "donation-1" },
      },
    },
  };
}

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.STRIPE_SECRET_KEY = "sk_test_unit";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_unit";
  storeStripeRawEventMock.mockReset();
  claimStripeRawEventMock.mockReset();
  completeStripeRawEventMock.mockReset();
  recordStripeRawEventFailureMock.mockReset();
  requestWorkflowDispatchMock.mockReset();
  getAdminClientMock.mockReset();
  getAdminClientMock.mockReturnValue({ client: {}, error: null });
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("Stripe webhook workflow handoff (#291)", () => {
  it("acknowledges a stored supported event after dispatching follow-up work", async () => {
    storeStripeRawEventMock.mockResolvedValue(storedEvent());
    requestWorkflowDispatchMock.mockResolvedValue({
      outcome: "dispatched",
      request: { id: "req-1" },
      reused: false,
      error: null,
    });

    const response = await POST(
      createSignedStripeRequest(paymentIntentEvent(), "whsec_unit"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      action: "workflow_dispatch",
      dispatch: "dispatched",
      received: true,
      rawEventId: RAW_EVENT_ID,
    });
    expect(requestWorkflowDispatchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: TENANT_ID,
        productArea: "giving",
        workflowName: STRIPE_EVENT_PROCESS_EVENT,
        subject: { type: "stripe_raw_event", id: RAW_EVENT_ID },
        idempotencyKey: "stripe-event/evt_1",
      }),
    );
    expect(claimStripeRawEventMock).not.toHaveBeenCalled();
  });

  it("still acknowledges the stored event when immediate dispatch fails", async () => {
    storeStripeRawEventMock.mockResolvedValue(storedEvent());
    requestWorkflowDispatchMock.mockResolvedValue({
      outcome: "failed",
      request: { id: "req-1" },
      reused: false,
      error: "connect ECONNREFUSED",
    });

    const response = await POST(
      createSignedStripeRequest(paymentIntentEvent(), "whsec_unit"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      received: true,
      dispatch: "failed",
    });
  });

  it("stores unsupported events and marks them ignored with a safe reason", async () => {
    storeStripeRawEventMock.mockResolvedValue(
      storedEvent({ eventType: "customer.created" }),
    );
    claimStripeRawEventMock.mockResolvedValue({
      claimed: true,
      lockId: "lock-1",
      rawEvent: storedEvent({ eventType: "customer.created" }),
    });
    completeStripeRawEventMock.mockResolvedValue(undefined);

    const unsupported = {
      ...paymentIntentEvent(),
      type: "customer.created",
    };
    const response = await POST(
      createSignedStripeRequest(unsupported, "whsec_unit"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ action: "ignored", handled: false });
    expect(body.reason).toContain("customer.created");
    expect(requestWorkflowDispatchMock).not.toHaveBeenCalled();
    expect(completeStripeRawEventMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ignored" }),
    );
  });
});

describe("stripe-event-processing workflow function (#291)", () => {
  it("skips work when the stored event is already claimed elsewhere", async () => {
    claimStripeRawEventMock.mockResolvedValue({
      claimed: false,
      lockId: "lock-x",
      rawEvent: storedEvent({ processingStatus: "processed" }),
    });

    const engine = new InngestTestEngine({ function: stripeEventProcessing });
    const { result } = await engine.execute({
      events: [
        {
          name: STRIPE_EVENT_PROCESS_EVENT,
          data: {
            tenantId: TENANT_ID,
            workflowName: STRIPE_EVENT_PROCESS_EVENT,
            schemaVersion: 1,
            subject: { type: "stripe_raw_event", id: RAW_EVENT_ID },
          },
        },
      ],
    });

    expect(result).toMatchObject({
      skipped: true,
      processingStatus: "processed",
    });
    expect(completeStripeRawEventMock).not.toHaveBeenCalled();
  });

  it("processes a claimed stored event and completes it", async () => {
    claimStripeRawEventMock.mockResolvedValue({
      claimed: true,
      lockId: "lock-1",
      rawEvent: storedEvent({
        eventType: "customer.created",
        rawPayload: {
          id: "evt_1",
          type: "customer.created",
          data: { object: { id: "cus_1", object: "customer" } },
        },
      }),
    });
    completeStripeRawEventMock.mockResolvedValue(undefined);

    const engine = new InngestTestEngine({ function: stripeEventProcessing });
    const { result } = await engine.execute({
      events: [
        {
          name: STRIPE_EVENT_PROCESS_EVENT,
          data: {
            tenantId: TENANT_ID,
            workflowName: STRIPE_EVENT_PROCESS_EVENT,
            schemaVersion: 1,
            subject: { type: "stripe_raw_event", id: RAW_EVENT_ID },
          },
        },
      ],
    });

    expect(result).toMatchObject({ action: "ignored", handled: false });
    expect(completeStripeRawEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rawEventId: RAW_EVENT_ID,
        lockId: "lock-1",
        status: "ignored",
      }),
    );
  });

  it("records processing failures for retry and dead-letter handling", async () => {
    const failingClient = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi
              .fn()
              .mockResolvedValue({ data: null, error: { message: "db down" } }),
          })),
        })),
      })),
    };
    getAdminClientMock.mockReturnValue({ client: failingClient, error: null });
    claimStripeRawEventMock.mockResolvedValue({
      claimed: true,
      lockId: "lock-1",
      rawEvent: storedEvent({
        eventType: "invoice.paid",
        rawPayload: {
          id: "evt_1",
          type: "invoice.paid",
          data: { object: { id: "in_1", object: "invoice", subscription: "sub_1" } },
        },
      }),
    });
    recordStripeRawEventFailureMock.mockResolvedValue(undefined);

    const engine = new InngestTestEngine({ function: stripeEventProcessing });
    const { error } = await engine.execute({
      events: [
        {
          name: STRIPE_EVENT_PROCESS_EVENT,
          data: {
            tenantId: TENANT_ID,
            workflowName: STRIPE_EVENT_PROCESS_EVENT,
            schemaVersion: 1,
            subject: { type: "stripe_raw_event", id: RAW_EVENT_ID },
          },
        },
      ],
    });

    expect(error).toBeDefined();
    expect(recordStripeRawEventFailureMock).toHaveBeenCalledWith(
      expect.objectContaining({ rawEventId: RAW_EVENT_ID, lockId: "lock-1" }),
    );
  });
});
