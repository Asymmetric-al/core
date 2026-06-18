import { describe, expect, expectTypeOf, it } from "vitest";

import type {
  AdminSupabaseFilterBuilder,
  AdminSupabaseFluentFilterBuilder,
  SupabaseColumn,
} from "../../src/admin/shared/supabase-filter-builder";

type ExampleRow = {
  id: string;
  tenant_id: string;
  amount: number;
  created_at: string;
  profile_id: string | null;
  tags: string[] | null;
};

// This suite is a compile-time regression guard. The assertions below are
// enforced by TypeScript during `turbo typecheck`; Vitest only keeps the file
// in the unit-test graph so the contract stays easy to run locally.
function assertBuilderTypes(query: AdminSupabaseFilterBuilder<ExampleRow>) {
  const chainedQuery = query
    .eq("tenant_id", "tenant-1")
    .neq("id", "excluded")
    .gt("amount", 100)
    .lt("created_at", "2026-01-01")
    .gte("amount", 10)
    .lte("amount", 1000)
    .in("id", ["donation-1", "donation-2"])
    .is("profile_id", null)
    .not("profile_id", "is", null)
    .overlaps("tags", ["major-donor"])
    .or("id.eq.donation-1,id.eq.donation-2")
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(50);

  expectTypeOf(chainedQuery).toEqualTypeOf<
    AdminSupabaseFilterBuilder<ExampleRow>
  >();

  expectTypeOf<"created_at">().toMatchTypeOf<SupabaseColumn<ExampleRow>>();

  // @ts-expect-error unknown table columns must not be accepted by filter helpers
  query.eq("missing_column", "value");
}

void assertBuilderTypes;

type TableRow = {
  id: string;
  tenant_id: string;
  created_at: string;
};

type SelectedRow = {
  id: string;
  created_at: string;
  display_name: string | null;
};

type SelectedQuery = {
  selectedRows: SelectedRow[];
};

function assertSplitTableAndSelectedRows(
  query: AdminSupabaseFluentFilterBuilder<TableRow, SelectedQuery>,
) {
  const selectedQuery = query.eq("tenant_id", "tenant-1");

  expectTypeOf(selectedQuery).toMatchTypeOf<SelectedQuery>();

  // @ts-expect-error selected-only fields must not become filterable columns
  query.eq("display_name", "Ada");
}

void assertSplitTableAndSelectedRows;

describe("supabase filter builder type contract", () => {
  it("keeps compile-time admin list query contracts in the unit suite", () => {
    expect(true).toBe(true);
  });
});
