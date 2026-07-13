import { getAdminClient } from "@asym/database/supabase/admin";

type WorkflowAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

/**
 * Unwraps the Supabase admin client for workflow steps, or throws a
 * retryable `<prefix>_admin_client_unavailable` error. A missing admin
 * client is environmental (missing service-role config), so the step should
 * retry rather than dead-letter immediately.
 */
export function requireWorkflowAdminClient(
  errorPrefix: string,
): WorkflowAdminClient {
  const { client, error } = getAdminClient();

  if (!client) {
    throw new Error(
      `${errorPrefix}_admin_client_unavailable: ${error ?? "unknown"}`,
    );
  }

  return client;
}
