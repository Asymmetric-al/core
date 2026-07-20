import { describe, expect, it, vi } from "vitest";

import { loadEveApprovalBudgetAdminView } from "../../../../packages/api/src/eve/approval-budget/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

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
  it("loads emergency overrides only for the requested tenant", async () => {
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

    expect(
      queries.get("eve_budget_emergency_overrides")?.eq,
    ).toHaveBeenCalledWith("tenant_id", "00000000-0000-4000-8000-000000000001");
  });
});
