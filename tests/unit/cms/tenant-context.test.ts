import { beforeAll, describe, expect, it } from "vitest";

type Module =
  typeof import("../../../apps/admin/src/cms/access/tenant-context");
let tenantContext: Module;

beforeAll(async () => {
  tenantContext =
    await import("../../../apps/admin/src/cms/access/tenant-context");
});

const TENANT = "00000000-0000-4000-8000-000000000101";
const user = (staffRole: string | null, isTenantAdmin = false) => ({
  id: "00000000-0000-4000-8000-0000000000a1",
  collection: "principal-links",
  tenantId: TENANT,
  assignmentId: "00000000-0000-4000-8000-000000000201",
  staffRole,
  isTenantAdmin,
});

describe("tenant-context: the actor Web Studio acts for (D-18: WP6 part 2b replaces the CMS tenant document and role with the assignment's tenant UUID, sub-role and admin flag)", () => {
  it("returns an unauthenticated context without req.user", () => {
    expect(tenantContext.getTenantContext({ user: null } as never)).toEqual({
      isAuthenticated: false,
      userId: null,
      tenantId: null,
      assignmentId: null,
      staffRole: null,
      isTenantAdmin: false,
    });
  });

  it("reads the tenant UUID, the row, the sub-role and the admin flag", () => {
    expect(
      tenantContext.getTenantContext({
        user: user("development", true),
      } as never),
    ).toEqual({
      isAuthenticated: true,
      userId: user("development").id,
      tenantId: TENANT,
      assignmentId: user("development").assignmentId,
      staffRole: "development",
      isTenantAdmin: true,
    });
  });

  it("knows an actor only from a principal-links user, and only one holding web_studio.edit may edit", () => {
    expect(
      tenantContext.readCmsActor({
        user: { ...user("development"), collection: "cms-users" },
      } as never),
    ).toBeNull();
    for (const role of [
      "development",
      "finance",
      "hr",
      "member_care",
      "mobilizer",
    ]) {
      expect(
        tenantContext.readEditingActor({ user: user(role) } as never)?.tenantId,
        role,
      ).toBe(TENANT);
    }
    expect(
      tenantContext.readEditingActor({ user: user(null) } as never),
    ).toBeNull();
    expect(
      tenantContext.readEditingActor({ user: user(null, true) } as never),
    ).toBeNull();
  });
});
