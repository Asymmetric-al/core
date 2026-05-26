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
}

function createSupabaseStub(
  resultsByTable: Record<string, QueryResult>,
): AdminSupabaseClient {
  return {
    from(table: string) {
      return new SupabaseQueryStub(
        resultsByTable[table] ?? { data: null, error: null },
      );
    },
  } as unknown as AdminSupabaseClient;
}

describe("contribution operations store", () => {
  it("uses missionary email when profile name fields are blank", async () => {
    const supabaseAdmin = createSupabaseStub({
      donations: {
        data: {
          id: "donation_1",
          tenant_id: "tenant_1",
          missionary_id: "missionary_1",
          amount: 5000,
          currency: "usd",
          status: "completed",
          created_at: "2026-05-01T00:00:00.000Z",
          updated_at: "2026-05-01T00:00:00.000Z",
        },
        error: null,
      },
      missionaries: {
        data: {
          id: "missionary_1",
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
      staged_gifts: { data: null, error: null },
      contribution_operation_audit_events: { data: [], error: null },
      contribution_corrections: { data: [], error: null },
    });

    const detail = await loadContributionDetailFromSupabase({
      supabaseAdmin,
      tenantId: "tenant_1",
      contributionId: "donation_1",
    });

    expect(detail.designation.missionaryName).toBe("worker@example.com");
  });
});
