import { randomUUID } from "node:crypto";

import type pg from "pg";

export const OVERRIDES: Record<string, Record<string, string>> = {
  donations: { intake_format: "'legacy_header'" },
  crm_notes: { visibility: "'standard'", title: "'t'", body: "'b'" },
  support_tickets: {
    queue_id: "'donor_care'",
    channel: "'email'",
    priority: "'normal'",
    status: "'open'",
  },
  support_agents: { email: "'agent@example.org'" },
  support_saved_views: { scope: "'personal'", filter: "'{}'::jsonb" },
};

export async function insertRow(
  db: pg.Client,
  table: string,
  given: Record<string, string>,
) {
  const cols = (
    await db.query(
      `select a.attname::text name, format_type(a.atttypid, a.atttypmod) typ, t.typtype::text kind,
              t.typcategory::text cat,
              (select e.enumlabel::text from pg_enum e where e.enumtypid = a.atttypid order by e.enumsortorder limit 1) label
         from pg_attribute a join pg_type t on t.oid = a.atttypid
        where a.attrelid = $1::regclass and a.attnum > 0 and not a.attisdropped
          and a.attnotnull and not a.atthasdef and a.attgenerated = '' and a.attidentity = ''`,
      [`public.${table}`],
    )
  ).rows as Record<string, string>[];
  const values: Record<string, string> = {
    ...Object.fromEntries(
      cols.map((c) => {
        const typ = c.typ!;
        const v =
          c.kind === "e"
            ? `'${c.label}'::${typ}`
            : typ === "uuid"
              ? "gen_random_uuid()"
              : c.cat === "S"
                ? `'acc2675b-${randomUUID()}'`
                : c.cat === "N"
                  ? "1"
                  : c.cat === "B"
                    ? "false"
                    : c.cat === "D"
                      ? "now()"
                      : typ === "jsonb" || typ === "json"
                        ? `'{}'::${typ}`
                        : c.cat === "A"
                          ? `'{}'::${typ}`
                          : "null";
        return [c.name!, v];
      }),
    ),
    ...(OVERRIDES[table] ?? {}),
    ...given,
  };
  const names = Object.keys(values);
  await db.query(
    `insert into public.${table} (${names.map((n) => `"${n}"`).join(", ")}) values (${names.map((n) => values[n]).join(", ")})`,
  );
}

export async function removeTenants(
  db: pg.Client,
  tenants: string[],
  users: string[],
  { logins = true }: { logins?: boolean } = {},
) {
  await db.query("begin");
  try {
    await db.query("set local session_replication_role = replica");
    const tables = (
      await db.query(
        `select format('%I.%I', n.nspname, c.relname) t
           from pg_class c join pg_namespace n on n.oid = c.relnamespace
           join pg_attribute a on a.attrelid = c.oid and a.attname = 'tenant_id' and not a.attisdropped
          where c.relkind in ('r', 'p') and n.nspname in ('public', 'authz', 'private')`,
      )
    ).rows as { t: string }[];
    for (const { t } of tables)
      await db.query(`delete from ${t} where tenant_id = any($1::uuid[])`, [
        tenants,
      ]);
    for (const sql of [
      "delete from authz.platform_operators where user_id = any($1::uuid[])",
      "delete from authz.memberships where user_id = any($1::uuid[])",
      "delete from public.profiles where user_id = any($1::uuid[])",
      ...(logins ? ["delete from auth.users where id = any($1::uuid[])"] : []),
    ])
      await db.query(sql, [users]);
    await db.query("delete from public.tenants where id = any($1::uuid[])", [
      tenants,
    ]);
    await db.query("commit");
  } catch (error) {
    await db.query("rollback");
    throw error;
  }
}
