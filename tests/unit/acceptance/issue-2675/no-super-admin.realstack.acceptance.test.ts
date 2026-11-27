import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";
import {
  insertRow as insertFixtureRow,
  removeTenants,
} from "./no-super-admin-fixture";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

const USERS = [
  "UP",
  "USG",
  "UMG",
  "UFC",
  "UADM",
  "UDEV",
  "UMOB",
  "UHR",
  "UDON",
  "UMIS",
  "UB",
  "UX",
  "UZ",
  "UO",
] as const;
type User = (typeof USERS)[number];

const ROWS: [string, User, "TA" | "TB", string, string | null, boolean][] = [
  ["mPA", "UP", "TA", "staff", "development", false],
  ["mPB", "UP", "TB", "staff", "finance", false],
  ["mSGs", "USG", "TA", "staff", "finance", false],
  ["mSGd", "USG", "TA", "donor", null, false],
  ["mMGm", "UMG", "TA", "missionary", null, false],
  ["mMGd", "UMG", "TA", "donor", null, false],
  ["mFin", "UFC", "TA", "staff", "finance", false],
  ["mCare", "UFC", "TA", "staff", "member_care", false],
  ["mAdm", "UADM", "TA", "staff", "development", true],
  ["mDev", "UDEV", "TA", "staff", "development", false],
  ["mMob", "UMOB", "TA", "staff", "mobilizer", false],
  ["mHr", "UHR", "TA", "staff", "hr", false],
  ["mDon", "UDON", "TA", "donor", null, false],
  ["mMis", "UMIS", "TA", "missionary", null, false],
  ["mB", "UB", "TB", "staff", "finance", false],
  ["mZ", "UZ", "TA", "staff", "development", false],
  ["mO", "UO", "TA", "staff", "development", false],
];
const PEOPLE_ROWS = ROWS.filter(([m]) => m !== "mZ" && m !== "mO");
const TA_STAFF = [
  "mPA",
  "mSGs",
  "mFin",
  "mCare",
  "mAdm",
  "mDev",
  "mMob",
  "mHr",
];
const TB_STAFF = ["mPB", "mB"];

const READ_KEYS: Record<string, { column: string; keys: string[] }> = {
  audit_logs: { column: "id", keys: ["aA", "aB"] },
  donors: { column: "id", keys: ["dSG", "dMG", "dDON", "dOther", "dB"] },
  support_tickets: { column: "id", keys: ["tkA", "tkB"] },
  field_policies: { column: "field_key", keys: ["fpA", "fpB"] },
  funds: { column: "id", keys: ["fA", "fAfee", "fB"] },
  donations: { column: "id", keys: ["g1", "g2", "g3", "g4", "g5"] },
  support_saved_views: {
    column: "id",
    keys: ["vWork", "vAdm", "vDev", "vNull", "vB"],
  },
  crm_notes: { column: "id", keys: ["nStd", "nRes", "nB"] },
  donor_feed_preferences: { column: "id", keys: ["pDON", "pSG"] },
};

