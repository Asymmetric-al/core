import type { PublicProjectionContext } from "../projection/types";
import type { MembershipRole, StaffSubrole } from "@asym/database/types";

/**
 * Principal and active-assignment types (#2258, Phase 12 T4 slice (a)).
 * Preparation only: nothing in a request path builds or consumes these yet.
 * The class is carried in the value (`kind`); a caller never derives it from
 * a role string.
 */
export type Principal =
  | HumanPrincipal
  | ExternalPrincipal
  | ServiceAccountPrincipal
  | PlatformOperatorPrincipal;

export type PrincipalKind = Principal["kind"];

/** A signed-in human acting through exactly one server-validated org-hat. */
export interface HumanPrincipal {
  readonly kind: "human";
  readonly userId: string;
  readonly activeAssignment: ActiveAssignment;
}

/**
 * Public/anonymous visitor. Carries only its server-produced public context;
 * the `never` fields make an assignment or grant a compile-time error.
 */
export interface ExternalPrincipal {
  readonly kind: "external";
  readonly publicContext: PublicProjectionContext;
  readonly activeAssignment?: never;
  readonly assignment?: never;
  readonly grant?: never;
  readonly grants?: never;
}

/** Type-only: no table and no resolution exist yet (NHI owner ceiling is out of scope). */
export interface ServiceAccountPrincipal {
  readonly kind: "service_account";
  readonly nhiId: string;
  readonly tenantId: string;
  readonly ownerAssignmentId: string;
}

/** Type-only: the operator plane, its grants and its sink are out of scope. */
export interface PlatformOperatorPrincipal {
  readonly kind: "platform_operator";
  readonly operatorId: string;
}

/**
 * The validated active hat: one active `authz.memberships` row owned by the
 * session user. `membershipRole` and `staffRole` are for display, derivation
 * and default selection only; they never authorize.
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
}

/** One row of `public.current_user_assignments()`, as the Data API returns it. */
export interface AssignmentRow {
  readonly id: string;
  readonly user_id: string;
  readonly tenant_id: string;
  readonly role: string;
  readonly staff_role: string | null;
  readonly updated_at: string;
}

/** Port over the caller's own active memberships, read live on every call. */
export interface AssignmentReader {
  listActiveAssignments(): Promise<ReadonlyArray<AssignmentRow>>;
}

export interface SessionIdentity {
  readonly userId: string;
}

export interface ResolveAssignmentInput {
  readonly userId: string;
  /** Client-proposed hat; validated against live rows, never trusted. */
  readonly proposedAssignmentId?: string;
  /** Narrows the candidates to one tenant; it never widens or supplies a tenant. */
  readonly expectedTenantId?: string;
}

/** How the hat was chosen: the caller's proposal, the only candidate, or the single staff row. */
export type AssignmentSelection = "proposed" | "sole" | "default_staff";

export type AssignmentDenyReason =
  | "no_assignment"
  | "ambiguous"
  | "not_owned_or_inactive"
  | "tenant_mismatch"
  | "reader_error";

export type ResolveAssignmentResult =
  | {
      readonly ok: true;
      readonly assignment: ActiveAssignment;
      readonly selection: AssignmentSelection;
    }
  | { readonly ok: false; readonly reason: AssignmentDenyReason };
