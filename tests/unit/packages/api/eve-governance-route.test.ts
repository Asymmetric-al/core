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

/** A signed-in request: it carries the Supabase session cookie (review WC3). */
function createRequest(method = "GET", body?: unknown): NextRequest {
  return new Request("https://admin.example.test/api/admin/eve/governance", {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      cookie: "sb-127-auth-token=session",
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
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

  // Rewritten by AL-2675 (WP2c, part 1), and again by its review (WC1). The
  // global audit history was the `super_admin` role name's, which no
  // membership holds since WP2a; part 1 gave it to a confirmed operator. The
  // plan says an operator "sees a tenant's data only through an ordinary
  // membership", so an operator working in tenant A reads tenant A's history,
  // as a tenant administrator does, on GET and after a PATCH, and never an
  // event of tenant B. The audit reader runs for real here, over a table that
  // holds both tenants' events, the operator's own among them.
  describe("an operator working in one tenant (WC1)", () => {
    const TENANT_A = "00000000-0000-4000-8000-00000000000a";
    const TENANT_B = "00000000-0000-4000-8000-00000000000b";
    const OPERATOR_PROFILE = "00000000-0000-4000-8000-0000000000c1";
    const OTHER_PROFILE = "00000000-0000-4000-8000-0000000000c2";

    function auditRow(id: string, tenantId: string, profileId: string) {
      return {
        id,
        run_id: null,
        tenant_id: tenantId,
        actor_id: `admin:${profileId}`,
        actor_profile_id: profileId,
        actor_role: "admin",
        identity_mode: "admin",
        initiator_type: "admin",
        initiator_id: profileId,
        policy_id: "eve-governance-kernel",
        policy_status: "not_configured",
        governance_state_version: 1,
        action: "audit.tracer.verify",
        target: "eve:global",
        result: "succeeded",
        tool_name: null,
        subagent_name: null,
        model_role: "none",
        evidence_summary: "{}",
        change_summary: "{}",
        decision_summary: "{}",
        debug_metadata: { tenant: tenantId },
        redaction_version: "eve-audit-v1",
        created_at: "2026-11-19T00:00:00.000Z",
      };
    }

    const ROWS = [
      auditRow(
        "00000000-0000-4000-8000-0000000000e1",
        TENANT_A,
        OPERATOR_PROFILE,
      ),
      auditRow(
        "00000000-0000-4000-8000-0000000000e2",
        TENANT_B,
        OPERATOR_PROFILE,
      ),
      auditRow("00000000-0000-4000-8000-0000000000e3", TENANT_B, OTHER_PROFILE),
    ];

    /** `eve_audit_events` holding both tenants' rows, filtered as PostgREST would. */
    function auditTable() {
      return {
        from: vi.fn((table: string) => {
          expect(table).toBe("eve_audit_events");
          let rows: Array<Record<string, unknown>> = [...ROWS];
          const builder = {
            select: () => builder,
            eq: (column: string, value: unknown) => {
              rows = rows.filter((row) => row[column] === value);
              return builder;
            },
            order: () => builder,
            limit: async (count: number) => ({
              data: rows.slice(0, count),
              error: null,
            }),
          };
          return builder;
        }),
      };
    }

    beforeEach(async () => {
      const actual = await vi.importActual<
        typeof import("../../../../packages/api/src/eve/audit/store")
      >("../../../../packages/api/src/eve/audit/store");
      loadRecentEveAuditEventsMock.mockImplementation(
        actual.loadRecentEveAuditEvents,
      );
      getAdminClientMock.mockReturnValue({ client: auditTable(), error: null });
      getAuthContextMock.mockResolvedValue({
        userId: "user_1",
        email: "operator@example.com",
        tenantId: TENANT_A,
        role: "admin",
        memberships: [],
        profileId: OPERATOR_PROFILE,
        isAuthenticated: true,
      });
      operatorRpcMock.mockResolvedValue(AN_OPERATOR);
    });

    it("GET returns tenant A's history and no event of tenant B, without asking the operator check", async () => {
      const { GET } =
        await import("../../../../packages/api/src/eve/governance/route");

      const response = await GET(createRequest());

      expect(response.status).toBe(200);
      const body = (await response.json()) as {
        auditHistory: Array<{ id: string; tenantId?: string }>;
      };
      expect(
        body.auditHistory.map((event) => [event.id, event.tenantId]),
      ).toEqual([["00000000-0000-4000-8000-0000000000e1", TENANT_A]]);
      expect(JSON.stringify(body)).not.toContain(TENANT_B);
      // The GET no longer needs the fact, so it does not ask for it.
      expect(operatorRpcMock).not.toHaveBeenCalled();
    });

    it("PATCH by a confirmed operator returns tenant A's history and no event of tenant B", async () => {
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
      expect(operatorRpcMock).toHaveBeenCalledWith("platform_operator_session");
      expect(setEveKillSwitchMock).toHaveBeenCalledTimes(1);
      const body = (await response.json()) as {
        auditHistory: Array<{ id: string; tenantId?: string }>;
      };
      expect(
        body.auditHistory.map((event) => [event.id, event.tenantId]),
      ).toEqual([["00000000-0000-4000-8000-0000000000e1", TENANT_A]]);
      expect(JSON.stringify(body)).not.toContain(TENANT_B);
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