describe.skipIf(!ADMIN_URL)(
  "AL-2675 WP2c rest B: no super-admin branch, and no read gained or lost (real stack, two sessions)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const reader = new pg.Client({ connectionString: ADMIN_URL });
    const id: Record<string, string> = {};
    for (const k of [
      "TA",
      "TB",
      ...USERS,
      ...ROWS.map((r) => r[0]),
      ..."dSG dMG dDON dOther dB misMG misMIS misB g1 g2 g3 g4 g5 aA aB tkA tkB fA fAfee fB nStd nRes nB pDON pSG".split(
        " ",
      ),
    ])
      id[k] = randomUUID();
    for (const k of "agAdm agDev vWork vAdm vDev vNull vB fpA fpB".split(" "))
      id[k] = `acc2675b-${k}-${id.TA!.slice(0, 8)}`;
    const q = (k: string) => `'${id[k]}'`;
    const keyOf = (value: unknown) =>
      Object.keys(id).find((k) => id[k] === value) ?? String(value);
    const users = USERS.map(q).join(", ");

    const insertRow = (table: string, given: Record<string, string>) =>
      insertFixtureRow(db, table, given);

    async function fixture() {
      await db.query("begin");
      try {
        await db.query(
          `insert into public.tenants (id, name, slug) values (${q("TA")}, 'acc2675b A', 'acc2675b-' || ${q("TA")}), (${q("TB")}, 'acc2675b B', 'acc2675b-' || ${q("TB")})`,
        );
        await db.query(
          `insert into auth.users (id) select unnest(array[${users}]::uuid[])`,
        );
        await db.query(
          `delete from authz.memberships where user_id = any(array[${users}]::uuid[])`,
        );
        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ${ROWS.map(
            ([m, u, t, role, staff, admin]) =>
              `(${q(m)}, ${q(u)}, ${q(t)}, '${role}', ${staff ? `'${staff}'` : "null"}, ${admin}, true)`,
          ).join(", ")}`,
        );
        await db.query(
          `insert into authz.platform_operators (user_id, added_by, reason) values (${q("UO")}, 'acceptance', 'WP2c rest B fixture')`,
        );
        await db.query("set local session_replication_role = replica");
        for (const [d, tenant, profile] of [
          ["dSG", "TA", "USG"],
          ["dMG", "TA", "UMG"],
          ["dDON", "TA", "UDON"],
          ["dOther", "TA", null],
          ["dB", "TB", null],
        ] as const)
          await insertRow("donors", {
            id: q(d),
            tenant_id: q(tenant),
            profile_id: profile ? q(profile) : "null",
            email: `'${d.toLowerCase()}-${id[d]}@example.org'`,
          });
        for (const [m, tenant, profile] of [
          ["misMG", "TA", "UMG"],
          ["misMIS", "TA", "UMIS"],
          ["misB", "TB", null],
        ] as const)
          await insertRow("missionaries", {
            id: q(m),
            tenant_id: q(tenant),
            profile_id: profile ? q(profile) : "null",
          });
        await db.query(
          `update public.missionaries set party_id = id where id in (${q("misMG")}, ${q("misMIS")}, ${q("misB")});
           update public.donors set party_id = id where id in (${q("dSG")}, ${q("dDON")}, ${q("dOther")}, ${q("dB")});
           update public.donors set party_id = ${q("misMG")} where id = ${q("dMG")};
           insert into public.parties (id, tenant_id, display_name)
             select id, tenant_id, 'acc2675b' from public.missionaries where id in (${q("misMG")}, ${q("misMIS")}, ${q("misB")})
             union all select id, tenant_id, 'acc2675b' from public.donors where id in (${q("dSG")}, ${q("dDON")}, ${q("dOther")}, ${q("dB")});
           insert into public.account_links (tenant_id, user_id, party_id, linked_via)
             select distinct tenant_id, profile_id, party_id, 'profile_backfill' from (
               select tenant_id, profile_id, party_id from public.donors where id in (${q("dSG")}, ${q("dMG")}, ${q("dDON")})
               union select tenant_id, profile_id, party_id from public.missionaries where id in (${q("misMG")}, ${q("misMIS")})) as linked;`,
        );
        for (const [g, tenant, donor, missionary] of [
          ["g1", "TA", "dSG", "misMIS"],
          ["g2", "TA", "dMG", "misMIS"],
          ["g3", "TA", "dOther", "misMG"],
          ["g4", "TA", "dDON", "misMIS"],
          ["g5", "TB", "dB", "misB"],
        ] as const)
          await insertRow("donations", {
            id: q(g),
            tenant_id: q(tenant),
            donor_id: q(donor),
            missionary_id: q(missionary),
          });
        for (const [k, tenant] of [
          ["aA", "TA"],
          ["aB", "TB"],
        ] as const)
          await insertRow("audit_logs", {
            id: q(k),
            tenant_id: q(tenant),
            action: "'acc2675b.safety'",
            resource_type: "'acc2675b'",
          });
        for (const [k, tenant] of [
          ["tkA", "TA"],
          ["tkB", "TB"],
        ] as const)
          await insertRow("support_tickets", {
            id: q(k),
            tenant_id: q(tenant),
            public_id: `'acc2675b-${id[k]}'`,
          });
        for (const [k, tenant] of [
          ["fpA", "TA"],
          ["fpB", "TB"],
        ] as const)
          await insertRow("field_policies", {
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
          await insertRow("funds", {
            id: q(k),
            tenant_id: q(tenant),
            system_purpose: purpose ? `'${purpose}'` : "null",
          });
        for (const [k, user] of [
          ["agAdm", "UADM"],
          ["agDev", "UDEV"],
        ] as const)
          await insertRow("support_agents", {
            id: q(k),
            tenant_id: q("TA"),
            user_id: q(user),
            email: `'${k.toLowerCase()}@example.org'`,
          });
        for (const [k, tenant, scope, owner] of [
          ["vWork", "TA", "workspace", null],
          ["vAdm", "TA", "personal", "agAdm"],
          ["vDev", "TA", "personal", "agDev"],
          ["vNull", "TA", "personal", null],
          ["vB", "TB", "workspace", null],
        ] as const)
          await insertRow("support_saved_views", {
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
          await insertRow("crm_notes", {
            id: q(k),
            tenant_id: q(tenant),
            visibility: `'${visibility}'`,
          });
        for (const [k, donor] of [
          ["pDON", "dDON"],
          ["pSG", "dSG"],
        ] as const)
          await insertRow("donor_feed_preferences", {
            id: q(k),
            tenant_id: q("TA"),
            donor_id: q(donor),
          });
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
      await db.query("begin");
      await db.query("set local session_replication_role = replica");
      await db.query(
        `update public.profiles set role = 'super_admin' where user_id in (${q("UZ")}, ${q("UO")})`,
      );
      await db.query("commit");
    }

    beforeAll(async () => {
      await db.connect();
      await reader.connect();
      await fixture();
    }, 120_000);
    afterAll(async () => {
      try {
        await removeTenants(
          db,
          [id.TA!, id.TB!],
          USERS.map((u) => id[u]!),
        );
      } finally {
        await reader.end();
        await db.end();
      }
    }, 120_000);

    type Read = { keys: string[]; code: string | null };
    async function as(
      who: User,
      headers: Record<string, string>,
      sql: string,
      aal = "aal1",
    ): Promise<{ rows: Record<string, unknown>[]; code: string | null }> {
      await reader.query("begin");
      try {
        await reader.query("set local role authenticated");
        await reader.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', $2, true)`,
          [
            JSON.stringify({ sub: id[who], role: "authenticated", aal }),
            JSON.stringify(headers),
          ],
        );
        return { rows: (await reader.query(sql)).rows, code: null };
      } catch (error) {
        return { rows: [], code: (error as { code?: string }).code ?? "?" };
      } finally {
        await reader.query("rollback");
      }
    }
    async function reads(
      who: User,
      headers: Record<string, string>,
      table: string,
      aal = "aal1",
    ): Promise<Read> {
      const { column, keys } = READ_KEYS[table]!;
      const r = await as(
        who,
        headers,
        `select ${column}::text k from public.${table} where ${column}::text in (${keys.map(q).join(", ")})`,
        aal,
      );
      return {
        keys: r.rows.map((row) => keyOf(row.k)).sort(),
        code: r.code,
      };
    }
    const tenantOf = (m: string) => ROWS.find((r) => r[0] === m)![2];
    const userOf = (m: string) => ROWS.find((r) => r[0] === m)![1];
    const under = (m: string) => ({
      "x-asym-tenant": id[tenantOf(m)]!,
      "x-asym-assignment": id[m]!,
    });
    const only = (t: "TA" | "TB") => ({ "x-asym-tenant": id[t]! });
    const read = (keys: string[]): Read => ({
      keys: [...keys].sort(),
      code: null,
    });

    const BRANCH_TABLES = [
      "audit_logs",
      "donors",
      "support_tickets",
      "field_policies",
    ];
    const OWN_A: Record<string, string[]> = {
      audit_logs: ["aA"],
      donors: ["dSG", "dMG", "dDON", "dOther"],
      support_tickets: ["tkA"],
      field_policies: ["fpA"],
    };

    describe("the branch is gone", () => {
      it("a profile that says super_admin, with a staff row in A only, reads no row without a tenant header, none under B's, and A's rows only under A's (base: both organizations' rows, and B's)", async () => {
        for (const table of BRANCH_TABLES) {
          expect(await reads("UZ", {}, table), `${table}, no header`).toEqual(
            read([]),
          );
          expect(await reads("UZ", only("TB"), table), `${table}, B`).toEqual(
            read([]),
          );
          expect(await reads("UZ", only("TA"), table), `${table}, A`).toEqual(
            read(OWN_A[table]!),
          );
          expect(await reads("UZ", under("mZ"), table), `${table}, mZ`).toEqual(
            read(OWN_A[table]!),
          );
        }
      });

      it("the global field policies stay readable to a member of A and to nobody without a resolved assignment", async () => {
        const globals = (who: User, headers: Record<string, string>) =>
          as(
            who,
            headers,
            "select count(*)::int n from public.field_policies where tenant_id is null",
          );
        const n = (r: { rows: Record<string, unknown>[] }) => r.rows[0]?.n;
        expect(n(await globals("UDON", under("mDon")))).toBeGreaterThan(0);
        expect(n(await globals("UMIS", under("mMis")))).toBeGreaterThan(0);
        expect(n(await globals("UZ", under("mZ")))).toBeGreaterThan(0);
        expect(n(await globals("UZ", {}))).toBe(0);
        expect(n(await globals("UX", only("TA")))).toBe(0);
      });

      it("an operator at aal2 with a staff row in A and a super_admin profile reads none of B's rows and, under A, exactly what a development staff member of A reads (base: B's rows)", async () => {
        for (const table of [
          ...BRANCH_TABLES,
          "support_saved_views",
          "crm_notes",
        ]) {
          expect(
            await reads("UO", only("TB"), table, "aal2"),
            `${table}, B`,
          ).toEqual(read([]));
          const staff = await reads("UDEV", under("mDev"), table);
          const operator = await reads("UO", under("mO"), table, "aal2");
          expect(
            operator,
            `${table}, A (the operator holds no agent, so no personal view of UDEV's)`,
          ).toEqual(
            table === "support_saved_views"
              ? read(staff.keys.filter((k) => k !== "vDev"))
              : staff,
          );
        }
      });
    });

    describe("no read gained or lost: one policy of each kind, two organizations, every class and staff sub-role (guard: the base gives the same rows)", () => {
      const expected: Record<string, (m: string) => string[]> = {
        funds: (m) =>
          TA_STAFF.includes(m) ? ["fA"] : TB_STAFF.includes(m) ? ["fB"] : [],
        donations: (m) =>
          TA_STAFF.includes(m)
            ? ["g1", "g2", "g3", "g4"]
            : TB_STAFF.includes(m)
              ? ["g5"]
              : ((
                  {
                    mSGd: ["g1"],
                    mMGd: ["g2"],
                    mMGm: ["g3"],
                    mDon: ["g4"],
                    mMis: ["g1", "g2", "g4"],
                  } as Record<string, string[]>
                )[m] ?? []),
        support_saved_views: (m) =>
          m === "mAdm"
            ? ["vWork", "vAdm", "vDev", "vNull"]
            : m === "mDev"
              ? ["vWork", "vDev", "vNull"]
              : TA_STAFF.includes(m)
                ? ["vWork", "vNull"]
                : TB_STAFF.includes(m)
                  ? ["vB"]
                  : [],
        crm_notes: (m) =>
          m === "mAdm"
            ? ["nStd", "nRes"]
            : TA_STAFF.includes(m)
              ? ["nStd"]
              : TB_STAFF.includes(m)
                ? ["nB"]
                : [],
        donor_feed_preferences: (m) =>
          ({ mDon: ["pDON"], mSGd: ["pSG"] })[m] ?? [],
        field_policies: (m) => (tenantOf(m) === "TA" ? ["fpA"] : ["fpB"]),
      };

      const kind: Record<string, string> = {
        funds: "a pure staff-wide read moved to the helper",
        donations:
          "a staff-or-own read: staff all, a donor their own gifts, a missionary the gifts to them",
        support_saved_views:
          "a narrowed read kept: personal views only to their owner or the administrator",
        crm_notes: "D-82: a restricted note only under the administrator flag",
        donor_feed_preferences: "an own-row read kept",
        field_policies:
          "field_policies_read: every member with a resolved assignment, donor and missionary rows too",
      };

      for (const table of Object.keys(expected))
        it(`${table}, ${kind[table]}: each membership row reads exactly its rows; no header reads none`, async () => {
          for (const [m] of PEOPLE_ROWS)
            expect(
              await reads(userOf(m), under(m), table),
              `${table} under ${m}`,
            ).toEqual(read(expected[table]!(m)));
          for (const who of ["UX", "UDON", "UADM"] as const)
            expect(
              await reads(who, {}, table),
              `${table}, ${who} with no header`,
            ).toEqual(read([]));
        });

      it("a write policy refuses as before: a donor's note, a staff member's feed preference for a donor, a staff member's audit row", async () => {
        const insert = (who: User, m: string, sql: string) =>
          as(who, under(m), sql);
        expect(
          (
            await insert(
              "UDON",
              "mDon",
              `insert into public.crm_notes (tenant_id, title, body, visibility) values (${q("TA")}, 't', 'b', 'standard')`,
            )
          ).code,
        ).toBe("42501");
        expect(
          (
            await insert(
              "UDEV",
              "mDev",
              `insert into public.donor_feed_preferences (tenant_id, donor_id) values (${q("TA")}, ${q("dOther")})`,
            )
          ).code,
        ).toBe("42501");
        expect(
          (
            await insert(
              "UADM",
              "mAdm",
              `insert into public.audit_logs (tenant_id, action, resource_type) values (${q("TA")}, 'x', 'y')`,
            )
          ).code,
        ).toBe("42501");
      });
    });
  },
);
