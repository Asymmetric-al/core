import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const env = vi.hoisted(() => ({
  serverEnv: {
    GUEST_GIVING_ENABLED: false as boolean,
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA" as
      string | undefined,
  },
}));

const admin = vi.hoisted(() => ({
  made: 0,
  calls: [] as Array<{ fn: string; args: Record<string, unknown> }>,
}));

const provider = vi.hoisted(() => ({
  sendFirstPayment: vi.fn(async () => ({ paymentIntentId: "pi_route1" })),
  paymentClientSecret: vi.fn(async () => "pi_route1_secret_x"),
}));

vi.mock("@asym/env", () => ({ serverEnv: env.serverEnv, clientEnv: {} }));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    admin.made += 1;
    return {
      client: {
        rpc: async (fn: string, args: Record<string, unknown>) => {
          admin.calls.push({ fn, args });
          if (fn === "take_intake_attempt")
            return {
              data: { admitted: true, retry_after_seconds: null },
              error: null,
            };
          return {
            data: {
              outcome: "created",
              donation_id: "33333333-3333-4333-8333-333333333333",
              operation_id: "44444444-4444-4444-8444-444444444444",
              amount: 6000,
              provider_account: "acct_route1",
              payment_intent: null,
              gift_state: "open",
            },
            error: null,
          };
        },
        from: () => {
          throw new Error("the intake route reads and writes no table");
        },
      },
      error: null,
    };
  },
}));

vi.mock("@asym/auth/verified-name", () => ({
  lookUpVerifiedNameSurfaces: async () => ({
    kind: "resolved",
    decisions: {
      donor_account: { kind: "refused", reason: "not_home" },
      website: { kind: "admitted", tenantId: "t-1", generation: 1 },
    },
  }),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

vi.mock(
  "../../../../../packages/api/src/workflows/functions/money-schedule",
  () => provider,
);

const { POST } =
  await import("../../../../../packages/api/src/donate/guest/intake-route");

function giftRequest() {
  return new Request("https://site.give.example.test/api/donate", {
    method: "POST",
    headers: {
      host: "site.give.example.test",
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.4",
    },
    body: JSON.stringify({
      key: "route-key-0001",
      lines: [
        { fundId: "11111111-1111-4111-8111-111111111111", amountCents: 6000 },
      ],
      coverFees: false,
      paymentMethod: "card",
      isAnonymous: false,
      contact: {
        email: "gail@example.test",
        firstName: "Gail",
        lastName: "Guest",
      },
      challengeToken: "token-1",
    }),
  });
}

beforeEach(() => {
  admin.made = 0;
  admin.calls = [];
  provider.sendFirstPayment.mockClear();
  provider.paymentClientSecret.mockClear();
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 }),
    ),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  env.serverEnv.GUEST_GIVING_ENABLED = false;
});

describe("AL-2681 PR 2b: the intake route on the donor app (ruling W8-R17's service-key site)", () => {
  it("with the switch off it answers 503 giving_unavailable before any client is made", async () => {
    const res = await POST(giftRequest());
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "giving_unavailable" });
    expect(admin.made).toBe(0);
    expect(provider.sendFirstPayment).not.toHaveBeenCalled();
  });

  it("with the switch on, its one service-key client calls exactly the limit and the intake command, and reads no table; the first send and the client secret go through the money schedule's own client", async () => {
    env.serverEnv.GUEST_GIVING_ENABLED = true;
    const res = await POST(giftRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      intakeId: "33333333-3333-4333-8333-333333333333",
      clientSecret: "pi_route1_secret_x",
      connectedAccountId: "acct_route1",
      amountCents: 6000,
    });
    expect(admin.made).toBe(1);
    expect(admin.calls.map((c) => c.fn)).toEqual([
      "take_intake_attempt",
      "begin_line_gift",
    ]);
    expect(provider.sendFirstPayment).toHaveBeenCalledWith(
      "44444444-4444-4444-8444-444444444444",
    );
    expect(provider.paymentClientSecret).toHaveBeenCalledWith({
      account: "acct_route1",
      paymentIntentId: "pi_route1",
    });
  });
});
