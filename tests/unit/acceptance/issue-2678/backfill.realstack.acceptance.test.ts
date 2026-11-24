import { spawnSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, MIG, migration } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const KEYS = migration("_tenant_keys_on_activity_tables");
const SPINE = migration("_parties_account_links_and_own_rows");
const SET_ASIDE = "no single organization by membership or missionary evidence";

function body(file: string) {
  const text = readFileSync(file, "utf8");
  const start = text.search(/^BEGIN;$/m);
  const end = text.lastIndexOf("\nCOMMIT;");
  if (start < 0 || end < start)
    throw new Error(`${file} has no BEGIN; ... COMMIT; block`);
  return text.slice(start + "BEGIN;".length, end);
}

function psql(url: string, file: string) {
  return spawnSync(
    "psql",
    ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", url, "-f", file],
    { encoding: "utf8" },
  );
}

describe.skipIf(!ADMIN_URL)(
  "AL-2678 the backfills of 050000 and 050100, run on the chain just before them, each case rolled back (review findings A1 and A4)",
  () => {
    const name = `acc2678_backfill_${randomBytes(4).toString("hex")}`;
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    let db: pg.Client | undefined;
    const TA = randomUUID();
    const TB = randomUUID();

    beforeAll(async () => {
      await admin.connect();
      await admin.query(`create database ${name}`);
      const url = Object.assign(new URL(ADMIN_URL!), {
        pathname: `/${name}`,
      }).toString();
      const first = path.basename(KEYS);
      const files = [
        "scripts/sql/supabase-compat-bootstrap.sql",
        ...readdirSync(MIG)
          .filter((f) => /^\d{14}_.*\.sql$/.test(f) && f < first)
          .sort()
          .map((f) => `${MIG}/${f}`),
      ];
      for (const f of files) {
        const r = psql(url, f);
        expect(r.status, `${f}: ${r.stderr}`).toBe(0);
      }
      db = new pg.Client({ connectionString: url });
      await db.connect();
    }, 900_000);

    afterAll(async () => {
      await db?.end();
      await admin.query(`drop database if exists ${name} with (force)`);
      await admin.end();
    });

    const q = (sql: string, params: unknown[] = []) => db!.query(sql, params);

    async function rolledBack(fn: () => Promise<void>) {
      await q("begin");
      try {
        await q(
          `insert into public.tenants (id, name, slug) values ($1::uuid, 'backfill A', 'acc2678-bf-' || $1::text), ($2::uuid, 'backfill B', 'acc2678-bf-' || $2::text)`,
          [TA, TB],
        );
        await q(
          `insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'A', 'US', 'usd', 'A'), ($2, $2, 'B', 'US', 'usd', 'B')`,
          [TA, TB],
        );
        await fn();
      } finally {
        await q("rollback");
      }
    }

    async function attempt(sql: string) {
      await q("savepoint attempt");
      try {
        await q(sql);
        await q("release savepoint attempt");
        return null;
      } catch (e) {
        await q("rollback to savepoint attempt");
        return e as { code?: string; message?: string };
      }
    }

    async function login(user: string) {
      await q(
        "insert into auth.users (id, email, email_confirmed_at) values ($1::uuid, 'acc2678-bf-' || $1::text || '@example.test', now())",
        [user],
      );
      await q("delete from authz.memberships where user_id = $1", [user]);
      return user;
    }

    async function member(user: string, ...tenants: string[]) {
      for (const tenant of tenants)
        await q(
          "insert into authz.memberships (user_id, tenant_id, role, is_active) values ($1, $2, 'missionary', true)",
          [user, tenant],
        );
    }

    async function missionaryRow(user: string, tenant: string) {
      await q(
        "insert into public.missionaries (tenant_id, profile_id, legal_entity_id) values ($1, $2, $1)",
        [tenant, user],
      );
    }

    async function donorlessTask(user: string) {
      const task = randomUUID();
      await q(
        "insert into public.missionary_tasks (id, missionary_id, title) values ($1, $2, 'donorless')",
        [task, user],
      );
      return task;
    }

    async function placement(task: string) {
      const placed = await q(
        "select tenant_id from public.missionary_tasks where id = $1",
        [task],
      );
      const aside = await q(
        "select set_aside_reason from private.missionary_tasks_unresolved_tenant where id = $1",
        [task],
      );
      return {
        placed: placed.rows.map((r) => r.tenant_id),
        aside: aside.rows.map((r) => r.set_aside_reason),
      };
    }

    async function nothingWrittenBy050000() {
      const r = await q(
        `select to_regclass('private.missionary_tasks_unresolved_tenant') is null no_table,
                not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name in ('donor_activities', 'follower_requests', 'missionary_tasks') and column_name = 'tenant_id') no_column`,
      );
      return r.rows[0];
    }

    it("F-A1: a donorless task of a profile whose user_id is still NULL, with memberships in two organizations and a missionary row in one, is set aside, not placed", () =>
      rolledBack(async () => {
        const u = await login(randomUUID());
        await q("update public.profiles set user_id = null where id = $1", [u]);
        await member(u, TA, TB);
        await missionaryRow(u, TA);
        const task = await donorlessTask(u);
        await q(body(KEYS));
        expect(await placement(task)).toEqual({
          placed: [],
          aside: [SET_ASIDE],
        });
      }));

    it("F-A1: a donorless task of a profile whose user_id is still NULL, with one membership and no missionary row, is placed in that organization, not set aside", () =>
      rolledBack(async () => {
        const u = await login(randomUUID());
        await q("update public.profiles set user_id = null where id = $1", [u]);
        await member(u, TA);
        const task = await donorlessTask(u);
        await q(body(KEYS));
        expect(await placement(task)).toEqual({ placed: [TA], aside: [] });
      }));

    it("F-A1: a profile whose user_id names another login is refused by 050000's preflight, with a count only, before anything is written", () =>
      rolledBack(async () => {
        const u = await login(randomUUID());
        const v = await login(randomUUID());
        await q("delete from public.profiles where id = $1", [v]);
        await q("update public.profiles set user_id = $2 where id = $1", [
          u,
          v,
        ]);
        await member(v, TA, TB);
        await missionaryRow(u, TA);
        await donorlessTask(u);
        const error = await attempt(body(KEYS));
        expect(error?.code).toBe("23514");
        expect(error?.message).toBe(
          "preflight failed: 1 profiles name another login in user_id than their id; nothing was changed",
        );
        expect(await nothingWrittenBy050000()).toEqual({
          no_table: true,
          no_column: true,
        });
      }));

    it("050000's preflight counts follower requests and tasks that name no tenant by evidence, with counts only, and writes nothing", () =>
      rolledBack(async () => {
        const none = await login(randomUUID());
        const two = await login(randomUUID());
        await missionaryRow(two, TA);
        await missionaryRow(two, TB);
        const stray = randomUUID();
        await q(
          "insert into public.donors (id, name, email) values ($1::uuid, 'No tenant', 'acc2678-bf-stray-' || $1::text || '@example.test')",
          [stray],
        );
        await q(
          "insert into public.follower_requests (donor_id, missionary_id) values ($1, $2), (null, $2), (null, $3)",
          [stray, none, two],
        );
        await q(
          "insert into public.missionary_tasks (missionary_id, donor_id, title) values ($1, $2, 'stray donor')",
          [two, stray],
        );
        const error = await attempt(body(KEYS));
        expect(error?.code).toBe("23502");
        expect(error?.message).toBe(
          "preflight failed: 0 donor activities, 3 follower requests and 1 tasks name no tenant by evidence; nothing was changed",
        );
        expect(await nothingWrittenBy050000()).toEqual({
          no_table: true,
          no_column: true,
        });
      }));

    it("050000 places a task with a donor in the donor's organization, a donorless task with one organization by evidence there, and sets aside one with two", () =>
      rolledBack(async () => {
        const one = await login(randomUUID());
        await member(one, TA);
        await missionaryRow(one, TA);
        const both = await login(randomUUID());
        await member(both, TA, TB);
        const donor = randomUUID();
        await q(
          "insert into public.donors (id, tenant_id, name, email) values ($1::uuid, $2, 'In B', 'acc2678-bf-b-' || $1::text || '@example.test')",
          [donor, TB],
        );
        const withDonor = randomUUID();
        await q(
          "insert into public.missionary_tasks (id, missionary_id, donor_id, title) values ($1, $2, $3, 'with donor')",
          [withDonor, one, donor],
        );
        const single = await donorlessTask(one);
        const ambiguous = await donorlessTask(both);
        await q(body(KEYS));
        expect(await placement(withDonor)).toEqual({ placed: [TB], aside: [] });
        expect(await placement(single)).toEqual({ placed: [TA], aside: [] });
        expect(await placement(ambiguous)).toEqual({
          placed: [],
          aside: [SET_ASIDE],
        });
      }));

    it("050100's preflight refuses a (tenant, profile) pair with two missionary rows, with a count only, and writes nothing", () =>
      rolledBack(async () => {
        const u = await login(randomUUID());
        await missionaryRow(u, TA);
        await missionaryRow(u, TA);
        await q(body(KEYS));
        const error = await attempt(body(SPINE));
        expect(error?.code).toBe("23505");
        expect(error?.message).toBe(
          "preflight failed: 1 (tenant, profile) pairs name more than one missionary row; nothing was changed",
        );
        expect(
          (
            await q(
              "select to_regclass('public.parties') is null no_parties, to_regclass('public.account_links') is null no_links",
            )
          ).rows,
        ).toEqual([{ no_parties: true, no_links: true }]);
      }));

    it("050100's backfill keeps two donors of one name on distinct Parties, gives a person who is donor and missionary one Party and one link, and leaves a donor with no organization alone", () =>
      rolledBack(async () => {
        const person = await login(randomUUID());
        await q(
          "update public.profiles set display_name = 'Both Roles' where id = $1",
          [person],
        );
        await missionaryRow(person, TA);
        const [dup1, dup2, own, orphan] = [
          randomUUID(),
          randomUUID(),
          randomUUID(),
          randomUUID(),
        ];
        await q(
          `insert into public.donors (id, tenant_id, profile_id, name, email) values
             ($1, $5, null, 'Same Name', 'acc2678-bf-dup-1@example.test'),
             ($2, $5, null, 'Same Name', 'acc2678-bf-dup-2@example.test'),
             ($3, $5, $6, 'Both Roles', 'acc2678-bf-both@example.test'),
             ($4, null, null, 'No tenant', 'acc2678-bf-orphan@example.test')`,
          [dup1, dup2, own, orphan, TA, person],
        );
        await q(body(KEYS));
        await q(body(SPINE));
        const donors = await q(
          "select id, party_id from public.donors where id = any($1::uuid[])",
          [[dup1, dup2, own, orphan]],
        );
        expect(donors.rows, "all four donor rows remain").toHaveLength(4);
        const party = Object.fromEntries(
          donors.rows.map((r) => [r.id, r.party_id]),
        );
        expect(typeof party[dup1]).toBe("string");
        expect(typeof party[dup2]).toBe("string");
        expect(party[dup1]).not.toBe(party[dup2]);
        expect(party[orphan]).toBeNull();
        const missionary = await q(
          "select party_id from public.missionaries where tenant_id = $1 and profile_id = $2",
          [TA, person],
        );
        expect(missionary.rows).toEqual([{ party_id: party[own] }]);
        expect(
          (
            await q(
              "select tenant_id, display_name from public.parties where id = $1",
              [party[own]],
            )
          ).rows,
        ).toEqual([{ tenant_id: TA, display_name: "Both Roles" }]);
        expect(
          (
            await q(
              "select count(*)::int n from public.parties where tenant_id = $1",
              [TA],
            )
          ).rows,
        ).toEqual([{ n: 3 }]);
        expect(
          (
            await q(
              "select user_id, party_id, linked_via from public.account_links where tenant_id = any($1::uuid[])",
              [[TA, TB]],
            )
          ).rows,
        ).toEqual([
          {
            user_id: person,
            party_id: party[own],
            linked_via: "profile_backfill",
          },
        ]);
      }));
  },
);
