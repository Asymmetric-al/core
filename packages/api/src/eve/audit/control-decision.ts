import { traceEveAuditEvent } from "./record";
import { createEveAuditStore } from "./store";

import type {
  EveAuditDecisionSummaryInput,
  EveAuditEventRecord,
  EveAuditPolicySnapshot,
  EveAuditResult,
  EveVerifiedAuditIdentity,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

export interface EveControlDecisionDebug {
  source: string;
  [key: string]: unknown;
}

export interface EveControlDecisionInput {
  supabaseAdmin: AdminSupabaseClient;
  identity: EveVerifiedAuditIdentity;
  policy: EveAuditPolicySnapshot;
  action: string;
  target?: string;
  result: EveAuditResult;
  evidence: unknown;
  decision: EveAuditDecisionSummaryInput;
  debug: EveControlDecisionDebug;
}

/**
 * Audit an app-side control-plane decision that changes no operational
 * state: modelRole is pinned to "not_used" and change to
 * { stateChanged: false }. Real state transitions audit atomically inside
 * their security-definer RPC and must not go through this helper. Store
 * failures propagate: when the record is part of the operation's contract,
 * failure to persist it is an operation failure.
 */
export async function traceEveControlDecision(
  input: EveControlDecisionInput,
): Promise<EveAuditEventRecord> {
  return traceEveAuditEvent({
    store: createEveAuditStore(input.supabaseAdmin),
    event: {
      identity: input.identity,
      policy: input.policy,
      action: input.action,
      target: input.target,
      result: input.result,
      modelRole: "not_used",
      evidence: input.evidence,
      change: { stateChanged: false },
      decision: input.decision,
      debug: input.debug,
    },
  });
}

/**
 * Record an already-made refusal without ever masking it: the result is
 * pinned to "blocked" and store failures are swallowed. Await this, then
 * throw the fail-closed error. A blocked event whose persistence is itself
 * mandatory must call traceEveControlDecision({ result: "blocked" }).
 */
export async function traceBlockedEveControlDecision(
  input: Omit<EveControlDecisionInput, "result">,
): Promise<void> {
  await traceEveControlDecision({ ...input, result: "blocked" }).catch(
    () => undefined,
  );
}
