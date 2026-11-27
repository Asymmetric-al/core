import { createHash, randomBytes, randomUUID } from "node:crypto";

import pg from "pg";
import { describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, backendPid } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const token = () => randomBytes(32).toString("base64url");
const digest = (t: string) => createHash("sha256").update(t, "utf8").digest();
const BLOCKED =
  "select $2::int = any(pg_catalog.pg_blocking_pids($1::int)) as blocked";
const LOGIN_PARTY = "private.login_party(uuid,uuid)";
const MERGE_PAIR = "private.record_claim_merge_candidate(uuid,uuid,uuid)";

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

type World = {
  admin: pg.Client;
  tenant: string;
  login: (confirmed?: boolean) => Promise<{ user: string; mail: string }>;
  party: (name: string) => Promise<string>;
  donor: (
    party: string,
    columns?: { profile?: string | null; email?: string | null },
  ) => Promise<string>;
  worker: (party: string, user: string) => Promise<string>;
  link: (user: string, party: string) => Promise<void>;
  claim: (user: string, donor: string, mail: string) => Promise<string>;
};

async function inWorld(run: (w: World) => Promise<void>) {
  const admin = new pg.Client({ connectionString: ADMIN_URL });
  const tenant = randomUUID();
  const users: string[] = [];
  await admin.connect();
  try {
    await admin.query(
      "insert into public.tenants (id, name, slug) values ($1::uuid, 'wp5rest2 lock', 'wp5rest2-lock-' || $1::text)",
      [tenant],
    );
    await admin.query(
      "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'L', 'US', 'usd', 'L')",
      [tenant],
    );
    const w: World = {
      admin,
      tenant,
      async login(confirmed = true) {
        const user = randomUUID();
        const mail = `wp5rest2-lock-${user}@example.test`;
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
      },
      async party(name) {
        return (
          await admin.query(
            "insert into public.parties (tenant_id, display_name) values ($1, $2) returning id",
            [tenant, name],
          )
        ).rows[0].id as string;
      },
      async donor(party, columns = {}) {
        return (
          await admin.query(
            "insert into public.donors (tenant_id, party_id, profile_id, name, email) values ($1, $2, $3, 'Donor', $4) returning id",
            [tenant, party, columns.profile ?? null, columns.email ?? null],
          )
        ).rows[0].id as string;
      },
      async worker(party, user) {
        return (
          await admin.query(
            "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1) returning id",
            [tenant, party, user],
          )
        ).rows[0].id as string;
      },
      async link(user, party) {
        await admin.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
          [tenant, user, party],
        );
      },
      async claim(user, donor, mail) {
        const t = token();
        await admin.query(
          `insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by, token_sha256, token_expires_at, donor_email_at_issue)
           values ($1, $2, $3, $4, $5, now() + interval '1 hour', $3)`,
          [tenant, donor, mail, user, digest(t)],
        );
        return t;
      },
    };
    await run(w);
  } finally {
    for (const table of [
      "donor_merge_candidates",
      "audit_logs",
      "account_claim_requests",
      "account_links",
      "donation_saga_outbox",
      "donations",
      "missionaries",
      "donors",
      "parties",
    ])
      await admin.query(`delete from public.${table} where tenant_id = $1`, [
        tenant,
      ]);
    await admin.query(
      "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
      [tenant, users],
    );
    await admin.query(
      "delete from public.legal_entities where tenant_id = $1",
      [tenant],
    );
    await admin.query("delete from public.tenants where id = $1", [tenant]);
    await admin.query("delete from auth.users where id = any($1::uuid[])", [
      users,
    ]);
    await admin.end();
  }
}

async function session(user?: string, tenant?: string) {
  const c = new pg.Client({ connectionString: ADMIN_URL });
  await c.connect();
  const pid = await backendPid(c);
  await c.query("begin");
  if (user && tenant)
    await c.query(
      `set local role authenticated;
       select set_config('request.jwt.claims', '${JSON.stringify({ sub: user, role: "authenticated" })}', true),
              set_config('request.jwt.claim.sub', '', true),
              set_config('request.headers', '${JSON.stringify({ "x-asym-tenant": tenant })}', true);`,
    );
  return Object.assign(c, { pid });
}

