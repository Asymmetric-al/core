import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  caller,
  fixtureIds,
  fixtureSql,
  type Ids,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const OLD_OWN_DONOR =
  "donor_id IN (SELECT d.id FROM public.donors AS d WHERE d.tenant_id = (SELECT authz.current_tenant_id()) AND d.profile_id IN (SELECT authz.caller_profile_ids()))";
const OLD_OWN_MISSIONARY =
  "missionary_id IN (SELECT m.id FROM public.missionaries AS m WHERE m.profile_id IN (SELECT authz.caller_profile_ids()))";

// Amended by WP2c's rest (AL-2675, pull request B; record D-18): the old
// texts lose their super-admin branch. 20261127040000 dropped the function,
// and no fixture caller's profile says super_admin, so every comparison of
// the account-link move reads the same rows with or without it.
const OLD_POLICIES: Record<string, [string, string, string | null]> = {
  donors: [
    "donors owner or staff select",
    "(tenant_id = (SELECT authz.current_tenant_id()) AND ((SELECT authz.assignment_is('staff')) OR ((SELECT authz.assignment_is('donor')) AND profile_id IN (SELECT authz.caller_profile_ids()))))",
    null,
  ],
  donations: [
    "donations owner or staff select",
    `(tenant_id = (SELECT authz.current_tenant_id()) AND ((SELECT authz.assignment_is('staff')) OR ((SELECT authz.assignment_is('donor')) AND ${OLD_OWN_DONOR}) OR ((SELECT authz.assignment_is('missionary')) AND ${OLD_OWN_MISSIONARY})))`,
    null,
  ],
  donor_pledges: [
    "donor pledges owner or staff select",
    `(tenant_id = (SELECT authz.current_tenant_id()) AND ((SELECT authz.assignment_is('staff')) OR ((SELECT authz.assignment_is('donor')) AND ${OLD_OWN_DONOR}) OR ((SELECT authz.assignment_is('missionary')) AND ${OLD_OWN_MISSIONARY})))`,
    null,
  ],
  donor_activities: [
    "donor activities owner or staff select",
    "EXISTS (SELECT 1 FROM public.donors AS d WHERE d.id = donor_activities.donor_id AND d.tenant_id = (SELECT authz.current_tenant_id()) AND ((SELECT authz.assignment_is('staff')) OR ((SELECT authz.assignment_is('donor')) AND d.profile_id IN (SELECT authz.caller_profile_ids()))))",
    null,
  ],
  missionaries: [
    "missionaries own row key read",
    "tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('missionary')) AND profile_id IN (SELECT authz.caller_profile_ids())",
    null,
  ],
  follows: [
    "tenant scoped own or staff read",
    `tenant_id = (SELECT authz.current_tenant_id()) AND ((SELECT authz.assignment_is('staff')) OR ((SELECT authz.assignment_is('donor')) AND ${OLD_OWN_DONOR}))`,
    null,
  ],
  donor_feed_preferences: [
    "donor_feed_preferences_own_select",
    `tenant_id = (SELECT authz.current_tenant_id()) AND (SELECT authz.assignment_is('donor')) AND ${OLD_OWN_DONOR}`,
    null,
  ],
};

const FIXTURE_ROWS: Record<string, (keyof Ids)[]> = {
  donors: ["dA", "dAB", "dC", "d2"],
  donations: ["gA", "gC", "g2", "gB"],
  donor_pledges: ["plA", "plC", "pl2", "plB"],
  donor_activities: ["aA", "aC", "a2", "aB"],
  missionaries: ["mA", "mB", "m2"],
  follows: ["fA", "fC", "f2", "fB"],
  donor_feed_preferences: ["pfA", "pfC", "pf2", "pfB"],
  parties: ["pDA", "pDAB", "pDC", "pD2", "pMA", "pMB", "pM2"],
};

