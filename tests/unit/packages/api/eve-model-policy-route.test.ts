import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

const getAdminClientMock = vi.fn();
const getAuthContextMock = vi.fn();
const requireRoleMock = vi.fn();
const createAuditLoggerMock = vi.fn();
const canManageMock = vi.fn();
const loadPoliciesMock = vi.fn();
const loadOverridesMock = vi.fn();
const createDraftMock = vi.fn();
const evaluateDraftMock = vi.fn();
const activateMock = vi.fn();
const rollbackMock = vi.fn();
const createOverrideMock = vi.fn();

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

vi.mock("../../../../packages/api/src/eve/model-policy/permissions", () => ({
  canManageEveModelPolicy: canManageMock,
}));

vi.mock("../../../../packages/api/src/eve/model-policy/store", () => ({
  loadEveModelPolicies: loadPoliciesMock,
  loadActiveEveModelBudgetOverrides: loadOverridesMock,
}));

vi.mock("../../../../packages/api/src/eve/model-policy/control", () => ({
  createEveModelPolicyDraft: createDraftMock,
  evaluateEveModelPolicyDraft: evaluateDraftMock,
  activateEveModelPolicy: activateMock,
  rollbackEveModelPolicy: rollbackMock,
  createEveModelBudgetOverride: createOverrideMock,
}));

function request(method = "GET", body?: unknown): NextRequest {
  return new Request("https://admin.example.test/api/admin/eve/model-policy", {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
  }) as NextRequest;
}

describe("Eve model-policy admin route", () => {
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
    canManageMock.mockResolvedValue(true);
    loadPoliciesMock.mockResolvedValue([]);
    loadOverridesMock.mockResolvedValue([]);
  });

  it("returns the read model and dedicated permission status", async () => {
    const { GET } =
      await import("../../../../packages/api/src/eve/model-policy/route");

    const response = await GET(request());

    expect(response.status).toBe(200);
    expect(requireRoleMock).toHaveBeenCalledWith(expect.anything(), [
      "admin",
      "super_admin",
    ]);
    expect(await response.json()).toEqual({
      canManage: true,
      policies: [],
      budgetOverrides: [],
      requestId: expect.any(String),
    });
  });

  it("creates a valid platform policy draft", async () => {
    const { createDefaultEveModelPolicy } =
      await import("../../../../packages/api/src/eve/model-policy/schema");
    createDraftMock.mockResolvedValue("00000000-0000-4000-8000-000000000004");
    const { POST } =
      await import("../../../../packages/api/src/eve/model-policy/route");

    const response = await POST(
      request("POST", { policy: createDefaultEveModelPolicy() }),
    );

    expect(response.status).toBe(201);
    expect(createDraftMock).toHaveBeenCalledWith(
      expect.objectContaining({
        auth: expect.objectContaining({ profileId: "profile_1" }),
        policy: expect.objectContaining({ scope: "platform" }),
      }),
    );
    expect(await response.json()).toEqual(
      expect.objectContaining({
        mutation: {
          action: "draft",
          policyId: "00000000-0000-4000-8000-000000000004",
        },
      }),
    );
  });

  it("rejects an unknown model-policy action before mutation", async () => {
    const { PATCH } =
      await import("../../../../packages/api/src/eve/model-policy/route");

    const response = await PATCH(
      request("PATCH", { action: "prompt_activate", policyId: "model" }),
    );

    expect(response.status).toBe(400);
    expect(evaluateDraftMock).not.toHaveBeenCalled();
    expect(activateMock).not.toHaveBeenCalled();
    expect(rollbackMock).not.toHaveBeenCalled();
    expect(createOverrideMock).not.toHaveBeenCalled();
  });
});
