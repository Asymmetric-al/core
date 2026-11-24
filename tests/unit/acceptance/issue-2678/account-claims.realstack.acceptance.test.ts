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
const LANE =
  "tenant_guard: request tenant scope is required and must match command tenant";

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
      TS: randomUUID(),
      UX: randomUUID(),
      dX: randomUUID(),
      UOP: randomUUID(),
      dOP: randomUUID(),
      UGO: randomUUID(),
      dGO: randomUUID(),
      URV: randomUUID(),
      dRV: randomUUID(),
      mRV: randomUUID(),
      USU: randomUUID(),
      dSU: randomUUID(),
      UQ1: randomUUID(),
      dQ1: randomUUID(),
      UQ2: randomUUID(),
      UQ4: randomUUID(),
      dQ4: randomUUID(),
      pQ4: randomUUID(),
      UQ5: randomUUID(),
      dQ5: randomUUID(),
      UQ6: randomUUID(),
      dQ6: randomUUID(),
      UY: randomUUID(),
      dY: randomUUID(),
    };
    type Key = keyof typeof id;
    const email = (k: Key) => `acc2678-claim-${id[k]}@example.test`;
    const queryAs = asRole(db, id);
    const act = keepAs(db, id);
    const inTenant = (sub: Key, tenant: Key = "TA") => ({
      sub,
      headers: { "x-asym-tenant": id[tenant] },
    });
    const claimant = inTenant("UCL");
    const other = inTenant("UOT");
    const staff = caller(id, "US", "mS", "TA");

    async function login(user: Key, confirmed = true) {
      await db.query(
        `insert into auth.users (id, email, email_confirmed_at) values ($1, $2, ${confirmed ? "now()" : "null"})`,
        [id[user], email(user)],
      );
      await db.query("delete from authz.memberships where user_id = $1", [
        id[user],
      ]);
    }

    async function unclaimedDonor(donor: Key, user: Key, tenant: Key = "TA") {
      await db.query(
        "insert into public.donors (id, tenant_id, name, email) values ($1, $2, 'Claimable', $3)",
        [id[donor], id[tenant], email(user)],
      );
    }

    async function plantedClaim(user: Key, donor: Key, tenant: Key = "TA") {
      const t = token();
      const claim = await db.query(
        `insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by, token_sha256, token_expires_at, donor_email_at_issue)
         values ($1, $2, $3, $4, $5, now() + interval '1 hour', $3) returning id`,
        [id[tenant], id[donor], email(user), id[user], digest(t)],
      );
      return { claim: claim.rows[0].id as string, t };
    }

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

    const start = (who: object, tenant: Key = "TA") =>
      act(
        "authenticated",
        who as never,
        `select public.start_account_claim('${id[tenant]}') as r`,
      );
    const redeem = (who: object, t: string, tenant: Key = "TA") =>
      act(
        "authenticated",
        who as never,
        `select public.redeem_account_claim('${id[tenant]}', '${t}') as r`,
      );
    const status = (who: object, tenant: Key = "TA") =>
      queryAs(
        "authenticated",
        who as never,
        `select * from public.account_claim_status('${id[tenant]}')`,
      );
    const claimOf = async (user: string, tenant: string = id.TA) =>
      (
        await db.query(
          "select * from public.account_claim_requests where tenant_id = $1 and requested_by = $2",
          [tenant, user],
        )
      ).rows;
    const issue = async (claim: string, t: string) => {
      const issued = await db.query(
        "select public.issue_account_claim_token($1, $2) as r",
        [claim, digest(t)],
      );
      await db.query("select set_config('app.current_tenant_id', '', true)");
      return issued.rows[0].r;
    };
    const audit = async (action: string, user: string) =>
      (
        await db.query(
          "select coalesce(details->>'reason', details->>'outcome') why from public.audit_logs where tenant_id = $1 and action = $2 and user_id = $3 order by created_at",
          [id.TA, action, user],
        )
      ).rows.map((r) => r.why);
    const linked = async (user: string, tenant: string = id.TA) =>
      (
        await db.query(
          `select (select count(*) from public.account_links where tenant_id = $1 and user_id = $2) links,
                  (select count(*) from authz.memberships where tenant_id = $1 and user_id = $2 and is_active) memberships`,
          [tenant, user],
        )
      ).rows[0];
    async function inSavepoint(fn: () => Promise<void>) {
      await db.query("savepoint s");
      try {
        await fn();
      } finally {
        await db.query("rollback to savepoint s");
      }
    }
    async function failure(sql: string, params: unknown[] = []) {
      await db.query("savepoint failure");
      try {
        await db.query(sql, params);
        return null;
      } catch (e) {
        return (e as { code?: string }).code ?? "?";
      } finally {
        await db.query("rollback to savepoint failure");
      }
    }

    it("starting a claim answers the same for a match, no match, an unconfirmed email and an already linked donor; only the match opens a claim, and none links or grants anything", async () => {
      const answers = [];
      for (const who of [claimant, other, inTenant("UUN"), inTenant("ULK")]) {
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

    it("the claimant sees a request only after proving the address: one verified row of their own, with status and three dates; the direct read returns nothing to them and tenant staff still read the table", async () => {
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
      const own = await status(claimant);
      expect(own.code, own.message).toBeNull();
      expect(own.rows).toHaveLength(1);
      expect(own.rows[0]!.status).toBe("verified");
      expect(Object.keys(own.rows[0]!).sort()).toEqual([
        "created_at",
        "resolved_at",
        "status",
        "updated_at",
      ]);
      expect((await status(other)).rows).toEqual([]);
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

    it("each claim entry binds the organization it names to the request (finding B3): start and redeem refuse a missing, blank, spaces-only, malformed or other organization's header (42501, the lane's message), and the status read returns no rows", async () => {
      for (const headers of [
        undefined,
        { "x-asym-tenant": "" },
        { "x-asym-tenant": "   " },
        { "x-asym-tenant": "not-a-uuid" },
        { "x-asym-tenant": id.TB },
      ]) {
        const who = headers ? { sub: "UCL", headers } : { sub: "UCL" };
        for (const call of [() => start(who), () => redeem(who, token())]) {
          const refused = await call();
          expect(refused.code, JSON.stringify(headers)).toBe("42501");
          expect(refused.message).toContain(LANE);
        }
        const read = await status(who);
        expect(read.code, read.message).toBeNull();
        expect(read.rows, JSON.stringify(headers)).toEqual([]);
      }
    });

    it("a platform operator is never linked or given a membership by a claim, and a soft-deleted login has no confirmed address and cannot redeem (finding B5)", () =>
      inSavepoint(async () => {
        await login("UOP");
        await login("UGO");
        await db.query(
          "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'acc2678', 'fixture operator')",
          [id.UOP],
        );
        await unclaimedDonor("dOP", "UOP");
        await unclaimedDonor("dGO", "UGO");
        await db.query(
          "alter table auth.users add column if not exists deleted_at timestamptz",
        );
        await db.query(
          "update auth.users set deleted_at = now() where id = $1",
          [id.UGO],
        );
        for (const user of ["UOP", "UGO"] as const)
          expect((await start(inTenant(user))).rows).toEqual([
            { r: { status: "received" } },
          ]);
        expect(await claimOf(id.UOP)).toEqual([]);
        expect(await claimOf(id.UGO)).toEqual([]);
        expect(await audit("account_claim_started", id.UOP)).toEqual([
          "platform_operator",
        ]);
        expect(await audit("account_claim_started", id.UGO)).toEqual([
          "email_not_confirmed",
        ]);
        const operatorClaim = await plantedClaim("UOP", "dOP");
        const goneClaim = await plantedClaim("UGO", "dGO");
        expect((await redeem(inTenant("UOP"), operatorClaim.t)).rows).toEqual([
          { r: { status: "refused" } },
        ]);
        expect((await redeem(inTenant("UGO"), goneClaim.t)).rows).toEqual([
          { r: { status: "refused" } },
        ]);
        expect(await audit("account_claim_refused", id.UOP)).toEqual([
          "platform_operator",
        ]);
        expect(await audit("account_claim_refused", id.UGO)).toEqual([
          "login_not_confirmed",
        ]);
        for (const user of [id.UOP, id.UGO])
          expect(await linked(user)).toEqual({ links: "0", memberships: "0" });
      }));

    it("a start, a token step, a redemption and a status read that name organization B for a claim of A change nothing in either; the claim then redeems in A (finding B6)", () =>
      inSavepoint(async () => {
        await login("UX");
        await unclaimedDonor("dX", "UX");
        const inA = inTenant("UX");
        const inB = inTenant("UX", "TB");
        expect((await start(inA)).rows).toEqual([
          { r: { status: "received" } },
        ]);
        const [claim] = await claimOf(id.UX);
        expect((await start(inB, "TB")).rows).toEqual([
          { r: { status: "received" } },
        ]);
        expect(await claimOf(id.UX, id.TB)).toEqual([]);
        expect(await claimOf(id.UX)).toHaveLength(1);
        const t = token();
        const crossIssue = await db.query(
          "select tenant_guard.issue_account_claim_token($1, $2, $3) as r",
          [id.TB, claim.id, digest(t)],
        );
        expect(crossIssue.rows[0].r).toMatchObject({ issued: false });
        await db.query("select set_config('app.current_tenant_id', '', true)");
        expect((await claimOf(id.UX))[0].token_sha256).toBeNull();
        expect(await issue(claim.id, t)).toMatchObject({ issued: true });
        expect((await redeem(inB, t, "TB")).rows).toEqual([
          { r: { status: "refused" } },
        ]);
        expect(await linked(id.UX, id.TB)).toEqual({
          links: "0",
          memberships: "0",
        });
        expect(await linked(id.UX)).toEqual({ links: "0", memberships: "0" });
        expect((await claimOf(id.UX))[0]).toMatchObject({
          status: "pending",
          token_redeemed_at: null,
        });
        expect((await redeem(inA, t)).rows).toEqual([
          { r: { status: "linked" } },
        ]);
        expect((await status(inB, "TB")).rows).toEqual([]);
        expect((await status(inA)).rows.map((r) => r.status)).toEqual([
          "verified",
        ]);
      }));

    it("a suspended organization opens no claim and redeems none, though the same start opens one once the organization is active again (finding B6, confirmation half B: the start is checked with no claim planted)", () =>
      inSavepoint(async () => {
        await login("USU");
        await unclaimedDonor("dSU", "USU");
        await db.query(
          "update public.tenants set status = 'suspended' where id = $1",
          [id.TA],
        );
        expect((await start(inTenant("USU"))).rows).toEqual([
          { r: { status: "received" } },
        ]);
        expect(await claimOf(id.USU)).toEqual([]);
        await db.query("savepoint active_again");
        await db.query(
          "update public.tenants set status = 'active' where id = $1",
          [id.TA],
        );
        expect((await start(inTenant("USU"))).rows).toEqual([
          { r: { status: "received" } },
        ]);
        expect(await claimOf(id.USU), "the same start, active").toHaveLength(1);
        await db.query("rollback to savepoint active_again");
        expect(await claimOf(id.USU)).toEqual([]);
        const planted = await plantedClaim("USU", "dSU");
        expect((await redeem(inTenant("USU"), planted.t)).rows).toEqual([
          { r: { status: "refused" } },
        ]);
        expect(await linked(id.USU)).toEqual({ links: "0", memberships: "0" });
        expect((await claimOf(id.USU))[0].token_redeemed_at).toBeNull();
      }));

    it("a redemption revives the claimant's revoked donor membership in that organization instead of adding a second (finding B6)", () =>
      inSavepoint(async () => {
        await login("URV");
        await unclaimedDonor("dRV", "URV");
        await db.query(
          "insert into authz.memberships (id, user_id, tenant_id, role, is_active) values ($1, $2, $3, 'donor', false)",
          [id.mRV, id.URV, id.TA],
        );
        const planted = await plantedClaim("URV", "dRV");
        expect((await redeem(inTenant("URV"), planted.t)).rows).toEqual([
          { r: { status: "linked" } },
        ]);
        expect(
          (
            await db.query(
              "select id, is_active, revoked_at from authz.memberships where tenant_id = $1 and user_id = $2",
              [id.TA, id.URV],
            )
          ).rows,
        ).toEqual([{ id: id.mRV, is_active: true, revoked_at: null }]);
      }));

    it("a token needs the donor's address at issue; the token step refuses a claim whose requester is gone or already linked; the claim table has an index on id; the command role updates only a claim's state columns; private.tenant_is_active is gone (findings B7, B8, B9)", () =>
      inSavepoint(async () => {
        await login("UY");
        await unclaimedDonor("dY", "UY");
        await db.query("savepoint no_address");
        const noAddress = await db
          .query(
            `insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by, token_sha256, token_expires_at)
             values ($1, $2, $3, $4, $5, now() + interval '1 hour')`,
            [id.TA, id.dY, email("UY"), id.UY, digest(token())],
          )
          .then(
            () => null,
            (e: { code?: string; message?: string }) =>
              `${e.code} ${e.message}`,
          );
        await db.query("rollback to savepoint no_address");
        expect(noAddress).toBe(
          '23514 new row for relation "account_claim_requests" violates check constraint "account_claim_requests_token_pair_check"',
        );
        const gone = await db.query(
          "insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by) values ($1, $2, $3, null) returning id",
          [id.TA, id.dY, email("UY")],
        );
        expect(await issue(gone.rows[0].id, token())).toMatchObject({
          issued: false,
        });
        const linkedRequester = await db.query(
          "insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by) values ($1, $2, $3, $4) returning id",
          [id.TA, id.dY, email("UY"), id.UDA],
        );
        expect(await issue(linkedRequester.rows[0].id, token())).toMatchObject({
          issued: false,
        });
        const catalog = await db.query(
          `select exists (select 1 from pg_index i where i.indrelid = 'public.account_claim_requests'::regclass
                    and pg_get_indexdef(i.indexrelid) ~ '\\(id\\)$') id_index,
                  has_column_privilege('tenant_guard', 'public.account_claim_requests', 'status', 'UPDATE') status_update,
                  has_column_privilege('tenant_guard', 'public.account_claim_requests', 'requested_by', 'UPDATE') requester_update,
                  has_column_privilege('tenant_guard', 'public.account_claim_requests', 'donor_id', 'UPDATE') donor_update,
                  to_regprocedure('private.tenant_is_active(uuid)') is null helper_gone`,
        );
        expect(catalog.rows).toEqual([
          {
            id_index: true,
            status_update: true,
            requester_update: false,
            donor_update: false,
            helper_gone: true,
          },
        ]);
      }));

    it("starting a claim tells nothing (ruling on finding B4): for a match and each unmatched outcome, start answers the same, the status read is empty straight after the start and after the token step, a direct read returns nothing and a random token is refused; an unredeemed row stays hidden whatever its status, and a redemption shows exactly one verified row", () =>
      inSavepoint(async () => {
        await login("UQ1");
        await unclaimedDonor("dQ1", "UQ1");
        await login("UQ2");
        await login("UQ4");
        await unclaimedDonor("dQ4", "UQ4");
        await db.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Linked caller')",
          [id.pQ4, id.TA],
        );
        await db.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'account_claim')",
          [id.TA, id.UQ4, id.pQ4],
        );
        await db.query(
          "insert into public.tenants (id, name, slug, status) values ($1::uuid, 'acc2678 suspended', 'acc2678-s-' || $1::text, 'suspended')",
          [id.TS],
        );
        await db.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'S', 'US', 'usd', 'S')",
          [id.TS],
        );
        await login("UQ5");
        await unclaimedDonor("dQ5", "UQ5", "TS");
        await login("UQ6");
        await unclaimedDonor("dQ6", "UQ6");
        expect((await start(inTenant("UQ6"))).rows).toEqual([
          { r: { status: "received" } },
        ]);
        const cases: [string, Key, Key][] = [
          ["matched", "UQ1", "TA"],
          ["no donor", "UQ2", "TA"],
          ["donor already linked", "ULK", "TA"],
          ["caller already linked", "UQ4", "TA"],
          ["address unconfirmed", "UUN", "TA"],
          ["inactive organization", "UQ5", "TS"],
          ["claim already open", "UQ6", "TA"],
        ];
        for (const [label, user, tenant] of cases) {
          const who = inTenant(user, tenant);
          const started = await start(who, tenant);
          expect(started.code, `${label}: ${started.message}`).toBeNull();
          expect(started.rows, label).toEqual([{ r: { status: "received" } }]);
          expect((await status(who, tenant)).rows, label).toEqual([]);
          for (const claim of await claimOf(id[user], id[tenant]))
            if (claim.token_sha256 === null)
              await issue(claim.id as string, token());
          expect((await status(who, tenant)).rows, label).toEqual([]);
          expect(
            (
              await queryAs(
                "authenticated",
                who as never,
                "select * from public.account_claim_requests",
              )
            ).rows,
            label,
          ).toEqual([]);
          expect((await redeem(who, token(), tenant)).rows, label).toEqual([
            { r: { status: "refused" } },
          ]);
        }
        expect(await audit("account_claim_started", id.UQ6)).toEqual([
          "claim_opened",
          "claim_already_open",
        ]);
        expect(
          await claimOf(id.UQ5, id.TS),
          "inactive organization: no claim",
        ).toEqual([]);
        expect(await claimOf(id.UQ1), "matched: one claim").toHaveLength(1);
        for (const user of ["UQ2", "ULK", "UQ4", "UUN"] as const)
          expect(await claimOf(id[user]), `${user}: no claim`).toEqual([]);
        const [matched] = await claimOf(id.UQ1);
        for (const hidden of ["expired", "denied", "approved"]) {
          await db.query(
            "update public.account_claim_requests set status = $2 where id = $1",
            [matched.id, hidden],
          );
          expect((await status(inTenant("UQ1"))).rows, hidden).toEqual([]);
        }
        const t = token();
        await db.query(
          "update public.account_claim_requests set status = 'pending', token_sha256 = $2 where id = $1",
          [matched.id, digest(t)],
        );
        expect((await redeem(inTenant("UQ1"), t)).rows).toEqual([
          { r: { status: "linked" } },
        ]);
        expect(
          (await status(inTenant("UQ1"))).rows.map((r) => r.status),
        ).toEqual(["verified"]);
      }));
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 claim redemption under concurrency (W5-R5, finding B2)",
  () => {
    async function race(
      plant: (
        admin: pg.Client,
        tenant: string,
      ) => Promise<{
        calls: [string, string][];
        check: (admin: pg.Client) => Promise<void>;
      }>,
    ) {
      const admin = new pg.Client({ connectionString: ADMIN_URL });
      const first = new pg.Client({ connectionString: ADMIN_URL });
      const second = new pg.Client({ connectionString: ADMIN_URL });
      const tenant = randomUUID();
      const users: string[] = [];
      await admin.connect();
      try {
        await admin.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678 claim race', 'acc2678-claim-' || $1::text)",
          [tenant],
        );
        const { calls, check } = await plant(admin, tenant);
        for (const [user] of calls) if (!users.includes(user)) users.push(user);
        await first.connect();
        await second.connect();
        const prepare = (c: pg.Client, user: string) =>
          c.query(
            `begin; set local role authenticated;
           select set_config('request.jwt.claims', '${JSON.stringify({ sub: user, role: "authenticated" })}', true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', '${JSON.stringify({ "x-asym-tenant": tenant })}', true);`,
          );
        const redeemOn = (c: pg.Client, t: string) =>
          c
            .query("select public.redeem_account_claim($1, $2) as r", [
              tenant,
              t,
            ])
            .then(
              (r) => r.rows[0].r,
              (e) => ({ error: (e as { code?: string }).code }),
            );
        await prepare(first, calls[0]![0]);
        await prepare(second, calls[1]![0]);
        const one = await redeemOn(first, calls[0]![1]);
        let settled = false;
        const two = redeemOn(second, calls[1]![1]).then((r) => {
          settled = true;
          return r;
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
        expect(settled, "the second redemption waits for the first").toBe(
          false,
        );
        await first.query("commit");
        const answers = [one, await two];
        await second.query("commit").catch(() => second.query("rollback"));
        expect(answers.map((a) => a.status ?? a.error).sort()).toEqual([
          "linked",
          "refused",
        ]);
        await check(admin);
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
          "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
          [tenant, users],
        );
        await admin.query("delete from public.donors where tenant_id = $1", [
          tenant,
        ]);
        await admin.query("delete from public.parties where tenant_id = $1", [
          tenant,
        ]);
        await admin.query("delete from auth.users where id = any($1::uuid[])", [
          users,
        ]);
        await admin.query("delete from public.tenants where id = $1", [tenant]);
        await admin.end();
      }
    }

    async function claimFor(
      admin: pg.Client,
      tenant: string,
      user: string,
      donor: string,
      mail: string,
    ) {
      const t = token();
      await admin.query(
        `insert into public.account_claim_requests (tenant_id, donor_id, email, requested_by, token_sha256, token_expires_at, donor_email_at_issue)
         values ($1, $2, $3, $4, $5, now() + interval '1 hour', $3)`,
        [tenant, donor, mail, user, digest(t)],
      );
      return t;
    }

    async function newUser(admin: pg.Client, mail: string) {
      const user = randomUUID();
      await admin.query(
        "insert into auth.users (id, email, email_confirmed_at) values ($1, $2, now())",
        [user, mail],
      );
      await admin.query("delete from authz.memberships where user_id = $1", [
        user,
      ]);
      return user;
    }

    it("two simultaneous redemptions of one valid token: exactly one wins, one link, one redeemed time", () =>
      race(async (admin, tenant) => {
        const mail = `acc2678-race-${randomUUID()}@example.test`;
        const user = await newUser(admin, mail);
        const donor = randomUUID();
        await admin.query(
          "insert into public.donors (id, tenant_id, name, email) values ($1, $2, 'Race', $3)",
          [donor, tenant, mail],
        );
        const t = await claimFor(admin, tenant, user, donor, mail);
        return {
          calls: [
            [user, t],
            [user, t],
          ],
          check: async (a) => {
            const state = await a.query(
              `select (select count(*) from public.account_links where tenant_id = $1) links,
                    (select count(*) from public.account_claim_requests where tenant_id = $1 and token_redeemed_at is not null) redeemed`,
              [tenant],
            );
            expect(state.rows).toEqual([{ links: "1", redeemed: "1" }]);
          },
        };
      }));

    it("two logins with two valid tokens on one donor at once: exactly one link and one donor membership, the other refused", () =>
      race(async (admin, tenant) => {
        const mail = `acc2678-race-donor-${randomUUID()}@example.test`;
        const one = await newUser(
          admin,
          `acc2678-race-one-${randomUUID()}@example.test`,
        );
        const two = await newUser(
          admin,
          `acc2678-race-two-${randomUUID()}@example.test`,
        );
        const donor = randomUUID();
        await admin.query(
          "insert into public.donors (id, tenant_id, name, email) values ($1, $2, 'Race', $3)",
          [donor, tenant, mail],
        );
        const t1 = await claimFor(admin, tenant, one, donor, mail);
        const t2 = await claimFor(admin, tenant, two, donor, mail);
        return {
          calls: [
            [one, t1],
            [two, t2],
          ],
          check: async (a) => {
            const state = await a.query(
              `select (select count(*) from public.account_links al join public.donors d on d.party_id = al.party_id where d.id = $2) links,
                    (select count(*) from authz.memberships where tenant_id = $1 and role = 'donor' and is_active and user_id = any($3::uuid[])) memberships`,
              [tenant, donor, [one, two]],
            );
            expect(state.rows).toEqual([{ links: "1", memberships: "1" }]);
          },
        };
      }));

    it("one login redeeming two tokens at once: one served, one refused, never 23505", () =>
      race(async (admin, tenant) => {
        const user = await newUser(
          admin,
          `acc2678-race-same-${randomUUID()}@example.test`,
        );
        const mails = [
          `acc2678-race-d1-${randomUUID()}@example.test`,
          `acc2678-race-d2-${randomUUID()}@example.test`,
        ];
        const donors = [randomUUID(), randomUUID()];
        for (const i of [0, 1])
          await admin.query(
            "insert into public.donors (id, tenant_id, name, email) values ($1, $2, 'Race', $3)",
            [donors[i], tenant, mails[i]],
          );
        const t1 = await claimFor(admin, tenant, user, donors[0]!, mails[0]!);
        const t2 = await claimFor(admin, tenant, user, donors[1]!, mails[1]!);
        return {
          calls: [
            [user, t1],
            [user, t2],
          ],
          check: async (a) => {
            const state = await a.query(
              `select (select count(*) from public.account_links where tenant_id = $1 and user_id = $2) links,
                    (select count(*) from authz.memberships where tenant_id = $1 and user_id = $2 and is_active) memberships`,
              [tenant, user],
            );
            expect(state.rows).toEqual([{ links: "1", memberships: "1" }]);
          },
        };
      }));
  },
);

