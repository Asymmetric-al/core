import {
  createSessionEveAuditIdentity,
  traceEveAuditEvent,
  type EveAuditStore,
} from "../audit";
import { eveSharedContextResolutionSchema } from "./schema";
import {
  EveSharedContextValidationError,
  prepareEveSharedContextClaim,
} from "./validation";

import type {
  EveSharedContextClaim,
  EveSharedContextResolution,
  EveSharedContextSnapshot,
  EveSharedContextStore,
} from "./types";
import type { EvePolicyConsultResult } from "../approval-budget/types";
import type { EveSessionIdentity } from "../session-ownership/types";
import type { EveSpecialistId } from "../subagent-catalog/types";

type AuthorizeContextAction = (input: {
  action: "resolve" | "write";
  targetKey: string;
}) => Promise<EvePolicyConsultResult>;

function assertAllowed(decision: EvePolicyConsultResult): void {
  if (decision.decision !== "allow") {
    throw new EveSharedContextValidationError(
      "invalid_context_write",
      `Shared-context policy blocked the operation: ${decision.reason}.`,
    );
  }
}

export async function writeEveSharedContext(input: {
  accountableRunId: string;
  auditStore: EveAuditStore;
  authorize: AuthorizeContextAction;
  identity: EveSessionIdentity;
  rootSessionId: string;
  sessionId: string;
  store: EveSharedContextStore;
  write: unknown;
  writerSubagentId: EveSpecialistId;
}): Promise<EveSharedContextClaim> {
  const snapshot = await input.store.loadSnapshot({
    rootSessionId: input.rootSessionId,
    tenantId: input.identity.tenantId,
  });
  let prepared: ReturnType<typeof prepareEveSharedContextClaim>;
  try {
    prepared = prepareEveSharedContextClaim({
      accountableRunId: input.accountableRunId,
      existingClaims: snapshot.claims,
      rootSessionId: input.rootSessionId,
      sessionId: input.sessionId,
      tenantId: input.identity.tenantId,
      write: input.write,
      writerSubagentId: input.writerSubagentId,
    });
  } catch (error) {
    await traceEveAuditEvent({
      store: input.auditStore,
      event: {
        runId: input.accountableRunId,
        identity: createSessionEveAuditIdentity(input.identity),
        policy: { id: "eve-shared-context-v1", status: "rejected" },
        action: "shared_context.write",
        target: `run:${input.rootSessionId}`,
        result: "blocked",
        subagentName: input.writerSubagentId,
        modelRole: `specialist.${input.writerSubagentId}`,
        evidence: "Shared-context input rejected before persistence.",
        change: "No shared-context value was persisted.",
        decision: {
          rationale:
            error instanceof EveSharedContextValidationError
              ? error.code
              : "invalid_context_write",
          risk: "content omitted",
        },
      },
    });
    throw error;
  }

  const decision = await input.authorize({
    action: "write",
    targetKey: `shared-context:${input.rootSessionId}:${prepared.claim.fieldPath}`,
  });
  assertAllowed(decision);
  await input.store.appendClaim(prepared);
  await traceEveAuditEvent({
    store: input.auditStore,
    event: {
      runId: input.accountableRunId,
      identity: createSessionEveAuditIdentity(input.identity),
      policy: { id: decision.actionId, status: decision.decision },
      action: prepared.conflict
        ? "shared_context.conflict_created"
        : "shared_context.write",
      target: `claim:${prepared.claim.id}`,
      result: "succeeded",
      subagentName: input.writerSubagentId,
      modelRole: `specialist.${input.writerSubagentId}`,
      evidence: prepared.claim.evidence.map((item) => item.reference),
      change: {
        category: prepared.claim.category,
        fieldPath: prepared.claim.fieldPath,
        relationship: prepared.claim.relationship,
      },
      decision: {
        rationale: "Schema, content, identity, and policy checks passed.",
        risk: prepared.claim.risk,
      },
    },
  });
  return prepared.claim;
}

export async function readEveSharedContext(input: {
  identity: EveSessionIdentity;
  rootSessionId: string;
  store: EveSharedContextStore;
}): Promise<EveSharedContextSnapshot> {
  return input.store.loadSnapshot({
    rootSessionId: input.rootSessionId,
    tenantId: input.identity.tenantId,
  });
}

export async function resolveEveSharedContextConflict(input: {
  accountableRunId: string;
  auditStore: EveAuditStore;
  authorize: AuthorizeContextAction;
  identity: EveSessionIdentity;
  resolution: unknown;
  store: EveSharedContextStore;
}): Promise<EveSharedContextResolution> {
  const resolutionInput = eveSharedContextResolutionSchema.parse(
    input.resolution,
  );
  const conflict = await input.store.loadConflict({
    conflictId: resolutionInput.conflictId,
    tenantId: input.identity.tenantId,
  });
  if (!conflict || conflict.resolution) {
    throw new EveSharedContextValidationError(
      "invalid_context_write",
      "The disagreement is missing, outside the verified tenant, or already resolved.",
    );
  }
  if (
    resolutionInput.selectedClaimIds.some(
      (claimId) => !conflict.claimIds.includes(claimId),
    )
  ) {
    throw new EveSharedContextValidationError(
      "invalid_context_write",
      "A resolution may select only claims preserved by the disagreement.",
    );
  }

  const decision = await input.authorize({
    action: "resolve",
    targetKey: `shared-context-conflict:${conflict.id}`,
  });
  assertAllowed(decision);
  const resolution: EveSharedContextResolution = {
    ...resolutionInput,
    id: crypto.randomUUID(),
    tenantId: input.identity.tenantId,
    resolverActorId: input.identity.actorId,
    createdAt: new Date().toISOString(),
  };
  await input.store.appendResolution(resolution);
  await traceEveAuditEvent({
    store: input.auditStore,
    event: {
      runId: input.accountableRunId,
      identity: createSessionEveAuditIdentity(input.identity),
      policy: { id: resolution.policyId, status: decision.decision },
      action: "shared_context.conflict_resolved",
      target: `conflict:${conflict.id}`,
      result: "succeeded",
      evidence: resolution.evidence.map((item) => item.reference),
      change: {
        selectedClaimIds: resolution.selectedClaimIds,
        outcome: resolution.outcome,
      },
      decision: {
        rationale: "A governed append-only resolution was recorded.",
        risk: conflict.risk,
        reversalOrFollowUp: "Original competing claims remain immutable.",
      },
    },
  });
  return resolution;
}
