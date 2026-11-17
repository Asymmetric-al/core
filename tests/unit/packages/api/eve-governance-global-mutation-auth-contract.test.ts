import { readFileSync } from "node:fs";

import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withOperation } from "../../../../packages/api/src/shared/with-operation";
import { hasAnyRole } from "../../../../packages/auth/permissions";

import type { AuthContext } from "@asym/auth/context";
import type { UserRole } from "@asym/database/types";

const {
  createAuditLoggerMock,
  getAdminClientMock,
  getAuthContextMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  createAuditLoggerMock: vi.fn(),
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  requireAuth: vi.fn(),
  requireRole: requireRoleMock,
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

function readAllowedRoles(handlerSource: string): UserRole[] {
  const match = handlerSource.match(/\{\s*roles:\s*(\[[^\]]*\])\s*\}/);
  expect(match?.[1]).toBeDefined();
  return JSON.parse(match?.[1] ?? "[]") as UserRole[];
}

const getRoles = readAllowedRoles(readHandlerSource("GET", "POST"));
const postRoles = readAllowedRoles(readHandlerSource("POST", "PATCH"));
const patchSource = readHandlerSource("PATCH");
const patchRoles = readAllowedRoles(patchSource);

const activeTenantStaff: AuthContext = {
  userId: "staff-user",
  email: "staff@example.test",
  tenantId: "tenant-1",
  role: "staff",
  profileRole: null,
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
  profileRole: null,
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

function createRequest(method: "GET" | "POST" | "PATCH"): NextRequest {
  return new NextRequest(
    "https://admin.example.test/api/admin/eve/governance",
    {
      method,
    },
  );
}

describe("Eve governance global mutation authorization contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdminClientMock.mockReturnValue({ client: {}, error: null });
    createAuditLoggerMock.mockReturnValue({});
    requireRoleMock.mockImplementation(
      (context: AuthContext, allowedRoles: UserRole[]) => {
        const allowed = hasAnyRole(
          { memberships: context.memberships },
          allowedRoles,
        );

        if (!allowed) {
          throw new Error(
            `Forbidden: requires one of ${allowedRoles.join(", ")} role`,
          );
        }
      },
    );
  });

  it("names only super_admin on the PATCH wrapper", () => {
    expect(patchRoles).toEqual(["super_admin"]);
    expect(patchSource).toContain("await setEveKillSwitch({");
  });

  it("rejects active tenant staff before the global mutation can execute", async () => {
    getAuthContextMock.mockResolvedValue(activeTenantStaff);
    const setEveKillSwitch = vi.fn();
    const patch = withOperation(
      async () => {
        setEveKillSwitch();
        return NextResponse.json({ ok: true });
      },
      { roles: patchRoles },
    );

    const response = await patch(createRequest("PATCH"));

    expect(response.status).toBe(403);
    expect(setEveKillSwitch).not.toHaveBeenCalled();
  });

  // AL-2675: the kill switch names only super_admin, which is no membership
  // role. It has no holder until WP2c's operator list, so it fails closed for
  // a tenant administrator too.
  it("refuses the global PATCH to a tenant administrator until WP2c", async () => {
    getAuthContextMock.mockResolvedValue(tenantAdmin);
    const setEveKillSwitch = vi.fn();
    const patch = withOperation(
      async () => {
        setEveKillSwitch();
        return NextResponse.json({ ok: true });
      },
      { roles: patchRoles },
    );

    const response = await patch(createRequest("PATCH"));

    expect(response.status).toBe(403);
    expect(setEveKillSwitch).not.toHaveBeenCalled();
  });

  it("admits GET and POST for the flagged staff row only (AL-2675)", async () => {
    expect(getRoles).toEqual(["admin", "super_admin"]);
    expect(postRoles).toEqual(["admin", "super_admin"]);

    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const get = withOperation(handler, { roles: getRoles });
    const post = withOperation(handler, { roles: postRoles });

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
