import {
  PAYMENT_EVENT_LEASE_SECONDS,
  PAYMENT_EVENT_RETRY_DELAY_SECONDS,
  isDeferredEventType,
} from "../stripe/payment-event-types";
import {
  MIN_CALLER_BUDGET_MS,
  runProviderOperation,
  type PaymentProviderAdapter,
  type ProviderOperationRpc,
} from "./provider-operations/run";

export const MONEY_SCHEDULE_PARTS = [
  "worker",
  "sweep",
  "events",
  "reconciliation",
] as const;

export type MoneySchedulePart = (typeof MONEY_SCHEDULE_PARTS)[number];

export type MoneyScheduleRpc = (
  fn: string,
  args: Record<string, unknown>,
) => Promise<{
  data: unknown;
  error: { code?: string; message: string } | null;
}>;

export type AccountReader = {
  retrieve(accountId: string): Promise<unknown>;
};

export type MoneyScheduleDeps = {
  rpc: MoneyScheduleRpc;
  paymentAdapter: () => PaymentProviderAdapter;
  accountReader: () => AccountReader;
  runOperation?: typeof runProviderOperation;
  limit?: number;
  budgetMs?: number;
  readerDeadlineMs?: number;
  clock?: () => number;
};

export type PartResult = {
  part: MoneySchedulePart;
  status: "idle" | "done" | "failed";
  handled: number;
  failures: number;
  deferred: number;
  error?: string;
};

type Due = { kind: string; id: string; detail: string | null };

const CLOSED_ACCOUNT_EVENT = "v2.core.account.closed";
const DEFAULT_LIMIT = 25;
const DEFAULT_BUDGET_MS = 45_000;
export const ACCOUNT_READ_DEADLINE_MS = 10_000;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function dueRows(data: unknown): Due[] | null {
  if (!Array.isArray(data)) return null;
  const rows: Due[] = [];
  for (const row of data) {
    if (
      !isRecord(row) ||
      typeof row.kind !== "string" ||
      typeof row.id !== "string"
    )
      return null;
    rows.push({
      kind: row.kind,
      id: row.id,
      detail: typeof row.detail === "string" ? row.detail : null,
    });
  }
  return rows;
}

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const INLINE_SEND_BUDGET_MS = 25_000;

export async function sendOneOperation(
  deps: Pick<MoneyScheduleDeps, "rpc" | "paymentAdapter" | "runOperation">,
  operationId: string,
): Promise<{ paymentIntentId: string } | null> {
  const run = await (deps.runOperation ?? runProviderOperation)({
    rpc: deps.rpc as unknown as ProviderOperationRpc,
    adapter: deps.paymentAdapter(),
    operationId,
    budgetMs: INLINE_SEND_BUDGET_MS,
  });
  return "answer" in run && run.answer.result === "succeeded"
    ? { paymentIntentId: run.answer.providerObjectId }
    : null;
}

