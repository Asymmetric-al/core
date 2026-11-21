/**
 * #2708: the pure decisions of the tenant-isolation sweep, unit-tested
 * without a stack.
 */

export type Relation = { schema: string; table: string };

export const qualifiedName = ({ schema, table }: Relation) =>
  `${schema}.${table}`;

const RELATION_REFUSAL =
  /^permission denied for (?:table|view|materialized view|foreign table) (.+)$/;

/** One page of a ranged Data API read: its rows, or the error that ended it. */
export type Page<T, E> = { rows: T[] } | { error: E };

/**
 * Every row `readRange` returns, page by page (`from` and `to` inclusive, as
 * supabase-js `range`). The sweep pages by the `max_rows` supabase/config.toml
 * declares. Each page starts after the rows already received and only an
 * empty page ends the read, so a Data API that caps responses below
 * `pageSize` (a lower max_rows than declared) cannot end it early.
 */
export async function readAllPages<T, E>(
  readRange: (from: number, to: number) => Promise<Page<T, E>>,
  pageSize: number,
): Promise<Page<T, E>> {
  if (!Number.isInteger(pageSize) || pageSize <= 0)
    throw new Error(`page size must be a positive integer, got ${pageSize}`);
  const rows: T[] = [];
  for (let from = 0; ;) {
    const page = await readRange(from, from + pageSize - 1);
    if ("error" in page) return page;
    if (page.rows.length === 0) return { rows };
    rows.push(...page.rows);
    from += page.rows.length;
  }
}

/**
 * A read the database refused because the caller lacks privilege on the swept
 * relation itself. Postgres names the relation in the message (unqualified);
 * a 42501 that names another table, a function or a schema (for example one
 * raised inside a policy) is not a refusal of this relation but an error.
 */
export function isRefusalOf(
  error: { code?: string | null; message?: string | null },
  relation: Relation,
): boolean {
  if (error.code !== "42501") return false;
  const named = RELATION_REFUSAL.exec((error.message ?? "").trim());
  return named?.[1] === relation.table;
}
