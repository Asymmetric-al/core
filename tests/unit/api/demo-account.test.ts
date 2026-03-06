import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const {
  createE2EAuthCookieValueMock,
  createServerClientMock,
  isE2EAuthBypassEnabledMock,
} = vi.hoisted(() => ({
  createE2EAuthCookieValueMock: vi.fn(),
  createServerClientMock: vi.fn(),
  isE2EAuthBypassEnabledMock: vi.fn(),
}));

vi.mock("@asym/auth", () => ({
  E2E_AUTH_COOKIE_NAME: "asym-e2e-auth",
  createE2EAuthCookieValue: createE2EAuthCookieValueMock,
  isE2EAuthBypassEnabled: isE2EAuthBypassEnabledMock,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
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

let GET: () => Promise<Response>;
let POST: (request: Request) => Promise<Response>;

const originalNodeEnv = process.env.NODE_ENV;
const originalAllowDemoAccounts = process.env.ALLOW_DEMO_ACCOUNTS;

beforeAll(async () => {
  const routeModule =
    await import("../../../packages/api/src/auth/demo-account");

  GET = routeModule.GET;
  POST = routeModule.POST;
});

describe("demo account route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createE2EAuthCookieValueMock.mockReturnValue("signed-demo-cookie");
    process.env.NODE_ENV = "development";
    process.env.ALLOW_DEMO_ACCOUNTS = "false";
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.ALLOW_DEMO_ACCOUNTS = originalAllowDemoAccounts;
  });

  it("reports every demo role as available when the E2E bypass is enabled", async () => {
    process.env.NODE_ENV = "production";
    isE2EAuthBypassEnabledMock.mockReturnValue(true);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      availableRoles: {
        admin: true,
        missionary: true,
        donor: true,
      },
    });
    expect(createServerClientMock).not.toHaveBeenCalled();
  });

  it("sets the E2E auth cookie when bypassing demo sign-in", async () => {
    isE2EAuthBypassEnabledMock.mockReturnValue(true);

    const response = await POST(
      new Request("https://example.test/api/auth/demo-account", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ role: "missionary" }),
      }),
    );
    const body = await response.json();
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(200);
    expect(body).toEqual({
      ok: true,
      role: "missionary",
      bypass: true,
    });
    expect(createE2EAuthCookieValueMock).toHaveBeenCalledWith({
      userId: "e2e-missionary-user",
      role: "missionary",
      tenantId: null,
    });
    expect(setCookie).toContain("asym-e2e-auth=signed-demo-cookie");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Max-Age=3600");
    expect(setCookie).toContain("Path=/");
    expect(setCookie?.toLowerCase()).toContain("samesite=lax");
    expect(setCookie).toContain("Secure");
    expect(createServerClientMock).not.toHaveBeenCalled();
  });
});
