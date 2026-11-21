/**
 * AL-2675 (WP2a sweep; plan 12 WP2, the WP2a paragraph; audit NR-68),
 * acceptance: "a person with memberships in both fixture tenants gets each
 * tenant's members, approvers and notification recipients from that tenant
 * only, on every query you moved". A profile holds one tenant at most, so
 * every fixture profile below names tenant A (or none) in its tenant column
 * and a stale role, and the moved queries must ignore both: membership alone
 * decides who belongs to which tenant.
 *
 * The real query code runs against an in-memory service client whose
 * `tenant_member_profiles` RPC answers as the SQL function does (the
 * function itself is proved on the real stack in membership-core). The users
 * list reads the member directory on the caller's token (council round 1 on
 * WP2a, F8); the same in-memory client stands in for that token's client and
 * answers the directory as the SQL function does.
 */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fakeServiceClient } from "../../../fixtures/fake-service-client";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { FakeServiceData } from "../../../fixtures/fake-service-client";
import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

const h = vi.hoisted(() => ({ auth: vi.fn(), client: null as unknown }));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: h.client, error: null }),
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({})),
}));
// D-18: the authenticated fixture supplies a session to the directory route.
vi.mock(
  "../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<
      typeof import("../../../../packages/api/src/shared/request-session-client")
    >()),
    createRequestSessionClient: async () => h.client,
  }),
);

import { listEligibleApprovers } from "../../../../packages/api/src/admin/contribution-operations/approval-notifications";
import { getSupportTicket } from "../../../../packages/api/src/admin/support/service";
import { GET as usersGET } from "../../../../packages/api/src/admin/users";
import { listEveNotificationRecipients } from "../../../../packages/api/src/eve/notifications/store";
import { findFullProfileById } from "../../../../packages/api/src/profile/queries";
import { findProfileByUserId } from "../../../../packages/api/src/shared/queries";
import { tenantMemberProfileIds } from "../../../../packages/api/src/shared/tenant-members";

const TA = "00000000-0000-4000-8000-0000000000a1";
const TB = "00000000-0000-4000-8000-0000000000b1";

/** [key, tenant column on the profile (stale), profile role (stale)] */
const PEOPLE = [
  ["admA", TA, "admin"],
  ["admB", TB, "admin"],
  ["finA", TA, "admin"], // a stale admin profile role on an unflagged row
  ["both", TA, "staff"], // the tenant administrator of A and of B
  ["riley", TA, "donor"], // a donor of A and of B
  ["rev", TA, "staff"], // a revoked staff row in A
] as const;
const index = (k: string) => PEOPLE.findIndex(([key]) => key === k) + 1;
const profileId = (k: string) =>
  `00000000-0000-4000-8000-${String(index(k)).padStart(12, "0")}`;
const userId = (k: string) =>
  `00000000-0000-4000-9000-${String(index(k)).padStart(12, "0")}`;
const P = Object.fromEntries(PEOPLE.map(([k]) => [k, profileId(k)]));

function data(): FakeServiceData {
  const member = (
    id: string,
    k: string,
    tenant: string,
    role: "donor" | "staff",
    admin = false,
    live = true,
  ) => ({
    id,
    user_id: userId(k),
    tenant_id: tenant,
    role,
    staff_role: role === "staff" ? "development" : null,
    is_tenant_admin: admin,
    is_active: live,
  });
  return {
    tables: {
      profiles: PEOPLE.map(([k, tenant, role]) => ({
        id: profileId(k),
        user_id: userId(k),
        tenant_id: tenant,
        role,
        email: `${k}@example.test`,
        display_name: k,
        full_name: k,
        first_name: k,
        last_name: "Person",
        created_at: "2026-11-17T00:00:00Z",
      })),
      contribution_approval_notification_preferences: [],
      eve_notification_recipient_configs: [],
      support_tickets: [
        {
          tenant_id: TB,
          public_id: "SUP-B1",
          subject: "B",
          assigned_to_profile_id: P.both,
        },
        {
          tenant_id: TB,
          public_id: "SUP-B2",
          subject: "B",
          assigned_to_profile_id: P.finA,
        },
      ],
    },
    memberships: [
      member("m1", "admA", TA, "staff", true),
      member("m2", "admB", TB, "staff", true),
      member("m3", "finA", TA, "staff"),
      member("m4", "both", TA, "staff", true),
      member("m5", "both", TB, "staff", true),
      member("m6", "riley", TA, "donor"),
      member("m7", "riley", TB, "donor"),
      member("m8", "rev", TA, "staff", false, false),
    ],
  };
}

