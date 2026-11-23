import type { MembershipRole, StaffSubrole } from "@asym/database/types";

export type RoleClass = MembershipRole;

export interface HumanPrincipal {
  readonly kind: "human";
  readonly userId: string;
  readonly activeAssignment: ActiveAssignment;
}

export interface ActiveAssignment {
  readonly assignmentId: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly revision: string;
  readonly membershipRole: MembershipRole;
  readonly staffRole: StaffSubrole | null;
  readonly isTenantAdmin: boolean;
}

export interface AssignmentRow {
  readonly id: string;
  readonly user_id: string;
  readonly tenant_id: string;
  readonly role: string;
  readonly staff_role: string | null;
  readonly is_tenant_admin: boolean;
  readonly updated_at: string;
}

export interface AssignmentReader {
  listActiveAssignments(): Promise<ReadonlyArray<AssignmentRow>>;
}

export interface SessionIdentity {
  readonly userId: string;
}

export interface ResolveAssignmentInput {
  readonly userId: string;
  readonly roleClass: RoleClass;
  readonly proposedAssignmentId?: string;
  readonly expectedTenantId?: string;
}

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
