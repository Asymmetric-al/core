import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const hasGrantMock = vi.fn();
const traceAuditMock = vi.fn();
const createStoreMock = vi.fn();

vi.mock("../../../../packages/api/src/eve/model-policy/store", () => ({
  hasEveAiSettingsGrant: hasGrantMock,
}));

vi.mock("../../../../packages/api/src/eve/audit/record", () => ({
  traceEveAuditEvent: traceAuditMock,
}));

vi.mock("../../../../packages/api/src/eve/audit/store", () => ({
  createEveAuditStore: createStoreMock,
}));

function auth(role: "admin" | "super_admin"): AuthenticatedContext {
  return {
    userId: "user_1",
    email: "admin@example.com",
    tenantId: "00000000-0000-4000-8000-000000000003",
    role,
    profileRole: role,
    memberships: [],
    profileId: "00000000-0000-4000-8000-000000000002",
    isAuthenticated: true,
  } as AuthenticatedContext;
}

describe("Eve model-policy permission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createStoreMock.mockReturnValue({ append: vi.fn() });
    traceAuditMock.mockResolvedValue({});
  });

  it("lets a super admin manage settings without a redundant grant lookup", async () => {
    const { canManageEveModelPolicy } =
      await import("../../../../packages/api/src/eve/model-policy/permissions");

    await expect(
      canManageEveModelPolicy({
        auth: auth("super_admin"),
        supabaseAdmin: {} as AdminSupabaseClient,
      }),
    ).resolves.toBe(true);
    expect(hasGrantMock).not.toHaveBeenCalled();
  });

  it("recognizes an app-owned dedicated grant for a general admin", async () => {
    hasGrantMock.mockResolvedValue(true);
    const { canManageEveModelPolicy } =
      await import("../../../../packages/api/src/eve/model-policy/permissions");
    const client = {} as AdminSupabaseClient;

    await expect(
      canManageEveModelPolicy({ auth: auth("admin"), supabaseAdmin: client }),
    ).resolves.toBe(true);
    expect(hasGrantMock).toHaveBeenCalledWith({
      supabaseAdmin: client,
      profileId: "00000000-0000-4000-8000-000000000002",
      tenantId: "00000000-0000-4000-8000-000000000003",
    });
  });

  it("refuses a general admin without the grant and records the attempt", async () => {
    hasGrantMock.mockResolvedValue(false);
    const { assertEveModelPolicyPermission } =
      await import("../../../../packages/api/src/eve/model-policy/permissions");

    await expect(
      assertEveModelPolicyPermission({
        action: "activate",
        auth: auth("admin"),
        supabaseAdmin: {} as AdminSupabaseClient,
        target: "model_policy:candidate",
      }),
    ).rejects.toMatchObject({
      status: 403,
      message: "Forbidden: requires ai.settings.manage",
    });
    expect(traceAuditMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({
          action: "model_policy.permission_denied",
          result: "blocked",
          target: "model_policy:candidate",
          evidence: expect.objectContaining({
            requiredPermission: "ai.settings.manage",
          }),
        }),
      }),
    );
  });
});
