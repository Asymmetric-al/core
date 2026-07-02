import { serverEnv } from "@asym/env";
import { describe, expect, it } from "vitest";

import { createContributionActionDependencies } from "../../../../../packages/api/src/admin/contribution-operations/dependencies";
import { refundContributionThroughStripe } from "../../../../../packages/api/src/admin/contribution-operations/refunds";
import {
  correctionStatusForProviderOutcome,
  isFailedProviderOutcomeStatus,
} from "../../../../../packages/api/src/admin/contribution-operations/types";

import type { StripeRefundsApi } from "../../../../../packages/api/src/stripe/refunds";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

const TENANT_ID = "tenant-1";
const DONATION_ID = "donation-1";
const TENANT_STRIPE_KEY = "sk_test_tenant_key";
const IDEMPOTENCY_KEY = "contribution-action/tenant-1/donation-1/refund/key-1";

type Row = Record<string, unknown>;

interface RecordedUpdate {
  table: string;
  patch: Record<string, unknown>;
  filters: Record<string, unknown>;
}

interface SupabaseStubOptions {
  donation: Row;
  tenant?: Row | null;
  donationUpdateError?: string | null;
}

function donationRow(overrides: Row = {}): Row {
  return {
    id: DONATION_ID,
    tenant_id: TENANT_ID,
    donor_id: null,
    missionary_id: null,
    fund_id: null,
    amount: 5000,
    currency: "usd",
    status: "completed",
    stripe_payment_intent_id: "pi_1",
    stripe_charge_id: "ch_1",
    refund_amount: 0,
    refunded_at: null,
    pledge_id: null,
    gift_date: "2026-06-01",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

class TableQuery {
  private filters: Record<string, unknown> = {};
  private patch: Record<string, unknown> | null = null;

  constructor(
    private readonly table: string,
    private readonly rows: Row[],
    private readonly updates: RecordedUpdate[],
    private readonly updateError: string | null,
  ) {}

  select() {
    return this;
  }

  update(patch: Record<string, unknown>) {
    this.patch = patch;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;
    return this;
  }

  in() {
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  private match(): Row[] {
    return this.rows.filter((row) =>
      Object.entries(this.filters).every(([key, value]) => row[key] === value),
    );
  }

  private result(): { data: unknown; error: { message: string } | null } {
    if (this.patch) {
      if (this.updateError) {
        return { data: null, error: { message: this.updateError } };
      }
      this.updates.push({
        table: this.table,
        patch: this.patch,
        filters: this.filters,
      });
      return { data: null, error: null };
    }
    return { data: this.match(), error: null };
  }

  maybeSingle() {
    const { data, error } = this.result();
    const rows = Array.isArray(data) ? data : [];
    return Promise.resolve({ data: rows[0] ?? null, error });
  }

  single() {
    const data = this.match()[0] ?? null;
    return Promise.resolve({
      data,
      error: data ? null : { message: "not found" },
    });
  }

  then<TResult1, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: unknown;
          error: { message: string } | null;
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.result()).then(onfulfilled, onrejected);
  }
}

function createSupabaseStub(options: SupabaseStubOptions): {
  client: AdminSupabaseClient;
  updates: RecordedUpdate[];
} {
  const updates: RecordedUpdate[] = [];
  const tenant =
    options.tenant === undefined
      ? { id: TENANT_ID, stripe_secret_key: TENANT_STRIPE_KEY }
      : options.tenant;
  const tables: Record<string, Row[]> = {
    donations: [options.donation],
    tenants: tenant ? [tenant] : [],
    staged_gifts: [],
    staged_gift_allocations: [],
    contribution_adjustments: [],
    contribution_operation_audit_events: [],
    contribution_corrections: [],
    contribution_correction_requests: [],
    donation_crm_links: [],
  };

  const client = {
    from(table: string) {
      const rows = tables[table];
      if (!rows) {
        throw new Error(`unexpected table ${table}`);
      }
      return new TableQuery(
        table,
        rows,
        updates,
        table === "donations" ? (options.donationUpdateError ?? null) : null,
      );
    },
  } as unknown as AdminSupabaseClient;

  return { client, updates };
}

interface RecordedRefundCreate {
  params: Stripe.RefundCreateParams;
  options: { idempotencyKey?: string };
  secretKey: string;
}

interface StripeStubOptions {
  /**
   * The live charge returned by the pre-refund remaining check. Defaults to
   * an untouched charge matching the default donation ($50.00, $0 refunded).
   * Pass `null` to simulate a payment intent without a resolvable charge.
   */
  liveCharge?: Stripe.Charge | null;
  /** Error thrown from charges.retrieve / paymentIntents.retrieve. */
  retrieveError?: unknown;
}

function liveCharge(overrides: Row = {}): Stripe.Charge {
  return {
    id: "ch_1",
    object: "charge",
    payment_intent: "pi_1",
    amount: 5000,
    amount_refunded: 0,
    ...overrides,
  } as unknown as Stripe.Charge;
}

function createStripeStub(
  handler: (
    params: Stripe.RefundCreateParams,
  ) => Stripe.Refund | Promise<Stripe.Refund>,
  options: StripeStubOptions = {},
): {
  createStripe: (secretKey: string) => StripeRefundsApi;
  calls: RecordedRefundCreate[];
  chargeRetrieves: string[];
  paymentIntentRetrieves: Array<{
    id: string;
    params?: Stripe.PaymentIntentRetrieveParams;
  }>;
} {
  const calls: RecordedRefundCreate[] = [];
  const chargeRetrieves: string[] = [];
  const paymentIntentRetrieves: Array<{
    id: string;
    params?: Stripe.PaymentIntentRetrieveParams;
  }> = [];
  const configuredLiveCharge =
    options.liveCharge === undefined ? liveCharge() : options.liveCharge;
  const resolveLiveCharge = (): Stripe.Charge | null => {
    if (options.retrieveError !== undefined) {
      throw options.retrieveError;
    }
    return configuredLiveCharge;
  };
  const createStripe = (secretKey: string): StripeRefundsApi => ({
    refunds: {
      create: async (params, requestOptions) => {
        calls.push({ params, options: requestOptions, secretKey });
        return handler(params);
      },
    },
    charges: {
      retrieve: async (id) => {
        chargeRetrieves.push(id);
        const charge = resolveLiveCharge();
        if (!charge) {
          throw new Error("charges.retrieve stub has no live charge.");
        }
        return charge;
      },
    },
    paymentIntents: {
      retrieve: async (id, params) => {
        paymentIntentRetrieves.push({ id, params });
        return {
          id,
          object: "payment_intent",
          latest_charge: resolveLiveCharge(),
        } as unknown as Stripe.PaymentIntent;
      },
    },
  });
  return { createStripe, calls, chargeRetrieves, paymentIntentRetrieves };
}

function expandedCharge(overrides: Row = {}): Stripe.Charge {
  return {
    id: "ch_1",
    object: "charge",
    payment_intent: "pi_1",
    amount_refunded: 5000,
    ...overrides,
  } as unknown as Stripe.Charge;
}

function stripeRefund(overrides: Row = {}): Stripe.Refund {
  return {
    id: "re_1",
    object: "refund",
    status: "succeeded",
    amount: 5000,
    charge: expandedCharge(),
    ...overrides,
  } as unknown as Stripe.Refund;
}

function refundInput(
  overrides: Partial<Parameters<typeof refundContributionThroughStripe>[0]> &
    Pick<
      Parameters<typeof refundContributionThroughStripe>[0],
      "supabaseAdmin"
    >,
) {
  return {
    tenantId: TENANT_ID,
    contributionId: DONATION_ID,
    amount: 5000,
    reason: "Donor requested a refund",
    confirmationToken: "confirm-1",
    expectedRevision: null,
    idempotencyKey: IDEMPOTENCY_KEY,
    ...overrides,
  };
}

describe("contribution refundContribution dependency", () => {
  it("wires refundContribution to the Stripe adapter through the dependency factory", async () => {
    const stub = createSupabaseStub({
      donation: donationRow({
        stripe_payment_intent_id: null,
        stripe_charge_id: null,
      }),
    });
    const deps = createContributionActionDependencies(stub.client);

    // The blocked-availability guard proves the factory reaches the real
    // adapter without any Stripe client being constructed.
    await expect(
      deps.refundContribution!({
        tenantId: TENANT_ID,
        contributionId: DONATION_ID,
        amount: 5000,
        reason: "Donor requested a refund",
        confirmationToken: "confirm-1",
        expectedRevision: null,
        idempotencyKey: IDEMPOTENCY_KEY,
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: expect.stringMatching(/no payment provider charge/i),
    });
    expect(stub.updates).toHaveLength(0);
  });

  describe("blocked reasons (server-enforced before any provider call)", () => {
    it("rejects gifts without a provider charge with 409 and never calls Stripe", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({
          stripe_payment_intent_id: null,
          stripe_charge_id: null,
        }),
      });
      const stripe = createStripeStub(() => stripeRefund());

      await expect(
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
          }),
        ),
      ).rejects.toMatchObject({
        status: 409,
        message: expect.stringMatching(/no payment provider charge/i),
      });
      expect(stripe.calls).toHaveLength(0);
      expect(stub.updates).toHaveLength(0);
    });

    it("rejects non-completed payments with 409 and never calls Stripe", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ status: "pending" }),
      });
      const stripe = createStripeStub(() => stripeRefund());

      await expect(
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
          }),
        ),
      ).rejects.toMatchObject({
        status: 409,
        message: expect.stringMatching(/only completed payments/i),
      });
      expect(stripe.calls).toHaveLength(0);
    });

    it("rejects stale saves with 409 recovery guidance before any provider call", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() => stripeRefund());

      await expect(
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
            expectedRevision: "stale-revision",
          }),
        ),
      ).rejects.toMatchObject({
        status: 409,
        message: expect.stringMatching(/changed since you loaded it/i),
      });
      expect(stripe.calls).toHaveLength(0);
    });

    it("returns 503 when neither the tenant nor the platform has a Stripe key", async () => {
      const stub = createSupabaseStub({
        donation: donationRow(),
        tenant: { id: TENANT_ID, stripe_secret_key: null },
      });
      const stripe = createStripeStub(() => stripeRefund());
      // With SKIP_ENV_VALIDATION the env export is a plain runtime object, so
      // clearing the fallback key directly keeps this test hermetic even when
      // the host shell exports STRIPE_SECRET_KEY.
      const envRecord = serverEnv as unknown as Record<string, unknown>;
      const previousKey = envRecord.STRIPE_SECRET_KEY;
      envRecord.STRIPE_SECRET_KEY = undefined;

      try {
        await expect(
          refundContributionThroughStripe(
            refundInput({
              supabaseAdmin: stub.client,
              createStripe: stripe.createStripe,
            }),
          ),
        ).rejects.toMatchObject({
          status: 503,
          message: expect.stringMatching(/stripe is not configured/i),
        });
      } finally {
        envRecord.STRIPE_SECRET_KEY = previousKey;
      }
      expect(stripe.calls).toHaveLength(0);
    });
  });

  describe("successful full refund", () => {
    it("creates the Stripe refund and applies the absolute local write", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() => stripeRefund());

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(stripe.calls).toHaveLength(1);
      const call = stripe.calls[0]!;
      expect(call.secretKey).toBe(TENANT_STRIPE_KEY);
      expect(call.params).toMatchObject({
        payment_intent: "pi_1",
        amount: 5000,
        expand: ["charge"],
        metadata: {
          tenant_id: TENANT_ID,
          donation_id: DONATION_ID,
          reason: "Donor requested a refund",
        },
      });
      expect(call.params).not.toHaveProperty("charge");
      expect(call.options.idempotencyKey).toBe(`${IDEMPOTENCY_KEY}:refund`);

      expect(stub.updates).toHaveLength(1);
      expect(stub.updates[0]).toMatchObject({
        table: "donations",
        filters: { id: DONATION_ID },
        patch: {
          refund_amount: 5000,
          refunded_at: expect.any(String),
          status: "refunded",
          stripe_charge_id: "ch_1",
          // The created refund id persists even though the expanded charge
          // carries no embedded refund list.
          stripe_refund_ids: ["re_1"],
          updated_at: expect.any(String),
        },
      });

      expect(outcome).toEqual({
        provider: "stripe",
        status: "succeeded",
        referenceId: "re_1",
      });
      expect(isFailedProviderOutcomeStatus(outcome.status)).toBe(false);
    });

    it("unions the created refund id with stored and charge-reported refund ids", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ stripe_refund_ids: ["re_prior"] }),
      });
      const stripe = createStripeStub(() =>
        stripeRefund({
          charge: expandedCharge({
            refunds: {
              data: [
                { id: "re_prior", object: "refund" },
                { id: "re_1", object: "refund" },
              ],
              has_more: false,
              object: "list",
            },
          }),
        }),
      );

      await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(stub.updates).toHaveLength(1);
      expect(stub.updates[0]!.patch).toMatchObject({
        stripe_refund_ids: ["re_prior", "re_1"],
      });
    });
  });

  describe("partial refund", () => {
    it("converges refund_amount to the charge total and preserves the status", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() =>
        stripeRefund({
          amount: 2000,
          charge: expandedCharge({ amount_refunded: 2000 }),
        }),
      );

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
          amount: 2000,
        }),
      );

      expect(stripe.calls[0]!.params).toMatchObject({ amount: 2000 });
      expect(stub.updates[0]).toMatchObject({
        table: "donations",
        patch: {
          refund_amount: 2000,
          status: "completed",
          refunded_at: expect.any(String),
        },
      });
      expect(outcome).toEqual({
        provider: "stripe",
        status: "succeeded",
        referenceId: "re_1",
      });
    });
  });

  describe("over-refund and fully refunded guards", () => {
    it("rejects amounts above the remaining refundable amount with the formatted remainder", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ refund_amount: 4000 }),
      });
      const stripe = createStripeStub(() => stripeRefund());

      await expect(
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
            amount: 2000,
          }),
        ),
      ).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining("$10.00"),
      });
      expect(stripe.calls).toHaveLength(0);
    });

    it("rejects refunds on fully refunded gifts with 400 and never calls Stripe", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ status: "refunded", refund_amount: 5000 }),
      });
      const stripe = createStripeStub(() => stripeRefund());

      await expect(
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
            amount: 100,
          }),
        ),
      ).rejects.toMatchObject({
        status: 400,
        message: expect.stringMatching(/already fully refunded/i),
      });
      expect(stripe.calls).toHaveLength(0);
      expect(stub.updates).toHaveLength(0);
    });
  });

  describe("idempotency and duplicates", () => {
    it("maps the same executor idempotency key to the same namespaced Stripe key", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() => stripeRefund());
      const run = () =>
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
          }),
        );

      await run();
      await run();

      expect(stripe.calls).toHaveLength(2);
      expect(stripe.calls[0]!.options.idempotencyKey).toBe(
        `${IDEMPOTENCY_KEY}:refund`,
      );
      expect(stripe.calls[1]!.options.idempotencyKey).toBe(
        stripe.calls[0]!.options.idempotencyKey,
      );
    });

    it("returns the charge_already_refunded backstop as a failed outcome without touching the donation", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() => {
        throw {
          type: "StripeInvalidRequestError",
          rawType: "invalid_request_error",
          code: "charge_already_refunded",
          message: "Charge ch_1 has already been refunded.",
        };
      });

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(outcome).toMatchObject({
        provider: "stripe",
        status: "failed",
        errorCode: "charge_already_refunded",
      });
      expect(isFailedProviderOutcomeStatus(outcome.status)).toBe(true);
      expect(stub.updates).toHaveLength(0);
    });
  });

  describe("provider errors and outcome honesty", () => {
    it("returns definitive Stripe errors as failed outcomes instead of throwing", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() => {
        throw {
          type: "StripeCardError",
          rawType: "card_error",
          code: "expired_or_canceled_card",
          message: "The card used for this payment has expired.",
        };
      });

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(outcome).toMatchObject({
        provider: "stripe",
        status: "failed",
        errorCode: "expired_or_canceled_card",
        errorMessage: "The card used for this payment has expired.",
      });
      expect(stub.updates).toHaveLength(0);
    });

    it.each([
      "StripeConnectionError",
      "StripeAPIError",
      "StripeIdempotencyError",
    ])(
      "rethrows ambiguous %s as a 502 so a same-key retry replays the attempt",
      async (errorType) => {
        const stub = createSupabaseStub({ donation: donationRow() });
        const stripe = createStripeStub(() => {
          throw {
            type: errorType,
            message: "Stripe may or may not have processed the request.",
          };
        });

        await expect(
          refundContributionThroughStripe(
            refundInput({
              supabaseAdmin: stub.client,
              createStripe: stripe.createStripe,
            }),
          ),
        ).rejects.toMatchObject({
          status: 502,
          message: expect.stringMatching(/did not confirm the refund/i),
        });
        // No failed correction outcome is returned and no local write
        // happens; the caller retries with the SAME idempotency key.
        expect(stub.updates).toHaveLength(0);
      },
    );

    it("rethrows ambiguous errors from the live-charge check before creating any refund", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() => stripeRefund(), {
        retrieveError: {
          type: "StripeConnectionError",
          message: "Connection dropped.",
        },
      });

      await expect(
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
          }),
        ),
      ).rejects.toMatchObject({
        status: 502,
        message: expect.stringMatching(/did not confirm the refund/i),
      });
      expect(stripe.calls).toHaveLength(0);
      expect(stub.updates).toHaveLength(0);
    });

    it("rethrows non-Stripe errors so infrastructure failures stay loud", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() => {
        throw new Error("socket hang up");
      });

      await expect(
        refundContributionThroughStripe(
          refundInput({
            supabaseAdmin: stub.client,
            createStripe: stripe.createStripe,
          }),
        ),
      ).rejects.toThrow("socket hang up");
      expect(stub.updates).toHaveLength(0);
    });

    it("returns pending refunds without any local write", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() =>
        stripeRefund({ status: "pending" }),
      );

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(outcome).toEqual({
        provider: "stripe",
        status: "pending",
        referenceId: "re_1",
      });
      expect(stub.updates).toHaveLength(0);
      expect(isFailedProviderOutcomeStatus(outcome.status)).toBe(false);
    });

    it("surfaces provider-declared failures with the failure reason and no local write", async () => {
      const stub = createSupabaseStub({ donation: donationRow() });
      const stripe = createStripeStub(() =>
        stripeRefund({
          status: "failed",
          failure_reason: "expired_or_canceled_card",
        }),
      );

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(outcome).toMatchObject({
        provider: "stripe",
        status: "failed",
        referenceId: "re_1",
        errorCode: "expired_or_canceled_card",
      });
      expect(stub.updates).toHaveLength(0);
    });

    it("reports local_update_failed with the refund reference when the post-success write throws", async () => {
      const stub = createSupabaseStub({
        donation: donationRow(),
        donationUpdateError: "database unavailable",
      });
      const stripe = createStripeStub(() => stripeRefund());

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(outcome).toMatchObject({
        provider: "stripe",
        status: "local_update_failed",
        referenceId: "re_1",
        errorCode: "local_update_failed",
      });
      expect(isFailedProviderOutcomeStatus(outcome.status)).toBe(true);
      expect(stub.updates).toHaveLength(0);
    });
  });

  describe("live-charge provider remaining check", () => {
    it("rejects a second partial that exceeds the provider remaining while a pending refund left the local record untouched", async () => {
      // $100.00 charge with a pending $50.00 partial: Stripe counts pending
      // refunds into amount_refunded immediately, while the local
      // refund_amount is still 0 (pending outcomes write nothing locally).
      const stub = createSupabaseStub({
        donation: donationRow({ amount: 10_000, refund_amount: 0 }),
      });
      const stripe = createStripeStub(() => stripeRefund(), {
        liveCharge: liveCharge({ amount: 10_000, amount_refunded: 5000 }),
      });

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
          amount: 6000,
        }),
      );

      expect(outcome).toMatchObject({
        provider: "stripe",
        status: "failed",
        errorCode: "refund_exceeds_provider_remaining",
        errorMessage: expect.stringContaining("$50.00"),
      });
      expect(stripe.chargeRetrieves).toEqual(["ch_1"]);
      expect(stripe.calls).toHaveLength(0);
      expect(stub.updates).toHaveLength(0);
    });

    it("allows a second partial only up to the provider remaining", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ amount: 10_000, refund_amount: 0 }),
      });
      const stripe = createStripeStub(
        () =>
          stripeRefund({
            amount: 5000,
            charge: expandedCharge({ amount_refunded: 10_000 }),
          }),
        {
          liveCharge: liveCharge({ amount: 10_000, amount_refunded: 5000 }),
        },
      );

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
          amount: 5000,
        }),
      );

      expect(stripe.calls).toHaveLength(1);
      expect(stripe.calls[0]!.params).toMatchObject({ amount: 5000 });
      expect(outcome).toEqual({
        provider: "stripe",
        status: "succeeded",
        referenceId: "re_1",
      });
    });

    it("resolves the live charge through the payment intent when no charge id is stored", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ stripe_charge_id: null }),
      });
      const stripe = createStripeStub(() => stripeRefund(), {
        liveCharge: liveCharge({ amount: 5000, amount_refunded: 4000 }),
      });

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
          amount: 5000,
        }),
      );

      expect(stripe.paymentIntentRetrieves).toEqual([
        { id: "pi_1", params: { expand: ["latest_charge"] } },
      ]);
      expect(stripe.chargeRetrieves).toHaveLength(0);
      expect(outcome).toMatchObject({
        status: "failed",
        errorCode: "refund_exceeds_provider_remaining",
        errorMessage: expect.stringContaining("$10.00"),
      });
      expect(stripe.calls).toHaveLength(0);
    });

    it("falls through to refund creation when the payment intent has no resolvable charge", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ stripe_charge_id: null }),
      });
      const stripe = createStripeStub(() => stripeRefund(), {
        liveCharge: null,
      });

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      // No live charge to validate against — Stripe's refund call remains
      // the provider-truth backstop.
      expect(stripe.calls).toHaveLength(1);
      expect(outcome).toMatchObject({ status: "succeeded" });
    });
  });

  describe("charge-only convergence honesty", () => {
    it("reports local_update_failed when the expanded charge has no payment intent", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ stripe_payment_intent_id: null }),
      });
      const stripe = createStripeStub(() =>
        stripeRefund({
          charge: expandedCharge({ payment_intent: null }),
        }),
      );

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(stripe.calls[0]!.params).toMatchObject({ charge: "ch_1" });
      expect(stripe.calls[0]!.params).not.toHaveProperty("payment_intent");
      expect(outcome).toMatchObject({
        provider: "stripe",
        status: "local_update_failed",
        referenceId: "re_1",
        errorCode: "local_update_failed",
        errorMessage: expect.stringMatching(/no local donation record/i),
      });
      expect(stub.updates).toHaveLength(0);
    });

    it("reports local_update_failed when no donation matches the refunded charge's payment intent", async () => {
      const stub = createSupabaseStub({
        donation: donationRow({ stripe_payment_intent_id: null }),
      });
      const stripe = createStripeStub(() =>
        stripeRefund({
          charge: expandedCharge({ payment_intent: "pi_unknown" }),
        }),
      );

      const outcome = await refundContributionThroughStripe(
        refundInput({
          supabaseAdmin: stub.client,
          createStripe: stripe.createStripe,
        }),
      );

      expect(outcome).toMatchObject({
        provider: "stripe",
        status: "local_update_failed",
        referenceId: "re_1",
        errorCode: "local_update_failed",
      });
      expect(stub.updates).toHaveLength(0);
    });
  });

  describe("correctionStatusForProviderOutcome", () => {
    it("classifies provider outcome statuses three ways", () => {
      expect(correctionStatusForProviderOutcome("pending")).toBe("pending");
      expect(correctionStatusForProviderOutcome("failed")).toBe("failed");
      expect(correctionStatusForProviderOutcome("local_update_failed")).toBe(
        "failed",
      );
      expect(correctionStatusForProviderOutcome("canceled")).toBe("failed");
      expect(correctionStatusForProviderOutcome("requires_action")).toBe(
        "failed",
      );
      expect(correctionStatusForProviderOutcome("succeeded")).toBe("applied");
      expect(correctionStatusForProviderOutcome("queued_for_replay")).toBe(
        "applied",
      );
      expect(correctionStatusForProviderOutcome(null)).toBe("applied");
    });
  });
});
