import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { insertRow, removeTenants } from "./no-super-admin-fixture";

const url = process.env.WP2C_REST_IT_URL;
const database = process.env.WP2C_REST_IT_DATABASE_URL;
const anon = process.env.WP2C_REST_IT_ANON_KEY;
const service = process.env.WP2C_REST_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";
const ready = [url, database, anon, service].every(Boolean);

it.runIf(required && !ready)(
  "local-supabase supplies the stack's URL, database, anon key and service key (fails, never skips)",
  () => expect(ready).toBe(true),
);

const PEOPLE = ["Z", "O", "DEV", "ADM", "DON", "MIS", "B"] as const;
type Person = (typeof PEOPLE)[number];
const SEAT: Record<
  Person,
  ["TA" | "TB", "staff" | "donor" | "missionary", string | null, boolean]
> = {
  Z: ["TA", "staff", "development", false],
  O: ["TA", "staff", "development", false],
  DEV: ["TA", "staff", "development", false],
  ADM: ["TA", "staff", "development", true],
  DON: ["TA", "donor", null, false],
  MIS: ["TA", "missionary", null, false],
  B: ["TB", "staff", "finance", false],
};

const READ_KEYS: Record<string, { column: string; keys: string[] }> = {
  audit_logs: { column: "id", keys: ["aA", "aB"] },
  donors: { column: "id", keys: ["dDON", "dOther", "dB"] },
  support_tickets: { column: "id", keys: ["tkA", "tkB"] },
  field_policies: { column: "field_key", keys: ["fpA", "fpB"] },
  funds: { column: "id", keys: ["fA", "fAfee", "fB"] },
  donations: { column: "id", keys: ["gDON", "gOther", "gB"] },
  support_saved_views: {
    column: "id",
    keys: ["vWork", "vAdm", "vDev", "vB"],
  },
  crm_notes: { column: "id", keys: ["nStd", "nRes", "nB"] },
  donor_feed_preferences: { column: "id", keys: ["pDON"] },
};

