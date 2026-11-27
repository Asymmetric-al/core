import { readFileSync } from "node:fs";

import { assessEnvironmentMarker } from "../../../../scripts/lib/environment-marker.mjs";
import { MIG } from "./harness";

import type pg from "pg";

export const SUFFIX = "_wp5_2r3_assignment_keys";
export const TABLES = [
  "donors",
  "posts",
  "follows",
  "follower_requests",
  "missionary_tasks",
] as const;
export type Table = (typeof TABLES)[number];
export const PARTITION = [
  "unowned",
  "null_tenant",
  "absent",
  "ambiguous",
  "pending",
  "valid",
  "invalid",
] as const;
export const FUNCTIONS = [
  "private.derive_ministry_assignment_id()",
  "private.rederive_ministry_assignment_children()",
  "private.repair_ministry_assignment_ids()",
  "private.ministry_assignment_key_report()",
];
export const REPAIR_REFUSAL =
  "repair_ministry_assignment_ids needs a superuser or a role with BYPASSRLS: every table it reads forces row security, so any other caller would change nothing";
export const REPORT_REFUSAL =
  "ministry_assignment_key_report needs a superuser or a role with BYPASSRLS: every table it reads forces row security, so any other caller would count nothing";
export const COMMITTED =
  "select to_regprocedure('private.repair_ministry_assignment_ids()') is not null as committed";

export type Report = Record<string, Record<string, number>>;

export async function readReport(client: pg.Client): Promise<Report> {
  const result = await client.query(
    "select * from private.ministry_assignment_key_report()",
  );
  return Object.fromEntries(
    result.rows.map((row: Record<string, unknown>) => [
      String(row.table_name),
      Object.fromEntries(
        Object.entries(row)
          .filter(([key]) => key !== "table_name")
          .map(([key, value]) => [key, Number(value)]),
      ),
    ]),
  );
}

export function delta(after: Report, before: Report, table: string) {
  return Object.fromEntries(
    Object.keys(after[table]!).map((key) => [
      key,
      after[table]![key]! - before[table]![key]!,
    ]),
  );
}

export function lines(file: string, from: number, to: number) {
  return readFileSync(`${MIG}/${file}`, "utf8")
    .split(/\r?\n/)
    .slice(from - 1, to)
    .join("\n");
}

export function downSql(file: string) {
  const text = readFileSync(file, "utf8");
  const start = text.indexOf("-- Down begins\n");
  const end = text.indexOf("-- Down ends\n");
  if (start < 0 || end < start) throw new Error(`${file} has no Down block`);
  return text
    .slice(start, end)
    .split("\n")
    .filter((line) => line.startsWith("--   "))
    .map((line) => line.slice("--   ".length))
    .map((line) => {
      const include = /^\\lines (\d+)-(\d+) of (\S+)$/.exec(line);
      return include
        ? lines(include[3]!, Number(include[1]), Number(include[2]))
        : line;
    })
    .join("\n");
}

export function checkSql(file: string) {
  const text = readFileSync(file, "utf8");
  const start = text.indexOf("-- Check begins\n");
  const end = text.indexOf("-- Check ends\n");
  if (start < 0 || end < start) throw new Error(`${file} has no Check block`);
  return text
    .slice(start, end)
    .split("\n")
    .filter((line) => line.startsWith("--   "))
    .map((line) => line.slice("--   ".length))
    .join("\n");
}

export async function repairOnDisposable(client: pg.Client) {
  const present = await client.query(
    "select to_regprocedure('platform.environment_kind()') is not null as present",
  );
  const kind = present.rows[0].present
    ? ((await client.query("select platform.environment_kind() as kind"))
        .rows[0].kind as string | null)
    : null;
  const verdict = assessEnvironmentMarker(kind);
  if (!verdict.ok)
    throw new Error(
      `refusing to run the global key repair: the database ${verdict.reason}`,
    );
  return (
    await client.query("select * from private.repair_ministry_assignment_ids()")
  ).rows as Record<string, unknown>[];
}
