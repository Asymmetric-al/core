import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LEASE_SECONDS,
  retryDelaySeconds,
} from "../../../../../packages/api/src/donate/provider-operations/contract";
import {
  runProviderOperation,
  type PaymentProviderAdapter,
  type PaymentProviderAnswer,
  type ProviderOperationRpc,
  type ProviderOperationRpcArgs,
  type ProviderOperationRpcName,
  type RpcResponse,
} from "../../../../../packages/api/src/donate/provider-operations/run";
import { createStripePaymentAdapter } from "../../../../../packages/api/src/donate/provider-operations/stripe-adapter";
import {
  createStripeProviderFake,
  loseAfterActing,
  rateLimited,
  refuse,
  succeed,
  type FakeBehaviour,
} from "../../../../fixtures/stripe-provider-fake";

const TEST_KEY = "sk_test_provider_fake";
const OPERATION = "6f1c2c1e-6a43-4c8e-9a51-0d8f2d6c1a10";
const TENANT = "2c9e1a77-5b4d-4f0e-9c3a-7d1e6b8a9f20";
const INTAKE = "1b7d4e2a-3c5f-4a6b-8d9e-0f1a2b3c4d5e";
const ACCOUNT = "acct_1ProviderFake0001";
const KEY = `gift:${INTAKE}:create_payment`;

const request = (): Record<string, unknown> & {
  metadata: Record<string, unknown>;
} => ({
  amount: 10300,
  currency: "usd",
  metadata: {
    asym_operation: OPERATION,
    asym_intake: INTAKE,
    payment_method: "card",
  },
  payment_method_types: ["card"],
});

const claimed = (over: Record<string, unknown> = {}) => ({
  outcome: "claimed",
  operation_id: OPERATION,
  tenant_id: TENANT,
  attempt: 1,
  lease_expires_at: "2026-11-25T20:02:00.123456+00:00",
  send_deadline: "2026-11-26T19:00:00.123456+00:00",
  request_kind: "create_payment",
  idempotency_key: KEY,
  request: request(),
  request_digest: "a".repeat(64),
  provider_account: ACCOUNT,
  livemode: false,
  ...over,
});

type Call = {
  fn: ProviderOperationRpcName;
  args: ProviderOperationRpcArgs[ProviderOperationRpcName];
};

function memoryRpc(
  claim: RpcResponse | (() => Promise<RpcResponse>),
  report: RpcResponse = {
    data: { outcome: "retry_scheduled" },
    error: null,
  },
) {
  const calls: Call[] = [];
  const rpc: ProviderOperationRpc = async (
    fn: ProviderOperationRpcName,
    args: ProviderOperationRpcArgs[ProviderOperationRpcName],
  ) => {
    calls.push({ fn, args });
    if (fn === "claim_provider_operation")
      return typeof claim === "function" ? claim() : claim;
    return report;
  };
  return { rpc, calls };
}

const claimedRpc = (over: Record<string, unknown> = {}, report?: RpcResponse) =>
  memoryRpc({ data: claimed(over), error: null }, report);

function fakeAdapter(...behaviours: FakeBehaviour[]) {
  const fake = createStripeProviderFake({ wait: async () => {} });
  fake.script(...behaviours);
  const adapter = createStripePaymentAdapter({
    secretKey: TEST_KEY,
    transport: fake.transport,
  });
  const createPayment = vi.spyOn(adapter, "createPayment");
  return { fake, adapter, createPayment };
}

