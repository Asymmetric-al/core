import { isDeepStrictEqual } from "node:util";

import { getAuthContext, type AuthContext } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../../src/donate";
import {
  resolveGiftIntakeCharge,
  toGiftProcessingFeeStripeMetadata,
} from "../../src/donate/fee-policy";
import { processDonationSagaOutboxEvent } from "../../src/donate/saga";
import { resolveTenantSettlementCurrency } from "../../src/money/settlement";
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

vi.mock("../../src/money/settlement", () => ({
  resolveTenantSettlementCurrency: vi.fn(),
}));

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

function createDonationsFromMock(storedAmount: number | null) {
  return vi.fn((table: string) => {
    expect(table).toBe("donations");
    return {
      select: () => ({
        eq: () => ({
          eq: () => ({
            single: async () =>
              storedAmount == null
                ? { data: null, error: { message: "Donation not found" } }
                : { data: { amount: storedAmount }, error: null },
          }),
        }),
      }),
    };
  });
}

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
                  : { data: { amount: options.storedAmount }, error: null },
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

  it.each([
    {
      label: "legacy card",
      amountCents: 10000,
      paymentMethod: "card",
      coverFees: false,
      quoted: false,
      missingCustomer: false,
      changesDuringClaim: false,
    },
    {
      label: "legacy cover-card",
      amountCents: 10330,
      paymentMethod: "card",
      coverFees: true,
      quoted: false,
      missingCustomer: false,
      changesDuringClaim: false,
    },
    {
      label: "legacy cover-ACH with an unpersisted customer",
      amountCents: 10081,
      paymentMethod: "ach",
      coverFees: true,
      quoted: false,
      missingCustomer: true,
      changesDuringClaim: false,
    },
    {
      label: "new quoted cover-ACH with an unpersisted customer",
      amountCents: 10081,
      paymentMethod: "ach",
      coverFees: true,
      quoted: true,
      missingCustomer: true,
      changesDuringClaim: false,
    },
    {
      label: "conflicting quote before first claim",
      amountCents: 10000,
      paymentMethod: "card",
      coverFees: false,
      quoted: false,
      missingCustomer: false,
      changesDuringClaim: true,
    },
  ] as const)(
    "preserves payment replay state: $label",
    async ({
      amountCents,
      paymentMethod,
      coverFees,
      quoted,
      missingCustomer,
      changesDuringClaim,
    }) => {
      const requestBody = {
        amount: 100,
        currency: "usd",
        cover_fees: coverFees,
        payment_method: paymentMethod,
      };
      const quote = toGiftProcessingFeeStripeMetadata(
        resolveGiftIntakeCharge({ amount: 100, coverFees, paymentMethod }),
      );
      const { processDonationSagaOutboxEvent: processActualSaga } =
        await vi.importActual<{
          processDonationSagaOutboxEvent: typeof processDonationSagaOutboxEvent;
        }>("../../src/donate/saga");
      const row: {
        fee_extras: Record<string, string>;
        status: string;
        attempts: number;
      } = { fee_extras: quoted ? quote : {}, status: "pending", attempts: 0 };
      let completionFails = true;
      const providerRequests = new Map<string, unknown>();
      const createPaymentIntent = vi.fn(
        async (params: unknown, options: { idempotencyKey: string }) => {
          const previous = providerRequests.get(options.idempotencyKey);
          if (previous && !isDeepStrictEqual(previous, params)) {
            throw new Error("Idempotency key parameters changed on retry");
          }
          providerRequests.set(options.idempotencyKey, params);
          return {
            id: "pi_legacy",
            client_secret: "cs_legacy",
            status: "requires_payment_method",
          };
        },
      );
      const customerRequests = new Map<string, unknown>();
      const createCustomer = vi.fn(
        async (params: unknown, options: { idempotencyKey: string }) => {
          const previous = customerRequests.get(options.idempotencyKey);
          if (previous && !isDeepStrictEqual(previous, params)) {
            throw new Error("Customer parameters changed on retry");
          }
          customerRequests.set(options.idempotencyKey, params);
          return { id: "cus_existing" };
        },
      );
      const stripe = {
        paymentIntents: { create: createPaymentIntent },
        customers: { create: createCustomer },
      };
      const updateFeeExtras = vi.fn(
        (value: { fee_extras: Record<string, string> }) => ({
          eq: async () => {
            row.fee_extras = value.fee_extras;
            return { data: null, error: null };
          },
        }),
      );
      const rpc = vi.fn(async (name: string, args: Record<string, unknown>) => {
        if (name === "begin_donation_saga") {
          return {
            data: { ...beginRpcResult, replayed: row.attempts > 0 || !quoted },
            error: null,
          };
        }
        if (
          name === "claim_donation_saga_event" ||
          name === "claim_donation_saga_event_with_fee_quote"
        ) {
          if (changesDuringClaim) {
            row.fee_extras = toGiftProcessingFeeStripeMetadata(
              resolveGiftIntakeCharge({
                amount: 100,
                coverFees: false,
                paymentMethod: "ach",
              }),
            );
          }
          if (
            name === "claim_donation_saga_event_with_fee_quote" &&
            Object.keys(row.fee_extras).length > 0 &&
            !isDeepStrictEqual(row.fee_extras, args.p_expected_fee_extras)
          ) {
            return {
              data: { claimed: false, fee_quote_conflict: true },
              error: null,
            };
          }
          row.status = "processing";
          row.attempts++;
          return {
            data: {
              claimed: true,
              donation_id: "donation-1",
              donor_id: "donor-1",
              tenant_id: "tenant-1",
              amount: amountCents,
              currency: "usd",
              attempt_count: row.attempts,
              idempotency_key: "guest-giving-fee-policy-test",
              stripe_customer_id: missingCustomer ? null : "cus_existing",
            },
            error: null,
          };
        }
        if (name === "complete_donation_saga_event") {
          if (completionFails) {
            completionFails = false;
            return {
              data: null,
              error: { message: "completion write failed" },
            };
          }
          row.status = "completed";
          return { data: { completed: true }, error: null };
        }
        if (name === "record_donation_saga_failure") {
          row.status = "pending";
          return { data: null, error: null };
        }
        throw new Error(`Unexpected RPC: ${name}`);
      });
      const readExtras = async () => ({
        data: { fee_extras: row.fee_extras },
        error: null,
      });
      const from = vi.fn((table: string) => {
        if (table === "donations")
          return createDonationsFromMock(amountCents)(table);
        if (table === "donors")
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: {
                    id: "donor-1",
                    profile_id: "profile-1",
                    stripe_customer_id: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        if (table === "profiles")
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: {
                    email: "donor@example.com",
                    first_name: "Test",
                    last_name: "Donor",
                  },
                  error: null,
                }),
              }),
            }),
          };
        expect(table).toBe("donation_saga_outbox");
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: readExtras,
              eq: () => ({ single: readExtras }),
            }),
          }),
          update: updateFeeExtras,
        };
      });
      const client = { from, rpc };
      mockedGetAdminClient.mockReturnValue({
        client: client as never,
        error: null,
      });
      mockedResolveTenantStripe.mockResolvedValue({
        ok: true,
        stripe: stripe as never,
        secretKey: "rk_test_restricted",
        publishableKey: "pk_test_123",
      });
      mockedProcessDonationSagaOutboxEvent.mockImplementation(
        processActualSaga,
      );
      if (changesDuringClaim) {
        expect(row.attempts).toBe(0);
      } else if (quoted) {
        const firstResponse = await POST(createDonateRequest(requestBody));
        expect(firstResponse.status).toBe(500);
      } else {
        await expect(
          processActualSaga({
            supabaseAdmin: client as never,
            stripe: stripe as never,
            outboxId: "outbox-1",
            actorUserId: "user-1",
          }),
        ).rejects.toThrow("completion write failed");
      }
      expect(row.status).toBe("pending");
      expect(providerRequests.size).toBe(changesDuringClaim ? 0 : 1);

      const response = await POST(createDonateRequest(requestBody));

      if (changesDuringClaim) {
        expect(response.status).toBe(409);
        expect(await response.json()).toMatchObject({
          error:
            "This idempotency key was already used for a different gift fee quote.",
        });
        expect(createPaymentIntent).not.toHaveBeenCalled();
        expect(createCustomer).not.toHaveBeenCalled();
        expect(updateFeeExtras).not.toHaveBeenCalled();
        expect(row.attempts).toBe(0);
        expect(row.status).toBe("pending");
        expect(
          rpc.mock.calls.some(
            ([name]) => name === "record_donation_saga_failure",
          ),
        ).toBe(false);
        return;
      }
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        paymentIntentId: "pi_legacy",
        clientSecret: "cs_legacy",
        replayed: true,
      });
      expect(row).toEqual({
        fee_extras: quoted ? quote : {},
        status: "completed",
        attempts: 2,
      });
      expect(updateFeeExtras).not.toHaveBeenCalled();
      expect(providerRequests.size).toBe(1);
      expect(createPaymentIntent.mock.calls[0]?.[0]).toMatchObject(
        quoted
          ? {
              amount: amountCents,
              allowed_payment_method_types: ["us_bank_account"],
              metadata: quote,
            }
          : {
              amount: amountCents,
              automatic_payment_methods: { enabled: true },
            },
      );
      if (!quoted) {
        expect(createPaymentIntent.mock.calls[0]?.[0]).not.toHaveProperty(
          "allowed_payment_method_types",
        );
        expect(createPaymentIntent.mock.calls[0]?.[0]).not.toHaveProperty(
          "payment_method_types",
        );
        expect(createPaymentIntent.mock.calls[0]?.[0]).not.toHaveProperty(
          "metadata.gift_amount_cents",
        );
      }
      expect(createCustomer).toHaveBeenCalledTimes(missingCustomer ? 2 : 0);
      if (missingCustomer) {
        expect(customerRequests.size).toBe(1);
        expect(createCustomer.mock.calls[1]).toEqual(
          createCustomer.mock.calls[0],
        );
        expect(createCustomer.mock.calls[0]?.[1]).toEqual({
          idempotencyKey: "guest-giving-fee-policy-test:customer",
        });
      }
      expect(createPaymentIntent).toHaveBeenCalledTimes(2);
      expect(createPaymentIntent.mock.calls[1]).toEqual(
        createPaymentIntent.mock.calls[0],
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
