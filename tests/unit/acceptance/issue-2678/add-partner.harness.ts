import { fixtureIds, fixtureSql } from "./harness";

import type pg from "pg";

export function addPartnerHarness(db: pg.Client) {
  async function tx<T>(fn: (id: Record<string, string>) => Promise<T>) {
    const id: Record<string, string> = fixtureIds();
    await db.query("begin");
    try {
      await db.query(fixtureSql(id as never));
      return await fn(id);
    } finally {
      await db.query("rollback");
    }
  }

  const partner = (
    tenant: string,
    key: string,
    fields: Partial<
      Record<
        "name" | "phone" | "type" | "frequency" | "location",
        string | null
      >
    > = {},
  ) => {
    const value = (v: string | null | undefined, fallback: string | null) => {
      const chosen = v === undefined ? fallback : v;
      return chosen === null ? "null" : `'${chosen.replaceAll("'", "''")}'`;
    };
    return `select public.add_partner('${tenant}', '${key}', ${value(fields.name, "Partner Pat")}, ${value(fields.phone, null)}, ${value(fields.type, "Individual")}, ${value(fields.frequency, "Monthly")}, ${value(fields.location, "Kampala")}, null) r`;
  };
  async function attempt(
    id: Record<string, string>,
    who: { sub: string; headers: Record<string, string> },
    sql: string,
  ) {
    await db.query("savepoint attempt");
    try {
      await db.query("set local role authenticated");
      await db.query(
        "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', '', true), set_config('request.headers', $2, true)",
        [
          JSON.stringify({ sub: id[who.sub], role: "authenticated" }),
          JSON.stringify(who.headers),
        ],
      );
      const r = await db.query(sql);
      await db.query("reset role");
      await db.query(
        "select set_config('request.jwt.claims', '', true), set_config('request.headers', '', true), set_config('app.current_tenant_id', '', true)",
      );
      await db.query("release savepoint attempt");
      return {
        code: null,
        hint: null,
        r: r.rows[0]?.r as Record<string, unknown>,
      };
    } catch (e) {
      await db.query("rollback to savepoint attempt");
      const err = e as { code?: string; hint?: string };
      return { code: err.code ?? "?", hint: err.hint ?? null, r: null };
    }
  }
  const donorRows = async (ids: string[]) =>
    (
      await db.query(
        "select to_jsonb(d) - 'updated_at' row from public.donors d where d.id = any($1::uuid[]) order by d.id",
        [ids],
      )
    ).rows;
  const counts = async (tenant: string) =>
    (
      await db.query(
        `select (select count(*) from public.parties where tenant_id = $1)::int parties,
                (select count(*) from public.donors where tenant_id = $1)::int donors,
                (select count(*) from public.crm_command_logs where tenant_id = $1)::int logs,
                (select count(*) from public.account_links where tenant_id = $1)::int links,
                (select count(*) from authz.memberships where tenant_id = $1)::int memberships`,
        [tenant],
      )
    ).rows[0];
  const caller = (
    id: Record<string, string>,
    user: string,
    membership: string | null,
    tenant: string,
  ) => ({
    sub: user,
    headers: {
      "x-asym-tenant": id[tenant]!,
      ...(membership ? { "x-asym-assignment": id[membership]! } : {}),
    },
  });
  return { tx, partner, attempt, donorRows, counts, caller };
}
