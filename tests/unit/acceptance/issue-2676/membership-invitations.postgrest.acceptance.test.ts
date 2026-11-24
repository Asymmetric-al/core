import { randomUUID } from "node:crypto";

import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { isLoopbackDatabaseUrl } from "../../../../packages/env/src/database-url.mjs";

const url = process.env.WP3_TENANT_IT_URL;
const database = process.env.WP3_TENANT_IT_DATABASE_URL;
const anon = process.env.WP3_TENANT_IT_ANON_KEY;
const service = process.env.WP3_TENANT_IT_SERVICE_KEY;
const required = process.env.GITHUB_JOB === "local-supabase";

const GENERIC_REFUSAL = "Invitation is invalid or no longer available";

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2676 WP3c: invitations, acceptance, directory updated_at, and role-change concurrency through PostgREST",
  () => {
    const tenantId = randomUUID();
    const adminMembershipId = randomUUID();
    const staffMembershipId = randomUUID();
    const missionaryMembershipId = randomUUID();

    let db: pg.Client | undefined;
    const createdUserIds: string[] = [];

    let adminToken = "";
    let staffToken = "";
    let missionaryToken = "";
    let donorInviteeToken = "";
    let donorInviteeEmail = "";
    let donorInviteeId = "";
    let softDeletedToken = "";
    let softDeletedEmail = "";
    let softDeletedId = "";

    async function api(
      path: string,
      key: string,
      bearer: string,
      options?: {
        body?: object;
        method?: string;
        tenant?: string;
        assignment?: string;
      },
    ) {
      const headers: Record<string, string> = {
        apikey: key,
        Authorization: `Bearer ${bearer}`,
        "Content-Type": "application/json",
      };
      if (options?.tenant) headers["x-asym-tenant"] = options.tenant;
      if (options?.assignment)
        headers["x-asym-assignment"] = options.assignment;
      return fetch(`${url}/${path}`, {
        method: options?.method ?? (options?.body ? "POST" : "GET"),
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(15_000),
      });
    }

    async function createUserAndSignIn(label: string) {
      const email = `wp3c-pg-${label}-${randomUUID()}@example.test`;
      const password = `wp3c-${randomUUID()}`;
      const created = await api("auth/v1/admin/users", service!, service!, {
        body: { email, password, email_confirm: true },
      });
      expect(created.ok, `createUser ${label}: ${created.status}`).toBe(true);
      const id = String(((await created.json()) as { id: string }).id);
      createdUserIds.push(id);
      const login = await api(
        "auth/v1/token?grant_type=password",
        anon!,
        anon!,
        { body: { email, password } },
      );
      expect(login.ok, `signIn ${label}: ${login.status}`).toBe(true);
      const token = String(
        ((await login.json()) as { access_token: string }).access_token,
      );
      return { id, email, token };
    }

    beforeAll(async () => {
      if (
        !url ||
        !database ||
        !anon ||
        !service ||
        !["localhost", "127.0.0.1", "[::1]"].includes(new URL(url).hostname) ||
        !isLoopbackDatabaseUrl(database)
      ) {
        throw new Error("A disposable local Supabase stack is required");
      }

      const admin = await createUserAndSignIn("admin");
      const staff = await createUserAndSignIn("staff");
      const missionary = await createUserAndSignIn("missionary");
      const donorInvitee = await createUserAndSignIn("donor-invitee");
      const softDeleted = await createUserAndSignIn("soft-deleted");

      adminToken = admin.token;
      staffToken = staff.token;
      missionaryToken = missionary.token;
      donorInviteeToken = donorInvitee.token;
      donorInviteeEmail = donorInvitee.email;
      donorInviteeId = donorInvitee.id;
      softDeletedToken = softDeleted.token;
      softDeletedEmail = softDeleted.email;
      softDeletedId = softDeleted.id;

      db = new pg.Client({ connectionString: database });
      await db.connect();

      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants (id, name, slug, status) values ($1, 'WP3c PostgREST Fixture', $2, 'active')",
          [tenantId, `wp3c-pg-${tenantId.slice(0, 8)}`],
        );
        await db.query(
          `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin)
           values
             ($1, $2, $3, 'staff', 'development', true),
             ($4, $5, $3, 'staff', 'hr', false),
             ($6, $7, $3, 'missionary', null, false)`,
          [
            adminMembershipId,
            admin.id,
            tenantId,
            staffMembershipId,
            staff.id,
            missionaryMembershipId,
            missionary.id,
          ],
        );
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      try {
        if (db) {
          await db.query("begin");
          try {
            await db.query(
              "delete from public.membership_invitations where tenant_id = $1",
              [tenantId],
            );
            await db.query(
              "delete from authz.memberships where tenant_id = $1 or user_id = any($2::uuid[])",
              [tenantId, createdUserIds],
            );
            await db.query(
              "delete from public.audit_logs where tenant_id = $1",
              [tenantId],
            );
            await db.query("delete from public.tenants where id = $1", [
              tenantId,
            ]);
            await db.query("commit");
          } catch (error) {
            await db.query("rollback");
            throw error;
          } finally {
            await db.end();
          }
        }
      } finally {
        if (service) {
          for (const id of createdUserIds) {
            const res = await api(
              `auth/v1/admin/users/${id}`,
              service,
              service,
              { method: "DELETE" },
            );
            expect(res.ok, `cleanup user ${id}: ${res.status}`).toBe(true);
          }
        }
      }
    });

    it("invites, lists without verifier_hash, revokes, refuses non-admin staff, and refuses revoked acceptance", async () => {
      const staffDenied = await api(
        "rest/v1/rpc/invite_member",
        anon!,
        staffToken,
        {
          tenant: tenantId,
          assignment: staffMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_email: donorInviteeEmail,
            p_role: "staff",
            p_staff_role: "finance",
            p_is_tenant_admin: false,
            p_reason: "Unauthorized invite",
          },
        },
      );
      expect(staffDenied.status).toBe(403);
      expect((await staffDenied.json()).code).toBe("42501");

      const created = await api(
        "rest/v1/rpc/invite_member",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_email: donorInviteeEmail,
            p_role: "staff",
            p_staff_role: "finance",
            p_is_tenant_admin: false,
            p_reason: "Invite to be revoked",
          },
        },
      );
      expect(created.status).toBe(200);
      const invite = (await created.json()) as {
        invitation_id: string;
        selector: string;
        verifier: string;
      };
      expect(invite.selector).toBeTruthy();
      expect(invite.verifier).toBeTruthy();

      const listRes = await api(
        "rest/v1/rpc/tenant_membership_invitations",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: { p_tenant_id: tenantId },
        },
      );
      expect(listRes.status).toBe(200);
      const list = (await listRes.json()) as Array<Record<string, unknown>>;
      const listed = list.find((row) => row.id === invite.invitation_id);
      expect(listed).toBeDefined();
      expect(listed).not.toHaveProperty("verifier_hash");

      const listDenied = await api(
        "rest/v1/rpc/tenant_membership_invitations",
        anon!,
        staffToken,
        {
          tenant: tenantId,
          assignment: staffMembershipId,
          body: { p_tenant_id: tenantId },
        },
      );
      expect(listDenied.status).toBe(403);

      const revoked = await api(
        "rest/v1/rpc/revoke_membership_invitation",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_invitation_id: invite.invitation_id,
            p_reason: "Mistyped role",
          },
        },
      );
      expect(revoked.status).toBe(200);
      expect((await revoked.json()).status).toBe("revoked");

      const acceptRevoked = await api(
        "rest/v1/rpc/accept_membership_invitation",
        anon!,
        donorInviteeToken,
        {
          body: {
            p_selector: invite.selector,
            p_verifier: invite.verifier,
          },
        },
      );
      expect(acceptRevoked.status).toBe(403);
      expect(await acceptRevoked.json()).toMatchObject({
        code: "42501",
        message: GENERIC_REFUSAL,
      });
    });

    it("refuses soft-deleted GoTrue auth.users on acceptance (F3) and admits existing donor as staff keeping donor row intact (D-80)", async () => {
      const softInviteRes = await api(
        "rest/v1/rpc/invite_member",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_email: softDeletedEmail,
            p_role: "missionary",
            p_staff_role: null,
            p_is_tenant_admin: false,
            p_reason: "Soft-delete F3 proof",
          },
        },
      );
      expect(softInviteRes.status).toBe(200);
      const softInvite = (await softInviteRes.json()) as {
        invitation_id: string;
        selector: string;
        verifier: string;
      };

      await db!.query(
        "update auth.users set deleted_at = now() where id = $1",
        [softDeletedId],
      );

      const softAccept = await api(
        "rest/v1/rpc/accept_membership_invitation",
        anon!,
        softDeletedToken,
        {
          body: {
            p_selector: softInvite.selector,
            p_verifier: softInvite.verifier,
          },
        },
      );
      expect(softAccept.status).toBe(403);
      expect(await softAccept.json()).toMatchObject({
        code: "42501",
        message: GENERIC_REFUSAL,
      });

      const invRow = await db!.query<{ status: string }>(
        "select status from public.membership_invitations where id = $1",
        [softInvite.invitation_id],
      );
      expect(invRow.rows[0]?.status).toBe("issued");

      const donorBefore = await db!.query<{ id: string }>(
        "select id from authz.memberships where user_id = $1 and role = 'donor' and is_active and revoked_at is null",
        [donorInviteeId],
      );
      expect(donorBefore.rows.length).toBeGreaterThan(0);

      const staffInviteRes = await api(
        "rest/v1/rpc/invite_member",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_email: donorInviteeEmail,
            p_role: "staff",
            p_staff_role: "mobilizer",
            p_is_tenant_admin: false,
            p_reason: "D-80 donor gains staff membership",
          },
        },
      );
      expect(staffInviteRes.status).toBe(200);
      const staffInvite = (await staffInviteRes.json()) as {
        selector: string;
        verifier: string;
      };

      const accepted = await api(
        "rest/v1/rpc/accept_membership_invitation",
        anon!,
        donorInviteeToken,
        {
          body: {
            p_selector: staffInvite.selector,
            p_verifier: staffInvite.verifier,
          },
        },
      );
      expect(accepted.status).toBe(200);
      expect(await accepted.json()).toMatchObject({
        tenant_id: tenantId,
        user_id: donorInviteeId,
        role: "staff",
        staff_role: "mobilizer",
        is_tenant_admin: false,
      });

      const donorAfter = await db!.query<{ id: string }>(
        "select id from authz.memberships where user_id = $1 and role = 'donor' and is_active and revoked_at is null",
        [donorInviteeId],
      );
      expect(donorAfter.rows.map((r) => r.id)).toEqual(
        donorBefore.rows.map((r) => r.id),
      );
    });

    it("opens tenant_member_directory to live staff with updated_at, refuses non-staff, and enforces optimistic concurrency and self-demotion on change_membership_role", async () => {
      const missionaryDenied = await api(
        "rest/v1/rpc/tenant_member_directory",
        anon!,
        missionaryToken,
        {
          tenant: tenantId,
          assignment: missionaryMembershipId,
          body: { p_tenant_id: tenantId },
        },
      );
      expect(missionaryDenied.status).toBe(403);
      expect((await missionaryDenied.json()).code).toBe("42501");

      const staffDirRes = await api(
        "rest/v1/rpc/tenant_member_directory",
        anon!,
        staffToken,
        {
          tenant: tenantId,
          assignment: staffMembershipId,
          body: { p_tenant_id: tenantId },
        },
      );
      expect(staffDirRes.status).toBe(200);
      const directory = (await staffDirRes.json()) as Array<{
        membership_id: string;
        updated_at: string;
      }>;
      const staffRow = directory.find(
        (row) => row.membership_id === staffMembershipId,
      );
      const adminRow = directory.find(
        (row) => row.membership_id === adminMembershipId,
      );
      expect(staffRow?.updated_at).toBeTruthy();
      expect(adminRow?.updated_at).toBeTruthy();

      const staleAttempt = await api(
        "rest/v1/rpc/change_membership_role",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_membership_id: staffMembershipId,
            p_role: "staff",
            p_staff_role: "hr",
            p_is_tenant_admin: true,
            p_reason: "Stale timestamp must fail",
            p_expected_updated_at: "2000-01-01T00:00:00.000000Z",
          },
        },
      );
      expect(staleAttempt.status).toBe(500);
      expect((await staleAttempt.json()).code).toBe("40001");

      const promote = await api(
        "rest/v1/rpc/change_membership_role",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_membership_id: staffMembershipId,
            p_role: "staff",
            p_staff_role: "hr",
            p_is_tenant_admin: true,
            p_reason: "Promote second admin",
            p_expected_updated_at: staffRow!.updated_at,
          },
        },
      );
      expect(promote.status).toBe(200);
      const promotedBody = (await promote.json()) as {
        changed: boolean;
        is_tenant_admin: boolean;
        updated_at: string;
      };
      expect(promotedBody.changed).toBe(true);
      expect(promotedBody.is_tenant_admin).toBe(true);
      expect(promotedBody.updated_at).not.toBe(staffRow!.updated_at);

      const selfDemote = await api(
        "rest/v1/rpc/change_membership_role",
        anon!,
        adminToken,
        {
          tenant: tenantId,
          assignment: adminMembershipId,
          body: {
            p_tenant_id: tenantId,
            p_membership_id: adminMembershipId,
            p_role: "staff",
            p_staff_role: "development",
            p_is_tenant_admin: false,
            p_reason: "Step down after promoting successor",
            p_expected_updated_at: adminRow!.updated_at,
          },
        },
      );
      expect(selfDemote.status).toBe(200);
      expect(await selfDemote.json()).toMatchObject({
        changed: true,
        is_tenant_admin: false,
      });
    });
  },
);
