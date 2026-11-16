import { describe, expect, it } from "vitest";

import { buildAdminCrmReport } from "../../../../packages/api/src/admin/crm/reports/service";

import type { AdminCrmReportParams } from "../../../../packages/api/src/admin/crm/reports/query";

type Row = Record<string, unknown>;

/** PostgREST answers at most `max_rows` rows per request (supabase/config.toml). */
const SERVER_MAX_ROWS = 1000;

function splitTopLevel(expression: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of expression) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function matchesTerm(row: Row, term: string): boolean {
  if (term.startsWith("and(") && term.endsWith(")")) {
    return splitTopLevel(term.slice(4, -1)).every((part) =>
      matchesTerm(row, part),
    );
  }
  const [column, op, ...rest] = term.split(".");
  const value = rest.join(".");
  const cell = row[column!];
  if (op === "is") return value === "null" ? cell == null : false;
  if (cell == null) return false;
  const text = String(cell);
  if (op === "gte") return text >= value;
  if (op === "lte") return text <= value;
  if (op === "lt") return text < value;
  throw new Error("Unsupported filter term: " + term);
}

class QueryBuilder implements PromiseLike<{ data: Row[]; error: null }> {
  private filters: Array<(row: Row) => boolean> = [];
  private orders: Array<{ column: string; ascending: boolean }> = [];
  private limitCount: number | null = null;
  private rangeWindow: { from: number; to: number } | null = null;

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

  /**
   * The PostgREST or filter in the shape the report builds: comma-separated
   * terms, each col.op.value or and(term,term).
   */
  or(expression: string) {
    const terms = splitTopLevel(expression);
    this.filters.push((row) => terms.some((term) => matchesTerm(row, term)));
    return this;
  }

  lte(column: string, value: string) {
    this.filters.push((row) => String(row[column] ?? "") <= value);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orders.push({ ascending: options?.ascending ?? true, column });
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.rangeWindow = { from, to };
    return this;
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
    if (this.orders.length > 0) {
      rows = [...rows].sort((left, right) => {
        for (const { ascending, column } of this.orders) {
          const compared = String(left[column] ?? "").localeCompare(
            String(right[column] ?? ""),
          );
          if (compared !== 0) {
            return ascending ? compared : -compared;
          }
        }
        return 0;
      });
    }
    if (this.rangeWindow) {
      rows = rows.slice(this.rangeWindow.from, this.rangeWindow.to + 1);
    }
    if (this.limitCount != null) {
      rows = rows.slice(0, this.limitCount);
    }
    // Like PostgREST, never answer more than max_rows, whatever was asked.
    return rows.slice(0, SERVER_MAX_ROWS);
  }
}

function createSupabaseFixture(tables: Record<string, Row[]>) {
  return {
    from(table: string) {
      return new QueryBuilder(tables[table] ?? []);
    },
  };
}

function params(
  slice: AdminCrmReportParams["slice"],
  search: string | null = null,
): AdminCrmReportParams {
  return { filters: { dateFrom: null, dateTo: null, search }, slice };
}

let donationSeq = 0;
function donation(overrides: Row): Row {
  donationSeq += 1;
  return {
    amount: 10000,
    created_at: `2026-05-01T00:00:${String(donationSeq % 60).padStart(2, "0")}.000Z`,
    currency: "usd",
    donor_id: "donor-1",
    fund_id: "fund-1",
    id: `donation-${String(donationSeq).padStart(6, "0")}`,
    missionary_id: "missionary-1",
    refund_amount: 0,
    status: "completed",
    tenant_id: "tenant-1",
    ...overrides,
  };
}

const funds = [
  { id: "fund-1", name: "General Fund" },
  { id: "fund-2", name: "Building Fund" },
];
const missionaries = [
  { id: "missionary-1", profile: { display_name: "Mina" } },
  { id: "missionary-2", profile: { display_name: "Noah" } },
];

async function report(
  slice: AdminCrmReportParams["slice"],
  tables: Record<string, Row[]>,
  options: { search?: string | null; maxDonations?: number } = {},
) {
  return buildAdminCrmReport({
    maxDonations: options.maxDonations,
    params: params(slice, options.search ?? null),
    supabaseAdmin: createSupabaseFixture({
      funds,
      missionaries,
      ...tables,
    }) as never,
    tenantId: "tenant-1",
  });
}

