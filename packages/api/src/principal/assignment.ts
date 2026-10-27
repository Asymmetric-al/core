import type {
  ActiveAssignment,
  AssignmentDenyReason,
  AssignmentReader,
  HumanPrincipal,
  ResolveAssignmentInput,
  ResolveAssignmentResult,
  SessionIdentity,
} from "./types";
import type { MembershipRole, StaffSubrole } from "@asym/database/types";

const CANONICAL_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Whether a membership role must carry a staff sub-role (and no other may). */
const STAFF_ROLE_REQUIRED: Readonly<Record<MembershipRole, boolean>> = {
  donor: false,
  missionary: false,
  staff: true,
};
const STAFF_SUBROLES: readonly StaffSubrole[] = [
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
];

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
  if (typeof revision !== "string" || revision.length === 0) return null;
  return Object.freeze({
    assignmentId: id,
    userId,
    tenantId,
    revision,
    membershipRole,
    staffRole,
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

/**
 * Default hat for two or more candidates that the caller has already narrowed.
 * Never picks a tenant: candidates spanning more than one tenant give `null`
 * (rule 5a). Within one tenant it prefers the single staff row over donor and
 * missionary rows (rule 5b), the order `derivePrimaryRole` already uses. It
 * never ranks staff sub-roles, so two staff rows give `null` (rule 5c). This is
 * selection, not authorization: the chosen hat still faces the PDP.
 */
export function pickDefaultAssignment(
  candidates: readonly ActiveAssignment[],
): ActiveAssignment | null {
  const tenants = new Set(candidates.map((c) => c.tenantId));
  if (tenants.size !== 1) return null;
  const staff = candidates.filter((c) => c.membershipRole === "staff"); // authz-exempt: default-selection
  return staff.length === 1 ? staff[0]! : null;
}

function deny(reason: AssignmentDenyReason): ResolveAssignmentResult {
  return { ok: false, reason };
}

/**
 * Selects and validates the acting hat from live membership rows on every
 * call. Never throws, never caches, and never falls back to a default tenant:
 * a forged, foreign or inactive proposal, a missing or ambiguous hat, and any
 * reader failure or malformed row all deny.
 */
export async function resolveActiveAssignment(
  input: ResolveAssignmentInput,
  reader: AssignmentReader,
): Promise<ResolveAssignmentResult> {
  const { userId, proposedAssignmentId, expectedTenantId } = input;
  if (!isCanonicalUuid(userId)) return deny("reader_error");
  if (
    proposedAssignmentId !== undefined &&
    !isCanonicalUuid(proposedAssignmentId)
  ) {
    return deny("not_owned_or_inactive");
  }

  let rows: unknown;
  try {
    rows = await reader.listActiveAssignments();
  } catch {
    return deny("reader_error");
  }
  const assignments = toActiveAssignments(rows, userId);
  if (!assignments) return deny("reader_error");

  if (proposedAssignmentId !== undefined) {
    const proposed = assignments.find(
      (a) => a.assignmentId === proposedAssignmentId,
    );
    if (!proposed) return deny("not_owned_or_inactive");
    if (
      expectedTenantId !== undefined &&
      proposed.tenantId !== expectedTenantId
    ) {
      return deny("tenant_mismatch");
    }
    return { ok: true, assignment: proposed, selection: "proposed" };
  }

  const candidates =
    expectedTenantId === undefined
      ? assignments
      : assignments.filter((a) => a.tenantId === expectedTenantId);
  if (candidates.length === 0) return deny("no_assignment");
  if (candidates.length === 1) {
    return { ok: true, assignment: candidates[0]!, selection: "sole" };
  }
  const picked = pickDefaultAssignment(candidates);
  return picked
    ? { ok: true, assignment: picked, selection: "default_staff" }
    : deny("ambiguous");
}

/** Thrown by `resolveActivePrincipal` when no hat validates. */
export class PrincipalDeniedError extends Error {
  readonly reason: AssignmentDenyReason;

  constructor(reason: AssignmentDenyReason) {
    super(`active assignment denied: ${reason}`);
    this.name = "PrincipalDeniedError";
    this.reason = reason;
  }
}

/** #669's membership-backed helper: a `HumanPrincipal`, or `PrincipalDeniedError`. */
export async function resolveActivePrincipal(
  session: SessionIdentity,
  proposedAssignmentId: string | undefined,
  reader: AssignmentReader,
): Promise<HumanPrincipal> {
  const result = await resolveActiveAssignment(
    proposedAssignmentId === undefined
      ? { userId: session.userId }
      : { userId: session.userId, proposedAssignmentId },
    reader,
  );
  if (!result.ok) throw new PrincipalDeniedError(result.reason);
  return Object.freeze({
    kind: "human",
    userId: result.assignment.userId,
    activeAssignment: result.assignment,
  });
}
