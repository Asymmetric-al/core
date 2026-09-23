import {
  hasBlockingSandboxFinding,
  scanEveSandboxPath,
} from "@asym/api/eve/sandbox";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";

import {
  approvedCommandAppIds,
  authorizeEveGithubActor,
} from "../../src/github/authorize-trigger";
import { eveGithubRequest } from "../../src/github/client";
import { isEveGithubOperatorSessionPurpose } from "../../src/github/session-purpose";
import {
  eveGithubOperationRunId,
  runEveGithubOperatorTool,
} from "../../src/github/tool-runtime";

const operatorInput = z
  .object({
    approvalId: z.string().uuid().optional(),
    baseBranch: z.string().optional(),
    body: z.string().optional(),
    branch: z.string().optional(),
    changedPaths: z.array(z.string()).max(50).optional(),
    commitMessage: z.string().optional(),
    expectedRunAttempt: z.number().int().positive().optional(),
    issueNumber: z.number().int().positive().optional(),
    labels: z.array(z.string()).max(10).optional(),
    operation: z.enum([
      "create_issue",
      "create_branch",
      "open_pull_request",
      "add_labels",
      "rerun_failed_workflow",
      "update_pull_request",
      "push_safe_fix",
    ]),
    pullRequestNumber: z.number().int().positive().optional(),
    state: z.enum(["open", "closed"]).optional(),
    targetNumber: z.number().int().positive().optional(),
    title: z.string().optional(),
    workflowRunId: z.number().int().positive().optional(),
  })
  .strict();

async function isAuthorizedGithubSender(
  installationId: number,
  login: string,
  principalId: string,
  userType: string,
  appId: string | undefined,
  appSlug: string | undefined,
): Promise<boolean> {
  const id = /^github:(\d+)$/u.exec(principalId)?.[1];
  if (!id) return false;
  return authorizeEveGithubActor({
    actor: { id: Number(id), login, type: userType },
    appProof:
      appId && appSlug ? { id: Number(appId), slug: appSlug } : undefined,
    approvedAppIds: approvedCommandAppIds(
      process.env.EVE_APPROVED_COMMAND_APP_IDS,
    ),
    onLookupError: () =>
      console.error("[eve/github] authorization service unavailable"),
    request: (input) => eveGithubRequest({ ...input, installationId }),
  });
}

export default defineDynamic({
  events: {
    "step.started": async (_event, ctx) => {
      const auth = ctx.session.auth.current;
      const repository = auth?.attributes.repository;
      const installation = auth?.attributes.installation_id;
      const deliveryId = auth?.attributes.delivery_id;
      const login = auth?.attributes.user_login;
      const userType = auth?.attributes.user_type;
      const appId = auth?.attributes.authorized_app_id;
      const appSlug = auth?.attributes.authorized_app_slug;
      const sessionPurpose = auth?.attributes.session_purpose;
      const installationId =
        typeof installation === "string" ? Number(installation) : Number.NaN;
      if (
        auth?.authenticator !== "github-webhook" ||
        repository !== "Asymmetric-al/core" ||
        !isEveGithubOperatorSessionPurpose(sessionPurpose) ||
        typeof deliveryId !== "string" ||
        deliveryId.length === 0 ||
        typeof login !== "string" ||
        login.length === 0 ||
        typeof userType !== "string" ||
        !Number.isSafeInteger(installationId) ||
        installationId <= 0 ||
        !(await isAuthorizedGithubSender(
          installationId,
          login,
          auth.principalId,
          userType,
          typeof appId === "string" ? appId : undefined,
          typeof appSlug === "string" ? appSlug : undefined,
        ))
      ) {
        return null;
      }
      return defineTool({
        description:
          "Perform one governed, issue-first GitHub operation in Asymmetric-al/core. This tool cannot merge pull requests.",
        inputSchema: operatorInput,
        approval({ toolInput }) {
          const parsed = operatorInput.safeParse(toolInput);
          if (!parsed.success) {
            return { type: "denied", reason: "Invalid GitHub operator input." };
          }
          const paths = parsed.data.changedPaths ?? [];
          const scans = paths.map((path) => scanEveSandboxPath(path));
          if (scans.some(hasBlockingSandboxFinding)) {
            return {
              type: "denied",
              reason: "Sensitive material may not be pushed by Eve.",
            };
          }
          return scans.some((scan) => scan.requiresApproval)
            ? "user-approval"
            : "not-applicable";
        },
        async execute(request, toolCtx) {
          const sandbox = await toolCtx.getSandbox();
          return runEveGithubOperatorTool({
            accountablePrincipalId: auth.principalId,
            accountableTrigger: `${auth.principalId}:delivery:${deliveryId}`,
            installationId,
            request,
            runId: eveGithubOperationRunId(deliveryId, sessionPurpose, request),
            sandbox,
            sessionPurpose,
          });
        },
      });
    },
  },
});
