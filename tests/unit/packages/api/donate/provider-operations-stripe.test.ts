import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ONE_SEND_REFUSED,
  createOneSend,
} from "../../../../../packages/api/src/donate/provider-operations/one-send";
import {
  classifyStripeAnswer,
  createStripePaymentAdapter,
} from "../../../../../packages/api/src/donate/provider-operations/stripe-adapter";
import { STRIPE_API_VERSION } from "../../../../../packages/api/src/stripe/api-version";
import {
  answer,
  bodyHangs,
  createStripeProviderFake,
  failBeforeSending,
  forbidden,
  formValues,
  hold,
  invalid,
  lockTimeout,
  loseAfterActing,
  rateLimited,
  redirect,
  refuse,
  serverError,
  succeed,
  unanswered,
  unauthenticated,
  type FakeBehaviour,
  type FakeHeaders,
} from "../../../../fixtures/stripe-provider-fake";

const TEST_KEY = "sk_test_provider_fake";
const OPERATION = "6f1c2c1e-6a43-4c8e-9a51-0d8f2d6c1a10";
const INTAKE = "1b7d4e2a-3c5f-4a6b-8d9e-0f1a2b3c4d5e";
const ACCOUNT = "acct_1ProviderFake0001";
const KEY = `gift:${INTAKE}:create_payment`;

const request = () => ({
  amount: 10300,
  currency: "usd",
  metadata: {
    asym_operation: OPERATION,
    asym_intake: INTAKE,
    payment_method: "card",
    gift_amount_cents: "10000",
    cover_fees: "true",
    cover_amount_cents: "300",
    estimated_fee_cents: "300",
  },
  payment_method_types: ["card"],
});

const intentBody = (over: Record<string, unknown> = {}) => ({
  id: "pi_3ProviderFakeObject0001",
  object: "payment_intent",
  livemode: false,
  amount: 10300,
  currency: "usd",
  metadata: { asym_operation: OPERATION, asym_intake: INTAKE },
  status: "requires_payment_method",
  ...over,
});

const err = (
  status: number,
  error: Record<string, unknown>,
  headers: FakeHeaders = {},
) => answer({ status, body: { error }, headers });

const forbiddenFetch = () =>
  vi.fn(() => {
    throw new Error("a test of the provider worker tried to reach the network");
  });

