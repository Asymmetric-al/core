import { createHash } from "node:crypto";

import { traceEveAuditEvent } from "../audit";
import { runGovernedEveAction } from "../governance";
import { prepareEveGithubReview } from "./review";

import type {
  EveGithubReviewPublicationDependencies,
  EveGithubReviewPublicationInput,
  EveGithubReviewPublicationResult,
} from "./types";

function publicationTarget(input: EveGithubReviewPublicationInput): string {
  return `${input.owner}/${input.repo}#${input.pullRequestNumber}@${input.headSha}`;
}

function policyTargetKey(input: EveGithubReviewPublicationInput): string {
  const fingerprint = createHash("sha256")
    .update(publicationTarget(input))
    .digest("hex")
    .slice(0, 32);
  return `github_review:${fingerprint}`;
}

export async function publishEveGithubReview(
  input: EveGithubReviewPublicationInput,
  dependencies: EveGithubReviewPublicationDependencies,
): Promise<EveGithubReviewPublicationResult> {
  const preparedReview = prepareEveGithubReview({
    accountableLogin: input.accountableLogin,
    changedPaths: input.changedPaths,
    rawOutput: input.rawOutput,
  });
  const prepared = {
    ...preparedReview,
    body: `${preparedReview.body}\n<!-- eve:run:${input.runId} -->`,
  };
  const target = publicationTarget(input);
  const governed = await runGovernedEveAction({
    accountableTrigger: input.accountableTrigger,
    action: "github.review.publish",
    domain: "github_actions",
    initiatedByProfileId: input.actorProfileId,
    runId: input.runId,
    store: dependencies.governanceStore,
    target,
    async effect() {
      const policy = await dependencies.consultPolicy({
        identity: input.identity,
        targetKey: policyTargetKey(input),
      });
      if (policy.decision !== "allow") {
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: {
            action: "github.review.publish",
            change: { published: false },
            decision: {
              rationale: policy.reason,
              risk: "External GitHub review publication",
              reversalOrFollowUp:
                "Review approval and budget policy in Mission Control.",
            },
            evidence: {
              changedFileCount: input.changedPaths.length,
              headSha: input.headSha,
            },
            identity: input.identity,
            modelRole: "review",
            policy: {
              id: policy.actionId,
              status: policy.decision,
            },
            result: "blocked",
            runId: input.runId,
            target,
            toolName: "github.pull_request_review",
          },
        });
        return { published: false, reason: policy.reason } as const;
      }

      const reviewFingerprint = createHash("sha256")
        .update(prepared.body)
        .digest("hex");
      const auditBase = {
        action: "github.review.publish",
        change: {
          findingCount: prepared.comments.length,
          reviewFingerprint,
        },
        decision: {
          rationale: policy.reason,
          risk: "External GitHub review publication",
          reversalOrFollowUp:
            "Dismiss the bot review and disable GitHub actions.",
        },
        evidence: {
          changedFileCount: input.changedPaths.length,
          headSha: input.headSha,
          protectedAreaRules: prepared.protectedAreas.flatMap(
            (area) => area.rules,
          ),
        },
        identity: input.identity,
        modelRole: "review",
        policy: { id: policy.actionId, status: policy.decision },
        runId: input.runId,
        target,
        toolName: "github.pull_request_review",
      } as const;

      await traceEveAuditEvent({
        store: dependencies.auditStore,
        event: { ...auditBase, result: "started" },
      });
      try {
        await dependencies.postReview(prepared);
      } catch (error) {
        await traceEveAuditEvent({
          store: dependencies.auditStore,
          event: { ...auditBase, result: "failed" },
        }).catch(() => undefined);
        throw error;
      }
      await traceEveAuditEvent({
        store: dependencies.auditStore,
        event: { ...auditBase, result: "succeeded" },
      });

      return {
        published: true,
        findingCount: prepared.comments.length,
        protectedAreaCount: prepared.protectedAreas.length,
      } as const;
    },
  });

  if (!governed.executed) {
    return { published: false, reason: governed.reason };
  }
  return governed.value;
}

export async function authorizeEveGithubReviewTrigger(input: {
  accountableTrigger: string;
  actorProfileId: string;
  governanceStore: EveGithubReviewPublicationDependencies["governanceStore"];
  runId: string;
  target: string;
}): Promise<boolean> {
  const result = await runGovernedEveAction({
    accountableTrigger: input.accountableTrigger,
    action: "github.review.trigger",
    domain: "github_actions",
    initiatedByProfileId: input.actorProfileId,
    runId: input.runId,
    store: input.governanceStore,
    target: input.target,
    effect: () => true,
  });
  return result.executed;
}
