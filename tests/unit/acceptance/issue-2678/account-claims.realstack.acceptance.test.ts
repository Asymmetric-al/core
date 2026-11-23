import { createHash, randomBytes, randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  caller,
  fixtureIds,
  fixtureSql,
  keepAs,
} from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const token = () => randomBytes(32).toString("base64url");
const digest = (t: string) => createHash("sha256").update(t, "utf8").digest();

describe.skipIf(!ADMIN_URL)(
  "AL-2678 account claims (plan WP5 lines 1000-1001, rulings W5-R4 and W5-R5, record line 582)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    const id = {
      ...fixtureIds(),
      UCL: randomUUID(),
      UOT: randomUUID(),
      UUN: randomUUID(),
      ULK: randomUUID(),
      dCL: randomUUID(),
      dUN: randomUUID(),
    };
    const email = (k: string) =>
      `acc2678-claim-${id[k as keyof typeof id]}@example.test`;
    const queryAs = asRole(db, id);
    const act = keepAs(db, id);
    const claimant = { sub: "UCL" };
    const other = { sub: "UOT" };
    const staff = caller(id, "US", "mS", "TA");

    beforeAll(async () => {
      await db.connect();
      await db.query("begin");
      await db.query(fixtureSql(id as never));
      await db.query(
        `insert into auth.users (id, email, email_confirmed_at) values
           ($1, $5, now()), ($2, $6, now()), ($3, $7, null), ($4, $8, now())`,
        [
          id.UCL,
          id.UOT,
          id.UUN,
          id.ULK,
          email("UCL"),
          email("UOT"),
          email("UUN"),
          email("dA"),
        ],
      );
      await db.query(
        "delete from authz.memberships where user_id = any($1::uuid[])",
        [[id.UCL, id.UOT, id.UUN, id.ULK]],
      );
      await db.query(
        `insert into public.donors (id, tenant_id, name, email) values ($1, $3, 'Claimable', $4), ($2, $3, 'Unconfirmed', $5)`,
        [id.dCL, id.dUN, id.TA, email("UCL").toUpperCase(), email("UUN")],
      );
      await db.query("update public.donors set email = $2 where id = $1", [
        id.dA,
        email("dA"),
      ]);
    });
    afterAll(async () => {
      await db.query("rollback");
      await db.end();
    });

    const start = (who: object) =>
      act(
        "authenticated",
        who as never,
        `select public.start_account_claim('${id.TA}') as r`,
      );
    const redeem = (who: object, t: string) =>
      act(
        "authenticated",
        who as never,
        `select public.redeem_account_claim('${id.TA}', '${t}') as r`,
      );
    const claimOf = async (user: string) =>
      (
        await db.query(
          "select * from public.account_claim_requests where tenant_id = $1 and requested_by = $2",
          [id.TA, user],
        )
      ).rows;
    const issue = async (claim: string, t: string) =>
      (
        await db.query("select public.issue_account_claim_token($1, $2) as r", [
          claim,
          digest(t),
        ])
      ).rows[0].r;
    const audit = async (action: string, user: string) =>
      (
        await db.query(
          "select coalesce(details->>'reason', details->>'outcome') why from public.audit_logs where tenant_id = $1 and action = $2 and user_id = $3 order by created_at",
          [id.TA, action, user],
        )
      ).rows.map((r) => r.why);
    const linked = async (user: string) =>
      (
        await db.query(
          `select (select count(*) from public.account_links where tenant_id = $1 and user_id = $2) links,
                  (select count(*) from authz.memberships where tenant_id = $1 and user_id = $2 and is_active) memberships`,
          [id.TA, user],
        )
      ).rows[0];

    it("starting a claim answers the same for a match, no match, an unconfirmed email and an already linked donor; only the match opens a claim, and none links or grants anything", async () => {
      const answers = [];
      for (const who of [claimant, other, { sub: "UUN" }, { sub: "ULK" }]) {
        const result = await start(who);
        expect(result.code, result.message).toBeNull();
        answers.push(result.rows);
      }
      for (const answer of answers)
        expect(answer).toEqual([{ r: { status: "received" } }]);
      expect(await audit("account_claim_started", id.UCL)).toEqual([
        "claim_opened",
      ]);
      expect(await audit("account_claim_started", id.UOT)).toEqual([
        "no_matching_donor",
      ]);
      expect(await audit("account_claim_started", id.UUN)).toEqual([
        "email_not_confirmed",
      ]);
      expect(await audit("account_claim_started", id.ULK)).toEqual([
        "donor_already_linked",
      ]);
      const claims = await claimOf(id.UCL);
      expect(claims).toHaveLength(1);
      expect(claims[0]).toMatchObject({
        donor_id: id.dCL,
        status: "pending",
        token_sha256: null,
      });
      for (const user of [id.UOT, id.UUN, id.ULK])
        expect(await claimOf(user)).toEqual([]);
      for (const user of [id.UCL, id.UOT, id.UUN, id.ULK])
        expect(await linked(user)).toEqual({ links: "0", memberships: "0" });
      expect((await start(claimant)).rows).toEqual([
        { r: { status: "received" } },
      ]);
      expect(await claimOf(id.UCL)).toHaveLength(1);
    });

    it("a matching email with no proof is refused: no token, a guessed token or another claim's token links nothing", async () => {
      for (const t of [token(), "", "x"])
        expect((await redeem(claimant, t)).rows).toEqual([
          { r: { status: "refused" } },
        ]);
      expect(await linked(id.UCL)).toEqual({ links: "0", memberships: "0" });
    });

    it("the issued token is stored as its 32-byte SHA-256 only and lives 24 hours", async () => {
      const [claim] = await claimOf(id.UCL);
      const t = token();
      await db.query("savepoint s");
      try {
        const issued = await issue(claim.id, t);
        expect(issued).toMatchObject({
          issued: true,
          claim_id: claim.id,
          email: email("UCL").toUpperCase(),
        });
        const row = (
          await db.query(
            `select token_sha256, octet_length(token_sha256) len, round(extract(epoch from token_expires_at - now()) / 3600) hours, donor_email_at_issue,
                    to_jsonb(c)::text as whole from public.account_claim_requests c where id = $1`,
            [claim.id],
          )
        ).rows[0];
        expect(Buffer.from(row.token_sha256)).toEqual(digest(t));
        expect([row.len, row.hours, row.donor_email_at_issue]).toEqual([
          32,
          "24",
          email("UCL"),
        ]);
        expect(row.whole).not.toContain(t);
        expect(
          (await db.query("select private.account_claim_token_lifetime() l"))
            .rows,
        ).toEqual([{ l: { hours: 24 } }]);
        expect(
          await issue(claim.id, token()),
          "one token per claim",
        ).toMatchObject({ issued: false });
      } finally {
        await db.query("rollback to savepoint s");
      }
    });

    it("a claim link is refused, with one answer, for another person, after it expires, after the contact changed, and after it was used; the audit log holds each reason", async () => {
      const [claim] = await claimOf(id.UCL);
      const t = token();
      await issue(claim.id, t);
      const refused = [{ r: { status: "refused" } }];
      expect((await redeem(other, t)).rows).toEqual(refused);
      await db.query("savepoint s");
      await db.query(
        "update public.account_claim_requests set token_expires_at = now() - interval '1 second' where id = $1",
        [claim.id],
      );
      expect((await redeem(claimant, t)).rows).toEqual(refused);
      expect(await audit("account_claim_refused", id.UCL)).toContain("expired");
      await db.query("rollback to savepoint s");
      await db.query("savepoint s");
      await db.query(
        "update public.donors set email = 'changed-' || email where id = $1",
        [id.dCL],
      );
      expect((await redeem(claimant, t)).rows).toEqual(refused);
      expect(await audit("account_claim_refused", id.UCL)).toContain(
        "contact_changed",
      );
      await db.query("rollback to savepoint s");
      expect((await redeem(claimant, t)).rows).toEqual([
        { r: { status: "linked" } },
      ]);
      expect((await redeem(claimant, t)).rows).toEqual(refused);
      expect(await audit("account_claim_refused", id.UOT)).toEqual([
        "wrong_user",
      ]);
      expect(await audit("account_claim_refused", id.UCL)).toEqual(
        expect.arrayContaining(["unknown_token", "already_redeemed"]),
      );
      const link = await db.query(
        "select al.linked_via, al.party_id = d.party_id same_party, d.profile_id from public.account_links al join public.donors d on d.id = $3 where al.tenant_id = $1 and al.user_id = $2",
        [id.TA, id.UCL, id.dCL],
      );
      expect(link.rows).toEqual([
        { linked_via: "account_claim", same_party: true, profile_id: null },
      ]);
      expect(await linked(id.UCL)).toEqual({ links: "1", memberships: "1" });
      const after = (await claimOf(id.UCL))[0];
      expect(after.status).toBe("verified");
      expect(after.token_redeemed_at).not.toBeNull();
    });

    it("the claimant reads only status and three dates of their own requests; the direct read returns nothing to them and tenant staff still read the table", async () => {
      const policies = await db.query(
        "select policyname from pg_policies where schemaname = 'public' and tablename = 'account_claim_requests' and 'authenticated' = any(roles) order by 1",
      );
      expect(policies.rows).toEqual([
        { policyname: "account_claim_requests_staff_select" },
      ]);
      expect(
        (
          await db.query(
            "select has_table_privilege('authenticated', 'public.account_claim_requests', 'SELECT') s",
          )
        ).rows,
      ).toEqual([{ s: true }]);
      expect(
        (
          await queryAs(
            "authenticated",
            claimant,
            "select * from public.account_claim_requests",
          )
        ).rows,
      ).toEqual([]);
      const own = await queryAs(
        "authenticated",
        claimant,
        `select * from public.account_claim_status('${id.TA}')`,
      );
      expect(own.rows.length).toBeGreaterThan(0);
      for (const row of own.rows)
        expect(Object.keys(row).sort()).toEqual([
          "created_at",
          "resolved_at",
          "status",
          "updated_at",
        ]);
      expect(
        (
          await queryAs(
            "authenticated",
            other,
            `select * from public.account_claim_status('${id.TA}')`,
          )
        ).rows,
      ).toEqual([]);
      expect(
        (
          await queryAs(
            "authenticated",
            staff,
            "select requested_by from public.account_claim_requests",
          )
        ).rows.map((r) => r.requested_by),
      ).toContain(id.UCL);
    });

    it("the claim commands are open to signed-in users and the token step to the service key only", async () => {
      const grants = await db.query(`select p.oid::regprocedure::text f,
          has_function_privilege('authenticated', p.oid, 'EXECUTE') auth,
          has_function_privilege('service_role', p.oid, 'EXECUTE') service,
          has_function_privilege('anon', p.oid, 'EXECUTE') anon
        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where (n.nspname, p.proname) in (('public', 'start_account_claim'), ('public', 'redeem_account_claim'), ('public', 'issue_account_claim_token'), ('public', 'account_claim_status'))
       order by 1`);
      expect(grants.rows).toEqual([
        {
          f: "account_claim_status(uuid)",
          auth: true,
          service: false,
          anon: false,
        },
        {
          f: "issue_account_claim_token(uuid,bytea)",
          auth: false,
          service: true,
          anon: false,
        },
        {
          f: "redeem_account_claim(uuid,text)",
          auth: true,
          service: false,
          anon: false,
        },
        {
          f: "start_account_claim(uuid)",
          auth: true,
          service: false,
          anon: false,
        },
      ]);
    });
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 claim redemption under concurrency (W5-R5)",
  () => {
    it("two simultaneous redemptions of one valid token: exactly one wins, one link, one redeemed time", async () => {
      const admin = new pg.Client({ connectionString: ADMIN_URL });
      const first = new pg.Client({ connectionString: ADMIN_URL });
      const second = new pg.Client({ connectionString: ADMIN_URL });
      const tenant = randomUUID();
      const user = randomUUID();
      const donor = randomUUID();
      const mail = `acc2678-race-${user}@example.test`;
      const t = token();
      await admin.connect();
      try {
        await admin.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678 claim race', 'acc2678-claim-' || $1::text)",
          [tenant],
        );
        await admin.query(
          "insert into auth.users (id, email, email_confirmed_at) values ($1, $2, now())",
          [user, mail],
        );
        await admin.query("delete from authz.memberships where user_id = $1", [
          user,
        ]);
        await admin.query(
          "insert into public.donors (id, tenant_id, name, email) values ($1, $2, 'Race', $3)",
          [donor, tenant, mail],
        );
        const claim = await admin.query(
          `insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by, token_sha256, token_expires_at, donor_email_at_issue)
         values ($1, $2, $3, $4, $5, now() + interval '1 hour', $3) returning id`,
          [tenant, donor, mail, user, digest(t)],
        );
        expect(claim.rows).toHaveLength(1);
        await first.connect();
        await second.connect();
        const prepare = (c: pg.Client) =>
          c.query(
            `begin; set local role authenticated;
           select set_config('request.jwt.claims', '${JSON.stringify({ sub: user, role: "authenticated" })}', true),
                  set_config('request.jwt.claim.sub', '', true), set_config('request.headers', '', true);`,
          );
        const redeemOn = (c: pg.Client) =>
          c
            .query("select public.redeem_account_claim($1, $2) as r", [
              tenant,
              t,
            ])
            .then((r) => r.rows[0].r);
        await prepare(first);
        await prepare(second);
        const one = await redeemOn(first);
        let settled = false;
        const two = redeemOn(second).then((r) => {
          settled = true;
          return r;
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(settled, "the second redemption waits on the row lock").toBe(
          false,
        );
        await first.query("commit");
        const answers = [one, await two];
        await second.query("commit");
        expect(answers.map((a) => a.status).sort()).toEqual([
          "linked",
          "refused",
        ]);
        const state = await admin.query(
          `select (select count(*) from public.account_links where tenant_id = $1) links,
                (select count(*) from public.account_claim_requests where tenant_id = $1 and token_redeemed_at is not null) redeemed`,
          [tenant],
        );
        expect(state.rows).toEqual([{ links: "1", redeemed: "1" }]);
      } finally {
        await first.end().catch(() => undefined);
        await second.end().catch(() => undefined);
        await admin.query(
          "delete from public.audit_logs where tenant_id = $1",
          [tenant],
        );
        await admin.query(
          "delete from public.account_links where tenant_id = $1",
          [tenant],
        );
        await admin.query(
          "delete from public.account_claim_requests where tenant_id = $1",
          [tenant],
        );
        await admin.query(
          "delete from authz.memberships where tenant_id = $1 or user_id = $2",
          [tenant, user],
        );
        await admin.query("delete from public.donors where tenant_id = $1", [
          tenant,
        ]);
        await admin.query("delete from public.parties where tenant_id = $1", [
          tenant,
        ]);
        await admin.query("delete from auth.users where id = $1", [user]);
        await admin.query("delete from public.tenants where id = $1", [tenant]);
        await admin.end();
      }
    });
  },
);
