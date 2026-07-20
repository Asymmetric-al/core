import { createHash } from "node:crypto";

import { traceEveAuditEvent } from "../audit";
import { runGovernedEveAction } from "../governance";
import { evaluateEveStrictAutoMerge } from "./policy";

import type {
  EveStrictAutoMergeDependencies,
  EveStrictAutoMergeEvidence,
  EveStrictAutoMergeInput,
  EveStrictAutoMergeResult,
} from "./types";

const SHA_PATTERN = /^[0-9a-f]{40}$/u;

function validateInput(input: EveStrictAutoMergeInput): void {
  if (input.owner !== "Asymmetric-al" || input.repo !== "core") {
    throw new Error(
      "Eve strict auto-merge is restricted to Asymmetric-al/core.",
    );
  }
  if (
    !Number.isSafeInteger(input.installationId) ||
    input.installationId <= 0
  ) {
    throw new Error("Eve strict auto-merge requires a GitHub installation ID.");
  }
  if (
    !Number.isSafeInteger(input.pullRequestNumber) ||
    input.pullRequestNumber <= 0
  ) {
    throw new Error("Eve strict auto-merge requires a pull-request number.");
  }
  if (!SHA_PATTERN.test(input.expectedHeadSha)) {
    throw new Error("Eve strict auto-merge requires a full expected head SHA.");
  }
}

export function eveStrictAutoMergeTargetKey(
  input: EveStrictAutoMergeInput,
): string {
  const fingerprint = createHash("sha256")
    .update(
      `${input.owner}/${input.repo}#${input.pullRequestNumber}@${input.expectedHeadSha}`,
    )
    .digest("hex")
    .slice(0, 32);
  return `github_merge:${fingerprint}`;
}

function target(input: EveStrictAutoMergeInput): string {
  return `${input.owner}/${input.repo}#${input.pullRequestNumber}@${input.expectedHeadSha}`;
}

function auditBase(input: {
  evidence?: EveStrictAutoMergeEvidence;
  mergeInput: EveStrictAutoMergeInput;
  policyId: string;
  policyStatus: string;
  rationale: string;
}) {
  return {
    action: "github.strict_auto_merge",
    change: {
      merged: false,
      pullRequestNumber: input.mergeInput.pullRequestNumber,
    },
    decision: {
      rationale: input.rationale,
      risk: "Landing code on the protected develop branch",
      reversalOrFollowUp:
        "Revert the merge commit or disable GitHub actions in Mission Control.",
    },
    evidence: {
      headSha: input.mergeInput.expectedHeadSha,
      protectedAreaRules:
        input.evidence?.protectedAreas.flatMap((area) => area.rules) ?? [],
      requiredCheckCount:
        input.evidence?.protection?.requiredChecks.length ?? 0,
      requiredReviewCount:
        input.evidence?.protection?.requiredApprovingReviewCount ?? 0,
    },
    identity: input.mergeInput.identity,
    modelRole: "engineering",
    policy: { id: input.policyId, status: input.policyStatus },
    runId: input.mergeInput.runId,
    target: target(input.mergeInput),
    toolName: "github_strict_auto_merge",
  } as const;
}

async function recordBlockedGovernance(input: {
  dependencies: EveStrictAutoMergeDependencies;
  mergeInput: EveStrictAutoMergeInput;
  reason: string;
}): Promise<void> {
  await traceEveAuditEvent({
    store: input.dependencies.auditStore,
    event: {
      ...auditBase({
        mergeInput: input.mergeInput,
        policyId: "eve-governance-kernel",
        policyStatus: "blocked",
        rationale: input.reason,
      }),
      result: "blocked",
    },
  }).catch(() => undefined);
}

async function escalateAndAudit(input: {
  audit: ReturnType<typeof auditBase>;
  dependencies: EveStrictAutoMergeDependencies;
  evidence: EveStrictAutoMergeEvidence;
  reasons: readonly string[];
}): Promise<EveStrictAutoMergeResult> {
  try {
    await input.dependencies.escalate({
      evidence: input.evidence,
      reasons: input.reasons,
    });
  } catch (error) {
    await traceEveAuditEvent({
      store: input.dependencies.auditStore,
      event: { ...input.audit, result: "failed" },
    }).catch(() => undefined);
    throw error;
  }
  await traceEveAuditEvent({
    store: input.dependencies.auditStore,
    event: { ...input.audit, result: "blocked" },
  });
  return {
    merged: false,
    pullRequestNumber: input.evidence.pullRequestNumber,
    reasons: [...input.reasons],
    resourceUrl: input.evidence.pullRequestUrl,
  };
}

