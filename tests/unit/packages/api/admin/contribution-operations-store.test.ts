import { describe, expect, it } from "vitest";

import { loadContributionDetailFromSupabase } from "../../../../../packages/api/src/admin/contribution-operations/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type QueryResult = {
  data: unknown;
  error: null;
};

class SupabaseQueryStub {
  constructor(private readonly result: QueryResult) {}

  select(): this {
    return this;
  }

  eq(): this {
    return this;
  }

  in(): this {
    return this;
  }

  order(): this {
    return this;
  }

  limit(): Promise<QueryResult> {
    return Promise.resolve(this.result);
  }

  maybeSingle(): Promise<QueryResult> {
    return Promise.resolve(this.result);
  }

  single(): Promise<QueryResult> {
    return Promise.resolve(this.result);
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

function createSupabaseStub(
  resultsByTable: Record<string, QueryResult | QueryResult[]>,
): AdminSupabaseClient {
  const remainingResults = new Map(
    Object.entries(resultsByTable).map(([table, result]) => [
      table,
      Array.isArray(result) ? [...result] : [result],
    ]),
  );

  return {
    from(table: string) {
      const tableResults = remainingResults.get(table) ?? [];
      const nextResult = tableResults.shift() ?? { data: null, error: null };
      remainingResults.set(table, tableResults);

      return new SupabaseQueryStub(nextResult);
    },
  } as unknown as AdminSupabaseClient;
}

describe("contribution operations store", () => {
  it("hydrates donation missionary labels from profile email when name fields are blank", async () => {
    const tenantId = "00000000-0000-4000-8000-000000000001";
    const donationId = "00000000-0000-4000-8000-000000000002";
    const missionaryId = "00000000-0000-4000-8000-000000000003";
    const supabaseAdmin = createSupabaseStub({
      donations: {
        data: {
          id: donationId,
          tenant_id: tenantId,
          missionary_id: missionaryId,
          amount: 5000,
          currency: "usd",
          status: "completed",
          donation_type: "one_time",
          payment_method: "card",
          is_recurring: false,
          refund_amount: 0,
          created_at: "2026-05-01T00:00:00.000Z",
          updated_at: "2026-05-01T00:00:00.000Z",
        },
        error: null,
      },
      contribution_adjustments: { data: [], error: null },
      missionaries: [
        {
          data: {
            id: missionaryId,
            profile: {
              display_name: "",
              full_name: "",
              first_name: "",
              last_name: "",
              email: "worker@example.com",
            },
          },
          error: null,
        },
        {
          data: [
            {
              id: missionaryId,
              profile: {
                display_name: "",
                full_name: "",
                first_name: "",
                last_name: "",
                email: "worker@example.com",
              },
            },
          ],
          error: null,
        },
      ],
      staged_gifts: { data: null, error: null },
      contribution_operation_audit_events: { data: [], error: null },
      contribution_corrections: { data: [], error: null },
      contribution_correction_requests: { data: [], error: null },
      donation_crm_links: { data: [], error: null },
    });

    const detail = await loadContributionDetailFromSupabase({
      supabaseAdmin,
      tenantId,
      contributionId: donationId,
    });

    expect(detail.designations.lines).toHaveLength(1);
    expect(detail.designations.lines[0]!.missionaryName).toBe(
      "worker@example.com",
    );
    expect(detail.shared.designationSummary.missionaryName).toBe(
      "worker@example.com",
    );
  });
});
