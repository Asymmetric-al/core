import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  delta,
  readReport,
  repairOnDisposable,
} from "./assignment-keys.helpers";
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
      throw new Error(
        `backend ${waiter} neither finished nor waited on ${holder}`,
      );
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 part 2-r3, the ruler's interleaving on two connections, closed at the source (issue 2834 items 1, 3 and 6)",
  () => {
    const T = randomUUID();
    const logins: string[] = [];
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const c1 = new pg.Client({ connectionString: ADMIN_URL });
    const c2 = new pg.Client({ connectionString: ADMIN_URL });
    let c1pid = 0;
    let c2pid = 0;

    async function login() {
      const user = randomUUID();
      await admin.query(
        "insert into auth.users (id, email, email_confirmed_at) values ($1::uuid, 'acc2678r3-c-' || $1::text || '@example.test', now())",
        [user],
      );
      await admin.query("delete from authz.memberships where user_id = $1", [
        user,
      ]);
      logins.push(user);
      return user;
    }

    async function worker(profile: string | null) {
      const id = randomUUID();
      await admin.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Worker C')",
        [id, T],
      );
      await admin.query(
        "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $1, $3, $2)",
        [id, T, profile],
      );
      return id;
    }

    const keysOf = async (rows: Record<string, string>) => {
      const out: Record<string, string | null> = {};
      for (const [table, row] of Object.entries(rows))
        out[table] = (
          await admin.query(
            `select ministry_assignment_id as a from public.${table} where id = $1`,
            [row],
          )
        ).rows[0].a;
      return out;
    };

    const CHILDREN = [
      [
        "donors",
        "insert into public.donors (id, tenant_id, party_id, missionary_id, name) values ($1, $2, public.donor_party_for_insert($2::uuid, null, 'acc2678 F3', null), $3, 'acc2678 F3')",
      ],
      [
        "posts",
        "insert into public.posts (id, tenant_id, missionary_id, content) values ($1, $2, $3, 'acc2678 F3')",
      ],
      [
        "follows",
        "insert into public.follows (id, tenant_id, missionary_id) values ($1, $2, $3)",
      ],
      [
        "follower_requests",
        "insert into public.follower_requests (id, tenant_id, missionary_id) values ($1, $2, $3)",
      ],
      [
        "missionary_tasks",
        "insert into public.missionary_tasks (id, tenant_id, missionary_id, title) values ($1, $2, $3, 'acc2678 F3')",
      ],
    ] as const;

    async function writeChildren(c: pg.Client, profile: string) {
      const rows: Record<string, string> = {};
      for (const [table, sql] of CHILDREN) {
        rows[table] = randomUUID();
        await c.query(sql, [rows[table], T, profile]);
      }
      return rows;
    }

    async function linking(kind: "second" | "first", profile: string) {
      if (kind === "second") {
        await worker(profile);
        const added = randomUUID();
        await admin.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Worker C two')",
          [added, T],
        );
        return {
          expected: null,
          link: (c: pg.Client) =>
            c.query(
              "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $1, $3, $2)",
              [added, T, profile],
            ),
        };
      }
      const unlinked = await worker(null);
      return {
        expected: unlinked,
        link: (c: pg.Client) =>
          c.query(
            "update public.missionaries set profile_id = $2 where id = $1",
            [unlinked, profile],
          ),
      };
    }

    beforeAll(async () => {
      for (const client of [admin, c1, c2]) await client.connect();
      c1pid = await backendPid(c1);
      c2pid = await backendPid(c2);
      await admin.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678r3 C', 'acc2678r3-' || $1::text)",
        [T],
      );
      await admin.query(
        "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'C', 'US', 'usd', 'C')",
        [T],
      );
    });

    async function releaseSessions() {
      await admin.query(
        "select pg_catalog.pg_cancel_backend(pid) from unnest($1::int[]) as pid where pid <> 0",
        [[c1pid, c2pid]],
      );
      for (const client of [c1, c2]) {
        await client.query("rollback").catch(() => undefined);
        await client.query("reset lock_timeout").catch(() => undefined);
      }
    }

    afterEach(() => releaseSessions());

    afterAll(async () => {
      const failures: string[] = [];
      await releaseSessions().catch((e) => failures.push(String(e)));
      for (const [sql, params] of [
        ["delete from public.audit_logs where tenant_id = $1", [T]],
        ["delete from public.follows where tenant_id = $1", [T]],
        ["delete from public.follower_requests where tenant_id = $1", [T]],
        ["delete from public.posts where tenant_id = $1", [T]],
        ["delete from public.missionary_tasks where tenant_id = $1", [T]],
        ["delete from public.donors where tenant_id = $1", [T]],
        ["delete from public.missionaries where tenant_id = $1", [T]],
        ["delete from public.parties where tenant_id = $1", [T]],
        ["delete from public.legal_entities where tenant_id = $1", [T]],
        [
          "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
          [T, logins],
        ],
        ["delete from public.tenants where id = $1", [T]],
        ["delete from auth.users where id = any($1::uuid[])", [logins]],
      ] as const)
        try {
          await admin.query(sql, [...params]);
        } catch (e) {
          failures.push(`${sql}: ${String(e)}`);
        }
      for (const client of [admin, c1, c2]) await client.end();
      expect(failures, "the interleaving fixture's cleanup").toEqual([]);
    });

    it("8. item 1, the write first (D-18: the ruler's interleaving, closed at the source): C1 writes a post through its live writer, a task and a donor for (TC, P) and holds them; C2, as owner, re-links P's sole worker M to R and waits for C1; once C1 commits, C2's re-derivation sees the three rows, so none keeps M, R's assignment, as its owner; the count shows none invalid and the repair has nothing to change for them (red: C2 does not wait and the three keep M)", async () => {
      const P = await login();
      const R = await login();
      const M = await worker(P);
      const party = randomUUID();
      await admin.query(
        "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Partner C')",
        [party, T],
      );
      const before = await readReport(admin);
      await c1.query("begin");
      const post = (
        await c1.query(
          "select public.atomic_create_post_with_audit(p_tenant_id => $1, p_missionary_id => $2, p_content => 'acc2678r3 interleaved') as r",
          [T, P],
        )
      ).rows[0].r.post_id as string;
      const task = (
        await c1.query(
          "insert into public.missionary_tasks (tenant_id, missionary_id, title) values ($1, $2, 'acc2678r3 interleaved') returning id",
          [T, P],
        )
      ).rows[0].id as string;
      const donor = (
        await c1.query(
          "insert into public.donors (tenant_id, party_id, missionary_id, name) values ($1, $2, $3, 'acc2678r3 interleaved') returning id",
          [T, party, P],
        )
      ).rows[0].id as string;
      expect(
        (
          await c1.query(
            "select array_agg(ministry_assignment_id) a from (select ministry_assignment_id from public.posts where id = $1 union all select ministry_assignment_id from public.missionary_tasks where id = $2 union all select ministry_assignment_id from public.donors where id = $3) k",
            [post, task, donor],
          )
        ).rows[0].a,
      ).toEqual([M, M, M]);
      await c2.query("begin");
      await c2.query("set local lock_timeout = '20s'");
      const moving = c2.query(
        "update public.missionaries set profile_id = $2 where id = $1",
        [M, R],
      );
      const waited = await blockedOrSettled(admin, moving, c2pid, c1pid);
      await c1.query("commit");
      await moving;
      await c2.query("commit");
      expect(
        await keysOf({ posts: post, missionary_tasks: task, donors: donor }),
      ).toEqual({ posts: null, missionary_tasks: null, donors: null });
      expect(
        (
          await admin.query(
            "select (select count(*) from public.posts where tenant_id = $1 and ministry_assignment_id = $2) + (select count(*) from public.missionary_tasks where tenant_id = $1 and ministry_assignment_id = $2) + (select count(*) from public.donors where tenant_id = $1 and ministry_assignment_id = $2) as n",
            [T, M],
          )
        ).rows[0].n,
      ).toBe("0");
      const after = await readReport(admin);
      for (const table of ["posts", "missionary_tasks", "donors"])
        expect([table, delta(after, before, table).invalid]).toEqual([
          table,
          0,
        ]);
      const repaired = (await repairOnDisposable(admin)).filter((row) =>
        [post, task, donor].includes(row.row_id as string),
      );
      expect(repaired).toEqual([]);
      expect(waited).toBe(true);
    });

    it("8b. item 1, the re-link first: C2 re-links P's sole worker M to R and holds it; C1's post for (TC, P) waits for C2 and, once C2 commits, derives no key, since P has no worker any more (red: C1 does not wait and the post keeps M)", async () => {
      const P = await login();
      const R = await login();
      const M = await worker(P);
      await c2.query("begin");
      await c2.query(
        "update public.missionaries set profile_id = $2 where id = $1",
        [M, R],
      );
      await c1.query("begin");
      await c1.query("set local lock_timeout = '20s'");
      const writing = c1.query(
        "select public.atomic_create_post_with_audit(p_tenant_id => $1, p_missionary_id => $2, p_content => 'acc2678r3 relinked first') as r",
        [T, P],
      );
      const waited = await blockedOrSettled(admin, writing, c1pid, c2pid);
      await c2.query("commit");
      const post = (await writing).rows[0].r.post_id as string;
      await c1.query("commit");
      expect(await keysOf({ posts: post })).toEqual({ posts: null });
      expect(waited).toBe(true);
    });

    for (const [kind, race, owner] of [
      [
        "second",
        "one to two: S2 links a second worker to the login",
        "no key, since the login then has two workers",
      ],
      [
        "first",
        "none to one: S2 gives a worker with no login that login",
        "that worker's key, since it is then the sole assignment",
      ],
    ] as const)
      for (const first of ["children", "link"] as const)
        it(`F3 (fix round of pull request 2859), ${race}, ${first === "children" ? "S1's children written first" : "S2's link first"}: one row of each of the five tables the derivation serves ends with ${owner}, whichever commits last (red: ${first === "children" ? "S2 does not wait and the rows keep what S1 derived" : "S1 does not wait and derives from what it saw"})`, async () => {
          const P = await login();
          const { expected, link } = await linking(kind, P);
          const [holder, waiter] = first === "children" ? [c1, c2] : [c2, c1];
          let pending: Promise<unknown> | undefined;
          try {
            await holder.query("begin");
            await waiter.query("begin");
            await waiter.query("set local lock_timeout = '20s'");
            let rows: Record<string, string>;
            let waited: boolean;
            if (first === "children") {
              rows = await writeChildren(c1, P);
              pending = link(c2);
              waited = await blockedOrSettled(admin, pending, c2pid, c1pid);
              await c1.query("commit");
              await pending;
              await c2.query("commit");
            } else {
              await link(c2);
              const writing = writeChildren(c1, P);
              pending = writing;
              waited = await blockedOrSettled(admin, writing, c1pid, c2pid);
              await c2.query("commit");
              rows = await writing;
              await c1.query("commit");
            }
            expect(await keysOf(rows)).toEqual(
              Object.fromEntries(CHILDREN.map(([table]) => [table, expected])),
            );
            expect(waited).toBe(true);
          } finally {
            await holder.query("rollback").catch(() => undefined);
            await pending?.catch(() => undefined);
            await waiter.query("rollback").catch(() => undefined);
          }
        });

    it("9. item 3: the repair locks the rows it reads, so when another session changes a wrong key and commits while the repair waits, the old key it reports is the key it replaced (red: the key it read before it waited)", async () => {
      const P = await login();
      const M = await worker(P);
      const post = (
        await admin.query(
          "select public.atomic_create_post_with_audit(p_tenant_id => $1, p_missionary_id => $2, p_content => 'acc2678r3 repair lock') as r",
          [T, P],
        )
      ).rows[0].r.post_id as string;
      const [first, second] = [randomUUID(), randomUUID()];
      await admin.query("begin");
      await admin.query("set local session_replication_role = replica");
      await admin.query(
        "update public.posts set ministry_assignment_id = $2 where id = $1",
        [post, first],
      );
      await admin.query("commit");
      await c2.query("begin");
      await c2.query("set local session_replication_role = replica");
      await c2.query(
        "update public.posts set ministry_assignment_id = $2 where id = $1",
        [post, second],
      );
      await c1.query("set lock_timeout = '20s'");
      const repairing = repairOnDisposable(c1);
      const waited = await blockedOrSettled(admin, repairing, c1pid, c2pid);
      await c2.query("commit");
      const rows = (await repairing).filter((row) => row.row_id === post);
      expect(rows).toEqual([
        {
          table_name: "posts",
          row_id: post,
          tenant_id: T,
          old_assignment_id: second,
          new_assignment_id: M,
        },
      ]);
      expect(waited).toBe(true);
    });

    it("10b. item 6: the suite runs the global repair only on a database marked disposable: with the marker moved to shared in a transaction that is rolled back, the repair helper refuses before it runs (red: no helper)", async () => {
      await c1.query("begin");
      try {
        await c1.query("update platform.environment set kind = 'shared'");
        await expect(repairOnDisposable(c1)).rejects.toThrow(
          /refusing to run the global key repair: .*marked shared/,
        );
        expect(
          (
            await c1.query(
              "select count(*)::int n from pg_catalog.pg_locks where pid = pg_catalog.pg_backend_pid() and relation = 'public.posts'::regclass",
            )
          ).rows,
        ).toEqual([{ n: 0 }]);
      } finally {
        await c1.query("rollback");
      }
    });

    const KEY_LOCK =
      "select pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('ministry_assignment_key'), pg_catalog.hashtext($1::uuid::text || ':' || $2::uuid::text))";

    async function movable() {
      const A = await login();
      const L = await login();
      const W = await worker(A);
      const task = (
        await admin.query(
          "insert into public.missionary_tasks (tenant_id, missionary_id, title) values ($1, $2, 'acc2678 move') returning id",
          [T, A],
        )
      ).rows[0].id as string;
      const ascending = (
        await admin.query(
          "select k::text from unnest($2::uuid[]) k order by pg_catalog.hashtext($1::uuid::text || ':' || k::text)",
          [T, [A, L]],
        )
      ).rows.map((r) => r.k as string);
      const child = async () =>
        (
          await admin.query(
            "select missionary_id, ministry_assignment_id key, private.assignment_for_profile(tenant_id, missionary_id) derived from public.missionary_tasks where id = $1",
            [task],
          )
        ).rows[0] as {
          missionary_id: string;
          key: string | null;
          derived: string | null;
        };
      const profileOf = async () =>
        (
          await admin.query(
            "select profile_id from public.missionaries where id = $1",
            [W],
          )
        ).rows[0].profile_id as string;
      return { A, L, W, task, ascending, child, profileOf };
    }

    const codeOf = (call: Promise<unknown>) =>
      call.then(
        () => "ok",
        (error: { code?: string }) => error.code ?? String(error),
      );

    it("(issue 2835, 28 November, item 2) a writer that locks a child's row and then moves the child to another login, against a re-link of the worker of the child's login to that login: the re-link takes the key and waits on the child's row, the move holds the row and asks for the key, PostgreSQL ends one of the two with 40P01, the other commits, and the child's key is the one its login's worker gives (passes before this part: it shows the outcome the comments now state)", async () => {
      const m = await movable();
      await c1.query("begin");
      await c1.query("set local lock_timeout = '20s'");
      await c1.query(
        "select 1 from public.missionary_tasks where id = $1 for update",
        [m.task],
      );
      await c2.query("begin");
      await c2.query("set local lock_timeout = '20s'");
      const relink = codeOf(
        c2.query(
          "update public.missionaries set profile_id = $2 where id = $1",
          [m.W, m.L],
        ),
      );
      expect(await blockedOrSettled(admin, relink, c2pid, c1pid)).toBe(true);
      const move = codeOf(
        c1.query(
          "update public.missionary_tasks set missionary_id = $2 where id = $1",
          [m.task, m.L],
        ),
      );
      const [moved, relinked] = await Promise.all([move, relink]);
      expect([moved, relinked].sort()).toEqual(["40P01", "ok"]);
      await (moved === "ok" ? c1 : c2).query("commit");
      await (moved === "ok" ? c2 : c1).query("rollback");
      const after = await m.child();
      expect(after.key).toBe(after.derived);
      if (moved === "ok") {
        expect([after.missionary_id, after.key, await m.profileOf()]).toEqual([
          m.L,
          null,
          m.A,
        ]);
      } else {
        expect([after.missionary_id, after.key, await m.profileOf()]).toEqual([
          m.A,
          null,
          m.L,
        ]);
      }
    });

    it("(issue 2835, 28 November, item 2) the rule: a writer that moves an existing child takes the key's lock for the child's old and new login, in ascending order of the key, before it locks the row; a re-link of the worker of the child's login to the new login then waits for it, both commit and the child ends with that worker's key (guard for the rule the comments state)", async () => {
      const m = await movable();
      await c1.query("begin");
      for (const login of m.ascending) await c1.query(KEY_LOCK, [T, login]);
      await c1.query(
        "select 1 from public.missionary_tasks where id = $1 for update",
        [m.task],
      );
      await c2.query("begin");
      await c2.query("set local lock_timeout = '20s'");
      const relink = codeOf(
        c2.query(
          "update public.missionaries set profile_id = $2 where id = $1",
          [m.W, m.L],
        ),
      );
      expect(await blockedOrSettled(admin, relink, c2pid, c1pid)).toBe(true);
      await c1.query(
        "update public.missionary_tasks set missionary_id = $2 where id = $1",
        [m.task, m.L],
      );
      await c1.query("commit");
      expect(await relink).toBe("ok");
      await c2.query("commit");
      const after = await m.child();
      expect([after.missionary_id, after.key, after.derived]).toEqual([
        m.L,
        m.W,
        m.W,
      ]);
    });

    it("(issue 2835, 28 November, item 2) the two key triggers' comments give the true order: a child's UPDATE holds the row before its trigger asks for the key, a worker's write takes the key and then the children's rows, the two can meet in a cycle that PostgreSQL ends with 40P01, and a writer that moves an existing child takes the key's lock before its UPDATE (red: the comments say nothing of the cycle)", async () => {
      const comments = (
        await admin.query(
          "select obj_description('private.derive_ministry_assignment_id()'::regprocedure, 'pg_proc') derive, obj_description('private.rederive_ministry_assignment_children()'::regprocedure, 'pg_proc') rederive",
        )
      ).rows[0] as Record<string, string>;
      for (const comment of Object.values(comments)) {
        expect(comment).toContain("40P01");
        expect(comment).toContain(
          "A writer that moves an existing child takes the key's lock for the child's old and new login, in ascending order of the key, before its UPDATE.",
        );
      }
    });
    it("W7 (fix round of 2869), the reverse order: the re-link of the worker of the child's login to the new login holds the keys first; a writer that follows the rule waits on a key, not on the child's row, then moves the child once the re-link commits, both commit with no 40P01, and the child ends with that worker's key at its new login (guard)", async () => {
      const m = await movable();
      await c2.query("begin");
      await c2.query("set local lock_timeout = '20s'");
      await c2.query(
        "update public.missionaries set profile_id = $2 where id = $1",
        [m.W, m.L],
      );
      await c1.query("begin");
      await c1.query("set local lock_timeout = '20s'");
      const move = codeOf(
        (async () => {
          for (const login of m.ascending) await c1.query(KEY_LOCK, [T, login]);
          await c1.query(
            "select 1 from public.missionary_tasks where id = $1 for update",
            [m.task],
          );
          await c1.query(
            "update public.missionary_tasks set missionary_id = $2 where id = $1",
            [m.task, m.L],
          );
        })(),
      );
      expect(await blockedOrSettled(admin, move, c1pid, c2pid)).toBe(true);
      expect(
        (
          await admin.query(
            "select locktype from pg_catalog.pg_locks where pid = $1 and not granted",
            [c1pid],
          )
        ).rows,
      ).toEqual([{ locktype: "advisory" }]);
      await c2.query("commit");
      expect(await move).toBe("ok");
      await c1.query("commit");
      const after = await m.child();
      expect([
        after.missionary_id,
        after.key,
        after.derived,
        await m.profileOf(),
      ]).toEqual([m.L, m.W, m.W, m.L]);
    });
  },
);
