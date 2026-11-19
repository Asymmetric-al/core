import "./donate-checkout.mocks";

import { isDeepStrictEqual } from "node:util";

import { getAuthContext } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  authenticatedDonor,
  beginRpcResult,
  createDonateRequest,
  createDonationsFromMock,
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
const mockedResolveTenantStripe = vi.mocked(resolveTenantStripe);
const mockedProcessDonationSagaOutboxEvent = vi.mocked(
  processDonationSagaOutboxEvent,
);

describe("POST /api/donate saga replay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveTenantSettlementCurrency).mockResolvedValue("USD");
    mockedGetAuthContext.mockResolvedValue(authenticatedDonor);
  });

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
      label: "foreign donor on customer creation",
      amountCents: 10000,
      paymentMethod: "card",
      coverFees: false,
      quoted: false,
      missingCustomer: true,
      changesDuringClaim: false,
    },
    {
      label: "foreign donor with a cached customer",
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
      label,
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
        if (table === "donors") {
          const row = {
            id: "donor-1",
            tenant_id: label.startsWith("foreign donor")
              ? "another-tenant"
              : authenticatedDonor.tenantId,
            profile_id: "profile-1",
            stripe_customer_id: null,
          };
          const filters = new Map<string, string>();
          const query = {
            eq(column: string, value: string) {
              filters.set(column, value);
              return query;
            },
            single: async () => ({
              data: [...filters].every(
                ([column, value]) => row[column as keyof typeof row] === value,
              )
                ? row
                : null,
              error: null,
            }),
          };
          return { select: () => query };
        }
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
      if (label.startsWith("foreign donor")) {
        const response = await POST(createDonateRequest(requestBody));
        expect(response.status).toBe(500);
        expect(await response.json()).toMatchObject({
          error: expect.stringContaining("Donor not found"),
        });
        expect(createPaymentIntent).not.toHaveBeenCalled();
        expect(createCustomer).not.toHaveBeenCalled();
        return;
      }
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
              payment_method_types: ["us_bank_account"],
              metadata: quote,
            }
          : {
              amount: amountCents,
              automatic_payment_methods: { enabled: true },
            },
      );
      if (!quoted) {
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
});
