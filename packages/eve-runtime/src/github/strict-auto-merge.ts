import { detectEveGithubProtectedAreas } from "@asym/api/eve/github-review";

import {
  eveGithubRequest,
  EveGithubRequestError,
  githubPathPart,
} from "./client";

import type {
  EveGithubBranchProtectionEvidence,
  EveGithubObservedCheck,
  EveGithubObservedReview,
  EveStrictAutoMergeEvidence,
  EveStrictAutoMergeInput,
} from "@asym/api/eve/strict-auto-merge";

interface PullRequestResponse {
  base?: { ref?: string };
  body?: string | null;
  draft?: boolean;
  head?: { ref?: string; sha?: string };
  html_url?: string;
  mergeable?: boolean | null;
  mergeable_state?: string;
  merged?: boolean;
  state?: string;
}

interface BranchProtectionResponse {
  enforce_admins?: { enabled?: boolean };
  required_conversation_resolution?: { enabled?: boolean };
  required_pull_request_reviews?: {
    bypass_pull_request_allowances?: {
      apps?: unknown[];
      teams?: unknown[];
      users?: unknown[];
    };
    dismiss_stale_reviews?: boolean;
    require_code_owner_reviews?: boolean;
    require_last_push_approval?: boolean;
    required_approving_review_count?: number;
  } | null;
  required_status_checks?: {
    checks?: Array<{ app_id?: number; context?: string }>;
    contexts?: string[];
    strict?: boolean;
  } | null;
}

function root(input: EveStrictAutoMergeInput): string {
  return `/repos/${githubPathPart(input.owner)}/${githubPathPart(input.repo)}`;
}

function parseIssueNumber(headRef: string): number | undefined {
  const match = /^eve\/issue-(\d+)-[A-Za-z0-9._/-]+$/u.exec(headRef);
  if (!match) return undefined;
  const issueNumber = Number(match[1]);
  return Number.isSafeInteger(issueNumber) && issueNumber > 0
    ? issueNumber
    : undefined;
}

async function issueExists(
  input: EveStrictAutoMergeInput,
  issueNumber: number | undefined,
): Promise<boolean> {
  if (!issueNumber) return false;
  const issue = await eveGithubRequest<{ pull_request?: unknown }>({
    installationId: input.installationId,
    method: "GET",
    path: `${root(input)}/issues/${issueNumber}`,
  }).catch((error: unknown) => {
    if (error instanceof EveGithubRequestError && error.status === 404) {
      return null;
    }
    throw error;
  });
  return issue !== null && issue.body.pull_request === undefined;
}

async function changedPaths(input: EveStrictAutoMergeInput): Promise<{
  complete: boolean;
  paths: string[];
}> {
  const paths: string[] = [];
  for (let page = 1; page <= 30; page += 1) {
    const response = await eveGithubRequest<Array<{ filename?: string }>>({
      installationId: input.installationId,
      method: "GET",
      path: `${root(input)}/pulls/${input.pullRequestNumber}/files?per_page=100&page=${page}`,
    });
    for (const file of response.body) {
      if (typeof file.filename === "string") paths.push(file.filename);
    }
    if (response.body.length < 100) {
      return { complete: true, paths: [...new Set(paths)] };
    }
  }
  return { complete: false, paths: [...new Set(paths)] };
}

function protectionEvidence(
  protection: BranchProtectionResponse,
): EveGithubBranchProtectionEvidence {
  const review = protection.required_pull_request_reviews;
  const bypass = review?.bypass_pull_request_allowances;
  const checkSettings = protection.required_status_checks;
  const checks = checkSettings?.checks?.flatMap((check) =>
    typeof check.context === "string"
      ? [{ appId: check.app_id, context: check.context }]
      : [],
  );
  const requiredChecks =
    checks && checks.length > 0
      ? checks
      : (checkSettings?.contexts ?? []).map((context) => ({ context }));
  return {
    bypassAllowanceCount:
      (bypass?.apps?.length ?? 0) +
      (bypass?.teams?.length ?? 0) +
      (bypass?.users?.length ?? 0),
    dismissStaleReviews: review?.dismiss_stale_reviews === true,
    enforceAdmins: protection.enforce_admins?.enabled === true,
    requireCodeOwnerReviews: review?.require_code_owner_reviews === true,
    requireLastPushApproval: review?.require_last_push_approval === true,
    requiredApprovingReviewCount: review?.required_approving_review_count ?? 0,
    requiredChecks,
    requiredConversationResolution:
      protection.required_conversation_resolution?.enabled === true,
    strictStatusChecks: checkSettings?.strict === true,
  };
}

