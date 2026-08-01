import {
  hasBlockingSandboxFinding,
  scanEveSandboxPath,
} from "@asym/api/eve/sandbox";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";

import { eveGithubRequest, githubPathPart } from "../../src/github/client";
import {
  eveGithubOperationRunId,
  runEveGithubOperatorTool,
} from "../../src/github/tool-runtime";

const AUTHORIZED_GITHUB_PERMISSIONS = new Set(["admin", "maintain", "write"]);

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
    productDirection: z.boolean().optional(),
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
): Promise<boolean> {
  try {
    const response = await eveGithubRequest<{ permission?: unknown }>({
      installationId,
      method: "GET",
      path: `/repos/Asymmetric-al/core/collaborators/${githubPathPart(login)}/permission`,
    });
    const permission = response.body.permission;
    return (
      typeof permission === "string" &&
      AUTHORIZED_GITHUB_PERMISSIONS.has(permission.toLowerCase())
    );
  } catch {
    return false;
  }
}

export default defineDynamic({
  events: {
    "step.started": async (_event, ctx) => {
      const auth = ctx.session.auth.current;
      const repository = auth?.attributes.repository;
      const installation = auth?.attributes.installation_id;
      const deliveryId = auth?.attributes.delivery_id;
      const login = auth?.attributes.user_login;
      const installationId =
        typeof installation === "string" ? Number(installation) : Number.NaN;
      if (
        auth?.authenticator !== "github-webhook" ||
        repository !== "Asymmetric-al/core" ||
        typeof deliveryId !== "string" ||
        deliveryId.length === 0 ||
        typeof login !== "string" ||
        login.length === 0 ||
        !Number.isSafeInteger(installationId) ||
        installationId <= 0 ||
        !(await isAuthorizedGithubSender(installationId, login))
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
            runId: eveGithubOperationRunId(deliveryId, request),
            sandbox,
          });
        },
      });
    },
  },
});
