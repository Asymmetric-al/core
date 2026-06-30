import { ApiHttpError } from "../../shared/http-errors";

import type { AuthenticatedContext } from "@asym/auth/context";

export function canManageAutomations(auth: AuthenticatedContext): boolean {
  return (
    auth.role === "super_admin" ||
    auth.role === "admin" ||
    auth.profileRole === "super_admin" ||
    auth.profileRole === "admin"
  );
}

export function assertAutomationPermission(auth: AuthenticatedContext): void {
  if (!canManageAutomations(auth)) {
    throw new ApiHttpError(403, "Forbidden: requires automation:manage");
  }
}
