import { describe, expect, it, vi } from "vitest";

const adminClient = vi.hoisted(() => ({
  rpc: vi.fn(async (fn: string) =>
    fn === "money_due_work"
      ? { data: [], error: null }
      : { data: null, error: { message: "unexpected" } },
  ),
  from: vi.fn(() => {
    throw new Error("the money schedule reads no table");
  }),
}));

const createStripeClientMock = vi.hoisted(() => vi.fn(() => ({})));

vi.mock("../../../../../packages/api/src/stripe/client", () => ({
  createStripeClient: createStripeClientMock,
}));

vi.mock("../../../../../packages/api/src/workflows/admin-client", () => ({
  requireWorkflowAdminClient: () => adminClient,
}));

import {
  MONEY_SCHEDULE_PARTS,
  runMoneySchedule,
  type MoneyScheduleDeps,
} from "../../../../../packages/api/src/donate/money-schedule";
import {
  accountReaderFor,
  moneySchedule,
  moneyScheduleHandler,
} from "../../../../../packages/api/src/workflows/functions/money-schedule";

const OP = "11111111-1111-4111-8111-111111111111";
const INTAKE = "22222222-2222-4222-8222-222222222222";
const EVENT = "33333333-3333-4333-8333-333333333333";
const ACCOUNT_EVENT = "44444444-4444-4444-8444-444444444444";
const ACCOUNT_ROW = "55555555-5555-4555-8555-555555555555";
const TENANT = "66666666-6666-4666-8666-666666666666";
const OP2 = "77777777-7777-4777-8777-777777777777";
const OP3 = "88888888-8888-4888-8888-888888888888";

type Due = {
  kind: string;
  id: string;
  tenant_id: string;
  detail: string | null;
};

function fakeRpc(
  due: Due[] | { error: string },
  answers: Record<string, unknown> = {},
) {
  const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
  const rpc = vi.fn(async (fn: string, args: Record<string, unknown>) => {
    calls.push({ fn, args });
    if (fn === "money_due_work")
      return "error" in due
        ? { data: null, error: { message: due.error } }
        : { data: due, error: null };
    if (fn === "claim_provider_operation")
      return {
        data: { outcome: "not_due", operation_id: args.p_operation_id },
        error: null,
      };
    if (fn === "claim_provider_event")
      return {
        data: {
          claimed: true,
          terminal: false,
          outcome: "claimed",
          attempt: 2,
        },
        error: null,
      };
    if (fn in answers) return answers[fn] as { data: unknown; error: null };
    return { data: { outcome: "ok" }, error: null };
  });
  return { rpc, calls };
}

function deps(
  over: Partial<MoneyScheduleDeps> = {},
  rpc = fakeRpc([]).rpc,
): MoneyScheduleDeps {
  return {
    rpc: rpc as never,
    paymentAdapter: vi.fn(() => ({
      createPayment: vi.fn(),
      cancelPayment: vi.fn(),
    })),
    accountReader: vi.fn(() => ({
      retrieve: vi.fn(async (id: string) => ({ id, livemode: false })),
    })),
    ...over,
  };
}

