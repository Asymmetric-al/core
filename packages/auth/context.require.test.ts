import { describe, expect, it, vi } from "vitest";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => ({ client: null, error: null })),
}));

import {
  hasContextRoleClass,
  isTenantAdministrator,
  requireAuth,
  requireCapability,
  requireRole,
  requireRoleClass,
  requireTenantAdministrator,
} from "./context";

import type { AuthContext } from "./context";
import type { AuthMembership } from "./permissions";

const TENANT = "00000000-0000-0000-0000-000000000001";

function staffMembership(isTenantAdmin = false): AuthMembership {
  return {
    tenantId: TENANT,
    role: "staff",
    staffRole: "development",
    isActive: true,
    isTenantAdmin,
  };
}

function baseAuthenticated(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: "user-1",
    email: "user-1@example.com",
    tenantId: TENANT,
    role: "staff",
    memberships: [staffMembership()],
    assignment: null,
    assignmentDenial: null,
    profileId: "prof-1",
    isAuthenticated: true,
    ...overrides,
  };
}

describe("requireAuth", () => {
  it("does not throw for fully authenticated context", () => {
    expect(() => requireAuth(baseAuthenticated())).not.toThrow();
  });

  it.each([
    ["missing userId", { userId: null }],
    ["missing tenantId", { tenantId: null }],
    ["missing role", { role: null }],
    ["not authenticated", { isAuthenticated: false }],
  ] as const)("throws Unauthorized when %s", (_label, patch) => {
    expect(() => requireAuth(baseAuthenticated(patch) as AuthContext)).toThrow(
      "Unauthorized",
    );
  });
});

describe("requireRole", () => {
  it("admits an administrator by the flag on their staff membership", () => {
    expect(() =>
      requireRole(
        baseAuthenticated({
          role: "admin",
          memberships: [staffMembership(true)],
        }),
        ["admin"],
      ),
    ).not.toThrow();
  });

  it("refuses an administrator role name with no flagged membership behind it (AL-2675)", () => {
    expect(() =>
      requireRole(
        baseAuthenticated({
          role: "admin",
          memberships: [staffMembership(false)],
        }),
        ["admin"],
      ),
    ).toThrow(/Forbidden/);
  });

  it("throws Forbidden when effective role is not in allowed list", () => {
    expect(() => requireRole(baseAuthenticated(), ["donor"])).toThrow(
      /Forbidden/,
    );
  });

  it("throws Unauthorized before Forbidden when context is incomplete", () => {
    expect(() =>
      requireRole(baseAuthenticated({ isAuthenticated: false, userId: null }), [
        "admin",
      ]),
    ).toThrow("Unauthorized");
  });
});

/**
 * AL-2675 (WP2a sweep): handlers ask for a capability, the
 * tenant-administrator flag or a membership class, never a role name.
 */
describe("requireCapability", () => {
  it("admits a staff row whose bundle holds the capability", () => {
    expect(() =>
      requireCapability(baseAuthenticated(), "admin.dashboard.access"),
    ).not.toThrow();
  });

  it("refuses a staff row whose bundle lacks it, naming the capability", () => {
    expect(() =>
      requireCapability(baseAuthenticated(), "contributions.manage_settings"),
    ).toThrow("Forbidden: requires contributions.manage_settings");
  });

  it("admits the same row with the flag for a tenant-administrator capability", () => {
    expect(() =>
      requireCapability(
        baseAuthenticated({
          role: "admin",
          memberships: [staffMembership(true)],
        }),
        "contributions.manage_settings",
      ),
    ).not.toThrow();
  });

  it("refuses a donor membership a staff capability", () => {
    expect(() =>
      requireCapability(
        baseAuthenticated({
          role: "donor",
          memberships: [
            {
              tenantId: TENANT,
              role: "donor",
              staffRole: null,
              isActive: true,
            },
          ],
        }),
        "admin.dashboard.access",
      ),
    ).toThrow(/Forbidden/);
  });

  it("throws Unauthorized before Forbidden", () => {
    expect(() =>
      requireCapability(
        baseAuthenticated({ isAuthenticated: false, userId: null }),
        "admin.dashboard.access",
      ),
    ).toThrow("Unauthorized");
  });
});

describe("requireTenantAdministrator and isTenantAdministrator", () => {
  it("admits the flagged staff row the request acts under", () => {
    const context = baseAuthenticated({
      role: "admin",
      memberships: [staffMembership(true)],
    });
    expect(isTenantAdministrator(context)).toBe(true);
    expect(() => requireTenantAdministrator(context)).not.toThrow();
  });

  it("refuses an unflagged staff row, whatever its role name says", () => {
    const context = baseAuthenticated({ role: "admin" });
    expect(isTenantAdministrator(context)).toBe(false);
    expect(() => requireTenantAdministrator(context)).toThrow(
      "Forbidden: requires the tenant administrator",
    );
  });

  it("refuses a flagged row of another tenant or a revoked one", () => {
    expect(
      isTenantAdministrator(
        baseAuthenticated({
          memberships: [{ ...staffMembership(true), tenantId: "other" }],
        }),
      ),
    ).toBe(false);
    expect(
      isTenantAdministrator(
        baseAuthenticated({
          memberships: [{ ...staffMembership(true), isActive: false }],
        }),
      ),
    ).toBe(false);
  });

  it("throws Unauthorized before Forbidden", () => {
    expect(() =>
      requireTenantAdministrator(
        baseAuthenticated({ isAuthenticated: false, userId: null }),
      ),
    ).toThrow("Unauthorized");
  });
});

describe("requireRoleClass and hasContextRoleClass", () => {
  it("admits a live membership of one of the classes", () => {
    expect(hasContextRoleClass(baseAuthenticated(), "staff")).toBe(true);
    expect(() =>
      requireRoleClass(baseAuthenticated(), ["donor", "staff"]),
    ).not.toThrow();
  });

  it("refuses a membership of another class", () => {
    expect(hasContextRoleClass(baseAuthenticated(), "donor")).toBe(false);
    expect(() => requireRoleClass(baseAuthenticated(), ["donor"])).toThrow(
      "Forbidden: requires a donor membership",
    );
  });

  it("refuses a revoked membership or one in another tenant", () => {
    expect(
      hasContextRoleClass(
        baseAuthenticated({
          memberships: [{ ...staffMembership(), isActive: false }],
        }),
        "staff",
      ),
    ).toBe(false);
    expect(
      hasContextRoleClass(
        baseAuthenticated({
          memberships: [{ ...staffMembership(), tenantId: "other" }],
        }),
        "staff",
      ),
    ).toBe(false);
  });
});