export async function runMoneySchedule(
  deps: MoneyScheduleDeps,
): Promise<{ parts: PartResult[] }> {
  const clock = deps.clock ?? (() => performance.now());
  const started = clock();
  const budget = deps.budgetMs ?? DEFAULT_BUDGET_MS;
  const withinBudget = (reserveMs = 0) =>
    clock() - started + reserveMs < budget;
  const readerReserve = deps.readerDeadlineMs ?? ACCOUNT_READ_DEADLINE_MS;
  const runOperation = deps.runOperation ?? runProviderOperation;

  await Promise.resolve()
    .then(() => deps.rpc("purge_intake_attempts", {}))
    .catch(() => undefined);

  let due: Due[] | null = null;
  let readError: string | undefined;
  try {
    const read = await deps.rpc("money_due_work", {
      p_limit: deps.limit ?? DEFAULT_LIMIT,
    });
    due = read.error ? null : dueRows(read.data);
    readError = read.error?.message ?? (due ? undefined : "malformed due work");
  } catch (error) {
    readError = message(error);
  }
  if (!due)
    return {
      parts: MONEY_SCHEDULE_PARTS.map((part) => ({
        part,
        status: "failed",
        handled: 0,
        failures: 0,
        deferred: 0,
        error: readError,
      })),
    };

  const rows = due;
  let reader: AccountReader | null = null;
  const accountReader = () => (reader ??= deps.accountReader());

  async function part(
    name: MoneySchedulePart,
    kinds: string[],
    each: (row: Due) => Promise<boolean>,
    prepare?: () => void,
    reserveFor: (row: Due) => number = () => 0,
  ): Promise<PartResult> {
    const mine = rows.filter((row) => kinds.includes(row.kind));
    const result: PartResult = {
      part: name,
      status: "idle",
      handled: 0,
      failures: 0,
      deferred: 0,
    };
    if (mine.length === 0) return result;
    try {
      prepare?.();
    } catch (error) {
      return {
        ...result,
        status: "failed",
        failures: mine.length,
        error: message(error),
      };
    }
    result.status = "done";
    for (const row of mine) {
      if (!withinBudget(reserveFor(row))) {
        result.deferred += 1;
        continue;
      }
      try {
        if (await each(row)) result.handled += 1;
        else result.failures += 1;
      } catch (error) {
        result.failures += 1;
        result.error = message(error);
      }
    }
    return result;
  }

  async function settleEvent(
    row: Due,
    apply: (attempt: number) => Promise<{
      error: { code?: string; message: string } | null;
    }>,
  ): Promise<boolean> {
    const claim = await deps.rpc("claim_provider_event", {
      p_event_id: row.id,
      p_lease_seconds: PAYMENT_EVENT_LEASE_SECONDS,
    });
    if (claim.error || !isRecord(claim.data)) return false;
    if (claim.data.claimed !== true) return true;
    const attempt = Number(claim.data.attempt);
    const applied = await apply(attempt);
    if (!applied.error) return true;
    if (applied.error.code !== "55000")
      await deps.rpc("record_provider_event_failure", {
        p_event_id: row.id,
        p_attempt: attempt,
        p_error_code: applied.error.code ?? "apply_failed",
        p_error_message: applied.error.message,
        p_retryable: true,
        p_retry_delay_seconds: PAYMENT_EVENT_RETRY_DELAY_SECONDS,
      });
    return false;
  }

  let adapter: PaymentProviderAdapter | null = null;
  const parts: PartResult[] = [];

  parts.push(
    await part(
      "worker",
      ["operation"],
      async (row) => {
        const run = await runOperation({
          rpc: deps.rpc as unknown as ProviderOperationRpc,
          adapter: adapter!,
          operationId: row.id,
          budgetMs: budget - (clock() - started),
        });
        if (run.claim.error) return false;
        return !("report" in run && run.report.error);
      },
      () => {
        adapter = deps.paymentAdapter();
      },
      () => MIN_CALLER_BUDGET_MS,
    ),
  );

  parts.push(
    await part("sweep", ["unpaid"], async (row) => {
      const res = await deps.rpc("abandon_unpaid_intake", {
        p_donation_id: row.id,
      });
      return !res.error;
    }),
  );

  parts.push(
    await part(
      "events",
      ["payment_event", "account_event"],
      async (row) => {
        if (row.kind === "payment_event")
          return settleEvent(row, (attempt) =>
            deps.rpc(
              isDeferredEventType(row.detail ?? "")
                ? "defer_payment_event"
                : "apply_payment_outcome",
              { p_event_id: row.id, p_attempt: attempt },
            ),
          );
        const [type = "", account = ""] = (row.detail ?? "").split("|");
        return settleEvent(row, async (attempt) => {
          let snapshot: unknown = null;
          try {
            snapshot = await accountReader().retrieve(account);
          } catch (error) {
            if (type !== CLOSED_ACCOUNT_EVENT)
              return {
                error: {
                  code: "account_fetch_failed",
                  message: message(error),
                },
              };
          }
          return deps.rpc("apply_account_event", {
            p_event_id: row.id,
            p_attempt: attempt,
            p_snapshot: snapshot,
          });
        });
      },
      undefined,
      (row) => (row.kind === "account_event" ? readerReserve : 0),
    ),
  );

  parts.push(
    await part(
      "reconciliation",
      ["account"],
      async (row) => {
        let snapshot: unknown;
        let readFailed = false;
        try {
          snapshot = await accountReader().retrieve(row.detail ?? "");
        } catch {
          readFailed = true;
          snapshot = { id: row.detail, livemode: false, read_failed: true };
        }
        const res = await deps.rpc("reconcile_payment_account", {
          p_account_id: row.id,
          p_snapshot: snapshot,
        });
        return !res.error && !readFailed;
      },
      undefined,
      () => readerReserve,
    ),
  );

  return { parts };
}
