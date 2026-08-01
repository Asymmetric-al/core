import { hasAnyContextRole } from "@asym/auth/context";

import type { AuthContext } from "@asym/auth/context";

export function canAccessEveOperationsWorkspace(auth: AuthContext): boolean {
  return (
    auth.isAuthenticated && hasAnyContextRole(auth, ["admin", "super_admin"])
  );
}
