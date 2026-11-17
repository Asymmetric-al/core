import { AsyncLocalStorage } from "node:async_hooks";

import { SUPPORT_HUB_DEMO_TENANT_ID } from "./adapter/fixtures";

const supportHubTenantStorage = new AsyncLocalStorage<string>();

/**
 * Tenant id bound by `runWithSupportHubTenant` (route handlers after auth,
 * and the inbound email router). The Supabase adapter scopes every query to
 * it and throws `SUPPORT_HUB_TENANT_REQUIRED` when none is bound; the
 * in-memory test adapter falls back to the demo seed tenant.
 */
export function getSupportHubRequestTenantId(): string | undefined {
  return supportHubTenantStorage.getStore();
}

/**
 * Runs `fn` with the Support Hub tenant scope so adapter reads/mutations see
 * only that tenant's rows. Must wrap every handler body after auth succeeds.
 */
export function runWithSupportHubTenant<T>(
  tenantId: string,
  fn: () => Promise<T>,
): Promise<T> {
  return supportHubTenantStorage.run(tenantId, fn);
}

/** Seed tenant of the in-memory test fixtures (`./adapter/fixtures.ts`). */
export { SUPPORT_HUB_DEMO_TENANT_ID };
