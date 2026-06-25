import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = fileURLToPath(
  new URL(
    "../../../supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql",
    import.meta.url,
  ),
);

describe("canonical TanStack DB Supabase migration", () => {
  const migrationSql = readFileSync(migrationPath, "utf8");

  it("uses duplicate-safe realtime publication checks", () => {
    expect(migrationSql).toContain("pg_publication_tables");
    expect(migrationSql).toContain("supabase_realtime");
    expect(migrationSql).toContain("ALTER PUBLICATION supabase_realtime ADD TABLE");
  });

  it("keeps finance and server-only tables out of the realtime allowlist", () => {
    const realtimeBlock =
      migrationSql.match(/FOREACH realtime_table IN ARRAY ARRAY\[[\s\S]*?\]/)
        ?.at(0) ?? "";

    expect(realtimeBlock).not.toContain("donations");
    expect(realtimeBlock).not.toContain("donors");
    expect(realtimeBlock).not.toContain("donor_pledges");
    expect(realtimeBlock).not.toContain("donor_activities");
    expect(realtimeBlock).not.toContain("tenants");
    expect(realtimeBlock).not.toContain("pdf_templates");
  });

  it("removes demo public read from sensitive browser-blocked tables", () => {
    expect(migrationSql).toContain(
      'DROP POLICY IF EXISTS "public read" ON public.%I',
    );
    expect(migrationSql).toContain("REVOKE ALL ON TABLE public.tenants");
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.donor_feed_preferences",
    );
    expect(migrationSql).toContain(
      "REVOKE ALL ON TABLE public.follower_requests",
    );
  });
});