describe("CRM giving report totals", () => {
  it("reads every gift past the server's 1,000-row page and says the total is complete", async () => {
    const donations = Array.from({ length: 2500 }, () => donation({}));

    const result = await report("funds", { donations });

    expect(result.totals.giftCount).toBe(2500);
    expect(result.totals.amountCents).toBe(2500 * 10000);
    expect(result.completeness).toEqual({
      complete: true,
      donationLimit: expect.any(Number),
      includedGiftCount: 2500,
    });
  });

  it("flags totals as incomplete when the period has more gifts than the read limit", async () => {
    const donations = Array.from({ length: 30 }, () => donation({}));

    const result = await report("funds", { donations }, { maxDonations: 20 });

    expect(result.totals.giftCount).toBe(20);
    expect(result.completeness).toEqual({
      complete: false,
      donationLimit: 20,
      includedGiftCount: 20,
    });
  });

  it("counts every settled status spelling and leaves unsettled gifts out", async () => {
    const donations = [
      donation({ status: "completed" }),
      donation({ status: "succeeded" }),
      donation({ status: "Succeeded" }),
      donation({ status: "success" }),
      donation({ status: "pending" }),
      donation({ status: "failed" }),
      donation({ status: "refunded" }),
    ];

    const result = await report("funds", { donations });

    expect(result.totals.giftCount).toBe(4);
    expect(result.totals.amountCents).toBe(40000);
  });

  it("subtracts refunds so giving is net of money returned", async () => {
    const donations = [
      donation({ amount: 10000, refund_amount: 2500 }),
      // Fully refunded but still marked completed: no money kept, no gift.
      donation({ amount: 5000, refund_amount: 5000 }),
    ];

    const result = await report("funds", { donations });

    expect(result.totals.amountCents).toBe(7500);
    expect(result.totals.giftCount).toBe(1);
  });

  it("applies approved corrections to the amount and the fund", async () => {
    const corrected = donation({ amount: 10000, fund_id: "fund-1" });
    const reversed = donation({ amount: 4000, fund_id: "fund-1" });
    const result = await report("funds", {
      contribution_adjustments: [
        {
          adjustment_type: "amount_fund",
          created_at: "2026-05-02T00:00:00.000Z",
          donation_id: corrected.id,
          effective_values: { amountCents: 8000, fundId: "fund-2" },
          id: "adjustment-1",
          status: "applied",
          tenant_id: "tenant-1",
        },
        {
          adjustment_type: "amount",
          created_at: "2026-05-02T00:00:00.000Z",
          donation_id: reversed.id,
          effective_values: { amountCents: 1 },
          id: "adjustment-2",
          status: "reversed",
          tenant_id: "tenant-1",
        },
        {
          // Another organization's correction never touches this report.
          adjustment_type: "amount",
          created_at: "2026-05-02T00:00:00.000Z",
          donation_id: reversed.id,
          effective_values: { amountCents: 2 },
          id: "adjustment-3",
          status: "applied",
          tenant_id: "tenant-2",
        },
      ],
      donations: [corrected, reversed],
    });

    expect(
      result.rows.map((row) => [row.label, row.amountCents, row.giftCount]),
    ).toEqual([
      ["Building Fund", 8000, 1],
      ["General Fund", 4000, 1],
    ]);
    expect(result.totals.amountCents).toBe(12000);
  });

  it("decides settled gifts by their corrected payment state, not the stored status", async () => {
    const pendingSettled = donation({ amount: 7000, status: "pending" });
    const failedSettled = donation({ amount: 2000, status: "failed" });
    const completedFailed = donation({ amount: 9000, status: "completed" });
    const paymentCorrection = (
      donationId: unknown,
      paymentStatus: string,
      id: string,
    ) => ({
      adjustment_type: "payment_state_correction",
      created_at: "2026-05-02T00:00:00.000Z",
      donation_id: donationId,
      effective_values: { paymentStatus },
      id,
      status: "applied",
      tenant_id: "tenant-1",
    });

    const result = await report("funds", {
      contribution_adjustments: [
        paymentCorrection(pendingSettled.id, "completed", "adjustment-p"),
        paymentCorrection(failedSettled.id, "completed", "adjustment-f"),
        paymentCorrection(completedFailed.id, "failed", "adjustment-c"),
      ],
      donations: [pendingSettled, failedSettled, completedFailed],
    });

    expect(result.totals.giftCount).toBe(2);
    expect(result.totals.amountCents).toBe(9000);
    expect(
      result.rows.map((row) => [row.label, row.amountCents, row.giftCount]),
    ).toEqual([["General Fund", 9000, 2]]);
  });

  it("splits a reallocated gift across its corrected funds", async () => {
    const split = donation({ amount: 10000, fund_id: "fund-1" });
    const result = await report("funds", {
      contribution_adjustments: [
        {
          adjustment_type: "allocation",
          created_at: "2026-05-02T00:00:00.000Z",
          donation_id: split.id,
          effective_values: {
            designationLines: [
              {
                amountCents: 6000,
                fundId: "fund-1",
                id: "line-1",
                memo: null,
                missionaryId: null,
              },
              {
                amountCents: 4000,
                fundId: "fund-2",
                id: "line-2",
                memo: null,
                missionaryId: null,
              },
            ],
          },
          id: "adjustment-1",
          status: "applied",
          tenant_id: "tenant-1",
        },
      ],
      donations: [split],
    });

    expect(result.rows.map((row) => [row.label, row.amountCents])).toEqual([
      ["General Fund", 6000],
      ["Building Fund", 4000],
    ]);
    // One gift, even though it lands in two funds.
    expect(result.totals.giftCount).toBe(1);
    expect(result.totals.amountCents).toBe(10000);
  });

  it("counts each donor once when they gave to several funds", async () => {
    const donations = ["donor-1", "donor-2", "donor-3"].flatMap((donorId) => [
      donation({ donor_id: donorId, fund_id: "fund-1" }),
      donation({ donor_id: donorId, fund_id: "fund-2" }),
    ]);

    const result = await report("funds", { donations });

    expect(result.rows.map((row) => row.donorCount)).toEqual([3, 3]);
    expect(result.totals.donorCount).toBe(3);
    expect(result.totals.giftCount).toBe(6);
  });

  it("counts each donor once across missionaries", async () => {
    const donations = ["donor-1", "donor-2"].flatMap((donorId) => [
      donation({ donor_id: donorId, missionary_id: "missionary-1" }),
      donation({ donor_id: donorId, missionary_id: "missionary-2" }),
    ]);

    const result = await report("missionaries", { donations });

    expect(result.totals.donorCount).toBe(2);
  });

  it("totals only the rows a search leaves visible", async () => {
    const donations = [
      donation({ donor_id: "donor-1", fund_id: "fund-1" }),
      donation({ donor_id: "donor-2", fund_id: "fund-2" }),
    ];

    const result = await report("funds", { donations }, { search: "build" });

    expect(result.rows.map((row) => row.label)).toEqual(["Building Fund"]);
    expect(result.totals).toMatchObject({
      amountCents: 10000,
      donorCount: 1,
      giftCount: 1,
      rowCount: 1,
    });
  });

  it("never counts another organization's gifts", async () => {
    const donations = [
      donation({}),
      donation({ tenant_id: "tenant-2", amount: 99999 }),
    ];

    const result = await report("funds", { donations });

    expect(result.totals.amountCents).toBe(10000);
  });
});

