import { describe, expect, it, vi } from "vitest";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(() => ({ client: null, error: null })),
}));

import { requireAuth, requireRole } from "./context";

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
    profileRole: null,
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
          profileRole: "admin",
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
