import { randomUUID } from "node:crypto";

export type FakeHeaders = Record<string, string>;

export type FakeAnswer = {
  status: number;
  body?: unknown;
  rawBody?: string;
  headers?: FakeHeaders;
  hangBody?: boolean;
};

export type FakeRequest = {
  method: string;
  path: string;
  key: string | undefined;
  account: string | undefined;
  version: string | undefined;
  body: Record<string, unknown>;
  rawBody: string;
  timeout: number;
  replayed: boolean;
  headers: Record<string, string>;
};

export type FakePaymentIntent = {
  id: string;
  object: "payment_intent";
  livemode: false;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
  status: "requires_payment_method";
};

export type FakeObject = FakePaymentIntent & {
  account: string | undefined;
  key: string | undefined;
};

export type FakeCall = {
  request: FakeRequest;
  act(): FakePaymentIntent;
  wait(ms: number): Promise<void>;
};

export type FakeOutcome =
  | { answer: FakeAnswer; store: boolean }
  | { reject: Error; store?: FakeAnswer };

export type FakeBehaviour = {
  beforeSending?: Error;
  hold?: boolean;
  run(call: FakeCall): Promise<FakeOutcome>;
};

export type FakeResponse = {
  getStatusCode(): number;
  getHeaders(): FakeHeaders;
  toJSON(): Promise<unknown>;
  getRawResponse(): object;
  toStream(done: () => void): unknown;
};

export type FakeTransport = {
  getClientName(): string;
  makeRequest(
    host: string,
    port: string,
    path: string,
    method: string,
    headers: Record<string, string | number | string[]>,
    requestData: string,
    protocol: string,
    timeout: number,
  ): Promise<FakeResponse>;
};

export type StripeProviderFakeOptions = {
  afterWindow?: "forget" | "remember";
  wait?: (ms: number) => Promise<void>;
};

const WINDOW_MS = 24 * 60 * 60 * 1000;

type Stored = {
  answer: FakeAnswer;
  params: string;
  atMs: number;
  executing: boolean;
};

type BehaviourOptions = { beforeAnswer?: () => Promise<unknown> | unknown };

const stripeError = (
  status: number,
  error: Record<string, unknown>,
  headers: FakeHeaders = {},
): FakeAnswer => ({ status, body: { error }, headers });

const transportError = (code: string, message: string) =>
  Object.assign(new Error(message), { code });

export function answer(
  reply: FakeAnswer,
  options: BehaviourOptions & { store?: boolean; acted?: boolean } = {},
): FakeBehaviour {
  return {
    async run(call) {
      if (options.acted) call.act();
      await options.beforeAnswer?.();
      return { answer: reply, store: options.store ?? false };
    },
  };
}

export function succeed(options: BehaviourOptions = {}): FakeBehaviour {
  return {
    async run(call) {
      const intent = call.act();
      await options.beforeAnswer?.();
      return { answer: { status: 200, body: intent }, store: true };
    },
  };
}

export const refuse = (options: BehaviourOptions = {}): FakeBehaviour =>
  answer(
    stripeError(402, {
      type: "card_error",
      code: "card_declined",
      decline_code: "generic_decline",
      message: "Your card was declined.",
    }),
    { ...options, store: true },
  );

export const invalid = (
  options: BehaviourOptions & { stored?: boolean } = {},
): FakeBehaviour =>
  answer(
    stripeError(400, {
      type: "invalid_request_error",
      code: "parameter_invalid_integer",
      param: "amount",
      message: "Invalid integer.",
    }),
    { ...options, store: options.stored ?? false },
  );

export const unauthenticated = (options: BehaviourOptions = {}) =>
  answer(
    stripeError(401, {
      type: "invalid_request_error",
      message: "Invalid API Key provided.",
    }),
    options,
  );

export const forbidden = (options: BehaviourOptions = {}) =>
  answer(
    stripeError(403, {
      type: "invalid_request_error",
      code: "account_invalid",
      message: "The provided key does not have access to account.",
    }),
    options,
  );

export const rateLimited = (options: BehaviourOptions = {}) =>
  answer(
    stripeError(
      429,
      {
        type: "invalid_request_error",
        code: "rate_limit",
        message: "Too many requests hit the API too quickly.",
      },
      { "stripe-rate-limited-reason": "global-rate" },
    ),
    options,
  );

export const lockTimeout = (options: BehaviourOptions = {}) =>
  answer(
    stripeError(429, {
      type: "invalid_request_error",
      code: "lock_timeout",
      message: "This object cannot be accessed right now.",
    }),
    options,
  );

