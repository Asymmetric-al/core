import { STAFF_SUBROLES } from "../staff-subroles";

import type {
  ActiveAssignment,
  AssignmentDenyReason,
  AssignmentReader,
  HumanPrincipal,
  ResolveAssignmentInput,
  ResolveAssignmentResult,
  RoleClass,
  SessionIdentity,
} from "./types";
import type { MembershipRole, StaffSubrole } from "@asym/database/types";

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Whether a membership class must carry a staff sub-role (and no other may). */
const STAFF_ROLE_REQUIRED: Readonly<Record<MembershipRole, boolean>> = {
  donor: false,
  missionary: false,
  staff: true,
};

function isCanonicalUuid(value: unknown): value is string {
  return typeof value === "string" && CANONICAL_UUID.test(value);
}

function isMembershipRole(value: unknown): value is MembershipRole {
  return typeof value === "string" && Object.hasOwn(STAFF_ROLE_REQUIRED, value);
}

function isStaffSubrole(value: unknown): value is StaffSubrole {
  return (
    typeof value === "string" &&
    (STAFF_SUBROLES as readonly string[]).includes(value)
  );
}

/** One reader row as an `ActiveAssignment`, or `null` when any field is malformed. */
function toActiveAssignment(
  raw: unknown,
  userId: string,
): ActiveAssignment | null {
  if (raw === null || typeof raw !== "object") return null;
  const {
    id,
    user_id: rowUserId,
    tenant_id: tenantId,
    role: membershipRole,
    staff_role: staffValue,
    is_tenant_admin: isTenantAdmin,
    updated_at: revision,
  } = raw as Record<string, unknown>;
  if (!isCanonicalUuid(id) || !isCanonicalUuid(tenantId)) return null;
  if (rowUserId !== userId) return null;
  if (!isMembershipRole(membershipRole)) return null;
  const staffRole =
    staffValue === null
      ? null
      : isStaffSubrole(staffValue)
        ? staffValue
        : undefined;
  if (staffRole === undefined) return null;
  if (STAFF_ROLE_REQUIRED[membershipRole] !== (staffRole !== null)) return null;
  // The flag exists only on a staff row (authz_memberships_tenant_admin_staff_chk).
  if (typeof isTenantAdmin !== "boolean") return null;
  if (isTenantAdmin && staffRole === null) return null;
  if (typeof revision !== "string" || revision.length === 0) return null;
  return Object.freeze({
    assignmentId: id,
    userId,
    tenantId,
    revision,
    membershipRole,
    staffRole,
    isTenantAdmin,
  });
}

/** Every row parsed, or `null` if any row is malformed or an id repeats. Bad rows are never dropped. */
function toActiveAssignments(
  rows: unknown,
  userId: string,
): ActiveAssignment[] | null {
  if (!Array.isArray(rows)) return null;
  const parsed: ActiveAssignment[] = [];
  for (const raw of rows) {
    const assignment = toActiveAssignment(raw, userId);
    if (!assignment) return null;
    if (parsed.some((p) => p.assignmentId === assignment.assignmentId)) {
      return null;
    }
    parsed.push(assignment);
  }
  return parsed;
}

function deny(reason: AssignmentDenyReason): ResolveAssignmentResult {
  return { ok: false, reason };
}

/** The caller's live rows, every one validated, or `reader_error`. */
export type ReadAssignmentsResult =
  | { readonly ok: true; readonly assignments: readonly ActiveAssignment[] }
  | { readonly ok: false; readonly reason: "reader_error" };

/**
 * Reads and validates the caller's live membership rows once. Never throws:
 * a reader failure, a malformed row or a repeated id is `reader_error`, and
 * bad rows are never dropped.
 */
export async function readActiveAssignments(
  userId: string,
  reader: AssignmentReader,
): Promise<ReadAssignmentsResult> {
  if (!isCanonicalUuid(userId)) return { ok: false, reason: "reader_error" };
  let rows: unknown;
  try {
    rows = await reader.listActiveAssignments();
  } catch {
    return { ok: false, reason: "reader_error" };
  }
  const assignments = toActiveAssignments(rows, userId);
  return assignments
    ? { ok: true, assignments }
    : { ok: false, reason: "reader_error" };
}

