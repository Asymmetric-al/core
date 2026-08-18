import { getAuthContext, type AuthContext } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  resolveGiftIntakeCharge,
  toGiftProcessingFeeStripeMetadata,
} from "../../src/donate/fee-policy";
import { processDonationSagaOutboxEvent } from "../../src/donate/saga";
import { resolveTenantStripe } from "../../src/stripe/tenant-client";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    log: vi.fn(),
    logDonation: vi.fn(),
    logPost: vi.fn(),
    logRoleChange: vi.fn(),
  })),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(
    (
      context: {
        isAuthenticated?: boolean;
        userId?: string | null;
        tenantId?: string | null;
        role?: string | null;
        profileId?: string | null;
      },
      roles: string[],
    ) => {
      if (
        !context?.isAuthenticated ||
        !context.userId ||
        !context.tenantId ||
        !context.role ||
        !context.profileId
      ) {
        throw new Error("Unauthorized");
      }
      if (!roles.includes(context.role)) {
        throw new Error(`Forbidden: requires one of ${roles.join(", ")} role`);
      }
    },
  ),
}));

vi.mock("../../src/stripe/tenant-client", () => ({
  resolveTenantStripe: vi.fn(),
}));

vi.mock("../../src/donate/saga", () => ({
  processDonationSagaOutboxEvent: vi.fn(),
}));

import { POST } from "../../src/donate";

const mockedGetAdminClient = vi.mocked(getAdminClient);
const mockedGetAuthContext = vi.mocked(getAuthContext);
const mockedCreateAuditLogger = vi.mocked(createAuditLogger);
const mockedResolveTenantStripe = vi.mocked(resolveTenantStripe);
const mockedProcessDonationSagaOutboxEvent = vi.mocked(
  processDonationSagaOutboxEvent,
);

const authenticatedDonor: AuthContext = {
  userId: "user-1",
  email: "donor@example.com",
  tenantId: "tenant-1",
  role: "donor",
  profileId: "profile-1",
  isAuthenticated: true,
  profileRole: "donor",
  memberships: [],
};

const beginRpcResult = {
  outbox_id: "outbox-1",
  donation_id: "donation-1",
  replayed: false,
};

function createDonateRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/donate", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "guest-giving-fee-policy-test",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/donate Gift processing-fee policy", () => {
  const rpcMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedCreateAuditLogger.mockReturnValue({
      log: vi.fn(),
      logDonation: vi.fn(),
      logPost: vi.fn(),
      logRoleChange: vi.fn(),
    } as never);
    mockedGetAuthContext.mockResolvedValue(authenticatedDonor);
    mockedGetAdminClient.mockReturnValue({
      client: { rpc: rpcMock } as never,
      error: null,
    });
    mockedResolveTenantStripe.mockResolvedValue({
      ok: true,
      stripe: { id: "stripe-client" } as never,
      secretKey: "rk_test_restricted",
      publishableKey: "pk_test_123",
    });
    mockedProcessDonationSagaOutboxEvent.mockResolvedValue({
      status: "completed",
      donationId: "donation-1",
      outboxId: "outbox-1",
      paymentIntentId: "pi_test",
      clientSecret: "cs_test",
    });
    rpcMock.mockResolvedValue({ data: beginRpcResult, error: null });
  });

  it("passes Gift intake charged cents as begin_donation_saga p_amount", async () => {
    const expectedQuote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: true,
      paymentMethod: "card",
    });

    const response = await POST(
      createDonateRequest({
        amount: 100,
        currency: "usd",
        cover_fees: true,
        payment_method: "card",
      }),
    );

    expect(response.status).toBe(200);
    expect(expectedQuote.chargedAmountCents).toBe(10330);
    expect(rpcMock).toHaveBeenCalledWith("begin_donation_saga", {
      p_tenant_id: "tenant-1",
      p_profile_id: "profile-1",
      p_actor_user_id: "user-1",
      p_amount: expectedQuote.chargedAmountCents,
      p_currency: "usd",
      p_missionary_id: null,
      p_fund_id: null,
      p_idempotency_key: "guest-giving-fee-policy-test",
      p_ip_address: null,
      p_user_agent: null,
    });
    expect(mockedProcessDonationSagaOutboxEvent).toHaveBeenCalledWith({
      supabaseAdmin: expect.anything(),
      stripe: { id: "stripe-client" },
      outboxId: "outbox-1",
      actorUserId: "user-1",
      extraPaymentIntentMetadata:
        toGiftProcessingFeeStripeMetadata(expectedQuote),
    });
  });

  it("charges the posted gift when older clients omit cover-fees flags", async () => {
    const expectedQuote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: false,
      paymentMethod: "card",
    });

    const response = await POST(
      createDonateRequest({
        amount: 100,
        currency: "usd",
      }),
    );

    expect(response.status).toBe(200);
    expect(expectedQuote.chargedAmountCents).toBe(10000);
    expect(rpcMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        p_amount: expectedQuote.chargedAmountCents,
      }),
    );
    expect(mockedProcessDonationSagaOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extraPaymentIntentMetadata:
          toGiftProcessingFeeStripeMetadata(expectedQuote),
      }),
    );
  });

  it("recomputes ACH charged cents from the gift, not a client total", async () => {
    const expectedQuote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: true,
      paymentMethod: "ach",
    });

    const response = await POST(
      createDonateRequest({
        amount: 100,
        currency: "usd",
        cover_fees: true,
        payment_method: "ach",
      }),
    );

    expect(response.status).toBe(200);
    expect(expectedQuote.chargedAmountCents).toBe(10081);
    expect(rpcMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        p_amount: expectedQuote.chargedAmountCents,
      }),
    );
  });
});