export async function executeEveStrictAutoMerge(
  input: EveStrictAutoMergeInput,
  dependencies: EveStrictAutoMergeDependencies,
): Promise<EveStrictAutoMergeResult> {
  validateInput(input);
  const governed = await runGovernedEveAction({
    accountableTrigger: input.accountableTrigger,
    action: "github.strict_auto_merge",
    domain: "github_actions",
    initiatedByProfileId: input.actorProfileId,
    runId: input.runId,
    store: dependencies.governanceStore,
    target: target(input),
    async effect() {
      const policy = await dependencies.consultPolicy({
        identity: input.identity,
        targetKey: eveStrictAutoMergeTargetKey(input),
      });
      const base = auditBase({
        mergeInput: input,
        policyId: policy.actionId,
        policyStatus: policy.decision,
        rationale: policy.reason,
      });
      if (policy.decision !== "allow") {
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...base, result: "blocked" },
        });
        return {
          merged: false,
          pullRequestNumber: input.pullRequestNumber,
          reasons: [policy.reason],
        };
      }

      const evidence = await dependencies.inspect(input);
      const decision = evaluateEveStrictAutoMerge(evidence);
      const evidenceAudit = auditBase({
        evidence,
        mergeInput: input,
        policyId: policy.actionId,
        policyStatus: policy.decision,
        rationale:
          decision.outcome === "merge"
            ? "strict_safe_policy_passed"
            : decision.outcome,
      });
      if (decision.outcome === "already_merged") {
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...evidenceAudit, result: "skipped" },
        });
        return {
          alreadyMerged: true,
          merged: true,
          pullRequestNumber: input.pullRequestNumber,
          reasons: [],
          resourceUrl: evidence.pullRequestUrl,
        };
      }
      if (decision.outcome === "escalate") {
        return escalateAndAudit({
          audit: {
            ...evidenceAudit,
            decision: {
              ...evidenceAudit.decision,
              rationale: decision.reasons.join(","),
            },
          },
          dependencies,
          evidence,
          reasons: decision.reasons,
        });
      }

      await traceEveAuditEvent({
        store: dependencies.auditStore,
        event: { ...evidenceAudit, result: "started" },
      });
      const merged = await dependencies.merge({ evidence, request: input });
      if (!merged.merged) {
        return escalateAndAudit({
          audit: {
            ...evidenceAudit,
            decision: {
              ...evidenceAudit.decision,
              rationale: merged.message ?? "merge_api_rejected",
            },
          },
          dependencies,
          evidence,
          reasons: ["merge_api_rejected"],
        });
      }
      await traceEveAuditEvent({
        store: dependencies.auditStore,
        event: {
          ...evidenceAudit,
          change: {
            merged: true,
            pullRequestNumber: input.pullRequestNumber,
            resourceId: merged.resourceId,
          },
          result: "succeeded",
        },
      });
      return {
        merged: true,
        pullRequestNumber: input.pullRequestNumber,
        reasons: [],
        resourceId: merged.resourceId,
        resourceUrl: merged.resourceUrl ?? evidence.pullRequestUrl,
      };
    },
  });

  if (!governed.executed) {
    await recordBlockedGovernance({
      dependencies,
      mergeInput: input,
      reason: governed.reason,
    });
    return {
      merged: false,
      pullRequestNumber: input.pullRequestNumber,
      reasons: [governed.reason],
    };
  }
  return governed.value;
}

export async function authorizeEveStrictAutoMergeTrigger(input: {
  accountableTrigger: string;
  actorProfileId: string;
  governanceStore: EveStrictAutoMergeDependencies["governanceStore"];
  runId: string;
  target: string;
}): Promise<boolean> {
  const result = await runGovernedEveAction({
    accountableTrigger: input.accountableTrigger,
    action: "github.strict_auto_merge.trigger",
    domain: "github_actions",
    initiatedByProfileId: input.actorProfileId,
    runId: input.runId,
    store: input.governanceStore,
    target: input.target,
    effect: () => true,
  });
  return result.executed;
}
