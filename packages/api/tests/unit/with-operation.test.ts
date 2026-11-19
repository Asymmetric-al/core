import { getAuthContext, type AuthContext } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createClient } from "@asym/database/supabase/server";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { withOperation } from "../../src/shared/with-operation";

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: vi.fn(),
}));

// AL-2675 (WP2c): the shared operator check runs on the caller's own session
// client (`public.platform_operator_session()`); its answer is stubbed.
vi.mock("@asym/database/supabase/server", () => ({
  createClient: vi.fn(),
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
}));

type TestAuthContext = AuthContext;

const mockedGetAdminClient = vi.mocked(getAdminClient);
const mockedGetAuthContext = vi.mocked(getAuthContext);
const mockedCreateAuditLogger = vi.mocked(createAuditLogger);
const operatorRpc = vi.fn();
const AN_OPERATOR = { data: { operator_id: "user-1" }, error: null };
const NOT_AN_OPERATOR = {
  data: null,
  error: {
    code: "42501",
    message: "platform: the caller is not a platform operator",
  },
};

const authenticatedAdmin: TestAuthContext = {
  userId: "user-1",
  email: "admin@example.com",
  tenantId: "tenant-1",
  role: "admin",
  profileId: "profile-1",
  isAuthenticated: true,
  memberships: [],
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
    vi.mocked(createClient).mockResolvedValue({ rpc: operatorRpc } as never);
    operatorRpc.mockResolvedValue(AN_OPERATOR);
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
      email: null,
      tenantId: null,
      role: null,
      profileId: null,
      isAuthenticated: false,
      memberships: [],
    });

    const handler = withOperation(async () => NextResponse.json({ ok: true }));
    const request = createRequest();
    const response = await handler(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ error: "Unauthorized" });
    expectBodyHasRequestId(body);
    expect(mockedGetAuthContext).toHaveBeenCalledWith(request);
  });

  // Rewritten by AL-2675 (WP2c, part 1): the `roles` option (role names) is
  // gone; the one platform gate is the shared operator check in the database.
  it("returns 403 with requestId when the platform operator check refuses", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue(authenticatedAdmin);
    operatorRpc.mockResolvedValue(NOT_AN_OPERATOR);
    const run = vi.fn();

    const handler = withOperation(
      async () => {
        run();
        return NextResponse.json({ ok: true });
      },
      { platformOperator: true },
    );
    const response = await handler(createRequest());

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body).toMatchObject({
      error:
        "Forbidden: requires a platform operator whose session passed a second factor",
    });
    expectBodyHasRequestId(body);
    expect(run).not.toHaveBeenCalled();
    expect(operatorRpc).toHaveBeenCalledWith("platform_operator_session");
  });

  it("refuses when the check confirms someone else, and fails closed when the check itself fails", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue(authenticatedAdmin);
    const run = vi.fn();
    const handler = withOperation(
      async () => {
        run();
        return NextResponse.json({ ok: true });
      },
      { platformOperator: true },
    );

    operatorRpc.mockResolvedValue({
      data: { operator_id: "someone-else" },
      error: null,
    });
    expect((await handler(createRequest())).status).toBe(403);

    operatorRpc.mockResolvedValue({
      data: null,
      error: { code: "PGRST202", message: "function not found" },
    });
    expect((await handler(createRequest())).status).toBe(500);
    expect(run).not.toHaveBeenCalled();
  });

  it("runs the operator check at most once per request, and only when asked", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
      error: null,
    });
    mockedGetAuthContext.mockResolvedValue(authenticatedAdmin);

    const unasked = withOperation(async () => NextResponse.json({ ok: true }));
    expect((await unasked(createRequest())).status).toBe(200);
    expect(operatorRpc).not.toHaveBeenCalled();

    const asked = withOperation(
      async ({ isPlatformOperator }) => {
        expect(await isPlatformOperator()).toBe(true);
        expect(await isPlatformOperator()).toBe(true);
        return NextResponse.json({ ok: true });
      },
      { platformOperator: true },
    );
    expect((await asked(createRequest())).status).toBe(200);
    expect(operatorRpc).toHaveBeenCalledTimes(1);
  });

  it("adds requestId to handler-returned JSON error responses", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
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
      async () =>
        NextResponse.json({ error: "Domain failure" }, { status: 422 }),
      { platformOperator: true },
    );

    const response = await handler(createRequest());

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body).toMatchObject({ error: "Domain failure" });
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
      { platformOperator: true },
    );

    const response = await handler(createRequest());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
    expect(mockedCreateAuditLogger).toHaveBeenCalledTimes(1);
  });

  it("rethrows Next.js prerender bailout errors instead of returning 500", async () => {
    mockedGetAdminClient.mockReturnValue({
      client: {} as never,
      error: null,
    });

    const prerenderError = Object.assign(
      new Error(
        "Route /api/admin/missionaries needs to bail out of prerendering at this point because it used request.headers.",
      ),
      { digest: "NEXT_PRERENDER_INTERRUPTED" },
    );

    mockedGetAuthContext.mockRejectedValue(prerenderError);

    const handler = withOperation(async () => NextResponse.json({ ok: true }));

    await expect(handler(createRequest())).rejects.toBe(prerenderError);
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
