import { getAuthContext, type AuthContext } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withOperation } from "../../src/shared/with-operation";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(),
}));

vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({
    log: vi.fn(),
    logDonation: vi.fn(),
    logPost: vi.fn(),
    logRoleChange: vi.fn(),
  })),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: vi.fn(),
  requireAuth: vi.fn(
    (context: {
      isAuthenticated?: boolean;
      userId?: string | null;
      tenantId?: string | null;
      role?: string | null;
      profileId?: string | null;
    }) => {
      if (
        !context?.isAuthenticated ||
        !context.userId ||
        !context.tenantId ||
        !context.role ||
        !context.profileId
      ) {
        throw new Error("Unauthorized");
      }
    },
  ),
  requireRole: vi.fn(
    (
      context: {
        isAuthenticated?: boolean;
        userId?: string | null;
        tenantId?: string | null;
        role?: string | null;
        profileId?: string | null;
      },
      roles: string[],
    ) => {
      if (
        !context?.isAuthenticated ||
        !context.userId ||
        !context.tenantId ||
        !context.role ||
        !context.profileId
      ) {
        throw new Error("Unauthorized");
      }
      if (!roles.includes(context.role)) {
        throw new Error(`Forbidden: requires one of ${roles.join(", ")} role`);
      }
    },
  ),
}));

type TestAuthContext = AuthContext;

const mockedGetAdminClient = vi.mocked(getAdminClient);
const mockedGetAuthContext = vi.mocked(getAuthContext);
const mockedCreateAuditLogger = vi.mocked(createAuditLogger);

const authenticatedAdmin: TestAuthContext = {
  userId: "user-1",
  tenantId: "tenant-1",
  role: "admin",
  profileId: "profile-1",
  isAuthenticated: true,
};

function createRequest(): NextRequest {
  return new NextRequest("http://localhost/api/test", {
    method: "POST",
  });
}

function expectBodyHasRequestId(body: unknown) {
  expect(body).toEqual(
    expect.objectContaining({ requestId: expect.any(String) }),
  );
  const requestId = (body as { requestId: string }).requestId;
  expect(requestId.length).toBeGreaterThan(0);
}

describe("withOperation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 503 with requestId when admin client is unavailable", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: null,
      error: "Admin client unavailable",
    });

    const handler = withOperation(async () => NextResponse.json({ ok: true }));
    const response = await handler(createRequest());

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toMatchObject({ error: "Admin client unavailable" });
    expectBodyHasRequestId(body);
    expect(mockedGetAuthContext).not.toHaveBeenCalled();
  });

  it("returns 401 with requestId when request is unauthenticated", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue({
      userId: null,
      tenantId: null,
      role: null,
      profileId: null,
      isAuthenticated: false,
    });

    const handler = withOperation(async () => NextResponse.json({ ok: true }));
    const response = await handler(createRequest());

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ error: "Unauthorized" });
    expectBodyHasRequestId(body);
  });

  it("returns 403 with requestId when role check fails", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue({
      ...authenticatedAdmin,
      role: "donor",
    });

    const handler = withOperation(async () => NextResponse.json({ ok: true }), {
      roles: ["admin"],
    });
    const response = await handler(createRequest());

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toMatchObject({
      error: "Forbidden: requires one of admin role",
    });
    expectBodyHasRequestId(body);
  });

  it("passes through successful handler response when checks pass", async () => {
    const supabaseAdmin = { from: vi.fn() } as never;
    mockedGetAdminClient.mockReturnValue({
      client: supabaseAdmin,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue(authenticatedAdmin);
    mockedCreateAuditLogger.mockReturnValue({
      log: vi.fn(),
      logDonation: vi.fn(),
      logPost: vi.fn(),
      logRoleChange: vi.fn(),
    });

    const handler = withOperation(
      async ({ auth, requestId }) => {
        expect(auth.userId).toBe("user-1");
        expect(typeof requestId).toBe("string");
        return NextResponse.json({ ok: true }, { status: 200 });
      },
      { roles: ["admin"] },
    );

    const response = await handler(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
    expect(mockedCreateAuditLogger).toHaveBeenCalledTimes(1);
  });

  it("normalizes async handler failures with requestId", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue(authenticatedAdmin);

    const handler = withOperation(async () => {
      await Promise.resolve();
      throw new Error("Database exploded");
    });

    const response = await handler(createRequest());

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toMatchObject({ error: "Database exploded" });
    expectBodyHasRequestId(body);
  });
});
