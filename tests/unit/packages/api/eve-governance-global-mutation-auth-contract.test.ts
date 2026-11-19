import { readFileSync } from "node:fs";

import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  withOperation,
  type OperationOptions,
} from "../../../../packages/api/src/shared/with-operation";

import type { AuthContext } from "@asym/auth/context";

const {
  createAuditLoggerMock,
  getAdminClientMock,
  getAuthContextMock,
  operatorRpcMock,
} = vi.hoisted(() => ({
  createAuditLoggerMock: vi.fn(),
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
  operatorRpcMock: vi.fn(),
}));

// AL-2675 (WP2c): the shared operator check runs in the database on the
// caller's own session client; its answer is stubbed.
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({ rpc: operatorRpcMock }),
}));

// AL-2675: the real gates run; only the verified session is stubbed.
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@asym/auth/context")>()),
  getAuthContext: getAuthContextMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: createAuditLoggerMock,
}));

const routeSource = readFileSync(
  new URL(
    "../../../../packages/api/src/eve/governance/route.ts",
    import.meta.url,
  ),
  "utf8",
);

function readHandlerSource(
  method: "GET" | "POST" | "PATCH",
  nextMethod?: "POST" | "PATCH",
): string {
  const startMarker = `export const ${method} =`;
  const start = routeSource.indexOf(startMarker);
  expect(start).toBeGreaterThanOrEqual(0);

  if (!nextMethod) {
    return routeSource.slice(start);
  }

  const end = routeSource.indexOf(`export const ${nextMethod} =`, start);
  expect(end).toBeGreaterThan(start);
  return routeSource.slice(start, end);
}

/** The wrapper's gate option, read from the route source. */
function readGate(handlerSource: string): OperationOptions {
  const admin = /\{\s*tenantAdministrator:\s*true\s*\}/.test(handlerSource);
  const operator = /\{\s*platformOperator:\s*true\s*\}/.test(handlerSource);
  expect(admin !== operator).toBe(true);
  return admin ? { tenantAdministrator: true } : { platformOperator: true };
}

const getGate = readGate(readHandlerSource("GET", "POST"));
const postGate = readGate(readHandlerSource("POST", "PATCH"));
const patchSource = readHandlerSource("PATCH");
const patchGate = readGate(patchSource);

const activeTenantStaff: AuthContext = {
  userId: "staff-user",
  email: "staff@example.test",
  tenantId: "tenant-1",
  role: "staff",
  memberships: [
    {
      tenantId: "tenant-1",
      role: "staff",
      staffRole: "finance",
      isActive: true,
      isTenantAdmin: false,
    },
  ],
  profileId: "staff-profile",
  isAuthenticated: true,
};

/**
 * AL-2675: an administrator is a staff membership with the
 * tenant-administrator flag. A `super_admin` profile holds exactly that in its
 * own tenant after the backfill; platform reach waits for WP2c's operator list.
 */
const tenantAdmin: AuthContext = {
  userId: "tenant-admin-user",
  email: "tenant-admin@example.test",
  tenantId: "tenant-1",
  role: "admin",
  memberships: [
    {
      tenantId: "tenant-1",
      role: "staff",
      staffRole: "development",
      isActive: true,
      isTenantAdmin: true,
    },
  ],
  profileId: "tenant-admin-profile",
  isAuthenticated: true,
};

/** A signed-in request: it carries the Supabase session cookie (review WC3). */
function createRequest(method: "GET" | "POST" | "PATCH"): NextRequest {
  return new NextRequest(
    "https://admin.example.test/api/admin/eve/governance",
    {
      method,
      headers: { cookie: "sb-127-auth-token=session" },
    },
  );
}

