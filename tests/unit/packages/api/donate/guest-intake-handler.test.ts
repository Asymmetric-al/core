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

const CREATED = {
  outcome: "created",
  donation_id: INTAKE,
  operation_id: OPERATION,
  tenant_id: "55555555-5555-4555-8555-555555555555",
  amount: 10330,
  currency: "usd",
  provider_account: "acct_alpha1",
  payment_intent: null,
  gift_state: "open",
};

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
    if (fn === "take_intake_attempt")
      return {
        data:
          (over.token ?? true)
            ? { admitted: true, retry_after_seconds: null }
            : { admitted: false, retry_after_seconds: 60, bucket: "address" },
        error: null,
      };
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
          gift_state: "open",
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

describe("AL-2681 PR 2a: the guest intake handler (tested directly; not mounted until 2b) (D-18, AL-2681 PR 2b: the limit is take_intake_attempt, and a refusal carries retryAfterSeconds)", () => {
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
    expect(await res.json()).toEqual({
      error: "too_many_requests",
      retryAfterSeconds: 60,
      bucket: "address",
    });
    expect(s.calls.map((c) => c.fn)).toEqual(["take_intake_attempt"]);
    expect(s.calls[0]!.args).toMatchObject({ p_address: "198.51.100.4" });
    expect(s.sendFirst).not.toHaveBeenCalled();
  });

  it("takes the address the host platform set: the first entry of x-forwarded-for", async () => {
    const s = setup({ token: false });
    await s.handler(
      request(body(), { "x-forwarded-for": "203.0.113.9, 10.0.0.1" }),
    );
    expect(s.calls[0]!.args).toMatchObject({ p_address: "203.0.113.9" });
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
          gift_state: "open",
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
        { code: "22023", message: "target_not_found" },
        400,
        { error: "target_not_found" },
      ],
      [
        { code: "22023", message: "contact_required" },
        400,
        { error: "contact_required" },
      ],
      [
        { code: "22023", message: "client_key_invalid" },
        400,
        { error: "client_key_invalid" },
      ],
      [
        { code: "22023", message: "actor_not_admitted" },
        400,
        { error: "actor_not_admitted" },
      ],
      [
        { code: "22023", message: "actor_required" },
        400,
        { error: "actor_required" },
      ],
      [
        { code: "22023", message: "amount_out_of_range" },
        400,
        { error: "amount_out_of_range" },
      ],
      [
        { code: "22023", message: "fee_cover_out_of_range" },
        400,
        { error: "fee_cover_out_of_range" },
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
  const commandCalled = (s: ReturnType<typeof setup>) =>
    s.calls.some((c) => c.fn === "begin_line_gift");
  const tokenTaken = (s: ReturnType<typeof setup>) =>
    s.calls.some((c) => c.fn === "take_intake_attempt");

  it("F3: the request names its path and the server never changes it; with no path named, the donor is a guest", async () => {
    const resolveActor = vi.fn(async () => sessionActor);
    const s = setup({ resolveActor });
    const res = await s.handler(request(body({ actor: forgedActor })));
    expect(res.status).toBe(200);
    expect(resolveActor).not.toHaveBeenCalled();
    expect(actorSent(s)).toBeNull();
  });

  it("F3: on a shared website and home name, the signed-in path with no session answers 401 sign_in_required before the rate token and the command; the same request on the guest path is a guest gift", async () => {
    const signedIn = setup({ resolveActor: async () => null });
    const res = await signedIn.handler(request(body({ mode: "signed_in" })));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "sign_in_required" });
    expect(tokenTaken(signedIn)).toBe(false);
    expect(commandCalled(signedIn)).toBe(false);

    const guest = setup({ resolveActor: async () => null });
    const res2 = await guest.handler(request(body({ mode: "guest" })));
    expect(res2.status).toBe(200);
    expect(actorSent(guest)).toBeNull();
  });

  it("F3: a live session on the guest path gives a guest gift and is never read (section 5: the choice only removes the actor)", async () => {
    const resolveActor = vi.fn(async () => sessionActor);
    const isHomeHost = vi.fn(async () => true);
    const s = setup({ resolveActor, isHomeHost });
    const res = await s.handler(
      request(body({ mode: "guest", actor: forgedActor })),
    );
    expect(res.status).toBe(200);
    expect(resolveActor).not.toHaveBeenCalled();
    expect(isHomeHost).not.toHaveBeenCalled();
    expect(actorSent(s)).toBeNull();
    expect(
      s.calls.find((c) => c.fn === "begin_line_gift")!.args.p_entry_surface,
    ).toBe("website");
  });

  it("F3: the guest path cannot ask for the account area: 400 invalid_request, nothing called", async () => {
    for (const mode of ["guest", undefined]) {
      const s = setup({ resolveActor: async () => sessionActor });
      const res = await s.handler(
        request(body({ mode, surface: "donor_account" })),
      );
      expect(res.status, String(mode)).toBe(400);
      expect(await res.json()).toEqual({ error: "invalid_request" });
      expect(s.calls).toEqual([]);
    }
  });

  it("F3 (row 1): on the organization's home the signed-in path gives in place on the website surface with the session's actor, never the body's", async () => {
    const isHomeHost = vi.fn(async () => true);
    const s = setup({ isHomeHost, resolveActor: async () => sessionActor });
    await s.handler(request(body({ mode: "signed_in", actor: forgedActor })));
    expect(isHomeHost).toHaveBeenCalledWith("give.example.test");
    const begin = s.calls.find((c) => c.fn === "begin_line_gift")!;
    expect(begin.args.p_entry_surface).toBe("website");
    expect(begin.args.p_actor).toEqual(sessionActor);
  });

  it("F3: the account area on the home takes the session's actor; with no session it answers 401 before the token and the command", async () => {
    const signed = setup({ resolveActor: async () => sessionActor });
    await signed.handler(
      request(
        body({
          mode: "signed_in",
          surface: "donor_account",
          actor: forgedActor,
        }),
      ),
    );
    const begin = signed.calls.find((c) => c.fn === "begin_line_gift")!;
    expect(begin.args.p_entry_surface).toBe("donor_account");
    expect(begin.args.p_actor).toEqual(sessionActor);

    const none = setup({ resolveActor: async () => null });
    const res = await none.handler(
      request(body({ mode: "signed_in", surface: "donor_account" })),
    );
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "sign_in_required" });
    expect(none.calls).toEqual([]);
  });

  it("F3 (row 6): off the organization's home the session is never read: the signed-in path answers 401 on the website surface and 503 giving_unavailable in the account area; the guest path is a guest gift", async () => {
    const resolveActor = vi.fn(async () => sessionActor);
    const website = setup({ isHomeHost: async () => false, resolveActor });
    const res = await website.handler(request(body({ mode: "signed_in" })));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "sign_in_required" });
    expect(website.calls).toEqual([]);

    const account = setup({ isHomeHost: async () => false, resolveActor });
    const res2 = await account.handler(
      request(body({ mode: "signed_in", surface: "donor_account" })),
    );
    expect(res2.status).toBe(503);
    expect(await res2.json()).toEqual({ error: "giving_unavailable" });
    expect(account.calls).toEqual([]);

    const guest = setup({ isHomeHost: async () => false, resolveActor });
    const res3 = await guest.handler(request(body({ actor: forgedActor })));
    expect(res3.status).toBe(200);
    expect(actorSent(guest)).toBeNull();
    expect(resolveActor).not.toHaveBeenCalled();
  });

  it("a failed home lookup on the signed-in path reads no session, writes nothing and asks for a retry", async () => {
    const resolveActor = vi.fn(async () => sessionActor);
    const s = setup({
      isHomeHost: async () => {
        throw new Error("database down");
      },
      resolveActor,
    });
    const res = await s.handler(request(body({ mode: "signed_in" })));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
    expect(resolveActor).not.toHaveBeenCalled();
    expect(s.calls).toEqual([]);
  });

  it("F6 (a): a rejected first send or client-secret read is a structured 503 payment_not_started with retry; the stored gift stays for the same key", async () => {
    const failedSend = setup({
      sendFirst: vi.fn(async () => {
        throw new Error("Stripe is unreachable");
      }),
    });
    const res = await failedSend.handler(request(body()));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
    expect(commandCalled(failedSend)).toBe(true);

    const failedSecret = setup({
      clientSecret: vi.fn(async () => {
        throw new Error("Stripe is unreachable");
      }),
    });
    const res2 = await failedSecret.handler(request(body()));
    expect(res2.status).toBe(503);
    expect(await res2.json()).toEqual({
      error: "payment_not_started",
      retry: true,
    });
  });

  it("F6 (b), as clarified (and T5's answer states): a replay of a gift that ended unpaid is 409 gift_closed; of a paid gift 409 gift_already_completed, never gift_closed; neither has a retry flag or calls the provider; a declined card's gift answers its PaymentIntent again", async () => {
    for (const [state, error] of [
      ["closed", "gift_closed"],
      ["paid", "gift_already_completed"],
    ] as const) {
      const s = setup({
        begin: {
          data: {
            ...CREATED,
            outcome: "replayed",
            gift_state: state,
            payment_intent: state === "paid" ? "pi_paid1" : null,
          },
          error: null,
        },
      });
      const res = await s.handler(request(body()));
      expect(res.status, state).toBe(409);
      expect(await res.json(), state).toEqual({ error });
      expect(s.sendFirst).not.toHaveBeenCalled();
      expect(s.clientSecret).not.toHaveBeenCalled();
    }

    const declined = setup({
      begin: {
        data: {
          ...CREATED,
          outcome: "replayed",
          gift_state: "open",
          payment_intent: "pi_declined1",
        },
        error: null,
      },
    });
    const res2 = await declined.handler(request(body()));
    expect(res2.status).toBe(200);
    expect(declined.sendFirst).not.toHaveBeenCalled();
    expect(declined.clientSecret).toHaveBeenCalledWith({
      account: "acct_alpha1",
      paymentIntentId: "pi_declined1",
    });
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
          gift_state: "open",
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