function stubAdapter(answer: PaymentProviderAnswer | Error) {
  const createPayment = vi.fn(async () => {
    if (answer instanceof Error) throw answer;
    return answer;
  });
  const adapter: PaymentProviderAdapter = { createPayment };
  return { adapter, createPayment };
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => {
      throw new Error(
        "a test of the provider worker tried to reach the network",
      );
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("WP8a part 2 R1b: runProviderOperation, one request from claim to report (in-memory RPC and the fake provider)", () => {
  it("B1 (step 1): an operation id that is not a lower-case UUID throws before any call", async () => {
    const { rpc, calls } = claimedRpc();
    const { adapter, createPayment } = stubAdapter({
      result: "succeeded",
      providerObjectId: "pi_1",
    });
    const got: string[] = [];
    for (const operationId of [
      OPERATION.toUpperCase(),
      ` ${OPERATION}`,
      `${OPERATION}\n`,
      "not-a-uuid",
      "",
    ]) {
      await runProviderOperation({ rpc, adapter, operationId }).then(
        () => got.push("ran"),
        () => got.push("thrown"),
      );
    }
    expect(got).toEqual(["thrown", "thrown", "thrown", "thrown", "thrown"]);
    expect(calls).toEqual([]);
    expect(createPayment).not.toHaveBeenCalled();
  });

  it("B1: each outcome but claimed, a claim error and a claim call that throws return at once: one RPC call, nothing sent, nothing reported", async () => {
    const outcomes: RpcResponse[] = [
      ...[
        "held",
        "not_due",
        "closed",
        "parked",
        "dead_letter",
        "binding_inactive",
        "unknown_anchor",
        "something_new",
      ].map((outcome) => ({
        data: { outcome, operation_id: OPERATION },
        error: null,
      })),
      { data: null, error: { code: "42501", message: "not_found" } },
      { data: null, error: { code: "22023", message: "lease_out_of_range" } },
      { data: "claimed", error: null },
      { data: null, error: null },
    ];
    for (const claim of outcomes) {
      const { rpc, calls } = memoryRpc(claim);
      const { fake, adapter, createPayment } = fakeAdapter(succeed());
      const run = await runProviderOperation({
        rpc,
        adapter,
        operationId: OPERATION,
      });
      expect(run).toMatchObject({ sent: false, claim });
      expect(calls.map((c) => c.fn)).toEqual(["claim_provider_operation"]);
      expect(createPayment).not.toHaveBeenCalled();
      expect(fake.calls()).toBe(0);
    }
    const { rpc, calls } = memoryRpc(async () => {
      throw new Error("connection refused");
    });
    const { adapter, createPayment } = stubAdapter({
      result: "succeeded",
      providerObjectId: "pi_1",
    });
    const run = await runProviderOperation({
      rpc,
      adapter,
      operationId: OPERATION,
    });
    expect(run).toMatchObject({
      sent: false,
      claim: { data: null, error: { message: "connection refused" } },
    });
    expect(calls).toHaveLength(1);
    expect(createPayment).not.toHaveBeenCalled();
  });

  it("B2: claimed: the claim with a 120-second lease, one send, then the report for the claim's attempt with p_result exactly as section 3.5 gives each result", async () => {
    const cases: [FakeBehaviour, unknown][] = [
      [succeed(), "succeeded"],
      [refuse(), { result: "refused", error_code: "stripe_card_error" }],
      [
        rateLimited(),
        {
          result: "not_performed",
          retry_delay_seconds: 240,
          error_code: "stripe_rate_limited",
        },
      ],
      [
        loseAfterActing({ via: "timeout" }),
        {
          result: "unknown",
          retry_delay_seconds: 240,
          error_code: "stripe_timeout",
        },
      ],
    ];
    for (const [behaviour, expected] of cases) {
      const { rpc, calls } = claimedRpc({ attempt: 4 });
      const { fake, adapter } = fakeAdapter(behaviour);
      const run = await runProviderOperation({
        rpc,
        adapter,
        operationId: OPERATION,
      });
      expect(calls.map((c) => c.fn)).toEqual([
        "claim_provider_operation",
        "record_provider_operation_result",
      ]);
      expect(calls[0]?.args).toEqual({
        p_operation_id: OPERATION,
        p_lease_seconds: 120,
      });
      const report = calls[1]
        ?.args as ProviderOperationRpcArgs["record_provider_operation_result"];
      expect(report.p_operation_id).toBe(OPERATION);
      expect(report.p_attempt).toBe(4);
      expect(report.p_result).toEqual(
        expected === "succeeded"
          ? {
              result: "succeeded",
              provider_object_id: fake.objects()[0]?.id,
            }
          : expected,
      );
      expect(Object.keys(report.p_result).sort()).toEqual(
        Object.keys(
          expected === "succeeded"
            ? { result: 1, provider_object_id: 1 }
            : (expected as object),
        ).sort(),
      );
      expect(fake.calls()).toBe(1);
      expect(run).toMatchObject({ sent: true, attempt: 4 });
    }
    expect(LEASE_SECONDS).toBe(120);
  });

  it("B2: the retry delay for attempts 1 to 8 is 30, 60, 120, 240, 480, 960, 1920 and 3600 seconds, a JSON integer", async () => {
    const delays: unknown[] = [];
    for (let attempt = 1; attempt <= 8; attempt += 1) {
      const { rpc, calls } = claimedRpc({ attempt });
      const { adapter } = stubAdapter({
        result: "unknown",
        errorCode: "stripe_server_error",
      });
      await runProviderOperation({ rpc, adapter, operationId: OPERATION });
      const report = calls[1]
        ?.args as ProviderOperationRpcArgs["record_provider_operation_result"];
      delays.push(JSON.stringify(report.p_result));
    }
    expect(delays).toEqual(
      [30, 60, 120, 240, 480, 960, 1920, 3600].map((d) =>
        JSON.stringify({
          result: "unknown",
          retry_delay_seconds: d,
          error_code: "stripe_server_error",
        }),
      ),
    );
    expect([1, 2, 8, 9, 40].map(retryDelaySeconds)).toEqual([
      30, 60, 3600, 3600, 3600,
    ]);
  });

  it("B3: every pre-send check that fails reports not_performed pre_send_refused and sends nothing; byte equality, no trim or case folding", async () => {
    const withRequest = (change: (r: ReturnType<typeof request>) => void) => {
      const r = request();
      change(r);
      return { request: r };
    };
    const cases: [string, Record<string, unknown>][] = [
      ["an account with a trailing space", { provider_account: `${ACCOUNT} ` }],
      [
        "an upper-case account prefix",
        { provider_account: ACCOUNT.replace("acct_", "ACCT_") },
      ],
      ["an account with a no-break space", { provider_account: `${ACCOUNT} ` }],
      ["an empty account", { provider_account: "" }],
      ["an extra key in the claim", { extra: true }],
      ["a missing key in the claim", { request_digest: undefined }],
      [
        "a string amount",
        withRequest((r) => {
          r.amount = "10300";
        }),
      ],
      [
        "a fractional amount",
        withRequest((r) => {
          r.amount = 10300.5;
        }),
      ],
      [
        "an upper-case currency",
        withRequest((r) => {
          r.currency = "USD";
        }),
      ],
      [
        "another asym_operation",
        withRequest((r) => {
          r.metadata.asym_operation = "00000000-0000-4000-8000-000000000000";
        }),
      ],
      [
        "an extra request key",
        withRequest((r) => {
          r.description = "a worker's name";
        }),
      ],
      [
        "an extra metadata key",
        withRequest((r) => {
          r.metadata.worker = "jane";
        }),
      ],
      [
        "both method keys",
        withRequest((r) => {
          r.automatic_payment_methods = { enabled: true };
        }),
      ],
      [
        "a key not from asym_intake",
        { idempotency_key: `gift:${TENANT}:create_payment` },
      ],
      ["a key with a trailing space", { idempotency_key: `${KEY} ` }],
      ["an upper-case key", { idempotency_key: KEY.toUpperCase() }],
      ["livemode true", { livemode: true }],
      ["livemode as a string", { livemode: "false" }],
      ["another request_kind", { request_kind: "refund" }],
      [
        "a request_kind with a trailing space",
        { request_kind: "create_payment " },
      ],
    ];
    const got: string[] = [];
    for (const [label, over] of cases) {
      const { rpc, calls } = claimedRpc({ attempt: 2, ...over });
      const { fake, adapter, createPayment } = fakeAdapter(succeed());
      const run = await runProviderOperation({
        rpc,
        adapter,
        operationId: OPERATION,
      });
      const report = calls[1]?.args as
        | ProviderOperationRpcArgs["record_provider_operation_result"]
        | undefined;
      got.push(
        `${label}: ${createPayment.mock.calls.length + fake.calls()} sent, ${JSON.stringify(report?.p_result)}, sent ${run.sent}`,
      );
    }
    expect(got).toEqual(
      cases.map(
        ([label]) =>
          `${label}: 0 sent, {"result":"not_performed","retry_delay_seconds":60,"error_code":"pre_send_refused"}, sent false`,
      ),
    );
  });

  it("B3: a claimed body without a positive integer attempt or with another operation_id is returned unreported", async () => {
    for (const over of [
      { attempt: 0 },
      { attempt: -1 },
      { attempt: 1.5 },
      { attempt: "1" },
      { attempt: undefined },
      { operation_id: OPERATION.toUpperCase() },
      { operation_id: "00000000-0000-4000-8000-000000000000" },
    ]) {
      const { rpc, calls } = claimedRpc(over);
      const { fake, adapter } = fakeAdapter(succeed());
      const run = await runProviderOperation({
        rpc,
        adapter,
        operationId: OPERATION,
      });
      expect(run.sent).toBe(false);
      expect(calls.map((c) => c.fn)).toEqual(["claim_provider_operation"]);
      expect(fake.calls()).toBe(0);
    }
  });

  it("B4: the budget counts on the monotonic clock from just before the claim: 81 s spent is lease_budget_spent and sends nothing; 30 s spent sends with a 60,000 ms timeout; 75 s with 15,000", async () => {
    const got: string[] = [];
    for (const spent of [81_000, 80_001, 80_000, 75_000, 30_000, 0]) {
      const readings = [1_000_000, 1_000_000 + spent];
      const clock = {
        monotonicMs: () => readings.shift() ?? 1_000_000 + spent,
      };
      const { rpc, calls } = claimedRpc();
      const { fake, adapter } = fakeAdapter(succeed());
      await runProviderOperation({
        rpc,
        adapter,
        operationId: OPERATION,
        clock,
      });
      const report = calls[1]
        ?.args as ProviderOperationRpcArgs["record_provider_operation_result"];
      got.push(
        fake.calls()
          ? `${spent}: timeout ${fake.requests()[0]?.timeout}`
          : `${spent}: ${JSON.stringify(report.p_result)}`,
      );
    }
    expect(got).toEqual([
      '81000: {"result":"not_performed","retry_delay_seconds":30,"error_code":"lease_budget_spent"}',
      '80001: {"result":"not_performed","retry_delay_seconds":30,"error_code":"lease_budget_spent"}',
      "80000: timeout 10000",
      "75000: timeout 15000",
      "30000: timeout 60000",
      "0: timeout 60000",
    ]);
  });

  it("B4: the clock is read before the claim, so the time the claim takes counts against the budget", async () => {
    let now = 0;
    const clock = { monotonicMs: () => now };
    const { rpc: inner, calls } = claimedRpc();
    const rpc: ProviderOperationRpc = async (
      fn: ProviderOperationRpcName,
      args: ProviderOperationRpcArgs[ProviderOperationRpcName],
    ) => {
      if (fn === "claim_provider_operation") now += 85_000;
      return inner(fn as "claim_provider_operation", args as never);
    };
    const { fake, adapter } = fakeAdapter(succeed());
    await runProviderOperation({ rpc, adapter, operationId: OPERATION, clock });
    expect(fake.calls()).toBe(0);
    expect(
      (
        calls[1]
          ?.args as ProviderOperationRpcArgs["record_provider_operation_result"]
      ).p_result,
    ).toEqual({
      result: "not_performed",
      retry_delay_seconds: 30,
      error_code: "lease_budget_spent",
    });
  });

  it("B5: a report refused 55000 lease_lost, 55000 stale_attempt or any other error stops the run: nothing further, one log line with the operation, attempt, answer and object id", async () => {
    for (const error of [
      { code: "55000", message: "lease_lost" },
      { code: "55000", message: "stale_attempt" },
      { code: "08006", message: "connection failure" },
    ]) {
      const { rpc, calls } = claimedRpc({ attempt: 3 }, { data: null, error });
      const { fake, adapter } = fakeAdapter(succeed());
      const log = vi.fn();
      const run = await runProviderOperation({
        rpc,
        adapter,
        operationId: OPERATION,
        log,
      });
      const id = fake.objects()[0]?.id;
      expect(run).toMatchObject({
        sent: true,
        attempt: 3,
        answer: { result: "succeeded", providerObjectId: id },
        report: { data: null, error },
      });
      expect(calls).toHaveLength(2);
      expect(fake.calls()).toBe(1);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0]?.[0]).toMatchObject({
        operationId: OPERATION,
        attempt: 3,
        answer: { result: "succeeded", providerObjectId: id },
        providerObjectId: id,
      });
      expect(JSON.stringify(log.mock.calls[0]?.[0])).not.toContain(KEY);
    }
  });

  it("B5: a report that throws is a report error too: one log line, nothing further", async () => {
    const { rpc: inner, calls } = claimedRpc();
    const rpc: ProviderOperationRpc = async (
      fn: ProviderOperationRpcName,
      args: ProviderOperationRpcArgs[ProviderOperationRpcName],
    ) => {
      if (fn === "record_provider_operation_result") {
        calls.push({ fn, args });
        throw new Error("socket closed");
      }
      return inner(fn as "claim_provider_operation", args as never);
    };
    const { adapter } = stubAdapter({
      result: "unknown",
      errorCode: "stripe_timeout",
    });
    const log = vi.fn();
    const run = await runProviderOperation({
      rpc,
      adapter,
      operationId: OPERATION,
      log,
    });
    expect(run).toMatchObject({
      sent: true,
      report: { data: null, error: { message: "socket closed" } },
    });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0]?.[0]).not.toHaveProperty("providerObjectId");
  });

  it("B6: an adapter that throws is reported unknown adapter_fault; an answer outside the adapter's contract is too", async () => {
    const answers: (PaymentProviderAnswer | Error | Record<string, unknown>)[] =
      [
        new Error("boom"),
        { result: "succeeded", providerObjectId: "ch_1" },
        { result: "refused" },
        { result: "not_performed", errorCode: "Upper" },
        { result: "maybe", errorCode: "x" },
      ];
    for (const answer of answers) {
      const { rpc, calls } = claimedRpc();
      const { adapter } = stubAdapter(answer as PaymentProviderAnswer);
      await runProviderOperation({ rpc, adapter, operationId: OPERATION });
      expect(
        (
          calls[1]
            ?.args as ProviderOperationRpcArgs["record_provider_operation_result"]
        ).p_result,
      ).toEqual({
        result: "unknown",
        retry_delay_seconds: 30,
        error_code: "adapter_fault",
      });
    }
  });

  it("B6: the adapter receives exactly the claim's account, key and request, and a timeout no longer than 60,000 ms", async () => {
    const { rpc } = claimedRpc();
    const { adapter, createPayment } = stubAdapter({
      result: "succeeded",
      providerObjectId: "pi_3Stub0001",
    });
    await runProviderOperation({ rpc, adapter, operationId: OPERATION });
    expect(createPayment).toHaveBeenCalledTimes(1);
    expect(createPayment).toHaveBeenCalledWith({
      account: ACCOUNT,
      idempotencyKey: KEY,
      params: request(),
      timeoutMs: expect.any(Number),
      remainingMs: expect.any(Function),
    });
    const timeoutMs = (
      createPayment.mock.calls[0] as unknown as [{ timeoutMs: number }]
    )[0].timeoutMs;
    expect(Number.isInteger(timeoutMs)).toBe(true);
    expect(timeoutMs).toBeLessThanOrEqual(60_000);
    expect(timeoutMs).toBeGreaterThanOrEqual(10_000);
  });

  it("B7: never two adapter calls or another RPC, whatever the report answers", async () => {
    for (const report of [
      { data: { outcome: "linked" }, error: null },
      { data: { outcome: "unknown_anchor" }, error: null },
      { data: null, error: { code: "22023", message: "bad_result" } },
      { data: null, error: null },
    ]) {
      const { rpc, calls } = claimedRpc({}, report);
      const { fake, adapter, createPayment } = fakeAdapter(succeed());
      await runProviderOperation({ rpc, adapter, operationId: OPERATION });
      expect(createPayment).toHaveBeenCalledTimes(1);
      expect(fake.calls()).toBe(1);
      expect(calls.map((c) => c.fn)).toEqual([
        "claim_provider_operation",
        "record_provider_operation_result",
      ]);
    }
  });

  it("F6 (review finding 6): the adapter receives the request the checks validated, not a second reading of the claim's body", async () => {
    let reads = 0;
    const shifting = request();
    Object.defineProperty(shifting, "amount", {
      enumerable: true,
      get: () => {
        reads += 1;
        return reads === 1 ? 10300 : 999;
      },
    });
    const { rpc } = claimedRpc({ request: shifting });
    const seen: unknown[] = [];
    const adapter: PaymentProviderAdapter = {
      createPayment: async (input) => {
        seen.push(
          input.params.amount,
          Object.getOwnPropertyDescriptor(input.params, "amount")?.get ===
            undefined,
        );
        return { result: "succeeded", providerObjectId: "pi_3Validated0001" };
      },
    };
    await runProviderOperation({ rpc, adapter, operationId: OPERATION });
    expect(seen).toEqual([10300, true]);
  });

  it("B3 (bot round): a log callback that throws changes nothing the run returns: the object id and the report's error still come back, and nothing is retried", async () => {
    const error = { code: "55000", message: "lease_lost" };
    const { rpc, calls } = claimedRpc({ attempt: 2 }, { data: null, error });
    const { adapter, createPayment } = stubAdapter({
      result: "succeeded",
      providerObjectId: "pi_3Logged0001",
    });
    const log = vi.fn(() => {
      throw new Error("the logger is down");
    });
    const run = await runProviderOperation({
      rpc,
      adapter,
      operationId: OPERATION,
      log,
    });
    expect(run).toMatchObject({
      sent: true,
      attempt: 2,
      answer: { result: "succeeded", providerObjectId: "pi_3Logged0001" },
      report: { data: null, error },
    });
    expect(log).toHaveBeenCalledTimes(1);
    expect(createPayment).toHaveBeenCalledTimes(1);
    expect(calls.map((c) => c.fn)).toEqual([
      "claim_provider_operation",
      "record_provider_operation_result",
    ]);
  });

  it("B4 (bot round): a clock that passes the budget between the run's own check and the adapter arming its timer sends nothing; the run reports not_performed lease_budget_spent", async () => {
    const readings = [0, 30_000, 85_000];
    const clock = { monotonicMs: () => readings.shift() ?? 85_000 };
    const { rpc, calls } = claimedRpc();
    const { fake, adapter } = fakeAdapter(succeed());
    const run = await runProviderOperation({
      rpc,
      adapter,
      operationId: OPERATION,
      clock,
    });
    expect(fake.calls()).toBe(0);
    expect(run).toMatchObject({
      sent: false,
      answer: { result: "not_performed", errorCode: "lease_budget_spent" },
    });
    expect(
      (
        calls[1]
          ?.args as ProviderOperationRpcArgs["record_provider_operation_result"]
      ).p_result,
    ).toEqual({
      result: "not_performed",
      retry_delay_seconds: 30,
      error_code: "lease_budget_spent",
    });
  });
});
