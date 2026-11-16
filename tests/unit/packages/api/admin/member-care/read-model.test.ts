import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, directory, activity, select, eq, order, limit, or } = vi.hoisted(
  () => {
    const directory = { data: [] as unknown[], count: 290, error: null };
    const activity = { data: [] as unknown[], error: null };
    const select = vi.fn();
    const eq = vi.fn();
    const order = vi.fn();
    const limit = vi.fn();
    const or = vi.fn();
    const from = vi.fn((table: string) => {
      const result =
        table === "missionaries"
          ? directory
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
        maybeSingle: async () => ({
          data: directory.data[0] ?? null,
          error: null,
        }),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve(result).then(resolve),
      };
      return chain;
    });
    return { from, directory, activity, select, eq, order, limit, or };
  },
);
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: { from }, error: null }),
}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

import {
  readMemberCareDashboardSnapshot,
  readMemberCarePersonDetail,
  readMemberCareDirectorySnapshot,
} from "../../../../../../packages/api/src/reads/member-care";

beforeEach(() => {
  vi.clearAllMocks();
  directory.data = [
    {
      id: "member-1",
      profile: null,
      location: null,
      last_check_in: null,
      region: "Africa",
      health_signals: {
        emotional: NaN,
        spiritual: 120,
        physical: -10,
        financial: 0,
      },
    },
  ];
  activity.data = [
    {
      id: "post",
      missionary_id: "member-1",
      type: "pastoral_note",
      title: "Care thread update",
      description: "Team note",
      occurred_at: "2026-04-11T10:00:00Z",
    },
  ];
});

describe("Member Care read truth", () => {
  it("reads each member's latest contacts independently of the feed with tenant-scoped embeds", async () => {
    directory.data = [
      {
        id: "member-1",
        profile: null,
        video_call: [{ occurred_at: "2026-02-01T12:00:00Z" }],
        pastoral_note: [{ occurred_at: "2026-01-10T12:00:00Z" }],
      },
    ];
    const result = await readMemberCareDashboardSnapshot("tenant-1");
    expect(result.lastContacts).toEqual({
      "member-1": {
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
      expect(eq).toHaveBeenCalledWith(
        "missionaries",
        `${type}.tenant_id`,
        "tenant-1",
      );
      expect(eq).toHaveBeenCalledWith("missionaries", `${type}.type`, type);
      expect(order).toHaveBeenCalledWith("missionaries", "occurred_at", {
        referencedTable: type,
        ascending: false,
      });
      expect(limit).toHaveBeenCalledWith("missionaries", 1, {
        referencedTable: type,
      });
    }
    expect(or).toHaveBeenCalledWith(
      "missionaries",
      "title.is.null,title.neq.Care thread update",
      { referencedTable: "pastoral_note" },
    );
    expect(
      limit.mock.calls.filter(
        ([table, count]) => table === "missionaries" && count === 250,
      ),
    ).toHaveLength(2);
  });
  it("exposes the full total separately from the capped directory", async () => {
    const result = await readMemberCareDirectorySnapshot("tenant-1");
    expect(result.personnel).toHaveLength(1);
    expect(result.total).toBe(290);
  });
  it("does not invent contact, identity or wellbeing values", async () => {
    const result = await readMemberCareDashboardSnapshot("tenant-1");
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
    expect(select).toHaveBeenCalledWith("missionaries", expect.any(String), {
      count: "exact",
    });
    expect(eq).toHaveBeenCalledWith("missionaries", "tenant_id", "tenant-1");
  });
  it("keeps profile activities scoped to the requested member", async () => {
    await readMemberCarePersonDetail("tenant-1", "member-1", "actor-1");
    expect(eq).toHaveBeenCalledWith(
      "member_care_activities",
      "missionary_id",
      "member-1",
    );
    expect(eq).toHaveBeenCalledWith(
      "member_care_private_notes",
      "author_user_id",
      "actor-1",
    );
  });
});