async function loadProtection(
  input: EveStrictAutoMergeInput,
  baseBranch: string,
): Promise<EveGithubBranchProtectionEvidence | null> {
  const response = await eveGithubRequest<BranchProtectionResponse>({
    installationId: input.installationId,
    method: "GET",
    path: `${root(input)}/branches/${githubPathPart(baseBranch)}/protection`,
  }).catch((error: unknown) => {
    if (error instanceof EveGithubRequestError && error.status === 404) {
      return null;
    }
    throw error;
  });
  return response ? protectionEvidence(response.body) : null;
}

async function activeRulesetCount(
  input: EveStrictAutoMergeInput,
  baseBranch: string,
): Promise<number> {
  const response = await eveGithubRequest<unknown[]>({
    installationId: input.installationId,
    method: "GET",
    path: `${root(input)}/rules/branches/${githubPathPart(baseBranch)}`,
  }).catch((error: unknown) => {
    if (error instanceof EveGithubRequestError && error.status === 404) {
      return null;
    }
    throw error;
  });
  return response ? response.body.length : 1;
}

async function observedChecks(
  input: EveStrictAutoMergeInput,
  headSha: string,
): Promise<EveGithubObservedCheck[]> {
  const checks: EveGithubObservedCheck[] = [];
  for (let page = 1; page <= 30; page += 1) {
    const response = await eveGithubRequest<{
      check_runs?: Array<{
        app?: { id?: number };
        conclusion?: string | null;
        name?: string;
        status?: string;
      }>;
    }>({
      installationId: input.installationId,
      method: "GET",
      path: `${root(input)}/commits/${headSha}/check-runs?per_page=100&page=${page}`,
    });
    const runs = response.body.check_runs ?? [];
    for (const run of runs) {
      if (typeof run.name !== "string") continue;
      checks.push({
        appId: run.app?.id,
        conclusion: run.conclusion,
        context: run.name,
        status: run.status,
      });
    }
    if (runs.length < 100) break;
  }
  const statuses = await eveGithubRequest<{
    statuses?: Array<{ context?: string; state?: string }>;
  }>({
    installationId: input.installationId,
    method: "GET",
    path: `${root(input)}/commits/${headSha}/status?per_page=100`,
  });
  for (const status of statuses.body.statuses ?? []) {
    if (typeof status.context !== "string") continue;
    checks.push({ context: status.context, state: status.state });
  }
  return checks;
}

async function observedReviews(
  input: EveStrictAutoMergeInput,
): Promise<EveGithubObservedReview[]> {
  const reviews: EveGithubObservedReview[] = [];
  for (let page = 1; page <= 30; page += 1) {
    const response = await eveGithubRequest<
      Array<{
        commit_id?: string | null;
        state?: string;
        submitted_at?: string | null;
        user?: { login?: string; type?: string } | null;
      }>
    >({
      installationId: input.installationId,
      method: "GET",
      path: `${root(input)}/pulls/${input.pullRequestNumber}/reviews?per_page=100&page=${page}`,
    });
    for (const review of response.body) {
      if (
        typeof review.user?.login !== "string" ||
        typeof review.state !== "string"
      ) {
        continue;
      }
      reviews.push({
        commitId: review.commit_id,
        login: review.user.login,
        state: review.state,
        submittedAt: review.submitted_at,
        userType: review.user.type,
      });
    }
    if (response.body.length < 100) break;
  }
  return reviews;
}

