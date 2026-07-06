import { describe, expect, it } from "vitest";

import {
  buildMissionaryDonorRows,
  getMissionaryDonorRows,
} from "../../src/missionary-portal/donors";

/**
 * TDD — the missionary "Partners" list is built + redacted SERVER-side so the
 * client never receives raw identity for an anonymous donor.
 * Spec DONOR_ANONYMITY_GUEST_GIVING_SPEC §7.2 / §12.1.
 */

const missionaryProfileId = "prof-1";

const anonDonor = {
  id: "donor-A",
  missionary_id: "prof-1",
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "+1-555-0100",
  mobile: "+1-555-0101",
  preferred_contact: "email",
  avatar_url: "https://cdn/a.png",
  location: "Chiang Mai",
  address: { street: "1 Analytical Way", city: "Chiang Mai" },
  organization: "Babbage Co",
  notes: "met at conference",
  tags: ["major-donor"],
  type: "Individual",
  status: "Active",
  total_given: 50000,
  last_gift_date: "2026-07-01",
  last_gift_amount: 10000,
  frequency: "Monthly",
  score: 90,
  has_active_pledge: true,
  created_at: "2025-01-01",
  giving_preferences: { defaultAnonymousToRecipient: true },
};

const namedDonor = {
  ...anonDonor,
  id: "donor-B",
  name: "Blaise Pascal",
  email: "blaise@example.com",
  phone: "+1-555-0200",
  location: "Paris",
  tags: ["monthly"],
  giving_preferences: { defaultAnonymousToRecipient: false },
};

const emptyPrefsDonor = {
  ...anonDonor,
  id: "donor-D",
  name: "Clara Empty",
  email: "clara.empty@example.com",
  phone: "+1-555-0300",
  mobile: "+1-555-0301",
  location: "Lisbon",
  address: { street: "3 Empty Lane", city: "Lisbon" },
  organization: "Empty Prefs Org",
  notes: "empty prefs private note",
  tags: ["empty-prefs-tag"],
  giving_preferences: {},
};

const nullPrefsDonor = {
  ...anonDonor,
  id: "donor-E",
  name: "Null Prefs",
  email: "null.prefs@example.com",
  phone: "+1-555-0400",
  mobile: "+1-555-0401",
  location: "Oslo",
  address: { street: "4 Null Court", city: "Oslo" },
  organization: "Null Prefs Org",
  notes: "null prefs private note",
  tags: ["null-prefs-tag"],
  giving_preferences: null,
};

const { giving_preferences: _missingGivingPreferences, ...missingPrefsDonor } =
  {
    ...anonDonor,
    id: "donor-F",
    name: "Missing Prefs",
    email: "missing.prefs@example.com",
    phone: "+1-555-0500",
    mobile: "+1-555-0501",
    location: "Quito",
    address: { street: "5 Missing Road", city: "Quito" },
    organization: "Missing Prefs Org",
    notes: "missing prefs private note",
    tags: ["missing-prefs-tag"],
  };

const otherMissionaryDonor = {
  ...namedDonor,
  id: "donor-C",
  missionary_id: "prof-OTHER",
  name: "Not Mine",
  email: "notmine@example.com",
};

const activities = [
  {
    id: "act-A",
    donor_id: "donor-A",
    type: "note",
    date: "2026-07-01",
    created_at: "2026-07-01",
    title: "Called Ada",
    note: "ada@example.com follow-up",
  },
  {
    id: "act-D",
    donor_id: "donor-D",
    type: "note",
    date: "2026-07-01",
    created_at: "2026-07-01",
    title: "Called Clara Empty",
    note: "clara.empty@example.com follow-up",
  },
  {
    id: "act-E",
    donor_id: "donor-E",
    type: "note",
    date: "2026-07-01",
    created_at: "2026-07-01",
    title: "Called Null Prefs",
    note: "null.prefs@example.com follow-up",
  },
  {
    id: "act-F",
    donor_id: "donor-F",
    type: "note",
    date: "2026-07-01",
    created_at: "2026-07-01",
    title: "Called Missing Prefs",
    note: "missing.prefs@example.com follow-up",
  },
];

