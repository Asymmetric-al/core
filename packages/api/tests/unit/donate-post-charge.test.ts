import "./donate-checkout.mocks";

import { getAuthContext } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  authenticatedDonor,
  beginRpcResult,
  createDonateRequest,
  createDonationsFromMock,
  storedGift,
} from "./donate-checkout.fixture";
import { POST } from "../../src/donate";
import {
  resolveGiftIntakeCharge,
  toGiftProcessingFeeStripeMetadata,
} from "../../src/donate/fee-policy";
import { processDonationSagaOutboxEvent } from "../../src/donate/saga";
import { resolveTenantSettlementCurrency } from "../../src/money/settlement";
import { resolveTenantStripe } from "../../src/stripe/tenant-client";

const mockedGetAdminClient = vi.mocked(getAdminClient);
const mockedGetAuthContext = vi.mocked(getAuthContext);
const mockedCreateAuditLogger = vi.mocked(createAuditLogger);
const mockedResolveTenantStripe = vi.mocked(resolveTenantStripe);
const mockedProcessDonationSagaOutboxEvent = vi.mocked(
  processDonationSagaOutboxEvent,
);

function createReplayFromMock(options: {
  storedAmount: number | null;
  storedFeeExtras?: Record<string, string> | null;
  feeExtrasError?: { message: string };
}) {
  return vi.fn((table: string) => {
    if (table === "donations") {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () =>
                options.storedAmount == null
                  ? { data: null, error: { message: "Donation not found" } }
                  : { data: storedGift(options.storedAmount), error: null },
            }),
          }),
        }),
      };
    }

    expect(table).toBe("donation_saga_outbox");
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () =>
              options.feeExtrasError
                ? { data: null, error: options.feeExtrasError }
                : {
                    data: { fee_extras: options.storedFeeExtras ?? {} },
                    error: null,
                  },
          }),
        }),
      }),
    };
  });
}

