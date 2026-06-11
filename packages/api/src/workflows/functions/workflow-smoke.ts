import { NonRetriableError } from "inngest";

import { WORKFLOW_SMOKE_EVENT, workflowEventEnvelopeSchema } from "../events";
import { inngest } from "../inngest/client";

/**
 * No-op smoke workflow proving the runtime endpoint can be discovered and a
 * safe tenant-scoped event envelope can run end to end. It produces no
 * business side effects and moves no product workflow behavior.
 */
export const workflowSmoke = inngest.createFunction(
  {
    id: "workflow-smoke",
    triggers: [{ event: WORKFLOW_SMOKE_EVENT }],
    retries: 0,
    concurrency: [{ key: "event.data.tenantId", limit: 1 }],
  },
  async ({ event, step }) => {
    const parsed = workflowEventEnvelopeSchema.safeParse(event.data);

    if (!parsed.success) {
      throw new NonRetriableError(
        `workflow_envelope_invalid: ${parsed.error.issues
          .map((issue) => issue.path.join(".") || issue.code)
          .join(", ")}`,
      );
    }

    const envelope = parsed.data;

    return await step.run("acknowledge-smoke-envelope", () => ({
      acknowledged: true,
      noOp: true,
      tenantId: envelope.tenantId,
      dispatchRequestId: envelope.dispatchRequestId ?? null,
    }));
  },
);
