import { isTenantAdministrator } from "@asym/auth/context";

import { ApiHttpError } from "../../shared/http-errors";

import type { AuthenticatedContext } from "@asym/auth/context";

/** Automations are the tenant administrator's (AL-2675, plan WP2 acceptance). */
export function canManageAutomations(auth: AuthenticatedContext): boolean {
  return isTenantAdministrator(auth);
}

export function assertAutomationPermission(auth: AuthenticatedContext): void {
  if (!canManageAutomations(auth)) {
    throw new ApiHttpError(403, "Forbidden: requires automation:manage");
  }
}
