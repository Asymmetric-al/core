import { describe, expect, it } from "vitest";

import { requireAuth, requireRole } from "./context";

import type { AuthContext } from "./context";

function baseAuthenticated(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: "user-1",
    tenantId: "00000000-0000-0000-0000-000000000001",
    role: "staff",
    profileRole: "staff",
    memberships: [],
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
  it("does not throw when role is allowed", () => {
    expect(() =>
      requireRole(baseAuthenticated({ role: "admin" }), ["admin", "staff"]),
    ).not.toThrow();
  });

  it("throws Forbidden when effective role is not in allowed list", () => {
    // `super_admin` satisfies `hasRole(..., "donor")` in permissions — use staff vs donor.
    expect(() =>
      requireRole(baseAuthenticated({ role: "staff", profileRole: "staff" }), [
        "donor",
      ]),
    ).toThrow(/Forbidden/);
  });

  it("throws Unauthorized before Forbidden when context is incomplete", () => {
    expect(() =>
      requireRole(baseAuthenticated({ isAuthenticated: false, userId: null }), [
        "admin",
      ]),
    ).toThrow("Unauthorized");
  });
});