describe.skipIf(!ADMIN_URL)(
  "AL-2678 own-row policies through account links (plan WP5, brief section B)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const queryAs = asRole(db, id);
    const name = Object.fromEntries(
      Object.entries(id).map(([k, v]) => [v, k]),
    ) as Record<string, string>;
    const who = {
      donorA: caller(id, "UDA", "mDA", "TA"),
      donorAinB: caller(id, "UDA", "mDAB", "TB"),
      donorAforgedB: caller(id, "UDA", "mDAB", "TA"),
      claimed: caller(id, "UDC", "mDC", "TA"),
      donor2: caller(id, "UD2", "mD2", "TA"),
      missionary: caller(id, "UM", "mM", "TA"),
      missionaryInB: caller(id, "UM", "mMB", "TB"),
      missionary2: caller(id, "UM2", "mM2", "TA"),
      staff: caller(id, "US", "mS", "TA"),
      staffB: caller(id, "UBS", "mBS", "TB"),
    };
    type Who = keyof typeof who;

    async function visible(person: Who, table: string) {
      const rows = FIXTURE_ROWS[table]!.map((k) => `'${id[k]}'`).join(", ");
      const result = await queryAs(
        "authenticated",
        who[person],
        `select id from public.${table} where id in (${rows})`,
      );
      expect(
        result.code,
        `${person} on ${table}: ${result.message}`,
      ).toBeNull();
      return result.rows.map((r) => name[r.id as string]).sort();
    }

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id));
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    const expected: Record<string, Partial<Record<Who, string[]>>> = {
      donors: {
        donorA: ["dA"],
        claimed: ["dC"],
        donor2: ["d2"],
        donorAinB: ["dAB"],
        donorAforgedB: [],
        missionary: [],
        staff: ["d2", "dA", "dC"],
        staffB: ["dAB"],
      },
      donations: {
        donorA: ["gA"],
        claimed: ["gC"],
        donor2: ["g2"],
        donorAinB: ["gB"],
        donorAforgedB: [],
        missionary: ["gA"],
        missionary2: ["g2", "gC"],
        missionaryInB: ["gB"],
        staff: ["g2", "gA", "gC"],
        staffB: ["gB"],
      },
      donor_pledges: {
        donorA: ["plA"],
        claimed: ["plC"],
        donor2: ["pl2"],
        donorAinB: ["plB"],
        donorAforgedB: [],
        missionary: ["plA"],
        missionary2: ["pl2", "plC"],
        missionaryInB: ["plB"],
        staff: ["pl2", "plA", "plC"],
        staffB: ["plB"],
      },
      donor_activities: {
        donorA: ["aA"],
        claimed: ["aC"],
        donor2: ["a2"],
        donorAinB: ["aB"],
        donorAforgedB: [],
        missionary: [],
        staff: ["a2", "aA", "aC"],
        staffB: ["aB"],
      },
      missionaries: {
        missionary: ["mA"],
        missionary2: ["m2"],
        missionaryInB: ["mB"],
        donorA: [],
        staff: ["m2", "mA"],
        staffB: ["mB"],
      },
      follows: {
        donorA: ["fA"],
        claimed: ["fC"],
        donor2: ["f2"],
        donorAinB: ["fB"],
        donorAforgedB: [],
        missionary: [],
        staff: ["f2", "fA", "fC"],
        staffB: ["fB"],
      },
      donor_feed_preferences: {
        donorA: ["pfA"],
        claimed: ["pfC"],
        donor2: ["pf2"],
        donorAinB: ["pfB"],
        donorAforgedB: [],
        missionary: [],
        staff: [],
        staffB: [],
      },
      parties: {
        donorA: ["pDA"],
        claimed: ["pDC"],
        donor2: ["pD2"],
        donorAinB: ["pDAB"],
        donorAforgedB: [],
        missionary: ["pMA"],
        missionary2: ["pM2"],
        missionaryInB: ["pMB"],
        staff: ["pD2", "pDA", "pDC", "pM2", "pMA"],
        staffB: ["pDAB", "pMB"],
      },
    };

    it("account_links: the owner reads their own link (claimed and backfilled), another user of the tenant and the same user in another tenant read none of it, a forged header reads nothing, and staff read every link of their own tenant only", async () => {
      const cells: Partial<Record<Who, string[]>> = {
        donorA: ["pDA"],
        claimed: ["pDC"],
        donor2: ["pD2"],
        donorAinB: ["pDAB"],
        donorAforgedB: [],
        missionary: ["pMA"],
        missionary2: ["pM2"],
        missionaryInB: ["pMB"],
        staff: ["pD2", "pDA", "pDC", "pM2", "pMA"],
        staffB: ["pDAB", "pMB"],
      };
      for (const [person, rows] of Object.entries(cells)) {
        const result = await queryAs(
          "authenticated",
          who[person as Who],
          `select party_id from public.account_links where tenant_id in ('${id.TA}', '${id.TB}')`,
        );
        expect(result.code, `${person}: ${result.message}`).toBeNull();
        expect(
          result.rows.map((r) => name[r.party_id as string]).sort(),
          person,
        ).toEqual(rows);
      }
    });

    for (const [table, cells] of Object.entries(expected))
      it(`${table}: the owner reads their row (claimed with profile_id empty, and backfilled), another user of the tenant and the same user in another tenant read none of it, and the staff branch keeps its tenant`, async () => {
        for (const [person, rows] of Object.entries(cells))
          expect(await visible(person as Who, table), `${person}`).toEqual(
            rows,
          );
      });

    it("the claimed donor's row names no profile; every own-row policy names account_links and party_id, never profile_id", async () => {
      const donor = await db.query(
        "select profile_id from public.donors where id = $1",
        [id.dC],
      );
      expect(donor.rows).toEqual([{ profile_id: null }]);
      const policies =
        await db.query(`select tablename, policyname, coalesce(qual, '') || ' ' || coalesce(with_check, '') as text
        from pg_policies where schemaname = 'public' and (tablename, policyname) in (
          ('donors', 'donors owner or staff select'),
          ('donations', 'donations owner or staff select'),
          ('donor_pledges', 'donor pledges owner or staff select'),
          ('donor_activities', 'donor activities owner or staff select'),
          ('missionaries', 'missionaries own row key read'),
          ('follows', 'tenant scoped own or staff read'),
          ('donor_feed_preferences', 'donor_feed_preferences_own_select'),
          ('donor_feed_preferences', 'donor_feed_preferences_own_insert'),
          ('donor_feed_preferences', 'donor_feed_preferences_own_update'))`);
      expect(policies.rows).toHaveLength(9);
      for (const p of policies.rows as {
        tablename: string;
        policyname: string;
        text: string;
      }[]) {
        expect(p.text, p.policyname).not.toMatch(
          /profile_id|caller_profile_ids/,
        );
        expect(p.text, p.policyname).toMatch(
          /account_links|caller_missionary_ids/,
        );
      }
    });

    it("compared with the policies of the base, every caller but the claimed donor reads exactly the same rows, and the claimed donor gains only their own", async () => {
      for (const [table, [policy, using]] of Object.entries(OLD_POLICIES)) {
        const people = Object.keys(who) as Who[];
        const now: Record<string, string[]> = {};
        for (const person of people) now[person] = await visible(person, table);
        await db.query("savepoint old_policy");
        const before: Record<string, string[]> = {};
        try {
          await db.query(
            `alter policy "${policy}" on public.${table} using (${using})`,
          );
          for (const person of people)
            before[person] = await visible(person, table);
        } finally {
          await db.query("rollback to savepoint old_policy");
        }
        for (const person of people) {
          if (person === "claimed") {
            expect(before[person], `${table} claimed before`).toEqual([]);
            expect(
              now[person]!.length,
              `${table} claimed now`,
            ).toBeLessThanOrEqual(1);
            continue;
          }
          expect(now[person], `${table} ${person}`).toEqual(before[person]);
        }
      }
    });

    it("for every seeded membership, each own-row table reads the same rows under the base's policy and the new one, except the seeded donor record linked without a profile, which only its own login gains", async () => {
      const seeded = {
        owner: "11111111-1111-1111-1111-111111111111",
        morgan: "33333333-3333-3333-3333-333333333333",
        riley: "44444444-4444-4444-4444-444444444444",
        sam: "57000000-0000-4000-8000-000000000001",
      };
      const linkOnlyDonor = "30000000-0000-0000-0000-000000000016";
      const seededAs = asRole(db, seeded);
      const rows = await db.query(
        "select user_id, tenant_id, id from authz.memberships where user_id = any($1::uuid[]) and is_active order by user_id, tenant_id, role",
        [Object.values(seeded)],
      );
      expect(rows.rows.length).toBeGreaterThanOrEqual(8);
      const byUser = Object.fromEntries(
        Object.entries(seeded).map(([k, v]) => [v, k]),
      );
      const read = async (table: string) => {
        const out: Record<string, string[]> = {};
        for (const m of rows.rows as {
          user_id: string;
          tenant_id: string;
          id: string;
        }[]) {
          const result = await seededAs(
            "authenticated",
            {
              sub: byUser[m.user_id],
              headers: {
                "x-asym-tenant": m.tenant_id,
                "x-asym-assignment": m.id,
              },
            },
            `select id from public.${table} order by id`,
          );
          expect(result.code, result.message).toBeNull();
          out[m.id] = result.rows.map((r) => r.id as string);
        }
        return out;
      };
      for (const [table, [policy, using]] of Object.entries(OLD_POLICIES)) {
        const now = await read(table);
        await db.query("savepoint seeded_old_policy");
        let before: Record<string, string[]> = {};
        try {
          await db.query(
            `alter policy "${policy}" on public.${table} using (${using})`,
          );
          before = await read(table);
        } finally {
          await db.query("rollback to savepoint seeded_old_policy");
        }
        for (const m of rows.rows as { user_id: string; id: string }[]) {
          const gained = now[m.id]!.filter((r) => !before[m.id]!.includes(r));
          const lost = before[m.id]!.filter((r) => !now[m.id]!.includes(r));
          expect(lost, `${table} ${byUser[m.user_id]} lost`).toEqual([]);
          expect(gained, `${table} ${byUser[m.user_id]} gained`).toEqual(
            table === "donors" &&
              m.user_id === seeded.riley &&
              now[m.id]!.includes(linkOnlyDonor)
              ? [linkOnlyDonor]
              : [],
          );
        }
      }
    });

    it("donor_feed_preferences writes: the owner inserts and updates their own row; another donor's, another tenant's and a staff member's are refused", async () => {
      const write = (person: Who, sql: string) =>
        queryAs("authenticated", who[person], sql);
      await db.query("savepoint writes");
      try {
        await db.query(
          `delete from public.donor_feed_preferences where id in ('${id.pfC}', '${id.pfA}')`,
        );
        expect(
          (
            await write(
              "claimed",
              `insert into public.donor_feed_preferences (tenant_id, donor_id) values ('${id.TA}', '${id.dC}') returning donor_id`,
            )
          ).rows,
        ).toEqual([{ donor_id: id.dC }]);
        for (const [person, tenant, donor] of [
          ["claimed", id.TA, id.d2],
          ["claimed", id.TB, id.dAB],
          ["claimed", id.TB, id.dC],
          ["staff", id.TA, id.dA],
          ["missionary", id.TA, id.dA],
        ] as [Who, string, string][])
          expect(
            (
              await write(
                person,
                `insert into public.donor_feed_preferences (tenant_id, donor_id) values ('${tenant}', '${donor}')`,
              )
            ).code,
            `${person} inserts for ${name[donor]} in ${name[tenant]}`,
          ).toBe("42501");

        expect(
          (
            await write(
              "donor2",
              `update public.donor_feed_preferences set updated_at = now() where id = '${id.pf2}' returning id`,
            )
          ).rows,
        ).toEqual([{ id: id.pf2 }]);
        for (const person of [
          "claimed",
          "staff",
          "missionary",
          "donorAinB",
        ] as Who[]) {
          const updated = await write(
            person,
            `update public.donor_feed_preferences set updated_at = now() where id = '${id.pf2}' returning id`,
          );
          expect(
            updated.code,
            `${person} updates the second donor's row: ${updated.message}`,
          ).toBeNull();
          expect(
            updated.rows,
            `${person} updates the second donor's row`,
          ).toEqual([]);
        }
        for (const set of [
          `donor_id = '${id.dC}'`,
          `tenant_id = '${id.TB}'`,
          `tenant_id = '${id.TB}', donor_id = '${id.dAB}'`,
        ])
          expect(
            (
              await write(
                "donor2",
                `update public.donor_feed_preferences set ${set} where id = '${id.pf2}'`,
              )
            ).code,
            set,
          ).toBe("42501");
      } finally {
        await db.query("rollback to savepoint writes");
      }
    });
  },
);
