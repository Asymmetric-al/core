import { describe, expect, it } from "vitest";

import { resolveAssignmentCapabilities } from "../../../../packages/auth/capabilities";

import type { SelectedAssignment } from "../../../../packages/auth/capabilities/effective-capabilities";

/**
 * Council round 1 on WP2a, F12: the tenant-administrator flag lives only on a
 * staff row (plan 5.1; `authz_memberships_tenant_admin_staff_chk` in the
 * database, `isTenantAdministrator` in the context). The code registry
 * judges the same way: a flag on any other row grants nothing.
 */
function row(
  membershipRole: SelectedAssignment["membershipRole"],
  isTenantAdmin: boolean,
): SelectedAssignment {
  return {
    assignmentId: "assignment-1",
    tenantId: "tenant-1",
    membershipRole,
    staffRole: membershipRole === "staff" ? "development" : null,
    isTenantAdmin,
  };
}

describe("resolveAssignmentCapabilities and the tenant-administrator flag", () => {
  it("adds the tenant administrator's grant to a flagged staff row", () => {
    expect(resolveAssignmentCapabilities(row("staff", true))).toContain(
      "people.manage_members",
    );
    expect(resolveAssignmentCapabilities(row("staff", false))).not.toContain(
      "people.manage_members",
    );
  });

  it.each(["donor", "missionary"] as const)(
    "ignores the flag on a %s row",
    (membershipRole) => {
      expect(resolveAssignmentCapabilities(row(membershipRole, true))).toEqual(
        resolveAssignmentCapabilities(row(membershipRole, false)),
      );
      expect(
        resolveAssignmentCapabilities(row(membershipRole, true)),
      ).not.toContain("people.manage_members");
    },
  );
});
