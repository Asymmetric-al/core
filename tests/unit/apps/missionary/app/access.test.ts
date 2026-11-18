import { describe, expect, it } from "vitest";

import {
  canAccessMissionaryApp,
  MISSIONARY_ALLOWED_ROLES,
} from "../../../../../apps/missionary/app/access";

/**
 * AL-2675 (WP2a; plan 5.1): the missionary workspace acts on the missionary
 * row. Staff and administrators work in Mission Control; a person who is
 * both staff and a missionary enters here under their missionary row. The
 * elevated support roles this list used to carry are gone (decision table,
 * docs/audits/core-crm-cms-database-proofs/wp2a-membership-decision-table.md).
 */
describe("apps/missionary/app/access", () => {
  it("allows only the missionary role", () => {
    expect(MISSIONARY_ALLOWED_ROLES).toEqual(["missionary"]);
  });

  it("refuses staff, administrators, platform roles and donors", () => {
    expect(canAccessMissionaryApp("missionary")).toBe(true);
    expect(canAccessMissionaryApp("admin")).toBe(false);
    expect(canAccessMissionaryApp("staff")).toBe(false);
    expect(canAccessMissionaryApp("super_admin")).toBe(false);
    expect(canAccessMissionaryApp("donor")).toBe(false);
    expect(canAccessMissionaryApp(null)).toBe(false);
  });
});
