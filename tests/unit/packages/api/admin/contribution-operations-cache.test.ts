import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  POST,
  POST_CORRECTION_REQUEST_DECISION,
} from "../../../../../packages/api/src/admin/contribution-operations/route";
import { ApiHttpError } from "../../../../../packages/api/src/shared/api-http-error";

import type { ContributionActionResult } from "../../../../../packages/api/src/admin/contribution-operations/types";
import type { NextRequest } from "next/server";

const {
  executeContributionActionMock,
  decideContributionCorrectionRequestMock,
  loadContributionCorrectionRequestMock,
  loadCorrectionApprovalPolicyMock,
  getAuthContextMock,
  requireRoleMock,
  resolveViewerProviderDashboardTestModeMock,
  revalidateTagMock,
} = vi.hoisted(() => ({
  executeContributionActionMock: vi.fn(),
  decideContributionCorrectionRequestMock: vi.fn(),
  loadContributionCorrectionRequestMock: vi.fn(),
  loadCorrectionApprovalPolicyMock: vi.fn(),
  getAuthContextMock: vi.fn(),
  requireRoleMock: vi.fn(),
  resolveViewerProviderDashboardTestModeMock: vi.fn(),
  revalidateTagMock: vi.fn(),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: { from: vi.fn() }, error: null }),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn(),
  requireRole: requireRoleMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: () => ({}),
}));

vi.mock("next/cache", () => ({ revalidateTag: revalidateTagMock }));

vi.mock(
  "../../../../../packages/api/src/admin/contribution-operations/actions",
  () => ({ executeContributionAction: executeContributionActionMock }),
);

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
  () => ({ createContributionActionDependencies: () => ({}) }),
);

vi.mock(
  "../../../../../packages/api/src/admin/contribution-operations/approval-notifications",
  () => ({ recordCorrectionApprovalOutcome: vi.fn() }),
);

vi.mock(
  "../../../../../packages/api/src/admin/contribution-operations/provider-dashboard",
  () => ({
    resolveViewerProviderDashboardTestMode:
      resolveViewerProviderDashboardTestModeMock,
  }),
);

function auth(tenantId = "tenant-1") {
  return {
    userId: "user-1",
    email: "finance@example.test",
    tenantId,
    role: "admin",
    profileRole: "admin",
    memberships: [],
    profileId: "profile-1",
    isAuthenticated: true,
  };
}

function appliedResult(
  overrides: Partial<ContributionActionResult> = {},
): ContributionActionResult {
  return {
    canonicalContribution: null,
    auditEventId: "audit-1",
    correctionId: "correction-1",
    adjustmentId: "adjustment-1",
    approvalStatus: "applied",
    taskIds: [],
    ...overrides,
  };
}

function actionRequest(): NextRequest {
  return new Request(
    "https://admin.example.test/api/admin/contribution-operations/actions",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contributionId: "11111111-1111-1111-1111-111111111111",
        actionType: "amount_correction",
        reason: "Correct the recorded amount",
        confirmationToken: "confirmed",
        idempotencyKey: "correction-1",
        payload: { amountCents: 8000 },
      }),
    },
  ) as NextRequest;
}

function decisionRequest(decision = "approve"): NextRequest {
  return new Request(
    "https://admin.example.test/api/admin/contribution-operations/correction-requests/request-1/decision",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, reason: "Reviewed correction" }),
    },
  ) as NextRequest;
}

function decide(decision = "approve") {
  return POST_CORRECTION_REQUEST_DECISION(decisionRequest(decision), {
    params: Promise.resolve({ requestId: "request-1" }),
  });
}

function expectContributionInvalidation(tenantId: string) {
  expect(revalidateTagMock.mock.calls).toEqual([
    ["admin:contributions", "max"],
    [`admin:contributions:tenant:${tenantId}`, "max"],
    ["admin:contributions:list", "max"],
    ["admin:contributions:staged-gifts", "max"],
    ["admin:contributions:summary", "max"],
  ]);
}

