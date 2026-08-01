import type { EvePolicyConsultResult } from "../approval-budget/types";
import type { EveAuditStore, EveVerifiedAuditIdentity } from "../audit/types";
import type { EveGovernanceStore } from "../governance/types";

export const EVE_GITHUB_OPERATOR_OPERATIONS = [
  "create_issue",
  "create_branch",
  "open_pull_request",
  "add_labels",
  "rerun_failed_workflow",
  "update_pull_request",
  "push_safe_fix",
] as const;

export type EveGithubOperatorOperation =
  (typeof EVE_GITHUB_OPERATOR_OPERATIONS)[number];

export interface EveGithubChangedFile {
  content?: string;
  path: string;
  status: "added" | "deleted" | "modified";
}

export type EveGithubOperatorRequest =
  | {
      operation: "create_issue";
      title: string;
      body: string;
      labels?: string[];
      productDirection?: boolean;
    }
  | {
      operation: "create_branch";
      issueNumber: number;
      branch: string;
      baseBranch: string;
    }
  | {
      operation: "open_pull_request";
      issueNumber: number;
      branch: string;
      baseBranch: string;
      title: string;
      body: string;
      changedPaths?: string[];
      productDirection?: boolean;
    }
  | {
      operation: "add_labels";
      issueNumber: number;
      targetNumber: number;
      labels: string[];
    }
  | {
      operation: "rerun_failed_workflow";
      issueNumber: number;
      workflowRunId: number;
      expectedRunAttempt: number;
    }
  | {
      operation: "update_pull_request";
      issueNumber: number;
      pullRequestNumber: number;
      state: "open" | "closed";
    }
  | {
      operation: "push_safe_fix";
      issueNumber: number;
      branch: string;
      commitMessage: string;
      changedFiles: EveGithubChangedFile[];
      approvalId?: string;
      productDirection?: boolean;
    };

export interface EveGithubOperatorInput {
  accountableTrigger: string;
  actorProfileId?: string;
  identity: EveVerifiedAuditIdentity;
  installationId: number;
  owner: string;
  repo: string;
  request: EveGithubOperatorRequest;
  runId: string;
}

export interface EveGithubOperatorResult {
  executed: boolean;
  operation: EveGithubOperatorOperation;
  reason?: string;
  resourceId?: string;
  resourceUrl?: string;
}

export interface EveGithubOperatorDependencies {
  auditStore: EveAuditStore;
  consultPolicy(input: {
    approvalId?: string;
    identity: EveVerifiedAuditIdentity;
    targetKey: string;
  }): Promise<EvePolicyConsultResult>;
  governanceStore: EveGovernanceStore;
  performOperation(input: EveGithubOperatorInput): Promise<{
    resourceId?: string;
    resourceUrl?: string;
  }>;
}
