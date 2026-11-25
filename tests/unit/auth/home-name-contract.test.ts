import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url)),
    "utf8",
  );

const MIGRATIONS = "supabase/migrations";

function forwardMigrations(): Array<[string, string]> {
  return readdirSync(
    fileURLToPath(new URL(`../../../${MIGRATIONS}`, import.meta.url)),
  )
    .filter((name) => /^\d{14}_.*\.sql$/.test(name))
    .sort()
    .map((name): [string, string] => [name, read(`${MIGRATIONS}/${name}`)]);
}

function lastDefinition(fn: string) {
  const pattern = new RegExp(
    `FUNCTION public\\.${fn}\\(p_host text\\)\\s*RETURNS TABLE \\(([^)]*)\\)[\\s\\S]*?AS \\$\\$([\\s\\S]*?)\\$\\$;`,
    "g",
  );
  let last: { file: string; columns: string[]; body: string } | null = null;
  for (const [file, sql] of forwardMigrations()) {
    for (const match of sql.matchAll(pattern)) {
      last = {
        file,
        columns: match[1]!
          .split(",")
          .map((column) => column.trim().split(/\s+/)[0]!),
        body: match[2]!,
      };
    }
  }
  expect(last, fn).not.toBeNull();
  return last!;
}

function hostNormalization(body: string): string {
  const expression = body.match(
    /\.host = (CASE\s+WHEN pg_catalog\.octet_length\(p_host\)[\s\S]*?\bEND)\b/,
  )?.[1];
  expect(expression).toBeTruthy();
  return expression!.replace(/\s+/g, " ");
}

function typeColumns(): string[] {
  const block = read("packages/database/types/database.ts").match(
    /resolve_home_host: \{([\s\S]*?)\n {2}\};/,
  )?.[1];
  expect(block).toBeTruthy();
  const returns = block!.match(/Returns: \{([^}]*)\}\[\];/)?.[1] ?? "";
  return [...returns.matchAll(/(\w+):/g)].map((match) => match[1]!);
}

describe("the home lookup reads the anonymous home read it was written for", () => {
  it("makes one rpc call, resolve_home_host with p_host, typed from SiteFunctions", () => {
    const source = read("packages/auth/home-name.ts");
    expect([...source.matchAll(/\.rpc\s*\(/g)]).toHaveLength(1);
    expect(source).toMatch(
      /\.rpc\(\s*"resolve_home_host",\s*\{\s*p_host:\s*host\s*\}\s*\)/,
    );
    expect(source).toMatch(/SiteFunctions\["resolve_home_host"\]/);
    expect(source).toMatch(/export async function lookUpHomeName\b/);
  });

  it("never reaches for the service key, the session client or request headers", () => {
    const source = read("packages/auth/home-name.ts");
    expect(source).not.toMatch(/service[_-]?role|SERVICE_ROLE|getAdminClient/i);
    expect(source).not.toMatch(/@supabase\/ssr|createServerClient/);
    expect(source).not.toMatch(/next\/headers/);
    expect(source).toMatch(/from "@supabase\/supabase-js"/);
    expect(source).toMatch(/getSupabasePublicConfig\(\)/);
  });

  it("names the one field of the last migration's RETURNS TABLE and of the database type", async () => {
    const { HOME_HOST_FIELDS } =
      await import("../../../packages/auth/home-name");
    const definition = lastDefinition("resolve_home_host");
    expect([...HOME_HOST_FIELDS]).toEqual(["primary_domain"]);
    expect([...HOME_HOST_FIELDS]).toEqual(definition.columns);
    expect([...HOME_HOST_FIELDS]).toEqual(typeColumns());
  });

  it("is exported as @asym/auth/home-name and leaves verified-name.ts with its one rpc call", () => {
    const pkg = JSON.parse(read("packages/auth/package.json")) as {
      exports: Record<string, string>;
    };
    expect(pkg.exports["./home-name"]).toBe("./home-name.ts");
    const verified = read("packages/auth/verified-name.ts");
    expect([...verified.matchAll(/\.rpc\s*\(/g)]).toHaveLength(1);
    expect(verified).not.toMatch(/resolve_home_host/);
  });
});

describe("one host normalization (WP3b part 2 note 5)", () => {
  it("resolve_home_host normalizes the asked host with the same text as resolve_verified_host's last definition", () => {
    const verified = lastDefinition("resolve_verified_host");
    const home = lastDefinition("resolve_home_host");
    expect(hostNormalization(home.body)).toBe(hostNormalization(verified.body));
    expect(hostNormalization(verified.body)).toBe(
      `CASE WHEN pg_catalog.octet_length(p_host) <= 300 THEN pg_catalog.lower(pg_catalog.regexp_replace(p_host COLLATE "C", '\\.?(:[0-9]+)?$', '')) END`,
    );
  });

  it("would fail if either copy drifted", () => {
    const verified = hostNormalization(
      lastDefinition("resolve_verified_host").body,
    );
    const drifted = hostNormalization(
      lastDefinition("resolve_home_host").body.replace("<= 300", "<= 301"),
    );
    expect(drifted).not.toBe(verified);
  });
});
