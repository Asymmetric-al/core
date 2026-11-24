import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpcMock, revalidateTagMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  revalidateTagMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: revalidateTagMock,
}));

import {
  createCarePrivateNote,
  createCareThreadPost,
  logCareActivity,
  setManualAttentionFlag,
  upsertCareGoal,
  upsertCareRequirement,
} from "../../../../../../packages/api/src/admin/member-care/mutations";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const MISSIONARY_ID = "33333333-3333-4333-8333-333333333333";
const RESULT_ID = "44444444-4444-4444-8444-444444444444";

describe("api/admin/member-care/mutations", () => {
  const sessionClient = { rpc: rpcMock } as never;

  beforeEach(() => {
    vi.clearAllMocks();
    rpcMock.mockResolvedValue({
      data: [{ id: RESULT_ID }],
      error: null,
    });
  });

  it("maps display activity labels to db enum values for activity writes", async () => {
    const result = await logCareActivity(sessionClient, TENANT_ID, {
      personnelId: MISSIONARY_ID,
      type: "Check-in",
      content: "Quick check-in",
    });

    expect(result).toEqual({ id: RESULT_ID });
    expect(rpcMock).toHaveBeenCalledWith("log_care_activity", {
      p_personnel_id: MISSIONARY_ID,
      p_type: "check_in",
      p_content: "Quick check-in",
    });
  });

  it("maps display activity labels to db enum values for requirement writes", async () => {
    const result = await upsertCareRequirement(sessionClient, TENANT_ID, {
      personnelId: MISSIONARY_ID,
      activityType: "Check-in",
      intervalDays: 30,
      notes: "Monthly rhythm",
    });

    expect(result).toEqual({ id: RESULT_ID });
    expect(rpcMock).toHaveBeenCalledWith("upsert_care_requirement", {
      p_personnel_id: MISSIONARY_ID,
      p_activity_type: "check_in",
      p_interval_days: 30,
      p_notes: "Monthly rhythm",
      p_requirement_id: null,
    });
  });

  it("calls the guarded RPCs for thread, private note, goal, and manual attention", async () => {
    await createCareThreadPost(sessionClient, TENANT_ID, {
      personnelId: MISSIONARY_ID,
      content: "Thread note",
    });
    expect(rpcMock).toHaveBeenCalledWith("create_care_thread_post", {
      p_personnel_id: MISSIONARY_ID,
      p_content: "Thread note",
    });

    await createCarePrivateNote(sessionClient, TENANT_ID, {
      personnelId: MISSIONARY_ID,
      content: "Private note",
    });
    expect(rpcMock).toHaveBeenCalledWith("create_care_private_note", {
      p_personnel_id: MISSIONARY_ID,
      p_content: "Private note",
    });

    await upsertCareGoal(sessionClient, TENANT_ID, {
      personnelId: MISSIONARY_ID,
      title: "Goal title",
      status: "active",
      targetDate: "2026-12-31",
    });
    expect(rpcMock).toHaveBeenCalledWith("upsert_care_goal", {
      p_personnel_id: MISSIONARY_ID,
      p_title: "Goal title",
      p_status: "active",
      p_target_date: "2026-12-31",
      p_goal_id: null,
    });

    await setManualAttentionFlag(sessionClient, TENANT_ID, {
      personnelId: MISSIONARY_ID,
      manualAttention: true,
    });
    expect(rpcMock).toHaveBeenCalledWith("set_manual_attention_flag", {
      p_personnel_id: MISSIONARY_ID,
      p_manual_attention: true,
    });
  });

  it("revalidates all member-care cache tags including dashboard after writes", async () => {
    await logCareActivity(sessionClient, TENANT_ID, {
      personnelId: MISSIONARY_ID,
      type: "Check-in",
      content: "Quick check-in",
    });

    expect(revalidateTagMock).toHaveBeenCalledWith("member-care", "max");
    expect(revalidateTagMock).toHaveBeenCalledWith(
      `member-care:${TENANT_ID}`,
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
