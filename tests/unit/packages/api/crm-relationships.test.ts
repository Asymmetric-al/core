import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiHttpError } from "../../../../packages/api/src/shared/api-http-error";
import type { ActorContext } from "../../../../packages/api/src/crm/types";
import {
  buildCrmRelationshipReport,
  buildHouseholdMembershipKey,
} from "../../../../packages/api/src/admin/crm/relationships/model";
import type { CrmRelationshipDomain } from "../../../../packages/database/types/crm-relationships";
import { listMissionControlCrmRelationships } from "../../../../packages/api/src/admin/crm/relationships/service";
import type { CrmRelationshipRow } from "../../../../packages/database/types/crm-relationships";

const TENANT_A = "11111111-1111-4111-8111-111111111111";
const TENANT_B = "22222222-2222-4222-8222-222222222222";
const OTHER_TENANT = "33333333-3333-4333-8333-333333333333";
const PROFILE_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_A = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const params = {
  cursor: { offset: 0 },
  limit: 50,
  search: null,
  sort: { field: "updatedAt" as const, direction: "desc" as const },
  domains: [] as CrmRelationshipDomain[],
};

function actor(overrides: Partial<ActorContext> = {}): ActorContext {
  return {
    userId: USER_A,
    profileId: PROFILE_A,
    tenantId: TENANT_A,
    authTenantId: TENANT_A,
    role: "admin",
    isSuperAdmin: false,
    action: "crm.relationship.read",
    ...overrides,
  };
}

function relationshipFixture(
  overrides: Partial<CrmRelationshipRow> &
    Pick<
      CrmRelationshipRow,
      "id" | "recordId" | "recordKind" | "domain" | "displayName"
    >,
): CrmRelationshipRow {
  const updatedAt = overrides.updatedAt ?? "2026-08-18T12:00:00.000Z";
  return {
    authorityLabel: "Asym CRM",
    authorityScope: "crm_relationship",
    commitmentAmountCents: null,
    commitmentCurrency: null,
    commitmentFrequency: null,
    createdAt: updatedAt,
    dedupeKey: null,
    donorId: null,
    lastActivityAt: updatedAt,
    location: null,
    memberCount: null,
    primaryContactName: null,
    relationshipKind: overrides.recordKind,
    secondaryLabel: null,
    sourceSystem: "Asym CRM",
    status: null,
    tenantId: TENANT_A,
    updatedAt,
    ...overrides,
  };
}

type QueryCall = {
  table: string;
  filters: Record<string, unknown>;
};

class MemoryCrmRelationshipsSupabase {
  readonly calls: QueryCall[] = [];

  constructor(
    private readonly tables: Record<string, Record<string, unknown>[]>,
  ) {}

  from(table: string) {
    return new MemoryQuery(this.tables[table] ?? [], table, this.calls);
  }
}

class MemoryQuery {
  private readonly filters: Record<string, unknown> = {};
  private selectedColumns = "*";
  private inFilters: Array<{ column: string; values: unknown[] }> = [];

  constructor(
    private readonly rows: Record<string, unknown>[],
    private readonly table: string,
    private readonly calls: QueryCall[],
  ) {}

  select(columns: string) {
    this.selectedColumns = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters[column] = value;
    return this;
  }

  in(column: string, values: unknown[]) {
    this.inFilters.push({ column, values });
    return this;
  }

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: Record<string, unknown>[] | null;
          error: null;
        }) => TResult1)
      | null,
    onrejected?: ((reason: unknown) => TResult2) | null,
  ) {
    this.calls.push({ table: this.table, filters: { ...this.filters } });
    let data = this.rows.filter((row) =>
      Object.entries(this.filters).every(
        ([column, value]) => row[column] === value,
      ),
    );
    for (const filter of this.inFilters) {
      data = data.filter((row) => filter.values.includes(row[filter.column]));
    }
    if (this.selectedColumns !== "*") {
      const columns = this.selectedColumns
        .split(",")
        .map((column) => column.trim());
      data = data.map((row) => {
        const next: Record<string, unknown> = {};
        for (const column of columns) {
          next[column] = row[column];
        }
        return next;
      });
    }
    const result = Promise.resolve({ data, error: null });
    return result.then(onfulfilled, onrejected);
  }
}