let client: ReturnType<typeof fakeServiceClient>;
beforeEach(() => {
  vi.clearAllMocks();
  client = fakeServiceClient(data());
  h.client = client;
});

const sorted = (ids: string[]) => [...ids].sort();

describe("AL-2675 sweep: each tenant's people come from that tenant's memberships", () => {
  it("approvers: the tenant administrators of each tenant, the two-tenant one in both, never a stale role", async () => {
    const approvers = async (t: string) =>
      sorted(
        (await listEligibleApprovers(client as never, t)).map(
          (a) => a.profileId,
        ),
      );
    expect(await approvers(TA)).toEqual(sorted([P.admA, P.both]));
    expect(await approvers(TB)).toEqual(sorted([P.admB, P.both]));
  });

  it("assistant notification recipients: each tenant's administrators with an email", async () => {
    const recipients = async (t: string) =>
      sorted(
        (
          await listEveNotificationRecipients({
            supabaseAdmin: client as never,
            tenantId: t,
          })
        ).map((r) => r.profileId),
      );
    expect(await recipients(TA)).toEqual(sorted([P.admA, P.both]));
    expect(await recipients(TB)).toEqual(sorted([P.admB, P.both]));
  });

  it("the member list: each tenant's live members, the two-tenant donor and administrator in both", async () => {
    const list = async (t: string, role = "") => {
      h.auth.mockResolvedValue({
        userId: userId("admA"),
        email: null,
        tenantId: t,
        role: "admin",
        memberships: membershipsForRole("admin", t),
        // D-18: exercise the same member-list boundary with the administrator's selected row in each tenant.
        assignment: {
          assignmentId:
            t === TA
              ? "00000000-0000-4000-8000-000000000001"
              : "00000000-0000-4000-8000-000000000002",
          tenantId: t,
          userId: userId("admA"),
          membershipRole: "staff",
          staffRole: "development",
          isTenantAdmin: true,
          revision: "1",
        },
        profileId: P.admA,
        isAuthenticated: true,
      } satisfies AuthContext);
      const response = await usersGET(
        new NextRequest(
          `https://admin.example.test/api/admin/users?limit=50${role}`,
          { headers: { cookie: "sb-local-auth-token=session" } },
        ),
      );
      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        users: { id: string; tenant_id: string; role: string }[];
      };
      for (const user of body.users) expect(user.tenant_id).toBe(t);
      lastUsers = body.users;
      return sorted(body.users.map((u) => u.id));
    };
    let lastUsers: Record<string, unknown>[] = [];
    expect(await list(TA)).toEqual(sorted([P.admA, P.finA, P.both, P.riley]));
    expect(await list(TB)).toEqual(sorted([P.admB, P.both, P.riley]));
    expect(await list(TB, "&role=admin")).toEqual(sorted([P.admB, P.both]));
    expect(await list(TA, "&role=staff")).toEqual([P.finA]);
    expect(await list(TB, "&role=super_admin")).toEqual([]);

    // Council round 1 on WP2a, F8: tenant B sees the two-tenant donor through
    // B's row and the directory's named columns only; nothing of the profile
    // that names tenant A (its tenant column, its stale role) comes back.
    await list(TB, "&role=donor");
    expect(lastUsers).toEqual([
      {
        id: P.riley,
        membership_id: "m7",
        display_name: "riley",
        email: "riley@example.test",
        tenant_id: TB,
        role: "donor",
        staff_role: null,
        is_tenant_admin: false,
      },
    ]);
    expect(client.calls).not.toContain("from:profiles");
  });

  it("an assignee is named in a tenant only when they belong to it", async () => {
    const named = await getSupportTicket(client as never, TB, "SUP-B1");
    expect(named?.assignedToName).toBe("both Person");
    const stranger = await getSupportTicket(client as never, TB, "SUP-B2");
    expect(stranger?.assignedToName).toBeUndefined();
  });

  // Council round 1 on WP2a, F12: the own-profile lookups read the signed-in
  // person's profile and no membership; the resolver has already admitted the
  // person in the request's tenant, which is where "in no other tenant" holds.
  it("own-profile lookups read the person's own profile, whichever tenants they belong to", async () => {
    expect(
      (await findProfileByUserId(client as never, userId("riley"))).data,
    ).toMatchObject({ id: P.riley });
    expect(
      (await findFullProfileById(client as never, P.both)).data,
    ).toMatchObject({ id: P.both });
  });

  it("history keeps revoked members only when asked", async () => {
    expect(await tenantMemberProfileIds(client, TA, [P.rev])).toEqual([]);
    expect(
      await tenantMemberProfileIds(client, TA, [P.rev], {
        includeRevoked: true,
      }),
    ).toEqual([P.rev]);
  });
});