export const serverError = (
  options: BehaviourOptions & { acted?: boolean } = {},
) =>
  answer(
    stripeError(500, {
      type: "api_error",
      message: "Something went wrong on Stripe's end.",
    }),
    { ...options, store: true },
  );

export const redirect = (options: BehaviourOptions = {}) =>
  answer(
    {
      status: 307,
      rawBody: "",
      headers: { location: "https://elsewhere.invalid/v1/payment_intents" },
    },
    options,
  );

export function failBeforeSending(code = "ECONNREFUSED"): FakeBehaviour {
  const error = Object.assign(new TypeError("fetch failed"), {
    cause: transportError(code, `connect ${code}`),
  });
  return {
    beforeSending: error,
    async run() {
      return { reject: error };
    },
  };
}

export function loseAfterActing(
  options: BehaviourOptions & { via?: "reset" | "timeout" } = {},
): FakeBehaviour {
  return {
    async run(call) {
      const intent = call.act();
      await options.beforeAnswer?.();
      const stored = { status: 200, body: intent };
      if (options.via === "timeout") {
        await call.wait(call.request.timeout);
        return {
          reject: transportError("ETIMEDOUT", "ETIMEDOUT"),
          store: stored,
        };
      }
      return {
        reject: transportError("ECONNRESET", "socket hang up"),
        store: stored,
      };
    },
  };
}

export function unanswered(): FakeBehaviour {
  return {
    async run(call) {
      await call.wait(call.request.timeout);
      return { reject: transportError("ETIMEDOUT", "ETIMEDOUT") };
    },
  };
}

export function bodyHangs(): FakeBehaviour {
  return {
    async run(call) {
      const intent = call.act();
      return {
        answer: { status: 200, body: intent, hangBody: true },
        store: true,
      };
    },
  };
}

export function hold(then: FakeBehaviour = succeed()): FakeBehaviour {
  return { hold: true, run: (call) => then.run(call) };
}

function decodePart(text: string) {
  return decodeURIComponent(text.replace(/\+/g, " "));
}

export function decodeForm(raw: string): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const pair of raw.split("&")) {
    if (!pair) continue;
    const at = pair.indexOf("=");
    const name = decodePart(at < 0 ? pair : pair.slice(0, at));
    const value = at < 0 ? "" : decodePart(pair.slice(at + 1));
    const path = [name.replace(/\[.*$/, "")];
    for (const m of name.matchAll(/\[([^\]]*)\]/g)) path.push(m[1] ?? "");
    let node: Record<string, unknown> | unknown[] = root;
    path.forEach((segment, i) => {
      const last = i === path.length - 1;
      const index = Array.isArray(node) ? Number(segment) : segment;
      const container = node as Record<string | number, unknown>;
      if (last) {
        container[index] = value;
        return;
      }
      const nextIsIndex = /^\d+$/.test(path[i + 1] ?? "");
      if (container[index] === undefined)
        container[index] = nextIsIndex ? [] : {};
      node = container[index] as Record<string, unknown> | unknown[];
    });
  }
  return root;
}

