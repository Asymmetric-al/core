import { describe, expect, it } from "vitest";

import { loadContributionDetailFromSupabase } from "../../../../../packages/api/src/admin/contribution-operations/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type QueryResult = {
  data: unknown;
  error: null;
};

type SupabaseQueryState = {
  table: string;
  select: string | null;
  eqFilters: Map<string, unknown>;
  inFilters: Map<string, unknown[]>;
  orderBy: Array<{ column: string; ascending?: boolean }>;
  limitCount: number | null;
};

type QueryResolver = QueryResult | ((query: SupabaseQueryState) => QueryResult);

const emptyRows = { data: [], error: null } satisfies QueryResult;
const nullRow = { data: null, error: null } satisfies QueryResult;

class SupabaseQueryStub {
  private readonly state: SupabaseQueryState;

  constructor(
    table: string,
    private readonly resolver: QueryResolver,
  ) {
    this.state = {
      table,
      select: null,
      eqFilters: new Map(),
      inFilters: new Map(),
      orderBy: [],
      limitCount: null,
    };
  }

  select(columns: string): this {
    this.state.select = columns;
    return this;
  }

  eq(column: string, value: unknown): this {
    this.state.eqFilters.set(column, value);
    return this;
  }

  in(column: string, values: unknown[]): this {
    this.state.inFilters.set(column, values);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    this.state.orderBy.push({ column, ascending: options?.ascending });
    return this;
  }

  limit(count: number): Promise<QueryResult> {
    this.state.limitCount = count;
    return this.resolve();
  }

  maybeSingle(): Promise<QueryResult> {
    return this.resolve();
  }

  single(): Promise<QueryResult> {
    return this.resolve();
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?:
      | ((value: QueryResult) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.resolve().then(onfulfilled, onrejected);
  }

  private resolve(): Promise<QueryResult> {
    const result =
      typeof this.resolver === "function"
        ? this.resolver(this.state)
        : this.resolver;
    return Promise.resolve(result);
  }
}

function createSupabaseStub(
  resultsByTable: Record<string, QueryResolver>,
): AdminSupabaseClient {
  return {
    from(table: string) {
      const resolver = resultsByTable[table];
      if (!resolver) {
        throw new Error(`Unexpected Supabase table query: ${table}`);
      }

      return new SupabaseQueryStub(table, resolver);
    },
  } as unknown as AdminSupabaseClient;
}

function expectTenantScoped(query: SupabaseQueryState, tenantId: string): void {
  expect(query.eqFilters.get("tenant_id")).toBe(tenantId);
}

function expectIncludesIds(
  query: SupabaseQueryState,
  expectedIds: string[],
): void {
  expect(new Set(query.inFilters.get("id") ?? [])).toEqual(
    new Set(expectedIds),
  );
}

function baseContributionTables() {
  return {
    staged_gifts: nullRow,
    contribution_operation_audit_events: emptyRows,
    contribution_corrections: emptyRows,
    contribution_correction_requests: emptyRows,
    donation_crm_links: emptyRows,
  } satisfies Record<string, QueryResolver>;
}

describe("contribution operations store", () => {
  it("hydrates donation missionary labels from profile email when name fields are blank", async () => {
    const tenantId = "00000000-0000-4000-8000-000000000001";
    const donationId = "00000000-0000-4000-8000-000000000002";
    const missionaryId = "00000000-0000-4000-8000-000000000003";
    const queriedMissionaryIds: unknown[][] = [];
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
      contribution_adjustments: emptyRows,
      missionaries: (query) => {
        queriedMissionaryIds.push(query.inFilters.get("id") ?? []);
        expectTenantScoped(query, tenantId);
        expectIncludesIds(query, [missionaryId]);
        return {
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
        };
      },
      ...baseContributionTables(),
    });

    const detail = await loadContributionDetailFromSupabase({
      supabaseAdmin,
      tenantId,
      contributionId: donationId,
    });

    expect(queriedMissionaryIds).toEqual([[missionaryId]]);
    expect(detail.designations.lines).toHaveLength(1);
    expect(detail.designations.lines[0]!.missionaryName).toBe(
      "worker@example.com",
    );
    expect(detail.shared.designationSummary.missionaryName).toBe(
      "worker@example.com",
    );
  });

