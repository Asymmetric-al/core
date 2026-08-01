import { defineDynamic, defineTool } from "eve/tools";
import { z } from "zod";

import {
  eveStrictAutoMergeRunId,
  runEveStrictAutoMergeTool,
} from "../../src/github/strict-auto-merge-tool-runtime";

const strictAutoMergeInput = z
  .object({
    expectedHeadSha: z.string().regex(/^[0-9a-f]{40}$/u),
    pullRequestNumber: z.number().int().positive(),
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
          "Evaluate and immediately merge an issue-first Eve PR only when strict protected-branch policy, checks, human reviews, clean mergeability, and protected-area rules all pass at the expected head SHA. Otherwise escalate without merging.",
        inputSchema: strictAutoMergeInput,
        approval() {
          return "not-applicable";
        },
        execute(request, toolCtx) {
          const delivery = auth.attributes.delivery_id;
          const deliveryId =
            typeof delivery === "string" ? delivery : toolCtx.session.turn.id;
          const login = auth.attributes.user_login;
          const verifiedRequest = {
            ...request,
            accountableLogin:
              typeof login === "string" ? login : "verified-github-sender",
          };
          return runEveStrictAutoMergeTool({
            accountablePrincipalId: auth.principalId,
            accountableTrigger: `${auth.principalId}:delivery:${deliveryId}`,
            installationId,
            request: verifiedRequest,
            runId: eveStrictAutoMergeRunId(
              toolCtx.session.turn.id,
              verifiedRequest,
            ),
          });
        },
      });
    },
  },
});
