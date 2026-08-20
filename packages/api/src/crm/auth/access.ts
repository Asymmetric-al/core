import { hasAnyRole } from "@asym/auth/permissions";

import { ApiHttpError } from "../../shared/api-http-error";

import type { ActorContext, CrmAction, CrmResourceType } from "../types";
import type { AuthContext, AuthenticatedContext } from "@asym/auth/context";

const CRM_ACCESS_ROLES = ["staff", "admin", "super_admin"] as const;

export interface RequireCrmAccessOptions {
  action: CrmAction;
  resourceType: CrmResourceType;
  resourceTenantId?: string | null;
}

export function assertCrmTenantAccess(actor: ActorContext): void {
  if (!actor.isSuperAdmin && actor.tenantId !== actor.authTenantId) {
    throw new ApiHttpError(403, "Forbidden: CRM tenant mismatch.");
  }
}

export function requireCrmAccess(
  context: AuthContext,
  options: RequireCrmAccessOptions,
): ActorContext {
  if (
    !context.isAuthenticated ||
    !context.userId ||
    !context.tenantId ||
    !context.role
  ) {
    throw new Error("Unauthorized");
  }

  const authenticated = context as AuthenticatedContext;
  const roleSnapshot = {
    profileRole: authenticated.profileRole,
    memberships: authenticated.memberships,
  };

  if (!hasAnyRole(roleSnapshot, CRM_ACCESS_ROLES)) {
    throw new Error("Forbidden: CRM access requires a staff role");
  }

  const isSuperAdmin = hasAnyRole(roleSnapshot, ["super_admin"]);
  const resourceTenantId = options.resourceTenantId ?? authenticated.tenantId;

  if (!isSuperAdmin && resourceTenantId !== authenticated.tenantId) {
    throw new Error(
      "Forbidden: CRM tenant does not match authenticated tenant",
    );
  }

  return {
    action: options.action,
    authTenantId: authenticated.tenantId,
    isSuperAdmin,
    profileId: authenticated.profileId,
    role: authenticated.role,
    tenantId: resourceTenantId,
    userId: authenticated.userId,
  };
}
