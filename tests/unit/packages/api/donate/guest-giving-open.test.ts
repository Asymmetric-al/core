import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const made = vi.hoisted(() => ({ anonymous: 0, admin: 0 }));

vi.mock("@asym/env", () => ({
  serverEnv: {
    GUEST_GIVING_ENABLED: true,
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
  },
  clientEnv: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_51abc",
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
  },
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
  createAnonymousClient: () => {
    made.anonymous += 1;
    return {
      rpc: async () => ({
        data: [{ connected_account_id: "acct_1", way_back_host: null }],
        error: null,
      }),
    };
  },
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    made.admin += 1;
    return {
      client: {
        rpc: async () => ({
          data: { admitted: true, retry_after_seconds: null },
          error: null,
        }),
      },
      error: null,
    };
  },
}));

vi.mock("@asym/auth/verified-name", () => ({
  lookUpVerifiedNameSurfaces: async () => ({ kind: "unavailable" }),
}));

vi.mock(
  "../../../../../packages/api/src/workflows/functions/money-schedule",
  () => ({
    sendFirstPayment: vi.fn(async () => null),
    paymentClientSecret: vi.fn(async () => null),
  }),
);

const { POST: configRead } =
  await import("../../../../../packages/api/src/donate/guest/config-route");
const { POST: intake } =
  await import("../../../../../packages/api/src/donate/guest/intake-route");

const FUND = "11111111-1111-4111-8111-111111111111";

const OPEN: Record<string, string> = {
  GUEST_GIVING_ENABLED: "true",
  TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_51abc",
};

function post(path: string, body: unknown) {
  return new Request(`https://give.example.test${path}`, {
    method: "POST",
    headers: {
      host: "give.example.test",
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.7",
    },
    body: JSON.stringify(body),
  });
}

const gift = {
  key: "open-key-0001",
  mode: "guest",
  surface: "website",
  lines: [{ fundId: FUND, amountCents: 2500 }],
  coverFees: false,
  paymentMethod: "card",
  isAnonymous: false,
  contact: { email: "gail@example.test" },
  challengeToken: "token-1",
};

beforeEach(() => {
  made.anonymous = 0;
  made.admin = 0;
  for (const [name, value] of Object.entries(OPEN)) vi.stubEnv(name, value);
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("AL-2681 B fix round X9: giving is open is one question, asked the same way by the proxy and by both routes", () => {
  it.each([
    ["the switch", { GUEST_GIVING_ENABLED: "" }],
    ["the challenge secret", { TURNSTILE_SECRET_KEY: "" }],
    ["the challenge site key", { NEXT_PUBLIC_TURNSTILE_SITE_KEY: "" }],
    ["the publishable key", { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "" }],
    [
      "a test-mode publishable key (a live one is set)",
      { NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_51abc" },
    ],
  ])(
    "without %s, the config read and the intake answer 503 giving_unavailable before any client is made",
    async (_control, missing) => {
      for (const [name, value] of Object.entries(missing))
        vi.stubEnv(name, value);
      const read = await configRead(
        post("/api/checkout/config", { targets: [{ fundId: FUND }] }),
      );
      const sent = await intake(post("/api/donate", gift));
      expect([read.status, await read.json()]).toEqual([
        503,
        { error: "giving_unavailable" },
      ]);
      expect([sent.status, await sent.json()]).toEqual([
        503,
        { error: "giving_unavailable" },
      ]);
      expect(made).toEqual({ anonymous: 0, admin: 0 });
    },
  );

  it("with every control set, the config read makes its client and answers", async () => {
    const read = await configRead(
      post("/api/checkout/config", { targets: [{ fundId: FUND }] }),
    );
    expect(read.status).toBe(200);
    expect(made.anonymous).toBe(1);
  });

  it("the proxy asks the very predicate the routes ask", async () => {
    const policy = await import("../../../../../apps/donor/lib/route-policy");
    const shared =
      await import("../../../../../packages/api/src/donate/guest/giving-open");
    expect(policy.isGuestGivingOpen).toBe(shared.isGuestGivingOpen);
  });
});
