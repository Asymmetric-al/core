import type { MembershipRole, StaffSubrole } from "@asym/database/types";

/**
 * Active-assignment types (#2258; AL-2675). The resolver lives in this
 * package so that the request's auth context, the proxies and the Payload
 * strategy can all use it; the API package's principal module re-exports it
 * beside the principal union. The class is carried in the value; a caller
 * never derives it from a role string.
 */

/**
 * The surface's role class (plan 5.1): Mission Control and Web Studio act on
 * staff rows, the missionary workspace on the missionary row, the donor portal
 * on the donor row.
 */
export type RoleClass = MembershipRole;

/** A signed-in human acting through exactly one server-validated assignment. */
export interface HumanPrincipal {
  readonly kind: "human";
  readonly userId: string;
  readonly activeAssignment: ActiveAssignment;
}

/**
 * The validated assignment: one live `authz.memberships` row owned by the
 * session user. `membershipRole`, `staffRole` and `isTenantAdmin` feed the
 * capability registry, which authorizes; they never authorize by name.
 */
export interface ActiveAssignment {
  /** `authz.memberships.id`. */
  readonly assignmentId: string;
  readonly userId: string;
  readonly tenantId: string;
  /** The row's `updated_at`, opaque until #670 supplies an epoch. */
  readonly revision: string;
  readonly membershipRole: MembershipRole;
  /** `null` (never `undefined`) on a non-staff row. */
  readonly staffRole: StaffSubrole | null;
  /** The tenant-administrator flag; only ever `true` on a staff row. */
  readonly isTenantAdmin: boolean;
}

/** One row of `public.current_user_assignments()`, as the Data API returns it. */
export interface AssignmentRow {
  readonly id: string;
  readonly user_id: string;
  readonly tenant_id: string;
  readonly role: string;
  readonly staff_role: string | null;
  readonly is_tenant_admin: boolean;
  readonly updated_at: string;
}

/** Port over the caller's own live memberships, read live on every call. */
export interface AssignmentReader {
  listActiveAssignments(): Promise<ReadonlyArray<AssignmentRow>>;
}

export interface SessionIdentity {
  readonly userId: string;
}

export interface ResolveAssignmentInput {
  readonly userId: string;
  /** The surface's role class: only rows of this class are candidates. */
  readonly roleClass: RoleClass;
  /** Client-proposed assignment; validated against live rows, never trusted. */
  readonly proposedAssignmentId?: string;
  /** Narrows the candidates to one tenant; it never widens or supplies a tenant. */
  readonly expectedTenantId?: string;
}

/** How the assignment was chosen: the caller's proposal, or the only candidate. */
export type AssignmentSelection = "proposed" | "sole";

export type AssignmentDenyReason =
  | "no_assignment"
  | "ambiguous"
  | "not_owned_or_inactive"
  | "role_class_mismatch"
  | "tenant_mismatch"
  | "reader_error";

export type ResolveAssignmentResult =
  | {
      readonly ok: true;
      readonly assignment: ActiveAssignment;
      readonly selection: AssignmentSelection;
    }
  | { readonly ok: false; readonly reason: AssignmentDenyReason };
