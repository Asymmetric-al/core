import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, backendPid } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const BLOCKED =
  "select $2::int = any(pg_catalog.pg_blocking_pids($1::int)) as blocked";

async function blockedOrSettled(
  observer: pg.Client,
  call: Promise<unknown>,
  waiter: number,
  holder: number,
  ms = 10_000,
) {
  let settled = false;
  call.then(
    () => (settled = true),
    () => (settled = true),
  );
  const end = Date.now() + ms;
  for (;;) {
    if (settled) return false;
    const r = await observer.query(BLOCKED, [waiter, holder]);
    if (r.rows[0].blocked) return true;
    if (Date.now() > end)
      throw new Error(`backend ${waiter} neither finished nor waited`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest 2b: a worker's commands under a race (issue 2835: the stale confirm)",
  () => {
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const tenant = randomUUID();
    const staff: string[] = [];
    const opened = new Set<pg.Client & { pid: number }>();

    async function staffLogin() {
      const user = randomUUID();
      await admin.query(
        "insert into auth.users (id, email, email_confirmed_at) values ($1, $2, now())",
        [user, `wp5rest2b-staff-${user}@example.test`],
      );
      await admin.query(
        "insert into public.profiles (id, user_id) values ($1, $1) on conflict (id) do nothing",
        [user],
      );
      await admin.query("delete from authz.memberships where user_id = $1", [
        user,
      ]);
      await admin.query(
        "insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin) values ($1, $2, 'staff', 'development', true)",
        [user, tenant],
      );
      staff.push(user);
      return user;
    }

    async function worker(level: string, source: string) {
      const party = (
        await admin.query(
          "insert into public.parties (tenant_id, display_name, security_level, security_level_source) values ($1, 'Worker Fen', $2, $3) returning id",
          [tenant, level, source],
        )
      ).rows[0].id as string;
      await admin.query(
        "insert into public.missionaries (tenant_id, party_id, legal_entity_id) values ($1, $2, $1)",
        [tenant, party],
      );
      return party;
    }

    async function session(user: string) {
      const c = new pg.Client({ connectionString: ADMIN_URL });
      await c.connect();
      try {
        const open = Object.assign(c, { pid: await backendPid(c) });
        opened.add(open);
        await c.query("begin");
        await c.query("set local lock_timeout = '20s'");
        await c.query(
          `set local role authenticated;
           select set_config('request.jwt.claims', '${JSON.stringify({ sub: user, role: "authenticated" })}', true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', '${JSON.stringify({ "x-asym-tenant": tenant })}', true);`,
        );
        return open;
      } catch (error) {
        await c.end().catch(() => undefined);
        throw error;
      }
    }

    async function finish(c: pg.Client & { pid: number }) {
      await c.query("rollback").catch(() => undefined);
      await c.end().catch(() => undefined);
      opened.delete(c);
    }

    const confirm = (
      c: pg.Client,
      party: string,
      level: string,
      source: string,
    ) =>
      c
        .query(
          "select public.confirm_worker_security_level($1, $2, $3, $4, 'Reviewed') as r",
          [tenant, party, level, source],
        )
        .then(
          (r) => ({ ok: true as const, r: r.rows[0].r }),
          (e: { code?: string; message?: string }) => ({
            ok: false as const,
            code: e.code,
            message: e.message,
          }),
        );
    const lift = (c: pg.Client, party: string) =>
      c.query(
        "select public.lift_worker_restriction($1, $2, 'standard', false, 'Back home') as r",
        [tenant, party],
      );
    const state = async (party: string) =>
      (
        await admin.query(
          "select security_level, security_level_source from public.parties where id = $1",
          [party],
        )
      ).rows[0];
    const audits = async (party: string) =>
      (
        await admin.query(
          "select action from public.audit_logs where tenant_id = $1 and resource_id = $2 order by created_at, id",
          [tenant, party],
        )
      ).rows.map((row) => row.action as string);

    beforeAll(async () => {
      await admin.connect();
      await admin.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp5rest2b commands', 'wp5rest2b-commands-' || $1::text)",
        [tenant],
      );
      await admin.query(
        "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'L', 'US', 'usd', 'L')",
        [tenant],
      );
    });

    afterAll(async () => {
      try {
        for (const c of opened) {
          await admin
            .query("select pg_catalog.pg_terminate_backend($1)", [c.pid])
            .catch(() => undefined);
          await c.end().catch(() => undefined);
        }
        await admin.query(
          "delete from private.party_restricted where tenant_id = $1",
          [tenant],
        );
        for (const table of [
          "audit_logs",
          "missionaries",
          "parties",
          "legal_entities",
        ])
          await admin.query(
            `delete from public.${table} where tenant_id = $1`,
            [tenant],
          );
        await admin.query(
          "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
          [tenant, staff],
        );
        await admin.query("delete from public.tenants where id = $1", [tenant]);
        await admin.query("delete from auth.users where id = any($1::uuid[])", [
          staff,
        ]);
      } finally {
        await admin.end();
      }
    });

    it("a confirm prepared at sensitive and unreviewed that runs after a lift to standard has committed writes nothing and answers that the level changed (red: no entry takes the expected level and source)", async () => {
      const [first, second] = [await staffLogin(), await staffLogin()];
      const party = await worker("sensitive", "unreviewed_default");
      const lifter = await session(second);
      try {
        await lift(lifter, party);
        await lifter.query("commit");
      } finally {
        await finish(lifter);
      }
      const before = await audits(party);
      const confirmer = await session(first);
      try {
        const answer = await confirm(
          confirmer,
          party,
          "sensitive",
          "unreviewed_default",
        );
        await confirmer.query("commit").catch(() => undefined);
        expect(answer).toMatchObject({
          ok: false,
          code: "22023",
          message: "The level changed since it was read",
        });
      } finally {
        await finish(confirmer);
      }
      expect(await state(party)).toEqual({
        security_level: "standard",
        security_level_source: "manual",
      });
      expect(await audits(party)).toEqual(before);
    });

    it("two sessions: a confirm sent while a lift holds the worker waits for it, then writes nothing and answers that the level changed (red: no entry takes the expected level and source)", async () => {
      const [first, second] = [await staffLogin(), await staffLogin()];
      const party = await worker("sensitive", "unreviewed_default");
      const lifter = await session(second);
      let confirmer: (pg.Client & { pid: number }) | undefined;
      let pending: Promise<unknown> | undefined;
      try {
        await lift(lifter, party);
        confirmer = await session(first);
        pending = confirm(confirmer, party, "sensitive", "unreviewed_default");
        const waited = await blockedOrSettled(
          admin,
          pending,
          confirmer.pid,
          lifter.pid,
        );
        await lifter.query("commit");
        expect(await pending).toMatchObject({
          ok: false,
          code: "22023",
          message: "The level changed since it was read",
        });
        expect(waited).toBe(true);
      } finally {
        await finish(lifter);
        await pending?.catch(() => undefined);
        if (confirmer) await finish(confirmer);
      }
      expect(await state(party)).toEqual({
        security_level: "standard",
        security_level_source: "manual",
      });
    });

    const create = (
      c: pg.Client,
      fields: {
        display?: string;
        legal?: string;
        level?: string | null;
        alias?: string | null;
        entity?: string | null;
        reason?: string;
        tenantId?: string;
      } = {},
    ) =>
      c
        .query(
          "select public.create_worker($1, $2, $3, null, null, $4, $5, $6, $7) as r",
          [
            fields.tenantId ?? tenant,
            fields.display ?? "Worker Heron",
            fields.legal ?? "Legal Heron",
            fields.level ?? null,
            fields.alias ?? null,
            fields.entity ?? null,
            fields.reason ?? "New field worker",
          ],
        )
        .then(
          (r) => ({
            ok: true as const,
            r: r.rows[0].r as Record<string, unknown>,
          }),
          (e: { code?: string; message?: string }) => ({
            ok: false as const,
            code: e.code,
            message: e.message,
          }),
        );
    const counts = async () =>
      (
        await admin.query(
          `select (select count(*) from public.parties where tenant_id = $1)::int parties,
                  (select count(*) from public.missionaries where tenant_id = $1)::int workers,
                  (select count(*) from private.party_restricted where tenant_id = $1)::int identities,
                  (select count(*) from public.audit_logs where tenant_id = $1)::int audits`,
          [tenant],
        )
      ).rows[0];

    it("create_worker with no level makes one Party and one worker with no login at standard, unreviewed, under the organization's only legal entity, with two audit rows (worker_created, then worker_identity_set), raises the unreviewed signal, answers no legal name, and a confirm at standard clears the signal (red: no create_worker)", async () => {
      const user = await staffLogin();
      const before = await counts();
      const c = await session(user);
      let made: Awaited<ReturnType<typeof create>>;
      try {
        made = await create(c);
        await c.query("commit");
      } finally {
        await finish(c);
      }
      expect(made.ok, JSON.stringify(made)).toBe(true);
      const answer = (made as { r: Record<string, unknown> }).r;
      expect(JSON.stringify(answer)).not.toContain("Legal Heron");
      const party = answer.party_id as string;
      expect(
        (
          await admin.query(
            "select p.display_name, p.security_level, p.security_level_source, m.profile_id, m.legal_entity_id, m.id = $2 same from public.parties p join public.missionaries m on m.party_id = p.id where p.id = $1",
            [party, answer.assignment_id],
          )
        ).rows,
      ).toEqual([
        {
          display_name: "Worker Heron",
          security_level: "standard",
          security_level_source: "unreviewed_default",
          profile_id: null,
          legal_entity_id: tenant,
          same: true,
        },
      ]);
      expect(await audits(party)).toEqual([
        "worker_created",
        "worker_identity_set",
      ]);
      const after = await counts();
      expect(after).toEqual({
        parties: before.parties + 1,
        workers: before.workers + 1,
        identities: before.identities + 1,
        audits: before.audits + 2,
      });
      const c2 = await session(user);
      try {
        expect(
          (
            await c2.query(
              "select count(*)::int n from public.unreviewed_worker_security_levels() u where u.party_id = $1",
              [party],
            )
          ).rows[0].n,
        ).toBe(1);
        expect(
          await confirm(c2, party, "standard", "unreviewed_default"),
        ).toMatchObject({ ok: true });
        expect(
          (
            await c2.query(
              "select count(*)::int n from public.unreviewed_worker_security_levels() u where u.party_id = $1",
              [party],
            )
          ).rows[0].n,
        ).toBe(0);
        await c2.query("commit");
      } finally {
        await finish(c2);
      }
    });

    it("create_worker refuses, writing nothing: a display name, legal name or reason that is blank by the safety normalization; another organization's legal entity; two legal entities and none named; staff without the capability; staff of another organization naming this one (red: no create_worker)", async () => {
      const user = await staffLogin();
      const other = randomUUID();
      await admin.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp5rest2b other', 'wp5rest2b-other-' || $1::text)",
        [other],
      );
      await admin.query(
        "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'O', 'US', 'usd', 'O')",
        [other],
      );
      try {
        const cases: [string, Parameters<typeof create>[1], string][] = [
          ["blank display name", { display: "​  " }, "22023"],
          ["blank legal name", { legal: "⁠﻿" }, "22023"],
          ["blank reason", { reason: " ​" }, "22023"],
          ["another organization's legal entity", { entity: other }, "P0002"],
        ];
        for (const [label, fields, code] of cases) {
          const before = await counts();
          const c = await session(user);
          try {
            const answer = await create(c, fields);
            expect(answer, label).toMatchObject({ ok: false, code });
          } finally {
            await finish(c);
          }
          expect(await counts(), label).toEqual(before);
        }
        const second = randomUUID();
        await admin.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $2, 'L2', 'US', 'usd', 'L2')",
          [second, tenant],
        );
        try {
          const before = await counts();
          const c = await session(user);
          try {
            expect(await create(c)).toMatchObject({
              ok: false,
              code: "22023",
              message: "Name the legal entity",
            });
          } finally {
            await finish(c);
          }
          expect(await counts()).toEqual(before);
        } finally {
          await admin.query("delete from public.legal_entities where id = $1", [
            second,
          ]);
        }
        const plain = await staffLogin();
        await admin.query(
          "update authz.memberships set is_tenant_admin = false, staff_role = 'member_care' where user_id = $1",
          [plain],
        );
        const outsider = randomUUID();
        await admin.query(
          "insert into auth.users (id, email, email_confirmed_at) values ($1, $2, now())",
          [outsider, `wp5rest2b-outsider-${outsider}@example.test`],
        );
        await admin.query(
          "insert into public.profiles (id, user_id) values ($1, $1) on conflict (id) do nothing",
          [outsider],
        );
        staff.push(outsider);
        await admin.query("delete from authz.memberships where user_id = $1", [
          outsider,
        ]);
        await admin.query(
          "insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin) values ($1, $2, 'staff', 'development', true)",
          [outsider, other],
        );
        for (const who of [plain, outsider]) {
          const before = await counts();
          const c = await session(who);
          try {
            expect(await create(c)).toMatchObject({ ok: false, code: "42501" });
          } finally {
            await finish(c);
          }
          expect(await counts()).toEqual(before);
        }
      } finally {
        await admin.query(
          "delete from authz.memberships where tenant_id = $1",
          [other],
        );
        await admin.query(
          "delete from public.legal_entities where tenant_id = $1",
          [other],
        );
        await admin.query("delete from public.tenants where id = $1", [other]);
      }
    });

    it("two sessions: a create whose caller lost the capability in a change committed first is refused 42501 and writes nothing (red: no create_worker)", async () => {
      const user = await staffLogin();
      const before = await counts();
      const changer = new pg.Client({ connectionString: ADMIN_URL });
      await changer.connect();
      const c = await session(user);
      try {
        await changer.query("begin");
        await changer.query(
          "update authz.memberships set is_tenant_admin = false, staff_role = 'member_care' where user_id = $1 and tenant_id = $2",
          [user, tenant],
        );
        await changer.query("commit");
        expect(await create(c)).toMatchObject({ ok: false, code: "42501" });
      } finally {
        await changer.end();
        await finish(c);
      }
      expect(await counts()).toEqual(before);
    });

    it("a confirm whose level and source are as read marks the level reviewed, with the confirm's one audit row (guard)", async () => {
      const user = await staffLogin();
      const party = await worker("sensitive", "unreviewed_default");
      const c = await session(user);
      try {
        const answer = await confirm(
          c,
          party,
          "sensitive",
          "unreviewed_default",
        );
        expect(answer.ok, JSON.stringify(answer)).toBe(true);
        await c.query("commit");
      } finally {
        await finish(c);
      }
      expect(await state(party)).toEqual({
        security_level: "sensitive",
        security_level_source: "manual",
      });
      expect(await audits(party)).toHaveLength(1);
    });
  },
);
