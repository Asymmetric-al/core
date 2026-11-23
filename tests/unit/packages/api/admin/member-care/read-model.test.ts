import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  readMemberCareDashboardSnapshot,
  readMemberCareDirectorySnapshot,
  readMemberCarePersonDetail,
} from "../../../../../../packages/api/src/reads/member-care";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const MEMBER_ID = "33333333-3333-4333-8333-333333333333";
const ACTOR_ID = "11111111-1111-4111-8111-111111111111";

function createFakeSession() {
  const rpcRows = { data: [] as unknown[], error: null as unknown };
  const lastContactsData = { data: [] as unknown[], error: null as unknown };
  const activity = { data: [] as unknown[], error: null as unknown };
  const select = vi.fn();
  const eq = vi.fn();
  const order = vi.fn();
  const limit = vi.fn();
  const or = vi.fn();
  const rpc = vi.fn(async () => rpcRows);
  const from = vi.fn((table: string) => {
    const result =
      table === "missionaries"
        ? lastContactsData
        : table === "member_care_activities"
          ? activity
          : { data: [], error: null };
    const chain = {
      select: (...args: unknown[]) => {
        select(table, ...args);
        return chain;
      },
      eq: (...args: unknown[]) => {
        eq(table, ...args);
        return chain;
      },
      order: (...args: unknown[]) => {
        order(table, ...args);
        return chain;
      },
      limit: (...args: unknown[]) => {
        limit(table, ...args);
        return chain;
      },
      or: (...args: unknown[]) => {
        or(table, ...args);
        return chain;
      },
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve(result).then(resolve),
    };
    return chain;
  });

  return {
    client: { from, rpc } as never,
    rpcRows,
    lastContactsData,
    activity,
    from,
    rpc,
    select,
    eq,
    order,
    limit,
    or,
  };
}

describe("Member Care read truth", () => {
  let fake: ReturnType<typeof createFakeSession>;

  beforeEach(() => {
    fake = createFakeSession();
    fake.rpcRows.data = [
      {
        id: MEMBER_ID,
        location: null,
        timezone: "UTC",
        health_status: "healthy",
        last_check_in: null,
        manual_attention: false,
        region: "Africa",
        mission_field: null,
        health_signals: {
          emotional: NaN,
          spiritual: 120,
          physical: -10,
          financial: 0,
        },
        birth_date: null,
        first_name: null,
        last_name: null,
        full_name: null,
        display_name: null,
        avatar_url: null,
        total_count: 290,
      },
    ];
    fake.lastContactsData.data = [
      {
        id: MEMBER_ID,
        video_call: [{ occurred_at: "2026-02-01T12:00:00Z" }],
        pastoral_note: [{ occurred_at: "2026-01-10T12:00:00Z" }],
      },
    ];
    fake.activity.data = [
      {
        id: "post",
        missionary_id: MEMBER_ID,
        author_user_id: ACTOR_ID,
        author_name_snapshot: "Care Worker",
        type: "pastoral_note",
        title: "Care thread update",
        description: "Team note",
        occurred_at: "2026-04-11T10:00:00Z",
      },
    ];
  });

  it("reads each member's latest contacts independently of the feed with tenant-scoped embeds", async () => {
    const result = await readMemberCareDashboardSnapshot(
      fake.client,
      TENANT_ID,
    );
    expect(result.lastContacts).toEqual({
      [MEMBER_ID]: {
        "Video Call": "2026-02-01T12:00:00Z",
        "Pastoral Note": "2026-01-10T12:00:00Z",
      },
    });
    for (const type of [
      "video_call",
      "in_person_visit",
      "check_in",
      "pastoral_note",
      "care_plan_update",
      "crisis_intervention",
      "birthday",
      "prayer_request",
    ]) {
      expect(fake.eq).toHaveBeenCalledWith(
        "missionaries",
        `${type}.tenant_id`,
        TENANT_ID,
      );
      expect(fake.eq).toHaveBeenCalledWith(
        "missionaries",
        `${type}.type`,
        type,
      );
      expect(fake.order).toHaveBeenCalledWith("missionaries", "occurred_at", {
        referencedTable: type,
        ascending: false,
      });
      expect(fake.limit).toHaveBeenCalledWith("missionaries", 1, {
        referencedTable: type,
      });
    }
    expect(fake.or).toHaveBeenCalledWith(
      "missionaries",
      "title.is.null,title.neq.Care thread update",
      { referencedTable: "pastoral_note" },
    );
    expect(
      fake.limit.mock.calls.filter(
        ([table, count]) => table === "missionaries" && count === 250,
      ),
    ).toHaveLength(1);
    expect(fake.rpc).toHaveBeenCalledWith("member_care_directory_rows", {
      p_tenant_id: TENANT_ID,
      p_personnel_id: null,
      p_limit: 250,
    });
  });

  it("exposes the full total separately from the capped directory and returns 0 when empty", async () => {
    const result = await readMemberCareDirectorySnapshot(
      fake.client,
      TENANT_ID,
    );
    expect(result.personnel).toHaveLength(1);
    expect(result.total).toBe(290);

    fake.rpcRows.data = [];
    const empty = await readMemberCareDirectorySnapshot(fake.client, TENANT_ID);
    expect(empty.personnel).toEqual([]);
    expect(empty.total).toBe(0);
  });

  it("does not invent contact, identity or wellbeing values", async () => {
    const result = await readMemberCareDashboardSnapshot(
      fake.client,
      TENANT_ID,
    );
    expect(result.personnel[0]).toMatchObject({
      name: "Name not set",
      nameMissing: true,
      initials: "",
      lastCheckIn: null,
      healthSignals: {
        emotional: null,
        spiritual: 100,
        physical: 0,
        financial: 0,
      },
    });
    expect(result.activities[0]).toMatchObject({ kind: "thread" });
    expect(result.personnelTotal).toBe(290);
  });

  it("keeps profile activities and private notes scoped to the requested member and actor", async () => {
    await readMemberCarePersonDetail(
      fake.client,
      TENANT_ID,
      MEMBER_ID,
      ACTOR_ID,
    );
    expect(fake.rpc).toHaveBeenCalledWith("member_care_directory_rows", {
      p_tenant_id: TENANT_ID,
      p_personnel_id: MEMBER_ID,
      p_limit: 1,
    });
    expect(fake.eq).toHaveBeenCalledWith(
      "member_care_activities",
      "missionary_id",
      MEMBER_ID,
    );
    expect(fake.eq).toHaveBeenCalledWith(
      "member_care_private_notes",
      "author_user_id",
      ACTOR_ID,
    );
  });
});
