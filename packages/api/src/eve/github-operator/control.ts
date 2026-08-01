import { traceEveAuditEvent } from "../audit";
import { runGovernedEveAction } from "../governance";
import {
  eveGithubOperationTargetKey,
  prepareEveGithubOperation,
} from "./guardrails";

import type {
  EveGithubOperatorDependencies,
  EveGithubOperatorInput,
  EveGithubOperatorResult,
} from "./types";

export async function executeEveGithubOperation(
  rawInput: EveGithubOperatorInput,
  dependencies: EveGithubOperatorDependencies,
): Promise<EveGithubOperatorResult> {
  const input = prepareEveGithubOperation(rawInput);
  const { request } = input;
  const target = `${input.owner}/${input.repo}:${request.operation}`;
  const governed = await runGovernedEveAction({
    accountableTrigger: input.accountableTrigger,
    action: `github.operator.${request.operation}`,
    domain: "github_actions",
    initiatedByProfileId: input.actorProfileId,
    runId: input.runId,
    store: dependencies.governanceStore,
    target,
    async effect() {
      const approvalId =
        request.operation === "push_safe_fix" ? request.approvalId : undefined;
      const policy = await dependencies.consultPolicy({
        approvalId,
        identity: input.identity,
        targetKey: eveGithubOperationTargetKey(input),
      });
      const auditBase = {
        action: `github.operator.${request.operation}`,
        change: {
          operation: request.operation,
          fileCount:
            request.operation === "push_safe_fix"
              ? request.changedFiles.length
              : undefined,
        },
        decision: {
          rationale: policy.reason,
          risk: "External GitHub repository mutation",
          reversalOrFollowUp:
            "Revert the GitHub resource and disable GitHub actions in Mission Control.",
        },
        evidence: {
          issueNumber: "issueNumber" in request ? request.issueNumber : null,
          issueFirst:
            request.operation === "create_issue" || "issueNumber" in request,
          installationId: input.installationId,
        },
        identity: input.identity,
        modelRole: "engineering",
        policy: { id: policy.actionId, status: policy.decision },
        runId: input.runId,
        target,
        toolName: "github_operator",
      } as const;

      if (policy.decision !== "allow") {
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...auditBase, result: "blocked" },
        });
        return {
          executed: false,
          operation: request.operation,
          reason: policy.reason,
        };
      }

      await traceEveAuditEvent({
        store: dependencies.auditStore,
        event: { ...auditBase, result: "started" },
      });
      try {
        const resource = await dependencies.performOperation(input);
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...auditBase, result: "succeeded" },
        });
        return { executed: true, operation: request.operation, ...resource };
      } catch (error) {
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...auditBase, result: "failed" },
        }).catch(() => undefined);
        throw error;
      }
    },
  });

  return governed.executed
    ? governed.value
    : {
        executed: false,
        operation: request.operation,
        reason: governed.reason,
      };
}