describe("contribution route cache invalidation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getAuthContextMock.mockResolvedValue(auth());
    loadContributionCorrectionRequestMock.mockResolvedValue({
      actionType: "amount_correction",
    });
    loadCorrectionApprovalPolicyMock.mockResolvedValue({});
    resolveViewerProviderDashboardTestModeMock.mockResolvedValue(false);
    executeContributionActionMock.mockResolvedValue(appliedResult());
    decideContributionCorrectionRequestMock.mockResolvedValue({
      request: { id: "request-1", status: "approved" },
      result: appliedResult(),
    });
  });

  it.each(["tenant-1", "tenant-2"])(
    "invalidates Contributions after an applied direct correction for %s",
    async (tenantId) => {
      getAuthContextMock.mockResolvedValue(auth(tenantId));

      const response = await POST(actionRequest());

      expect(response.status).toBe(200);
      expect((await response.json()).result).toEqual(appliedResult());
      expect(executeContributionActionMock).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId }),
      );
      expectContributionInvalidation(tenantId);
    },
  );

  it.each(["tenant-1", "tenant-2"])(
    "invalidates Contributions after an applied approval for %s",
    async (tenantId) => {
      getAuthContextMock.mockResolvedValue(auth(tenantId));

      const response = await decide();

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        request: { id: "request-1", status: "approved" },
        result: appliedResult(),
        idempotentReplay: false,
      });
      expect(decideContributionCorrectionRequestMock).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId }),
      );
      expectContributionInvalidation(tenantId);
    },
  );

  it.each([403, 409, 500])(
    "does not invalidate when a direct correction fails with %s",
    async (status) => {
      executeContributionActionMock.mockRejectedValue(
        new ApiHttpError(status, "Correction was not applied"),
      );

      const response = await POST(actionRequest());

      expect(response.status).toBe(status);
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it.each([403, 409, 500])(
    "does not invalidate when an approval fails with %s",
    async (status) => {
      decideContributionCorrectionRequestMock.mockRejectedValue(
        new ApiHttpError(status, "Approval was not applied"),
      );

      const response = await decide();

      expect(response.status).toBe(status);
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it("does not invalidate for a direct correction awaiting approval", async () => {
    executeContributionActionMock.mockResolvedValue(
      appliedResult({
        approvalStatus: "pending_approval",
        correctionRequestId: "request-1",
        correctionId: null,
        adjustmentId: null,
      }),
    );

    const response = await POST(actionRequest());

    expect(response.status).toBe(200);
    expect((await response.json()).result.approvalStatus).toBe(
      "pending_approval",
    );
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it.each([undefined, "applied"] as const)(
    "does not invalidate for an idempotent direct correction replay with approval status %s",
    async (approvalStatus) => {
      executeContributionActionMock.mockResolvedValue(
        appliedResult({ approvalStatus, idempotentReplay: true }),
      );

      const response = await POST(actionRequest());

      expect(response.status).toBe(200);
      expect((await response.json()).result.idempotentReplay).toBe(true);
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it("does not invalidate for an already-approved decision replay", async () => {
    decideContributionCorrectionRequestMock.mockResolvedValue({
      request: { id: "request-1", status: "approved" },
      idempotentReplay: true,
    });
    loadCorrectionApprovalPolicyMock.mockRejectedValue(
      new Error("Policy unavailable"),
    );

    const response = await decide();

    expect(response.status).toBe(200);
    expect((await response.json()).idempotentReplay).toBe(true);
    expect(loadCorrectionApprovalPolicyMock).not.toHaveBeenCalled();
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it.each([undefined, "applied"] as const)(
    "does not invalidate for an approval result replay with approval status %s",
    async (approvalStatus) => {
      decideContributionCorrectionRequestMock.mockResolvedValue({
        request: { id: "request-1", status: "approved" },
        result: appliedResult({ approvalStatus, idempotentReplay: true }),
      });

      const response = await decide();

      expect(response.status).toBe(200);
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it("does not invalidate when an approval outcome is an idempotent replay with a result", async () => {
    decideContributionCorrectionRequestMock.mockResolvedValue({
      request: { id: "request-1", status: "approved" },
      result: appliedResult(),
      idempotentReplay: true,
    });

    const response = await decide();

    expect(response.status).toBe(200);
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it("does not invalidate for a rejected correction request", async () => {
    decideContributionCorrectionRequestMock.mockResolvedValue({
      request: { id: "request-1", status: "rejected" },
    });

    const response = await decide("reject");

    expect(response.status).toBe(200);
    expect((await response.json()).result).toBeNull();
    expect(revalidateTagMock).not.toHaveBeenCalled();
  });

  it.each(["direct", "approval"])(
    "does not invalidate for a role-denied %s request",
    async (route) => {
      requireRoleMock.mockImplementation(() => {
        throw new ApiHttpError(403, "Forbidden");
      });

      const response =
        route === "direct" ? await POST(actionRequest()) : await decide();

      expect(response.status).toBe(403);
      expect(executeContributionActionMock).not.toHaveBeenCalled();
      expect(decideContributionCorrectionRequestMock).not.toHaveBeenCalled();
      expect(revalidateTagMock).not.toHaveBeenCalled();
    },
  );

  it.each(["direct", "approval"])(
    "invalidates an applied %s write before a later projection failure",
    async (route) => {
      resolveViewerProviderDashboardTestModeMock.mockRejectedValue(
        new Error("Projection unavailable"),
      );

      const response =
        route === "direct" ? await POST(actionRequest()) : await decide();

      expect(response.status).toBe(500);
      expectContributionInvalidation("tenant-1");
    },
  );
});
