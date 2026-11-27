import {
  hasContextCapability,
  isTenantAdministrator,
  ScopeRefusedError,
} from "@asym/auth/context";

import { ApiHttpError } from "../../shared/api-http-error";

import type { ActorContext, CrmAction, CrmResourceType } from "../types";
import type { AuthContext, AuthenticatedContext } from "@asym/auth/context";

export interface RequireCrmAccessOptions {
  action: CrmAction;
  resourceType: CrmResourceType;
  resourceTenantId?: string | null;
}

export function assertCrmTenantAccess(actor: ActorContext): void {
  if (actor.tenantId !== actor.authTenantId) {
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
    // A refused tenant or assignment is marked for the browser (JB1).
    if (context.scopeRefused) {
      throw new ScopeRefusedError(context.assignmentDenial);
    }
    throw new Error("Unauthorized");
  }

  const authenticated = context as AuthenticatedContext;

  // AL-2675: CRM work needs the registry's CRM capability, which every staff
  // bundle holds.
  if (!hasContextCapability(authenticated, "admin.crm.manage")) {
    throw new Error("Forbidden: requires admin.crm.manage");
  }

  const resourceTenantId = options.resourceTenantId ?? authenticated.tenantId;

  if (resourceTenantId !== authenticated.tenantId) {
    throw new Error(
      "Forbidden: CRM tenant does not match authenticated tenant",
    );
  }

  return {
    action: options.action,
    authTenantId: authenticated.tenantId,
    isTenantAdministrator: isTenantAdministrator(authenticated),
    profileId: authenticated.profileId,
    role: authenticated.role,
    tenantId: resourceTenantId,
    userId: authenticated.userId,
  };
}
