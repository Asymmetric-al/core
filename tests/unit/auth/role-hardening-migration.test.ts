import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

async function read(relativePath: string) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

function extractHandleNewUser(sql: string) {
  const match = sql.match(
    /CREATE OR REPLACE FUNCTION public\.handle_new_user\(\)[\s\S]*?\$function\$;/,
  );
  return match?.[0] ?? "";
}

describe("auth role hardening migration artifacts", () => {
  it("contains role allowlist constraint + donor assignment", async () => {
    const sql = await read(
      "supabase/migrations/20260227060000_auth_role_hardening.sql",
    );

    expect(sql).toContain("ADD CONSTRAINT profiles_role_check");
    expect(sql).toContain("ALTER COLUMN role SET NOT NULL");
    expect(sql).toContain("ALTER COLUMN role SET DEFAULT 'donor'");
    expect(sql).toContain("'donor'");
    expect(sql).not.toContain("raw_user_meta_data->>'role'");
  });

  it("keeps canonical schema trigger donor-enforced", async () => {
    const schemaSql = await read(path.join("supabase", "schema.sql"));
    const handleNewUser = extractHandleNewUser(schemaSql);

    expect(handleNewUser).toContain("'donor'");
    expect(handleNewUser).not.toContain("raw_user_meta_data->>'role'");
  });

  it("keeps init migration trigger donor-enforced", async () => {
    const initSql = await read(
      path.join("supabase", "migrations", "20250101000000_init_schema.sql"),
    );
    const handleNewUser = extractHandleNewUser(initSql);

    expect(handleNewUser).toContain("'donor'");
    expect(handleNewUser).not.toContain("raw_user_meta_data->>'role'");
  });
});
