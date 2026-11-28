import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import pg from "pg";
import { describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, backendPid } from "./harness";
import { settlesWithoutWaiting } from "../issue-2678/harness";
import { checkSql, downSql } from "../issue-2678/assignment-keys.helpers";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const FILE = "supabase/migrations/20261127110000_wp7_1b_post_key_lock.sql";
const REVIEW = "supabase/migrations/20261127070000_wp7_1_review.sql";
const RESTRICT =
  "select public.restrict_worker_publication($1, $2, 'restricted', 'Cedar', null, 'Threat reported')";
const MOVE = "update public.missionaries set profile_id = $1 where id = $2";
const REACTIONS = [
  "atomic_like_post",
  "atomic_pray_for_post",
  "atomic_fire_post",
  "atomic_unlike_post",
  "atomic_unpray_for_post",
  "atomic_unfire_post",
] as const;

type Fixture = {
  tenant: string;
  author: string;
  admin: string;
  adminAssignment: string;
  donor: string;
  donorAssignment: string;
  party: string;
  ministry: string;
};

const outcome = (call: Promise<unknown>) =>
  call.then(
    () => "done",
    (e) => {
      const err = e as { code?: string; message?: string };
      return `${err.code ?? "?"} ${err.message ?? ""}`;
    },
  );

const BLOCKED =
  "select $2::int = any(pg_catalog.pg_blocking_pids($1::int)) as blocked";