describe("CRM report period", () => {
  it("keeps a calendar-date bound as that date", async () => {
    const { parseAdminCrmReportParams } =
      await import("../../../../packages/api/src/admin/crm/reports/query");
    const params = parseAdminCrmReportParams(
      new URLSearchParams({ dateFrom: "2026-01-01", slice: "funds" }),
    );
    expect(params.filters.dateFrom).toBe("2026-01-01");
  });

  it("puts a gift in the period of its gift date, not when it was entered", async () => {
    const thisYear = donation({
      amount: 1000,
      gift_date: "2026-03-02",
      created_at: "2026-03-02T10:00:00.000Z",
    });
    const importedOld = donation({
      amount: 2000,
      gift_date: "2025-12-15",
      created_at: "2026-05-01T10:00:00.000Z",
    });
    const backdatedIn = donation({
      amount: 4000,
      gift_date: "2026-01-05",
      created_at: "2025-12-20T10:00:00.000Z",
    });
    const legacyNoDate = donation({
      amount: 8000,
      gift_date: null,
      created_at: "2026-02-01T10:00:00.000Z",
    });
    const legacyOld = donation({
      amount: 16000,
      gift_date: null,
      created_at: "2025-06-01T10:00:00.000Z",
    });

    const result = await buildAdminCrmReport({
      params: {
        filters: { dateFrom: "2026-01-01", dateTo: null, search: null },
        slice: "funds",
      },
      supabaseAdmin: createSupabaseFixture({
        funds,
        missionaries,
        donations: [
          thisYear,
          importedOld,
          backdatedIn,
          legacyNoDate,
          legacyOld,
        ],
      }) as never,
      tenantId: "tenant-1",
    });

    // This year's dated gift, the backdated one and the undated legacy gift
    // entered this year; not the prior-year import or the old legacy gift.
    expect(result.totals.amountCents).toBe(1000 + 4000 + 8000);
    expect(result.totals.giftCount).toBe(3);
  });
});