describe.skipIf(!ready)(
  "AL-2675 WP2c rest B: no super-admin branch, and no read gained or lost, through PostgREST (local stack, real logins)",
  () => {
    const db = new pg.Client({ connectionString: database });
    const id: Record<string, string> = {};
    for (const k of "TA TB dDON dOther dB misMIS gDON gOther gB aA aB tkA tkB fA fAfee fB nStd nRes nB pDON".split(
      " ",
    ))
      id[k] = randomUUID();
    for (const k of "agAdm agDev vWork vAdm vDev vB fpA fpB".split(" "))
      id[k] = `acc2675b-${k}-${id.TA!.slice(0, 8)}`;
    const user = {} as Record<Person, string>;
    const token = {} as Record<Person, string>;
    const seat = {} as Record<Person, string>;
    const q = (k: string) => `'${id[k]}'`;
    const keyOf = (value: unknown) =>
      Object.keys(id).find((k) => id[k] === value) ?? String(value);
    const api = (path: string, init: RequestInit & { key: string }) =>
      fetch(`${url}/${path}`, {
        ...init,
        headers: {
          apikey: init.key,
          Authorization: `Bearer ${init.key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      });

    beforeAll(async () => {
      if (
        ![url!, database!].every((value) =>
          ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
        )
      )
        throw Error("A disposable local Supabase stack is required");
      for (const who of PEOPLE) {
        const credentials = {
          email: `wp2cb-${who.toLowerCase()}-${id.TA}@example.test`,
          password: randomUUID(),
        };
        const created = await api("auth/v1/admin/users", {
          key: service!,
          method: "POST",
          body: JSON.stringify({ ...credentials, email_confirm: true }),
        });
        expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
        user[who] = (await created.json()).id;
        const login = await api("auth/v1/token?grant_type=password", {
          key: anon!,
          method: "POST",
          body: JSON.stringify(credentials),
        });
        expect(login.ok, `Sign-in ${who}: ${login.status}`).toBe(true);
        token[who] = (await login.json()).access_token;
      }
      await db.connect();
      const u = (who: Person) => `'${user[who]}'`;
      await db.query("begin");
      try {
        await db.query(
          `insert into public.tenants (id, name, slug) values (${q("TA")}, 'acc2675b A', 'acc2675b-' || ${q("TA")}), (${q("TB")}, 'acc2675b B', 'acc2675b-' || ${q("TB")})`,
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [Object.values(user)],
        );
        for (const who of PEOPLE) {
          const [tenant, role, staff, admin] = SEAT[who];
          seat[who] = randomUUID();
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin) values ($1, $2, $3, $4, $5, $6)",
            [seat[who], user[who], id[tenant], role, staff, admin],
          );
        }
        await db.query(
          `insert into authz.platform_operators (user_id, added_by, reason) values (${u("O")}, 'acceptance', 'WP2c rest B fixture')`,
        );
        await db.query("set local session_replication_role = replica");
        for (const [d, tenant, profile] of [
          ["dDON", "TA", "DON"],
          ["dOther", "TA", null],
          ["dB", "TB", null],
        ] as const)
          await insertRow(db, "donors", {
            id: q(d),
            tenant_id: q(tenant),
            party_id: q(d),
            profile_id: profile ? u(profile) : "null",
            email: `'${d.toLowerCase()}-${id[d]}@example.org'`,
          });
        await insertRow(db, "missionaries", {
          id: q("misMIS"),
          tenant_id: q("TA"),
          party_id: q("misMIS"),
          profile_id: u("MIS"),
        });
        await db.query(
          `insert into public.parties (id, tenant_id, display_name) values
             (${q("dDON")}, ${q("TA")}, 'acc2675b'), (${q("dOther")}, ${q("TA")}, 'acc2675b'),
             (${q("dB")}, ${q("TB")}, 'acc2675b'), (${q("misMIS")}, ${q("TA")}, 'acc2675b');
           insert into public.account_links (tenant_id, user_id, party_id, linked_via) values
             (${q("TA")}, ${u("DON")}, ${q("dDON")}, 'profile_backfill'),
             (${q("TA")}, ${u("MIS")}, ${q("misMIS")}, 'profile_backfill');`,
        );
        for (const [g, tenant, donor, missionary] of [
          ["gDON", "TA", "dDON", "misMIS"],
          ["gOther", "TA", "dOther", "misMIS"],
          ["gB", "TB", "dB", "misMIS"],
        ] as const)
          await insertRow(db, "donations", {
            id: q(g),
            tenant_id: q(tenant),
            donor_id: q(donor),
            missionary_id: q(missionary),
          });
        for (const [k, tenant] of [
          ["aA", "TA"],
          ["aB", "TB"],
        ] as const)
          await insertRow(db, "audit_logs", {
            id: q(k),
            tenant_id: q(tenant),
            action: "'acc2675b.safety'",
            resource_type: "'acc2675b'",
          });
        for (const [k, tenant] of [
          ["tkA", "TA"],
          ["tkB", "TB"],
        ] as const)
          await insertRow(db, "support_tickets", {
            id: q(k),
            tenant_id: q(tenant),
            public_id: `'acc2675b-${id[k]}'`,
          });
        for (const [k, tenant] of [
          ["fpA", "TA"],
          ["fpB", "TB"],
        ] as const)
          await insertRow(db, "field_policies", {
            tenant_id: q(tenant),
            record_type: "'acc2675b'",
            field_key: q(k),
            surface: "'admin'",
          });
        for (const [k, tenant, purpose] of [
          ["fA", "TA", null],
          ["fAfee", "TA", "fee_cover"],
          ["fB", "TB", null],
        ] as const)
          await insertRow(db, "funds", {
            id: q(k),
            tenant_id: q(tenant),
            system_purpose: purpose ? `'${purpose}'` : "null",
          });
        for (const [k, who] of [
          ["agAdm", "ADM"],
          ["agDev", "DEV"],
        ] as const)
          await insertRow(db, "support_agents", {
            id: q(k),
            tenant_id: q("TA"),
            user_id: u(who),
            email: `'${k.toLowerCase()}@example.org'`,
          });
        for (const [k, tenant, scope, owner] of [
          ["vWork", "TA", "workspace", null],
          ["vAdm", "TA", "personal", "agAdm"],
          ["vDev", "TA", "personal", "agDev"],
          ["vB", "TB", "workspace", null],
        ] as const)
          await insertRow(db, "support_saved_views", {
            id: q(k),
            tenant_id: q(tenant),
            scope: `'${scope}'`,
            owner_agent_id: owner ? q(owner) : "null",
            slug: q(k),
          });
        for (const [k, tenant, visibility] of [
          ["nStd", "TA", "standard"],
          ["nRes", "TA", "restricted"],
          ["nB", "TB", "standard"],
        ] as const)
          await insertRow(db, "crm_notes", {
            id: q(k),
            tenant_id: q(tenant),
            visibility: `'${visibility}'`,
          });
        await insertRow(db, "donor_feed_preferences", {
          id: q("pDON"),
          tenant_id: q("TA"),
          donor_id: q("dDON"),
        });
        await db.query(
          `update public.profiles set role = 'super_admin' where user_id in (${u("Z")}, ${u("O")})`,
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    }, 120_000);

    afterAll(async () => {
      try {
        await removeTenants(db, [id.TA!, id.TB!], Object.values(user), {
          logins: false,
        });
        for (const who of PEOPLE)
          if (user[who])
            await api(`auth/v1/admin/users/${user[who]}`, {
              key: service!,
              method: "DELETE",
            });
      } finally {
        await db.end();
      }
    }, 120_000);

    type Read = { keys: string[]; status: number };
    async function reads(
      who: Person,
      headers: Record<string, string>,
      table: string,
    ): Promise<Read> {
      const { column, keys } = READ_KEYS[table]!;
      const values = keys.map((k) => `"${id[k]}"`).join(",");
      const r = await fetch(
        `${url}/rest/v1/${table}?select=${column}&${column}=in.(${values})`,
        {
          headers: {
            apikey: anon!,
            Authorization: `Bearer ${token[who]}`,
            ...headers,
          },
        },
      );
      const body = (await r.json()) as Record<string, unknown>[];
      return {
        status: r.status,
        keys: r.ok ? body.map((row) => keyOf(row[column])).sort() : [],
      };
    }
    const read = (keys: string[]): Read => ({
      keys: [...keys].sort(),
      status: 200,
    });
    const under = (who: Person) => ({
      "x-asym-tenant": id[SEAT[who][0]]!,
      "x-asym-assignment": seat[who]!,
    });
    const only = (t: "TA" | "TB") => ({ "x-asym-tenant": id[t]! });

    const OWN_A: Record<string, string[]> = {
      audit_logs: ["aA"],
      donors: ["dDON", "dOther"],
      support_tickets: ["tkA"],
      field_policies: ["fpA"],
    };

    it("a profile that says super_admin, with a staff row in A only, reads no row without a header, none under B's, and A's rows only under A's", async () => {
      for (const table of Object.keys(OWN_A)) {
        expect(await reads("Z", {}, table), `${table}, none`).toEqual(read([]));
        expect(await reads("Z", only("TB"), table), `${table}, B`).toEqual(
          read([]),
        );
        expect(await reads("Z", only("TA"), table), `${table}, A`).toEqual(
          read(OWN_A[table]!),
        );
      }
    });

    it("an operator with a staff row in A and a super_admin profile reads none of B's rows, and under A exactly what a development staff member of A reads but their own personal view", async () => {
      for (const table of [
        ...Object.keys(OWN_A),
        "support_saved_views",
        "crm_notes",
      ]) {
        expect(await reads("O", only("TB"), table), `${table}, B`).toEqual(
          read([]),
        );
        const staff = await reads("DEV", under("DEV"), table);
        expect(await reads("O", under("O"), table), `${table}, A`).toEqual(
          table === "support_saved_views"
            ? read(staff.keys.filter((k) => k !== "vDev"))
            : staff,
        );
      }
    });

    it("every other person reads exactly their rows through each kind of policy", async () => {
      const expected: Record<string, Partial<Record<Person, string[]>>> = {
        funds: { DEV: ["fA"], ADM: ["fA"], DON: [], MIS: [], B: ["fB"] },
        donations: {
          DEV: ["gDON", "gOther"],
          ADM: ["gDON", "gOther"],
          DON: ["gDON"],
          MIS: ["gDON", "gOther"],
          B: ["gB"],
        },
        support_saved_views: {
          DEV: ["vWork", "vDev"],
          ADM: ["vWork", "vAdm", "vDev"],
          DON: [],
          MIS: [],
          B: ["vB"],
        },
        crm_notes: {
          DEV: ["nStd"],
          ADM: ["nStd", "nRes"],
          DON: [],
          MIS: [],
          B: ["nB"],
        },
        donor_feed_preferences: {
          DEV: [],
          ADM: [],
          DON: ["pDON"],
          MIS: [],
          B: [],
        },
        field_policies: {
          DEV: ["fpA"],
          ADM: ["fpA"],
          DON: ["fpA"],
          MIS: ["fpA"],
          B: ["fpB"],
        },
      };
      for (const [table, byPerson] of Object.entries(expected)) {
        for (const [who, keys] of Object.entries(byPerson))
          expect(
            await reads(who as Person, under(who as Person), table),
            `${table}, ${who}`,
          ).toEqual(read(keys));
        expect(await reads("DON", {}, table), `${table}, no header`).toEqual(
          read([]),
        );
      }
    });
  },
);
