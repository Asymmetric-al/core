import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * TDD — finding 06 Gap 2: admin/org-settings PATCH mutates a tenant-wide
 * setting and must enforce an explicit admin role gate, not rely on RLS alone.
 */

const { createClientMock, getAuthContextMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: createClientMock,
}));
vi.mock("@asym/auth/context", async () => {
  const actual =
    await vi.importActual<typeof AuthContext>("@asym/auth/context");
  return { ...actual, getAuthContext: getAuthContextMock };
});

import { GET, PATCH } from "../../src/admin/org-settings";

import type * as AuthContext from "@asym/auth/context";

function req(role: string | null, isAuthenticated = true) {
  getAuthContextMock.mockResolvedValue({
    isAuthenticated,
    userId: isAuthenticated ? "user-1" : null,
    tenantId: isAuthenticated ? "tenant-1" : null,
    role,
    // AL-2675: the role is read from the membership the request acts under.
    memberships:
      isAuthenticated && role
        ? [
            {
              tenantId: "tenant-1",
              role: role === "admin" ? "staff" : role,
              staffRole: role === "admin" ? "development" : null,
              isActive: true,
              isTenantAdmin: role === "admin",
            },
          ]
        : [],
  });
  return new Request("https://example.com/api/admin/org-settings", {
    method: "PATCH",
    body: JSON.stringify({ orgPostVisibility: "followers_only" }),
    headers: { "content-type": "application/json" },
  });
}

function mockTenantUpdateOk() {
  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq }));
  createClientMock.mockResolvedValue({ from: vi.fn(() => ({ update })) });
  return { update, eq };
}

describe("admin/org-settings PATCH — explicit admin role gate (finding 06 Gap 2)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a non-admin (donor) with 403 and never writes", async () => {
    const { update } = mockTenantUpdateOk();
    const res = await PATCH(req("donor"));
    expect(res.status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("rejects an unauthenticated caller with 401", async () => {
    mockTenantUpdateOk();
    const res = await PATCH(req(null, false));
    expect(res.status).toBe(401);
  });

  it("allows an admin to update (feature still works)", async () => {
    const { update } = mockTenantUpdateOk();
    const res = await PATCH(req("admin"));
    expect(res.status).toBe(200);
    expect(update).toHaveBeenCalledWith({
      org_post_visibility: "followers_only",
    });
  });
});

/**
 * WP2b, first release (AL-2675; plan 5.4): the session client sends the
 * tenant and assignment the resolver selected, and the setting read and
 * written is that tenant's, never the demo tenant's. Under the second
 * release's policies a read of another tenant on the caller's token returns
 * nothing, and today a second tenant's administrator would write the demo
 * tenant's setting.
 */
describe("admin/org-settings acts in the request's resolved tenant", () => {
  const SECOND_TENANT = "00000000-0000-0000-0000-000000000002";
  const ASSIGNMENT = "00000000-0000-4000-8000-000000000102";

  function resolvedAdmin() {
    const membership = {
      tenantId: SECOND_TENANT,
      role: "staff" as const,
      staffRole: "development" as const,
      isActive: true,
      isTenantAdmin: true,
    };
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-2",
      email: null,
      tenantId: SECOND_TENANT,
      role: "admin",
      memberships: [membership],
      assignment: {
        assignmentId: ASSIGNMENT,
        tenantId: SECOND_TENANT,
        membershipRole: "staff",
        staffRole: "development",
        isTenantAdmin: true,
      },
      assignmentDenial: null,
      profileId: "profile-2",
    });
  }

  beforeEach(() => vi.clearAllMocks());

  it("PATCH updates the resolved tenant with a client that sends its scope", async () => {
    resolvedAdmin();
    const { eq } = mockTenantUpdateOk();

    const res = await PATCH(
      new Request("https://example.com/api/admin/org-settings", {
        method: "PATCH",
        body: JSON.stringify({ orgPostVisibility: "followers_only" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(res.status).toBe(200);
    expect(createClientMock).toHaveBeenCalledWith({
      tenantId: SECOND_TENANT,
      assignmentId: ASSIGNMENT,
    });
    expect(eq).toHaveBeenCalledWith("id", SECOND_TENANT);
  });

  it("GET reads the resolved tenant with a client that sends its scope", async () => {
    resolvedAdmin();
    const single = vi.fn().mockResolvedValue({
      data: { org_post_visibility: "followers_only" },
      error: null,
    });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    createClientMock.mockResolvedValue({ from: vi.fn(() => ({ select })) });

    const res = await GET(
      new Request("https://example.com/api/admin/org-settings"),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ orgPostVisibility: "followers_only" });
    expect(createClientMock).toHaveBeenCalledWith({
      tenantId: SECOND_TENANT,
      assignmentId: ASSIGNMENT,
    });
    expect(eq).toHaveBeenCalledWith("id", SECOND_TENANT);
  });

  it("GET refuses a caller with no resolved assignment before any read", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: false,
      userId: "user-3",
      tenantId: null,
      role: null,
      memberships: [],
      assignment: null,
      assignmentDenial: "ambiguous",
      profileId: "profile-3",
    });

    const res = await GET(
      new Request("https://example.com/api/admin/org-settings"),
    );

    expect(res.status).toBe(401);
    expect(createClientMock).not.toHaveBeenCalled();
  });
});
