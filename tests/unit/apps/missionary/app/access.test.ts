import { describe, expect, it } from "vitest";

import {
  canAccessMissionaryApp,
  MISSIONARY_ALLOWED_ROLES,
} from "../../../../../apps/missionary/app/access";

describe("apps/missionary/app/access", () => {
  it("keeps elevated support roles in the missionary allowlist", () => {
    expect(MISSIONARY_ALLOWED_ROLES).toEqual(
      expect.arrayContaining(["missionary", "admin", "staff", "super_admin"]),
    );
  });

  it("allows admin and staff access alongside missionary roles", () => {
    expect(canAccessMissionaryApp("missionary")).toBe(true);
    expect(canAccessMissionaryApp("admin")).toBe(true);
    expect(canAccessMissionaryApp("staff")).toBe(true);
    expect(canAccessMissionaryApp("super_admin")).toBe(true);
    expect(canAccessMissionaryApp("donor")).toBe(false);
    expect(canAccessMissionaryApp(null)).toBe(false);
  });
});
