import { describe, expect, it } from "vitest";

import { getMissionaryPortalSnapshot } from "../../../../../packages/api/src/missionary-portal/service";

type Row = Record<string, unknown>;

/**
 * A small table-backed stand-in for the admin client: each query applies its
 * eq/in filters to the table's rows, so the test sees what the database would
 * return rather than which calls were made.
 */
function fakeDatabase(
  tables: Record<string, Row[]>,
  afterRead?: (table: string, rows: Row[]) => void,
) {
  return {
    from(table: string) {
      const filters: Array<(row: Row) => boolean> = [];
      const orders: Array<{ column: string; ascending: boolean }> = [];
      let window: [number, number] = [0, Number.POSITIVE_INFINITY];
      const rows = () =>
        (tables[table] ?? [])
          .filter((row) => filters.every((f) => f(row)))
          .sort((a, b) => {
            for (const { column, ascending } of orders) {
              const left = a[column] ?? null;
              const right = b[column] ?? null;
              if (left === right) continue;
              const comparison =
                left === null
                  ? 1
                  : right === null
                    ? -1
                    : String(left).localeCompare(String(right));
              return ascending ? comparison : -comparison;
            }
            return 0;
          })
          .slice(window[0], window[1])
          .map((row) => ({ ...row }));
      const query = {
        select: () => query,
        eq: (column: string, value: unknown) => {
          filters.push((row) => row[column] === value);
          return query;
        },
        in: (column: string, values: unknown[]) => {
          filters.push((row) => values.includes(row[column]));
          return query;
        },
        gt: (column: string, value: string) => {
          filters.push((row) => String(row[column]) > value);
          return query;
        },
        order: (column: string, options: { ascending: boolean }) => {
          orders.push({ column, ascending: options.ascending });
          return query;
        },
        limit: (count: number) => {
          window = [0, count];
          return query;
        },
        range: (from: number, to: number) => {
          window = [from, to + 1];
          return query;
        },
        single: () => {
          const [first] = rows();
          return Promise.resolve(
            first
              ? { data: first, error: null }
              : { data: null, error: { message: "not found" } },
          );
        },
        then: (resolve: (value: { data: Row[]; error: null }) => unknown) => {
          const data = rows();
          const result = resolve({ data, error: null });
          afterRead?.(table, data);
          return result;
        },
      };
      return query;
    },
  };
}

const TENANT = "tenant-1";
const PROFILE = "profile-jordan";
const MISSIONARY = "missionary-jordan";

const donor = (id: string) => ({
  id,
  tenant_id: TENANT,
  missionary_id: PROFILE,
  name: id,
  status: "active",
  total_given: 0,
  last_gift_amount: 0,
  last_gift_date: null,
  tags: [],
});

const pledge = (donorId: string, missionaryId: string, amount: number) => ({
  id: `pledge-${donorId}-${missionaryId}`,
  created_at: "2026-11-01T00:00:00.000Z",
  donor_id: donorId,
  missionary_id: missionaryId,
  tenant_id: TENANT,
  amount,
  currency: "USD",
  frequency: "monthly",
  status: "active",
});

