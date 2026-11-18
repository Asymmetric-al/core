import { describe, expect, it, vi } from "vitest";

import {
  createServiceEveSessionIdentity,
  getEveSessionIdFromRoute,
  identityFromEveSessionAuthSnapshot,
  resolveAdminEveSessionIdentity,
  toEveSessionAuthSnapshot,
} from "../../../../packages/api/src/eve/session-ownership";
import { createAdminEveSessionIdentity } from "../../../../packages/api/src/eve/session-ownership/identity";
import {
  assertEveSessionOwnership,
  claimEveSessionOwnership,
} from "../../../../packages/api/src/eve/session-ownership/store";

import type { AuthContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const TENANT_ID = "00000000-0000-4000-8000-000000000001";
const PROFILE_ID = "00000000-0000-4000-8000-000000000002";

const verifiedAdmin = {
  userId: "verified-user",
  email: "admin@example.com",
  tenantId: TENANT_ID,
  role: "admin",
  // AL-2675: an administrator is a staff membership with the
  // tenant-administrator flag; the profile role carries no authority.
  memberships: [
    {
      isActive: true,
      isTenantAdmin: true,
      role: "staff",
      staffRole: "development",
      tenantId: TENANT_ID,
    },
  ],
  profileId: PROFILE_ID,
  isAuthenticated: true,
} satisfies AuthContext;

function adminIdentity() {
  const result = createAdminEveSessionIdentity(verifiedAdmin);
  if (!result.ok) throw new Error("expected verified admin identity");
  return result.identity;
}

function ownershipRow(overrides: Record<string, unknown> = {}) {
  return {
    session_id: "session-owned",
    tenant_id: TENANT_ID,
    owner_actor_id: "verified-user",
    owner_profile_id: PROFILE_ID,
    identity_mode: "admin",
    actor_role: "admin",
    initiator_type: "authenticated_admin",
    initiator_id: "verified-user",
    ...overrides,
  };
}

function readClient(row: ReturnType<typeof ownershipRow> | null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data: row, error: null });
  const eq = vi.fn();
  eq.mockReturnValue({ eq, maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  return {
    client: { from: vi.fn().mockReturnValue({ select }) },
    eq,
  };
}

describe("Eve admin auth and session ownership", () => {
  it("derives tenant, user, role, and profile only from verified auth context", async () => {
    const request = new Request("https://eve.test/eve/v1/session", {
      method: "POST",
      body: JSON.stringify({
        tenantId: "prompt-tenant",
        userId: "model-selected-user",
      }),
    });
    const result = await resolveAdminEveSessionIdentity(request, {
      getVerifiedAuthContext: vi.fn().mockResolvedValue(verifiedAdmin),
    });

    expect(result).toEqual({
      ok: true,
      identity: expect.objectContaining({
        actorId: "verified-user",
        actorProfileId: PROFILE_ID,
        actorRole: "admin",
        tenantId: TENANT_ID,
      }),
    });
    if (result.ok) {
      expect(JSON.stringify(result.identity)).not.toContain("prompt-tenant");
      expect(JSON.stringify(result.identity)).not.toContain(
        "model-selected-user",
      );
    }
  });

  it("fails closed for incomplete or non-admin verified contexts", () => {
    expect(
      createAdminEveSessionIdentity({
        ...verifiedAdmin,
        isAuthenticated: false,
        userId: null,
      }),
    ).toEqual({ ok: false, reason: "unauthenticated" });
    expect(
      createAdminEveSessionIdentity({
        ...verifiedAdmin,
        role: "donor",
        memberships: [
          {
            isActive: true,
            role: "donor",
            staffRole: null,
            tenantId: TENANT_ID,
          },
        ],
      }),
    ).toEqual({ ok: false, reason: "forbidden" });
  });

  it("creates service identity only with explicit accountable initiator metadata", () => {
    const serviceIdentity = createServiceEveSessionIdentity({
      initiatorId: "schedule:nightly-health",
      initiatorType: "schedule",
      serviceId: "eve-scheduler",
      tenantId: TENANT_ID,
    });
    expect(serviceIdentity).toMatchObject({
      actorId: "eve-scheduler",
      identityMode: "service",
      initiatorId: "schedule:nightly-health",
      initiatorType: "schedule",
      tenantId: TENANT_ID,
    });
    expect(() =>
      createServiceEveSessionIdentity({
        initiatorId: "",
        initiatorType: "system",
        serviceId: "eve-system",
        tenantId: TENANT_ID,
      }),
    ).toThrow();
  });

  it("binds background sessions to both service and explicit initiator", async () => {
    const identity = createServiceEveSessionIdentity({
      initiatorId: "schedule:nightly-health",
      initiatorType: "schedule",
      serviceId: "eve-scheduler",
      tenantId: TENANT_ID,
    });
    const insert = vi.fn().mockResolvedValue({ error: null });

    await claimEveSessionOwnership({
      identity,
      sessionId: "service-session",
      supabaseAdmin: {
        from: vi.fn().mockReturnValue({ insert }),
      } as unknown as AdminSupabaseClient,
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        identity_mode: "service",
        initiator_id: "schedule:nightly-health",
        initiator_type: "schedule",
        owner_actor_id: "eve-scheduler",
        owner_profile_id: null,
        tenant_id: TENANT_ID,
      }),
    );
  });

  it("round-trips only the trusted admin authenticator snapshot", () => {
    const identity = adminIdentity();
    const snapshot = toEveSessionAuthSnapshot(identity);
    expect(identityFromEveSessionAuthSnapshot(snapshot)).toEqual(identity);
    expect(
      identityFromEveSessionAuthSnapshot({
        ...snapshot,
        authenticator: "prompt-asserted",
      }),
    ).toBeNull();
  });

  it("keeps the tenant-administrator flag through the session snapshot", () => {
    const identity = adminIdentity();
    expect(identity.actorIsTenantAdmin).toBe(true);
    const snapshot = toEveSessionAuthSnapshot(identity);
    expect(snapshot.attributes).toMatchObject({
      membershipRoles: ["staff"],
      role: "admin",
      tenantAdmin: "true",
    });
    expect(identityFromEveSessionAuthSnapshot(snapshot)).toEqual(identity);
  });

  it("refuses a stored snapshot that does not carry the flag (fails closed)", () => {
    const snapshot = toEveSessionAuthSnapshot(adminIdentity());
    const { tenantAdmin: _flag, ...withoutFlag } = snapshot.attributes;
    expect(
      identityFromEveSessionAuthSnapshot({
        ...snapshot,
        attributes: withoutFlag,
      }),
    ).toBeNull();
  });

  // AL-2675: the context carries no profile role, and a primary role name
  // does not authorize an admin session without the flagged staff row.
  it.each(["donor", "missionary"] as const)(
    "refuses a %s membership even when the role name says admin",
    (membershipRole) => {
      expect(
        createAdminEveSessionIdentity({
          ...verifiedAdmin,
          memberships: [
            {
              isActive: true,
              role: membershipRole,
              staffRole: null,
              tenantId: TENANT_ID,
            },
          ],
          role: "admin",
        }),
      ).toEqual({ ok: false, reason: "forbidden" });
    },
  );

  // AL-2675: administrator means the flag, so a staff row without it is not
  // an admin session; the same row with it is.
  it("admits a staff row only when it carries the flag", () => {
    const staffRow = {
      isActive: true,
      role: "staff" as const,
      staffRole: "mobilizer" as const,
      tenantId: TENANT_ID,
    };
    expect(
      createAdminEveSessionIdentity({
        ...verifiedAdmin,
        memberships: [{ ...staffRow, isTenantAdmin: false }],
        role: "staff",
      }),
    ).toEqual({ ok: false, reason: "forbidden" });

    const result = createAdminEveSessionIdentity({
      ...verifiedAdmin,
      memberships: [{ ...staffRow, isTenantAdmin: true }],
      role: "admin",
    });
    if (!result.ok) throw new Error("expected flagged staff identity");

    const snapshot = toEveSessionAuthSnapshot(result.identity);

    expect(snapshot.attributes).toMatchObject({
      membershipRoles: ["staff"],
      role: "admin",
      tenantAdmin: "true",
    });
    expect(snapshot.attributes).not.toHaveProperty("profileRole");
    expect(identityFromEveSessionAuthSnapshot(snapshot)).toEqual(
      result.identity,
    );
  });

  // Council round 1 on WP2a, F15 (plan 5.5: a revoked member is refused at
  // the next request). Eve runs route auth on every inbound turn, the answer
  // that resumes a parked run included, and carries that caller's snapshot
  // into the turn as `auth.current` (eve 0.25.1, docs/guides/
  // auth-and-route-protection.md, "Inside runtime code"); specialists read
  // only `auth.current`. A snapshot taken before a revocation therefore
  // serves only the turn already running; the next request is refused before
  // a turn starts, so no specialist run resumes under it.
  it("refuses the next request once the flag or the membership is revoked; the running turn keeps its snapshot", async () => {
    const turnSnapshot = toEveSessionAuthSnapshot(adminIdentity());
    const row = verifiedAdmin.memberships[0];
    const afterRevocation: AuthContext[] = [
      // The flag is cleared: the person stays staff.
      {
        ...verifiedAdmin,
        role: "staff",
        memberships: [{ ...row, isTenantAdmin: false }],
      },
      // The membership is revoked: no live staff row in the tenant.
      {
        ...verifiedAdmin,
        role: null,
        tenantId: null,
        memberships: [{ ...row, isActive: false }],
      },
    ];
    for (const live of afterRevocation) {
      const resume = await resolveAdminEveSessionIdentity(
        new Request("https://eve.test/eve/v1/session/session-owned", {
          method: "POST",
        }),
        { getVerifiedAuthContext: vi.fn().mockResolvedValue(live) },
      );
      expect(resume.ok).toBe(false);
    }
    expect(identityFromEveSessionAuthSnapshot(turnSnapshot)).toMatchObject({
      actorIsTenantAdmin: true,
      tenantId: TENANT_ID,
    });
  });

  it("extracts ownership targets only from Eve session route paths", () => {
    expect(
      getEveSessionIdFromRoute(
        new Request("https://eve.test/eve/v1/session", { method: "POST" }),
      ),
    ).toBeNull();
    for (const suffix of ["", "/stream", "/cancel"]) {
      expect(
        getEveSessionIdFromRoute(
          new Request(`https://eve.test/eve/v1/session/session-owned${suffix}`),
        ),
      ).toBe("session-owned");
    }
  });

  it("records a new session under the verified owner", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabaseAdmin = {
      from: vi.fn().mockReturnValue({ insert }),
    } as unknown as AdminSupabaseClient;

    await claimEveSessionOwnership({
      identity: adminIdentity(),
      sessionId: "session-owned",
      supabaseAdmin,
    });

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: "session-owned",
        tenant_id: TENANT_ID,
        owner_actor_id: "verified-user",
        owner_profile_id: PROFILE_ID,
      }),
    );
  });

  it("allows exact-owner continuation, stream, and cancel checks", async () => {
    const { client, eq } = readClient(ownershipRow());
    await expect(
      assertEveSessionOwnership({
        identity: adminIdentity(),
        sessionId: "session-owned",
        supabaseAdmin: client as unknown as AdminSupabaseClient,
      }),
    ).resolves.toBeUndefined();
    expect(eq).toHaveBeenCalledWith("session_id", "session-owned");
  });

  it.each([
    ["another tenant", { tenant_id: "00000000-0000-4000-8000-000000000099" }],
    ["another user", { owner_actor_id: "different-user" }],
    [
      "another profile",
      { owner_profile_id: "00000000-0000-4000-8000-000000000098" },
    ],
    ["missing ownership", null],
  ])("denies %s without disclosing session content", async (_case, row) => {
    const { client } = readClient(row ? ownershipRow(row) : null);
    await expect(
      assertEveSessionOwnership({
        identity: adminIdentity(),
        sessionId: "session-owned",
        supabaseAdmin: client as unknown as AdminSupabaseClient,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
