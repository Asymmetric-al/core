import { getAdminClient } from "@asym/database/supabase/admin";

import { inngest } from "../inngest/client";
import { runDispatchRecoveryScan } from "../recovery";

/**
 * Scheduled dispatch recovery scan: finds workflow dispatch requests that
 * were stored but never successfully handed to workflow orchestration and
 * retries the handoff. It repairs handoffs only — business outcomes stay
 * with product records, work claims, and provider webhooks.
 */
export const dispatchRecoveryScan = inngest.createFunction(
  {
    id: "workflow-dispatch-recovery-scan",
    triggers: [{ cron: "*/5 * * * *" }],
    retries: 2,
    concurrency: [{ limit: 1 }],
  },
  async ({ step }) => {
    return await step.run("scan-dispatch-ledger", async () => {
      const { client, error } = getAdminClient();

      if (!client) {
        throw new Error(
          `workflow_recovery_admin_client_unavailable: ${error ?? "unknown"}`,
        );
      }

      return await runDispatchRecoveryScan({ client });
    });
  },
);
