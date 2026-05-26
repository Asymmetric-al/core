import { describe, expect, it } from "vitest";

import {
  assertContributionActionPermission,
  hasContributionPermission,
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

    expect(hasContributionPermission(auth, "finance:manage_contributions")).toBe(
      true,
    );
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

    expect(hasContributionPermission(auth, "finance:manage_contributions")).toBe(
      false,
    );
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
});
