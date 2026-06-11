import { type AuthenticatedContext } from "@asym/auth/context";
import { type getAdminClient } from "@asym/database/supabase/admin";
import { NextResponse } from "next/server";

import { withOperation } from "../../shared/with-operation";
import {
  countWorkflowNotifications,
  evaluateWorkflowNotification,
  type WorkflowNotificationOverrides,
} from "../../workflows/notification-policy";
import { summarizeWorkflowRuns } from "../../workflows/summaries";

async function loadOverrides(
  client: NonNullable<ReturnType<typeof getAdminClient>["client"]>,
  tenantId: string,
): Promise<WorkflowNotificationOverrides> {
  const { data } = await client
    .from("workflow_notification_policies")
    .select("overrides")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  return (data?.overrides ?? {}) as WorkflowNotificationOverrides;
}

/**
 * Mission Control workflow run summaries: product-owned status with
 * notification levels. No raw Inngest step logs, secrets, provider
 * internals, signed URLs, stack traces, or cross-tenant details.
 */
export const GET = withOperation(
  async ({ supabaseAdmin, auth }) => {
    const ctx = auth as AuthenticatedContext;

    const overrides = await loadOverrides(supabaseAdmin, ctx.tenantId);
    const summaries = await summarizeWorkflowRuns(supabaseAdmin, ctx.tenantId);

    return NextResponse.json({
      summaries: summaries.map((summary) => ({
        ...summary,
        notification: evaluateWorkflowNotification(summary, overrides),
      })),
      counts: countWorkflowNotifications(summaries, overrides),
    });
  },
  { roles: ["admin", "staff", "super_admin"] },
);
