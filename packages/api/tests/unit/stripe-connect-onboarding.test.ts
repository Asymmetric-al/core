import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { createPaymentAccountsHandlers } from "../../src/admin/payment-accounts/route";
import {
  STRIPE_CONNECT_ACCOUNT_CONTROLLER,
  assertConnectedAccountId,
  assertStripeTestModeKey,
  buildConnectOnboardingUrls,
  buildConnectedAccountCreateParams,
  connectedAccountRequestOptions,
  createConnectedAccountOnboarding,
  resolveAdminConfiguredOrigin,
  type StripeConnectOnboardingClient,
} from "../../src/stripe/connect";

const authState = vi.hoisted(() => ({
  tenantId: "00000000-0000-0000-0000-000000000001",
  userId: "11111111-1111-1111-1111-111111111111",
  sessionClient: null as unknown,
}));

vi.mock("../../src/shared/with-operation", () => ({
  withOperation:
    (
      handler: (ctx: {
        auth: { tenantId: string; userId: string };
        request: NextRequest;
        requestId: string;
        sessionClient: unknown;
      }) => Promise<Response>,
    ) =>
    async (request: NextRequest) =>
      handler({
        auth: { tenantId: authState.tenantId, userId: authState.userId },
        request,
        requestId: "req-connect-test",
        sessionClient: authState.sessionClient,
      }),
}));

function createFakeStripe() {
  const accountsByKey = new Map<string, { id: string; params: unknown }>();
  const createdAccounts: Array<{
    id: string;
    params: unknown;
    idempotencyKey?: string;
  }> = [];
  const createdLinks: Array<Record<string, unknown>> = [];
  let seq = 0;

  const client: StripeConnectOnboardingClient = {
    accounts: {
      create: vi.fn(async (params, options) => {
        const key = options?.idempotencyKey;
        if (key && accountsByKey.has(key)) {
          return { id: accountsByKey.get(key)!.id };
        }
        seq += 1;
        const id = `acct_test00000${seq}`;
        createdAccounts.push({ id, params, idempotencyKey: key });
        if (key) accountsByKey.set(key, { id, params });
        return { id };
      }),
    },
    accountLinks: {
      create: vi.fn(async (params) => {
        createdLinks.push(params as unknown as Record<string, unknown>);
        return {
          url: `https://connect.stripe.test/onboard/${params.account}`,
          expires_at: 1893456000,
        };
      }),
    },
  };

  return { client, createdAccounts, createdLinks };
}

function createFakeSessionClient(options: {
  legalEntities: Array<Record<string, unknown>>;
  bindings: Array<Record<string, unknown>>;
  providerAccounts?: Array<Record<string, unknown>>;
  rpcHandler?: (
    fn: string,
    args: Record<string, unknown>,
  ) => Promise<{
    data: unknown;
    error: { code?: string; message: string } | null;
  }>;
}) {
  const makeQuery = (rows: Array<Record<string, unknown>>) => {
    let filtered = [...rows];
    const builder = {
      select: () => builder,
      eq: (col: string, val: unknown) => {
        filtered = filtered.filter((row) => row[col] === val);
        return builder;
      },
      order: (col: string, opts?: { ascending?: boolean }) => {
        const dir = opts?.ascending === false ? -1 : 1;
        filtered.sort((a, b) => {
          const av = a[col];
          const bv = b[col];
          if (av === bv) return 0;
          return (av as number | string) > (bv as number | string) ? dir : -dir;
        });
        return builder;
      },
      maybeSingle: async () => ({ data: filtered[0] ?? null, error: null }),
      then: (
        resolve: (value: { data: unknown[]; error: null }) => unknown,
        reject?: (reason: unknown) => unknown,
      ) =>
        Promise.resolve({ data: filtered, error: null }).then(resolve, reject),
    };
    return builder;
  };

  return {
    from: (table: string) => {
      if (table === "legal_entities") return makeQuery(options.legalEntities);
      if (table === "payment_account_bindings")
        return makeQuery(options.bindings);
      if (table === "payment_provider_accounts") {
        return makeQuery(options.providerAccounts ?? []);
      }
      throw new Error(`Unexpected table ${table}`);
    },
    rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
      if (options.rpcHandler) return options.rpcHandler(fn, args);
      return { data: null, error: null };
    }),
  };
}

