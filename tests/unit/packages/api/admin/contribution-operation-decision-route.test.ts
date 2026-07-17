import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

const getAdminClientMock = vi.fn();
const getAuthContextMock = vi.fn();
const requireAuthMock = vi.fn();
const requireRoleMock = vi.fn();
const createAuditLoggerMock = vi.fn();
const decideContributionCorrectionRequestMock = vi.fn();
const loadContributionCorrectionRequestMock = vi.fn();
const loadCorrectionApprovalPolicyMock = vi.fn();
const createContributionActionDependenciesMock = vi.fn();
const recordCorrectionApprovalOutcomeMock = vi.fn();

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
  "../../../../../packages/api/src/admin/contribution-operations/correction-requests",
  () => ({
    decideContributionCorrectionRequest:
      decideContributionCorrectionRequestMock,
    loadContributionCorrectionRequest: loadContributionCorrectionRequestMock,
    loadCorrectionApprovalPolicy: loadCorrectionApprovalPolicyMock,
  }),
);

vi.mock(
  "../../../../../packages/api/src/admin/contribution-operations/dependencies",
  () => ({
    createContributionActionDependencies:
      createContributionActionDependenciesMock,
  }),
);

vi.mock(
  "../../../../../packages/api/src/admin/contribution-operations/approval-notifications",
  () => ({
    recordCorrectionApprovalOutcome: recordCorrectionApprovalOutcomeMock,
  }),
);

function createDecisionRequest(): NextRequest {
  return new Request(
    "https://admin.example.test/api/admin/contribution-operations/correction-requests/request-1/decision",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "approve" }),
    },
  ) as NextRequest;
}

async function loadDecisionRoute() {
  const route =
    await import("../../../../../packages/api/src/admin/contribution-operations/route");
  return route.POST_CORRECTION_REQUEST_DECISION;
}

describe("contribution correction decision route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({
      client: { from: vi.fn() },
      error: null,
    });
    getAuthContextMock.mockResolvedValue({
      userId: "user-1",
      email: "finance@example.test",
      tenantId: "tenant-1",
      role: "admin",
      profileRole: "admin",
      memberships: [],
      profileId: "profile-1",
      isAuthenticated: true,
    });
    requireRoleMock.mockReturnValue(undefined);
    createAuditLoggerMock.mockReturnValue({});
    createContributionActionDependenciesMock.mockReturnValue({});
    loadContributionCorrectionRequestMock.mockResolvedValue({
      actionType: "amount_correction",
    });
    decideContributionCorrectionRequestMock.mockResolvedValue({
      request: { id: "request-1", status: "approved" },
      idempotentReplay: true,
    });
    loadCorrectionApprovalPolicyMock.mockRejectedValue(
      new Error("policy store unavailable"),
    );
  });

  it("replays an already-decided request without loading policy again", async () => {
    const POST = await loadDecisionRoute();

    const response = await POST(createDecisionRequest(), {
      params: Promise.resolve({ requestId: "request-1" }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        idempotentReplay: true,
        request: expect.objectContaining({
          id: "request-1",
          status: "approved",
        }),
      }),
    );
    expect(decideContributionCorrectionRequestMock).toHaveBeenCalledOnce();
    expect(loadCorrectionApprovalPolicyMock).not.toHaveBeenCalled();
  });
});
