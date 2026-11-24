import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  );

const MIGRATIONS = "supabase/migrations";

const DEFINITION =
  /FUNCTION public\.resolve_verified_host\(p_host text\)\s*RETURNS TABLE \(([^)]*)\)/g;

function forwardMigrations(): Array<[string, string]> {
  return readdirSync(
    fileURLToPath(new URL(`../../../${MIGRATIONS}`, import.meta.url)),
  )
    .filter((name) => /^\d{14}_.*\.sql$/.test(name))
    .sort()
    .map((name): [string, string] => [name, read(`${MIGRATIONS}/${name}`)]);
}

function lastDefinition(migrations: Array<[string, string]>) {
  let last: { file: string; columns: string[] } | null = null;
  for (const [file, sql] of migrations) {
    for (const match of sql.matchAll(DEFINITION)) {
      last = {
        file,
        columns: match[1]!
          .split(",")
          .map((column) => column.trim().split(/\s+/)[0]!)
          .sort(),
      };
    }
  }
  return last;
}

function migrationColumns(): string[] {
  const last = lastDefinition(forwardMigrations());
  expect(last).not.toBeNull();
  return last!.columns;
}

function typeColumns(): string[] {
  const block = read("packages/database/types/database.ts").match(
    /resolve_verified_host: \{([\s\S]*?)\}\)\[\];/,
  )?.[1];
  expect(block).toBeTruthy();
  const pick = block!.match(/Pick<\s*SiteDomain,\s*([^>]*)>/)?.[1] ?? "";
  const picked = [...pick.matchAll(/"(\w+)"/g)].map((match) => match[1]!);
  const added = [...block!.matchAll(/^\s*(\w+):/gm)]
    .map((match) => match[1]!)
    .filter((name) => name !== "Args" && name !== "Returns");
  return [...new Set([...picked, ...added])].sort();
}

describe("the verified-name lookup reads the anonymous lookup it was written for", () => {
  it("calls resolve_verified_host with p_host", () => {
    const source = read("packages/auth/verified-name.ts");
    expect(source).toMatch(
      /\.rpc\(\s*"resolve_verified_host",\s*\{\s*p_host:\s*host\s*\}\s*\)/,
    );
    expect(source).toMatch(/SiteFunctions\["resolve_verified_host"\]/);
  });

  it("names the six fields of the last migration's RETURNS TABLE and of the database type", async () => {
    const { VERIFIED_HOST_FIELDS } =
      await import("../../../packages/auth/verified-name");
    const fields = [...VERIFIED_HOST_FIELDS].sort();
    expect(fields).toHaveLength(6);
    expect(fields).toEqual(migrationColumns());
    expect(fields).toEqual(typeColumns());
  });

  it("reads the last definition across the forward migrations, so a later one that changes the columns fails", () => {
    const migrations = forwardMigrations();
    expect(migrations.length).toBeGreaterThan(1);
    expect(lastDefinition(migrations)?.file).toBe(
      "20261125010000_wp3a1b_claimed_names.sql",
    );
    const later = lastDefinition([
      ...migrations,
      [
        "29991231000000_later.sql",
        "CREATE OR REPLACE FUNCTION public.resolve_verified_host(p_host text)\nRETURNS TABLE (tenant_id uuid, generation bigint, surfaces text[], state text, is_home boolean)",
      ],
    ]);
    expect(later?.file).toBe("29991231000000_later.sql");
    expect(later?.columns).not.toEqual(migrationColumns());
  });

  it("never reaches for the service key, the session client or request headers", () => {
    const source = read("packages/auth/verified-name.ts");
    expect(source).not.toMatch(/service[_-]?role|SERVICE_ROLE|getAdminClient/i);
    expect(source).not.toMatch(/@supabase\/ssr|createServerClient/);
    expect(source).not.toMatch(/next\/headers/);
    expect(source).toMatch(/from "@supabase\/supabase-js"/);
    expect(source).toMatch(/getSupabasePublicConfig\(\)/);
  });
});
