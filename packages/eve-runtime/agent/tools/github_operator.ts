import {
  hasBlockingSandboxFinding,
  scanEveSandboxPath,
} from "@asym/api/eve/sandbox";
import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";

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
    productDirection: z.boolean().optional(),
    pullRequestNumber: z.number().int().positive().optional(),
    state: z.enum(["open", "closed"]).optional(),
    targetNumber: z.number().int().positive().optional(),
    title: z.string().optional(),
    workflowRunId: z.number().int().positive().optional(),
  })
  .strict();

export default defineDynamic({
  events: {
    "step.started": (_event, ctx) => {
      const auth = ctx.session.auth.current;
      const repository = auth?.attributes.repository;
      const installation = auth?.attributes.installation_id;
      const installationId =
        typeof installation === "string" ? Number(installation) : Number.NaN;
      if (
        auth?.authenticator !== "github-webhook" ||
        repository !== "Asymmetric-al/core" ||
        !Number.isSafeInteger(installationId) ||
        installationId <= 0
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
          const delivery = auth.attributes.delivery_id;
          const deliveryId =
            typeof delivery === "string" ? delivery : toolCtx.session.turn.id;
          return runEveGithubOperatorTool({
            accountablePrincipalId: auth.principalId,
            accountableTrigger: `${auth.principalId}:delivery:${deliveryId}`,
            installationId,
            request,
            runId: eveGithubOperationRunId(toolCtx.session.turn.id, request),
            sandbox,
          });
        },
      });
    },
  },
});
