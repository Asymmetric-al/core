import { describe, expect, it } from "vitest";

import { requireCrmAccess } from "../../../../packages/api/src/crm/auth/access";

import type { AuthContext } from "@asym/auth/context";

function authContext(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: "user-1",
    tenantId: "tenant-1",
    role: "staff",
    profileRole: "staff",
    memberships: [
      {
        tenantId: "tenant-1",
        role: "staff",
        staffRole: null,
        isActive: true,
      },
    ],
    profileId: "profile-1",
    isAuthenticated: true,
    ...overrides,
  };
}

describe("CRM authorization bridge", () => {
  it("creates an actor context from the authenticated Supabase staff user", () => {
    expect(
      requireCrmAccess(authContext(), {
        action: "crm.gateway.read",
        resourceType: "crm_gateway",
      }),
    ).toEqual({
      action: "crm.gateway.read",
      authTenantId: "tenant-1",
      isSuperAdmin: false,
      profileId: "profile-1",
      role: "staff",
      tenantId: "tenant-1",
      userId: "user-1",
    });
  });

  it("rejects unauthenticated users before CRM access", () => {
    expect(() =>
      requireCrmAccess(
        authContext({
          isAuthenticated: false,
          userId: null,
          tenantId: null,
          role: null,
          profileRole: null,
          memberships: [],
          profileId: null,
        }),
        {
          action: "crm.gateway.read",
          resourceType: "crm_gateway",
        },
      ),
    ).toThrow(/Unauthorized/);
  });

  it("rejects authenticated non-staff roles", () => {
    expect(() =>
      requireCrmAccess(
        authContext({
          role: "donor",
          profileRole: "donor",
          memberships: [],
        }),
        {
          action: "crm.gateway.read",
          resourceType: "crm_gateway",
        },
      ),
    ).toThrow(/Forbidden/);
  });

  it("does not trust a client-supplied tenant for staff users", () => {
    expect(() =>
      requireCrmAccess(authContext(), {
        action: "crm.gateway.read",
        resourceType: "crm_gateway",
        resourceTenantId: "tenant-2",
      }),
    ).toThrow(/tenant/);
  });

  it("allows super admins to act against an explicit tenant while preserving the auth tenant", () => {
    expect(
      requireCrmAccess(
        authContext({
          tenantId: "00000000-0000-0000-0000-000000000001",
          role: "super_admin",
          profileRole: "super_admin",
          memberships: [],
        }),
        {
          action: "crm.gateway.read",
          resourceType: "crm_gateway",
          resourceTenantId: "tenant-2",
        },
      ),
    ).toMatchObject({
      authTenantId: "00000000-0000-0000-0000-000000000001",
      isSuperAdmin: true,
      tenantId: "tenant-2",
      userId: "user-1",
    });
  });
});
