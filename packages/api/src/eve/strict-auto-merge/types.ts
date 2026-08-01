import type { EvePolicyConsultResult } from "../approval-budget/types";
import type { EveAuditStore, EveVerifiedAuditIdentity } from "../audit/types";
import type { EveGithubProtectedArea } from "../github-review/types";
import type { EveGovernanceStore } from "../governance/types";

export const EVE_STRICT_AUTO_MERGE_BLOCK_REASONS = [
  "active_ruleset_unverified",
  "branch_protection_missing",
  "conversation_resolution_not_required",
  "draft_pull_request",
  "expected_head_changed",
  "merge_api_rejected",
  "mergeability_not_clean",
  "mergeability_pending",
  "non_develop_base",
  "not_open",
  "protected_area",
  "protection_bypass_configured",
  "protection_not_enforced_for_admins",
  "required_check_missing",
  "required_check_not_successful",
  "required_conversation_unresolved",
  "required_human_review_missing",
  "strict_status_checks_disabled",
  "unsupported_code_owner_review_rule",
  "unsupported_last_push_approval_rule",
  "unverified_issue_provenance",
] as const;

export type EveStrictAutoMergeBlockReason =
  (typeof EVE_STRICT_AUTO_MERGE_BLOCK_REASONS)[number];

export interface EveGithubRequiredCheck {
  appId?: number;
  context: string;
}

export interface EveGithubObservedCheck {
  appId?: number;
  conclusion?: string | null;
  context: string;
  state?: string | null;
  status?: string | null;
}

export interface EveGithubObservedReview {
  commitId?: string | null;
  login: string;
  state: string;
  submittedAt?: string | null;
  userType?: string | null;
}

export interface EveGithubBranchProtectionEvidence {
  bypassAllowanceCount: number;
  dismissStaleReviews: boolean;
  enforceAdmins: boolean;
  requireCodeOwnerReviews: boolean;
  requireLastPushApproval: boolean;
  requiredApprovingReviewCount: number;
  requiredChecks: EveGithubRequiredCheck[];
  requiredConversationResolution: boolean;
  strictStatusChecks: boolean;
}

export interface EveStrictAutoMergeEvidence {
  activeRulesetCount: number;
  baseBranch: string;
  changedPathsComplete: boolean;
  draft: boolean;
  expectedHeadSha: string;
  headSha: string;
  issueBranchVerified: boolean;
  issueLinkVerified: boolean;
  issueNumber?: number;
  mergeable: boolean | null;
  mergeableState: string;
  merged: boolean;
  observedChecks: EveGithubObservedCheck[];
  observedReviews: EveGithubObservedReview[];
  open: boolean;
  protectedAreas: EveGithubProtectedArea[];
  protection: EveGithubBranchProtectionEvidence | null;
  pullRequestNumber: number;
  pullRequestUrl?: string;
}

export type EveStrictAutoMergeDecision =
  | { outcome: "already_merged"; reasons: [] }
  | { outcome: "merge"; reasons: [] }
  | {
      outcome: "escalate";
      reasons: EveStrictAutoMergeBlockReason[];
    };

export interface EveStrictAutoMergeInput {
  accountableLogin: string;
  accountableTrigger: string;
  actorProfileId: string;
  expectedHeadSha: string;
  identity: EveVerifiedAuditIdentity;
  installationId: number;
  owner: string;
  pullRequestNumber: number;
  repo: string;
  runId: string;
}

export interface EveStrictAutoMergeResult {
  alreadyMerged?: boolean;
  merged: boolean;
  pullRequestNumber: number;
  reasons: string[];
  resourceId?: string;
  resourceUrl?: string;
}

export interface EveStrictAutoMergeDependencies {
  auditStore: EveAuditStore;
  consultPolicy(input: {
    identity: EveVerifiedAuditIdentity;
    targetKey: string;
  }): Promise<EvePolicyConsultResult>;
  escalate(input: {
    evidence: EveStrictAutoMergeEvidence;
    reasons: readonly string[];
  }): Promise<void>;
  governanceStore: EveGovernanceStore;
  inspect(input: EveStrictAutoMergeInput): Promise<EveStrictAutoMergeEvidence>;
  merge(input: {
    evidence: EveStrictAutoMergeEvidence;
    request: EveStrictAutoMergeInput;
  }): Promise<{
    merged: boolean;
    message?: string;
    resourceId?: string;
    resourceUrl?: string;
  }>;
}
