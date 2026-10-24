import { getAdminClient } from "@asym/database/supabase/admin";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

/**
 * Tenant guard (#2250): the way no-JWT server code runs tenant-scoped database
 * work. Each allow-listed RPC is a public INVOKER wrapper around a SECURITY
 * DEFINER function owned by the NOLOGIN, NOBYPASSRLS role `tenant_guard`, so
 * the work runs under RLS keyed on the transaction-local GUC
 * `app.current_tenant_id`. The atomicity unit is one guarded call.
 * Contract: docs/security/tenant-guard.md.
 */
export class TenantGuardError extends Error {
  constructor(message: string) {
    super(`tenant_guard: ${message}`);
    this.name = "TenantGuardError";
  }
}

/** RPCs whose SQL function enters the guard and echoes `tenant_id`. */
const GUARDED_RPCS: ReadonlySet<string> = Object.freeze(
  new Set(["acquire_workflow_work_claim", "release_workflow_work_claim"]),
);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface GuardedClient {
  /**
   * Calls an allow-listed guarded RPC with `p_tenant_id` set to the guard
   * tenant. Resolves to the RPC's jsonb result once its `tenant_id` echo
   * matches; throws on a PostgREST error, a missing or mismatched echo, a name
   * outside the allow-list, or a caller-supplied `p_tenant_id` for another
   * tenant.
   */
  rpc(
    name: string,
    args?: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
}

function canonicalTenantId(value: unknown): string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new TenantGuardError("tenant id must be a canonical UUID");
  }
  return value.toLowerCase();
}

function sameTenant(value: unknown, tenantId: string): boolean {
  return typeof value === "string" && value.toLowerCase() === tenantId;
}

/**
 * Runs `fn` with a client that can only make guarded calls for `tenantId`.
 * The tenant id is validated before any I/O; errors from `fn` propagate
 * unchanged and nothing is retried. Uses the service-role admin client unless
 * one is passed.
 */
export async function withTenant<T>(
  tenantId: unknown,
  fn: (guarded: GuardedClient) => T | Promise<T>,
  client?: AdminSupabaseClient,
): Promise<T> {
  const tenant = canonicalTenantId(tenantId);
  const resolveClient = (): AdminSupabaseClient => {
    if (client) return client;
    const admin = getAdminClient();
    if (!admin.client) throw new TenantGuardError(admin.error);
    return admin.client;
  };

  const guarded: GuardedClient = {
    async rpc(name, args = {}) {
      if (!GUARDED_RPCS.has(name)) {
        throw new TenantGuardError(`${name} is not a guarded RPC`);
      }
      if (
        args.p_tenant_id !== undefined &&
        !sameTenant(args.p_tenant_id, tenant)
      ) {
        throw new TenantGuardError(`${name} was given another tenant`);
      }

      const { data, error } = await resolveClient().rpc(name, {
        ...args,
        p_tenant_id: tenant,
      });
      if (error) throw new Error(error.message);

      const payload = (data ?? null) as Record<string, unknown> | null;
      if (!payload || !sameTenant(payload.tenant_id, tenant)) {
        throw new TenantGuardError(`${name} did not echo the guard tenant`);
      }
      return payload;
    },
  };

  return fn(guarded);
}
