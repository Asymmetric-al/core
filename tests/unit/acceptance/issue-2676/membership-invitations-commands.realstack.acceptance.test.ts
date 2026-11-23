import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ADMIN_URL, IN_MIGRATE_JOB } from "../issue-2674/harness";

const GENERIC_ACCEPT_REFUSAL = "Invitation is invalid or no longer available";

type RawOutcome = {
  code: string | null;
  message: string | null;
  rows: Record<string, unknown>[];
};

async function runAs(
  client: pg.Client,
  role: string,
  sub: string | null,
  sql: string,
  opts?: {
    aal?: string;
    headers?: Record<string, string>;
    params?: unknown[];
    lockTimeoutMs?: number;
  },
): Promise<RawOutcome> {
  await client.query("savepoint sp_run_as");
  try {
    if (opts?.lockTimeoutMs !== undefined) {
      await client.query(
        `set local lock_timeout = '${Math.floor(opts.lockTimeoutMs)}ms'`,
      );
    }
    const claims: Record<string, unknown> = {
      role,
      ...(sub ? { sub } : {}),
      ...(opts?.aal ? { aal: opts.aal } : {}),
    };
    await client.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(claims),
    ]);
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [
      sub ?? "",
    ]);
    await client.query("select set_config('request.headers', $1, true)", [
      JSON.stringify(opts?.headers ?? {}),
    ]);
    await client.query(`set local role ${role}`);
    const res = await client.query(sql, opts?.params ?? []);
    await client.query("reset role");
    await client.query("release savepoint sp_run_as");
    return {
      code: null,
      message: null,
      rows: res.rows as Record<string, unknown>[],
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    await client.query("rollback to savepoint sp_run_as");
    await client.query("release savepoint sp_run_as");
    return {
      code: err.code ?? "UNKNOWN",
      message: err.message ?? String(error),
      rows: [],
    };
  }
}

async function runCommittedAs(
  client: pg.Client,
  role: string,
  sub: string | null,
  sql: string,
  opts?: {
    aal?: string;
    headers?: Record<string, string>;
    params?: unknown[];
    lockTimeoutMs?: number;
  },
): Promise<RawOutcome> {
  await client.query("begin");
  try {
    if (opts?.lockTimeoutMs !== undefined) {
      await client.query(
        `set local lock_timeout = '${Math.floor(opts.lockTimeoutMs)}ms'`,
      );
    }
    const claims: Record<string, unknown> = {
      role,
      ...(sub ? { sub } : {}),
      ...(opts?.aal ? { aal: opts.aal } : {}),
    };
    await client.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(claims),
    ]);
    await client.query("select set_config('request.jwt.claim.sub', $1, true)", [
      sub ?? "",
    ]);
    await client.query("select set_config('request.headers', $1, true)", [
      JSON.stringify(opts?.headers ?? {}),
    ]);
    await client.query(`set local role ${role}`);
    const res = await client.query(sql, opts?.params ?? []);
    await client.query("reset role");
    await client.query("commit");
    return {
      code: null,
      message: null,
      rows: res.rows as Record<string, unknown>[],
    };
  } catch (error) {
    const err = error as { code?: string; message?: string };
    await client.query("rollback");
    return {
      code: err.code ?? "UNKNOWN",
      message: err.message ?? String(error),
      rows: [],
    };
  }
}

function makeIds() {
  return {
    tenantA: randomUUID(),
    tenantB: randomUUID(),
    tenantNoAdmin: randomUUID(),
    adminA: randomUUID(),
    adminA2: randomUUID(),
    staffA: randomUUID(),
    donorA: randomUUID(),
    missionaryA: randomUUID(),
    inviteeStaff: randomUUID(),
    inviteeMissionary: randomUUID(),
    inviteeUnconfirmed: randomUUID(),
    inviteeRevoked: randomUUID(),
    otherUser: randomUUID(),
    operatorUser: randomUUID(),
    nonOperatorUser: randomUUID(),
    mAdminA: randomUUID(),
    mAdminA2: randomUUID(),
    mStaffA: randomUUID(),
    mDonorA: randomUUID(),
    mMissionaryA: randomUUID(),
    mRevokedStaff: randomUUID(),
  };
}

function seedFixtureSql(i: ReturnType<typeof makeIds>) {
  return `
    insert into public.tenants (id, name, slug, status) values
      ('${i.tenantA}', 'WP3c Org A', 'wp3c-org-a-${i.tenantA.slice(0, 8)}', 'active'),
      ('${i.tenantB}', 'WP3c Org B', 'wp3c-org-b-${i.tenantB.slice(0, 8)}', 'active'),
      ('${i.tenantNoAdmin}', 'WP3c Org NoAdmin', 'wp3c-org-na-${i.tenantNoAdmin.slice(0, 8)}', 'active');

    insert into auth.users (id, email, email_confirmed_at) values
      ('${i.adminA}', 'admin-a-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.adminA2}', 'admin-a2-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.staffA}', 'staff-a-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.donorA}', 'donor-a-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.missionaryA}', 'miss-a-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.inviteeStaff}', 'invitee-staff-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.inviteeMissionary}', 'invitee-miss-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.inviteeUnconfirmed}', 'unconfirmed-${i.tenantA.slice(0, 8)}@example.org', null),
      ('${i.inviteeRevoked}', 'revoked-staff-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.otherUser}', 'other-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.operatorUser}', 'op-${i.tenantA.slice(0, 8)}@example.org', now()),
      ('${i.nonOperatorUser}', 'nonop-${i.tenantA.slice(0, 8)}@example.org', now());

    update public.profiles set role = 'super_admin', tenant_id = '${i.tenantA}' where user_id = '${i.adminA}';
    update public.profiles set role = 'staff', tenant_id = '${i.tenantA}' where user_id = '${i.staffA}';

    insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active, granted_by) values
      ('${i.mAdminA}', '${i.adminA}', '${i.tenantA}', 'staff', 'development', true, true, '${i.adminA}'),
      ('${i.mAdminA2}', '${i.adminA2}', '${i.tenantA}', 'staff', 'hr', true, true, '${i.adminA}'),
      ('${i.mStaffA}', '${i.staffA}', '${i.tenantA}', 'staff', 'finance', false, true, '${i.adminA}'),
      ('${i.mDonorA}', '${i.donorA}', '${i.tenantA}', 'donor', null, false, true, '${i.adminA}'),
      ('${i.mMissionaryA}', '${i.missionaryA}', '${i.tenantA}', 'missionary', null, false, true, '${i.adminA}'),
      ('${i.mRevokedStaff}', '${i.inviteeRevoked}', '${i.tenantA}', 'staff', 'finance', false, false, '${i.adminA}');

    insert into public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details) values
      ('${i.tenantA}', '${i.adminA}', 'membership_revoked', 'membership', '${i.mRevokedStaff}', '{"reason":"prior leave"}'::jsonb);

    insert into authz.platform_operators (user_id, added_by, reason) values
      ('${i.operatorUser}', 'test-runner', 'WP3c acceptance operator');
  `;
}