describe("AL-2681 PR 2a: the money schedule, one step-free function on the */30 cadence (D-18, AL-2681 PR 2b: every tick first purges the limit's expired attempts)", () => {
  it("has four parts in a fixed order", () => {
    expect(MONEY_SCHEDULE_PARTS).toEqual([
      "worker",
      "sweep",
      "events",
      "reconciliation",
    ]);
  });

  it("with nothing due it reads once, every part leaves at once, and no provider or account client is made", async () => {
    const { rpc, calls } = fakeRpc([]);
    const d = deps({}, rpc);
    const result = await runMoneySchedule(d);
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
    ]);
    expect(result.parts.map((p) => [p.part, p.status, p.handled])).toEqual([
      ["worker", "idle", 0],
      ["sweep", "idle", 0],
      ["events", "idle", 0],
      ["reconciliation", "idle", 0],
    ]);
    expect(d.paymentAdapter).not.toHaveBeenCalled();
    expect(d.accountReader).not.toHaveBeenCalled();
  });

  it("a part that fails does not stop the others", async () => {
    const { rpc, calls } = fakeRpc([
      {
        kind: "operation",
        id: OP,
        tenant_id: TENANT,
        detail: "create_payment",
      },
      { kind: "unpaid", id: INTAKE, tenant_id: TENANT, detail: null },
      {
        kind: "payment_event",
        id: EVENT,
        tenant_id: TENANT,
        detail: "payment_intent.succeeded",
      },
    ]);
    const d = deps(
      {
        paymentAdapter: vi.fn(() => {
          throw new Error("Stripe is not configured for this environment.");
        }),
      },
      rpc,
    );
    const result = await runMoneySchedule(d);
    expect(result.parts.find((p) => p.part === "worker")).toMatchObject({
      status: "failed",
      failures: 1,
    });
    expect(result.parts.find((p) => p.part === "sweep")).toMatchObject({
      status: "done",
      handled: 1,
    });
    expect(result.parts.find((p) => p.part === "events")).toMatchObject({
      status: "done",
      handled: 1,
    });
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
      "abandon_unpaid_intake",
      "claim_provider_event",
      "apply_payment_outcome",
    ]);
  });

  it("the worker runs each due request through the worker's own claim", async () => {
    const { rpc, calls } = fakeRpc([
      {
        kind: "operation",
        id: OP,
        tenant_id: TENANT,
        detail: "create_payment",
      },
    ]);
    const result = await runMoneySchedule(deps({}, rpc));
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
      "claim_provider_operation",
    ]);
    expect(calls[1]!.args).toMatchObject({ p_operation_id: OP });
    expect(result.parts[0]).toMatchObject({
      part: "worker",
      status: "done",
      handled: 1,
    });
  });

  it("events: a refund or dispute is deferred, a payment event applied, a failure recorded for a later attempt", async () => {
    const { rpc, calls } = fakeRpc(
      [
        {
          kind: "payment_event",
          id: EVENT,
          tenant_id: TENANT,
          detail: "charge.dispute.created",
        },
        {
          kind: "payment_event",
          id: ACCOUNT_EVENT,
          tenant_id: TENANT,
          detail: "payment_intent.succeeded",
        },
      ],
      {
        apply_payment_outcome: {
          data: null,
          error: { code: "XX000", message: "boom" },
        },
      },
    );
    const result = await runMoneySchedule(deps({}, rpc));
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
      "claim_provider_event",
      "defer_payment_event",
      "claim_provider_event",
      "apply_payment_outcome",
      "record_provider_event_failure",
    ]);
    expect(calls[2]!.args).toEqual({ p_event_id: EVENT, p_attempt: 2 });
    expect(result.parts.find((p) => p.part === "events")).toMatchObject({
      handled: 1,
      failures: 1,
    });
  });

  it("events: an account event re-reads its account, then applies it", async () => {
    const { rpc, calls } = fakeRpc([
      {
        kind: "account_event",
        id: ACCOUNT_EVENT,
        tenant_id: TENANT,
        detail: "v2.core.account.updated|acct_alpha1",
      },
    ]);
    const retrieve = vi.fn(async (id: string) => ({ id, livemode: false }));
    await runMoneySchedule(deps({ accountReader: () => ({ retrieve }) }, rpc));
    expect(retrieve).toHaveBeenCalledWith("acct_alpha1");
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
      "claim_provider_event",
      "apply_account_event",
    ]);
    expect(calls[2]!.args).toEqual({
      p_event_id: ACCOUNT_EVENT,
      p_attempt: 2,
      p_snapshot: { id: "acct_alpha1", livemode: false },
    });
  });

  it("reconciliation reads each mapped account from the provider and hands the snapshot to the reconcile command", async () => {
    const { rpc, calls } = fakeRpc([
      {
        kind: "account",
        id: ACCOUNT_ROW,
        tenant_id: TENANT,
        detail: "acct_alpha1",
      },
    ]);
    const retrieve = vi.fn(async (id: string) => ({
      id,
      livemode: false,
      closed: true,
    }));
    const result = await runMoneySchedule(
      deps({ accountReader: () => ({ retrieve }) }, rpc),
    );
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
      "reconcile_payment_account",
    ]);
    expect(calls[1]!.args).toEqual({
      p_account_id: ACCOUNT_ROW,
      p_snapshot: { id: "acct_alpha1", livemode: false, closed: true },
    });
    expect(result.parts.find((p) => p.part === "reconciliation")).toMatchObject(
      { status: "done", handled: 1 },
    );
  });

  it("starts no new work once its time budget is spent", async () => {
    const { rpc, calls } = fakeRpc([
      { kind: "unpaid", id: INTAKE, tenant_id: TENANT, detail: null },
      { kind: "unpaid", id: OP, tenant_id: TENANT, detail: null },
    ]);
    let now = 0;
    const clock = () => now;
    const slow = vi.fn(async (fn: string, args: Record<string, unknown>) => {
      if (fn === "abandon_unpaid_intake") now += 60_000;
      return rpc(fn, args);
    });
    const result = await runMoneySchedule(
      deps({ clock, budgetMs: 45_000 }, slow as never),
    );
    expect(calls.filter((c) => c.fn === "abandon_unpaid_intake")).toHaveLength(
      1,
    );
    expect(result.parts.find((p) => p.part === "sweep")).toMatchObject({
      handled: 1,
      deferred: 1,
    });
  });

  it("a failed read fails every part, quietly, for the next tick", async () => {
    const { rpc } = fakeRpc({ error: "database down" });
    const result = await runMoneySchedule(deps({}, rpc));
    expect(result.parts.every((p) => p.status === "failed")).toBe(true);
  });

  it("the Inngest function: one cron, every thirty minutes, no retries, one at a time, and no step", async () => {
    expect(moneySchedule.opts.id).toBe("money-schedule");
    expect(moneySchedule.opts.triggers).toEqual([{ cron: "*/30 * * * *" }]);
    expect(moneySchedule.opts.retries).toBe(0);
    expect(moneySchedule.opts.concurrency).toEqual([{ limit: 1 }]);
    const step = new Proxy(
      {},
      {
        get: () => () => {
          throw new Error("the money schedule takes no step");
        },
      },
    );
    const run = vi.fn(async () => ({ parts: [] }));
    await expect(moneyScheduleHandler({ step } as never, run)).resolves.toEqual(
      { parts: [] },
    );
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("its default runner holds an RPC-only client: one call of money_due_work and no table read (W8-R40; D-18, AL-2681 PR 2b: the purge of expired gift attempts comes first)", async () => {
    adminClient.rpc.mockClear();
    adminClient.from.mockClear();
    const step = new Proxy(
      {},
      {
        get: () => () => {
          throw new Error("the money schedule takes no step");
        },
      },
    );
    const result = (await moneyScheduleHandler({ step } as never)) as {
      parts: Array<{ status: string }>;
    };
    expect(adminClient.rpc.mock.calls.map((c) => c[0])).toEqual([
      "purge_intake_attempts",
      "money_due_work",
    ]);
    expect(adminClient.from).not.toHaveBeenCalled();
    expect(result.parts.every((p) => p.status === "idle")).toBe(true);
  });
});

