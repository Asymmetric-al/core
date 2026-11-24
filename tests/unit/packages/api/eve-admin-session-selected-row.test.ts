import { beforeEach, describe, expect, it, vi } from "vitest";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-4000-8000-00000000000a";
const TB = "00000000-0000-4000-8000-00000000000b";
const NOT_THEIRS = "00000000-0000-4000-8000-0000000000ff";

let next = 0x200;
function row(
  tenant: string,
  staffRole: string,
  isTenantAdmin = false,
): {
  id: string;
  user_id: string;
  tenant_id: string;
  role: "staff";
  staff_role: string;
  is_tenant_admin: boolean;
  updated_at: string;
} {
  next += 1;
  return {
    id: `00000000-0000-4000-8000-${next.toString(16).padStart(12, "0")}`,
    user_id: USER,
    tenant_id: tenant,
    role: "staff",
    staff_role: staffRole,
    is_tenant_admin: isTenantAdmin,
    updated_at: "2026-11-24T09:00:00.000000+00:00",
  };
}

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  getUser: vi.fn(),
  profile: vi.fn(),
  rpc: vi.fn(),
}));

function supabaseClient() {
  return {
    auth: { getSession: mocks.getSession, getUser: mocks.getUser },
    from: (table: string) => {
      if (table !== "profiles") throw new Error(`unexpected table ${table}`);
      return {
        select: () => ({ eq: () => ({ single: mocks.profile }) }),
      };
    },
    rpc: mocks.rpc,
    schema: () => {
      throw new Error("authz is not exposed by the Data API");
    },
  };
}

vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [], set: vi.fn() }),
  headers: async () => ({ get: () => null }),
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "unit-test-public-key",
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null }),
}));
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(supabaseClient),
  parseCookieHeader: () => [],
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(supabaseClient),
}));

import {
  authorizeEveAdminRouteRequest,
  EveRouteAuthError,
} from "../../../../packages/api/src/eve/session-ownership/route-auth";

function sessionRequest(scope: Record<string, string> = {}): Request {
  return new Request("https://admin.example.test/eve/v1/session", {
    method: "POST",
    headers: {
      cookie: "sb-example-auth-token=cookie-session",
      "content-type": "application/json",
      ...scope,
    },
  });
}

async function refusal(request: Request) {
  const error = await authorizeEveAdminRouteRequest(request).then(
    () => null,
    (caught: unknown) => caught,
  );
  expect(error).toBeInstanceOf(EveRouteAuthError);
  return {
    reason: (error as EveRouteAuthError).reason,
    status: (error as EveRouteAuthError).status,
  };
}

describe("an Eve admin session for a person with two staff rows in one organization", () => {
  const development = row(TA, "development", true);
  const memberCare = row(TA, "member_care");
  const elsewhere = row(TB, "development", true);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "cookie-access-token" } },
      error: null,
    });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: USER, email: "owner@example.test" } },
      error: null,
    });
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one" },
      error: null,
    });
    mocks.rpc.mockResolvedValue({
      data: [development, memberCare],
      error: null,
    });
  });

  it("is refused when the request names no row", async () => {
    await expect(refusal(sessionRequest())).resolves.toEqual({
      reason: "unauthenticated",
      status: 401,
    });
    expect(mocks.getUser).toHaveBeenCalledWith("cookie-access-token");
  });

  it("is the administrator's when the request names the administrator row and its organization", async () => {
    const identity = await authorizeEveAdminRouteRequest(
      sessionRequest({
        "x-asym-tenant": TA,
        "x-asym-assignment": development.id,
      }),
    );

    expect(identity).toMatchObject({
      actorId: USER,
      actorIsTenantAdmin: true,
      actorMembershipRoles: ["staff"],
      identityMode: "admin",
      tenantId: TA,
    });
  });

  it("is refused as forbidden under the member care row", async () => {
    await expect(
      refusal(
        sessionRequest({
          "x-asym-tenant": TA,
          "x-asym-assignment": memberCare.id,
        }),
      ),
    ).resolves.toEqual({ reason: "forbidden", status: 403 });
  });

  it("is refused when the request names a row the person does not hold", async () => {
    await expect(
      refusal(
        sessionRequest({
          "x-asym-tenant": TA,
          "x-asym-assignment": NOT_THEIRS,
        }),
      ),
    ).resolves.toEqual({ reason: "unauthenticated", status: 401 });
  });

  it("is refused when the named row belongs to another organization than the one named", async () => {
    mocks.rpc.mockResolvedValue({
      data: [development, memberCare, elsewhere],
      error: null,
    });

    await expect(
      refusal(
        sessionRequest({
          "x-asym-tenant": TA,
          "x-asym-assignment": elsewhere.id,
        }),
      ),
    ).resolves.toEqual({ reason: "unauthenticated", status: 401 });
  });

  it("carries the named row through a bearer request too", async () => {
    const identity = await authorizeEveAdminRouteRequest(
      new Request("https://admin.example.test/eve/v1/session", {
        method: "POST",
        headers: {
          authorization: "Bearer bearer-access-token",
          "x-asym-tenant": TA,
          "x-asym-assignment": development.id,
        },
      }),
    );

    expect(identity.tenantId).toBe(TA);
    expect(mocks.getUser).toHaveBeenCalledWith("bearer-access-token");
  });
});

describe("an Eve admin session for a person with one staff row", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "cookie-access-token" } },
      error: null,
    });
    mocks.getUser.mockResolvedValue({
      data: { user: { id: USER, email: "admin@example.test" } },
      error: null,
    });
    mocks.profile.mockResolvedValue({
      data: { id: "profile-one" },
      error: null,
    });
    mocks.rpc.mockResolvedValue({
      data: [row(TA, "development", true)],
      error: null,
    });
  });

  it("is the administrator's with no row named, as before", async () => {
    const identity = await authorizeEveAdminRouteRequest(sessionRequest());

    expect(identity).toMatchObject({
      actorIsTenantAdmin: true,
      identityMode: "admin",
      tenantId: TA,
    });
  });
});
