import type { UserRole } from "@asym/database/types";

/**
 * The missionary workspace acts on the missionary row (plan 5.1): the proxy
 * and the layout resolve the person's one live missionary membership, so only
 * the missionary role can pass. Staff work in Mission Control.
 */
export const MISSIONARY_ALLOWED_ROLES = [
  "missionary",
] as const satisfies readonly UserRole[];

const MISSIONARY_ALLOWED_ROLE_SET: ReadonlySet<UserRole> = new Set(
  MISSIONARY_ALLOWED_ROLES,
);

export function canAccessMissionaryApp(role: UserRole | null) {
  if (!role) {
    return false;
  }

  return MISSIONARY_ALLOWED_ROLE_SET.has(role);
}