function supabaseWith(tables: Record<string, Record<string, unknown>[]>) {
  return new MemoryCrmRelationshipsSupabase(tables) as unknown as Parameters<
    typeof listMissionControlCrmRelationships
  >[0]["supabase"] & { calls: QueryCall[] };
}

describe("local CRM relationships", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists tenant-local donor, missionary, household, church, commitment, and activity rows", async () => {
    const supabase = supabaseWith({
      donors: [
        {
          id: "donor-jordan",
          tenant_id: TENANT_A,
          name: "Jordan Lee",
          type: "individual",
          organization: null,
          spouse: null,
          updated_at: "2026-08-18T12:00:00.000Z",
        },
        {
          id: "donor-household",
          tenant_id: TENANT_A,
          name: "Pat Rivera",
          type: "individual",
          organization: null,
          spouse: "Alex Rivera",
          updated_at: "2026-08-18T11:00:00.000Z",
        },
        {
          id: "donor-church",
          tenant_id: TENANT_A,
          name: null,
          type: "church",
          organization: "Grace Church",
          spouse: null,
          updated_at: "2026-08-18T10:00:00.000Z",
        },
        {
          id: "donor-other",
          tenant_id: TENANT_B,
          name: "Other Tenant Donor",
          type: "individual",
          organization: null,
          spouse: null,
          updated_at: "2026-08-18T09:00:00.000Z",
        },
      ],
      missionaries: [
        {
          id: "missionary-sam",
          tenant_id: TENANT_A,
          profile_id: "profile-sam",
          updated_at: "2026-08-18T08:00:00.000Z",
        },
      ],
      profiles: [
        {
          id: "profile-sam",
          tenant_id: TENANT_A,
          first_name: "Sam",
          last_name: "Ortiz",
        },
      ],
      donor_pledges: [
        {
          id: "pledge-1",
          tenant_id: TENANT_A,
          donor_id: "donor-jordan",
          amount: 25000,
          frequency: "monthly",
          start_date: "2026-01-01",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      member_care_activities: [
        {
          id: "care-1",
          tenant_id: TENANT_A,
          missionary_id: "missionary-sam",
          type: "check_in",
          title: "Weekly check-in",
          description: "Follow-up call",
          occurred_at: "2026-08-01T00:00:00.000Z",
        },
      ],
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params,
    });

    expect(result.mode).toBe("local");
    expect(result.rows.map((row) => row.displayName)).toEqual(
      expect.arrayContaining([
        "Jordan Lee",
        "Pat Rivera",
        "Grace Church",
        "Sam Ortiz",
      ]),
    );
    expect(
      result.rows.some((row) => row.displayName === "Other Tenant Donor"),
    ).toBe(false);
    expect(result.rows.some((row) => row.recordKind === "household")).toBe(
      true,
    );
    expect(result.rows.some((row) => row.recordKind === "commitment")).toBe(
      true,
    );
    expect(
      result.rows.every((row) => row.sourceSystem.startsWith("Asym")),
    ).toBe(true);
    expect(result.report.sourceSystems.crm).toContain("Asym Postgres");
    expect(result.report.sourceSystems.crm).not.toContain("Twenty");
  });

  it("rejects a tenant mismatch for non-super-admin actors", async () => {
    await expect(
      listMissionControlCrmRelationships({
        actor: actor({ tenantId: OTHER_TENANT }),
        supabase: supabaseWith({}),
        params,
      }),
    ).rejects.toBeInstanceOf(ApiHttpError);
  });

  it("scopes every local relationship query to the actor tenant", async () => {
    const supabase = supabaseWith({
      donors: [],
      missionaries: [],
      profiles: [],
      donor_pledges: [],
      member_care_activities: [],
    });

    await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params,
    });

    expect(supabase.calls.length).toBeGreaterThan(0);
    expect(
      supabase.calls.every((call) => call.filters.tenant_id === TENANT_A),
    ).toBe(true);
  });

  it("filters by relationship domain without leaking finance identifiers", async () => {
    const supabase = supabaseWith({
      donors: [
        {
          id: "donor-jordan",
          tenant_id: TENANT_A,
          name: "Jordan Lee",
          type: "individual",
          organization: null,
          spouse: null,
          updated_at: "2026-08-18T12:00:00.000Z",
        },
      ],
      missionaries: [],
      profiles: [],
      donor_pledges: [
        {
          id: "pledge-1",
          tenant_id: TENANT_A,
          donor_id: "donor-jordan",
          amount: 25000,
          frequency: "monthly",
          start_date: "2026-01-01",
          created_at: "2026-01-01T00:00:00.000Z",
          payment_intent_id: "pi_secret",
          receipt_url: "https://example.test/receipt",
        },
      ],
      member_care_activities: [],
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params: { ...params, domains: ["pledges"] },
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.recordKind).toBe("commitment");
    expect(result.rows[0]?.commitmentAmountCents).toBe(25000);
    expect(result.rows[0]?.primaryContactName).toBe("Jordan Lee");
    // The pledge opens its donor's CRM record.
    expect(result.rows[0]?.donorId).toBe("donor-jordan");
    expect(JSON.stringify(result.rows[0])).not.toContain("pi_secret");
    expect(JSON.stringify(result.rows[0])).not.toContain("receipt");
  });

  it("links each row to the donor record it was built from, if any", async () => {
    const supabase = supabaseWith({
      donors: [
        {
          id: "donor-jordan",
          tenant_id: TENANT_A,
          name: "Jordan Lee",
          type: "individual",
          organization: null,
          spouse: "Pat Lee",
          updated_at: "2026-08-18T12:00:00.000Z",
        },
      ],
      missionaries: [
        {
          id: "missionary-1",
          tenant_id: TENANT_A,
          profile_id: null,
          updated_at: "2026-08-18T12:00:00.000Z",
        },
      ],
      profiles: [],
      donor_pledges: [
        {
          id: "pledge-known",
          tenant_id: TENANT_A,
          donor_id: "donor-jordan",
          amount: 1000,
          frequency: "monthly",
          created_at: "2026-01-01T00:00:00.000Z",
        },
        {
          // Its donor is not one of this tenant's records: no link.
          id: "pledge-orphan",
          tenant_id: TENANT_A,
          donor_id: "donor-elsewhere",
          amount: 1000,
          frequency: "monthly",
          created_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      member_care_activities: [],
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params,
    });
    const donorIdOf = (id: string) =>
      result.rows.find((row) => row.id === id)?.donorId;

    expect(donorIdOf("person:donor-jordan")).toBe("donor-jordan");
    expect(donorIdOf("household:donor-jordan")).toBe("donor-jordan");
    expect(donorIdOf("commitment:pledge-known")).toBe("donor-jordan");
    expect(donorIdOf("commitment:pledge-orphan")).toBeNull();
    expect(donorIdOf("missionary:missionary-1")).toBeNull();
  });

  it("excludes care-sensitive activity from the activity domain", async () => {
    const supabase = supabaseWith({
      donors: [],
      missionaries: [],
      profiles: [],
      donor_pledges: [],
      member_care_activities: [
        {
          id: "care-private",
          tenant_id: TENANT_A,
          missionary_id: "missionary-sam",
          type: "pastoral_note",
          title: "Pastoral note",
          description: "Confidential",
          occurred_at: "2026-08-01T00:00:00.000Z",
        },
        {
          id: "care-public",
          tenant_id: TENANT_A,
          missionary_id: "missionary-sam",
          type: "check_in",
          title: "Check-in",
          description: "Public follow-up",
          occurred_at: "2026-08-02T00:00:00.000Z",
        },
      ],
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params: { ...params, domains: ["activity"] },
    });

    expect(result.rows.map((row) => row.displayName)).toEqual(["Check-in"]);
    expect(result.report.excludedCareActivityCount).toBe(1);
  });

  it("excludes crisis intervention activity even when the Twenty care regex would miss it", async () => {
    const supabase = supabaseWith({
      donors: [],
      missionaries: [],
      profiles: [],
      donor_pledges: [],
      member_care_activities: [
        {
          id: "care-crisis",
          tenant_id: TENANT_A,
          missionary_id: "missionary-sam",
          type: "crisis_intervention",
          title: "Crisis intervention",
          description: "Confidential crisis details",
          occurred_at: "2026-08-03T00:00:00.000Z",
        },
        {
          id: "care-public",
          tenant_id: TENANT_A,
          missionary_id: "missionary-sam",
          type: "check_in",
          title: "Check-in",
          description: "Public follow-up",
          occurred_at: "2026-08-02T00:00:00.000Z",
        },
      ],
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params: { ...params, domains: ["activity"] },
    });

    expect(result.rows.map((row) => row.displayName)).toEqual(["Check-in"]);
    expect(JSON.stringify(result.rows)).not.toContain(
      "Confidential crisis details",
    );
    expect(result.report.excludedCareActivityCount).toBe(1);
  });

  it("counts church-named organization duplicates as merge candidates", async () => {
    const supabase = supabaseWith({
      donors: [
        {
          id: "church-1",
          tenant_id: TENANT_A,
          name: null,
          type: "church",
          organization: "Grace Church",
          spouse: null,
          updated_at: "2026-08-18T10:00:00.000Z",
        },
        {
          id: "org-1",
          tenant_id: TENANT_A,
          name: null,
          type: "organization",
          organization: "Grace Church",
          spouse: null,
          updated_at: "2026-08-18T09:00:00.000Z",
        },
      ],
      missionaries: [],
      profiles: [],
      donor_pledges: [],
      member_care_activities: [],
    });

    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      supabase,
      params,
    });

    expect(result.report.duplicateCompanyCandidates).toBe(1);
  });
});

