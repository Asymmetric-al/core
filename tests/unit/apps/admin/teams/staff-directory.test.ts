import { describe, expect, it } from "vitest";

import {
  STAFF_ROLE_LABELS,
  staffRoleLabel,
} from "../../../../../apps/admin/app/(app)/admin/teams/staff-directory";

describe("staffRoleLabel", () => {
  it("labels staff accounts by their staff sub-role, in Mission Control's own words", () => {
    // The `development` sub-role is what Mission Control calls Fundraising,
    // and `mobilizer` is Mobilizers (`packages/lib/mission-control/roles.ts`;
    // the users list files them under its `fundraising` and `mobilizers`
    // labels). The directory does not add a second word for either.
    expect(
      staffRoleLabel({
        id: "staff-1",
        role: "staff",
        staff_role: "development",
      }),
    ).toBe("Fundraising");
    expect(
      staffRoleLabel({
        id: "staff-2",
        role: "staff",
        staff_role: "mobilizer",
      }),
    ).toBe("Mobilizers");
  });

  it("keeps the list's filter labels apart from the sub-roles it shows", () => {
    // One request goes out for each key of STAFF_ROLE_LABELS, so a sub-role's
    // name must not become a key: it would ask the list for the same people
    // twice.
    expect(Object.keys(STAFF_ROLE_LABELS).sort()).toEqual([
      "admin",
      "events",
      "finance",
      "fundraising",
      "member_care",
      "mobilizers",
      "staff",
      "super_admin",
    ]);
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
