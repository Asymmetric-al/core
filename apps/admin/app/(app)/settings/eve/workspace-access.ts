import { isTenantAdministrator } from "@asym/auth/context";

import type { AuthContext } from "@asym/auth/context";

/** The assistant's operations workspace is the tenant administrator's (AL-2675). */
export function canAccessEveOperationsWorkspace(auth: AuthContext): boolean {
  return isTenantAdministrator(auth);
}
