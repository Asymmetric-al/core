import { classifyEveAdminMemoryExclusions } from "../admin-memory";
import { traceEveAuditEvent } from "../audit";
import { runGovernedEveAction } from "../governance";

import type { EvePolicyConsultResult } from "../approval-budget/types";
import type { EveAuditStore, EveVerifiedAuditIdentity } from "../audit/types";
import type { EveGovernanceStore } from "../governance/types";

export interface EveGithubMonitorCommentInput {
  accountableTrigger: string;
  body: string;
  dedupeKey: string;
  headSha: string;
  identity: EveVerifiedAuditIdentity;
  installationId: number;
  owner: "Asymmetric-al";
  pullRequestNumber: number;
  repo: "core";
  runId: string;
}

export interface EveGithubMonitorCommentDependencies {
  auditStore: EveAuditStore;
  consultPolicy(input: {
    identity: EveVerifiedAuditIdentity;
    targetKey: string;
  }): Promise<EvePolicyConsultResult>;
  governanceStore: EveGovernanceStore;
  postComment(input: EveGithubMonitorCommentInput & { body: string }): Promise<{
    resourceId?: string;
    resourceUrl?: string;
  }>;
}

function prepareBody(input: EveGithubMonitorCommentInput): string {
  const body = input.body.trim();
  if (!body || body.length > 4_000) {
    throw new Error("Engineering monitor comments require 1-4000 characters.");
  }
  if (classifyEveAdminMemoryExclusions(body).length > 0) {
    throw new Error("Engineering monitor comment crossed a data boundary.");
  }
  if (!/^[0-9a-f]{64}$/u.test(input.dedupeKey)) {
    throw new Error("Engineering monitor comment dedupe key is invalid.");
  }
  return `${body}\n\n<!-- eve:engineering-monitor:${input.dedupeKey} -->`;
}

export async function publishEveGithubMonitorComment(
  input: EveGithubMonitorCommentInput,
  dependencies: EveGithubMonitorCommentDependencies,
) {
  if (
    input.owner !== "Asymmetric-al" ||
    input.repo !== "core" ||
    !Number.isSafeInteger(input.installationId) ||
    input.installationId <= 0 ||
    !Number.isSafeInteger(input.pullRequestNumber) ||
    input.pullRequestNumber <= 0
  ) {
    throw new Error("Engineering monitor comments are restricted to Core PRs.");
  }
  const body = prepareBody(input);
  const target = `${input.owner}/${input.repo}#${input.pullRequestNumber}@${input.headSha}`;
  const governed = await runGovernedEveAction({
    accountableTrigger: input.accountableTrigger,
    action: "github.review.monitor_comment",
    domain: "github_actions",
    runId: input.runId,
    store: dependencies.governanceStore,
    target,
    async effect() {
      const policy = await dependencies.consultPolicy({
        identity: input.identity,
        targetKey: `engineering_monitor_comment:${input.dedupeKey}`,
      });
      const auditBase = {
        action: "github.review.monitor_comment",
        change: { commentRequested: true },
        decision: {
          rationale: policy.reason,
          risk: "External GitHub engineering-health comment",
          reversalOrFollowUp:
            "Delete the bot comment and pause the originating monitor.",
        },
        evidence: {
          headSha: input.headSha,
          pullRequestNumber: input.pullRequestNumber,
        },
        identity: input.identity,
        modelRole: "not_used",
        policy: { id: policy.actionId, status: policy.decision },
        runId: input.runId,
        target,
        toolName: "github.pull_request_comment",
      } as const;
      if (policy.decision !== "allow") {
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...auditBase, result: "blocked" },
        });
        return { published: false, reason: policy.reason } as const;
      }
      await traceEveAuditEvent({
        store: dependencies.auditStore,
        event: { ...auditBase, result: "started" },
      });
      try {
        const resource = await dependencies.postComment({ ...input, body });
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...auditBase, result: "succeeded" },
        });
        return { published: true, ...resource } as const;
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
    : { published: false, reason: governed.reason };
}
