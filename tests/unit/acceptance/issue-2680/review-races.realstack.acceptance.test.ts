import { randomUUID } from "node:crypto";

import pg from "pg";
import { describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB, backendPid, waitsOn } from "./harness";

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("migrate supplies its database", () =>
  expect(ADMIN_URL).toBeTruthy(),
);

const SUBMIT =
  "select public.submit_ministry_update($1, null, 'Race', 'Body', '[]'::jsonb, 'public', null, true, null, false) as id";
const APPROVE = "select public.approve_ministry_update($1, $2, 1)";
const RESTRICT =
  "select public.restrict_worker_publication($1, $2, 'restricted', 'Cedar', null, 'Threat reported')";

type Fixture = {
  tenant: string;
  author: string;
  authorAssignment: string;
  reviewer: string;
  reviewerAssignment: string;
  admin: string;
  adminAssignment: string;
  party: string;
  ministry: string;
  donor: string;
  donorAssignment: string;
};

const outcome = (call: Promise<unknown>) =>
  call.then(
    () => "done",
    (e) => {
      const err = e as { code?: string; message?: string };
      return `${err.code ?? "?"} ${err.message ?? ""}`;
    },
  );

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

describe.skipIf(!ADMIN_URL)(
  "AL-2680 WP7 pull request 1: review under concurrency (never item 7)",
  () => {
    async function withFixture(
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
        authorAssignment: randomUUID(),
        reviewer: randomUUID(),
        reviewerAssignment: randomUUID(),
        admin: randomUUID(),
        adminAssignment: randomUUID(),
        party: randomUUID(),
        ministry: randomUUID(),
        donor: randomUUID(),
        donorAssignment: randomUUID(),
      };
      const users = [f.author, f.reviewer, f.admin, f.donor];
      await admin.connect();
      try {
        await admin.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'acc2680 race', 'acc2680-race-' || $1::text)",
          [f.tenant],
        );
        await admin.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'R', 'US', 'usd', 'R')",
          [f.tenant],
        );
        await admin.query(
          "insert into auth.users (id, email, email_confirmed_at) select u, 'acc2680-race-' || u || '@example.test', now() from unnest($1::uuid[]) u",
          [users],
        );
        await admin.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [users],
        );
        await admin.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_active, is_tenant_admin) values
             ($1, $2, $7, 'missionary', null, true, false),
             ($3, $4, $7, 'staff', 'development', true, false),
             ($5, $6, $7, 'staff', 'development', true, true),
             ($8, $9, $7, 'donor', null, true, false)`,
          [
            f.authorAssignment,
            f.author,
            f.reviewerAssignment,
            f.reviewer,
            f.adminAssignment,
            f.admin,
            f.tenant,
            f.donorAssignment,
            f.donor,
          ],
        );
        await admin.query(
          "insert into public.parties (id, tenant_id, display_name) values ($1, $2, 'Race worker')",
          [f.party, f.tenant],
        );
        await admin.query(
          "insert into public.missionaries (id, tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $4, $2)",
          [f.ministry, f.tenant, f.party, f.author],
        );
        await admin.query(
          "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill')",
          [f.tenant, f.author, f.party],
        );
        await signIn(admin, f.author, f.tenant, f.authorAssignment);
        const submitted = await admin.query(SUBMIT, [f.tenant]);
        await admin.query("commit");
        await first.connect();
        await second.connect();
        await run(f, submitted.rows[0].id as string, [first, second, admin]);
      } finally {
        await first.end().catch(() => undefined);
        await second.end().catch(() => undefined);
        await admin.query("rollback").catch(() => undefined);
        for (const sql of [
          "delete from public.audit_logs where tenant_id = $1",
          "delete from public.posts where tenant_id = $1",
          "delete from public.publication_policies where tenant_id = $1",
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

    const reviewState = async (client: pg.Client, post: string) =>
      (
        await client.query(
          "select review_state, worker_withheld from public.posts where id = $1",
          [post],
        )
      ).rows[0];

    const readers = async (f: Fixture, client: pg.Client, post: string) => {
      const seen: boolean[] = [];
      for (const signedIn of [false, true]) {
        if (signedIn)
          await signIn(client, f.donor, f.tenant, f.donorAssignment);
        else await client.query("begin; set local role anon");
        try {
          const r = await client.query(
            "select id from public.posts where id = $1",
            [post],
          );
          seen.push(r.rows.length === 1);
        } finally {
          await client.query("rollback");
        }
      }
      return seen;
    };

    const automatic = (f: Fixture, client: pg.Client) =>
      client.query(
        "insert into public.publication_policies (tenant_id, ministry_assignment_id, path, mode, reason, set_by, set_by_assignment_id) values ($1, $2, 'update', 'automatic', 'Trusted writer', $3, $4)",
        [f.tenant, f.ministry, f.admin, f.adminAssignment],
      );

    it("S2: a submit under automatic waiting on a restriction of its worker ends withheld, absent from anon and a donor", () =>
      withFixture(async (f, _post, [restrictor, submitter, observer]) => {
        await automatic(f, observer);
        const restrictorPid = await backendPid(restrictor);
        const submitterPid = await backendPid(submitter);
        await signIn(restrictor, f.admin, f.tenant, f.adminAssignment);
        await restrictor.query(RESTRICT, [f.tenant, f.party]);
        await signIn(submitter, f.author, f.tenant, f.authorAssignment);
        const submission = submitter
          .query(SUBMIT, [f.tenant])
          .then((r) => r.rows[0].id as string);
        submission.catch(() => undefined);
        await waitsOn(observer, submitterPid, restrictorPid);
        await restrictor.query("commit");
        const post = await submission;
        await submitter.query("commit");
        expect(await reviewState(observer, post)).toEqual({
          review_state: "approved",
          worker_withheld: true,
        });
        expect(await readers(f, observer, post)).toEqual([false, false]);
      }));

    it("S2: a restriction waiting on a submit under automatic runs after it, so the update ends withheld, absent from anon and a donor", () =>
      withFixture(async (f, _post, [submitter, restrictor, observer]) => {
        await automatic(f, observer);
        const submitterPid = await backendPid(submitter);
        const restrictorPid = await backendPid(restrictor);
        await signIn(submitter, f.author, f.tenant, f.authorAssignment);
        const submitted = await submitter.query(SUBMIT, [f.tenant]);
        const post = submitted.rows[0].id as string;
        await signIn(restrictor, f.admin, f.tenant, f.adminAssignment);
        const restriction = outcome(
          restrictor.query(RESTRICT, [f.tenant, f.party]),
        );
        await waitsOn(observer, restrictorPid, submitterPid);
        await submitter.query("commit");
        expect(await restriction).toBe("done");
        await restrictor.query("commit");
        expect(await reviewState(observer, post)).toEqual({
          review_state: "approved",
          worker_withheld: true,
        });
        expect(await readers(f, observer, post)).toEqual([false, false]);
      }));

    it("C1: an edit waiting on the revocation of its author's assignment is refused (42501) and the update keeps its words and its one audit row", () =>
      withFixture(async (f, post, [revoker, editor, observer]) => {
        const revokerPid = await backendPid(revoker);
        const editorPid = await backendPid(editor);
        await revoker.query("begin");
        await revoker.query(
          "update authz.memberships set is_active = false where id = $1",
          [f.authorAssignment],
        );
        await signIn(editor, f.author, f.tenant, f.authorAssignment);
        const edit = outcome(
          editor.query(
            "select public.submit_ministry_update($1, $2, 'Edited', 'Edited body', '[]'::jsonb, 'public', null, true, null, false)",
            [f.tenant, post],
          ),
        );
        await waitsOn(observer, editorPid, revokerPid);
        await revoker.query("commit");
        expect(await edit).toMatch(/^42501 /);
        await editor.query("rollback");
        const row = await observer.query(
          "select title from public.posts where id = $1",
          [post],
        );
        expect(row.rows).toEqual([{ title: "Race" }]);
        const audit = await observer.query(
          "select action from public.audit_logs where tenant_id = $1",
          [f.tenant],
        );
        expect(audit.rows).toEqual([{ action: "ministry_update.submit" }]);
      }));

    it("an approval waiting on the author's withdrawal ends refused, and the update stays withdrawn", () =>
      withFixture(async (f, post, [withdrawer, approver, observer]) => {
        const withdrawerPid = await backendPid(withdrawer);
        const approverPid = await backendPid(approver);
        await signIn(withdrawer, f.author, f.tenant, f.authorAssignment);
        await withdrawer.query(
          "select public.withdraw_own_ministry_update($1, $2)",
          [f.tenant, post],
        );
        await signIn(approver, f.reviewer, f.tenant, f.reviewerAssignment);
        const approval = outcome(approver.query(APPROVE, [f.tenant, post]));
        await waitsOn(observer, approverPid, withdrawerPid);
        await withdrawer.query("commit");
        expect(await approval).toBe(
          "22023 Only a submitted update can be approved",
        );
        await approver.query("rollback");
        expect(await reviewState(observer, post)).toEqual({
          review_state: "withdrawn",
          worker_withheld: false,
        });
      }));

    it("a withdrawal waiting on an approval runs after it, so the update ends withdrawn", () =>
      withFixture(async (f, post, [approver, withdrawer, observer]) => {
        const approverPid = await backendPid(approver);
        const withdrawerPid = await backendPid(withdrawer);
        await signIn(approver, f.reviewer, f.tenant, f.reviewerAssignment);
        await approver.query(APPROVE, [f.tenant, post]);
        await signIn(withdrawer, f.author, f.tenant, f.authorAssignment);
        const withdrawal = outcome(
          withdrawer.query(
            "select public.withdraw_own_ministry_update($1, $2)",
            [f.tenant, post],
          ),
        );
        await waitsOn(observer, withdrawerPid, approverPid);
        await approver.query("commit");
        expect(await withdrawal).toBe("done");
        await withdrawer.query("commit");
        expect(await reviewState(observer, post)).toEqual({
          review_state: "withdrawn",
          worker_withheld: false,
        });
      }));

    it("an approval waiting on a restriction of the worker ends refused, and the update stays submitted and withheld", () =>
      withFixture(async (f, post, [restrictor, approver, observer]) => {
        const restrictorPid = await backendPid(restrictor);
        const approverPid = await backendPid(approver);
        await signIn(restrictor, f.admin, f.tenant, f.adminAssignment);
        await restrictor.query(RESTRICT, [f.tenant, f.party]);
        await signIn(approver, f.reviewer, f.tenant, f.reviewerAssignment);
        const approval = outcome(approver.query(APPROVE, [f.tenant, post]));
        await waitsOn(observer, approverPid, restrictorPid);
        await restrictor.query("commit");
        expect(await approval).toBe(
          "22023 The worker's updates are withheld while they are restricted",
        );
        await approver.query("rollback");
        expect(await reviewState(observer, post)).toEqual({
          review_state: "submitted",
          worker_withheld: true,
        });
      }));

    it("a restriction waiting on an approval runs after it, so the approved update is withheld from every read", () =>
      withFixture(async (f, post, [approver, restrictor, observer]) => {
        const approverPid = await backendPid(approver);
        const restrictorPid = await backendPid(restrictor);
        await signIn(approver, f.reviewer, f.tenant, f.reviewerAssignment);
        await approver.query(APPROVE, [f.tenant, post]);
        await signIn(restrictor, f.admin, f.tenant, f.adminAssignment);
        const restriction = outcome(
          restrictor.query(RESTRICT, [f.tenant, f.party]),
        );
        await waitsOn(observer, restrictorPid, approverPid);
        await approver.query("commit");
        expect(await restriction).toBe("done");
        await restrictor.query("commit");
        expect(await reviewState(observer, post)).toEqual({
          review_state: "approved",
          worker_withheld: true,
        });
      }));

    it("a reviewer assignment revoked while the approval waits on its lock is refused (42501), and the update stays submitted", () =>
      withFixture(async (f, post, [revoker, approver, observer]) => {
        const revokerPid = await backendPid(revoker);
        const approverPid = await backendPid(approver);
        await revoker.query("begin");
        await revoker.query(
          "update authz.memberships set is_active = false where id = $1",
          [f.reviewerAssignment],
        );
        await signIn(approver, f.reviewer, f.tenant, f.reviewerAssignment);
        const approval = outcome(approver.query(APPROVE, [f.tenant, post]));
        await waitsOn(observer, approverPid, revokerPid);
        await revoker.query("commit");
        expect(await approval).toMatch(/^42501 /);
        await approver.query("rollback");
        expect(await reviewState(observer, post)).toEqual({
          review_state: "submitted",
          worker_withheld: false,
        });
        const audit = await observer.query(
          "select action from public.audit_logs where tenant_id = $1 order by created_at",
          [f.tenant],
        );
        expect(audit.rows).toEqual([{ action: "ministry_update.submit" }]);
      }));
  },
);
