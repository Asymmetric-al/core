import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NextRequest } from "next/server";

const getAdminClientMock = vi.fn();
const getAuthContextMock = vi.fn();
const requireRoleMock = vi.fn();
const createAuditLoggerMock = vi.fn();
const loadEveGovernanceAdminViewMock = vi.fn();
const createAdminEveAuditIdentityMock = vi.fn();
const createEveAuditStoreMock = vi.fn();
const loadRecentEveAuditEventsMock = vi.fn();
const traceEveAuditEventMock = vi.fn();
const setEveKillSwitchMock = vi.fn();
/** AL-2675 (WP2c): the shared operator check, on the caller's own session client. */
const operatorRpcMock = vi.fn();
const NOT_AN_OPERATOR = {
  data: null,
  error: {
    code: "42501",
    message: "platform: the caller is not a platform operator",
  },
};
const AN_OPERATOR = { data: { operator_id: "user_1" }, error: null };

vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({ rpc: operatorRpcMock }),
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn(),
  requireRole: requireRoleMock,
  // AL-2675: the gates that replaced requireRole, stubbed alike.
  requireCapability: requireRoleMock,
  requireTenantAdministrator: requireRoleMock,
  requireRoleClass: requireRoleMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: createAuditLoggerMock,
}));

vi.mock("../../../../packages/api/src/eve/governance/store", () => ({
  loadEveGovernanceAdminView: loadEveGovernanceAdminViewMock,
}));

vi.mock("../../../../packages/api/src/eve/audit/identity", () => ({
  createAdminEveAuditIdentity: createAdminEveAuditIdentityMock,
}));

vi.mock("../../../../packages/api/src/eve/audit/record", () => ({
  traceEveAuditEvent: traceEveAuditEventMock,
}));

vi.mock("../../../../packages/api/src/eve/audit/store", () => ({
  createEveAuditStore: createEveAuditStoreMock,
  loadRecentEveAuditEvents: loadRecentEveAuditEventsMock,
}));

vi.mock("../../../../packages/api/src/eve/governance/control", async () => {
  const actual = await vi.importActual<
    typeof import("../../../../packages/api/src/eve/governance/control")
  >("../../../../packages/api/src/eve/governance/control");

  return {
    ...actual,
    setEveKillSwitch: setEveKillSwitchMock,
  };
});

