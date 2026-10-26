/**
 * #2312 real-stack acceptance (spec r2 = issue comment 6390700741, pins
 * addendum 1 = 6419302687, approved 6419379494): criteria 1, 2, 2b and 3, plus
 * addendum 1 item 2 (the five tables stay FORCED; the post-assert enforces it).
 * Runs in CI `migrate` step "Verify tenant isolation (real stack)" through that
 * step's explicit path list (addendum 1 item 4), against the migrated PG17
 * superuser URL TENANT_GUARD_IT_ADMIN_DATABASE_URL. Without the URL the DB
 * block skips, except in the CI `migrate` job, where it fails.
 *
 * Every check is one transaction, always rolled back, with the fixture created
 * inside it. Checks that drop and recreate policies on the five tables and
 * re-run the migration (criterion 1's develop-state replay, criterion 3 and the
 * FORCE check) run on a throwaway database instead, as #2254's criterion 7
 * does, so their held locks never meet the other files of CI's parallel step
 * (40P01). Calls emulate PostgREST: SET LOCAL ROLE plus request.jwt.claims
 * and request.jwt.claim.sub. R-5: every user-JWT case also sets the
 * app.current_tenant_id GUC to the same value, so the file holds across #2298.
 *
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { existsSync, readdirSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as H from "./harness";

const ADMIN_URL = process.env.TENANT_GUARD_IT_ADMIN_DATABASE_URL ?? "";
const IN_MIGRATE_JOB =
  process.env.GITHUB_ACTIONS === "true" && process.env.GITHUB_JOB === "migrate";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "#2312 public reads closed, tenant floor (R)",
  () => {
    const main = new pg.Client({ connectionString: ADMIN_URL });
    let db = main;
    const id: Record<string, string> = {};
    const KEYS =
      "A B UD1 UD2 UD3 SA SB M1 M2 D1 D2 D3 MA MB MN FA FB FN AA AB AN CA CB F1 F2 F3 FX FN2";
    for (const k of KEYS.split(" ")) id[k] = randomUUID();
    const q = (k: string) => `'${id[k]}'`;
    /**
     * Tenants A/B. Donor users UD1, UD2 (A) and UD3 (B) with donors D1-D3; staff
     * SA (A) and SB (B); missionary profiles M1 (A) and M2 (B). Rows per table:
     * A, B and (nullable tables) NULL tenant. follows: F1 D1->M1 (A), F2 D2->M1
     * (A), F3 D3->M2 (B), FX A row whose donor is tenant-B D3, FN2 NULL tenant.
     */
    const FIXTURE =
      `insert into public.tenants (id, name, slug) values (:A, 'acc2312 A', 'acc2312-' || :A), (:B, 'acc2312 B', 'acc2312-' || :B);
    insert into auth.users (id) values (:UD1), (:UD2), (:UD3), (:SA), (:SB), (:M1), (:M2);
    insert into public.profiles (id, user_id, tenant_id, role) values (:UD1, :UD1, :A, 'donor'), (:UD2, :UD2, :A, 'donor'), (:UD3, :UD3, :B, 'donor'),
      (:SA, :SA, :A, 'donor'), (:SB, :SB, :B, 'donor'), (:M1, :M1, :A, 'donor'), (:M2, :M2, :B, 'donor')
      on conflict (id) do update set user_id = excluded.user_id, tenant_id = excluded.tenant_id, role = excluded.role;
    insert into authz.memberships (user_id, tenant_id, role, staff_role, is_active) values (:SA, :A, 'staff', 'finance', true), (:SB, :B, 'staff', 'finance', true), (:M1, :A, 'missionary', null, true);
    insert into public.donors (id, tenant_id, profile_id) values (:D1, :A, :UD1), (:D2, :A, :UD2), (:D3, :B, :UD3);
    insert into public.missionaries (id, tenant_id, profile_id) values (:MA, :A, :M1), (:MB, :B, :M2), (:MN, null, :M1);
    insert into public.funds (id, tenant_id, name) values (:FA, :A, 'acc2312 A'), (:FB, :B, 'acc2312 B'), (:FN, null, 'acc2312 N');
    insert into public.assets (id, tenant_id, public_id, secure_url) values (:AA, :A, 'acc2312-a', 'https://x/a'), (:AB, :B, 'acc2312-b', 'https://x/b'), (:AN, null, 'acc2312-n', 'https://x/n');
    insert into public.campaigns (id, tenant_id, title, creator_donor_id, missionary_id) values (:CA, :A, 'acc2312 A', :D1, :MA), (:CB, :B, 'acc2312 B', :D3, :MB);
    insert into public.follows (id, tenant_id, donor_id, missionary_id) values (:F1, :A, :D1, :M1), (:F2, :A, :D2, :M1), (:F3, :B, :D3, :M2), (:FX, :A, :D3, :M1), (:FN2, null, :D1, :M2);`.replace(
        /:([A-Z]+\d?)\b/g,
        (_m, k: string) => q(k),
      );
    /** Fixture row keys per table: [tenant A, tenant B, NULL tenant (if nullable)]. */
    const ROWS: Record<string, [string, string, string?]> = {
      missionaries: ["MA", "MB", "MN"],
      funds: ["FA", "FB", "FN"],
      assets: ["AA", "AB", "AN"],
      campaigns: ["CA", "CB"],
    };
    const FOLLOWS = ["F1", "F2", "F3", "FX", "FN2"];

    /**
     * Throwaway database (the #2254 criterion 7 pattern): created on first use
     * with the bootstrap and every forward migration applied as CI's "Apply
     * migrations" does, dropped after the file. onThrowaway() points `db` at it
     * for the enclosing describe.
     */
    const SCRATCH = `acc2312_c3_${randomBytes(4).toString("hex")}`;
    const psql = (url: string, sql: string, args: string[] = []) =>
      spawnSync(
        process.env.PSQL_BIN?.trim() || "psql",
        [url, "-X", "-q", "-v", "ON_ERROR_STOP=1", ...args],
        { encoding: "utf8", input: sql },
      );
    let scratch: pg.Client | undefined;
    function onThrowaway() {
      beforeAll(async () => {
        if (!scratch) {
          const c = psql(ADMIN_URL, `create database ${SCRATCH};`);
          expect(c.status, c.stderr).toBe(0);
          const url = Object.assign(new URL(ADMIN_URL), {
            pathname: `/${SCRATCH}`,
          }).toString();
          const files = readdirSync(H.MIG)
            .filter((f) => /^\d{14}_.+\.sql$/.test(f))
            .sort();
          for (const f of [
            "scripts/sql/supabase-compat-bootstrap.sql",
            ...files,
          ]) {
            const r = psql(url, "", [
              ...(f.startsWith("20260214090000_")
                ? ["--single-transaction"]
                : []),
              "-f",
              f.endsWith("bootstrap.sql") ? f : `${H.MIG}/${f}`,
            ]);
            expect(r.status, `${f}: ${r.stderr}`).toBe(0);
          }
          scratch = new pg.Client({ connectionString: url });
          await scratch.connect();
        }
        db = scratch;
      }, 600_000);
      afterAll(() => {
        db = main;
      });
    }

    beforeAll(() => main.connect());
    afterAll(async () => {
      await main.end();
      if (scratch) {
        await scratch.end();
        psql(ADMIN_URL, `drop database if exists ${SCRATCH} with (force);`);
      }
    });

    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await db.query(FIXTURE);
        await fn();
      } finally {
        await db.query("rollback");
      }
    }
    /** tenant: a fixture key, a raw string (malformed), or undefined (no tenant_id key, GUC empty). */
    type Who = { role: string; user?: string; tenant?: string };
    const user = (u: string, tenant?: string): Who => ({
      role: "authenticated",
      user: u,
      tenant,
    });
    const ANON: Who = { role: "anon" };
    async function as(who: Who, sql: string) {
      await db.query("savepoint q");
      try {
        await db.query(`set local role ${who.role}`);
        const t =
          who.tenant === undefined ? undefined : (id[who.tenant] ?? who.tenant);
        const claims = who.user
          ? JSON.stringify({
              sub: id[who.user],
              role: "authenticated",
              app_metadata: t === undefined ? {} : { tenant_id: t },
            })
          : "";
        await db.query(
          "select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true), set_config('app.current_tenant_id', $3, true)",
          [claims, who.user ? id[who.user] : "", t ?? ""],
        );
        const r = await db.query(sql);
        await db.query("rollback to savepoint q");
        return { rows: r.rows as Record<string, unknown>[], code: null };
      } catch (e) {
        await db.query("rollback to savepoint q");
        return { rows: [], code: (e as { code?: string }).code ?? String(e) };
      }
    }
    const keyOf = (v: unknown) =>
      Object.keys(id).find((k) => id[k] === v) ?? String(v);
    /** Fixture keys `who` can SELECT from public.<t> (restricted to fixture ids). */
    async function sees(who: Who, t: string, keys: string[]) {
      const r = await as(
        who,
        `select id from public.${t} where id in (${keys.map(q).join(", ")})`,
      );
      expect(r.code, `${who.role} select ${t}`).toBeNull();
      return r.rows.map((x) => keyOf(x.id)).sort();
    }
    /** Re-run the migration inside the current transaction; returns the error message, if any. */
    async function rerun() {
      expect(existsSync(H.MIGRATION), `${H.MIGRATION} must exist (In 1)`).toBe(
        true,
      );
      await db.query("savepoint m");
      try {
        await db.query(H.migrationBatch());
        await db.query("release savepoint m");
        return null;
      } catch (e) {
        await db.query("rollback to savepoint m");
        return (e as Error).message;
      }
    }
    const policies = async (t: string) =>
      (
        await db.query(
          "select policyname, permissive, cmd, roles::text[] as roles, qual, with_check from pg_policies where schemaname = 'public' and tablename = $1 order by policyname",
          [t],
        )
      ).rows as {
        policyname: string;
        permissive: string;
        cmd: string;
        roles: string[];
        qual: string;
        with_check: string | null;
      }[];
    /** Table ACL as { grantee: sorted privileges } ("PUBLIC" for grantee 0). */
    async function acl(t: string) {
      const r = await db.query(
        `select case when a.grantee = 0 then 'PUBLIC' else g.rolname end as who, array_agg(a.privilege_type order by a.privilege_type) as privs
         from pg_class c cross join lateral aclexplode(coalesce(c.relacl, acldefault('r', c.relowner))) a
         left join pg_roles g on g.oid = a.grantee
        where c.oid = $1::regclass group by 1`,
        [`public.${t}`],
      );
      return Object.fromEntries(
        r.rows.map((x: { who: string; privs: string[] }) => [x.who, x.privs]),
      ) as Record<string, string[]>;
    }
    /**
     * Criterion 3 prepared states: drop every policy on the five tables, then
     * create the given legacy policies (definitions as in 20260216153000 and
     * 20260625002117) and re-grant the pre-state SELECT to anon/authenticated.
     */
    async function prepare(state: Record<string, string[]>) {
      await db.query(`do $$ declare r record; begin
      for r in select policyname, tablename from pg_policies where schemaname = 'public' and tablename = any(array['${H.TABLES.join("','")}']) loop
        execute format('drop policy %I on public.%I', r.policyname, r.tablename);
      end loop; end $$`);
      for (const t of H.TABLES) {
        await db.query(
          `grant select on table public.${t} to anon, authenticated`,
        );
        for (const name of state[t] ?? [])
          await db.query(
            name === "public read"
              ? `create policy "public read" on public.${t} for select to anon using (true)`
              : name === "tanstack browser read"
                ? `create policy "tanstack browser read" on public.${t} for select to anon, authenticated using (true)`
                : `create policy "${name}" on public.${t} for select to authenticated using (true)`,
          );
      }
    }
    const all = (names: string[]) =>
      Object.fromEntries(H.TABLES.map((t) => [t, names]));
    /** develop's post-backlog state: four "tanstack browser read" plus campaigns "public read". */
    const DEVELOP = () => ({
      ...all(["tanstack browser read"]),
      campaigns: ["public read"],
    });

    describe("criterion 1: post-state", () => {
      it.each(H.TABLES)(
        "1: public.%s has exactly one PERMISSIVE SELECT {authenticated} policy with the §1.1 name and deparsed qual",
        (t) =>
          tx(async () => {
            const p = await policies(t);
            expect(
              p.map((x) => [
                x.policyname,
                x.permissive,
                x.cmd,
                x.roles,
                x.with_check,
              ]),
            ).toEqual([
              [
                H.policyName(t),
                "PERMISSIVE",
                "SELECT",
                ["authenticated"],
                null,
              ],
            ]);
            await db.query(
              `create policy acc2312_ref on public.${t} as permissive for select to authenticated using (${H.qualFor(t)})`,
            );
            const ref = (await policies(t)).find(
              (x) => x.policyname === "acc2312_ref",
            );
            expect(p[0]!.qual).toBe(ref!.qual);
          }),
      );

      it.each(H.TABLES)(
        "1: public.%s grants: anon and PUBLIC none, authenticated exactly SELECT, no column grants",
        (t) =>
          tx(async () => {
            const a = await acl(t);
            expect(a.anon ?? []).toEqual([]);
            expect(a.PUBLIC ?? []).toEqual([]);
            expect(a.authenticated ?? []).toEqual(["SELECT"]);
            const col = await db.query(
              `select has_any_column_privilege('anon', $1, 'SELECT, INSERT, UPDATE, REFERENCES') as anon,
                    has_any_column_privilege('authenticated', $1, 'INSERT, UPDATE, REFERENCES') as auth`,
              [`public.${t}`],
            );
            expect(col.rows[0]).toEqual({ anon: false, auth: false });
          }),
      );

      it.each(H.TABLES)(
        "1 (addendum 1 item 2): public.%s keeps RLS enabled and FORCED",
        (t) =>
          tx(async () => {
            const r = await db.query(
              "select relrowsecurity, relforcerowsecurity from pg_class where oid = $1::regclass",
              [`public.${t}`],
            );
            expect(r.rows[0]).toEqual({
              relrowsecurity: true,
              relforcerowsecurity: true,
            });
          }),
      );

      describe("throwaway database", () => {
        onThrowaway();
        it("1: service_role's privileges are equal before and after the migration (develop-state replay)", () =>
          tx(async () => {
            await prepare(DEVELOP());
            const before = await Promise.all(
              H.TABLES.map(async (t) => (await acl(t)).service_role ?? []),
            );
            expect(await rerun()).toBeNull();
            const after = await Promise.all(
              H.TABLES.map(async (t) => (await acl(t)).service_role ?? []),
            );
            expect(after).toEqual(before);
          }));
      });

      it("1: supabase_realtime still carries funds only, of the five tables", () =>
        tx(async () => {
          const r = await db.query(
            "select tablename from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = any($1) order by 1",
            [H.TABLES],
          );
          expect(r.rows.map((x: { tablename: string }) => x.tablename)).toEqual(
            ["funds"],
          );
        }));
    });

    describe("criterion 2: floor behavior on the four tenant-floor tables", () => {
      const keys = (t: string) => ROWS[t]!.filter(Boolean) as string[];
      it.each(H.FLOOR_TABLES)("2: anon SELECT on public.%s raises 42501", (t) =>
        tx(async () =>
          expect(
            (await as(ANON, `select id from public.${t} limit 1`)).code,
          ).toBe("42501"),
        ),
      );
      it.each(H.FLOOR_TABLES)(
        "2: on public.%s tenant A sees exactly A's row, tenant B exactly B's; never the NULL-tenant row",
        (t) =>
          tx(async () => {
            expect(await sees(user("UD1", "A"), t, keys(t))).toEqual([
              ROWS[t]![0],
            ]);
            expect(await sees(user("UD3", "B"), t, keys(t))).toEqual([
              ROWS[t]![1],
            ]);
          }),
      );
      it.each(H.FLOOR_TABLES)(
        "2: on public.%s no tenant, or a malformed tenant, sees 0 rows",
        (t) =>
          tx(async () => {
            expect(await sees(user("UD1"), t, keys(t))).toEqual([]);
            expect(await sees(user("UD1", "not-a-uuid"), t, keys(t))).toEqual(
              [],
            );
          }),
      );
      it.each(H.FLOOR_TABLES)(
        "2: INSERT, UPDATE and DELETE on public.%s as authenticated raise 42501",
        (t) =>
          tx(async () => {
            const who = user("SA", "A");
            const row = q(ROWS[t]![0]);
            for (const s of [
              `insert into public.${t} default values`,
              `update public.${t} set tenant_id = tenant_id where id = ${row}`,
              `delete from public.${t} where id = ${row}`,
            ])
              expect((await as(who, s)).code, s).toBe("42501");
          }),
      );
      it.each(H.FLOOR_TABLES)(
        "2: service_role sees every fixture row of public.%s",
        (t) =>
          tx(async () => {
            // The CI database may lack Supabase's default grants; the grant is
            // rolled back and only shows that RLS does not filter service_role.
            await db.query(`grant select on public.${t} to service_role`);
            expect(await sees({ role: "service_role" }, t, keys(t))).toEqual(
              keys(t).sort(),
            );
          }),
      );
    });

    describe("criterion 2b: follows own-or-staff", () => {
      const sorted = (ks: string[]) => [...ks].sort();
      it.each([
        [
          "D1 at tenant A sees exactly D1's follow (not D2's, not the cross-tenant-donor row)",
          user("UD1", "A"),
          ["F1"],
        ],
        [
          "S_A sees every A follow, none of B's or the NULL row",
          user("SA", "A"),
          ["F1", "F2", "FX"],
        ],
        ["S_B with tenant A sees 0 rows", user("SB", "A"), []],
        ["S_A with tenant B sees 0 of A's", user("SA", "B"), []],
        [
          "M1 (the followed missionary) sees 0 rows (OQ2a)",
          user("M1", "A"),
          [],
        ],
        ["D1 with tenant B sees 0 rows", user("UD1", "B"), []],
      ] as const)("2b: %s", (_n, who, expected) =>
        tx(async () =>
          expect(await sees(who, "follows", FOLLOWS)).toEqual(
            sorted([...expected]),
          ),
        ),
      );
      it("2b: anon SELECT on public.follows raises 42501", () =>
        tx(async () =>
          expect(
            (await as(ANON, "select id from public.follows limit 1")).code,
          ).toBe("42501"),
        ));
    });

    describe("criterion 3: live-name tolerance (migration re-run in a rolled-back transaction)", () => {
      onThrowaway();
      const postState = async () => {
        for (const t of H.TABLES)
          expect(
            (await policies(t)).map((p) => p.policyname),
            t,
          ).toEqual([H.policyName(t)]);
      };
      it('3 (i): all five carry "public read" (live state): succeeds, with criterion 1\'s post-state', () =>
        tx(async () => {
          await prepare(all(["public read"]));
          expect(await rerun()).toBeNull();
          await postState();
          for (const t of H.TABLES)
            expect((await acl(t)).anon ?? []).toEqual([]);
        }));
      it("3 (ii): develop's post-backlog state succeeds", () =>
        tx(async () => {
          await prepare(DEVELOP());
          expect(await rerun()).toBeNull();
          await postState();
        }));
      it("3 (iii): both legacy names on one table succeeds", () =>
        tx(async () => {
          await prepare({
            ...DEVELOP(),
            missionaries: ["public read", "tanstack browser read"],
          });
          expect(await rerun()).toBeNull();
          await postState();
        }));
      it('3 (iv): an extra policy "x" raises, naming the table and x', () =>
        tx(async () => {
          await prepare({
            ...DEVELOP(),
            funds: ["tanstack browser read", "x"],
          });
          const err = await rerun();
          expect(err).not.toBeNull();
          expect(err).toMatch(/funds/);
          expect(err).toMatch(/\bx\b/);
        }));
      it("3 (v): one table with no policy raises", () =>
        tx(async () => {
          await prepare({ ...DEVELOP(), assets: [] });
          const err = await rerun();
          expect(err).not.toBeNull();
          expect(err).toMatch(/assets/);
        }));
      it("1/In 1.5 (addendum 1 item 2): the post-assert raises when a table is not FORCED", () =>
        tx(async () => {
          await prepare(DEVELOP());
          await db.query(
            "alter table public.funds no force row level security",
          );
          const err = await rerun();
          expect(err).not.toBeNull();
          expect(err).toMatch(/funds/);
        }));
    });
  },
);