const gift = (
  c: pg.Client,
  tenant: string,
  user: string,
  writer:
    | "begin_donation_saga"
    | "atomic_create_donation_with_audit" = "begin_donation_saga",
) =>
  c
    .query(
      writer === "begin_donation_saga"
        ? "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => $2, p_actor_user_id => $2, p_amount => 500, p_idempotency_key => $3) r"
        : "select public.atomic_create_donation_with_audit(p_tenant_id => $1, p_donor_profile_id => $2, p_actor_user_id => $2, p_missionary_id => null, p_amount => 300) r",
      writer === "begin_donation_saga"
        ? [tenant, user, randomUUID()]
        : [tenant, user],
    )
    .then((r) => r.rows[0].r as { donor_id: string; donation_id: string });

const redeem = (c: pg.Client, tenant: string, t: string) =>
  c
    .query("select public.redeem_account_claim($1, $2) r", [tenant, t])
    .then((r) => r.rows[0].r as { status: string });

async function finish(...clients: pg.Client[]) {
  for (const c of clients) {
    await c.query("rollback").catch(() => undefined);
    await c.end().catch(() => undefined);
  }
}

async function state(w: World, user: string) {
  const q = (sql: string, args: unknown[] = [w.tenant]) =>
    w.admin.query(sql, args).then((r) => r.rows);
  return {
    parties: (await q(
      "select id from public.parties where tenant_id = $1 order by id",
    )) as { id: string }[],
    donors: (await q(
      "select id, party_id, profile_id from public.donors where tenant_id = $1 order by id",
    )) as { id: string; party_id: string; profile_id: string | null }[],
    gifts: (await q(
      "select donor_id from public.donations where tenant_id = $1 order by created_at, id",
    )) as { donor_id: string }[],
    links: (await q(
      "select party_id from public.account_links where tenant_id = $1 and user_id = $2",
      [w.tenant, user],
    )) as { party_id: string }[],
    refusals: (await q(
      "select details->>'reason' reason from public.audit_logs where tenant_id = $1 and user_id = $2 and action = 'account_claim_refused' order by created_at",
      [w.tenant, user],
    )) as { reason: string }[],
    candidates: (await q(
      "select existing_donor_id, incoming_donor_id, confidence, status from public.donor_merge_candidates where tenant_id = $1",
    )) as Record<string, string>[],
  };
}

