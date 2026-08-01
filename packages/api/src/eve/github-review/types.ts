import type { EvePolicyConsultResult } from "../approval-budget/types";
import type { EveAuditStore, EveVerifiedAuditIdentity } from "../audit/types";
import type { EveGovernanceStore } from "../governance/types";

export type EveGithubFindingSeverity = "blocker" | "high" | "medium" | "low";

export interface EveGithubInlineFinding {
  body: string;
  line: number;
  path: string;
  severity: EveGithubFindingSeverity;
  side: "LEFT" | "RIGHT";
}

export interface EveGithubReviewOutput {
  findings: EveGithubInlineFinding[];
  summary: string;
}

export interface EveGithubProtectedArea {
  path: string;
  rules: string[];
}

export interface EveGithubPreparedReview {
  body: string;
  comments: Array<{
    body: string;
    line: number;
    path: string;
    side: "LEFT" | "RIGHT";
  }>;
  event: "COMMENT";
  protectedAreas: EveGithubProtectedArea[];
}

export interface EveGithubReviewPublicationInput {
  accountableLogin: string;
  accountableTrigger: string;
  actorProfileId: string;
  changedPaths: string[];
  headSha: string;
  identity: EveVerifiedAuditIdentity;
  owner: string;
  pullRequestNumber: number;
  rawOutput: string;
  repo: string;
  runId: string;
}

export interface EveGithubReviewPublicationDependencies {
  auditStore: EveAuditStore;
  consultPolicy(input: {
    identity: EveVerifiedAuditIdentity;
    targetKey: string;
  }): Promise<EvePolicyConsultResult>;
  governanceStore: EveGovernanceStore;
  postReview(review: EveGithubPreparedReview): Promise<unknown>;
}

export type EveGithubReviewPublicationResult =
  | {
      published: false;
      reason: string;
    }
  | {
      published: true;
      findingCount: number;
      protectedAreaCount: number;
    };
