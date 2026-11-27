import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  delta,
  FUNCTIONS,
  lines,
  PARTITION,
  readReport,
  REPAIR_REFUSAL,
  REPORT_REFUSAL,
  TABLES,
  type Table,
} from "./assignment-keys.helpers";
import { ADMIN_URL, IN_MIGRATE_JOB, fixtureIds, fixtureSql } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r3: the assignment key on donors, posts, follows, follower_requests and missionary_tasks (plan line 997; Q1 conditions 1-2; Q3; rulings Q-r3-1 to Q-r3-4)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = fixtureIds();
    const x = Object.fromEntries(
      ["UQ", "UR", "pQ1", "pQ2", "mQ1", "mQ2"].map((k) => [k, randomUUID()]),
    ) as Record<"UQ" | "UR" | "pQ1" | "pQ2" | "mQ1" | "mQ2", string>;

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id));
      await db.query(
        `insert into auth.users (id, email, email_confirmed_at) select u, 'acc2678r3-' || u || '@example.test', now() from unnest($1::uuid[]) u`,
        [[x.UQ, x.UR]],
      );
      await db.query(
        "delete from authz.memberships where user_id = any($1::uuid[])",
        [[x.UQ, x.UR]],
      );
      await db.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $3, 'Q one'), ($2, $3, 'Q two')",
        [x.pQ1, x.pQ2, id.TA],
      );
      await db.query(
        "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $3, $4, $6, $3), ($2, $3, $5, $6, $3)",
        [x.mQ1, x.mQ2, id.TA, x.pQ1, x.pQ2, x.UQ],
      );
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    async function within<T>(body: () => Promise<T>): Promise<T> {
      await db.query("savepoint r3");
      try {
        return await body();
      } finally {
        await db.query("rollback to savepoint r3");
      }
    }

    async function failure(sql: string, params: unknown[] = []) {
      await db.query("savepoint probe");
      try {
        await db.query(sql, params);
        return null;
      } catch (e) {
        const err = e as { code?: string; message?: string };
        return { code: err.code ?? "?", message: err.message ?? "" };
      } finally {
        await db.query("rollback to savepoint probe");
      }
    }

    const INSERT: Record<Table, string> = {
      donors:
        "insert into public.donors (id, tenant_id, party_id, missionary_id, name) values ($1, $2, case when $2::uuid is null then null else public.donor_party_for_insert($2::uuid, null, 'acc2678r3', null) end, $3, 'acc2678r3')",
      posts:
        "insert into public.posts (id, tenant_id, missionary_id, content) values ($1, $2, $3, 'acc2678r3')",
      follows:
        "insert into public.follows (id, tenant_id, missionary_id) values ($1, $2, $3)",
      follower_requests:
        "insert into public.follower_requests (id, tenant_id, missionary_id) values ($1, $2, $3)",
      missionary_tasks:
        "insert into public.missionary_tasks (id, tenant_id, missionary_id, title) values ($1, $2, $3, 'acc2678r3')",
    };

    async function child(
      table: Table,
      tenant: string | null,
      profile: string | null,
    ) {
      const rowId = randomUUID();
      await db.query(INSERT[table], [rowId, tenant, profile]);
      return rowId;
    }

    async function keyOf(table: Table, rowId: string) {
      const result = await db.query(
        `select ministry_assignment_id as a from public.${table} where id = $1`,
        [rowId],
      );
      expect(result.rows, `${table} ${rowId}`).toHaveLength(1);
      return result.rows[0].a as string | null;
    }

    async function plant(table: Table, rowId: string, key: string | null) {
      await db.query(
        `alter table public.${table} disable trigger zz_wp5_assignment_key_update`,
      );
      await db.query(
        `update public.${table} set ministry_assignment_id = $2 where id = $1`,
        [rowId, key],
      );
      await db.query(
        `alter table public.${table} enable trigger zz_wp5_assignment_key_update`,
      );
    }

    async function liveWrites() {
      const post = await db.query(
        "select public.atomic_create_post_with_audit(p_tenant_id => $1, p_missionary_id => $2, p_content => 'acc2678r3') as r",
        [id.TA, id.UM],
      );
      const task = await db.query(
        "select id from public.missionary_task_write($1, $2, $3, 'create', null, $4::jsonb)",
        [id.UM, id.TA, id.mM, JSON.stringify({ title: "acc2678r3" })],
      );
      return {
        post: await keyOf("posts", post.rows[0].r.post_id as string),
        task: await keyOf("missionary_tasks", task.rows[0].id as string),
      };
    }

    it("1. derives the key on insert, through each table's live writer or as owner where it has none: a post, a task, a follow and a follower request for (TA, P) get MA, an owner-written donor gets MA, and a saga donor, which names no worker, gets NULL (red: 42703)", async () => {
      await within(async () => {
        const giver = randomUUID();
        await db.query(
          "insert into auth.users (id, email) values ($1::uuid, 'acc2678r3-giver-' || $1::text || '@example.test')",
          [giver],
        );
        await db.query(
          "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 500, p_idempotency_key => $3)",
          [id.TA, giver, randomUUID()],
        );
        const saga = await db.query(
          "select id from public.donors where tenant_id = $1 and profile_id = $2",
          [id.TA, giver],
        );
        const written = await liveWrites();
        expect({
          ...written,
          sagaDonor: await keyOf("donors", saga.rows[0].id as string),
          ownerDonor: await keyOf(
            "donors",
            await child("donors", id.TA, id.UM),
          ),
          follow: await keyOf("follows", await child("follows", id.TA, id.UM)),
          request: await keyOf(
            "follower_requests",
            await child("follower_requests", id.TA, id.UM),
          ),
        }).toEqual({
          post: id.mA,
          task: id.mA,
          sagaDonor: null,
          ownerDonor: id.mA,
          follow: id.mA,
          request: id.mA,
        });
        expect(id.mA).not.toBe(id.UM);
      });
    });

    const INSERT_WITH_KEY: Record<Table, string> = {
      donors:
        "insert into public.donors (id, tenant_id, party_id, missionary_id, ministry_assignment_id, name) values ($1, $2, case when $2::uuid is null then null else public.donor_party_for_insert($2::uuid, null, 'acc2678r3', null) end, $3, $4, 'acc2678r3')",
      posts:
        "insert into public.posts (id, tenant_id, missionary_id, ministry_assignment_id, content) values ($1, $2, $3, $4, 'acc2678r3')",
      follows:
        "insert into public.follows (id, tenant_id, missionary_id, ministry_assignment_id) values ($1, $2, $3, $4)",
      follower_requests:
        "insert into public.follower_requests (id, tenant_id, missionary_id, ministry_assignment_id) values ($1, $2, $3, $4)",
      missionary_tasks:
        "insert into public.missionary_tasks (id, tenant_id, missionary_id, ministry_assignment_id, title) values ($1, $2, $3, $4, 'acc2678r3')",
    };

    it("1b. an insert that supplies the key gets the derived one instead, without an error, on every table: MB supplied for (TA, P) gives MA, MA supplied for (TA, R) gives NULL, MA supplied with no profile gives NULL (Q-r3-4; red: 42703)", async () => {
      await within(async () => {
        const cases: [string | null, string, string | null][] = [
          [id.UM, id.mB, id.mA],
          [x.UR, id.mA, null],
          [null, id.mA, null],
        ];
        for (const table of TABLES)
          for (const [profile, supplied, derived] of cases) {
            const row = randomUUID();
            await db.query(INSERT_WITH_KEY[table], [
              row,
              id.TA,
              profile,
              supplied,
            ]);
            expect(
              await keyOf(table, row),
              `${table}: profile ${profile}, supplied ${supplied}`,
            ).toBe(derived);
          }
      });
    });

    it("2. re-derives on every change of T, P or A: T to TB gives MB (a donor moves with a Party of TB, which its key to parties requires), P to R gives NULL, and an A set or cleared by hand returns to the derived one without an error (Q-r3-4; red: 42703)", async () => {
      await within(async () => {
        const partyB = randomUUID();
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Donor moved to B')",
          [partyB, id.TB],
        );
        for (const table of TABLES) {
          const row = await child(table, id.TA, id.UM);
          expect(await keyOf(table, row), `${table} insert`).toBe(id.mA);
          if (table === "donors")
            await db.query(
              "update public.donors set tenant_id = $2, party_id = $3 where id = $1",
              [row, id.TB, partyB],
            );
          else
            await db.query(
              `update public.${table} set tenant_id = $2 where id = $1`,
              [row, id.TB],
            );
          const derived = id.mB;
          expect(await keyOf(table, row), `${table} T to TB`).toBe(derived);
          await db.query(
            `update public.${table} set missionary_id = $2 where id = $1`,
            [row, x.UR],
          );
          expect(await keyOf(table, row), `${table} P to R`).toBeNull();
          await db.query(
            `update public.${table} set missionary_id = $2 where id = $1`,
            [row, id.UM],
          );
          expect(await keyOf(table, row), `${table} P back`).toBe(derived);
          for (const byHand of [derived === id.mA ? id.mB : id.mA, null]) {
            await db.query(
              `update public.${table} set ministry_assignment_id = $2 where id = $1`,
              [row, byHand],
            );
            expect(await keyOf(table, row), `${table} A ${byHand}`).toBe(
              derived,
            );
          }
        }
      });
    });

    it("3. absent, ambiguous and null-tenant rows get NULL, and the report's seven columns partition each table's total exactly; the missionaries row counts the worker rows that share a tenant and profile (red: 42883)", async () => {
      await within(async () => {
        const before = await readReport(db);
        const rows: Record<string, string> = {};
        for (const table of TABLES) {
          rows[`${table} absent`] = await child(table, id.TA, x.UR);
          rows[`${table} ambiguous`] = await child(table, id.TA, x.UQ);
          rows[`${table} unowned`] = await child(table, id.TA, null);
          rows[`${table} sole`] = await child(table, id.TA, id.UM);
          if (["donors", "posts", "follows"].includes(table))
            rows[`${table} null tenant`] = await child(table, null, id.UM);
        }
        for (const [label, row] of Object.entries(rows)) {
          const [table] = label.split(" ") as [Table];
          expect(await keyOf(table, row), label).toBe(
            label.endsWith("sole") ? id.mA : null,
          );
        }
        const parties = [randomUUID(), randomUUID()];
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $3, 'R one'), ($2, $3, 'R two')",
          [...parties, id.TB],
        );
        await db.query(
          "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $4, $1), ($1, $3, $4, $1)",
          [id.TB, ...parties, x.UR],
        );
        const after = await readReport(db);
        expect(Object.keys(after).sort()).toEqual(
          [...TABLES, "missionaries"].sort(),
        );
        for (const table of TABLES) {
          const nullTenant = ["donors", "posts", "follows"].includes(table)
            ? 1
            : 0;
          expect(delta(after, before, table), table).toEqual({
            total: 4 + nullTenant,
            unowned: 1,
            null_tenant: nullTenant,
            absent: 1,
            ambiguous: 1,
            pending: 0,
            valid: 1,
            invalid: 0,
            asymmetric: 0,
          });
          const row = after[table]!;
          expect(
            PARTITION.reduce((sum, key) => sum + row[key]!, 0),
            `${table} partition`,
          ).toBe(row.total);
          expect(row.asymmetric!).toBeLessThanOrEqual(row.invalid!);
        }
        expect(delta(after, before, "missionaries")).toMatchObject({
          total: 2,
          ambiguous: 2,
        });
      });
    });

    it.each([
      [
        "42883",
        "drop function private.assignment_for_profile(uuid, uuid)",
        "select private.assignment_for_profile($1, $2)",
      ],
      [
        "42703",
        "alter table public.missionaries rename column profile_id to x",
        "select private.assignment_for_profile($1, $2)",
      ],
      [
        "42501",
        "create role {fresh} nologin; alter function private.derive_ministry_assignment_id() owner to {fresh}",
        "set local role {fresh}; select private.assignment_for_profile($1, $2)",
      ],
    ])(
      "4. no live write is refused: when the lookup raises %s (%s), the post writer and the task writer still succeed, with A NULL (Q3's condition; red: 42703 on A)",
      async (code, setup, cause) => {
        const fresh = `acc2678r3_${randomUUID().replaceAll("-", "")}`;
        await within(async () => {
          await db.query(setup.replaceAll("{fresh}", fresh));
          const raised = await (async () => {
            await db.query("savepoint cause");
            try {
              const parts = cause.replaceAll("{fresh}", fresh).split("; ");
              for (const part of parts.slice(0, -1)) await db.query(part);
              await db.query(parts.at(-1)!, [id.TA, id.UM]);
              return null;
            } catch (e) {
              return (e as { code?: string }).code;
            } finally {
              await db.query("rollback to savepoint cause");
            }
          })();
          expect(raised, "the cause raises the code on its own").toBe(code);
          expect(await liveWrites()).toEqual({ post: null, task: null });
        });
      },
    );

    it("4. a guard: a lookup that is cancelled is not caught, so a statement timeout under the trigger still stops the write (57014)", async () => {
      await within(async () => {
        await db.query(
          "create or replace function private.assignment_for_profile(p_tenant_id uuid, p_profile_id uuid) returns uuid language sql volatile set search_path = '' as $$ select null::uuid from pg_catalog.pg_sleep(5) $$",
        );
        await db.query("set local statement_timeout = '300ms'");
        expect(
          await failure(
            "select public.atomic_create_post_with_audit(p_tenant_id => $1, p_missionary_id => $2, p_content => 'acc2678r3')",
            [id.TA, id.UM],
          ),
        ).toMatchObject({ code: "57014" });
      });
    });

    it("5. a change of a worker row re-derives its children: a second row for (TA, P) clears MA's children and deleting it restores them; re-linking MA to R moves the key from P's children to R's; deleting MA leaves no child on it; and the live writes of a worker row change no child (red: 42703)", async () => {
      await within(async () => {
        const ofP = {} as Record<Table, string>;
        const ofR = {} as Record<Table, string>;
        for (const table of TABLES) {
          ofP[table] = await child(table, id.TA, id.UM);
          ofR[table] = await child(table, id.TA, x.UR);
        }
        const keys = async (rows: Record<Table, string>) => {
          const out: Record<string, string | null> = {};
          for (const table of TABLES)
            out[table] = await keyOf(table, rows[table]);
          return out;
        };
        const all = (value: string | null) =>
          Object.fromEntries(TABLES.map((table) => [table, value]));
        const versions = async () => {
          const out: string[] = [];
          for (const table of TABLES)
            out.push(
              ...(
                await db.query(
                  `select id::text || ':' || xmin::text || ':' || ctid::text as v from public.${table} where ministry_assignment_id is not null or missionary_id is not null order by id`,
                )
              ).rows.map((row: { v: string }) => `${table}:${row.v}`),
            );
          return out;
        };

        expect(await keys(ofP)).toEqual(all(id.mA));
        const untouched = await versions();
        await db.query(
          "select public.atomic_update_missionary_with_audit($1, $2, $1, $3::jsonb, null, null)",
          [id.UM, id.TA, JSON.stringify({ bio: "acc2678r3" })],
        );
        await db.query(
          "select * from public.missionary_own_record_write($1, $2, $3, $4::jsonb)",
          [id.UM, id.TA, id.mM, JSON.stringify({ tagline: "acc2678r3" })],
        );
        await db.query(
          "update public.missionaries as ms set manual_attention = true where ms.tenant_id = $1 and ms.id = $2",
          [id.TA, id.mA],
        );
        expect(
          await versions(),
          "the live parent writes change no child",
        ).toEqual(untouched);

        const second = randomUUID();
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Second row of P')",
          [second, id.TA],
        );
        await db.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $1, $3, $2)",
          [second, id.TA, id.UM],
        );
        expect(await keys(ofP), "a second row for (TA, P)").toEqual(all(null));
        await db.query("delete from public.missionaries where id = $1", [
          second,
        ]);
        expect(await keys(ofP), "the second row deleted").toEqual(all(id.mA));

        await db.query(
          "update public.missionaries set profile_id = $2 where id = $1",
          [id.mA, x.UR],
        );
        expect(await keys(ofP), "MA re-linked: P's children").toEqual(
          all(null),
        );
        expect(await keys(ofR), "MA re-linked: R's children").toEqual(
          all(id.mA),
        );

        for (const sql of [
          "delete from public.donor_pledges where missionary_id = $1",
          "delete from public.donations where missionary_id = $1",
          "delete from public.giving_target_entity_locks where missionary_id = $1",
          "delete from public.missionaries where id = $1",
        ])
          await db.query(sql, [id.mA]);
        expect(await keys(ofR), "MA deleted").toEqual(all(null));
        for (const table of TABLES)
          expect(
            (
              await db.query(
                `select count(*)::int as n from public.${table} where ministry_assignment_id = $1`,
                [id.mA],
              )
            ).rows[0].n,
            `${table} still on MA`,
          ).toBe(0);
      });
    });

    it("6. the repair sets every wrong key, a wrong non-NULL one included, to the derived one and returns each change once with its old and new key; a second run returns none; a caller without BYPASSRLS is refused with 42501 by the repair and the count (Q1 conditions 1-2; red: 42883)", async () => {
      await within(async () => {
        expect(
          (
            await db.query(
              "select * from private.repair_ministry_assignment_ids()",
            )
          ).rows,
          "nothing to repair before the plant",
        ).toEqual([]);
        const expected: Record<string, unknown>[] = [];
        for (const table of TABLES) {
          const row = await child(table, id.TA, id.UM);
          await plant(table, row, id.mB);
          expected.push({
            table_name: table,
            row_id: row,
            tenant_id: id.TA,
            old_assignment_id: id.mB,
            new_assignment_id: id.mA,
          });
        }
        const pending = await child("posts", id.TA, id.UM);
        await plant("posts", pending, null);
        expected.push({
          table_name: "posts",
          row_id: pending,
          tenant_id: id.TA,
          old_assignment_id: null,
          new_assignment_id: id.mA,
        });
        const order = (rows: Record<string, unknown>[]) =>
          [...rows].sort((a, b) =>
            `${a.table_name}${a.row_id}`.localeCompare(
              `${b.table_name}${b.row_id}`,
            ),
          );
        const repaired = await db.query(
          "select * from private.repair_ministry_assignment_ids()",
        );
        expect(order(repaired.rows)).toEqual(order(expected));
        for (const table of TABLES)
          expect(
            (
              await db.query(
                `select count(*)::int as n from public.${table} where tenant_id = $1 and missionary_id = $2 and ministry_assignment_id is distinct from $3`,
                [id.TA, id.UM, id.mA],
              )
            ).rows[0].n,
            table,
          ).toBe(0);
        expect(
          (
            await db.query(
              "select * from private.repair_ministry_assignment_ids()",
            )
          ).rows,
        ).toEqual([]);

        const fresh = `acc2678r3_${randomUUID().replaceAll("-", "")}`;
        await db.query(`create role ${fresh} nologin`);
        await db.query(`grant usage on schema private to ${fresh}`);
        await db.query(
          `grant execute on function private.repair_ministry_assignment_ids(), private.ministry_assignment_key_report() to ${fresh}`,
        );
        for (const [call, message] of [
          [
            "select * from private.repair_ministry_assignment_ids()",
            REPAIR_REFUSAL,
          ],
          [
            "select * from private.ministry_assignment_key_report()",
            REPORT_REFUSAL,
          ],
        ] as const) {
          await db.query("savepoint refused");
          try {
            await db.query(`set local role ${fresh}`);
            const refused = await failure(call);
            expect(refused).toEqual({ code: "42501", message });
          } finally {
            await db.query("rollback to savepoint refused");
          }
        }
      });
    });

    it("6b. the repair reports, on every table, the key its UPDATE actually stored after the triggers: when the derivation cannot read (its owner a role without the private schema), it stores NULL and the repair says NULL, not the key the repair computed (red: the computed MA); a second run, which stores NULL again, reports nothing, and the count shows each such row as pending (red: NULL to NULL reported)", async () => {
      await within(async () => {
        const before = await readReport(db);
        const planted = {} as Record<Table, string>;
        for (const table of TABLES) {
          planted[table] = await child(table, id.TA, id.UM);
          await plant(table, planted[table], id.mB);
        }
        const fresh = `acc2678r3_${randomUUID().replaceAll("-", "")}`;
        await db.query(`create role ${fresh} nologin`);
        await db.query(
          `alter function private.derive_ministry_assignment_id() owner to ${fresh}`,
        );
        const repaired = await db.query(
          "select * from private.repair_ministry_assignment_ids()",
        );
        const stored: Record<string, unknown>[] = [];
        for (const table of TABLES)
          stored.push({
            table_name: table,
            row_id: planted[table],
            tenant_id: id.TA,
            old_assignment_id: id.mB,
            new_assignment_id: await keyOf(table, planted[table]),
          });
        const order = (rows: Record<string, unknown>[]) =>
          [...rows].sort((a, b) =>
            String(a.table_name).localeCompare(String(b.table_name)),
          );
        expect(order(repaired.rows)).toEqual(order(stored));
        expect(stored.map((row) => row.new_assignment_id)).toEqual(
          TABLES.map(() => null),
        );
        expect(
          (
            await db.query(
              "select * from private.repair_ministry_assignment_ids()",
            )
          ).rows,
          "a second run changes no stored key, so it reports nothing",
        ).toEqual([]);
        for (const table of TABLES)
          expect(await keyOf(table, planted[table]), table).toBeNull();
        const after = await readReport(db);
        for (const table of TABLES)
          expect(delta(after, before, table), table).toMatchObject({
            total: 1,
            pending: 1,
            invalid: 0,
          });
      });
    });

    it("7. the count names every planted key: a missing parent, another tenant's worker, another profile's worker and a parent that is not the sole row are each invalid, and a key with no profile is asymmetric (red: 42883)", async () => {
      await within(async () => {
        const before = await readReport(db);
        const planted: [string | null, string][] = [
          [id.UM, randomUUID()],
          [id.UM, id.mB],
          [id.UM, id.m2],
          [x.UQ, x.mQ1],
          [null, id.mA],
        ];
        for (const [profile, key] of planted) {
          const row = await child("posts", id.TA, profile);
          await plant("posts", row, key);
        }
        expect(delta(await readReport(db), before, "posts")).toEqual({
          total: 5,
          unowned: 0,
          null_tenant: 0,
          absent: 0,
          ambiguous: 0,
          pending: 0,
          valid: 0,
          invalid: 5,
          asymmetric: 1,
        });
      });
    });

    it("11. the running build's task reads and update return the key: missionary_owned_tasks and the update branch of missionary_task_write give A = MA; without the widening, the update branch raises 42804 and missionary_owned_tasks cannot be created (red: 42703)", async () => {
      await within(async () => {
        const created = await db.query(
          "select id from public.missionary_task_write($1, $2, $3, 'create', null, $4::jsonb)",
          [id.UM, id.TA, id.mM, JSON.stringify({ title: "acc2678r3" })],
        );
        const task = created.rows[0].id as string;
        const listed = await db.query(
          "select id, ministry_assignment_id from public.missionary_owned_tasks($1, $2, $3)",
          [id.UM, id.TA, id.mM],
        );
        expect(listed.rows).toContainEqual({
          id: task,
          ministry_assignment_id: id.mA,
        });
        const updated = await db.query(
          "select id, title, ministry_assignment_id from public.missionary_task_write($1, $2, $3, 'update', $4, $5::jsonb)",
          [id.UM, id.TA, id.mM, task, JSON.stringify({ title: "acc2678r3 2" })],
        );
        expect(updated.rows).toEqual([
          { id: task, title: "acc2678r3 2", ministry_assignment_id: id.mA },
        ]);

        const source = "20261125050000_tenant_keys_on_activity_tables.sql";
        await db.query(lines(source, 289, 383));
        expect(
          await failure(
            "select * from public.missionary_task_write($1, $2, $3, 'update', $4, $5::jsonb)",
            [id.UM, id.TA, id.mM, task, JSON.stringify({ title: "x" })],
          ),
        ).toMatchObject({ code: "42804" });
        expect(await failure(lines(source, 260, 283))).toMatchObject({
          code: "42P13",
        });
      });
    });

    it("13. issue 2834 item 2: missionary_task_write ignores a malformed ministry_assignment_id in a create or an update patch, as before r3, and the task's key is still the derived one (red: 22P02)", async () => {
      await within(async () => {
        const created = await db.query(
          "select id, ministry_assignment_id from public.missionary_task_write($1, $2, $3, 'create', null, $4::jsonb)",
          [
            id.UM,
            id.TA,
            id.mM,
            JSON.stringify({
              title: "acc2678r3 malformed key",
              ministry_assignment_id: "not-a-uuid",
            }),
          ],
        );
        expect(created.rows).toEqual([
          { id: expect.any(String), ministry_assignment_id: id.mA },
        ]);
        const task = created.rows[0].id as string;
        const updated = await db.query(
          "select id, title, ministry_assignment_id from public.missionary_task_write($1, $2, $3, 'update', $4, $5::jsonb)",
          [
            id.UM,
            id.TA,
            id.mM,
            task,
            JSON.stringify({
              title: "acc2678r3 malformed key 2",
              ministry_assignment_id: "{nope",
            }),
          ],
        );
        expect(updated.rows).toEqual([
          {
            id: task,
            title: "acc2678r3 malformed key 2",
            ministry_assignment_id: id.mA,
          },
        ]);
      });
    });

    it("12. catalog: the four functions are owned by postgres and executable by nobody else, the two trigger functions are definers with an empty search path; ours are the last BEFORE ROW triggers of each table; no unique index or foreign key includes the key; the field-policy census passes (red: 42883)", async () => {
      for (const fn of FUNCTIONS)
        for (const role of ["anon", "authenticated", "service_role"])
          expect(
            (
              await db.query(
                "select has_function_privilege($1, $2, 'EXECUTE') as ok",
                [role, fn],
              )
            ).rows[0].ok,
            `${role} on ${fn}`,
          ).toBe(false);
      const shape = await db.query(
        `select p.oid::regprocedure::text as fn, p.proowner::regrole::text as owner, p.proacl::text[] as acl,
                p.prosecdef as definer, p.proconfig as config, p.provolatile as volatility, l.lanname::text as lang
           from pg_proc p join pg_language l on l.oid = p.prolang where p.oid = any($1::regprocedure[]) order by 1`,
        [FUNCTIONS],
      );
      expect(shape.rows).toEqual(
        [
          ["private.derive_ministry_assignment_id()", true, "v"],
          ["private.ministry_assignment_key_report()", false, "s"],
          ["private.rederive_ministry_assignment_children()", true, "v"],
          ["private.repair_ministry_assignment_ids()", false, "v"],
        ].map(([fn, definer, volatility]) => ({
          fn,
          owner: "postgres",
          acl: ["postgres=X/postgres"],
          definer,
          config: ['search_path=""'],
          volatility,
          lang: "plpgsql",
        })),
      );
      const triggers = await db.query(
        `select c.relname as t, e.event, max(g.tgname) as last
           from pg_trigger g join pg_class c on c.oid = g.tgrelid
           cross join (values ('insert', 4), ('update', 16)) e (event, bit)
          where c.relnamespace = 'public'::regnamespace and c.relname = any($1::text[])
            and not g.tgisinternal and (g.tgtype & 1) = 1 and (g.tgtype & 2) = 2 and (g.tgtype & e.bit) = e.bit
          group by 1, 2 order by 1, 2`,
        [TABLES],
      );
      expect(triggers.rows).toEqual(
        [...TABLES].sort().flatMap((t) => [
          { t, event: "insert", last: "zz_wp5_assignment_key_insert" },
          { t, event: "update", last: "zz_wp5_assignment_key_update" },
        ]),
      );
      const parent = await db.query(
        `select g.tgname, g.tgenabled, pg_get_triggerdef(g.oid) as def from pg_trigger g
          where g.tgrelid = 'public.missionaries'::regclass and not g.tgisinternal and g.tgname like 'wp5_assignment_children_%' order by 1`,
      );
      expect(parent.rows.map((row: { tgname: string }) => row.tgname)).toEqual([
        "wp5_assignment_children_after_delete",
        "wp5_assignment_children_after_insert",
        "wp5_assignment_children_after_update",
      ]);
      const keyed = await db.query(
        `select c.conrelid::regclass::text as t, c.conname from pg_constraint c
           join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
          where a.attname = 'ministry_assignment_id' and c.contype in ('f', 'u', 'p', 'x')
         union all
         select i.indrelid::regclass::text, i.indexrelid::regclass::text from pg_index i
           join pg_attribute a on a.attrelid = i.indrelid and a.attnum = any(i.indkey)
          where a.attname = 'ministry_assignment_id' and i.indisunique`,
      );
      expect(keyed.rows).toEqual([]);
      const columns = await db.query(
        `select table_name, data_type, is_nullable, column_default from information_schema.columns
          where table_schema = 'public' and column_name = 'ministry_assignment_id' order by 1`,
      );
      expect(columns.rows).toEqual(
        [...TABLES].sort().map((table_name) => ({
          table_name,
          data_type: "uuid",
          is_nullable: "YES",
          column_default: null,
        })),
      );
      const indexes = await db.query(
        `select indexdef from pg_indexes where schemaname = 'public' and tablename = any($1::text[])
            and (indexdef like '%(tenant_id, ministry_assignment_id)' or indexdef like '%(tenant_id, missionary_id)') order by 1`,
        [TABLES],
      );
      expect(indexes.rows).toHaveLength(10);
      const census = spawnSync(
        process.execPath,
        ["scripts/verify/field-policy-census.mjs"],
        {
          encoding: "utf8",
          env: { ...process.env, DATABASE_URL: ADMIN_URL },
          timeout: 120_000,
        },
      );
      expect(census.status, census.stdout + census.stderr).toBe(0);
      const policies = await db.query(
        `select surface, visible, editable, exportable, sensitivity_category::text as category from public.field_policies
          where record_type = 'donors' and field_key = 'ministry_assignment_id' and tenant_id is null order by 1`,
      );
      expect(policies.rows).toEqual(
        ["donor", "export", "mission_control", "missionary", "public"].map(
          (surface) => ({
            surface,
            visible: surface === "mission_control",
            editable: false,
            exportable: false,
            category: "internal",
          }),
        ),
      );
    });
  },
);
