/**
 * The `document_cutover` database contract (#2067 addendum 4): the private
 * schema, the restricted reader role, and the exact names, arguments and
 * result columns of the counts-only functions created by
 * supabase/migrations/20261021064500_document_cutover_reader.sql.
 *
 * The operator gate calls only these functions. Every result column is a
 * `bigint` count (the schema version is the 14-digit migration version), and
 * no function returns row data or identifiers.
 *
 * Acceptance pins the same values in its own test contract; the two are kept
 * equal by test, not by import, so production code never depends on tests/.
 */

export const DOCUMENT_CUTOVER_SCHEMA = "document_cutover";
export const DOCUMENT_CUTOVER_READER_ROLE = "document_cutover_reader";

/** What a function reads, used to group its scenarios. */
export type DocumentCutoverRoute =
  | "schema_version"
  | "users"
  | "table"
  | "storage"
  | "external"
  | "jobs"
  | "reports"
  | "integrations";

export interface DocumentCutoverDatabaseFunction {
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
  /** What it counts. */
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
] as const satisfies ReadonlyArray<DocumentCutoverDatabaseFunction>;

export type DocumentCutoverFunctionName =
  (typeof DOCUMENT_CUTOVER_FUNCTIONS)[number]["name"];