async function waitedOn(
  observer: pg.Client,
  call: Promise<unknown>,
  waiter: number,
  holder: number,
  ms = 10_000,
) {
  let settled = false;
  call
    .finally(() => {
      settled = true;
    })
    .catch(() => undefined);
  const end = Date.now() + ms;
  for (;;) {
    if (settled) return false;
    if ((await observer.query(BLOCKED, [waiter, holder])).rows[0].blocked)
      return true;
    if (Date.now() > end)
      throw new Error(`backend ${waiter} neither waited nor settled`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

async function signIn(
  client: pg.Client,
  user: string,
  tenant: string,
  assignment: string,
) {
  await client.query(
    `begin; set local role authenticated;
     select set_config('request.jwt.claims', '${JSON.stringify({ sub: user, role: "authenticated" })}', true),
            set_config('request.jwt.claim.sub', '', true),
            set_config('request.headers', '${JSON.stringify({ "x-asym-tenant": tenant, "x-asym-assignment": assignment })}', true);`,
  );
}

const statements = (sql: string) =>
  sql
    .split("\n")
    .filter((line) => !/^(BEGIN|COMMIT);$/.test(line.trim()))
    .join("\n");

const migrationSql = () =>
  statements(
    readFileSync(FILE, "utf8")
      .split("\n")
      .filter((line) => !line.startsWith("--"))
      .join("\n"),
  );

function reviewedBody() {
  const text = readFileSync(REVIEW, "utf8");
  const start = text.indexOf("CREATE FUNCTION private.posts_review_on_write()");
  const open = text.indexOf("AS $$", start) + "AS $$".length;
  return text.slice(open, text.indexOf("$$;", open));
}

describe.skipIf(!ADMIN_URL)(
  "AL-2680 WP7 pull request 1b, item 6: a post whose assignment key changes reads its new worker's Party under a share lock",
  () => {
    async function withFixture(
      linked: boolean,
      run: (
        f: Fixture,
        post: string,
        connections: [pg.Client, pg.Client, pg.Client],
      ) => Promise<void>,
    ) {
      const admin = new pg.Client({ connectionString: ADMIN_URL });
      const first = new pg.Client({ connectionString: ADMIN_URL });
      const second = new pg.Client({ connectionString: ADMIN_URL });
      const f: Fixture = {
        tenant: randomUUID(),
        author: randomUUID(),
        admin: randomUUID(),
        adminAssignment: randomUUID(),
        donor: randomUUID(),
        donorAssignment: randomUUID(),
        party: randomUUID(),
        ministry: randomUUID(),
      };
      const users = [f.author, f.admin, f.donor];
      await admin.connect();
      try {
        await admin.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2680 key lock', 'acc2680-key-lock-' || $1::text)",
          [f.tenant],
        );
        await admin.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'K', 'US', 'usd', 'K')",
          [f.tenant],
        );
        await admin.query(
          "insert into auth.users (id, email, email_confirmed_at) select u, 'acc2680-key-' || u || '@example.test', now() from unnest($1::uuid[]) u",
          [users],
        );
        await admin.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [users],
        );
        await admin.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active, is_tenant_admin) values
             ($1, $2, $5, 'staff', 'development', true, true),
             ($3, $4, $5, 'donor', null, true, false)`,
          [f.adminAssignment, f.admin, f.donorAssignment, f.donor, f.tenant],
        );
        await admin.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Moving worker')",
          [f.party, f.tenant],
        );
        await admin.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $4, $2)",
          [f.ministry, f.tenant, f.party, linked ? f.author : null],
        );
        const inserted = await admin.query(
          "insert into public.posts (tenant_id, missionary_id, title, content, status, visibility) values ($1, $2, 'Moving', 'Body', 'published', 'public') returning id, ministry_assignment_id",
          [f.tenant, f.author],
        );
        expect(inserted.rows[0].ministry_assignment_id).toBe(
          linked ? f.ministry : null,
        );
        await first.connect();
        await second.connect();
        await run(f, inserted.rows[0].id as string, [first, second, admin]);
      } finally {
        await first.end().catch(() => undefined);
        await second.end().catch(() => undefined);
        await admin.query("rollback").catch(() => undefined);
        for (const sql of [
          "delete from public.audit_logs where tenant_id = $1",
          "delete from public.posts where tenant_id = $1",
          "delete from public.account_links where tenant_id = $1",
          "delete from private.party_restricted where tenant_id = $1",
          "delete from public.missionaries where tenant_id = $1",
          "delete from public.parties where tenant_id = $1",
          "delete from authz.memberships where tenant_id = $1",
          "delete from public.legal_entities where tenant_id = $1",
        ])
          await admin.query(sql, [f.tenant]);
        await admin.query("delete from auth.users where id = any($1::uuid[])", [
          users,
        ]);
        await admin.query("delete from public.tenants where id = $1", [
          f.tenant,
        ]);
        await admin.end();
      }
    }

    const stateOf = async (client: pg.Client, post: string) =>
      (
        await client.query(
          "select ministry_assignment_id, worker_withheld from public.posts where id = $1",
          [post],
        )
      ).rows[0];

    it("a restriction waiting on a move of a post's key to its worker runs after it, and the moved post ends withheld", () =>
      withFixture(false, async (f, post, [mover, restrictor, observer]) => {
        const moverPid = await backendPid(mover);
        const restrictorPid = await backendPid(restrictor);
        await mover.query("begin");
        await mover.query(MOVE, [f.author, f.ministry]);
        expect(await stateOf(mover, post)).toEqual({
          ministry_assignment_id: f.ministry,
          worker_withheld: false,
        });
        await signIn(restrictor, f.admin, f.tenant, f.adminAssignment);
        const restriction = outcome(
          restrictor.query(RESTRICT, [f.tenant, f.party]),
        );
        const waited = await waitedOn(
          observer,
          restriction,
          restrictorPid,
          moverPid,
        );
        await mover.query("commit");
        expect(await restriction).toBe("done");
        await restrictor.query("commit");
        expect(await stateOf(observer, post)).toEqual({
          ministry_assignment_id: f.ministry,
          worker_withheld: true,
        });
        expect(waited).toBe(true);
      }));

    it("a move of a post's key waiting on a restriction of the worker it moves to runs after it, and the moved post ends withheld", () =>
      withFixture(false, async (f, post, [restrictor, mover, observer]) => {
        const restrictorPid = await backendPid(restrictor);
        const moverPid = await backendPid(mover);
        await signIn(restrictor, f.admin, f.tenant, f.adminAssignment);
        await restrictor.query(RESTRICT, [f.tenant, f.party]);
        await mover.query("begin");
        const move = outcome(mover.query(MOVE, [f.author, f.ministry]));
        const waited = await waitedOn(observer, move, moverPid, restrictorPid);
        await restrictor.query("commit");
        expect(await move).toBe("done");
        await mover.query("commit");
        expect(await stateOf(observer, post)).toEqual({
          ministry_assignment_id: f.ministry,
          worker_withheld: true,
        });
        expect(waited).toBe(true);
      }));

    it("a reaction on a post whose key does not change takes no lock on its worker's Party: each of the six settles while another session holds the Party", () =>
      withFixture(true, async (f, post, [holder, reactor, observer]) => {
        const holderPid = await backendPid(holder);
        const reactorPid = await backendPid(reactor);
        await holder.query("begin");
        await holder.query(
          "select 1 from public.parties where id = $1 for update",
          [f.party],
        );
        try {
          for (const fn of REACTIONS)
            expect(
              await outcome(
                settlesWithoutWaiting(
                  observer,
                  reactor.query(`select public.${fn}($1, $2, $3)`, [
                    post,
                    f.donor,
                    f.tenant,
                  ]),
                  reactorPid,
                  holderPid,
                ),
              ),
              fn,
            ).toBe("done");
        } finally {
          await holder.query("rollback");
        }
        expect(await stateOf(observer, post)).toEqual({
          ministry_assignment_id: f.ministry,
          worker_withheld: false,
        });
      }));

    it("its committed check is true on the chain, false under 2863's function, which its Down restores byte for byte; a second run of the file commits the same text", async () => {
      const client = new pg.Client({ connectionString: ADMIN_URL });
      await client.connect();
      const source = () =>
        client
          .query(
            "select prosrc from pg_catalog.pg_proc where oid = 'private.posts_review_on_write()'::pg_catalog.regprocedure",
          )
          .then((r) => r.rows[0].prosrc as string);
      const committed = () =>
        client
          .query(checkSql(FILE))
          .then((r) => r.rows[0].committed as boolean);
      try {
        await client.query("begin");
        expect(await committed()).toBe(true);
        const head = await source();
        expect(head).not.toBe(reviewedBody());
        await client.query(statements(downSql(FILE)));
        expect(await source()).toBe(reviewedBody());
        expect(await committed()).toBe(false);
        await client.query(migrationSql());
        expect(await source()).toBe(head);
        expect(await committed()).toBe(true);
        await client.query(migrationSql());
        expect(await source()).toBe(head);
      } finally {
        await client.query("rollback").catch(() => undefined);
        await client.end();
      }
    });
  },
);