  it("hydrates donor, CRM, correction request, and recurring agreement detail", async () => {
    const tenantId = "00000000-0000-4000-8000-000000000011";
    const donationId = "00000000-0000-4000-8000-000000000012";
    const donorId = "00000000-0000-4000-8000-000000000013";
    const donationFundId = "00000000-0000-4000-8000-000000000014";
    const pledgeId = "00000000-0000-4000-8000-000000000015";
    const pledgeFundId = "00000000-0000-4000-8000-000000000016";
    const stagedGiftId = "00000000-0000-4000-8000-000000000017";
    const supabaseAdmin = createSupabaseStub({
      donations: {
        data: {
          id: donationId,
          tenant_id: tenantId,
          donor_id: donorId,
          fund_id: donationFundId,
          pledge_id: pledgeId,
          amount: 7500,
          currency: "usd",
          status: "completed",
          donation_type: "recurring",
          payment_method: "card",
          is_recurring: true,
          recurring_interval: "month",
          refund_amount: 0,
          gift_date: "2026-05-05T00:00:00.000Z",
          created_at: "2026-05-05T00:00:00.000Z",
          updated_at: "2026-05-05T00:00:00.000Z",
        },
        error: null,
      },
      contribution_adjustments: emptyRows,
      donors: (query) => {
        expectTenantScoped(query, tenantId);
        expect(query.eqFilters.get("id")).toBe(donorId);
        return {
          data: {
            id: donorId,
            profile_id: "profile_donor",
            name: "Jordan Donor",
            email: "jordan@example.com",
            phone: "555-0100",
            mobile: "555-0101",
            location: "Austin, TX",
            organization: "Jordan Family",
          },
          error: null,
        };
      },
      staged_gifts: {
        data: {
          id: stagedGiftId,
          donation_id: donationId,
          status: "posted",
          receipt_status: "sent",
          crm_post_status: "queued",
          twenty_record_id: "twenty_staged",
        },
        error: null,
      },
      staged_gift_allocations: emptyRows,
      contribution_operation_audit_events: emptyRows,
      contribution_corrections: emptyRows,
      contribution_correction_requests: {
        data: [
          {
            id: "request_1",
            action_type: "designation_correction",
            status: "pending",
            reason: "Needs review",
            requested_by_profile_id: "profile_requester",
            created_at: "2026-05-06T00:00:00.000Z",
          },
        ],
        error: null,
      },
      donation_crm_links: {
        data: [
          {
            id: "crm_parent",
            scope: "parent",
            allocation_id: null,
            link_status: "active",
            twenty_record_id: "twenty_parent",
            last_error: null,
          },
          {
            id: "crm_designation",
            scope: "designation",
            allocation_id: "allocation_1",
            link_status: "failed",
            twenty_record_id: null,
            last_error: "Twenty rejected the child record.",
          },
        ],
        error: null,
      },
      donor_pledges: (query) => {
        expectTenantScoped(query, tenantId);
        expect(query.eqFilters.get("id")).toBe(pledgeId);
        return {
          data: {
            id: pledgeId,
            status: "active",
            frequency: "month",
            amount: 7500,
            currency: "usd",
            fund_id: pledgeFundId,
            missionary_id: null,
            next_payment_date: "2026-06-05",
            next_charge_at: "2026-06-05T12:00:00.000Z",
            stripe_subscription_id: "sub_123",
          },
          error: null,
        };
      },
      funds: (query) => {
        expectTenantScoped(query, tenantId);
        expectIncludesIds(query, [donationFundId, pledgeFundId]);
        return {
          data: [
            {
              id: donationFundId,
              name: "General Fund",
              missionary_id: null,
              goal_amount: null,
              start_date: null,
              end_date: null,
            },
            {
              id: pledgeFundId,
              name: "Monthly Support",
              missionary_id: null,
              goal_amount: null,
              start_date: null,
              end_date: null,
            },
          ],
          error: null,
        };
      },
    });

    const detail = await loadContributionDetailFromSupabase({
      supabaseAdmin,
      tenantId,
      contributionId: donationId,
    });

    expect(detail.donor).toMatchObject({
      id: donorId,
      name: "Jordan Donor",
      email: "jordan@example.com",
      phoneNumbers: ["555-0100", "555-0101"],
    });
    expect(detail.correctionRequests).toEqual([
      {
        id: "request_1",
        actionType: "designation_correction",
        status: "pending",
        reason: "Needs review",
        requestedByProfileId: "profile_requester",
        createdAt: "2026-05-06T00:00:00.000Z",
        receiptDeliveryProposal: null,
        receiptAffectedFields: [],
      },
    ]);
    expect(detail.crm.parent.twentyRecordId).toBe("twenty_parent");
    expect(detail.crm.designationRecords).toEqual([
      {
        allocationId: "allocation_1",
        status: "failed",
        twentyRecordId: null,
        lastError: "Twenty rejected the child record.",
      },
    ]);
    expect(detail.crm.failedScopes).toEqual([
      { scope: "designation", allocationId: "allocation_1" },
    ]);
    expect(detail.recurring).toMatchObject({
      isRecurring: true,
      interval: "month",
      pledgeId,
      providerRecurrenceWithoutAgreement: false,
      agreement: {
        id: pledgeId,
        fundId: pledgeFundId,
        fundName: "Monthly Support",
        stripeSubscriptionId: "sub_123",
      },
    });
  });