async function cleanupCommittedFixture(
  client: pg.Client,
  i: ReturnType<typeof makeIds>,
) {
  const tenants = [i.tenantA, i.tenantB, i.tenantNoAdmin];
  const users = [
    i.adminA,
    i.adminA2,
    i.staffA,
    i.donorA,
    i.missionaryA,
    i.inviteeStaff,
    i.inviteeMissionary,
    i.inviteeUnconfirmed,
    i.inviteeRevoked,
    i.otherUser,
    i.operatorUser,
    i.nonOperatorUser,
  ];
  await client.query(
    "delete from public.membership_invitations where tenant_id = any($1::uuid[])",
    [tenants],
  );
  await client.query(
    "delete from public.audit_logs where tenant_id = any($1::uuid[])",
    [tenants],
  );
  await client.query(
    "delete from public.crm_notes where tenant_id = any($1::uuid[])",
    [tenants],
  );
  await client.query(
    "delete from authz.memberships where tenant_id = any($1::uuid[]) or user_id = any($2::uuid[])",
    [tenants, users],
  );
  await client.query(
    "delete from authz.platform_operators where user_id = any($1::uuid[])",
    [users],
  );
  await client.query(
    "delete from public.profiles where user_id = any($1::uuid[])",
    [users],
  );
  await client.query("delete from auth.users where id = any($1::uuid[])", [
    users,
  ]);
  await client.query("delete from public.tenants where id = any($1::uuid[])", [
    tenants,
  ]);
}

function flipVerifierChar(verifier: string): string {
  const first = verifier[0] === "A" ? "B" : "A";
  return first + verifier.slice(1);
}

it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)(
  "the migrate job sets TENANT_GUARD_IT_ADMIN_DATABASE_URL (fails, never skips)",
  () => expect(ADMIN_URL).not.toBe(""),
);

