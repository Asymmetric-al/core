import { listE2EAuthMemberships, type E2EAuthSession } from "../e2e-auth";

import type { ActiveAssignment } from "./types";

/**
 * The live rows an E2E bypass identity holds, in the resolver's shape, so
 * the proxy and the request's auth context judge it by the same rules as a
 * real session (AL-2675). No row stands behind them: the signed cookie names
 * them.
 */
export function listE2EAuthAssignments(
  session: E2EAuthSession,
): ActiveAssignment[] {
  return listE2EAuthMemberships(session).map((membership) => ({
    assignmentId: membership.id,
    userId: session.userId,
    tenantId: membership.tenantId,
    revision: "e2e-bypass",
    membershipRole: membership.role,
    staffRole: membership.staffRole,
    isTenantAdmin: membership.isTenantAdmin,
  }));
}
