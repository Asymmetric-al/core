import { STAFF_SUBROLES } from "./staff-subroles";
import { buildTenantPrefix } from "./tenant-address";

import type { MembershipRole, StaffSubrole } from "@asym/database/types";

/**
 * What the proxy does with a page address, given the person's live rows (plan
 * 5.1, 5.2; AL-2675). Pure: the proxy reads and validates the rows first
 * (`readAddressRows` in `./principal`), or takes them from an E2E
 * bypass session, and the chooser lists the same rows.
 */

/** The fields of a validated live row (`AddressRow`) the decisions read. */
export interface AddressRow {
  readonly assignmentId: string;
  readonly tenantId: string;
  readonly membershipRole: MembershipRole;
  readonly staffRole: StaffSubrole | null;
}

type RoleClass = MembershipRole;

/** The rows of the surface's class in one tenant, sub-roles in registry order. */
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

/** The address a row is reached at: a suffix only where the tenant holds several. */
function prefixFor(row: AddressRow, rowsInItsTenant: number): string {
  return buildTenantPrefix(
    row.tenantId,
    rowsInItsTenant > 1 ? row.staffRole : null,
  );
}

export type TenantAddressDecision<Row extends AddressRow = AddressRow> =
  /** Render the page under this row; `prefix` is the address's own prefix. */
  | { kind: "allow"; assignment: Row; prefix: string }
  /** Redirect to the same page under this prefix. */
  | { kind: "canonical"; prefix: string }
  /** Send the person to the chooser for this tenant. */
  | { kind: "choose"; tenantId: string }
  | { kind: "refuse"; reason: "no_assignment" | "ambiguous" };

/**
 * A tenant address (`/<tenant>[~<sub-role>]/…`):
 *
 * - no row of the class in that tenant: refused; it never switches
 *   organization;
 * - one row: acts under it, and a suffix, held or not, is dropped;
 * - several staff rows: acts under the row the suffix names, or goes to the
 *   chooser when the address names none or one the person does not hold. It
 *   never acts under a row the person does not hold.
 */
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
  // Only staff rows can be several in one tenant (the membership key), and
  // only a sub-role tells them apart. Anything else fails closed.
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
  /** The chooser, for one tenant's rows or (`null`) for every organization. */
  | { kind: "choose"; tenantId: string | null }
  | { kind: "refuse" };

/**
 * A signed-in page address without a tenant, such as a bookmark from before
 * the tenant moved into the address: a person with one row of the class goes
 * to their one organization; anyone with a choice to make goes to the
 * chooser; a person with no row is refused.
 */
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
  /** Where choosing it leads: the address prefix the proxy admits it under. */
  prefix: string;
}

/**
 * The chooser's options: one for each live row of the surface's class,
 * optionally in one tenant, grouped by tenant with sub-roles in registry
 * order. Each prefix goes back through `decideTenantAddress` when it is
 * opened, so a choice is never trusted on its own.
 */
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
