import { beforeAll, describe, expect, it } from "vitest";

let getTenantContext: (req: unknown) => {
  isAuthenticated: boolean;
  publicTenantId: string | null;
  role: string | null;
  tenantId: string | null;
  userId: string | null;
};
let isStaffRole: (context: unknown) => boolean;
let isSuperAdmin: (context: unknown) => boolean;

beforeAll(async () => {
  const module =
    await import("../../../apps/admin/src/cms/access/tenant-context");

  getTenantContext = module.getTenantContext;
  isStaffRole = module.isStaffRole;
  isSuperAdmin = module.isSuperAdmin;
});

describe("tenant-context", () => {
  it("returns an unauthenticated context without req.user", () => {
    const context = getTenantContext({ user: null } as never);

    expect(context).toEqual({
      isAuthenticated: false,
      publicTenantId: null,
      role: null,
      tenantId: null,
      userId: null,
    });
  });

  it("extracts user id, tenant, and role from the payload request", () => {
    const context = getTenantContext({
      user: {
        id: "cms_user_1",
        publicTenantId: "public_tenant_1",
        role: "staff",
        tenantId: "17",
      },
    } as never);

    expect(context).toEqual({
      isAuthenticated: true,
      publicTenantId: "public_tenant_1",
      role: "staff",
      tenantId: "17",
      userId: "cms_user_1",
    });
  });

  it("detects staff and super-admin roles correctly", () => {
    const staffContext = {
      isAuthenticated: true,
      publicTenantId: "public_tenant_1",
      role: "staff" as const,
      tenantId: "17",
      userId: "user_1",
    };
    const superAdminContext = {
      ...staffContext,
      role: "super_admin" as const,
    };

    expect(isStaffRole(staffContext)).toBe(true);
    expect(isSuperAdmin(staffContext)).toBe(false);
    expect(isSuperAdmin(superAdminContext)).toBe(true);
  });
});