const pledges = [
  {
    id: "pl-A",
    donor_id: "donor-A",
    missionary_id: "prof-1",
    amount: 100,
    frequency: "Monthly",
    status: "active",
    start_date: "2026-01-01",
    created_at: "2026-01-01",
    total_paid: 600,
    total_expected: 1200,
  },
];

describe("buildMissionaryDonorRows", () => {
  const rows = buildMissionaryDonorRows({
    missionaryProfileId,
    donors: [
      anonDonor,
      namedDonor,
      emptyPrefsDonor,
      nullPrefsDonor,
      missingPrefsDonor,
      otherMissionaryDonor,
    ],
    activities,
    pledges,
  });

  it("only returns donors for THIS missionary (tenant/ownership scoping)", () => {
    expect(rows.map((r) => r.id).sort()).toEqual([
      "donor-A",
      "donor-B",
      "donor-D",
      "donor-E",
      "donor-F",
    ]);
  });

  function expectRedactedDonorRow(id: string, rawFragments: string[]) {
    const row = rows.find((r) => r.id === id)!;
    expect(row.name).toBe("Anonymous donor");
    expect(row.email).toBe("");
    expect(row.phone).toBe("");
    expect(row.mobile).toBeUndefined();
    expect(row.avatar_url).toBeUndefined();
    expect(row.location).toBe("");
    expect(row.address).toEqual({});
    expect(row.organization).toBeUndefined();
    expect(row.notes).toBeUndefined();
    expect(row.tags).toEqual([]);
    expect(row.activities).toEqual([]);

    const serialized = JSON.stringify(row);
    for (const fragment of rawFragments) {
      expect(serialized).not.toContain(fragment);
    }

    return row;
  }

  it("redacts the anonymous donor — Anonymous donor + zero identifiers", () => {
    const a = expectRedactedDonorRow("donor-A", [
      "Ada",
      "ada@example.com",
      "555-0100",
      "555-0101",
      "Chiang Mai",
      "1 Analytical Way",
      "Babbage",
      "met at conference",
      "major-donor",
      "Called Ada",
      "follow-up",
    ]);
    // support stats stay visible (§7.2)
    expect(a.total_given).toBe(50000);
    expect(a.status).toBe("Active");
    expect(a.has_active_pledge).toBe(true);
  });

  it("redacts donors with empty, null, or missing giving_preferences", () => {
    expectRedactedDonorRow("donor-D", [
      "Clara Empty",
      "clara.empty@example.com",
      "555-0300",
      "555-0301",
      "Lisbon",
      "3 Empty Lane",
      "Empty Prefs Org",
      "empty prefs private note",
      "empty-prefs-tag",
      "Called Clara Empty",
    ]);
    expectRedactedDonorRow("donor-E", [
      "Null Prefs",
      "null.prefs@example.com",
      "555-0400",
      "555-0401",
      "Oslo",
      "4 Null Court",
      "Null Prefs Org",
      "null prefs private note",
      "null-prefs-tag",
      "Called Null Prefs",
    ]);
    expectRedactedDonorRow("donor-F", [
      "Missing Prefs",
      "missing.prefs@example.com",
      "555-0500",
      "555-0501",
      "Quito",
      "5 Missing Road",
      "Missing Prefs Org",
      "missing prefs private note",
      "missing-prefs-tag",
      "Called Missing Prefs",
    ]);
  });

  it("shows the named (consented) donor in full", () => {
    const b = rows.find((r) => r.id === "donor-B")!;
    expect(b.name).toBe("Blaise Pascal");
    expect(b.email).toBe("blaise@example.com");
    expect(b.phone).toBe("+1-555-0200");
  });

  it("leaks NO raw identity of anonymous donors anywhere in their payloads", () => {
    for (const id of ["donor-A", "donor-D", "donor-E", "donor-F"]) {
      expect(rows.find((r) => r.id === id)?.name).toBe("Anonymous donor");
    }
  });
});

type FakeQueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

class FakeSupabaseQuery {
  readonly operations: Array<{
    method: string;
    column?: string;
    value?: unknown;
    values?: unknown[];
    from?: number;
    to?: number;
  }> = [];

