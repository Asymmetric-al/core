import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

import { createPaymentAccountsHandlers } from "../../src/admin/payment-accounts/route";
import {
  CONNECTED_ACCOUNT_INCLUDE,
  ConnectedAccountMismatchError,
  STRIPE_CONNECT_ACCOUNT_CONFIGURATION,
  StripeLiveModeRefusedError,
  assertAccountBelongsToIntent,
  assertConnectedAccountId,
  assertStripeTestModeKey,
  buildAccountLinkParams,
  buildConnectOnboardingUrls,
  buildConnectedAccountCreateParams,
  connectedAccountRequestOptions,
  isUnknownProviderOutcome,
  onboardingIntentIdempotencyKey,
  resolveAdminConfiguredOrigin,
  type StripeConnectClient,
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

const ORIGIN = "https://admin.asymmetric.al";
const ENTITY_ID = "22222222-2222-2222-2222-222222222222";
const ENTITY = {
  id: ENTITY_ID,
  tenant_id: "00000000-0000-0000-0000-000000000001",
  name: "GiveHope Organization",
  legal_name: "GiveHope Organization Inc.",
  country_code: "US",
  currency: "usd",
  tax_id: "12-3456789",
  created_at: "2026-11-23T00:00:00Z",
};

type FakeAccount = {
  id: string;
  livemode: boolean;
  closed: boolean;
  dashboard: string;
  metadata: Record<string, string>;
  configuration: {
    merchant: { capabilities: { card_payments: { status: string } } };
  };
};

function stripeError(type: string, message: string, statusCode?: number) {
  return Object.assign(new Error(message), { type, statusCode });
}

function createFakeStripe(
  options: { loseResponses?: number; failCreateWith?: Error } = {},
) {
  const accounts = new Map<string, FakeAccount>();
  const byKey = new Map<string, string>();
  const calls = {
    create: [] as Array<{ params: Record<string, unknown>; key?: string }>,
    retrieve: [] as string[],
    links: [] as Array<Record<string, unknown>>,
    v1Create: [] as Array<{ key?: string }>,
  };
  let seq = 0;
  let lost = options.loseResponses ?? 0;
  let failNextLink = false;

  const create = (params: Record<string, unknown>, key?: string) => {
    if (key && byKey.has(key)) return accounts.get(byKey.get(key)!)!;
    seq += 1;
    const account: FakeAccount = {
      id: `acct_fake${seq}`,
      livemode: false,
      closed: false,
      dashboard: String(params.dashboard ?? "full"),
      metadata: { ...((params.metadata as Record<string, string>) ?? {}) },
      configuration: {
        merchant: { capabilities: { card_payments: { status: "pending" } } },
      },
    };
    accounts.set(account.id, account);
    if (key) byKey.set(key, account.id);
    return account;
  };

  const client = {
    v2: {
      core: {
        accounts: {
          create: vi.fn(
            async (
              params: Record<string, unknown>,
              opts?: { idempotencyKey?: string },
            ) => {
              calls.create.push({ params, key: opts?.idempotencyKey });
              if (options.failCreateWith) throw options.failCreateWith;
              const account = create(params, opts?.idempotencyKey);
              if (lost > 0) {
                lost -= 1;
                throw stripeError(
                  "StripeConnectionError",
                  "socket hang up after the account was created",
                );
              }
              return account;
            },
          ),
          retrieve: vi.fn(async (id: string) => {
            calls.retrieve.push(id);
            const account = accounts.get(id);
            if (!account)
              throw stripeError(
                "StripeInvalidRequestError",
                "No such account",
                404,
              );
            return account;
          }),
        },
        accountLinks: {
          create: vi.fn(async (params: Record<string, unknown>) => {
            calls.links.push(params);
            if (failNextLink) {
              failNextLink = false;
              throw new Error("process crashed after the account was created");
            }
            return {
              url: `https://connect.stripe.test/onboard/${String(params.account)}`,
              expires_at: "2026-11-24T00:00:00Z",
            };
          }),
        },
      },
    },
    accounts: {
      create: vi.fn(
        async (
          params: Record<string, unknown>,
          opts?: { idempotencyKey?: string },
        ) => {
          calls.v1Create.push({ key: opts?.idempotencyKey });
          return create(params, opts?.idempotencyKey);
        },
      ),
    },
    accountLinks: {
      create: vi.fn(async (params: Record<string, unknown>) => {
        calls.links.push(params);
        return {
          url: `https://connect.stripe.test/onboard/${String(params.account)}`,
          expires_at: 1893456000,
        };
      }),
    },
  };

  return {
    client: client as unknown as StripeConnectClient,
    calls,
    accounts,
    crashNextLink: () => {
      failNextLink = true;
    },
    providerCallCount: () =>
      calls.create.length +
      calls.retrieve.length +
      calls.links.length +
      calls.v1Create.length,
  };
}

type Intent = {
  intent_id: string;
  tenant_id: string;
  legal_entity_id: string;
  livemode: boolean;
  version: number;
  status: "open" | "confirmed";
  provider_account_id: string | null;
  binding_id: string | null;
  binding_status: string | null;
  created_at: string | null;
  replayed: boolean;
};

function createFakeSession(
  options: {
    confirmed?: { accountId: string; bindingStatus: string };
    refuseWith?: { code: string; message: string };
    openedAt?: string;
  } = {},
) {
  let open: Intent | null = null;
  const rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  const intentId = "44444444-4444-4444-4444-444444444444";

  const query = (rows: Array<Record<string, unknown>>) => {
    let filtered = [...rows];
    const builder = {
      select: () => builder,
      eq: (column: string, value: unknown) => {
        filtered = filtered.filter((row) => row[column] === value);
        return builder;
      },
      order: () => builder,
      maybeSingle: async () => ({ data: filtered[0] ?? null, error: null }),
      then: (
        resolve: (value: { data: unknown[]; error: null }) => unknown,
        reject?: (reason: unknown) => unknown,
      ) =>
        Promise.resolve({ data: filtered, error: null }).then(resolve, reject),
    };
    return builder;
  };

  const session = {
    from: (table: string) => {
      if (table === "legal_entities") return query([ENTITY]);
      if (table === "payment_account_bindings") return query([]);
      if (table === "payment_onboarding_intents") return query([]);
      throw new Error(`Unexpected table ${table}`);
    },
    rpc: vi.fn(async (fn: string, args: Record<string, unknown>) => {
      rpcCalls.push({ fn, args });
      if (options.refuseWith) return { data: null, error: options.refuseWith };
      if (fn === "list_payment_legal_entities")
        return { data: [ENTITY], error: null };
      if (fn !== "begin_payment_account_onboarding")
        return { data: null, error: { message: `unexpected ${fn}` } };
      if (options.confirmed) {
        const intent: Intent = {
          intent_id: intentId,
          tenant_id: String(args.p_tenant_id),
          legal_entity_id: String(args.p_legal_entity_id),
          livemode: false,
          version: 1,
          status: "confirmed",
          provider_account_id: options.confirmed.accountId,
          binding_id: "55555555-5555-5555-5555-555555555555",
          binding_status: options.confirmed.bindingStatus,
          created_at: null,
          replayed: true,
        };
        return { data: intent, error: null };
      }
      if (open) return { data: { ...open, replayed: true }, error: null };
      open = {
        intent_id: intentId,
        tenant_id: String(args.p_tenant_id),
        legal_entity_id: String(args.p_legal_entity_id),
        livemode: Boolean(args.p_livemode),
        version: 1,
        status: "open",
        provider_account_id: null,
        binding_id: null,
        binding_status: null,
        created_at: options.openedAt ?? new Date().toISOString(),
        replayed: false,
      };
      return { data: open, error: null };
    }),
  };
  return { session, rpcCalls, intentId };
}

const post = (
  handlers: ReturnType<typeof createPaymentAccountsHandlers>,
  body: Record<string, unknown> = {
    legal_entity_id: ENTITY_ID,
    reason: "Initial setup",
  },
  headers: Record<string, string> = {},
) =>
  handlers.POST(
    new NextRequest("https://evil.example/api/admin/payment-accounts", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
  );

function handlersWith(
  fake: ReturnType<typeof createFakeStripe>,
  secretKey = "sk_test_123",
) {
  const createStripe = vi.fn(() => fake.client);
  const handlers = createPaymentAccountsHandlers({
    getSecretKey: () => secretKey,
    getConfiguredOrigin: () => ORIGIN,
    createStripe,
  });
  return { handlers, createStripe };
}

describe("Stripe Connect helper (W8-R2, R38: Accounts v2)", () => {
  it("holds the ruled account configuration in one constant, in Accounts v2 form", () => {
    expect(STRIPE_CONNECT_ACCOUNT_CONFIGURATION).toEqual({
      dashboard: "full",
      defaults: {
        responsibilities: {
          fees_collector: "stripe",
          losses_collector: "stripe",
        },
      },
      configuration: {
        merchant: { capabilities: { card_payments: { requested: true } } },
      },
    });
    const params = buildConnectedAccountCreateParams({
      intentId: "intent-1",
      countryCode: "US",
      currency: "usd",
      legalName: "GiveHope Organization Inc.",
    });
    expect(params).toEqual({
      display_name: "GiveHope Organization Inc.",
      dashboard: "full",
      identity: { country: "US" },
      defaults: {
        currency: "usd",
        responsibilities: {
          fees_collector: "stripe",
          losses_collector: "stripe",
        },
      },
      configuration: {
        merchant: { capabilities: { card_payments: { requested: true } } },
      },
      metadata: { asym_onboarding_intent: "intent-1" },
      include: [...CONNECTED_ACCOUNT_INCLUDE],
    });
    expect(JSON.stringify(params)).not.toMatch(
      /application_fee|controller|"type"|tenant_id|legal_entity_id/,
    );
    expect(onboardingIntentIdempotencyKey("intent-1")).toBe(
      "asym-wp8a-onboarding:intent-1:account",
    );
  });

  it("builds Accounts v2 account links from the configured origin only", () => {
    expect(
      resolveAdminConfiguredOrigin({ NEXT_PUBLIC_APP_URL: `${ORIGIN}/x?y=1` }),
    ).toBe(ORIGIN);
    expect(() => resolveAdminConfiguredOrigin({})).toThrow(/not configured/);
    expect(buildConnectOnboardingUrls(ORIGIN)).toEqual({
      returnUrl: `${ORIGIN}/settings/payments?onboarding=return`,
      refreshUrl: `${ORIGIN}/settings/payments?onboarding=refresh`,
    });
    expect(
      buildAccountLinkParams({
        accountId: "acct_1Abc",
        origin: ORIGIN,
        useCase: "account_update",
      }),
    ).toEqual({
      account: "acct_1Abc",
      use_case: {
        type: "account_update",
        account_update: {
          configurations: ["merchant"],
          return_url: `${ORIGIN}/settings/payments?onboarding=return`,
          refresh_url: `${ORIGIN}/settings/payments?onboarding=refresh`,
        },
      },
    });
  });

  it("refuses live keys, requires a connected account on connected-account requests, and classifies provider outcomes", () => {
    for (const key of ["sk_live_x", "rk_live_x", "pk_live_x"])
      expect(() => assertStripeTestModeKey(key)).toThrow(
        StripeLiveModeRefusedError,
      );
    expect(assertStripeTestModeKey("sk_test_123")).toBe("sk_test_123");
    expect(assertStripeTestModeKey("rk_test_123")).toBe("rk_test_123");
    expect(() => assertStripeTestModeKey("whsec_x")).toThrow();
    expect(() => assertConnectedAccountId("cus_123")).toThrow();
    expect(connectedAccountRequestOptions("acct_1Abc", "idem-1")).toEqual({
      stripeAccount: "acct_1Abc",
      idempotencyKey: "idem-1",
    });
    expect(
      isUnknownProviderOutcome(stripeError("StripeConnectionError", "x")),
    ).toBe(true);
    expect(
      isUnknownProviderOutcome(stripeError("StripeAPIError", "x", 500)),
    ).toBe(true);
    expect(isUnknownProviderOutcome(new Error("socket"))).toBe(true);
    expect(
      isUnknownProviderOutcome(
        stripeError("StripeInvalidRequestError", "x", 400),
      ),
    ).toBe(false);
    expect(
      isUnknownProviderOutcome(stripeError("StripeIdempotencyError", "x", 400)),
    ).toBe(false);
  });

  it("accepts an account only when Stripe says it carries this intent, in this mode, open, with the full dashboard", () => {
    const account = {
      id: "acct_1Abc",
      livemode: false,
      closed: false,
      dashboard: "full",
      metadata: { asym_onboarding_intent: "intent-1" },
    };
    expect(
      assertAccountBelongsToIntent(account, {
        intentId: "intent-1",
        livemode: false,
      }),
    ).toMatchObject({ id: "acct_1Abc", card_payments_status: null });
    for (const [change, intent] of [
      [{ metadata: { asym_onboarding_intent: "intent-2" } }, "intent-1"],
      [{ livemode: true }, "intent-1"],
      [{ closed: true }, "intent-1"],
      [{ dashboard: "express" }, "intent-1"],
    ] as const)
      expect(() =>
        assertAccountBelongsToIntent(
          { ...account, ...change },
          { intentId: intent, livemode: false },
        ),
      ).toThrow(ConnectedAccountMismatchError);
  });
});

describe("Mission Control onboarding route (R31, finding 8)", () => {
  it("refuses a live key before any provider client exists, and names no account to the database", async () => {
    const fake = createFakeStripe();
    const { session, rpcCalls } = createFakeSession();
    authState.sessionClient = session;
    const { handlers, createStripe } = handlersWith(fake, "sk_live_platform");
    const res = await post(handlers);
    expect(res.status).toBe(503);
    expect(createStripe).not.toHaveBeenCalled();
    expect(fake.providerCallCount()).toBe(0);
    expect(rpcCalls).toEqual([]);
  });

  it("records the intent first with no provider account id, and a caller's idempotency key never reaches Stripe", async () => {
    const fake = createFakeStripe();
    const { session, rpcCalls, intentId } = createFakeSession();
    authState.sessionClient = session;
    const { handlers } = handlersWith(fake);
    const first = await post(handlers, {
      legal_entity_id: ENTITY_ID,
      reason: "Initial setup",
      idempotency_key: "client-key-1",
    });
    const second = await post(handlers, {
      legal_entity_id: ENTITY_ID,
      reason: "Clicked again",
      idempotency_key: "client-key-2",
    });
    expect([first.status, second.status]).toEqual([201, 200]);
    const bodies = [await first.json(), await second.json()];
    expect(bodies.map((b) => b.providerAccountId)).toEqual([
      "acct_fake1",
      "acct_fake1",
    ]);
    expect(fake.accounts.size).toBe(1);
    expect(fake.calls.create.map((c) => c.key)).toEqual([
      onboardingIntentIdempotencyKey(intentId),
      onboardingIntentIdempotencyKey(intentId),
    ]);
    const begin = rpcCalls.filter(
      (c) => c.fn === "begin_payment_account_onboarding",
    );
    expect(begin[0]?.args).toEqual({
      p_tenant_id: authState.tenantId,
      p_legal_entity_id: ENTITY_ID,
      p_livemode: false,
      p_reason: "Initial setup",
    });
    expect(fake.calls.links[0]).toEqual(
      buildAccountLinkParams({
        accountId: "acct_fake1",
        origin: ORIGIN,
        useCase: "account_onboarding",
      }),
    );
  });

  it("a crash after Stripe created the account, then a retry, leaves one account", async () => {
    const fake = createFakeStripe();
    const { session } = createFakeSession();
    authState.sessionClient = session;
    const { handlers } = handlersWith(fake);
    fake.crashNextLink();
    const crashed = await post(handlers);
    expect(crashed.status).toBe(500);
    const retried = await post(handlers);
    expect(retried.status).toBe(200);
    expect(fake.accounts.size).toBe(1);
    expect((await retried.json()).providerAccountId).toBe("acct_fake1");
  });

  it("an unknown outcome is reconciled with the same key before anything else is created", async () => {
    const fake = createFakeStripe({ loseResponses: 1 });
    const { session, intentId } = createFakeSession();
    authState.sessionClient = session;
    const { handlers } = handlersWith(fake);
    const res = await post(handlers);
    expect(res.status).toBe(201);
    expect(fake.calls.create.map((c) => c.key)).toEqual([
      onboardingIntentIdempotencyKey(intentId),
      onboardingIntentIdempotencyKey(intentId),
    ]);
    expect(fake.accounts.size).toBe(1);
  });

  it("a definite provider refusal is not retried and creates nothing", async () => {
    const fake = createFakeStripe({
      failCreateWith: stripeError(
        "StripeInvalidRequestError",
        "Connect is not enabled",
        400,
      ),
    });
    const { session } = createFakeSession();
    authState.sessionClient = session;
    const { handlers } = handlersWith(fake);
    const res = await post(handlers);
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(fake.calls.create).toHaveLength(1);
    expect(fake.accounts.size).toBe(0);
  });

  it("a database refusal comes before any provider call", async () => {
    const fake = createFakeStripe();
    const { session } = createFakeSession({
      refuseWith: { code: "42501", message: "no authority" },
    });
    authState.sessionClient = session;
    const { handlers, createStripe } = handlersWith(fake);
    const res = await post(handlers);
    expect(res.status).toBe(403);
    expect(createStripe).not.toHaveBeenCalled();
    expect(fake.providerCallCount()).toBe(0);
  });

  it("re-issues a link for a confirmed account only after Stripe says the account carries this intent", async () => {
    const fake = createFakeStripe();
    const intentId = "44444444-4444-4444-4444-444444444444";
    fake.accounts.set("acct_mine", {
      id: "acct_mine",
      livemode: false,
      closed: false,
      dashboard: "full",
      metadata: { asym_onboarding_intent: intentId },
      configuration: {
        merchant: { capabilities: { card_payments: { status: "restricted" } } },
      },
    });
    fake.accounts.set("acct_theirs", {
      id: "acct_theirs",
      livemode: false,
      closed: false,
      dashboard: "full",
      metadata: { asym_onboarding_intent: "someone-else" },
      configuration: {
        merchant: { capabilities: { card_payments: { status: "active" } } },
      },
    });

    authState.sessionClient = createFakeSession({
      confirmed: { accountId: "acct_mine", bindingStatus: "restricted" },
    }).session;
    const ok = await post(handlersWith(fake).handlers);
    expect(ok.status).toBe(200);
    expect(fake.calls.create).toHaveLength(0);
    expect(fake.calls.retrieve).toEqual(["acct_mine"]);
    expect(fake.calls.links.at(-1)).toMatchObject({
      account: "acct_mine",
      use_case: { type: "account_update" },
    });

    authState.sessionClient = createFakeSession({
      confirmed: { accountId: "acct_theirs", bindingStatus: "pending" },
    }).session;
    const linksBefore = fake.calls.links.length;
    const refused = await post(handlersWith(fake).handlers);
    expect(refused.status).toBe(409);
    expect(fake.calls.links.length).toBe(linksBefore);

    authState.sessionClient = createFakeSession({
      confirmed: { accountId: "acct_mine", bindingStatus: "active" },
    }).session;
    const callsBefore = fake.providerCallCount();
    const active = await post(handlersWith(fake).handlers);
    expect(active.status).toBe(409);
    expect(fake.providerCallCount()).toBe(callsBefore);
  });

  it("refuses to create for an open intent older than the provider's idempotency window", async () => {
    const fake = createFakeStripe();
    authState.sessionClient = createFakeSession({
      openedAt: "2026-09-01T00:00:00Z",
    }).session;
    const res = await post(handlersWith(fake).handlers);
    expect(res.status).toBe(409);
    expect(fake.providerCallCount()).toBe(0);
  });

  it("ignores forged Host and x-forwarded-host headers and refuses when the configured origin is unset", async () => {
    const fake = createFakeStripe();
    authState.sessionClient = createFakeSession().session;
    const unconfigured = createPaymentAccountsHandlers({
      getSecretKey: () => "sk_test_123",
      getConfiguredOrigin: () => resolveAdminConfiguredOrigin({}),
      createStripe: () => fake.client,
    });
    const refused = await post(unconfigured, undefined, {
      host: "evil.example",
      "x-forwarded-host": "evil-forwarded.example",
    });
    expect(refused.status).toBe(503);
    expect(fake.providerCallCount()).toBe(0);

    const ok = await post(handlersWith(fake).handlers, undefined, {
      host: "evil.example",
      "x-forwarded-host": "attacker.example",
    });
    expect(ok.status).toBe(201);
    expect(fake.calls.links[0]).toMatchObject({
      use_case: {
        account_onboarding: {
          return_url: `${ORIGIN}/settings/payments?onboarding=return`,
          refresh_url: `${ORIGIN}/settings/payments?onboarding=refresh`,
        },
      },
    });
  });

  it("GET reads entities through the capability-checked read and reports a refused live key as not configured", async () => {
    const fake = createFakeStripe();
    const { session, rpcCalls } = createFakeSession();
    authState.sessionClient = session;
    const { handlers, createStripe } = handlersWith(fake, "sk_live_platform");
    const res = await handlers.GET(
      new NextRequest(`${ORIGIN}/api/admin/payment-accounts`),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({
      livemode: false,
      configured: false,
      liveModeRefused: true,
    });
    expect(body.legalEntities[0]).toMatchObject({
      id: ENTITY_ID,
      tax_id: "12-3456789",
      currentBinding: null,
      openIntent: null,
    });
    expect(rpcCalls.map((c) => c.fn)).toEqual(["list_payment_legal_entities"]);
    expect(createStripe).not.toHaveBeenCalled();
  });
});
