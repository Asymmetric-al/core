import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAdminClientMock,
  fromMock,
  missionaryMaybeSingleMock,
  profileMaybeSingleMock,
  activityInsertMock,
  activitySingleMock,
  requirementInsertMock,
  requirementSingleMock,
} = vi.hoisted(() => {
  const missionaryMaybeSingle = vi.fn();
  const profileMaybeSingle = vi.fn();
  const activityInsert = vi.fn();
  const activitySingle = vi.fn();
  const requirementInsert = vi.fn();
  const requirementSingle = vi.fn();
  const from = vi.fn((table: string) => {
    if (table === "missionaries") {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        maybeSingle: missionaryMaybeSingle,
      };
      return chain;
    }

    if (table === "profiles") {
      const chain = {
        select: vi.fn(() => chain),
        eq: vi.fn(() => chain),
        maybeSingle: profileMaybeSingle,
      };
      return chain;
    }

    if (table === "member_care_activities") {
      const chain = {} as {
        insert: ReturnType<typeof vi.fn>;
        select: ReturnType<typeof vi.fn>;
        single: typeof activitySingle;
      };
      chain.insert = activityInsert.mockImplementation(() => chain);
      chain.select = vi.fn(() => chain);
      chain.single = activitySingle;
      return chain;
    }

    if (table === "member_care_requirements") {
      const chain = {} as {
        insert: ReturnType<typeof vi.fn>;
        select: ReturnType<typeof vi.fn>;
        single: typeof requirementSingle;
      };
      chain.insert = requirementInsert.mockImplementation(() => chain);
      chain.select = vi.fn(() => chain);
      chain.single = requirementSingle;
      return chain;
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    getAdminClientMock: vi.fn(),
    fromMock: from,
    missionaryMaybeSingleMock: missionaryMaybeSingle,
    profileMaybeSingleMock: profileMaybeSingle,
    activityInsertMock: activityInsert,
    activitySingleMock: activitySingle,
    requirementInsertMock: requirementInsert,
    requirementSingleMock: requirementSingle,
  };
});

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

const { revalidateTagMock } = vi.hoisted(() => ({
  revalidateTagMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import {
  logCareActivity,
  upsertCareRequirement,
} from "../../../../../../packages/api/src/admin/member-care/mutations";

describe("api/admin/member-care/mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });

    missionaryMaybeSingleMock.mockResolvedValue({
      data: { id: "missionary-1" },
      error: null,
    });

    profileMaybeSingleMock.mockResolvedValue({
      data: {
        display_name: "Jordan Hale",
        full_name: "Jordan Hale",
        first_name: "Jordan",
        last_name: "Hale",
      },
      error: null,
    });

    activitySingleMock.mockResolvedValue({
      data: { id: "activity-1" },
      error: null,
    });

    requirementSingleMock.mockResolvedValue({
      data: { id: "requirement-1" },
      error: null,
    });
  });

  it("maps display activity labels to db enum values for activity writes", async () => {
    await logCareActivity("tenant-1", "user-1", {
      personnelId: "missionary-1",
      type: "Check-in",
      content: "Quick check-in",
    });

    expect(activityInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "check_in",
        title: "Check-in",
      }),
    );
  });

  it("maps display activity labels to db enum values for requirement writes", async () => {
    await upsertCareRequirement("tenant-1", "user-1", {
      personnelId: "missionary-1",
      activityType: "Check-in",
      intervalDays: 30,
      notes: "Monthly rhythm",
    });

    expect(requirementInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        activity_type: "check_in",
      }),
    );
  });

  it("revalidates all member-care cache tags including dashboard after writes", async () => {
    await logCareActivity("tenant-1", "user-1", {
      personnelId: "missionary-1",
      type: "Check-in",
      content: "Quick check-in",
    });

    expect(revalidateTagMock).toHaveBeenCalledWith("member-care", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "member-care:tenant-1",
      "max",
    );
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "member-care:directory",
      "max",
    );
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "member-care:dashboard",
      "max",
    );
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "member-care:activity",
      "max",
    );
    expect(revalidateTagMock).toHaveBeenCalledWith(
      "member-care:private-notes",
      "max",
    );
  });
});
