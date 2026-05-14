import type { UserRole } from "@asym/database/types";
import type { PayloadRequest } from "payload";

type CmsRequestUser = {
  id?: string;
  role?: UserRole | null;
  tenantId?: string | null;
  publicTenantId?: string | null;
};

export type TenantContext = {
  isAuthenticated: boolean;
  userId: string | null;
  /**
   * Payload CMS tenant document id. This is intentionally separate from the
   * public Supabase tenant UUID used by giving/CRM tables.
   */
  tenantId: string | null;
  publicTenantId: string | null;
  role: UserRole | null;
};

export function getTenantContext(req: PayloadRequest): TenantContext {
  const user = (req.user ?? null) as CmsRequestUser | null;
  const userId = user?.id ?? null;
  const role = user?.role ?? null;
  const tenantId = user?.tenantId ?? null;
  const publicTenantId = user?.publicTenantId ?? null;

  return {
    isAuthenticated: Boolean(userId),
    userId,
    tenantId,
    publicTenantId,
    role,
  };
}

export function isSuperAdmin(context: TenantContext) {
  return context.role === "super_admin";
}

export function isStaffRole(context: TenantContext) {
  return (
    context.role === "staff" ||
    context.role === "admin" ||
    context.role === "super_admin"
  );
}
