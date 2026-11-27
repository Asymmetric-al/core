import { STAFF_SUBROLES } from "./staff-subroles";
import { buildTenantPrefix, nameAddressPrefix } from "./tenant-address";

import type { MembershipRole, StaffSubrole } from "@asym/database/types";

export interface AddressRow {
  readonly assignmentId: string;
  readonly tenantId: string;
  readonly membershipRole: MembershipRole;
  readonly staffRole: StaffSubrole | null;
}

type RoleClass = MembershipRole;

function rowsInTenant<Row extends AddressRow>(
  assignments: readonly Row[],
  roleClass: RoleClass,
  tenantId: string,
): Row[] {
  return assignments
    .filter((a) => a.membershipRole === roleClass && a.tenantId === tenantId)
    .sort((a, b) => subRoleRank(a.staffRole) - subRoleRank(b.staffRole));
}

function subRoleRank(subRole: StaffSubrole | null): number {
  return subRole === null ? -1 : STAFF_SUBROLES.indexOf(subRole);
}

function prefixFor(row: AddressRow, rowsInItsTenant: number): string {
  return buildTenantPrefix(
    row.tenantId,
    rowsInItsTenant > 1 ? row.staffRole : null,
  );
}

export type TenantAddressDecision<Row extends AddressRow = AddressRow> =
  | { kind: "allow"; assignment: Row; prefix: string }
  | { kind: "canonical"; prefix: string }
  | { kind: "choose"; tenantId: string }
  | { kind: "refuse"; reason: "no_assignment" | "ambiguous" };

export function decideTenantAddress<Row extends AddressRow>(input: {
  assignments: readonly Row[];
  roleClass: RoleClass;
  tenantId: string;
  subRole: StaffSubrole | null;
}): TenantAddressDecision<Row> {
  const rows = rowsInTenant(input.assignments, input.roleClass, input.tenantId);
  if (rows.length === 0) return { kind: "refuse", reason: "no_assignment" };
  if (rows.length === 1) {
    const prefix = buildTenantPrefix(input.tenantId, null);
    return input.subRole === null
      ? { kind: "allow", assignment: rows[0]!, prefix }
      : { kind: "canonical", prefix };
  }
  if (input.roleClass !== "staff") {
    return { kind: "refuse", reason: "ambiguous" };
  }
  const named =
    input.subRole === null
      ? undefined
      : rows.find((row) => row.staffRole === input.subRole);
  return named
    ? {
        kind: "allow",
        assignment: named,
        prefix: buildTenantPrefix(input.tenantId, named.staffRole),
      }
    : { kind: "choose", tenantId: input.tenantId };
}

export type LandingDecision =
  | { kind: "enter"; prefix: string }
  | { kind: "choose"; tenantId: string | null }
  | { kind: "refuse" };

export function decideLanding(input: {
  assignments: readonly AddressRow[];
  roleClass: RoleClass;
}): LandingDecision {
  const rows = input.assignments.filter(
    (a) => a.membershipRole === input.roleClass,
  );
  if (rows.length === 0) return { kind: "refuse" };
  const tenants = new Set(rows.map((row) => row.tenantId));
  if (tenants.size > 1) return { kind: "choose", tenantId: null };
  if (rows.length > 1) return { kind: "choose", tenantId: rows[0]!.tenantId };
  return { kind: "enter", prefix: buildTenantPrefix(rows[0]!.tenantId, null) };
}

export interface AddressChoice {
  tenantId: string;
  assignmentId: string;
  subRole: StaffSubrole | null;
  prefix: string;
}

export function listAddressChoices(input: {
  assignments: readonly AddressRow[];
  roleClass: RoleClass;
  tenantId?: string;
}): AddressChoice[] {
  const tenants = [
    ...new Set(
      input.assignments
        .filter((a) => a.membershipRole === input.roleClass)
        .map((a) => a.tenantId),
    ),
  ]
    .filter((tenantId) => !input.tenantId || tenantId === input.tenantId)
    .sort();
  return tenants.flatMap((tenantId) => {
    const rows = rowsInTenant(input.assignments, input.roleClass, tenantId);
    return rows.map((row) => ({
      tenantId,
      assignmentId: row.assignmentId,
      subRole: row.staffRole,
      prefix: prefixFor(row, rows.length),
    }));
  });
}

export type NameAddressDecision<Row extends AddressRow = AddressRow> =
  | { kind: "allow"; assignment: Row; prefix: string }
  | { kind: "choose" }
  | { kind: "refuse" }
  | { kind: "without_sub_role" };

export function decideNameAddress<Row extends AddressRow>(input: {
  assignments: readonly Row[];
  roleClass: RoleClass;
  nameTenantId: string;
  subRole: StaffSubrole | null;
}): NameAddressDecision<Row> {
  const rows = rowsInTenant(
    input.assignments,
    input.roleClass,
    input.nameTenantId,
  );
  if (rows.length === 0) return { kind: "refuse" };
  if (rows.length === 1 || input.roleClass !== "staff") {
    if (input.subRole !== null) return { kind: "without_sub_role" };
    return rows.length === 1
      ? { kind: "allow", assignment: rows[0]!, prefix: "" }
      : { kind: "refuse" };
  }
  const named =
    input.subRole === null
      ? undefined
      : rows.find((row) => row.staffRole === input.subRole);
  return named
    ? {
        kind: "allow",
        assignment: named,
        prefix: nameAddressPrefix(named.staffRole),
      }
    : { kind: "choose" };
}

export function listNameAddressChoices(input: {
  assignments: readonly AddressRow[];
  roleClass: RoleClass;
  nameTenantId: string;
}): AddressChoice[] {
  const rows = rowsInTenant(
    input.assignments,
    input.roleClass,
    input.nameTenantId,
  );
  return rows.map((row) => ({
    tenantId: row.tenantId,
    assignmentId: row.assignmentId,
    subRole: row.staffRole,
    prefix: nameAddressPrefix(rows.length > 1 ? row.staffRole : null),
  }));
}
