import { AsyncLocalStorage } from "node:async_hooks";

import { SUPPORT_HUB_DEMO_TENANT_ID } from "./adapter/fixtures";

const supportHubTenantStorage = new AsyncLocalStorage<string>();

/**
 * Tenant id for the authenticated Support Hub request (set by API route
 * handlers). The in-memory adapter reads this to enforce row-level isolation
 * until Phase 8 replaces it with Supabase `tenant_id` filters.
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

/** Seed tenant for Phase 7 in-memory fixtures (`packages/api/.../fixtures.ts`). */
export { SUPPORT_HUB_DEMO_TENANT_ID };
