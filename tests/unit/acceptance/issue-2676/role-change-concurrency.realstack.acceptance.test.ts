import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

type RawOutcome = {
  code: string | null;
  message: string | null;
  rows: Record<string, unknown>[];
};

async function runAs(
  client: pg.Client,
  role: string,
  sub: string | null,
  sql: string,
  opts?: {
    aal?: string;
    tenant?: string;
    headers?: Record<string, string>;
    params?: unknown[];
  },
): Promise<RawOutcome> {
  await client.query("savepoint sp_run_as");
  try {
    const claims: Record<string, unknown> = {
      role,
      ...(sub ? { sub } : {}),
      ...(opts?.aal ? { aal: opts.aal } : {}),
    };
    await client.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(claims),
    ]);
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [
      sub ?? "",
    ]);
    const headers = {
      ...(opts?.tenant ? { "x-asym-tenant": opts.tenant } : {}),
      ...(opts?.headers ?? {}),
    };
    await client.query("select set_config('request.headers', $1, true)", [
      JSON.stringify(headers),
    ]);
    await client.query(`set local role ${role}`);
    const res = await client.query(sql, opts?.params ?? []);
    await client.query("reset role");
    await client.query("release savepoint sp_run_as");
    return {
      code: null,
      message: null,
      rows: res.rows as Record<string, unknown>[],
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    await client.query("rollback to savepoint sp_run_as");
    await client.query("release savepoint sp_run_as");
    return {
      code: err.code ?? "UNKNOWN",
      message: err.message ?? String(error),
      rows: [],
    };
  }
}

async function runCommittedAs(
  client: pg.Client,
  role: string,
  sub: string | null,
  sql: string,
  opts?: {
    aal?: string;
    tenant?: string;
    headers?: Record<string, string>;
    params?: unknown[];
  },
): Promise<RawOutcome> {
  await client.query("begin");
  try {
    const claims: Record<string, unknown> = {
      role,
      ...(sub ? { sub } : {}),
      ...(opts?.aal ? { aal: opts.aal } : {}),
    };
    await client.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(claims),
    ]);
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [
      sub ?? "",
    ]);
    const headers = {
      ...(opts?.tenant ? { "x-asym-tenant": opts.tenant } : {}),
      ...(opts?.headers ?? {}),
    };
    await client.query("select set_config('request.headers', $1, true)", [
      JSON.stringify(headers),
    ]);
    await client.query(`set local role ${role}`);
    const res = await client.query(sql, opts?.params ?? []);
    await client.query("reset role");
    await client.query("commit");
    return {
      code: null,
      message: null,
      rows: res.rows as Record<string, unknown>[],
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    await client.query("rollback");
    return {
      code: err.code ?? "UNKNOWN",
      message: err.message ?? String(error),
      rows: [],
    };
  }
}

function makeIds() {
  return {
    tenant: randomUUID(),
    admin1: randomUUID(),
    admin2: randomUUID(),
    staffTarget: randomUUID(),
    operatorUser: randomUUID(),
    mAdmin1: randomUUID(),
    mAdmin1Second: randomUUID(),
    mAdmin2: randomUUID(),
    mTargetDev: randomUUID(),
    mTargetFin: randomUUID(),
    mTargetRevokedHr: randomUUID(),
  };
}

function seedFixtureSql(i: ReturnType<typeof makeIds>) {
  const tag = i.tenant.slice(0, 8);
  return `
    insert into public.tenants (id, name, slug, status) values
      ('${i.tenant}', 'WP3c Role Org', 'wp3c-role-${tag}', 'active');

    insert into auth.users (id, email, email_confirmed_at) values
      ('${i.admin1}', 'r-admin1-${tag}@example.org', now()),
      ('${i.admin2}', 'r-admin2-${tag}@example.org', now()),
      ('${i.staffTarget}', 'r-target-${tag}@example.org', now()),
      ('${i.operatorUser}', 'r-op-${tag}@example.org', now());

    insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active, granted_by) values
      ('${i.mAdmin1}', '${i.admin1}', '${i.tenant}', 'staff', 'development', true, true, '${i.admin1}'),
      ('${i.mAdmin1Second}', '${i.admin1}', '${i.tenant}', 'staff', 'finance', false, true, '${i.admin1}'),
      ('${i.mAdmin2}', '${i.admin2}', '${i.tenant}', 'staff', 'hr', true, true, '${i.admin1}'),
      ('${i.mTargetDev}', '${i.staffTarget}', '${i.tenant}', 'staff', 'development', false, true, '${i.admin1}'),
      ('${i.mTargetFin}', '${i.staffTarget}', '${i.tenant}', 'staff', 'finance', false, true, '${i.admin1}'),
      ('${i.mTargetRevokedHr}', '${i.staffTarget}', '${i.tenant}', 'staff', 'hr', false, false, '${i.admin1}');

    insert into authz.platform_operators (user_id, added_by, reason) values
      ('${i.operatorUser}', 'test-runner', 'WP3c role concurrency operator');
  `;
}