describe("Stripe Connect helper and account-type ruling (W8-R2 / D-16)", () => {
  it("isolates the ruled Standard-equivalent controller configuration in one constant and one builder", () => {
    expect(STRIPE_CONNECT_ACCOUNT_CONTROLLER).toEqual({
      losses: { payments: "stripe" },
      fees: { payer: "account" },
      requirement_collection: "stripe",
      stripe_dashboard: { type: "full" },
    });

    const params = buildConnectedAccountCreateParams({
      countryCode: "US",
      tenantId: "00000000-0000-0000-0000-000000000001",
      legalEntityId: "22222222-2222-2222-2222-222222222222",
      legalName: "GiveHope Organization",
    });

    expect(params).toEqual({
      country: "US",
      controller: {
        losses: { payments: "stripe" },
        fees: { payer: "account" },
        requirement_collection: "stripe",
        stripe_dashboard: { type: "full" },
      },
      business_profile: { name: "GiveHope Organization" },
      metadata: {
        tenant_id: "00000000-0000-0000-0000-000000000001",
        legal_entity_id: "22222222-2222-2222-2222-222222222222",
      },
    });
    expect("type" in params).toBe(false);
  });

  it("refuses unset admin origin and constructs return/refresh URLs strictly from configured origin", () => {
    expect(() =>
      resolveAdminConfiguredOrigin({
        NEXT_PUBLIC_APP_URL: "",
        NEXT_PUBLIC_SITE_URL: undefined,
      }),
    ).toThrow(/not configured/i);

    const origin = resolveAdminConfiguredOrigin({
      NEXT_PUBLIC_APP_URL: "https://admin.asymmetric.al/ignored/path",
    });
    expect(origin).toBe("https://admin.asymmetric.al");
    expect(buildConnectOnboardingUrls(origin)).toEqual({
      returnUrl:
        "https://admin.asymmetric.al/settings/payments?onboarding=return",
      refreshUrl:
        "https://admin.asymmetric.al/settings/payments?onboarding=refresh",
    });
  });

  it("requires a connected stripeAccount with no platform fallback and forbids live keys in test helpers", () => {
    expect(() => assertConnectedAccountId("")).toThrow();
    expect(() => assertConnectedAccountId(null)).toThrow();
    expect(() => assertConnectedAccountId("cus_123")).toThrow();
    expect(connectedAccountRequestOptions("acct_1Abc", "idem-1")).toEqual({
      stripeAccount: "acct_1Abc",
      idempotencyKey: "idem-1",
    });

    expect(() => assertStripeTestModeKey("sk_live_secret")).toThrow(
      /forbidden/i,
    );
    expect(() => assertStripeTestModeKey("pk_live_pub")).toThrow(/forbidden/i);
    expect(assertStripeTestModeKey("sk_test_123")).toBe("sk_test_123");
  });

  it("passes all four ruled controller properties to Stripe accounts.create through createConnectedAccountOnboarding", async () => {
    const fake = createFakeStripe();
    const res = await createConnectedAccountOnboarding(fake.client, {
      countryCode: "US",
      tenantId: "00000000-0000-0000-0000-000000000001",
      legalEntityId: "22222222-2222-2222-2222-222222222222",
      legalName: "GiveHope Organization",
      origin: "https://admin.asymmetric.al",
      idempotencyKey: "idem-key-1",
    });

    expect(res.providerAccountId).toBe("acct_test000001");
    expect(res.onboardingUrl).toBe(
      "https://connect.stripe.test/onboard/acct_test000001",
    );
    expect(fake.createdAccounts).toHaveLength(1);
    expect(fake.createdAccounts[0]?.params).toMatchObject({
      country: "US",
      controller: {
        losses: { payments: "stripe" },
        fees: { payer: "account" },
        requirement_collection: "stripe",
        stripe_dashboard: { type: "full" },
      },
    });
    expect(fake.createdLinks[0]).toEqual({
      account: "acct_test000001",
      type: "account_onboarding",
      return_url:
        "https://admin.asymmetric.al/settings/payments?onboarding=return",
      refresh_url:
        "https://admin.asymmetric.al/settings/payments?onboarding=refresh",
    });
  });
});

