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
    await vi.importActual<typeof import("@asym/auth/context")>(
      "@asym/auth/context",
    );
  return { ...actual, getAuthContext: getAuthContextMock };
});

import { PATCH } from "../../src/admin/org-settings";

function req(role: string | null, isAuthenticated = true) {
  getAuthContextMock.mockResolvedValue({
    isAuthenticated,
    userId: isAuthenticated ? "user-1" : null,
    tenantId: isAuthenticated ? "tenant-1" : null,
    role,
    profileRole: role,
    memberships: [],
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
