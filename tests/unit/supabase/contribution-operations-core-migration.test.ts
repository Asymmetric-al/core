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
      "contribution operation staged gift donation mismatch",
      "contribution operation correction tenant mismatch",
      "contribution operation correction donation mismatch",
      "contribution operation correction staged gift mismatch",
      "contribution operation audit event tenant mismatch",
      "contribution operation audit event donation mismatch",
      "contribution operation audit event staged gift mismatch",
    ]) {
      expect(migrationSql).toContain(mismatchMessage);
    }

    expect(migrationSql).toContain("SELECT sg.tenant_id, sg.donation_id");
    expect(migrationSql).toContain(
      "SELECT cc.tenant_id, cc.donation_id, cc.staged_gift_id",
    );
    expect(migrationSql).toContain(
      "SELECT ae.tenant_id, ae.donation_id, ae.staged_gift_id",
    );
  });
});
