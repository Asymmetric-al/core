import type { AuthenticatedContext } from "@asym/auth/context";

export type MissionaryScope = {
  profileId: string;
  tenantId: string;
  assignmentId: string | null;
};

export function missionaryScope(auth: AuthenticatedContext): MissionaryScope {
  return {
    profileId: auth.profileId,
    tenantId: auth.tenantId,
    assignmentId: auth.assignment?.assignmentId ?? null,
  };
}

export function missionaryArgs(scope: MissionaryScope) {
  return {
    p_profile_id: scope.profileId,
    p_tenant_id: scope.tenantId,
    p_assignment_id: scope.assignmentId,
  };
}
