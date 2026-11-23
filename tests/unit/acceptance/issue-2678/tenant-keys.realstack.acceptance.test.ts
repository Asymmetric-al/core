import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  fixtureIds,
  fixtureSql,
  migration,
  preflight,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const KEYS = migration("_tenant_keys_on_activity_tables");

describe.skipIf(!ADMIN_URL)(
  "AL-2678 tenant keys on donor_activities, follower_requests and missionary_tasks (NR-12, record lines 593 and 594)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id));
      await db.query(
        "update public.donors set missionary_id = $1 where id = any($2::uuid[])",
        [id.UM, [id.dA, id.dAB, id.dC]],
      );
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    async function code(sql: string, params: unknown[] = []) {
      await db.query("savepoint probe");
      try {
        await db.query(sql, params);
        return null;
      } catch (e) {
        return (e as { code?: string }).code ?? "?";
      } finally {
        await db.query("rollback to savepoint probe");
      }
    }

    it("each table has tenant_id NOT NULL keyed to tenants with RESTRICT, a same-tenant donor key, and forced row security; sort_key is double precision", async () => {
      const columns =
        await db.query(`select table_name, column_name, is_nullable, data_type from information_schema.columns
         where table_schema = 'public' and ((column_name = 'tenant_id' and table_name in ('donor_activities', 'follower_requests', 'missionary_tasks'))
            or (table_name = 'missionary_tasks' and column_name = 'sort_key')) order by 1, 2`);
      expect(columns.rows).toEqual([
        {
          table_name: "donor_activities",
          column_name: "tenant_id",
          is_nullable: "NO",
          data_type: "uuid",
        },
        {
          table_name: "follower_requests",
          column_name: "tenant_id",
          is_nullable: "NO",
          data_type: "uuid",
        },
        {
          table_name: "missionary_tasks",
          column_name: "sort_key",
          is_nullable: "YES",
          data_type: "double precision",
        },
        {
          table_name: "missionary_tasks",
          column_name: "tenant_id",
          is_nullable: "NO",
          data_type: "uuid",
        },
      ]);
      const keys =
        await db.query(`select c.conrelid::regclass::text t, c.conname, c.confrelid::regclass::text target, c.confdeltype,
          (select array_agg(a.attname::text order by k.n) from unnest(c.conkey) with ordinality k(attnum, n) join pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.attnum) cols
        from pg_constraint c where c.contype = 'f' and c.conrelid in ('public.donor_activities'::regclass, 'public.follower_requests'::regclass, 'public.missionary_tasks'::regclass)
          and c.confrelid in ('public.tenants'::regclass, 'public.donors'::regclass) order by 1, 2`);
      expect(keys.rows).toEqual([
        {
          t: "donor_activities",
          conname: "donor_activities_donor_same_tenant_fk",
          target: "donors",
          confdeltype: "a",
          cols: ["tenant_id", "donor_id"],
        },
        {
          t: "donor_activities",
          conname: "donor_activities_tenant_id_fkey",
          target: "tenants",
          confdeltype: "r",
          cols: ["tenant_id"],
        },
        {
          t: "follower_requests",
          conname: "follower_requests_donor_same_tenant_fk",
          target: "donors",
          confdeltype: "a",
          cols: ["tenant_id", "donor_id"],
        },
        {
          t: "follower_requests",
          conname: "follower_requests_tenant_id_fkey",
          target: "tenants",
          confdeltype: "r",
          cols: ["tenant_id"],
        },
        {
          t: "missionary_tasks",
          conname: "missionary_tasks_donor_id_fkey",
          target: "donors",
          confdeltype: "a",
          cols: ["tenant_id", "donor_id"],
        },
        {
          t: "missionary_tasks",
          conname: "missionary_tasks_tenant_id_fkey",
          target: "tenants",
          confdeltype: "r",
          cols: ["tenant_id"],
        },
      ]);
      const rls =
        await db.query(`select relname, relrowsecurity, relforcerowsecurity from pg_class
        where oid in ('public.donor_activities'::regclass, 'public.follower_requests'::regclass, 'public.missionary_tasks'::regclass, 'private.missionary_tasks_unresolved_tenant'::regclass) order by 1`);
      for (const row of rls.rows)
        expect(
          [row.relrowsecurity, row.relforcerowsecurity],
          row.relname,
        ).toEqual([true, true]);
      const grants =
        await db.query(`select has_table_privilege('authenticated', 'private.missionary_tasks_unresolved_tenant', 'SELECT') a,
        has_table_privilege('anon', 'private.missionary_tasks_unresolved_tenant', 'SELECT') b,
        to_regprocedure('authz.missionary_task_single_tenant(uuid, uuid)') helper`);
      expect(grants.rows).toEqual([{ a: false, b: false, helper: null }]);
    });

    it("a row naming another tenant's donor is refused for every writer (23503)", async () => {
      expect(
        await code(
          "insert into public.donor_activities (tenant_id, donor_id, type, title) values ($1, $2, 'note', 'x')",
          [id.TB, id.dA],
        ),
      ).toBe("23503");
      expect(
        await code(
          "insert into public.follower_requests (tenant_id, donor_id, missionary_id) values ($1, $2, $3)",
          [id.TB, id.dA, id.UM],
        ),
      ).toBe("23503");
      expect(
        await code(
          "insert into public.missionary_tasks (tenant_id, donor_id, missionary_id, title) values ($1, $2, $3, 'x')",
          [id.TB, id.dA, id.UM],
        ),
      ).toBe("23503");
      expect(
        await code(
          "insert into public.missionary_tasks (donor_id, missionary_id, title) values ($1, $2, 'x')",
          [id.dA, id.UM],
        ),
      ).toBe("23502");
    });

    it("the old task writes and reads keep their signatures: integer and fractional keys, with and without a donor, each tenant on its own (record lines 593, 594)", async () => {
      const write = async (
        tenant: string,
        assignment: string,
        op: string,
        taskId: string | null,
        patch: object,
      ) =>
        (
          await db.query(
            "select * from public.missionary_task_write($1, $2, $3, $4, $5, $6::jsonb)",
            [id.UM, tenant, assignment, op, taskId, JSON.stringify(patch)],
          )
        ).rows;
      const read = async (tenant: string, assignment: string) =>
        (
          await db.query(
            "select * from public.missionary_owned_tasks($1, $2, $3) order by sort_key",
            [id.UM, tenant, assignment],
          )
        ).rows;

      const [withDonor] = await write(id.TA, id.mM, "create", null, {
        title: "Call",
        donor_id: id.dA,
        sort_key: 100,
      });
      const [donorlessA] = await write(id.TA, id.mM, "create", null, {
        title: "Pray A",
        sort_key: 15.5,
      });
      const [donorlessB] = await write(id.TB, id.mMB, "create", null, {
        title: "Pray B",
        sort_key: 7.25,
      });
      expect([
        withDonor.tenant_id,
        withDonor.donor_id,
        withDonor.sort_key,
      ]).toEqual([id.TA, id.dA, 100]);
      expect([
        donorlessA.tenant_id,
        donorlessA.donor_id,
        donorlessA.sort_key,
      ]).toEqual([id.TA, null, 15.5]);
      expect([donorlessB.tenant_id, donorlessB.sort_key]).toEqual([
        id.TB,
        7.25,
      ]);
      expect(
        await write(id.TA, id.mM, "create", null, {
          title: "Foreign donor",
          donor_id: id.dAB,
        }),
      ).toEqual([]);

      expect(
        (await read(id.TA, id.mM)).map((t) => [t.title, t.sort_key]),
      ).toEqual([
        ["Pray A", 15.5],
        ["Call", 100],
      ]);
      expect((await read(id.TB, id.mMB)).map((t) => t.title)).toEqual([
        "Pray B",
      ]);
      expect(await read(id.TA, id.mMB)).toEqual([]);

      const [moved] = await write(id.TA, id.mM, "update", donorlessA.id, {
        sort_key: 57.75,
        title: "Pray A again",
      });
      expect([moved.sort_key, moved.title, moved.tenant_id]).toEqual([
        57.75,
        "Pray A again",
        id.TA,
      ]);
      expect(
        await write(id.TB, id.mMB, "update", donorlessA.id, {
          title: "Across",
        }),
      ).toEqual([]);
      const [cleared] = await write(id.TA, id.mM, "update", withDonor.id, {
        donor_id: null,
      });
      expect(cleared.donor_id).toBeNull();
      expect(await write(id.TB, id.mMB, "delete", donorlessA.id, {})).toEqual(
        [],
      );
      expect(
        (await write(id.TA, id.mM, "delete", donorlessA.id, {})).map(
          (t) => t.id,
        ),
      ).toEqual([donorlessA.id]);
    });

    it("the old activity and follower-request functions write and read inside the selected tenant only", async () => {
      const [activity] = (
        await db.query(
          "select * from public.missionary_activity_create($1, $2, $3, $4, 'note', 'Called', 'Thanked them', now())",
          [id.UM, id.TA, id.mM, id.dA],
        )
      ).rows;
      expect([activity.tenant_id, activity.donor_id, activity.title]).toEqual([
        id.TA,
        id.dA,
        "Called",
      ]);
      expect(
        (
          await db.query(
            "select * from public.missionary_activity_create($1, $2, $3, $4, 'note', 'x', null, now())",
            [id.UM, id.TA, id.mM, id.dAB],
          )
        ).rows,
      ).toEqual([]);
      const listed = await db.query(
        "select id, tenant_id from public.missionary_activities($1, $2, $3, $4::uuid[])",
        [id.UM, id.TA, id.mM, [id.dA, id.dAB]],
      );
      expect(listed.rows.every((r) => r.tenant_id === id.TA)).toBe(true);
      expect(listed.rows.map((r) => r.id)).toContain(activity.id);

      const requests = await db.query(
        "insert into public.follower_requests (tenant_id, donor_id, missionary_id) values ($1, $2, $4), ($3, $5, $4) returning id, tenant_id",
        [id.TA, id.dA, id.TB, id.UM, id.dAB],
      );
      const [inA, inB] = requests.rows as { id: string; tenant_id: string }[];
      const list = async (tenant: string, assignment: string) =>
        (
          await db.query(
            "select id from public.missionary_follower_requests($1, $2, $3)",
            [id.UM, tenant, assignment],
          )
        ).rows.map((r) => r.id);
      expect(await list(id.TA, id.mM)).toEqual([inA!.id]);
      expect(await list(id.TB, id.mMB)).toEqual([inB!.id]);
      const resolve = async (
        tenant: string,
        assignment: string,
        request: string,
        op: string,
      ) =>
        (
          await db.query(
            "select id, status from public.missionary_follower_request_write($1, $2, $3, $4, $5, 'approved', 'comment')",
            [id.UM, tenant, assignment, op, request],
          )
        ).rows;
      expect(await resolve(id.TA, id.mM, inB!.id, "update")).toEqual([]);
      expect(await resolve(id.TA, id.mM, inA!.id, "update")).toEqual([
        { id: inA!.id, status: "approved" },
      ]);
      expect(await resolve(id.TB, id.mMB, inA!.id, "delete")).toEqual([]);
    });

    it("the migration's preflight refuses an activity whose donor names no tenant, with counts only", async () => {
      await db.query("savepoint planted");
      let error: { code?: string; message?: string } = {};
      try {
        await db.query(
          "alter table public.donor_activities drop constraint donor_activities_donor_same_tenant_fk",
        );
        await db.query(
          "insert into public.donor_activities (tenant_id, donor_id, type, title) values ($1, gen_random_uuid(), 'note', 'orphan')",
          [id.TA],
        );
        await db.query(preflight(KEYS, "activity-tenants"));
      } catch (e) {
        error = e as typeof error;
      } finally {
        await db.query("rollback to savepoint planted");
      }
      expect(error.code).toBe("23502");
      expect(error.message).toMatch(
        /^preflight failed: 1 donor activities, 0 follower requests and 0 tasks/,
      );
    });
  },
);
