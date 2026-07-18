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
  profileRole: "admin",
  memberships: [],
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
        profileRole: "donor",
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
