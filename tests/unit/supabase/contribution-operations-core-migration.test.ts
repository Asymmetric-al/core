import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260526132000_contribution_operations_core.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("contribution operations core migration", () => {
  it("enforces tenant ownership for contribution operation references", () => {
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.enforce_contribution_operation_tenant_refs()",
    );
    expect(migrationSql).toContain(
      "CREATE TRIGGER enforce_contribution_corrections_tenant_refs",
    );
    expect(migrationSql).toContain(
      "CREATE TRIGGER enforce_contribution_operation_audit_events_tenant_refs",
    );

    for (const parentTable of [
      "public.donations",
      "public.staged_gifts",
      "public.contribution_corrections",
      "public.contribution_operation_audit_events",
    ]) {
      expect(migrationSql).toContain(`FROM ${parentTable}`);
    }

    for (const mismatchMessage of [
      "contribution operation donation tenant mismatch",
      "contribution operation staged gift tenant mismatch",
      "contribution operation correction tenant mismatch",
      "contribution operation audit event tenant mismatch",
    ]) {
      expect(migrationSql).toContain(mismatchMessage);
    }
  });
});
