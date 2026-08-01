import { executeEvePolicyTracerAsIdentity } from "@asym/api/eve/approval-budget";
import { createSessionEveAuditIdentity } from "@asym/api/eve/audit";
import { loadEveGovernanceSnapshot } from "@asym/api/eve/governance";
import {
  loadActiveEveModelBudgetOverrides,
  loadEveModelPolicies,
  resolveEveModelRole,
} from "@asym/api/eve/model-policy";
import { EVE_SPECIALIST_CATALOG } from "@asym/api/eve/subagent-catalog";

import { prepareEveRuntimeActivation } from "../governance-boundary";
import {
  claimEveSpecialistSession,
  resolveEveSpecialistIdentity,
} from "./identity";

import type { EveSessionAuthSnapshot } from "@asym/api/eve/session-ownership";
import type { EveSpecialistId } from "@asym/api/eve/subagent-catalog";

export async function resolveEveSpecialistModel(input: {
  auth: EveSessionAuthSnapshot | null;
  sessionId: string;
  specialistId: EveSpecialistId;
}): Promise<string | null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    return null;
  }
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) return null;

  const identity = resolveEveSpecialistIdentity(input.auth);
  await claimEveSpecialistSession({
    identity,
    sessionId: input.sessionId,
    supabaseAdmin: admin.client,
  });
  const [governance, policies, overrides] = await Promise.all([
    loadEveGovernanceSnapshot({ supabaseAdmin: admin.client }),
    loadEveModelPolicies({ supabaseAdmin: admin.client, limit: 30 }),
    loadActiveEveModelBudgetOverrides({ supabaseAdmin: admin.client }),
  ]);
  const activePolicy = policies.find((policy) => policy.status === "active");
  if (!governance || !activePolicy) return null;
  if (
    governance.source !== "persisted" ||
    !governance.releaseEnabled ||
    governance.emergencyOff ||
    governance.policyStatus !== "ready" ||
    governance.killSwitchState.all_automation ||
    governance.killSwitchState.active_runs
  ) {
    return null;
  }

  const specialist = EVE_SPECIALIST_CATALOG[input.specialistId];
  const modelResolution = resolveEveModelRole({
    governance,
    overrides,
    policy: activePolicy,
    requestedRole: specialist.modelRole,
    subagentName: specialist.id,
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      requestsInCurrentMinute: 0,
      usdMicros: 0,
    },
  });
  if (
    !modelResolution.allowed ||
    modelResolution.evalGate.suiteId !== specialist.evalGate.suiteId ||
    modelResolution.evalGate.minimumScoreBps <
      specialist.evalGate.minimumScoreBps
  ) {
    return null;
  }
  const approvalBudget = await executeEvePolicyTracerAsIdentity({
    actionId: "engineering.subagent.delegate",
    identity: createSessionEveAuditIdentity(identity),
    supabaseAdmin: admin.client,
    targetKey: `subagent:${input.specialistId}:session:${input.sessionId}`,
  });
  const activation = prepareEveRuntimeActivation({
    approvalBudget,
    governance,
    modelResolution,
  });
  return activation.enabled ? activation.model : null;
}
