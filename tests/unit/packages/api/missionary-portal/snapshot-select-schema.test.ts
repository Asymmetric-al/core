import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getMissionaryPortalSnapshot } from "../../../../../packages/api/src/missionary-portal/service";

const MIGRATIONS = path.resolve(
  __dirname,
  "../../../../../supabase/migrations",
);

/** Columns each public table has once every forward migration has run. */
function migratedColumns(): Map<string, Set<string>> {
  const tables = new Map<string, Set<string>>();
  const files = readdirSync(MIGRATIONS)
    .filter((file) => file.endsWith(".sql") && !file.startsWith("rollback_"))
    .sort();
  for (const file of files) {
    const sql = readFileSync(path.join(MIGRATIONS, file), "utf8")
      .replace(/--[^\n]*/g, "")
      .replace(/\$(\w*)\$[\s\S]*?\$\1\$/g, "");
    for (const statement of sql.split(";")) {
      const create = statement.match(
        /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)\s*\(([\s\S]*)\)/i,
      );
      if (create) {
        const columns = new Set<string>();
        for (const element of topLevel(create[2] ?? "")) {
          const name = element.match(/^"?(\w+)"?/)?.[1];
          if (
            name &&
            !/^(constraint|primary|unique|foreign|check|exclude|like)$/i.test(
              name,
            )
          )
            columns.add(name);
        }
        tables.set(create[1]!, columns);
        continue;
      }
      const alter = statement.match(
        /ALTER TABLE (?:IF EXISTS )?(?:ONLY )?(?:public\.)?(\w+)\b([\s\S]*)/i,
      );
      if (!alter) continue;
      const columns = tables.get(alter[1]!);
      if (!columns) continue;
      const body = alter[2] ?? "";
      for (const [, name] of body.matchAll(
        /ADD COLUMN (?:IF NOT EXISTS )?"?(\w+)"?/gi,
      ))
        columns.add(name!);
      for (const [, name] of body.matchAll(
        /DROP COLUMN (?:IF EXISTS )?"?(\w+)"?/gi,
      ))
        columns.delete(name!);
      for (const [, from, to] of body.matchAll(
        /RENAME COLUMN "?(\w+)"? TO "?(\w+)"?/gi,
      )) {
        columns.delete(from!);
        columns.add(to!);
      }
    }
  }
  return tables;
}

/** Splits on commas that are not inside parentheses. */
function topLevel(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of list) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/** The table's own columns in a PostgREST select, without embedded joins. */
function selectedColumns(select: string): string[] {
  return topLevel(select)
    .filter((part) => !part.includes("(") && part !== "*")
    .map((part) => part.split(":").pop()!.trim());
}

/** Records every table's select and returns just enough rows to finish. */
function recordingClient(selects: Map<string, string[]>) {
  const rows: Record<string, Record<string, unknown>[]> = {
    profiles: [{ id: "profile-1", tenant_id: "tenant-1" }],
    missionaries: [{ id: "missionary-1", profile_id: "profile-1" }],
  };
  return {
    from(table: string) {
      const query = {
        select(columns: string) {
          selects.set(table, [...(selects.get(table) ?? []), columns]);
          return query;
        },
        eq: () => query,
        in: () => query,
        gt: () => query,
        order: () => query,
        limit: () => query,
        range: () => query,
        single: () =>
          Promise.resolve({ data: rows[table]?.[0] ?? null, error: null }),
        then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
          resolve({ data: rows[table] ?? [], error: null }),
      };
      return query;
    },
  };
}

describe("missionary portal snapshot reads", () => {
  it("select only columns the migrations create", async () => {
    const selects = new Map<string, string[]>();
    await getMissionaryPortalSnapshot({
      supabaseAdmin: recordingClient(selects) as never,
      tenantId: "tenant-1",
      profileId: "profile-1",
    });
    const schema = migratedColumns();

    const missing = [...selects].flatMap(([table, list]) =>
      list
        .flatMap(selectedColumns)
        .flatMap((column) =>
          schema.get(table)?.has(column) ? [] : [`${table}.${column}`],
        ),
    );

    expect(selects.has("missionary_tasks")).toBe(true);
    expect(missing).toEqual([]);
  });

  it("creates tasks with only columns the migrations create", () => {
    const source = readFileSync(
      path.resolve(
        __dirname,
        "../../../../../packages/api/src/missionary-portal/tasks.ts",
      ),
      "utf8",
    );
    const payload = source.match(
      /\.from\("missionary_tasks"\)\s*\.insert\(\{([\s\S]*?)\n\s*\}\)/,
    )?.[1];
    expect(payload).toBeDefined();
    const keys = [...payload!.matchAll(/^\s*(\w+):/gm)].map(([, key]) => key!);
    const columns = migratedColumns().get("missionary_tasks");

    expect(keys).toContain("title");
    expect(keys.filter((key) => !columns?.has(key))).toEqual([]);
  });
});
