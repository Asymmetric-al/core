import { describe, expect, it, vi } from "vitest";

import { loadEveApprovalBudgetAdminView } from "../../../../packages/api/src/eve/approval-budget/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const emptyResult = { data: [], error: null };

function createQuery() {
  const result = Promise.resolve({ data: [], error: null });
  const query = {
    eq: vi.fn(),
    gt: vi.fn(),
    limit: vi.fn(),
    order: vi.fn(),
    select: vi.fn(),
    then: result.then.bind(result),
  };
  query.eq.mockReturnValue(query);
  query.gt.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.select.mockReturnValue(query);
  return query;
}

describe("Eve approval and budget store", () => {
  it("loads active-runs catalog entries", async () => {
    const catalogResult = {
      data: [
        {
          action_id: "engineering.monitor.collect",
          trust_zone: "engineering",
          write_class: "operational",
          governance_domain: "active_runs",
          budget_scope_type: "expensive_feature",
          budget_scope_id: "engineering-health-monitors",
          request_cost: 1,
          usd_micros_cost: 500,
          input_token_cost: 0,
          output_token_cost: 0,
        },
      ],
      error: null,
    };
    const supabaseAdmin = {
      from: vi.fn((table: string) => {
        if (table === "eve_action_policy_catalog") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(catalogResult),
              }),
            }),
          };
        }
        if (
          table === "eve_approval_policies" ||
          table === "eve_operational_budgets"
        ) {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(emptyResult),
            }),
          };
        }
        if (table === "eve_budget_usage_windows") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(emptyResult),
              }),
            }),
          };
        }
        if (table === "eve_budget_emergency_overrides") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                gt: vi.fn().mockResolvedValue(emptyResult),
              }),
            }),
          };
        }
        if (
          table === "eve_action_approvals" ||
          table === "eve_policy_decisions"
        ) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockResolvedValue(emptyResult),
                }),
              }),
            }),
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    } as unknown as AdminSupabaseClient;

    const view = await loadEveApprovalBudgetAdminView({
      supabaseAdmin,
      tenantId: "11111111-1111-4111-8111-111111111111",
    });

    expect(view.catalog).toEqual([
      expect.objectContaining({
        actionId: "engineering.monitor.collect",
        domain: "active_runs",
      }),
    ]);
  });

  it("loads tenant-owned budget usage and overrides only", async () => {
    const queries = new Map<string, ReturnType<typeof createQuery>>();
    const client = {
      from: vi.fn((table: string) => {
        const query = createQuery();
        queries.set(table, query);
        return query;
      }),
    } as unknown as AdminSupabaseClient;

    await loadEveApprovalBudgetAdminView({
      supabaseAdmin: client,
      tenantId: "00000000-0000-4000-8000-000000000001",
    });

    expect(queries.get("eve_budget_usage_windows")?.eq).toHaveBeenCalledWith(
      "tenant_id",
      "00000000-0000-4000-8000-000000000001",
    );
    expect(
      queries.get("eve_budget_emergency_overrides")?.eq,
    ).toHaveBeenCalledWith("tenant_id", "00000000-0000-4000-8000-000000000001");
  });
});
