import { reportAccessDiagnostic } from "./access-diagnostics";
import { resolveActiveAssignment } from "./principal/assignment";
import {
  createRpcAssignmentReader,
  withReadErrorCause,
} from "./principal/reader";

import type { SupabaseUserRoleReader } from "./middleware";
import type { RoleSnapshot } from "./permissions";
import type { AssignmentRpcClient } from "./principal/reader";
import type { RoleClass } from "./principal/types";

export async function resolveUserRoleFromDatabase({
  userId,
  supabase,
  roleClass,
  nameTenantId,
}: {
  userId: string;
  supabase: SupabaseUserRoleReader;
  roleClass: RoleClass | null;
  nameTenantId?: string;
}): Promise<RoleSnapshot | null> {
  if (!roleClass) {
    reportAccessDiagnostic("no_role_class");
    return null;
  }

  try {
    const { reader, readError } = withReadErrorCause(
      createRpcAssignmentReader(supabase as unknown as AssignmentRpcClient),
    );
    const result = await resolveActiveAssignment(
      nameTenantId
        ? { userId, roleClass, expectedTenantId: nameTenantId }
        : { userId, roleClass },
      reader,
    );

    if (!result.ok) {
      if (result.reason === "reader_error") {
        reportAccessDiagnostic("membership_query_failed", readError());
      } else {
        reportAccessDiagnostic("no_assignment");
      }
      return null;
    }

    const { assignment } = result;
    return {
      memberships: [
        {
          tenantId: assignment.tenantId,
          role: assignment.membershipRole,
          staffRole: assignment.staffRole,
          isActive: true,
          isTenantAdmin: assignment.isTenantAdmin,
        },
      ],
    };
  } catch (error) {
    reportAccessDiagnostic("resolver_exception", error);
    return null;
  }
}