export async function inspectEveStrictAutoMerge(
  input: EveStrictAutoMergeInput,
): Promise<EveStrictAutoMergeEvidence> {
  const pull = await eveGithubRequest<PullRequestResponse>({
    installationId: input.installationId,
    method: "GET",
    path: `${root(input)}/pulls/${input.pullRequestNumber}`,
  });
  const baseBranch = pull.body.base?.ref ?? "";
  const headRef = pull.body.head?.ref ?? "";
  const headSha = pull.body.head?.sha ?? "";
  const issueNumber = parseIssueNumber(headRef);
  const paths = await changedPaths(input);
  const [issueVerified, protection, rulesetCount, checks, reviews] =
    await Promise.all([
      issueExists(input, issueNumber),
      loadProtection(input, baseBranch),
      activeRulesetCount(input, baseBranch),
      observedChecks(input, headSha),
      observedReviews(input),
    ]);
  return {
    activeRulesetCount: rulesetCount,
    baseBranch,
    changedPathsComplete: paths.complete,
    draft: pull.body.draft === true,
    expectedHeadSha: input.expectedHeadSha,
    headSha,
    issueBranchVerified: issueVerified,
    issueLinkVerified:
      issueVerified &&
      typeof pull.body.body === "string" &&
      pull.body.body.includes(`Closes #${issueNumber}`),
    issueNumber,
    mergeable: pull.body.mergeable ?? null,
    mergeableState: pull.body.mergeable_state ?? "unknown",
    merged: pull.body.merged === true,
    observedChecks: checks,
    observedReviews: reviews,
    open: pull.body.state === "open",
    protectedAreas: detectEveGithubProtectedAreas(paths.paths),
    protection,
    pullRequestNumber: input.pullRequestNumber,
    pullRequestUrl: pull.body.html_url,
  };
}

function escapeInlineCode(value: string): string {
  return value.replaceAll("`", "ˋ");
}

export async function escalateEveStrictAutoMerge(input: {
  evidence: EveStrictAutoMergeEvidence;
  installationId: number;
  owner: string;
  repo: string;
  accountableLogin: string;
  reasons: readonly string[];
}): Promise<void> {
  const marker = `<!-- eve:strict-auto-merge:${input.evidence.pullRequestNumber}:${input.evidence.headSha} -->`;
  const repositoryRoot = `/repos/${githubPathPart(input.owner)}/${githubPathPart(input.repo)}`;
  for (let page = 1; page <= 30; page += 1) {
    const comments = await eveGithubRequest<Array<{ body?: string }>>({
      installationId: input.installationId,
      method: "GET",
      path: `${repositoryRoot}/issues/${input.evidence.pullRequestNumber}/comments?per_page=100&page=${page}`,
    });
    if (comments.body.some((comment) => comment.body?.includes(marker))) return;
    if (comments.body.length < 100) break;
  }
  const protectedPaths = input.evidence.protectedAreas
    .slice(0, 25)
    .map(
      (area) =>
        `- \`${escapeInlineCode(area.path)}\` — ${area.rules.join(", ")}`,
    );
  const body = [
    "## Eve auto-merge escalation",
    "",
    "Strict auto-merge did not pass. This pull request remains human-controlled and was not merged.",
    "",
    "### Blocking evidence",
    "",
    ...input.reasons.map((reason) => `- ${reason}`),
    ...(protectedPaths.length > 0
      ? ["", "### Protected areas", "", ...protectedPaths]
      : []),
    "",
    `Verified trigger: @${input.accountableLogin.replace(/[^A-Za-z0-9-]/gu, "") || "github-sender"}.`,
    "Resolve the blocking evidence, obtain the required human review, and mention Eve to request a fresh head-SHA evaluation.",
    "",
    marker,
  ].join("\n");
  await eveGithubRequest({
    body: { body },
    installationId: input.installationId,
    method: "POST",
    path: `${repositoryRoot}/issues/${input.evidence.pullRequestNumber}/comments`,
  });
}

export async function mergeEveStrictAutoMerge(input: {
  evidence: EveStrictAutoMergeEvidence;
  request: EveStrictAutoMergeInput;
}) {
  const path = `${root(input.request)}/pulls/${input.request.pullRequestNumber}/merge`;
  const response = await eveGithubRequest<{
    merged?: boolean;
    message?: string;
    sha?: string;
  }>({
    body: { merge_method: "merge", sha: input.evidence.headSha },
    installationId: input.request.installationId,
    method: "PUT",
    path,
  }).catch((error: unknown) => {
    if (
      error instanceof EveGithubRequestError &&
      [405, 409, 422].includes(error.status)
    ) {
      return null;
    }
    throw error;
  });
  return response
    ? {
        merged: response.body.merged === true,
        message: response.body.message,
        resourceId: response.body.sha,
        resourceUrl: input.evidence.pullRequestUrl,
      }
    : { merged: false, message: "GitHub rejected the protected-branch merge." };
}
