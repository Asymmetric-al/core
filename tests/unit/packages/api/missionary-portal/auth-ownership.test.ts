import { describe, expect, it, vi } from "vitest";

import {
  assertMissionaryDonorAccess,
  getMissionaryTask,
} from "../../../../../packages/api/src/missionary-portal/service";

type QueryResult<T> = {
  data: T | null;
  error: { code?: string; message: string } | null;
};

function createQueryMock<T>(result: QueryResult<T>) {
  const query: {
    select: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    single: ReturnType<typeof vi.fn>;
  } = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
  };

  return query;
}

describe("missionary portal auth and ownership", () => {
  it("checks donor relationship access by donor, tenant, and signed-in missionary profile", async () => {
    const query = createQueryMock({
      data: { id: "donor-1" },
      error: null,
    });
    const supabase = { from: vi.fn(() => query) };

    await assertMissionaryDonorAccess({
      supabaseAdmin: supabase as never,
      donorId: "donor-1",
      profileId: "missionary-profile-1",
      tenantId: "tenant-1",
    });

    expect(supabase.from).toHaveBeenCalledWith("donors");
    expect(query.eq).toHaveBeenCalledWith("id", "donor-1");
    expect(query.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(query.eq).toHaveBeenCalledWith(
      "missionary_id",
      "missionary-profile-1",
    );
  });

  it("denies donor relationship access for another missionary", async () => {
    const query = createQueryMock({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    await expect(
      assertMissionaryDonorAccess({
        supabaseAdmin: { from: vi.fn(() => query) } as never,
        donorId: "donor-1",
        profileId: "other-missionary-profile",
        tenantId: "tenant-1",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Donor relationship not found",
    });
  });

  it("scopes missionary task lookup by task id and signed-in missionary profile", async () => {
    const query = createQueryMock({
      data: {
        id: "task-1",
        missionary_id: "missionary-profile-1",
        donor_id: null,
        title: "Call donor",
        description: null,
        task_type: "call",
        status: "not_started",
        priority: "high",
        sort_key: 1,
        due_date: null,
        completed_at: null,
        is_auto_generated: false,
        created_at: "2026-05-15T00:00:00.000Z",
        updated_at: "2026-05-15T00:00:00.000Z",
        donor: null,
      },
      error: null,
    });
    const supabase = { from: vi.fn(() => query) };

    const task = await getMissionaryTask({
      supabaseAdmin: supabase as never,
      taskId: "task-1",
      profileId: "missionary-profile-1",
    });

    expect(task.id).toBe("task-1");
    expect(supabase.from).toHaveBeenCalledWith("missionary_tasks");
    expect(query.eq).toHaveBeenCalledWith("id", "task-1");
    expect(query.eq).toHaveBeenCalledWith(
      "missionary_id",
      "missionary-profile-1",
    );
  });

  it("denies task access for another missionary", async () => {
    const query = createQueryMock({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });

    await expect(
      getMissionaryTask({
        supabaseAdmin: { from: vi.fn(() => query) } as never,
        taskId: "task-1",
        profileId: "other-missionary-profile",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Missionary task not found",
    });
  });
});
