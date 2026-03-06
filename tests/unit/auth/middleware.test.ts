import { beforeEach, describe, expect, it, vi } from "vitest";

const createServerClientMock = vi.fn();
const getSupabasePublicConfigMock = vi.fn();

type StoredCookie = {
  name: string;
  value: string;
  path?: string;
  maxAge?: number;
};

function createCookieStore() {
  const cookies: StoredCookie[] = [];

  function upsert(cookie: StoredCookie) {
    const index = cookies.findIndex((entry) => entry.name === cookie.name);
    if (index >= 0) {
      cookies[index] = cookie;
      return;
    }
    cookies.push(cookie);
  }

  return {
    getAll() {
      return [...cookies];
    },
    set(
      nameOrCookie: string | StoredCookie,
      value?: string,
      options?: Omit<StoredCookie, "name" | "value">,
    ) {
      if (typeof nameOrCookie === "string") {
        upsert({
          name: nameOrCookie,
          value: value ?? "",
          ...(options ?? {}),
        });
        return;
      }

      upsert(nameOrCookie);
    },
  };
}

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: getSupabasePublicConfigMock,
}));

vi.mock("next/server", () => {
  class MockNextResponse {
    headers = new Headers();
    cookies = createCookieStore();

    constructor(public status = 200) {}

    static next() {
      return new MockNextResponse(200);
    }

    static redirect(url: URL) {
      const response = new MockNextResponse(307);
      response.headers.set("location", url.toString());
      return response;
    }
  }

  return {
    NextResponse: MockNextResponse,
  };
});

function createRequest(url: string, headers?: Record<string, string>) {
  const requestCookies = createCookieStore();
  const nextUrl = new URL(url);
  Object.assign(nextUrl, {
    clone: () => new URL(nextUrl.toString()),
  });
  return {
    headers: new Headers(headers),
    nextUrl,
    cookies: {
      getAll: () => requestCookies.getAll(),
      set: (name: string, value: string) => {
        requestCookies.set(name, value);
      },
    },
  };
}

describe("auth middleware redirects", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    getSupabasePublicConfigMock.mockReturnValue({
      url: "https://project.supabase.co",
      key: "anon-key",
      keyType: "anon",
    });

    createServerClientMock.mockImplementation(() => ({
      auth: {
        getClaims: async () => ({ data: { claims: null } }),
      },
    }));
  });

  it("keeps login redirects on the current app origin", async () => {
    const { createAuthMiddleware } = await import(
      "../../../packages/auth/middleware"
    );

    const middleware = createAuthMiddleware({
      protectedRoutePrefixes: ["/dashboard"],
      loginPath: "/login",
    });

    const request = createRequest(
      "https://app.asymmetric.al/dashboard?tab=overview",
      {
        referer: "https://evil.example/phish",
      },
    );

    const response = await middleware(request as never);

    expect(response.headers.get("location")).toBe(
      "https://app.asymmetric.al/login?next=%2Fdashboard%3Ftab%3Doverview",
    );
  });
});
