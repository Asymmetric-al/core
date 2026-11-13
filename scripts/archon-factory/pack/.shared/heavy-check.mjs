// All trusted candidate execution shares the MCP check pool. Ownership survives
// an uncertain executor exit until independent exact-attempt reconciliation.
import { randomUUID } from "node:crypto";
import { rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { acquireSlot } from "./check-mcp.mjs";
import { CheckCleanupError, removeLabeledContainers } from "./executor.mjs";

export class CheckCapacityError extends Error {
  constructor(code) {
    super(
      code === "check-cancelled"
        ? "Candidate check cancelled before execution"
        : "Shared heavy-check capacity is unavailable; candidate check was not run",
    );
    this.name = "CheckCapacityError";
    this.code = code;
  }
}

export async function runHeavyCheck(
  { config, locks, runId, issue, node = "trusted-script" },
  execute,
  { signal, reconcile, clock = {} } = {},
) {
  if (signal?.aborted) throw new CheckCapacityError("check-cancelled");
  const slots = config.limits?.heavyCheckSlots ?? 1;
  const queueMs = config.limits?.checkQueueMs ?? 600_000;
  if (
    !Number.isSafeInteger(slots) ||
    slots < 1 ||
    slots > 64 ||
    !Number.isSafeInteger(queueMs) ||
    queueMs < 0 ||
    queueMs > 7_200_000
  )
    throw new CheckCapacityError("check-capacity");
  const attempt = randomUUID();
  const owner = {
    pid: process.pid,
    attempt,
    container: `core-check-${attempt}`,
    runId,
    issue,
    node,
    at: new Date().toISOString(),
    state: "running",
  };
  const confirm =
    reconcile ??
    ((record) =>
      removeLabeledContainers({
        dockerExecutable: config.executor.docker,
        labels: { "core.archon.attempt": record.attempt },
      }));
  const slot = await acquireSlot({
    locks,
    slots,
    owner,
    queueMs,
    signal,
    ...clock,
    reconcile: async (record) => {
      const result = await confirm(record);
      return {
        ...result,
        ok:
          result?.ok === true &&
          Array.isArray(result.remaining) &&
          result.remaining.length === 0,
      };
    },
  });
  if (!slot)
    throw new CheckCapacityError(
      signal?.aborted ? "check-cancelled" : "check-capacity",
    );
  let receipt;
  try {
    if (signal?.aborted) {
      receipt = { cleanupConfirmed: true, reusable: true };
      throw new CheckCapacityError("check-cancelled");
    }
    try {
      receipt = await execute(attempt);
    } catch (error) {
      receipt = error?.receipt;
      throw error;
    }
    if (receipt?.cleanupConfirmed !== true || receipt?.reusable !== true)
      throw new CheckCleanupError(receipt);
    return receipt;
  } finally {
    if (receipt?.cleanupConfirmed === true && receipt?.reusable === true)
      rmSync(slot, { recursive: true, force: true });
    else
      writeFileSync(
        path.posix.join(slot, "owner"),
        JSON.stringify({ ...owner, state: "unconfirmed" }),
      );
  }
}