beforeEach(() => {
  vi.stubGlobal("fetch", forbiddenFetch());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function sendOnce(
  behaviours: FakeBehaviour[],
  timeoutMs = 5_000,
  options: { wait?: (ms: number) => Promise<void> } = {},
) {
  const fake = createStripeProviderFake({
    wait: options.wait ?? (async () => {}),
  });
  fake.script(...behaviours);
  const adapter = createStripePaymentAdapter({
    secretKey: TEST_KEY,
    transport: fake.transport,
  });
  const result = await adapter.createPayment({
    account: ACCOUNT,
    idempotencyKey: KEY,
    params: request(),
    timeoutMs,
  });
  return { fake, result };
}

describe("WP8a part 2 R1b: the Stripe adapter over the fake provider (index section 2.1, one test per row)", () => {
  it("A1 row 1: a created PaymentIntent of this request, and its replay, is succeeded with the object's id; one transport call each", async () => {
    const fake = createStripeProviderFake();
    fake.script(succeed());
    const adapter = createStripePaymentAdapter({
      secretKey: TEST_KEY,
      transport: fake.transport,
    });
    const input = {
      account: ACCOUNT,
      idempotencyKey: KEY,
      params: request(),
      timeoutMs: 5_000,
    };
    const first = await adapter.createPayment(input);
    expect(fake.calls()).toBe(1);
    const second = await adapter.createPayment(input);
    expect(fake.calls()).toBe(2);
    const id = fake.objects()[0]?.id;
    expect(first).toEqual({ result: "succeeded", providerObjectId: id });
    expect(second).toEqual({ result: "succeeded", providerObjectId: id });
    expect(fake.requests().map((r) => r.replayed)).toEqual([false, true]);
    expect(fake.objects()).toHaveLength(1);
  });

  it.each<[string, string, FakeBehaviour, unknown]>([
    [
      "A2",
      "row 2: a 200 PaymentIntent of another amount",
      answer({ status: 200, body: intentBody({ amount: 10301 }) }),
      { result: "unknown", errorCode: "stripe_unexpected_object" },
    ],
    [
      "A3",
      "row 3: a 402 card_error naming no PaymentIntent",
      refuse(),
      { result: "refused", errorCode: "stripe_card_error" },
    ],
    [
      "A4",
      "row 4: a 400 invalid_request_error",
      invalid(),
      { result: "unknown", errorCode: "stripe_invalid_request" },
    ],
    [
      "A4",
      "row 4: a 404 invalid_request_error",
      err(404, { type: "invalid_request_error", code: "resource_missing" }),
      { result: "unknown", errorCode: "stripe_invalid_request" },
    ],
    [
      "A5",
      "row 5: a 400 idempotency_error",
      err(400, { type: "idempotency_error" }),
      { result: "unknown", errorCode: "stripe_idempotency_mismatch" },
    ],
    [
      "A6",
      "row 6: a 409 idempotency_key_in_use",
      err(409, {
        type: "invalid_request_error",
        code: "idempotency_key_in_use",
      }),
      { result: "unknown", errorCode: "stripe_idempotency_in_flight" },
    ],
    [
      "A7",
      "row 7: a 429 rate_limit with Stripe-Rate-Limited-Reason",
      rateLimited(),
      { result: "not_performed", errorCode: "stripe_rate_limited" },
    ],
    [
      "A7",
      "row 7: a 429 lock_timeout",
      lockTimeout(),
      { result: "not_performed", errorCode: "stripe_rate_limited" },
    ],
    [
      "A8",
      "row 8: a 401, not replayed",
      unauthenticated(),
      { result: "not_performed", errorCode: "stripe_authentication" },
    ],
    [
      "A9",
      "row 9: a 403 account_invalid",
      forbidden(),
      { result: "unknown", errorCode: "stripe_permission" },
    ],
    [
      "A10",
      "row 10: a 500 api_error",
      serverError(),
      { result: "unknown", errorCode: "stripe_server_error" },
    ],
    [
      "A11",
      "row 11: a 424 with a JSON error",
      err(424, { type: "api_error", code: "external_dependency_failed" }),
      { result: "unknown", errorCode: "stripe_unclassified" },
    ],
    [
      "A11",
      "row 11: a 200 whose body is not JSON",
      answer({ status: 200, rawBody: "<html>ok</html>" }),
      { result: "unknown", errorCode: "stripe_unclassified" },
    ],
    [
      "A12",
      "row 12: the transport's ETIMEDOUT after the provider acted",
      loseAfterActing({ via: "timeout" }),
      { result: "unknown", errorCode: "stripe_timeout" },
    ],
    [
      "A12",
      "row 12: the transport's ETIMEDOUT with nothing acted",
      unanswered(),
      { result: "unknown", errorCode: "stripe_timeout" },
    ],
    [
      "A14",
      "row 14: ECONNREFUSED before sending",
      failBeforeSending("ECONNREFUSED"),
      { result: "unknown", errorCode: "stripe_unreachable" },
    ],
    [
      "A14",
      "row 14: ENOTFOUND before sending",
      failBeforeSending("ENOTFOUND"),
      { result: "unknown", errorCode: "stripe_unreachable" },
    ],
    [
      "A14",
      "row 14: EAI_AGAIN before sending",
      failBeforeSending("EAI_AGAIN"),
      { result: "unknown", errorCode: "stripe_unreachable" },
    ],
    [
      "A15",
      "row 15: a 200 whose JSON body is null, which the SDK rejects with a TypeError of its own code, not one of its errors",
      answer({ status: 200, rawBody: "null" }),
      { result: "unknown", errorCode: "adapter_fault" },
    ],
  ])(
    "%s %s: the answer and exactly one transport call",
    async (_id, _label, behaviour, expected) => {
      const { fake, result } = await sendOnce([behaviour]);
      expect(result).toEqual(expected);
      expect(fake.calls()).toBe(1);
    },
  );

  it("A13 row 13: a reset after the provider acted is unknown stripe_connection_lost; the SDK's resend after 500 ms meets the one-send refusal, so the transport is called once", async () => {
    const { fake, result } = await sendOnce([loseAfterActing()], 3_000);
    expect(result).toEqual({
      result: "unknown",
      errorCode: "stripe_connection_lost",
    });
    expect(fake.calls()).toBe(1);
    expect(fake.objects()).toHaveLength(1);
  });

  it("A13 row 13: a transport error with any other code is unknown stripe_connection_lost", async () => {
    const odd: FakeBehaviour = {
      async run() {
        return {
          reject: Object.assign(new Error("protocol error"), {
            code: "EPROTO",
          }),
        };
      },
    };
    const { fake, result } = await sendOnce([odd]);
    expect(result).toEqual({
      result: "unknown",
      errorCode: "stripe_connection_lost",
    });
    expect(fake.calls()).toBe(1);
  });

  it("A16 order and fall-through: each answer lands in the row the order gives, never a definite result it does not earn", async () => {
    const replayed = { "idempotent-replayed": "true" };
    const cases: [string, FakeBehaviour, string][] = [
      [
        "409 typed idempotency_error",
        err(409, { type: "idempotency_error" }),
        "unknown stripe_idempotency_in_flight",
      ],
      [
        "402 typed idempotency_error",
        err(402, { type: "idempotency_error" }),
        "unknown stripe_idempotency_mismatch",
      ],
      [
        "402 not card_error",
        err(402, { type: "invalid_request_error", code: "amount_too_small" }),
        "unknown stripe_unclassified",
      ],
      [
        "402 card_error naming a payment_intent",
        err(402, {
          type: "card_error",
          code: "card_declined",
          payment_intent: { id: "pi_3Named0001", object: "payment_intent" },
        }),
        "unknown stripe_unclassified",
      ],
      [
        "429 with neither the header nor lock_timeout",
        err(429, { type: "invalid_request_error" }),
        "unknown stripe_unclassified",
      ],
      [
        "429 coded rate_limit without the header",
        err(429, { type: "invalid_request_error", code: "rate_limit" }),
        "unknown stripe_unclassified",
      ],
      [
        "429 whose header names no listed reason",
        err(
          429,
          { type: "invalid_request_error", code: "rate_limit" },
          { "stripe-rate-limited-reason": "global rate" },
        ),
        "unknown stripe_unclassified",
      ],
      [
        "replayed 401",
        err(401, { type: "invalid_request_error" }, replayed),
        "unknown stripe_unclassified",
      ],
      [
        "replayed 429 with the header",
        err(
          429,
          { type: "invalid_request_error", code: "rate_limit" },
          { "stripe-rate-limited-reason": "global-rate", ...replayed },
        ),
        "unknown stripe_unclassified",
      ],
      [
        "replayed 429 lock_timeout",
        err(
          429,
          { type: "invalid_request_error", code: "lock_timeout" },
          replayed,
        ),
        "unknown stripe_unclassified",
      ],
      [
        "401 whose body is not JSON",
        answer({ status: 401, rawBody: "Unauthorized" }),
        "unknown stripe_unclassified",
      ],
      [
        "400 coded rate_limit",
        err(400, { type: "invalid_request_error", code: "rate_limit" }),
        "unknown stripe_invalid_request",
      ],
      [
        "2xx PaymentIntent with livemode true",
        answer({ status: 200, body: intentBody({ livemode: true }) }),
        "unknown stripe_unexpected_object",
      ],
      [
        "2xx with another object",
        answer({
          status: 200,
          body: intentBody({ object: "charge", id: "ch_3Other0001" }),
        }),
        "unknown stripe_unexpected_object",
      ],
      [
        "2xx PaymentIntent with another asym_operation",
        answer({
          status: 200,
          body: intentBody({
            metadata: {
              asym_operation: "00000000-0000-4000-8000-000000000000",
              asym_intake: INTAKE,
            },
          }),
        }),
        "unknown stripe_unexpected_object",
      ],
      [
        "2xx PaymentIntent with another asym_intake",
        answer({
          status: 200,
          body: intentBody({
            metadata: {
              asym_operation: OPERATION,
              asym_intake: "00000000-0000-4000-8000-000000000000",
            },
          }),
        }),
        "unknown stripe_unexpected_object",
      ],
      [
        "2xx PaymentIntent with another currency",
        answer({ status: 200, body: intentBody({ currency: "eur" }) }),
        "unknown stripe_unexpected_object",
      ],
      [
        "2xx PaymentIntent whose id has a trailing newline",
        answer({ status: 200, body: intentBody({ id: "pi_3Trailing0001\n" }) }),
        "unknown stripe_unexpected_object",
      ],
      [
        "4xx JSON with no error",
        answer({ status: 404, body: {} }),
        "unknown stripe_unexpected_object",
      ],
      [
        "2xx with no object at all",
        answer({ status: 201, body: { ok: true } }),
        "unknown stripe_unexpected_object",
      ],
      [
        "a replayed card refusal",
        err(402, { type: "card_error", code: "card_declined" }, replayed),
        "refused stripe_card_error",
      ],
    ];
    const got: string[] = [];
    for (const [label, behaviour] of cases) {
      const { fake, result } = await sendOnce([behaviour]);
      got.push(
        `${label}: ${result.result} ${"errorCode" in result ? result.errorCode : result.providerObjectId} (${fake.calls()} call)`,
      );
    }
    expect(got).toEqual(
      cases.map(([label, , expected]) => `${label}: ${expected} (1 call)`),
    );
  });

  it("A17: a live, restricted live, publishable or blank key throws before any client or transport call", () => {
    const fake = createStripeProviderFake();
    const refused: string[] = [];
    for (const key of [
      "sk_live_placeholder",
      "rk_live_placeholder",
      "pk_live_placeholder",
      "pk_test_placeholder",
      "",
      "   ",
      "not_a_key",
    ]) {
      try {
        createStripePaymentAdapter({
          secretKey: key,
          transport: fake.transport,
        });
        refused.push(`${JSON.stringify(key)}: accepted`);
      } catch {
        refused.push(`${JSON.stringify(key)}: thrown`);
      }
    }
    expect(refused.every((line) => line.endsWith("thrown"))).toBe(true);
    expect(fake.calls()).toBe(0);
  });

  it("A18 one send: a 500, a reset and a 307 each reach the transport once (no SDK retry, no redirect followed)", async () => {
    for (const behaviour of [serverError(), loseAfterActing(), redirect()]) {
      const { fake } = await sendOnce([behaviour], 3_000);
      expect(fake.calls()).toBe(1);
      expect(fake.requests()).toHaveLength(1);
    }
  });

  it("A18 one send: one-send's second call returns a rejected promise coded ASYM_ONE_SEND_REFUSED, never a synchronous throw, and does not reach the transport", async () => {
    const fake = createStripeProviderFake();
    const once = createOneSend(fake.transport);
    const args = [
      "api.stripe.com",
      "443",
      "/v1/payment_intents",
      "POST",
      { "Idempotency-Key": KEY, "Stripe-Account": ACCOUNT },
      "amount=1",
      "https",
      1000,
    ] as const;
    const first = await once.client.makeRequest(...args);
    expect(first.getStatusCode()).toBe(200);
    expect(once.status()).toBe(200);
    let second: unknown;
    expect(() => {
      second = once.client.makeRequest(...args);
    }).not.toThrow();
    expect(second).toBeInstanceOf(Promise);
    await expect(second).rejects.toMatchObject({ code: ONE_SEND_REFUSED });
    expect(fake.calls()).toBe(1);
  });

  it("A19: the call is POST /v1/payment_intents with the key, the account, Stripe-Version and a body decoding to the request exactly, its timeout the integer timeoutMs", async () => {
    const { fake, result } = await sendOnce([succeed()], 4_321);
    expect(result.result).toBe("succeeded");
    const [sent] = fake.requests();
    expect(sent).toMatchObject({
      method: "POST",
      path: "/v1/payment_intents",
      key: KEY,
      account: ACCOUNT,
      version: STRIPE_API_VERSION,
      timeout: 4_321,
    });
    expect(sent?.body).toEqual(formValues(request()));
  });

  it("A19: with no transport, the default call goes through the global fetch with redirect manual and a signal, to api.stripe.com, and nowhere else", async () => {
    const seen: { url: string; init: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        seen.push({ url: String(url), init: init ?? {} });
        return new Response(JSON.stringify(intentBody()), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );
    const adapter = createStripePaymentAdapter({ secretKey: TEST_KEY });
    const result = await adapter.createPayment({
      account: ACCOUNT,
      idempotencyKey: KEY,
      params: request(),
      timeoutMs: 5_000,
    });
    expect(result).toEqual({
      result: "succeeded",
      providerObjectId: "pi_3ProviderFakeObject0001",
    });
    expect(seen).toHaveLength(1);
    expect(seen[0]?.url).toBe("https://api.stripe.com/v1/payment_intents");
    expect(seen[0]?.init.redirect).toBe("manual");
    expect(seen[0]?.init.signal).toBeInstanceOf(AbortSignal);
    expect(seen[0]?.init.method).toBe("POST");
  });

  it("A19: with no transport, a 307 is answered, not followed: one fetch, unknown", async () => {
    const fetchSpy = vi.fn(
      async () =>
        new Response("", {
          status: 307,
          headers: { location: "https://elsewhere.invalid/v1/payment_intents" },
        }),
    );
    vi.stubGlobal("fetch", fetchSpy);
    const adapter = createStripePaymentAdapter({ secretKey: TEST_KEY });
    const result = await adapter.createPayment({
      account: ACCOUNT,
      idempotencyKey: KEY,
      params: request(),
      timeoutMs: 5_000,
    });
    expect(result.result).toBe("unknown");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("A20 timers: a fractional timeoutMs reaches the transport as its floor, never 80,000", async () => {
    const { fake } = await sendOnce([succeed()], 1_500.9);
    expect(fake.requests()[0]?.timeout).toBe(1_500);
  });

  it("A20 timers: a non-finite or below-1 timeoutMs throws before any transport call", async () => {
    const fake = createStripeProviderFake();
    const adapter = createStripePaymentAdapter({
      secretKey: TEST_KEY,
      transport: fake.transport,
    });
    const got: string[] = [];
    for (const timeoutMs of [Number.NaN, Infinity, -1, 0, 0.99]) {
      await adapter
        .createPayment({
          account: ACCOUNT,
          idempotencyKey: KEY,
          params: request(),
          timeoutMs,
        })
        .then(
          () => got.push(`${timeoutMs}: answered`),
          () => got.push(`${timeoutMs}: thrown`),
        );
    }
    expect(got).toEqual([
      "NaN: thrown",
      "Infinity: thrown",
      "-1: thrown",
      "0: thrown",
      "0.99: thrown",
    ]);
    expect(fake.calls()).toBe(0);
  });

  it("A20 timers: a hanging body ends unknown stripe_timeout within timeoutMs + 1 s, with the fetch signal aborted", async () => {
    let signal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
        signal = init?.signal ?? undefined;
        return new Response(new ReadableStream({ start() {} }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }),
    );
    const adapter = createStripePaymentAdapter({ secretKey: TEST_KEY });
    const started = performance.now();
    const result = await adapter.createPayment({
      account: ACCOUNT,
      idempotencyKey: KEY,
      params: request(),
      timeoutMs: 300,
    });
    const elapsed = performance.now() - started;
    expect(result).toEqual({ result: "unknown", errorCode: "stripe_timeout" });
    expect(elapsed).toBeLessThan(1_300);
    expect(signal?.aborted).toBe(true);
  });

  it("A20 timers: a hanging body or a held answer on the fake transport ends unknown stripe_timeout within timeoutMs + 1 s", async () => {
    for (const behaviour of [bodyHangs(), hold()]) {
      const started = performance.now();
      const { result } = await sendOnce([behaviour], 250);
      expect(result).toEqual({
        result: "unknown",
        errorCode: "stripe_timeout",
      });
      expect(performance.now() - started).toBeLessThan(1_250);
    }
  });

  it("A20 timers: after any answer, timed out or not, no timer of the adapter is left pending", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const got: string[] = [];
    for (const behaviour of [
      succeed(),
      refuse(),
      serverError(),
      failBeforeSending(),
    ]) {
      const { result } = await sendOnce([behaviour], 60_000);
      got.push(`${result.result} ${vi.getTimerCount()}`);
    }
    const fake = createStripeProviderFake();
    fake.script(hold());
    const adapter = createStripePaymentAdapter({
      secretKey: TEST_KEY,
      transport: fake.transport,
    });
    const pending = adapter.createPayment({
      account: ACCOUNT,
      idempotencyKey: KEY,
      params: request(),
      timeoutMs: 60_000,
    });
    await fake.held();
    await vi.advanceTimersByTimeAsync(60_000);
    const timedOut = await pending;
    got.push(`${timedOut.result} ${vi.getTimerCount()}`);
    expect(got).toEqual([
      "succeeded 0",
      "refused 0",
      "unknown 0",
      "unknown 0",
      "unknown 0",
    ]);
  });

  it("classifyStripeAnswer is exported and never reads a class name or a message: a plain object shaped like an SDK error is row 15", () => {
    const fake = {
      type: "StripeCardError",
      rawType: "card_error",
      statusCode: 402,
      message: "Your card was declined.",
    };
    expect(
      classifyStripeAnswer(
        { kind: "rejected", error: fake, status: 402 },
        request(),
      ),
    ).toEqual({ result: "unknown", errorCode: "adapter_fault" });
    expect(classifyStripeAnswer({ kind: "timed_out" }, request())).toEqual({
      result: "unknown",
      errorCode: "stripe_timeout",
    });
  });

  it("F1 (review finding 1): a JSON body that is a bare string, number or boolean, on any status, ends unknown stripe_unclassified at once, the one send kept, with no unhandled rejection; a null body ends unknown adapter_fault (row 15, as A15), also at once and with none", async () => {
    const cases: [string, number, string, string][] = [
      ['200 "ok"', 200, '"ok"', "stripe_unclassified"],
      ["200 42", 200, "42", "stripe_unclassified"],
      ["200 true", 200, "true", "stripe_unclassified"],
      ['502 "bad gateway"', 502, '"bad gateway"', "stripe_unclassified"],
      ["307 false", 307, "false", "stripe_unclassified"],
      ["200 null", 200, "null", "adapter_fault"],
    ];
    const got: string[] = [];
    for (const [label, status, rawBody] of cases) {
      const unhandled: unknown[] = [];
      const listener = (reason: unknown) => unhandled.push(reason);
      process.on("unhandledRejection", listener);
      try {
        const started = performance.now();
        const { fake, result } = await sendOnce(
          [answer({ status, rawBody })],
          5_000,
        );
        const elapsed = performance.now() - started;
        await new Promise((done) => setTimeout(done, 50));
        got.push(
          `${label}: ${result.result} ${"errorCode" in result ? result.errorCode : "-"}, ${fake.calls()} send, ${elapsed < 2_000 ? "at once" : "by the timer"}, ${unhandled.length} unhandled`,
        );
      } finally {
        process.off("unhandledRejection", listener);
      }
    }
    expect(got).toEqual(
      cases.map(
        ([label, , , code]) =>
          `${label}: unknown ${code}, 1 send, at once, 0 unhandled`,
      ),
    );
  });

  it("F1: one-send's response forwards every method and rejects only a parsed body that is a primitive", async () => {
    const fake = createStripeProviderFake();
    fake.script(
      answer({ status: 201, rawBody: '{"a":1}', headers: { "x-a": "b" } }),
    );
    const once = createOneSend(fake.transport);
    const response = await once.client.makeRequest(
      "api.stripe.com",
      "443",
      "/v1/payment_intents",
      "POST",
      {},
      "",
      "https",
      1000,
    );
    expect(response.getStatusCode()).toBe(201);
    expect(response.getHeaders()).toMatchObject({ "x-a": "b" });
    expect(response.getRawResponse()).toEqual({});
    expect(response.toStream(() => {})).toBeNull();
    await expect(response.toJSON()).resolves.toEqual({ a: 1 });
    for (const rawBody of ['"x"', "1", "false"]) {
      const other = createStripeProviderFake();
      other.script(answer({ status: 200, rawBody }));
      const r = await createOneSend(other.transport).client.makeRequest(
        "api.stripe.com",
        "443",
        "/v1/payment_intents",
        "POST",
        {},
        "",
        "https",
        1000,
      );
      await expect(r.toJSON()).rejects.toBeInstanceOf(TypeError);
    }
  });

  it("F4 (review finding 4): an Idempotent-Replayed header that arrives twice, in capitals or padded is a replay, so a 429 with the reason header and a 401 are row 11; only an absent header or exactly false is not", async () => {
    const values = ["true, true", "TRUE", " true ", "yes", "", "false", null];
    const got: string[] = [];
    for (const value of values) {
      const replay: FakeHeaders =
        value === null ? {} : { "idempotent-replayed": value };
      for (const [label, behaviour] of [
        [
          "429",
          err(
            429,
            { type: "invalid_request_error", code: "rate_limit" },
            { "stripe-rate-limited-reason": "global-rate", ...replay },
          ),
        ],
        ["401", err(401, { type: "invalid_request_error" }, replay)],
      ] as const) {
        const { result } = await sendOnce([behaviour]);
        got.push(
          `${JSON.stringify(value)} ${label}: ${result.result} ${"errorCode" in result ? result.errorCode : "-"}`,
        );
      }
    }
    expect(got).toEqual([
      '"true, true" 429: unknown stripe_unclassified',
      '"true, true" 401: unknown stripe_unclassified',
      '"TRUE" 429: unknown stripe_unclassified',
      '"TRUE" 401: unknown stripe_unclassified',
      '" true " 429: unknown stripe_unclassified',
      '" true " 401: unknown stripe_unclassified',
      '"yes" 429: unknown stripe_unclassified',
      '"yes" 401: unknown stripe_unclassified',
      '"" 429: unknown stripe_unclassified',
      '"" 401: unknown stripe_unclassified',
      '"false" 429: not_performed stripe_rate_limited',
      '"false" 401: not_performed stripe_authentication',
      "null 429: not_performed stripe_rate_limited",
      "null 401: not_performed stripe_authentication",
    ]);
  });

  it("F6 (review finding 6): the SDK runs with telemetry off: the client user agent carries no platform and no telemetry header is sent", async () => {
    const { fake } = await sendOnce([succeed()]);
    const headers = fake.requests()[0]?.headers ?? {};
    const agent = JSON.parse(headers["x-stripe-client-user-agent"] ?? "{}");
    expect(agent).not.toHaveProperty("platform");
    expect(headers).not.toHaveProperty("x-stripe-client-telemetry");
  });

  it("F6: the fake's replay of an answer whose body hung the first time answers at once", async () => {
    const fake = createStripeProviderFake();
    fake.script(bodyHangs());
    const adapter = createStripePaymentAdapter({
      secretKey: TEST_KEY,
      transport: fake.transport,
    });
    const input = {
      account: ACCOUNT,
      idempotencyKey: KEY,
      params: request(),
      timeoutMs: 1_000,
    };
    expect(await adapter.createPayment(input)).toEqual({
      result: "unknown",
      errorCode: "stripe_timeout",
    });
    const started = performance.now();
    const replay = await adapter.createPayment(input);
    expect(replay).toEqual({
      result: "succeeded",
      providerObjectId: fake.objects()[0]?.id,
    });
    expect(performance.now() - started).toBeLessThan(900);
    expect(fake.requests().map((r) => r.replayed)).toEqual([false, true]);
  });
});
