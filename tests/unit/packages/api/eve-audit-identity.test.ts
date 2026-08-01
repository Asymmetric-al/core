import { describe, expect, it } from "vitest";

import { createAdminEveAuditIdentity } from "../../../../packages/api/src/eve/audit/identity";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const ACTION_TENANT_ID = "00000000-0000-4000-8000-000000000003";

const SUPER_ADMIN_AUTH = {
  userId: "super-admin-user",
  email: "super-admin@example.com",
  tenantId: DEMO_TENANT_ID,
  role: "super_admin",
  profileRole: "super_admin",
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000002",
  isAuthenticated: true,
} satisfies Parameters<typeof createAdminEveAuditIdentity>[0];

const ADMIN_AUTH = {
  userId: "admin-user",
  email: "admin@example.com",
  tenantId: ACTION_TENANT_ID,
  role: "admin",
  profileRole: "admin",
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000004",
  isAuthenticated: true,
} satisfies Parameters<typeof createAdminEveAuditIdentity>[0];

describe("createAdminEveAuditIdentity", () => {
  it("leaves a super-admin carrying the demo fallback unscoped by default", () => {
    const identity = createAdminEveAuditIdentity(SUPER_ADMIN_AUTH);

    expect(identity.tenantId).toBeUndefined();
  });

  it("keeps an ordinary admin scoped to the authenticated tenant", () => {
    const identity = createAdminEveAuditIdentity(ADMIN_AUTH);

    expect(identity.tenantId).toBe(ACTION_TENANT_ID);
  });

  it("preserves an explicit tenant for tenant-specific super-admin work", () => {
    const identity = createAdminEveAuditIdentity(SUPER_ADMIN_AUTH, {
      tenantId: ACTION_TENANT_ID,
    });

    expect(identity.tenantId).toBe(ACTION_TENANT_ID);
  });
});
