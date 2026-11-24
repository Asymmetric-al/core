import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";

import type pg from "pg";

import type { Caller, Outcome } from "../issue-2674/harness";

export {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  type Caller,
  type Outcome,
} from "../issue-2674/harness";

export const MIG = "supabase/migrations";

export function migration(suffix: string) {
  const name = readdirSync(MIG).find(
    (f) => /^\d{14}_/.test(f) && f.endsWith(`${suffix}.sql`),
  );
  if (!name) throw new Error(`no migration ends with ${suffix}.sql`);
  return `${MIG}/${name}`;
}

export function preflight(file: string, tag: string) {
  const text = readFileSync(file, "utf8");
  const start = text.indexOf(`DO $$\n-- preflight: ${tag}\n`);
  if (start < 0) throw new Error(`${file} has no preflight "${tag}"`);
  const end = text.indexOf("$$;", start + "DO $$".length);
  return text.slice(start, end + "$$;".length);
}

export const KEYS = [
  "TA",
  "TB",
  "UDA",
  "UDC",
  "UD2",
  "UM",
  "UM2",
  "US",
  "UBS",
  "mDA",
  "mDAB",
  "mDC",
  "mD2",
  "mM",
  "mMB",
  "mM2",
  "mS",
  "mBS",
  "pDA",
  "pDAB",
  "pDC",
  "pD2",
  "pMA",
  "pMB",
  "pM2",
  "dA",
  "dAB",
  "dC",
  "d2",
  "mA",
  "mB",
  "m2",
  "gA",
  "gC",
  "g2",
  "gB",
  "plA",
  "plC",
  "pl2",
  "plB",
  "aA",
  "aC",
  "a2",
  "aB",
  "fA",
  "fC",
  "f2",
  "fB",
  "pfA",
  "pfC",
  "pf2",
  "pfB",
] as const;

export type Ids = Record<(typeof KEYS)[number], string>;

export function fixtureIds(): Ids {
  return Object.fromEntries(KEYS.map((k) => [k, randomUUID()])) as Ids;
}

export const USERS = ["UDA", "UDC", "UD2", "UM", "UM2", "US", "UBS"] as const;

