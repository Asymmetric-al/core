import { executeEvePolicyTracerAsIdentity } from "@asym/api/eve/approval-budget";
import {
  createEveAuditStore,
  createGithubBotEveAuditIdentity,
} from "@asym/api/eve/audit";
import {
  authorizeEveGithubReviewTrigger,
  EVE_GITHUB_REVIEW_OUTPUT_INSTRUCTIONS,
  publishEveGithubReview,
  type EveGithubPreparedReview,
} from "@asym/api/eve/github-review";
import { createEveGovernanceStore } from "@asym/api/eve/governance";
import { authorizeEveStrictAutoMergeTrigger } from "@asym/api/eve/strict-auto-merge";
import {
  defaultGitHubAuth,
  githubChannel,
  type GitHubCheckSuiteEvent,
  type GitHubEventContext,
  type GitHubInboundContext,
} from "eve/channels/github";

import { eveGithubCredentials } from "../../src/github/credentials";
import {
  eveStrictAutoMergeRunId,
  runEveStrictAutoMergeTool,
} from "../../src/github/strict-auto-merge-tool-runtime";

const REVIEW_TRIGGER_ACTIONS = new Set([
  "opened",
  "ready_for_review",
  "reopened",
  "synchronize",
]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

interface GithubServicePrincipal {
  actorProfileId: string;
  botName: string;
  tenantId: string;
}

function githubServicePrincipal(): GithubServicePrincipal | null {
  const actorProfileId = process.env.EVE_GITHUB_ACTOR_PROFILE_ID?.trim();
  const tenantId = process.env.EVE_GITHUB_TENANT_ID?.trim();
  if (
    !actorProfileId ||
    !tenantId ||
    !UUID_PATTERN.test(actorProfileId) ||
    !UUID_PATTERN.test(tenantId)
  ) {
    return null;
  }
  return {
    actorProfileId,
    botName:
      process.env.EVE_GITHUB_APP_SLUG?.trim() ||
      process.env.GITHUB_APP_SLUG?.trim() ||
      "eve-asymmetric",
    tenantId,
  };
}

function accountableTrigger(ctx: GitHubInboundContext): string {
  return `github_sender:${ctx.sender.id}:delivery:${ctx.delivery.id}`;
}

async function evaluateCompletedCheckSuite(
  ctx: GitHubInboundContext,
  checkSuite: GitHubCheckSuiteEvent,
): Promise<void> {
  if (checkSuite.action !== "completed" || checkSuite.status !== "completed") {
    return;
  }
  const pullRequestNumber = checkSuite.pullRequests[0];
  const expectedHeadSha = checkSuite.headSha;
  if (!pullRequestNumber || !expectedHeadSha) return;

  const allowed = await authorizeAutoMergeTrigger(
    ctx,
    `${ctx.repository.fullName}#${pullRequestNumber}:strict-auto-merge`,
  );
  if (!allowed) return;

  const pull = await ctx.github.request<{
    base?: { ref?: unknown };
    head?: { ref?: unknown; sha?: unknown };
  }>({
    method: "GET",
    path: `/repos/${encodeURIComponent(ctx.repository.owner)}/${encodeURIComponent(ctx.repository.name)}/pulls/${pullRequestNumber}`,
  });
  const headRef = pull.body.head?.ref;
  if (
    pull.body.base?.ref !== "develop" ||
    typeof headRef !== "string" ||
    !/^eve\/issue-\d+-[A-Za-z0-9._/-]+$/u.test(headRef) ||
    pull.body.head?.sha !== expectedHeadSha
  ) {
    return;
  }

  const auth = defaultGitHubAuth(ctx);
  const rawInstallationId = auth.attributes.installation_id;
  const installationId =
    typeof rawInstallationId === "string"
      ? Number(rawInstallationId)
      : Number.NaN;
  if (!Number.isSafeInteger(installationId) || installationId <= 0) return;

  const request = {
    accountableLogin: ctx.sender.login,
    expectedHeadSha,
    pullRequestNumber,
  };
  await runEveStrictAutoMergeTool({
    accountablePrincipalId: auth.principalId,
    accountableTrigger: accountableTrigger(ctx),
    installationId,
    request,
    runId: eveStrictAutoMergeRunId(ctx.delivery.id, request),
  });
}

async function authorizeTrigger(
  ctx: GitHubInboundContext,
  target: string,
): Promise<boolean> {
  const principal = githubServicePrincipal();
  if (!principal) return false;
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) return false;

  return authorizeEveGithubReviewTrigger({
    accountableTrigger: accountableTrigger(ctx),
    actorProfileId: principal.actorProfileId,
    governanceStore: createEveGovernanceStore(admin.client),
    runId: crypto.randomUUID(),
    target,
  });
}