describe("Mission Control payment-accounts onboarding route", () => {
  const entityId = "22222222-2222-2222-2222-222222222222";
  const baseEntity = {
    id: entityId,
    tenant_id: authState.tenantId,
    name: "GiveHope Organization",
    legal_name: "GiveHope Organization",
    country_code: "US",
    currency: "usd",
    tax_id: null,
    created_at: "2026-11-23T00:00:00Z",
  };

  it("ignores forged Host and x-forwarded-host headers and refuses when configured origin is unset", async () => {
    const fake = createFakeStripe();
    authState.sessionClient = createFakeSessionClient({
      legalEntities: [baseEntity],
      bindings: [],
      rpcHandler: async (_fn, args) => ({
        data: {
          binding_id: "33333333-3333-3333-3333-333333333333",
          tenant_id: args.p_tenant_id,
          legal_entity_id: args.p_legal_entity_id,
          provider_account_id: args.p_provider_account_id,
          livemode: args.p_livemode,
          version: 1,
          status: "pending",
          replayed: false,
        },
        error: null,
      }),
    });

    const unconfigured = createPaymentAccountsHandlers({
      getSecretKey: () => "sk_test_123",
      getConfiguredOrigin: () => resolveAdminConfiguredOrigin({}),
      createStripe: () => fake.client,
    });
    const refused = await unconfigured.POST(
      new NextRequest("https://evil.example/api/admin/payment-accounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "evil.example",
          "x-forwarded-host": "evil-forwarded.example",
        },
        body: JSON.stringify({
          legal_entity_id: entityId,
          reason: "Initial setup",
        }),
      }),
    );
    expect(refused.status).toBe(503);
    expect(fake.createdAccounts).toHaveLength(0);

    const configured = createPaymentAccountsHandlers({
      getSecretKey: () => "sk_test_123",
      getConfiguredOrigin: () => "https://admin.asymmetric.al",
      createStripe: () => fake.client,
    });
    const ok = await configured.POST(
      new NextRequest("https://evil.example/api/admin/payment-accounts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "evil.example",
          "x-forwarded-host": "attacker.example",
        },
        body: JSON.stringify({
          legal_entity_id: entityId,
          reason: "Initial setup",
        }),
      }),
    );
    expect(ok.status).toBe(201);
    expect(fake.createdLinks[0]).toMatchObject({
      return_url:
        "https://admin.asymmetric.al/settings/payments?onboarding=return",
      refresh_url:
        "https://admin.asymmetric.al/settings/payments?onboarding=refresh",
    });
  });

  it("fault injection between Stripe account creation and DB write followed by retry yields one account and one binding", async () => {
    const fake = createFakeStripe();
    const committedBindings: Array<Record<string, unknown>> = [];
    let rpcCalls = 0;

    authState.sessionClient = createFakeSessionClient({
      legalEntities: [baseEntity],
      bindings: committedBindings,
      rpcHandler: async (_fn, args) => {
        rpcCalls += 1;
        if (rpcCalls === 1) {
          return { data: null, error: { message: "transient db timeout" } };
        }
        const existing = committedBindings.find(
          (b) =>
            b.legal_entity_id === args.p_legal_entity_id &&
            b.provider_account_ref === args.p_provider_account_id &&
            b.status === "pending",
        );
        if (existing) {
          return {
            data: {
              binding_id: existing.id,
              tenant_id: args.p_tenant_id,
              legal_entity_id: args.p_legal_entity_id,
              provider_account_id: args.p_provider_account_id,
              livemode: args.p_livemode,
              version: existing.version,
              status: "pending",
              replayed: true,
            },
            error: null,
          };
        }
        const row = {
          id: "44444444-4444-4444-4444-444444444444",
          tenant_id: args.p_tenant_id,
          legal_entity_id: args.p_legal_entity_id,
          provider_account_ref: args.p_provider_account_id,
          livemode: args.p_livemode,
          version: 1,
          status: "pending",
        };
        committedBindings.push(row);
        return {
          data: {
            binding_id: row.id,
            tenant_id: row.tenant_id,
            legal_entity_id: row.legal_entity_id,
            provider_account_id: row.provider_account_ref,
            livemode: row.livemode,
            version: 1,
            status: "pending",
            replayed: false,
          },
          error: null,
        };
      },
    });

    const handlers = createPaymentAccountsHandlers({
      getSecretKey: () => "sk_test_123",
      getConfiguredOrigin: () => "https://admin.asymmetric.al",
      createStripe: () => fake.client,
    });
    const makeReq = () =>
      new NextRequest(
        "https://admin.asymmetric.al/api/admin/payment-accounts",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            legal_entity_id: entityId,
            reason: "Initial connect",
          }),
        },
      );

    const first = await handlers.POST(makeReq());
    expect(first.status).toBe(500);
    expect(fake.createdAccounts).toHaveLength(1);
    expect(committedBindings).toHaveLength(0);

    const second = await handlers.POST(makeReq());
    expect(second.status).toBe(201);
    expect(fake.createdAccounts).toHaveLength(1);
    expect(committedBindings).toHaveLength(1);

    const third = await handlers.POST(makeReq());
    expect(third.status).toBe(200);
    expect(fake.createdAccounts).toHaveLength(1);
    expect(committedBindings).toHaveLength(1);
  });

  it("refuses active binding with 409 without calling Stripe and allows version 2 after disconnect", async () => {
    const fake = createFakeStripe();
    authState.sessionClient = createFakeSessionClient({
      legalEntities: [baseEntity],
      bindings: [
        {
          id: "55555555-5555-5555-5555-555555555555",
          tenant_id: authState.tenantId,
          legal_entity_id: entityId,
          provider_account_ref: "acct_existing1",
          livemode: false,
          version: 1,
          status: "active",
        },
      ],
    });
    const handlers = createPaymentAccountsHandlers({
      getSecretKey: () => "sk_test_123",
      getConfiguredOrigin: () => "https://admin.asymmetric.al",
      createStripe: () => fake.client,
    });

    const conflict = await handlers.POST(
      new NextRequest(
        "https://admin.asymmetric.al/api/admin/payment-accounts",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            legal_entity_id: entityId,
            reason: "Try duplicate",
          }),
        },
      ),
    );
    expect(conflict.status).toBe(409);
    expect(fake.createdAccounts).toHaveLength(0);

    authState.sessionClient = createFakeSessionClient({
      legalEntities: [baseEntity],
      bindings: [
        {
          id: "55555555-5555-5555-5555-555555555555",
          tenant_id: authState.tenantId,
          legal_entity_id: entityId,
          provider_account_ref: "acct_existing1",
          livemode: false,
          version: 1,
          status: "disconnected",
        },
      ],
      rpcHandler: async (_fn, args) => ({
        data: {
          binding_id: "66666666-6666-6666-6666-666666666666",
          tenant_id: args.p_tenant_id,
          legal_entity_id: args.p_legal_entity_id,
          provider_account_id: args.p_provider_account_id,
          livemode: args.p_livemode,
          version: 2,
          status: "pending",
          replayed: false,
        },
        error: null,
      }),
    });

    const v2 = await handlers.POST(
      new NextRequest(
        "https://admin.asymmetric.al/api/admin/payment-accounts",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            legal_entity_id: entityId,
            reason: "Re-onboard after disconnect",
          }),
        },
      ),
    );
    expect(v2.status).toBe(201);
    const body = (await v2.json()) as { binding: { version: number } };
    expect(body.binding.version).toBe(2);
    expect(fake.createdAccounts).toHaveLength(1);
  });

  it("lists legal entities and their bindings on GET using caller-token sessionClient only", async () => {
    authState.sessionClient = createFakeSessionClient({
      legalEntities: [baseEntity],
      bindings: [
        {
          id: "55555555-5555-5555-5555-555555555555",
          tenant_id: authState.tenantId,
          legal_entity_id: entityId,
          provider_account_ref: "acct_existing1",
          livemode: false,
          version: 1,
          status: "active",
          activated_at: "2026-11-23T01:00:00Z",
          restricted_at: null,
          disconnected_at: null,
          created_at: "2026-11-23T00:00:00Z",
          updated_at: "2026-11-23T01:00:00Z",
        },
      ],
    });
    const handlers = createPaymentAccountsHandlers({
      getSecretKey: () => "sk_test_123",
      getConfiguredOrigin: () => "https://admin.asymmetric.al",
      createStripe: () => createFakeStripe().client,
    });
    const res = await handlers.GET(
      new NextRequest("https://admin.asymmetric.al/api/admin/payment-accounts"),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      livemode: boolean;
      configured: boolean;
      legalEntities: Array<{
        id: string;
        currentBinding: { version: number; status: string } | null;
      }>;
    };
    expect(body.livemode).toBe(false);
    expect(body.configured).toBe(true);
    expect(body.legalEntities[0]?.currentBinding).toMatchObject({
      version: 1,
      status: "active",
    });
  });
});
