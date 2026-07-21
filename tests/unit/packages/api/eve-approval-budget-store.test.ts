import { describe, expect, it, vi } from "vitest";

import { loadEveApprovalBudgetAdminView } from "../../../../packages/api/src/eve/approval-budget/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const emptyResult = { data: [], error: null };

describe("Eve approval-budget store", () => {
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
          table === "eve_operational_budgets" ||
          table === "eve_budget_usage_windows"
        ) {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue(emptyResult),
            }),
          };
        }
        if (table === "eve_budget_emergency_overrides") {
          return {
            select: vi.fn().mockReturnValue({
              gt: vi.fn().mockResolvedValue(emptyResult),
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
});
