import { describe, expect, it } from "vitest";

import { hasAdminReadAccess } from "../../../../../apps/admin/lib/admin-access";

describe("apps/admin/lib/admin-access", () => {
  it("returns true for admin read roles", () => {
    expect(hasAdminReadAccess("admin")).toBe(true);
    expect(hasAdminReadAccess("staff")).toBe(true);
    expect(hasAdminReadAccess("super_admin")).toBe(true);
  });

  it("returns false for non-admin roles and nullish values", () => {
    expect(hasAdminReadAccess("donor")).toBe(false);
    expect(hasAdminReadAccess("missionary")).toBe(false);
    expect(hasAdminReadAccess(null)).toBe(false);
    expect(hasAdminReadAccess(undefined)).toBe(false);
  });
});
