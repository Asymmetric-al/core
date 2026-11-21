import type { StaffSubrole } from "@asym/database/types";

/**
 * The staff sub-roles (`authz.staff_role`), in the order a chooser lists them.
 * The page address grammar, the resolver and E2E bypass sessions all read
 * this one list.
 */
export const STAFF_SUBROLES: readonly StaffSubrole[] = [
  "finance",
  "mobilizer",
  "development",
  "hr",
  "member_care",
];
