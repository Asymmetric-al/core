import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

const ACTIVITY_TITLES: readonly [string, string][] = [
  ["video_call", "Video Call"],
  ["in_person_visit", "In-Person Visit"],
  ["check_in", "Check-in"],
  ["pastoral_note", "Pastoral Note"],
  ["care_plan_update", "Care Plan Update"],
  ["crisis_intervention", "Crisis Intervention"],
  ["birthday", "Birthday"],
  ["prayer_request", "Prayer Request"],
];

const CARE_TABLES = [
  "member_care_activities",
  "member_care_goals",
  "member_care_requirements",
  "member_care_private_notes",
] as const;

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "requires TENANT_GUARD_IT_ADMIN_DATABASE_URL in the migrate job",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2677 WP4b part 1: member care RLS, directory reader, care commands, and locks (real stack) (D-18, AL-2678: each fixture missionary names its own Party, as the identity-key migration requires, and the lock fixture removes its Party with its tenant)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const extra = {
      UCARE2: randomUUID(),
      mCare2: randomUUID(),
      UBACKSTAFF: randomUUID(),
      UBACKADM: randomUUID(),
      USUPER: randomUUID(),
      UEMPTYNAME: randomUUID(),
      mEmptyName: randomUUID(),
      mA1: randomUUID(),
      mA2: randomUUID(),
      mANoProfile: randomUUID(),
      mB1: randomUUID(),
      goalA1: randomUUID(),
      goalA2: randomUUID(),
      goalB1: randomUUID(),
      reqA1: randomUUID(),
      reqA2: randomUUID(),
      reqB1: randomUUID(),
      actA1: randomUUID(),
      actB1: randomUUID(),
      noteA1: randomUUID(),
      noteB1: randomUUID(),
    };
    const allIds: Record<string, string> = { ...id, ...extra };
    const as = asRole(db, allIds);
    const scope = (tenantKey: "TA" | "TB", assignmentId: string) => ({
      "x-asym-tenant": allIds[tenantKey]!,
      "x-asym-assignment": assignmentId,
    });

    async function asPersist(
      role: string,
      caller: { sub: string | null; headers?: Record<string, string> },
      sql: string,
    ) {
      await db.query("savepoint persist_step");
      try {
        await db.query(`set local role ${role}`);
        const subId = caller.sub ? (allIds[caller.sub] ?? caller.sub) : null;
        await db.query(
          `select set_config('request.jwt.claims', $1, true),
                  set_config('request.jwt.claim.sub', $2, true),
                  set_config('request.headers', $3, true)`,
          [
            subId ? JSON.stringify({ sub: subId, role }) : "",
            subId ?? "",
            caller.headers ? JSON.stringify(caller.headers) : "",
          ],
        );
        const r = await db.query(sql);
        await db.query("reset role");
        await db.query("release savepoint persist_step");
        return {
          code: null as string | null,
          message: "",
          rows: r.rows as Record<string, unknown>[],
        };
      } catch (error) {
        await db.query("rollback to savepoint persist_step");
        const err = error as { code?: string; message?: string };
        return {
          code: err.code ?? "ERROR",
          message: err.message ?? String(error),
          rows: [] as Record<string, unknown>[],
        };
      }
    }

    beforeAll(async () => {
      await db.connect();
    });

    afterAll(async () => {
      await db.end();
    });

    async function seedCareFixture() {
      await db.query(fixtureSql(id));
      await db.query(
        `insert into auth.users (id) values ($1), ($2), ($3), ($4), ($5)`,
        [
          extra.UCARE2,
          extra.UBACKSTAFF,
          extra.UBACKADM,
          extra.USUPER,
          extra.UEMPTYNAME,
        ],
      );
      await db.query(
        `delete from authz.memberships where user_id = any($1::uuid[])`,
        [
          [
            extra.UCARE2,
            extra.UBACKSTAFF,
            extra.UBACKADM,
            extra.USUPER,
            extra.UEMPTYNAME,
          ],
        ],
      );
      await db.query(
        `update public.profiles set display_name = 'Second Care Worker' where user_id = $1`,
        [extra.UCARE2],
      );
      await db.query(
        `update public.profiles set display_name = '   ', full_name = null, first_name = null, last_name = null where user_id = $1`,
        [extra.UEMPTYNAME],
      );
      await db.query(
        `update public.profiles set tenant_id = $1, role = 'staff', display_name = 'Backfilled Staff' where user_id = $2`,
        [id.TA, extra.UBACKSTAFF],
      );
      await db.query(
        `update public.profiles set tenant_id = $1, role = 'admin', display_name = 'Backfilled Admin' where user_id = $2`,
        [id.TA, extra.UBACKADM],
      );
      await db.query(
        `update public.profiles set tenant_id = $1, role = 'super_admin', display_name = 'Legacy Super Admin' where user_id = $2`,
        [id.TA, extra.USUPER],
      );
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values
          ($1, $2, $3, 'staff', 'member_care', false, true),
          ($4, $5, $3, 'staff', 'member_care', false, true)`,
        [extra.mCare2, extra.UCARE2, id.TA, extra.mEmptyName, extra.UEMPTYNAME],
      );
      await db.query(
        `with profile_class as (
           select
             p.user_id,
             t.id as tenant_id,
             case p.role
               when 'donor' then 'donor'
               when 'missionary' then 'missionary'
               else 'staff'
             end::authz.membership_role as role,
             p.role in ('admin', 'super_admin') as is_tenant_admin
           from public.profiles as p
           join auth.users as login on login.id = p.user_id
           join public.tenants as t on t.id = p.tenant_id
           where p.user_id = any($1::uuid[])
             and p.role in ('donor', 'missionary', 'staff', 'admin', 'super_admin')
             and (pg_catalog.to_jsonb(login) ->> 'deleted_at') is null
         )
         insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin)
         select
           pc.user_id,
           pc.tenant_id,
           pc.role,
           case when pc.role = 'staff' then 'development'::authz.staff_role end,
           pc.is_tenant_admin
         from profile_class as pc
         where not exists (
           select 1
             from authz.memberships as m
            where m.user_id = pc.user_id
              and m.tenant_id = pc.tenant_id
              and m.role = pc.role
         )`,
        [[extra.UBACKSTAFF, extra.UBACKADM, extra.USUPER]],
      );
      await db.query(
        `insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'Entity A', 'US', 'usd', 'Entity A'), ($2, $2, 'Entity B', 'US', 'usd', 'Entity B')`,
        [id.TA, id.TB],
      );
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Fixture'), ($3, $2, 'Fixture'), ($4, $2, 'Fixture'), ($5, $6, 'Fixture')",
        [extra.mA1, id.TA, extra.mA2, extra.mANoProfile, extra.mB1, id.TB],
      );
      await db.query(
        `insert into public.missionaries (id, tenant_id, profile_id, legal_entity_id, location, timezone, health_status, manual_attention, region, mission_field, health_signals, created_at, party_id) values
          ($1, $2, $3, $2, 'Chiang Mai', 'Asia/Bangkok', 'at_risk', true, 'SE Asia', 'Church Planting', '{"emotional":40,"spiritual":70,"physical":60,"financial":50}'::jsonb, '2026-10-03T00:00:00Z', $1),
          ($4, $2, $5, $2, 'Nairobi', 'Africa/Nairobi', 'healthy', false, 'Africa', 'Education', '{"emotional":80,"spiritual":80,"physical":80,"financial":80}'::jsonb, '2026-10-02T00:00:00Z', $4),
          ($6, $2, null, $2, 'Lima', 'America/Lima', 'needs_attention', false, 'Latin America', 'Medical', '{"emotional":55,"spiritual":65,"physical":60,"financial":45}'::jsonb, '2026-10-01T00:00:00Z', $6),
          ($7, $8, $9, $8, 'Lisbon', 'Europe/Lisbon', 'crisis', true, 'Europe', 'Youth', '{"emotional":20,"spiritual":30,"physical":40,"financial":50}'::jsonb, '2026-10-04T00:00:00Z', $7)`,
        [
          extra.mA1,
          id.TA,
          id.UDEV,
          extra.mA2,
          id.UDON,
          extra.mANoProfile,
          extra.mB1,
          id.TB,
          id.UB,
        ],
      );
      await db.query(
        `insert into public.member_care_activities (id, tenant_id, missionary_id, author_user_id, author_name_snapshot, type, title, description) values
          ($1, $2, $3, $4, 'Avery Finance-Care', 'check_in', 'Check-in', 'Tenant A activity'),
          ($5, $6, $7, $8, 'Finley Bravo', 'check_in', 'Check-in', 'Tenant B activity')`,
        [
          extra.actA1,
          id.TA,
          extra.mA1,
          id.UFC,
          extra.actB1,
          id.TB,
          extra.mB1,
          id.UB,
        ],
      );
      await db.query(
        `insert into public.member_care_goals (id, tenant_id, missionary_id, title, status, updated_by) values
          ($1, $2, $3, 'Goal A1', 'active', $4),
          ($5, $2, $6, 'Goal A2', 'pending', $4),
          ($7, $8, $9, 'Goal B1', 'active', $10)`,
        [
          extra.goalA1,
          id.TA,
          extra.mA1,
          id.UFC,
          extra.goalA2,
          extra.mA2,
          extra.goalB1,
          id.TB,
          extra.mB1,
          id.UB,
        ],
      );
      await db.query(
        `insert into public.member_care_requirements (id, tenant_id, missionary_id, activity_type, interval_days, notes, updated_by) values
          ($1, $2, $3, 'check_in', 30, 'Monthly check-in', $4),
          ($5, $2, $6, 'video_call', 60, 'Bi-monthly call', $4),
          ($7, $8, $9, 'check_in', 14, 'Tenant B cadence', $10)`,
        [
          extra.reqA1,
          id.TA,
          extra.mA1,
          id.UFC,
          extra.reqA2,
          extra.mA2,
          extra.reqB1,
          id.TB,
          extra.mB1,
          id.UB,
        ],
      );
      await db.query(
        `insert into public.member_care_private_notes (id, tenant_id, missionary_id, author_user_id, author_name_snapshot, content) values
          ($1, $2, $3, $4, 'Avery Finance-Care', 'Private A note'),
          ($5, $6, $7, $8, 'Finley Bravo', 'Private B note')`,
        [
          extra.noteA1,
          id.TA,
          extra.mA1,
          id.UFC,
          extra.noteB1,
          id.TB,
          extra.mB1,
          id.UB,
        ],
      );
    }

    async function tx(fn: () => Promise<void>) {
      await db.query("begin");
      try {
        await seedCareFixture();
        await fn();
      } finally {
        await db.query("rollback");
      }
    }

    async function membershipOf(userId: string) {
      const r = await db.query(
        `select id, staff_role, is_tenant_admin from authz.memberships where user_id = $1 and tenant_id = $2 and is_active and revoked_at is null`,
        [userId, id.TA],
      );
      expect(r.rows).toHaveLength(1);
      return r.rows[0] as {
        id: string;
        staff_role: string;
        is_tenant_admin: boolean;
      };
    }

    async function scopedAuditCounts(
      client: pg.Client,
      scopeFilter: {
        tenantIds: readonly string[];
        actorIds: readonly string[];
        resourceIds: readonly string[];
        since: string;
        sentinelPrefix?: string;
      },
    ) {
      const sentinelPattern = scopeFilter.sentinelPrefix
        ? `%${scopeFilter.sentinelPrefix}%`
        : null;
      const r = await client.query<{ audit_count: number; cmd_count: number }>(
        `select
           (select count(*)::int
              from public.audit_logs
             where (created_at is null or created_at >= $4::timestamptz)
               and (
                 tenant_id = any($1::uuid[])
                 or user_id = any($2::uuid[])
                 or resource_id = any($3::text[])
                 or ($5::text is not null and details::text like $5::text)
               )) as audit_count,
           (select count(*)::int
              from public.crm_command_logs
             where created_at >= $4::timestamptz
               and (
                 tenant_id = any($1::uuid[])
                 or actor_user_id = any($2::uuid[])
                 or resource_id = any($3::text[])
                 or (
                   $5::text is not null
                   and (
                     command_payload::text like $5::text
                     or result_summary::text like $5::text
                   )
                 )
               )) as cmd_count`,
        [
          [...scopeFilter.tenantIds],
          [...scopeFilter.actorIds],
          [...scopeFilter.resourceIds],
          scopeFilter.since,
          sentinelPattern,
        ],
      );
      return r.rows[0]!;
    }

    it("narrows all four member_care_* SELECT policies to member_care, drops is_super_admin, and keeps init-plan parallel-safe form", () =>
      tx(async () => {
        const policies = await db.query(
          `select c.relname as tbl, p.polname, pg_get_expr(p.polqual, p.polrelid) as qual
             from pg_policy p join pg_class c on c.oid = p.polrelid
            where c.relnamespace = 'public'::regnamespace
              and c.relname = any($1::text[])
              and p.polroles && array['authenticated'::regrole::oid]
            order by 1, 2`,
          [[...CARE_TABLES]],
        );
        expect(policies.rows).toHaveLength(4);
        for (const row of policies.rows as {
          tbl: string;
          polname: string;
          qual: string;
        }[]) {
          expect(row.qual, row.tbl).not.toMatch(/is_super_admin/i);
          expect(row.qual, row.tbl).toContain("authz.current_tenant_id()");
          expect(row.qual, row.tbl).toContain("member_care");
          if (row.tbl === "member_care_private_notes") {
            expect(row.qual).toContain("authz.current_user_id()");
          }
        }

        const backStaff = await membershipOf(extra.UBACKSTAFF);
        const backAdm = await membershipOf(extra.UBACKADM);
        const backSuper = await membershipOf(extra.USUPER);
        expect(backStaff.staff_role).toBe("development");
        expect(backStaff.is_tenant_admin).toBe(false);
        expect(backAdm.staff_role).toBe("development");
        expect(backAdm.is_tenant_admin).toBe(true);
        expect(backSuper.staff_role).toBe("development");
        expect(backSuper.is_tenant_admin).toBe(true);

        const deniedCallers: [string, Record<string, string> | undefined][] = [
          ["UFC", scope("TA", id.mFin!)],
          ["UADM", scope("TA", id.mAdm!)],
          ["UDEV", scope("TA", id.mDev!)],
          ["UDON", scope("TA", id.mDonA!)],
          ["UB", scope("TB", id.mB!)],
          ["UBACKSTAFF", scope("TA", backStaff.id)],
          ["UBACKADM", scope("TA", backAdm.id)],
          ["USUPER", scope("TA", backSuper.id)],
          ["USUPER", undefined],
        ];

        for (const tbl of CARE_TABLES) {
          for (const [sub, headers] of deniedCallers) {
            const r = await as(
              "authenticated",
              { sub, headers },
              `select count(*)::int as n from public.${tbl}`,
            );
            expect(r.code, `${tbl} ${sub}`).toBeNull();
            expect(r.rows[0]!.n, `${tbl} ${sub}`).toBe(0);
          }

          const careRead = await as(
            "authenticated",
            { sub: "UFC", headers: scope("TA", id.mCare!) },
            `select id, tenant_id from public.${tbl}`,
          );
          expect(careRead.code, tbl).toBeNull();
          const expectedCount =
            tbl === "member_care_goals" || tbl === "member_care_requirements"
              ? 2
              : 1;
          expect(careRead.rows, tbl).toHaveLength(expectedCount);
          expect(
            careRead.rows.every((row) => row.tenant_id === id.TA),
            tbl,
          ).toBe(true);
        }

        const secondCarePrivate = await as(
          "authenticated",
          { sub: "UCARE2", headers: scope("TA", extra.mCare2) },
          `select count(*)::int as n from public.member_care_private_notes`,
        );
        expect(secondCarePrivate.code).toBeNull();
        expect(secondCarePrivate.rows[0]!.n).toBe(0);

        const financeHealth = await as(
          "authenticated",
          { sub: "UFC", headers: scope("TA", id.mFin!) },
          `select health_status from public.missionaries`,
        );
        expect(financeHealth.code).toBe("42501");

        const crmMissionaries = await as(
          "authenticated",
          { sub: "UDEV", headers: scope("TA", id.mDev!) },
          `select id, profile_id, tenant_id, location, created_at, updated_at from public.missionaries order by id`,
        );
        expect(crmMissionaries.code).toBeNull();
        expect(crmMissionaries.rows).toHaveLength(3);
      }));

    it("cuts off a revoked care-note author while their finance assignment stays live, and cuts off suspended or closed tenants", () =>
      tx(async () => {
        await db.query(
          `update authz.memberships set is_active = false, revoked_at = pg_catalog.now() where id = $1`,
          [id.mCare],
        );
        for (const headers of [
          scope("TA", id.mCare!),
          scope("TA", id.mFin!),
          { "x-asym-tenant": id.TA! },
          undefined,
        ]) {
          const r = await as(
            "authenticated",
            { sub: "UFC", headers },
            `select count(*)::int as n from public.member_care_private_notes`,
          );
          expect(r.code).toBeNull();
          expect(r.rows[0]!.n).toBe(0);
        }

        for (const status of ["suspended", "closed"] as const) {
          await db.query(
            `update public.tenants set status = $1 where id = $2`,
            [status, id.TA],
          );
          for (const tbl of CARE_TABLES) {
            const r = await as(
              "authenticated",
              { sub: "UCARE2", headers: scope("TA", extra.mCare2) },
              `select count(*)::int as n from public.${tbl}`,
            );
            expect(r.code, `${status} ${tbl}`).toBeNull();
            expect(r.rows[0]!.n, `${status} ${tbl}`).toBe(0);
          }
          const dir = await as(
            "authenticated",
            { sub: "UCARE2", headers: scope("TA", extra.mCare2) },
            `select * from public.member_care_directory_rows('${id.TA}')`,
          );
          expect(dir.code, status).toBeNull();
          expect(dir.rows).toEqual([]);
          const write = await as(
            "authenticated",
            { sub: "UCARE2", headers: scope("TA", extra.mCare2) },
            `select * from public.create_care_thread_post('${extra.mA1}', 'blocked while ${status}')`,
          );
          expect(write.code, status).toBe("42501");
        }
      }));

    it("member_care_directory_rows uses LEFT JOIN, preserves deterministic order and total_count, supports detail lookup outside limit, and returns 0 rows on unauthorized or bad scope", () =>
      tx(async () => {
        const meta = await db.query(
          `select p.proowner::regrole::text as owner, p.prosecdef, p.provolatile::text as vol, p.proconfig,
                  array(select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                          from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                         where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner order by 1) as grantees
             from pg_proc p
            where p.oid = 'public.member_care_directory_rows(uuid,uuid,integer)'::regprocedure`,
        );
        expect(meta.rows).toEqual([
          {
            owner: "postgres",
            prosecdef: true,
            vol: "s",
            proconfig: ['search_path=""'],
            grantees: ["authenticated"],
          },
        ]);

        const page = await as(
          "authenticated",
          { sub: "UFC", headers: scope("TA", id.mCare!) },
          `select id, first_name, display_name, health_status, total_count::int as total_count
             from public.member_care_directory_rows('${id.TA}', null, 2)`,
        );
        expect(page.code, page.message).toBeNull();
        expect(page.rows).toHaveLength(2);
        expect(page.rows.map((r) => r.id)).toEqual([extra.mA1, extra.mA2]);
        expect(page.rows[0]!.total_count).toBe(3);

        const all = await as(
          "authenticated",
          { sub: "UFC", headers: scope("TA", id.mCare!) },
          `select id, display_name, health_status, total_count::int as total_count
             from public.member_care_directory_rows('${id.TA}', null, 250)`,
        );
        expect(all.code, all.message).toBeNull();
        expect(all.rows.map((r) => r.id)).toEqual([
          extra.mA1,
          extra.mA2,
          extra.mANoProfile,
        ]);
        expect(all.rows[2]!.display_name).toBeNull();
        expect(all.rows[2]!.total_count).toBe(3);

        const detailOutsideLimit = await as(
          "authenticated",
          { sub: "UFC", headers: scope("TA", id.mCare!) },
          `select id, health_status, total_count::int as total_count
             from public.member_care_directory_rows('${id.TA}', '${extra.mANoProfile}', 1)`,
        );
        expect(detailOutsideLimit.code, detailOutsideLimit.message).toBeNull();
        expect(detailOutsideLimit.rows).toEqual([
          {
            id: extra.mANoProfile,
            health_status: "needs_attention",
            total_count: 1,
          },
        ]);

        const emptyTenant = randomUUID();
        const emptyCare = randomUUID();
        await db.query(
          `insert into public.tenants (id, name, slug) values ($1, 'Empty Care', $2)`,
          [emptyTenant, `empty-${emptyTenant}`],
        );
        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active)
           values ($1, $2, $3, 'staff', 'member_care', true)`,
          [emptyCare, id.UFC, emptyTenant],
        );
        const emptyResult = await as(
          "authenticated",
          {
            sub: "UFC",
            headers: {
              "x-asym-tenant": emptyTenant,
              "x-asym-assignment": emptyCare,
            },
          },
          `select * from public.member_care_directory_rows('${emptyTenant}')`,
        );
        expect(emptyResult.code).toBeNull();
        expect(emptyResult.rows).toEqual([]);

        const backSuper = await membershipOf(extra.USUPER);
        const refusedCases: [
          string,
          Record<string, string> | undefined,
          string,
        ][] = [
          ["UFC", scope("TA", id.mFin!), `'${id.TA}'`],
          ["UADM", scope("TA", id.mAdm!), `'${id.TA}'`],
          ["USUPER", scope("TA", backSuper.id), `'${id.TA}'`],
          ["USUPER", undefined, `'${id.TA}'`],
          ["UFC", undefined, `'${id.TA}'`],
          ["UFC", { "x-asym-tenant": id.TA! }, `'${id.TA}'`],
          ["UFC", scope("TA", id.mCare!), `'${id.TB}'`],
          ["UFC", scope("TA", id.mCare!), "null"],
          [
            "UFC",
            { "x-asym-tenant": "not-a-uuid", "x-asym-assignment": id.mCare! },
            `'${id.TA}'`,
          ],
        ];
        for (const [sub, headers, tenantSql] of refusedCases) {
          const r = await as(
            "authenticated",
            { sub, headers },
            `select * from public.member_care_directory_rows(${tenantSql})`,
          );
          expect(r.code, `${sub} ${tenantSql}`).toBeNull();
          expect(r.rows, `${sub} ${tenantSql}`).toEqual([]);
        }
      }));

    it("executes all six care commands via public wrappers, enforces validation/authorship/no-forged-title, writes zero audit/command logs, and refuses direct inner calls without request tenant", () =>
      tx(async () => {
        const auditMarker = (
          await db.query<{ ts: string }>(
            "select transaction_timestamp()::text as ts",
          )
        ).rows[0]!.ts;
        const case4TenantIds = [id.TA!, id.TB!];
        const case4ActorIds = [id.UFC!, extra.UCARE2, extra.UEMPTYNAME];
        const case4ResourceIds: string[] = [
          extra.mA1,
          extra.mA2,
          extra.mANoProfile,
          extra.mB1,
          extra.goalA1,
          extra.goalA2,
          extra.goalB1,
          extra.reqA1,
          extra.reqA2,
          extra.reqB1,
        ];
        expect(
          await scopedAuditCounts(db, {
            tenantIds: case4TenantIds,
            actorIds: case4ActorIds,
            resourceIds: case4ResourceIds,
            since: auditMarker,
            sentinelPrefix: "SENTINEL_",
          }),
        ).toEqual({ audit_count: 0, cmd_count: 0 });
        const careHeaders = scope("TA", id.mCare!);

        const threadRes = await asPersist(
          "authenticated",
          { sub: "UFC", headers: careHeaders },
          `select id from public.create_care_thread_post('${extra.mA1}', 'SENTINEL_THREAD_SECRET')`,
        );
        expect(threadRes.code, threadRes.message).toBeNull();
        case4ResourceIds.push(String(threadRes.rows[0]!.id));
        const threadRow = (
          await db.query(
            `select type, title, description, author_user_id, author_name_snapshot from public.member_care_activities where id = $1`,
            [threadRes.rows[0]!.id],
          )
        ).rows[0];
        expect(threadRow).toEqual({
          type: "pastoral_note",
          title: "Care thread update",
          description: "SENTINEL_THREAD_SECRET",
          author_user_id: id.UFC,
          author_name_snapshot: "Avery Finance-Care",
        });

        const fallbackAuthorRes = await asPersist(
          "authenticated",
          { sub: "UEMPTYNAME", headers: scope("TA", extra.mEmptyName) },
          `select id from public.create_care_private_note('${extra.mA1}', 'SENTINEL_NOTE_FALLBACK')`,
        );
        expect(fallbackAuthorRes.code, fallbackAuthorRes.message).toBeNull();
        const fallbackRow = (
          await db.query(
            `select author_user_id, author_name_snapshot, content from public.member_care_private_notes where id = $1`,
            [fallbackAuthorRes.rows[0]!.id],
          )
        ).rows[0];
        expect(fallbackRow).toEqual({
          author_user_id: extra.UEMPTYNAME,
          author_name_snapshot: extra.UEMPTYNAME,
          content: "SENTINEL_NOTE_FALLBACK",
        });

        for (const [dbType, expectedTitle] of ACTIVITY_TITLES) {
          const actRes = await asPersist(
            "authenticated",
            { sub: "UFC", headers: careHeaders },
            `select id from public.log_care_activity('${extra.mA1}', '${dbType}', 'SENTINEL_ACT_${dbType}')`,
          );
          expect(actRes.code, `${dbType}: ${actRes.message}`).toBeNull();
          case4ResourceIds.push(String(actRes.rows[0]!.id));
          const actRow = (
            await db.query(
              `select type, title, description, author_user_id, author_name_snapshot from public.member_care_activities where id = $1`,
              [actRes.rows[0]!.id],
            )
          ).rows[0];
          expect(actRow).toEqual({
            type: dbType,
            title: expectedTitle,
            description: `SENTINEL_ACT_${dbType}`,
            author_user_id: id.UFC,
            author_name_snapshot: "Avery Finance-Care",
          });
        }

        const goalInsert = await asPersist(
          "authenticated",
          { sub: "UFC", headers: careHeaders },
          `select id from public.upsert_care_goal('${extra.mA1}', 'SENTINEL_GOAL_NEW', 'active', '2026-12-31'::date, null)`,
        );
        expect(goalInsert.code, goalInsert.message).toBeNull();
        const goalUpdate = await asPersist(
          "authenticated",
          { sub: "UFC", headers: careHeaders },
          `select id from public.upsert_care_goal('${extra.mA1}', 'SENTINEL_GOAL_UPD', 'completed', '2027-01-15'::date, '${goalInsert.rows[0]!.id}')`,
        );
        expect(goalUpdate.code, goalUpdate.message).toBeNull();
        expect(goalUpdate.rows[0]!.id).toBe(goalInsert.rows[0]!.id);
        const goalRow = (
          await db.query(
            `select title, status, updated_by from public.member_care_goals where id = $1`,
            [goalInsert.rows[0]!.id],
          )
        ).rows[0];
        expect(goalRow).toEqual({
          title: "SENTINEL_GOAL_UPD",
          status: "completed",
          updated_by: id.UFC,
        });

        const reqInsert = await asPersist(
          "authenticated",
          { sub: "UFC", headers: careHeaders },
          `select id from public.upsert_care_requirement('${extra.mA1}', 'video_call', 45, 'SENTINEL_REQ_NEW', null)`,
        );
        expect(reqInsert.code, reqInsert.message).toBeNull();
        const reqUpdate = await asPersist(
          "authenticated",
          { sub: "UFC", headers: careHeaders },
          `select id from public.upsert_care_requirement('${extra.mA1}', 'in_person_visit', 90, 'SENTINEL_REQ_UPD', '${reqInsert.rows[0]!.id}')`,
        );
        expect(reqUpdate.code, reqUpdate.message).toBeNull();
        expect(reqUpdate.rows[0]!.id).toBe(reqInsert.rows[0]!.id);
        const reqRow = (
          await db.query(
            `select activity_type, interval_days, notes, updated_by from public.member_care_requirements where id = $1`,
            [reqInsert.rows[0]!.id],
          )
        ).rows[0];
        expect(reqRow).toEqual({
          activity_type: "in_person_visit",
          interval_days: 90,
          notes: "SENTINEL_REQ_UPD",
          updated_by: id.UFC,
        });

        const attnRes = await asPersist(
          "authenticated",
          { sub: "UFC", headers: careHeaders },
          `select id from public.set_manual_attention_flag('${extra.mA1}', false)`,
        );
        expect(attnRes.code, attnRes.message).toBeNull();
        expect(attnRes.rows[0]!.id).toBe(extra.mA1);
        const attnVal = (
          await db.query(
            `select manual_attention from public.missionaries where id = $1`,
            [extra.mA1],
          )
        ).rows[0]!.manual_attention;
        expect(attnVal).toBe(false);

        const directInnerCalls = [
          `select * from tenant_guard.create_care_thread_post('${id.TA}', '${extra.mA1}', 'no request tenant')`,
          `select * from tenant_guard.create_care_private_note('${id.TA}', '${extra.mA1}', 'no request tenant')`,
          `select * from tenant_guard.upsert_care_goal('${id.TA}', '${extra.mA1}', 'no request tenant', 'pending', null, null)`,
          `select * from tenant_guard.log_care_activity('${id.TA}', '${extra.mA1}', 'check_in', 'no request tenant')`,
          `select * from tenant_guard.upsert_care_requirement('${id.TA}', '${extra.mA1}', 'check_in', 30, null, null)`,
          `select * from tenant_guard.set_manual_attention_flag('${id.TA}', '${extra.mA1}', true)`,
        ];
        for (const sql of directInnerCalls) {
          for (const headers of [
            { "x-asym-assignment": extra.mCare2 },
            {
              "x-asym-tenant": "not-a-uuid",
              "x-asym-assignment": extra.mCare2,
            },
            { "x-asym-tenant": id.TB!, "x-asym-assignment": extra.mCare2 },
          ]) {
            const refused = await as(
              "authenticated",
              { sub: "UCARE2", headers },
              sql,
            );
            expect(refused.code, `${sql} ${JSON.stringify(headers)}`).toBe(
              "42501",
            );
          }
        }

        const missingId = randomUUID();
        const missingSubjectCalls = [
          `select * from public.create_care_thread_post('${missingId}', 'valid')`,
          `select * from public.create_care_private_note('${missingId}', 'valid')`,
          `select * from public.upsert_care_goal('${missingId}', 'valid', 'active', null, null)`,
          `select * from public.log_care_activity('${missingId}', 'check_in', 'valid')`,
          `select * from public.upsert_care_requirement('${missingId}', 'check_in', 30, null, null)`,
          `select * from public.set_manual_attention_flag('${missingId}', true)`,
          `select * from public.create_care_thread_post('${extra.mB1}', 'foreign')`,
          `select * from public.create_care_private_note('${extra.mB1}', 'foreign')`,
          `select * from public.upsert_care_goal('${extra.mB1}', 'foreign', 'active', null, null)`,
          `select * from public.log_care_activity('${extra.mB1}', 'check_in', 'foreign')`,
          `select * from public.upsert_care_requirement('${extra.mB1}', 'check_in', 30, null, null)`,
          `select * from public.set_manual_attention_flag('${extra.mB1}', false)`,
          `select * from public.upsert_care_goal('${extra.mA1}', 'wrong owner goal', 'active', null, '${extra.goalA2}')`,
          `select * from public.upsert_care_requirement('${extra.mA1}', 'check_in', 30, 'wrong owner req', '${extra.reqA2}')`,
          `select * from public.upsert_care_goal('${extra.mA1}', 'foreign goal', 'active', null, '${extra.goalB1}')`,
          `select * from public.upsert_care_requirement('${extra.mA1}', 'check_in', 30, 'foreign req', '${extra.reqB1}')`,
        ];
        for (const sql of missingSubjectCalls) {
          const authzMissing = await as(
            "authenticated",
            { sub: "UFC", headers: careHeaders },
            sql,
          );
          expect(authzMissing.code, `authorized ${sql}`).toBe("P0002");

          const unauthzMissing = await as(
            "authenticated",
            { sub: "UFC", headers: scope("TA", id.mFin!) },
            sql,
          );
          expect(unauthzMissing.code, `unauthorized ${sql}`).toBe("42501");
        }

        const invalidInputCalls = [
          `select * from public.create_care_thread_post('${extra.mA1}', '   ')`,
          `select * from public.create_care_private_note('${extra.mA1}', '')`,
          `select * from public.upsert_care_goal('${extra.mA1}', '', 'active', null, null)`,
          `select * from public.upsert_care_goal('${extra.mA1}', 'Valid', 'unknown_status', null, null)`,
          `select * from public.log_care_activity('${extra.mA1}', 'not_a_type', 'Valid')`,
          `select * from public.log_care_activity('${extra.mA1}', 'check_in', '  ')`,
          `select * from public.upsert_care_requirement('${extra.mA1}', 'not_a_type', 30, null, null)`,
          `select * from public.upsert_care_requirement('${extra.mA1}', 'check_in', 0, null, null)`,
          `select * from public.set_manual_attention_flag('${extra.mA1}', null)`,
        ];
        for (const sql of invalidInputCalls) {
          const invalid = await as(
            "authenticated",
            { sub: "UFC", headers: careHeaders },
            sql,
          );
          expect(invalid.code, sql).toBe("22023");
        }

        for (const role of ["anon", "service_role"] as const) {
          const r = await as(
            role,
            { sub: "UFC", headers: careHeaders },
            `select * from public.create_care_thread_post('${extra.mA1}', 'wrong role')`,
          );
          expect(r.code, role).toBe("42501");
        }

        case4ResourceIds.push(
          String(fallbackAuthorRes.rows[0]!.id),
          String(goalInsert.rows[0]!.id),
          String(reqInsert.rows[0]!.id),
          missingId,
        );
        const afterLogs = await scopedAuditCounts(db, {
          tenantIds: case4TenantIds,
          actorIds: case4ActorIds,
          resourceIds: case4ResourceIds,
          since: auditMarker,
          sentinelPrefix: "SENTINEL_",
        });
        expect(afterLogs).toEqual({ audit_count: 0, cmd_count: 0 });

        const privs = (
          await db.query(
            `select has_table_privilege('tenant_guard', 'public.tenants', 'SELECT') as tenants_select,
                    has_table_privilege('tenant_guard', 'public.profiles', 'SELECT') as profiles_select,
                    has_column_privilege('tenant_guard', 'public.missionaries', 'id', 'SELECT') as m_id_select,
                    has_column_privilege('tenant_guard', 'public.missionaries', 'tenant_id', 'SELECT') as m_tid_select,
                    has_column_privilege('tenant_guard', 'public.missionaries', 'manual_attention', 'UPDATE') as m_attn_update,
                    has_column_privilege('tenant_guard', 'public.missionaries', 'health_status', 'SELECT') as m_health_select`,
          )
        ).rows[0];
        expect(privs).toEqual({
          tenants_select: false,
          profiles_select: false,
          m_id_select: true,
          m_tid_select: true,
          m_attn_update: true,
          m_health_select: false,
        });

        await db.query("savepoint tg_lock_probe");
        try {
          await db.query("set local role tenant_guard");
          await db.query(`select tenant_guard.enter('${id.TA}')`);
          const tenantStatus = await db.query(
            `select private.share_lock_tenant('${id.TA}') as status`,
          );
          expect(tenantStatus.rows[0]!.status).toBe("active");
          const lockedMembership = await db.query(
            `select id from authz.memberships where tenant_id = '${id.TA}' and id = '${id.mCare}' for share`,
          );
          expect(lockedMembership.rows).toHaveLength(1);
          const lockedMissionaryShare = await db.query(
            `select id from public.missionaries where tenant_id = '${id.TA}' and id = '${extra.mA1}' for share`,
          );
          expect(lockedMissionaryShare.rows).toHaveLength(1);
          const lockedMissionaryUpdate = await db.query(
            `select id from public.missionaries where tenant_id = '${id.TA}' and id = '${extra.mA1}' for update`,
          );
          expect(lockedMissionaryUpdate.rows).toHaveLength(1);
        } finally {
          await db.query("rollback to savepoint tg_lock_probe");
        }
      }));

    it("serializes concurrent care insert and update commands behind raw UPDATE races (membership revocation, role change, tenant suspension) across two connections", async () => {
      const connA = new pg.Client({ connectionString: ADMIN_URL });
      const connB = new pg.Client({ connectionString: ADMIN_URL });
      const tenantId = randomUUID();
      const userId = randomUUID();
      const membershipId = randomUUID();
      const missionaryId = randomUUID();
      const goalId = randomUUID();
      await connA.connect();
      await connB.connect();
      const pidB = (
        await connB.query<{ pid: number }>("select pg_backend_pid() as pid")
      ).rows[0]!.pid;

      const cleanup = async () => {
        await connA.query("rollback").catch(() => {});
        await connB.query("rollback").catch(() => {});
        await connA.query(
          `delete from public.member_care_private_notes where tenant_id = $1`,
          [tenantId],
        );
        await connA.query(
          `delete from public.member_care_goals where tenant_id = $1`,
          [tenantId],
        );
        await connA.query(
          `delete from public.missionaries where tenant_id = $1`,
          [tenantId],
        );
        await connA.query(`delete from public.parties where tenant_id = $1`, [
          tenantId,
        ]);
        await connA.query(
          `delete from public.legal_entities where tenant_id = $1`,
          [tenantId],
        );
        await connA.query(`delete from authz.memberships where user_id = $1`, [
          userId,
        ]);
        await connA.query(`delete from public.profiles where user_id = $1`, [
          userId,
        ]);
        await connA.query(`delete from auth.users where id = $1`, [userId]);
        await connA.query(`delete from public.tenants where id = $1`, [
          tenantId,
        ]);
      };

      const resetState = async () => {
        await connA.query(
          `update public.tenants set status = 'active' where id = $1`,
          [tenantId],
        );
        await connA.query(
          `update authz.memberships set is_active = true, revoked_at = null, staff_role = 'member_care' where id = $1`,
          [membershipId],
        );
        await connA.query(
          `update public.missionaries set manual_attention = false where id = $1`,
          [missionaryId],
        );
        await connA.query(
          `update public.member_care_goals set title = 'Initial Goal', status = 'pending' where id = $1`,
          [goalId],
        );
        await connA.query(
          `delete from public.member_care_private_notes where tenant_id = $1`,
          [tenantId],
        );
      };

      try {
        await connA.query(
          `insert into public.tenants (id, name, slug) values ($1, 'Lock Test Org', $2)`,
          [tenantId, `lock-${tenantId}`],
        );
        await connA.query(`insert into auth.users (id) values ($1)`, [userId]);
        await connA.query(`delete from authz.memberships where user_id = $1`, [
          userId,
        ]);
        await connA.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active) values ($1, $2, $3, 'staff', 'member_care', true)`,
          [membershipId, userId, tenantId],
        );
        await connA.query(
          `insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'Lock Entity', 'US', 'usd', 'Lock Entity')`,
          [tenantId],
        );
        await connA.query(
          `with party as (insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Fixture') returning id) insert into public.missionaries (id, tenant_id, legal_entity_id, manual_attention, party_id) select $1, $2, $2, false, id from party`,
          [missionaryId, tenantId],
        );
        await connA.query(
          `insert into public.member_care_goals (id, tenant_id, missionary_id, title, status, updated_by) values ($1, $2, $3, 'Initial Goal', 'pending', $4)`,
          [goalId, tenantId, missionaryId, userId],
        );

        const commands: readonly [string, string][] = [
          [
            "create_care_private_note",
            `select * from public.create_care_private_note('${missionaryId}', 'race note')`,
          ],
          [
            "set_manual_attention_flag",
            `select * from public.set_manual_attention_flag('${missionaryId}', true)`,
          ],
          [
            "upsert_care_goal",
            `select * from public.upsert_care_goal('${missionaryId}', 'Raced Goal', 'completed', null, '${goalId}')`,
          ],
        ];

        const races: readonly [string, string][] = [
          [
            "revoke membership",
            `update authz.memberships set is_active = false, revoked_at = pg_catalog.now() where id = '${membershipId}'`,
          ],
          [
            "change role off member_care",
            `update authz.memberships set staff_role = 'finance' where id = '${membershipId}'`,
          ],
          [
            "suspend tenant",
            `update public.tenants set status = 'suspended' where id = '${tenantId}'`,
          ],
        ];

        for (const [cmdName, cmdSql] of commands) {
          for (const [raceName, raceSql] of races) {
            await resetState();
            const raceMarker = (
              await connA.query<{ ts: string }>("select now()::text as ts")
            ).rows[0]!.ts;
            const raceAuditScope = {
              tenantIds: [tenantId],
              actorIds: [userId],
              resourceIds: [missionaryId, goalId],
              since: raceMarker,
            };
            expect(
              await scopedAuditCounts(connA, raceAuditScope),
              `${cmdName} vs ${raceName} baseline logs`,
            ).toEqual({ audit_count: 0, cmd_count: 0 });

            await connA.query("begin");
            await connA.query(raceSql);

            await connB.query("begin");
            await connB.query("set local role authenticated");
            await connB.query(
              `select set_config('request.jwt.claims', $1, true),
                      set_config('request.jwt.claim.sub', $2, true),
                      set_config('request.headers', $3, true)`,
              [
                JSON.stringify({ sub: userId, role: "authenticated" }),
                userId,
                JSON.stringify({
                  "x-asym-tenant": tenantId,
                  "x-asym-assignment": membershipId,
                }),
              ],
            );

            let settled = false;
            const pendingB = connB
              .query(cmdSql)
              .then(() => {
                settled = true;
                return { code: null as string | null, message: "" };
              })
              .catch((error: { code?: string; message?: string }) => {
                settled = true;
                return {
                  code: error.code ?? null,
                  message: error.message ?? String(error),
                };
              });

            const lockDeadline = Date.now() + 5_000;
            let waitEventType: string | null = null;
            while (Date.now() < lockDeadline && !settled) {
              const activity = await db.query<{
                wait_event_type: string | null;
              }>(
                `select wait_event_type from pg_stat_activity where pid = $1`,
                [pidB],
              );
              waitEventType = activity.rows[0]?.wait_event_type ?? null;
              if (waitEventType === "Lock") {
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 25));
            }
            expect(
              waitEventType,
              `${cmdName} vs raw UPDATE (${raceName}) must block with pg_stat_activity.wait_event_type = Lock`,
            ).toBe("Lock");
            expect(
              settled,
              `${cmdName} vs raw UPDATE (${raceName}) must wait on lock`,
            ).toBe(false);

            await connA.query("commit");
            const outcomeB = await pendingB;
            await connB.query("rollback");

            expect(
              outcomeB.code,
              `${cmdName} vs ${raceName}: ${outcomeB.message}`,
            ).toBe("42501");

            const noteCount = (
              await connA.query(
                `select count(*)::int as n from public.member_care_private_notes where tenant_id = $1`,
                [tenantId],
              )
            ).rows[0]!.n;
            expect(noteCount, `${cmdName} vs ${raceName} notes`).toBe(0);

            const attn = (
              await connA.query(
                `select manual_attention from public.missionaries where id = $1`,
                [missionaryId],
              )
            ).rows[0]!.manual_attention;
            expect(attn, `${cmdName} vs ${raceName} attention`).toBe(false);

            const goalTitle = (
              await connA.query(
                `select title from public.member_care_goals where id = $1`,
                [goalId],
              )
            ).rows[0]!.title;
            expect(goalTitle, `${cmdName} vs ${raceName} goal`).toBe(
              "Initial Goal",
            );

            expect(
              await scopedAuditCounts(connA, raceAuditScope),
              `${cmdName} vs ${raceName} audit logs`,
            ).toEqual({ audit_count: 0, cmd_count: 0 });
          }
        }
      } finally {
        await cleanup();
        await connA.end();
        await connB.end();
      }
    }, 30_000);

    it("preserves old-build service_role reads and all six service_role writes plus CRM non-care query behavior and adds tenant-first indexes", () =>
      tx(async () => {
        const indexes = await db.query(
          `select tablename, indexname, indexdef from pg_indexes
            where schemaname = 'public'
              and indexname in ('idx_missionaries_tenant_created_at_id', 'idx_member_care_activities_tenant_occurred_at')
            order by indexname`,
        );
        expect(indexes.rows).toHaveLength(2);

        const oldReadDir = await as(
          "service_role",
          { sub: null },
          `select m.id, m.health_status, p.display_name from public.missionaries m left join public.profiles p on p.id = m.profile_id where m.tenant_id = '${id.TA}' order by m.created_at desc, m.id desc`,
        );
        expect(oldReadDir.code).toBeNull();
        expect(oldReadDir.rows).toHaveLength(3);

        const oldCareTableWrites = [
          `insert into public.member_care_activities (tenant_id, missionary_id, author_user_id, author_name_snapshot, type, title, description) values ('${id.TA}', '${extra.mA1}', '${id.UFC}', 'Old Build', 'pastoral_note', 'Care thread update', 'old thread') returning id`,
          `insert into public.member_care_private_notes (tenant_id, missionary_id, author_user_id, author_name_snapshot, content) values ('${id.TA}', '${extra.mA1}', '${id.UFC}', 'Old Build', 'old note') returning id`,
          `insert into public.member_care_goals (tenant_id, missionary_id, title, status, updated_by) values ('${id.TA}', '${extra.mA1}', 'old goal', 'active', '${id.UFC}') returning id`,
          `insert into public.member_care_activities (tenant_id, missionary_id, author_user_id, author_name_snapshot, type, title, description) values ('${id.TA}', '${extra.mA1}', '${id.UFC}', 'Old Build', 'check_in', 'Check-in', 'old activity') returning id`,
          `insert into public.member_care_requirements (tenant_id, missionary_id, activity_type, interval_days, notes, updated_by) values ('${id.TA}', '${extra.mA1}', 'check_in', 30, 'old req', '${id.UFC}') returning id`,
        ];
        for (const sql of oldCareTableWrites) {
          const r = await as("service_role", { sub: null }, sql);
          expect(r.code, `${sql}: ${r.message}`).toBeNull();
          expect(r.rows).toHaveLength(1);
        }

        const hasServiceMissionaryUpdate = (
          await db.query(
            `select has_table_privilege('service_role', 'public.missionaries', 'UPDATE') as ok`,
          )
        ).rows[0]!.ok as boolean;
        if (!hasServiceMissionaryUpdate) {
          await db.query(
            `grant update on table public.missionaries to service_role`,
          );
        }
        const oldAttentionWrite = await as(
          "service_role",
          { sub: null },
          `update public.missionaries set manual_attention = false where tenant_id = '${id.TA}' and id = '${extra.mA1}' returning id`,
        );
        expect(oldAttentionWrite.code, oldAttentionWrite.message).toBeNull();
        expect(oldAttentionWrite.rows).toHaveLength(1);

        const crmDev = await as(
          "authenticated",
          { sub: "UDEV", headers: scope("TA", id.mDev!) },
          `select id, missionary_id, type, title, description, occurred_at from public.member_care_activities where tenant_id = '${id.TA}'`,
        );
        expect(crmDev.code).toBeNull();
        expect(crmDev.rows).toEqual([]);

        const crmCare = await as(
          "authenticated",
          { sub: "UFC", headers: scope("TA", id.mCare!) },
          `select id from public.member_care_activities where tenant_id = '${id.TA}'`,
        );
        expect(crmCare.code).toBeNull();
        expect(crmCare.rows.length).toBeGreaterThanOrEqual(1);
      }));
  },
);