  it("hydrates summary labels from the effective missionary after corrections", async () => {
    const tenantId = "00000000-0000-4000-8000-000000000021";
    const donationId = "00000000-0000-4000-8000-000000000022";
    const originalMissionaryId = "00000000-0000-4000-8000-000000000023";
    const effectiveMissionaryId = "00000000-0000-4000-8000-000000000024";
    const queriedMissionaryIds: unknown[][] = [];
    const supabaseAdmin = createSupabaseStub({
      donations: {
        data: {
          id: donationId,
          tenant_id: tenantId,
          missionary_id: originalMissionaryId,
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
      contribution_adjustments: {
        data: [
          {
            id: "adjustment_1",
            adjustment_type: "allocation_correction",
            status: "applied",
            effective_values: { missionaryId: effectiveMissionaryId },
            reason: "Correct missionary",
            actor_profile_id: "profile_actor",
            source_surface: "contribution_hub",
            created_at: "2026-05-02T00:00:00.000Z",
          },
        ],
        error: null,
      },
      missionaries: (query) => {
        queriedMissionaryIds.push(query.inFilters.get("id") ?? []);
        expectTenantScoped(query, tenantId);
        expectIncludesIds(query, [effectiveMissionaryId]);
        return {
          data: [
            {
              id: effectiveMissionaryId,
              profile: {
                display_name: "Correct Worker",
                full_name: null,
                first_name: null,
                last_name: null,
                email: "correct@example.com",
              },
            },
          ],
          error: null,
        };
      },
      ...baseContributionTables(),
    });

    const detail = await loadContributionDetailFromSupabase({
      supabaseAdmin,
      tenantId,
      contributionId: donationId,
    });

    expect(queriedMissionaryIds).toEqual([[effectiveMissionaryId]]);
    expect(detail.original.missionaryId).toBe(originalMissionaryId);
    expect(detail.effective.missionaryId).toBe(effectiveMissionaryId);
    expect(detail.designations.lines[0]!.missionaryId).toBe(
      effectiveMissionaryId,
    );
    expect(detail.shared.designationSummary.missionaryName).toBe(
      "Correct Worker",
    );
  });
});
