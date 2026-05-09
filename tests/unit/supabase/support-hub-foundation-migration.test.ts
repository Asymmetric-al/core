import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  new URL(
    "../../../supabase/migrations/20260501001500_support_hub_foundation.sql",
    import.meta.url,
  ),
  "utf8",
);

describe("support hub foundation migration", () => {
  it("keeps support workspace updated_at values current on updates", () => {
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.set_support_workspace_updated_at()",
    );
    expect(migrationSql).toContain(
      "CREATE TRIGGER set_support_contacts_updated_at",
    );
    expect(migrationSql).toContain(
      "CREATE TRIGGER set_support_tickets_updated_at",
    );
    expect(migrationSql).toContain("NEW.updated_at = NOW();");
  });
});