describe("missionary portal committed support", () => {
  it("counts only recurring gifts made to this missionary", async () => {
    const supabase = fakeDatabase({
      profiles: [
        {
          id: PROFILE,
          tenant_id: TENANT,
          first_name: "Jordan",
          last_name: "Hale",
        },
      ],
      missionaries: [
        {
          id: MISSIONARY,
          profile_id: PROFILE,
          tenant_id: TENANT,
          funding_goal: 600_000,
        },
      ],
      donors: [donor("taylor"), donor("avery")],
      donor_pledges: [
        pledge("taylor", MISSIONARY, 5_000),
        // Avery also supports someone else; that commitment isn't Jordan's.
        pledge("avery", "missionary-someone-else", 9_000),
      ],
      donations: [],
      missionary_tasks: [],
      posts: [],
    });

    const snapshot = await getMissionaryPortalSnapshot({
      supabaseAdmin: supabase as never,
      profileId: PROFILE,
      tenantId: TENANT,
    });

    expect(snapshot.support.recurringMonthlyCents).toBe(5_000);
    // One count for every page: partners giving monthly to this missionary.
    expect(snapshot.support.monthlyPartnerCount).toBe(1);
    const monthly = snapshot.donorRelationships
      .filter((partner) => partner.hasActivePledge)
      .map((partner) => partner.id);
    expect(monthly).toEqual(["taylor"]);
  });

  // Large ministries have more active pledges than one page holds; every one
  // counts toward committed support.
  it("counts every active pledge, past one page of rows", async () => {
    const donors = Array.from({ length: 1_200 }, (_, i) => `partner-${i}`);
    const supabase = fakeDatabase({
      profiles: [{ id: PROFILE, tenant_id: TENANT, first_name: "Jordan" }],
      missionaries: [
        { id: MISSIONARY, profile_id: PROFILE, tenant_id: TENANT },
      ],
      donors: donors.map(donor),
      donor_pledges: donors.map((id) => pledge(id, MISSIONARY, 1_000)),
      donations: [],
      missionary_tasks: [],
      posts: [],
    });

    const snapshot = await getMissionaryPortalSnapshot({
      supabaseAdmin: supabase as never,
      profileId: PROFILE,
      tenantId: TENANT,
    });

    expect(snapshot.support.monthlyPartnerCount).toBe(1_200);
    expect(snapshot.support.recurringMonthlyCents).toBe(1_200_000);
  });

  it("counts the newest pledge when primary-key order differs from creation order", async () => {
    const supabase = fakeDatabase({
      profiles: [{ id: PROFILE, tenant_id: TENANT, first_name: "Jordan" }],
      missionaries: [
        { id: MISSIONARY, profile_id: PROFILE, tenant_id: TENANT },
      ],
      donor_pledges: [
        {
          ...pledge("partner", MISSIONARY, 1_000),
          id: "a-older",
          created_at: "2026-10-01T00:00:00.000Z",
        },
        {
          ...pledge("partner", MISSIONARY, 2_000),
          id: "z-newer",
        },
      ],
    });
    const snapshot = await getMissionaryPortalSnapshot({
      supabaseAdmin: supabase as never,
      profileId: PROFILE,
      tenantId: TENANT,
    });
    expect(snapshot.support.monthlyPartnerCount).toBe(1);
    expect(snapshot.support.recurringMonthlyCents).toBe(2_000);
  });

  it("does not skip unread pledges when an earlier-page pledge is cancelled", async () => {
    const pledges = Array.from({ length: 1_001 }, (_, index) =>
      pledge(`partner-${String(index).padStart(4, "0")}`, MISSIONARY, 1_000),
    );
    let pageCount = 0;
    const supabase = fakeDatabase(
      {
        profiles: [{ id: PROFILE, tenant_id: TENANT, first_name: "Jordan" }],
        missionaries: [
          { id: MISSIONARY, profile_id: PROFILE, tenant_id: TENANT },
        ],
        donor_pledges: pledges,
      },
      (table, rows) => {
        if (table !== "donor_pledges" || pageCount++ !== 0) return;
        const firstRead = pledges.find((row) => row.id === rows[0].id);
        if (firstRead) firstRead.status = "cancelled";
      },
    );

    const snapshot = await getMissionaryPortalSnapshot({
      supabaseAdmin: supabase as never,
      profileId: PROFILE,
      tenantId: TENANT,
    });

    // Already-read rows reflect their read time; an unrelated unread pledge
    // must still be included after the active set shrinks between requests.
    expect(snapshot.support.monthlyPartnerCount).toBe(1_001);
    expect(snapshot.support.recurringMonthlyCents).toBe(1_001_000);
  });
});