export function formValues(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(formValues);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, formValues(v)]),
    );
  return String(value);
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map(
        (k) =>
          `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`,
      )
      .join(",")}}`;
  return JSON.stringify(value);
}

function headerOf(
  headers: Record<string, string | number | string[]>,
  name: string,
) {
  const hit = Object.entries(headers).find(
    ([k]) => k.toLowerCase() === name.toLowerCase(),
  );
  if (!hit) return undefined;
  return Array.isArray(hit[1]) ? hit[1].join(",") : String(hit[1]);
}

function responseOf(reply: FakeAnswer, replayed: boolean): FakeResponse {
  const headers: FakeHeaders = {
    "request-id": `req_${randomUUID().replaceAll("-", "").slice(0, 14)}`,
    ...Object.fromEntries(
      Object.entries(reply.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]),
    ),
    ...(replayed ? { "idempotent-replayed": "true" } : {}),
  };
  const text =
    reply.rawBody ??
    (reply.body === undefined ? "" : JSON.stringify(reply.body));
  return {
    getStatusCode: () => reply.status,
    getHeaders: () => headers,
    toJSON: () =>
      reply.hangBody
        ? new Promise<unknown>(() => {})
        : new Promise<unknown>((resolve, reject) => {
            try {
              resolve(JSON.parse(text));
            } catch (error) {
              reject(error);
            }
          }),
    getRawResponse: () => ({}),
    toStream: () => null,
  };
}

export function createStripeProviderFake(
  options: StripeProviderFakeOptions = {},
) {
  const afterWindow = options.afterWindow ?? "forget";
  const wait =
    options.wait ??
    ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const script: FakeBehaviour[] = [];
  const recorded: FakeRequest[] = [];
  const created: FakeObject[] = [];
  const store = new Map<string, Stored>();
  let nowMs = 0;
  let calls = 0;
  const pendingHolds: (() => void)[] = [];
  const heldWaiters: { count: number; done: () => void }[] = [];
  const wakeHeldWaiters = () => {
    for (const waiter of heldWaiters.splice(0)) {
      if (pendingHolds.length >= waiter.count) waiter.done();
      else heldWaiters.push(waiter);
    }
  };

  const transport: FakeTransport = {
    getClientName: () => "stripe-provider-fake",
    async makeRequest(
      _host,
      _port,
      path,
      method,
      headers,
      requestData,
      _protocol,
      timeout,
    ) {
      calls += 1;
      const behaviour = script[0] ?? succeed();
      if (behaviour.beforeSending) {
        script.shift();
        throw behaviour.beforeSending;
      }
      const request: FakeRequest = {
        method,
        path,
        key: headerOf(headers, "Idempotency-Key"),
        account: headerOf(headers, "Stripe-Account"),
        version: headerOf(headers, "Stripe-Version"),
        body: decodeForm(requestData ?? ""),
        rawBody: requestData ?? "",
        timeout,
        replayed: false,
        headers: Object.fromEntries(
          Object.entries(headers).map(([k, v]) => [
            k.toLowerCase(),
            Array.isArray(v) ? v.join(", ") : String(v),
          ]),
        ),
      };
      recorded.push(request);
      const slot = `${request.account ?? ""}|${request.key ?? ""}`;
      const params = canonical(request.body);
      const kept = request.key ? store.get(slot) : undefined;
      const live =
        kept && (afterWindow === "remember" || nowMs - kept.atMs < WINDOW_MS);
      if (kept && live) {
        if (kept.executing)
          return responseOf(
            stripeError(409, {
              type: "idempotency_error",
              code: "idempotency_key_in_use",
              message:
                "There is currently another in-progress request using this Idempotent Key.",
            }),
            false,
          );
        if (kept.params !== params)
          return responseOf(
            stripeError(400, {
              type: "idempotency_error",
              message:
                "Keys for idempotent requests can only be used with the same parameters they were first used with.",
            }),
            false,
          );
        request.replayed = true;
        return responseOf(kept.answer, true);
      }
      script.shift();
      const call: FakeCall = {
        request,
        wait,
        act() {
          const metadata = (request.body.metadata ?? {}) as Record<
            string,
            unknown
          >;
          const intent: FakePaymentIntent = {
            id: `pi_${randomUUID().replaceAll("-", "").slice(0, 24)}`,
            object: "payment_intent",
            livemode: false,
            amount: Number(request.body.amount),
            currency: String(request.body.currency),
            metadata,
            status: "requires_payment_method",
          };
          created.push({
            ...intent,
            account: request.account,
            key: request.key,
          });
          return intent;
        },
      };
      if (request.key)
        store.set(slot, {
          answer: { status: 0 },
          params,
          atMs: nowMs,
          executing: true,
        });
      if (behaviour.hold) {
        await new Promise<void>((done) => {
          pendingHolds.push(done);
          wakeHeldWaiters();
        });
      }
      let outcome: FakeOutcome;
      try {
        outcome = await behaviour.run(call);
      } catch (error) {
        if (request.key) store.delete(slot);
        throw error;
      }
      const toStore =
        "reject" in outcome
          ? outcome.store
          : outcome.store
            ? outcome.answer
            : undefined;
      if (request.key) {
        if (toStore)
          store.set(slot, {
            answer: { ...toStore, hangBody: false },
            params,
            atMs: nowMs,
            executing: false,
          });
        else store.delete(slot);
      }
      if ("reject" in outcome) throw outcome.reject;
      return responseOf(outcome.answer, false);
    },
  };

  return {
    transport,
    script(...behaviours: FakeBehaviour[]) {
      script.push(...behaviours);
    },
    requests: () => recorded.map((r) => ({ ...r })),
    objects: () => created.map((o) => ({ ...o })),
    calls: () => calls,
    advanceMs(ms: number) {
      nowMs += ms;
    },
    held: (count = 1) =>
      pendingHolds.length >= count
        ? Promise.resolve()
        : new Promise<void>((done) => heldWaiters.push({ count, done })),
    release() {
      pendingHolds.shift()?.();
    },
  };
}

export type StripeProviderFake = ReturnType<typeof createStripeProviderFake>;