describe.skipIf(!ADMIN_URL)(
  "AL-2678 WP5 rest 2, item zero (a) and (b) (issue 2835, 26-27 November; ruling decision-wp5-rest-1-confirm-findings): every writer of a donor or an account link for (organization, login) takes ('donor_party_writer', organization:login), resolves the Party (account link, else sole worker row, else that login's donor), locks it FOR UPDATE and reads its donors: none, one is inserted; one, it is used; more, 21000 and nothing written; the claim takes the same lock before it links, and a login is tied to at most one Party",
  () => {
    it("(a, b) the claim commits first, then the same person's gift that was in flight: one donor and one Party, the claimed one, and the gift waited on the claim's writer lock (red: the gift makes a second Party)", () =>
      inWorld(async (w) => {
        const { user, mail } = await w.login();
        const claimed = await w.party("Claimable");
        const donor = await w.donor(claimed, { email: mail });
        const t = await w.claim(user, donor, mail);
        const claim = await session(user, w.tenant);
        const giver = await session();
        try {
          expect(await redeem(claim, w.tenant, t)).toEqual({
            status: "linked",
          });
          const pending = gift(giver, w.tenant, user);
          const waited = await blockedOrSettled(
            w.admin,
            pending,
            giver.pid,
            claim.pid,
          );
          await claim.query("commit");
          const made = await pending;
          await giver.query("commit");
          const after = await state(w, user);
          expect(after.parties).toEqual([{ id: claimed }]);
          expect(after.donors.map((d) => d.id)).toEqual([donor]);
          expect(made.donor_id).toBe(donor);
          expect(after.links).toEqual([{ party_id: claimed }]);
          expect(waited).toBe(true);
        } finally {
          await finish(claim, giver);
        }
      }));

    it("(a, b) the gift commits first on a new Party, then the claim: refused with its uniform answer, nothing linked, one Party for the login, the claimed donor untouched, the refusal audited as caller_has_other_party and the pair recorded once for staff (red: the claim links a second Party)", () =>
      inWorld(async (w) => {
        const { user, mail } = await w.login();
        const claimed = await w.party("Claimable");
        const donor = await w.donor(claimed, { email: mail });
        const t = await w.claim(user, donor, mail);
        const giver = await session();
        const claim = await session(user, w.tenant);
        try {
          const made = await gift(giver, w.tenant, user);
          const pending = redeem(claim, w.tenant, t);
          const waited = await blockedOrSettled(
            w.admin,
            pending,
            claim.pid,
            giver.pid,
          );
          await giver.query("commit");
          const answer = await pending;
          await claim.query("commit");
          const after = await state(w, user);
          expect(answer).toEqual({ status: "refused" });
          expect(after.links).toEqual([]);
          const own = after.donors.find((d) => d.id === made.donor_id)!;
          expect(own.profile_id).toBe(user);
          expect(
            after.donors.filter((d) => d.profile_id === user),
          ).toHaveLength(1);
          expect(after.donors.find((d) => d.id === donor)).toEqual({
            id: donor,
            party_id: claimed,
            profile_id: null,
          });
          expect(
            (
              await w.admin.query(
                "select d.email, c.status from public.donors d join public.account_claim_requests c on c.donor_id = d.id where d.id = $1",
                [donor],
              )
            ).rows,
          ).toEqual([{ email: mail, status: "pending" }]);
          expect(after.refusals).toEqual([
            { reason: "caller_has_other_party" },
          ]);
          expect(after.candidates).toEqual([
            {
              existing_donor_id: made.donor_id,
              incoming_donor_id: donor,
              confidence: "possible",
              status: "open",
            },
          ]);
          expect(waited).toBe(true);

          const again = await session(user, w.tenant);
          try {
            expect(await redeem(again, w.tenant, t)).toEqual({
              status: "refused",
            });
            await again.query("commit");
          } finally {
            await finish(again);
          }
          expect((await state(w, user)).candidates).toHaveLength(1);
        } finally {
          await finish(giver, claim);
        }
      }));

    it("(b) a login whose sole worker row is on another Party is refused by the claim, nothing linked, and with no donor on that Party no pair is recorded (red: linked)", () =>
      inWorld(async (w) => {
        const { user, mail } = await w.login();
        await w.worker(await w.party("Worker"), user);
        const claimed = await w.party("Claimable");
        const donor = await w.donor(claimed, { email: mail });
        const t = await w.claim(user, donor, mail);
        const claim = await session(user, w.tenant);
        try {
          expect(await redeem(claim, w.tenant, t)).toEqual({
            status: "refused",
          });
          await claim.query("commit");
          const after = await state(w, user);
          expect(after.links).toEqual([]);
          expect(after.refusals).toEqual([
            { reason: "caller_has_other_party" },
          ]);
          expect(after.candidates).toEqual([]);
        } finally {
          await finish(claim);
        }
      }));

    it("(b, fix round F4 of 2859) a login already linked to another Party is refused as before, caller_already_linked, nothing linked, and the pair is offered to staff once: that Party's sole donor and the claimed donor (red: no candidate)", () =>
      inWorld(async (w) => {
        const { user, mail } = await w.login();
        const linked = await w.party("Linked");
        const own = await w.donor(linked);
        await w.link(user, linked);
        const claimed = await w.party("Claimable");
        const donor = await w.donor(claimed, { email: mail });
        const t = await w.claim(user, donor, mail);
        for (let attempt = 0; attempt < 2; attempt++) {
          const claim = await session(user, w.tenant);
          try {
            expect(await redeem(claim, w.tenant, t)).toEqual({
              status: "refused",
            });
            await claim.query("commit");
          } finally {
            await finish(claim);
          }
        }
        const after = await state(w, user);
        expect(after.links).toEqual([{ party_id: linked }]);
        expect(after.refusals).toEqual([
          { reason: "caller_already_linked" },
          { reason: "caller_already_linked" },
        ]);
        expect(after.candidates).toEqual([
          {
            existing_donor_id: own,
            incoming_donor_id: donor,
            confidence: "possible",
            status: "open",
          },
        ]);
      }));

    it("(b, fix round F4 of 2859) a login linked to the claimed donor's own Party is refused and offers nothing to staff (guard)", () =>
      inWorld(async (w) => {
        const { user, mail } = await w.login();
        const claimed = await w.party("Claimable");
        const donor = await w.donor(claimed, { email: mail });
        await w.link(user, claimed);
        const t = await w.claim(user, donor, mail);
        const claim = await session(user, w.tenant);
        try {
          expect(await redeem(claim, w.tenant, t)).toEqual({
            status: "refused",
          });
          await claim.query("commit");
        } finally {
          await finish(claim);
        }
        const after = await state(w, user);
        expect(after.links).toEqual([{ party_id: claimed }]);
        expect(after.candidates).toEqual([]);
      }));

    for (const order of ["A then B", "B then A"] as const)
      it(`(b, fix round F4 of 2859) two logins each tied by a worker row to a Party with one donor claim each other's donor at once, ${order}: both refused, and one open candidate for the pair, the second redemption waiting on the first (red: two open candidates)`, () =>
        inWorld(async (w) => {
          const a = await w.login();
          const b = await w.login();
          const partyA = await w.party("A");
          const partyB = await w.party("B");
          await w.worker(partyA, a.user);
          await w.worker(partyB, b.user);
          const donorA = await w.donor(partyA, { email: a.mail });
          const donorB = await w.donor(partyB, { email: b.mail });
          const tokenA = await w.claim(a.user, donorB, b.mail);
          const tokenB = await w.claim(b.user, donorA, a.mail);
          const [firstUser, firstToken, secondUser, secondToken] =
            order === "A then B"
              ? [a.user, tokenA, b.user, tokenB]
              : [b.user, tokenB, a.user, tokenA];
          const first = await session(firstUser, w.tenant);
          let second: Awaited<ReturnType<typeof session>> | undefined;
          let pending: Promise<{ status: string }> | undefined;
          try {
            second = await session(secondUser, w.tenant);
            expect(await redeem(first, w.tenant, firstToken)).toEqual({
              status: "refused",
            });
            pending = redeem(second, w.tenant, secondToken);
            const waited = await blockedOrSettled(
              w.admin,
              pending,
              second.pid,
              first.pid,
            );
            await first.query("commit");
            expect(await pending).toEqual({ status: "refused" });
            await second.query("commit");
            const open = (await state(w, a.user)).candidates.filter(
              (c) => c.status === "open",
            );
            expect(
              open.map((c) =>
                [c.existing_donor_id, c.incoming_donor_id].sort(),
              ),
              JSON.stringify([
                (await state(w, a.user)).refusals,
                (await state(w, b.user)).refusals,
              ]),
            ).toEqual([[donorA, donorB].sort()]);
            expect(waited).toBe(true);
          } finally {
            await finish(first);
            await pending?.catch(() => undefined);
            if (second) await finish(second);
          }
        }));

    it("(a) a worker with no account link whose Party already carries a donor with no profile gives through both legacy writers at once: that donor gets both gifts and no donor is added (red: a second donor on the worker's Party)", () =>
      inWorld(async (w) => {
        const { user } = await w.login();
        const party = await w.party("Worker");
        await w.worker(party, user);
        const existing = await w.donor(party);
        const first = await session();
        const second = await session();
        try {
          const one = await gift(first, w.tenant, user);
          const pending = gift(
            second,
            w.tenant,
            user,
            "atomic_create_donation_with_audit",
          );
          expect(
            await blockedOrSettled(w.admin, pending, second.pid, first.pid),
          ).toBe(true);
          await first.query("commit");
          const two = await pending;
          await second.query("commit");
          const after = await state(w, user);
          expect(after.donors).toEqual([
            { id: existing, party_id: party, profile_id: null },
          ]);
          expect([one.donor_id, two.donor_id]).toEqual([existing, existing]);
          expect(after.gifts).toEqual([
            { donor_id: existing },
            { donor_id: existing },
          ]);
        } finally {
          await finish(first, second);
        }
      }));

    it("(a) two logins linked to one Party with no donor give at once: one donor on that Party gets both gifts, and the second waits on the Party row (red: two donors on one Party)", () =>
      inWorld(async (w) => {
        const a = await w.login();
        const b = await w.login();
        const party = await w.party("Shared");
        await w.link(a.user, party);
        await w.link(b.user, party);
        const first = await session();
        const second = await session();
        try {
          const one = await gift(first, w.tenant, a.user);
          const pending = gift(second, w.tenant, b.user);
          const waited = await blockedOrSettled(
            w.admin,
            pending,
            second.pid,
            first.pid,
          );
          await first.query("commit");
          const two = await pending;
          await second.query("commit");
          const after = await state(w, a.user);
          expect(after.donors).toEqual([
            { id: one.donor_id, party_id: party, profile_id: a.user },
          ]);
          expect(two.donor_id).toBe(one.donor_id);
          expect(after.gifts).toHaveLength(2);
          expect(waited).toBe(true);
          expect(
            (
              await w.admin.query(
                "select count(*)::int n from public.parties where tenant_id = $1",
                [w.tenant],
              )
            ).rows,
          ).toEqual([{ n: 1 }]);
        } finally {
          await finish(first, second);
        }
      }));

    it("(a) a login whose Party (its sole worker row's) has no donor while the login holds a donor on another Party is refused by either legacy writer (21000) and nothing is written (red: the gift goes to the other Party's donor)", () =>
      inWorld(async (w) => {
        const { user } = await w.login();
        await w.worker(await w.party("Worker"), user);
        const elsewhere = await w.donor(await w.party("Elsewhere"), {
          profile: user,
        });
        for (const writer of [
          "begin_donation_saga",
          "atomic_create_donation_with_audit",
        ] as const) {
          const c = await session();
          try {
            const code = await gift(c, w.tenant, user, writer).then(
              () => null,
              (e: { code?: string }) => e.code ?? "?",
            );
            expect([writer, code]).toEqual([writer, "21000"]);
          } finally {
            await finish(c);
          }
        }
        const after = await state(w, user);
        expect(after.gifts).toEqual([]);
        expect(after.donors.map((d) => d.id)).toEqual([elsewhere]);
      }));

    it("(a) a guest (no login) still gets a new Party and donor for each gift, without the writer lock (guard)", () =>
      inWorld(async (w) => {
        const c = await session();
        try {
          const one = await c
            .query(
              "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => null, p_actor_user_id => null, p_amount => 500, p_idempotency_key => $2) r",
              [w.tenant, randomUUID()],
            )
            .then((r) => r.rows[0].r);
          const two = await c
            .query(
              "select public.begin_donation_saga(p_tenant_id => $1, p_profile_id => null, p_actor_user_id => null, p_amount => 500, p_idempotency_key => $2) r",
              [w.tenant, randomUUID()],
            )
            .then((r) => r.rows[0].r);
          expect(one.donor_id).not.toBe(two.donor_id);
          const parties = await c.query(
            "select count(distinct party_id)::int n from public.donors where tenant_id = $1",
            [w.tenant],
          );
          expect(parties.rows).toEqual([{ n: 2 }]);
          const locks = await c.query(
            "select count(*)::int n from pg_catalog.pg_locks where pid = pg_catalog.pg_backend_pid() and locktype = 'advisory' and objsubid = 2 and classid::bigint = (pg_catalog.hashtext('donor_party_writer')::bigint & 4294967295)",
          );
          expect(locks.rows).toEqual([{ n: 0 }]);
        } finally {
          await finish(c);
        }
      }));

    it("(b) the two helpers the claim calls are postgres-owned definers with an empty search path, EXECUTE for tenant_guard only; neither reads auth (red: 42883)", () =>
      inWorld(async (w) => {
        const r = await w.admin.query(
          `select p.oid::regprocedure::text fn, p.prosecdef, pg_get_userbyid(p.proowner) owner, p.proconfig, p.prosrc,
                  (select coalesce(string_agg(distinct case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end, '+'), '-')
                     from aclexplode(p.proacl) a where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner) grantees
             from pg_proc p where p.oid in ($1::regprocedure, $2::regprocedure) order by 1`,
          [LOGIN_PARTY, MERGE_PAIR],
        );
        expect(
          r.rows.map(({ prosrc, ...rest }) => ({
            ...rest,
            readsAuth: /\bauth\s*\./i.test(prosrc as string),
          })),
        ).toEqual(
          [
            "private.login_party(uuid,uuid)",
            "private.record_claim_merge_candidate(uuid,uuid,uuid)",
          ].map((fn) => ({
            fn,
            prosecdef: true,
            owner: "postgres",
            proconfig: ['search_path=""'],
            grantees: "tenant_guard",
            readsAuth: false,
          })),
        );
      }));
  },
);
