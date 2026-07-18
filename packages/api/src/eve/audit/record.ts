import {
  getEveAuditRedactionVersion,
  redactEveAuditValue,
  summarizeEveAuditValue,
} from "./redaction";

import type {
  EveAuditEventInput,
  EveAuditEventRecord,
  EveAuditStore,
} from "./types";

function buildDecisionSummary(input: EveAuditEventInput): string {
  const clauses = [
    `${input.action} ${input.result}.`,
    `Rationale: ${summarizeEveAuditValue(input.decision.rationale)}.`,
    `Policy: ${summarizeEveAuditValue(input.policy.id)} (${summarizeEveAuditValue(input.policy.status)}).`,
  ];

  if (input.decision.risk) {
    clauses.push(`Risk: ${summarizeEveAuditValue(input.decision.risk)}.`);
  }
  if (input.decision.approval) {
    clauses.push(
      `Approval: ${summarizeEveAuditValue(input.decision.approval)}.`,
    );
  }
  if (input.decision.reversalOrFollowUp) {
    clauses.push(
      `Follow-up: ${summarizeEveAuditValue(input.decision.reversalOrFollowUp)}.`,
    );
  }

  return clauses.join(" ");
}

export function buildEveAuditEvent(
  input: EveAuditEventInput,
  now = new Date(),
): EveAuditEventRecord {
  const identity = input.identity;
  const debugMetadata = redactEveAuditValue(input.debug ?? {});

  return {
    id: input.id ?? crypto.randomUUID(),
    runId: input.runId,
    tenantId: identity.tenantId,
    actorId: identity.actorId,
    actorProfileId: identity.actorProfileId,
    actorRole: identity.actorRole,
    identityMode: identity.identityMode,
    initiatorType: identity.initiatorType,
    initiatorId: identity.initiatorId,
    policyId: summarizeEveAuditValue(input.policy.id),
    policyStatus: summarizeEveAuditValue(input.policy.status),
    governanceStateVersion: input.policy.governanceStateVersion,
    action: summarizeEveAuditValue(input.action),
    target: input.target ? summarizeEveAuditValue(input.target) : undefined,
    result: input.result,
    toolName: input.toolName
      ? summarizeEveAuditValue(input.toolName)
      : undefined,
    subagentName: input.subagentName
      ? summarizeEveAuditValue(input.subagentName)
      : undefined,
    modelRole: input.modelRole
      ? summarizeEveAuditValue(input.modelRole)
      : "not_used",
    evidenceSummary: summarizeEveAuditValue(input.evidence),
    changeSummary: summarizeEveAuditValue(input.change),
    decisionSummary: buildDecisionSummary(input),
    debugMetadata:
      typeof debugMetadata === "object" &&
      debugMetadata !== null &&
      !Array.isArray(debugMetadata)
        ? (debugMetadata as Record<string, unknown>)
        : {},
    redactionVersion: getEveAuditRedactionVersion(),
    createdAt: now.toISOString(),
  };
}

export async function traceEveAuditEvent(input: {
  store: EveAuditStore;
  event: EveAuditEventInput;
}): Promise<EveAuditEventRecord> {
  const record = buildEveAuditEvent(input.event);
  await input.store.append(record);
  return record;
}
