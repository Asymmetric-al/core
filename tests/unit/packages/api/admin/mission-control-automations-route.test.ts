import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiHttpError } from "../../../../../packages/api/src/shared/http-errors";

import type { NextRequest } from "next/server";

const getAdminClientMock = vi.fn();
const getAuthContextMock = vi.fn();
const requireAuthMock = vi.fn();
const requireRoleMock = vi.fn();
const createAuditLoggerMock = vi.fn();
const loadMissionControlAutomationDashboardMock = vi.fn();
const saveMissionControlAutomationRuleMock = vi.fn();

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: createAuditLoggerMock,
}));

vi.mock(
  "../../../../../packages/api/src/admin/mission-control-automations/store",
  () => ({
    loadMissionControlAutomationDashboard:
      loadMissionControlAutomationDashboardMock,
    saveMissionControlAutomationRule: saveMissionControlAutomationRuleMock,
  }),
);

const validAutomationRule = {
  name: "Receipt follow-up",
  mode: "advanced",
  trigger: { kind: "contribution_issue_created" },
  conditions: [],
  actions: [{ kind: "create_task", issueType: "receipt_failed" }],
  runMode: "automatic",
  enabled: false,
} as const;

function createJsonRequest(body: unknown): NextRequest {
  return new Request(
    "https://admin.example.test/api/admin/mission-control/automations",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  ) as NextRequest;
}

function createRawRequest(body: string): NextRequest {
  return new Request(
    "https://admin.example.test/api/admin/mission-control/automations",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    },
  ) as NextRequest;
}

async function loadPostRoute() {
  const route =
    await import("../../../../../packages/api/src/admin/mission-control-automations/route");
  return route.POST;
}

describe("mission control automation POST route", () => {
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
    requireRoleMock.mockReturnValue(undefined);
    createAuditLoggerMock.mockReturnValue({});
    saveMissionControlAutomationRuleMock.mockResolvedValue({
      id: "rule_1",
      ...validAutomationRule,
    });
  });

  it("accepts wrapped rule payloads after route-level validation", async () => {
    const POST = await loadPostRoute();

    const response = await POST(
      createJsonRequest({ rule: validAutomationRule }),
    );

    expect(response.status).toBe(201);
    expect(saveMissionControlAutomationRuleMock).toHaveBeenCalledWith({
      supabaseAdmin: { from: expect.any(Function) },
      tenantId: "tenant_1",
      actorProfileId: "profile_1",
      rule: validAutomationRule,
    });
  });

  it("accepts direct rule payloads for compatibility", async () => {
    const POST = await loadPostRoute();

    const response = await POST(createJsonRequest(validAutomationRule));

    expect(response.status).toBe(201);
    expect(saveMissionControlAutomationRuleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        rule: validAutomationRule,
      }),
    );
  });

  it("rejects invalid rule bodies before calling the store", async () => {
    const POST = await loadPostRoute();

    const response = await POST(
      createJsonRequest({
        rule: {
          ...validAutomationRule,
          name: "",
        },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        error: expect.any(String),
        requestId: expect.any(String),
      }),
    );
    expect(saveMissionControlAutomationRuleMock).not.toHaveBeenCalled();
  });

  it("rejects unsupported contribution execution actions before calling the store", async () => {
    const POST = await loadPostRoute();

    const response = await POST(
      createJsonRequest({
        rule: {
          ...validAutomationRule,
          actions: [{ kind: "contribution_action", actionType: "refund" }],
        },
      }),
    );

    expect(response.status).toBe(400);
    expect(saveMissionControlAutomationRuleMock).not.toHaveBeenCalled();
  });

  it("does not pass client-supplied activation readiness to the store", async () => {
    const POST = await loadPostRoute();

    const response = await POST(
      createJsonRequest({
        rule: validAutomationRule,
        activationReady: {
          hasFreshPreview: true,
          hasSuccessfulTestRun: true,
          activityLogConfigured: true,
        },
      }),
    );

    expect(response.status).toBe(201);
    const [saveInput] =
      saveMissionControlAutomationRuleMock.mock.calls[0] ?? [];
    expect(saveInput).toEqual(
      expect.objectContaining({
        rule: validAutomationRule,
      }),
    );
    expect(saveInput).not.toHaveProperty("activationReady");
  });

  it("surfaces store activation readiness failures as client errors", async () => {
    saveMissionControlAutomationRuleMock.mockRejectedValueOnce(
      new ApiHttpError(400, "Automation activation requires a fresh preview."),
    );
    const POST = await loadPostRoute();

    const response = await POST(
      createJsonRequest({
        rule: {
          ...validAutomationRule,
          enabled: true,
        },
      }),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        error: "Automation activation requires a fresh preview.",
        requestId: expect.any(String),
      }),
    );
  });

  it("keeps invalid JSON responses on the existing 400 path", async () => {
    const POST = await loadPostRoute();

    const response = await POST(createRawRequest("{not-json"));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        error: "Invalid JSON body",
        requestId: expect.any(String),
      }),
    );
    expect(saveMissionControlAutomationRuleMock).not.toHaveBeenCalled();
  });
});
