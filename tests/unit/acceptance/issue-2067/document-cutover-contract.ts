/**
 * The `document_cutover` database contract for GitHub issue #2067 addendum 4.
 * Addendum 4 (Blake-approved 2026-10-20 10:31 PM PT):
 * {@link https://github.com/Asymmetric-al/core/issues/2067#issuecomment-6308840307}
 * Engineering rulings (Samson, 2026-10-20 11:03 PM PT) on Acceptance's
 * questions: item 2 pins the function names, arguments and result columns in
 * this ONE module, imported by the fake (./fake-postgres.ts), the unit tests,
 * the static migration checks and the real-stack integration test. The fake
 * routes by exact name. Item 11: functions return counts only — every result
 * column is numeric (`bigint`), and no function returns row data or
 * identifiers. The schema version is therefore a `bigint` (the 14-digit
 * migration version, e.g. 20260704140000), never the `statements` column.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */

export const DOCUMENT_CUTOVER_SCHEMA = "document_cutover";
export const READER_ROLE = "document_cutover_reader";

/** Scenario key used by the fake's `rlsEmpty` / `hang` switches. */
export type DocumentCutoverRoute =
  | "schema_version"
  | "users"
  | "table"
  | "storage"
  | "external"
  | "jobs"
  | "reports"
  | "integrations";

export interface DocumentCutoverFunction {
  /** Exact function name in schema `document_cutover`. */
  name: string;
  /** Argument names and Postgres types, in order. */
  args: ReadonlyArray<{ name: string; type: "text" }>;
  /**
   * Result columns. A single-column function is a scalar `RETURNS bigint`
   * (Postgres names the column after the function); a multi-column one is
   * `RETURNS TABLE (...)` returning exactly one row.
   */
  columns: ReadonlyArray<{ name: string; type: "bigint" }>;
  route: DocumentCutoverRoute;
  /** What it counts (documentation for Builder and reviewers). */
  reads: string;
}

export const DOCUMENT_CUTOVER_FUNCTIONS = [
  {
    name: "schema_version",
    args: [],
    columns: [{ name: "schema_version", type: "bigint" }],
    route: "schema_version",
    reads:
      "max(version)::bigint from supabase_migrations.schema_migrations (never `statements`)",
  },
  {
    name: "auth_user_count",
    args: [],
    columns: [{ name: "auth_user_count", type: "bigint" }],
    route: "users",
    reads: "count(*) from auth.users",
  },
  {
    name: "table_census",
    args: [{ name: "p_table", type: "text" }],
    columns: [
      { name: "row_count", type: "bigint" },
      { name: "tenant_count", type: "bigint" },
    ],
    route: "table",
    reads:
      "count(*), count(distinct tenant_id) from public.<p_table>, p_table limited to the prototype detector tables",
  },
  {
    name: "artifact_storage_census",
    args: [],
    columns: [
      { name: "referenced_rows", type: "bigint" },
      { name: "bucket_objects", type: "bigint" },
    ],
    route: "storage",
    reads:
      "pdf_template_artifacts rows with storage_path, and storage.objects in referenced or prototype buckets",
  },
  {
    name: "external_reference_count",
    args: [],
    columns: [{ name: "external_reference_count", type: "bigint" }],
    route: "external",
    reads: "pdf_template_artifacts rows with url (count only, no samples)",
  },
  {
    name: "batch_job_count",
    args: [],
    columns: [{ name: "batch_job_count", type: "bigint" }],
    route: "jobs",
    reads: "count(*) from public.pdf_template_batch_jobs",
  },
  {
    name: "migration_report_count",
    args: [],
    columns: [{ name: "migration_report_count", type: "bigint" }],
    route: "reports",
    reads: "pdf_templates rows with migration_report <> '{}'",
  },
  {
    name: "renderer_integration_count",
    args: [],
    columns: [{ name: "renderer_integration_count", type: "bigint" }],
    route: "integrations",
    reads: "pdf_template_renders rows with renderer = 'docraptor'",
  },
] as const satisfies ReadonlyArray<DocumentCutoverFunction>;

export type DocumentCutoverFunctionName =
  (typeof DOCUMENT_CUTOVER_FUNCTIONS)[number]["name"];

export const DOCUMENT_CUTOVER_FUNCTION_NAMES: readonly string[] =
  DOCUMENT_CUTOVER_FUNCTIONS.map((fn) => fn.name);

export function contractFunction(
  name: string,
): DocumentCutoverFunction | undefined {
  return (
    DOCUMENT_CUTOVER_FUNCTIONS as ReadonlyArray<DocumentCutoverFunction>
  ).find((fn) => fn.name === name);
}

export function functionForRoute(
  route: DocumentCutoverRoute,
): DocumentCutoverFunction {
  const fn = (
    DOCUMENT_CUTOVER_FUNCTIONS as ReadonlyArray<DocumentCutoverFunction>
  ).find((candidate) => candidate.route === route);
  if (!fn) throw new Error(`contract has no function for route ${route}`);
  return fn;
}

/** Postgres types allowed in a function result (ruling 11: counts only). */
export const NUMERIC_RESULT_TYPES = new Set([
  "bigint",
  "integer",
  "smallint",
  "numeric",
]);