async function authorizeAutoMergeTrigger(
  ctx: GitHubInboundContext,
  target: string,
): Promise<boolean> {
  const principal = githubServicePrincipal();
  if (!principal) return false;
  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) return false;

  return authorizeEveStrictAutoMergeTrigger({
    accountableTrigger: accountableTrigger(ctx),
    actorProfileId: principal.actorProfileId,
    governanceStore: createEveGovernanceStore(admin.client),
    runId: crypto.randomUUID(),
    target,
  });
}

function isBotMention(body: string, botName: string): boolean {
  const normalized = botName.replace(/\[bot\]$/iu, "");
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  return new RegExp(`(^|\\s)@${escaped}(?=\\s|$|[.,:;!?])`, "iu").test(body);
}

async function listChangedPaths(
  channel: GitHubEventContext,
): Promise<string[]> {
  const pullRequestNumber = channel.state.pullRequestNumber;
  if (!pullRequestNumber) return [];
  const paths: string[] = [];
  for (let page = 1; page <= 30; page += 1) {
    const response = await channel.github.request<
      Array<{ filename?: unknown }>
    >({
      method: "GET",
      path: `/repos/${encodeURIComponent(channel.state.owner)}/${encodeURIComponent(channel.state.repo)}/pulls/${pullRequestNumber}/files?per_page=100&page=${page}`,
    });
    const files = Array.isArray(response.body) ? response.body : [];
    for (const file of files) {
      if (typeof file.filename === "string") paths.push(file.filename);
    }
    if (files.length < 100) break;
  }
  return [...new Set(paths)];
}

async function reviewAlreadyExists(
  channel: GitHubEventContext,
  runId: string,
): Promise<boolean> {
  const pullRequestNumber = channel.state.pullRequestNumber;
  if (!pullRequestNumber) return false;
  const marker = `<!-- eve:run:${runId} -->`;
  for (let page = 1; page <= 30; page += 1) {
    const response = await channel.github.request<Array<{ body?: unknown }>>({
      method: "GET",
      path: `/repos/${encodeURIComponent(channel.state.owner)}/${encodeURIComponent(channel.state.repo)}/pulls/${pullRequestNumber}/reviews?per_page=100&page=${page}`,
    });
    const reviews = Array.isArray(response.body) ? response.body : [];
    if (
      reviews.some(
        (review) =>
          typeof review.body === "string" && review.body.includes(marker),
      )
    ) {
      return true;
    }
    if (reviews.length < 100) return false;
  }
  return false;
}

async function postReview(
  channel: GitHubEventContext,
  review: EveGithubPreparedReview,
  runId: string,
): Promise<void> {
  const pullRequestNumber = channel.state.pullRequestNumber;
  if (!pullRequestNumber) {
    throw new Error("Eve GitHub review requires a pull request target.");
  }
  if (await reviewAlreadyExists(channel, runId)) return;
  await channel.github.request({
    body: {
      body: review.body,
      comments: review.comments,
      commit_id: channel.state.headSha,
      event: review.event,
    },
    method: "POST",
    path: `/repos/${encodeURIComponent(channel.state.owner)}/${encodeURIComponent(channel.state.repo)}/pulls/${pullRequestNumber}/reviews`,
  });
}

