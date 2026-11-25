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
  "AL-2676 WP3c: invitations, acceptance, directory updated_at, and role-change concurrency through PostgREST (D-18: AL-2676, D-16 ruling on caller_assignment Q3: api() sends empty-string scope headers instead of dropping them)",
  () => {
    const tenantId = randomUUID();
    const adminMembershipId = randomUUID();
    const staffMembershipId = randomUUID();
    const missionaryMembershipId = randomUUID();

    let db: pg.Client | undefined;
    const createdUserIds: string[] = [];

    let adminToken = "";
    let adminUserId = "";
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
      if (options?.tenant !== undefined)
        headers["x-asym-tenant"] = options.tenant;
      if (options?.assignment !== undefined)
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
      adminUserId = admin.id;
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

    it("refuses invite_member for a second organization unless x-asym-tenant names that organization", async () => {
      const tenantB = randomUUID();
      const adminBMembershipId = randomUUID();
      const inviteEmail = `cmdorg-pg-${tenantB.slice(0, 8)}@example.test`;

      await db!.query("begin");
      try {
        await db!.query(
          "insert into public.tenants (id, name, slug, status) values ($1, 'WP3c PostgREST Org B', $2, 'active')",
          [tenantB, `wp3c-pg-b-${tenantB.slice(0, 8)}`],
        );
        await db!.query(
          "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ($1, $2, $3, 'staff', 'development', true, true)",
          [adminBMembershipId, adminUserId, tenantB],
        );
        await db!.query("commit");
      } catch (error) {
        await db!.query("rollback");
        throw error;
      }

      let testError: unknown;
      try {
        const body = {
          p_tenant_id: tenantB,
          p_email: inviteEmail,
          p_role: "staff",
          p_staff_role: "finance",
          p_is_tenant_admin: false,
          p_reason: "Cross-tenant scope check",
        };

        const wrongTenantNoAssignment = await api(
          "rest/v1/rpc/invite_member",
          anon!,
          adminToken,
          { tenant: tenantId, body },
        );
        expect(wrongTenantNoAssignment.status).toBe(403);
        expect(await wrongTenantNoAssignment.json()).toMatchObject({
          code: "42501",
          message:
            "tenant_guard: request tenant scope is required and must match command tenant",
        });

        const wrongTenantWithBAssignment = await api(
          "rest/v1/rpc/invite_member",
          anon!,
          adminToken,
          { tenant: tenantId, assignment: adminBMembershipId, body },
        );
        expect(wrongTenantWithBAssignment.status).toBe(403);
        expect(await wrongTenantWithBAssignment.json()).toMatchObject({
          code: "42501",
          message:
            "tenant_guard: request tenant scope is required and must match command tenant",
        });

        const noHeaders = await api(
          "rest/v1/rpc/invite_member",
          anon!,
          adminToken,
          { body },
        );
        expect(noHeaders.status).toBe(403);
        expect(await noHeaders.json()).toMatchObject({
          code: "42501",
          message:
            "tenant_guard: request tenant scope is required and must match command tenant",
        });

        const matchingTenant = await api(
          "rest/v1/rpc/invite_member",
          anon!,
          adminToken,
          { tenant: tenantB, body },
        );
        expect(matchingTenant.status).toBe(200);
        const created = (await matchingTenant.json()) as {
          invitation_id: string;
          selector: string;
          verifier: string;
        };
        expect(created.invitation_id).toBeTruthy();
        expect(created.selector).toBeTruthy();
        expect(created.verifier).toBeTruthy();
      } catch (error) {
        testError = error;
        throw error;
      } finally {
        try {
          await db!.query("begin");
          await db!.query(
            "delete from public.membership_invitations where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from authz.memberships where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from public.audit_logs where tenant_id = $1",
            [tenantB],
          );
          await db!.query("delete from public.tenants where id = $1", [
            tenantB,
          ]);
          await db!.query("commit");
        } catch (cleanupError) {
          await db!.query("rollback").catch(() => {});
          if (!testError) throw cleanupError;
        }
      }
    });

    it("refuses tenant_member_directory, tenant_membership_invitations, and the five CRM table-preference writers for a second organization unless x-asym-tenant names that organization (fetch normalizes spaces-only to empty; raw spaces-only request.headers is proved in the real-stack suite)", async () => {
      const tenantB = randomUUID();
      const adminBMembershipId = randomUUID();
      const plantedViewId = randomUUID();
      let plantedInvitationId = "";

      const profileRes = await db!.query<{ id: string }>(
        "select id from public.profiles where user_id = $1",
        [adminUserId],
      );
      expect(profileRes.rows).toHaveLength(1);
      const adminProfileId = profileRes.rows[0]!.id;

      await db!.query("begin");
      try {
        await db!.query(
          "insert into public.tenants (id, name, slug, status) values ($1, 'WP3c CallerOrg B', $2, 'active')",
          [tenantB, `wp3c-callerorg-b-${tenantB.slice(0, 8)}`],
        );
        await db!.query(
          "insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin, is_active) values ($1, $2, $3, 'staff', 'development', true, true)",
          [adminBMembershipId, adminUserId, tenantB],
        );
        const issued = await db!.query<{ invitation_id: string }>(
          `select invitation_id from tenant_guard.issue_membership_invitation(
             $1::uuid, $2::text, 'missionary'::authz.membership_role,
             null, false, 'member_invite', 'email', $3::uuid, 'CallerOrg PostgREST fixture'
           )`,
          [
            tenantB,
            `callerorg-pg-inv-${tenantB.slice(0, 8)}@example.test`,
            adminUserId,
          ],
        );
        plantedInvitationId = issued.rows[0]!.invitation_id;
        await db!.query(
          `insert into public.crm_table_named_views (
             id, tenant_id, profile_id, table_id, name, is_default,
             schema_version, pinned_action_id, settings
           ) values (
             $1, $2, $3, 'crm.giftHistory', 'Planted PostgREST View B', false,
             1, null, '{}'::jsonb
           )`,
          [plantedViewId, tenantB, adminProfileId],
        );
        await db!.query("commit");
      } catch (error) {
        await db!.query("rollback");
        throw error;
      }

      const CRM_MSG =
        "Forbidden: CRM table preferences require a CRM role in this tenant.";
      const calls: ReadonlyArray<{
        rpc: string;
        message: string;
        body: (tag: string, deleteViewId?: string) => Record<string, unknown>;
      }> = [
        {
          rpc: "tenant_member_directory",
          message:
            "Forbidden: the member directory requires a live staff membership in this tenant.",
          body: () => ({ p_tenant_id: tenantB }),
        },
        {
          rpc: "tenant_membership_invitations",
          message:
            "Forbidden: listing invitations requires people.manage_members in this tenant.",
          body: () => ({ p_tenant_id: tenantB }),
        },
        {
          rpc: "create_crm_table_named_view",
          message: CRM_MSG,
          body: (tag) => ({
            p_tenant_id: tenantB,
            p_table_id: "crm.giftHistory",
            p_name: `PgView-${tag}`,
            p_is_default: false,
            p_schema_version: 1,
            p_pinned_action_id: null,
            p_settings: {},
          }),
        },
        {
          rpc: "update_crm_table_named_view",
          message: CRM_MSG,
          body: () => ({
            p_tenant_id: tenantB,
            p_table_id: "crm.giftHistory",
            p_view_id: plantedViewId,
            p_name: "Renamed PostgREST View B",
            p_name_is_set: true,
            p_is_default: true,
            p_is_default_is_set: true,
            p_schema_version: 1,
            p_pinned_action_id: "resend_receipt",
            p_pinned_action_id_is_set: true,
            p_settings: {},
            p_settings_is_set: true,
          }),
        },
        {
          rpc: "save_crm_user_table_preference",
          message: CRM_MSG,
          body: () => ({
            p_tenant_id: tenantB,
            p_table_id: "crm.giftHistory",
            p_pinned_action_id: "resend_receipt",
            p_pinned_action_id_is_set: true,
            p_schema_version: 1,
            p_settings_patch: {},
          }),
        },
        {
          rpc: "save_crm_tenant_table_default",
          message: CRM_MSG,
          body: () => ({
            p_tenant_id: tenantB,
            p_table_id: "crm.giftHistory",
            p_pinned_action_id: "resend_receipt",
            p_pinned_action_id_is_set: true,
            p_schema_version: 1,
            p_settings_patch: {},
          }),
        },
        {
          rpc: "delete_crm_table_named_view",
          message: CRM_MSG,
          body: (_tag, deleteViewId) => ({
            p_tenant_id: tenantB,
            p_table_id: "crm.giftHistory",
            p_view_id: deleteViewId ?? plantedViewId,
            p_next_default_view_id: null,
          }),
        },
      ];

      let testError: unknown;
      try {
        const beforeView = (
          await db!.query(
            `select id, name, is_default, pinned_action_id, settings, updated_at
               from public.crm_table_named_views where id = $1`,
            [plantedViewId],
          )
        ).rows[0];

        const refusalVariants: ReadonlyArray<{
          label: string;
          tenant?: string;
          assignment?: string;
        }> = [
          {
            label: "wrong-tenant-named",
            tenant: tenantId,
            assignment: adminBMembershipId,
          },
          { label: "wrong-tenant-none", tenant: tenantId },
          { label: "no-headers" },
          { label: "blank-tenant", tenant: "" },
          { label: "spaces-normalized-empty-by-fetch", tenant: "   " },
        ];

        for (const call of calls) {
          for (const variant of refusalVariants) {
            const res = await api(
              `rest/v1/rpc/${call.rpc}`,
              anon!,
              adminToken,
              {
                tenant: variant.tenant,
                assignment: variant.assignment,
                body: call.body(`${call.rpc}-${variant.label}`),
              },
            );
            expect(res.status, `${call.rpc} ${variant.label}`).toBe(403);
            expect(
              await res.json(),
              `${call.rpc} ${variant.label}`,
            ).toMatchObject({
              code: "42501",
              message: call.message,
            });
          }

          const bad = await api(`rest/v1/rpc/${call.rpc}`, anon!, adminToken, {
            tenant: "not-a-uuid",
            body: call.body(`${call.rpc}-malformed`),
          });
          expect(bad.status, `${call.rpc} malformed`).toBe(400);
          expect(await bad.json(), `${call.rpc} malformed`).toMatchObject({
            code: "22P02",
            message: "authz: the tenant header is not a UUID",
          });
        }

        const afterRefusalsView = (
          await db!.query(
            `select id, name, is_default, pinned_action_id, settings, updated_at
               from public.crm_table_named_views where id = $1`,
            [plantedViewId],
          )
        ).rows[0];
        expect(afterRefusalsView).toEqual(beforeView);

        const afterRefusalsCounts = (
          await db!.query(
            `select
               (select count(*)::int from public.crm_table_named_views where tenant_id = $1) as named_views,
               (select count(*)::int from public.crm_table_user_preferences where tenant_id = $1) as user_prefs,
               (select count(*)::int from public.crm_table_tenant_defaults where tenant_id = $1) as tenant_defaults,
               (select count(*)::int from public.crm_table_preference_audit_events where tenant_id = $1) as pref_audit`,
            [tenantB],
          )
        ).rows[0];
        expect(afterRefusalsCounts).toEqual({
          named_views: 1,
          user_prefs: 0,
          tenant_defaults: 0,
          pref_audit: 0,
        });

        const servedTwins: ReadonlyArray<{
          label: string;
          tenant: string;
          assignment?: string;
        }> = [
          { label: "tenant-only", tenant: tenantB },
          {
            label: "matching-tenant-and-assignment",
            tenant: tenantB,
            assignment: adminBMembershipId,
          },
        ];

        for (const twin of servedTwins) {
          let createdViewId: string | undefined;
          for (const call of calls) {
            const deleteTarget =
              twin.label === "tenant-only" ? createdViewId : plantedViewId;
            const ok = await api(`rest/v1/rpc/${call.rpc}`, anon!, adminToken, {
              tenant: twin.tenant,
              assignment: twin.assignment,
              body: call.body(`${call.rpc}-${twin.label}`, deleteTarget),
            });
            expect(ok.status, `${call.rpc} ${twin.label}`).toBe(200);
            const payload = (await ok.json()) as unknown;
            if (call.rpc === "tenant_member_directory") {
              expect(
                (payload as Array<{ membership_id: string }>).map(
                  (r) => r.membership_id,
                ),
              ).toContain(adminBMembershipId);
            } else if (call.rpc === "tenant_membership_invitations") {
              expect(
                (payload as Array<{ id: string }>).map((r) => r.id),
              ).toContain(plantedInvitationId);
            } else if (call.rpc === "create_crm_table_named_view") {
              const created = payload as { id: string; tenant_id: string };
              expect(created).toMatchObject({ tenant_id: tenantB });
              expect(created.id).toBeTruthy();
              createdViewId = created.id;
            } else if (call.rpc === "delete_crm_table_named_view") {
              expect(payload).toMatchObject({ deleted: true });
            } else {
              expect(payload).toMatchObject({ tenant_id: tenantB });
            }
          }
        }
      } catch (error) {
        testError = error;
        throw error;
      } finally {
        try {
          await db!.query("begin");
          await db!.query(
            "delete from public.crm_table_preference_audit_events where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from public.crm_table_tenant_defaults where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from public.crm_table_user_preferences where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from public.crm_table_named_views where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from public.membership_invitations where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from authz.memberships where tenant_id = $1",
            [tenantB],
          );
          await db!.query(
            "delete from public.audit_logs where tenant_id = $1",
            [tenantB],
          );
          await db!.query("delete from public.tenants where id = $1", [
            tenantB,
          ]);
          await db!.query("commit");
        } catch (cleanupError) {
          await db!.query("rollback").catch(() => {});
          if (!testError) throw cleanupError;
        }
      }
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