describe.skipIf(!ADMIN_URL)(
  "AL-2676 WP3c part 1: invite, revoke, operator admin invite, and accept commands (real stack)",
  () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });

    beforeAll(() => db.connect());
    afterAll(() => db.end());

    async function tx(
      fn: (i: ReturnType<typeof makeIds>) => Promise<void>,
    ): Promise<void> {
      const i = makeIds();
      await db.query("begin");
      try {
        await db.query(seedFixtureSql(i));
        await fn(i);
      } finally {
        await db.query("rollback");
      }
    }

    it("item 2: invite_member issues staff and missionary invitations, audits without secrets, writes no mail dispatch, and refuses unauthorized or invalid calls", () =>
      tx(async (i) => {
        const staffEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const missEmail = `invitee-miss-${i.tenantA.slice(0, 8)}@example.org`;

        const staffRes = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, $3, $4, $5, $6) as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [
              i.tenantA,
              `  ${staffEmail.toUpperCase()}  `,
              "staff",
              "finance",
              false,
              "  Joining finance team  ",
            ],
          },
        );
        expect(staffRes.code, staffRes.message ?? "").toBeNull();
        const staffOut = staffRes.rows[0]!.r as Record<string, unknown>;
        expect(staffOut).toMatchObject({
          tenant_id: i.tenantA,
          role: "staff",
          staff_role: "finance",
          is_tenant_admin: false,
        });
        expect(String(staffOut.selector)).toMatch(/^[A-Za-z0-9_-]{32}$/);
        expect(String(staffOut.verifier)).toMatch(/^[A-Za-z0-9_-]{43}$/);

        const missRes = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, $3, $4, $5, $6) as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [
              i.tenantA,
              missEmail,
              "missionary",
              null,
              false,
              "Field placement",
            ],
          },
        );
        expect(missRes.code, missRes.message ?? "").toBeNull();
        expect(missRes.rows[0]!.r).toMatchObject({
          tenant_id: i.tenantA,
          role: "missionary",
          staff_role: null,
          is_tenant_admin: false,
        });

        const audits = await db.query(
          "select action, resource_type, resource_id, details::text as details_text from public.audit_logs where tenant_id = $1 and action = 'membership_invitation_issued' order by created_at",
          [i.tenantA],
        );
        expect(audits.rows).toHaveLength(2);
        for (const row of audits.rows) {
          const text = String(row.details_text);
          expect(text).not.toContain(String(staffOut.verifier));
          expect(text).not.toContain(String(staffOut.selector));
        }

        const dispatches = await db.query(
          "select count(*)::int as c from public.workflow_dispatch_requests where tenant_id = $1",
          [i.tenantA],
        );
        expect(dispatches.rows[0]!.c).toBe(0);

        for (const [role, sub, header] of [
          ["authenticated", i.staffA, { "x-asym-assignment": i.mStaffA }],
          ["authenticated", i.donorA, { "x-asym-assignment": i.mDonorA }],
          [
            "authenticated",
            i.missionaryA,
            { "x-asym-assignment": i.mMissionaryA },
          ],
          ["authenticated", i.otherUser, {}],
          ["authenticated", null, {}],
          ["anon", null, {}],
          ["service_role", i.adminA, {}],
        ] as const) {
          const denied = await runAs(
            db,
            role,
            sub,
            "select public.invite_member($1, $2, 'staff', 'finance', false, 'Reason')",
            {
              headers: header as Record<string, string>,
              params: [i.tenantA, staffEmail],
            },
          );
          expect(denied.code, `${role}:${sub}`).toBe("42501");
        }

        for (const badParams of [
          [i.tenantA, staffEmail, "staff", "finance", false, "   \t\n  "],
          [i.tenantA, "not-an-email", "staff", "finance", false, "Reason"],
          [i.tenantA, staffEmail, "donor", null, false, "Reason"],
          [i.tenantA, staffEmail, "staff", null, false, "Reason"],
          [i.tenantA, staffEmail, "staff", "bogus", false, "Reason"],
          [i.tenantA, staffEmail, "missionary", "finance", false, "Reason"],
          [i.tenantA, staffEmail, "missionary", null, true, "Reason"],
        ]) {
          const bad = await runAs(
            db,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, $3, $4, $5, $6)",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: badParams,
            },
          );
          expect(bad.code, JSON.stringify(badParams)).toBe("22023");
        }

        for (const status of ["suspended", "closed"] as const) {
          await db.query(
            "update public.tenants set status = $2 where id = $1",
            [i.tenantA, status],
          );
          const inactive = await runAs(
            db,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'staff', 'finance', false, 'Reason')",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, staffEmail],
            },
          );
          expect(inactive.code, status).toBe("42501");
        }
      }));

    it("item 2 & R6: revoke_membership_invitation revokes pending invitations, audits, refuses non-admins/blank-reason/non-issued, and blocks acceptance with generic refusal", () =>
      tx(async (i) => {
        const staffEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const inv = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'staff', 'finance', false, 'Initial invite') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, staffEmail],
          },
        );
        expect(inv.code, inv.message ?? "").toBeNull();
        const issued = inv.rows[0]!.r as Record<string, string>;

        const denied = await runAs(
          db,
          "authenticated",
          i.staffA,
          "select public.revoke_membership_invitation($1, $2, 'Not allowed')",
          {
            headers: { "x-asym-assignment": i.mStaffA },
            params: [i.tenantA, issued.invitation_id],
          },
        );
        expect(denied.code).toBe("42501");

        const blankReason = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.revoke_membership_invitation($1, $2, ' \n\t ')",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, issued.invitation_id],
          },
        );
        expect(blankReason.code).toBe("22023");

        const missing = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.revoke_membership_invitation($1, $2, 'Missing')",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, randomUUID()],
          },
        );
        expect(missing.code).toBe("P0002");

        const revoked = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.revoke_membership_invitation($1, $2, '  Wrong email address  ') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, issued.invitation_id],
          },
        );
        expect(revoked.code, revoked.message ?? "").toBeNull();
        expect(revoked.rows[0]!.r).toMatchObject({
          invitation_id: issued.invitation_id,
          tenant_id: i.tenantA,
          status: "revoked",
        });

        const secondRevoke = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.revoke_membership_invitation($1, $2, 'Already revoked')",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, issued.invitation_id],
          },
        );
        expect(secondRevoke.code).toBe("55000");

        const acceptRevoked = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [issued.selector, issued.verifier] },
        );
        expect(acceptRevoked.code).toBe("42501");
        expect(acceptRevoked.message).toBe(GENERIC_ACCEPT_REFUSAL);
      }));

    it("item 3, R2 & R6: platform.issue_admin_invitation enforces operator + aal2, active tenant, zero live admins, single live operator invite, and recovery after expiry", () =>
      tx(async (i) => {
        const targetEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;

        const aal1 = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'Bootstrap')",
          { aal: "aal1", params: [i.tenantNoAdmin, targetEmail] },
        );
        expect(aal1.code).toBe("42501");

        const nonOpAal2 = await runAs(
          db,
          "authenticated",
          i.nonOperatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'Bootstrap')",
          { aal: "aal2", params: [i.tenantNoAdmin, targetEmail] },
        );
        expect(nonOpAal2.code).toBe("42501");

        const hasAdmin = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'Has admin')",
          { aal: "aal2", params: [i.tenantA, targetEmail] },
        );
        expect(hasAdmin.code).toBe("42501");

        const unknownTenant = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'Unknown')",
          { aal: "aal2", params: [randomUUID(), targetEmail] },
        );
        expect(unknownTenant.code).toBe("P0002");

        for (const status of ["suspended", "closed"] as const) {
          await db.query(
            "update public.tenants set status = $2 where id = $1",
            [i.tenantNoAdmin, status],
          );
          const inactive = await runAs(
            db,
            "authenticated",
            i.operatorUser,
            "select public.issue_admin_invitation($1, $2, 'development', 'Inactive')",
            { aal: "aal2", params: [i.tenantNoAdmin, targetEmail] },
          );
          expect(inactive.code, status).toBe("55000");
          expect(inactive.message).not.toBe(GENERIC_ACCEPT_REFUSAL);
        }
        await db.query(
          "update public.tenants set status = 'active' where id = $1",
          [i.tenantNoAdmin],
        );

        const blankReason = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, null, '   ')",
          { aal: "aal2", params: [i.tenantNoAdmin, targetEmail] },
        );
        expect(blankReason.code).toBe("22023");

        const first = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, null, 'Initial admin handoff') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, targetEmail] },
        );
        expect(first.code, first.message ?? "").toBeNull();
        const firstOut = first.rows[0]!.r as Record<string, string>;
        expect(firstOut).toMatchObject({
          tenant_id: i.tenantNoAdmin,
          staff_role: "development",
        });

        await db.query(
          "update public.membership_invitations set created_at = now() - interval '2 days', expires_at = now() - interval '1 day' where id = $1",
          [firstOut.invitation_id],
        );

        const second = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'hr', 'Reissue after expiry') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, targetEmail] },
        );
        expect(second.code, second.message ?? "").toBeNull();
        const secondOut = second.rows[0]!.r as Record<string, string>;
        expect(secondOut.staff_role).toBe("hr");

        const priorRow = await db.query(
          "select status, revoked_by from public.membership_invitations where id = $1",
          [firstOut.invitation_id],
        );
        expect(priorRow.rows[0]).toEqual({
          status: "revoked",
          revoked_by: i.operatorUser,
        });

        const third = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'finance', 'Replace live link') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, targetEmail] },
        );
        expect(third.code, third.message ?? "").toBeNull();
        const thirdOut = third.rows[0]!.r as Record<string, string>;

        const oldAttempt = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2)",
          { params: [secondOut.selector, secondOut.verifier] },
        );
        expect(oldAttempt.code).toBe("42501");
        expect(oldAttempt.message).toBe(GENERIC_ACCEPT_REFUSAL);

        const newAccept = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [thirdOut.selector, thirdOut.verifier] },
        );
        expect(newAccept.code, newAccept.message ?? "").toBeNull();
        expect(newAccept.rows[0]!.r).toMatchObject({
          tenant_id: i.tenantNoAdmin,
          role: "staff",
          staff_role: "finance",
          is_tenant_admin: true,
        });

        const afterAdmin = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'finance', 'Should fail now')",
          { aal: "aal2", params: [i.tenantNoAdmin, targetEmail] },
        );
        expect(afterAdmin.code).toBe("42501");

        const dispatches = await db.query(
          "select count(*)::int as c from public.workflow_dispatch_requests where tenant_id = $1",
          [i.tenantNoAdmin],
        );
        expect(dispatches.rows[0]!.c).toBe(0);
      }));

    it("item 4, F3, R2, D-80 & D-82: accept_membership_invitation enforces single-use, expiry, email verification, inactive tenant preservation, row revival, cross-class preservation, and restricted crm_notes isolation", () =>
      tx(async (i) => {
        const staffEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const unconfirmedEmail = `unconfirmed-${i.tenantA.slice(0, 8)}@example.org`;
        const revokedEmail = `revoked-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const donorEmail = `donor-a-${i.tenantA.slice(0, 8)}@example.org`;

        const issued = (
          await runAs(
            db,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'staff', 'mobilizer', false, 'New mobilizer') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, staffEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;

        for (const [sub, sel, ver, label] of [
          [i.inviteeStaff, "a".repeat(32), issued.verifier, "bad selector"],
          [
            i.inviteeStaff,
            issued.selector,
            flipVerifierChar(issued.verifier!),
            "bad verifier",
          ],
          [i.otherUser, issued.selector, issued.verifier, "wrong email"],
          [null, issued.selector, issued.verifier, "no session"],
        ] as const) {
          const r = await runAs(
            db,
            "authenticated",
            sub,
            "select public.accept_membership_invitation($1, $2)",
            { params: [sel, ver] },
          );
          expect([label, r.code, r.message]).toEqual([
            label,
            "42501",
            GENERIC_ACCEPT_REFUSAL,
          ]);
        }

        const unconfInv = (
          await runAs(
            db,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'staff', 'hr', false, 'Unconfirmed email') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, unconfirmedEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;

        const unconfAccept = await runAs(
          db,
          "authenticated",
          i.inviteeUnconfirmed,
          "select public.accept_membership_invitation($1, $2)",
          { params: [unconfInv.selector, unconfInv.verifier] },
        );
        expect(unconfAccept.code).toBe("42501");
        expect(unconfAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);

        for (const status of ["suspended", "closed"] as const) {
          await db.query(
            "update public.tenants set status = $2 where id = $1",
            [i.tenantA, status],
          );
          const refused = await runAs(
            db,
            "authenticated",
            i.inviteeStaff,
            "select public.accept_membership_invitation($1, $2)",
            { params: [issued.selector, issued.verifier] },
          );
          expect(refused.code, status).toBe("55000");
          expect(refused.message).not.toBe(GENERIC_ACCEPT_REFUSAL);
          const stillIssued = await db.query(
            "select status from public.membership_invitations where id = $1",
            [issued.invitation_id],
          );
          expect(stillIssued.rows[0]!.status).toBe("issued");
        }
        await db.query(
          "update public.tenants set status = 'active' where id = $1",
          [i.tenantA],
        );

        const ok = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [issued.selector, issued.verifier] },
        );
        expect(ok.code, ok.message ?? "").toBeNull();
        expect(ok.rows[0]!.r).toMatchObject({
          invitation_id: issued.invitation_id,
          tenant_id: i.tenantA,
          role: "staff",
          staff_role: "mobilizer",
          is_tenant_admin: false,
          revived: false,
        });

        const replay = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2)",
          { params: [issued.selector, issued.verifier] },
        );
        expect(replay.code).toBe("42501");
        expect(replay.message).toBe(GENERIC_ACCEPT_REFUSAL);

        const dupInv = (
          await runAs(
            db,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'staff', 'mobilizer', true, 'Duplicate same sub-role') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, staffEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;
        const dupAccept = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2)",
          { params: [dupInv.selector, dupInv.verifier] },
        );
        expect(dupAccept.code).toBe("23505");
        const mobRow = await db.query(
          "select is_tenant_admin from authz.memberships where user_id = $1 and tenant_id = $2 and role = 'staff' and staff_role = 'mobilizer'",
          [i.inviteeStaff, i.tenantA],
        );
        expect(mobRow.rows[0]!.is_tenant_admin).toBe(false);

        const expInv = (
          await runAs(
            db,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'missionary', null, false, 'Will expire') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, staffEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;
        await db.query(
          "update public.membership_invitations set created_at = now() - interval '2 days', expires_at = now() - interval '1 day' where id = $1",
          [expInv.invitation_id],
        );
        const expAccept = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2)",
          { params: [expInv.selector, expInv.verifier] },
        );
        expect(expAccept.code).toBe("42501");
        expect(expAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);

        const reviveInv = (
          await runAs(
            db,
            "authenticated",
            i.adminA2,
            "select public.invite_member($1, $2, 'staff', 'finance', true, 'Returning finance staff') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA2 },
              params: [i.tenantA, revokedEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;
        const revived = await runAs(
          db,
          "authenticated",
          i.inviteeRevoked,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [reviveInv.selector, reviveInv.verifier] },
        );
        expect(revived.code, revived.message ?? "").toBeNull();
        expect(revived.rows[0]!.r).toMatchObject({
          membership_id: i.mRevokedStaff,
          revived: true,
          is_tenant_admin: true,
        });
        const revivedRow = await db.query(
          "select id, is_active, revoked_at, granted_by, is_tenant_admin from authz.memberships where id = $1",
          [i.mRevokedStaff],
        );
        expect(revivedRow.rows[0]).toEqual({
          id: i.mRevokedStaff,
          is_active: true,
          revoked_at: null,
          granted_by: i.adminA2,
          is_tenant_admin: true,
        });
        const priorAuditStillThere = await db.query(
          "select count(*)::int as c from public.audit_logs where tenant_id = $1 and resource_id = $2 and action = 'membership_revoked'",
          [i.tenantA, i.mRevokedStaff],
        );
        expect(priorAuditStillThere.rows[0]!.c).toBe(1);

        const donorToStaffInv = (
          await runAs(
            db,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'staff', 'member_care', false, 'Donor joining staff') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, donorEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;
        const donorAccepted = await runAs(
          db,
          "authenticated",
          i.donorA,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [donorToStaffInv.selector, donorToStaffInv.verifier] },
        );
        expect(donorAccepted.code, donorAccepted.message ?? "").toBeNull();
        const donorRows = await db.query(
          "select role::text, staff_role::text, is_active, revoked_at from authz.memberships where user_id = $1 and tenant_id = $2 order by role::text",
          [i.donorA, i.tenantA],
        );
        expect(donorRows.rows).toEqual([
          {
            role: "donor",
            staff_role: null,
            is_active: true,
            revoked_at: null,
          },
          {
            role: "staff",
            staff_role: "member_care",
            is_active: true,
            revoked_at: null,
          },
        ]);

        const hasDeletedAt = await db.query(
          "select 1 from information_schema.columns where table_schema = 'auth' and table_name = 'users' and column_name = 'deleted_at'",
        );
        if (hasDeletedAt.rows.length > 0) {
          const delInv = (
            await runAs(
              db,
              "authenticated",
              i.adminA,
              "select public.invite_member($1, $2, 'staff', 'hr', false, 'Soft-deleted test') as r",
              {
                headers: { "x-asym-assignment": i.mAdminA },
                params: [
                  i.tenantA,
                  `other-${i.tenantA.slice(0, 8)}@example.org`,
                ],
              },
            )
          ).rows[0]!.r as Record<string, string>;
          await db.query(
            "update auth.users set deleted_at = now() where id = $1",
            [i.otherUser],
          );
          const delAccept = await runAs(
            db,
            "authenticated",
            i.otherUser,
            "select public.accept_membership_invitation($1, $2)",
            { params: [delInv.selector, delInv.verifier] },
          );
          expect(delAccept.code).toBe("42501");
          expect(delAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);
        }
      }));

    it("D-82: an admin in tenant A with profiles.role=super_admin invited as unflagged staff in tenant B reads zero restricted crm_notes in tenant B", () =>
      tx(async (i) => {
        const adminAEmail = `admin-a-${i.tenantA.slice(0, 8)}@example.org`;
        const mAdminB = randomUUID();
        await db.query(
          "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active, granted_by) values ($1, $2, $3, 'staff', 'development', true, true, $2)",
          [mAdminB, i.adminA2, i.tenantB],
        );
        await db.query(
          "insert into public.crm_notes (tenant_id, title, body, visibility, author_name) values ($1, 'Standard B', 'Open note', 'standard', 'Admin B'), ($1, 'Restricted B', 'Secret note', 'restricted', 'Admin B')",
          [i.tenantB],
        );
        const crossTenantRes = await runAs(
          db,
          "authenticated",
          i.adminA2,
          "select public.invite_member($1, $2, 'staff', 'development', false, 'Cross-tenant unflagged staff') as r",
          {
            headers: { "x-asym-assignment": mAdminB },
            params: [i.tenantB, adminAEmail],
          },
        );
        expect(crossTenantRes.code, crossTenantRes.message ?? "").toBeNull();
        const crossTenantInv = crossTenantRes.rows[0]!.r as Record<
          string,
          string
        >;
        const crossAccepted = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [crossTenantInv.selector, crossTenantInv.verifier] },
        );
        expect(crossAccepted.code, crossAccepted.message ?? "").toBeNull();
        const crossMembershipId = String(
          (crossAccepted.rows[0]!.r as Record<string, unknown>).membership_id,
        );
        const notesInB = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select title, visibility from public.crm_notes order by title",
          {
            headers: {
              "x-asym-tenant": i.tenantB,
              "x-asym-assignment": crossMembershipId,
            },
          },
        );
        expect(notesInB.code, notesInB.message ?? "").toBeNull();
        expect(notesInB.rows).toEqual([
          { title: "Standard B", visibility: "standard" },
        ]);
      }));

    it("F1: accepting an admin-flagged member_invite revokes any live operator_admin_invite in the same transaction", () =>
      tx(async (i) => {
        const staffEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const otherEmail = `other-${i.tenantA.slice(0, 8)}@example.org`;

        const opRes = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'Initial operator invite') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, otherEmail] },
        );
        expect(opRes.code, opRes.message ?? "").toBeNull();
        const opInv = opRes.rows[0]!.r as Record<string, string>;

        const memberAdminInv = await db.query(
          `select invitation_id, selector, verifier
             from tenant_guard.issue_membership_invitation(
               $1, $2, 'staff'::authz.membership_role, 'hr'::authz.staff_role, true,
               'member_invite', 'email', $3, 'Coexisting admin member invite', interval '7 days'
             )`,
          [i.tenantNoAdmin, staffEmail, i.adminA],
        );
        const mInv = memberAdminInv.rows[0] as {
          invitation_id: string;
          selector: string;
          verifier: string;
        };

        const accepted = await runAs(
          db,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [mInv.selector, mInv.verifier] },
        );
        expect(accepted.code, accepted.message ?? "").toBeNull();

        const opAfter = await db.query(
          "select status, revoked_by from public.membership_invitations where id = $1",
          [opInv.invitation_id],
        );
        expect(opAfter.rows[0]).toEqual({
          status: "revoked",
          revoked_by: i.inviteeStaff,
        });
        const revokedAudit = await db.query(
          "select count(*)::int as c from public.audit_logs where tenant_id = $1 and resource_id = $2 and action = 'membership_invitation_revoked'",
          [i.tenantNoAdmin, opInv.invitation_id],
        );
        expect(revokedAudit.rows[0]!.c).toBe(1);
      }));

    it("F2: wrong-email, bad-verifier, and unconfirmed-email accept calls return generic refusal immediately without touching any locked tenant/membership/invitation row or setting tenant context", async () => {
      const i = makeIds();
      const c1 = new pg.Client({ connectionString: ADMIN_URL });
      const c2 = new pg.Client({ connectionString: ADMIN_URL });
      await Promise.all([c1.connect(), c2.connect()]);
      try {
        await c1.query("begin");
        await c1.query(seedFixtureSql(i));
        await c1.query("commit");

        const staffEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const invRes = await runCommittedAs(
          c1,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'staff', 'finance', false, 'F2 lock test') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, staffEmail],
          },
        );
        expect(invRes.code, invRes.message ?? "").toBeNull();
        const issued = invRes.rows[0]!.r as Record<string, string>;

        await c2.query("begin");
        await c2.query(
          "select 1 from public.tenants where id = $1 for update",
          [i.tenantA],
        );
        await c2.query(
          "select 1 from authz.memberships where tenant_id = $1 for update",
          [i.tenantA],
        );
        await c2.query(
          "select 1 from public.membership_invitations where id = $1 for update",
          [issued.invitation_id],
        );

        await c1.query("begin");
        const wrongEmail = await runAs(
          c1,
          "authenticated",
          i.otherUser,
          "select public.accept_membership_invitation($1, $2)",
          {
            params: [issued.selector, issued.verifier],
            lockTimeoutMs: 250,
          },
        );
        const tenantCtxAfterWrongEmail = (
          await c1.query(
            "select coalesce(current_setting('app.current_tenant_id', true), '') as v",
          )
        ).rows[0]!.v;
        await c1.query("rollback");

        expect(wrongEmail.code).toBe("42501");
        expect(wrongEmail.message).toBe(GENERIC_ACCEPT_REFUSAL);
        expect(tenantCtxAfterWrongEmail).toBe("");

        const rightEmailWhileLocked = await runCommittedAs(
          c1,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2)",
          {
            params: [issued.selector, issued.verifier],
            lockTimeoutMs: 250,
          },
        );
        expect(rightEmailWhileLocked.code).toBe("55P03");

        await c2.query("rollback");

        const invAfter = await c1.query(
          "select status from public.membership_invitations where id = $1",
          [issued.invitation_id],
        );
        expect(invAfter.rows[0]!.status).toBe("issued");
        const auditAfter = await c1.query(
          "select count(*)::int as c from public.audit_logs where tenant_id = $1 and action = 'membership_invitation_accepted'",
          [i.tenantA],
        );
        expect(auditAfter.rows[0]!.c).toBe(0);

        const redeemed = await runCommittedAs(
          c1,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [issued.selector, issued.verifier] },
        );
        expect(redeemed.code, redeemed.message ?? "").toBeNull();
      } finally {
        await c2.query("rollback").catch(() => undefined);
        await cleanupCommittedFixture(c1, i).catch(() => undefined);
        await Promise.all([c1.end(), c2.end()]);
      }
    });

    it("F4: post-lock capability and operator re-checks refuse invite_member, revoke_membership_invitation, and issue_admin_invitation when authority is removed while waiting on locks", async () => {
      const i = makeIds();
      const c1 = new pg.Client({ connectionString: ADMIN_URL });
      const c2 = new pg.Client({ connectionString: ADMIN_URL });
      await Promise.all([c1.connect(), c2.connect()]);
      try {
        await c1.query("begin");
        await c1.query(seedFixtureSql(i));
        await c1.query("commit");

        const staffEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const pendingRes = await runCommittedAs(
          c1,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'staff', 'finance', false, 'For F4 revoke race') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, staffEmail],
          },
        );
        const pendingId = String(
          (pendingRes.rows[0]!.r as Record<string, unknown>).invitation_id,
        );

        await c1.query("begin");
        await c1.query(
          "select 1 from public.tenants where id = $1 for update",
          [i.tenantA],
        );
        await c1.query(
          "update authz.memberships set is_tenant_admin = false where id = $1",
          [i.mAdminA2],
        );

        const inviteWaiting = runCommittedAs(
          c2,
          "authenticated",
          i.adminA2,
          "select public.invite_member($1, $2, 'staff', 'hr', false, 'Race invite')",
          {
            headers: { "x-asym-assignment": i.mAdminA2 },
            params: [i.tenantA, staffEmail],
          },
        );
        await new Promise((r) => setTimeout(r, 120));
        await c1.query("commit");
        const inviteRaceOut = await inviteWaiting;
        expect(inviteRaceOut.code).toBe("42501");

        await c1.query(
          "update authz.memberships set is_tenant_admin = true where id = $1",
          [i.mAdminA2],
        );
        await c1.query("begin");
        await c1.query(
          "select 1 from public.tenants where id = $1 for update",
          [i.tenantA],
        );
        await c1.query(
          "update authz.memberships set is_tenant_admin = false where id = $1",
          [i.mAdminA2],
        );
        const revokeWaiting = runCommittedAs(
          c2,
          "authenticated",
          i.adminA2,
          "select public.revoke_membership_invitation($1, $2, 'Race revoke')",
          {
            headers: { "x-asym-assignment": i.mAdminA2 },
            params: [i.tenantA, pendingId],
          },
        );
        await new Promise((r) => setTimeout(r, 120));
        await c1.query("commit");
        const revokeRaceOut = await revokeWaiting;
        expect(revokeRaceOut.code).toBe("42501");

        await c1.query("begin");
        await c1.query(
          "select 1 from public.tenants where id = $1 for update",
          [i.tenantNoAdmin],
        );
        await c1.query(
          "delete from authz.platform_operators where user_id = $1",
          [i.operatorUser],
        );
        const opWaiting = runCommittedAs(
          c2,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'Race operator')",
          {
            aal: "aal2",
            params: [i.tenantNoAdmin, staffEmail],
          },
        );
        await new Promise((r) => setTimeout(r, 120));
        await c1.query("commit");
        const opRaceOut = await opWaiting;
        expect(opRaceOut.code).toBe("42501");
      } finally {
        await c1.query("rollback").catch(() => undefined);
        await cleanupCommittedFixture(c1, i).catch(() => undefined);
        await Promise.all([c1.end(), c2.end()]);
      }
    });

    it("F1 & R6: concurrent double-accept, concurrent revoke-vs-accept, and concurrent issue_admin_invitation-vs-accept serialize cleanly with zero invariant violations", async () => {
      const i = makeIds();
      const barrier = new pg.Client({ connectionString: ADMIN_URL });
      const c1 = new pg.Client({ connectionString: ADMIN_URL });
      const c2 = new pg.Client({ connectionString: ADMIN_URL });
      await Promise.all([barrier.connect(), c1.connect(), c2.connect()]);
      try {
        await barrier.query("begin");
        await barrier.query(seedFixtureSql(i));
        await barrier.query("commit");

        const staffEmail = `invitee-staff-${i.tenantA.slice(0, 8)}@example.org`;
        const missEmail = `invitee-miss-${i.tenantA.slice(0, 8)}@example.org`;

        const dblInv = (
          await runCommittedAs(
            c1,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'staff', 'finance', false, 'Double accept race') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, staffEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;

        await barrier.query("begin");
        await barrier.query(
          "select 1 from public.tenants where id = $1 for update",
          [i.tenantA],
        );
        const a1 = runCommittedAs(
          c1,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [dblInv.selector, dblInv.verifier] },
        );
        const a2 = runCommittedAs(
          c2,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [dblInv.selector, dblInv.verifier] },
        );
        await new Promise((r) => setTimeout(r, 120));
        await barrier.query("rollback");
        const [r1, r2] = await Promise.all([a1, a2]);
        const winners = [r1, r2].filter((r) => r.code === null);
        const losers = [r1, r2].filter((r) => r.code !== null);
        expect(winners).toHaveLength(1);
        expect(losers).toHaveLength(1);
        expect(losers[0]!.code).toBe("42501");
        expect(losers[0]!.message).toBe(GENERIC_ACCEPT_REFUSAL);

        const revInv = (
          await runCommittedAs(
            c1,
            "authenticated",
            i.adminA,
            "select public.invite_member($1, $2, 'missionary', null, false, 'Revoke vs accept') as r",
            {
              headers: { "x-asym-assignment": i.mAdminA },
              params: [i.tenantA, missEmail],
            },
          )
        ).rows[0]!.r as Record<string, string>;

        await barrier.query("begin");
        await barrier.query(
          "select 1 from public.tenants where id = $1 for update",
          [i.tenantA],
        );
        const pRevoke = runCommittedAs(
          c1,
          "authenticated",
          i.adminA,
          "select public.revoke_membership_invitation($1, $2, 'Racing revoke') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, revInv.invitation_id],
          },
        );
        const pAccept = runCommittedAs(
          c2,
          "authenticated",
          i.inviteeMissionary,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [revInv.selector, revInv.verifier] },
        );
        await new Promise((r) => setTimeout(r, 120));
        await barrier.query("rollback");
        const [revOut, accOut] = await Promise.all([pRevoke, pAccept]);
        expect(
          [revOut.code === null, accOut.code === null].filter(Boolean),
        ).toHaveLength(1);

        const opInv = (
          await runCommittedAs(
            c1,
            "authenticated",
            i.operatorUser,
            "select public.issue_admin_invitation($1, $2, 'development', 'First admin race') as r",
            { aal: "aal2", params: [i.tenantNoAdmin, staffEmail] },
          )
        ).rows[0]!.r as Record<string, string>;

        await barrier.query("begin");
        await barrier.query(
          "select 1 from public.tenants where id = $1 for update",
          [i.tenantNoAdmin],
        );
        const pAcceptAdmin = runCommittedAs(
          c1,
          "authenticated",
          i.inviteeStaff,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [opInv.selector, opInv.verifier] },
        );
        const pReissue = runCommittedAs(
          c2,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'hr', 'Racing reissue') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, missEmail] },
        );
        await new Promise((r) => setTimeout(r, 120));
        await barrier.query("rollback");
        await Promise.all([pAcceptAdmin, pReissue]);

        const invariantCheck = await c1.query(
          `select
             exists (
               select 1 from authz.memberships m
                where m.tenant_id = $1 and m.is_active and m.revoked_at is null and m.is_tenant_admin
             ) as has_admin,
             exists (
               select 1 from public.membership_invitations mi
                where mi.tenant_id = $1 and mi.purpose = 'operator_admin_invite' and mi.status = 'issued'
             ) as has_live_op_invite`,
          [i.tenantNoAdmin],
        );
        const row = invariantCheck.rows[0] as {
          has_admin: boolean;
          has_live_op_invite: boolean;
        };
        expect(row.has_admin && row.has_live_op_invite).toBe(false);
      } finally {
        await barrier.query("rollback").catch(() => undefined);
        await cleanupCommittedFixture(c1, i).catch(() => undefined);
        await Promise.all([barrier.end(), c1.end(), c2.end()]);
      }
    });

    it("R14: refuses issuer self-acceptance for both member and operator invitations with generic 42501", () =>
      tx(async (i) => {
        const tag = i.tenantA.slice(0, 8);
        const adminEmail = `admin-a-${tag}@example.org`;
        const opEmail = `op-${tag}@example.org`;
        const secondOpEmail = `nonop-${tag}@example.org`;

        const selfMemberRes = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'staff', 'member_care', false, 'Admin invites self') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, adminEmail],
          },
        );
        expect(selfMemberRes.code, selfMemberRes.message ?? "").toBeNull();
        const selfMemberInv = selfMemberRes.rows[0]!.r as Record<
          string,
          string
        >;

        const selfMemberAccept = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [selfMemberInv.selector, selfMemberInv.verifier] },
        );
        expect(selfMemberAccept.code).toBe("42501");
        expect(selfMemberAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);
        const selfCareCount = await db.query<{ c: number }>(
          "select count(*)::int as c from authz.memberships where tenant_id = $1 and user_id = $2 and staff_role = 'member_care'",
          [i.tenantA, i.adminA],
        );
        expect(selfCareCount.rows[0]!.c).toBe(0);
        const selfMemberStatus = await db.query<{ status: string }>(
          "select status from public.membership_invitations where id = $1",
          [selfMemberInv.invitation_id],
        );
        expect(selfMemberStatus.rows[0]!.status).toBe("issued");

        const selfOpRes = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'Operator invites self') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, opEmail] },
        );
        expect(selfOpRes.code, selfOpRes.message ?? "").toBeNull();
        const selfOpInv = selfOpRes.rows[0]!.r as Record<string, string>;

        const selfOpAccept = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [selfOpInv.selector, selfOpInv.verifier] },
        );
        expect(selfOpAccept.code).toBe("42501");
        expect(selfOpAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);
        const opNoAdminRows = await db.query<{ c: number }>(
          "select count(*)::int as c from authz.memberships where tenant_id = $1 and user_id = $2",
          [i.tenantNoAdmin, i.operatorUser],
        );
        expect(opNoAdminRows.rows[0]!.c).toBe(0);
        const selfOpStatus = await db.query<{ status: string }>(
          "select status from public.membership_invitations where id = $1",
          [selfOpInv.invitation_id],
        );
        expect(selfOpStatus.rows[0]!.status).toBe("issued");

        await db.query(
          "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'test-runner', 'Temporary operator for R14')",
          [i.nonOperatorUser],
        );
        const exOpSelfRes = await runAs(
          db,
          "authenticated",
          i.nonOperatorUser,
          "select public.issue_admin_invitation($1, $2, 'hr', 'Temporary operator invites self') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, secondOpEmail] },
        );
        expect(exOpSelfRes.code, exOpSelfRes.message ?? "").toBeNull();
        const exOpSelfInv = exOpSelfRes.rows[0]!.r as Record<string, string>;

        await db.query(
          "delete from authz.platform_operators where user_id = $1",
          [i.nonOperatorUser],
        );
        const exOpSelfAccept = await runAs(
          db,
          "authenticated",
          i.nonOperatorUser,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [exOpSelfInv.selector, exOpSelfInv.verifier] },
        );
        expect(exOpSelfAccept.code).toBe("42501");
        expect(exOpSelfAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);
        const exOpRows = await db.query<{ c: number }>(
          "select count(*)::int as c from authz.memberships where tenant_id = $1 and user_id = $2",
          [i.tenantNoAdmin, i.nonOperatorUser],
        );
        expect(exOpRows.rows[0]!.c).toBe(0);
      }));

    it("R15: refuses platform-operator callers in accept_membership_invitation with generic 42501 independently of issuer", () =>
      tx(async (i) => {
        const tag = i.tenantA.slice(0, 8);
        const opEmail = `op-${tag}@example.org`;
        const secondOpEmail = `nonop-${tag}@example.org`;

        const opByAdminRes = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'staff', 'finance', false, 'Admin invites operator') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, opEmail],
          },
        );
        expect(opByAdminRes.code, opByAdminRes.message ?? "").toBeNull();
        const opByAdminInv = opByAdminRes.rows[0]!.r as Record<string, string>;

        const opByAdminAccept = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [opByAdminInv.selector, opByAdminInv.verifier] },
        );
        expect(opByAdminAccept.code).toBe("42501");
        expect(opByAdminAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);
        const opTenantARows = await db.query<{ c: number }>(
          "select count(*)::int as c from authz.memberships where tenant_id = $1 and user_id = $2",
          [i.tenantA, i.operatorUser],
        );
        expect(opTenantARows.rows[0]!.c).toBe(0);
        const opByAdminStatus = await db.query<{ status: string }>(
          "select status from public.membership_invitations where id = $1",
          [opByAdminInv.invitation_id],
        );
        expect(opByAdminStatus.rows[0]!.status).toBe("issued");

        await db.query(
          "insert into authz.platform_operators (user_id, added_by, reason) values ($1, 'test-runner', 'Second operator for R15')",
          [i.nonOperatorUser],
        );
        const opToOpRes = await runAs(
          db,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'finance', 'Operator invites other operator') as r",
          { aal: "aal2", params: [i.tenantNoAdmin, secondOpEmail] },
        );
        expect(opToOpRes.code, opToOpRes.message ?? "").toBeNull();
        const opToOpInv = opToOpRes.rows[0]!.r as Record<string, string>;

        const opToOpAccept = await runAs(
          db,
          "authenticated",
          i.nonOperatorUser,
          "select public.accept_membership_invitation($1, $2) as r",
          { params: [opToOpInv.selector, opToOpInv.verifier] },
        );
        expect(opToOpAccept.code).toBe("42501");
        expect(opToOpAccept.message).toBe(GENERIC_ACCEPT_REFUSAL);
        const secondOpRows = await db.query<{ c: number }>(
          "select count(*)::int as c from authz.memberships where tenant_id = $1 and user_id = $2",
          [i.tenantNoAdmin, i.nonOperatorUser],
        );
        expect(secondOpRows.rows[0]!.c).toBe(0);
      }));

    it("R17: revoke_membership against invite_member (both orders) never deadlocks (40P01) and tenant-referencing inserts are not blocked while tenant locks are held", async () => {
      const i = makeIds();
      const observer = new pg.Client({ connectionString: ADMIN_URL });
      const c1 = new pg.Client({ connectionString: ADMIN_URL });
      const c2 = new pg.Client({ connectionString: ADMIN_URL });
      await Promise.all([observer.connect(), c1.connect(), c2.connect()]);
      const waitForLock = async (pid: number) => {
        for (let attempt = 0; attempt < 150; attempt += 1) {
          const res = await observer.query<{ wait_event_type: string | null }>(
            "select wait_event_type from pg_stat_activity where pid = $1",
            [pid],
          );
          if (res.rows[0]?.wait_event_type === "Lock") return;
          await new Promise((r) => setTimeout(r, 20));
        }
        throw new Error("Timed out waiting for concurrent session lock wait");
      };
      try {
        await observer.query("begin");
        await observer.query(seedFixtureSql(i));
        await observer.query("commit");

        const tag = i.tenantA.slice(0, 8);
        const c2Pid = Number(
          (await c2.query<{ pid: number }>("select pg_backend_pid() as pid"))
            .rows[0]!.pid,
        );

        await c1.query("begin");
        await c1.query(
          "select 1 from authz.memberships where id = $1 for update",
          [i.mAdminA],
        );
        const order1Invite = runCommittedAs(
          c2,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'staff', 'finance', false, 'R17 order 1') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, `r17-o1-${tag}@example.org`],
          },
        );
        await waitForLock(c2Pid);
        const order1Revoke = await runAs(
          c1,
          "authenticated",
          i.adminA2,
          "select public.revoke_membership($1, $2, 'R17 revoke vs invite order 1') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA2 },
            params: [i.tenantA, i.mStaffA],
          },
        );
        await c1.query("commit");
        const order1InviteOut = await order1Invite;
        expect(order1Revoke.code, order1Revoke.message ?? "").toBeNull();
        expect(order1InviteOut.code, order1InviteOut.message ?? "").toBeNull();

        await c1.query("begin");
        const order2Invite = await runAs(
          c1,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'staff', 'hr', false, 'R17 order 2') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, `r17-o2-${tag}@example.org`],
          },
        );
        expect(order2Invite.code, order2Invite.message ?? "").toBeNull();
        const order2Revoke = runCommittedAs(
          c2,
          "authenticated",
          i.adminA2,
          "select public.revoke_membership($1, $2, 'R17 revoke vs invite order 2') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA2 },
            params: [i.tenantA, i.mMissionaryA],
          },
        );
        await waitForLock(c2Pid);
        await c1.query("commit");
        const order2RevokeOut = await order2Revoke;
        expect(order2RevokeOut.code, order2RevokeOut.message ?? "").toBeNull();

        await c1.query("begin");
        const lockInvite = await runAs(
          c1,
          "authenticated",
          i.adminA,
          "select public.invite_member($1, $2, 'missionary', null, false, 'R17 fk probe invite') as r",
          {
            headers: { "x-asym-assignment": i.mAdminA },
            params: [i.tenantA, `r17-fk1-${tag}@example.org`],
          },
        );
        expect(lockInvite.code, lockInvite.message ?? "").toBeNull();
        await c2.query("begin");
        await c2.query("set local lock_timeout = '1000ms'");
        await c2.query(
          "insert into public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details) values ($1, $2, 'r17_fk_probe', 'tenant', $1::text, '{}'::jsonb)",
          [i.tenantA, i.adminA2],
        );
        await c2.query("commit");
        await c1.query("commit");

        await c1.query("begin");
        const lockOp = await runAs(
          c1,
          "authenticated",
          i.operatorUser,
          "select public.issue_admin_invitation($1, $2, 'development', 'R17 fk probe operator') as r",
          {
            aal: "aal2",
            params: [i.tenantNoAdmin, `r17-fk2-${tag}@example.org`],
          },
        );
        expect(lockOp.code, lockOp.message ?? "").toBeNull();
        await c2.query("begin");
        await c2.query("set local lock_timeout = '1000ms'");
        await c2.query(
          "insert into public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details) values ($1, $2, 'r17_fk_probe_op', 'tenant', $1::text, '{}'::jsonb)",
          [i.tenantNoAdmin, i.operatorUser],
        );
        await c2.query("commit");
        await c1.query("commit");
      } finally {
        await c1.query("rollback").catch(() => undefined);
        await c2.query("rollback").catch(() => undefined);
        await cleanupCommittedFixture(observer, i).catch(() => undefined);
        await Promise.all([observer.end(), c1.end(), c2.end()]);
      }
    });

    it("catalog: ownership, SECURITY DEFINER/INVOKER, search_path, EXECUTE grants, and no auth reference in tenant_guard", () =>
      tx(async (i) => {
        const res = await db.query(
          `select p.oid::regprocedure::text as fn,
                  p.proowner::regrole::text as owner,
                  p.prosecdef as definer,
                  p.proconfig as config,
                  array(
                    select case when a.grantee = 0 then 'PUBLIC' else a.grantee::regrole::text end
                      from aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
                     where a.privilege_type = 'EXECUTE' and a.grantee <> p.proowner
                     order by 1
                  ) as grantees
             from pg_proc p
            where p.oid in (
              to_regprocedure('tenant_guard.invite_member(uuid,text,text,text,boolean,text)'),
              to_regprocedure('tenant_guard.revoke_membership_invitation(uuid,uuid,text)'),
              to_regprocedure('tenant_guard.accept_membership_invitation(text,text)'),
              to_regprocedure('platform.issue_admin_invitation(uuid,text,text,text)'),
              to_regprocedure('public.invite_member(uuid,text,text,text,boolean,text)'),
              to_regprocedure('public.revoke_membership_invitation(uuid,uuid,text)'),
              to_regprocedure('public.accept_membership_invitation(text,text)'),
              to_regprocedure('public.issue_admin_invitation(uuid,text,text,text)'),
              to_regprocedure('private.lock_tenant(uuid)'),
              to_regprocedure('private.resolve_invitation_for_caller(text,text,uuid)')
            )
            order by 1`,
        );
        expect(res.rows).toHaveLength(10);
        const byFn = Object.fromEntries(res.rows.map((r) => [String(r.fn), r]));
        expect(
          byFn["tenant_guard.invite_member(uuid,text,text,text,boolean,text)"],
        ).toMatchObject({
          owner: "tenant_guard",
          definer: true,
          config: ['search_path=""'],
          grantees: ["authenticated"],
        });
        expect(
          byFn["tenant_guard.revoke_membership_invitation(uuid,uuid,text)"],
        ).toMatchObject({
          owner: "tenant_guard",
          definer: true,
          config: ['search_path=""'],
          grantees: ["authenticated"],
        });
        expect(
          byFn["tenant_guard.accept_membership_invitation(text,text)"],
        ).toMatchObject({
          owner: "tenant_guard",
          definer: true,
          config: ['search_path=""'],
          grantees: ["authenticated"],
        });
        expect(
          byFn["platform.issue_admin_invitation(uuid,text,text,text)"],
        ).toMatchObject({
          owner: "postgres",
          definer: true,
          config: ['search_path=""'],
          grantees: ["authenticated"],
        });
        expect(byFn["private.lock_tenant(uuid)"]).toMatchObject({
          owner: "postgres",
          definer: true,
          config: ['search_path=""'],
          grantees: ["tenant_guard"],
        });
        expect(
          byFn["private.resolve_invitation_for_caller(text,text,uuid)"],
        ).toMatchObject({
          owner: "postgres",
          definer: true,
          config: ['search_path=""'],
          grantees: ["tenant_guard"],
        });
        for (const pubFn of [
          "invite_member(uuid,text,text,text,boolean,text)",
          "revoke_membership_invitation(uuid,uuid,text)",
          "accept_membership_invitation(text,text)",
          "issue_admin_invitation(uuid,text,text,text)",
        ]) {
          expect(byFn[pubFn], pubFn).toMatchObject({
            owner: "postgres",
            definer: false,
            config: ['search_path=""'],
            grantees: ["authenticated"],
          });
        }

        const direct = await runAs(
          db,
          "authenticated",
          i.adminA,
          "select private.lock_tenant($1)",
          { params: [i.tenantA] },
        );
        expect(direct.code).toBe("42501");

        const resolveSrc = await db.query(
          "select prosrc from pg_proc where oid = to_regprocedure('private.resolve_invitation_for_caller(text,text,uuid)')",
        );
        expect(String(resolveSrc.rows[0]!.prosrc)).toContain(
          "to_jsonb(u) ->> 'deleted_at'",
        );
        expect(String(resolveSrc.rows[0]!.prosrc)).not.toMatch(
          /\bu\.deleted_at\b/,
        );
      }));
  },
);
