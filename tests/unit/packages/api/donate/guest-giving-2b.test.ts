import { describe, expect, it, vi } from "vitest";

import { verifyGuestChallenge } from "../../../../../packages/api/src/donate/guest/challenge";
import {
  createGivingConfigHandler,
  type GivingConfigDeps,
} from "../../../../../packages/api/src/donate/guest/config-handler";
import {
  createGuestIntakeHandler,
  type GuestIntakeDeps,
} from "../../../../../packages/api/src/donate/guest/intake-handler";

const FUND = "11111111-1111-4111-8111-111111111111";
const INTAKE = "33333333-3333-4333-8333-333333333333";
const OPERATION = "44444444-4444-4444-8444-444444444444";
const SITE = "66666666-6666-4666-8666-666666666666";
const USER = "77777777-7777-4777-8777-777777777777";

type Call = { fn: string; args: Record<string, unknown> };

function giftBody(overrides: Record<string, unknown> = {}) {
  return {
    key: "browser-key-0001",
    lines: [{ fundId: FUND, amountCents: 6000 }],
    coverFees: false,
    paymentMethod: "card",
    isAnonymous: false,
    contact: {
      email: "gail@example.test",
      firstName: "Gail",
      lastName: "Guest",
    },
    challengeToken: "token-1",
    ...overrides,
  };
}

function post(path: string, payload: unknown) {
  return new Request(`https://give.example.test${path}`, {
    method: "POST",
    headers: {
      host: "give.example.test",
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.4",
    },
    body: JSON.stringify(payload),
  });
}

function intake(
  over: Partial<GuestIntakeDeps> & {
    attempt?: {
      data: unknown;
      error: { code?: string; message: string } | null;
    };
    begin?: { data: unknown; error: { code?: string; message: string } | null };
  } = {},
) {
  const calls: Call[] = [];
  const rpc = vi.fn(async (fn: string, args: Record<string, unknown>) => {
    calls.push({ fn, args });
    if (fn === "take_intake_attempt")
      return (
        over.attempt ?? {
          data: { admitted: true, retry_after_seconds: null },
          error: null,
        }
      );
    return (
      over.begin ?? {
        data: {
          outcome: "created",
          donation_id: INTAKE,
          operation_id: OPERATION,
          amount: 6000,
          provider_account: "acct_alpha1",
          payment_intent: null,
          gift_state: "open",
        },
        error: null,
      }
    );
  });
  const deps: GuestIntakeDeps = {
    enabled: () => true,
    challengeSecret: () => "1x0000000000000000000000000000000AA",
    verifyChallenge: async () => ({ ok: true as const }),
    rpc: () => rpc as never,
    sendFirst: async () => ({ paymentIntentId: "pi_first1" }),
    clientSecret: async () => "pi_first1_secret_abc",
    isHomeHost: async () => true,
    resolveActor: async () => ({
      user_id: USER,
      email: "signed@example.test",
      email_confirmed: true,
    }),
    ...over,
  };
  return { handler: createGuestIntakeHandler(deps), calls };
}

const beginArgs = (calls: Call[]) =>
  calls.find((c) => c.fn === "begin_line_gift")?.args;

describe("AL-2681 PR 2b item zero 4: the handed-off source Site reaches the intake", () => {
  it("a signed-in account-area gift passes its source Site to the command", async () => {
    const s = intake();
    const res = await s.handler(
      post(
        "/api/donate",
        giftBody({
          mode: "signed_in",
          surface: "donor_account",
          sourceSiteId: SITE,
        }),
      ),
    );
    expect(res.status).toBe(200);
    expect(beginArgs(s.calls)).toMatchObject({
      p_site_id: SITE,
      p_entry_surface: "donor_account",
    });
  });

  it("a source Site that is not a UUID is sent as none, never refused (ruling row 3)", async () => {
    const s = intake();
    const res = await s.handler(
      post(
        "/api/donate",
        giftBody({
          mode: "signed_in",
          surface: "donor_account",
          sourceSiteId: "not-a-site",
        }),
      ),
    );
    expect(res.status).toBe(200);
    expect(beginArgs(s.calls)).toMatchObject({ p_site_id: null });
  });

  it("the command's source_site_not_admitted (a source Site on the website surface) is answered 400 with its name", async () => {
    const s = intake({
      begin: {
        data: null,
        error: { code: "22023", message: "source_site_not_admitted" },
      },
    });
    const res = await s.handler(
      post("/api/donate", giftBody({ sourceSiteId: SITE })),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "source_site_not_admitted" });
    expect(beginArgs(s.calls)).toMatchObject({
      p_site_id: SITE,
      p_entry_surface: "website",
    });
  });
});