describe("AL-2681 part 2a fix round: the schedule tells the truth and keeps its time (D-18, AL-2681 PR 2b: every tick first purges the limit's expired attempts)", () => {
  it("F7 (a): a provider operation whose claim or whose result report came back as an RPC error is a failure, not handled; a benign skip is handled; each runs once", async () => {
    const { rpc } = fakeRpc(
      [OP, OP2, OP3].map((id) => ({
        kind: "operation",
        id,
        tenant_id: TENANT,
        detail: "create_payment",
      })),
    );
    const runOperation = vi.fn(
      async ({ operationId }: { operationId: string }) =>
        operationId === OP
          ? {
              sent: false,
              claim: { data: null, error: { message: "claim failed" } },
            }
          : operationId === OP2
            ? {
                sent: true,
                claim: { data: { outcome: "claimed" }, error: null },
                attempt: 1,
                answer: { result: "succeeded" },
                report: { data: null, error: { message: "report failed" } },
              }
            : {
                sent: false,
                claim: { data: { outcome: "not_due" }, error: null },
              },
    );
    const result = await runMoneySchedule(
      deps({ runOperation: runOperation as never }, rpc),
    );
    expect(result.parts[0]).toMatchObject({
      part: "worker",
      status: "done",
      handled: 1,
      failures: 2,
    });
    expect(runOperation).toHaveBeenCalledTimes(3);
  });

  it("F7 (b): no provider read starts when less than the reader's deadline remains of the budget", async () => {
    const { rpc, calls } = fakeRpc([
      {
        kind: "account",
        id: ACCOUNT_ROW,
        tenant_id: TENANT,
        detail: "acct_alpha1",
      },
      {
        kind: "account_event",
        id: ACCOUNT_EVENT,
        tenant_id: TENANT,
        detail: "v2.core.account.updated|acct_alpha1",
      },
    ]);
    let now = 0;
    const timed = vi.fn(async (fn: string, args: Record<string, unknown>) => {
      const answer = await rpc(fn, args);
      if (fn === "money_due_work") now = 40_000;
      return answer;
    });
    const retrieve = vi.fn(async (id: string) => ({ id, livemode: false }));
    const result = await runMoneySchedule(
      deps(
        {
          clock: () => now,
          budgetMs: 45_000,
          readerDeadlineMs: 10_000,
          accountReader: () => ({ retrieve }),
        },
        timed as never,
      ),
    );
    expect(retrieve).not.toHaveBeenCalled();
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
    ]);
    expect(result.parts.find((p) => p.part === "events")).toMatchObject({
      handled: 0,
      deferred: 1,
    });
    expect(result.parts.find((p) => p.part === "reconciliation")).toMatchObject(
      {
        handled: 0,
        deferred: 1,
      },
    );
  });

  it("F7 (b): the schedule's account reader has a ten-second deadline and no automatic retry", () => {
    createStripeClientMock.mockClear();
    accountReaderFor("sk_test_schedule_reader");
    expect(createStripeClientMock).toHaveBeenCalledWith(
      "sk_test_schedule_reader",
      { timeout: 10_000, maxNetworkRetries: 0 },
    );
  });

  it("F5: a reconciliation whose provider read throws hands the failure to the reconcile command and counts it failed", async () => {
    const { rpc, calls } = fakeRpc([
      {
        kind: "account",
        id: ACCOUNT_ROW,
        tenant_id: TENANT,
        detail: "acct_alpha1",
      },
    ]);
    const retrieve = vi.fn(async () => {
      throw new Error("Stripe timed out");
    });
    const result = await runMoneySchedule(
      deps({ accountReader: () => ({ retrieve }) }, rpc),
    );
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
      "reconcile_payment_account",
    ]);
    expect(calls[1]!.args).toEqual({
      p_account_id: ACCOUNT_ROW,
      p_snapshot: { id: "acct_alpha1", livemode: false, read_failed: true },
    });
    expect(result.parts.find((p) => p.part === "reconciliation")).toMatchObject(
      {
        handled: 0,
        failures: 1,
      },
    );
  });
});

