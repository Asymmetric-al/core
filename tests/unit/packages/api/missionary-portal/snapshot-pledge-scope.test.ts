import { describe, expect, it } from "vitest";

import { getMissionaryPortalSnapshot } from "../../../../../packages/api/src/missionary-portal/service";

type Row = Record<string, unknown>;

/**
 * A small table-backed stand-in for the admin client: each query applies its
 * eq/in filters to the table's rows, so the test sees what the database would
 * return rather than which calls were made.
 */
function fakeDatabase(tables: Record<string, Row[]>) {
  return {
    from(table: string) {
      const filters: Array<(row: Row) => boolean> = [];
      const rows = () =>
        (tables[table] ?? []).filter((row) => filters.every((f) => f(row)));
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
        order: () => query,
        limit: () => query,
        single: () => {
          const [first] = rows();
          return Promise.resolve(
            first
              ? { data: first, error: null }
              : { data: null, error: { message: "not found" } },
          );
        },
        then: (resolve: (value: { data: Row[]; error: null }) => unknown) =>
          resolve({ data: rows(), error: null }),
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
  donor_id: donorId,
  missionary_id: missionaryId,
  tenant_id: TENANT,
  amount,
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
});
