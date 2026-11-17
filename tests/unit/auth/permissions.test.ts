import { describe, expect, it } from "vitest";

import {
  canAccessDashboard,
  derivePrimaryRole,
  hasRole,
  hasStaffSubrole,
  STAFF_SUBROLE_CAPABILITIES,
  type AuthMembership,
  type RoleSnapshot,
} from "../../../packages/auth/permissions";

function membership(overrides: Partial<AuthMembership> = {}): AuthMembership {
  return {
    isActive: true,
    role: "staff",
    staffRole: "finance",
    tenantId: "tenant_1",
    isTenantAdmin: false,
    ...overrides,
  };
}

function createSnapshot(memberships: AuthMembership[] = []): RoleSnapshot {
  return { memberships };
}

describe("auth permissions: membership is the only authority (AL-2675)", () => {
  it("grants donor role via a donor membership", () => {
    const snapshot = createSnapshot([
      membership({ role: "donor", staffRole: null }),
    ]);

    expect(hasRole(snapshot, "donor")).toBe(true);
    expect(hasRole(snapshot, "staff")).toBe(false);
  });

  it("derives primary role as staff for a staff membership without the flag", () => {
    const snapshot = createSnapshot([membership()]);

    expect(derivePrimaryRole(snapshot)).toBe("staff");
    expect(hasRole(snapshot, "staff")).toBe(true);
    expect(hasRole(snapshot, "admin")).toBe(false);
  });

  it("derives primary role as admin for a staff membership with the tenant-administrator flag (A06)", () => {
    const snapshot = createSnapshot([membership({ isTenantAdmin: true })]);

    expect(hasRole(snapshot, "admin")).toBe(true);
    expect(hasRole(snapshot, "staff")).toBe(true);
    expect(derivePrimaryRole(snapshot)).toBe("admin");
  });

  // The test that asserted the profile-role fallback ("falls back to legacy
  // admin profile role when membership data is unavailable"), inverted: an
  // inactive membership grants nothing, and no profile role exists to fall
  // back on (A03).
  it("does not fall back to a profile role: an inactive staff membership grants nothing", () => {
    const snapshot = {
      profileRole: "admin",
      memberships: [membership({ isActive: false, isTenantAdmin: true })],
    } as RoleSnapshot;

    expect(hasRole(snapshot, "staff")).toBe(false);
    expect(hasRole(snapshot, "admin")).toBe(false);
    expect(derivePrimaryRole(snapshot)).toBeNull();
  });

  it("gives super_admin nothing: platform operators are not a membership role", () => {
    const snapshot = {
      profileRole: "super_admin",
      memberships: [],
    } as RoleSnapshot;

    expect(hasRole(snapshot, "super_admin")).toBe(false);
    expect(hasRole(snapshot, "admin")).toBe(false);
    expect(hasRole(snapshot, "staff")).toBe(false);
    expect(derivePrimaryRole(snapshot)).toBeNull();
  });

  it("never treats the flag on an inactive row as administration", () => {
    expect(
      hasRole(
        createSnapshot([
          membership({ isActive: false, isTenantAdmin: true }),
          membership({ staffRole: "hr" }),
        ]),
        "admin",
      ),
    ).toBe(false);
  });

  it("supports one-login multi-dashboard access by membership", () => {
    const snapshot = createSnapshot([
      membership({ role: "donor", staffRole: null }),
      membership({ role: "missionary", staffRole: null }),
      membership({ staffRole: "member_care" }),
    ]);

    expect(canAccessDashboard(snapshot, "donor_portal")).toBe(true);
    expect(canAccessDashboard(snapshot, "missionary_dashboard")).toBe(true);
    expect(canAccessDashboard(snapshot, "admin_dashboard")).toBe(true);
  });

  it("keeps all staff subroles on full admin capabilities for MVP", () => {
    const snapshot = createSnapshot([membership({ staffRole: "mobilizer" })]);

    expect(hasStaffSubrole(snapshot, "mobilizer")).toBe(true);
    expect(hasStaffSubrole(snapshot, "finance")).toBe(false);
    expect(STAFF_SUBROLE_CAPABILITIES.finance).toContain(
      "admin.dashboard.access",
    );
    expect(STAFF_SUBROLE_CAPABILITIES.hr).toContain("admin.gifts.manage");
  });
});
