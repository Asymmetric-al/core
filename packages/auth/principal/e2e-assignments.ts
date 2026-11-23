import { listE2EAuthMemberships, type E2EAuthSession } from "../e2e-auth";

import type { ActiveAssignment } from "./types";

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
