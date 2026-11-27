import { describe, expect, it, vi } from "vitest";

import { quoteGiftProcessingFee } from "../../../../../packages/api/src/donate/fee-policy";
import {
  createGuestIntakeHandler,
  type GuestIntakeDeps,
} from "../../../../../packages/api/src/donate/guest/intake-handler";

const FUND = "11111111-1111-4111-8111-111111111111";
const WORKER = "22222222-2222-4222-8222-222222222222";
const INTAKE = "33333333-3333-4333-8333-333333333333";
const OPERATION = "44444444-4444-4444-8444-444444444444";

type Call = { fn: string; args: Record<string, unknown> };

function body(overrides: Record<string, unknown> = {}) {
  return {
    key: "browser-key-0001",
    lines: [
      { fundId: FUND, amountCents: 6000 },
      { missionaryId: WORKER, amountCents: 4000 },
    ],
    coverFees: true,
    paymentMethod: "card",
    isAnonymous: false,
    sourceCode: "spring-appeal",
    contact: {
      email: "gail@example.test",
      firstName: "Gail",
      lastName: "Guest",
    },
    challengeToken: "token-1",
    ...overrides,
  };
}

function request(payload: unknown, headers: Record<string, string> = {}) {
  return new Request("https://give.example.test/api/donate", {
    method: "POST",
    headers: {
      host: "give.example.test",
      "content-type": "application/json",
      "x-forwarded-for": "198.51.100.4",
      ...headers,
    },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

function setup(
  over: Partial<GuestIntakeDeps> & {
    token?: boolean;
    begin?: { data: unknown; error: { code?: string; message: string } | null };
  } = {},
) {
  const calls: Call[] = [];
  const rpc = vi.fn(async (fn: string, args: Record<string, unknown>) => {
    calls.push({ fn, args });
    if (fn === "take_intake_rate_token")
      return { data: over.token ?? true, error: null };
    return (
      over.begin ?? {
        data: {
          outcome: "created",
          donation_id: INTAKE,
          operation_id: OPERATION,
          tenant_id: "55555555-5555-4555-8555-555555555555",
          amount: 10330,
          currency: "usd",
          provider_account: "acct_alpha1",
          payment_intent: null,
        },
        error: null,
      }
    );
  });
  const verifyChallenge = vi.fn(async () => ({ ok: true as const }));
  const sendFirst = vi.fn(async () => ({ paymentIntentId: "pi_first1" }));
  const clientSecret = vi.fn(async () => "pi_first1_secret_abc");
  const deps: GuestIntakeDeps = {
    enabled: () => true,
    challengeSecret: () => "1x0000000000000000000000000000000AA",
    verifyChallenge,
    rpc: () => rpc as never,
    sendFirst,
    clientSecret,
    isHomeHost: async () => true,
    resolveActor: async () => null,
    ...over,
  };
  return {
    handler: createGuestIntakeHandler(deps),
    calls,
    rpc,
    verifyChallenge: deps.verifyChallenge as typeof verifyChallenge,
    sendFirst: deps.sendFirst as typeof sendFirst,
    clientSecret: deps.clientSecret as typeof clientSecret,
  };
}

describe("AL-2681 PR 2a: the guest intake handler (tested directly; not mounted until 2b)", () => {
  it("answers one generic unavailable while the switch, the challenge secret, the database or the client's address is missing, and calls nothing", async () => {
    for (const over of [
      { enabled: () => false },
      { challengeSecret: () => undefined },
      { rpc: () => null },
    ] as Array<Partial<GuestIntakeDeps>>) {
      const s = setup(over);
      const res = await s.handler(request(body()));
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "giving_unavailable" });
      expect(s.calls).toEqual([]);
      expect(s.verifyChallenge).not.toHaveBeenCalled();
    }
    const noAddress = setup();
    const res = await noAddress.handler(
      request(body(), { "x-forwarded-for": "" }),
    );
    expect(res.status).toBe(503);
    expect(noAddress.calls).toEqual([]);
  });

  it("a missing or failed challenge is refused before any write", async () => {
    const missing = setup();
    const res = await missing.handler(
      request(body({ challengeToken: undefined })),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "challenge_required" });
    expect(missing.calls).toEqual([]);

    const failed = setup({
      verifyChallenge: vi.fn(async () => ({
        ok: false as const,
        reason: "invalid" as const,
      })),
    });
    const res2 = await failed.handler(request(body()));
    expect(res2.status).toBe(400);
    expect(await res2.json()).toEqual({ error: "challenge_failed" });
    expect(failed.calls).toEqual([]);
    expect(failed.verifyChallenge).toHaveBeenCalledWith(
      expect.objectContaining({ token: "token-1", remoteIp: "198.51.100.4" }),
    );
  });

  it("a burst from one address is refused before the intake command or any provider call", async () => {
    const s = setup({ token: false });
    const res = await s.handler(request(body()));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "too_many_requests" });
    expect(s.calls.map((c) => c.fn)).toEqual(["take_intake_rate_token"]);
    expect(s.calls[0]!.args).toEqual({ p_address: "198.51.100.4" });
    expect(s.sendFirst).not.toHaveBeenCalled();
  });

  it("takes the address the host platform set: the first entry of x-forwarded-for", async () => {
    const s = setup({ token: false });
    await s.handler(
      request(body(), { "x-forwarded-for": "203.0.113.9, 10.0.0.1" }),
    );
    expect(s.calls[0]!.args).toEqual({ p_address: "203.0.113.9" });
  });

  it("ignores a browser total: the command gets the lines and the fee the policy computes, the host from the request, and no total", async () => {
    const s = setup();
    const res = await s.handler(
      request(
        body({
          total: 1,
          amount: 1,
          amountCents: 1,
          tenantId: "x",
          bindingId: "y",
        }),
      ),
    );
    expect(res.status).toBe(200);
    const begin = s.calls.find((c) => c.fn === "begin_line_gift")!;
    const fee = quoteGiftProcessingFee({
      giftAmountCents: 10000,
      coverFees: true,
      paymentMethod: "card",
    });
    expect(begin.args).toEqual({
      p_host: "give.example.test",
      p_entry_surface: "website",
      p_client_key: "browser-key-0001",
      p_lines: [
        { fund_id: FUND, amount: 6000 },
        { missionary_id: WORKER, amount: 4000 },
      ],
      p_fee_cover: fee.coverAmountCents,
      p_payment_method: "card",
      p_is_anonymous: false,
      p_source_code: "spring-appeal",
      p_contact: {
        email: "gail@example.test",
        first_name: "Gail",
        last_name: "Guest",
        address: null,
      },
      p_actor: null,
      p_site_id: null,
    });
    expect(JSON.stringify(begin.args)).not.toMatch(
      /"total"|tenantId|bindingId/,
    );
  });

  it("without cover the fee line is zero; bank debit and a malformed body are refused before anything is called", async () => {
    const s = setup();
    await s.handler(request(body({ coverFees: false })));
    expect(
      s.calls.find((c) => c.fn === "begin_line_gift")!.args.p_fee_cover,
    ).toBe(0);
    for (const bad of [
      body({ paymentMethod: "ach" }),
      body({ paymentMethod: "wallet" }),
      body({ lines: [] }),
      body({ lines: [{ fundId: FUND, amountCents: 10.5 }] }),
      body({
        lines: [{ fundId: FUND, missionaryId: WORKER, amountCents: 100 }],
      }),
      "not json",
    ]) {
      const t = setup();
      const res = await t.handler(request(bad));
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "invalid_request" });
      expect(t.calls).toEqual([]);
      expect(t.verifyChallenge).not.toHaveBeenCalled();
    }
  });

  it("sends the first request inline and answers the client secret and the connected account, never a tenant or binding", async () => {
    const s = setup();
    const res = await s.handler(request(body()));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      intakeId: INTAKE,
      clientSecret: "pi_first1_secret_abc",
      connectedAccountId: "acct_alpha1",
      amountCents: 10330,
    });
    expect(s.sendFirst).toHaveBeenCalledWith(OPERATION);
    expect(s.clientSecret).toHaveBeenCalledWith({
      account: "acct_alpha1",
      paymentIntentId: "pi_first1",
    });
  });

  it("a replay that already holds its payment answers its client secret without sending again", async () => {
    const s = setup({
      begin: {
        data: {
          outcome: "replayed",
          donation_id: INTAKE,
          operation_id: OPERATION,
          tenant_id: "55555555-5555-4555-8555-555555555555",
          amount: 10330,
          currency: "usd",
          provider_account: "acct_alpha1",
          payment_intent: "pi_first1",
        },
        error: null,
      },
    });
    const res = await s.handler(request(body()));
    expect(res.status).toBe(200);
    expect(s.sendFirst).not.toHaveBeenCalled();
  });

  it("a send that did not succeed asks the browser to retry with the same key", async () => {
    const s = setup({ sendFirst: vi.fn(async () => null) });
    const res = await s.handler(request(body()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
    expect(s.clientSecret).not.toHaveBeenCalled();
  });

  it("maps the command's refusals: admission and state to the generic answer, input to its name, a reused key to 409", async () => {
    const cases: Array<[{ code: string; message: string }, number, unknown]> = [
      [
        { code: "42501", message: "host_not_admitted" },
        503,
        { error: "giving_unavailable" },
      ],
      [
        { code: "55000", message: "binding_unavailable" },
        503,
        { error: "giving_unavailable" },
      ],
      [
        { code: "55000", message: "organization_inactive" },
        503,
        { error: "giving_unavailable" },
      ],
      [
        { code: "22023", message: "lines_span_entities" },
        400,
        { error: "lines_span_entities" },
      ],
      [
        { code: "22023", message: "reserved_fund_line" },
        400,
        { error: "reserved_fund_line" },
      ],
      [
        { code: "22023", message: "something unexpected" },
        400,
        { error: "invalid_request" },
      ],
      [
        { code: "23505", message: "idempotency_key_reused" },
        409,
        { error: "idempotency_key_reused" },
      ],
      [
        { code: "XX000", message: "boom" },
        503,
        { error: "payment_not_started", retry: true },
      ],
    ];
    for (const [error, status, payload] of cases) {
      const s = setup({ begin: { data: null, error } });
      const res = await s.handler(request(body()));
      expect(res.status, error.message).toBe(status);
      expect(await res.json()).toEqual(payload);
      expect(s.sendFirst).not.toHaveBeenCalled();
    }
  });

  const sessionActor = {
    user_id: "66666666-6666-4666-8666-666666666666",
    email: "sam@example.test",
    email_confirmed: true,
  };
  const forgedActor = {
    user_id: "77777777-7777-4777-8777-777777777777",
    email: "forged@example.test",
    email_confirmed: true,
  };
  const actorSent = (s: ReturnType<typeof setup>) =>
    s.calls.find((c) => c.fn === "begin_line_gift")!.args.p_actor;

  it("the account area needs a signed-in giver on the organization's home and passes the session's actor, never the body's; off the home it reads no session and is unavailable", async () => {
    const none = setup();
    const res = await none.handler(request(body({ surface: "donor_account" })));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "sign_in_required" });
    expect(none.calls).toEqual([]);

    const signed = setup({ resolveActor: async () => sessionActor });
    await signed.handler(
      request(body({ surface: "donor_account", actor: forgedActor })),
    );
    const begin = signed.calls.find((c) => c.fn === "begin_line_gift")!;
    expect(begin.args.p_entry_surface).toBe("donor_account");
    expect(begin.args.p_actor).toEqual(sessionActor);

    const resolveActor = vi.fn(async () => sessionActor);
    const away = setup({ isHomeHost: async () => false, resolveActor });
    const res2 = await away.handler(
      request(body({ surface: "donor_account" })),
    );
    expect(res2.status).toBe(503);
    expect(await res2.json()).toEqual({ error: "giving_unavailable" });
    expect(resolveActor).not.toHaveBeenCalled();
    expect(away.calls).toEqual([]);
  });

  it("row 1: on the organization's home a signed-in giver gives in place on the website surface with the session's actor; a forged body actor is never read (ruling of 27 November, section 3)", async () => {
    const isHomeHost = vi.fn(async () => true);
    const signed = setup({
      isHomeHost,
      resolveActor: async () => sessionActor,
    });
    await signed.handler(request(body({ actor: forgedActor })));
    expect(isHomeHost).toHaveBeenCalledWith("give.example.test");
    const begin = signed.calls.find((c) => c.fn === "begin_line_gift")!;
    expect(begin.args.p_entry_surface).toBe("website");
    expect(begin.args.p_actor).toEqual(sessionActor);

    const anonymous = setup({ resolveActor: async () => null });
    await anonymous.handler(request(body({ actor: forgedActor })));
    expect(actorSent(anonymous)).toBeNull();
  });

  it("'give as a guest instead' can only remove the actor: no session is read and the command gets none; it cannot be combined with the account area (section 5)", async () => {
    const resolveActor = vi.fn(async () => sessionActor);
    const s = setup({ resolveActor });
    const res = await s.handler(
      request(body({ asGuest: true, actor: forgedActor })),
    );
    expect(res.status).toBe(200);
    expect(resolveActor).not.toHaveBeenCalled();
    expect(actorSent(s)).toBeNull();
    expect(
      s.calls.find((c) => c.fn === "begin_line_gift")!.args.p_entry_surface,
    ).toBe("website");

    const both = setup({ resolveActor });
    const res2 = await both.handler(
      request(body({ asGuest: true, surface: "donor_account" })),
    );
    expect(res2.status).toBe(400);
    expect(await res2.json()).toEqual({ error: "invalid_request" });
    expect(both.calls).toEqual([]);
  });

  it("row 6: off the organization's home a session is never read, so a cookie on another Site's name is ignored and the gift is a guest's", async () => {
    const resolveActor = vi.fn(async () => sessionActor);
    const s = setup({ isHomeHost: async () => false, resolveActor });
    const res = await s.handler(request(body({ actor: forgedActor })));
    expect(res.status).toBe(200);
    expect(resolveActor).not.toHaveBeenCalled();
    expect(actorSent(s)).toBeNull();
  });

  it("a failed home lookup reads no session, writes nothing and asks for a retry", async () => {
    const resolveActor = vi.fn(async () => sessionActor);
    const s = setup({
      isHomeHost: async () => {
        throw new Error("database down");
      },
      resolveActor,
    });
    const res = await s.handler(request(body()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
    expect(resolveActor).not.toHaveBeenCalled();
    expect(s.calls).toEqual([]);
  });

  it("answers only the intake, the client secret, the account and the amount, whatever else the command's answer carries: no Party id, donor or match flag (section 6)", async () => {
    const s = setup({
      begin: {
        data: {
          outcome: "created",
          donation_id: INTAKE,
          operation_id: OPERATION,
          tenant_id: "55555555-5555-4555-8555-555555555555",
          amount: 10330,
          currency: "usd",
          provider_account: "acct_alpha1",
          payment_intent: null,
          party_id: "88888888-8888-4888-8888-888888888888",
          donor_id: "99999999-9999-4999-8999-999999999999",
          matched: true,
        },
        error: null,
      },
    });
    const res = await s.handler(request(body()));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(Object.keys(JSON.parse(text)).sort()).toEqual(
      ["amountCents", "clientSecret", "connectedAccountId", "intakeId"].sort(),
    );
    expect(text).not.toMatch(/8888|9999|matched|party|donor|tenant/i);
  });

  it("takes the host only from the request's own Host header: forwarded hosts, front headers, a tenant header and body fields are ignored (W8-R41)", async () => {
    const s = setup();
    await s.handler(
      request(
        body({ host: "evil.example", tenantId: "other", siteId: "other" }),
        {
          "x-forwarded-host": "evil.example",
          "x-asym-front-host": "evil.example",
          "x-asym-tenant": "66666666-6666-4666-8666-666666666666",
          "x-asym-name-tenant": "66666666-6666-4666-8666-666666666666",
          origin: "https://evil.example",
        },
      ),
    );
    const begin = s.calls.find((c) => c.fn === "begin_line_gift")!;
    expect(begin.args.p_host).toBe("give.example.test");
    expect(Object.keys(begin.args).sort()).toEqual(
      [
        "p_actor",
        "p_client_key",
        "p_contact",
        "p_entry_surface",
        "p_fee_cover",
        "p_host",
        "p_is_anonymous",
        "p_lines",
        "p_payment_method",
        "p_site_id",
        "p_source_code",
      ].sort(),
    );
  });

  it("a request with no Host header is unavailable and calls nothing", async () => {
    const s = setup();
    const req = request(body());
    const headers = new Headers(req.headers);
    headers.delete("host");
    const res = await s.handler(
      new Request("https://give.example.test/api/donate", {
        method: "POST",
        headers,
        body: JSON.stringify(body()),
      }),
    );
    expect(res.status).toBe(503);
    expect(s.calls).toEqual([]);
  });

  it("keeps apart what a donor must be told apart: a ministry that cannot take gifts here, a payment that could not start (try again), a burst, a failed challenge (outcome 4 of 27 November)", async () => {
    const unavailable = setup({
      begin: {
        data: null,
        error: { code: "55000", message: "binding_unavailable" },
      },
    });
    expect(await (await unavailable.handler(request(body()))).json()).toEqual({
      error: "giving_unavailable",
    });
    const limiterDown = setup();
    limiterDown.rpc.mockImplementationOnce(async () => ({
      data: null,
      error: { message: "database down" },
    }));
    const res = await limiterDown.handler(request(body()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
    const challengeDown = setup({
      verifyChallenge: vi.fn(async () => ({
        ok: false as const,
        reason: "unavailable" as const,
      })),
    });
    const res2 = await challengeDown.handler(request(body()));
    expect(res2.status).toBe(503);
    expect(await res2.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
    expect(challengeDown.calls).toEqual([]);
  });
});