describe("POST /api/donate Gift processing-fee policy", () => {
  const rpcMock = vi.fn();
  let storedDonationAmount: number | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    storedDonationAmount = null;
    vi.mocked(resolveTenantSettlementCurrency).mockResolvedValue("USD");
    mockedCreateAuditLogger.mockReturnValue({
      log: vi.fn(),
      logDonation: vi.fn(),
      logPost: vi.fn(),
      logRoleChange: vi.fn(),
    } as never);
    mockedGetAuthContext.mockResolvedValue(authenticatedDonor);
    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createDonationsFromMock(storedDonationAmount),
      } as never,
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

  it.each([1.001, 0.299, "1.00000000000000001"])(
    "rejects excessive precision %s before gift/provider effects",
    async (amount) => {
      const response = await POST(
        createDonateRequest({ amount, currency: "usd" }),
      );
      expect(response.status).toBe(400);
      expect(rpcMock).not.toHaveBeenCalled();
      expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
    },
  );

  it("fails closed before gift/provider effects when settlement context is unavailable", async () => {
    vi.mocked(resolveTenantSettlementCurrency).mockResolvedValue(null);
    const response = await POST(
      createDonateRequest({ amount: 25, currency: "usd" }),
    );
    expect(response.status).toBe(503);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
  });

  it("rejects a mismatched resolved currency before gift/provider effects", async () => {
    vi.mocked(resolveTenantSettlementCurrency).mockResolvedValue(
      "EUR" as "USD",
    );
    const response = await POST(
      createDonateRequest({ amount: 25, currency: "usd" }),
    );
    expect(response.status).toBe(400);
    expect(rpcMock).not.toHaveBeenCalled();
    expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
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
      p_fee_extras: toGiftProcessingFeeStripeMetadata(expectedQuote),
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
        p_fee_extras: toGiftProcessingFeeStripeMetadata(expectedQuote),
      }),
    );
    expect(mockedProcessDonationSagaOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extraPaymentIntentMetadata:
          toGiftProcessingFeeStripeMetadata(expectedQuote),
      }),
    );
    expect(
      toGiftProcessingFeeStripeMetadata(expectedQuote).payment_method,
    ).toBe("ach");
  });

  it("rejects a non-USD cover-fees Gift instead of applying the US schedule", async () => {
    const response = await POST(
      createDonateRequest({
        amount: 100,
        currency: "eur",
        cover_fees: true,
        payment_method: "card",
      }),
    );

    expect(response.status).toBe(400);
    expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("refuses a replay belonging to a different profile of the same tenant before provider effects", async () => {
    mockedGetAuthContext.mockResolvedValue({
      ...authenticatedDonor,
      userId: "user-2",
      profileId: "profile-2",
    });
    const createIntent = vi.fn();
    mockedResolveTenantStripe.mockResolvedValue({
      ok: true,
      stripe: { paymentIntents: { create: createIntent } } as never,
      secretKey: "test",
      publishableKey: "test",
    });
    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createReplayFromMock({
          storedAmount: 10000,
          storedFeeExtras: {},
        }),
      } as never,
      error: null,
    });
    rpcMock.mockResolvedValue({
      data: { ...beginRpcResult, replayed: true },
      error: null,
    });
    const response = await POST(
      createDonateRequest({ amount: 100, currency: "usd" }),
    );
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      error: "Idempotency key already used",
      requestId: expect.any(String),
    });
    expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
    expect(createIntent).not.toHaveBeenCalled();
  });

  it("returns 409 when a replayed saga charged a different amount", async () => {
    storedDonationAmount = 10000;
    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createDonationsFromMock(storedDonationAmount),
      } as never,
      error: null,
    });
    rpcMock.mockResolvedValue({
      data: { ...beginRpcResult, replayed: true },
      error: null,
    });

    const response = await POST(
      createDonateRequest({
        amount: 100,
        currency: "usd",
        cover_fees: true,
        payment_method: "card",
      }),
    );

    expect(response.status).toBe(409);
    expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
  });

  it.each(["completed", "processing"] as const)(
    "continues a matching legacy replay without new fee metadata when the saga is %s",
    async (status) => {
      mockedGetAdminClient.mockReturnValue({
        client: {
          rpc: rpcMock,
          from: createReplayFromMock({
            storedAmount: 10000,
            storedFeeExtras: {},
          }),
        } as never,
        error: null,
      });
      rpcMock.mockResolvedValue({
        data: { ...beginRpcResult, replayed: true },
        error: null,
      });
      mockedProcessDonationSagaOutboxEvent.mockResolvedValue({
        status,
        donationId: "donation-1",
        outboxId: "outbox-1",
        ...(status === "completed"
          ? { paymentIntentId: "pi_legacy", clientSecret: "cs_legacy" }
          : {}),
      });

      const response = await POST(
        createDonateRequest({ amount: 100, currency: "usd" }),
      );

      expect(response.status).toBe(status === "completed" ? 200 : 202);
      expect(
        mockedProcessDonationSagaOutboxEvent,
      ).toHaveBeenCalledExactlyOnceWith({
        supabaseAdmin: expect.anything(),
        stripe: { id: "stripe-client" },
        outboxId: "outbox-1",
        actorUserId: "user-1",
        extraPaymentIntentMetadata: undefined,
        replayFeeQuote: toGiftProcessingFeeStripeMetadata(
          resolveGiftIntakeCharge({
            amount: 100,
            coverFees: false,
            paymentMethod: "card",
          }),
        ),
      });
      expect(await response.json()).toMatchObject(
        status === "completed"
          ? {
              paymentIntentId: "pi_legacy",
              clientSecret: "cs_legacy",
              replayed: true,
            }
          : { donationId: "donation-1", outboxId: "outbox-1", status },
      );
    },
  );

  it("replays a matching Gift with the current fee metadata so PI params stay bound", async () => {
    const expectedQuote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: false,
      paymentMethod: "card",
    });
    storedDonationAmount = expectedQuote.chargedAmountCents;
    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createReplayFromMock({
          storedAmount: storedDonationAmount,
          storedFeeExtras: toGiftProcessingFeeStripeMetadata(expectedQuote),
        }),
      } as never,
      error: null,
    });
    rpcMock.mockResolvedValue({
      data: { ...beginRpcResult, replayed: true },
      error: null,
    });

    const response = await POST(
      createDonateRequest({
        amount: 100,
        currency: "usd",
        cover_fees: false,
        payment_method: "card",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockedProcessDonationSagaOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extraPaymentIntentMetadata:
          toGiftProcessingFeeStripeMetadata(expectedQuote),
      }),
    );
  });

  it("replays a matching charged-cents Gift when stored fee extras are the empty legacy default", async () => {
    const expectedQuote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: false,
      paymentMethod: "card",
    });
    storedDonationAmount = expectedQuote.chargedAmountCents;
    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createReplayFromMock({
          storedAmount: storedDonationAmount,
          storedFeeExtras: {},
        }),
      } as never,
      error: null,
    });
    rpcMock.mockResolvedValue({
      data: { ...beginRpcResult, replayed: true },
      error: null,
    });

    const response = await POST(
      createDonateRequest({
        amount: 100,
        currency: "usd",
        cover_fees: false,
        payment_method: "card",
      }),
    );

    expect(response.status).toBe(200);
    expect(mockedProcessDonationSagaOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extraPaymentIntentMetadata: undefined,
      }),
    );
  });

  it("keeps ACH payment_method extras on a matching charged-cents replay", async () => {
    const expectedQuote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: true,
      paymentMethod: "ach",
    });
    storedDonationAmount = expectedQuote.chargedAmountCents;
    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createReplayFromMock({
          storedAmount: storedDonationAmount,
          storedFeeExtras: toGiftProcessingFeeStripeMetadata(expectedQuote),
        }),
      } as never,
      error: null,
    });
    rpcMock.mockResolvedValue({
      data: { ...beginRpcResult, replayed: true },
      error: null,
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
    expect(mockedProcessDonationSagaOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extraPaymentIntentMetadata:
          toGiftProcessingFeeStripeMetadata(expectedQuote),
      }),
    );
    expect(
      toGiftProcessingFeeStripeMetadata(expectedQuote).payment_method,
    ).toBe("ach");
  });

  it("returns 409 when a replayed saga matches charged cents but not fee extras", async () => {
    const storedAchCoverQuote = resolveGiftIntakeCharge({
      amount: 100,
      coverFees: true,
      paymentMethod: "ach",
    });
    const collidingCardQuote = resolveGiftIntakeCharge({
      amount: 100.81,
      coverFees: false,
      paymentMethod: "card",
    });
    expect(storedAchCoverQuote.chargedAmountCents).toBe(
      collidingCardQuote.chargedAmountCents,
    );

    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createReplayFromMock({
          storedAmount: storedAchCoverQuote.chargedAmountCents,
          storedFeeExtras:
            toGiftProcessingFeeStripeMetadata(storedAchCoverQuote),
        }),
      } as never,
      error: null,
    });
    rpcMock.mockResolvedValue({
      data: { ...beginRpcResult, replayed: true },
      error: null,
    });

    const response = await POST(
      createDonateRequest({
        amount: 100.81,
        currency: "usd",
        cover_fees: false,
        payment_method: "card",
      }),
    );

    expect(response.status).toBe(409);
    expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
  });

  it("returns 500 when stored Gift fee extras are malformed on replay", async () => {
    const collidingCardQuote = resolveGiftIntakeCharge({
      amount: 100.81,
      coverFees: false,
      paymentMethod: "card",
    });
    mockedGetAdminClient.mockReturnValue({
      client: {
        rpc: rpcMock,
        from: createReplayFromMock({
          storedAmount: collidingCardQuote.chargedAmountCents,
          storedFeeExtras: { payment_method: "ach" },
        }),
      } as never,
      error: null,
    });
    rpcMock.mockResolvedValue({
      data: { ...beginRpcResult, replayed: true },
      error: null,
    });

    const response = await POST(
      createDonateRequest({
        amount: 100.81,
        currency: "usd",
        cover_fees: false,
        payment_method: "card",
      }),
    );

    expect(response.status).toBe(500);
    expect(mockedProcessDonationSagaOutboxEvent).not.toHaveBeenCalled();
  });
});
