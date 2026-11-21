import { describe, expect, it } from "vitest";

import { createAdminEveAuditIdentity } from "../../../../packages/api/src/eve/audit/identity";

const DEMO_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const ACTION_TENANT_ID = "00000000-0000-4000-8000-000000000003";

const SUPER_ADMIN_AUTH = {
  userId: "super-admin-user",
  email: "super-admin@example.com",
  tenantId: DEMO_TENANT_ID,
  role: "super_admin",
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000002",
  isAuthenticated: true,
} satisfies Parameters<typeof createAdminEveAuditIdentity>[0];

const ADMIN_AUTH = {
  userId: "admin-user",
  email: "admin@example.com",
  tenantId: ACTION_TENANT_ID,
  role: "admin",
  memberships: [],
  profileId: "00000000-0000-4000-8000-000000000004",
  isAuthenticated: true,
} satisfies Parameters<typeof createAdminEveAuditIdentity>[0];

/**
 * Rewritten by AL-2675 (WP2c, part 1): the platform actor was the
 * `super_admin` role name, which no membership holds since WP2a. It is the
 * result of the shared operator check now, passed as `platformOperator`; the
 * role name alone scopes nothing.
 */
describe("createAdminEveAuditIdentity", () => {
  it("leaves a confirmed platform operator unscoped by default, acting as the platform actor", () => {
    const identity = createAdminEveAuditIdentity(SUPER_ADMIN_AUTH, {
      platformOperator: true,
    });

    expect(identity.tenantId).toBeUndefined();
    expect(identity.actorRole).toBe("super_admin");
  });

  it("scopes a super_admin role name the operator check did not confirm to its own tenant, with its own role", () => {
    const identity = createAdminEveAuditIdentity(ADMIN_AUTH, {
      tenantId: DEMO_TENANT_ID,
    });
    expect(identity.tenantId).toBe(ACTION_TENANT_ID);
    expect(identity.actorRole).toBe("admin");
    expect(createAdminEveAuditIdentity(SUPER_ADMIN_AUTH).tenantId).toBe(
      DEMO_TENANT_ID,
    );
  });

  it("keeps an ordinary admin scoped to the authenticated tenant", () => {
    const identity = createAdminEveAuditIdentity(ADMIN_AUTH);

    expect(identity.tenantId).toBe(ACTION_TENANT_ID);
  });

  it("preserves an explicit tenant for a confirmed operator's tenant-specific work", () => {
    const identity = createAdminEveAuditIdentity(SUPER_ADMIN_AUTH, {
      platformOperator: true,
      tenantId: ACTION_TENANT_ID,
    });

    expect(identity.tenantId).toBe(ACTION_TENANT_ID);
  });
});
