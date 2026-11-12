// Record: settle the round. One finish write releases the lease; a successor
// round is fired through the delivery binding keyed by assignment, round and
// the item's revision, so a retried record can never start two successors and
// a round that never claimed leaves a marker that re-arms the next dispatch.
// The decision and the writes live in record-logic.mjs.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createCleanupReconciler } from "../../.shared/cleanup-reconciliation.mjs";
import { hasUnconfirmedCleanup } from "../../.shared/cleanup-state.mjs";
import { readNativeFaults } from "../../.shared/native-faults.mjs";
import { emit, openRound } from "../../.shared/round.mjs";
import { fireRound } from "../../.shared/webhook.mjs";
import { settleRound } from "./record-logic.mjs";

const round = openRound();
const outcomes = (() => {
  try {
    return JSON.parse(readFileSync(process.env.NODE_OUTCOMES_FILE!, "utf8"));
  } catch {
    return { nodes: [] };
  }
})();
const nativeFaults = await readNativeFaults({
  archon: round.archon,
  runId: round.runId,
  outcomes,
});

const result = await settleRound({
  archon: round.archon,
  issue: round.issue,
  runId: round.runId,
  assignment: round.assignment,
  ledger: round.ledger.all(),
  nodes: Array.isArray(outcomes?.nodes) ? outcomes.nodes : [],
  nativeFaults,
  now: round.now(),
  limits: round.limits,
  artifactsDir: round.artifacts,
  reconcileCleanup: createCleanupReconciler({
    dockerExecutable: round.config.executor.docker,
    artifactsDir: round.artifacts,
    runId: round.runId,
    assignment: round.assignment,
    issue: round.issue,
  }),
  fire: ({ value, revision }: { value: unknown; revision: number }) =>
    fireRound({ config: round.config, value, revision }),
});
if (result.successor)
  writeFileSync(
    path.posix.join(round.runDir, "successor.json"),
    JSON.stringify(result.successor, null, 2),
  );
round.ledger.write("record", {
  outcome: result.outcome,
  next: result.next,
  reservations: result.reservations,
  marked: result.marked ?? null,
});
let viewsReusable =
  result.cleanupPending !== true && result.nativePending !== true;
if (viewsReusable) {
  try {
    const document = await round.archon.get(`core/issues/${round.issue}`);
    viewsReusable = !hasUnconfirmedCleanup(document.value);
  } catch {
    viewsReusable = false;
  }
}
if (viewsReusable) {
  try {
    rmSync(path.posix.join(round.paths.views, round.runId), {
      recursive: true,
      force: true,
    });
  } catch {}
}
emit({
  outcome: result.outcome,
  next: result.next,
  reason: String(result.reason ?? "").slice(0, 1500),
});
