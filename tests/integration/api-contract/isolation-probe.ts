/**
 * #2708: the pure decisions of the tenant-isolation sweep, unit-tested
 * without a stack.
 */

export type Relation = { schema: string; table: string };

export const qualifiedName = ({ schema, table }: Relation) =>
  `${schema}.${table}`;

const RELATION_REFUSAL =
  /^permission denied for (?:table|view|materialized view|foreign table) (.+)$/;

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