describe("Eve governance global mutation authorization contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({ client: {}, error: null });
    createAuditLoggerMock.mockReturnValue({});
    operatorRpcMock.mockResolvedValue({
      data: null,
      error: {
        code: "42501",
        message: "platform: the caller is not a platform operator",
      },
    });
  });

  // Rewritten by AL-2675 (WP2c, part 1): the PATCH wrapper named the
  // `super_admin` role, which no membership holds. It names the shared
  // operator check now, and no role name.
  it("gates the PATCH wrapper on the shared operator check, not a role name (WP2c)", () => {
    expect(patchGate).toEqual({ platformOperator: true });
    expect(patchSource).not.toMatch(/roles:\s*\[/);
    expect(patchSource).toContain("await setEveKillSwitch({");
  });

  it("rejects active tenant staff before the global mutation can execute", async () => {
    getAuthContextMock.mockResolvedValue(activeTenantStaff);
    const setEveKillSwitch = vi.fn();
    const patch = withOperation(async () => {
      setEveKillSwitch();
      return NextResponse.json({ ok: true });
    }, patchGate);

    const response = await patch(createRequest("PATCH"));

    expect(response.status).toBe(403);
    expect(setEveKillSwitch).not.toHaveBeenCalled();
  });

  it("refuses the notification PATCH to a confirmed operator without tenant administration", async () => {
    getAuthContextMock.mockResolvedValue(activeTenantStaff);
    operatorRpcMock.mockResolvedValue({
      data: { operator_id: activeTenantStaff.userId },
      error: null,
    });
    const { PATCH } =
      await import("../../../../packages/api/src/eve/notifications/route");
    expect((await PATCH(createRequest("PATCH"))).status).toBe(403);
  });

  // AL-2675: the kill switch named only super_admin, which is no membership
  // role, so it failed closed for a tenant administrator too. Since WP2c it
  // is a platform operator's, confirmed in the database: a tenant
  // administrator the check refuses is still refused.
  it("refuses the global PATCH to a tenant administrator who is not a confirmed operator", async () => {
    getAuthContextMock.mockResolvedValue(tenantAdmin);
    const setEveKillSwitch = vi.fn();
    const patch = withOperation(async () => {
      setEveKillSwitch();
      return NextResponse.json({ ok: true });
    }, patchGate);

    const response = await patch(createRequest("PATCH"));

    expect(response.status).toBe(403);
    expect(setEveKillSwitch).not.toHaveBeenCalled();
    expect(operatorRpcMock).toHaveBeenCalledWith("platform_operator_session");
  });

  it("admits the global PATCH for a confirmed platform operator (WP2c)", async () => {
    getAuthContextMock.mockResolvedValue(tenantAdmin);
    operatorRpcMock.mockResolvedValue({
      data: { operator_id: tenantAdmin.userId },
      error: null,
    });
    const setEveKillSwitch = vi.fn();
    const patch = withOperation(async () => {
      setEveKillSwitch();
      return NextResponse.json({ ok: true });
    }, patchGate);

    const response = await patch(createRequest("PATCH"));

    expect(response.status).toBe(200);
    expect(setEveKillSwitch).toHaveBeenCalledTimes(1);
  });

  it("admits GET and POST for the flagged staff row only (AL-2675)", async () => {
    expect(getGate).toEqual({ tenantAdministrator: true });
    expect(postGate).toEqual({ tenantAdministrator: true });

    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const get = withOperation(handler, getGate);
    const post = withOperation(handler, postGate);

    getAuthContextMock.mockResolvedValue(activeTenantStaff);
    const staffResponses = await Promise.all([
      get(createRequest("GET")),
      post(createRequest("POST")),
    ]);
    expect(staffResponses.map((response) => response.status)).toEqual([
      403, 403,
    ]);
    expect(handler).not.toHaveBeenCalled();

    getAuthContextMock.mockResolvedValue(tenantAdmin);
    const adminResponses = await Promise.all([
      get(createRequest("GET")),
      post(createRequest("POST")),
    ]);
    expect(adminResponses.map((response) => response.status)).toEqual([
      200, 200,
    ]);
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