describe("CRM relationship household keys", () => {
  it("joins sorted membership ids", () => {
    expect(
      buildHouseholdMembershipKey({
        memberIds: ["b", "a"],
        displayName: "Rivera Household",
      }),
    ).toBe("household-members:a+b");
  });

  it("falls back to the household display name", () => {
    expect(
      buildHouseholdMembershipKey({
        displayName: "Rivera Household",
      }),
    ).toBe("rivera-household");
  });
});

describe("CRM relationship report", () => {
  it("counts duplicate people separately from churches", () => {
    const rows: CrmRelationshipRow[] = [
      relationshipFixture({
        id: "person:p1",
        recordId: "p1",
        recordKind: "person",
        domain: "people",
        displayName: "Jordan Lee",
        updatedAt: "2026-08-18T12:00:00.000Z",
        dedupeKey: "person:jordan-lee",
      }),
      relationshipFixture({
        id: "person:p2",
        recordId: "p2",
        recordKind: "person",
        domain: "people",
        displayName: "Jordan Lee",
        updatedAt: "2026-08-18T11:00:00.000Z",
        dedupeKey: "person:jordan-lee",
      }),
      relationshipFixture({
        id: "church:c1",
        recordId: "c1",
        recordKind: "church",
        domain: "churches",
        displayName: "Grace Church",
        updatedAt: "2026-08-18T10:00:00.000Z",
        dedupeKey: "church:grace-church",
      }),
    ];

    const report = buildCrmRelationshipReport(rows, {
      excludedCareActivityCount: 0,
    });
    expect(report.duplicatePersonCandidates).toBe(1);
    expect(report.duplicateCompanyCandidates).toBe(0);
  });
});

