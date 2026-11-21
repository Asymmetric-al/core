import { ApiHttpError } from "./api-http-error";

import type { AuthenticatedContext } from "@asym/auth/context";

export type MissionaryScope = {
  profileId: string;
  tenantId: string;
  assignmentId: string;
};

export function missionaryScope(auth: AuthenticatedContext): MissionaryScope {
  if (!auth.assignment)
    throw new ApiHttpError(403, "A selected missionary membership is required");
  return {
    profileId: auth.profileId,
    tenantId: auth.tenantId,
    assignmentId: auth.assignment.assignmentId,
  };
}

export function missionaryArgs(scope: MissionaryScope) {
  return {
    p_profile_id: scope.profileId,
    p_tenant_id: scope.tenantId,
    p_assignment_id: scope.assignmentId,
  };
}
