/** #2364 [A][R] criteria 1-4, 11-14. H3 output comes from this file.
 * Like #2402, no admin URL means clean skip. Never mutate the admin database.
 * H2's read-only catalog shape is catalog(); live development evidence still
 * requires a separately authorized development connection, not this scratch DB.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as H from "./harness";

const URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
describe.skipIf(!URL)("#2364 [A] realstack", () => {
  let s: H.Stack;
  beforeAll(async () => {
    s = new H.Stack(URL);
    await s.open();
  }, 600_000);
  afterAll(async () => {
    if (s) await s.close();
  });
  const check = (name: string, fn: () => Promise<void>) =>
    it(name, () => s.tx(fn));
  const select = (columns: string, filter = "") =>
    `select ${columns} from public.missionaries ${filter} order by id`;
  const auth = (columns: string, filter = "", actor = "missionary") =>
    s.as("authenticated", actor, select(columns, filter));

  check(
    "#2364 criterion 1: anon has no table/column privileges or policy and SELECT raises 42501",
    async () => {
      await s.apply();
      expect((await s.as("anon", null, select("*"))).code).toBe("42501");
      expect(
        await s.rows(
          "select has_table_privilege('anon','public.missionaries','SELECT') as allowed",
        ),
      ).toEqual([{ allowed: false }]);
      const state = await s.catalog();
      expect(
        state.table.filter((r) => ["anon", "PUBLIC"].includes(String(r.role))),
      ).toEqual([]);
      expect(
        state.columns.filter((r) =>
          ["anon", "PUBLIC"].includes(String(r.role)),
        ),
      ).toEqual([]);
      for (const p of state.policies.filter(
        (r) => r.tablename === "missionaries",
      ))
        expect(p.roles).toEqual(["authenticated"]);
    },
  );
  check(
    "#2364 criterion 2: signed-in SELECT * is denied, own join keys alone remain readable",
    async () => {
      await s.apply();
      expect((await auth("*")).code).toBe("42501");
      expect(
        await s.rows(
          "select has_table_privilege('authenticated','public.missionaries','SELECT') as allowed",
        ),
      ).toEqual([{ allowed: false }]);
      const result = await auth("id, profile_id");
      expect(result.code).toBeNull();
      expect(result.rows).toEqual([{ id: s.id.mA, profile_id: s.id.pM }]);
      expect((await auth("id, profile_id", "", "donor")).rows).toEqual([]);
      expect(
        (await s.catalog()).table.filter((r) => r.role === "authenticated"),
      ).toEqual([]);
    },
  );
  check(
    "#2364 criterion 3: service_role ACL is unchanged and SELECT * sees both tenants",
    async () => {
      const before = await s.catalog();
      const all = () =>
        s.as(
          "service_role",
          null,
          select(
            "*",
            `where id in (${["mA", "mOther", "mB"].map((k) => s.q(k)).join(",")})`,
          ),
        );
      const original = await all();
      expect(original.code).toBeNull();
      expect(original.rows.map((r) => r.id).sort()).toEqual(
        [s.id.mA, s.id.mOther, s.id.mB].sort(),
      );
      await s.apply();
      const after = await s.catalog();
      for (const key of ["table", "columns"] as const)
        expect(after[key].filter((r) => r.role === "service_role")).toEqual(
          before[key].filter((r) => r.role === "service_role"),
        );
      expect(await all()).toEqual(original);
    },
  );
  for (const [actor, expected] of [
    ["donor", ["giftD"]],
    ["missionary", ["giftM"]],
    ["staff", ["giftD", "giftM", "giftOther"]],
  ] as const) {
    check(
      `#2364 criterion 4: ${actor} gifts and pledges retain exactly their own/tenant-A rows without 42501`,
      async () => {
        for (const stage of ["before", "after"]) {
          if (stage === "after") await s.apply();
          for (const table of ["donations", "donor_pledges"])
            expect(
              (await s.gifts(actor, table)).map((r) => r.id).sort(),
            ).toEqual(expected.map((k) => s.id[k]).sort());
        }
      },
    );
    check(
      `#2364 criterion 11: ${actor} SELECT * rows, column names and values match the actual predecessor`,
      async () => {
        const before = [
          await s.gifts(actor, "donations"),
          await s.gifts(actor, "donor_pledges"),
        ];
        await s.apply();
        const after = [
          await s.gifts(actor, "donations"),
          await s.gifts(actor, "donor_pledges"),
        ];
        expect(after).toEqual(before);
        const catalog = await s.catalog();
        expect(
          catalog.policies
            .filter((r) => r.tablename === "missionaries")
            .map((p) => [p.policyname, p.cmd, p.roles]),
        ).toEqual([[H.OWN, "SELECT", ["authenticated"]]]);
      },
    );
  }
  check(
    "#2364 criterion 12: health_status is denied filtered and unfiltered; every column ACL is exact",
    async () => {
      await s.apply();
      for (const filter of ["", `where id=${s.q("mOther")}`])
        expect((await auth("health_status", filter)).code).toBe("42501");
      const columns =
        await s.rows(`select column_name, has_column_privilege('authenticated',
      'public.missionaries',column_name,'SELECT') as allowed from information_schema.columns
      where table_schema='public' and table_name='missionaries' order by column_name`);
      expect(columns.length).toBeGreaterThan(2);
      expect(
        columns.filter((c) => c.allowed).map((c) => c.column_name),
      ).toEqual([...H.KEYS].sort());
      expect(
        columns.find((c) => c.column_name === "health_status")?.allowed,
      ).toBe(false);
    },
  );
  check(
    "#2364 criterion 13: other missionary and tenant B return zero keys; own-profile aliases work; donor gets none",
    async () => {
      await s.apply();
      for (const key of ["mOther", "mB"]) {
        const result = await auth("id, profile_id", `where id=${s.q(key)}`);
        expect(result).toEqual({ code: null, rows: [] });
      }
      for (const actor of ["missionary", "pM"])
        expect(await auth("id, profile_id", "", actor)).toEqual({
          code: null,
          rows: [{ id: s.id.mA, profile_id: s.id.pM }],
        });
      expect(await auth("id, profile_id", "", "donor")).toEqual({
        code: null,
        rows: [],
      });
    },
  );
  check(
    "#2364 criterion 14: interim anon-only change and a second run converge to identical ACL/policy/RLS state",
    async () => {
      await s.db.query("savepoint predecessor");
      await s.apply();
      const clean = await s.catalog();
      expect(clean.rls).toEqual([
        { relrowsecurity: true, relforcerowsecurity: true },
      ]);
      expect(clean.realtime).toEqual([]);
      await s.db.query("rollback to savepoint predecessor");
      await s.db.query(
        'drop policy if exists "public read" on public.missionaries; revoke select on public.missionaries from anon',
      );
      await s.apply();
      expect(await s.catalog()).toEqual(clean);
      await s.apply();
      expect(await s.catalog()).toEqual(clean);
    },
  );
  check(
    "#2364 criterion 8: pre-assert rejects missing table or disabled RLS without accepting either state",
    async () => {
      for (const sql of [
        "alter table public.missionaries disable row level security",
        "alter table public.missionaries rename to acc2364_missing",
      ]) {
        await s.db.query("savepoint bad_prestate");
        await s.db.query(sql);
        // Presence is asserted separately so a missing file cannot satisfy this rejection.
        expect(H.read(H.FORWARD)).not.toBe("");
        await expect(s.apply()).rejects.toMatchObject({ code: "P0001" });
        await s.db.query(
          "rollback to savepoint bad_prestate; release savepoint bad_prestate",
        );
      }
    },
  );
});