async function cleanupFixture(
  client: pg.Client,
  i: ReturnType<typeof makeIds>,
) {
  const users = [i.admin1, i.admin2, i.staffTarget, i.operatorUser];
  await client.query(
    "delete from public.membership_invitations where tenant_id = $1",
    [i.tenant],
  );
  await client.query("delete from public.audit_logs where tenant_id = $1", [
    i.tenant,
  ]);
  await client.query(
    "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
    [i.tenant, users],
  );
  await client.query(
    "delete from authz.platform_operators where user_id = any($1::uuid[])",
    [users],
  );
  await client.query(
    "delete from public.profiles where user_id = any($1::uuid[])",
    [users],
  );
  await client.query("delete from auth.users where id = any($1::uuid[])", [
    users,
  ]);
  await client.query("delete from public.tenants where id = $1", [i.tenant]);
}

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2676 WP3c part 1: role-change self-demotion, optimistic concurrency, F1 admin-lock and old-build compatibility (real stack) (D-18: AL-2676: human commands require x-asym-tenant)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function tx(
      fn: (i: ReturnType<typeof makeIds>) => Promise<void>,
    ): Promise<void> {
      const i = makeIds();
      await db.query("begin");
      try {
        await db.query(seedFixtureSql(i));
        await fn(i);
      } finally {
        await db.query("rollback");
      }
    }

    it("R4 & F5: drops the 6-arg signature, exposes one 7-arg function, advances updated_at via clock_timestamp, keeps old 6-arg and directory calls working, and refuses stale expected_updated_at with 40001 (D-18: AL-2676, D-16 ruling on caller_assignment Q3: member directory calls pass x-asym-tenant matching i.tenant)", () =>
      tx(async (i) => {
        const sigs = await db.query(
          `select
             to_regprocedure('public.change_membership_role(uuid,uuid,text,text,boolean,text)')::text as old_pub,
             to_regprocedure('tenant_guard.change_membership_role(uuid,uuid,text,text,boolean,text)')::text as old_tg,
             to_regprocedure('public.change_membership_role(uuid,uuid,text,text,boolean,text,timestamptz)')::text as new_pub,
             to_regprocedure('tenant_guard.change_membership_role(uuid,uuid,text,text,boolean,text,timestamptz)')::text as new_tg,
             (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'change_membership_role') as pub_count,
             (select count(*)::int from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'tenant_guard' and p.proname = 'change_membership_role') as tg_count`,
        );
        expect(sigs.rows[0]).toEqual({
          old_pub: null,
          old_tg: null,
          new_pub:
            "change_membership_role(uuid,uuid,text,text,boolean,text,timestamp with time zone)",
          new_tg:
            "tenant_guard.change_membership_role(uuid,uuid,text,text,boolean,text,timestamp with time zone)",
          pub_count: 1,
          tg_count: 1,
        });

        const dirOldConsumer = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select membership_id, user_id, profile_id, display_name, email, role, staff_role, is_tenant_admin from public.tenant_member_directory($1)",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant],
          },
        );
        expect(dirOldConsumer.code, dirOldConsumer.message ?? "").toBeNull();
        expect(dirOldConsumer.rows.length).toBeGreaterThanOrEqual(4);

        const dirWithUpdated = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select membership_id, updated_at::text as updated_at from public.tenant_member_directory($1) where membership_id = $2",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mTargetDev],
          },
        );
        expect(dirWithUpdated.code, dirWithUpdated.message ?? "").toBeNull();
        const initialUpdatedAt = String(dirWithUpdated.rows[0]!.updated_at);
        expect(initialUpdatedAt).toBeTruthy();

        const sixArgCall = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'development', true, 'Old-build 6-arg call') as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mTargetDev],
          },
        );
        expect(sixArgCall.code, sixArgCall.message ?? "").toBeNull();

        const afterFirst = String(
          (
            await db.query(
              "select updated_at::text as updated_at from authz.memberships where id = $1",
              [i.mTargetDev],
            )
          ).rows[0]!.updated_at,
        );
        expect(afterFirst).not.toBe(initialUpdatedAt);

        const stale = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'development', false, 'Stale update', $3::timestamptz) as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mTargetDev, initialUpdatedAt],
          },
        );
        expect(stale.code).toBe("40001");

        const fresh = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'development', false, 'Fresh update', $3::timestamptz) as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mTargetDev, afterFirst],
          },
        );
        expect(fresh.code, fresh.message ?? "").toBeNull();

        const afterSecond = (
          await db.query(
            "select updated_at::text as updated_at, xmin::text as xmin, ctid::text as ctid from authz.memberships where id = $1",
            [i.mTargetDev],
          )
        ).rows[0]!;
        expect(String(afterSecond.updated_at)).not.toBe(afterFirst);

        const noop = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'development', false, 'No-op with matching timestamp', $3::timestamptz) as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mTargetDev, afterSecond.updated_at],
          },
        );
        expect(noop.code, noop.message ?? "").toBeNull();
        expect(noop.rows[0]!.r).toMatchObject({ changed: false });
        const afterNoop = (
          await db.query(
            "select updated_at::text as updated_at, xmin::text as xmin, ctid::text as ctid from authz.memberships where id = $1",
            [i.mTargetDev],
          )
        ).rows[0]!;
        expect(afterNoop).toEqual(afterSecond);
      }));

    it("D-113: lets an administrator give up their own flag when another administrator exists, refuses last admin, own sub-role, self-promotion and own revoke", () =>
      tx(async (i) => {
        const ts1 = String(
          (
            await db.query(
              "select updated_at::text as updated_at from authz.memberships where id = $1",
              [i.mAdmin1],
            )
          ).rows[0]!.updated_at,
        );
        const ts1Second = String(
          (
            await db.query(
              "select updated_at::text as updated_at from authz.memberships where id = $1",
              [i.mAdmin1Second],
            )
          ).rows[0]!.updated_at,
        );

        const ownSubrole = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'mobilizer', false, 'Own sub-role', $3::timestamptz)",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mAdmin1, ts1],
          },
        );
        expect(ownSubrole.code).toBe("42501");

        const selfPromote = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'finance', true, 'Self promote', $3::timestamptz)",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mAdmin1Second, ts1Second],
          },
        );
        expect(selfPromote.code).toBe("42501");

        const selfRevoke = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.revoke_membership($1, $2, 'Self revoke')",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mAdmin1],
          },
        );
        expect(selfRevoke.code).toBe("42501");

        const selfDemote = await runAs(
          db,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'development', false, 'Stepping down as admin', $3::timestamptz) as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mAdmin1, ts1],
          },
        );
        expect(selfDemote.code, selfDemote.message ?? "").toBeNull();
        expect(selfDemote.rows[0]!.r).toMatchObject({
          changed: true,
          membership_id: i.mAdmin1,
          is_tenant_admin: false,
        });

        const ts2 = String(
          (
            await db.query(
              "select updated_at::text as updated_at from authz.memberships where id = $1",
              [i.mAdmin2],
            )
          ).rows[0]!.updated_at,
        );
        const lastAdminSelfDemote = await runAs(
          db,
          "authenticated",
          i.admin2,
          "select public.change_membership_role($1, $2, 'staff', 'hr', false, 'Last admin step down', $3::timestamptz)",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin2 },
            params: [i.tenant, i.mAdmin2, ts2],
          },
        );
        expect(lastAdminSelfDemote.code).toBe("42501");
        expect(lastAdminSelfDemote.message).toMatch(/last administrator/i);
      }));

    it("R4 & F5: concurrent role changes on the same membership (sub-role+sub-role, flag+flag, flag+sub-role) with expected_updated_at refuse the loser with 40001; old-build release-window test omits expected_updated_at", async () => {
      const combos: Array<{
        name: string;
        reqA: { staff: string; admin: boolean };
        reqB: { staff: string; admin: boolean };
      }> = [
        {
          name: "sub-role + sub-role",
          reqA: { staff: "mobilizer", admin: false },
          reqB: { staff: "member_care", admin: false },
        },
        {
          name: "flag + flag",
          reqA: { staff: "development", admin: true },
          reqB: { staff: "development", admin: true },
        },
        {
          name: "flag + sub-role",
          reqA: { staff: "development", admin: true },
          reqB: { staff: "mobilizer", admin: false },
        },
      ];

      const barrier = new pg.Client({ connectionString: ADMIN_URL });
      const c1 = new pg.Client({ connectionString: ADMIN_URL });
      const c2 = new pg.Client({ connectionString: ADMIN_URL });
      await Promise.all([barrier.connect(), c1.connect(), c2.connect()]);
      try {
        for (const combo of combos) {
          const i = makeIds();
          try {
            await barrier.query("begin");
            await barrier.query(seedFixtureSql(i));
            await barrier.query("commit");

            const initialTs = String(
              (
                await barrier.query(
                  "select updated_at::text as updated_at from authz.memberships where id = $1",
                  [i.mTargetDev],
                )
              ).rows[0]!.updated_at,
            );

            await barrier.query("begin");
            await barrier.query(
              "select 1 from public.tenants where id = $1 for update",
              [i.tenant],
            );

            const pA = runCommittedAs(
              c1,
              "authenticated",
              i.admin1,
              "select public.change_membership_role($1, $2, 'staff', $3, $4, 'Concurrent A', $5::timestamptz) as r",
              {
                tenant: i.tenant,
                headers: { "x-asym-assignment": i.mAdmin1 },
                params: [
                  i.tenant,
                  i.mTargetDev,
                  combo.reqA.staff,
                  combo.reqA.admin,
                  initialTs,
                ],
              },
            );
            const pB = runCommittedAs(
              c2,
              "authenticated",
              i.admin2,
              "select public.change_membership_role($1, $2, 'staff', $3, $4, 'Concurrent B', $5::timestamptz) as r",
              {
                tenant: i.tenant,
                headers: { "x-asym-assignment": i.mAdmin2 },
                params: [
                  i.tenant,
                  i.mTargetDev,
                  combo.reqB.staff,
                  combo.reqB.admin,
                  initialTs,
                ],
              },
            );
            await new Promise((r) => setTimeout(r, 120));
            await barrier.query("rollback");
            const [resA, resB] = await Promise.all([pA, pB]);

            const wins = [
              { out: resA, req: combo.reqA },
              { out: resB, req: combo.reqB },
            ].filter((x) => x.out.code === null);
            const losses = [resA, resB].filter((x) => x.code !== null);

            expect(wins, combo.name).toHaveLength(1);
            expect(losses, combo.name).toHaveLength(1);
            expect(losses[0]!.code, combo.name).toBe("40001");

            const winnerId = String(
              (wins[0]!.out.rows[0]!.r as Record<string, unknown>)
                .membership_id,
            );
            const finalRow = (
              await barrier.query(
                "select staff_role::text as staff_role, is_tenant_admin, is_active from authz.memberships where id = $1",
                [winnerId],
              )
            ).rows[0]!;
            expect(finalRow, combo.name).toEqual({
              staff_role: wins[0]!.req.staff,
              is_tenant_admin: wins[0]!.req.admin,
              is_active: true,
            });
          } finally {
            await barrier.query("rollback").catch(() => undefined);
            await cleanupFixture(barrier, i).catch(() => undefined);
          }
        }

        const iOld = makeIds();
        try {
          await barrier.query("begin");
          await barrier.query(seedFixtureSql(iOld));
          await barrier.query("commit");

          const initialTs = String(
            (
              await barrier.query(
                "select updated_at::text as updated_at from authz.memberships where id = $1",
                [iOld.mTargetDev],
              )
            ).rows[0]!.updated_at,
          );

          await barrier.query("begin");
          await barrier.query(
            "select 1 from public.tenants where id = $1 for update",
            [iOld.tenant],
          );

          const pNewBuild = runCommittedAs(
            c1,
            "authenticated",
            iOld.admin1,
            "select public.change_membership_role($1, $2, 'staff', 'development', true, 'New build with expected_updated_at', $3::timestamptz) as r",
            {
              tenant: iOld.tenant,
              headers: { "x-asym-assignment": iOld.mAdmin1 },
              params: [iOld.tenant, iOld.mTargetDev, initialTs],
            },
          );
          const pOldBuildWindow = runCommittedAs(
            c2,
            "authenticated",
            iOld.admin2,
            "select public.change_membership_role($1, $2, 'staff', 'development', false, 'Old build during release window omitting expected_updated_at') as r",
            {
              tenant: iOld.tenant,
              headers: { "x-asym-assignment": iOld.mAdmin2 },
              params: [iOld.tenant, iOld.mTargetDev],
            },
          );
          await new Promise((r) => setTimeout(r, 120));
          await barrier.query("rollback");
          const [outNew, outOld] = await Promise.all([
            pNewBuild,
            pOldBuildWindow,
          ]);
          expect(outOld.code, outOld.message ?? "").toBeNull();
          expect([null, "40001"]).toContain(outNew.code);
        } finally {
          await barrier.query("rollback").catch(() => undefined);
          await cleanupFixture(barrier, iOld).catch(() => undefined);
        }
      } finally {
        await Promise.all([barrier.end(), c1.end(), c2.end()]);
      }
    });

    it("F1, D-113 & record line 640: serializes issue_admin_invitation vs change_membership_role(is_tenant_admin=true), two admins moving into one revoked sub-role (23505), and racing self-demotions", async () => {
      const barrier = new pg.Client({ connectionString: ADMIN_URL });
      const c1 = new pg.Client({ connectionString: ADMIN_URL });
      const c2 = new pg.Client({ connectionString: ADMIN_URL });
      await Promise.all([barrier.connect(), c1.connect(), c2.connect()]);
      try {
        const i640 = makeIds();
        try {
          await barrier.query("begin");
          await barrier.query(seedFixtureSql(i640));
          await barrier.query("commit");

          const tsDev = String(
            (
              await barrier.query(
                "select updated_at::text as updated_at from authz.memberships where id = $1",
                [i640.mTargetDev],
              )
            ).rows[0]!.updated_at,
          );
          const tsFin = String(
            (
              await barrier.query(
                "select updated_at::text as updated_at from authz.memberships where id = $1",
                [i640.mTargetFin],
              )
            ).rows[0]!.updated_at,
          );

          await barrier.query("begin");
          await barrier.query(
            "select 1 from public.tenants where id = $1 for update",
            [i640.tenant],
          );
          const pMove1 = runCommittedAs(
            c1,
            "authenticated",
            i640.admin1,
            "select public.change_membership_role($1, $2, 'staff', 'hr', false, 'Move dev to hr', $3::timestamptz) as r",
            {
              tenant: i640.tenant,
              headers: { "x-asym-assignment": i640.mAdmin1 },
              params: [i640.tenant, i640.mTargetDev, tsDev],
            },
          );
          const pMove2 = runCommittedAs(
            c2,
            "authenticated",
            i640.admin2,
            "select public.change_membership_role($1, $2, 'staff', 'hr', false, 'Move fin to hr', $3::timestamptz) as r",
            {
              tenant: i640.tenant,
              headers: { "x-asym-assignment": i640.mAdmin2 },
              params: [i640.tenant, i640.mTargetFin, tsFin],
            },
          );
          await new Promise((r) => setTimeout(r, 120));
          await barrier.query("rollback");
          const [m1, m2] = await Promise.all([pMove1, pMove2]);
          const okMoves = [m1, m2].filter((r) => r.code === null);
          const failMoves = [m1, m2].filter((r) => r.code !== null);
          expect(okMoves).toHaveLength(1);
          expect(failMoves).toHaveLength(1);
          expect(failMoves[0]!.code).toBe("23505");
        } finally {
          await barrier.query("rollback").catch(() => undefined);
          await cleanupFixture(barrier, i640).catch(() => undefined);
        }

        const iSelf = makeIds();
        try {
          await barrier.query("begin");
          await barrier.query(seedFixtureSql(iSelf));
          await barrier.query("commit");

          const ts1 = String(
            (
              await barrier.query(
                "select updated_at::text as updated_at from authz.memberships where id = $1",
                [iSelf.mAdmin1],
              )
            ).rows[0]!.updated_at,
          );
          const ts2 = String(
            (
              await barrier.query(
                "select updated_at::text as updated_at from authz.memberships where id = $1",
                [iSelf.mAdmin2],
              )
            ).rows[0]!.updated_at,
          );

          await barrier.query("begin");
          await barrier.query(
            "select 1 from public.tenants where id = $1 for update",
            [iSelf.tenant],
          );
          const pSelf1 = runCommittedAs(
            c1,
            "authenticated",
            iSelf.admin1,
            "select public.change_membership_role($1, $2, 'staff', 'development', false, 'Self demote 1', $3::timestamptz) as r",
            {
              tenant: iSelf.tenant,
              headers: { "x-asym-assignment": iSelf.mAdmin1 },
              params: [iSelf.tenant, iSelf.mAdmin1, ts1],
            },
          );
          const pSelf2 = runCommittedAs(
            c2,
            "authenticated",
            iSelf.admin2,
            "select public.change_membership_role($1, $2, 'staff', 'hr', false, 'Self demote 2', $3::timestamptz) as r",
            {
              tenant: iSelf.tenant,
              headers: { "x-asym-assignment": iSelf.mAdmin2 },
              params: [iSelf.tenant, iSelf.mAdmin2, ts2],
            },
          );
          await new Promise((r) => setTimeout(r, 120));
          await barrier.query("rollback");
          const [s1, s2] = await Promise.all([pSelf1, pSelf2]);
          expect([s1, s2].filter((r) => r.code === null)).toHaveLength(1);
          expect([s1, s2].filter((r) => r.code === "42501")).toHaveLength(1);
          const adminsLeft = (
            await barrier.query(
              "select count(*)::int as c from authz.memberships where tenant_id = $1 and is_active and revoked_at is null and is_tenant_admin",
              [iSelf.tenant],
            )
          ).rows[0]!.c;
          expect(adminsLeft).toBe(1);
        } finally {
          await barrier.query("rollback").catch(() => undefined);
          await cleanupFixture(barrier, iSelf).catch(() => undefined);
        }

        const iF1 = makeIds();
        try {
          await barrier.query("begin");
          await barrier.query(seedFixtureSql(iF1));
          const opInv = await barrier.query(
            `select invitation_id
               from tenant_guard.issue_membership_invitation(
                 $1, $2, 'staff'::authz.membership_role, 'development'::authz.staff_role, true,
                 'operator_admin_invite', 'operator_handoff', $3, 'Pre-existing op invite', interval '24 hours'
               )`,
            [
              iF1.tenant,
              `r-target-${iF1.tenant.slice(0, 8)}@example.org`,
              iF1.operatorUser,
            ],
          );
          const opInvId = String(opInv.rows[0]!.invitation_id);
          await barrier.query("commit");

          const tsTarget = String(
            (
              await barrier.query(
                "select updated_at::text as updated_at from authz.memberships where id = $1",
                [iF1.mTargetDev],
              )
            ).rows[0]!.updated_at,
          );

          await barrier.query("begin");
          await barrier.query(
            "select 1 from public.tenants where id = $1 for update",
            [iF1.tenant],
          );
          const pPromote = runCommittedAs(
            c1,
            "authenticated",
            iF1.admin1,
            "select public.change_membership_role($1, $2, 'staff', 'development', true, 'Promote target to admin', $3::timestamptz) as r",
            {
              tenant: iF1.tenant,
              headers: { "x-asym-assignment": iF1.mAdmin1 },
              params: [iF1.tenant, iF1.mTargetDev, tsTarget],
            },
          );
          const pOpIssue = runCommittedAs(
            c2,
            "authenticated",
            iF1.operatorUser,
            "select public.issue_admin_invitation($1, $2, 'hr', 'Racing operator invite') as r",
            {
              aal: "aal2",
              params: [
                iF1.tenant,
                `r-target-${iF1.tenant.slice(0, 8)}@example.org`,
              ],
            },
          );
          await new Promise((r) => setTimeout(r, 120));
          await barrier.query("rollback");
          const [promOut, opOut] = await Promise.all([pPromote, pOpIssue]);
          expect(promOut.code, promOut.message ?? "").toBeNull();
          expect(opOut.code).toBe("42501");

          const invState = await barrier.query(
            "select status from public.membership_invitations where id = $1",
            [opInvId],
          );
          expect(invState.rows[0]!.status).toBe("revoked");

          const invariant = (
            await barrier.query(
              `select
                 exists (select 1 from authz.memberships m where m.tenant_id = $1 and m.is_active and m.revoked_at is null and m.is_tenant_admin) as has_admin,
                 exists (select 1 from public.membership_invitations mi where mi.tenant_id = $1 and mi.purpose = 'operator_admin_invite' and mi.status = 'issued') as has_live_op_invite`,
              [iF1.tenant],
            )
          ).rows[0] as { has_admin: boolean; has_live_op_invite: boolean };
          expect(invariant.has_admin && invariant.has_live_op_invite).toBe(
            false,
          );
        } finally {
          await barrier.query("rollback").catch(() => undefined);
          await cleanupFixture(barrier, iF1).catch(() => undefined);
        }
      } finally {
        await Promise.all([barrier.end(), c1.end(), c2.end()]);
      }
    });

    it("R17: revoke_membership against change_membership_role (both orders) never deadlocks (40P01)", async () => {
      const i = makeIds();
      const observer = new pg.Client({ connectionString: ADMIN_URL });
      const c1 = new pg.Client({ connectionString: ADMIN_URL });
      const c2 = new pg.Client({ connectionString: ADMIN_URL });
      await Promise.all([observer.connect(), c1.connect(), c2.connect()]);
      const waitForLock = async (pid: number) => {
        for (let attempt = 0; attempt < 150; attempt += 1) {
          const res = await observer.query<{ wait_event_type: string | null }>(
            "select wait_event_type from pg_stat_activity where pid = $1",
            [pid],
          );
          if (res.rows[0]?.wait_event_type === "Lock") return;
          await new Promise((r) => setTimeout(r, 20));
        }
        throw new Error("Timed out waiting for concurrent session lock wait");
      };
      try {
        await observer.query("begin");
        await observer.query(seedFixtureSql(i));
        await observer.query("commit");

        const tsTargetDev = String(
          (
            await observer.query(
              "select updated_at::text as updated_at from authz.memberships where id = $1",
              [i.mTargetDev],
            )
          ).rows[0]!.updated_at,
        );
        const c2Pid = Number(
          (await c2.query<{ pid: number }>("select pg_backend_pid() as pid"))
            .rows[0]!.pid,
        );

        await c1.query("begin");
        await c1.query(
          `select 1 from authz.memberships
            where tenant_id = $1
              and ((is_tenant_admin and is_active) or id = $2 or id = $3)
            order by id
              for update`,
          [i.tenant, i.mAdmin2, i.mTargetFin],
        );
        const order1Role = runCommittedAs(
          c2,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'member_care', false, 'R17 role vs revoke order 1', $3::timestamptz) as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, i.mTargetDev, tsTargetDev],
          },
        );
        await waitForLock(c2Pid);
        const order1Revoke = await runAs(
          c1,
          "authenticated",
          i.admin2,
          "select public.revoke_membership($1, $2, 'R17 revoke vs role order 1') as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin2 },
            params: [i.tenant, i.mTargetFin],
          },
        );
        await c1.query("commit");
        const order1RoleOut = await order1Role;
        expect(order1Revoke.code, order1Revoke.message ?? "").toBeNull();
        expect(order1RoleOut.code, order1RoleOut.message ?? "").toBeNull();

        const updatedDev = order1RoleOut.rows[0]!.r as Record<string, string>;
        await c1.query("begin");
        const order2Role = await runAs(
          c1,
          "authenticated",
          i.admin1,
          "select public.change_membership_role($1, $2, 'staff', 'mobilizer', false, 'R17 role vs revoke order 2', $3::timestamptz) as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin1 },
            params: [i.tenant, updatedDev.membership_id, updatedDev.updated_at],
          },
        );
        expect(order2Role.code, order2Role.message ?? "").toBeNull();
        const order2Revoke = runCommittedAs(
          c2,
          "authenticated",
          i.admin2,
          "select public.revoke_membership($1, $2, 'R17 revoke vs role order 2') as r",
          {
            tenant: i.tenant,
            headers: { "x-asym-assignment": i.mAdmin2 },
            params: [i.tenant, i.mAdmin1Second],
          },
        );
        await waitForLock(c2Pid);
        await c1.query("commit");
        const order2RevokeOut = await order2Revoke;
        expect(order2RevokeOut.code, order2RevokeOut.message ?? "").toBeNull();
      } finally {
        await c1.query("rollback").catch(() => undefined);
        await c2.query("rollback").catch(() => undefined);
        await cleanupFixture(observer, i).catch(() => undefined);
        await Promise.all([observer.end(), c1.end(), c2.end()]);
      }
    });
  },
);