function createRequest(method = "GET", body?: unknown): NextRequest {
  return new Request("https://admin.example.test/api/admin/eve/governance", {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers:
      body === undefined ? undefined : { "content-type": "application/json" },
    method,
  }) as NextRequest;
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
      memberships: [],
      profileId: "profile_1",
      isAuthenticated: true,
    });
    createAuditLoggerMock.mockReturnValue({});
    operatorRpcMock.mockResolvedValue(NOT_AN_OPERATOR);
    createAdminEveAuditIdentityMock.mockReturnValue({ verified: true });
    createEveAuditStoreMock.mockReturnValue({ append: vi.fn() });
    traceEveAuditEventMock.mockResolvedValue({});
    setEveKillSwitchMock.mockResolvedValue({
      auditId: "00000000-0000-4000-8000-000000000004",
      changed: true,
      enabled: true,
      killSwitchState: {
        all_automation: false,
        active_runs: false,
        github_actions: true,
        production_writes: false,
        sandbox_networking: false,
        dynamic_workflows: false,
        model_policy_changes: false,
        force_approval: false,
      },
      stateVersion: 2,
      switchKey: "github_actions",
      updatedAt: "2026-07-17T00:01:00.000Z",
    });
    loadRecentEveAuditEventsMock.mockResolvedValue([]);
    loadEveGovernanceAdminViewMock.mockResolvedValue({
      system: {
        source: "persisted",
        releaseEnabled: false,
        emergencyOff: false,
        killSwitchState: {
          all_automation: false,
          active_runs: false,
          github_actions: false,
          production_writes: false,
          sandbox_networking: false,
          dynamic_workflows: false,
          model_policy_changes: false,
          force_approval: false,
        },
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
    // AL-2675: the route asks for the tenant administrator.
    expect(requireRoleMock).toHaveBeenCalledWith(expect.anything());
    expect(requireRoleMock.mock.calls[0]).toHaveLength(1);
    expect(loadEveGovernanceAdminViewMock).toHaveBeenCalledWith({
      supabaseAdmin: { from: expect.any(Function) },
    });
    expect(loadRecentEveAuditEventsMock).toHaveBeenCalledWith({
      auth: expect.objectContaining({
        userId: "user_1",
        tenantId: "tenant_1",
        profileId: "profile_1",
      }),
      supabaseAdmin: { from: expect.any(Function) },
      tenantId: "tenant_1",
    });
    expect(traceEveAuditEventMock).not.toHaveBeenCalled();
    expect(await response.json()).toEqual(
      expect.objectContaining({
        auditHistory: [],
        system: expect.objectContaining({ releaseEnabled: false }),
        recentRuns: [],
        requestId: expect.any(String),
      }),
    );
  });

  // Rewritten by AL-2675 (WP2c, part 1): the global audit history was the
  // `super_admin` role name's, which no membership holds since WP2a. It is a
  // platform operator's now, confirmed by the shared check in the database.
  it("loads global audit history for a confirmed platform operator (WP2c)", async () => {
    operatorRpcMock.mockResolvedValue(AN_OPERATOR);
    const { GET } =
      await import("../../../../packages/api/src/eve/governance/route");

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(operatorRpcMock).toHaveBeenCalledWith("platform_operator_session");
    expect(loadRecentEveAuditEventsMock).toHaveBeenCalledWith({
      supabaseAdmin: { from: expect.any(Function) },
      tenantId: null,
    });
  });

  it("keeps a super_admin role name that the operator check refuses to its own tenant (WP2c)", async () => {
    getAuthContextMock.mockResolvedValue({
      userId: "user_1",
      email: "super-admin@example.com",
      tenantId: "tenant_1",
      role: "super_admin",
      memberships: [],
      profileId: "profile_1",
      isAuthenticated: true,
    });
    const { GET } =
      await import("../../../../packages/api/src/eve/governance/route");

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(loadRecentEveAuditEventsMock).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "tenant_1" }),
    );
  });

  it("records an explicit safe tracer verification under verified admin identity", async () => {
    const { POST } =
      await import("../../../../packages/api/src/eve/governance/route");

    const response = await POST(createRequest("POST"));

    expect(response.status).toBe(201);
    expect(createAdminEveAuditIdentityMock).toHaveBeenCalledWith(
      expect.objectContaining({ profileId: "profile_1" }),
    );
    expect(traceEveAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: expect.objectContaining({
          action: "audit.tracer.verify",
          identity: { verified: true },
          result: "succeeded",
        }),
      }),
    );
    expect(await response.json()).toEqual({
      auditEvent: {},
      requestId: expect.any(String),
    });
  });

  it("deliberately changes a kill switch under verified admin identity", async () => {
    operatorRpcMock.mockResolvedValue(AN_OPERATOR);
    const { PATCH } =
      await import("../../../../packages/api/src/eve/governance/route");

    const response = await PATCH(
      createRequest("PATCH", {
        switchKey: "github_actions",
        enabled: true,
        expectedStateVersion: 1,
        reason: "Pause GitHub effects during incident review.",
      }),
    );

    expect(response.status).toBe(200);
    expect(createAdminEveAuditIdentityMock).toHaveBeenCalledWith(
      expect.objectContaining({ profileId: "profile_1" }),
      { platformOperator: true },
    );
    expect(setEveKillSwitchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        switchKey: "github_actions",
        enabled: true,
        expectedStateVersion: 1,
        identity: { verified: true },
      }),
    );
    expect(await response.json()).toEqual(
      expect.objectContaining({
        mutation: expect.objectContaining({
          switchKey: "github_actions",
          enabled: true,
        }),
        requestId: expect.any(String),
      }),
    );
  });

  it("refuses the kill switch to a tenant administrator who is not a confirmed operator (WP2c)", async () => {
    const { PATCH } =
      await import("../../../../packages/api/src/eve/governance/route");

    const response = await PATCH(
      createRequest("PATCH", {
        switchKey: "github_actions",
        enabled: true,
        expectedStateVersion: 1,
        reason: "Pause GitHub effects during incident review.",
      }),
    );

    expect(response.status).toBe(403);
    expect(setEveKillSwitchMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown kill-switch key before any mutation", async () => {
    operatorRpcMock.mockResolvedValue(AN_OPERATOR);
    const { PATCH } =
      await import("../../../../packages/api/src/eve/governance/route");

    const response = await PATCH(
      createRequest("PATCH", {
        switchKey: "prompt_granted_authority",
        enabled: true,
        expectedStateVersion: 1,
      }),
    );

    expect(response.status).toBe(400);
    expect(setEveKillSwitchMock).not.toHaveBeenCalled();
  });
});