describe("AL-2681 PR 2b: the schedule purges the limit's expired rows and keeps a send inside its budget", () => {
  it("each tick removes the limit's expired attempts first, also when nothing is due", async () => {
    const { rpc, calls } = fakeRpc([]);
    await runMoneySchedule(deps({}, rpc));
    expect(calls.map((c) => c.fn)).toEqual([
      "purge_intake_attempts",
      "money_due_work",
    ]);
  });

  it("guard (passes on the base): a failed purge does not stop the tick", async () => {
    const { rpc, calls } = fakeRpc([], {
      purge_intake_attempts: { data: null, error: { message: "purge failed" } },
    });
    const result = await runMoneySchedule(deps({}, rpc));
    expect(calls.map((c) => c.fn)).toContain("money_due_work");
    expect(result.parts.every((p) => p.status === "idle")).toBe(true);
  });

  it("item 34: an operation is handed the time left of the budget, and none starts with less than a send and its report left", async () => {
    const { rpc } = fakeRpc(
      [OP, OP2].map((id) => ({
        kind: "operation",
        id,
        tenant_id: TENANT,
        detail: null,
      })),
    );
    let now = 0;
    const budgets: Array<number | undefined> = [];
    const runOperation = vi.fn(async (input: { budgetMs?: number }) => {
      budgets.push(input.budgetMs);
      now += 31_000;
      return {
        sent: true,
        claim: { data: { outcome: "claimed" }, error: null },
      } as never;
    });
    const result = await runMoneySchedule(
      deps(
        {
          clock: () => now,
          budgetMs: 45_000,
          runOperation: runOperation as never,
        },
        rpc,
      ),
    );
    expect(runOperation).toHaveBeenCalledTimes(1);
    expect(budgets).toEqual([45_000]);
    expect(result.parts.find((p) => p.part === "worker")).toMatchObject({
      handled: 1,
      deferred: 1,
    });
  });
});
