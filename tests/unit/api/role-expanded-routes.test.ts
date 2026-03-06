import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAdminClientMock,
  getAuthContextMock,
  hasContextRoleMock,
  requireAuthMock,
  requireRoleMock,
} = vi.hoisted(() => ({
  getAdminClientMock: vi.fn(),
  getAuthContextMock: vi.fn(),
  hasContextRoleMock: vi.fn(),
  requireAuthMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  hasContextRole: hasContextRoleMock,
  requireAuth: requireAuthMock,
  requireRole: requireRoleMock,
}));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: getAdminClientMock,
}));

vi.mock("next/server", () => {
  class MockNextResponse extends Response {
    cookies = {
      set: (
        name: string,
        value: string,
        options: {
          httpOnly?: boolean;
          maxAge?: number;
          path?: string;
          sameSite?: "lax" | "strict" | "none";
          secure?: boolean;
        } = {},
      ) => {
        const parts = [`${name}=${value}`];

        if (typeof options.maxAge === "number") {
          parts.push(`Max-Age=${options.maxAge}`);
        }

        if (options.path) {
          parts.push(`Path=${options.path}`);
        }

        if (options.httpOnly) {
          parts.push("HttpOnly");
        }

        if (options.sameSite) {
          parts.push(
            `SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`,
          );
        }

        if (options.secure) {
          parts.push("Secure");
        }

        this.headers.append("set-cookie", parts.join("; "));
      },
    };

    static json(body: unknown, init?: ResponseInit) {
      const headers = new Headers(init?.headers);
      headers.set("content-type", "application/json");
      return new MockNextResponse(JSON.stringify(body), {
        ...init,
        headers,
      });
    }
  }

  return { NextResponse: MockNextResponse };
});

type ThenableResult = {
  data: unknown;
  error: { code?: string; message?: string } | null;
};

function createThenableQuery(result: ThenableResult) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
    then: (
      onFulfilled?: (value: ThenableResult) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return query;
}

let getAdminUsers: (request: Request) => Promise<Response>;
let getProfile: () => Promise<Response>;

beforeAll(async () => {
  const [adminUsersModule, profileModule] = await Promise.all([
    import("../../../packages/api/src/admin/users"),
    import("../../../packages/api/src/profile"),
  ]);

  getAdminUsers = adminUsersModule.GET;
  getProfile = profileModule.GET;
});

describe("role-expanded API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    requireRoleMock.mockImplementation(
      (
        context: { isAuthenticated?: boolean; role?: string },
        allowedRoles: string[],
      ) => {
        if (!context.isAuthenticated) {
          throw new Error("Unauthorized");
        }

        if (!context.role || !allowedRoles.includes(context.role)) {
          throw new Error(
            `Forbidden: requires one of ${allowedRoles.join(", ")} role`,
          );
        }
      },
    );

    requireAuthMock.mockImplementation(
      (context: {
        isAuthenticated?: boolean;
        userId?: string | null;
        tenantId?: string | null;
        role?: string | null;
        profileId?: string | null;
      }) => {
        if (
          !context.isAuthenticated ||
          !context.userId ||
          !context.tenantId ||
          !context.role ||
          !context.profileId
        ) {
          throw new Error("Unauthorized");
        }
      },
    );
  });

  it("lets staff users list tenant users from the admin API", async () => {
    const users = [{ id: "profile_1", role: "staff" }];
    const usersQuery = createThenableQuery({
      data: users,
      error: null,
    });
    const fromMock = vi.fn().mockReturnValue(usersQuery);

    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_1",
      tenantId: "tenant_1",
      role: "staff",
      profileRole: "staff",
      memberships: [],
      profileId: "profile_1",
    });
    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });

    const response = await getAdminUsers(
      new Request("http://localhost/api/admin/users?limit=1&offset=0"),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ users });
    expect(requireRoleMock).toHaveBeenCalledWith(
      expect.objectContaining({ role: "staff" }),
      ["staff", "admin", "super_admin"],
    );
    expect(fromMock).toHaveBeenCalledWith("profiles");
  });

  it("includes missionary data when missionary access comes from membership", async () => {
    const fromMock = vi.fn((table: string) => {
      if (table === "profiles") {
        return createThenableQuery({
          data: {
            id: "profile_1",
            tenant_id: "tenant_1",
            role: "donor",
            full_name: "Missionary Member",
          },
          error: null,
        });
      }

      if (table === "missionaries") {
        return createThenableQuery({
          data: {
            id: "missionary_1",
            profile_id: "profile_1",
            slug: "missionary-member",
          },
          error: null,
        });
      }

      throw new Error(`Unexpected table: ${table}`);
    });

    const authContext = {
      isAuthenticated: true,
      userId: "user_1",
      tenantId: "tenant_1",
      role: "donor",
      profileRole: "donor",
      memberships: [
        {
          isActive: true,
          role: "missionary",
          staffRole: null,
          tenantId: "tenant_1",
        },
      ],
      profileId: "profile_1",
    };

    getAuthContextMock.mockResolvedValue(authContext);
    hasContextRoleMock.mockImplementation(
      (
        context: { memberships?: Array<{ isActive: boolean; role: string }> },
        role: string,
      ) =>
        role === "missionary" &&
        Boolean(
          context.memberships?.some(
            (membership) =>
              membership.isActive && membership.role === "missionary",
          ),
        ),
    );
    getAdminClientMock.mockReturnValue({
      client: { from: fromMock },
      error: null,
    });

    const response = await getProfile();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      profile: {
        id: "profile_1",
        tenant_id: "tenant_1",
        role: "donor",
        full_name: "Missionary Member",
        missionary: {
          id: "missionary_1",
          profile_id: "profile_1",
          slug: "missionary-member",
        },
      },
    });
    expect(hasContextRoleMock).toHaveBeenCalledWith(authContext, "missionary");
    expect(fromMock).toHaveBeenCalledWith("missionaries");
  });
});
