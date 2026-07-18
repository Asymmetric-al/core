import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

const getAdminClientMock = vi.fn();
const getAuthContextMock = vi.fn();
const requireRoleMock = vi.fn();
const createAuditLoggerMock = vi.fn();
const loadEveGovernanceAdminViewMock = vi.fn();

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn(),
  requireRole: requireRoleMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: createAuditLoggerMock,
}));

vi.mock("../../../../packages/api/src/eve/governance/store", () => ({
  loadEveGovernanceAdminView: loadEveGovernanceAdminViewMock,
}));

function createRequest(): NextRequest {
  return new Request(
    "https://admin.example.test/api/admin/eve/governance",
  ) as NextRequest;
}

describe("Eve governance admin route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn() },
      error: null,
    });
    getAuthContextMock.mockResolvedValue({
      userId: "user_1",
      email: "admin@example.com",
      tenantId: "tenant_1",
      role: "admin",
      profileRole: "admin",
      memberships: [],
      profileId: "profile_1",
      isAuthenticated: true,
    });
    createAuditLoggerMock.mockReturnValue({});
    loadEveGovernanceAdminViewMock.mockResolvedValue({
      system: {
        source: "persisted",
        releaseEnabled: false,
        emergencyOff: false,
        killSwitchState: {},
        policyStatus: "not_configured",
        stateVersion: 1,
        updatedAt: "2026-07-17T00:00:00.000Z",
      },
      recentRuns: [],
    });
  });

  it("returns persisted governance status to authorized admins", async () => {
    const { GET } =
      await import("../../../../packages/api/src/eve/governance/route");

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(requireRoleMock).toHaveBeenCalledWith(expect.anything(), [
      "admin",
      "super_admin",
    ]);
    expect(loadEveGovernanceAdminViewMock).toHaveBeenCalledWith({
      supabaseAdmin: { from: expect.any(Function) },
    });
    expect(await response.json()).toEqual(
      expect.objectContaining({
        system: expect.objectContaining({ releaseEnabled: false }),
        recentRuns: [],
        requestId: expect.any(String),
      }),
    );
  });
});
