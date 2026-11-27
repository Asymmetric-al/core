import { describe, expect, it } from "vitest";

import {
  assertCrmTenantAccess,
  requireCrmAccess,
} from "../../../../packages/api/src/crm/auth/access";

import type { ActorContext } from "../../../../packages/api/src/crm/types";
import type { AuthContext } from "@asym/auth/context";

function authContext(overrides: Partial<AuthContext> = {}): AuthContext {
  return {
    userId: "user-1",
    tenantId: "tenant-1",
    role: "staff",
    memberships: [
      {
        tenantId: "tenant-1",
        role: "staff",
        // AL-2675: a staff row always has a sub-role, which the registry needs.
        staffRole: "development",
        isActive: true,
      },
    ],
    profileId: "profile-1",
    isAuthenticated: true,
    ...overrides,
  };
}

describe("CRM authorization bridge", () => {
  it("creates an actor context from the authenticated Supabase staff user (D-18, AL-2675: the actor no longer carries a super-admin flag; no membership ever set it)", () => {
    expect(
      requireCrmAccess(authContext(), {
        action: "crm.record.read",
        resourceType: "record",
      }),
    ).toEqual({
      action: "crm.record.read",
      authTenantId: "tenant-1",
      isTenantAdministrator: false,
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
          memberships: [],
          profileId: null,
        }),
        {
          action: "crm.record.read",
          resourceType: "record",
        },
      ),
    ).toThrow(/Unauthorized/);
  });

  it("rejects authenticated non-staff roles", () => {
    expect(() =>
      requireCrmAccess(
        authContext({
          role: "donor",
          memberships: [],
        }),
        {
          action: "crm.record.read",
          resourceType: "record",
        },
      ),
    ).toThrow(/Forbidden/);
  });

  it("does not trust a client-supplied tenant for staff users", () => {
    expect(() =>
      requireCrmAccess(authContext(), {
        action: "crm.record.read",
        resourceType: "record",
        resourceTenantId: "tenant-2",
      }),
    ).toThrow(/tenant/);
  });

  // AL-2675: a super_admin profile acts only under the flagged staff row the
  // backfill gives it in its own tenant. Reach into another tenant waits for
  // WP2c's operator list, so until then it is refused like any staff member.
  it("refuses a super_admin profile acting against another tenant", () => {
    expect(() =>
      requireCrmAccess(
        authContext({
          tenantId: "00000000-0000-0000-0000-000000000001",
          role: "admin",
          memberships: [
            {
              tenantId: "00000000-0000-0000-0000-000000000001",
              role: "staff",
              staffRole: "development",
              isActive: true,
              isTenantAdmin: true,
            },
          ],
        }),
        {
          action: "crm.record.read",
          resourceType: "record",
          resourceTenantId: "tenant-2",
        },
      ),
    ).toThrow(/tenant/);
  });

  it("refuses another organization's record to an actor whose memberships carry the label super_admin, which resolves no capability (a guard), and to an actor carrying the old flag, which the notes and relationships services' tenant check admitted", () => {
    const labelled = authContext({
      memberships: [
        {
          tenantId: "tenant-1",
          role: "super_admin" as never,
          staffRole: null,
          isActive: true,
        },
      ],
    });
    expect(() =>
      requireCrmAccess(labelled, {
        action: "crm.record.read",
        resourceType: "record",
        resourceTenantId: "tenant-2",
      }),
    ).toThrow(/Forbidden/);
    const actor = requireCrmAccess(authContext(), {
      action: "crm.record.read",
      resourceType: "record",
    });
    expect(actor).not.toHaveProperty("isSuperAdmin");
    expect(() =>
      assertCrmTenantAccess({
        ...actor,
        isSuperAdmin: true,
        tenantId: "tenant-2",
      } as unknown as ActorContext),
    ).toThrow(/tenant mismatch/);
  });

  it("refuses a super_admin profile role with no membership", () => {
    expect(() =>
      requireCrmAccess(
        authContext({
          role: "super_admin",
          memberships: [],
        }),
        { action: "crm.record.read", resourceType: "record" },
      ),
    ).toThrow(/Forbidden/);
  });
});
