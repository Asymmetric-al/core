import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { GET as getCrmRelationships } from "../../../../packages/api/src/admin/crm/relationships";
import { POST as postActivity } from "../../../../packages/api/src/admin/member-care/activity";
import { PATCH as patchAttention } from "../../../../packages/api/src/admin/member-care/attention";
import { GET as getDashboard } from "../../../../packages/api/src/admin/member-care/dashboard";
import { GET as getDirectory } from "../../../../packages/api/src/admin/member-care/directory";
import { GET as getDetail } from "../../../../packages/api/src/admin/member-care/directory-detail";
import { POST as postGoals } from "../../../../packages/api/src/admin/member-care/goals";
import { POST as postPrivateNotes } from "../../../../packages/api/src/admin/member-care/private-notes";
import { POST as postRequirements } from "../../../../packages/api/src/admin/member-care/requirements";
import { POST as postThread } from "../../../../packages/api/src/admin/member-care/thread";
import { GET as getMissionaries } from "../../../../packages/api/src/missionaries";
import {
  GET as getProfile,
  PATCH as patchProfile,
} from "../../../../packages/api/src/profile";
import { createRequestSessionClient } from "../../../../packages/api/src/shared/request-session-client";

const adminGuard = vi.hoisted(() => ({
  allowAdminClient: false,
  adminClientCalls: 0,
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: adminGuard.revalidateTag,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    if (!adminGuard.allowAdminClient) {
      adminGuard.adminClientCalls += 1;
      throw new Error("Member Care handler used the service key");
    }
    const client = createClient(
      process.env.MEMBER_CARE_IT_SUPABASE_URL!,
      process.env.MEMBER_CARE_IT_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    return { client, error: null };
  },
  createAdminClient: () => {
    if (!adminGuard.allowAdminClient) {
      adminGuard.adminClientCalls += 1;
      throw new Error("Member Care handler used the service key");
    }
    return createClient(
      process.env.MEMBER_CARE_IT_SUPABASE_URL!,
      process.env.MEMBER_CARE_IT_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  },
}));

const url = process.env.MEMBER_CARE_IT_SUPABASE_URL;
const tenantA = "00000000-0000-0000-0000-000000000001";
const tenantB = "00000000-0000-0000-0000-000000000002";

type SignedInActor = {
  userId: string;
  email: string;
  token: string;
  assignments: Record<string, string>;
};

describe.skipIf(!url && process.env.MEMBER_CARE_IT_REQUIRED !== "1")(
  "AL-2677 WP4b part 1: Member Care caller-token handlers, privacy, and R11 projections (PostgREST)",
  () => {
    const runTag = randomUUID().slice(0, 8);
    const createdUserIds: string[] = [];
    const createdMissionaryIds: string[] = [];
    const createdDonorIds: string[] = [];
    const createdPledgeIds: string[] = [];
    const createdActivityIds: string[] = [];
    const createdGoalIds: string[] = [];
    const createdRequirementIds: string[] = [];
    const createdNoteIds: string[] = [];

    const mA1 = randomUUID();
    const mA2 = randomUUID();
    const mANoProfile = randomUUID();
    const mB1 = randomUUID();
    const donorA1 = randomUUID();
    const pledgeA1 = randomUUID();
    const actPastoralA1 = randomUUID();
    const actThreadA1 = randomUUID();
    const actCrisisA1 = randomUUID();
    const actB1 = randomUUID();
    const goalA1 = randomUUID();
    const goalB1 = randomUUID();
    const reqA1 = randomUUID();
    const reqB1 = randomUUID();
    const noteB1 = randomUUID();

    let db: pg.Client;
    let entityA: string;
    let entityB: string;
    let anonKey: string;
    let serviceRoleKey: string;

    let careA: SignedInActor;
    let careA2: SignedInActor;
    let dualRole: SignedInActor;
    let backfillAdmin: SignedInActor;
    let superAdminProfile: SignedInActor;
    let missionaryActor: SignedInActor;
    let peerMissionaryActor: SignedInActor;

    function scopedRequest(
      path: string,
      actor: SignedInActor,
      opts: {
        tenantId?: string;
        assignmentId?: string;
        roleClass?: "staff" | "missionary" | "donor";
        method?: string;
        body?: BodyInit | null;
        contentType?: string | null;
      } = {},
    ) {
      const headers: Record<string, string> = {
        authorization: `Bearer ${actor.token}`,
        "x-asym-role-class":
          opts.roleClass ??
          (path.startsWith("/api/admin/") ? "staff" : "missionary"),
        "sec-fetch-site": "same-origin",
      };
      if (opts.tenantId) headers["x-asym-tenant"] = opts.tenantId;
      if (opts.assignmentId) headers["x-asym-assignment"] = opts.assignmentId;
      if (opts.contentType !== undefined && opts.contentType !== null) {
        headers["content-type"] = opts.contentType;
      } else if (opts.body !== undefined && opts.contentType === undefined) {
        headers["content-type"] = "application/json";
      }
      return new NextRequest(new URL(path, url), {
        method: opts.method ?? "GET",
        headers,
        body: opts.body,
      });
    }

    async function createAuthUser(
      label: string,
      opts: { firstName: string; lastName: string },
    ) {
      const email = `wp4b1-${label}-${runTag}@example.test`;
      const password = `Wp4b1-${runTag}-Pass!`;
      const res = await fetch(`${url}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            first_name: opts.firstName,
            last_name: opts.lastName,
          },
        }),
      });
      expect(res.status, await res.clone().text()).toBe(200);
      const { id } = (await res.json()) as { id: string };
      createdUserIds.push(id);
      await db.query("delete from authz.memberships where user_id = $1", [id]);
      return { userId: id, email, password };
    }

    async function signInUser(email: string, password: string) {
      const client = createClient(url!, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.session) {
        throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
      }
      return data.session.access_token;
    }

    async function scopedAuditCounts(since: string) {
      const resourceIds = [
        ...createdMissionaryIds,
        ...createdActivityIds,
        ...createdNoteIds,
        ...createdGoalIds,
        ...createdRequirementIds,
      ];
      const sentinelPattern = `%${runTag}%`;
      const [audit, crm] = await Promise.all([
        db.query<{ c: string }>(
          `select count(*)::text as c
             from public.audit_logs
            where (created_at is null or created_at >= $4::timestamptz)
              and (
                user_id = any($1::uuid[])
                or resource_id = any($2::text[])
                or details::text like $3::text
              )`,
          [createdUserIds, resourceIds, sentinelPattern, since],
        ),
        db.query<{ c: string }>(
          `select count(*)::text as c
             from public.crm_command_logs
            where created_at >= $4::timestamptz
              and (
                actor_user_id = any($1::uuid[])
                or resource_id = any($2::text[])
                or command_payload::text like $3::text
                or result_summary::text like $3::text
              )`,
          [createdUserIds, resourceIds, sentinelPattern, since],
        ),
      ]);
      return {
        audit: Number(audit.rows[0]!.c),
        crm: Number(crm.rows[0]!.c),
      };
    }

    beforeAll(async () => {
      const database = process.env.MEMBER_CARE_IT_ADMIN_DATABASE_URL;
      anonKey = process.env.MEMBER_CARE_IT_ANON_KEY ?? "";
      serviceRoleKey = process.env.MEMBER_CARE_IT_SERVICE_ROLE_KEY ?? "";
      const isLocal = (value?: string) =>
        Boolean(
          value && ["127.0.0.1", "localhost"].includes(new URL(value).hostname),
        );
      if (!isLocal(url) || !isLocal(database) || !anonKey || !serviceRoleKey) {
        throw new Error(
          "Member Care PostgREST suite requires local Supabase URL, database URL, anon key, and service role key",
        );
      }

      vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url!);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", anonKey);
      vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", anonKey);

      db = new pg.Client({ connectionString: database });
      await db.connect();

      const entities = await db.query<{ id: string; tenant_id: string }>(
        "select id, tenant_id from public.legal_entities where tenant_id = any($1::uuid[]) order by tenant_id",
        [[tenantA, tenantB]],
      );
      expect(entities.rows.map((r) => r.tenant_id)).toEqual([tenantA, tenantB]);
      [entityA, entityB] = entities.rows.map((r) => r.id) as [string, string];

      const uCareA = await createAuthUser("carea", {
        firstName: "Care",
        lastName: "Alpha",
      });
      const careAInA = randomUUID();
      const careAInB = randomUUID();
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin)
         values ($1, $3, $4, 'staff', 'member_care', false),
                ($2, $3, $5, 'staff', 'member_care', false)`,
        [careAInA, careAInB, uCareA.userId, tenantA, tenantB],
      );
      careA = {
        userId: uCareA.userId,
        email: uCareA.email,
        token: await signInUser(uCareA.email, uCareA.password),
        assignments: { A: careAInA, B: careAInB },
      };

      const uCareA2 = await createAuthUser("carea2", {
        firstName: "Care",
        lastName: "Second",
      });
      const careA2InA = randomUUID();
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin)
         values ($1, $2, $3, 'staff', 'member_care', false)`,
        [careA2InA, uCareA2.userId, tenantA],
      );
      careA2 = {
        userId: uCareA2.userId,
        email: uCareA2.email,
        token: await signInUser(uCareA2.email, uCareA2.password),
        assignments: { A: careA2InA },
      };

      const uDual = await createAuthUser("dual", {
        firstName: "Dual",
        lastName: "Role",
      });
      const dualCareId = randomUUID();
      const dualFinId = randomUUID();
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin)
         values ($1, $3, $4, 'staff', 'member_care', false),
                ($2, $3, $4, 'staff', 'finance', false)`,
        [dualCareId, dualFinId, uDual.userId, tenantA],
      );
      dualRole = {
        userId: uDual.userId,
        email: uDual.email,
        token: await signInUser(uDual.email, uDual.password),
        assignments: { care: dualCareId, finance: dualFinId },
      };

      const uBackfill = await createAuthUser("backfill-admin", {
        firstName: "Backfill",
        lastName: "Admin",
      });
      await db.query(
        "update public.profiles set role = 'admin', tenant_id = $2 where user_id = $1",
        [uBackfill.userId, tenantA],
      );
      const backfilled = await db.query<{
        id: string;
        staff_role: string;
        is_tenant_admin: boolean;
      }>(
        `with profile_class as (
           select
             p.user_id,
             t.id as tenant_id,
             case p.role
               when 'donor' then 'donor'
               when 'missionary' then 'missionary'
               else 'staff'
             end::authz.membership_role as role,
             p.role in ('admin', 'super_admin') as is_tenant_admin
           from public.profiles as p
           join auth.users as login on login.id = p.user_id
           join public.tenants as t on t.id = coalesce(
             p.tenant_id,
             case when p.role = 'super_admin' then '00000000-0000-0000-0000-000000000001'::uuid end
           )
           where p.user_id = $1
             and p.role in ('donor', 'missionary', 'staff', 'admin', 'super_admin')
             and (pg_catalog.to_jsonb(login) ->> 'deleted_at') is null
         )
         insert into authz.memberships (user_id, tenant_id, role, staff_role, is_tenant_admin)
         select
           pc.user_id,
           pc.tenant_id,
           pc.role,
           case when pc.role = 'staff' then 'development'::authz.staff_role end,
           pc.is_tenant_admin
         from profile_class as pc
         returning id, staff_role::text, is_tenant_admin`,
        [uBackfill.userId],
      );
      expect(backfilled.rows).toEqual([
        {
          id: expect.any(String),
          staff_role: "development",
          is_tenant_admin: true,
        },
      ]);
      backfillAdmin = {
        userId: uBackfill.userId,
        email: uBackfill.email,
        token: await signInUser(uBackfill.email, uBackfill.password),
        assignments: { A: backfilled.rows[0]!.id },
      };

      const uSuper = await createAuthUser("super-legacy", {
        firstName: "Legacy",
        lastName: "Super",
      });
      await db.query(
        "update public.profiles set role = 'super_admin', tenant_id = $2 where user_id = $1",
        [uSuper.userId, tenantA],
      );
      const superMembershipId = randomUUID();
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role, staff_role, is_tenant_admin)
         values ($1, $2, $3, 'staff', 'development', true)`,
        [superMembershipId, uSuper.userId, tenantA],
      );
      superAdminProfile = {
        userId: uSuper.userId,
        email: uSuper.email,
        token: await signInUser(uSuper.email, uSuper.password),
        assignments: { A: superMembershipId },
      };

      const uMis = await createAuthUser("mis-a", {
        firstName: "Mina",
        lastName: "Field",
      });
      const misAssignmentId = randomUUID();
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role)
         values ($1, $2, $3, 'missionary')`,
        [misAssignmentId, uMis.userId, tenantA],
      );
      missionaryActor = {
        userId: uMis.userId,
        email: uMis.email,
        token: await signInUser(uMis.email, uMis.password),
        assignments: { A: misAssignmentId },
      };

      const uPeer = await createAuthUser("mis-peer", {
        firstName: "Peer",
        lastName: "Worker",
      });
      const peerAssignmentId = randomUUID();
      await db.query(
        `insert into authz.memberships (id, user_id, tenant_id, role)
         values ($1, $2, $3, 'missionary')`,
        [peerAssignmentId, uPeer.userId, tenantA],
      );
      peerMissionaryActor = {
        userId: uPeer.userId,
        email: uPeer.email,
        token: await signInUser(uPeer.email, uPeer.password),
        assignments: { A: peerAssignmentId },
      };

      const uMisProfileId = (
        await db.query<{ id: string }>(
          "select id from public.profiles where user_id = $1",
          [uMis.userId],
        )
      ).rows[0]!.id;
      const uPeerProfileId = (
        await db.query<{ id: string }>(
          "select id from public.profiles where user_id = $1",
          [uPeer.userId],
        )
      ).rows[0]!.id;

      await db.query(
        `insert into public.missionaries (
           id, tenant_id, profile_id, legal_entity_id,
           location, timezone, health_status, last_check_in, manual_attention,
           region, mission_field, health_signals, birth_date, phone, bio, tagline, cover_url, social_links,
           funding_goal, current_funding, created_at
         ) values
         ($1, $5, $7, $9, 'Chiang Mai', 'Asia/Bangkok', 'at_risk', '2026-11-10T10:00:00Z', true,
          'SE Asia', 'Initial Field', '{"emotional":40,"spiritual":55,"physical":60,"financial":70}'::jsonb,
          '1991-05-10', '+6611111111', 'Own bio text', 'Serving north', 'https://example.test/cover.webp',
          '{"facebook":"https://fb.me/mina","instagram":"https://ig.me/mina","twitter":"https://x.com/mina","youtube":"https://yt.be/mina","website":"https://mina.example.test","secret_key":"never-leak"}'::jsonb,
          5000, 3200, '2039-01-03T00:00:00Z'),
         ($2, $5, $8, $9, 'Bangkok', 'Asia/Bangkok', 'crisis', '2026-11-11T10:00:00Z', true,
          'SE Asia', 'Peer Field', '{"emotional":25,"spiritual":50,"physical":45,"financial":35}'::jsonb,
          '1992-06-15', '+6622222222', 'Peer bio', 'Peer tagline', 'https://example.test/peer.webp',
          '{"facebook":"https://fb.me/peer","secret_peer":"never-leak"}'::jsonb,
          4000, 2100, '2039-01-02T00:00:00Z'),
         ($3, $5, null, $9, 'Unlinked Place', 'UTC', 'needs_attention', null, false,
          'Africa', 'No Profile Role', '{}'::jsonb, null, null, null, null, null, null,
          null, null, '2039-01-01T00:00:00Z'),
         ($4, $6, null, $10, 'Tenant B City', 'UTC', 'crisis', '2026-11-12T10:00:00Z', true,
          'Europe', 'Tenant B Field', '{"emotional":10}'::jsonb, null, null, null, null, null, null,
          null, null, '2039-01-04T00:00:00Z')`,
        [
          mA1,
          mA2,
          mANoProfile,
          mB1,
          tenantA,
          tenantB,
          uMisProfileId,
          uPeerProfileId,
          entityA,
          entityB,
        ],
      );
      createdMissionaryIds.push(mA1, mA2, mANoProfile, mB1);

      await db.query(
        `insert into public.donors (id, tenant_id, name, email)
         values ($1, $2, $3, $4)`,
        [
          donorA1,
          tenantA,
          `Care Rel Donor ${runTag}`,
          `donor-${runTag}@example.test`,
        ],
      );
      createdDonorIds.push(donorA1);

      await db.query(
        `insert into public.donor_pledges (id, tenant_id, donor_id, amount, status)
         values ($1, $2, $3, 150, 'active')`,
        [pledgeA1, tenantA, donorA1],
      );
      createdPledgeIds.push(pledgeA1);

      await db.query(
        `insert into public.member_care_activities (
           id, tenant_id, missionary_id, author_user_id, author_name_snapshot, type, title, description, occurred_at
         ) values
         ($1, $5, $7, $9, 'Care Alpha', 'check_in', 'Check-in', 'Non-sensitive check-in', '2026-11-15T10:00:00Z'),
         ($2, $5, $7, $9, 'Care Alpha', 'pastoral_note', 'Care thread update', 'Thread post not contact', '2026-11-18T10:00:00Z'),
         ($3, $5, $7, $9, 'Care Alpha', 'crisis_intervention', 'Crisis Intervention', 'Sensitive crisis debrief', '2026-11-17T10:00:00Z'),
         ($4, $6, $8, $9, 'Care Alpha', 'video_call', 'Video Call', 'Tenant B call', '2026-11-16T10:00:00Z')`,
        [
          actPastoralA1,
          actThreadA1,
          actCrisisA1,
          actB1,
          tenantA,
          tenantB,
          mA1,
          mB1,
          careA.userId,
        ],
      );
      createdActivityIds.push(actPastoralA1, actThreadA1, actCrisisA1, actB1);

      await db.query(
        `insert into public.member_care_goals (id, tenant_id, missionary_id, title, status, updated_by)
         values ($1, $3, $5, 'Goal A Seed', 'active', $7),
                ($2, $4, $6, 'Goal B Seed', 'active', $7)`,
        [goalA1, goalB1, tenantA, tenantB, mA1, mB1, careA.userId],
      );
      createdGoalIds.push(goalA1, goalB1);

      await db.query(
        `insert into public.member_care_requirements (id, tenant_id, missionary_id, activity_type, interval_days, notes, updated_by)
         values ($1, $3, $5, 'check_in', 30, 'Req A Seed', $7),
                ($2, $4, $6, 'check_in', 30, 'Req B Seed', $7)`,
        [reqA1, reqB1, tenantA, tenantB, mA1, mB1, careA.userId],
      );
      createdRequirementIds.push(reqA1, reqB1);

      await db.query(
        `insert into public.member_care_private_notes (id, tenant_id, missionary_id, author_user_id, author_name_snapshot, content)
         values ($1, $2, $3, $4, 'Care Alpha', 'Tenant B private note')`,
        [noteB1, tenantB, mB1, careA.userId],
      );
      createdNoteIds.push(noteB1);
    });

    afterAll(async () => {
      vi.unstubAllEnvs();
      if (db) {
        try {
          await db.query(
            "update public.tenants set status = 'active' where id = any($1::uuid[])",
            [[tenantA, tenantB]],
          );
          await db.query(
            "delete from public.member_care_private_notes where missionary_id = any($1::uuid[]) or id = any($2::uuid[])",
            [createdMissionaryIds, createdNoteIds],
          );
          await db.query(
            "delete from public.member_care_activities where missionary_id = any($1::uuid[]) or id = any($2::uuid[])",
            [createdMissionaryIds, createdActivityIds],
          );
          await db.query(
            "delete from public.member_care_goals where missionary_id = any($1::uuid[]) or id = any($2::uuid[])",
            [createdMissionaryIds, createdGoalIds],
          );
          await db.query(
            "delete from public.member_care_requirements where missionary_id = any($1::uuid[]) or id = any($2::uuid[])",
            [createdMissionaryIds, createdRequirementIds],
          );
          await db.query(
            "delete from public.donor_pledges where id = any($1::uuid[])",
            [createdPledgeIds],
          );
          await db.query(
            "delete from public.donors where id = any($1::uuid[])",
            [createdDonorIds],
          );
          await db.query(
            "delete from public.missionaries where id = any($1::uuid[])",
            [createdMissionaryIds],
          );
          await db.query(
            "delete from authz.memberships where user_id = any($1::uuid[])",
            [createdUserIds],
          );
        } finally {
          await db.end();
        }
      }
      for (const userId of createdUserIds) {
        await fetch(`${url}/auth/v1/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }).catch(() => undefined);
      }
    });

    it("serves all 9 Member Care handlers on caller token with zero service-key use, zero cache directive, exact item-6 contracts, and zero audit or log leaks", async () => {
      const readsSource = readFileSync(
        "packages/api/src/reads/member-care.ts",
        "utf8",
      );
      expect(readsSource).not.toContain('"use cache"');
      expect(readsSource).not.toContain("'use cache'");

      adminGuard.allowAdminClient = false;
      adminGuard.adminClientCalls = 0;
      adminGuard.revalidateTag.mockClear();

      const dashRes = await getDashboard(
        scopedRequest("/api/admin/member-care/dashboard", careA, {
          tenantId: tenantA,
          assignmentId: careA.assignments.A,
        }),
      );
      expect(dashRes.status).toBe(200);
      const dash = (await dashRes.json()) as {
        personnelTotal: number;
        personnel: Array<{ id: string; nameMissing: boolean; name: string }>;
        lastContacts: Record<string, Record<string, string>>;
      };
      const idsInDash = dash.personnel.map((p) => p.id);
      expect(idsInDash).toContain(mA1);
      expect(idsInDash).toContain(mA2);
      expect(idsInDash).toContain(mANoProfile);
      expect(idsInDash).not.toContain(mB1);
      expect(idsInDash.indexOf(mA1)).toBeLessThan(idsInDash.indexOf(mA2));
      expect(idsInDash.indexOf(mA2)).toBeLessThan(
        idsInDash.indexOf(mANoProfile),
      );
      expect(dash.personnel.find((p) => p.id === mANoProfile)).toMatchObject({
        nameMissing: true,
        name: "Name not set",
      });
      expect(dash.lastContacts[mA1]).toMatchObject({
        "Check-in": expect.stringContaining("2026-11-15"),
      });
      expect(dash.lastContacts[mA1]).not.toHaveProperty("Pastoral Note");
      expect(dash.lastContacts[mANoProfile]).toEqual({});

      const dirRes = await getDirectory(
        scopedRequest("/api/admin/member-care/directory", careA, {
          tenantId: tenantA,
          assignmentId: careA.assignments.A,
        }),
      );
      expect(dirRes.status).toBe(200);
      expect(Number(dirRes.headers.get("X-Total-Count"))).toBe(
        dash.personnelTotal,
      );
      expect(dirRes.headers.get("X-Directory-Limit")).toBe("250");
      const dirList = (await dirRes.json()) as Array<{ id: string }>;
      expect(dirList.map((p) => p.id)).toContain(mANoProfile);
      expect(dirList.map((p) => p.id)).not.toContain(mB1);

      const detailOk = await getDetail(
        scopedRequest(`/api/admin/member-care/directory/${mA1}`, careA, {
          tenantId: tenantA,
          assignmentId: careA.assignments.A,
        }),
        { params: Promise.resolve({ id: mA1 }) },
      );
      expect(detailOk.status).toBe(200);
      expect(
        ((await detailOk.json()) as { personnel: { id: string } }).personnel.id,
      ).toBe(mA1);

      for (const badId of [randomUUID(), mB1]) {
        const detailMiss = await getDetail(
          scopedRequest(`/api/admin/member-care/directory/${badId}`, careA, {
            tenantId: tenantA,
            assignmentId: careA.assignments.A,
          }),
          { params: Promise.resolve({ id: badId }) },
        );
        expect(detailMiss.status).toBe(404);
      }

      const auditMarker = (
        await db.query<{ ts: string }>("select now()::text as ts")
      ).rows[0]!.ts;
      expect(await scopedAuditCounts(auditMarker)).toEqual({
        audit: 0,
        crm: 0,
      });
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      try {
        const sentinelThread = `SENTINEL_THREAD_${runTag}`;
        const sentinelNote = `SENTINEL_NOTE_${runTag}`;
        const sentinelGoal = `SENTINEL_GOAL_${runTag}`;
        const sentinelActivity = `SENTINEL_ACTIVITY_${runTag}`;
        const sentinelReq = `SENTINEL_REQ_${runTag}`;
        const allSentinels = [
          sentinelThread,
          sentinelNote,
          sentinelGoal,
          sentinelActivity,
          sentinelReq,
        ];

        const writeSpecs: Array<{
          name: string;
          path: string;
          method: "POST" | "PATCH";
          handler: (req: NextRequest) => Promise<Response>;
          okStatus: number;
          malformedStatus: number;
          missingError: string;
          validBody: (personnelId: string) => Record<string, unknown>;
          invalidBody: Record<string, unknown>;
        }> = [
          {
            name: "thread",
            path: "/api/admin/member-care/thread",
            method: "POST",
            handler: postThread,
            okStatus: 201,
            malformedStatus: 400,
            missingError: "Failed to create thread post.",
            validBody: (personnelId) => ({
              personnelId,
              content: sentinelThread,
            }),
            invalidBody: { personnelId: mA1, content: "" },
          },
          {
            name: "private-notes",
            path: "/api/admin/member-care/private-notes",
            method: "POST",
            handler: postPrivateNotes,
            okStatus: 201,
            malformedStatus: 422,
            missingError: "Internal error",
            validBody: (personnelId) => ({
              personnelId,
              content: sentinelNote,
            }),
            invalidBody: { personnelId: mA1, content: "" },
          },
          {
            name: "goals",
            path: "/api/admin/member-care/goals",
            method: "POST",
            handler: postGoals,
            okStatus: 200,
            malformedStatus: 400,
            missingError: "Failed to upsert care goal.",
            validBody: (personnelId) => ({
              personnelId,
              title: sentinelGoal,
              status: "active",
            }),
            invalidBody: { personnelId: mA1, title: "" },
          },
          {
            name: "activity",
            path: "/api/admin/member-care/activity",
            method: "POST",
            handler: postActivity,
            okStatus: 201,
            malformedStatus: 400,
            missingError: "Failed to log care activity.",
            validBody: (personnelId) => ({
              personnelId,
              type: "Check-in",
              content: sentinelActivity,
            }),
            invalidBody: { personnelId: mA1, type: "invalid", content: "x" },
          },
          {
            name: "requirements",
            path: "/api/admin/member-care/requirements",
            method: "POST",
            handler: postRequirements,
            okStatus: 200,
            malformedStatus: 400,
            missingError: "Failed to upsert care requirement.",
            validBody: (personnelId) => ({
              personnelId,
              activityType: "Video Call",
              intervalDays: 14,
              notes: sentinelReq,
            }),
            invalidBody: {
              personnelId: mA1,
              activityType: "Video Call",
              intervalDays: 0,
            },
          },
          {
            name: "attention",
            path: "/api/admin/member-care/attention",
            method: "PATCH",
            handler: patchAttention,
            okStatus: 200,
            malformedStatus: 400,
            missingError: "Failed to set manual attention flag.",
            validBody: (personnelId) => ({
              personnelId,
              manualAttention: false,
            }),
            invalidBody: { personnelId: mA1, manualAttention: "yes" },
          },
        ];

        for (const spec of writeSpecs) {
          const okRes = await spec.handler(
            scopedRequest(spec.path, careA, {
              tenantId: tenantA,
              assignmentId: careA.assignments.A,
              method: spec.method,
              body: JSON.stringify(spec.validBody(mA1)),
            }),
          );
          expect(okRes.status, `${spec.name} ok`).toBe(spec.okStatus);
          const okJson = (await okRes.json()) as { id: string };
          expect(okJson.id, `${spec.name} id`).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
          );

          const nonJsonRes = await spec.handler(
            scopedRequest(spec.path, careA, {
              tenantId: tenantA,
              assignmentId: careA.assignments.A,
              method: spec.method,
              contentType: "text/plain",
              body: "plain text body",
            }),
          );
          expect(nonJsonRes.status, `${spec.name} 415`).toBe(415);
          expect(await nonJsonRes.json()).toMatchObject({
            error: expect.any(String),
            requestId: expect.any(String),
          });

          const malformedRes = await spec.handler(
            scopedRequest(spec.path, careA, {
              tenantId: tenantA,
              assignmentId: careA.assignments.A,
              method: spec.method,
              body: "{bad-json",
            }),
          );
          expect(malformedRes.status, `${spec.name} malformed`).toBe(
            spec.malformedStatus,
          );
          expect(await malformedRes.json()).toMatchObject({
            error: expect.any(String),
            requestId: expect.any(String),
          });

          const invalidRes = await spec.handler(
            scopedRequest(spec.path, careA, {
              tenantId: tenantA,
              assignmentId: careA.assignments.A,
              method: spec.method,
              body: JSON.stringify(spec.invalidBody),
            }),
          );
          expect(invalidRes.status, `${spec.name} 422`).toBe(422);
          expect(await invalidRes.json()).toMatchObject({
            error: "Invalid request payload.",
            details: expect.any(Object),
            requestId: expect.any(String),
          });

          const missingRes = await spec.handler(
            scopedRequest(spec.path, careA, {
              tenantId: tenantA,
              assignmentId: careA.assignments.A,
              method: spec.method,
              body: JSON.stringify(spec.validBody(randomUUID())),
            }),
          );
          expect(missingRes.status, `${spec.name} missing 500`).toBe(500);
          const missingBody = await missingRes.json();
          expect(missingBody).toEqual({
            error: spec.missingError,
            requestId: expect.any(String),
          });

          const foreignRes = await spec.handler(
            scopedRequest(spec.path, careA, {
              tenantId: tenantA,
              assignmentId: careA.assignments.A,
              method: spec.method,
              body: JSON.stringify(spec.validBody(mB1)),
            }),
          );
          expect(foreignRes.status, `${spec.name} foreign 500`).toBe(500);
          expect(await foreignRes.json()).toEqual({
            error: spec.missingError,
            requestId: expect.any(String),
          });
        }

        const foreignGoalRes = await postGoals(
          scopedRequest("/api/admin/member-care/goals", careA, {
            tenantId: tenantA,
            assignmentId: careA.assignments.A,
            method: "POST",
            body: JSON.stringify({
              id: goalB1,
              personnelId: mA1,
              title: "Foreign goal",
              status: "active",
            }),
          }),
        );
        expect(foreignGoalRes.status).toBe(500);
        expect(await foreignGoalRes.json()).toEqual({
          error: "Failed to upsert care goal.",
          requestId: expect.any(String),
        });

        const foreignReqRes = await postRequirements(
          scopedRequest("/api/admin/member-care/requirements", careA, {
            tenantId: tenantA,
            assignmentId: careA.assignments.A,
            method: "POST",
            body: JSON.stringify({
              id: reqB1,
              personnelId: mA1,
              activityType: "Check-in",
              intervalDays: 10,
            }),
          }),
        );
        expect(foreignReqRes.status).toBe(500);
        expect(await foreignReqRes.json()).toEqual({
          error: "Failed to upsert care requirement.",
          requestId: expect.any(String),
        });

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        const serializedCalls = JSON.stringify(consoleErrorSpy.mock.calls);
        for (const sentinel of allSentinels) {
          expect(serializedCalls).not.toContain(sentinel);
        }
      } finally {
        consoleErrorSpy.mockRestore();
      }

      expect(await scopedAuditCounts(auditMarker)).toEqual({
        audit: 0,
        crm: 0,
      });
      expect(adminGuard.revalidateTag).toHaveBeenCalledWith(
        `member-care:${tenantA}`,
        "max",
      );
      expect(adminGuard.adminClientCalls).toBe(0);

      const tenantBAttention = (
        await db.query<{ manual_attention: boolean }>(
          "select manual_attention from public.missionaries where id = $1",
          [mB1],
        )
      ).rows[0]!.manual_attention;
      expect(tenantBAttention).toBe(true);
    });

    it("enforces cross-tenant isolation across all 9 handlers, direct tables, and RPCs", async () => {
      adminGuard.allowAdminClient = false;
      adminGuard.adminClientCalls = 0;

      const mismatchDash = await getDashboard(
        scopedRequest("/api/admin/member-care/dashboard", careA, {
          tenantId: tenantB,
          assignmentId: careA.assignments.A,
        }),
      );
      expect([401, 403]).toContain(mismatchDash.status);

      const mismatchWrite = await postThread(
        scopedRequest("/api/admin/member-care/thread", careA, {
          tenantId: tenantB,
          assignmentId: careA.assignments.A,
          method: "POST",
          body: JSON.stringify({ personnelId: mB1, content: "Cross tenant" }),
        }),
      );
      expect([401, 403]).toContain(mismatchWrite.status);

      const dashBRes = await getDashboard(
        scopedRequest("/api/admin/member-care/dashboard", careA, {
          tenantId: tenantB,
          assignmentId: careA.assignments.B,
        }),
      );
      expect(dashBRes.status).toBe(200);
      const dashB = (await dashBRes.json()) as {
        personnel: Array<{ id: string }>;
      };
      expect(dashB.personnel.map((p) => p.id)).toContain(mB1);
      expect(dashB.personnel.map((p) => p.id)).not.toContain(mA1);

      const scopedA = await createRequestSessionClient(
        scopedRequest("/", careA, {
          tenantId: tenantA,
          assignmentId: careA.assignments.A,
        }),
        { tenantId: tenantA, assignmentId: careA.assignments.A! },
      );
      for (const [table, ownId, otherId] of [
        ["member_care_activities", actPastoralA1, actB1],
        ["member_care_goals", goalA1, goalB1],
        ["member_care_requirements", reqA1, reqB1],
      ] as const) {
        const res = await scopedA
          .from(table)
          .select("id")
          .in("id", [ownId, otherId]);
        expect(res.error, table).toBeNull();
        expect(res.data, table).toEqual([{ id: ownId }]);
      }

      const unauthRpc = await scopedA.rpc("member_care_directory_rows", {
        p_tenant_id: tenantB,
        p_personnel_id: null,
        p_limit: 250,
      });
      expect(unauthRpc.error).toBeNull();
      expect(unauthRpc.data).toEqual([]);

      const noScopeClient = createClient(url!, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: `Bearer ${careA.token}` } },
      });
      const noScopeRead = await noScopeClient.rpc(
        "member_care_directory_rows",
        { p_tenant_id: tenantA, p_personnel_id: null, p_limit: 250 },
      );
      expect(noScopeRead.error).toBeNull();
      expect(noScopeRead.data).toEqual([]);
      const noScopeWrite = await noScopeClient.rpc("create_care_thread_post", {
        p_personnel_id: mA1,
        p_content: "no scope",
      });
      expect(noScopeWrite.error?.code).toBe("42501");

      expect(adminGuard.adminClientCalls).toBe(0);
    });

    it("refuses finance, backfilled development admin, legacy super_admin, and revoked care-note author with live finance JWT", async () => {
      adminGuard.allowAdminClient = false;
      adminGuard.adminClientCalls = 0;

      const noteCreateRes = await postPrivateNotes(
        scopedRequest("/api/admin/member-care/private-notes", dualRole, {
          tenantId: tenantA,
          assignmentId: dualRole.assignments.care,
          method: "POST",
          body: JSON.stringify({
            personnelId: mA1,
            content: `REVOKABLE_NOTE_${runTag}`,
          }),
        }),
      );
      expect(noteCreateRes.status).toBe(201);
      const { id: createdNoteId } = (await noteCreateRes.json()) as {
        id: string;
      };
      createdNoteIds.push(createdNoteId);

      const dualCareDetail = await getDetail(
        scopedRequest(`/api/admin/member-care/directory/${mA1}`, dualRole, {
          tenantId: tenantA,
          assignmentId: dualRole.assignments.care,
        }),
        { params: Promise.resolve({ id: mA1 }) },
      );
      expect(dualCareDetail.status).toBe(200);
      const dualNotes = (
        (await dualCareDetail.json()) as {
          privateNotes: Array<{ id: string }>;
        }
      ).privateNotes;
      expect(dualNotes.map((n) => n.id)).toContain(createdNoteId);

      const secondCareDetail = await getDetail(
        scopedRequest(`/api/admin/member-care/directory/${mA1}`, careA2, {
          tenantId: tenantA,
          assignmentId: careA2.assignments.A,
        }),
        { params: Promise.resolve({ id: mA1 }) },
      );
      expect(secondCareDetail.status).toBe(200);
      expect(
        (
          (await secondCareDetail.json()) as {
            privateNotes: Array<{ id: string }>;
          }
        ).privateNotes.map((n) => n.id),
      ).not.toContain(createdNoteId);

      const careA2Client = await createRequestSessionClient(
        scopedRequest("/", careA2, {
          tenantId: tenantA,
          assignmentId: careA2.assignments.A,
        }),
        { tenantId: tenantA, assignmentId: careA2.assignments.A! },
      );
      const careA2DirectNotes = await careA2Client
        .from("member_care_private_notes")
        .select("id")
        .eq("id", createdNoteId);
      expect(careA2DirectNotes.error).toBeNull();
      expect(careA2DirectNotes.data).toEqual([]);

      const deniedCallers: Array<{
        label: string;
        actor: SignedInActor;
        assignmentId: string;
      }> = [
        {
          label: "dualRole-finance",
          actor: dualRole,
          assignmentId: dualRole.assignments.finance!,
        },
        {
          label: "backfill-dev-admin",
          actor: backfillAdmin,
          assignmentId: backfillAdmin.assignments.A!,
        },
        {
          label: "legacy-super-admin",
          actor: superAdminProfile,
          assignmentId: superAdminProfile.assignments.A!,
        },
      ];

      for (const caller of deniedCallers) {
        const dashRes = await getDashboard(
          scopedRequest("/api/admin/member-care/dashboard", caller.actor, {
            tenantId: tenantA,
            assignmentId: caller.assignmentId,
          }),
        );
        expect(dashRes.status, `${caller.label} dash`).toBe(403);

        const dirRes = await getDirectory(
          scopedRequest("/api/admin/member-care/directory", caller.actor, {
            tenantId: tenantA,
            assignmentId: caller.assignmentId,
          }),
        );
        expect(dirRes.status, `${caller.label} dir`).toBe(403);

        const detailRes = await getDetail(
          scopedRequest(
            `/api/admin/member-care/directory/${mA1}`,
            caller.actor,
            {
              tenantId: tenantA,
              assignmentId: caller.assignmentId,
            },
          ),
          { params: Promise.resolve({ id: mA1 }) },
        );
        expect(detailRes.status, `${caller.label} detail`).toBe(403);

        const writeCalls = [
          postThread(
            scopedRequest("/api/admin/member-care/thread", caller.actor, {
              tenantId: tenantA,
              assignmentId: caller.assignmentId,
              method: "POST",
              body: JSON.stringify({ personnelId: mA1, content: "blocked" }),
            }),
          ),
          postPrivateNotes(
            scopedRequest(
              "/api/admin/member-care/private-notes",
              caller.actor,
              {
                tenantId: tenantA,
                assignmentId: caller.assignmentId,
                method: "POST",
                body: JSON.stringify({ personnelId: mA1, content: "blocked" }),
              },
            ),
          ),
          postGoals(
            scopedRequest("/api/admin/member-care/goals", caller.actor, {
              tenantId: tenantA,
              assignmentId: caller.assignmentId,
              method: "POST",
              body: JSON.stringify({
                personnelId: mA1,
                title: "blocked",
                status: "active",
              }),
            }),
          ),
          postActivity(
            scopedRequest("/api/admin/member-care/activity", caller.actor, {
              tenantId: tenantA,
              assignmentId: caller.assignmentId,
              method: "POST",
              body: JSON.stringify({
                personnelId: mA1,
                type: "Check-in",
                content: "blocked",
              }),
            }),
          ),
          postRequirements(
            scopedRequest("/api/admin/member-care/requirements", caller.actor, {
              tenantId: tenantA,
              assignmentId: caller.assignmentId,
              method: "POST",
              body: JSON.stringify({
                personnelId: mA1,
                activityType: "Check-in",
                intervalDays: 30,
              }),
            }),
          ),
          patchAttention(
            scopedRequest("/api/admin/member-care/attention", caller.actor, {
              tenantId: tenantA,
              assignmentId: caller.assignmentId,
              method: "PATCH",
              body: JSON.stringify({
                personnelId: mA1,
                manualAttention: false,
              }),
            }),
          ),
        ];
        for (const res of await Promise.all(writeCalls)) {
          expect(res.status, `${caller.label} write`).toBe(403);
        }

        const direct = await createRequestSessionClient(
          scopedRequest("/", caller.actor, {
            tenantId: tenantA,
            assignmentId: caller.assignmentId,
          }),
          { tenantId: tenantA, assignmentId: caller.assignmentId },
        );
        for (const table of [
          "member_care_activities",
          "member_care_goals",
          "member_care_requirements",
          "member_care_private_notes",
        ] as const) {
          const tableRes = await direct.from(table).select("id");
          expect(tableRes.error, `${caller.label} ${table}`).toBeNull();
          expect(tableRes.data, `${caller.label} ${table}`).toEqual([]);
        }
        const dirRpc = await direct.rpc("member_care_directory_rows", {
          p_tenant_id: tenantA,
          p_personnel_id: null,
          p_limit: 250,
        });
        expect(dirRpc.error).toBeNull();
        expect(dirRpc.data).toEqual([]);

        const careCol = await direct
          .from("missionaries")
          .select("health_status")
          .limit(1);
        expect(careCol.error?.code, `${caller.label} health_status`).toBe(
          "42501",
        );

        const rpcRefusal = await direct.rpc("create_care_thread_post", {
          p_personnel_id: mA1,
          p_content: "blocked",
        });
        expect(rpcRefusal.error?.code, `${caller.label} rpc`).toBe("42501");
      }

      await db.query(
        "update authz.memberships set is_active = false, revoked_at = now() where id = $1",
        [dualRole.assignments.care],
      );

      const afterRevokeFinanceDetail = await getDetail(
        scopedRequest(`/api/admin/member-care/directory/${mA1}`, dualRole, {
          tenantId: tenantA,
          assignmentId: dualRole.assignments.finance,
        }),
        { params: Promise.resolve({ id: mA1 }) },
      );
      expect(afterRevokeFinanceDetail.status).toBe(403);

      const afterRevokeDirectFinance = await createRequestSessionClient(
        scopedRequest("/", dualRole, {
          tenantId: tenantA,
          assignmentId: dualRole.assignments.finance,
        }),
        { tenantId: tenantA, assignmentId: dualRole.assignments.finance! },
      );
      const afterRevokeNotes = await afterRevokeDirectFinance
        .from("member_care_private_notes")
        .select("id")
        .eq("id", createdNoteId);
      expect(afterRevokeNotes.error).toBeNull();
      expect(afterRevokeNotes.data).toEqual([]);

      const afterRevokeStaleCareClient = await createRequestSessionClient(
        scopedRequest("/", dualRole, {
          tenantId: tenantA,
          assignmentId: dualRole.assignments.care,
        }),
        { tenantId: tenantA, assignmentId: dualRole.assignments.care! },
      );
      const afterRevokeStaleNotes = await afterRevokeStaleCareClient
        .from("member_care_private_notes")
        .select("id")
        .eq("id", createdNoteId);
      expect(afterRevokeStaleNotes.error).toBeNull();
      expect(afterRevokeStaleNotes.data).toEqual([]);

      expect(adminGuard.adminClientCalls).toBe(0);
    });

    it("refuses all 9 handlers, direct reads, and care RPCs when the tenant is suspended or closed", async () => {
      adminGuard.allowAdminClient = false;
      adminGuard.adminClientCalls = 0;

      for (const status of ["suspended", "closed"] as const) {
        try {
          await db.query(
            "update public.tenants set status = $2 where id = $1",
            [tenantA, status],
          );

          const handlerResponses = await Promise.all([
            getDashboard(
              scopedRequest("/api/admin/member-care/dashboard", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
              }),
            ),
            getDirectory(
              scopedRequest("/api/admin/member-care/directory", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
              }),
            ),
            getDetail(
              scopedRequest(`/api/admin/member-care/directory/${mA1}`, careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
              }),
              { params: Promise.resolve({ id: mA1 }) },
            ),
            postThread(
              scopedRequest("/api/admin/member-care/thread", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
                method: "POST",
                body: JSON.stringify({ personnelId: mA1, content: status }),
              }),
            ),
            postPrivateNotes(
              scopedRequest("/api/admin/member-care/private-notes", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
                method: "POST",
                body: JSON.stringify({ personnelId: mA1, content: status }),
              }),
            ),
            postGoals(
              scopedRequest("/api/admin/member-care/goals", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
                method: "POST",
                body: JSON.stringify({
                  personnelId: mA1,
                  title: status,
                  status: "active",
                }),
              }),
            ),
            postActivity(
              scopedRequest("/api/admin/member-care/activity", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
                method: "POST",
                body: JSON.stringify({
                  personnelId: mA1,
                  type: "Check-in",
                  content: status,
                }),
              }),
            ),
            postRequirements(
              scopedRequest("/api/admin/member-care/requirements", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
                method: "POST",
                body: JSON.stringify({
                  personnelId: mA1,
                  activityType: "Check-in",
                  intervalDays: 30,
                }),
              }),
            ),
            patchAttention(
              scopedRequest("/api/admin/member-care/attention", careA, {
                tenantId: tenantA,
                assignmentId: careA.assignments.A,
                method: "PATCH",
                body: JSON.stringify({
                  personnelId: mA1,
                  manualAttention: true,
                }),
              }),
            ),
          ]);

          for (const res of handlerResponses) {
            expect([401, 403], `${status} handler`).toContain(res.status);
          }

          const direct = await createRequestSessionClient(
            scopedRequest("/", careA, {
              tenantId: tenantA,
              assignmentId: careA.assignments.A,
            }),
            { tenantId: tenantA, assignmentId: careA.assignments.A! },
          );
          for (const table of [
            "member_care_activities",
            "member_care_goals",
            "member_care_requirements",
            "member_care_private_notes",
          ] as const) {
            const res = await direct.from(table).select("id");
            expect(res.error, `${status} ${table}`).toBeNull();
            expect(res.data, `${status} ${table}`).toEqual([]);
          }
          const dirRpc = await direct.rpc("member_care_directory_rows", {
            p_tenant_id: tenantA,
            p_personnel_id: null,
            p_limit: 250,
          });
          expect(dirRpc.error).toBeNull();
          expect(dirRpc.data).toEqual([]);

          const writeRpcs = [
            direct.rpc("create_care_thread_post", {
              p_personnel_id: mA1,
              p_content: status,
            }),
            direct.rpc("create_care_private_note", {
              p_personnel_id: mA1,
              p_content: status,
            }),
            direct.rpc("upsert_care_goal", {
              p_personnel_id: mA1,
              p_title: status,
              p_status: "active",
            }),
            direct.rpc("log_care_activity", {
              p_personnel_id: mA1,
              p_type: "check_in",
              p_content: status,
            }),
            direct.rpc("upsert_care_requirement", {
              p_personnel_id: mA1,
              p_activity_type: "check_in",
              p_interval_days: 30,
            }),
            direct.rpc("set_manual_attention_flag", {
              p_personnel_id: mA1,
              p_manual_attention: true,
            }),
          ];
          for (const res of await Promise.all(writeRpcs)) {
            expect(res.error?.code, `${status} rpc`).toBe("42501");
          }
        } finally {
          await db.query(
            "update public.tenants set status = 'active' where id = $1",
            [tenantA],
          );
        }
      }

      expect(adminGuard.adminClientCalls).toBe(0);
    });

    it("hides care activities and care-derived counts from non-care staff in GET /api/admin/crm/relationships while preserving member_care filtering (W4b-R3)", async () => {
      adminGuard.allowAdminClient = false;
      adminGuard.adminClientCalls = 0;

      const nonCareRes = await getCrmRelationships(
        scopedRequest("/api/admin/crm/relationships", backfillAdmin, {
          tenantId: tenantA,
          assignmentId: backfillAdmin.assignments.A,
        }),
      );
      expect(nonCareRes.status).toBe(200);
      const nonCare = (await nonCareRes.json()) as {
        report: {
          excludedCareActivityCount: number;
          recentActivityCount: number;
          domainCounts: { activity: number; pledges: number };
        };
        rows: Array<{
          domain: string;
        }>;
      };
      expect(nonCare.report.excludedCareActivityCount).toBe(0);
      expect(nonCare.report.recentActivityCount).toBe(0);
      expect(nonCare.report.domainCounts.activity).toBe(0);
      expect(nonCare.report.domainCounts.pledges).toBeGreaterThanOrEqual(1);
      expect(nonCare.rows.some((row) => row.domain === "activity")).toBe(false);

      const careRes = await getCrmRelationships(
        scopedRequest("/api/admin/crm/relationships", careA, {
          tenantId: tenantA,
          assignmentId: careA.assignments.A,
        }),
      );
      expect(careRes.status).toBe(200);
      const careBody = (await careRes.json()) as {
        report: {
          excludedCareActivityCount: number;
          recentActivityCount: number;
          domainCounts: { activity: number };
        };
      };
      expect(careBody.report.excludedCareActivityCount).toBeGreaterThanOrEqual(
        1,
      );
      expect(careBody.report.domainCounts.activity).toBeGreaterThanOrEqual(1);
      expect(adminGuard.adminClientCalls).toBe(0);
    });

    it("excludes all care fields and extra keys on GET /api/missionaries, GET /api/profile, and PATCH /api/profile through real PostgREST (W4b-R11)", async () => {
      adminGuard.allowAdminClient = true;
      try {
        const dirRes = await getMissionaries(
          scopedRequest(
            "/api/missionaries?limit=50&offset=0",
            missionaryActor,
            {
              tenantId: tenantA,
              assignmentId: missionaryActor.assignments.A,
            },
          ),
        );
        expect(dirRes.status).toBe(200);
        const dirBody = (await dirRes.json()) as {
          missionaries: Array<Record<string, unknown>>;
        };
        expect(dirBody.missionaries.length).toBeGreaterThanOrEqual(2);
        const ownEntry = dirBody.missionaries.find((m) => m.id === mA1);
        const peerEntry = dirBody.missionaries.find((m) => m.id === mA2);
        expect(ownEntry).toBeDefined();
        expect(peerEntry).toBeDefined();
        for (const entry of [ownEntry!, peerEntry!]) {
          expect(Object.keys(entry).sort()).toEqual(["id", "profile"]);
          expect(
            Object.keys(entry.profile as Record<string, unknown>).sort(),
          ).toEqual(["id"]);
        }

        const getRes = await getProfile(
          scopedRequest("/api/profile", missionaryActor, {
            tenantId: tenantA,
            assignmentId: missionaryActor.assignments.A,
          }),
        );
        expect(getRes.status).toBe(200);
        const getBody = (await getRes.json()) as {
          profile: Record<string, unknown>;
        };
        expect(Object.keys(getBody.profile).sort()).toEqual([
          "avatar_url",
          "email",
          "first_name",
          "last_name",
          "missionary",
        ]);
        const gotMis = getBody.profile.missionary as Record<string, unknown>;
        expect(Object.keys(gotMis).sort()).toEqual([
          "bio",
          "cover_url",
          "id",
          "location",
          "phone",
          "social_links",
          "tagline",
        ]);
        expect(
          Object.keys(gotMis.social_links as Record<string, unknown>).sort(),
        ).toEqual(["facebook", "instagram", "twitter", "website", "youtube"]);
        expect(gotMis.social_links).not.toHaveProperty("secret_key");

        const updatedField = `Updated Field ${runTag}`;
        const patchRes = await patchProfile(
          scopedRequest("/api/profile", missionaryActor, {
            tenantId: tenantA,
            assignmentId: missionaryActor.assignments.A,
            method: "PATCH",
            body: JSON.stringify({
              bio: `Updated Bio ${runTag}`,
              missionField: updatedField,
            }),
          }),
        );
        expect(patchRes.status).toBe(200);
        const patchBody = (await patchRes.json()) as {
          profile: Record<string, unknown>;
        };
        expect(Object.keys(patchBody.profile).sort()).toEqual([
          "avatar_url",
          "email",
          "first_name",
          "last_name",
          "missionary",
        ]);
        const patchedMis = patchBody.profile.missionary as Record<
          string,
          unknown
        >;
        expect(Object.keys(patchedMis).sort()).toEqual([
          "bio",
          "cover_url",
          "id",
          "location",
          "phone",
          "social_links",
          "tagline",
        ]);
        expect(patchedMis.bio).toBe(`Updated Bio ${runTag}`);
        expect(patchedMis).not.toHaveProperty("mission_field");
        expect(patchedMis).not.toHaveProperty("health_status");
        expect(patchedMis).not.toHaveProperty("last_check_in");
        expect(patchedMis).not.toHaveProperty("manual_attention");
        expect(patchedMis).not.toHaveProperty("health_signals");

        const storedField = (
          await db.query<{ mission_field: string }>(
            "select mission_field from public.missionaries where id = $1",
            [mA1],
          )
        ).rows[0]!.mission_field;
        expect(storedField).toBe(updatedField);

        const peerGetRes = await getProfile(
          scopedRequest("/api/profile", peerMissionaryActor, {
            tenantId: tenantA,
            assignmentId: peerMissionaryActor.assignments.A,
          }),
        );
        expect(peerGetRes.status).toBe(200);
        const peerMis = (
          (await peerGetRes.json()) as {
            profile: { missionary: Record<string, unknown> };
          }
        ).profile.missionary;
        expect(Object.keys(peerMis).sort()).toEqual([
          "bio",
          "cover_url",
          "id",
          "location",
          "phone",
          "social_links",
          "tagline",
        ]);
        expect(peerMis.social_links).not.toHaveProperty("secret_peer");
      } finally {
        adminGuard.allowAdminClient = false;
      }
    });

    it("all nine apps/admin Member Care route files are thin re-exports of @asym/api/admin/member-care/*", () => {
      const expected: Array<[string, string]> = [
        [
          "apps/admin/app/api/admin/member-care/dashboard/route.ts",
          'export { GET } from "@asym/api/admin/member-care/dashboard";',
        ],
        [
          "apps/admin/app/api/admin/member-care/directory/route.ts",
          'export { GET } from "@asym/api/admin/member-care/directory";',
        ],
        [
          "apps/admin/app/api/admin/member-care/directory/[id]/route.ts",
          'export { GET } from "@asym/api/admin/member-care/directory-detail";',
        ],
        [
          "apps/admin/app/api/admin/member-care/thread/route.ts",
          'export { POST } from "@asym/api/admin/member-care/thread";',
        ],
        [
          "apps/admin/app/api/admin/member-care/private-notes/route.ts",
          'export { POST } from "@asym/api/admin/member-care/private-notes";',
        ],
        [
          "apps/admin/app/api/admin/member-care/goals/route.ts",
          'export { POST } from "@asym/api/admin/member-care/goals";',
        ],
        [
          "apps/admin/app/api/admin/member-care/activity/route.ts",
          'export { POST } from "@asym/api/admin/member-care/activity";',
        ],
        [
          "apps/admin/app/api/admin/member-care/requirements/route.ts",
          'export { POST } from "@asym/api/admin/member-care/requirements";',
        ],
        [
          "apps/admin/app/api/admin/member-care/attention/route.ts",
          'export { PATCH } from "@asym/api/admin/member-care/attention";',
        ],
      ];

      for (const [filePath, exportLine] of expected) {
        expect(readFileSync(filePath, "utf8").trim()).toBe(exportLine);
      }
    });
  },
);