export function fixtureSql(id: Ids) {
  const q = (k: keyof Ids) => `'${id[k]}'`;
  const users = USERS.map(q).join(", ");
  return `insert into public.tenants (id, name, slug) values (${q("TA")}, 'acc2678 A', 'acc2678-' || ${q("TA")}), (${q("TB")}, 'acc2678 B', 'acc2678-' || ${q("TB")});
    insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values (${q("TA")}, ${q("TA")}, 'A', 'US', 'usd', 'A'), (${q("TB")}, ${q("TB")}, 'B', 'US', 'usd', 'B');
    insert into auth.users (id, email, email_confirmed_at) select u, 'acc2678-' || u || '@example.test', now() from unnest(array[${users}]::uuid[]) u;
    delete from authz.memberships where user_id = any(array[${users}]::uuid[]);
    insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active) values
      (${q("mDA")}, ${q("UDA")}, ${q("TA")}, 'donor', null, true),
      (${q("mDAB")}, ${q("UDA")}, ${q("TB")}, 'donor', null, true),
      (${q("mDC")}, ${q("UDC")}, ${q("TA")}, 'donor', null, true),
      (${q("mD2")}, ${q("UD2")}, ${q("TA")}, 'donor', null, true),
      (${q("mM")}, ${q("UM")}, ${q("TA")}, 'missionary', null, true),
      (${q("mMB")}, ${q("UM")}, ${q("TB")}, 'missionary', null, true),
      (${q("mM2")}, ${q("UM2")}, ${q("TA")}, 'missionary', null, true),
      (${q("mS")}, ${q("US")}, ${q("TA")}, 'staff', 'development', true),
      (${q("mBS")}, ${q("UBS")}, ${q("TB")}, 'staff', 'development', true);
    insert into public.parties (id, tenant_id, display_name) values
      (${q("pDA")}, ${q("TA")}, 'Donor A'), (${q("pDAB")}, ${q("TB")}, 'Donor A in B'),
      (${q("pDC")}, ${q("TA")}, 'Claimed donor'), (${q("pD2")}, ${q("TA")}, 'Second donor'),
      (${q("pMA")}, ${q("TA")}, 'Missionary A'), (${q("pMB")}, ${q("TB")}, 'Missionary A in B'),
      (${q("pM2")}, ${q("TA")}, 'Second missionary');
    insert into public.donors (id, tenant_id, party_id, profile_id, name, email) values
      (${q("dA")}, ${q("TA")}, ${q("pDA")}, ${q("UDA")}, 'Donor A', 'acc2678-a-' || ${q("dA")} || '@example.test'),
      (${q("dAB")}, ${q("TB")}, ${q("pDAB")}, ${q("UDA")}, 'Donor A in B', 'acc2678-ab-' || ${q("dAB")} || '@example.test'),
      (${q("dC")}, ${q("TA")}, ${q("pDC")}, null, 'Claimed donor', 'acc2678-c-' || ${q("dC")} || '@example.test'),
      (${q("d2")}, ${q("TA")}, ${q("pD2")}, ${q("UD2")}, 'Second donor', 'acc2678-2-' || ${q("d2")} || '@example.test');
    insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values
      (${q("mA")}, ${q("TA")}, ${q("pMA")}, ${q("UM")}, ${q("TA")}),
      (${q("mB")}, ${q("TB")}, ${q("pMB")}, ${q("UM")}, ${q("TB")}),
      (${q("m2")}, ${q("TA")}, ${q("pM2")}, ${q("UM2")}, ${q("TA")});
    insert into public.account_links (tenant_id, user_id, party_id, linked_via) values
      (${q("TA")}, ${q("UDA")}, ${q("pDA")}, 'profile_backfill'),
      (${q("TB")}, ${q("UDA")}, ${q("pDAB")}, 'profile_backfill'),
      (${q("TA")}, ${q("UDC")}, ${q("pDC")}, 'account_claim'),
      (${q("TA")}, ${q("UD2")}, ${q("pD2")}, 'profile_backfill'),
      (${q("TA")}, ${q("UM")}, ${q("pMA")}, 'profile_backfill'),
      (${q("TB")}, ${q("UM")}, ${q("pMB")}, 'profile_backfill'),
      (${q("TA")}, ${q("UM2")}, ${q("pM2")}, 'profile_backfill');
    insert into public.donations (id, tenant_id, donor_id, missionary_id, amount) values
      (${q("gA")}, ${q("TA")}, ${q("dA")}, ${q("mA")}, 100),
      (${q("gC")}, ${q("TA")}, ${q("dC")}, ${q("m2")}, 200),
      (${q("g2")}, ${q("TA")}, ${q("d2")}, ${q("m2")}, 300),
      (${q("gB")}, ${q("TB")}, ${q("dAB")}, ${q("mB")}, 400);
    insert into public.donor_pledges (id, tenant_id, donor_id, missionary_id, amount) values
      (${q("plA")}, ${q("TA")}, ${q("dA")}, ${q("mA")}, 10),
      (${q("plC")}, ${q("TA")}, ${q("dC")}, ${q("m2")}, 20),
      (${q("pl2")}, ${q("TA")}, ${q("d2")}, ${q("m2")}, 30),
      (${q("plB")}, ${q("TB")}, ${q("dAB")}, ${q("mB")}, 40);
    insert into public.donor_activities (id, tenant_id, donor_id, type, title) values
      (${q("aA")}, ${q("TA")}, ${q("dA")}, 'note', 'A'),
      (${q("aC")}, ${q("TA")}, ${q("dC")}, 'note', 'C'),
      (${q("a2")}, ${q("TA")}, ${q("d2")}, 'note', '2'),
      (${q("aB")}, ${q("TB")}, ${q("dAB")}, 'note', 'B');
    insert into public.follows (id, tenant_id, donor_id, missionary_id) values
      (${q("fA")}, ${q("TA")}, ${q("dA")}, ${q("UM")}),
      (${q("fC")}, ${q("TA")}, ${q("dC")}, ${q("UM")}),
      (${q("f2")}, ${q("TA")}, ${q("d2")}, ${q("UM")}),
      (${q("fB")}, ${q("TB")}, ${q("dAB")}, ${q("UM")});
    insert into public.donor_feed_preferences (id, tenant_id, donor_id) values
      (${q("pfA")}, ${q("TA")}, ${q("dA")}),
      (${q("pfC")}, ${q("TA")}, ${q("dC")}),
      (${q("pf2")}, ${q("TA")}, ${q("d2")}),
      (${q("pfB")}, ${q("TB")}, ${q("dAB")});`;
}

