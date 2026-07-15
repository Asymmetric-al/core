import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

const getAdminClientMock = vi.fn();
const getAuthContextMock = vi.fn();
const requireRoleMock = vi.fn();
const createAuditLoggerMock = vi.fn();
const loadStripeRawEventForReplayMock = vi.fn();
const markStripeRawEventForReplayMock = vi.fn();
const getRawPayloadEventMock = vi.fn();
const claimStripeRawEventMock = vi.fn();
const completeStripeRawEventMock = vi.fn();
const recordStripeRawEventFailureMock = vi.fn();
const handleStripeWebhookEventMock = vi.fn();
const revalidateAdminContributionsCacheMock = vi.fn();
const processDonationSagaOutboxEventMock = vi.fn();
const queueStagedGiftPostingToTwentyMock = vi.fn();

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireRole: requireRoleMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: createAuditLoggerMock,
}));

vi.mock("zod", () => {
  const stringSchema = {
    min: () => stringSchema,
    optional: () => stringSchema,
    uuid: () => stringSchema,
  };
  const objectSchema = {
    parse: (value: unknown) => value,
    refine: () => objectSchema,
  };

  return {
    z: {
      object: () => objectSchema,
      string: () => stringSchema,
    },
  };
});

vi.mock("@asym/env", () => ({
  serverEnv: {},
}));

vi.mock("../../../../../../packages/api/src/admin/crm/sync/config", () => ({
  resolveCrmSyncRuntimeConfig: vi.fn(() => ({})),
}));

vi.mock("../../../../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: processDonationSagaOutboxEventMock,
}));

vi.mock("../../../../../../packages/api/src/giving/staged-gifts", () => ({
  queueStagedGiftPostingToTwenty: queueStagedGiftPostingToTwentyMock,
}));

vi.mock("../../../../../../packages/api/src/shared/cache-tags", () => ({
  revalidateAdminContributionsCache: revalidateAdminContributionsCacheMock,
}));

vi.mock("../../../../../../packages/api/src/stripe/client", () => ({
  createStripeClient: vi.fn(() => ({})),
}));

vi.mock("../../../../../../packages/api/src/stripe/event-store", () => ({
  claimStripeRawEvent: claimStripeRawEventMock,
  completeStripeRawEvent: completeStripeRawEventMock,
  recordStripeRawEventFailure: recordStripeRawEventFailureMock,
}));

vi.mock("../../../../../../packages/api/src/stripe/replay", () => ({
  getRawPayloadEvent: getRawPayloadEventMock,
  loadStripeRawEventForReplay: loadStripeRawEventForReplayMock,
  markStripeRawEventForReplay: markStripeRawEventForReplayMock,
}));

vi.mock("../../../../../../packages/api/src/stripe/webhooks", () => ({
  handleStripeWebhookEvent: handleStripeWebhookEventMock,
}));

function createJsonRequest(body: unknown): NextRequest {
  return new Request(
    "https://admin.example.test/api/admin/contributions/replay",
    {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
      method: "POST",
    },
  ) as NextRequest;
}

async function loadPostRoute() {
  const route =
    await import("../../../../../../packages/api/src/admin/contributions/replay");
  return route.POST;
}

describe("admin contributions replay route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn() },
      error: null,
    });
    getAuthContextMock.mockResolvedValue({
      email: "admin@example.test",
      memberships: [],
      profileId: "profile_1",
      profileRole: "admin",
      role: "admin",
      tenantId: "tenant_1",
      userId: "user_1",
    });
    createAuditLoggerMock.mockReturnValue({});
    loadStripeRawEventForReplayMock.mockResolvedValue({
      id: "raw_1",
      stripeEventId: "evt_1",
    });
    markStripeRawEventForReplayMock.mockResolvedValue(undefined);
    getRawPayloadEventMock.mockReturnValue({
      id: "evt_1",
      type: "payment_intent.succeeded",
      data: { object: {} },
    });
    claimStripeRawEventMock.mockResolvedValue({
      claimed: true,
      lockId: "lock_1",
    });
    completeStripeRawEventMock.mockResolvedValue(undefined);
  });

  it("does not revalidate contribution cache for handled no-op Stripe outcomes", async () => {
    handleStripeWebhookEventMock.mockResolvedValue({
      action: "payment_intent_not_matched",
      handled: true,
      mutated: false,
      paymentIntentId: "pi_1",
      reason: "No donation matched the Stripe payment intent.",
    });
    const POST = await loadPostRoute();

    const response = await POST(createJsonRequest({ stripeEventId: "evt_1" }));

    expect(response.status).toBe(200);
    expect(revalidateAdminContributionsCacheMock).not.toHaveBeenCalled();
  });

  it("revalidates contribution cache for Stripe outcomes that wrote rows", async () => {
    handleStripeWebhookEventMock.mockResolvedValue({
      action: "payment_intent_completed",
      donationId: "donation_1",
      handled: true,
      mutated: true,
      paymentIntentId: "pi_1",
    });
    const POST = await loadPostRoute();

    const response = await POST(createJsonRequest({ stripeEventId: "evt_1" }));

    expect(response.status).toBe(200);
    expect(revalidateAdminContributionsCacheMock).toHaveBeenCalledWith(
      "tenant_1",
    );
  });
});