/**
 * The resolver's rule over rows already read and validated (plan 5.1). The
 * surface's role class comes first: only rows of that class are candidates. A
 * proposed row must be one of them and, when a tenant is expected, in that
 * tenant. With no proposal, the one candidate is the assignment; several are
 * refused: it never guesses.
 */
export function selectAssignment(
  assignments: readonly ActiveAssignment[],
  input: Omit<ResolveAssignmentInput, "userId">,
): ResolveAssignmentResult {
  const { roleClass, proposedAssignmentId, expectedTenantId } = input;
  if (!isMembershipRole(roleClass)) return deny("no_assignment");
  // Plan 12, WP2, "Interim rules until WP3": on the donor portal a person
  // with donor memberships in two organizations is refused, for the proxy
  // check, server reads and the browser header alike, until WP3 resolves the
  // portal's host. So there must be exactly one live donor row before either
  // header is matched: a proposal never picks one of several (AL-2675, JB12).
  if (
    roleClass === "donor" &&
    assignments.filter((a) => a.membershipRole === "donor").length > 1
  ) {
    return deny("ambiguous");
  }
  if (proposedAssignmentId !== undefined) {
    if (!isCanonicalUuid(proposedAssignmentId)) {
      return deny("not_owned_or_inactive");
    }
    const proposed = assignments.find(
      (a) => a.assignmentId === proposedAssignmentId,
    );
    if (!proposed) return deny("not_owned_or_inactive");
    if (proposed.membershipRole !== roleClass) {
      return deny("role_class_mismatch");
    }
    if (
      expectedTenantId !== undefined &&
      proposed.tenantId !== expectedTenantId
    ) {
      return deny("tenant_mismatch");
    }
    return { ok: true, assignment: proposed, selection: "proposed" };
  }

  const candidates = assignments.filter(
    (a) =>
      a.membershipRole === roleClass &&
      (expectedTenantId === undefined || a.tenantId === expectedTenantId),
  );
  if (candidates.length === 0) return deny("no_assignment");
  if (candidates.length > 1) return deny("ambiguous");
  return { ok: true, assignment: candidates[0]!, selection: "sole" };
}

/**
 * Selects and validates the acting assignment from live membership rows on
 * every call (plan 5.1): `readActiveAssignments`, then `selectAssignment`.
 * A proposed row (the chosen assignment) must be the caller's, live, of the
 * surface's class and, when a tenant is expected, in that tenant. Never
 * throws, never caches, and never falls back to a default tenant: a forged,
 * foreign or inactive proposal, a missing or ambiguous assignment, and any
 * reader failure or malformed row all deny.
 */
export async function resolveActiveAssignment(
  input: ResolveAssignmentInput,
  reader: AssignmentReader,
): Promise<ResolveAssignmentResult> {
  const { userId, roleClass, proposedAssignmentId } = input;
  if (!isCanonicalUuid(userId)) return deny("reader_error");
  if (!isMembershipRole(roleClass)) return deny("no_assignment");
  if (
    proposedAssignmentId !== undefined &&
    !isCanonicalUuid(proposedAssignmentId)
  ) {
    return deny("not_owned_or_inactive");
  }

  const read = await readActiveAssignments(userId, reader);
  if (!read.ok) return deny(read.reason);
  return selectAssignment(read.assignments, input);
}

/** Thrown by `resolveActivePrincipal` when no assignment validates. */
export class PrincipalDeniedError extends Error {
  readonly reason: AssignmentDenyReason;

  constructor(reason: AssignmentDenyReason) {
    super(`active assignment denied: ${reason}`);
    this.name = "PrincipalDeniedError";
    this.reason = reason;
  }
}

/** A `HumanPrincipal` for the surface's role class, or `PrincipalDeniedError`. */
export async function resolveActivePrincipal(
  session: SessionIdentity,
  roleClass: RoleClass,
  proposedAssignmentId: string | undefined,
  reader: AssignmentReader,
): Promise<HumanPrincipal> {
  const result = await resolveActiveAssignment(
    proposedAssignmentId === undefined
      ? { userId: session.userId, roleClass }
      : { userId: session.userId, roleClass, proposedAssignmentId },
    reader,
  );
  if (!result.ok) throw new PrincipalDeniedError(result.reason);
  return Object.freeze({
    kind: "human",
    userId: result.assignment.userId,
    activeAssignment: result.assignment,
  });
}
