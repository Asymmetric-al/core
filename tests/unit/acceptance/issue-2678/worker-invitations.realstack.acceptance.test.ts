import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, backendPid } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const BLOCKED =
  "select $2::int = any(pg_catalog.pg_blocking_pids($1::int)) as blocked";
const LEGAL = "Legal Name Of The Invited Worker";

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

type Outcome =
  | { ok: true; r: Record<string, unknown> }
  | { ok: false; code?: string; message?: string };

const outcome = (call: Promise<pg.QueryResult>): Promise<Outcome> =>
  call.then(
    (r) => ({ ok: true as const, r: r.rows[0].r as Record<string, unknown> }),
    (e: { code?: string; message?: string }) => ({
      ok: false as const,
      code: e.code,
      message: e.message,
    }),
  );

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest 2b (brief stage5/wp5-rest.md, pull request 2, invariant 11): staff holding people.manage_members and safety.restrict_publication invite a worker, new or existing; the invited person's acceptance writes the membership, an account link ('invitation') and the worker's login in one transaction under the donor writer's lock, and refuses, writing nothing, another address, a worker that has a login, a person tied to another Party there, and the second of two at once",
  () => {
    const admin = new pg.Client({ connectionString: ADMIN_URL });
    const tenant = randomUUID();
    const users: string[] = [];
    const opened = new Set<pg.Client & { pid: number }>();

    async function login(confirmed = true) {
      const user = randomUUID();
      const mail = `wp5rest2b-invite-${user}@example.test`;
      await admin.query(
        `insert into auth.users (id, email, email_confirmed_at) values ($1, $2, ${confirmed ? "now()" : "null"})`,
        [user, mail],
      );
      await admin.query(
        "insert into public.profiles (id, user_id) values ($1, $1) on conflict (id) do nothing",
        [user],
      );
      await admin.query("delete from authz.memberships where user_id = $1", [
        user,
      ]);
      users.push(user);
      return { user, mail };
    }

    async function staff(admin_ = true) {
      const { user } = await login();
      await admin.query(
        "insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin) values ($1, $2, 'staff', 'development', $3)",
        [user, tenant, admin_],
      );
      return user;
    }

    async function party(name = "Worker Heron") {
      return (
        await admin.query(
          "insert into public.parties (tenant_id, display_name) values ($1, $2) returning id",
          [tenant, name],
        )
      ).rows[0].id as string;
    }

    async function worker(profile: string | null = null) {
      const p = await party();
      const id = (
        await admin.query(
          "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1) returning id",
          [tenant, p, profile],
        )
      ).rows[0].id as string;
      return { party: p, worker: id };
    }

    async function session(
      user: string,
      isolation: "read committed" | "repeatable read" = "read committed",
    ) {
      const c = new pg.Client({ connectionString: ADMIN_URL });
      await c.connect();
      try {
        const open = Object.assign(c, { pid: await backendPid(c) });
        opened.add(open);
        await c.query(`begin isolation level ${isolation}`);
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

    async function committed(
      user: string,
      run: (c: pg.Client) => Promise<Outcome>,
    ) {
      const c = await session(user);
      try {
        const answer = await run(c);
        if (answer.ok) await c.query("commit");
        return answer;
      } finally {
        await finish(c);
      }
    }

    const inviteNew = (
      c: pg.Client,
      email: string,
      names: { display?: string; legal?: string; reason?: string } = {},
    ) =>
      outcome(
        c.query(
          "select public.invite_worker(p_tenant_id => $1, p_email => $2, p_party_id => null, p_display_name => $3, p_legal_name => $4, p_real_country => null, p_precise_location => null, p_legal_entity_id => null, p_reason => $5) as r",
          [
            tenant,
            email,
            names.display ?? "Worker Heron",
            names.legal ?? LEGAL,
            names.reason ?? "New field worker",
          ],
        ),
      );

    const inviteExisting = (
      c: pg.Client,
      email: string,
      partyId: string,
      legal: string | null = null,
    ) =>
      outcome(
        c.query(
          "select public.invite_worker(p_tenant_id => $1, p_email => $2, p_party_id => $3, p_display_name => null, p_legal_name => $4, p_real_country => null, p_precise_location => null, p_legal_entity_id => null, p_reason => 'Sign in to your record') as r",
          [tenant, email, partyId, legal],
        ),
      );

    const accept = (c: pg.Client, link: Record<string, unknown>) =>
      outcome(
        c.query("select public.accept_membership_invitation($1, $2) as r", [
          link.selector,
          link.verifier,
        ]),
      );

    async function issued(email: string, partyId: string) {
      const by = await staff();
      const answer = await committed(by, (c) =>
        inviteExisting(c, email, partyId),
      );
      expect(answer.ok, JSON.stringify(answer)).toBe(true);
      return (answer as { r: Record<string, unknown> }).r;
    }

    const q = async (sql: string, args: unknown[] = [tenant]) =>
      (await admin.query(sql, args)).rows;

    async function written(user: string) {
      return {
        memberships: await q(
          "select role::text from authz.memberships where tenant_id = $1 and user_id = $2",
          [tenant, user],
        ),
        links: await q(
          "select party_id, linked_via from public.account_links where tenant_id = $1 and user_id = $2",
          [tenant, user],
        ),
        workers: await q(
          "select id, party_id from public.missionaries where tenant_id = $1 and profile_id = $2",
          [tenant, user],
        ),
      };
    }

    const nothing = { memberships: [], links: [], workers: [] };

    async function counts() {
      return (
        await q(
          `select (select count(*)::int from public.parties where tenant_id = $1) parties,
                  (select count(*)::int from public.missionaries where tenant_id = $1) workers,
                  (select count(*)::int from public.membership_invitations where tenant_id = $1) invitations,
                  (select count(*)::int from public.account_links where tenant_id = $1) links,
                  (select count(*)::int from public.audit_logs where tenant_id = $1) audits`,
        )
      )[0];
    }

    const statusOf = async (invitation: unknown) =>
      (
        await q(
          "select status from public.membership_invitations where tenant_id = $1 and id = $2",
          [tenant, invitation],
        )
      )[0]?.status;

    beforeAll(async () => {
      await admin.connect();
      await admin.query(
        "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp5rest2b invitations', 'wp5rest2b-invitations-' || $1::text)",
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
        for (const table of [
          "audit_logs",
          "membership_invitations",
          "account_links",
          "donation_saga_outbox",
          "donations",
          "donors",
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
          [tenant, users],
        );
        await admin.query("delete from public.tenants where id = $1", [tenant]);
        await admin.query("delete from auth.users where id = any($1::uuid[])", [
          users,
        ]);
      } finally {
        await admin.end();
      }
    });

    it("inviting a new worker with both capabilities makes one Party at standard and unreviewed and one worker row with no login, the invitation names that Party (missionary, no staff role), three audit rows are written (worker_created, worker_identity_set, membership_invitation_issued), and the answer gives the link's parts and no legal name (red: 42883)", async () => {
      const by = await staff();
      const { mail } = await login();
      const before = await counts();
      const answer = await committed(by, (c) => inviteNew(c, mail));
      expect(answer.ok, JSON.stringify(answer)).toBe(true);
      const r = (answer as { r: Record<string, unknown> }).r;
      expect(JSON.stringify(r)).not.toContain(LEGAL);
      expect(r).toMatchObject({
        role: "missionary",
        staff_role: null,
        is_tenant_admin: false,
      });
      expect(typeof r.selector).toBe("string");
      expect(typeof r.verifier).toBe("string");
      const [made] = await q(
        "select p.id, p.security_level, p.security_level_source, m.id worker, m.profile_id from public.parties p join public.missionaries m on m.party_id = p.id and m.tenant_id = p.tenant_id where p.tenant_id = $1 and p.id = $2",
        [tenant, r.party_id],
      );
      expect(made).toMatchObject({
        security_level: "standard",
        security_level_source: "unreviewed_default",
        worker: r.assignment_id,
        profile_id: null,
      });
      expect(
        await q(
          "select party_id, role::text, email from public.membership_invitations where tenant_id = $1 and id = $2",
          [tenant, r.invitation_id],
        ),
      ).toEqual([{ party_id: r.party_id, role: "missionary", email: mail }]);
      expect(
        (
          await q(
            "select action from public.audit_logs where tenant_id = $1 and user_id = $2 order by created_at, id",
            [tenant, by],
          )
        ).map((row) => row.action),
      ).toEqual([
        "worker_created",
        "worker_identity_set",
        "membership_invitation_issued",
      ]);
      expect(await counts()).toEqual({
        ...before,
        parties: before.parties + 1,
        workers: before.workers + 1,
        invitations: before.invitations + 1,
        audits: before.audits + 3,
      });
    });

    it("refused, writing nothing: a staff member without the tenant-administrator flag (who holds neither capability) 42501; a blank display name, legal name or reason 22023; an existing worker named with a legal name 22023; a worker that already has a login 55006, or another login linked to its Party 55006; a Party with no worker row P0002 (red: 42883)", async () => {
      const by = await staff();
      const plain = await staff(false);
      const { mail } = await login();
      const withLogin = await worker((await login()).user);
      const linked = await worker();
      const other = await login();
      await admin.query(
        "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
        [tenant, other.user, linked.party],
      );
      const bare = await party("Not a worker");
      const plainWorker = await worker();
      const before = await counts();
      const cases: [string, string, (c: pg.Client) => Promise<Outcome>][] = [
        ["no capability", "42501", (c) => inviteNew(c, mail)],
        ["blank display", "22023", (c) => inviteNew(c, mail, { display: " " })],
        ["blank legal", "22023", (c) => inviteNew(c, mail, { legal: " " })],
        ["blank reason", "22023", (c) => inviteNew(c, mail, { reason: "" })],
        [
          "existing with names",
          "22023",
          (c) => inviteExisting(c, mail, plainWorker.party, LEGAL),
        ],
        [
          "has a login",
          "55006",
          (c) => inviteExisting(c, mail, withLogin.party),
        ],
        ["linked login", "55006", (c) => inviteExisting(c, mail, linked.party)],
        ["no worker", "P0002", (c) => inviteExisting(c, mail, bare)],
      ];
      for (const [name, code, run] of cases) {
        const answer = await committed(
          name === "no capability" ? plain : by,
          run,
        );
        expect([name, answer.ok ? "ok" : answer.code]).toEqual([name, code]);
      }
      expect(await counts()).toEqual(before);
    });

    it("the invited person accepts: a missionary membership, an account link ('invitation') to the worker's Party and the worker's login, one transaction; the invitation is accepted, the answer names the Party and the worker, and the login's sole assignment is that worker, so their workspace opens with no claim step (red: no link and no login)", async () => {
      const { user, mail } = await login();
      const w = await worker();
      const link = await issued(mail, w.party);
      const answer = await committed(user, (c) => accept(c, link));
      expect(answer.ok, JSON.stringify(answer)).toBe(true);
      expect((answer as { r: Record<string, unknown> }).r).toMatchObject({
        role: "missionary",
        user_id: user,
        party_id: w.party,
        assignment_id: w.worker,
      });
      expect(await written(user)).toEqual({
        memberships: [{ role: "missionary" }],
        links: [{ party_id: w.party, linked_via: "invitation" }],
        workers: [{ id: w.worker, party_id: w.party }],
      });
      expect(await statusOf(link.invitation_id)).toBe("accepted");
      await admin.query("begin");
      try {
        await admin.query(
          "select set_config('app.current_tenant_id', $1, true)",
          [tenant],
        );
        expect(
          (
            await admin.query(
              "select private.assignment_for_profile($1, $2) a, private.login_party($1, $2) p",
              [tenant, user],
            )
          ).rows[0],
        ).toEqual({ a: w.worker, p: w.party });
      } finally {
        await admin.query("rollback");
      }
    });

    it("refused, writing nothing (no membership, link or login, the invitation still issued): another verified address 42501; a worker given a login after the invitation 55006; a worker another login was linked to after it 55006; a person who holds another worker row there 21000, or a link to another Party there 21000, or a donor on another Party there 21000 (red: the person is let in and tied to two Parties)", async () => {
      const cases: [
        string,
        string,
        (w: { party: string; worker: string }, user: string) => Promise<void>,
        boolean?,
      ][] = [
        ["another address", "42501", async () => undefined, true],
        [
          "worker given a login",
          "55006",
          async (w) => {
            await admin.query(
              "update public.missionaries set profile_id = $2 where id = $1",
              [w.worker, (await login()).user],
            );
          },
        ],
        [
          "worker linked to another login",
          "55006",
          async (w) => {
            await admin.query(
              "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
              [tenant, (await login()).user, w.party],
            );
          },
        ],
        [
          "holds another worker row",
          "21000",
          async (_w, user) => {
            await worker(user);
          },
        ],
        [
          "linked to another Party",
          "21000",
          async (_w, user) => {
            await admin.query(
              "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
              [tenant, user, await party("Elsewhere")],
            );
          },
        ],
        [
          "own donor on another Party",
          "21000",
          async (_w, user) => {
            await admin.query(
              "insert into public.donors (tenant_id, party_id, profile_id, name) values ($1, $2, $3, 'Donor')",
              [tenant, await party("Giver"), user],
            );
          },
        ],
      ];
      for (const [name, code, arrange, otherAddress] of cases) {
        const invited = await login();
        const caller = otherAddress ? await login() : invited;
        const w = await worker();
        const link = await issued(invited.mail, w.party);
        await arrange(w, caller.user);
        const before = await written(caller.user);
        const answer = await committed(caller.user, (c) => accept(c, link));
        expect([name, answer.ok ? "ok" : answer.code]).toEqual([name, code]);
        expect([name, await written(caller.user)]).toEqual([name, before]);
        expect([name, await statusOf(link.invitation_id)]).toEqual([
          name,
          "issued",
        ]);
      }
    });

    it("two people invited to one worker accept at once: the second waits for the first, then is refused 55006 and writes nothing; the first holds the one membership, link and login (red: both are let in)", async () => {
      const w = await worker();
      const [one, two] = [await login(), await login()];
      const [linkOne, linkTwo] = [
        await issued(one.mail, w.party),
        await issued(two.mail, w.party),
      ];
      const first = await session(one.user);
      const second = await session(two.user);
      try {
        expect((await accept(first, linkOne)).ok).toBe(true);
        const pending = accept(second, linkTwo);
        const waited = await blockedOrSettled(
          admin,
          pending,
          second.pid,
          first.pid,
        );
        await first.query("commit");
        const late = await pending;
        await second.query("rollback");
        expect(late).toMatchObject({ ok: false, code: "55006" });
        expect(waited).toBe(true);
      } finally {
        await finish(first);
        await finish(second);
      }
      expect(await written(one.user)).toEqual({
        memberships: [{ role: "missionary" }],
        links: [{ party_id: w.party, linked_via: "invitation" }],
        workers: [{ id: w.worker, party_id: w.party }],
      });
      expect(await written(two.user)).toEqual(nothing);
      expect(await statusOf(linkTwo.invitation_id)).toBe("issued");
    });

    it("an invitation that names a Party is accepted only at READ COMMITTED: under REPEATABLE READ it is refused 25001 and nothing is written (red: accepted)", async () => {
      const { user, mail } = await login();
      const w = await worker();
      const link = await issued(mail, w.party);
      const c = await session(user, "repeatable read");
      let answer: Outcome;
      try {
        answer = await accept(c, link);
        if (answer.ok) await c.query("commit");
      } finally {
        await finish(c);
      }
      expect(answer).toMatchObject({ ok: false, code: "25001" });
      expect(await written(user)).toEqual(nothing);
    });

    it("the acceptance takes the donor writer's lock: a gift of the accepting login sent while the acceptance holds waits for it, then gives to the worker's Party, and no other Party is made (red: the gift does not wait and makes a Party of its own)", async () => {
      const { user, mail } = await login();
      const w = await worker();
      const link = await issued(mail, w.party);
      const accepting = await session(user);
      const giver = new pg.Client({ connectionString: ADMIN_URL });
      await giver.connect();
      const giverPid = await backendPid(giver);
      const parties = (await counts()).parties;
      try {
        expect((await accept(accepting, link)).ok).toBe(true);
        await giver.query("begin");
        await giver.query("set local lock_timeout = '20s'");
        const gift = giver.query(
          "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 500, p_idempotency_key => $3) r",
          [tenant, user, randomUUID()],
        );
        const waited = await blockedOrSettled(
          admin,
          gift,
          giverPid,
          accepting.pid,
        );
        await accepting.query("commit");
        const made = (await gift).rows[0].r as { donor_id: string };
        await giver.query("commit");
        expect(
          await q("select party_id from public.donors where id = $1", [
            made.donor_id,
          ]),
        ).toEqual([{ party_id: w.party }]);
        expect((await counts()).parties).toBe(parties);
        expect(waited).toBe(true);
      } finally {
        await finish(accepting);
        await giver.query("rollback").catch(() => undefined);
        await giver.end();
      }
    });

    it("an invitation that names no Party is accepted as before: a missionary membership, no link and no worker's login (guard)", async () => {
      const by = await staff();
      const { user, mail } = await login();
      const issuedPlain = await committed(by, (c) =>
        outcome(
          c.query(
            "select public.invite_member($1, $2, 'missionary', null, false, 'Plain invite') as r",
            [tenant, mail],
          ),
        ),
      );
      expect(issuedPlain.ok, JSON.stringify(issuedPlain)).toBe(true);
      const answer = await committed(user, (c) =>
        accept(c, (issuedPlain as { r: Record<string, unknown> }).r),
      );
      expect(answer.ok, JSON.stringify(answer)).toBe(true);
      expect(Object.keys((answer as { r: object }).r).sort()).toEqual(
        [
          "accepted_at",
          "invitation_id",
          "is_tenant_admin",
          "membership_id",
          "revived",
          "role",
          "staff_role",
          "tenant_id",
          "user_id",
        ].sort(),
      );
      expect(await written(user)).toEqual({
        memberships: [{ role: "missionary" }],
        links: [],
        workers: [],
      });
    });

    it("invite_worker is a human command owned by tenant_guard that opens with begin_human_command(p_tenant_id, 'people.manage_members'), EXECUTE for authenticated only; private.accept_worker_invitation is a postgres-owned definer with an empty search path, EXECUTE for tenant_guard only (red: neither exists)", async () => {
      const rows = await q(
        `select p.oid::regprocedure::text fn, pg_get_userbyid(p.proowner) owner, p.prosecdef, p.proconfig,
                (select coalesce(string_agg(distinct case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end, '+'), '-')
                   from aclexplode(p.proacl) a where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) grantees,
                position('tenant_guard.begin_human_command(p_tenant_id, ''people.manage_members'')' in p.prosrc) > 0 opens
           from pg_proc p
          where p.oid in (to_regprocedure('tenant_guard.invite_worker(uuid,text,uuid,text,text,text,text,uuid,text)'),
                          to_regprocedure('private.accept_worker_invitation(uuid,uuid,uuid)'))
          order by 1`,
        [],
      );
      expect(rows).toEqual([
        {
          fn: "private.accept_worker_invitation(uuid,uuid,uuid)",
          owner: "postgres",
          prosecdef: true,
          proconfig: ['search_path=""'],
          grantees: "tenant_guard",
          opens: false,
        },
        {
          fn: "tenant_guard.invite_worker(uuid,text,uuid,text,text,text,text,uuid,text)",
          owner: "tenant_guard",
          prosecdef: true,
          proconfig: ['search_path=""'],
          grantees: "authenticated",
          opens: true,
        },
      ]);
    });
  },
);
