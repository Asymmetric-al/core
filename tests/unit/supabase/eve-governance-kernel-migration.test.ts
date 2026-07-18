import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260717234851_eve_governance_kernel.sql",
    import.meta.url,
  ),
  "utf8",
);

const governanceTables = ["eve_governance_state", "eve_run_summaries"] as const;

describe("Eve governance kernel migration", () => {
  it("creates app-owned governance state and run summary tables", () => {
    for (const tableName of governanceTables) {
      expect(migrationSql).toContain(`CREATE TABLE public.${tableName}`);
    }

    expect(migrationSql).toContain(
      "release_enabled BOOLEAN NOT NULL DEFAULT FALSE",
    );
    expect(migrationSql).toContain(
      "emergency_off BOOLEAN NOT NULL DEFAULT FALSE",
    );
    expect(migrationSql).toContain(
      "kill_switch_state JSONB NOT NULL DEFAULT '{}'::jsonb",
    );
    expect(migrationSql).toContain(
      "policy_status TEXT NOT NULL DEFAULT 'not_configured'",
    );
  });

  it("installs a disabled global state without allowing deployment to enable it", () => {
    expect(migrationSql).toContain(
      "INSERT INTO public.eve_governance_state (id)",
    );
    expect(migrationSql).toContain("VALUES ('global')");
    expect(migrationSql).toContain("ON CONFLICT (id) DO NOTHING");
  });

  it("keeps both tables service-role only behind RLS", () => {
    for (const tableName of governanceTables) {
      expect(migrationSql).toContain(
        `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY`,
      );
      expect(migrationSql).toContain(
        `REVOKE ALL ON TABLE public.${tableName} FROM anon, authenticated`,
      );
      expect(migrationSql).toContain(
        `GRANT SELECT, INSERT, UPDATE ON TABLE public.${tableName} TO service_role`,
      );
    }
  });

  it("indexes the recent-run status path", () => {
    expect(migrationSql).toContain(
      "CREATE INDEX eve_run_summaries_status_updated_idx",
    );
    expect(migrationSql).toContain(
      "ON public.eve_run_summaries (status, updated_at DESC)",
    );
    expect(migrationSql).toContain(
      "CREATE INDEX eve_run_summaries_initiator_updated_idx",
    );
  });
});
