import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  backendPid,
  caller,
  fixtureIds,
  fixtureSql,
  migration,
  preflight,
  waitsOn,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const SPINE = migration("_parties_account_links_and_own_rows");
const PERSONS = migration("_drop_persons_scaffold");

async function tx<T>(db: pg.Client, fn: () => Promise<T>) {
  await db.query("begin");
  try {
    return await fn();
  } finally {
    await db.query("rollback");
  }
}

async function failure(db: pg.Client, sql: string) {
  await db.query("savepoint failure");
  try {
    await db.query(sql);
    return null;
  } catch (e) {
    return (e as { code?: string }).code ?? "?";
  } finally {
    await db.query("rollback to savepoint failure");
  }
}

describe.skipIf(!ADMIN_URL)(
  "AL-2678 identity spine (plan WP5, rulings W5-R2 and W5-R3)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const queryAs = asRole(db, id);
    beforeAll(() => db.connect());
    afterAll(() => db.end());

    it("parties carries the Phase 10 fields with their defaults and checks; donors, missionaries, funds and parties carry a nullable import batch", async () => {
      const columns =
        await db.query(`select table_name, column_name, is_nullable, column_default
      from information_schema.columns
     where table_schema = 'public'
       and ((table_name = 'parties') or (table_name in ('donors', 'missionaries', 'funds') and column_name in ('party_id', 'import_batch_id')))
     order by table_name, column_name`);
      const shape = Object.fromEntries(
        columns.rows.map((r) => [
          `${r.table_name}.${r.column_name}`,
          [r.is_nullable, r.column_default],
        ]),
      );
      expect(shape["parties.security_level"]).toEqual([
        "NO",
        "'standard'::text",
      ]);
      expect(shape["parties.security_level_source"]).toEqual([
        "NO",
        "'unreviewed_default'::text",
      ]);
      expect(shape["parties.do_not_publish"]).toEqual(["NO", "false"]);
      expect(shape["parties.public_alias"]?.[0]).toBe("YES");
      expect(shape["parties.display_name"]?.[0]).toBe("NO");
      for (const t of ["parties", "donors", "missionaries", "funds"])
        expect(shape[`${t}.import_batch_id`], t).toEqual(["YES", null]);
      expect(shape["donors.party_id"]?.[0]).toBe("YES");
      expect(shape["missionaries.party_id"]?.[0]).toBe("NO");
      await tx(db, async () => {
        await db.query(fixtureSql(id));
        for (const [set, code] of [
          ["security_level = 'secret'", "23514"],
          ["security_level_source = 'guess'", "23514"],
          ["security_level_source = 'country_default'", null],
        ] as const)
          expect(
            await failure(
              db,
              `update public.parties set ${set} where id = '${id.pDA}'`,
            ),
            set,
          ).toBe(code);
        expect(
          await failure(
            db,
            `insert into public.missionaries (tenant_id, legal_entity_id) values ('${id.TA}', '${id.TA}')`,
          ),
        ).toBe("23502");
        expect(
          await failure(
            db,
            `insert into public.missionaries (tenant_id, legal_entity_id, party_id) values ('${id.TA}', '${id.TA}', '${id.pMA}')`,
          ),
          "one assignment per tenant and Party",
        ).toBe("23505");
        expect(
          await failure(
            db,
            `update public.donors set party_id = '${id.pDAB}' where id = '${id.dA}'`,
          ),
          "a donor's Party is in its tenant",
        ).toBe("23503");
        expect(
          await failure(
            db,
            `insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ('${id.TA}', '${id.US}', '${id.pDAB}', 'account_claim')`,
          ),
          "a link's Party is in its tenant",
        ).toBe("23503");
        expect(
          await failure(
            db,
            `insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ('${id.TA}', '${id.UDA}', '${id.pD2}', 'account_claim')`,
          ),
          "one link per login and tenant",
        ).toBe("23505");
      });
    });

    it("signed-in users hold SELECT on parties and account_links and no insert or update privilege on any column of either", async () => {
      const r = await db.query(`select c.relname, a.attname,
        has_column_privilege('authenticated', c.oid, a.attnum, 'INSERT') ins,
        has_column_privilege('authenticated', c.oid, a.attnum, 'UPDATE') upd,
        has_column_privilege('anon', c.oid, a.attnum, 'SELECT') anon_sel,
        has_table_privilege('authenticated', c.oid, 'SELECT') sel,
        c.relforcerowsecurity forced
      from pg_class c join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
     where c.oid in ('public.parties'::regclass, 'public.account_links'::regclass)`);
      expect(r.rows.length).toBeGreaterThan(10);
      for (const row of r.rows)
        expect(
          [row.ins, row.upd, row.anon_sel, row.sel, row.forced],
          `${row.relname}.${row.attname}`,
        ).toEqual([false, false, false, true, true]);
    });

    describe("the temporary donor trigger (W5-R2, amended)", () => {
      it("D-18 (AL-2678 r3 adds the two BEFORE ROW triggers that derive donors.ministry_assignment_id; the fill trigger stays the only AFTER trigger): is one AFTER INSERT row trigger, a postgres-owned definer with an empty search path, and beside r3's two key triggers the only user trigger on donors", async () => {
        const r =
          await db.query(`select t.tgname, t.tgtype, p.prosecdef, pg_get_userbyid(p.proowner) owner, p.proconfig
        from pg_trigger t join pg_proc p on p.oid = t.tgfoid
       where t.tgrelid = 'public.donors'::regclass and not t.tgisinternal order by t.tgname`);
        expect(r.rows).toEqual(
          [
            ["donors_fill_party_after_insert_temp", 5],
            ["zz_wp5_assignment_key_insert", 7],
            ["zz_wp5_assignment_key_update", 19],
          ].map(([tgname, tgtype]) => ({
            tgname,
            tgtype,
            prosecdef: true,
            owner: "postgres",
            proconfig: ['search_path=""'],
          })),
        );
      });

      it("gives each server writer's new donor its own Party in the donor's tenant and no account link; a gift that meets an existing donor makes none; a donor with no tenant gets none", () =>
        tx(db, async () => {
          await db.query(fixtureSql(id));
          const newUser = randomUUID();
          await db.query(
            "insert into auth.users (id, email) values ($1::uuid, 'acc2678-gift-' || $1::text || '@example.test')",
            [newUser],
          );
          await db.query(
            "update public.profiles set display_name = 'Gift Giver', full_name = 'Gift Full' where id = $1",
            [newUser],
          );
          const parties = async () =>
            Number(
              (
                await db.query(
                  "select count(*) n from public.parties where tenant_id = $1",
                  [id.TA],
                )
              ).rows[0].n,
            );
          const links = async () =>
            Number(
              (
                await db.query(
                  "select count(*) n from public.account_links where tenant_id = $1",
                  [id.TA],
                )
              ).rows[0].n,
            );
          const startParties = await parties();
          const startLinks = await links();
          await db.query(
            "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 500, p_idempotency_key => $3)",
            [id.TA, newUser, randomUUID()],
          );
          const donor = await db.query(
            `select d.party_id, p.tenant_id, p.display_name from public.donors d join public.parties p on p.id = d.party_id
            where d.tenant_id = $1 and d.profile_id = $2`,
            [id.TA, newUser],
          );
          expect(donor.rows).toEqual([
            {
              party_id: expect.any(String),
              tenant_id: id.TA,
              display_name: "Gift Giver",
            },
          ]);
          expect(await parties()).toBe(startParties + 1);

          await db.query(
            "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 700, p_idempotency_key => $3)",
            [id.TA, newUser, randomUUID()],
          );
          await db.query(
            "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 900, p_idempotency_key => $3)",
            [id.TA, id.UDA, randomUUID()],
          );
          expect(
            await parties(),
            "gifts that meet existing donors make no Party",
          ).toBe(startParties + 1);

          const atomicUser = randomUUID();
          await db.query(
            `insert into auth.users (id, email) values ($1::uuid, 'acc2678-atomic-' || $1::text || '@example.test')`,
            [atomicUser],
          );
          await db.query(
            "select public.atomic_create_donation_with_audit(p_tenant_id => $1, p_donor_profile_id => $2, p_actor_user_id => $2, p_missionary_id => null, p_amount => 300)",
            [id.TA, atomicUser],
          );
          const inserted = await db.query(
            "insert into public.donors (tenant_id, profile_id, giving_preferences, total_given) values ($1, null, '{}'::jsonb, 0) returning id, stripe_customer_id, profile_id",
            [id.TA],
          );
          expect(Object.keys(inserted.rows[0]).sort()).toEqual([
            "id",
            "profile_id",
            "stripe_customer_id",
          ]);
          const noTenant = await db.query(
            "insert into public.donors (name, email) values ('No tenant', 'acc2678-no-tenant-' || gen_random_uuid() || '@example.test') returning id",
          );
          expect(await parties()).toBe(startParties + 3);
          const filled = await db.query(
            `select d.id, d.party_id is not null filled, p.tenant_id = d.tenant_id same_tenant
             from public.donors d left join public.parties p on p.id = d.party_id
            where d.id = $1 or d.id = $2 or d.profile_id = $3`,
            [inserted.rows[0].id, noTenant.rows[0].id, atomicUser],
          );
          const byId = Object.fromEntries(
            filled.rows.map((r) => [r.id, [r.filled, r.same_tenant]]),
          );
          expect(byId[inserted.rows[0].id]).toEqual([true, true]);
          expect(byId[noTenant.rows[0].id]).toEqual([false, null]);
          expect(filled.rows).toHaveLength(3);
          expect(await links(), "the trigger never links an account").toBe(
            startLinks,
          );
          const orphans = await db.query(
            `select count(*) n from public.parties p
            where p.tenant_id in ($1, $2)
              and not exists (select 1 from public.donors d where d.party_id = p.id)
              and not exists (select 1 from public.missionaries m where m.party_id = p.id)`,
            [id.TA, id.TB],
          );
          expect(orphans.rows).toEqual([{ n: "0" }]);
        }));

      it("reuses the Party a person already has in the organization: a linked missionary's first gift through begin_donation_saga makes no second Party and the person reads the new donor record as their own; a missionary with no link reuses the missionary row's Party", () =>
        tx(db, async () => {
          await db.query(fixtureSql(id));
          const donorMembership = randomUUID();
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role, is_active) values ($1, $2, $3, 'donor', true)",
            [donorMembership, id.UM2, id.TA],
          );
          const count = async (table: string) =>
            Number(
              (
                await db.query(
                  `select count(*) n from public.${table} where tenant_id = $1`,
                  [id.TA],
                )
              ).rows[0].n,
            );
          const parties = await count("parties");
          const links = await count("account_links");
          await db.query(
            "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 100, p_idempotency_key => $3)",
            [id.TA, id.UM2, randomUUID()],
          );
          const linkedDonor = await db.query(
            "select id, party_id from public.donors where tenant_id = $1 and profile_id = $2",
            [id.TA, id.UM2],
          );
          expect(linkedDonor.rows).toEqual([
            { id: expect.any(String), party_id: id.pM2 },
          ]);
          expect(await count("parties")).toBe(parties);
          expect(await count("account_links")).toBe(links);
          const own = await queryAs(
            "authenticated",
            {
              sub: "UM2",
              headers: {
                "x-asym-tenant": id.TA,
                "x-asym-assignment": donorMembership,
              },
            },
            `select id from public.donors where id = '${linkedDonor.rows[0].id}'`,
          );
          expect(own.code, own.message).toBeNull();
          expect(own.rows).toEqual([{ id: linkedDonor.rows[0].id }]);

          const unlinked = randomUUID();
          const unlinkedParty = randomUUID();
          await db.query(
            "insert into auth.users (id, email) values ($1::uuid, 'acc2678-unlinked-' || $1::text || '@example.test')",
            [unlinked],
          );
          await db.query(
            "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Unlinked worker')",
            [unlinkedParty, id.TA],
          );
          await db.query(
            "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1)",
            [id.TA, unlinkedParty, unlinked],
          );
          await db.query(
            "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 100, p_idempotency_key => $3)",
            [id.TA, unlinked, randomUUID()],
          );
          expect(
            (
              await db.query(
                "select party_id from public.donors where tenant_id = $1 and profile_id = $2",
                [id.TA, unlinked],
              )
            ).rows,
          ).toEqual([{ party_id: unlinkedParty }]);
          expect(await count("parties")).toBe(parties + 1);
          expect(await count("account_links")).toBe(links);
        }));

      it("leaves the Add Partner browser insert refused (42501): signed-in users still hold no insert on donors", () =>
        tx(db, async () => {
          await db.query(fixtureSql(id));
          const result = await queryAs(
            "authenticated",
            caller(id, "UM", "mM", "TA"),
            `insert into public.donors (missionary_id, name, email, phone, type, frequency, location, status, total_given, last_gift_amount, score)
           values ('${id.UM}', 'Partner', 'partner-${id.UM}@example.test', null, 'individual', 'monthly', 'Here', 'Active', 0, 0, 70)`,
          );
          expect(result.code).toBe("42501");
          const grants = await db.query(
            "select has_table_privilege('authenticated', 'public.donors', 'INSERT') ins, has_table_privilege('authenticated', 'public.donors', 'UPDATE') upd",
          );
          expect(grants.rows).toEqual([{ ins: false, upd: false }]);
        }));

      it("two first gifts of the same person at once leave one donor and one new Party, and the donor names it", async () => {
        const tenant = randomUUID();
        const person = randomUUID();
        const first = new pg.Client({ connectionString: ADMIN_URL });
        const second = new pg.Client({ connectionString: ADMIN_URL });
        await db.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678 race', 'acc2678-race-' || $1::text)",
          [tenant],
        );
        await db.query(
          "insert into auth.users (id, email) values ($1::uuid, 'acc2678-race-' || $1::text || '@example.test')",
          [person],
        );
        try {
          await first.connect();
          await second.connect();
          const gift = (c: pg.Client) =>
            c.query(
              "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 100, p_idempotency_key => $3)",
              [tenant, person, randomUUID()],
            );
          const firstPid = await backendPid(first);
          const secondPid = await backendPid(second);
          await first.query("begin");
          await second.query("begin");
          await gift(first);
          const racing = gift(second);
          await waitsOn(db, secondPid, firstPid);
          await first.query("commit");
          await racing;
          await second.query("commit");
          const donors = await db.query(
            "select d.party_id, (select count(*) from public.parties p where p.tenant_id = $1) parties from public.donors d where d.tenant_id = $1",
            [tenant],
          );
          expect(donors.rows).toHaveLength(1);
          expect(donors.rows[0].parties).toBe("1");
          const party = await db.query(
            "select id from public.parties where tenant_id = $1",
            [tenant],
          );
          expect(donors.rows[0].party_id).toBe(party.rows[0].id);
          expect(
            (
              await db.query(
                "select count(*) n from public.account_links where tenant_id = $1",
                [tenant],
              )
            ).rows,
          ).toEqual([{ n: "0" }]);
        } finally {
          await first.end().catch(() => undefined);
          await second.end().catch(() => undefined);
          await db.query("delete from public.audit_logs where tenant_id = $1", [
            tenant,
          ]);
          await db.query(
            "delete from public.donation_saga_outbox where tenant_id = $1",
            [tenant],
          );
          await db.query("delete from public.donations where tenant_id = $1", [
            tenant,
          ]);
          await db.query("delete from public.donors where tenant_id = $1", [
            tenant,
          ]);
          await db.query("delete from public.parties where tenant_id = $1", [
            tenant,
          ]);
          await db.query("delete from authz.memberships where user_id = $1", [
            person,
          ]);
          await db.query("delete from auth.users where id = $1", [person]);
          await db.query("delete from public.tenants where id = $1", [tenant]);
        }
      });
    });

    describe("one login per profile (W5-R3, D-76)", () => {
      it("the seeded chain holds no profile whose user_id differs from its id, and none without one", async () => {
        const r = await db.query(
          "select count(*) filter (where user_id is distinct from id) n, count(*) total from public.profiles",
        );
        expect(r.rows[0].n).toBe("0");
        const column = await db.query(
          "select is_nullable from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'user_id'",
        );
        expect(column.rows).toEqual([{ is_nullable: "NO" }]);
      });

      it("the migration's preflight refuses a profile whose user_id names another login, with a count only, and rewrites nothing", () =>
        tx(db, async () => {
          const [a, b] = [randomUUID(), randomUUID()];
          await db.query("insert into auth.users (id) values ($1), ($2)", [
            a,
            b,
          ]);
          await db.query(
            "alter table public.profiles drop constraint profiles_user_id_matches_id",
          );
          await db.query("delete from public.profiles where id = $1", [b]);
          await db.query(
            "update public.profiles set user_id = $2 where id = $1",
            [a, b],
          );
          await db.query("savepoint planted");
          let error: { code?: string; message?: string } = {};
          try {
            await db.query(preflight(SPINE, "identity-keys"));
          } catch (e) {
            error = e as typeof error;
          }
          await db.query("rollback to savepoint planted");
          expect(error.code).toBe("23514");
          expect(error.message).toMatch(
            /^preflight failed: 1 profiles name another login/,
          );
          expect(error.message).not.toContain(a);
          const row = await db.query(
            "select user_id from public.profiles where id = $1",
            [a],
          );
          expect(row.rows).toEqual([{ user_id: b }]);
        }));

      it("an insert that omits user_id gets user_id = id; a divergent insert or update is refused (23514)", () =>
        tx(db, async () => {
          const [a, b] = [randomUUID(), randomUUID()];
          await db.query("insert into auth.users (id) values ($1), ($2)", [
            a,
            b,
          ]);
          await db.query("delete from public.profiles where id = $1", [a]);
          const inserted = await db.query(
            "insert into public.profiles (id, email, role, tenant_id) values ($1::uuid, 'acc2678-' || $1::text || '@example.test', 'donor', '00000000-0000-0000-0000-000000000001') returning user_id",
            [a],
          );
          expect(inserted.rows).toEqual([{ user_id: a }]);
          await db.query(
            "delete from public.profiles where id = $1 or id = $2",
            [a, b],
          );
          expect(
            await failure(
              db,
              `insert into public.profiles (id, user_id, email) values ('${a}', '${b}', 'x-${a}@example.test')`,
            ),
          ).toBe("23514");
          await db.query(
            "insert into public.profiles (id, email) values ($1::uuid, 'y-' || $1::text || '@example.test')",
            [b],
          );
          expect(
            await failure(
              db,
              `update public.profiles set user_id = '${a}' where id = '${b}'`,
            ),
          ).toBe("23514");
        }));

      it("the own-profile policy admits its owner by user_id only, and authz.caller_profile_ids() stays as AL-2675 wrote it, its id branch naming the same row under the CHECK; another login reads nothing of it", () =>
        tx(db, async () => {
          await db.query(fixtureSql(id));
          const policy = await db.query(
            "select qual from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles select own authenticated'",
          );
          expect(policy.rows).toEqual([
            { qual: "(user_id = ( SELECT auth.uid() AS uid))" },
          ]);
          const helper = await db.query(
            "select prosrc from pg_proc where oid = 'authz.caller_profile_ids()'::regprocedure",
          );
          expect(helper.rows[0].prosrc).toMatch(
            /p\.user_id = auth\.uid\(\) OR p\.id = auth\.uid\(\)/,
          );
          const helperRows = await queryAs(
            "authenticated",
            { sub: "UDA" },
            "select x::text as id from authz.caller_profile_ids() as x",
          );
          expect(helperRows.rows).toEqual([{ id: id.UDA }]);
          for (const column of ["id", "user_id"]) {
            const own = await queryAs(
              "authenticated",
              { sub: "UDA" },
              `select id from public.profiles where ${column} = '${id.UDA}'`,
            );
            expect(own.rows, column).toEqual([{ id: id.UDA }]);
            const other = await queryAs(
              "authenticated",
              { sub: "UD2" },
              `select id from public.profiles where ${column} = '${id.UDA}'`,
            );
            expect(other.code, `${column}: ${other.message}`).toBeNull();
            expect(other.rows, column).toEqual([]);
          }
        }));
    });

    describe("persons is gone (plan line 1011)", () => {
      it("no persons table, no person_id column and no person_id field policy remain, in the catalog or the manifest, which still pins the merged person-anchor file", async () => {
        const r = await db.query(`select to_regclass('public.persons') persons,
          (select count(*) from information_schema.columns where table_schema = 'public' and column_name = 'person_id') columns,
          (select count(*) from public.field_policies where field_key = 'person_id') policies`);
        expect(r.rows).toEqual([
          { persons: null, columns: "0", policies: "0" },
        ]);
        const manifest = readFileSync(
          "docs/security/field-policies/manifest.json",
          "utf8",
        );
        expect(manifest).not.toContain("person_id");
        const parsed = JSON.parse(manifest) as {
          record_types: Record<string, unknown>;
          pinned_sources: { path: string }[];
        };
        expect(parsed.record_types).not.toHaveProperty("persons");
        expect(parsed.pinned_sources.map((pin) => pin.path)).toContain(
          "supabase/migrations/20261025110000_person_anchor.sql",
        );
      });

      it("the old statements on profiles and missionaries still run", () =>
        tx(db, async () => {
          await db.query(fixtureSql(id));
          expect(
            (await db.query("select * from public.profiles limit 1")).rows,
          ).toHaveLength(1);
          const own = await queryAs(
            "authenticated",
            caller(id, "UM", "mM", "TA"),
            "select id, profile_id from public.missionaries",
          );
          expect(own.rows).toEqual([{ id: id.mA, profile_id: id.UM }]);
          const profile = await queryAs(
            "authenticated",
            { sub: "UM" },
            "select * from public.profiles",
          );
          expect(profile.rows.map((row) => row.id)).toEqual([id.UM]);
        }));

      it("the drop's preflight refuses a persons row, with counts only, and drops nothing", () =>
        tx(db, async () => {
          await db.query(`create table public.persons (tenant_id uuid, id uuid);
          alter table public.missionaries add column person_id uuid;
          alter table public.profiles add column person_id uuid;
          insert into public.persons values (null, gen_random_uuid());`);
          await db.query("savepoint persons_preflight");
          const refused = await db
            .query(preflight(PERSONS, "persons-empty"))
            .then(
              () => null,
              (e: { code?: string; message?: string }) =>
                `${e.code} ${e.message}`,
            );
          await db.query("rollback to savepoint persons_preflight");
          expect(refused).toBe(
            "55000 preflight failed: 1 persons rows, 0 missionaries and 0 profiles name a person; nothing was dropped",
          );
        }));
    });
  },
);
