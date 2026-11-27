import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { delta, readReport } from "./assignment-keys.helpers";
import { ADMIN_URL, IN_MIGRATE_JOB } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r3, the ruler's interleaving on two connections",
  () => {
    const T = randomUUID();
    const P = randomUUID();
    const R = randomUUID();
    const M = randomUUID();
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const c1 = new pg.Client({ connectionString: ADMIN_URL });
    const c2 = new pg.Client({ connectionString: ADMIN_URL });

    beforeAll(async () => {
      for (const client of [admin, c1, c2]) await client.connect();
      await admin.query("begin");
      await admin.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678r3 C', 'acc2678r3-' || $1::text)",
        [T],
      );
      await admin.query(
        "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'C', 'US', 'usd', 'C')",
        [T],
      );
      await admin.query(
        `insert into auth.users (id, email, email_confirmed_at) select u, 'acc2678r3-c-' || u || '@example.test', now() from unnest($1::uuid[]) u`,
        [[P, R]],
      );
      await admin.query(
        "delete from authz.memberships where user_id = any($1::uuid[])",
        [[P, R]],
      );
      await admin.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Worker C')",
        [M, T],
      );
      await admin.query(
        "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $1, $3, $2)",
        [M, T, P],
      );
      await admin.query("commit");
    });

    afterAll(async () => {
      const failures: string[] = [];
      for (const client of [c1, c2])
        try {
          await client.query("rollback");
        } catch (e) {
          failures.push(String(e));
        }
      for (const [sql, params] of [
        ["delete from public.audit_logs where tenant_id = $1", [T]],
        ["delete from public.posts where tenant_id = $1", [T]],
        ["delete from public.missionaries where tenant_id = $1", [T]],
        ["delete from public.parties where tenant_id = $1", [T]],
        ["delete from public.legal_entities where tenant_id = $1", [T]],
        [
          "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
          [T, [P, R]],
        ],
        ["delete from public.tenants where id = $1", [T]],
        ["delete from auth.users where id = any($1::uuid[])", [[P, R]]],
      ] as const)
        try {
          await admin.query(sql, [...params]);
        } catch (e) {
          failures.push(`${sql}: ${String(e)}`);
        }
      for (const client of [admin, c1, c2]) await client.end();
      expect(failures, "the interleaving fixture's cleanup").toEqual([]);
    });

    it("8. C1 writes a post for (TC, P) and holds it; C2, as owner, re-links MC to R and commits without waiting; C1 commits a key that no longer names P's sole worker. The count shows it invalid, the repair returns that one change (to NULL), then nothing (red: 42703)", async () => {
      await c2.query("set lock_timeout = '2s'");
      await c1.query("begin");
      const created = await c1.query(
        "select public.atomic_create_post_with_audit(p_tenant_id => $1, p_missionary_id => $2, p_content => 'acc2678r3 interleaved') as r",
        [T, P],
      );
      const post = created.rows[0].r.post_id as string;
      expect(
        (
          await c1.query(
            "select ministry_assignment_id as a from public.posts where id = $1",
            [post],
          )
        ).rows[0].a,
      ).toBe(M);
      const before = await readReport(admin);
      await c2.query("begin");
      await c2.query(
        "update public.missionaries set profile_id = $2 where id = $1",
        [M, R],
      );
      await c2.query("commit");
      await c1.query("commit");
      expect(delta(await readReport(admin), before, "posts")).toMatchObject({
        total: 1,
        invalid: 1,
        valid: 0,
      });
      expect(
        (
          await admin.query(
            "select * from private.repair_ministry_assignment_ids()",
          )
        ).rows,
      ).toEqual([
        {
          table_name: "posts",
          row_id: post,
          tenant_id: T,
          old_assignment_id: M,
          new_assignment_id: null,
        },
      ]);
      expect(
        (
          await admin.query(
            "select * from private.repair_ministry_assignment_ids()",
          )
        ).rows,
      ).toEqual([]);
    });
  },
);
