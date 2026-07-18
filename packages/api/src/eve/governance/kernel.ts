import type {
  EveGovernanceBlockReason,
  EveGovernanceDecisionRecord,
  EveGovernanceSnapshot,
  EveGovernanceStore,
} from "./types";

export type EveGovernanceEvaluation =
  | { allowed: true; reason: "governance_allowed" }
  | { allowed: false; reason: EveGovernanceBlockReason };

export function evaluateEveGovernance(
  snapshot: EveGovernanceSnapshot,
): EveGovernanceEvaluation {
  if (snapshot.emergencyOff) {
    return { allowed: false, reason: "emergency_off" };
  }

  if (!snapshot.releaseEnabled) {
    return { allowed: false, reason: "release_disabled" };
  }

  if (snapshot.killSwitchState.all_automation === true) {
    return { allowed: false, reason: "kill_switch_active" };
  }

  if (snapshot.policyStatus !== "ready") {
    return { allowed: false, reason: "policy_not_ready" };
  }

  return { allowed: true, reason: "governance_allowed" };
}

async function tryRecordBlockedDecision(
  store: EveGovernanceStore,
  record: EveGovernanceDecisionRecord,
): Promise<void> {
  try {
    await store.recordDecision(record);
  } catch {
    // The action is already blocked. A recorder outage must never turn the
    // blocked result into an exception that a caller could mistake for retryable
    // authorization or use to reach the effect directly.
  }
}

export async function runGovernedEveAction<Value>(input: {
  action: string;
  target?: string;
  store: EveGovernanceStore;
  effect: () => Promise<Value> | Value;
  runId?: string;
  initiatedByProfileId?: string;
  accountableTrigger?: string;
}): Promise<
  | { executed: false; reason: EveGovernanceBlockReason }
  | { executed: true; value: Value }
> {
  const runId = input.runId ?? crypto.randomUUID();
  let snapshot: EveGovernanceSnapshot | null = null;

  try {
    snapshot = await input.store.loadSnapshot();
  } catch {
    // A read failure is indistinguishable from unavailable governance for
    // authorization purposes and therefore fails closed.
  }

  if (!snapshot) {
    await tryRecordBlockedDecision(input.store, {
      id: runId,
      action: input.action,
      target: input.target,
      decision: "blocked",
      reason: "governance_unavailable",
      status: "skipped",
      initiatedByProfileId: input.initiatedByProfileId,
      accountableTrigger: input.accountableTrigger,
    });
    return { executed: false, reason: "governance_unavailable" };
  }

  const evaluation = evaluateEveGovernance(snapshot);
  if (!evaluation.allowed) {
    await tryRecordBlockedDecision(input.store, {
      id: runId,
      action: input.action,
      target: input.target,
      decision: "blocked",
      reason: evaluation.reason,
      status: "skipped",
      stateVersion: snapshot.stateVersion,
      initiatedByProfileId: input.initiatedByProfileId,
      accountableTrigger: input.accountableTrigger,
    });
    return { executed: false, reason: evaluation.reason };
  }

  const startedRecord: EveGovernanceDecisionRecord = {
    id: runId,
    action: input.action,
    target: input.target,
    decision: "allowed",
    reason: "governance_allowed",
    status: "started",
    stateVersion: snapshot.stateVersion,
    initiatedByProfileId: input.initiatedByProfileId,
    accountableTrigger: input.accountableTrigger,
  };

  try {
    await input.store.recordDecision(startedRecord);
  } catch {
    return { executed: false, reason: "decision_record_failed" };
  }

  let value: Value;
  try {
    value = await input.effect();
  } catch (error) {
    await input.store
      .recordDecision({
        ...startedRecord,
        status: "failed",
      })
      .catch(() => undefined);
    throw error;
  }

  await input.store
    .recordDecision({
      ...startedRecord,
      status: "completed",
    })
    .catch(() => undefined);

  return { executed: true, value };
}