async function publishCompletedReview(
  message: string,
  channel: GitHubEventContext,
  sessionId: string,
  auth: {
    attributes: Readonly<Record<string, string | readonly string[]>>;
    principalId: string;
  } | null,
): Promise<void> {
  const principal = githubServicePrincipal();
  const pullRequestNumber = channel.state.pullRequestNumber;
  const headSha = channel.state.headSha;
  if (!principal || !pullRequestNumber || !headSha || !auth) return;

  const { getAdminClient } = await import("@asym/database/supabase/admin");
  const admin = getAdminClient();
  if (!admin.client) return;
  const loginAttribute = auth.attributes.user_login;
  const accountableLogin =
    typeof loginAttribute === "string"
      ? loginAttribute
      : channel.state.triggeringUserLogin || "verified-github-sender";
  const identity = createGithubBotEveAuditIdentity({
    actorProfileId: principal.actorProfileId,
    actorRole: "super_admin",
    botId: `${principal.botName}[bot]`,
    initiatorId: auth.principalId,
    initiatorType: "github_sender",
    tenantId: principal.tenantId,
  });
  const changedPaths = await listChangedPaths(channel);

  const deliveryAttribute = auth.attributes.delivery_id;
  const deliveryId =
    typeof deliveryAttribute === "string" ? deliveryAttribute : "unknown";
  await publishEveGithubReview(
    {
      accountableLogin,
      accountableTrigger: `${auth.principalId}:delivery:${deliveryId}`,
      actorProfileId: principal.actorProfileId,
      changedPaths,
      headSha,
      identity,
      owner: channel.state.owner,
      pullRequestNumber,
      rawOutput: message,
      repo: channel.state.repo,
      runId: sessionId,
    },
    {
      auditStore: createEveAuditStore(admin.client),
      consultPolicy: ({ identity: verifiedIdentity, targetKey }) =>
        executeEvePolicyTracerAsIdentity({
          actionId: "engineering.review_artifact.write",
          identity: verifiedIdentity,
          supabaseAdmin: admin.client!,
          targetKey,
        }),
      governanceStore: createEveGovernanceStore(admin.client),
      postReview: (review) => postReview(channel, review, sessionId),
    },
  );
}

// The GitHub App may be installed on repositories other than Core. Every
// handler below drives governed review and publication against the event's own
// owner/repo, so an event from anywhere else must be dropped before it can
// reach a session. The sibling tools (workflow_guard, github_strict_auto_merge,
// github_operator) already pin this same constant.
const CORE_REPOSITORY = "Asymmetric-al/core";

const botName =
  process.env.EVE_GITHUB_APP_SLUG?.trim() ||
  process.env.GITHUB_APP_SLUG?.trim() ||
  "eve-asymmetric";
export default githubChannel({
  botName,
  ...(eveGithubCredentials ? { credentials: eveGithubCredentials } : {}),
  progress: { reactions: false },
  pullRequestContext: {
    excludedFiles: ["**/*.generated.*", "**/dist/**", "**/.next/**"],
  },
  async onComment(ctx, comment) {
    if (ctx.repository.fullName !== CORE_REPOSITORY) return null;
    if (
      ctx.conversation.kind === "issue" ||
      !isBotMention(comment.body, botName)
    ) {
      return null;
    }
    const allowed = await authorizeTrigger(
      ctx,
      `${ctx.repository.fullName}#${ctx.conversation.pullRequestNumber ?? "review-thread"}`,
    );
    return allowed
      ? {
          auth: defaultGitHubAuth(ctx),
          context: [EVE_GITHUB_REVIEW_OUTPUT_INSTRUCTIONS],
        }
      : null;
  },
  async onCheckSuite(ctx, checkSuite) {
    if (ctx.repository.fullName !== CORE_REPOSITORY) return null;
    await evaluateCompletedCheckSuite(ctx, checkSuite);
    return null;
  },
  async onPullRequest(ctx, pullRequest) {
    if (ctx.repository.fullName !== CORE_REPOSITORY) return null;
    if (!REVIEW_TRIGGER_ACTIONS.has(pullRequest.action)) return null;
    const allowed = await authorizeTrigger(
      ctx,
      `${ctx.repository.fullName}#${pullRequest.pullRequestNumber}`,
    );
    return allowed
      ? {
          auth: defaultGitHubAuth(ctx),
          context: [EVE_GITHUB_REVIEW_OUTPUT_INSTRUCTIONS],
        }
      : null;
  },
  events: {
    async "message.completed"(data, channel, ctx) {
      if (data.finishReason === "tool-calls" || !data.message) return;
      await publishCompletedReview(
        data.message,
        channel,
        ctx.session.turn.id,
        ctx.session.auth.current,
      );
    },
    "session.failed"() {
      // Fail closed: the default GitHub failure comment is an ungated external
      // write. Operators diagnose the durable session and #419 audit instead.
    },
    "turn.failed"() {
      // Fail closed for the same reason; no fallback comment may bypass policy.
    },
  },
});