describe.skipIf(!ADMIN_URL)(
  "AL-2678 a matched claim start never waits on another caller (ruling D-16; confirmation half B, new problem 2)",
  () => {
    type Fixture = { admin: pg.Client; tenant: string; user: string };
    async function withMatchedDonor(
      fn: (f: Fixture & { party: string }) => Promise<void>,
    ) {
      const admin = new pg.Client({ connectionString: ADMIN_URL });
      const tenant = randomUUID();
      const user = randomUUID();
      const donor = randomUUID();
      const mail = `acc2678-start-${randomUUID()}@example.test`;
      await admin.connect();
      try {
        await admin.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2678 start race', 'acc2678-start-' || $1::text)",
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
          "insert into public.donors (id, tenant_id, name, email) values ($1, $2, 'Start race', $3)",
          [donor, tenant, mail],
        );
        const party = (
          await admin.query(
            "select party_id from public.donors where id = $1",
            [donor],
          )
        ).rows[0].party_id as string;
        expect(party).toBeTruthy();
        await fn({ admin, tenant, user, party });
      } finally {
        await admin.query(
          "delete from public.audit_logs where tenant_id = $1",
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
    }

    async function startCall(user: string, tenant: string) {
      const c = new pg.Client({ connectionString: ADMIN_URL });
      await c.connect();
      try {
        await c.query(
          `begin; set local role authenticated;
           select set_config('request.jwt.claims', '${JSON.stringify({ sub: user, role: "authenticated" })}', true),
                  set_config('request.jwt.claim.sub', '', true),
                  set_config('request.headers', '${JSON.stringify({ "x-asym-tenant": tenant })}', true);`,
        );
        const r = await c.query("select public.start_account_claim($1) as r", [
          tenant,
        ]);
        await c.query("commit");
        return r.rows[0].r as Record<string, unknown>;
      } catch (e) {
        await c.query("rollback").catch(() => undefined);
        return { error: (e as { code?: string }).code ?? "?" };
      } finally {
        await c.end().catch(() => undefined);
      }
    }

    const outcomes = async (admin: pg.Client, tenant: string, user: string) =>
      (
        await admin.query(
          "select details->>'outcome' o from public.audit_logs where tenant_id = $1 and user_id = $2 and action = 'account_claim_started' order by o",
          [tenant, user],
        )
      ).rows.map((r) => r.o as string);
    const openClaims = async (admin: pg.Client, tenant: string) =>
      (
        await admin.query(
          "select count(*)::int n from public.account_claim_requests where tenant_id = $1 and status = 'pending'",
          [tenant],
        )
      ).rows[0].n as number;

    it("while another transaction holds the donor's Party, a matched start answers received at once, opens no claim and records claim_already_open", () =>
      withMatchedDonor(async ({ admin, tenant, user, party }) => {
        const holder = new pg.Client({ connectionString: ADMIN_URL });
        await holder.connect();
        let settled = false;
        let call: Promise<Record<string, unknown>> | undefined;
        let settledWhileHeld = false;
        try {
          await holder.query("begin");
          await holder.query(
            "select 1 from public.parties where id = $1 for update",
            [party],
          );
          call = startCall(user, tenant).then((r) => {
            settled = true;
            return r;
          });
          await new Promise((resolve) => setTimeout(resolve, 3000));
          settledWhileHeld = settled;
        } finally {
          await holder.query("rollback").catch(() => undefined);
          await holder.end().catch(() => undefined);
        }
        const answer = await call;
        expect(
          settledWhileHeld,
          "the start settles while the Party is still held",
        ).toBe(true);
        expect(answer).toEqual({ status: "received" });
        expect(await openClaims(admin, tenant)).toBe(0);
        expect(await outcomes(admin, tenant, user)).toEqual([
          "claim_already_open",
        ]);
      }));

    it("a burst of six concurrent matched starts by one login: every answer is received, exactly one claim is open, one start opened it and five found it already open", () =>
      withMatchedDonor(async ({ admin, tenant, user }) => {
        const answers = await Promise.all(
          Array.from({ length: 6 }, () => startCall(user, tenant)),
        );
        expect(answers).toEqual(
          Array.from({ length: 6 }, () => ({ status: "received" })),
        );
        expect(await openClaims(admin, tenant)).toBe(1);
        expect(await outcomes(admin, tenant, user)).toEqual([
          ...Array.from({ length: 5 }, () => "claim_already_open"),
          "claim_opened",
        ]);
      }));
  },
);
