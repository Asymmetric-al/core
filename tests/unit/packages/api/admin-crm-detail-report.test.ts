import { describe, expect, it } from "vitest";

import { getAdminCrmDonorDetail } from "../../../../packages/api/src/admin/crm/detail/service";
import {
  buildAdminCrmReport,
  serializeAdminCrmReportCsv,
} from "../../../../packages/api/src/admin/crm/reports/service";

type Row = Record<string, unknown>;

class QueryBuilder implements PromiseLike<{ data: Row[]; error: null }> {
  private filters: Array<(row: Row) => boolean> = [];
  private limitCount: number | null = null;
  private orderColumn: string | null = null;
  private orderAscending = true;

  constructor(private readonly rows: Row[]) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  gte(column: string, value: string) {
    this.filters.push((row) => String(row[column] ?? "") >= value);
    return this;
  }

  lte(column: string, value: string) {
    this.filters.push((row) => String(row[column] ?? "") <= value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async single() {
    const [row] = this.resolveRows();
    return row
      ? { data: row, error: null }
      : { data: null, error: { message: "not found" } };
  }

  async maybeSingle() {
    return { data: this.resolveRows()[0] ?? null, error: null };
  }

  then<TResult1 = { data: Row[]; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((value: {
          data: Row[];
          error: null;
        }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({ data: this.resolveRows(), error: null }).then(
      onfulfilled,
      onrejected,
    );
  }

  private resolveRows() {
    let rows = this.rows.filter((row) =>
      this.filters.every((filter) => filter(row)),
    );
    if (this.orderColumn) {
      const column = this.orderColumn;
      const direction = this.orderAscending ? 1 : -1;
      rows = [...rows].sort(
        (left, right) =>
          String(left[column] ?? "").localeCompare(
            String(right[column] ?? ""),
          ) * direction,
      );
    }
    return this.limitCount == null ? rows : rows.slice(0, this.limitCount);
  }
}

function createSupabaseFixture(tables: Record<string, Row[]>) {
  return {
    from(table: string) {
      return new QueryBuilder(tables[table] ?? []);
    },
  };
}

const baseTables: Record<string, Row[]> = {
  crm_merge_candidates: [
    {
      candidate_twenty_record_id: "twenty-person-duplicate",
      confidence: "medium",
      id: "candidate-1",
      match_reasons: ["same_email"],
      score: 72,
      source_entity_id: "donor-1",
      source_entity_type: "donor_profile",
      status: "pending",
      tenant_id: "tenant-1",
    },
  ],
  donation_crm_links: [
    {
      donation_id: "donation-1",
      id: "link-1",
      link_status: "active",
      staged_gift_id: "staged-gift-1",
      tenant_id: "tenant-1",
      twenty_record_id: "twenty-gift-1",
    },
  ],
  donations: [
    {
      amount: 12500,
      created_at: "2026-05-10T00:00:00.000Z",
      currency: "usd",
      donation_type: "one_time",
      donor_id: "donor-1",
      fund_id: "fund-1",
      id: "donation-1",
      is_recurring: false,
      missionary_id: "missionary-1",
      status: "completed",
      tenant_id: "tenant-1",
    },
  ],
  donor_activities: [
    {
      amount: null,
      created_at: "2026-05-11T00:00:00.000Z",
      date: "2026-05-11T00:00:00.000Z",
      description: "Called after receipt send.",
      donor_id: "donor-1",
      id: "activity-1",
      title: "Care call",
      type: "call",
    },
  ],
  donor_pledges: [
    {
      amount: 5000,
      donor_id: "donor-1",
      frequency: "monthly",
      fund_id: "fund-1",
      id: "pledge-1",
      missionary_id: "missionary-1",
      next_payment_date: "2026-01-01",
      status: "active",
      updated_at: "2026-05-11T00:00:00.000Z",
    },
  ],
  donors: [
    {
      email: "ada@example.test",
      id: "donor-1",
      last_gift_date: "2026-05-10T00:00:00.000Z",
      missionary_id: "missionary-1",
      name: "Ada Donor",
      notes: "Prefers a call after major gifts.",
      organization: null,
      phone: "555-0100",
      profile_id: "profile-1",
      status: "active",
      tenant_id: "tenant-1",
      total_given: 12500,
      type: "individual",
    },
  ],
  funds: [{ id: "fund-1", name: "General Fund" }],
  missionaries: [
    {
      id: "missionary-1",
      profile: {
        display_name: "Mina Missionary",
      },
    },
  ],
  staged_gifts: [
    {
      created_at: "2026-05-10T00:00:00.000Z",
      crm_post_status: "posted",
      donation_id: "donation-1",
      fund_id: "fund-1",
      id: "staged-gift-1",
      missionary_id: "missionary-1",
      posted_at: "2026-05-10T00:01:00.000Z",
      receipt_status: "sent",
      status: "posted",
      tenant_id: "tenant-1",
      twenty_record_id: "twenty-gift-1",
    },
  ],
};

describe("Phase 5 CRM donor detail and reports", () => {
  it("builds donor care detail without making Twenty payment truth", async () => {
    const detail = await getAdminCrmDonorDetail({
      crmWritesEnabled: false,
      donorId: "donor-1",
      role: "staff",
      supabaseAdmin: createSupabaseFixture(baseTables) as never,
      tenantId: "tenant-1",
    });

    expect(detail.donor.name).toBe("Ada Donor");
    expect(detail.giftHistory[0]).toMatchObject({
      currencyCode: "USD",
      stagedGiftId: "staged-gift-1",
      twentyRecordId: "twenty-gift-1",
    });
    expect(detail.timeline.map((entry) => entry.kind)).toEqual(
      expect.arrayContaining(["gift", "activity"]),
    );
    expect(detail.duplicateWarnings[0]).toMatchObject({
      confidence: "medium",
      reason: "same_email",
    });
    expect(detail.support).toMatchObject({
      activeRecurringCommitments: 1,
      atRiskCommitments: 1,
      lifetimeGivingCents: 12500,
    });
    expect(detail.privacy.missionaryContactDataExposed).toBe(false);
    expect(detail.reconciliation).toEqual({
      crmWriteMode: "disabled",
      platformPaymentTruth: true,
      twentyIsPaymentTruth: false,
    });
  });

  it("builds auditable report slices and CSV exports", async () => {
    const report = await buildAdminCrmReport({
      params: {
        filters: {
          dateFrom: null,
          dateTo: null,
          search: null,
        },
        slice: "funds",
      },
      supabaseAdmin: createSupabaseFixture(baseTables) as never,
      tenantId: "tenant-1",
    });

    expect(report.rows).toEqual([
      expect.objectContaining({
        amountCents: 12500,
        donorCount: 1,
        giftCount: 1,
        label: "General Fund",
      }),
    ]);
    expect(report.audit.loggedEvents).toEqual([
      "actor",
      "tenant",
      "filters",
      "rowCount",
      "timestamp",
    ]);
    expect(serializeAdminCrmReportCsv(report)).toContain('"General Fund"');
  });

  it("reports CRM sync failures from outbound jobs and donation links", async () => {
    const report = await buildAdminCrmReport({
      params: {
        filters: {
          dateFrom: null,
          dateTo: null,
          search: null,
        },
        slice: "sync-failures",
      },
      supabaseAdmin: createSupabaseFixture({
        crm_outbound_jobs: [
          {
            id: "job-1",
            last_error: "provider rejected payload",
            status: "failed",
            tenant_id: "tenant-1",
            updated_at: "2026-05-10T00:00:00.000Z",
          },
        ],
        donation_crm_links: [
          {
            id: "link-1",
            link_status: "queued",
            tenant_id: "tenant-1",
            updated_at: "2026-05-10T00:00:00.000Z",
          },
        ],
      }) as never,
      tenantId: "tenant-1",
    });

    expect(report.rows.map((row) => row.metadata.source)).toEqual([
      "crm_outbound_jobs",
      "donation_crm_links",
    ]);
  });
});