describe("AL-2681 PR 2b item zero 6: the limit of gift attempts", () => {
  it("a guest's attempt asks the limit with the host, the surface, the client address, the key and no user", async () => {
    const s = intake();
    await s.handler(post("/api/donate", giftBody()));
    expect(s.calls.find((c) => c.fn === "take_intake_attempt")?.args).toEqual({
      p_host: "give.example.test",
      p_surface: "website",
      p_address: "198.51.100.4",
      p_client_key: "browser-key-0001",
      p_user_id: null,
    });
  });

  it("a signed-in attempt names the session's user, never a body actor", async () => {
    const s = intake();
    await s.handler(
      post(
        "/api/donate",
        giftBody({ mode: "signed_in", actor: { user_id: "forged" } }),
      ),
    );
    expect(
      s.calls.find((c) => c.fn === "take_intake_attempt")?.args,
    ).toMatchObject({
      p_user_id: USER,
    });
  });

  it("a refused attempt is 429 with retryAfterSeconds, Retry-After and the bucket that refused, and nothing is begun", async () => {
    const s = intake({
      attempt: {
        data: { admitted: false, retry_after_seconds: 37, bucket: "person" },
        error: null,
      },
    });
    const res = await s.handler(post("/api/donate", giftBody()));
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("37");
    expect(await res.json()).toEqual({
      error: "too_many_requests",
      retryAfterSeconds: 37,
      bucket: "person",
    });
    expect(beginArgs(s.calls)).toBeUndefined();
  });

  it("a host the limit does not admit (42501) is giving_unavailable; any other failure of the limit is payment_not_started with retry", async () => {
    const host = intake({
      attempt: {
        data: null,
        error: { code: "42501", message: "host_not_admitted" },
      },
    });
    const refused = await host.handler(post("/api/donate", giftBody()));
    expect(refused.status).toBe(503);
    expect(await refused.json()).toEqual({ error: "giving_unavailable" });
    const broken = intake({
      attempt: { data: null, error: { message: "rpc_failed" } },
    });
    const failed = await broken.handler(post("/api/donate", giftBody()));
    expect(failed.status).toBe(503);
    expect(await failed.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
    const malformed = intake({
      attempt: { data: { admitted: "yes" }, error: null },
    });
    expect(
      (await malformed.handler(post("/api/donate", giftBody()))).status,
    ).toBe(503);
  });
});

function config(over: Partial<GivingConfigDeps> & { rows?: unknown } = {}) {
  const rpc = vi.fn(async () => ({
    data:
      over.rows === undefined
        ? [{ connected_account_id: "acct_alpha1", way_back_host: null }]
        : over.rows,
    error: null,
  }));
  const deps: GivingConfigDeps = {
    enabled: () => true,
    publishableKey: () => "pk_test_51abc",
    rpc: () => rpc as never,
    ...over,
  };
  return { handler: createGivingConfigHandler(deps), rpc };
}

describe("AL-2681 PR 2b item zero 5: the config read says which surface asks, and the way back", () => {
  it("a website request asks as website with no source Site, and answers no way back", async () => {
    const s = config();
    const res = await s.handler(
      post("/api/checkout/config", { targets: [{ fundId: FUND }] }),
    );
    expect(await res.json()).toEqual({
      publishableKey: "pk_test_51abc",
      connectedAccountId: "acct_alpha1",
      wayBackHost: null,
    });
    expect(s.rpc).toHaveBeenCalledWith("checkout_giving_config", {
      p_host: "give.example.test",
      p_targets: [{ fund_id: FUND }],
      p_surface: "website",
      p_source_site: null,
    });
  });

  it("an account-area request asks as donor_account with its source Site and answers the Site's primary domain", async () => {
    const s = config({
      rows: [
        {
          connected_account_id: "acct_alpha1",
          way_back_host: "site.give.example.test",
        },
      ],
    });
    const res = await s.handler(
      post("/api/checkout/config", {
        targets: [{ fundId: FUND }],
        surface: "donor_account",
        sourceSiteId: SITE,
      }),
    );
    expect(await res.json()).toMatchObject({
      wayBackHost: "site.give.example.test",
    });
    expect(s.rpc).toHaveBeenCalledWith(
      "checkout_giving_config",
      expect.objectContaining({
        p_surface: "donor_account",
        p_source_site: SITE,
      }),
    );
  });

  it("an unknown surface, or a source Site that is not a UUID, is not sent: the surface is refused as unavailable and the Site as none", async () => {
    const odd = config();
    const res = await odd.handler(
      post("/api/checkout/config", {
        targets: [{ fundId: FUND }],
        surface: "elsewhere",
      }),
    );
    expect(res.status).toBe(503);
    expect(odd.rpc).not.toHaveBeenCalled();
    const loose = config();
    await loose.handler(
      post("/api/checkout/config", {
        targets: [{ fundId: FUND }],
        sourceSiteId: "x",
      }),
    );
    expect(loose.rpc).toHaveBeenCalledWith(
      "checkout_giving_config",
      expect.objectContaining({ p_source_site: null }),
    );
  });
});

describe("AL-2681 PR 2b, issue 2857 item 37: a wrong server secret is the server's fault", () => {
  it.each(["invalid-input-secret", "missing-input-secret"])(
    "Turnstile's %s is unavailable (retryable), not a failed challenge",
    async (code) => {
      const fetchImpl = vi.fn(
        async () =>
          new Response(
            JSON.stringify({ success: false, "error-codes": [code] }),
            { status: 200 },
          ),
      );
      expect(
        await verifyGuestChallenge({
          token: "token-1",
          remoteIp: "198.51.100.4",
          secret: "1x0000000000000000000000000000000AA",
          fetchImpl,
        }),
      ).toEqual({ ok: false, reason: "unavailable" });
    },
  );
});

describe("AL-2681 PR 2b: amount_out_of_range carries the bounds the command states", () => {
  it("the 400 names the minimum and maximum the command's refusal states, so the page types no figure", async () => {
    const s = intake({
      begin: {
        data: null,
        error: {
          code: "22023",
          message: "amount_out_of_range",
          details:
            "A gift in US dollars is between 50 and 99,999,999 cents, fee cover included.",
        } as never,
      },
    });
    const res = await s.handler(post("/api/donate", giftBody()));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "amount_out_of_range",
      minCents: 50,
      maxCents: 99_999_999,
      currency: "usd",
    });
  });
});
