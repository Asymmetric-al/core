import { reportAccessDiagnostic } from "./access-diagnostics";
import { resolveActiveAssignment } from "./principal/assignment";
import {
  AssignmentReaderError,
  createRpcAssignmentReader,
} from "./principal/reader";

import type { SupabaseUserRoleReader } from "./middleware";
import type { RoleSnapshot } from "./permissions";
import type { AssignmentRpcClient } from "./principal/reader";
import type { AssignmentReader, RoleClass } from "./principal/types";

/**
 * Resolves a signed-in user's role snapshot for `createAuthMiddleware`, from
 * membership alone (plan 5.2; NR-20): the one live membership of the
 * surface's role class that the principal resolver selects, read through
 * `public.current_user_assignments()` on the request-scoped client. The
 * profile's tenant and role are not read.
 *
 * Until WP2b carries the tenant in the page address, the resolver has no
 * expected tenant, so a person whose live rows of the class span two tenants,
 * or who holds several staff rows in one, resolves nothing: the proxy turns
 * them away rather than guess. The assignment header is not consulted here;
 * the proxy only admits, and the request's own resolution picks the row.
 *
 * Returns `null` when no assignment resolves -- no surface class, no live row,
 * an ambiguous choice, a failed or malformed read. The middleware treats
 * `null` as "not allowed", so every one of those degrades to a redirect rather
 * than to unchecked access. It never sees the service-role key.
 */
export async function resolveUserRoleFromDatabase({
  userId,
  supabase,
  roleClass,
}: {
  userId: string;
  supabase: SupabaseUserRoleReader;
  roleClass: RoleClass | null;
}): Promise<RoleSnapshot | null> {
  if (!roleClass) {
    reportAccessDiagnostic("no_role_class");
    return null;
  }

  try {
    // Keep the failed read's error for the diagnostic code; the resolver
    // itself only says `reader_error`.
    let readError: unknown;
    const rpcReader = createRpcAssignmentReader(
      supabase as unknown as AssignmentRpcClient,
    );
    const reader: AssignmentReader = {
      async listActiveAssignments() {
        try {
          return await rpcReader.listActiveAssignments();
        } catch (error) {
          readError =
            error instanceof AssignmentReaderError && error.cause !== undefined
              ? error.cause
              : error;
          throw error;
        }
      },
    };
    const result = await resolveActiveAssignment({ userId, roleClass }, reader);

    if (!result.ok) {
      if (result.reason === "reader_error") {
        reportAccessDiagnostic("membership_query_failed", readError);
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
