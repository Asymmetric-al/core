import { describe, expect, it } from "vitest";

import { staffRoleLabel } from "../../../../../apps/admin/app/(app)/admin/teams/staff-directory";

describe("staffRoleLabel", () => {
  it("labels staff accounts by their staff sub-role", () => {
    expect(
      staffRoleLabel({
        id: "staff-1",
        role: "staff",
        staff_role: "development",
      }),
    ).toBe("Development");
  });

  it("keeps tenant administrators labelled as administrators", () => {
    expect(
      staffRoleLabel({
        id: "admin-1",
        role: "admin",
        staff_role: "finance",
      }),
    ).toBe("Administrator");
  });
});
