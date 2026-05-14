import { beforeAll, describe, expect, it } from "vitest";

let tenantScopedCreateAccess: (
  tenantField?: string,
) => (args: unknown) => unknown;
let tenantScopedDeleteAccess: (
  tenantField?: string,
) => (args: unknown) => unknown;
let tenantScopedReadAccess: (
  tenantField?: string,
) => (args: unknown) => unknown;
let tenantScopedUpdateAccess: (
  tenantField?: string,
) => (args: unknown) => unknown;
let applyTenantFromContext: (
  tenantField?: string,
) => (args: unknown) => unknown;

beforeAll(async () => {
  const [accessModule, hookModule] = await Promise.all([
    import("../../../apps/admin/src/cms/access/tenant-access"),
    import("../../../apps/admin/src/cms/hooks/tenant"),
  ]);

  tenantScopedCreateAccess = accessModule.tenantScopedCreateAccess;
  tenantScopedDeleteAccess = accessModule.tenantScopedDeleteAccess;
  tenantScopedReadAccess = accessModule.tenantScopedReadAccess;
  tenantScopedUpdateAccess = accessModule.tenantScopedUpdateAccess;
  applyTenantFromContext = hookModule.applyTenantFromContext;
});

describe("tenant-access", () => {
  it("denies reads for unauthenticated requests", async () => {
    const result = await tenantScopedReadAccess("tenant")({
      req: { user: null },
    } as never);

    expect(result).toBe(false);
  });

  it("allows super-admin reads across tenants", async () => {
    const result = await tenantScopedReadAccess("tenant")({
      req: {
        user: {
          id: "cms_user_1",
          role: "super_admin",
          tenantId: null,
        },
      },
    } as never);

    expect(result).toBe(true);
  });

  it("scopes staff reads to their tenant", async () => {
    const result = await tenantScopedReadAccess("tenant")({
      req: {
        user: {
          id: "cms_user_1",
          role: "staff",
          tenantId: "17",
        },
      },
    } as never);

    expect(result).toEqual({
      tenant: {
        equals: "17",
      },
    });
  });

  it("denies create when tenant does not match context", async () => {
    const result = await tenantScopedCreateAccess("tenant")({
      data: {
        tenant: "tenant_2",
      },
      req: {
        user: {
          id: "cms_user_1",
          role: "staff",
          tenantId: "17",
        },
      },
    } as never);

    expect(result).toBe(false);
  });

  it("scopes update and delete to tenant filters", async () => {
    const args = {
      req: {
        user: {
          id: "cms_user_1",
          role: "admin",
          tenantId: "17",
        },
      },
    } as never;

    expect(tenantScopedUpdateAccess("tenant")(args)).toEqual({
      tenant: {
        equals: "17",
      },
    });
    expect(tenantScopedDeleteAccess("tenant")(args)).toEqual({
      tenant: {
        equals: "17",
      },
    });
  });

  it("overwrites tenant reassignment attempts during validation", async () => {
    const result = await applyTenantFromContext("tenant")({
      data: {
        tenant: "tenant_2",
        title: "About",
      },
      req: {
        user: {
          id: "cms_user_1",
          role: "staff",
          tenantId: "17",
        },
      },
    } as never);

    expect(result).toEqual({
      tenant: "17",
      title: "About",
    });
  });
});
