import { readFileSync } from "node:fs";

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const ROW = "00000000-0000-4000-8000-00000000a0a1";
const USER = "00000000-0000-4000-9000-000000000001";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  rpc: vi.fn(),
  serviceKeyUsed: vi.fn(),
  captureError: vi.fn(),
  scopes: [] as unknown[],
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => {
    h.serviceKeyUsed();
    throw new Error("service-key client used");
  },
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({ log: vi.fn() })),
}));

vi.mock("@asym/lib/monitoring/sentry", () => ({
  captureError: h.captureError,
}));

vi.mock(
  "../../../../packages/api/src/shared/request-session-client",
  async (original) => ({
    ...(await original<typeof RequestSessionClientModule>()),
    createRequestSessionClient: async (_request: Request, scope: unknown) => {
      h.scopes.push(scope);
      return { rpc: h.rpc };
    },
  }),
);

import { GET } from "../../../../packages/api/src/eve/launch-readiness/operators";

import type * as RequestSessionClientModule from "../../../../packages/api/src/shared/request-session-client";
import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

function makeAuth(isTenantAdmin: boolean): AuthContext {
  return {
    userId: USER,
    email: "operator@example.org",
    tenantId: TENANT,
    role: isTenantAdmin ? "admin" : "staff",
    memberships: [
      {
        tenantId: TENANT,
        role: "staff",
        staffRole: "development",
        isActive: true,
        isTenantAdmin,
      },
    ],
    assignment: {
      assignmentId: ROW,
      userId: USER,
      tenantId: TENANT,
      revision: "1",
      membershipRole: "staff",
      staffRole: "development",
      isTenantAdmin,
    },
    assignmentDenial: null,
    profileId: USER,
    isAuthenticated: true,
  };
}

function request() {
  return new NextRequest(
    "https://admin.example.test/api/admin/eve/launch-readiness/operators",
    { headers: { cookie: "sb-127-auth-token=session" } },
  );
}

const OPERATOR = { data: { operator_id: USER }, error: null };
const NOT_OPERATOR = {
  data: null,
  error: {
    code: "42501",
    message: "platform: the caller is not a platform operator",
  },
};

function answer(
  session: typeof OPERATOR | typeof NOT_OPERATOR,
  operators: { data: unknown; error: unknown },
) {
  h.rpc.mockImplementation(async (fn: string) => {
    if (fn === "platform_operator_session") return session;
    if (fn === "tenant_operators") return operators;
    throw new Error(`unexpected rpc ${fn}`);
  });
}

describe("GET /api/admin/eve/launch-readiness/operators (WP2c rest)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.scopes.length = 0;
    h.auth.mockResolvedValue(makeAuth(true));
  });

  it("lists the operators of the request's own organization on the caller's token", async () => {
    answer(OPERATOR, {
      data: [
        {
          id: "00000000-0000-4000-8000-0000000000c1",
          display_name: "Ada Operator",
          email: "ada@example.org",
        },
        {
          id: "00000000-0000-4000-8000-0000000000c2",
          display_name: null,
          email: null,
        },
      ],
      error: null,
    });
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      operators: [
        {
          id: "00000000-0000-4000-8000-0000000000c1",
          displayName: "Ada Operator",
          email: "ada@example.org",
        },
        {
          id: "00000000-0000-4000-8000-0000000000c2",
          displayName: null,
          email: null,
        },
      ],
    });
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(h.rpc).toHaveBeenCalledWith("platform_operator_session");
    expect(h.rpc).toHaveBeenCalledWith("tenant_operators", {
      p_tenant_id: TENANT,
    });
    expect(h.scopes.length).toBeGreaterThan(0);
    for (const scope of h.scopes)
      expect(scope).toEqual({ tenantId: TENANT, assignmentId: ROW });
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
  });

  it("answers an empty list as an empty list", async () => {
    answer(OPERATOR, { data: [], error: null });
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ operators: [] });
  });

  it("refuses with 403, reading no list, an administrator who is not a confirmed operator", async () => {
    answer(NOT_OPERATOR, { data: [], error: null });
    const res = await GET(request());
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).not.toHaveProperty("operators");
    expect(h.rpc).not.toHaveBeenCalledWith(
      "tenant_operators",
      expect.anything(),
    );
  });

  it("refuses with 403 an operator who is not the tenant's administrator, before any database call", async () => {
    h.auth.mockResolvedValue(makeAuth(false));
    answer(OPERATOR, { data: [], error: null });
    const res = await GET(request());
    expect(res.status).toBe(403);
    expect(h.rpc).not.toHaveBeenCalled();
  });

  it("turns the database's refusal (42501) into a 403, never an empty list", async () => {
    answer(OPERATOR, {
      data: null,
      error: {
        code: "42501",
        message:
          "platform: the caller holds no live staff row in this organization",
      },
    });
    const res = await GET(request());
    expect(res.status).toBe(403);
    expect(await res.json()).not.toHaveProperty("operators");
  });

  it("answers 500, never an empty list, when the read fails or answers an unknown shape", async () => {
    for (const operators of [
      { data: null, error: { code: "XX000", message: "boom" } },
      { data: { not: "a list" }, error: null },
      { data: [{ id: 7 }], error: null },
    ]) {
      answer(OPERATOR, operators);
      const res = await GET(request());
      expect(res.status).toBe(500);
      expect(await res.json()).not.toHaveProperty("operators");
    }
  });

  it("is re-exported by the app route and imports nothing of the service-key lane", () => {
    const route = readFileSync(
      "apps/admin/app/api/admin/eve/launch-readiness/operators/route.ts",
      "utf8",
    );
    expect(route.trim()).toBe(
      'export { GET } from "@asym/api/eve/launch-readiness/operators";',
    );
    const handler = readFileSync(
      "packages/api/src/eve/launch-readiness/operators.ts",
      "utf8",
    );
    expect(handler).toMatch(/withOperation\(/);
    expect(handler).not.toMatch(
      /withPlatformOperation|supabase\/admin|getAdminClient|createAdminClient/,
    );
  });
});
