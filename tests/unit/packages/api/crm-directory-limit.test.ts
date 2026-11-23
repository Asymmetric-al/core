import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { expect, it } from "vitest";

import { CRM_LOOKUP_CHUNK_SIZE } from "../../../../packages/api/src/admin/crm/member-labels";

const migrations = join(process.cwd(), "supabase", "migrations");
const migration = readdirSync(migrations).filter((name) =>
  /^\d+_bounded_crm_member_directory\.sql$/.test(name),
);

it.each([
  ["tenant_member_directory", "p_profile_ids"],
  ["crm_missionary_labels", "p_ids"],
])("%s enforces the application's lookup chunk size", (rpc, parameter) => {
  expect(migration).toHaveLength(1);
  const sql = readFileSync(join(migrations, migration[0]!), "utf8")
    .replace(/--[^\n]*|\/\*[\s\S]*?\*\//g, " ")
    .toLowerCase();
  const definition = sql
    .split(/\bcreate\s+(?:or\s+replace\s+)?function\s+public\./)
    .find((part) => part.startsWith(rpc + "("));
  const guard = definition?.match(
    /\bif\s+coalesce\s*\(\s*pg_catalog\.cardinality\s*\(\s*(\w+)\s*\)\s*,\s*0\s*\)\s*>\s*(\d+)\s+then\s+raise\s+exception\b/,
  );
  expect(guard?.slice(1)).toEqual([parameter, String(CRM_LOOKUP_CHUNK_SIZE)]);
});
