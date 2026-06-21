import { describe, expect, it } from "vitest";

import {
  assertContributionActionPermission,
  hasContributionPermission,
  resolveContributionCapabilities,
} from "../../../../../packages/api/src/admin/contribution-operations/permissions";

import type { AuthenticatedContext } from "@asym/auth/context";

function authContext(
  overrides: Partial<AuthenticatedContext>,
): AuthenticatedContext {
  return {
    userId: "user_1",
    email: "finance@example.com",
    tenantId: "tenant_1",
    role: "staff",
    profileRole: "staff",
    memberships: [],
    profileId: "profile_1",
    isAuthenticated: true,
    ...overrides,
  };
}

describe("contribution operations permissions", () => {
  it("allows finance staff to perform high-risk contribution actions", () => {
    const auth = authContext({
      memberships: [
        {
          tenantId: "tenant_1",
          role: "staff",
          staffRole: "finance",
          isActive: true,
        },
      ],
    });

    expect(
      hasContributionPermission(auth, "finance:manage_contributions"),
    ).toBe(true);
    expect(() =>
      assertContributionActionPermission(auth, "refund"),
    ).not.toThrow();
  });

  it("allows admins to perform high-risk contribution actions", () => {
    const auth = authContext({ role: "admin", profileRole: "admin" });

    expect(() =>
      assertContributionActionPermission(auth, "donor_relink"),
    ).not.toThrow();
  });

  it("blocks non-finance staff from high-risk contribution actions", () => {
    const auth = authContext({
      memberships: [
        {
          tenantId: "tenant_1",
          role: "staff",
          staffRole: "development",
          isActive: true,
        },
      ],
    });

    expect(
      hasContributionPermission(auth, "finance:manage_contributions"),
    ).toBe(false);
    expect(() => assertContributionActionPermission(auth, "refund")).toThrow(
      "finance:manage_contributions",
    );
  });

  it("allows low-risk contribution actions for staff roles", () => {
    const auth = authContext({ role: "staff", profileRole: "staff" });

    expect(() =>
      assertContributionActionPermission(auth, "resend_receipt"),
    ).not.toThrow();
  });

  it("resolves granular capabilities backing staff-friendly roles", () => {
    const donorCare = resolveContributionCapabilities(
      authContext({ role: "staff", profileRole: "staff" }),
    );
    expect(donorCare).toContain("contributions.view_detail");
    expect(donorCare).toContain("contributions.request_corrections");
    expect(donorCare).not.toContain("contributions.apply_corrections");
    expect(donorCare).not.toContain("contributions.approve_corrections");

    const financeStaff = resolveContributionCapabilities(
      authContext({
        memberships: [
          {
            tenantId: "tenant_1",
            role: "staff",
            staffRole: "finance",
            isActive: true,
          },
        ],
      }),
    );
    expect(financeStaff).toContain("contributions.apply_corrections");
    expect(financeStaff).toContain("contributions.manage_receipts");
    expect(financeStaff).not.toContain("contributions.approve_corrections");

    const approver = resolveContributionCapabilities(
      authContext({ role: "admin", profileRole: "admin" }),
    );
    expect(approver).toContain("contributions.approve_corrections");
    expect(approver).toContain("contributions.run_refunds");
    expect(approver).not.toContain("contributions.manage_settings");

    const superAdmin = resolveContributionCapabilities(
      authContext({ role: "super_admin", profileRole: "super_admin" }),
    );
    expect(superAdmin).toContain("contributions.manage_settings");
    expect(superAdmin).toContain("crm.gift_history.manage_view_defaults");
  });
});
