import { createGithubBotEveAuditIdentity } from "@asym/api/eve/audit";
import { executeEveGithubOperation } from "@asym/api/eve/github-operator";
import { publishEveGithubMonitorComment } from "@asym/api/eve/github-review";

import { eveGithubRequest } from "../github/client";
import { performEveGithubOperation } from "../github/operator";

import type { EvePolicyConsultResult } from "@asym/api/eve/approval-budget";
import type { EveAuditStore } from "@asym/api/eve/audit";
import type {
  EveEngineeringFinding,
  EveEngineeringMonitorConfig,
} from "@asym/api/eve/engineering-monitors";
import type { EveGovernanceStore } from "@asym/api/eve/governance";

const severityRank = { low: 0, medium: 1, high: 2, critical: 3 } as const;

export function createEveMonitorGithubReader(installationId: number) {
  return async <T>(path: string): Promise<T> =>
    (await eveGithubRequest<T>({ installationId, method: "GET", path })).body;
}

function stableRunId(dedupeKey: string): string {
  const hex = dedupeKey.slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function pullRequestNumber(finding: EveEngineeringFinding): number | null {
  const match = /^pull-request:(\d+)$/u.exec(finding.targetId);
  return match?.[1] ? Number(match[1]) : null;
}

async function postDeduplicatedComment(input: {
  body: string;
  dedupeKey: string;
  headSha: string;
  installationId: number;
  pullRequestNumber: number;
}) {
  const root = `/repos/Asymmetric-al/core`;
  const pull = await eveGithubRequest<{ head?: { sha?: string } }>({
    installationId: input.installationId,
    method: "GET",
    path: `${root}/pulls/${input.pullRequestNumber}`,
  });
  if (pull.body.head?.sha !== input.headSha) {
    throw new Error("Engineering monitor comment target revision is stale.");
  }
  const marker = `<!-- eve:engineering-monitor:${input.dedupeKey} -->`;
  const comments = await eveGithubRequest<
    Array<{ body?: string; html_url?: string; id?: number }>
  >({
    installationId: input.installationId,
    method: "GET",
    path: `${root}/issues/${input.pullRequestNumber}/comments?per_page=100`,
  });
  const existing = comments.body.find((comment) =>
    comment.body?.includes(marker),
  );
  if (existing?.id) {
    return { resourceId: String(existing.id), resourceUrl: existing.html_url };
  }
  const created = await eveGithubRequest<{ html_url?: string; id: number }>({
    body: { body: input.body },
    installationId: input.installationId,
    method: "POST",
    path: `${root}/issues/${input.pullRequestNumber}/comments`,
  });
  return {
    resourceId: String(created.body.id),
    resourceUrl: created.body.html_url,
  };
}

export async function runEveEngineeringMonitorFollowup(input: {
  auditStore: EveAuditStore;
  config: EveEngineeringMonitorConfig;
  finding: EveEngineeringFinding;
  governanceStore: EveGovernanceStore;
  installationId: number;
  policyConsult: (
    actionId: "engineering.github_operation.write",
    targetKey: string,
  ) => Promise<EvePolicyConsultResult>;
}) {
  const destination = input.config.destinationPolicy;
  if (
    destination.kind === "none" ||
    severityRank[input.finding.severity] <
      severityRank[destination.minimumSeverity]
  ) {
    return {
      executed: false,
      reason: "destination_policy_suppressed",
    } as const;
  }
  const identity = createGithubBotEveAuditIdentity({
    botId:
      process.env.EVE_GITHUB_APP_SLUG?.trim() ||
      process.env.GITHUB_APP_SLUG?.trim() ||
      "eve-asymmetric[bot]",
    initiatorId: input.config.id,
    initiatorType: "schedule",
    tenantId: input.config.tenantId,
  });
  const runId = stableRunId(input.finding.dedupeKey);
  const accountableTrigger = `schedule:${input.config.id}`;
  if (destination.kind === "comment") {
    const number = pullRequestNumber(input.finding);
    if (!number)
      return { executed: false, reason: "comment_target_is_not_pr" } as const;
    return publishEveGithubMonitorComment(
      {
        accountableTrigger,
        body: `Eve observed a governed engineering-health finding (${input.finding.signalType}, ${input.finding.severity}).\n\n${input.finding.decisionSummary}`,
        dedupeKey: input.finding.dedupeKey,
        headSha: input.finding.targetRevision,
        identity,
        installationId: input.installationId,
        owner: "Asymmetric-al",
        pullRequestNumber: number,
        repo: "core",
        runId,
      },
      {
        auditStore: input.auditStore,
        governanceStore: input.governanceStore,
        consultPolicy: ({ targetKey }) =>
          input.policyConsult("engineering.github_operation.write", targetKey),
        postComment: (comment) =>
          postDeduplicatedComment({
            body: comment.body,
            dedupeKey: comment.dedupeKey,
            headSha: comment.headSha,
            installationId: comment.installationId,
            pullRequestNumber: comment.pullRequestNumber,
          }),
      },
    );
  }
  return executeEveGithubOperation(
    {
      accountableTrigger,
      identity,
      installationId: input.installationId,
      owner: "Asymmetric-al",
      repo: "core",
      request: {
        operation: "create_issue",
        title: `[Eve monitor] ${input.finding.signalType}: ${input.finding.targetId}`,
        body: `${input.finding.decisionSummary}\n\nSeverity: ${input.finding.severity}\nEvidence: ${String(input.finding.safeEvidence.safeUrl ?? "https://github.com/Asymmetric-al/core")}`,
      },
      runId,
    },
    {
      auditStore: input.auditStore,
      governanceStore: input.governanceStore,
      consultPolicy: ({ targetKey }) =>
        input.policyConsult("engineering.github_operation.write", targetKey),
      performOperation: performEveGithubOperation,
    },
  );
}
