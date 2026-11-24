import type { Caller, Outcome } from "../issue-2674/harness";
import type pg from "pg";

export const SITE_TABLES = [
  "sites",
  "site_domains",
  "donor_portal_hosts",
  "donor_account_brands",
] as const;

export const PROOFS = [
  "control_proved_at",
  "attached_at",
  "routing_proved_at",
  "https_proved_at",
  "sign_in_ready_at",
  "activation_proved_at",
] as const;

export const ALL_SURFACES = ["website", "donor_account", "staff", "missionary"];
export const HOME_SURFACES = ["donor_account", "staff", "missionary"];

export type Claim = {
  host: string;
  tenant: string;
  site?: string | null;
  surfaces?: string[];
  proofs?: number;
  project?: string;
};

export function claimSql({
  host,
  tenant,
  site = null,
  surfaces = site ? ALL_SURFACES : HOME_SURFACES,
  proofs = PROOFS.length,
  project = "donor",
}: Claim) {
  const columns = PROOFS.slice(0, proofs);
  const literal = (value: string | null) =>
    value === null ? "null" : `'${value}'`;
  return `insert into public.site_domains(host,tenant_id,site_id,surfaces,expected_project${columns.map((c) => `,${c}`).join("")}) values (${literal(host)},${literal(tenant)},${literal(site)},array[${surfaces.map((s) => `'${s}'`).join(",")}]::text[],${literal(project)}${columns.map(() => ",now()").join("")})`;
}

export function setProofsSql(host: string, proofs: number) {
  return `update public.site_domains set ${PROOFS.map(
    (column, index) =>
      `${column}=${index < proofs ? `coalesce(${column},now())` : "null"}`,
  ).join(",")} where host='${host}'`;
}

export async function snapshot(db: pg.Client, tenants: string[]) {
  const tables: Record<string, unknown[]> = {};
  for (const table of SITE_TABLES) {
    const { rows } = await db.query(
      `select to_jsonb(record) as value from public.${table} record where tenant_id=any($1::uuid[]) order by to_jsonb(record)::text`,
      [tenants],
    );
    tables[table] = rows.map((row) => row.value);
  }
  return tables;
}

export function caller(db: pg.Client, id: Record<string, string>) {
  return async (
    role: string,
    who: Caller,
    sql: string,
    keep = false,
  ): Promise<Outcome> => {
    await db.query("savepoint site_call");
    try {
      await db.query(`set local role ${role}`);
      await db.query(
        `select set_config('request.jwt.claims', $1, true),
                set_config('request.jwt.claim.sub', '', true),
                set_config('request.headers', $2, true)`,
        [
          who.sub ? JSON.stringify({ sub: id[who.sub], role }) : "",
          who.headers ? JSON.stringify(who.headers) : "",
        ],
      );
      const result = await db.query(sql);
      await db.query("reset role");
      if (keep) await db.query("release savepoint site_call");
      else await db.query("rollback to savepoint site_call");
      return {
        rows: result.rows as Record<string, unknown>[],
        code: null,
        message: "",
      };
    } catch (e) {
      await db.query("rollback to savepoint site_call");
      const err = e as { code?: string; message?: string };
      return {
        rows: [],
        code: err.code ?? "?",
        message: err.message ?? String(e),
      };
    }
  };
}

export async function resolveAsAnon(db: pg.Client, host: string) {
  await db.query("savepoint anon_lookup");
  try {
    await db.query("set local role anon");
    const { rows } = await db.query(
      "select * from public.resolve_verified_host($1)",
      [host],
    );
    return rows;
  } finally {
    await db.query("rollback to savepoint anon_lookup");
  }
}

export async function expectCode(
  db: pg.Client,
  sql: string,
  params: unknown[] = [],
) {
  await db.query("savepoint site_refusal");
  try {
    await db.query(sql, params);
    await db.query("set constraints all immediate");
    return null;
  } catch (e) {
    return (e as { code?: string }).code ?? "?";
  } finally {
    await db.query("rollback to savepoint site_refusal");
  }
}