describe("CRM relationship commitments", () => {
  function pledge(
    id: string,
    overrides: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      amount: 12000,
      created_at: "2026-01-01T00:00:00.000Z",
      currency: "usd",
      donor_id: null,
      frequency: "monthly",
      id,
      start_date: "2026-01-01",
      status: "active",
      tenant_id: TENANT_A,
      ...overrides,
    };
  }

  async function listWithPledges(pledges: Record<string, unknown>[]) {
    return listMissionControlCrmRelationships({
      actor: actor(),
      params,
      supabase: supabaseWith({
        donor_pledges: pledges,
        donors: [],
        member_care_activities: [],
        missionaries: [],
        profiles: [],
      }),
    });
  }

  it("counts only active pledges toward commitments, whatever the status spelling", async () => {
    const result = await listWithPledges([
      pledge("active", { status: "active" }),
      pledge("active-title", { status: "Active" }),
      pledge("paused", { status: "paused" }),
      pledge("cancelled", { status: "cancelled" }),
      pledge("unknown", { status: null }),
    ]);

    expect(result.report.activeCommitments.pledgeCount).toBe(2);
    expect(result.report.activeCommitments.monthlyByCurrency).toEqual([
      { currency: "USD", monthlyCents: 24000, pledgeCount: 2 },
    ]);
    // Inactive and unknown-status pledges stay listed, with their status.
    expect(
      result.rows
        .filter((row) => row.domain === "pledges")
        .map((row) => row.status)
        .sort(),
    ).toEqual(["Active", "active", "cancelled", "paused", null].sort());
  });

  it("states commitments as a monthly equivalent and leaves out unknown frequencies", async () => {
    const result = await listWithPledges([
      pledge("monthly", { amount: 10000, frequency: "monthly" }),
      pledge("quarterly", { amount: 30000, frequency: "quarterly" }),
      pledge("annual", { amount: 120000, frequency: "Annually" }),
      pledge("weekly", { amount: 1200, frequency: "weekly" }),
      pledge("once", { amount: 50000, frequency: "one_time" }),
      pledge("blank", { amount: 50000, frequency: null }),
    ]);

    expect(result.report.activeCommitments).toEqual({
      monthlyByCurrency: [
        {
          currency: "USD",
          // 10,000 + 30,000/3 + 120,000/12 + 1,200 x 52/12
          monthlyCents: 10000 + 10000 + 10000 + 5200,
          pledgeCount: 4,
        },
      ],
      pledgeCount: 6,
      unknownFrequencyCount: 2,
    });
  });

  it("keeps each currency's monthly total apart", async () => {
    const result = await listWithPledges([
      pledge("usd", { amount: 10000, currency: "usd" }),
      pledge("cad", { amount: 5000, currency: "CAD" }),
    ]);

    expect(result.report.activeCommitments.monthlyByCurrency).toEqual([
      { currency: "USD", monthlyCents: 10000, pledgeCount: 1 },
      { currency: "CAD", monthlyCents: 5000, pledgeCount: 1 },
    ]);
  });
});

describe("CRM relationship activity source", () => {
  it("labels member-care activity as Member Care, not CRM", async () => {
    const result = await listMissionControlCrmRelationships({
      actor: actor(),
      params,
      supabase: supabaseWith({
        donor_pledges: [],
        donors: [],
        member_care_activities: [
          {
            id: "care-1",
            occurred_at: "2026-08-01T00:00:00.000Z",
            tenant_id: TENANT_A,
            title: "Weekly check-in",
            type: "check_in",
          },
        ],
        missionaries: [],
        profiles: [],
      }),
    });

    const activity = result.rows.find((row) => row.domain === "activity");
    expect(activity).toMatchObject({
      authorityLabel: "Asym member care",
      authorityScope: "member_care",
      sourceSystem: "Asym member care",
    });
    expect(result.report.sourceSystems.care).toMatch(/always left out/i);
  });
});
