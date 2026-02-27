import { describe, expect, it } from "vitest";

import {
  canAccessDashboard,
  derivePrimaryRole,
  hasRole,
  hasStaffSubrole,
  STAFF_SUBROLE_CAPABILITIES,
  type RoleSnapshot,
} from "../../../packages/auth/permissions";

function createSnapshot(overrides: Partial<RoleSnapshot> = {}): RoleSnapshot {
  return {
    profileRole: null,
    memberships: [],
    ...overrides,
  };
}

describe("auth permissions foundation", () => {
  it("grants donor role via membership even when profile role is staff", () => {
    const snapshot = createSnapshot({
      profileRole: "staff",
      memberships: [
        {
          isActive: true,
          role: "donor",
          staffRole: null,
          tenantId: "tenant_1",
        },
      ],
    });

    expect(hasRole(snapshot, "donor")).toBe(true);
  });

  it("derives primary role as staff when staff membership exists", () => {
    const snapshot = createSnapshot({
      profileRole: "donor",
      memberships: [
        {
          isActive: true,
          role: "staff",
          staffRole: "finance",
          tenantId: "tenant_1",
        },
      ],
    });

    expect(derivePrimaryRole(snapshot)).toBe("staff");
  });

  it("supports one-login multi-dashboard access by membership", () => {
    const snapshot = createSnapshot({
      profileRole: "donor",
      memberships: [
        {
          isActive: true,
          role: "donor",
          staffRole: null,
          tenantId: "tenant_1",
        },
        {
          isActive: true,
          role: "missionary",
          staffRole: null,
          tenantId: "tenant_1",
        },
        {
          isActive: true,
          role: "staff",
          staffRole: "member_care",
          tenantId: "tenant_1",
        },
      ],
    });

    expect(canAccessDashboard(snapshot, "donor_portal")).toBe(true);
    expect(canAccessDashboard(snapshot, "missionary_dashboard")).toBe(true);
    expect(canAccessDashboard(snapshot, "admin_dashboard")).toBe(true);
  });

  it("keeps all staff subroles on full admin capabilities for MVP", () => {
    const snapshot = createSnapshot({
      memberships: [
        {
          isActive: true,
          role: "staff",
          staffRole: "mobilizer",
          tenantId: "tenant_1",
        },
      ],
    });

    expect(hasStaffSubrole(snapshot, "mobilizer")).toBe(true);
    expect(STAFF_SUBROLE_CAPABILITIES.finance).toContain(
      "admin.dashboard.access",
    );
    expect(STAFF_SUBROLE_CAPABILITIES.hr).toContain("admin.gifts.manage");
  });
});
