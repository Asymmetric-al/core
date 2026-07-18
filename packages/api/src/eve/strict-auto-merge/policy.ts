import {
  EVE_STRICT_AUTO_MERGE_BLOCK_REASONS,
  type EveGithubObservedCheck,
  type EveGithubObservedReview,
  type EveGithubRequiredCheck,
  type EveStrictAutoMergeBlockReason,
  type EveStrictAutoMergeDecision,
  type EveStrictAutoMergeEvidence,
} from "./types";

const SUCCESSFUL_CHECK_CONCLUSIONS = new Set(["neutral", "skipped", "success"]);

function checkMatches(
  required: EveGithubRequiredCheck,
  observed: EveGithubObservedCheck,
): boolean {
  if (required.context !== observed.context) return false;
  return (
    required.appId === undefined ||
    required.appId === -1 ||
    required.appId === observed.appId
  );
}

function checkSucceeded(check: EveGithubObservedCheck): boolean {
  if (check.state === "success") return true;
  return (
    check.status === "completed" &&
    typeof check.conclusion === "string" &&
    SUCCESSFUL_CHECK_CONCLUSIONS.has(check.conclusion)
  );
}

function latestReviewsByLogin(
  reviews: readonly EveGithubObservedReview[],
): EveGithubObservedReview[] {
  const latest = new Map<string, EveGithubObservedReview>();
  for (const review of reviews) {
    const key = review.login.toLowerCase();
    const prior = latest.get(key);
    if (!prior || (review.submittedAt ?? "") >= (prior.submittedAt ?? "")) {
      latest.set(key, review);
    }
  }
  return [...latest.values()];
}

function requiredChecksReasons(
  evidence: EveStrictAutoMergeEvidence,
): EveStrictAutoMergeBlockReason[] {
  const protection = evidence.protection;
  if (!protection) return [];
  const reasons: EveStrictAutoMergeBlockReason[] = [];
  if (protection.requiredChecks.length === 0) {
    reasons.push("required_check_missing");
  }
  for (const required of protection.requiredChecks) {
    const observed = evidence.observedChecks.filter((check) =>
      checkMatches(required, check),
    );
    if (observed.length === 0) {
      reasons.push("required_check_missing");
    } else if (!observed.some(checkSucceeded)) {
      reasons.push("required_check_not_successful");
    }
  }
  return reasons;
}

function requiredReviewReasons(
  evidence: EveStrictAutoMergeEvidence,
): EveStrictAutoMergeBlockReason[] {
  const protection = evidence.protection;
  if (!protection) return [];
  const reasons: EveStrictAutoMergeBlockReason[] = [];
  if (protection.requireCodeOwnerReviews) {
    reasons.push("unsupported_code_owner_review_rule");
  }
  if (protection.requireLastPushApproval) {
    reasons.push("unsupported_last_push_approval_rule");
  }
  const approvals = latestReviewsByLogin(evidence.observedReviews).filter(
    (review) =>
      review.state.toUpperCase() === "APPROVED" &&
      review.userType?.toLowerCase() !== "bot" &&
      (!protection.dismissStaleReviews || review.commitId === evidence.headSha),
  );
  if (
    protection.requiredApprovingReviewCount < 1 ||
    approvals.length < protection.requiredApprovingReviewCount
  ) {
    reasons.push("required_human_review_missing");
  }
  return reasons;
}

export function evaluateEveStrictAutoMerge(
  evidence: EveStrictAutoMergeEvidence,
): EveStrictAutoMergeDecision {
  if (evidence.merged) return { outcome: "already_merged", reasons: [] };

  const reasons: EveStrictAutoMergeBlockReason[] = [];
  if (evidence.headSha !== evidence.expectedHeadSha) {
    reasons.push("expected_head_changed");
  }
  if (evidence.baseBranch !== "develop") reasons.push("non_develop_base");
  if (!evidence.open) reasons.push("not_open");
  if (evidence.draft) reasons.push("draft_pull_request");
  if (
    !evidence.issueBranchVerified ||
    !evidence.issueLinkVerified ||
    !evidence.issueNumber
  ) {
    reasons.push("unverified_issue_provenance");
  }
  if (!evidence.protection) {
    reasons.push("branch_protection_missing");
  } else {
    if (!evidence.protection.enforceAdmins) {
      reasons.push("protection_not_enforced_for_admins");
    }
    if (evidence.protection.bypassAllowanceCount > 0) {
      reasons.push("protection_bypass_configured");
    }
    if (!evidence.protection.strictStatusChecks) {
      reasons.push("strict_status_checks_disabled");
    }
    if (!evidence.protection.requiredConversationResolution) {
      reasons.push("conversation_resolution_not_required");
    }
  }
  if (evidence.activeRulesetCount > 0) {
    reasons.push("active_ruleset_unverified");
  }
  if (!evidence.changedPathsComplete || evidence.protectedAreas.length > 0) {
    reasons.push("protected_area");
  }
  if (evidence.mergeable === null) {
    reasons.push("mergeability_pending");
  } else if (!evidence.mergeable || evidence.mergeableState !== "clean") {
    reasons.push("mergeability_not_clean");
  }
  if (
    evidence.protection?.requiredConversationResolution &&
    evidence.mergeableState !== "clean"
  ) {
    reasons.push("required_conversation_unresolved");
  }
  reasons.push(
    ...requiredChecksReasons(evidence),
    ...requiredReviewReasons(evidence),
  );

  const uniqueReasons = EVE_STRICT_AUTO_MERGE_BLOCK_REASONS.filter((reason) =>
    reasons.includes(reason),
  );
  return uniqueReasons.length > 0
    ? { outcome: "escalate", reasons: uniqueReasons }
    : { outcome: "merge", reasons: [] };
}