export function caller(
  id: Ids,
  user: keyof Ids,
  membership: keyof Ids,
  tenant: keyof Ids,
) {
  return {
    sub: user,
    headers: {
      "x-asym-tenant": id[tenant],
      "x-asym-assignment": id[membership],
    },
  };
}

export function keepAs(db: pg.Client, id: Record<string, string>) {
  return async (role: string, who: Caller, sql: string): Promise<Outcome> => {
    await db.query("savepoint keep_as");
    try {
      await db.query(`set local role ${role}`);
      const sub = who.sub ? id[who.sub]! : "";
      await db.query(
        `select set_config('request.jwt.claims', $1, true),
                set_config('request.jwt.claim.sub', '', true),
                set_config('request.headers', $2, true)`,
        [
          who.sub
            ? JSON.stringify({
                sub,
                role,
                ...(who.aal ? { aal: who.aal } : {}),
              })
            : "",
          who.headers ? JSON.stringify(who.headers) : "",
        ],
      );
      const r = await db.query(sql);
      await db.query("reset role");
      await db.query(
        "select set_config('request.jwt.claims', '', true), set_config('request.headers', '', true), set_config('app.current_tenant_id', '', true)",
      );
      await db.query("release savepoint keep_as");
      return {
        rows: r.rows as Record<string, unknown>[],
        code: null,
        message: "",
      };
    } catch (e) {
      await db.query("rollback to savepoint keep_as");
      const err = e as { code?: string; message?: string };
      return {
        rows: [],
        code: err.code ?? "?",
        message: err.message ?? String(e),
      };
    }
  };
}

const BLOCKED =
  "select $2::int = any(pg_catalog.pg_blocking_pids($1::int)) as blocked";
const tick = () => new Promise((resolve) => setTimeout(resolve, 25));

export async function backendPid(client: pg.Client) {
  return (await client.query("select pg_catalog.pg_backend_pid() as pid"))
    .rows[0].pid as number;
}

export async function waitsOn(
  observer: pg.Client,
  waiter: number,
  holder: number,
  ms = 10_000,
) {
  const end = Date.now() + ms;
  for (;;) {
    const r = await observer.query(BLOCKED, [waiter, holder]);
    if (r.rows[0].blocked) return;
    if (Date.now() > end)
      throw new Error(
        `backend ${waiter} was never seen waiting on backend ${holder} within ${ms} ms`,
      );
    await tick();
  }
}

export async function settlesWithoutWaiting<T>(
  observer: pg.Client,
  call: Promise<T>,
  waiter: number,
  holder: number,
  ms = 10_000,
) {
  let settled = false;
  const tracked = call.finally(() => {
    settled = true;
  });
  tracked.catch(() => undefined);
  const end = Date.now() + ms;
  for (;;) {
    if (settled) return tracked;
    const r = await observer.query(BLOCKED, [waiter, holder]);
    if (r.rows[0].blocked)
      throw new Error(`backend ${waiter} waited on backend ${holder}`);
    if (Date.now() > end)
      throw new Error(`backend ${waiter} did not settle within ${ms} ms`);
    await tick();
  }
}