  constructor(
    readonly table: string,
    private readonly result: FakeQueryResult,
  ) {}

  select(_columns: string) {
    this.operations.push({ method: "select" });
    return this;
  }

  eq(column: string, value: unknown) {
    this.operations.push({ method: "eq", column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.operations.push({ method: "in", column, values });
    return this;
  }

  order(column: string, options?: unknown) {
    this.operations.push({ method: "order", column, value: options });
    return this;
  }

  range(from: number, to: number) {
    this.operations.push({ method: "range", from, to });
    return this;
  }

  limit(value: number) {
    this.operations.push({ method: "limit", value });
    return this;
  }

  then<TResult1 = FakeQueryResult, TResult2 = never>(
    onfulfilled?:
      | ((value: FakeQueryResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    const rangeOperation = this.operations.find(
      (operation) => operation.method === "range",
    );
    const data =
      this.result.data && rangeOperation
        ? this.result.data.slice(
            rangeOperation.from,
            (rangeOperation.to ?? -1) + 1,
          )
        : this.result.data;

    return Promise.resolve({ ...this.result, data }).then(
      onfulfilled,
      onrejected,
    );
  }
}

function createFakeSupabaseAdmin(results: Record<string, FakeQueryResult>) {
  const queries: Record<string, FakeSupabaseQuery> = {};
  return {
    queries,
    client: {
      from(table: string) {
        const query = new FakeSupabaseQuery(table, results[table]!);
        queries[table] = query;
        return query;
      },
    },
  };
}

describe("getMissionaryDonorRows", () => {
  it("returns a redacted donor page and scopes related rows to page donor ids", async () => {
    const fake = createFakeSupabaseAdmin({
      donors: {
        data: [
          namedDonor,
          { ...namedDonor, id: "donor-C", name: "Charles Babbage" },
          { ...namedDonor, id: "donor-D", name: "Dorothy Vaughan" },
        ],
        error: null,
      },
      donor_activities: {
        data: [
          {
            id: "act-B",
            donor_id: "donor-B",
            type: "note",
            date: "2026-07-01",
            created_at: "2026-07-01",
            title: "Blaise note",
          },
          {
            id: "act-C",
            donor_id: "donor-C",
            type: "note",
            date: "2026-07-02",
            created_at: "2026-07-02",
            title: "Charles note",
          },
        ],
        error: null,
      },
      donor_pledges: {
        data: [
          {
            id: "pledge-B",
            donor_id: "donor-B",
            missionary_id: missionaryProfileId,
            amount: 50,
            created_at: "2026-07-01",
            total_paid: 50,
            total_expected: 100,
          },
        ],
        error: null,
      },
    });

    const page = await getMissionaryDonorRows({
      supabaseAdmin: fake.client as never,
      profileId: missionaryProfileId,
      tenantId: "tenant-1",
      limit: 2,
      offset: 0,
    });

    expect(page.donors.map((donor) => donor.id)).toEqual([
      "donor-B",
      "donor-C",
    ]);
    expect(page.hasMore).toBe(true);
    expect(page.nextOffset).toBe(2);

    expect(fake.queries.donor_activities!.operations).toContainEqual({
      method: "in",
      column: "donor_id",
      values: ["donor-B", "donor-C"],
    });
    expect(fake.queries.donor_pledges!.operations).toContainEqual({
      method: "in",
      column: "donor_id",
      values: ["donor-B", "donor-C"],
    });
  });

  it("throws when a related activity query fails", async () => {
    const fake = createFakeSupabaseAdmin({
      donors: {
        data: [namedDonor],
        error: null,
      },
      donor_activities: {
        data: null,
        error: { message: "activity query failed" },
      },
      donor_pledges: {
        data: [],
        error: null,
      },
    });

    await expect(
      getMissionaryDonorRows({
        supabaseAdmin: fake.client as never,
        profileId: missionaryProfileId,
        tenantId: "tenant-1",
        limit: 25,
        offset: 0,
      }),
    ).rejects.toThrow("activity query failed");
  });
});
