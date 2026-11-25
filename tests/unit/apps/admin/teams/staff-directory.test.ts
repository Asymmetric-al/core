import { afterEach, describe, expect, it, vi } from "vitest";

import {
  STAFF_SUBROLE_OPTIONS,
  loadStaffAccounts,
  memberRowKey,
  staffRoleLabel,
} from "../../../../../apps/admin/app/(app)/settings/teams/staff-directory";

describe("staff-directory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("labels staff accounts by their sub-role, administrators as Administrator, and missionaries as Missionary", () => {
    expect(
      staffRoleLabel({
        id: "staff-1",
        membership_id: "m-1",
        role: "staff",
        staff_role: "development",
      }),
    ).toBe("Fundraising");
    expect(
      staffRoleLabel({
        id: "staff-2",
        membership_id: "m-2",
        role: "staff",
        staff_role: "mobilizer",
      }),
    ).toBe("Mobilizers");
    expect(
      staffRoleLabel({
        id: "staff-3",
        membership_id: "m-3",
        role: "staff",
        staff_role: "hr",
      }),
    ).toBe("HR");
    expect(
      staffRoleLabel({
        id: "admin-1",
        membership_id: "m-4",
        role: "admin",
        staff_role: "finance",
        is_tenant_admin: true,
      }),
    ).toBe("Administrator");
    expect(
      staffRoleLabel({
        id: "miss-1",
        membership_id: "m-5",
        role: "missionary",
        staff_role: null,
      }),
    ).toBe("Missionary");
  });

  it("exposes all five staff sub-role options", () => {
    expect(STAFF_SUBROLE_OPTIONS.map((option) => option.value).sort()).toEqual([
      "development",
      "finance",
      "hr",
      "member_care",
      "mobilizer",
    ]);
  });

  it("keys rows by membership_id so one person with two memberships is never collapsed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        users: [
          {
            id: "person-1",
            membership_id: "mem-staff",
            display_name: "Alex Dual",
            email: "alex@example.org",
            role: "staff",
            staff_role: "finance",
            is_tenant_admin: false,
            updated_at: "2026-11-23T09:00:00.000Z",
          },
          {
            id: "person-1",
            membership_id: "mem-missionary",
            display_name: "Alex Dual",
            email: "alex@example.org",
            role: "missionary",
            staff_role: null,
            is_tenant_admin: false,
            updated_at: "2026-11-23T09:00:01.000Z",
          },
          {
            id: "donor-1",
            membership_id: "mem-donor",
            display_name: "Dana Donor",
            email: "dana@example.org",
            role: "donor",
            staff_role: null,
            is_tenant_admin: false,
            updated_at: "2026-11-23T09:00:02.000Z",
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const rows = await loadStaffAccounts(new AbortController().signal);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(rows.map(memberRowKey)).toEqual(["mem-staff", "mem-missionary"]);
    expect(rows.map(staffRoleLabel)).toEqual(["Finance", "Missionary"]);
  });
});
